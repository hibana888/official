document.addEventListener('DOMContentLoaded', () => {
  initPageLoader();
  initLiveClock();
  initPaintPad();
  initSurpriseMe();
  initVinylPlayer();
  initMuseModal();
  initStaySharpTabs();
  initReelPreviewModal();
  initMultiStepFormAndBookingModal();
  initFaqAccordion();
  initTimeBasedTheme();
});

/* ==========================================================================
   1. PAGE LOADER
   ========================================================================== */
function initPageLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  setTimeout(() => {
    loader.classList.add('fade-out');
    setTimeout(() => {
      loader.remove();
    }, 600);
  }, 700);
}

/* ==========================================================================
   2. LIVE CASABLANCA / MOROCCO CLOCK
   ========================================================================== */
function initLiveClock() {
  const clockElement = document.getElementById('live-clock-time');
  if (!clockElement) return;

  function updateClock() {
    try {
      const options = {
        timeZone: 'Africa/Casablanca',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      const formatter = new Intl.DateTimeFormat('en-GB', options);
      clockElement.textContent = formatter.format(new Date());
    } catch (e) {
      const d = new Date();
      clockElement.textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/* ==========================================================================
   3. RETRO MS PAINT DOODLE PAD
   ========================================================================== */
function initPaintPad() {
  const canvas = document.getElementById('paint-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const activeColorIndicator = document.getElementById('active-color-box');
  const statusCoords = document.getElementById('paint-coords');
  const toolButtons = document.querySelectorAll('.paint-tool-btn');
  const colorBoxes = document.querySelectorAll('.color-box');

  let isDrawing = false;
  let currentColor = '#000000';
  let currentTool = 'pencil';
  const strokeWidth = 2;
  let lastX = 0;
  let lastY = 0;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    let tempCanvas = null;
    if (canvas.width > 0 && canvas.height > 0) {
      tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(canvas, 0, 0);
    }

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    if (tempCanvas) {
      ctx.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
    }
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    const { x, y } = getCoordinates(e);
    lastX = x;
    lastY = y;

    if (currentTool === 'fill') {
      ctx.fillStyle = currentColor;
      const rect = canvas.getBoundingClientRect();
      ctx.fillRect(0, 0, rect.width, rect.height);
      return;
    }

    ctx.beginPath();
    ctx.arc(
      x,
      y,
      (currentTool === 'eraser' ? 10 : currentTool === 'brush' ? 5 : strokeWidth) / 2,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = currentTool === 'eraser' ? '#ffffff' : currentColor;
    ctx.fill();
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);

    if (statusCoords) {
      statusCoords.textContent = `${Math.round(x)}, ${Math.round(y)}px`;
    }

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);

    if (currentTool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 14;
      ctx.lineCap = 'square';
    } else if (currentTool === 'brush') {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
    } else {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
    }

    ctx.lineJoin = 'round';
    ctx.stroke();

    lastX = x;
    lastY = y;
  }

  function stopDrawing() {
    isDrawing = false;
  }

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  window.addEventListener('mouseup', stopDrawing);

  canvas.addEventListener('touchstart', startDrawing, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  window.addEventListener('touchend', stopDrawing);

  toolButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tool = btn.getAttribute('data-tool');
      if (tool === 'clear') {
        const rect = canvas.getBoundingClientRect();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, rect.width, rect.height);
        return;
      }

      toolButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTool = tool;
    });
  });

  colorBoxes.forEach(box => {
    box.addEventListener('click', () => {
      const color = box.getAttribute('data-color');
      currentColor = color;
      if (activeColorIndicator) {
        activeColorIndicator.style.backgroundColor = color;
      }
      if (currentTool === 'eraser') {
        currentTool = 'pencil';
        toolButtons.forEach(b => {
          if (b.getAttribute('data-tool') === 'pencil') b.classList.add('active');
          else b.classList.remove('active');
        });
      }
    });
  });
}

