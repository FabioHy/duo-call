const { app, BrowserWindow, session, ipcMain, desktopCapturer } = require('electron');
const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

let mainWindow = null;
let serverInstance = null;
const PORT = 3000;

// Track active users and chat history in-memory
const users = new Map();
const roomChatHistory = new Map();

// Setup Internal Backend Server
function startInternalServer() {
  const expressApp = express();
  const server = http.createServer(expressApp);
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  expressApp.use(express.static(path.join(__dirname, 'public')));

  expressApp.get('/api/info', (req, res) => {
    res.json({ name: 'Duo Call Desktop', status: 'online' });
  });

  expressApp.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  io.on('connection', (socket) => {
    socket.on('join-room', ({ roomId, profile }) => {
      const room = roomId || 'our-space';
      socket.join(room);
      socket.roomId = room;

      const userData = {
        socketId: socket.id,
        roomId: room,
        username: profile?.username || 'Partner',
        avatarUrl: profile?.avatarUrl || '',
        avatarEmoji: profile?.avatarEmoji || '💖',
        isMuted: false,
        isDeafened: false,
        isVideoOn: false,
        isScreenSharing: false,
        statusText: profile?.statusText || 'Conectado'
      };

      users.set(socket.id, userData);

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
      const user = users.get(socket.id);
      const room = user?.roomId || socket.roomId || 'our-space';

      const messageData = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        senderId: socket.id,
        senderName: senderName || user?.username || 'Partner',
        senderAvatar: senderAvatar || user?.avatarUrl || '',
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

    // Live Shared Notes / Watchlist Sync
    socket.on('sync-notes', ({ content }) => {
      const user = users.get(socket.id);
      const room = user?.roomId || socket.roomId || 'our-space';
      socket.to(room).emit('notes-synced', { content });
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

  mainWindow.loadURL(`http://localhost:${PORT}`, {
    extraHeaders: 'pragma: no-cache\ncache-control: no-cache'
  });

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
  startInternalServer();
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
