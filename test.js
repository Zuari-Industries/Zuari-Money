// --- GOOGLE SHEETS SUBMISSION (Your Original Code) ---
const leadForm = document.getElementById('leadForm');
const formContainer = document.getElementById('form-container');
const confirmationMessage = document.getElementById('confirmationMessage');

// This event listener is attached directly to the form, so it can be outside DOMContentLoaded
// --- ENHANCED DOWNLOAD WITH LEAD CAPTURE ---
// --- FILE DOWNLOAD FUNCTIONALITY ---
// const downloadButton = document.getElementById('downloadKit');
// if (downloadButton) {
//     downloadButton.addEventListener('click', () => {
//         // Method 1: Direct file download (recommended)
//         const link = document.createElement('a');
//         link.href = 'assets/Zuari-Finserv-Mutual-Fund-Starter-Kit.pdf'; // Your file path
//         link.download = 'Zuari-Finserv-Mutual-Fund-Starter-Kit.pdf';
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
        
//         // Optional: Track download event
//         console.log('Starter Kit downloaded');
        
//         // Optional: Show success message
//         alert('Thank you! Your Mutual Fund Starter Kit is downloading now.');
        
//         // Optional: Also open modal for lead capture
//         // openModal(); // Uncomment if you want to capture lead info after download
//     });
// }


if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = leadForm.name.value.trim();
      const phone = leadForm.phone.value.trim();

      if (!name || !phone.match(/^[0-9]{10}$/)) {
        alert('Please enter a valid name and 10-digit phone number.');
        return;
      }

      const submitButton = leadForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton ? submitButton.textContent : '';
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
      }

      try {
  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone })
  });

  const data = await response.json();

  if (data.success) {
    formContainer.style.display = 'none';
    confirmationMessage.style.display = 'block';
    leadForm.reset();
  } else {
    throw new Error(data.error || 'Submission failed');
  }
} catch (error) {
  console.log('Error submitting form:', error);
  formContainer.style.display = 'none';
  confirmationMessage.style.display = 'block';
  leadForm.reset();
} finally {
  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
}

    });
}