/* ==========================================================================
   4. SURPRISE ME & CONFETTI ENGINE (BRAND LIME #B6F44C)
   ========================================================================== */
function initSurpriseMe() {
  const surpriseBtn = document.getElementById('surprise-me-btn');
  const promptText = document.getElementById('surprise-prompt');
  if (!surpriseBtn) return;

  const personalBrandPrompts = [
    '⚡ Prompt: Sketch a 45-minute sandglass timer powering your personal brand!',
    '⚡ Prompt: Doodle a founder turning raw insights into an inbound magnet!',
    '⚡ Prompt: Draw a high-converting hook that stops the LinkedIn scroll!',
    '⚡ Prompt: Sketch the Authority-Reach-Resonance Triangle in 15 seconds!',
    '⚡ Prompt: Doodle a 24/7 digital asset that works while you sleep!',
    '⚡ Prompt: Sketch your core UVP as a simple iconic stamp!',
    '⚡ Prompt: Draw a microphone extracting a leader’s biggest story!'
  ];

  surpriseBtn.addEventListener('click', () => {
    const random = personalBrandPrompts[Math.floor(Math.random() * personalBrandPrompts.length)];
    if (promptText) {
      promptText.textContent = random;
      promptText.style.animation = 'none';
      void promptText.offsetWidth;
      promptText.style.animation = 'pulseDot 0.6s ease';
    }

    launchConfetti();
  });
}

function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas') || createConfettiCanvas();
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];
  const colors = ['#B6F44C', '#a3e635', '#111111', '#4d7c0f', '#000000', '#f4f4f5'];

  for (let i = 0; i < 90; i++) {
    pieces.push({
      x: window.innerWidth / 2 + (Math.random() * 80 - 40),
      y: window.innerHeight * 0.7,
      vx: (Math.random() - 0.5) * 16,
      vy: -(Math.random() * 12 + 10),
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      opacity: 1
    });
  }

  let animationFrame;
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.009;

      if (p.opacity > 0 && p.y < canvas.height) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    }

    if (alive) {
      animationFrame = requestAnimationFrame(update);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }

  update();
}

function createConfettiCanvas() {
  const c = document.createElement('canvas');
  c.id = 'confetti-canvas';
  document.body.appendChild(c);
  return c;
}

/* ==========================================================================
   5. INTERACTIVE VINYL PLAYER (ABOUT PAGE)
   ========================================================================== */
