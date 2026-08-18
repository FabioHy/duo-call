// WebRTC Connection and Media Stream Manager (W3C Perfect Negotiation Pattern)
// Supports cross-network, cross-device, and multi-tab audio/screen streaming with TURN relay.

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

    // Perfect Negotiation state
    this.isPolite = false; // 'rayo' is polite, 'nao' is impolite
    this.makingOffer = false;
    this.ignoreOffer = false;
    this.isSettingRemoteAnswerPending = false;
    this.iceCandidateQueue = [];

    // Comprehensive public STUN + Free OpenRelay TURN servers
    this.rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        { urls: 'stun:stun.cloudflare.com:3478' },
        { urls: 'stun:global.stun.twilio.com:3478' },

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

  setUserRole(userKey) {
    // Rayo is polite (yields on collision), Nao is impolite
    this.isPolite = (userKey === 'rayo');
    console.log(`[WebRTC] Role configured: ${userKey} (isPolite: ${this.isPolite})`);
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
      console.log('[WebRTC] Local mic stream acquired');
      return this.localStream;
    } catch (err) {
      console.error('[WebRTC] Error accessing microphone:', err);
      throw err;
    }
  }

  // ─── Peer Connection (Perfect Negotiation) ────────────────────────────────

  getOrCreatePeerConnection(targetSocketId) {
    if (this.peerConnection) {
      this.targetSocketId = targetSocketId;
      return this.peerConnection;
    }

    this.targetSocketId = targetSocketId;
    this.iceCandidateQueue = [];
    const pc = new RTCPeerConnection(this.rtcConfig);

    console.log('[DEBUG] RTC CONFIG:', this.rtcConfig);
    console.log('[DEBUG] ICE gathering state:', pc.iceGatheringState);
    console.log('[DEBUG] ICE servers:', this.rtcConfig.iceServers);

    // 1. ICE candidate sender
    pc.onicecandidate = ({ candidate }) => {
      console.log('[DEBUG] ICE candidate event:', candidate);
      console.log('[DEBUG] ICE gathering state:', pc.iceGatheringState);

      if (candidate && this.targetSocketId) {
        console.log('[DEBUG] Enviando ICE candidate:', candidate.candidate);

        this.socket.emit('signal-ice-candidate', {
          targetSocketId: this.targetSocketId,
          candidate
        });
      }
    };

    pc.onicegatheringstatechange = () => {
      console.log(
        '[DEBUG] ICE gathering state changed:',
        pc.iceGatheringState
      );
    };

    // 2. Perfect Negotiation: onnegotiationneeded
    pc.onnegotiationneeded = async () => {
      if (!this.targetSocketId) return;
      try {
        console.log('[WebRTC] onnegotiationneeded triggered -> creating offer');
        this.makingOffer = true;
        await pc.setLocalDescription();
        this.socket.emit('signal-offer', {
          targetSocketId: this.targetSocketId,
          sdp: pc.localDescription
        });
      } catch (err) {
        console.error('[WebRTC] Negotiation error:', err);
      } finally {
        this.makingOffer = false;
      }
    };

    // 3. Remote track receiver
    pc.ontrack = ({ track, streams }) => {
      console.log(
        '[WebRTC] Remote track received:',
        track.kind,
        'ReadyState:',
        track.readyState
      );

      console.log('[DEBUG] PC STATE:', {
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        signalingState: pc.signalingState
      });

      console.log('[DEBUG] RECEIVERS:', pc.getReceivers().map(r => ({
        kind: r.track?.kind,
        readyState: r.track?.readyState,
        muted: r.track?.muted
      })));

      const stream = (streams && streams[0])
        ? streams[0]
        : new MediaStream([track]);

      if (this.callbacks.onRemoteStream) {
        this.callbacks.onRemoteStream(stream, track);
      }
    };

    // 4. Connection state updates
    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState);
      if (this.callbacks.onConnectionStateChange) {
        this.callbacks.onConnectionStateChange(pc.connectionState);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE connection state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed') {
        console.warn('[WebRTC] ICE failed, restarting ICE...');
        pc.restartIce();
      }
    };

    // Add current local tracks
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(t => {
        pc.addTrack(t, this.localStream);
      });
    }

    if (this.isScreenSharing && this.screenStream) {
      const vt = this.screenStream.getVideoTracks()[0];
      if (vt) pc.addTrack(vt, this.screenStream);
    }

    this.peerConnection = pc;
    return pc;
  }

  // ─── Signaling Listeners ──────────────────────────────────────────────────

  setupSignalingListeners() {
    // Incoming SDP Offer
    this.socket.on('signal-offer', async ({ senderSocketId, sdp }) => {
      this.targetSocketId = senderSocketId;
      const pc = this.getOrCreatePeerConnection(senderSocketId);

      // Make sure we have local microphone stream
      if (!this.localStream) {
        try {
          await this.initLocalMedia(false);
          if (this.localStream) {
            this.localStream.getAudioTracks().forEach(t => {
              const senders = pc.getSenders();
              const audioSender = senders.find(s => s.track && s.track.kind === 'audio');
              if (!audioSender) pc.addTrack(t, this.localStream);
            });
          }
        } catch (e) {
          console.warn('[WebRTC] Auto-mic init on offer warning:', e);
        }
      }

      const offerCollision = (sdp.type === 'offer') &&
        (this.makingOffer || pc.signalingState !== 'stable');

      this.ignoreOffer = !this.isPolite && offerCollision;
      if (this.ignoreOffer) {
        console.log('[WebRTC] Collision detected: impolite peer ignoring offer');
        return;
      }

      try {
        console.log('[WebRTC] Setting remote description (offer)...');
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        await this._drainICEQueue();

        if (sdp.type === 'offer') {
          console.log('[WebRTC] Creating and sending answer...');

          console.log('[DEBUG] Antes do setLocalDescription');
          await pc.setLocalDescription();
          console.log('[DEBUG] Depois do setLocalDescription');

          console.log('[DEBUG] Local description:', pc.localDescription);

          console.log('[DEBUG] Enviando signal-answer...');
          this.socket.emit('signal-answer', {
            targetSocketId: senderSocketId,
            sdp: pc.localDescription
          });
          console.log('[DEBUG] signal-answer enviado');
        }
      } catch (err) {
        console.error('[WebRTC] Error handling offer:', err);
      }
    });

    // Incoming SDP Answer
    this.socket.on('signal-answer', async ({ sdp }) => {
      if (!this.peerConnection) return;
      try {
        console.log('[WebRTC] Setting remote description (answer)...');
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        await this._drainICEQueue();
      } catch (err) {
        if (!this.ignoreOffer) {
          console.error('[WebRTC] Error setting answer:', err);
        }
      }
    });

    // Incoming ICE Candidate
    this.socket.on('signal-ice-candidate', async ({ candidate }) => {
      await this.handleIceCandidate(candidate);
    });
  }

  async handleIceCandidate(candidate) {
    if (!this.peerConnection || !this.peerConnection.remoteDescription) {
      this.iceCandidateQueue.push(candidate);
      return;
    }
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      if (!this.ignoreOffer) {
        console.warn('[WebRTC] ICE candidate add error:', err);
      }
    }
  }

  async _drainICEQueue() {
    if (!this.peerConnection || !this.peerConnection.remoteDescription) return;
    while (this.iceCandidateQueue.length > 0) {
      const c = this.iceCandidateQueue.shift();
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(c));
      } catch (e) {
        console.warn('[WebRTC] ICE candidate drain error:', e);
      }
    }
  }

  // ─── Public Initiate Call ─────────────────────────────────────────────────

  async initiateCall(targetSocketId) {
    this.targetSocketId = targetSocketId;
    console.log('[WebRTC] initiateCall ->', targetSocketId);

    if (!this.localStream) {
      try {
        await this.initLocalMedia(false);
      } catch (e) {
        console.warn('[WebRTC] Mic init before call warning:', e);
      }
    }

    const pc = this.getOrCreatePeerConnection(targetSocketId);

    // Make sure local audio track is in pc
    if (this.localStream) {
      const senders = pc.getSenders();
      const hasAudio = senders.some(s => s.track && s.track.kind === 'audio');
      if (!hasAudio) {
        this.localStream.getAudioTracks().forEach(t => pc.addTrack(t, this.localStream));
      }
    }

    // Trigger offer
    try {
      this.makingOffer = true;
      await pc.setLocalDescription();
      this.socket.emit('signal-offer', {
        targetSocketId,
        sdp: pc.localDescription
      });
      console.log('[WebRTC] Initial offer sent');
    } catch (err) {
      console.error('[WebRTC] Error initiating call offer:', err);
    } finally {
      this.makingOffer = false;
    }
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
    console.log('[WebRTC] sourceId recebido:', sourceId);
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
        // Standard browser getDisplayMedia
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always', frameRate: { ideal: 30, max: 60 } },
          audio: false
        });
      }

      this.screenStream = stream;
      this.isScreenSharing = true;
      console.log('[WebRTC] Screen captured successfully');

      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.onended = () => this.stopScreenShare();

      if (this.targetSocketId) {
        const pc = this.getOrCreatePeerConnection(this.targetSocketId);
        const senders = pc.getSenders();
        const videoSender = senders.find(s => s.track && s.track.kind === 'video');

        if (videoSender) {
          await videoSender.replaceTrack(videoTrack);
        } else {
          pc.addTrack(videoTrack, stream);
          // onnegotiationneeded will fire and renegotiate automatically
        }
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

    if (this.peerConnection) {
      const senders = this.peerConnection.getSenders();
      const videoSender = senders.find(s => s.track && s.track.kind === 'video');
      if (videoSender) {
        this.peerConnection.removeTrack(videoSender);
        // onnegotiationneeded will fire and renegotiate automatically
      }
    }

    if (this.callbacks.onScreenShareStopped) {
      this.callbacks.onScreenShareStopped();
    }
  }

  // ─── Reconnect / Teardown ─────────────────────────────────────────────────

  resetPeerConnection() {
    if (this.peerConnection) {
      this.peerConnection.ontrack = null;
      this.peerConnection.onicecandidate = null;
      this.peerConnection.onconnectionstatechange = null;
      this.peerConnection.oniceconnectionstatechange = null;
      this.peerConnection.onnegotiationneeded = null;
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
