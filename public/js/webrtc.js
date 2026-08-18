// WebRTC Connection and Media Stream Manager with Robust Cross-Network Support

class WebRTCManager {
  constructor(socket, callbacks = {}) {
    this.socket = socket;
    this.callbacks = callbacks;

    this.peerConnection = null;
    this.localStream = null;
    this.screenStream = null;
    this.targetSocketId = null;

    this.isMuted = false;
    this.isDeafened = false;
    this.isVideoOn = false;
    this.isScreenSharing = false;

    // Queue for ICE candidates that arrive before setRemoteDescription
    this.iceCandidateQueue = [];

    // Comprehensive public STUN servers for cross-network connectivity
    this.rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        { urls: 'stun:stun.cloudflare.com:3478' },
        { urls: 'stun:stun.services.mozilla.com:3478' }
      ],
      iceCandidatePoolSize: 10
    };

    this.setupSignalingListeners();
  }

  // Initialize local microphone
  async initLocalMedia(video = false) {
    try {
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: video ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false
      };

      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
      }

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.isVideoOn = video;
      return this.localStream;
    } catch (err) {
      console.error('Error accessing local microphone/camera:', err);
      throw err;
    }
  }

  // ─── Core: create a fresh RTCPeerConnection ───────────────────────────────
  _createPeerConnection(targetSocketId) {
    // Tear down any existing connection first
    if (this.peerConnection) {
      this.peerConnection.ontrack = null;
      this.peerConnection.onicecandidate = null;
      this.peerConnection.onconnectionstatechange = null;
      this.peerConnection.oniceconnectionstatechange = null;
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.iceCandidateQueue = [];
    this.targetSocketId = targetSocketId;

    const pc = new RTCPeerConnection(this.rtcConfig);

    pc.onicecandidate = (event) => {
      if (event.candidate && this.targetSocketId) {
        this.socket.emit('signal-ice-candidate', {
          targetSocketId: this.targetSocketId,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('[WebRTC] ontrack fired:', event.track.kind, 'state:', event.track.readyState);
      const stream = (event.streams && event.streams[0])
        ? event.streams[0]
        : new MediaStream([event.track]);

      if (this.callbacks.onRemoteStream) {
        this.callbacks.onRemoteStream(stream, event.track);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection State:', pc.connectionState);
      if (this.callbacks.onConnectionStateChange) {
        this.callbacks.onConnectionStateChange(pc.connectionState);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE State:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed') {
        pc.restartIce();
      }
    };

    this.peerConnection = pc;
    return pc;
  }

  // ─── Used when we ALREADY have a peer connection and just need it ─────────
  getOrCreatePeerConnection(targetSocketId) {
    if (this.peerConnection) {
      this.targetSocketId = targetSocketId;
      return this.peerConnection;
    }
    return this._createPeerConnection(targetSocketId);
  }

  // ─── Add the appropriate local tracks to pc ───────────────────────────────
  _addLocalTracksToPc(pc, includeScreenVideo = false) {
    // Always add microphone audio
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream);
      });
    }

    // Optionally add screen video
    if (includeScreenVideo && this.screenStream) {
      const videoTrack = this.screenStream.getVideoTracks()[0];
      if (videoTrack) {
        pc.addTrack(videoTrack, this.screenStream);
      }
    }
  }

  // Drain queued ICE candidates once remote description is set
  async processIceCandidateQueue() {
    if (!this.peerConnection || !this.peerConnection.remoteDescription) return;
    while (this.iceCandidateQueue.length > 0) {
      const candidate = this.iceCandidateQueue.shift();
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('[WebRTC] Error adding queued ICE candidate:', err);
      }
    }
  }

  // Initiate call / offer
  async initiateCall(targetSocketId) {
    this.targetSocketId = targetSocketId;
    const pc = this.getOrCreatePeerConnection(targetSocketId);

    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await pc.setLocalDescription(offer);

      this.socket.emit('signal-offer', {
        targetSocketId,
        sdp: pc.localDescription
      });
    } catch (err) {
      console.error('[WebRTC] Error creating offer:', err);
    }
  }

  // Handle incoming Offer
  async handleOffer(senderSocketId, sdp) {
    this.targetSocketId = senderSocketId;

    // Check if this looks like a renegotiation (screen share started/stopped)
    // If so, rebuild the peer connection so we get fresh ontrack events
    const isRenegotiation = !!this.peerConnection;

    let pc;
    if (isRenegotiation) {
      console.log('[WebRTC] Renegotiation offer received — rebuilding peer connection for fresh ontrack');
      pc = this._createPeerConnection(senderSocketId);
      this._addLocalTracksToPc(pc, this.isScreenSharing);
    } else {
      pc = this.getOrCreatePeerConnection(senderSocketId);
      this._addLocalTracksToPc(pc, false);
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      await this.processIceCandidateQueue();

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      this.socket.emit('signal-answer', {
        targetSocketId: senderSocketId,
        sdp: pc.localDescription
      });
    } catch (err) {
      console.error('[WebRTC] Error handling offer:', err);
    }
  }

  // Handle incoming Answer
  async handleAnswer(sdp) {
    if (!this.peerConnection) return;
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      await this.processIceCandidateQueue();
    } catch (err) {
      console.error('[WebRTC] Error setting remote description from answer:', err);
    }
  }

  // Handle ICE Candidate
  async handleIceCandidate(candidate) {
    if (!this.peerConnection || !this.peerConnection.remoteDescription) {
      this.iceCandidateQueue.push(candidate);
      return;
    }

    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('[WebRTC] Error adding ICE candidate:', err);
    }
  }

  // Socket signaling listeners
  setupSignalingListeners() {
    this.socket.on('signal-offer', async ({ senderSocketId, sdp }) => {
      await this.handleOffer(senderSocketId, sdp);
    });

    this.socket.on('signal-answer', async ({ sdp }) => {
      await this.handleAnswer(sdp);
    });

    this.socket.on('signal-ice-candidate', async ({ candidate }) => {
      await this.handleIceCandidate(candidate);
    });
  }

  // Mute / Unmute Microphone
  toggleMute() {
    if (!this.localStream) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      this.isMuted = !audioTrack.enabled;
    }
    return this.isMuted;
  }

  // ─── Start Screen Share ───────────────────────────────────────────────────
  // Strategy: capture screen, then REBUILD the peer connection with
  // audio + video so the remote peer always gets a fresh ontrack event.
  async startScreenShareWithSource(sourceId = null, withAudio = true) {
    try {
      let stream;

      if (sourceId) {
        // Electron desktopCapturer capture
        const videoConstraints = {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId,
            maxWidth: 1920,
            maxHeight: 1080,
            maxFrameRate: 30
          }
        };

        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: withAudio ? { mandatory: { chromeMediaSource: 'desktop' } } : false
          });
        } catch (audioErr) {
          console.warn('[WebRTC] Desktop audio capture failed, retrying video-only:', audioErr);
          stream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: false
          });
        }
      } else {
        // Standard browser getDisplayMedia
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always', frameRate: { ideal: 30, max: 60 } },
          audio: withAudio
        });
      }

      this.screenStream = stream;
      this.isScreenSharing = true;

      const screenVideoTrack = this.screenStream.getVideoTracks()[0];
      screenVideoTrack.onended = () => {
        this.stopScreenShare();
      };

      // Rebuild peer connection so the remote peer gets a fresh ontrack for the video
      if (this.targetSocketId) {
        await this._restartWithTracks(true);
      }

      return this.screenStream;
    } catch (err) {
      console.error('[WebRTC] Error starting screen share:', err);
      this.isScreenSharing = false;
      return null;
    }
  }

  // ─── Stop Screen Sharing ──────────────────────────────────────────────────
  // Strategy: stop tracks, then REBUILD the peer connection audio-only
  // so the remote peer receives a fresh offer without video.
  stopScreenShare() {
    if (!this.isScreenSharing) return;

    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }
    this.isScreenSharing = false;

    // Rebuild audio-only peer connection
    if (this.targetSocketId) {
      this._restartWithTracks(false).catch(err => {
        console.error('[WebRTC] Error restarting after screen share stop:', err);
      });
    }

    if (this.callbacks.onScreenShareStopped) {
      this.callbacks.onScreenShareStopped();
    }
  }

  // ─── Rebuild peer connection, add tracks, send new offer ─────────────────
  async _restartWithTracks(includeScreen) {
    if (!this.targetSocketId) return;

    const pc = this._createPeerConnection(this.targetSocketId);
    this._addLocalTracksToPc(pc, includeScreen);
    await this.initiateCall(this.targetSocketId);
  }

  close() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    if (this.peerConnection) {
      this.peerConnection.ontrack = null;
      this.peerConnection.onicecandidate = null;
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.targetSocketId = null;
    this.isScreenSharing = false;
    this.isVideoOn = false;
    this.isMuted = false;
    this.iceCandidateQueue = [];
  }
}