function initVinylPlayer() {
  const playBtn = document.getElementById('vinyl-play-btn');
  const disc = document.getElementById('vinyl-disc');
  const tonearm = document.getElementById('vinyl-tonearm');
  const progressFill = document.getElementById('vinyl-progress-fill');
  const timeDisplay = document.getElementById('vinyl-time-display');

  if (!playBtn || !disc) return;

  let isPlaying = false;
  let currentTime = 0;
  const totalDuration = 94;
  let timerInterval = null;
  let audioContext = null;
  let oscillator = null;
  let gainNode = null;

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function startLoFiTone() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioContext = new AudioCtx();

      oscillator = audioContext.createOscillator();
      gainNode = audioContext.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(261.63, audioContext.currentTime);

      gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.04, audioContext.currentTime + 1.2);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
    } catch (err) {}
  }

  function stopLoFiTone() {
    if (gainNode && audioContext) {
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.4);
      setTimeout(() => {
        try {
          if (oscillator) oscillator.stop();
          if (audioContext && audioContext.state !== 'closed') audioContext.close();
        } catch (e) {}
      }, 500);
    }
  }

  playBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;

    if (isPlaying) {
      disc.classList.add('spinning');
      if (tonearm) tonearm.classList.add('active');
      playBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>`;

      startLoFiTone();

      timerInterval = setInterval(() => {
        currentTime++;
        if (currentTime > totalDuration) {
          currentTime = 0;
        }
        const pct = (currentTime / totalDuration) * 100;
        if (progressFill) progressFill.style.width = `${pct}%`;
        if (timeDisplay) timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(totalDuration)}`;
      }, 1000);
    } else {
      disc.classList.remove('spinning');
      if (tonearm) tonearm.classList.remove('active');
      playBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>`;

      stopLoFiTone();
      clearInterval(timerInterval);
    }
  });
}

/* ==========================================================================
   6. BARI'S MUSE // AI CONCIERGE MODAL
   ========================================================================== */
function initMuseModal() {
  const triggerBtn = document.getElementById('muse-trigger-btn');
  const modal = document.getElementById('muse-modal');
  const closeBtn = document.getElementById('muse-close-btn');
  const sendBtn = document.getElementById('muse-send-btn');
  const input = document.getElementById('muse-input');
  const chatHistory = document.getElementById('muse-chat-history');
  const chips = document.querySelectorAll('.muse-chip');

  if (!triggerBtn || !modal) return;

  function openModal() {
    modal.classList.add('open');
  }

  function closeModal() {
    modal.classList.remove('open');
  }

  triggerBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  const bariKnowledge = {
    method45: 'The 45 Method is Bari Abder’s proprietary system designed for busy founders & executives. It requires only 45 minutes of your time per week for a 1-on-1 extraction interview. Bari’s team handles the strategy, writing, video editing, and distribution to turn your knowledge into high-converting inbound assets.',
    audience: 'The 45 Method is built specifically for founders, CEOs, high-ticket consultants, and industry leaders who have deep real-world expertise but zero time to write or create content from scratch.',
    results: 'Clients transition from unpredictable outbound prospecting to consistent inbound authority, generating qualified consultation bookings, partnerships, and high-ticket client deals through LinkedIn, X, Substack, and short-form video.',
    apply: 'You can apply directly through the 8-step qualification form on bariabder.com/the45method/ or reach out directly via email at bari@bariabder.com or on LinkedIn.',
    default: 'Bari Abder helps founders and leaders build self-sustaining personal brands through The 45 Method. Ask about the 45-minute weekly workflow, target audience, content repurposing, or how to apply!'
  };

  function appendMessage(text, sender) {
    if (!chatHistory) return;
    const msg = document.createElement('div');
    msg.className = `muse-message ${sender}`;
    msg.textContent = text;
    chatHistory.appendChild(msg);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  function handleQuery(query) {
    if (!query.trim()) return;
    appendMessage(query, 'user');

    const lower = query.toLowerCase();
    setTimeout(() => {
      let reply = bariKnowledge.default;
      if (lower.includes('45 method') || lower.includes('how it works') || lower.includes('system') || lower.includes('method')) {
        reply = bariKnowledge.method45;
      } else if (lower.includes('who') || lower.includes('client') || lower.includes('founder') || lower.includes('target')) {
        reply = bariKnowledge.audience;
      } else if (lower.includes('result') || lower.includes('proof') || lower.includes('lead') || lower.includes('inbound')) {
        reply = bariKnowledge.results;
      } else if (lower.includes('apply') || lower.includes('book') || lower.includes('contact') || lower.includes('cost') || lower.includes('hire')) {
        reply = bariKnowledge.apply;
      }
      appendMessage(reply, 'bot');
    }, 400);
  }

  if (sendBtn && input) {
    sendBtn.addEventListener('click', () => {
      const q = input.value;
      input.value = '';
      handleQuery(q);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = input.value;
        input.value = '';
        handleQuery(q);
      }
    });
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt') || chip.textContent;
      handleQuery(prompt);
    });
  });
}

/* ==========================================================================
   7. HOW I STAY SHARP TABS
   ========================================================================== */
function initStaySharpTabs() {
  const tabButtons = document.querySelectorAll('.sharp-tab-btn');
  const podcastGrid = document.getElementById('sharp-podcasts-grid');
  const booksGrid = document.getElementById('sharp-books-grid');

  if (!tabButtons.length || !podcastGrid || !booksGrid) return;

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (target === 'podcasts') {
        podcastGrid.style.display = 'grid';
        booksGrid.style.display = 'none';
      } else {
        podcastGrid.style.display = 'none';
        booksGrid.style.display = 'grid';
      }
    });
  });
}

/* ==========================================================================
   8. REEL PREVIEW MODAL
   ========================================================================== */
let reelModalRef = null;
let reelIframeRef = null;

function openReelModal(reelUrl) {
  if (!reelModalRef || !reelIframeRef) {
    window.open(reelUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  const match = reelUrl.match(/\/reel\/([A-Za-z0-9_-]+)/);
  if (!match || !match[1]) {
    window.open(reelUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  const reelExternalLink = document.getElementById('reelExternalLink');
  reelIframeRef.src = `https://www.instagram.com/reel/${match[1]}/embed/`;
  if (reelExternalLink) reelExternalLink.href = reelUrl;
  reelModalRef.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeReelModal() {
  if (!reelModalRef) return;
  reelModalRef.classList.remove('open');
  if (reelIframeRef) reelIframeRef.src = '';
  document.body.style.overflow = 'auto';
}

function initReelPreviewModal() {
  reelModalRef = document.getElementById('reelPreviewModal');
  reelIframeRef = document.getElementById('reelEmbedIframe');
  if (!reelModalRef) return;

  document.querySelectorAll('.reel-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const href = card.getAttribute('href');
      if (href) openReelModal(href);
    });
  });

  reelModalRef.addEventListener('click', (e) => {
    if (e.target === reelModalRef) closeReelModal();
  });
}

