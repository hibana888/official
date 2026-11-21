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
