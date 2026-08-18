// WebRTC Connection and Media Stream Manager
// Strategy for screen share: rebuild the peer connection completely so the
// remote peer always receives a fresh ontrack event (replaceTrack does NOT
// fire ontrack on the receiver and causes black screen).

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

    // Queue for ICE candidates that arrive before setRemoteDescription
    this.iceCandidateQueue = [];

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

  // ─── Local Media ──────────────────────────────────────────────────────────

  async initLocalMedia(video = false) {
    try {
      if (this.localStream) {
        this.localStream.getTracks().forEach(t => t.stop());
      }
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: video ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false
      });
      this.isVideoOn = video;
      return this.localStream;
    } catch (err) {
      console.error('[WebRTC] Error accessing microphone:', err);
      throw err;
    }
  }

  // ─── Peer Connection Management ───────────────────────────────────────────

  // Tear down any existing connection and create a brand-new one.
  // Returns the new RTCPeerConnection with all event handlers wired.
  _buildFreshPeerConnection(targetSocketId) {
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
        this.socket.emit('signal-ice-candidate', {
          targetSocketId: this.targetSocketId,
          candidate
        });
      }
    };

    pc.ontrack = ({ track, streams }) => {
      console.log('[WebRTC] ontrack:', track.kind, track.readyState);
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
      if (pc.iceConnectionState === 'failed') pc.restartIce();
    };

    this.peerConnection = pc;
    return pc;
  }

  // Add all the local tracks that should be sent right now.
  _addTracksTo(pc) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(t => {
        pc.addTrack(t, this.localStream);
      });
    }
    if (this.isScreenSharing && this.screenStream) {
      const vt = this.screenStream.getVideoTracks()[0];
      if (vt) pc.addTrack(vt, this.screenStream);
    }
  }

  // ─── ICE candidate queue ─────────────────────────────────────────────────

  async _drainIceCandidateQueue() {
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

  // ─── Offer / Answer flow ──────────────────────────────────────────────────

  // Public: initiate a call (as the offerer).
  async initiateCall(targetSocketId) {
    this.targetSocketId = targetSocketId;

    // If no peer connection yet, build one fresh and add tracks.
    // If one already exists (renegotiation), just create a new offer on it.
    if (!this.peerConnection) {
      this._buildFreshPeerConnection(targetSocketId);
      this._addTracksTo(this.peerConnection);
    }

    const pc = this.peerConnection;
    try {
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await pc.setLocalDescription(offer);
      this.socket.emit('signal-offer', { targetSocketId, sdp: pc.localDescription });
    } catch (err) {
      console.error('[WebRTC] Error creating offer:', err);
    }
  }

  // Receive an offer, build answer, send it back.
  async handleOffer(senderSocketId, sdp) {
    this.targetSocketId = senderSocketId;

    // Always rebuild the peer connection when we receive an offer.
    // This guarantees fresh ontrack events for both initial connection
    // and screen-share renegotiations.
    const pc = this._buildFreshPeerConnection(senderSocketId);
    this._addTracksTo(pc);

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      await this._drainIceCandidateQueue();
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.socket.emit('signal-answer', { targetSocketId: senderSocketId, sdp: pc.localDescription });
    } catch (err) {
      console.error('[WebRTC] Error handling offer:', err);
    }
  }

  async handleAnswer(sdp) {
    if (!this.peerConnection) return;
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      await this._drainIceCandidateQueue();
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
      console.error('[WebRTC] ICE candidate error:', err);
    }
  }

  // ─── Signaling listeners ──────────────────────────────────────────────────

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
  // On start: capture screen → rebuild PC with audio+video → send offer
  // On stop:  tear down tracks → rebuild PC with audio only → send offer
  // The receiver always gets a fresh ontrack event because the PC is rebuilt.

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
          // System audio unsupported — retry video only
          stream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: false
          });
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

      // Auto-stop when user clicks "Stop sharing" in the OS dialog
      stream.getVideoTracks()[0].onended = () => this.stopScreenShare();

      // Rebuild peer connection with screen video included and send fresh offer
      if (this.targetSocketId) {
        const pc = this._buildFreshPeerConnection(this.targetSocketId);
        this._addTracksTo(pc); // adds audio + screen video
        const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
        await pc.setLocalDescription(offer);
        this.socket.emit('signal-offer', { targetSocketId: this.targetSocketId, sdp: pc.localDescription });
      }

      return this.screenStream;
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

    // Rebuild PC with audio only and send fresh offer
    if (this.targetSocketId) {
      (async () => {
        try {
          const pc = this._buildFreshPeerConnection(this.targetSocketId);
          this._addTracksTo(pc); // audio only (isScreenSharing is now false)
          const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
          await pc.setLocalDescription(offer);
          this.socket.emit('signal-offer', { targetSocketId: this.targetSocketId, sdp: pc.localDescription });
        } catch (err) {
          console.error('[WebRTC] Error rebuilding after stop screen share:', err);
        }
      })();
    }

    if (this.callbacks.onScreenShareStopped) {
      this.callbacks.onScreenShareStopped();
    }
  }

  // ─── Cleanup ──────────────────────────────────────────────────────────────

  close() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(t => t.stop());
      this.screenStream = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
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