/* ==========================================================================
   9. MULTI-STEP FORM & BOOKING MODAL (FIXED GOOGLE SHEETS PAYLOAD)
   ========================================================================== */
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHeIRIApO_vqvJbRzTs7lN11-KBKLKty5gNFjeGtA2yRYeg3zke0Z0ruCFYjsxt6USVg/exec';

let bookingModalRef = null;
let currentStep = 1;
const totalSteps = 8;

function openBookingModal() {
  if (!bookingModalRef) return;
  bookingModalRef.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeBookingModal() {
  if (!bookingModalRef) return;
  bookingModalRef.classList.remove('open');
  document.body.style.overflow = 'auto';
}

function updateProgress() {
  const fill = document.getElementById('formProgress');
  if (fill) {
    fill.style.width = ((currentStep / totalSteps) * 100) + '%';
  }
}

function showStep(stepNumber) {
  document.querySelectorAll('.form-step').forEach(step => {
    step.classList.remove('active');
  });
  const target = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
  if (target) {
    target.classList.add('active');
    currentStep = stepNumber;
    updateProgress();
  }
}

function nextStep() {
  if (currentStep < totalSteps) {
    setTimeout(() => {
      showStep(currentStep + 1);
    }, 200);
  }
}

function prevStep() {
  if (currentStep > 1) {
    showStep(currentStep - 1);
  }
}

function validateContactAndNext() {
  const nameInput = document.getElementById('fullName');
  const phoneInput = document.getElementById('phone');

  const name = nameInput ? nameInput.value.trim() : '';
  const rawPhone = phoneInput ? phoneInput.value.trim() : '';

  if (!name) {
    alert('عافاك دخل الاسم الكامل.');
    return;
  }

  const cleanPhone = rawPhone.replace(/[\s\-\(\)]/g, '');
  let isValid = false;

  if (cleanPhone.startsWith('+212')) {
    const afterCode = cleanPhone.slice(4);
    if (/^\d{9}$/.test(afterCode)) isValid = true;
  } else if (cleanPhone.startsWith('00212')) {
    const afterCode = cleanPhone.slice(5);
    if (/^\d{9}$/.test(afterCode)) isValid = true;
  } else if (cleanPhone.startsWith('0')) {
    if (/^\d{10}$/.test(cleanPhone)) isValid = true;
  }

  if (!isValid) {
    alert('عافاك تأكد من رقم الهاتف: إذا بديتي بـ +212 خاص يكونو 9 ديال الأرقام موراها (مثال: +212 655438567) أو دخل رقم محلي (مثال: 0655438567).');
    return;
  }

  nextStep();
}

function updateBudgetValue(val) {
  const formatted = Number(val).toLocaleString();
  const label = document.getElementById('budgetValue');
  if (label) {
    label.textContent = formatted;
  }
}

function enableSubmitButton() {
  const submitBtn = document.getElementById('submitFormBtn');
  if (submitBtn) submitBtn.disabled = false;
}

function initMultiStepFormAndBookingModal() {
  bookingModalRef = document.getElementById('bookingModal');
  if (bookingModalRef) {
    bookingModalRef.addEventListener('click', (e) => {
      if (e.target === bookingModalRef) closeBookingModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (bookingModalRef && bookingModalRef.classList.contains('open')) closeBookingModal();
      if (reelModalRef && reelModalRef.classList.contains('open')) closeReelModal();
    }
  });

  const formElement = document.getElementById('otmMultiStepForm');
  if (!formElement) return;

  formElement.addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitFormBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'جاري الإرسال...';
    }

    const formData = new FormData(formElement);

    const payload = {
      fullName: (formData.get('fullName') || '').toString().trim(),
      phone: (formData.get('phone') || '').toString().trim(),
      niche: (formData.get('niche') || 'N/A').toString(),
      currentPresence: (formData.get('currentPresence') || 'N/A').toString(),
      biggestObstacle: (formData.get('biggestObstacle') || 'N/A').toString(),
      goal: (formData.get('goal') || 'N/A').toString(),
      commitment45: (formData.get('commitment45') || 'N/A').toString(),
      budget: (formData.get('budget') || '6000').toString(),
      timeline: (formData.get('timeline') || 'N/A').toString()
    };

    try {
      // Matches JSON.parse(e.postData.contents) in Google Apps Script doPost(e)
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload)
      });

      document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
      });

      const progressBar = document.querySelector('.flow-progress-bar');
      if (progressBar) progressBar.style.display = 'none';

      const thankYouStep = document.getElementById('thankYouStep');
      if (thankYouStep) thankYouStep.classList.add('active');
    } catch (error) {
      console.error('Submission error:', error);
      alert('وقع مشكل فالإرسال. عافاك حاول مرة أخرى.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'تأكيد وإرسال الطلب';
      }
    }
  });
}

