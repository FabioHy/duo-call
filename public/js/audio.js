// Voice Activity Detection (VAD) & Ambient Sound Generator

class VoiceDetector {
  constructor(onSpeakingChange) {
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.animationFrame = null;
    this.isSpeaking = false;
    this.threshold = 0.045; // Sensitivity
    this.silenceTimeout = null;
    this.onSpeakingChange = onSpeakingChange;
  }

  start(mediaStream) {
    this.stop();
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.4;

      this.source = this.audioContext.createMediaStreamSource(mediaStream);
      this.source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!this.analyser) return;

        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength / 255;

        if (average > this.threshold) {
          if (!this.isSpeaking) {
            this.isSpeaking = true;
            this.onSpeakingChange(true);
          }
          if (this.silenceTimeout) {
            clearTimeout(this.silenceTimeout);
            this.silenceTimeout = null;
          }
        } else {
          if (this.isSpeaking && !this.silenceTimeout) {
            this.silenceTimeout = setTimeout(() => {
              this.isSpeaking = false;
              this.onSpeakingChange(false);
              this.silenceTimeout = null;
            }, 350); // Small grace period to prevent flickering
          }
        }

        this.animationFrame = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (e) {
      console.warn('Voice activity detection error:', e);
    }
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.isSpeaking) {
      this.isSpeaking = false;
      this.onSpeakingChange(false);
    }
  }
}

// Procedural Ambient Background Sounds (Rain, Lo-Fi, Fireplace)
class AmbientPlayer {
  constructor() {
    this.ctx = null;
    this.currentTrack = null;
    this.nodes = [];
    this.isPlaying = false;
    this.volume = 0.35;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  stop() {
    this.nodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        node.disconnect();
      } catch (e) {}
    });
    this.nodes = [];
    this.isPlaying = false;
    this.currentTrack = null;
  }

  playRain() {
    this.stop();
    this.init();
    this.isPlaying = true;
    this.currentTrack = 'rain';

    // Pink/Brown noise buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to sound like rain on window
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, this.ctx.currentTime);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(this.volume * 0.5, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    whiteNoise.start();
    this.nodes.push(whiteNoise, filter, gainNode);
  }

  playFireplace() {
    this.stop();
    this.init();
    this.isPlaying = true;
    this.currentTrack = 'fire';

    // Brown noise with bandpass
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(this.volume * 0.6, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    noise.start();
    this.nodes.push(noise, filter, gainNode);
  }

  playLofi() {
    this.stop();
    this.init();
    this.isPlaying = true;
    this.currentTrack = 'lofi';

    // Dreamy 7th chord drone synth
    const chords = [261.63, 329.63, 392.00, 493.88]; // Cmaj7
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(this.volume * 0.15, this.ctx.currentTime);
    gainNode.connect(this.ctx.destination);

    chords.forEach(freq => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.connect(gainNode);
      osc.start();
      this.nodes.push(osc);
    });

    this.nodes.push(gainNode);
  }
}

const ambientPlayer = new AmbientPlayer();
