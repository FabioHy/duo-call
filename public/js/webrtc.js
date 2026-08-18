// WebRTC Connection and Media Stream Manager

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

    this.rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' }
      ]
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

  // Create or retrieve existing RTCPeerConnection
  getOrCreatePeerConnection(targetSocketId) {
    if (this.peerConnection) {
      return this.peerConnection;
    }

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
      console.log('[WebRTC] Received remote track:', event.track.kind);
      if (this.callbacks.onRemoteStream) {
        this.callbacks.onRemoteStream(event.streams[0], event.track);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection State:', pc.connectionState);
      if (this.callbacks.onConnectionStateChange) {
        this.callbacks.onConnectionStateChange(pc.connectionState);
      }
    };

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream);
      });
    }

    this.peerConnection = pc;
    return pc;
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
      console.error('Error creating WebRTC offer:', err);
    }
  }

  // Handle incoming Offer
  async handleOffer(senderSocketId, sdp) {
    this.targetSocketId = senderSocketId;
    const pc = this.getOrCreatePeerConnection(senderSocketId);

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      this.socket.emit('signal-answer', {
        targetSocketId: senderSocketId,
        sdp: pc.localDescription
      });
    } catch (err) {
      console.error('Error handling WebRTC offer:', err);
    }
  }

  // Handle incoming Answer
  async handleAnswer(sdp) {
    if (!this.peerConnection) return;
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    } catch (err) {
      console.error('Error setting remote description from answer:', err);
    }
  }

  // Handle ICE Candidate
  async handleIceCandidate(candidate) {
    if (!this.peerConnection) return;
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('Error adding ICE candidate:', err);
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

    this.socket.on('signal-renegotiate', async ({ senderSocketId }) => {
      if (this.targetSocketId) {
        await this.initiateCall(this.targetSocketId);
      }
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

  // Toggle Camera
  async toggleCamera() {
    if (this.isVideoOn) {
      const videoTrack = this.localStream?.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.stop();
        this.localStream.removeTrack(videoTrack);
      }
      this.isVideoOn = false;

      if (this.peerConnection && !this.isScreenSharing) {
        const sender = this.peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
          this.peerConnection.removeTrack(sender);
          this.renegotiate();
        }
      }
      return false;
    } else {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        const videoTrack = newStream.getVideoTracks()[0];

        if (this.localStream) {
          this.localStream.addTrack(videoTrack);
        } else {
          this.localStream = newStream;
        }

        this.isVideoOn = true;

        if (this.peerConnection && !this.isScreenSharing) {
          const sender = this.peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          } else {
            this.peerConnection.addTrack(videoTrack, this.localStream);
            this.renegotiate();
          }
        }

        return true;
      } catch (err) {
        console.error('Failed to enable camera:', err);
        return false;
      }
    }
  }

  // Start Screen Share with a specific desktop source ID (Electron) or generic (Browser)
  async startScreenShareWithSource(sourceId = null, withAudio = true) {
    try {
      let stream;
      if (sourceId) {
        // Electron desktopCapturer stream
        stream = await navigator.mediaDevices.getUserMedia({
          audio: withAudio ? {
            mandatory: {
              chromeMediaSource: 'desktop'
            }
          } : false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sourceId,
              minWidth: 1280,
              maxWidth: 1920,
              minHeight: 720,
              maxHeight: 1080,
              minFrameRate: 30,
              maxFrameRate: 60
            }
          }
        });
      } else {
        // Standard getDisplayMedia
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

      if (this.peerConnection) {
        const sender = this.peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenVideoTrack);
        } else {
          this.peerConnection.addTrack(screenVideoTrack, this.screenStream);
          this.renegotiate();
        }
      }

      return this.screenStream;
    } catch (err) {
      console.error('Error starting screen share with source:', err);
      this.isScreenSharing = false;
      return null;
    }
  }

  // Stop Screen Sharing
  stopScreenShare() {
    if (!this.isScreenSharing) return;

    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    this.isScreenSharing = false;

    if (this.peerConnection) {
      const sender = this.peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
      const cameraTrack = this.isVideoOn ? this.localStream?.getVideoTracks()[0] : null;

      if (sender) {
        if (cameraTrack) {
          sender.replaceTrack(cameraTrack);
        } else {
          this.peerConnection.removeTrack(sender);
          this.renegotiate();
        }
      }
    }

    if (this.callbacks.onScreenShareStopped) {
      this.callbacks.onScreenShareStopped();
    }
  }

  renegotiate() {
    if (this.targetSocketId) {
      this.socket.emit('signal-renegotiate', { targetSocketId: this.targetSocketId });
      this.initiateCall(this.targetSocketId);
    }
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
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.targetSocketId = null;
    this.isScreenSharing = false;
    this.isVideoOn = false;
    this.isMuted = false;
  }
}
