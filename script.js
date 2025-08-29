/* ------------------------------------------------------------------
   Unified script: lead form, modal, UI widgets, Chart + simulator
   - Requires Chart.js to be loaded on the page.
   - Keeps element IDs/classes you used:
     #marketGrowthChart, .category-btn, #investmentAmount, #startYear,
     #resultBox, #finalAmount, #totalReturn, #cagrUsed, #leadForm, #leadModal
   ------------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* =========================
     Config / helpers
     ========================= */
  const START_YEAR = 2015;
  const CURRENT_YEAR = new Date().getFullYear();
  const YEARS = Array.from({ length: CURRENT_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);

  const baseNiftySamples = [10000, 11000, 12500, 13000, 15000, 14000, 18000, 21000, 20000, 24000, 25000]; // 2015..2025 seed

  const fmtINR = (v) => '₹' + Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  const safeParseNumber = (str) => {
    if (typeof str === 'number') return Number(str);
    if (!str && str !== 0) return NaN;
    // allow comma separators
    return parseFloat(String(str).replace(/,/g, '').trim());
  };
  const parseCagr = (v) => {
    if (v == null) return NaN;
    let s = String(v).trim();
    if (s.endsWith('%')) s = s.slice(0, -1);
    const n = safeParseNumber(s);
    if (!isFinite(n)) return NaN;
    // convert percent like "10" -> 0.10; if already decimal (0.10) keep as is
    if (n > 1) return n / 100;
    return n;
  };

  function buildNiftyData(years, seedArray) {
    // returns array length === years.length
    const result = seedArray.slice();
    if (result.length >= years.length) return result.slice(0, years.length).map(Math.round);
    // extend by approximating last growth rate
    let last = result[result.length - 1] || 10000;
    const prev = result[result.length - 2] || last;
    let approxCagr = prev > 0 ? (last / prev) - 1 : 0.08;
    if (!isFinite(approxCagr) || approxCagr <= -1) approxCagr = 0.08;
    while (result.length < years.length) {
      last = last * (1 + approxCagr);
      result.push(Math.round(last));
    }
    return result.map(Math.round);
  }

  function computeHighlightIndices(years, highlights = [2019, 2022, CURRENT_YEAR]) {
    return highlights.map(y => years.indexOf(y)).filter(i => i >= 0);
  }

  /* =========================
     Element references
     ========================= */
  // Lead form & modal elements
  const leadForm = document.getElementById('leadForm');
  const formContainer = document.getElementById('form-container');
  const confirmationMessage = document.getElementById('confirmationMessage');
  const leadModal = document.getElementById('leadModal');
  const closeBtn = document.getElementById('closeBtn');
  const ctaButtons = Array.from(document.querySelectorAll('.cta-button') || []);
  const bottomBarForm = document.getElementById('bottomBarForm');
  const heroImage = document.getElementById('heroImage');

  // Chart & simulator elements
  const chartCanvas = document.getElementById('marketGrowthChart');
  const simCategoryButtons = Array.from(document.querySelectorAll('.category-btn') || []);
  const simAmountInput = document.getElementById('investmentAmount');
  const simYearSelect = document.getElementById('startYear');
  const simResultBox = document.getElementById('resultBox');
  const simFinalAmountEl = document.getElementById('finalAmount');
  const simTotalReturnEl = document.getElementById('totalReturn');
  const simCagrUsedEl = document.getElementById('cagrUsed');

  /* =========================
     Lead form + modal logic
     ========================= */
  const openModal = () => {
    if (formContainer && confirmationMessage) {
      formContainer.style.display = 'block';
      confirmationMessage.style.display = 'none';
    }
    if (leadModal) leadModal.classList.add('show');
  };
  const closeModal = () => {
    if (leadModal) leadModal.classList.remove('show');
  };

  // Wire CTA buttons (skip those inside forms)
  ctaButtons.forEach(btn => {
    if (!btn.closest('form')) btn.addEventListener('click', openModal);
  });
  if (heroImage) heroImage.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (leadModal) leadModal.addEventListener('click', (e) => { if (e.target === leadModal) closeModal(); });

  // bottomBar read-only inputs open modal
  if (bottomBarForm) {
    const bottomBarNameInput = bottomBarForm.querySelector('input[name="name"]');
    const bottomBarPhoneInput = bottomBarForm.querySelector('input[name="phone"]');
    if (bottomBarNameInput) {
      bottomBarNameInput.setAttribute('readonly', 'readonly');
      bottomBarNameInput.addEventListener('click', openModal);
      bottomBarNameInput.addEventListener('focus', openModal);
    }
    if (bottomBarPhoneInput) {
      bottomBarPhoneInput.setAttribute('readonly', 'readonly');
      bottomBarPhoneInput.addEventListener('click', openModal);
      bottomBarPhoneInput.addEventListener('focus', openModal);
    }
    bottomBarForm.addEventListener('submit', (ev) => { ev.preventDefault(); openModal(); });
  }

  // Lead form submission with async fetch to /api/submit
if (leadForm) {
  leadForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const name = (leadForm.name?.value || '').trim();
    const phone = (leadForm.phone?.value || '').trim();

    // quick validation
    if (!name || !/^[0-9]{10}$/.test(phone)) {
      alert('Please enter a valid name and 10-digit phone number.');
      return;
    }

    const submitButton = leadForm.querySelector('button[type="submit"]');
    const originalText = submitButton?.textContent || '';

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
      }

      // fire-and-forget request (don’t block UI for response)
      fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone })
      }).catch(err => console.error("Lead submit failed:", err));

      // immediately show confirmation (don’t wait for server)
      if (formContainer && confirmationMessage) {
        formContainer.style.display = 'none';
        confirmationMessage.style.display = 'block';
      }

    } finally {
      if (leadForm) leadForm.reset();
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
      // faster close – 600ms is enough for user to see it
      setTimeout(() => closeModal(), 600);
    }
  });
}


  /* =========================
     UI: accordion, tabs, observers
     ========================= */
  // Accordion
  const accordionItems = document.querySelectorAll('.accordion-item');
  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');
    if (!header || !content) return;
    header.addEventListener('click', () => {
      item.classList.toggle('active');
      if (item.classList.contains('active')) {
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        content.style.maxHeight = null;
      }
    });
  });

  // Tabs
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      tabContents.forEach(c => c.classList.toggle('active', c.id === tabId));
    });
  });

  // Section fade-in observer
  const allSections = document.querySelectorAll('section');
  const sectionObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  allSections.forEach(s => sectionObserver.observe(s));

  // Compounding graph animation observer
  const compoundingGraph = document.getElementById('compoundingGraph');
  if (compoundingGraph) {
    const gObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    gObserver.observe(compoundingGraph);
  }

  // Popup on scroll once past 50% of page
  let popupShown = false;
  window.addEventListener('scroll', () => {
    if (popupShown) return;
    const scrollPosition = window.scrollY + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;
    if ((scrollPosition / pageHeight) >= 0.5) {
      popupShown = true;
      if (leadModal && !leadModal.classList.contains('show')) openModal();
    }
  });

  /* =========================
     Chart.js & Simulator (enhanced)
     ========================= */
  // Bail if chart canvas missing or Chart not loaded
  if (!chartCanvas) {
    console.warn('Chart canvas (#marketGrowthChart) not found - chart & sim disabled.');
  } else if (typeof Chart === 'undefined') {
    console.warn('Chart.js not found. Please include Chart.js before this script.');
  } else {
    const chartCtx = chartCanvas.getContext('2d');

    // build NIFTY data to match YEARS
    const niftyData = buildNiftyData(YEARS, baseNiftySamples);
    const highlightIndices = computeHighlightIndices(YEARS);

    // Prepare year select inclusive
    if (simYearSelect) {
      simYearSelect.innerHTML = '';
      for (let y = START_YEAR; y <= CURRENT_YEAR; y++) {
        const opt = document.createElement('option');
        opt.value = String(y);
        opt.textContent = String(y);
        simYearSelect.appendChild(opt);
      }
      simYearSelect.value = String(Math.max(START_YEAR, 2015));
    }

    // Chart config - dataset 0 = NIFTY, dataset 1 = userInvestment (starts hidden)
    const initialUserData = YEARS.map(() => null);
    const marketChart = new Chart(chartCtx, {
      type: 'line',
      data: {
        labels: YEARS,
        datasets: [
          {
            label: 'NIFTY 50 INDEX',
            data: niftyData,
            borderColor: 'rgba(8,83,183,0.95)',
            backgroundColor: 'rgba(8,83,183,0.06)',
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointBackgroundColor: (ctx) => highlightIndices.includes(ctx.dataIndex) ? 'rgba(255, 250, 99, 1)' : 'rgba(8,83,183,0.95)',
            pointRadius: (ctx) => highlightIndices.includes(ctx.dataIndex) ? 6 : 3,
            pointHoverRadius: 7,
          },
          {
            label: 'Your investment',
            data: initialUserData,
            borderColor: 'rgba(255,99,132,0.95)',
            backgroundColor: 'rgba(255,99,132,0.06)',
            fill: false,
            tension: 0.35,
            borderWidth: 2,
            pointBackgroundColor: (ctx) => (ctx.raw ? 'rgba(255,99,132,1)' : 'rgba(255,99,132,0.0)'),
            pointRadius: (ctx) => (ctx.raw ? 4 : 0),
            pointHoverRadius: 6,
            hidden: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900, easing: 'easeOutQuart' },
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, font: { family: "'Manrope', sans-serif", size: 12 } } },
          tooltip: {
            backgroundColor: '#0A2342',
            titleFont: { family: "'Manrope', sans-serif", size: 13 },
            bodyFont: { family: "'Manrope', sans-serif", size: 12 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const val = context.parsed?.y;
                if (val == null || isNaN(val)) return `${label}: —`;
                return label === 'NIFTY 50 INDEX' ? `${label}: ${Number(val).toLocaleString('en-IN')}` : `${label}: ${fmtINR(val)}`;
              }
            }
          }
        },
        scales: {
          y: {
            grid: { color: '#E5E7EB', borderDash: [5, 5] },
            ticks: {
              callback: (value) => (Math.abs(value) >= 1000 ? '₹' + Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : value),
              font: { family: "'Manrope', sans-serif" }
            }
          },
          x: { grid: { display: false }, ticks: { font: { family: "'Manrope', sans-serif" } } }
        }
      }
    });

    // compute user's per-year series (lump-sum compound)
    function computeUserSeries(principal, startYear, cagrDecimal) {
      return YEARS.map(year => {
        if (year < startYear) return null;
        const yearsDiff = year - startYear;
        const val = principal * Math.pow(1 + cagrDecimal, yearsDiff);
        return isFinite(val) ? Math.round(val) : null;
      });
    }

    function revealUserSeries(series) {
      const ds = marketChart.data.datasets[1];
      ds.data = series;
      ds.hidden = false;
      marketChart.update({ duration: 900, easing: 'easeOutQuart' });
    }

    function hideUserSeries() {
      const ds = marketChart.data.datasets[1];
      ds.data = YEARS.map(() => null);
      ds.hidden = true;
      marketChart.update({ duration: 300 });
    }

    /* Calculator handling integrated with chart */
    function calculateGrowth() {
      if (!simAmountInput || !simYearSelect || !simResultBox) return;
      const principal = safeParseNumber(simAmountInput.value);
      const startYear = parseInt(simYearSelect.value, 10);

      // Scale NIFTY data baseline to match user input principal
const scaledNiftyData = niftyData.map((val, idx) => {
  if (YEARS[idx] < startYear) return null;
  const scaleFactor = principal / niftyData[YEARS.indexOf(startYear)];
  return Math.round(val * scaleFactor);
});
marketChart.data.datasets[0].data = scaledNiftyData;


      // active category button
      const activeBtn = document.querySelector('.category-selector .category-btn.active');
      if (!activeBtn || !isFinite(principal) || principal < 1000 || !isFinite(startYear)) {
        // hide results & user series
        if (simResultBox) simResultBox.style.display = 'none';
        hideUserSeries();
        return;
      }

      const rawCagr = activeBtn.dataset.cagr;
      const cagr = parseCagr(rawCagr);
      if (!isFinite(cagr)) {
        if (simResultBox) simResultBox.style.display = 'none';
        hideUserSeries();
        return;
      }

      const durationYears = CURRENT_YEAR - startYear;
      if (durationYears < 0) {
        if (simResultBox) simResultBox.style.display = 'none';
        hideUserSeries();
        return;
      }

      const finalAmount = principal * Math.pow(1 + cagr, durationYears);
      const totalReturnPercent = ((finalAmount - principal) / principal) * 100;

      if (simFinalAmountEl) simFinalAmountEl.textContent = fmtINR(Math.round(finalAmount));
      if (simTotalReturnEl) simTotalReturnEl.textContent = `${totalReturnPercent.toFixed(1)}%`;
      if (simCagrUsedEl) simCagrUsedEl.textContent = `${(cagr * 100).toFixed(2)}%`;
      if (simResultBox) simResultBox.style.display = 'block';

      // compute series and animate in
      const userSeries = computeUserSeries(principal, startYear, cagr);
      revealUserSeries(userSeries);
      marketChart.update({ duration: 900, easing: 'easeOutQuart' });

    }

    // category buttons
    simCategoryButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        simCategoryButtons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-checked', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
        calculateGrowth();
      });
    });

    // inputs
    if (simAmountInput) {
      simAmountInput.addEventListener('input', () => calculateGrowth());
      simAmountInput.addEventListener('change', () => calculateGrowth());
    }
    if (simYearSelect) simYearSelect.addEventListener('change', () => calculateGrowth());

    // initial default
    setTimeout(() => {
      if (simAmountInput && !simAmountInput.value) simAmountInput.value = '10000';
      // if a category already active, run calc
      if (document.querySelector('.category-selector .category-btn.active')) calculateGrowth();
    }, 150);
  } // end chart block

  /* =========================
     Animated highlight number (when in viewport)
     ========================= */
  function animateNumberTo(el, start, end, ms = 1200, suffix = '') {
    if (!el) return;
    const frames = Math.round(ms / 16);
    let frame = 0;
    const step = (end - start) / frames;
    let value = start;
    const raf = () => {
      frame++;
      value += step;
      if (frame >= frames) {
        el.textContent = `${fmtINR(end)}${suffix}`;
      } else {
        el.textContent = `${fmtINR(Math.round(value))}${suffix}`;
        requestAnimationFrame(raf);
      }
    };
    requestAnimationFrame(raf);
  }

  function isInViewport(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.top < (window.innerHeight || document.documentElement.clientHeight) && rect.bottom > 0;
  }

  const highlightEl = document.getElementById('highlight-value');
  let highlightAnimated = false;
  document.addEventListener('scroll', () => {
    if (highlightAnimated) return;
    if (highlightEl && isInViewport(highlightEl)) {
      highlightAnimated = true;
      animateNumberTo(highlightEl, 0, 1580000, 1600, ''); // example: 15.8 L? (adjust based on your data)
    }
  }, { passive: true });

  // also check on load in case it's already visible
  setTimeout(() => {
    if (!highlightAnimated && highlightEl && isInViewport(highlightEl)) {
      highlightAnimated = true;
      animateNumberTo(highlightEl, 0, 1580000, 1600, '');
    }
  }, 300);

  /* =========================
     End DOMContentLoaded
     ========================= */
}); // end DOMContentLoaded