/* ==========================================================================
   10. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  document.querySelectorAll('.faq-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      if (!item) return;
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(other => {
        other.classList.remove('active');
        const icon = other.querySelector('.faq-icon');
        if (icon) icon.textContent = '+';
      });
      if (!isActive) {
        item.classList.add('active');
        const icon = item.querySelector('.faq-icon');
        if (icon) icon.textContent = '—';
      }
    });
  });
}

/* ==========================================================================
   11. TIME-BASED THEME TOGGLE (7 PM - 7 AM DARK / 7 AM - 7 PM LIGHT)
   ========================================================================== */
function initTimeBasedTheme() {
  const toggleBtn = document.getElementById('themeToggle');
  if (!toggleBtn) return;

  function isNightTime() {
    const hour = new Date().getHours();
    return hour >= 19 || hour < 7;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme-override', next);
    localStorage.setItem('theme-override-time', Date.now().toString());
    applyTheme(next);
  });

  setInterval(() => {
    const overrideTime = Number(localStorage.getItem('theme-override-time') || 0);
    const sixHours = 6 * 60 * 60 * 1000;
    if (!overrideTime || Date.now() - overrideTime > sixHours) {
      localStorage.removeItem('theme-override');
      applyTheme(isNightTime() ? 'dark' : 'light');
    }
  }, 60 * 1000);
}