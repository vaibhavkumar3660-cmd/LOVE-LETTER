/**
 * A Love Letter For Her - Core Application Script
 * Interactive storytelling, typewriter engine, questions logic & audio.
 */

(function () {
  'use strict';

  // 1. CONFIGURATION INITIALIZATION
  let appConfig = JSON.parse(JSON.stringify(LOVE_LETTER_CONFIG));
  
  // Load any user overrides from localStorage
  const savedConfig = localStorage.getItem('love_letter_saved_config');
  if (savedConfig) {
    try {
      const parsed = JSON.parse(savedConfig);
      appConfig = { ...appConfig, ...parsed };
    } catch (e) {
      console.warn('Could not parse saved config, using default.');
    }
  }

  // One-time refresh of the requested names/date for this website version.
  // Later edits made through Personalize remain saved as usual.
  if (localStorage.getItem('love_letter_identity_v2') !== 'true') {
    appConfig.recipientName = 'FLASH';
    appConfig.senderName = 'VEBV';
    appConfig.specialDate = '21 AUG';
    localStorage.setItem('love_letter_identity_v2', 'true');
  }

  // 2. STATE
  let currentChapterIndex = 0;
  let isTyping = false;
  let typewriterTimeout = null;
  let isMusicPlaying = false;
  let audioContext = null;
  let synthMusicInterval = null;

  // 3. DOM ELEMENTS
  const envelopeStage = document.getElementById('envelope-stage');
  const letterStage = document.getElementById('letter-stage');
  const celebrationStage = document.getElementById('celebration-stage');
  const envelopeCard = document.getElementById('envelope-card');
  const waxSealBtn = document.getElementById('wax-seal-btn');

  // Letter elements
  const envelopeRecipient = document.getElementById('envelope-recipient');
  const letterDate = document.getElementById('letter-date');
  const letterSalutation = document.getElementById('letter-salutation');
  const chapterBadge = document.getElementById('chapter-badge');
  const currentChapterTitle = document.getElementById('current-chapter-title');
  const typewriterText = document.getElementById('typewriter-text');
  const typewriterCursor = document.getElementById('typewriter-cursor');
  const letterParagraphsContainer = document.getElementById('letter-paragraphs-container');
  const questionContainer = document.getElementById('question-container');
  const questionPrompt = document.getElementById('question-prompt');
  const optionsContainer = document.getElementById('options-container');
  const reactionBox = document.getElementById('reaction-box');
  const reactionText = document.getElementById('reaction-text');
  const nextChapterBtn = document.getElementById('next-chapter-btn');
  const letterSignoff = document.getElementById('letter-signoff');
  const letterSignature = document.getElementById('letter-signature');

  // Celebration elements
  const celebRecipient = document.getElementById('celeb-recipient');
  const celebSender = document.getElementById('celeb-sender');
  const celebDate = document.getElementById('celeb-date');
  const replayBtn = document.getElementById('replay-btn');

  // Audio & Settings elements
  const musicToggle = document.getElementById('music-toggle');
  const musicLabel = document.getElementById('music-label');
  const discIcon = document.getElementById('disc-icon');
  const bgAudio = document.getElementById('bg-audio');

  const openSettingsBtn = document.getElementById('open-settings-btn');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const inputRecipient = document.getElementById('input-recipient');
  const inputSender = document.getElementById('input-sender');
  const inputDate = document.getElementById('input-date');
  const inputMusicUrl = document.getElementById('input-music-url');
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  const resetSettingsBtn = document.getElementById('reset-settings-btn');

  // 4. SYNC UI WITH CONFIG
  function syncUIWithConfig() {
    envelopeRecipient.textContent = appConfig.recipientName;
    letterSalutation.textContent = `Dearest ${appConfig.recipientName},`;
    letterDate.textContent = appConfig.specialDate;
    letterSignature.textContent = appConfig.senderName;

    celebRecipient.textContent = appConfig.recipientName;
    celebSender.textContent = appConfig.senderName;
    celebDate.textContent = appConfig.specialDate;

    // Settings fields
    inputRecipient.value = appConfig.recipientName;
    inputSender.value = appConfig.senderName;
    inputDate.value = appConfig.specialDate;
    inputMusicUrl.value = appConfig.music.customAudioUrl || '';
  }

  syncUIWithConfig();

  // 5. ROMANTIC WEB AUDIO SYNTHESIZER (Gentle Music Box / Celesta Melodies)
  // Plays beautifully without requiring any external MP3 file!
  function initAudioContext() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioCtx();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }

  function playTone(freq, duration = 1.2, timeOffset = 0, gainLevel = 0.15) {
    if (!audioContext) return;
    const now = audioContext.currentTime + timeOffset;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    // Warm, bell-like timbre
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(gainLevel, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(now);
    osc.stop(now + duration + 0.1);
  }

  // Romantic Pentatonic/Diatonic chords progression in F major / D minor
  // F (F4, A4, C5), C (E4, G4, C5), Dm (D4, F4, A4), Bb (D4, F4, Bb4)
  const musicBoxNotes = [
    // Bar 1: F major
    { f: 349.23, delay: 0 }, { f: 440.00, delay: 0.35 }, { f: 523.25, delay: 0.7 }, { f: 698.46, delay: 1.05 },
    // Bar 2: C major
    { f: 329.63, delay: 1.4 }, { f: 392.00, delay: 1.75 }, { f: 523.25, delay: 2.1 }, { f: 659.25, delay: 2.45 },
    // Bar 3: D minor
    { f: 293.66, delay: 2.8 }, { f: 349.23, delay: 3.15 }, { f: 440.00, delay: 3.5 }, { f: 587.33, delay: 3.85 },
    // Bar 4: Bb major
    { f: 293.66, delay: 4.2 }, { f: 349.23, delay: 4.55 }, { f: 466.16, delay: 4.9 }, { f: 523.25, delay: 5.25 }
  ];

  function startBuiltInMusic() {
    initAudioContext();
    function loopSequence() {
      if (!isMusicPlaying) return;
      musicBoxNotes.forEach(n => {
        playTone(n.f, 1.4, n.delay, 0.12);
      });
    }
    loopSequence();
    synthMusicInterval = setInterval(() => {
      if (isMusicPlaying) {
        loopSequence();
      }
    }, 5600);
  }

  function stopBuiltInMusic() {
    if (synthMusicInterval) {
      clearInterval(synthMusicInterval);
      synthMusicInterval = null;
    }
  }

  function toggleMusic(forceState) {
    const targetState = typeof forceState === 'boolean' ? forceState : !isMusicPlaying;
    isMusicPlaying = targetState;

    if (isMusicPlaying) {
      discIcon.classList.add('playing');
      musicLabel.textContent = 'Music: On';
      
      // If user specified custom MP3 URL
      if (appConfig.music.customAudioUrl && appConfig.music.customAudioUrl.trim() !== '') {
        bgAudio.src = appConfig.music.customAudioUrl;
        bgAudio.play().catch(e => {
          console.warn('Custom audio playback blocked, falling back to synth.', e);
          startBuiltInMusic();
        });
      } else {
        startBuiltInMusic();
      }
    } else {
      discIcon.classList.remove('playing');
      musicLabel.textContent = 'Music: Off';
      stopBuiltInMusic();
      if (!bgAudio.paused) {
        bgAudio.pause();
      }
    }
  }

  musicToggle.addEventListener('click', () => toggleMusic());

  // 6. ENVELOPE OPENING INTERACTION
  function openEnvelope() {
    if (envelopeCard.classList.contains('opening')) return;

    envelopeCard.classList.add('opening');
    createHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 25);

    // Auto-start music if not yet playing
    if (!isMusicPlaying) {
      toggleMusic(true);
    }

    setTimeout(() => {
      envelopeStage.classList.remove('active');
      letterStage.classList.add('active');
      startChapter(0);
    }, 1100);
  }

  waxSealBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openEnvelope();
  });

  envelopeCard.addEventListener('click', openEnvelope);

  // 7. TYPEWRITER EFFECT & CHAPTER FLOW
  function startChapter(index) {
    if (index >= appConfig.chapters.length) {
      // Completed all chapters
      letterSignoff.classList.add('visible');
      questionContainer.classList.remove('visible');
      setTimeout(showCelebrationStage, 2200);
      return;
    }

    currentChapterIndex = index;
    const chapter = appConfig.chapters[index];

    // Update header badge
    chapterBadge.textContent = `Chapter ${index + 1} of ${appConfig.chapters.length}`;
    currentChapterTitle.textContent = chapter.title;

    // Reset typewriter text & question
    typewriterText.textContent = '';
    typewriterCursor.style.display = 'inline-block';
    questionContainer.classList.remove('visible');
    reactionBox.classList.remove('active');
    optionsContainer.innerHTML = '';

    // Start typing
    typeText(chapter.text, () => {
      typewriterCursor.style.display = 'none';
      renderQuestion(chapter.question);
    });
  }

  function typeText(fullText, onComplete) {
    isTyping = true;
    let charIndex = 0;
    const speed = 28; // milliseconds per character

    function step() {
      if (!isTyping) return;
      if (charIndex < fullText.length) {
        typewriterText.textContent += fullText.charAt(charIndex);
        charIndex++;

        // Natural typing jitter
        const jitter = Math.random() * 15;
        typewriterTimeout = setTimeout(step, speed + jitter);
      } else {
        isTyping = false;
        if (typeof onComplete === 'function') {
          setTimeout(onComplete, 400);
        }
      }
    }

    step();
  }

  // 8. INTERACTIVE QUESTIONS ENGINE
  function renderQuestion(qData) {
    if (!qData) return;

    questionPrompt.textContent = qData.prompt;
    optionsContainer.innerHTML = '';
    reactionBox.classList.remove('active');

    if (qData.type === 'slider') {
      renderSliderQuestion(qData);
    } else if (qData.type === 'proposal') {
      renderProposalQuestion(qData);
    } else {
      renderMultipleChoiceQuestion(qData);
    }

    // Reveal question card smoothly
    setTimeout(() => {
      questionContainer.classList.add('visible');
    }, 200);
  }

  // Question Type A: Multiple Choice
  function renderMultipleChoiceQuestion(qData) {
    qData.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span>${opt.text}</span><span class="opt-heart">♡</span>`;

      btn.addEventListener('click', () => {
        // Highlight chosen option
        const allBtns = optionsContainer.querySelectorAll('.option-btn');
        allBtns.forEach(b => {
          b.classList.remove('selected');
          b.querySelector('.opt-heart').textContent = '♡';
        });
        btn.classList.add('selected');
        btn.querySelector('.opt-heart').textContent = '♥';

        // Play little sparkle
        const rect = btn.getBoundingClientRect();
        createHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);

        // Display reaction
        reactionText.textContent = opt.reaction;
        reactionBox.classList.add('active');
      });

      optionsContainer.appendChild(btn);
    });
  }

  // Question Type B: Interactive Love Meter Slider
  function renderSliderQuestion(qData) {
    const sliderWrap = document.createElement('div');
    sliderWrap.className = 'slider-wrapper';

    sliderWrap.innerHTML = `
      <input type="range" min="1" max="100" value="30" class="love-meter-slider" id="love-meter">
      <div class="slider-labels">
        <span>${qData.minLabel}</span>
        <span>${qData.maxLabel}</span>
      </div>
      <div class="slider-value-display" id="slider-status">Slide to see how much! 💖</div>
    `;

    optionsContainer.appendChild(sliderWrap);

    const slider = sliderWrap.querySelector('#love-meter');
    const status = sliderWrap.querySelector('#slider-status');

    slider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      
      if (val < 40) {
        status.textContent = qData.reactions[0] || "More than that! 💕";
      } else if (val < 75) {
        status.textContent = qData.reactions[1] || "Keep sliding to the right! 🌸";
      } else if (val < 98) {
        status.textContent = qData.reactions[2] || "Almost there... ✨";
      } else {
        // Reached the maximum!
        status.textContent = qData.reactions[3] || "To infinity and beyond! ❤️✨";
        createHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 18);
        reactionText.textContent = "My love for you cannot be measured by numbers. It belongs to infinity.";
        reactionBox.classList.add('active');
      }
    });
  }

  // Question Type C: Proposal / Forever (With the Evasive "No" Button)
  function renderProposalQuestion(qData) {
    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'proposal-actions';

    const yesBtn = document.createElement('button');
    yesBtn.className = 'proposal-btn yes';
    yesBtn.textContent = qData.yesText || "YES, FOREVER! 💖";

    const noBtn = document.createElement('button');
    noBtn.className = 'proposal-btn no';
    noBtn.textContent = qData.noText || "No 🙈";

    // Playful runaway logic for the No button!
    const playfulHints = [
      "Wait, you can't click this! 😜",
      "Nice try! The button ran away! 🏃‍♀️💨",
      "Error 404: 'No' not found! 💕",
      "You know you love me too much! 🥰",
      "Button is playing hide and seek! 🙈"
    ];
    let hintIdx = 0;

    function evadeNoButton(e) {
      if (e) e.preventDefault();
      const parentRect = actionsWrap.getBoundingClientRect();
      const maxX = parentRect.width - noBtn.offsetWidth - 20;
      const maxY = 140;

      const randomX = (Math.random() - 0.5) * maxX;
      const randomY = (Math.random() - 0.5) * maxY;

      noBtn.style.transform = `translate(${randomX}px, ${randomY}px) scale(0.9)`;
      noBtn.textContent = playfulHints[hintIdx % playfulHints.length];
      hintIdx++;

      // Make the YES button grow even bigger and more inviting!
      const currentScale = parseFloat(yesBtn.getAttribute('data-scale') || '1.0');
      const newScale = Math.min(currentScale + 0.08, 1.4);
      yesBtn.setAttribute('data-scale', newScale);
      yesBtn.style.transform = `scale(${newScale})`;
    }

    noBtn.addEventListener('mouseenter', evadeNoButton);
    noBtn.addEventListener('touchstart', evadeNoButton);
    noBtn.addEventListener('click', evadeNoButton);

    // YES button click -> Show Grand Finale
    yesBtn.addEventListener('click', () => {
      createHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 50);
      launchConfettiStorm();
      showCelebrationStage();
    });

    actionsWrap.appendChild(yesBtn);
    actionsWrap.appendChild(noBtn);
    optionsContainer.appendChild(actionsWrap);
  }

  // Next Chapter progression handler
  nextChapterBtn.addEventListener('click', () => {
    // Archive previous chapter text into the unlocked collection
    const currentChapter = appConfig.chapters[currentChapterIndex];
    const prevBlock = document.createElement('div');
    prevBlock.className = 'unlocked-paragraph';
    prevBlock.innerHTML = `
      <h4 class="unlocked-title">${currentChapter.title}</h4>
      <p>${currentChapter.text}</p>
    `;
    letterParagraphsContainer.appendChild(prevBlock);

    // Smooth scroll to top of active paragraph
    startChapter(currentChapterIndex + 1);
  });

  // 9. GRAND CELEBRATION
  function showCelebrationStage() {
    letterStage.classList.remove('active');
    celebrationStage.classList.add('active');
    launchConfettiStorm();
  }

  replayBtn.addEventListener('click', () => {
    celebrationStage.classList.remove('active');
    letterParagraphsContainer.innerHTML = '';
    envelopeStage.classList.add('active');
    envelopeCard.classList.remove('opening');
  });

  // 10. BACKGROUND CANVAS: SAKURA PETALS, PARTICLES & CONFETTI
  const canvas = document.getElementById('ambient-canvas');
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const petals = [];
  const MAX_PETALS = 32;

  class Petal {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = -20;
      this.size = Math.random() * 12 + 10;
      this.speedY = Math.random() * 1.2 + 0.8;
      this.speedX = Math.random() * 1 - 0.5;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 1.5;
      this.opacity = Math.random() * 0.5 + 0.4;
      this.color = Math.random() > 0.3 ? '#fbb2c4' : '#ffd3df';
    }
    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.y * 0.015) + this.speedX;
      this.rotation += this.rotationSpeed;
      if (this.y > height + 20) {
        this.reset();
      }
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;

      // Draw graceful petal shape
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(this.size / 2, -this.size / 2, this.size, 0, 0, this.size);
      ctx.bezierCurveTo(-this.size, 0, -this.size / 2, -this.size / 2, 0, 0);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < MAX_PETALS; i++) {
    const p = new Petal();
    p.y = Math.random() * height; // initial random spread
    petals.push(p);
  }

  // Interactive Bursts & Confetti
  const bursts = [];

  function createHeartBurst(originX, originY, count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      bursts.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 14 + 10,
        opacity: 1,
        life: 1,
        decay: Math.random() * 0.02 + 0.015,
        color: ['#ff4d79', '#ff8da9', '#ffd1dc', '#ffd700'][Math.floor(Math.random() * 4)],
        type: Math.random() > 0.4 ? 'heart' : 'sparkle'
      });
    }
  }

  function launchConfettiStorm() {
    for (let i = 0; i < 150; i++) {
      bursts.push({
        x: Math.random() * width,
        y: -30,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 5 + 3,
        size: Math.random() * 12 + 6,
        opacity: 1,
        life: 1,
        decay: Math.random() * 0.008 + 0.004,
        color: ['#ff3b69', '#ff8da9', '#ffd700', '#ffffff', '#e07a8f'][Math.floor(Math.random() * 5)],
        type: 'confetti'
      });
    }
  }

  function drawHeartShape(cx, cy, size, color, alpha) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = Math.max(alpha, 0);
    ctx.fillStyle = color;
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
    ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size * 1.25);
    ctx.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
    ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
    ctx.fill();
    ctx.restore();
  }

  function animateCanvas() {
    ctx.clearRect(0, 0, width, height);

    // Draw falling petals
    petals.forEach(p => {
      p.update();
      p.draw();
    });

    // Draw active particle bursts
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life -= b.decay;

      if (b.type === 'heart') {
        drawHeartShape(b.x, b.y, b.size, b.color, b.life);
      } else if (b.type === 'confetti') {
        ctx.save();
        ctx.globalAlpha = Math.max(b.life, 0);
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.size, b.size * 0.6);
        ctx.restore();
      } else {
        // sparkle
        ctx.save();
        ctx.globalAlpha = Math.max(b.life, 0);
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (b.life <= 0) {
        bursts.splice(i, 1);
      }
    }

    requestAnimationFrame(animateCanvas);
  }

  animateCanvas();

  // 11. PERSONALIZATION DRAWER & LOCAL STORAGE
  openSettingsBtn.addEventListener('click', () => {
    syncUIWithConfig();
    settingsModal.classList.add('active');
  });

  closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('active');
  });

  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove('active');
    }
  });

  saveSettingsBtn.addEventListener('click', () => {
    appConfig.recipientName = inputRecipient.value.trim() || "My Love";
    appConfig.senderName = inputSender.value.trim() || "Yours Forever";
    appConfig.specialDate = inputDate.value.trim() || "Since Day One";
    appConfig.music.customAudioUrl = inputMusicUrl.value.trim();

    localStorage.setItem('love_letter_saved_config', JSON.stringify({
      recipientName: appConfig.recipientName,
      senderName: appConfig.senderName,
      specialDate: appConfig.specialDate,
      music: appConfig.music
    }));

    syncUIWithConfig();
    settingsModal.classList.remove('active');

    // Visual feedback
    createHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 20);
  });

  resetSettingsBtn.addEventListener('click', () => {
    localStorage.removeItem('love_letter_saved_config');
    appConfig = JSON.parse(JSON.stringify(LOVE_LETTER_CONFIG));
    syncUIWithConfig();
    settingsModal.classList.remove('active');
  });

})();