// --- MAIN DOM CONTENT LOADED EVENT LISTENER ---
document.addEventListener('DOMContentLoaded', () => {
    // --- MODAL AND FORM LOGIC (Your Original Code) ---
    const leadModal = document.getElementById('leadModal');
    const closeBtn = document.getElementById('closeBtn');
    const ctaButtons = document.querySelectorAll('.cta-button');
    const bottomBarForm = document.getElementById('bottomBarForm');
    const heroImage = document.getElementById('heroImage');

    document.addEventListener("DOMContentLoaded", () => {
    const defaultInvestment = 10000;
    const defaultYear = 2015;

    document.getElementById("investment").value = defaultInvestment;
    document.getElementById("year").value = defaultYear;

    // trigger chart once with defaults
    updateChart(defaultInvestment, defaultYear);
});

    
    const openModal = () => {
        const formContainer = document.getElementById('form-container');
        const confirmationMessage = document.getElementById('confirmationMessage');
        if (formContainer && confirmationMessage) {
            formContainer.style.display = 'block';
            confirmationMessage.style.display = 'none';
        }
        if (leadModal) {
            leadModal.classList.add('show');
        }
    };
    const closeModal = () => {
        if (leadModal) {
            leadModal.classList.remove('show');
        }
    };
    
    ctaButtons.forEach(button => {
        if (!button.closest('form')) {
            button.addEventListener('click', openModal);
        }
    });
    if (heroImage) {
        heroImage.addEventListener('click', openModal);
    }
    if(closeBtn) closeBtn.addEventListener('click', closeModal);
    if(leadModal) leadModal.addEventListener('click', (e) => {
        if (e.target === leadModal) closeModal();
    });

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
        bottomBarForm.addEventListener('submit', (event) => {
            event.preventDefault();
            openModal();
        });
    }

    // This is a simplified UI handler for the modal form, separate from the Google Sheets logic
    const handleFormSubmit = (event) => {
        event.preventDefault();
        // The actual submission is handled by the listener at the top of the file.
        // This function just provides UI feedback.
        const formContainer = document.getElementById('form-container');
        const confirmationMessage = document.getElementById('confirmationMessage');
        
        if (formContainer && confirmationMessage) {
            console.log('Displaying confirmation for:', {
                name: event.target.elements.name.value,
                phone: event.target.elements.phone.value,
            });
            
            if (!leadModal.classList.contains('show')) {
                openModal();
            }

            formContainer.style.display = 'none';
            confirmationMessage.style.display = 'block';
            setTimeout(() => {
                closeModal();
                // Reset form UI after modal is fully closed
                setTimeout(() => formContainer.style.display = 'block', 300);
            }, 3000);
        }
    };
    
    // The main leadForm's submit is already handled by the Google Sheets script.
    // This listener is for UI feedback only.
    if (document.getElementById('leadForm')) {
        document.getElementById('leadForm').addEventListener('submit', handleFormSubmit);
    }


    // --- ACCORDION SCRIPT (Your Original Code) ---
    const accordionItems = document.querySelectorAll('.accordion-item');
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');
        header.addEventListener('click', () => {
            item.classList.toggle('active');
            if (item.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });
    
    // --- TAB SCRIPT (Your Original Code) ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const tabId = button.getAttribute('data-tab');
            tabContents.forEach(content => {
                content.classList.toggle('active', content.id === tabId);
            });
        });
    });

    // --- SECTION FADE-IN (Your Original Code) ---
    const allSections = document.querySelectorAll('section');
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    allSections.forEach(section => {
        sectionObserver.observe(section);
    });
    
    // --- COMPOUNDING GRAPH ANIMATION (Your Original Code) ---
    const compoundingGraph = document.getElementById('compoundingGraph');
    if (compoundingGraph) {
        const graphObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        graphObserver.observe(compoundingGraph);
    }

    // --- POPUP ON SCROLL (Your Original Code) ---
    let popupShown = false;
    window.addEventListener('scroll', () => {
        if (popupShown) return;
        const scrollPosition = window.scrollY + window.innerHeight;
        const pageHeight = document.documentElement.scrollHeight;
        if (scrollPosition / pageHeight >= 0.5) {
            popupShown = true;
            if (leadModal && !leadModal.classList.contains('show')) {
                openModal();
            }
        }
    });

    // --- FIXED: CHART.JS MARKET GROWTH GRAPH LOGIC ---
    const ctx = document.getElementById('marketGrowthChart');
    if (ctx) {
        const years = Array.from({ length: 11 }, (_, i) => 2015 + i);
        const growthData = [10000, 11000, 12500, 13000, 15000, 14000, 18000, 21000, 20000, 24000, 25000]; // Sample data

        const highlightIndices = [years.indexOf(2019), years.indexOf(2022), years.indexOf(2025)];

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'NIFTY 50 INDEX',
                    data: growthData,
                    borderColor: 'rgba(77, 255, 0, 0.8)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: (context) => highlightIndices.includes(context.dataIndex) ? 'rgba(255, 250, 99, 1)' : 'rgba(90, 110, 1, 0.8)',
                    pointRadius: (context) => highlightIndices.includes(context.dataIndex) ? 6 : 4,
                    pointHoverRadius: 8,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // CHANGED: This was true, now false for better control
                plugins: {
                    legend: { 
                        position: 'top', 
                        align: 'end', 
                        labels: { 
                            boxWidth: 12, 
                            font: { family: "'Manrope', sans-serif", size: 12 } 
                        } 
                    },
                    tooltip: {
                        backgroundColor: '#0A2342',
                        titleFont: { family: "'Manrope', sans-serif", size: 14 },
                        bodyFont: { family: "'Manrope', sans-serif", size: 12 },
                        padding: 10,
                        cornerRadius: 8,
                        callbacks: { label: (context) => `Index: ${context.parsed.y}` }
                    }
                },
                scales: {
                    y: { 
                        grid: { color: '#E5E7EB', borderDash: [5, 5] }, 
                        ticks: { font: { family: "'Manrope', sans-serif" } }
                    },
                    x: { 
                        grid: { display: false }, 
                        ticks: { font: { family: "'Manrope', sans-serif" } }
                    }
                }
            }
        });
    }

    // --- FIXED: INVESTMENT SIMULATOR LOGIC ---
    const simCategoryButtons = document.querySelectorAll('.category-btn');
    const simAmountInput = document.getElementById('investmentAmount');
    const simYearSelect = document.getElementById('startYear');
    const simResultBox = document.getElementById('resultBox');
    const simFinalAmountEl = document.getElementById('finalAmount');
    const simTotalReturnEl = document.getElementById('totalReturn');
    const simCagrUsedEl = document.getElementById('cagrUsed');

    // FIXED: Year dropdown population
    if (simYearSelect) {
        const currentYear = 2025; // CHANGED: Fixed to 2025 instead of new Date().getFullYear()
        // Clear existing options first
        simYearSelect.innerHTML = '';
        for (let year = 2015; year < currentYear; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            simYearSelect.appendChild(option);
        }
        simYearSelect.value = currentYear - 5; // Default to 2020
    }

    const calculateGrowth = () => {
        if (!simAmountInput || !simYearSelect || !simResultBox) return;

        const principal = parseFloat(simAmountInput.value);
        const startYear = parseInt(simYearSelect.value);
        const activeCategoryBtn = document.querySelector('.category-selector .category-btn.active');

        if (!principal || !startYear || !activeCategoryBtn || principal < 1000) {
            simResultBox.style.display = 'none'; // CHANGED: Use style.display instead of hidden
            return;
        }

        const cagr = parseFloat(activeCategoryBtn.dataset.cagr);
        const years = 2025 - startYear;
        const finalAmount = principal * Math.pow((1 + cagr), years);
        const totalReturn = ((finalAmount - principal) / principal) * 100;

        simFinalAmountEl.textContent = `₹${finalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
        simTotalReturnEl.textContent = `${totalReturn.toFixed(1)}%`;
        simCagrUsedEl.textContent = `${(cagr * 100).toFixed(0)}%`;
        simResultBox.style.display = 'block'; // CHANGED: Use style.display instead of hidden
    };

    // FIXED: Category button event listeners
    simCategoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // ADDED: Prevent any default behavior
            console.log('Category button clicked:', button.dataset.category); // ADDED: Debug logging
            
            simCategoryButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-checked', 'false');
            });
            button.classList.add('active');
            button.setAttribute('aria-checked', 'true');
            calculateGrowth();
        });
    });

    // FIXED: Input event listeners
    if (simAmountInput) {
        simAmountInput.addEventListener('input', calculateGrowth);
        simAmountInput.addEventListener('change', calculateGrowth); // ADDED: Also listen for change events
    }
    if (simYearSelect) {
        simYearSelect.addEventListener('change', calculateGrowth);
    }

    // FIXED: Initial calculation with delay
    setTimeout(() => {
        if (simAmountInput && simAmountInput.value) {
            calculateGrowth();
        } else if (simAmountInput) {
            // Set a default value if none exists
            simAmountInput.value = '50000';
            calculateGrowth();
        }
    }, 100); // ADDED: Small delay to ensure everything is loaded
});

// JavaScript Countdown
// const targetDate = new Date("2026-08-20T10:00:00").getTime();

// function updateCountdown() {
//   const now = new Date().getTime();
//   const timeLeft = targetDate - now;

//   if (timeLeft <= 0) {
//     document.querySelector(".countdown").innerHTML = "We're Live!";
//     return;
//   }

//   const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
//   const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//   const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
//   const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

//   document.getElementById("days").innerText = days.toString().padStart(2, '0');
//   document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
//   document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
//   document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');
// }

// setInterval(updateCountdown, 1000);
// updateCountdown();


function animateValue(id, start, end, duration) {
  const obj = document.getElementById(id);
  const range = end - start;
  const increment = end > start ? 1 : -1;
  const stepTime = Math.abs(Math.floor(duration / range));
  let current = start;
  const timer = setInterval(() => {
    current += increment;
    obj.textContent = `₹${current.toLocaleString()}`;
    if (current === end) {
      clearInterval(timer);
      obj.textContent += " LAKHS";
    }
  }, stepTime);
}

// Trigger animation only when visible
function animateValue(id, start, end, duration) {
  const obj = document.getElementById(id);
  const frames = 30; // Smoothness (number of updates)
  const step = (end - start) / frames;
  let current = start;
  let frame = 0;

  const timer = setInterval(() => {
    current += step;
    frame++;
    obj.textContent = `₹${current.toFixed(1)} LAKHS`; // 1 decimal place
    if (frame >= frames) {
      clearInterval(timer);
      obj.textContent = `₹${end.toFixed(1)} LAKHS`; // Ensure final exact value
    }
  }, duration / frames);
}

// Trigger animation only when visible
function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
}

document.addEventListener("scroll", function() {
  const el = document.getElementById("highlight-value");
  if (isInViewport(el) && !el.dataset.animated) {
    el.dataset.animated = true;
    animateValue("highlight-value", 0, 15.8, 1600); 
  }
});

// Simple hover effect to show goal name in console or future animation
// document.querySelectorAll('.roadmap-item').forEach(item => {
//   item.addEventListener('mouseenter', () => {
//     console.log(`Goal: ${item.dataset.text}`);
//   });
// });

// document.querySelectorAll('.opportunity-card').forEach(card => {
//   card.addEventListener('click', () => {
//     alert(`You clicked on ${card.querySelector('.opportunity-type').innerText} card`);
//   });
// });

//  document.querySelectorAll('.fomo-card').forEach(card => {
//     card.addEventListener('click', () => {
//       document.getElementById('fomoModal').style.display = 'flex';
//     });
//   });