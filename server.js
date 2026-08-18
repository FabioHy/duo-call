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
    name: 'Duo Call',
    status: 'online',
    activeRooms: io.sockets.adapter.rooms.size
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const users = new Map();
const roomChatHistory = new Map();

io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  socket.on('join-room', ({ roomId, profile }) => {
    const room = roomId || 'our-space';
    socket.join(room);
    socket.roomId = room;

    const userData = {
      socketId: socket.id,
      roomId: room,
      username: profile?.username || 'Partner',
      avatar: profile?.avatar || '💖',
      isMuted: false,
      isDeafened: false,
      isVideoOn: false,
      isScreenSharing: false,
      statusText: profile?.statusText || '#0001'
    };

    users.set(socket.id, userData);

    // Send chat history immediately
    const history = roomChatHistory.get(room) || [];
    socket.emit('chat-history', history);

    socket.to(room).emit('peer-joined', {
      peer: userData,
      initiator: true
    });

    const roomSockets = io.sockets.adapter.rooms.get(room);
    if (roomSockets) {
      for (const id of roomSockets) {
        if (id !== socket.id && users.has(id)) {
          socket.emit('peer-existing', { peer: users.get(id) });
          break;
        }
      }
    }
  });

  socket.on('update-profile', (updatedProfile) => {
    const user = users.get(socket.id);
    if (!user) return;
    Object.assign(user, updatedProfile);
    users.set(socket.id, user);
    socket.to(user.roomId).emit('peer-profile-updated', user);
  });

  socket.on('update-media-state', (mediaState) => {
    const user = users.get(socket.id);
    if (!user) return;
    Object.assign(user, mediaState);
    users.set(socket.id, user);
    socket.to(user.roomId).emit('peer-media-state-updated', {
      socketId: socket.id,
      ...mediaState
    });
  });

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

  socket.on('ring-partner', () => {
    const user = users.get(socket.id);
    const room = user?.roomId || socket.roomId || 'our-space';
    socket.to(room).emit('incoming-ring', {
      caller: user || { username: 'Partner', avatar: '💖' }
    });
  });

  socket.on('cancel-ring', () => {
    const user = users.get(socket.id);
    const room = user?.roomId || socket.roomId || 'our-space';
    socket.to(room).emit('ring-cancelled', { callerId: socket.id });
  });

  socket.on('accept-ring', () => {
    const user = users.get(socket.id);
    const room = user?.roomId || socket.roomId || 'our-space';
    socket.to(room).emit('ring-accepted', { acceptorId: socket.id });
  });

  socket.on('reject-ring', () => {
    const user = users.get(socket.id);
    const room = user?.roomId || socket.roomId || 'our-space';
    socket.to(room).emit('ring-rejected', { rejectorId: socket.id });
  });

  socket.on('send-message', ({ text, senderName, senderAvatar, type = 'text', timestamp }) => {
    const user = users.get(socket.id);
    const room = user?.roomId || socket.roomId || 'our-space';

    const messageData = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      senderId: socket.id,
      senderName: senderName || user?.username || 'Partner',
      senderAvatar: senderAvatar || user?.avatar || '💖',
      text: text,
      type: type,
      timestamp: timestamp || new Date().toISOString()
    };

    if (!roomChatHistory.has(room)) {
      roomChatHistory.set(room, []);
    }
    const history = roomChatHistory.get(room);
    history.push(messageData);
    if (history.length > 100) history.shift();

    io.to(room).emit('new-message', messageData);
  });

  socket.on('send-reaction', ({ reaction, sound }) => {
    const user = users.get(socket.id);
    const room = user?.roomId || socket.roomId || 'our-space';
    socket.to(room).emit('peer-reaction', {
      senderId: socket.id,
      senderName: user?.username || 'Partner',
      reaction,
      sound
    });
  });

  socket.on('sync-notes', ({ content }) => {
    const user = users.get(socket.id);
    const room = user?.roomId || socket.roomId || 'our-space';
    socket.to(room).emit('notes-synced', {
      senderName: user?.username || 'Partner',
      content
    });
  });

  socket.on('speaking-state', ({ isSpeaking }) => {
    const user = users.get(socket.id);
    const room = user?.roomId || socket.roomId || 'our-space';
    socket.to(room).emit('peer-speaking-state', {
      socketId: socket.id,
      isSpeaking
    });
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(user.roomId).emit('peer-left', {
        socketId: socket.id,
        username: user.username
      });
      users.delete(socket.id);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(` Duo App is running on port ${PORT}`);
  console.log(`=========================================`);
});
