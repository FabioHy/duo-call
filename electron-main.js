const { app, BrowserWindow, session, ipcMain, desktopCapturer } = require('electron');
const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

// =========================================================================
// 🚀 CONFIGURAÇÃO PARA O APLICATIVO DESKTOP (.EXE)
// Para conectar 2 PCs em redes diferentes, coloque a URL do seu Render aqui.
// Exemplo: const APP_URL = 'https://seu-app.onrender.com';
// Se deixar vazio (''), ele vai rodar um servidor local offline.
const APP_URL = 'https://duo-call.onrender.com';
// =========================================================================

let mainWindow = null;
let serverInstance = null;
const PORT = 3000;

const activeSlots = {
  nao: null,
  rayo: null
};

const roomChatHistory = [];

function broadcastAvailableSlots(io) {
  io.emit('available-slots', {
    naoOccupied: activeSlots.nao !== null,
    rayoOccupied: activeSlots.rayo !== null,
    activeProfiles: {
      nao: activeSlots.nao ? { username: activeSlots.nao.username, avatarUrl: activeSlots.nao.avatarUrl } : null,
      rayo: activeSlots.rayo ? { username: activeSlots.rayo.username, avatarUrl: activeSlots.rayo.avatarUrl } : null
    }
  });
}

// Setup Internal Backend Server
function startInternalServer() {
  const expressApp = express();
  const server = http.createServer(expressApp);
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  expressApp.use(express.static(path.join(__dirname, 'public')));

  expressApp.get('/api/info', (req, res) => {
    res.json({ name: 'Duo Desktop', status: 'online' });
  });

  expressApp.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  io.on('connection', (socket) => {
    socket.emit('available-slots', {
      naoOccupied: activeSlots.nao !== null,
      rayoOccupied: activeSlots.rayo !== null,
      activeProfiles: {
        nao: activeSlots.nao ? { username: activeSlots.nao.username, avatarUrl: activeSlots.nao.avatarUrl } : null,
        rayo: activeSlots.rayo ? { username: activeSlots.rayo.username, avatarUrl: activeSlots.rayo.avatarUrl } : null
      }
    });

    socket.on('select-user', ({ userKey, profile }) => {
      if (userKey !== 'nao' && userKey !== 'rayo') {
        return socket.emit('select-user-error', { message: 'Usuário inválido.' });
      }

      if (activeSlots[userKey] !== null && activeSlots[userKey].socketId !== socket.id) {
        const displayName = userKey === 'nao' ? 'Nao' : 'Rayo';
        return socket.emit('select-user-error', {
          message: `O perfil "${displayName}" já está logado em outro navegador ou aparelho.`
        });
      }

      socket.userKey = userKey;
      const partnerKey = userKey === 'nao' ? 'rayo' : 'nao';
      const defaultName = userKey === 'nao' ? 'Nao' : 'Rayo';
      const defaultEmoji = userKey === 'nao' ? '🐺' : '🌸';
      const defaultColor = userKey === 'nao' ? '#00e676' : '#ff79c6';

      const userData = {
        socketId: socket.id,
        userKey: userKey,
        username: profile?.username || defaultName,
        avatarUrl: profile?.avatarUrl || '',
        avatarEmoji: profile?.avatarEmoji || defaultEmoji,
        nameColor: profile?.nameColor || defaultColor,
        isMuted: false,
        isScreenSharing: false,
        isInCall: false,
        statusText: 'Online'
      };

      activeSlots[userKey] = userData;

      socket.emit('select-user-success', {
        userKey,
        userData,
        partner: activeSlots[partnerKey],
        chatHistory: roomChatHistory
      });

      broadcastAvailableSlots(io);

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

        broadcastAvailableSlots(io);
        socket.emit('logged-out');
      }
    });

    // Update Profile (Name, photo, nameColor)
    socket.on('update-profile', (updatedProfile) => {
      if (!socket.userKey || !activeSlots[socket.userKey]) return;
      const user = activeSlots[socket.userKey];
      Object.assign(user, updatedProfile);
      activeSlots[socket.userKey] = user;

      const partnerKey = socket.userKey === 'nao' ? 'rayo' : 'nao';
      if (activeSlots[partnerKey]) {
        io.to(activeSlots[partnerKey].socketId).emit('peer-profile-updated', user);
      }
      broadcastAvailableSlots(io);
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
    socket.on('send-message', ({ text, gifUrl, senderName, senderAvatar, senderNameColor, type = 'text', timestamp }) => {
      if (!socket.userKey) return;
      const user = activeSlots[socket.userKey];
      const defaultColor = socket.userKey === 'nao' ? '#00e676' : '#ff79c6';

      const messageData = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        senderId: socket.id,
        senderUserKey: socket.userKey,
        senderName: senderName || user?.username || (socket.userKey === 'nao' ? 'Nao' : 'Rayo'),
        senderAvatar: senderAvatar || user?.avatarUrl || '',
        senderNameColor: senderNameColor || user?.nameColor || defaultColor,
        text: text || '',
        gifUrl: gifUrl || null,
        type: type || (gifUrl ? 'gif' : 'text'),
        timestamp: timestamp || new Date().toISOString()
      };

      roomChatHistory.push(messageData);
      if (roomChatHistory.length > 100) roomChatHistory.shift();

      io.emit('new-message', messageData);
    });

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

    socket.on('sync-notes', ({ content }) => {
      const partnerKey = socket.userKey === 'nao' ? 'rayo' : 'nao';
      if (activeSlots[partnerKey]) {
        io.to(activeSlots[partnerKey].socketId).emit('notes-synced', { content });
      }
    });

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

    socket.on('disconnect', () => {
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

        broadcastAvailableSlots(io);
      }
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Duo Desktop] Server listening on port ${PORT}`);
  });

  serverInstance = server;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    title: 'Duo',
    icon: path.join(__dirname, 'public', 'assets', 'icon.png'),
    backgroundColor: '#060913',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowed = ['media', 'mediaKeySystem', 'notifications', 'display-capture', 'screen'];
    if (allowed.includes(permission)) {
      callback(true);
    } else {
      callback(false);
    }
  });

  session.defaultSession.setPermissionCheckHandler(() => true);

  mainWindow.webContents.session.clearCache();
  mainWindow.webContents.session.clearStorageData({ storages: ['serviceworkers', 'cachestorage'] });

  if (APP_URL.startsWith('http')) {
    mainWindow.loadURL(APP_URL);
  } else {
    mainWindow.loadURL(`http://localhost:${PORT}`, {
      extraHeaders: 'pragma: no-cache\ncache-control: no-cache'
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC handler to return all windows & screens with live thumbnails for sharing selector
ipcMain.handle('get-desktop-sources', async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: 320, height: 180 },
      fetchWindowIcons: true
    });
    return sources.map(s => ({
      id: s.id,
      name: s.name,
      thumbnail: s.thumbnail.toDataURL(),
      appIcon: s.appIcon ? s.appIcon.toDataURL() : null
    }));
  } catch (err) {
    console.error('Error fetching desktop sources:', err);
    return [];
  }
});

// IPC handler for reliable Native Fullscreen
ipcMain.handle('toggle-fullscreen', () => {
  if (mainWindow) {
    const isFull = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!isFull);
    return !isFull;
  }
  return false;
});

app.whenReady().then(() => {
  if (!APP_URL.startsWith('http') && process.env.DUO_SKIP_SERVER !== '1') {
    startInternalServer();
  }

  setTimeout(() => {
    createWindow();
  }, 500);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverInstance) {
      serverInstance.close();
    }
    app.quit();
  }
});
