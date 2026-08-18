// Duo - Midnight Navy Theme with 2-User Slot Authentication (Nao & Rayo)

document.addEventListener('DOMContentLoaded', () => {
  // Elements - User Selection / Auth Overlay
  const userSelectOverlay = document.getElementById('userSelectOverlay');
  const cardSelectNao = document.getElementById('cardSelectNao');
  const cardSelectRayo = document.getElementById('cardSelectRayo');
  const btnSelectNao = document.getElementById('btnSelectNao');
  const btnSelectRayo = document.getElementById('btnSelectRayo');
  const authStatusNao = document.getElementById('authStatusNao');
  const authStatusRayo = document.getElementById('authStatusRayo');
  const authStatusTextNao = document.getElementById('authStatusTextNao');
  const authStatusTextRayo = document.getElementById('authStatusTextRayo');
  const authAvatarNao = document.getElementById('authAvatarNao');
  const authAvatarRayo = document.getElementById('authAvatarRayo');
  const btnLogoutUser = document.getElementById('btnLogoutUser');

  // Elements - Couple Sidebar
  const coupleSidebar = document.getElementById('coupleSidebar');
  const btnToggleSidebar = document.getElementById('btnToggleSidebar');
  const sidebarNotes = document.getElementById('sidebarNotes');
  const dockAvatar = document.getElementById('dockAvatar');
  const dockName = document.getElementById('dockName');
  const dockCallStatus = document.getElementById('dockCallStatus');
  const btnDockProfile = document.getElementById('btnDockProfile');
  const btnSettings = document.getElementById('btnSettings');

  // Sidebar Voice User Card elements — Local
  const sidebarLocalUser = document.getElementById('sidebarLocalUser');
  const sidebarLocalAvatar = document.getElementById('sidebarLocalAvatar');
  const sidebarLocalName = document.getElementById('sidebarLocalName');
  const sidebarLocalSub = document.getElementById('sidebarLocalSub');
  const sidebarLocalMutedBadge = document.getElementById('sidebarLocalMutedBadge');
  const sidebarLocalShareBadge = document.getElementById('sidebarLocalShareBadge');

  // Sidebar Voice User Card elements — Partner
  const sidebarPartnerUser = document.getElementById('sidebarPartnerUser');
  const sidebarPartnerAvatar = document.getElementById('sidebarPartnerAvatar');
  const sidebarPartnerName = document.getElementById('sidebarPartnerName');
  const sidebarPartnerSub = document.getElementById('sidebarPartnerSub');
  const sidebarPartnerMutedBadge = document.getElementById('sidebarPartnerMutedBadge');
  const sidebarPartnerShareBadge = document.getElementById('sidebarPartnerShareBadge');

  // Elements - Top Navbar
  const navStatusDot = document.getElementById('navStatusDot');
  const navStatusText = document.getElementById('navStatusText');

  // Elements - Call Box & Circles
  const callCenterCard = document.getElementById('callCenterCard');
  const localCircleItem = document.getElementById('localCircleItem');
  const localCircleAvatar = document.getElementById('localCircleAvatar');
  const localDisplayName = document.getElementById('localDisplayName');
  const localStatusBadge = document.getElementById('localStatusBadge');

  const partnerCircleItem = document.getElementById('partnerCircleItem');
  const partnerCircleAvatar = document.getElementById('partnerCircleAvatar');
  const partnerDisplayName = document.getElementById('partnerDisplayName');
  const partnerSubText = document.getElementById('partnerSubText');
  const partnerStatusBadge = document.getElementById('partnerStatusBadge');

  // Stream Viewport & Partner Audio
  const streamViewport = document.getElementById('streamViewport');
  const activeStreamVideo = document.getElementById('activeStreamVideo');
  activeStreamVideo.muted = true;
  const btnFullscreenStream = document.getElementById('btnFullscreenStream');
  const partnerAudio = document.getElementById('partnerAudio');

  // Pill Action Buttons
  const btnPillMute = document.getElementById('btnPillMute');
  const pillMuteText = document.getElementById('pillMuteText');
  const btnPillShare = document.getElementById('btnPillShare');
  const pillShareText = document.getElementById('pillShareText');
  const btnPillDisconnect = document.getElementById('btnPillDisconnect');

  // Screen Share Picker Modal Elements
  const screenPickerModal = document.getElementById('screenPickerModal');
  const btnCloseScreenPicker = document.getElementById('btnCloseScreenPicker');
  const btnCancelScreenPicker = document.getElementById('btnCancelScreenPicker');
  const btnConfirmScreenShare = document.getElementById('btnConfirmScreenShare');
  const tabScreens = document.getElementById('tabScreens');
  const tabWindows = document.getElementById('tabWindows');
  const sourcesGridContainer = document.getElementById('sourcesGridContainer');
  const checkShareAudio = document.getElementById('checkShareAudio');

  // Chat Elements
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const btnSendMessage = document.getElementById('btnSendMessage');
  const btnReactionHeart = document.getElementById('btnReactionHeart');

  // Profile Customization Modal Elements
  const profileModal = document.getElementById('profileModal');
  const profileModalAvatarPreview = document.getElementById('profileModalAvatarPreview');
  const fileAvatarInput = document.getElementById('fileAvatarInput');
  const inputProfileName = document.getElementById('inputProfileName');
  const inputProfileUrl = document.getElementById('inputProfileUrl');
  const btnCancelProfile = document.getElementById('btnCancelProfile');
  const btnSaveProfile = document.getElementById('btnSaveProfile');

  // Toast & Overlay
  const toastContainer = document.getElementById('toastContainer');
  const reactionsOverlay = document.getElementById('reactionsOverlay');

  // State
  let myUserKey = null; // 'nao' or 'rayo'
  let isInVoice = false;
  let partnerSocketId = null;
  let isConnectedWithPartner = false;
  let tempAvatarDataUrl = '';

  let profile = {
    username: 'Você',
    avatarUrl: '',
    avatarEmoji: '✨',
    statusText: 'Em chamada'
  };

  let partnerProfile = {
    username: 'Namorada',
    avatarUrl: '',
    avatarEmoji: '🌸',
    statusText: 'Aguardando...'
  };

  function setAvatarElement(element, avatarUrl, fallbackText) {
    if (!element) return;
    if (avatarUrl && avatarUrl.trim()) {
      element.style.backgroundImage = `url('${avatarUrl}')`;
      element.textContent = '';
    } else {
      element.style.backgroundImage = 'none';
      element.textContent = fallbackText || '💖';
    }
  }

  function applyProfileUI() {
    dockName.textContent = profile.username;
    localDisplayName.textContent = profile.username;
    setAvatarElement(localCircleAvatar, profile.avatarUrl, profile.avatarEmoji);
    setAvatarElement(dockAvatar, profile.avatarUrl, profile.avatarEmoji);

    sidebarLocalName.textContent = profile.username;
    setAvatarElement(sidebarLocalAvatar, profile.avatarUrl, profile.avatarEmoji);

    partnerDisplayName.textContent = partnerProfile.username;
    partnerSubText.textContent = partnerProfile.statusText;
    setAvatarElement(partnerCircleAvatar, partnerProfile.avatarUrl, partnerProfile.avatarEmoji);

    sidebarPartnerName.textContent = partnerProfile.username;
    sidebarPartnerSub.textContent = partnerProfile.statusText;
    setAvatarElement(sidebarPartnerAvatar, partnerProfile.avatarUrl, partnerProfile.avatarEmoji);
  }

  // Pre-populate login avatar previews from localStorage
  const savedNaoAvatar = localStorage.getItem('duo_avatar_nao') || '';
  const savedRayoAvatar = localStorage.getItem('duo_avatar_rayo') || '';
  setAvatarElement(authAvatarNao, savedNaoAvatar, '🐺');
  setAvatarElement(authAvatarRayo, savedRayoAvatar, '🌸');

  // Initialize Socket.io
  const cloudUrl = window.DUO_CONFIG?.SERVER_URL || '';
  const socket = cloudUrl ? io(cloudUrl) : io();

  // Voice Activity Detection (VAD)
  const vad = new VoiceDetector((isSpeaking) => {
    if (!isInVoice || webrtc.isMuted) return;
    if (isSpeaking) {
      localCircleItem.classList.add('is-speaking');
      sidebarLocalUser.classList.add('is-speaking');
      sidebarLocalSub.textContent = 'Falando...';
    } else {
      localCircleItem.classList.remove('is-speaking');
      sidebarLocalUser.classList.remove('is-speaking');
      sidebarLocalSub.textContent = isInVoice ? 'Em chamada' : 'Desconectado';
    }
    socket.emit('speaking-state', { isSpeaking });
  });

  // WebRTC Manager
  const webrtc = new WebRTCManager(socket, {
    onRemoteStream: (stream, track) => {
      console.log('[WebRTC] Remote track received:', track.kind, 'ReadyState:', track.readyState);
      if (track.kind === 'video') {
        const videoStream = (stream && stream.getVideoTracks().length > 0) ? stream : new MediaStream([track]);
        activeStreamVideo.srcObject = videoStream;
        activeStreamVideo.muted = true;

        const tryPlay = () => {
          activeStreamVideo.play().then(() => {
            console.log('[WebRTC] Remote video playing successfully');
          }).catch(e => {
            console.warn('[WebRTC] Video play retry:', e);
          });
        };

        track.onunmute = () => {
          console.log('[WebRTC] Remote video track unmuted, playing stream');
          tryPlay();
        };

        tryPlay();
        streamViewport.classList.add('visible');
        callCenterCard.classList.add('screenshare-active');
      } else if (track.kind === 'audio') {
        partnerAudio.srcObject = stream;
        partnerAudio.play().catch(e => console.log('Remote audio error:', e));
      }
    },
    onConnectionStateChange: (state) => {
      if (state === 'connected') {
        navStatusDot.classList.remove('offline');
        navStatusText.textContent = 'Em chamada';
        dockCallStatus.textContent = 'Em chamada';
        dockCallStatus.classList.remove('offline');
        partnerSubText.textContent = 'Em chamada';
        partnerCircleItem.classList.remove('hidden');
        partnerStatusBadge.classList.remove('offline');
        showToast('Chamada conectada! 🎧');
        sounds.playJoin();
      } else if (state === 'disconnected' || state === 'failed') {
        partnerSubText.textContent = 'Aguardando...';
        partnerCircleItem.classList.add('hidden');
        partnerStatusBadge.classList.add('offline');
      }
    },
    onScreenShareStopped: () => {
      btnPillShare.classList.remove('active-on');
      pillShareText.textContent = 'Compartilhar';
      sidebarLocalShareBadge.classList.remove('visible');
      activeStreamVideo.srcObject = null;
      activeStreamVideo.classList.remove('use-contain');
      streamViewport.style.aspectRatio = '';
      streamViewport.classList.remove('visible', 'stream-is-fullscreen');
      callCenterCard.classList.remove('screenshare-active');
      streamIsFullscreen = false;
      btnFullscreenStream.innerHTML = '<i class="ph ph-corners-out"></i>';
      document.removeEventListener('keydown', onEscFullscreen);
      socket.emit('update-media-state', { isScreenSharing: false });
      sounds.playScreenStart();
    }
  });

  // Handle Available Slots from Server
  socket.on('available-slots', ({ naoOccupied, rayoOccupied, activeProfiles }) => {
    // Update Nao Card
    if (naoOccupied && myUserKey !== 'nao') {
      cardSelectNao.classList.add('is-occupied');
      authStatusTextNao.textContent = 'Em uso';
      btnSelectNao.disabled = true;
      btnSelectNao.textContent = 'Online em outro aparelho';
    } else {
      cardSelectNao.classList.remove('is-occupied');
      authStatusTextNao.textContent = 'Disponível';
      btnSelectNao.disabled = false;
      btnSelectNao.textContent = 'Entrar como Nao';
    }

    // Update Rayo Card
    if (rayoOccupied && myUserKey !== 'rayo') {
      cardSelectRayo.classList.add('is-occupied');
      authStatusTextRayo.textContent = 'Em uso';
      btnSelectRayo.disabled = true;
      btnSelectRayo.textContent = 'Online em outro aparelho';
    } else {
      cardSelectRayo.classList.remove('is-occupied');
      authStatusTextRayo.textContent = 'Disponível';
      btnSelectRayo.disabled = false;
      btnSelectRayo.textContent = 'Entrar como Rayo';
    }

    if (activeProfiles?.nao?.avatarUrl) {
      setAvatarElement(authAvatarNao, activeProfiles.nao.avatarUrl, '🐺');
    }
    if (activeProfiles?.rayo?.avatarUrl) {
      setAvatarElement(authAvatarRayo, activeProfiles.rayo.avatarUrl, '🌸');
    }
  });

  // User Selection Actions
  function selectUser(userKey) {
    const savedName = localStorage.getItem(`duo_name_${userKey}`) || (userKey === 'nao' ? 'Nao' : 'Rayo');
    const savedAvatar = localStorage.getItem(`duo_avatar_${userKey}`) || '';
    const defaultEmoji = userKey === 'nao' ? '🐺' : '🌸';

    const userProfile = {
      username: savedName,
      avatarUrl: savedAvatar,
      avatarEmoji: defaultEmoji
    };

    socket.emit('select-user', { userKey, profile: userProfile });
  }

  btnSelectNao.addEventListener('click', () => selectUser('nao'));
  btnSelectRayo.addEventListener('click', () => selectUser('rayo'));
  cardSelectNao.addEventListener('click', (e) => {
    if (!cardSelectNao.classList.contains('is-occupied') && e.target !== btnSelectNao) {
      selectUser('nao');
    }
  });
  cardSelectRayo.addEventListener('click', (e) => {
    if (!cardSelectRayo.classList.contains('is-occupied') && e.target !== btnSelectRayo) {
      selectUser('rayo');
    }
  });

  // Selection Failed
  socket.on('select-user-error', ({ message }) => {
    showToast(message || 'Erro ao selecionar perfil');
  });

  // Selection Success (Login into App)
  socket.on('select-user-success', ({ userKey, userData, partner, chatHistory }) => {
    myUserKey = userKey;
    const partnerKey = userKey === 'nao' ? 'rayo' : 'nao';

    profile = {
      username: userData.username,
      avatarUrl: userData.avatarUrl,
      avatarEmoji: userData.avatarEmoji,
      statusText: 'Em chamada'
    };

    if (partner) {
      partnerProfile = {
        username: partner.username || (partnerKey === 'nao' ? 'Nao' : 'Rayo'),
        avatarUrl: partner.avatarUrl || '',
        avatarEmoji: partner.avatarEmoji || (partnerKey === 'nao' ? '🐺' : '🌸'),
        statusText: 'Em chamada'
      };
      isConnectedWithPartner = true;
      partnerSocketId = partner.socketId;
      partnerCircleItem.classList.remove('hidden');
      sidebarPartnerUser.classList.remove('is-offline');
      sidebarPartnerSub.textContent = 'Em chamada';
    } else {
      partnerProfile = {
        username: partnerKey === 'nao' ? 'Nao' : 'Rayo',
        avatarUrl: '',
        avatarEmoji: partnerKey === 'nao' ? '🐺' : '🌸',
        statusText: 'Aguardando...'
      };
      isConnectedWithPartner = false;
      partnerSocketId = null;
      partnerCircleItem.classList.add('hidden');
      sidebarPartnerUser.classList.add('is-offline');
      sidebarPartnerSub.textContent = 'Aguardando...';
    }

    applyProfileUI();

    // Hide Login Overlay smoothly
    userSelectOverlay.classList.add('hidden');

    // Initialize Voice Media Call
    initCall();

    // Load Chat History
    if (Array.isArray(chatHistory)) {
      chatHistory.forEach(msg => appendChatMessage(msg));
    }

    showToast(`Entrou como ${profile.username}! ✨`);
  });

  // Logout / Switch User
  btnLogoutUser.addEventListener('click', () => {
    if (confirm('Deseja sair do seu perfil atual?')) {
      if (isInVoice) {
        webrtc.close();
        vad.stop();
        isInVoice = false;
      }
      socket.emit('logout-user');
      myUserKey = null;
      userSelectOverlay.classList.remove('hidden');
      localCircleItem.classList.add('hidden');
      partnerCircleItem.classList.add('hidden');
    }
  });

  socket.on('logged-out', () => {
    myUserKey = null;
    userSelectOverlay.classList.remove('hidden');
  });

  // Join Room & Initialize Media
  async function initCall() {
    try {
      const stream = await webrtc.initLocalMedia(false);
      vad.start(stream);
      isInVoice = true;
      localCircleItem.classList.remove('hidden');
      dockCallStatus.textContent = 'Em chamada';
      dockCallStatus.classList.remove('offline');
      navStatusDot.classList.remove('offline');
      navStatusText.textContent = 'Em chamada';
      sidebarLocalSub.textContent = 'Em chamada';
    } catch (e) {
      console.warn('Microphone access warning:', e);
    }
  }

  // Fullscreen implementation
  let streamIsFullscreen = false;

  activeStreamVideo.addEventListener('loadedmetadata', () => {
    const vw = activeStreamVideo.videoWidth;
    const vh = activeStreamVideo.videoHeight;
    if (vw && vh) {
      const ratio = vw / vh;
      if (ratio < 1.6) {
        activeStreamVideo.classList.add('use-contain');
      } else {
        activeStreamVideo.classList.remove('use-contain');
      }
      if (!streamViewport.classList.contains('stream-is-fullscreen')) {
        streamViewport.style.aspectRatio = `${vw} / ${vh}`;
      }
    }
  });

  function toggleStreamFullscreen() {
    streamIsFullscreen = !streamIsFullscreen;
    streamViewport.classList.toggle('stream-is-fullscreen', streamIsFullscreen);

    if (streamIsFullscreen) {
      btnFullscreenStream.innerHTML = '<i class="ph ph-corners-in"></i>';
      btnFullscreenStream.title = 'Sair da Tela Cheia';
      document.addEventListener('keydown', onEscFullscreen);
    } else {
      btnFullscreenStream.innerHTML = '<i class="ph ph-corners-out"></i>';
      btnFullscreenStream.title = 'Tela Cheia (⛶)';
      document.removeEventListener('keydown', onEscFullscreen);
    }
  }

  function onEscFullscreen(e) {
    if (e.key === 'Escape' && streamIsFullscreen) {
      toggleStreamFullscreen();
    }
  }

  btnFullscreenStream.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleStreamFullscreen();
  });

  activeStreamVideo.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    toggleStreamFullscreen();
  });

  // Pill Action: Mute / Unmute
  btnPillMute.addEventListener('click', () => {
    const isMuted = webrtc.toggleMute();
    if (isMuted) {
      btnPillMute.classList.add('active-muted');
      btnPillMute.innerHTML = '<i class="ph ph-microphone-slash"></i> <span>Desmutar</span>';
      sidebarLocalUser.classList.remove('is-speaking');
      sidebarLocalMutedBadge.classList.add('visible');
      sidebarLocalSub.textContent = 'Mutado';
      sounds.playMute();
      showToast('Microfone mutado 🔇');
    } else {
      btnPillMute.classList.remove('active-muted');
      btnPillMute.innerHTML = '<i class="ph ph-microphone"></i> <span>Mutar</span>';
      sidebarLocalMutedBadge.classList.remove('visible');
      sidebarLocalSub.textContent = 'Em chamada';
      sounds.playUnmute();
      showToast('Microfone ativado 🎤');
    }
    socket.emit('update-media-state', { isMuted });
  });

  // Screen Share Picker Logic
  let availableSources = [];
  let selectedSource = null;
  let currentPickerTab = 'screens';

  async function openScreenSharePicker() {
    if (webrtc.isScreenSharing) {
      webrtc.stopScreenShare();
      btnPillShare.classList.remove('active-on');
      btnPillShare.innerHTML = '<i class="ph ph-screencast"></i> <span>Compartilhar</span>';
      sidebarLocalShareBadge.classList.remove('visible');
      sidebarLocalSub.textContent = 'Em chamada';
      activeStreamVideo.srcObject = null;
      streamViewport.classList.remove('visible');
      callCenterCard.classList.remove('screenshare-active');
      return;
    }

    if (window.electronAPI && window.electronAPI.getDesktopSources) {
      try {
        availableSources = await window.electronAPI.getDesktopSources();
        renderSourcePickerGrid();
        screenPickerModal.classList.add('open');
      } catch (err) {
        console.error('Error fetching desktop sources:', err);
        fallbackBrowserScreenShare();
      }
    } else {
      fallbackBrowserScreenShare();
    }
  }

  function renderSourcePickerGrid() {
    sourcesGridContainer.innerHTML = '';
    selectedSource = null;

    const isScreenTab = currentPickerTab === 'screens';
    const filtered = availableSources.filter(s => {
      const isScreen = s.id.startsWith('screen:') || s.name.toLowerCase().includes('screen') || s.name.toLowerCase().includes('tela');
      return isScreenTab ? isScreen : !isScreen;
    });

    if (filtered.length === 0) {
      sourcesGridContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 30px;">
          Nenhuma ${isScreenTab ? 'tela' : 'janela'} encontrada.
        </div>
      `;
      return;
    }

    filtered.forEach((source, index) => {
      const card = document.createElement('div');
      card.className = 'source-item-card' + (index === 0 ? ' selected' : '');
      if (index === 0) selectedSource = source;

      card.innerHTML = `
        <div class="source-thumbnail-box">
          <img src="${source.thumbnail}" class="source-thumbnail-img" alt="${escapeHTML(source.name)}">
        </div>
        <div class="source-title-row">
          ${source.appIcon ? `<img src="${source.appIcon}" class="source-app-icon">` : '<i class="ph ph-app-window"></i>'}
          <span title="${escapeHTML(source.name)}">${escapeHTML(source.name)}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        document.querySelectorAll('.source-item-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedSource = source;
      });

      card.addEventListener('dblclick', () => {
        selectedSource = source;
        btnConfirmScreenShare.click();
      });

      sourcesGridContainer.appendChild(card);
    });
  }

  tabScreens.addEventListener('click', () => {
    currentPickerTab = 'screens';
    tabScreens.classList.add('active');
    tabWindows.classList.remove('active');
    renderSourcePickerGrid();
  });

  tabWindows.addEventListener('click', () => {
    currentPickerTab = 'windows';
    tabWindows.classList.add('active');
    tabScreens.classList.remove('active');
    renderSourcePickerGrid();
  });

  btnCloseScreenPicker.addEventListener('click', () => screenPickerModal.classList.remove('open'));
  btnCancelScreenPicker.addEventListener('click', () => screenPickerModal.classList.remove('open'));

  // Confirm Screen Share
  btnConfirmScreenShare.addEventListener('click', async () => {
    screenPickerModal.classList.remove('open');
    if (!selectedSource) return;

    streamIsFullscreen = false;
    streamViewport.classList.remove('stream-is-fullscreen');
    streamViewport.style.aspectRatio = '';
    activeStreamVideo.classList.remove('use-contain');
    btnFullscreenStream.innerHTML = '<i class="ph ph-corners-out"></i>';

    const withAudio = checkShareAudio.checked;
    const screenStream = await webrtc.startScreenShareWithSource(selectedSource.id, withAudio);

    if (screenStream) {
      btnPillShare.classList.add('active-on');
      btnPillShare.innerHTML = '<i class="ph ph-screencast"></i> <span>Parar Tela</span>';
      sidebarLocalShareBadge.classList.add('visible');
      sidebarLocalSub.textContent = 'Compartilhando tela';

      activeStreamVideo.srcObject = screenStream;
      activeStreamVideo.muted = true;
      activeStreamVideo.play().catch(e => console.log('Local stream play error:', e));

      streamViewport.classList.add('visible');
      callCenterCard.classList.add('screenshare-active');
      socket.emit('update-media-state', { isScreenSharing: true });
      showToast(`Transmitindo ${selectedSource.name}! Clique ⛶ ou duplo clique para Tela Cheia 🖥️`);
    }
  });

  async function fallbackBrowserScreenShare() {
    const screenStream = await webrtc.startScreenShareWithSource(null, true);
    if (screenStream) {
      btnPillShare.classList.add('active-on');
      btnPillShare.innerHTML = '<i class="ph ph-screencast"></i> <span>Parar Tela</span>';
      sidebarLocalShareBadge.classList.add('visible');
      sidebarLocalSub.textContent = 'Compartilhando tela';
      activeStreamVideo.srcObject = screenStream;
      activeStreamVideo.muted = true;
      streamViewport.classList.add('visible');
      callCenterCard.classList.add('screenshare-active');
      socket.emit('update-media-state', { isScreenSharing: true });
      showToast('Transmissão de tela iniciada! 🖥️');
    }
  }

  btnPillShare.addEventListener('click', openScreenSharePicker);

  // Pill Action: Disconnect / Encerrar
  btnPillDisconnect.addEventListener('click', () => {
    if (isInVoice) {
      isInVoice = false;
      webrtc.close();
      vad.stop();
      navStatusDot.classList.add('offline');
      navStatusText.textContent = 'Desconectado';
      dockCallStatus.textContent = 'Desconectado';
      dockCallStatus.classList.add('offline');
      btnPillDisconnect.innerHTML = '<i class="ph-bold ph-phone-call"></i> <span>Reconectar</span>';
      btnPillDisconnect.classList.remove('btn-pill-disconnect');
      btnPillDisconnect.classList.add('btn-pill-connect');
      localCircleItem.classList.add('hidden');
      sidebarLocalUser.classList.remove('is-speaking');
      sidebarLocalSub.textContent = 'Desconectado';
      sidebarLocalMutedBadge.classList.remove('visible');
      sidebarLocalShareBadge.classList.remove('visible');
      streamViewport.classList.remove('visible', 'stream-is-fullscreen');
      callCenterCard.classList.remove('screenshare-active');
      sounds.playLeave();
      showToast('Chamada encerrada 🔇');
    } else {
      initCall();
      btnPillDisconnect.innerHTML = '<i class="ph-bold ph-phone-disconnect"></i> <span>Encerrar</span>';
      btnPillDisconnect.classList.remove('btn-pill-connect');
      btnPillDisconnect.classList.add('btn-pill-disconnect');
      dockCallStatus.classList.remove('offline');
      localCircleItem.classList.remove('hidden');
      sidebarLocalSub.textContent = 'Em chamada';
      sounds.playJoin();
    }
  });

  // Toggle Sidebar
  btnToggleSidebar.addEventListener('click', () => {
    coupleSidebar.classList.toggle('collapsed');
  });

  // Live Shared Couple Notes Sync
  const savedNotes = localStorage.getItem('duo_notes_shared');
  if (savedNotes) {
    sidebarNotes.value = savedNotes;
  }

  let notesDebounce = null;
  sidebarNotes.addEventListener('input', () => {
    const content = sidebarNotes.value;
    localStorage.setItem('duo_notes_shared', content);
    clearTimeout(notesDebounce);
    notesDebounce = setTimeout(() => {
      socket.emit('sync-notes', { content });
    }, 250);
  });

  socket.on('notes-synced', ({ content }) => {
    sidebarNotes.value = content;
    localStorage.setItem('duo_notes_shared', content);
  });

  // Profile Customization Modal Logic
  function openProfileModal() {
    inputProfileName.value = profile.username;
    inputProfileUrl.value = profile.avatarUrl || '';
    tempAvatarDataUrl = profile.avatarUrl;
    setAvatarElement(profileModalAvatarPreview, profile.avatarUrl, profile.avatarEmoji);
    profileModal.classList.add('open');
  }

  function closeProfileModal() {
    profileModal.classList.remove('open');
  }

  btnDockProfile.addEventListener('click', openProfileModal);
  btnSettings.addEventListener('click', openProfileModal);
  localCircleItem.addEventListener('click', openProfileModal);
  btnCancelProfile.addEventListener('click', closeProfileModal);

  profileModalAvatarPreview.addEventListener('click', () => {
    fileAvatarInput.click();
  });

  fileAvatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        tempAvatarDataUrl = event.target.result;
        setAvatarElement(profileModalAvatarPreview, tempAvatarDataUrl, profile.avatarEmoji);
        inputProfileUrl.value = '';
      };
      reader.readAsDataURL(file);
    }
  });

  inputProfileUrl.addEventListener('input', () => {
    const url = inputProfileUrl.value.trim();
    tempAvatarDataUrl = url;
    setAvatarElement(profileModalAvatarPreview, url, profile.avatarEmoji);
  });

  btnSaveProfile.addEventListener('click', () => {
    const newName = inputProfileName.value.trim();
    if (newName) {
      profile.username = newName;
    }
    profile.avatarUrl = tempAvatarDataUrl;

    if (myUserKey) {
      localStorage.setItem(`duo_name_${myUserKey}`, profile.username);
      localStorage.setItem(`duo_avatar_${myUserKey}`, profile.avatarUrl);
    }

    applyProfileUI();
    socket.emit('update-profile', profile);
    closeProfileModal();
    showToast('Perfil atualizado com sucesso! ✨');
  });

  // Socket Peer Events
  socket.on('peer-joined', ({ peer, initiator }) => {
    partnerSocketId = peer.socketId;
    isConnectedWithPartner = true;
    updatePartnerData(peer);
    showToast(`${peer.username} conectou na chamada! ✨`);

    if (initiator) {
      webrtc.initiateCall(peer.socketId);
    }
  });

  socket.on('peer-existing', ({ peer }) => {
    partnerSocketId = peer.socketId;
    isConnectedWithPartner = true;
    updatePartnerData(peer);
    webrtc.initiateCall(peer.socketId);
  });

  socket.on('peer-left', ({ username }) => {
    showToast(`${username || 'Namorada'} saiu da chamada`);
    partnerSocketId = null;
    isConnectedWithPartner = false;
    partnerSubText.textContent = 'Aguardando...';
    partnerCircleItem.classList.add('hidden');
    partnerStatusBadge.classList.add('offline');
    sidebarPartnerUser.classList.add('is-offline');
    sidebarPartnerUser.classList.remove('is-speaking');
    sidebarPartnerSub.textContent = 'Aguardando...';
    sidebarPartnerMutedBadge.classList.remove('visible');
    sidebarPartnerShareBadge.classList.remove('visible');
    sounds.playLeave();
  });

  socket.on('peer-profile-updated', (updatedPeer) => {
    updatePartnerData(updatedPeer);
  });

  socket.on('peer-media-state-updated', (state) => {
    if (state.isMuted !== undefined) {
      if (state.isMuted) {
        partnerStatusBadge.classList.add('muted');
        sidebarPartnerMutedBadge.classList.add('visible');
      } else {
        partnerStatusBadge.classList.remove('muted');
        sidebarPartnerMutedBadge.classList.remove('visible');
      }
    }
    if (state.isScreenSharing !== undefined) {
      if (state.isScreenSharing) {
        sidebarPartnerShareBadge.classList.add('visible');
        sidebarPartnerSub.textContent = 'Compartilhando tela';
        streamViewport.classList.add('visible');
        callCenterCard.classList.add('screenshare-active');
        sounds.playScreenStart();
        showToast('Transmissão de tela iniciada pela namorada! 🖥️');
      } else {
        sidebarPartnerShareBadge.classList.remove('visible');
        if (!sidebarPartnerUser.classList.contains('is-offline')) {
          sidebarPartnerSub.textContent = 'Em chamada';
        }
        if (!webrtc.isScreenSharing) {
          streamViewport.classList.remove('visible');
          callCenterCard.classList.remove('screenshare-active');
        }
      }
    }
  });

  socket.on('peer-speaking-state', ({ isSpeaking }) => {
    if (isSpeaking) {
      partnerCircleItem.classList.add('is-speaking');
      sidebarPartnerUser.classList.add('is-speaking');
      sidebarPartnerSub.textContent = 'Falando...';
    } else {
      partnerCircleItem.classList.remove('is-speaking');
      sidebarPartnerUser.classList.remove('is-speaking');
      if (!sidebarPartnerUser.classList.contains('is-offline')) {
        sidebarPartnerSub.textContent = sidebarPartnerShareBadge.classList.contains('visible')
          ? 'Compartilhando tela'
          : 'Em chamada';
      }
    }
  });

  function updatePartnerData(peer) {
    const partnerKey = myUserKey === 'nao' ? 'rayo' : 'nao';
    partnerProfile.username = peer.username || (partnerKey === 'nao' ? 'Nao' : 'Rayo');
    partnerProfile.avatarUrl = peer.avatarUrl || '';
    partnerProfile.statusText = 'Em chamada';
    partnerCircleItem.classList.remove('hidden');
    partnerStatusBadge.classList.remove('offline');
    sidebarPartnerUser.classList.remove('is-offline', 'is-speaking');
    sidebarPartnerSub.textContent = 'Em chamada';
    applyProfileUI();
  }

  // Reactions (Hearts)
  function triggerHeart() {
    createFloatingParticle('💖');
    sounds.playHeartPop();
    socket.emit('send-reaction', { reaction: '💖', sound: 'heart' });
  }

  btnReactionHeart.addEventListener('click', triggerHeart);

  socket.on('peer-reaction', ({ reaction, sound }) => {
    createFloatingParticle(reaction);
    if (sound === 'heart') sounds.playHeartPop();
  });

  function createFloatingParticle(emoji) {
    const particle = document.createElement('div');
    particle.className = 'floating-particle';
    particle.textContent = emoji;
    particle.style.left = `${Math.floor(Math.random() * 60) + 20}%`;
    particle.style.bottom = '80px';
    reactionsOverlay.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 2600);
  }

  // Chat Messaging & Deduplication
  const renderedMessageIds = new Set();

  function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    socket.emit('send-message', {
      text,
      senderName: profile.username,
      senderAvatar: profile.avatarUrl,
      type: 'text',
      timestamp: new Date().toISOString()
    });

    chatInput.value = '';
    chatInput.focus();
  }

  btnSendMessage.addEventListener('click', (e) => {
    e.preventDefault();
    sendChatMessage();
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendChatMessage();
    }
  });

  socket.on('new-message', (messageData) => {
    appendChatMessage(messageData);
    if (messageData.senderUserKey !== myUserKey) {
      sounds.playMessage();
    }
  });

  socket.on('chat-history', (history) => {
    if (Array.isArray(history) && history.length > 0) {
      history.forEach(msg => appendChatMessage(msg));
    }
  });

  function appendChatMessage(msg) {
    const msgKey = msg.id || (msg.senderName + '_' + msg.timestamp + '_' + msg.text);
    if (renderedMessageIds.has(msgKey)) return;
    renderedMessageIds.add(msgKey);

    const bubbleRow = document.createElement('div');
    bubbleRow.className = 'chat-bubble-row';

    const isMine = (msg.senderUserKey === myUserKey) || (msg.senderId === socket.id) || (msg.senderName === profile.username);
    const authorColor = isMine ? '#00e676' : '#ff79c6';
    const time = new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    bubbleRow.innerHTML = `
      <div class="chat-bubble-avatar" style="${msg.senderAvatar ? `background-image: url('${msg.senderAvatar}');` : ''}">
        ${msg.senderAvatar ? '' : (isMine ? profile.avatarEmoji : partnerProfile.avatarEmoji)}
      </div>
      <div class="chat-bubble-content">
        <div class="chat-bubble-header">
          <span class="chat-bubble-author" style="color: ${authorColor};">${escapeHTML(msg.senderName || 'Usuário')}</span>
          <span class="chat-bubble-time">${time}</span>
        </div>
        <div class="chat-bubble-text">${escapeHTML(msg.text || '')}</div>
      </div>
    `;

    chatMessages.appendChild(bubbleRow);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // Toast Notification
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

  // Global Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    if (e.key === 'm' || e.key === 'M') {
      btnPillMute.click();
    } else if (e.key === 's' || e.key === 'S') {
      btnPillShare.click();
    } else if (e.key === 'h' || e.key === 'H') {
      triggerHeart();
    }
  });
});
