// Duo - Midnight Navy Theme with 2-User Slot Authentication (Nao & Rayo)

document.addEventListener('DOMContentLoaded', () => {
  const electronAPI = window.electronAPI;
  document.getElementById('btnWindowMinimize')?.addEventListener('click', () => electronAPI?.minimizeWindow());
  document.getElementById('btnWindowMaximize')?.addEventListener('click', () => electronAPI?.toggleMaximizeWindow());
  document.getElementById('btnWindowClose')?.addEventListener('click', () => electronAPI?.closeWindow());

  const themeOptions = document.querySelectorAll('.theme-option');
  const rgbThemeOption = document.getElementById('themeRgbToggle');
  const voidThemeOption = document.getElementById('themeVoidToggle');
  const supernovaThemeOption = document.getElementById('themeSupernovaToggle');
  const themeSwitcher = document.getElementById('themeSwitcher');
  const themeAutoToggle = document.getElementById('themeAutoToggle');
  const themeLiveClock = document.getElementById('themeLiveClock');
  const voidFinaleOverlay = document.getElementById('voidFinaleOverlay');
  const voidFinaleMessage = document.querySelector('.void-finale-message');
  const voidFinaleParticles = document.getElementById('voidFinaleParticles');
  const voidFragmentLayer = document.getElementById('voidFragmentLayer');
  const eclosaoRiftCore = document.getElementById('eclosaoRiftCore');
  const eclosaoTransition = document.getElementById('eclosaoTransition');
  const eclosaoEmbers = document.getElementById('eclosaoEmbers');
  const rgbCutsceneOverlay = document.getElementById('rgbCutsceneOverlay');
  const rgbGlitter = document.getElementById('rgbGlitter');
  const rgbMusicVolume = document.getElementById('rgbMusicVolume');
  const musicControls = document.getElementById('musicControls');
  // Playlist RGB: novas músicas podem ser adicionadas aqui no futuro.
  const rgbPlaylist = [{ id: 'intro', src: 'assets/rgb-cutscene.mp3', audio: new Audio('assets/rgb-cutscene.mp3') }];
  const activeRgbTrack = rgbPlaylist[0];
  const rgbMusic = activeRgbTrack.audio;
  rgbMusic.loop = true;
  rgbMusic.volume = Number(rgbMusicVolume.value) / 100;
  const voidCutsceneMusic = new Audio('assets/void-cutscene.mp3');
  voidCutsceneMusic.loop = true;
  voidCutsceneMusic.volume = rgbMusic.volume;
  const eclosaoMusic = new Audio('assets/eclosao-cutscene.mp3');
  eclosaoMusic.loop = true;
  eclosaoMusic.volume = rgbMusic.volume;
  rgbMusicVolume.addEventListener('input', () => {
    rgbMusic.volume = Number(rgbMusicVolume.value) / 100;
    voidCutsceneMusic.volume = rgbMusic.volume;
    eclosaoMusic.volume = rgbMusic.volume;
  });
  const revealMusicControls = () => {
    const isFirstAppearance = localStorage.getItem('duo_volume_tutorial_seen') !== '1';
    musicControls.classList.remove('hidden');
    if (isFirstAppearance) {
      localStorage.setItem('duo_volume_tutorial_seen', '1');
      window.setTimeout(() => showToast('Agora você pode configurar o volume'), 220);
    }
  };
  const startRgbMusic = () => {
    revealMusicControls();
    rgbMusic.currentTime = 0;
    rgbMusic.play().catch(() => {});
  };
  const clearEclosaoEmbers = () => {
    eclosaoEmbers?.classList.add('hidden');
    eclosaoEmbers?.replaceChildren();
  };
  const clearVoidFinaleParticles = () => {
    voidFinaleParticles?.replaceChildren();
  };
  const createVoidFinaleParticles = () => {
    if (!voidFinaleParticles) return;
    clearVoidFinaleParticles();
    const particleCount = 52;
    for (let index = 0; index < particleCount; index += 1) {
      const particle = document.createElement('span');
      const size = 2 + Math.random() * 4.5;
      particle.className = 'void-finale-particle';
      particle.style.setProperty('--particle-size', `${size}px`);
      particle.style.setProperty('--particle-radius', `${Math.max(12, 8 + Math.random() * 44)}vmin`);
      particle.style.setProperty('--particle-edge-radius', `${90 + Math.random() * 20}vmin`);
      particle.style.setProperty('--particle-angle', `${Math.random() * 360}deg`);
      particle.style.setProperty('--particle-duration', `${4.8 + Math.random() * 5.8}s`);
      particle.style.setProperty('--particle-delay', `${index * 0.16 + Math.random() * 0.35}s`);
      particle.style.setProperty('--particle-opacity', `${0.48 + Math.random() * 0.45}`);
      voidFinaleParticles.appendChild(particle);
    }
  };
  const createEclosaoEmbers = () => {
    if (!eclosaoEmbers) return;
    eclosaoEmbers.replaceChildren();
    eclosaoEmbers.classList.remove('hidden');
    for (let index = 0; index < 78; index += 1) {
      const ember = document.createElement('span');
      const duration = 5.4 + Math.random() * 8.5;
      ember.className = 'eclosao-ember';
      ember.style.left = `${Math.random() * 100}%`;
      ember.style.top = `${Math.random() * 100}%`;
      ember.style.setProperty('--ember-size', `${2 + Math.random() * 5}px`);
      ember.style.setProperty('--ember-duration', `${duration}s`);
      ember.style.setProperty('--ember-delay', `${-Math.random() * duration}s`);
      ember.style.setProperty('--ember-dx', `${-90 + Math.random() * 180}px`);
      ember.style.setProperty('--ember-dy', `${-100 + Math.random() * 200}px`);
      ember.style.setProperty('--ember-dx-half', `${-45 + Math.random() * 90}px`);
      ember.style.setProperty('--ember-dy-half', `${-50 + Math.random() * 100}px`);
      ember.style.setProperty('--ember-tilt', `${-75 + Math.random() * 150}deg`);
      ember.style.setProperty('--ember-brightness', `${.72 + Math.random() * .5}`);
      eclosaoEmbers.appendChild(ember);
    }
  };
  const playRgbCutscene = () => {
    startRgbMusic();
    voidCutsceneMusic.pause();
    voidCutsceneMusic.currentTime = 0;
    rgbGlitter.replaceChildren();
    for (let index = 0; index < 30; index += 1) {
      const star = document.createElement('span');
      star.className = 'rgb-glitter-star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 1.8}s`;
      star.style.animationDuration = `${2.8 + Math.random() * 2.4}s`;
      star.style.setProperty('--glitter-size', `${2 + Math.random() * 3}px`);
      rgbGlitter.appendChild(star);
    }
    rgbCutsceneOverlay.classList.remove('hidden');
    window.setTimeout(() => rgbCutsceneOverlay.classList.add('finished'), 4600);
  };
  const themeSliderThumb = document.getElementById('themeSliderThumb');
  const coupleArtCard = document.querySelector('.couple-art-card');
  const sidebarVoidTrigger = document.getElementById('sidebarVoidTrigger');
  const sidebarEclosaoTrigger = document.getElementById('sidebarEclosaoTrigger');
  const sidebarSpecialThemeMenu = document.getElementById('sidebarSpecialThemeMenu');
  const sidebarSpecialThemeOptions = document.querySelectorAll('[data-special-theme]');
  const sidebarLocalTheme = document.getElementById('sidebarLocalTheme');
  const sidebarPartnerTheme = document.getElementById('sidebarPartnerTheme');
  let voidUnlocked = false;
  let voidClickCount = 0;
  let voidLocked = false;
  let myUserKey = null;
  let socket = null;
  let currentThemeStatus = 'night';
  let currentThemeVoidLocked = false;
  let supernovaRevealTimer = null;
  let eclosaoEruptionTimer = null;
  let eclosaoHoldFrame = null;
  let eclosaoHoldStartedAt = 0;
  let eclosaoHoldActive = false;
  let eclosaoHoldCompleted = false;
  let eclosaoHoldParticles = [];
  let voidCardFallen = false;
  let voidFragmentChallengeActive = false;
  let voidFragmentsCollected = 0;
  const VOID_FRAGMENT_TOTAL = 30;
  const VOID_FRAGMENT_TARGET = 18;

  coupleArtCard?.addEventListener('click', () => {
    if (!document.body.classList.contains('theme-rgb') || voidCardFallen || voidLocked) return;
    voidCardFallen = true;
    const sidebarVoidLabel = sidebarVoidTrigger?.querySelector('strong');
    const sidebarVoidHint = sidebarVoidTrigger?.querySelector('small');
    if (sidebarVoidLabel) sidebarVoidLabel.textContent = '???';
    if (sidebarVoidHint) sidebarVoidHint.textContent = '';
    sidebarVoidTrigger?.classList.add('is-revealed');
    coupleArtCard.classList.add('void-card-collapse');
  });
  coupleArtCard?.addEventListener('animationend', event => {
    if (event.animationName !== 'voidArtCardCollapse') return;
    coupleArtCard.classList.add('void-card-fallen');
  });

  const typeVoidMessage = () => {
    const message = 'Você não deveria ter feito isso.';
    voidFinaleMessage.textContent = '';
    let index = 0;
    const typeNext = () => {
      if (index >= message.length) return;
      voidFinaleMessage.textContent += message[index];
      if (message[index] !== ' ') {
        impactAudioContext ||= new AudioContext();
        const tone = impactAudioContext.createOscillator();
        const gain = impactAudioContext.createGain();
        tone.type = 'triangle';
        tone.frequency.value = 125 + (index % 4) * 18;
        gain.gain.setValueAtTime(0.026, impactAudioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, impactAudioContext.currentTime + 0.085);
        tone.connect(gain).connect(impactAudioContext.destination);
        tone.start();
        tone.stop(impactAudioContext.currentTime + 0.09);
      }
      index += 1;
      window.setTimeout(typeNext, message[index - 1] === '.' ? 900 : 145);
    };
    window.setTimeout(typeNext, 1500);
  };
  rgbThemeOption.addEventListener('click', () => {
    if (voidLocked || !rgbUnlocked || specialThemesSealed) return;
    setAutomaticMode(false);
    rgbArmed = true;
    themeSwitcher.style.setProperty('--theme-slider-position', '0%');
    themeSwitcher.classList.add('rgb-reaching');
    startRgbMode();
  });
  voidThemeOption.addEventListener('click', () => {
    if (voidLocked || specialThemesSealed) return;
    if (!voidUnlocked) {
      voidClickCount += 1;
      voidThemeOption.querySelector('span').textContent = `??? ${voidClickCount}/15`;
      const sidebarVoidLabel = sidebarVoidTrigger?.querySelector('strong');
      if (sidebarVoidLabel) sidebarVoidLabel.textContent = `??? ${voidClickCount}/15`;
      document.body.classList.add('void-click-cracking');
      document.body.style.setProperty('--void-crack-hole', `${Math.max(18, 52 - voidClickCount * 2.25)}%`);
      document.body.style.setProperty('--void-crack-overlay-opacity', `${0.42 + voidClickCount * 0.035}`);
      document.body.classList.remove('void-click-shake');
      void document.body.offsetWidth;
      document.body.classList.add('void-click-shake');
      window.setTimeout(() => document.body.classList.remove('void-click-shake'), 360);
      playVoidCrackSound(voidClickCount);
      voidThemeOption.classList.add('void-cracking');
      voidThemeOption.style.setProperty('--void-crack', `${voidClickCount * 1.4}px`);
      voidThemeOption.style.setProperty('--void-crack-opacity', `${Math.min(1, voidClickCount / 15)}`);
      voidThemeOption.style.setProperty('--void-spread', `${8 + voidClickCount * 8}px`);
      voidThemeOption.style.setProperty('--void-crack-scale', `${1 + voidClickCount * 0.06}`);
      if (voidClickCount >= 15) {
        unlockVoidTheme();
        stopRgbMode();
        document.body.classList.add('void-click-cracking');
        document.body.style.setProperty('--void-crack-hole', '18%');
        document.body.style.setProperty('--void-crack-overlay-opacity', '.95');
        document.body.classList.add('theme-void');
        themeLiveClock.textContent = 'VOID';
        revealMusicControls();
        rgbMusic.pause();
        rgbMusic.currentTime = 0;
        eclosaoMusic.pause();
        eclosaoMusic.currentTime = 0;
        createVoidFinaleParticles();
        voidFinaleOverlay.classList.remove('hidden', 'fading-out');
        voidCutsceneMusic.currentTime = 0;
        voidCutsceneMusic.play().catch(() => {});
        typeVoidMessage();
        impactAudioContext ||= new AudioContext();
        const voidOsc = impactAudioContext.createOscillator();
        const voidGain = impactAudioContext.createGain();
        voidOsc.type = 'sawtooth';
        voidOsc.frequency.value = 42;
        voidGain.gain.setValueAtTime(0.18, impactAudioContext.currentTime);
        voidGain.gain.exponentialRampToValueAtTime(0.001, impactAudioContext.currentTime + 1.2);
        voidOsc.connect(voidGain).connect(impactAudioContext.destination);
        voidOsc.start();
        voidOsc.stop(impactAudioContext.currentTime + 1.25);
        window.setTimeout(() => {
          voidLocked = true;
          document.body.classList.remove('void-click-cracking');
          document.body.style.removeProperty('--void-crack-hole');
          document.body.style.removeProperty('--void-crack-overlay-opacity');
          document.body.classList.add('theme-void-locked');
          setThemeStatus('void', true);
          rgbGlitter.querySelectorAll('.rgb-glitter-star').forEach((star, index) => {
            star.style.setProperty('--void-orbit-angle', `${(index * 137.5) % 360}deg`);
            star.style.setProperty('--void-orbit-radius', `${34 + (index % 5) * 13}vmax`);
            star.style.setProperty('--void-orbit-duration', `${5.2 + (index % 6) * 1.15}s`);
          });
          voidFinaleOverlay.classList.add('fading-out');
          window.setTimeout(() => {
            voidFinaleOverlay.classList.add('hidden');
            voidFinaleOverlay.classList.remove('fading-out');
            clearVoidFinaleParticles();
          }, 1400);
          themeAutoToggle.disabled = true;
          rgbThemeOption.classList.add('locked');
          voidThemeOption.classList.add('locked');
          sidebarVoidTrigger?.classList.add('is-revealed', 'is-awakened');
          const sidebarVoidLabel = sidebarVoidTrigger?.querySelector('strong');
          const sidebarVoidHint = sidebarVoidTrigger?.querySelector('small');
          if (sidebarVoidLabel) sidebarVoidLabel.textContent = 'VOID';
          if (sidebarVoidHint) sidebarVoidHint.textContent = 'O vazio despertou';
          btnPillMute.disabled = true;
          btnPillMute.classList.add('void-sealed');
          btnPillMute.title = 'O VOID selou o microfone';
          btnPillShare.disabled = true;
          btnPillShare.classList.add('void-sealed');
          btnPillShare.title = 'O VOID selou o compartilhamento';
          btnPillDisconnect.disabled = true;
          btnPillDisconnect.classList.add('void-sealed');
          btnPillDisconnect.title = 'O VOID selou a saída';
          themeOptions.forEach(option => option.classList.remove('active'));
          themeSwitcher.style.pointerEvents = 'none';
          startVoidFragmentChallenge();
        }, 10800);
      }
      return;
    }
    if (rgbMode) stopRgbMode();
    eclosaoMusic.pause();
    eclosaoMusic.currentTime = 0;
    clearEclosaoEmbers();
    document.body.classList.remove('theme-rgb', 'theme-supernova', 'theme-void-locked');
    document.body.classList.add('theme-void');
    themeLiveClock.textContent = 'VOID';
    setThemeStatus('void');
    themeOptions.forEach(option => option.classList.remove('active'));
    voidThemeOption.classList.add('active');
  });
  sidebarVoidTrigger?.addEventListener('click', () => {
    if (!sidebarVoidTrigger.classList.contains('is-revealed') || voidLocked) return;
    voidThemeOption.click();
  });
  supernovaThemeOption.addEventListener('click', () => {
    if (specialThemesSealed) return;
    activateSupernovaTheme(true);
  });
  let themeTimer = null;
  let autoIntroFrame = null;
  let themeDrag = null;
  let suppressThemeClick = false;
  let dragAutoDisabled = false;
  let leftOverflowAttempts = 0;
  let countedOverflowThisDrag = false;
  let rgbMode = false;
  let rgbFrame = null;
  let rgbUnlocked = false;
  let rgbArmed = false;
  let easterEggCompleted = false;
  let impactAudioContext = null;
  let specialThemesSealed = false;
  let specialThemesUnlocked = false;

  const themePalettes = {
    morning: ['#1d1a13', '#292315', '#352c19', '#40351d', '#55451f', '#6b5726', '#fff3c4', '#eadcae', '#b9a65e', '#81733e'],
    day: ['#121a22', '#192532', '#202f3c', '#293b4a', '#344d60', '#416178', '#e8f5ff', '#d1e4ef', '#91b0c2', '#658294'],
    afternoon: ['#211c32', '#2c2440', '#342844', '#3d2e4f', '#493554', '#5a4162', '#fff5e8', '#f2dfd0', '#c3a99c', '#927b88'],
    night: ['#060913', '#0a1020', '#0d152a', '#111b33', '#15223e', '#1c2e54', '#ffffff', '#e2e8f0', '#7b8b9f', '#4e5d73']
  };
  const paletteVars = ['--bg-app', '--bg-sidebar', '--bg-card', '--bg-card-elevated', '--bg-pill', '--bg-pill-hover', '--text-header', '--text-primary', '--text-muted', '--text-dim'];
  const blendHex = (a, b, amount) => {
    const parse = value => value.match(/[\da-f]{2}/gi).map(part => parseInt(part, 16));
    const aa = parse(a), bb = parse(b);
    return `#${aa.map((value, i) => Math.round(value + (bb[i] - value) * amount).toString(16).padStart(2, '0')).join('')}`;
  };
  const applyBlendedPalette = (from, to, amount) => {
    themePalettes[from].forEach((color, index) => document.body.style.setProperty(paletteVars[index], blendHex(color, themePalettes[to][index], amount)));
  };

  const stopRgbMode = () => {
    rgbMode = false;
    rgbThemeOption.classList.remove('active');
    if (rgbFrame) cancelAnimationFrame(rgbFrame);
    rgbFrame = null;
    rgbMusic.pause();
    rgbMusic.currentTime = 0;
    document.body.classList.remove('theme-rgb');
    document.body.removeAttribute('style');
  };

  const startRgbMode = () => {
    if (rgbMode) return;
    const preserveSpecialChoices = specialThemesUnlocked && !specialThemesSealed;
    rgbUnlocked = true;
    voidUnlocked = preserveSpecialChoices;
    voidClickCount = 0;
    voidThemeOption.removeAttribute('disabled');
    voidThemeOption.disabled = false;
    voidThemeOption.classList.remove('locked');
    voidThemeOption.classList.toggle('rgb-hidden', !preserveSpecialChoices);
    voidThemeOption.classList.remove('void-cracking');
    voidThemeOption.classList.remove('special-sealed');
    voidThemeOption.querySelector('span').textContent = 'VOID';
    if (supernovaRevealTimer) window.clearTimeout(supernovaRevealTimer);
    supernovaRevealTimer = null;
    stopVoidFragmentChallenge();
    clearEclosaoEmbers();
    eclosaoMusic.pause();
    eclosaoMusic.currentTime = 0;
    supernovaThemeOption.classList.toggle('supernova-hidden', !preserveSpecialChoices);
    supernovaThemeOption.classList.remove('supernova-awakening', 'active');
    supernovaThemeOption.classList.remove('special-sealed');
    supernovaThemeOption.disabled = false;
    document.body.classList.remove('theme-supernova', 'theme-void-locked');
    document.body.classList.remove('void-click-cracking');
    document.body.style.removeProperty('--void-crack-hole');
    document.body.style.removeProperty('--void-crack-overlay-opacity');
    voidCardFallen = false;
    coupleArtCard?.classList.remove('void-card-collapse');
    coupleArtCard?.classList.remove('void-card-fallen');
    sidebarVoidTrigger?.classList.add('is-revealed');
    sidebarVoidTrigger?.classList.remove('is-awakened');
    if (!preserveSpecialChoices) sidebarEclosaoTrigger?.classList.remove('is-visible');
    const sidebarVoidLabel = sidebarVoidTrigger?.querySelector('strong');
    const sidebarVoidHint = sidebarVoidTrigger?.querySelector('small');
    if (sidebarVoidLabel) sidebarVoidLabel.textContent = '???';
    if (sidebarVoidHint) sidebarVoidHint.textContent = '';
    rgbMode = true;
    themeOptions.forEach(option => option.classList.remove('active'));
    rgbThemeOption.classList.add('active');
    document.body.classList.add('theme-rgb');
    setThemeStatus('rgb');
    setSpecialThemeMenuActive('rgb');
    if (preserveSpecialChoices) {
      rgbCutsceneOverlay.classList.add('hidden');
      rgbCutsceneOverlay.classList.remove('finished');
      startRgbMusic();
    } else {
      playRgbCutscene();
    }
    themeLiveClock.textContent = 'RGB';
    const animateRgb = (timestamp) => {
      if (!rgbMode) return;
      const hue = (timestamp / 22) % 360;
      const colors = [
        `hsl(${hue}, 42%, 7%)`, `hsl(${(hue + 28) % 360}, 38%, 11%)`,
        `hsl(${(hue + 55) % 360}, 36%, 15%)`, `hsl(${(hue + 82) % 360}, 34%, 19%)`,
        `hsl(${(hue + 110) % 360}, 38%, 23%)`, `hsl(${(hue + 138) % 360}, 40%, 28%)`,
        `hsl(${(hue + 170) % 360}, 55%, 88%)`, `hsl(${(hue + 195) % 360}, 42%, 80%)`,
        `hsl(${(hue + 220) % 360}, 35%, 60%)`, `hsl(${(hue + 245) % 360}, 30%, 42%)`
      ];
      paletteVars.forEach((variable, index) => document.body.style.setProperty(variable, colors[index]));
      rgbFrame = requestAnimationFrame(animateRgb);
    };
    rgbFrame = requestAnimationFrame(animateRgb);
  };

  const unlockRgbTheme = () => {
    if (rgbUnlocked) return;
    rgbUnlocked = true;
    easterEggCompleted = true;
    rgbThemeOption.disabled = false;
    rgbThemeOption.classList.remove('locked');
    rgbThemeOption.title = 'Tema RGB';
    voidThemeOption.removeAttribute('disabled');
    voidThemeOption.disabled = false;
    voidThemeOption.classList.remove('locked');
    voidThemeOption.classList.remove('rgb-hidden');
    voidThemeOption.title = 'Tema VOID desbloqueado';
    themeSwitcher.classList.add('rgb-unlocked');
    themeSwitcher.style.setProperty('--theme-slider-position', '0%');
    themeSwitcher.classList.add('rgb-reaching');
  };

  const unlockVoidTheme = () => {
    if (voidUnlocked) return;
    voidUnlocked = true;
    voidThemeOption.disabled = false;
    voidThemeOption.classList.remove('locked');
    voidThemeOption.title = 'Tema VOID';
  };

  const setSpecialThemeMenuActive = theme => {
    sidebarSpecialThemeOptions.forEach(option => {
      option.classList.toggle('active', option.dataset.specialTheme === theme);
    });
  };

  const updateSpecialThemesSeal = sealed => {
    specialThemesSealed = sealed;
    specialThemesUnlocked = !sealed;
    document.body.classList.add('special-sidebar-only');
    themeSwitcher.classList.toggle('special-themes-sealed', sealed);
    sidebarSpecialThemeMenu?.classList.toggle('is-visible', !sealed);

    rgbThemeOption.disabled = sealed;
    rgbThemeOption.classList.toggle('locked', sealed);
    rgbThemeOption.classList.remove('active');
    rgbThemeOption.title = sealed ? 'Os temas especiais estão selados' : 'Tema RGB';

    voidThemeOption.disabled = sealed;
    voidThemeOption.classList.toggle('locked', sealed);
    voidThemeOption.classList.toggle('special-sealed', sealed);
    voidThemeOption.classList.remove('rgb-hidden');
    voidThemeOption.title = sealed ? 'Os temas especiais estão selados' : 'Tema VOID';

    supernovaThemeOption.disabled = sealed;
    supernovaThemeOption.classList.toggle('special-sealed', sealed);
    supernovaThemeOption.classList.remove('supernova-hidden');
    supernovaThemeOption.title = sealed ? 'Os temas especiais estão selados' : 'Tema Eclosão';

    const label = sidebarEclosaoTrigger?.querySelector('strong');
    const hint = sidebarEclosaoTrigger?.querySelector('small');
    if (sealed) {
      sidebarEclosaoTrigger?.classList.add('is-visible', 'is-special-unlock');
      setSpecialThemeMenuActive('');
      if (label) label.textContent = 'ECLOSÃO';
      if (hint) hint.textContent = 'Clique para reabrir os temas';
    } else {
      sidebarEclosaoTrigger?.classList.remove('is-visible', 'is-special-unlock');
      sidebarEclosaoTrigger?.style.removeProperty('--special-unlock-progress');
      if (label) label.textContent = 'ECLOSÃO';
      if (hint) hint.textContent = 'A estrela nasceu';
    }
  };

  const finishSpecialThemesUnlock = () => {
    if (!specialThemesSealed) return;
    updateSpecialThemesSeal(false);
    rgbArmed = true;
    showToast('Os três temas especiais foram desbloqueados');
  };
  sidebarEclosaoTrigger?.addEventListener('click', () => {
    if (specialThemesSealed) {
      finishSpecialThemesUnlock();
      return;
    }
    activateSupernovaTheme(true);
  });
  sidebarSpecialThemeOptions.forEach(option => {
    option.addEventListener('click', () => {
      if (specialThemesSealed) return;
      const selectedTheme = option.dataset.specialTheme;
      setAutomaticMode(false);
      if (selectedTheme === 'rgb') {
        rgbArmed = true;
        themeSwitcher.style.setProperty('--theme-slider-position', '0%');
        startRgbMode();
      } else if (selectedTheme === 'void') {
        voidUnlocked = true;
        voidThemeOption.click();
        setSpecialThemeMenuActive('void');
      } else if (selectedTheme === 'supernova') {
        activateSupernovaTheme(true);
      }
    });
  });

  const revealEclosaoButton = () => {
    eclosaoRiftCore?.classList.add('is-visible');
    supernovaThemeOption.classList.add('supernova-hidden');
    supernovaThemeOption.classList.remove('supernova-awakening');
    supernovaThemeOption.title = 'Liberar a Eclosão';
  };

  const clearEclosaoHoldParticles = () => {
    eclosaoHoldParticles.forEach(particle => particle.remove());
    eclosaoHoldParticles = [];
  };

  const createEclosaoHoldParticles = () => {
    clearEclosaoHoldParticles();
    const particleCount = 34;
    for (let index = 0; index < particleCount; index += 1) {
      const edge = index % 4;
      const left = edge === 0 ? 2 + Math.random() * 22 : edge === 1 ? 76 + Math.random() * 22 : Math.random() * 100;
      const top = edge === 0 ? Math.random() * 100 : edge === 1 ? Math.random() * 100 : edge === 2 ? 2 + Math.random() * 22 : 76 + Math.random() * 22;
      const particle = document.createElement('span');
      particle.className = 'eclosao-hold-particle';
      particle.setAttribute('aria-hidden', 'true');
      particle.style.left = `${left}%`;
      particle.style.top = `${top}%`;
      particle.style.setProperty('--particle-size', `${2 + Math.random() * 5}px`);
      particle.style.setProperty('--particle-pull-x', `${(50 - left) * window.innerWidth / 100}px`);
      particle.style.setProperty('--particle-pull-y', `${(50 - top) * window.innerHeight / 100}px`);
      particle.style.setProperty('--particle-duration', `${1.25 + Math.random() * 1.65}s`);
      particle.style.setProperty('--particle-delay', `${Math.random() * 1.75}s`);
      particle.style.setProperty('--particle-angle', `${Math.random() * 360}deg`);
      voidFragmentLayer.appendChild(particle);
      eclosaoHoldParticles.push(particle);
    }
  };

  const stopVoidFragmentChallenge = () => {
    if (supernovaRevealTimer) window.clearTimeout(supernovaRevealTimer);
    if (eclosaoEruptionTimer) window.clearTimeout(eclosaoEruptionTimer);
    if (eclosaoHoldFrame) window.cancelAnimationFrame(eclosaoHoldFrame);
    supernovaRevealTimer = null;
    eclosaoEruptionTimer = null;
    eclosaoHoldFrame = null;
    eclosaoHoldActive = false;
    eclosaoHoldCompleted = false;
    voidFragmentChallengeActive = false;
    voidFragmentsCollected = 0;
    voidFragmentLayer.classList.add('hidden');
    voidFragmentLayer.classList.remove('is-complete', 'is-charging', 'is-holding-eclosao', 'is-erupting-eclosao');
    eclosaoRiftCore?.classList.remove('is-visible', 'is-holding', 'is-eclipsing');
    eclosaoRiftCore?.style.setProperty('--eclosao-hold-progress', '0');
    eclosaoRiftCore?.style.setProperty('--eclosao-core-scale', '1');
    eclosaoRiftCore?.style.setProperty('--eclosao-core-glow', '18px');
    clearEclosaoHoldParticles();
    voidFragmentLayer.querySelectorAll('.void-fragment').forEach(fragment => fragment.remove());
  };

  const completeVoidFragmentChallenge = () => {
    if (!voidFragmentChallengeActive) return;
    voidFragmentChallengeActive = false;
    voidFragmentLayer.classList.add('is-complete', 'is-charging');
    voidFragmentLayer.querySelectorAll('.void-fragment').forEach(fragment => {
      fragment.setAttribute('aria-hidden', 'true');
      fragment.style.left = '50%';
      fragment.style.top = '50%';
    });
    supernovaRevealTimer = window.setTimeout(() => {
      voidFragmentLayer.classList.remove('is-charging');
      revealEclosaoButton();
      supernovaRevealTimer = null;
    }, 2400);
  };

  const feedVoidFragment = fragment => {
    if (!voidFragmentChallengeActive || fragment.dataset.collected === 'true') return;
    fragment.dataset.collected = 'true';
    fragment.style.left = '50%';
    fragment.style.top = '50%';
    fragment.classList.add('is-feeding');
    window.setTimeout(() => {
      fragment.remove();
      voidFragmentsCollected += 1;
      if (voidFragmentsCollected >= VOID_FRAGMENT_TARGET) completeVoidFragmentChallenge();
    }, 460);
  };

  const startVoidFragmentChallenge = () => {
    stopVoidFragmentChallenge();
    voidFragmentChallengeActive = true;
    voidFragmentLayer.classList.remove('hidden');
    for (let index = 0; index < VOID_FRAGMENT_TOTAL; index += 1) {
      const fragment = document.createElement('button');
      const size = 10 + Math.random() * 17;
      const edge = index % 4;
      const left = edge === 0 ? 5 + Math.random() * 25 : edge === 1 ? 70 + Math.random() * 25 : Math.random() * 94;
      const top = edge === 0 ? Math.random() * 94 : edge === 1 ? Math.random() * 94 : edge === 2 ? 4 + Math.random() * 20 : 70 + Math.random() * 24;
      fragment.type = 'button';
      fragment.className = 'void-fragment';
      fragment.classList.add(`shape-${index % 4}`);
      fragment.setAttribute('aria-label', 'Alimentar a fenda com este fragmento');
      fragment.style.left = `${left}%`;
      fragment.style.top = `${top}%`;
      fragment.style.setProperty('--fragment-size', `${size}px`);
      fragment.style.setProperty('--fragment-duration', `${4.8 + Math.random() * 5.6}s`);
      fragment.style.setProperty('--fragment-delay', `${Math.random() * -4}s`);
      fragment.style.setProperty('--fragment-rotation', `${-18 + Math.random() * 36}deg`);
      fragment.innerHTML = '<span></span>';
      let dragState = null;

      fragment.addEventListener('pointerdown', event => {
        if (!voidFragmentChallengeActive || fragment.dataset.collected === 'true') return;
        fragment.setPointerCapture(event.pointerId);
        dragState = { startX: event.clientX, startY: event.clientY, moved: false, left, top };
        fragment.classList.add('is-dragging');
      });
      fragment.addEventListener('pointermove', event => {
        if (!dragState) return;
        const dx = event.clientX - dragState.startX;
        const dy = event.clientY - dragState.startY;
        if (Math.hypot(dx, dy) > 6) dragState.moved = true;
        if (!dragState.moved) return;
        fragment.style.left = `${Math.max(1, Math.min(99, dragState.left + (dx / window.innerWidth) * 100))}%`;
        fragment.style.top = `${Math.max(1, Math.min(99, dragState.top + (dy / window.innerHeight) * 100))}%`;
      });
      fragment.addEventListener('pointerup', event => {
        if (!dragState) return;
        const distanceToCore = Math.hypot(event.clientX - window.innerWidth / 2, event.clientY - window.innerHeight / 2);
        const shouldFeed = !dragState.moved || distanceToCore < 150;
        if (shouldFeed) feedVoidFragment(fragment);
        else {
          fragment.style.left = `${dragState.left}%`;
          fragment.style.top = `${dragState.top}%`;
        }
        fragment.classList.remove('is-dragging');
        dragState = null;
        if (fragment.hasPointerCapture(event.pointerId)) fragment.releasePointerCapture(event.pointerId);
      });
      fragment.addEventListener('pointercancel', () => {
        fragment.classList.remove('is-dragging');
        dragState = null;
      });
      voidFragmentLayer.appendChild(fragment);
    }
  };

  const activateSupernovaTheme = (fromSpecialChoice = false) => {
    if (!fromSpecialChoice && !voidLocked) return;
    if (supernovaRevealTimer) window.clearTimeout(supernovaRevealTimer);
    supernovaRevealTimer = null;
    if (rgbMode) stopRgbMode();
    stopVoidFragmentChallenge();
    eclosaoTransition.classList.remove('hidden');
    eclosaoTransition.classList.remove('eclosao-burst-active');
    void eclosaoTransition.offsetWidth;
    eclosaoTransition.classList.add('eclosao-burst-active');
    voidLocked = false;
    setAutomaticMode(false);
    voidCutsceneMusic.pause();
    voidCutsceneMusic.currentTime = 0;
    eclosaoMusic.currentTime = 0;
    eclosaoMusic.play().catch(() => {});
    document.body.classList.remove('theme-void', 'theme-void-locked');
    document.body.classList.add('theme-supernova');
    createEclosaoEmbers();
    themeLiveClock.textContent = 'ECLOSÃO';
    setThemeStatus('supernova');
    setSpecialThemeMenuActive('supernova');
    voidFinaleOverlay.classList.add('hidden');
    themeAutoToggle.disabled = false;
    themeSwitcher.style.pointerEvents = 'auto';
    themeOptions.forEach(option => option.classList.remove('active'));
    updateSpecialThemesSeal(true);
    supernovaThemeOption.classList.remove('supernova-awakening', 'active');
    sidebarVoidTrigger?.classList.remove('is-revealed', 'is-awakened');
    sidebarEclosaoTrigger?.classList.add('is-visible');
    window.setTimeout(() => {
      eclosaoTransition.classList.add('hidden');
      eclosaoTransition.classList.remove('eclosao-burst-active');
    }, 6200);
    [btnPillMute, btnPillShare, btnPillDisconnect].forEach(button => {
      button.disabled = false;
      button.classList.remove('void-sealed');
      button.title = '';
    });
  };

  const resetEclosaoHold = () => {
    if (eclosaoHoldFrame) window.cancelAnimationFrame(eclosaoHoldFrame);
    eclosaoHoldFrame = null;
    eclosaoHoldActive = false;
    eclosaoRiftCore?.classList.remove('is-holding');
    eclosaoRiftCore?.style.setProperty('--eclosao-hold-progress', '0');
    eclosaoRiftCore?.style.setProperty('--eclosao-core-scale', '1');
    eclosaoRiftCore?.style.setProperty('--eclosao-core-glow', '18px');
    voidFragmentLayer.classList.remove('is-holding-eclosao');
    clearEclosaoHoldParticles();
  };

  const eruptEclosao = () => {
    if (!voidLocked || eclosaoHoldCompleted) return;
    eclosaoHoldCompleted = true;
    eclosaoHoldActive = false;
    if (eclosaoHoldFrame) window.cancelAnimationFrame(eclosaoHoldFrame);
    eclosaoHoldFrame = null;
    eclosaoRiftCore?.classList.remove('is-holding');
    eclosaoRiftCore?.classList.add('is-eclipsing');
    voidFragmentLayer.classList.remove('is-holding-eclosao');
    voidFragmentLayer.classList.add('is-erupting-eclosao');
    eclosaoEruptionTimer = window.setTimeout(() => {
      activateSupernovaTheme();
      eclosaoEruptionTimer = null;
    }, 720);
  };

  const updateEclosaoHold = timestamp => {
    if (!eclosaoHoldActive || !eclosaoRiftCore) return;
    const progress = Math.min(1, (timestamp - eclosaoHoldStartedAt) / 3200);
    eclosaoRiftCore.style.setProperty('--eclosao-hold-progress', progress.toFixed(3));
    eclosaoRiftCore.style.setProperty('--eclosao-core-scale', (1 + progress * 1.18).toFixed(3));
    eclosaoRiftCore.style.setProperty('--eclosao-core-glow', `${18 + progress * 68}px`);
    if (progress >= 1) {
      eruptEclosao();
      return;
    }
    eclosaoHoldFrame = window.requestAnimationFrame(updateEclosaoHold);
  };

  eclosaoRiftCore?.addEventListener('pointerdown', event => {
    if (!voidLocked || !eclosaoRiftCore.classList.contains('is-visible') || eclosaoHoldCompleted) return;
    event.preventDefault();
    eclosaoHoldActive = true;
    eclosaoHoldStartedAt = performance.now();
    eclosaoRiftCore.setPointerCapture?.(event.pointerId);
    eclosaoRiftCore.classList.add('is-holding');
    voidFragmentLayer.classList.remove('is-erupting-eclosao');
    voidFragmentLayer.classList.add('is-holding-eclosao');
    createEclosaoHoldParticles();
    eclosaoHoldFrame = window.requestAnimationFrame(updateEclosaoHold);
  });

  eclosaoRiftCore?.addEventListener('pointerup', event => {
    if (eclosaoRiftCore.hasPointerCapture?.(event.pointerId)) eclosaoRiftCore.releasePointerCapture(event.pointerId);
    if (eclosaoHoldActive) resetEclosaoHold();
  });

  eclosaoRiftCore?.addEventListener('pointercancel', resetEclosaoHold);

  const playThemeImpactSound = (attempt) => {
    if (easterEggCompleted) return;
    impactAudioContext ||= new AudioContext();
    const oscillator = impactAudioContext.createOscillator();
    const gain = impactAudioContext.createGain();
    const isFinalImpact = attempt >= 10;
    oscillator.type = isFinalImpact ? 'sawtooth' : 'sine';
    oscillator.frequency.value = isFinalImpact ? 58 : 110 + attempt * 28;
    gain.gain.setValueAtTime(isFinalImpact ? 0.2 : Math.min(0.04 + attempt * 0.008, 0.13), impactAudioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, impactAudioContext.currentTime + (isFinalImpact ? 0.42 : 0.16));
    oscillator.connect(gain).connect(impactAudioContext.destination);
    oscillator.start();
    oscillator.stop(impactAudioContext.currentTime + (isFinalImpact ? 0.44 : 0.17));

    if (isFinalImpact) {
      const crack = impactAudioContext.createOscillator();
      const crackGain = impactAudioContext.createGain();
      crack.type = 'square';
      crack.frequency.value = 180;
      crackGain.gain.setValueAtTime(0.08, impactAudioContext.currentTime);
      crackGain.gain.exponentialRampToValueAtTime(0.001, impactAudioContext.currentTime + 0.12);
      crack.connect(crackGain).connect(impactAudioContext.destination);
      crack.start();
      crack.stop(impactAudioContext.currentTime + 0.13);
    }
  };

  const playVoidCrackSound = (click) => {
    impactAudioContext ||= new AudioContext();
    const oscillator = impactAudioContext.createOscillator();
    const gain = impactAudioContext.createGain();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(720 + click * 22, impactAudioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(120, impactAudioContext.currentTime + 0.1);
    gain.gain.setValueAtTime(Math.min(0.035 + click * 0.003, 0.08), impactAudioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, impactAudioContext.currentTime + 0.12);
    oscillator.connect(gain).connect(impactAudioContext.destination);
    oscillator.start();
    oscillator.stop(impactAudioContext.currentTime + 0.13);
  };

  const triggerThemeImpact = (attempt) => {
    if (easterEggCompleted) return;
    if (attempt < 4) return;
    playThemeImpactSound(attempt);
    if (attempt >= 10) {
      themeSwitcher.classList.remove('shaking');
      unlockRgbTheme();
      rgbArmed = true;
      themeSwitcher.classList.add('rgb-reaching');
      themeSwitcher.style.setProperty('--theme-slider-position', '0%');
      startRgbMode();
      return;
    }
    themeSwitcher.style.setProperty('--shake-intensity', `${2 + (attempt - 4) * 1.8}px`);
    themeSwitcher.classList.remove('shaking');
    void themeSwitcher.offsetWidth;
    themeSwitcher.classList.add('shaking');
  };

  let themeOrder = ['morning', 'day', 'afternoon', 'night'];
  const applyThemeSliderPosition = (clientX) => {
    const rect = themeSwitcher.getBoundingClientRect();
    const rawCenter = (clientX - rect.left) / rect.width;
    const rgbEdge = 0.08;
    if (rgbUnlocked && rgbArmed && rawCenter <= rgbEdge) {
      startRgbMode();
      themeOptions.forEach(option => option.classList.toggle('active', false));
      themeSwitcher.style.setProperty('--theme-slider-position', `${Math.max(0, rawCenter * 100)}%`);
      return;
    }
    if (rgbMode) stopRgbMode();
    const thumbCenter = Math.max(0.125, Math.min(0.875, rawCenter));
    const standardCenter = rgbUnlocked
      ? Math.max(0.125, thumbCenter)
      : thumbCenter;
    const normalized = (standardCenter - 0.125) / 0.75;
    // A faixa percorre exatamente Manhã → Dia → Tarde → Noite.
    // O extremo direito não faz wrap para Manhã.
    const cyclePosition = normalized * (themeOrder.length - 1);
    const index = Math.min(themeOrder.length - 2, Math.floor(cyclePosition));
    const amount = normalized >= 1 ? 1 : cyclePosition - index;
    const from = themeOrder[index];
    const to = themeOrder[Math.min(index + 1, themeOrder.length - 1)];
    const centeredThemeIndex = Math.round(cyclePosition);
    if (from === 'rgb') {
      startRgbMode();
      themeOptions.forEach((option, optionIndex) => option.classList.toggle('active', option.dataset.theme === 'rgb' && rgbUnlocked));
      themeSwitcher.style.setProperty('--theme-slider-position', `${thumbCenter * 100}%`);
      return;
    }
    if (normalized >= 0.9999) {
      applyTheme('night');
      themeOptions.forEach((option, optionIndex) => option.classList.toggle('active', optionIndex === themeOrder.length - 1));
      document.body.removeAttribute('style');
      themeSwitcher.style.setProperty('--theme-slider-position', '87.5%');
      localStorage.setItem('duo_theme', 'night');
      return;
    }
    applyTheme(from, false);
    // O destaque acompanha somente o tema cujo centro está mais próximo da alça.
    themeOptions.forEach((option, optionIndex) => option.classList.toggle('active', optionIndex === centeredThemeIndex));
    applyBlendedPalette(from, to, amount);
    themeSwitcher.style.setProperty('--theme-slider-position', `${thumbCenter * 100}%`);
    localStorage.setItem('duo_theme', from);
  };

  themeSwitcher.addEventListener('pointerdown', (event) => {
    if (voidLocked) return;
    if (event.button !== 0) return;
    themeDrag = { startX: event.clientX, moved: true };
    countedOverflowThisDrag = false;
    dragAutoDisabled = false;
    themeSwitcher.classList.remove('rgb-reaching');
    if (rgbUnlocked) rgbArmed = false;
    if (!rgbMode) stopRgbMode();
    setAutomaticMode(false);
    applyThemeSliderPosition(event.clientX);
    themeSwitcher.setPointerCapture(event.pointerId);
  });

  themeSwitcher.addEventListener('pointermove', (event) => {
    if (!themeDrag) return;
    const rect = themeSwitcher.getBoundingClientRect();
    if (event.clientX < rect.left - 8 && !countedOverflowThisDrag) {
      countedOverflowThisDrag = true;
      leftOverflowAttempts += 1;
      triggerThemeImpact(leftOverflowAttempts);
    }
    if (event.clientX >= rect.left) countedOverflowThisDrag = false;
    if (rgbMode && event.clientX < rect.left - 8) return;
    applyThemeSliderPosition(event.clientX);
  });

  themeSwitcher.addEventListener('pointerup', (event) => {
    if (themeDrag?.moved) {
      event.preventDefault();
      suppressThemeClick = true;
      window.setTimeout(() => { suppressThemeClick = false; }, 0);
    }
    themeDrag = null;
    dragAutoDisabled = false;
    countedOverflowThisDrag = false;
  });
  themeSwitcher.addEventListener('pointercancel', () => {
    themeDrag = null;
    dragAutoDisabled = false;
  });

  const applyTheme = (theme, save = true, updateSlider = true) => {
    const selectedTheme = ['morning', 'day', 'afternoon', 'night'].includes(theme) ? theme : 'night';
    if (document.body.classList.contains('theme-supernova')) {
      clearEclosaoEmbers();
      eclosaoMusic.pause();
      eclosaoMusic.currentTime = 0;
    }
    document.body.classList.remove('theme-morning', 'theme-day', 'theme-afternoon', 'theme-night', 'theme-supernova');
    document.body.classList.add(`theme-${selectedTheme}`);
    setThemeStatus(selectedTheme);
    setSpecialThemeMenuActive('');
    themeOptions.forEach(option => option.classList.toggle('active', option.dataset.theme === selectedTheme));
    if (updateSlider) {
      const selectedIndex = ['morning', 'day', 'afternoon', 'night'].indexOf(selectedTheme);
      themeSwitcher.style.setProperty('--theme-slider-position', `${12.5 + selectedIndex * 25}%`);
    }
    if (save) localStorage.setItem('duo_theme', selectedTheme);
  };

  const getTimeThemeInfo = () => {
    const hour = new Date().getHours() + new Date().getMinutes() / 60;
    if (hour >= 5 && hour < 12) return { theme: 'morning', start: 5, end: 12 };
    if (hour >= 12 && hour < 17) return { theme: 'day', start: 12, end: 17 };
    if (hour >= 17 && hour < 21) return { theme: 'afternoon', start: 17, end: 21 };
    return { theme: 'night', start: hour >= 21 ? 21 : -3, end: hour >= 21 ? 29 : 5 };
  };

  const renderAutomaticTheme = (info, progress, displayDate) => {
    themeSwitcher.style.setProperty('--theme-time-progress', `${Math.min(100, progress)}%`);
    themeSwitcher.style.setProperty('--theme-slider-position', `${12.5 + Math.min(100, progress) * 0.75}%`);
    applyTheme(info.theme, false, false);
    const nextTheme = info.theme === 'morning' ? 'day' : info.theme === 'day' ? 'afternoon' : info.theme === 'afternoon' ? 'night' : 'morning';
    applyBlendedPalette(info.theme, nextTheme, Math.min(1, Math.max(0, progress / 100)));
    themeLiveClock.textContent = displayDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const updateAutomaticTheme = () => {
    const info = getTimeThemeInfo();
    const now = new Date();
    const current = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
    let progress = ((current - info.start) / (info.end - info.start)) * 100;
    if (progress < 0) progress += 100;
    renderAutomaticTheme(info, progress, now);
    const normalizedCurrent = current < 5 ? current + 24 : current;
    const globalProgress = Math.max(0, Math.min(100, ((normalizedCurrent - 5) / 24) * 100));
    themeSwitcher.style.setProperty('--theme-time-progress', `${globalProgress}%`);
    themeSwitcher.style.setProperty('--theme-slider-position', `${12.5 + globalProgress * 0.75}%`);
  };

  const animateAutoIntro = () => {
    const now = new Date();
    const current = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
    const normalizedCurrent = current < 5 ? current + 24 : current;
    const targetProgress = Math.max(0, Math.min(100, ((normalizedCurrent - 5) / 24) * 100));
    const startedAt = performance.now();
    const duration = 1800;
    const step = (timestamp) => {
      const linear = Math.min(1, (timestamp - startedAt) / duration);
      const eased = 1 - Math.pow(1 - linear, 3);
      const simulatedHours = 5 + (normalizedCurrent - 5) * eased;
      const simulatedDate = new Date(now);
      simulatedDate.setHours(Math.floor(simulatedHours % 24), Math.floor((simulatedHours % 1) * 60), 0, 0);
      const slider = themeSwitcher.getBoundingClientRect();
      const sliderCenter = 0.125 + ((targetProgress * eased) / 100) * 0.75;
      applyThemeSliderPosition(slider.left + slider.width * sliderCenter);
      themeSwitcher.style.setProperty('--theme-time-progress', `${targetProgress * eased}%`);
      themeLiveClock.textContent = simulatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (linear < 1 && localStorage.getItem('duo_theme_auto') === '1') {
        autoIntroFrame = requestAnimationFrame(step);
      } else {
        autoIntroFrame = null;
        updateAutomaticTheme();
      }
    };
    autoIntroFrame = requestAnimationFrame(step);
  };

  const setAutomaticMode = (enabled) => {
    if (enabled && rgbMode) stopRgbMode();
    localStorage.setItem('duo_theme_auto', enabled ? '1' : '0');
    themeAutoToggle.classList.toggle('active', enabled);
    themeSwitcher.classList.toggle('auto-mode', enabled);
    themeLiveClock.classList.toggle('auto-visible', enabled);
    if (themeTimer) clearInterval(themeTimer);
    if (autoIntroFrame) cancelAnimationFrame(autoIntroFrame);
    if (enabled) {
      animateAutoIntro();
      themeTimer = setInterval(updateAutomaticTheme, 1000);
    } else {
      applyTheme(localStorage.getItem('duo_theme') || 'night');
      document.body.removeAttribute('style');
      themeLiveClock.textContent = '';
      themeSwitcher.style.setProperty('--theme-slider-position', '12.5%');
    }
  };

  themeAutoToggle.addEventListener('click', () => {
    setAutomaticMode(localStorage.getItem('duo_theme_auto') !== '1');
  });
  setAutomaticMode(localStorage.getItem('duo_theme_auto') === '1');

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

  const startupOverlay = document.getElementById('startupOverlay');
  const welcomeOverlay = document.getElementById('welcomeOverlay');
  const startupGreeting = document.getElementById('startupGreeting');
  const welcomeName = document.getElementById('welcomeName');

  const hour = new Date().getHours();
  startupGreeting.textContent = hour >= 5 && hour < 12
    ? 'Bom dia'
    : hour >= 12 && hour < 18 ? 'Boa tarde' : 'Boa noite';

  // Mantém a saudação visível antes de liberar a tela de seleção de perfil.
  userSelectOverlay.classList.add('hidden');
  window.setTimeout(() => {
    startupOverlay.classList.add('hidden');
    userSelectOverlay.classList.remove('hidden');
  }, 2200);

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
  const partnerStatusBadge = document.getElementById('partnerStatusBadge');

  // Stream Viewport & Partner Audio
  const streamViewport = document.getElementById('streamViewport');
  const streamVideosGrid = document.getElementById('streamVideosGrid');
  const streamChatResizeHandle = document.getElementById('streamChatResizeHandle');
  const stageContentBody = document.querySelector('.stage-content-body');
  const remoteStreamVideo = document.getElementById('remoteStreamVideo');
  const localStreamVideo = document.getElementById('localStreamVideo');
  remoteStreamVideo.muted = true;
  localStreamVideo.muted = true;

  let resizeDrag = null;
  streamChatResizeHandle.addEventListener('pointerdown', (e) => {
    if (!callCenterCard.classList.contains('screenshare-active')) return;
    resizeDrag = { startY: e.clientY, startHeight: callCenterCard.getBoundingClientRect().height };
    callCenterCard.classList.add('is-manually-resized');
    streamChatResizeHandle.setPointerCapture(e.pointerId);
    stageContentBody.classList.add('is-resizing');
  });

  streamChatResizeHandle.addEventListener('pointermove', (e) => {
    if (!resizeDrag) return;
    const bodyHeight = stageContentBody.getBoundingClientRect().height;
    const nextHeight = Math.max(170, Math.min(bodyHeight - 150, resizeDrag.startHeight + e.clientY - resizeDrag.startY));
    callCenterCard.style.height = `${nextHeight}px`;
    callCenterCard.style.flex = '0 0 auto';
  });

  const stopResizeDrag = () => {
    resizeDrag = null;
    stageContentBody.classList.remove('is-resizing');
  };
  streamChatResizeHandle.addEventListener('pointerup', stopResizeDrag);
  streamChatResizeHandle.addEventListener('pointercancel', stopResizeDrag);

  // Modo Foco: quando as duas telas estão ativas, clicar em uma expande ela
  // e a outra vira uma miniatura (PIP) no canto. Clicar de novo desfaz.
  let focusedVideo = null;

  function clearVideoFocus() {
    focusedVideo = null;
    streamVideosGrid.classList.remove('mode-focus');
    remoteStreamVideo.classList.remove('video-focused', 'video-pip');
    localStreamVideo.classList.remove('video-focused', 'video-pip');
  }

  function toggleVideoFocus(video) {
    const hasRemote = !!remoteStreamVideo.srcObject;
    const hasLocal = !!localStreamVideo.srcObject;
    // Só faz sentido "focar" quando as duas telas estão visíveis ao mesmo tempo
    if (!(hasRemote && hasLocal)) return;

    if (focusedVideo === video) {
      // Clicou de novo na tela que já estava em foco -> volta ao grid dividido
      clearVideoFocus();
      return;
    }

    focusedVideo = video;
    streamVideosGrid.classList.add('mode-focus');
    [remoteStreamVideo, localStreamVideo].forEach((v) => {
      v.classList.toggle('video-focused', v === video);
      v.classList.toggle('video-pip', v !== video);
    });
  }

  // Com `object-fit: contain`, o elemento <video> ocupa a célula inteira,
  // mas a imagem real pode ocupar apenas uma parte dela. Só a imagem visível
  // deve responder ao clique; as faixas de fundo ficam sem interação.
  function isInsideRenderedVideo(video, event) {
    const { videoWidth, videoHeight } = video;
    if (!videoWidth || !videoHeight) return false;

    // O PIP usa `cover`, então a célula inteira corresponde à imagem visível.
    if (getComputedStyle(video).objectFit === 'cover') return true;

    const rect = video.getBoundingClientRect();
    const scale = Math.min(rect.width / videoWidth, rect.height / videoHeight);
    const renderedWidth = videoWidth * scale;
    const renderedHeight = videoHeight * scale;
    const renderedLeft = rect.left + (rect.width - renderedWidth) / 2;
    const renderedTop = rect.top + (rect.height - renderedHeight) / 2;

    return event.clientX >= renderedLeft && event.clientX <= renderedLeft + renderedWidth
      && event.clientY >= renderedTop && event.clientY <= renderedTop + renderedHeight;
  }

  function updateVideoCursor(video, event) {
    video.classList.toggle('is-rendered-hover', isInsideRenderedVideo(video, event));
  }

  // O clique simples controla apenas o foco da transmissão.
  function attachFocusClickHandler(video) {
    let clickTimer = null;
    video.addEventListener('mousemove', (e) => updateVideoCursor(video, e));
    video.addEventListener('mouseleave', () => video.classList.remove('is-rendered-hover'));
    video.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!isInsideRenderedVideo(video, e)) return;
      if (clickTimer) {
        // Segundo clique dentro da janela de tempo = é um dblclick, ignora aqui
        clearTimeout(clickTimer);
        clickTimer = null;
        return;
      }
      clickTimer = setTimeout(() => {
        clickTimer = null;
        toggleVideoFocus(video);
      }, 220);
    });
  }

  attachFocusClickHandler(remoteStreamVideo);
  attachFocusClickHandler(localStreamVideo);

  function updateStreamViewportVisibility() {
    const hasRemote = !!remoteStreamVideo.srcObject;
    const hasLocal = !!localStreamVideo.srcObject;

    if (hasRemote || hasLocal) {
      streamViewport.classList.add('visible');
      callCenterCard.classList.add('screenshare-active');
    } else {
      streamViewport.classList.remove('visible');
      callCenterCard.classList.remove('screenshare-active');
      callCenterCard.classList.remove('is-manually-resized');
      callCenterCard.style.height = '';
      callCenterCard.style.flex = '';
      streamViewport.style.aspectRatio = '';
    }

    // Ativa o grid de 2 colunas só quando as duas telas estão de fato visíveis
    streamVideosGrid.classList.toggle('grid-count-2', hasRemote && hasLocal);

    // Se uma das telas sumiu, desfaz o modo foco (não tem mais o que focar)
    if (!(hasRemote && hasLocal)) {
      clearVideoFocus();
    }

    remoteStreamVideo.classList.toggle('hidden', !hasRemote);
    localStreamVideo.classList.toggle('hidden', !hasLocal);
  }

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
  const btnOpenGifPicker = document.getElementById('btnOpenGifPicker');
  const gifPickerPopover = document.getElementById('gifPickerPopover');
  const btnCloseGifPicker = document.getElementById('btnCloseGifPicker');
  const inputGifSearch = document.getElementById('inputGifSearch');
  const btnClearGifSearch = document.getElementById('btnClearGifSearch');
  const gifCategoriesBar = document.getElementById('gifCategoriesBar');
  const gifResultsContainer = document.getElementById('gifResultsContainer');

  // Profile Customization Modal Elements
  const profileModal = document.getElementById('profileModal');
  const profileModalAvatarPreview = document.getElementById('profileModalAvatarPreview');
  const fileAvatarInput = document.getElementById('fileAvatarInput');
  const inputProfileName = document.getElementById('inputProfileName');
  const inputProfileUrl = document.getElementById('inputProfileUrl');
  const chatColorPalette = document.getElementById('chatColorPalette');
  const inputCustomNameColor = document.getElementById('inputCustomNameColor');
  const labelCustomColor = document.getElementById('labelCustomColor');
  const btnCancelProfile = document.getElementById('btnCancelProfile');
  const btnSaveProfile = document.getElementById('btnSaveProfile');

  // Toast & Overlay
  const toastContainer = document.getElementById('toastContainer');
  const reactionsOverlay = document.getElementById('reactionsOverlay');

  // State
  let isInVoice = false;
  let partnerSocketId = null;
  let isConnectedWithPartner = false;
  let tempAvatarDataUrl = '';
  let tempNameColor = '#00e676';

  // Hide call-only buttons until user enters a call
  const callOnlyBtns = document.querySelectorAll('.call-only-btn');
  function showCallButtons() { callOnlyBtns.forEach(b => b.classList.remove('not-in-call')); }
  function hideCallButtons() { callOnlyBtns.forEach(b => b.classList.add('not-in-call')); }
  hideCallButtons(); // hidden by default

  let profile = {
    username: 'Você',
    avatarUrl: '',
    avatarEmoji: '✨',
    nameColor: '#00e676',
    statusText: 'Em chamada'
  };

  let partnerProfile = {
    username: 'Namorada',
    avatarUrl: '',
    avatarEmoji: '🌸',
    nameColor: '#ff79c6',
    statusText: 'Aguardando...',
    theme: 'night',
    isVoidLocked: false
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
    renderThemeStatus(sidebarLocalTheme, currentThemeStatus, currentThemeVoidLocked);

    partnerDisplayName.textContent = partnerProfile.username;
    setAvatarElement(partnerCircleAvatar, partnerProfile.avatarUrl, partnerProfile.avatarEmoji);

    sidebarPartnerName.textContent = partnerProfile.username;
    sidebarPartnerSub.textContent = partnerProfile.statusText;
    setAvatarElement(sidebarPartnerAvatar, partnerProfile.avatarUrl, partnerProfile.avatarEmoji);
    renderThemeStatus(sidebarPartnerTheme, partnerProfile.theme, partnerProfile.isVoidLocked);
  }

  // Pre-populate login avatar previews from localStorage
  const savedNaoAvatar = localStorage.getItem('duo_avatar_nao') || '';
  const savedRayoAvatar = localStorage.getItem('duo_avatar_rayo') || '';
  setAvatarElement(authAvatarNao, savedNaoAvatar, '🐺');
  setAvatarElement(authAvatarRayo, savedRayoAvatar, '🌸');

  // Initialize Socket.io
  const cloudUrl = window.DUO_CONFIG?.SERVER_URL || '';
  socket = cloudUrl ? io(cloudUrl) : io();

  function renderThemeStatus(element, theme = 'night', isVoidLocked = false) {
    const labels = { morning: 'Manhã', day: 'Dia', afternoon: 'Tarde', night: 'Noite', rgb: 'RGB', void: 'VOID', supernova: 'ECLOSÃO' };
    element.textContent = labels[theme] || 'Noite';
    element.classList.toggle('is-void-locked', isVoidLocked);
    element.classList.toggle('is-supernova', theme === 'supernova');
  }

  function setThemeStatus(theme, isVoidLocked = false, force = false) {
    if (!force && theme === currentThemeStatus && isVoidLocked === currentThemeVoidLocked) return;
    currentThemeStatus = theme;
    currentThemeVoidLocked = isVoidLocked;
    renderThemeStatus(sidebarLocalTheme, theme, isVoidLocked);
    if (myUserKey && socket) socket.emit('update-media-state', { theme, isVoidLocked });
  }

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
        const videoStream =
          (stream && stream.getVideoTracks().length > 0)
            ? stream
            : new MediaStream([track]);

        remoteStreamVideo.srcObject = videoStream;
        remoteStreamVideo.muted = true;

        remoteStreamVideo.onloadedmetadata = () => {
          remoteStreamVideo.play().catch(err => console.error('[DEBUG] PLAY ERROR:', err));
        };

        track.onunmute = () => {
          console.log('[WebRTC] Remote video track unmuted');
        };

        track.onended = () => {
          console.log('[WebRTC] Remote video track ended');
          remoteStreamVideo.srcObject = null;
          updateStreamViewportVisibility();
        };

        updateStreamViewportVisibility();
      }
    },
    onConnectionStateChange: (state) => {
      if (state === 'connected') {
        navStatusText.textContent = 'Em chamada';
        dockCallStatus.textContent = 'Em chamada';
        dockCallStatus.classList.remove('offline');
        partnerCircleItem.classList.remove('hidden');
        partnerStatusBadge.classList.remove('offline');
        showToast('Chamada conectada! 🎧');
        sounds.playJoin();
      } else if (state === 'disconnected' || state === 'failed') {
        partnerCircleItem.classList.add('hidden');
        partnerStatusBadge.classList.add('offline');
      }
    },
    onScreenShareStopped: () => {
      btnPillShare.classList.remove('active-on');
      pillShareText.textContent = 'Compartilhar';
      sidebarLocalShareBadge.classList.remove('visible');
      localStreamVideo.srcObject = null;
      localStreamVideo.classList.remove('use-contain');
      socket.emit('update-media-state', { isScreenSharing: false });
      sounds.playScreenStart();
      updateStreamViewportVisibility();
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
    const defaultColor = userKey === 'nao' ? '#00e676' : '#ff79c6';
    const savedColor = localStorage.getItem(`duo_color_${userKey}`) || defaultColor;

    const userProfile = {
      username: savedName,
      avatarUrl: savedAvatar,
      avatarEmoji: defaultEmoji,
      nameColor: savedColor
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
      nameColor: userData.nameColor || (userKey === 'nao' ? '#00e676' : '#ff79c6'),
      statusText: 'Em chamada'
    };

    if (partner) {
      partnerProfile = {
        username: partner.username || (partnerKey === 'nao' ? 'Nao' : 'Rayo'),
        avatarUrl: partner.avatarUrl || '',
        avatarEmoji: partner.avatarEmoji || (partnerKey === 'nao' ? '🐺' : '🌸'),
        nameColor: partner.nameColor || (partnerKey === 'nao' ? '#00e676' : '#ff79c6'),
        statusText: 'Em chamada',
        theme: partner.theme || 'night',
        isVoidLocked: Boolean(partner.isVoidLocked)
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
        nameColor: partnerKey === 'nao' ? '#00e676' : '#ff79c6',
        statusText: 'Aguardando...',
        theme: 'night',
        isVoidLocked: false
      };
      isConnectedWithPartner = false;
      partnerSocketId = null;
      partnerCircleItem.classList.add('hidden');
      sidebarPartnerUser.classList.add('is-offline');
      sidebarPartnerSub.textContent = 'Aguardando...';
    }

    // Personaliza o campo de chat com o nome da outra conta.
    chatInput.placeholder = `Conversar com ${partnerProfile.username}...`;

    applyProfileUI();
    setThemeStatus(currentThemeStatus, currentThemeVoidLocked, true);

    // Set WebRTC Perfect Negotiation role
    webrtc.setUserRole(userKey);

    // Hide Login Overlay smoothly
    userSelectOverlay.classList.add('hidden');
    welcomeName.textContent = profile.username;
    welcomeOverlay.classList.remove('hidden');
    window.setTimeout(() => welcomeOverlay.classList.add('hidden'), 1800);

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
      hideCallButtons();
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
      navStatusText.textContent = 'Em chamada';
      sidebarLocalSub.textContent = 'Em chamada';
      showCallButtons();
      socket.emit('call-state-changed', { isInCall: true });
    } catch (e) {
      console.warn('Microphone access warning:', e);
    }
  }

  remoteStreamVideo.addEventListener('loadedmetadata', handleVideoMetadata);
  localStreamVideo.addEventListener('loadedmetadata', handleVideoMetadata);

  function handleVideoMetadata(e) {
    const video = e.target;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (vw && vh) {
      const ratio = vw / vh;
      if (ratio < 1.6) {
        video.classList.add('use-contain');
      } else {
        video.classList.remove('use-contain');
      }
      // O viewport mantém o layout padrão; não há modo de tela cheia para a transmissão.
    }
  }

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
      localStreamVideo.srcObject = null;
      updateStreamViewportVisibility();
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

    streamViewport.style.aspectRatio = '';
    localStreamVideo.classList.remove('use-contain');

    const withAudio = checkShareAudio.checked;
    const screenStream = await webrtc.startScreenShareWithSource(selectedSource.id, withAudio);

    if (screenStream) {
      btnPillShare.classList.add('active-on');
      btnPillShare.innerHTML = '<i class="ph ph-screencast"></i> <span>Parar Tela</span>';
      sidebarLocalShareBadge.classList.add('visible');
      sidebarLocalSub.textContent = 'Compartilhando tela';

      localStreamVideo.srcObject = screenStream;
      localStreamVideo.muted = true;
      localStreamVideo.play().catch(e => console.log('Local stream play error:', e));

      updateStreamViewportVisibility();
      callCenterCard.classList.add('screenshare-active');
      socket.emit('update-media-state', { isScreenSharing: true });
      showToast(`Transmitindo ${selectedSource.name}!`);
    }
  });

  async function fallbackBrowserScreenShare() {
    const screenStream = await webrtc.startScreenShareWithSource(null, true);
    if (screenStream) {
      btnPillShare.classList.add('active-on');
      btnPillShare.innerHTML = '<i class="ph ph-screencast"></i> <span>Parar Tela</span>';
      sidebarLocalShareBadge.classList.add('visible');
      sidebarLocalSub.textContent = 'Compartilhando tela';
      localStreamVideo.srcObject = screenStream;
      localStreamVideo.muted = true;
      localStreamVideo.play().catch(e => console.log(e));
      updateStreamViewportVisibility();
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
      navStatusText.textContent = 'Online';
      dockCallStatus.textContent = 'Online';
      dockCallStatus.classList.remove('offline');
      btnPillDisconnect.innerHTML = '<i class="ph-bold ph-phone-call"></i> <span>Reconectar</span>';
      btnPillDisconnect.classList.remove('btn-pill-disconnect');
      btnPillDisconnect.classList.add('btn-pill-connect');
      localCircleItem.classList.add('hidden');
      sidebarLocalUser.classList.remove('is-speaking');
      sidebarLocalSub.textContent = 'Online';
      sidebarLocalMutedBadge.classList.remove('visible');
      sidebarLocalShareBadge.classList.remove('visible');
      localStreamVideo.srcObject = null;
      remoteStreamVideo.srcObject = null;
      updateStreamViewportVisibility();
      hideCallButtons();
      socket.emit('call-state-changed', { isInCall: false });
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
    document.body.classList.toggle('sidebar-collapsed', coupleSidebar.classList.contains('collapsed'));
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
  function highlightSelectedColorSwatch(color) {
    if (!chatColorPalette) return;
    const swatches = chatColorPalette.querySelectorAll('.color-swatch-btn');
    let matchedPreset = false;
    swatches.forEach(swatch => {
      if (swatch.dataset.color.toLowerCase() === color.toLowerCase()) {
        swatch.classList.add('active');
        matchedPreset = true;
      } else {
        swatch.classList.remove('active');
      }
    });

    if (labelCustomColor) {
      if (matchedPreset) {
        labelCustomColor.classList.remove('active');
      } else {
        labelCustomColor.classList.add('active');
        if (inputCustomNameColor) inputCustomNameColor.value = color;
      }
    }
  }

  if (chatColorPalette) {
    chatColorPalette.addEventListener('click', (e) => {
      const swatch = e.target.closest('.color-swatch-btn');
      if (swatch) {
        tempNameColor = swatch.dataset.color;
        highlightSelectedColorSwatch(tempNameColor);
      }
    });
  }

  if (inputCustomNameColor) {
    inputCustomNameColor.addEventListener('input', (e) => {
      tempNameColor = e.target.value;
      highlightSelectedColorSwatch(tempNameColor);
    });
  }

  function openProfileModal() {
    inputProfileName.value = profile.username;
    inputProfileUrl.value = profile.avatarUrl || '';
    tempAvatarDataUrl = profile.avatarUrl;
    tempNameColor = profile.nameColor || (myUserKey === 'nao' ? '#00e676' : '#ff79c6');
    highlightSelectedColorSwatch(tempNameColor);
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
    profile.nameColor = tempNameColor;

    if (myUserKey) {
      localStorage.setItem(`duo_name_${myUserKey}`, profile.username);
      localStorage.setItem(`duo_avatar_${myUserKey}`, profile.avatarUrl);
      localStorage.setItem(`duo_color_${myUserKey}`, profile.nameColor);
    }

    applyProfileUI();
    socket.emit('update-profile', profile);
    closeProfileModal();
    showToast('Perfil atualizado com sucesso! ✨');
  });

  // Socket Peer Events

  // peer-joined: the server marks ONE side as initiator:true.
  // Only that side creates an offer. The other side just waits for the offer via handleOffer.
  socket.on('peer-joined', ({ peer, initiator }) => {
    partnerSocketId = peer.socketId;
    isConnectedWithPartner = true;
    updatePartnerData(peer);
    showToast(`${peer.username} conectou! ✨`);

    if (initiator && isInVoice) {
      // Reset any stale PC before initiating a fresh connection
      webrtc.resetPeerConnection();
      webrtc.initiateCall(peer.socketId);
    }
    // If not initiator: wait for the other side's offer via handleOffer
  });

  // peer-existing: sent to the user who JUST logged in when the partner is already here.
  // Do NOT call initiateCall — the partner will send us an offer via peer-joined(initiator:true).
  socket.on('peer-existing', ({ peer }) => {
    partnerSocketId = peer.socketId;
    isConnectedWithPartner = true;
    updatePartnerData(peer);
    // No initiateCall here — we wait for the partner's offer
  });

  socket.on('peer-left', ({ username }) => {
    showToast(`${username || 'Namorada'} saiu do site`);
    partnerSocketId = null;
    isConnectedWithPartner = false;
    // Clear the stale peer connection — they are gone
    webrtc.resetPeerConnection();
    partnerCircleItem.classList.add('hidden');
    partnerStatusBadge.classList.add('offline');
    sidebarPartnerUser.classList.add('is-offline');
    sidebarPartnerUser.classList.remove('is-speaking');
    sidebarPartnerSub.textContent = 'Offline';
    sidebarPartnerMutedBadge.classList.remove('visible');
    sidebarPartnerShareBadge.classList.remove('visible');
    sounds.playLeave();
  });

  socket.on('peer-call-state-changed', ({ isInCall }) => {
    if (isInCall) {
      // Partner joined the call
      partnerCircleItem.classList.remove('hidden');
      partnerStatusBadge.classList.remove('offline');
      sidebarPartnerUser.classList.remove('is-offline');
      sidebarPartnerSub.textContent = 'Em chamada';
      showToast(`${partnerProfile.username} entrou na chamada! 🎧`);
      sounds.playJoin();
      // If we are also in the call, reset stale PC and re-initiate
      if (isInVoice && partnerSocketId) {
        //webrtc.resetPeerConnection();
        //webrtc.initiateCall(partnerSocketId);
      }
    } else {
      // Partner left the call but is still on the site
      partnerCircleItem.classList.add('hidden');
      partnerStatusBadge.classList.add('offline');
      sidebarPartnerUser.classList.remove('is-speaking');
      sidebarPartnerSub.textContent = 'Online';
      sidebarPartnerMutedBadge.classList.remove('visible');
      sidebarPartnerShareBadge.classList.remove('visible');

      remoteStreamVideo.srcObject = null;
      updateStreamViewportVisibility();

      showToast(`${partnerProfile.username} saiu da chamada`);
      sounds.playLeave();
    }
  });

  socket.on('peer-profile-updated', (updatedPeer) => {
    updatePartnerData(updatedPeer);
  });

  socket.on('peer-media-state-updated', (state) => {
    if (state.theme !== undefined || state.isVoidLocked !== undefined) {
      partnerProfile.theme = state.theme ?? partnerProfile.theme;
      partnerProfile.isVoidLocked = state.isVoidLocked ?? partnerProfile.isVoidLocked;
      renderThemeStatus(sidebarPartnerTheme, partnerProfile.theme, partnerProfile.isVoidLocked);
    }
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
        // The remote video track will trigger updateStreamViewportVisibility via onRemoteTrack
        sounds.playScreenStart();
        showToast('Transmissão de tela iniciada pela namorada! 🖥️');
      } else {
        sidebarPartnerShareBadge.classList.remove('visible');
        if (!sidebarPartnerUser.classList.contains('is-offline')) {
          sidebarPartnerSub.textContent = 'Em chamada';
        }
        remoteStreamVideo.srcObject = null;
        updateStreamViewportVisibility();
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
    partnerProfile.nameColor = peer.nameColor || (partnerKey === 'nao' ? '#00e676' : '#ff79c6');
    partnerSocketId = peer.socketId;
    const peerIsInCall = peer.isInCall || false;
    partnerProfile.statusText = peerIsInCall ? 'Em chamada' : 'Online';
    sidebarPartnerUser.classList.remove('is-offline', 'is-speaking');
    sidebarPartnerSub.textContent = peerIsInCall ? 'Em chamada' : 'Online';
    if (peerIsInCall) {
      partnerCircleItem.classList.remove('hidden');
      partnerStatusBadge.classList.remove('offline');
    } else {
      partnerCircleItem.classList.add('hidden');
      partnerStatusBadge.classList.add('offline');
    }
    applyProfileUI();
  }

  // Reactions (Hearts)
  function triggerHeart() {
    createFloatingParticle('💖');
    sounds.playHeartPop();
    socket.emit('send-reaction', { reaction: '💖', sound: 'heart' });
  }

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

  // GIF Search & Tenor/Giphy Integration
  let currentGifSearchDebounce = null;
  let activeGifQuery = 'trending';

  // Curated Fallback GIFs for instant loading
  const CURATED_GIFS = {
    trending: [
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmJsczRrbmx3bTFzYTRpMWdpbDNraWV4eXl5aWpuc25rbHN5dzJscSZlcD12MV9naWZzX3RyZW5kaW5nJmN0PWc/MDJ9IbxxvDUQM/giphy.gif',
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3h2OGQ2NGlraGJmN3VpNmZ1Mnl6cWJocjBvZWVwNDQ4NzhkMnl0NiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/BzyTuYCmvSORqs1ABM/giphy.gif',
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3h2OGQ2NGlraGJmN3VpNmZ1Mnl6cWJocjBvZWVwNDQ4NzhkMnl0NiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ICOgUNjpvO0PC/giphy.gif',
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3h2OGQ2NGlraGJmN3VpNmZ1Mnl6cWJocjBvZWVwNDQ4NzhkMnl0NiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/mlvseq9yvZhba/giphy.gif',
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3h2OGQ2NGlraGJmN3VpNmZ1Mnl6cWJocjBvZWVwNDQ4NzhkMnl0NiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/JIX9t2j0ZTN9S/giphy.gif',
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3h2OGQ2NGlraGJmN3VpNmZ1Mnl6cWJocjBvZWVwNDQ4NzhkMnl0NiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3oriO0OEd9QIDdllqo/giphy.gif'
    ],
    'cute couple love': [
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbjRsc2F0c2pwaGg5MHR5d3M4ZnhpZ3B5dmt4Z2s4bTZsMWk3a3VscCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/c76IJLufpNwSULPk77/giphy.gif',
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbjRsc2F0c2pwaGg5MHR5d3M4ZnhpZ3B5dmt4Z2s4bTZsMWk3a3VscCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/26BRv0ThflsHCqDrG/giphy.gif',
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbjRsc2F0c2pwaGg5MHR5d3M4ZnhpZ3B5dmt4Z2s4bTZsMWk3a3VscCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/L2z7dnOduqEow/giphy.gif',
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbjRsc2F0c2pwaGg5MHR5d3M4ZnhpZ3B5dmt4Z2s4bTZsMWk3a3VscCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/R6gVNAxj2vzSaBaR9v/giphy.gif'
    ],
    'hug love': [
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2Rtc2k5NGwxc3g2ZXlnYmN5cnhjcW56bTZsb2lmcHJ3OXNkcWpucSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/du8yT5sunVaKFs94EU/giphy.gif',
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2Rtc2k5NGwxc3g2ZXlnYmN5cnhjcW56bTZsb2lmcHJ3OXNkcWpucSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/od5H3PmEG5EVq/giphy.gif',
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2Rtc2k5NGwxc3g2ZXlnYmN5cnhjcW56bTZsb2lmcHJ3OXNkcWpucSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/lrr9rHuoJOE0w/giphy.gif'
    ]
  };

  async function searchGifs(query) {
    activeGifQuery = query || 'trending';
    if (gifResultsContainer) {
      gifResultsContainer.innerHTML = '<div class="gif-loading-placeholder"><i class="ph-bold ph-spinner" style="font-size: 1.4rem; animation: spin 1s linear infinite; display: inline-block;"></i><br><br>Buscando GIFs... ✨</div>';
    }

    try {
      const q = encodeURIComponent(query === 'trending' ? 'cute anime couple reaction' : query);
      const url = `https://tenor.googleapis.com/v2/search?q=${q}&key=LIVDSRZULELA&limit=24&media_filter=gif,tinygif`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Tenor API error');
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const gifUrls = data.results.map(r => {
          return r.media_formats?.gif?.url || r.media_formats?.tinygif?.url || r.url;
        }).filter(Boolean);
        renderGifs(gifUrls);
        return;
      }
    } catch (e) {
      console.warn('[GIF] Tenor API fallback:', e);
    }

    // GIPHY Fallback
    try {
      const q = encodeURIComponent(query === 'trending' ? 'cute reaction' : query);
      const gUrl = `https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=${q}&limit=24&rating=g`;
      const response = await fetch(gUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const gifUrls = data.data.map(g => g.images?.fixed_height?.url || g.images?.original?.url).filter(Boolean);
          renderGifs(gifUrls);
          return;
        }
      }
    } catch (e) {
      console.warn('[GIF] Giphy API fallback:', e);
    }

    // Built-in curated fallback
    const fallbackList = CURATED_GIFS[query] || CURATED_GIFS['trending'];
    renderGifs(fallbackList);
  }

  function renderGifs(gifUrls) {
    if (!gifResultsContainer) return;
    if (!gifUrls || gifUrls.length === 0) {
      gifResultsContainer.innerHTML = '<div class="gif-loading-placeholder">Nenhum GIF encontrado 😿</div>';
      return;
    }

    gifResultsContainer.innerHTML = '';
    gifUrls.forEach(url => {
      const card = document.createElement('div');
      card.className = 'gif-item-card';
      card.innerHTML = `<img src="${url}" class="gif-item-img" loading="lazy" alt="GIF">`;
      card.addEventListener('click', () => {
        sendGifMessage(url);
        closeGifPicker();
      });
      gifResultsContainer.appendChild(card);
    });
  }

  function sendGifMessage(gifUrl) {
    socket.emit('send-message', {
      text: '',
      gifUrl: gifUrl,
      senderName: profile.username,
      senderAvatar: profile.avatarUrl,
      senderNameColor: profile.nameColor || (myUserKey === 'nao' ? '#00e676' : '#ff79c6'),
      type: 'gif',
      timestamp: new Date().toISOString()
    });
  }

  function openGifPicker() {
    if (!gifPickerPopover) return;
    gifPickerPopover.classList.add('open');
    if (inputGifSearch) inputGifSearch.focus();
    if (!gifResultsContainer.hasChildNodes() || gifResultsContainer.querySelector('.gif-loading-placeholder')) {
      searchGifs(activeGifQuery);
    }
  }

  function closeGifPicker() {
    if (gifPickerPopover) {
      gifPickerPopover.classList.remove('open');
    }
  }

  if (btnOpenGifPicker) {
    btnOpenGifPicker.addEventListener('click', (e) => {
      e.stopPropagation();
      if (gifPickerPopover && gifPickerPopover.classList.contains('open')) {
        closeGifPicker();
      } else {
        openGifPicker();
      }
    });
  }

  if (btnCloseGifPicker) {
    btnCloseGifPicker.addEventListener('click', closeGifPicker);
  }

  if (inputGifSearch) {
    inputGifSearch.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (btnClearGifSearch) btnClearGifSearch.classList.toggle('visible', !!val);
      clearTimeout(currentGifSearchDebounce);
      currentGifSearchDebounce = setTimeout(() => {
        searchGifs(val || 'trending');
      }, 350);
    });
  }

  if (btnClearGifSearch) {
    btnClearGifSearch.addEventListener('click', () => {
      inputGifSearch.value = '';
      btnClearGifSearch.classList.remove('visible');
      searchGifs('trending');
      inputGifSearch.focus();
    });
  }

  if (gifCategoriesBar) {
    gifCategoriesBar.addEventListener('click', (e) => {
      const pill = e.target.closest('.gif-category-pill');
      if (pill) {
        gifCategoriesBar.querySelectorAll('.gif-category-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const q = pill.dataset.query;
        if (inputGifSearch) inputGifSearch.value = '';
        if (btnClearGifSearch) btnClearGifSearch.classList.remove('visible');
        searchGifs(q);
      }
    });
  }

  // Close GIF popover on outside click
  document.addEventListener('click', (e) => {
    if (gifPickerPopover && gifPickerPopover.classList.contains('open')) {
      if (!gifPickerPopover.contains(e.target) && e.target !== btnOpenGifPicker && !btnOpenGifPicker?.contains(e.target)) {
        closeGifPicker();
      }
    }
  });

  function isImageUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;
    if (/\.(gif|webp|png|jpe?g)(\?.*)?$/i.test(trimmed)) return true;
    if (trimmed.includes('media.giphy.com') || trimmed.includes('tenor.com') || trimmed.includes('c.tenor.com') || trimmed.includes('i.imgur.com')) return true;
    return false;
  }

  // Chat Messaging & Deduplication
  const renderedMessageIds = new Set();

  function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    const isImg = isImageUrl(text);

    socket.emit('send-message', {
      text: isImg ? '' : text,
      gifUrl: isImg ? text : null,
      senderName: profile.username,
      senderAvatar: profile.avatarUrl,
      senderNameColor: profile.nameColor || (myUserKey === 'nao' ? '#00e676' : '#ff79c6'),
      type: isImg ? 'gif' : 'text',
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
    const effectiveGif = msg.gifUrl || (isImageUrl(msg.text) ? msg.text.trim() : null);
    const effectiveText = (effectiveGif && effectiveGif === msg.text?.trim()) ? '' : (msg.text || '');

    const msgKey = msg.id || (msg.senderName + '_' + msg.timestamp + '_' + (effectiveGif || effectiveText));
    if (renderedMessageIds.has(msgKey)) return;
    renderedMessageIds.add(msgKey);

    const bubbleRow = document.createElement('div');
    bubbleRow.className = 'chat-bubble-row';

    const isMine = (msg.senderUserKey === myUserKey) || (msg.senderId === socket.id) || (msg.senderName === profile.username);
    const authorColor = msg.senderNameColor || (isMine ? (profile.nameColor || '#00e676') : (partnerProfile.nameColor || '#ff79c6'));
    const time = new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let mediaContent = '';
    if (effectiveGif) {
      mediaContent = `
        <div class="chat-bubble-gif-wrap">
          <img src="${effectiveGif}" class="chat-bubble-gif-img" alt="GIF" loading="lazy" />
        </div>
      `;
    }

    const textContent = effectiveText ? `<div class="chat-bubble-text">${escapeHTML(effectiveText)}</div>` : '';
    const youtubeEmbedUrl = getYouTubeEmbedUrl(effectiveText);
    const embedContent = youtubeEmbedUrl ? `
      <div class="chat-link-embed">
        <iframe src="${youtubeEmbedUrl}" title="Vídeo do YouTube" loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen></iframe>
      </div>
    ` : '';

    bubbleRow.innerHTML = `
      <div class="chat-bubble-avatar" style="${msg.senderAvatar ? `background-image: url('${msg.senderAvatar}');` : ''}">
        ${msg.senderAvatar ? '' : (isMine ? profile.avatarEmoji : partnerProfile.avatarEmoji)}
      </div>
      <div class="chat-bubble-content">
        <div class="chat-bubble-header">
          <span class="chat-bubble-author" style="color: ${authorColor};">${escapeHTML(msg.senderName || 'Usuário')}</span>
          <span class="chat-bubble-time">${time}</span>
        </div>
        ${textContent}
        ${mediaContent}
        ${embedContent}
      </div>
    `;

    chatMessages.appendChild(bubbleRow);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (effectiveGif) {
      const img = bubbleRow.querySelector('.chat-bubble-gif-img');
      if (img) {
        img.onload = () => {
          chatMessages.scrollTop = chatMessages.scrollHeight;
        };
      }
    }
  }

  function getYouTubeEmbedUrl(text) {
    if (!text) return null;
    try {
      const url = new URL(text.trim());
      let videoId = '';
      if (url.hostname === 'youtu.be') {
        videoId = url.pathname.slice(1);
      } else if (url.hostname.endsWith('youtube.com')) {
        videoId = url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop();
      }
      if (!/^[\w-]{11}$/.test(videoId || '')) return null;
      return `https://www.youtube.com/embed/${videoId}`;
    } catch {
      return null;
    }
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
