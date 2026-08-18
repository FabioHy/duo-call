const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/info', (req, res) => {
  res.json({
    name: 'Duo Space',
    status: 'online',
    slots: {
      nao: activeSlots.nao !== null,
      rayo: activeSlots.rayo !== null
    }
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Dedicated 2-User Slot Management (Nao & Rayo)
const activeSlots = {
  nao: null, // { socketId, userKey, username, avatarUrl, avatarEmoji, isMuted, isScreenSharing, ... }
  rayo: null
};

const roomChatHistory = [];

function broadcastAvailableSlots() {
  io.emit('available-slots', {
    naoOccupied: activeSlots.nao !== null,
    rayoOccupied: activeSlots.rayo !== null,
    activeProfiles: {
      nao: activeSlots.nao ? { username: activeSlots.nao.username, avatarUrl: activeSlots.nao.avatarUrl } : null,
      rayo: activeSlots.rayo ? { username: activeSlots.rayo.username, avatarUrl: activeSlots.rayo.avatarUrl } : null
    }
  });
}

io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // Send current slot availability immediately upon connecting
  socket.emit('available-slots', {
    naoOccupied: activeSlots.nao !== null,
    rayoOccupied: activeSlots.rayo !== null,
    activeProfiles: {
      nao: activeSlots.nao ? { username: activeSlots.nao.username, avatarUrl: activeSlots.nao.avatarUrl } : null,
      rayo: activeSlots.rayo ? { username: activeSlots.rayo.username, avatarUrl: activeSlots.rayo.avatarUrl } : null
    }
  });

  // User Selection (Login as Nao or Rayo)
  socket.on('select-user', ({ userKey, profile }) => {
    if (userKey !== 'nao' && userKey !== 'rayo') {
      return socket.emit('select-user-error', { message: 'Usuário inválido.' });
    }

    // Check if slot is already occupied by an active socket
    if (activeSlots[userKey] !== null && activeSlots[userKey].socketId !== socket.id) {
      const displayName = userKey === 'nao' ? 'Nao' : 'Rayo';
      return socket.emit('select-user-error', {
        message: `O perfil "${displayName}" já está logado em outro navegador ou aparelho.`
      });
    }

    // Assign slot
    socket.userKey = userKey;
    const partnerKey = userKey === 'nao' ? 'rayo' : 'nao';

    const defaultName = userKey === 'nao' ? 'Nao' : 'Rayo';
    const defaultEmoji = userKey === 'nao' ? '🐺' : '🌸';

    const userData = {
      socketId: socket.id,
      userKey: userKey,
      username: profile?.username || defaultName,
      avatarUrl: profile?.avatarUrl || '',
      avatarEmoji: profile?.avatarEmoji || defaultEmoji,
      isMuted: false,
      isScreenSharing: false,
      isInCall: false,
      statusText: 'Online'
    };

    activeSlots[userKey] = userData;

    // Send success to logged-in user
    socket.emit('select-user-success', {
      userKey,
      userData,
      partner: activeSlots[partnerKey],
      chatHistory: roomChatHistory
    });

    // Notify all connected clients about updated slot availability
    broadcastAvailableSlots();

    // If partner is already connected, link them together in WebRTC
    if (activeSlots[partnerKey]) {
      const partnerSocketId = activeSlots[partnerKey].socketId;
      io.to(partnerSocketId).emit('peer-joined', {
        peer: userData,
        initiator: true
      });
      socket.emit('peer-existing', {
        peer: activeSlots[partnerKey]
      });
    }
  });

  // User Voluntary Logout / Switch User
  socket.on('logout-user', () => {
    if (socket.userKey && activeSlots[socket.userKey]?.socketId === socket.id) {
      const userKey = socket.userKey;
      const partnerKey = userKey === 'nao' ? 'rayo' : 'nao';
      activeSlots[userKey] = null;
      socket.userKey = null;

      if (activeSlots[partnerKey]) {
        io.to(activeSlots[partnerKey].socketId).emit('peer-left', {
          userKey,
          username: userKey === 'nao' ? 'Nao' : 'Rayo'
        });
      }

      broadcastAvailableSlots();
      socket.emit('logged-out');
    }
  });

  // Update Profile (Name, photo)
  socket.on('update-profile', (updatedProfile) => {
    if (!socket.userKey || !activeSlots[socket.userKey]) return;
    const user = activeSlots[socket.userKey];
    Object.assign(user, updatedProfile);
    activeSlots[socket.userKey] = user;

    const partnerKey = socket.userKey === 'nao' ? 'rayo' : 'nao';
    if (activeSlots[partnerKey]) {
      io.to(activeSlots[partnerKey].socketId).emit('peer-profile-updated', user);
    }
    broadcastAvailableSlots();
  });

  // Call State (In Call / Not In Call)
  socket.on('call-state-changed', ({ isInCall }) => {
    if (!socket.userKey || !activeSlots[socket.userKey]) return;
    activeSlots[socket.userKey].isInCall = isInCall;
    activeSlots[socket.userKey].statusText = isInCall ? 'Em chamada' : 'Online';

    const partnerKey = socket.userKey === 'nao' ? 'rayo' : 'nao';
    if (activeSlots[partnerKey]) {
      io.to(activeSlots[partnerKey].socketId).emit('peer-call-state-changed', {
        userKey: socket.userKey,
        isInCall
      });
    }
  });

  // Media State (Mute, Screen Share)
  socket.on('update-media-state', (mediaState) => {
    if (!socket.userKey || !activeSlots[socket.userKey]) return;
    const user = activeSlots[socket.userKey];
    Object.assign(user, mediaState);

    const partnerKey = socket.userKey === 'nao' ? 'rayo' : 'nao';
    if (activeSlots[partnerKey]) {
      io.to(activeSlots[partnerKey].socketId).emit('peer-media-state-updated', {
        socketId: socket.id,
        userKey: socket.userKey,
        ...mediaState
      });
    }
  });

  // WebRTC Signaling
  socket.on('signal-offer', ({ targetSocketId, sdp }) => {
    socket.to(targetSocketId).emit('signal-offer', { senderSocketId: socket.id, sdp });
  });

  socket.on('signal-answer', ({ targetSocketId, sdp }) => {
    socket.to(targetSocketId).emit('signal-answer', { senderSocketId: socket.id, sdp });
  });

  socket.on('signal-ice-candidate', ({ targetSocketId, candidate }) => {
    socket.to(targetSocketId).emit('signal-ice-candidate', { senderSocketId: socket.id, candidate });
  });

  socket.on('signal-renegotiate', ({ targetSocketId }) => {
    socket.to(targetSocketId).emit('signal-renegotiate', { senderSocketId: socket.id });
  });

  // Chat System
  socket.on('send-message', ({ text, senderName, senderAvatar, type = 'text', timestamp }) => {
    if (!socket.userKey) return;
    const user = activeSlots[socket.userKey];

    const messageData = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      senderId: socket.id,
      senderUserKey: socket.userKey,
      senderName: senderName || user?.username || (socket.userKey === 'nao' ? 'Nao' : 'Rayo'),
      senderAvatar: senderAvatar || user?.avatarUrl || '',
      text: text,
      type: type,
      timestamp: timestamp || new Date().toISOString()
    };

    roomChatHistory.push(messageData);
    if (roomChatHistory.length > 100) roomChatHistory.shift();

    io.emit('new-message', messageData);
  });

  // Heart Reactions
  socket.on('send-reaction', ({ reaction, sound }) => {
    const partnerKey = socket.userKey === 'nao' ? 'rayo' : 'nao';
    if (activeSlots[partnerKey]) {
      io.to(activeSlots[partnerKey].socketId).emit('peer-reaction', {
        senderId: socket.id,
        reaction,
        sound
      });
    }
  });

  // Shared Notes
  socket.on('sync-notes', ({ content }) => {
    const partnerKey = socket.userKey === 'nao' ? 'rayo' : 'nao';
    if (activeSlots[partnerKey]) {
      io.to(activeSlots[partnerKey].socketId).emit('notes-synced', { content });
    }
  });

  // Speaking State
  socket.on('speaking-state', ({ isSpeaking }) => {
    const partnerKey = socket.userKey === 'nao' ? 'rayo' : 'nao';
    if (activeSlots[partnerKey]) {
      io.to(activeSlots[partnerKey].socketId).emit('peer-speaking-state', {
        socketId: socket.id,
        userKey: socket.userKey,
        isSpeaking
      });
    }
  });

  // Disconnect Handling (Immediately frees the slot and logs out user)
  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected] ID: ${socket.id}`);
    if (socket.userKey && activeSlots[socket.userKey]?.socketId === socket.id) {
      const userKey = socket.userKey;
      const partnerKey = userKey === 'nao' ? 'rayo' : 'nao';
      activeSlots[userKey] = null;

      if (activeSlots[partnerKey]) {
        io.to(activeSlots[partnerKey].socketId).emit('peer-left', {
          userKey,
          username: userKey === 'nao' ? 'Nao' : 'Rayo'
        });
      }

      broadcastAvailableSlots();
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(` Duo App is running on port ${PORT}`);
  console.log(`=========================================`);
});
