/* ==========================================================================
   BARI ABDER // THE 45 METHOD — MAIN JAVASCRIPT
   ========================================================================== */

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHeIRIApO_vqvJbRzTs7lN11-KBKLKty5gNFjeGtA2yRYeg3zke0Z0ruCFYjsxt6USVg/exec';

let bookingModalRef = null;
let reelModalRef = null;
let currentStep = 1;
const totalSteps = 8;

/* ==========================================================================
   MODAL CONTROLS
   ========================================================================== */

function getBookingModal() {
  if (!bookingModalRef) {
    bookingModalRef = document.getElementById('bookingModal');
  }
  return bookingModalRef;
}

function getReelModal() {
  if (!reelModalRef) {
    reelModalRef = document.getElementById('reelPreviewModal');
  }
  return reelModalRef;
}

function openBookingModal() {
  const modal = getBookingModal();
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeBookingModal() {
  const modal = getBookingModal();
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = 'auto';
}

function openReelModal(iframeSrc, externalUrl) {
  const modal = getReelModal();
  if (!modal) return;
  if (iframeSrc) {
    const iframe = document.getElementById('reelEmbedIframe');
    if (iframe) iframe.src = iframeSrc;
  }
  if (externalUrl) {
    const extLink = document.getElementById('reelExternalLink');
    if (extLink) extLink.href = externalUrl;
  }
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeReelModal() {
  const modal = getReelModal();
  if (!modal) return;
  modal.classList.remove('open');
  const iframe = document.getElementById('reelEmbedIframe');
  if (iframe) iframe.src = '';
  document.body.style.overflow = 'auto';
}

/* ==========================================================================
   MULTI-STEP BOOKING FORM
   ========================================================================== */

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
    }, 180);
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
    if (nameInput) nameInput.focus();
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
  } else if (/^\+?\d{8,15}$/.test(cleanPhone)) {
    // Fallback for international or other standard mobile numbers
    isValid = true;
  }

  if (!isValid) {
    alert('عافاك تأكد من رقم الهاتف (مثال: 0650123456 أو +212650123456).');
    if (phoneInput) phoneInput.focus();
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
  reelModalRef = document.getElementById('reelPreviewModal');

  if (bookingModalRef) {
    bookingModalRef.addEventListener('click', (e) => {
      if (e.target === bookingModalRef) closeBookingModal();
    });
  }

  if (reelModalRef) {
    reelModalRef.addEventListener('click', (e) => {
      if (e.target === reelModalRef) closeReelModal();
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
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
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
   FAQ ACCORDION
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
   THEME TOGGLE (DARK / LIGHT)
   ========================================================================== */

function isNightTime() {
  const hour = new Date().getHours();
  return hour >= 19 || hour < 7;
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('theme-override', theme);
    localStorage.setItem('theme-override-time', Date.now().toString());
  } catch (e) {
    console.warn('LocalStorage unavailable:', e);
  }
}

let lastToggleTimestamp = 0;

function toggleTheme(e) {
  if (e && e.preventDefault) {
    e.preventDefault();
  }
  const now = Date.now();
  if (now - lastToggleTimestamp < 250) {
    return; // Ignore rapid double-fire
  }
  lastToggleTimestamp = now;

  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

function initTimeBasedTheme() {
  const toggleBtn = document.getElementById('themeToggle');
  if (toggleBtn) {
    toggleBtn.onclick = toggleTheme;
  }

  // Check every minute if 6h override expired to sync with daylight
  setInterval(() => {
    try {
      const overrideTime = Number(localStorage.getItem('theme-override-time') || 0);
      const sixHours = 6 * 60 * 60 * 1000;
      if (!overrideTime || Date.now() - overrideTime > sixHours) {
        localStorage.removeItem('theme-override');
        const autoTheme = isNightTime() ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', autoTheme);
      }
    } catch (e) {}
  }, 60 * 1000);
}

/* ==========================================================================
   PAGE INITIALIZATION
   ========================================================================== */

function initAll() {
  initMultiStepFormAndBookingModal();
  initTimeBasedTheme();
  initFaqAccordion();

  // If a loader exists, dismiss it cleanly
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 600);
    }, 200);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
