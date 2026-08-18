// WebRTC Connection and Media Stream Manager with Robust Cross-Network & TURN Support

class WebRTCManager {
  constructor(socket, callbacks = {}) {
    this.socket = socket;
    this.callbacks = callbacks;

    this.peerConnection = null;
    this.localStream = null;
    this.screenStream = null;
    this.targetSocketId = null;

    this.isMuted = false;
    this.isVideoOn = false;
    this.isScreenSharing = false;

    this.iceCandidateQueue = [];

    // Comprehensive public STUN + Free OpenRelay TURN servers for cross-network connectivity (Symmetric NAT traversal)
    this.rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        { urls: 'stun:stun.cloudflare.com:3478' },
        { urls: 'stun:stun.services.mozilla.com:3478' },
        { urls: 'stun:global.stun.twilio.com:3478' },
        // OpenRelay Free Public TURN Servers (Allows streaming between different ISPs / 4G / CGNAT)
        {
          urls: [
            'turn:openrelay.metered.ca:80',
            'turn:openrelay.metered.ca:443',
            'turn:openrelay.metered.ca:443?transport=tcp'
          ],
          username: 'openrelay',
          credential: 'openrelay'
        }
      ],
      iceCandidatePoolSize: 10
    };

    this.setupSignalingListeners();
  }

  // ─── Local Media ──────────────────────────────────────────────────────────

  async initLocalMedia(video = false) {
    try {
      if (this.localStream) {
        this.localStream.getTracks().forEach(t => t.stop());
      }
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: video ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false
      });
      this.isVideoOn = video;
      return this.localStream;
    } catch (err) {
      console.error('[WebRTC] Error accessing microphone:', err);
      throw err;
    }
  }

  // ─── Peer Connection Lifecycle ────────────────────────────────────────────

  _createFreshPC(targetSocketId) {
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

    pc.onicecandidate = ({ candidate }) => {
      if (candidate && this.targetSocketId) {
        this.socket.emit('signal-ice-candidate', { targetSocketId: this.targetSocketId, candidate });
      }
    };

    pc.ontrack = ({ track, streams }) => {
      console.log('[WebRTC] ontrack fired:', track.kind, 'ReadyState:', track.readyState, 'Muted:', track.muted);
      const stream = (streams && streams[0]) ? streams[0] : new MediaStream([track]);
      if (this.callbacks.onRemoteStream) {
        this.callbacks.onRemoteStream(stream, track);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] connectionState:', pc.connectionState);
      if (this.callbacks.onConnectionStateChange) {
        this.callbacks.onConnectionStateChange(pc.connectionState);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] iceConnectionState:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed') {
        console.warn('[WebRTC] ICE failed, attempting restart...');
        pc.restartIce();
      }
    };

    this.peerConnection = pc;
    return pc;
  }

  _addAudioTracks(pc) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(t => {
        console.log('[WebRTC] Adding local audio track to PC:', t.label);
        pc.addTrack(t, this.localStream);
      });
    }
  }

  // ─── ICE Queue ────────────────────────────────────────────────────────────

  async _drainICEQueue() {
    if (!this.peerConnection || !this.peerConnection.remoteDescription) return;
    while (this.iceCandidateQueue.length > 0) {
      const c = this.iceCandidateQueue.shift();
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(c));
      } catch (e) {
        console.warn('[WebRTC] ICE candidate error:', e);
      }
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  async _sendOffer() {
    const pc = this.peerConnection;
    if (!pc) return;
    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await pc.setLocalDescription(offer);
      this.socket.emit('signal-offer', { targetSocketId: this.targetSocketId, sdp: pc.localDescription });
      console.log('[WebRTC] Offer successfully sent to', this.targetSocketId);
    } catch (err) {
      console.error('[WebRTC] Error creating offer:', err);
    }
  }

  // ─── Public: Initiate Call ────────────────────────────────────────────────

  async initiateCall(targetSocketId) {
    console.log('[WebRTC] initiateCall ->', targetSocketId);
    this.targetSocketId = targetSocketId;

    if (!this.localStream) {
      try {
        await this.initLocalMedia(false);
      } catch (err) {
        console.warn('[WebRTC] Mic init before offer failed:', err);
      }
    }

    const pc = this._createFreshPC(targetSocketId);
    this._addAudioTracks(pc);

    if (this.isScreenSharing && this.screenStream) {
      const vt = this.screenStream.getVideoTracks()[0];
      if (vt) pc.addTrack(vt, this.screenStream);
    }

    await this._sendOffer();
  }

  // ─── Public: Handle Incoming Offer ────────────────────────────────────────

  async handleOffer(senderSocketId, sdp) {
    this.targetSocketId = senderSocketId;
    console.log('[WebRTC] handleOffer from', senderSocketId, 'Existing PC:', !!this.peerConnection);

    if (!this.localStream) {
      try {
        await this.initLocalMedia(false);
      } catch (err) {
        console.warn('[WebRTC] Mic init before answer failed:', err);
      }
    }

    let pc;
    if (this.peerConnection) {
      pc = this.peerConnection;
    } else {
      pc = this._createFreshPC(senderSocketId);
      this._addAudioTracks(pc);
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      await this._drainICEQueue();
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.socket.emit('signal-answer', { targetSocketId: senderSocketId, sdp: pc.localDescription });
      console.log('[WebRTC] Answer sent to', senderSocketId);
    } catch (err) {
      console.error('[WebRTC] Error handling offer:', err);
    }
  }

  async handleAnswer(sdp) {
    if (!this.peerConnection) return;
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      await this._drainICEQueue();
      console.log('[WebRTC] Remote answer set successfully');
    } catch (err) {
      console.error('[WebRTC] Error setting answer:', err);
    }
  }

  async handleIceCandidate(candidate) {
    if (!this.peerConnection || !this.peerConnection.remoteDescription) {
      this.iceCandidateQueue.push(candidate);
      return;
    }
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('[WebRTC] ICE add error:', err);
    }
  }

  // ─── Signaling Listeners ──────────────────────────────────────────────────

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

  // ─── Mute ─────────────────────────────────────────────────────────────────

  toggleMute() {
    if (!this.localStream) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      this.isMuted = !audioTrack.enabled;
    }
    return this.isMuted;
  }

  // ─── Screen Share ─────────────────────────────────────────────────────────

  async startScreenShareWithSource(sourceId = null, withAudio = true) {
    try {
      let stream;

      if (sourceId) {
        // Electron desktopCapturer
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
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false });
        }
      } else {
        // Browser getDisplayMedia
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always', frameRate: { ideal: 30, max: 60 } },
          audio: withAudio
        });
      }

      this.screenStream = stream;
      this.isScreenSharing = true;
      console.log('[WebRTC] Screen captured. Video tracks:', stream.getVideoTracks().length);

      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.onended = () => this.stopScreenShare();

      if (this.peerConnection && this.targetSocketId) {
        // Remove any old video senders
        const senders = this.peerConnection.getSenders();
        const oldVideoSender = senders.find(s => s.track && s.track.kind === 'video');
        if (oldVideoSender) {
          this.peerConnection.removeTrack(oldVideoSender);
        }

        // Add screen video track to existing connection
        this.peerConnection.addTrack(videoTrack, stream);
        console.log('[WebRTC] Added screen track, renegotiating offer...');
        await this._sendOffer();
      }

      return stream;
    } catch (err) {
      console.error('[WebRTC] Screen share error:', err);
      this.isScreenSharing = false;
      return null;
    }
  }

  stopScreenShare() {
    if (!this.isScreenSharing) return;

    if (this.screenStream) {
      this.screenStream.getTracks().forEach(t => t.stop());
      this.screenStream = null;
    }
    this.isScreenSharing = false;

    if (this.peerConnection && this.targetSocketId) {
      const senders = this.peerConnection.getSenders();
      const videoSender = senders.find(s => s.track && s.track.kind === 'video');
      if (videoSender) {
        this.peerConnection.removeTrack(videoSender);
        this._sendOffer().catch(e => console.error('[WebRTC] Error renegotiating after stop:', e));
      }
    }

    if (this.callbacks.onScreenShareStopped) {
      this.callbacks.onScreenShareStopped();
    }
  }

  // ─── Reconnect helpers ────────────────────────────────────────────────────

  resetPeerConnection() {
    if (this.peerConnection) {
      this.peerConnection.ontrack = null;
      this.peerConnection.onicecandidate = null;
      this.peerConnection.onconnectionstatechange = null;
      this.peerConnection.oniceconnectionstatechange = null;
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.iceCandidateQueue = [];
    console.log('[WebRTC] Peer connection reset');
  }

  close() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(t => t.stop());
      this.screenStream = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }
    this.resetPeerConnection();
    this.targetSocketId = null;
    this.isScreenSharing = false;
    this.isVideoOn = false;
    this.isMuted = false;
    console.log('[WebRTC] Closed');
  }
}
