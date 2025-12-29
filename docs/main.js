/* =========================
   GLOBAL UI SCRIPT
   Shared across all pages
========================= */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initActiveNavLinks();
  initFormTabs();
  initBookingModal();
  initBookingCalendar();
  initCurrencyToggle();
  initGalleryCarousel();
  setFooterYear();
  initBackToTop();
});

/* =========================
   MOBILE NAV TOGGLE
========================= */
function initMobileNav() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const mobileMenu = document.querySelector("#mobileMenu, [data-mobile-menu]");

  if (!toggle || !mobileMenu) return;

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    const newState = !expanded;
    toggle.setAttribute("aria-expanded", newState);
    mobileMenu.hidden = !newState;
    mobileMenu.classList.toggle("is-open", newState);
    document.body.style.overflow = newState ? "hidden" : "";
  });

  // Close menu when clicking links
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      mobileMenu.hidden = true;
      mobileMenu.classList.remove("is-open");
      document.body.style.overflow = "";
    });
  });
}

/* =========================
   ACTIVE NAV LINK (CURRENT PAGE)
========================= */
function initActiveNavLinks() {
  const links = document.querySelectorAll(".nav-links a");
  const currentPath = window.location.pathname.split("/").pop();

  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPath || (href === "index.html" && currentPath === "")) {
      link.classList.add("active");
    }
  });
}

/* =========================
   FORM TAB SWITCHING (CONTACT PAGE)
========================= */
function initFormTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".form-panel");

  if (!tabButtons.length) return;

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;

      tabButtons.forEach((b) => b.classList.remove("is-active"));
      panels.forEach((p) => {
        p.classList.remove("is-active");
        if (p.dataset.panel === target) {
          p.classList.add("is-active");
        }
      });

      btn.classList.add("is-active");
    });
  });
}

/* =========================
   BOOKING MODAL
========================= */
function initBookingModal() {
  // Try both bookingModal ID and data-modal="booking"
  const modal = document.getElementById("bookingModal") || 
                document.querySelector('[data-modal="booking"]');
  const openBtns = document.querySelectorAll("[data-open-booking]");
  
  if (!modal || !openBtns.length) return;

  const closeBtns = modal.querySelectorAll("[data-close], [data-close-booking], .modal-backdrop, .modal-x");

  openBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Show modal
      modal.hidden = false;
      modal.removeAttribute("hidden");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      
      // Ensure modal is visible (handle CSS if needed)
      modal.style.display = '';
    });
  });

  // Function to reset booking form
  function resetBookingForm() {
    // Reset all form inputs
    const allInputs = modal.querySelectorAll('input, select, textarea');
    allInputs.forEach(input => {
      if (input.type === 'radio' || input.type === 'checkbox') {
        input.checked = false;
      } else {
        input.value = '';
      }
      input.classList.remove('error');
    });

    // Reset to Step 1
    const allSteps = modal.querySelectorAll('.booking-step');
    allSteps.forEach((step, index) => {
      step.hidden = index !== 0; // Step 1 is index 0
    });
    
    // Reset currentStep variable in booking form
    if (window.setBookingCurrentStep) {
      window.setBookingCurrentStep(1);
    }

    // Reset tab selection to booking tab
    const bookingTab = modal.querySelector('[data-booking-tab="booking"]');
    const inquiryTab = modal.querySelector('[data-booking-tab="inquiry"]');
    const bookingPanel = modal.querySelector('[data-panel="booking"]');
    const inquiryPanel = modal.querySelector('[data-panel="inquiry"]');
    
    if (bookingTab && inquiryTab && bookingPanel && inquiryPanel) {
      inquiryTab.classList.remove('active');
      bookingTab.classList.add('active');
      inquiryPanel.hidden = true;
      bookingPanel.hidden = false;
    }

    // Reset tour type selection
    const tourTypeRadios = modal.querySelectorAll('input[name="tour_type"]');
    tourTypeRadios.forEach(radio => {
      radio.checked = false;
    });

    // Hide all tour field groups
    const tourFields = modal.querySelectorAll('.tour-fields');
    tourFields.forEach(field => {
      field.hidden = true;
    });

    // Reset prefecture buttons
    const prefectureButtons = modal.querySelectorAll('.prefecture-btn');
    prefectureButtons.forEach(btn => {
      btn.classList.remove('selected', 'disabled');
    });

    // Reset specialized option buttons
    const specializedButtons = modal.querySelectorAll('.specialized-btn');
    specializedButtons.forEach(btn => {
      btn.classList.remove('selected', 'disabled');
    });

    // Reset calendar selection
    const selectedDays = modal.querySelectorAll('.calendar-day.selected');
    selectedDays.forEach(day => {
      day.classList.remove('selected');
    });

    // Clear helper text and error messages
    const helperTexts = modal.querySelectorAll('.form-helper-text, .field-helper');
    helperTexts.forEach(helper => {
      helper.textContent = '';
      helper.style.color = '';
    });

    // Clear inquiry suggestion
    const inquirySuggestion = modal.querySelector('#inquiry-suggestion');
    if (inquirySuggestion) {
      inquirySuggestion.hidden = true;
      inquirySuggestion.innerHTML = '';
    }

    // Hide conditional fields
    const peopleCustomGroup = modal.querySelector('#people-custom-group');
    if (peopleCustomGroup) {
      peopleCustomGroup.hidden = true;
    }

    const inquiryMessageGroup = modal.querySelector('#inquiry-message-group');
    if (inquiryMessageGroup) {
      inquiryMessageGroup.hidden = true;
    }

    const pickupDetailsGroup = modal.querySelector('#pickup-details-group');
    if (pickupDetailsGroup) {
      pickupDetailsGroup.hidden = true;
    }

    const dropoffDetailsGroup = modal.querySelector('#dropoff-details-group');
    if (dropoffDetailsGroup) {
      dropoffDetailsGroup.hidden = true;
    }

    // Clear prefill data
    window.bookingPrefillData = null;
    window.pendingTourData = null;
    window.isPrefilling = false;

    // Reset select dropdowns
    const selects = modal.querySelectorAll('select');
    selects.forEach(select => {
      if (select.options.length > 0) {
        select.selectedIndex = 0;
      }
    });

    // Reset calendar to current month
    if (window.renderBookingCalendar) {
      window.bookingCalendarCurrentDate = new Date();
      window.renderBookingCalendar();
    }
    
    // Hide form tabs if they were shown
    const formTabs = modal.querySelector('.booking-form-tabs');
    if (formTabs) {
      formTabs.classList.remove('show');
    }

    // Clear summary and price if they exist
    const bookingSummary = modal.querySelector('#booking-summary');
    if (bookingSummary) {
      bookingSummary.innerHTML = '';
    }

    const bookingPrice = modal.querySelector('#booking-price');
    if (bookingPrice) {
      bookingPrice.innerHTML = '';
    }

    // Reset inquiry form state
    const inquiryForm = modal.querySelector('#inquiryForm');
    if (inquiryForm && inquiryPanel) {
      // Show form again (in case it was hidden after success)
      inquiryForm.style.display = '';
      
      // Remove any success/error messages
      const inquiryMessages = inquiryPanel.querySelectorAll('.inquiry-message-container');
      inquiryMessages.forEach(msg => msg.remove());
      
      // Re-enable all form fields
      const inquiryFields = inquiryForm.querySelectorAll('input, select, textarea, button');
      inquiryFields.forEach(field => {
        field.disabled = false;
      });
      
      // Reset submit button text
      const submitBtn = inquiryForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Submit';
      }
    }
  }

  // Close modal function
  function closeModal() {
    resetBookingForm();
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  closeBtns.forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });
  
  // Use event delegation for dynamically created close buttons
  modal.addEventListener("click", (e) => {
    const closeBtn = e.target.closest("[data-close-booking]");
    if (closeBtn) {
      e.preventDefault();
      closeModal();
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) {
      resetBookingForm();
      modal.hidden = true;
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  });
}

/* =========================
   BOOKING CALENDAR
========================= */
function initBookingCalendar() {
  // Try to find calendar in visible areas first, then check hidden areas
  let calendarGrid = document.querySelector("[data-cal-grid]");
  let monthDisplay = document.querySelector("[data-cal-month]");
  let prevBtn = document.querySelector("[data-cal-prev]");
  let nextBtn = document.querySelector("[data-cal-next]");

  // If not found, calendar might be in a hidden panel (like contact page)
  // The querySelector should still find it, but let's make sure
  if (!calendarGrid || !monthDisplay) {
    // Calendar might be in hidden booking panel, try again after a short delay
    setTimeout(() => {
      calendarGrid = document.querySelector("[data-cal-grid]");
      monthDisplay = document.querySelector("[data-cal-month]");
      prevBtn = document.querySelector("[data-cal-prev]");
      nextBtn = document.querySelector("[data-cal-next]");
      
      if (calendarGrid && monthDisplay) {
        initializeCalendarInstance(calendarGrid, monthDisplay, prevBtn, nextBtn);
      }
    }, 100);
    return;
  }
  
  initializeCalendarInstance(calendarGrid, monthDisplay, prevBtn, nextBtn);
}

function initializeCalendarInstance(calendarGrid, monthDisplay, prevBtn, nextBtn) {
  if (!calendarGrid || !monthDisplay) return;

  let currentDate = new Date();
  // Make currentDate accessible globally for reset
  window.bookingCalendarCurrentDate = currentDate;
  let selectedDate = null;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Cache for availability data to avoid repeated API calls
  const availabilityCache = new Map();

  /**
   * Check availability for a specific date via API
   * Returns: 'available' (0 bookings), 'busy' (1 booking), or 'full' (2 bookings)
   */
  async function checkDateAvailability(date) {
    // Format date as YYYY-MM-DD
    const dateStr = date.toISOString().split('T')[0];
    const cacheKey = dateStr;

    // Check cache first
    if (availabilityCache.has(cacheKey)) {
      return availabilityCache.get(cacheKey);
    }

    try {
      const response = await fetch(`http://localhost:3000/api/bookings/availability?date=${dateStr}`);
      if (!response.ok) {
        console.error('Error checking availability:', response.statusText);
        return 'unknown'; // Default to unknown if API fails
      }

      const data = await response.json();
      if (data.success) {
        const confirmedCount = data.confirmed_count || 0;
        const capacity = data.capacity || 2;
        
        let status;
        if (confirmedCount >= capacity) {
          status = 'full'; // Red - no capacity
        } else if (confirmedCount === capacity - 1) {
          status = 'busy'; // Yellow - limited availability
        } else {
          status = 'available'; // Green - available
        }

        // Cache the result
        availabilityCache.set(cacheKey, status);
        return status;
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      return 'unknown'; // Default to unknown if network error
    }

    return 'unknown';
  }

  /**
   * Check if date is full (cannot be selected)
   */
  function isBooked(availabilityStatus) {
    return availabilityStatus === 'full';
  }

  /**
   * Check if date is busy (limited availability)
   */
  function isBusy(availabilityStatus) {
    return availabilityStatus === 'busy';
  }

  async function renderCalendar() {
    // Use the global currentDate if available, otherwise use local
    const dateToUse = window.bookingCalendarCurrentDate || currentDate;
    const year = dateToUse.getFullYear();
    const month = dateToUse.getMonth();
    // Update local currentDate to match
    currentDate = dateToUse;
    
    monthDisplay.textContent = `${monthNames[month]} ${year}`;
    calendarGrid.innerHTML = "";

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const emptyDay = document.createElement("div");
      emptyDay.className = "calendar-day disabled";
      calendarGrid.appendChild(emptyDay);
    }

    // Add days of the month
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create all day elements first
    const dayElements = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayElement = document.createElement("div");
      dayElement.className = "calendar-day";
      dayElement.textContent = day;

      // Check if it's today
      if (date.getTime() === today.getTime()) {
        dayElement.classList.add("today");
      }

      // Check if it's in the past
      if (date < today) {
        dayElement.classList.add("disabled");
      } else {
        // Initially mark as loading/pending (will be updated after availability check)
        dayElement.classList.add("pending");
        dayElement.setAttribute("data-date", date.toISOString().split('T')[0]);
      }

      calendarGrid.appendChild(dayElement);
      dayElements.push({ element: dayElement, date: date });
    }

    // Check availability for all dates in parallel
    const availabilityPromises = dayElements
      .filter(item => item.date >= today)
      .map(async (item) => {
        const availabilityStatus = await checkDateAvailability(item.date);
        return { element: item.element, date: item.date, status: availabilityStatus };
      });

    const availabilityResults = await Promise.all(availabilityPromises);

    // Update day elements with availability status
    availabilityResults.forEach(({ element, date, status }) => {
      element.classList.remove("pending");

      if (status === 'full') {
        // Full - red, not selectable
        element.classList.add("booked");
      } else if (status === 'busy') {
        // Busy - yellow, selectable
        element.classList.add("busy");
        
        // Add click handler for busy dates (still selectable but with warning)
        element.addEventListener("click", () => {
          // Remove previous selection
          document.querySelectorAll(".calendar-day.selected").forEach(el => {
            el.classList.remove("selected");
          });
          
          // Add selection to clicked date
          element.classList.add("selected");
          selectedDate = date;
          
          // Show form tabs when date is selected
          const formTabs = document.querySelector('.booking-form-tabs');
          if (formTabs) {
            formTabs.classList.add('show');
          }
        });
      } else if (status === 'available') {
        // Available - green, selectable
        element.classList.add("available");
        
        // Add click handler for available dates
        element.addEventListener("click", () => {
          // Remove previous selection
          document.querySelectorAll(".calendar-day.selected").forEach(el => {
            el.classList.remove("selected");
          });
          
          // Add selection to clicked date
          element.classList.add("selected");
          selectedDate = date;
          
          // Show form tabs when date is selected (for modal)
          const formTabs = document.querySelector('.booking-form-tabs');
          if (formTabs) {
            formTabs.classList.add('show');
          }
          
          // Enable Next button for contact page calendar
          const contactCalendarNextBtn = document.getElementById('contact-calendar-next-btn');
          if (contactCalendarNextBtn) {
            contactCalendarNextBtn.disabled = false;
          }
        });
      } else {
        // Unknown status - default to available but log warning
        console.warn('Unknown availability status for date:', date);
        element.classList.add("available");
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      window.bookingCalendarCurrentDate = currentDate;
      renderCalendar();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      window.bookingCalendarCurrentDate = currentDate;
      renderCalendar();
    });
  }

  // Make renderCalendar accessible globally for reset
  window.renderBookingCalendar = renderCalendar;
  // Make initializeCalendarInstance accessible globally
  window.initializeCalendarInstance = initializeCalendarInstance;

  renderCalendar();
}

/* =========================
   CURRENCY TOGGLE
========================= */
function initCurrencyToggle() {
  const toggles = document.querySelectorAll("[data-currency-toggle]");
  const labels = document.querySelectorAll("[data-currency-label]");
  const hints = document.querySelectorAll(".currency-hint");
  const priceElements = document.querySelectorAll("[data-money], [data-jpy], [data-usd]");

  if (!toggles.length || !labels.length) return;

  let isJPY = true;

  function updateCurrency() {
    const currency = isJPY ? "JPY" : "USD";
    const oppositeCurrency = isJPY ? "USD" : "JPY";
    const symbol = isJPY ? "¥" : "$";

    // Update labels
    labels.forEach((label) => {
      label.textContent = currency;
    });

    // Update hint text to show opposite currency
    hints.forEach((hint) => {
      hint.textContent = `⇄ ${oppositeCurrency}`;
    });

    // Update price elements
    priceElements.forEach((el) => {
      const jpyPrice = el.dataset.jpy || el.dataset.priceJpy;
      const usdPrice = el.dataset.usd || el.dataset.priceUsd;
      
      if (jpyPrice && usdPrice) {
        if (isJPY) {
          el.textContent = `¥${parseInt(jpyPrice).toLocaleString()}`;
        } else {
          el.textContent = `$${parseInt(usdPrice).toLocaleString()}`;
        }
      }
    });
  }

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      isJPY = !isJPY;
      updateCurrency();
    });
  });

  // Initialize on page load
  updateCurrency();
}

/* =========================
   GALLERY CAROUSEL
========================= */
function initGalleryCarousel() {
  const carousel = document.getElementById("galleryCarousel");
  const track = carousel?.querySelector(".gallery-carousel-track");
  const prevBtn = document.querySelector("[data-carousel-prev]");
  const nextBtn = document.querySelector("[data-carousel-next]");
  const slides = track?.querySelectorAll(".gallery-carousel-slide");

  if (!carousel || !track || !slides || slides.length === 0) return;

  let currentIndex = 0;

  function getVisibleSlides() {
    if (window.innerWidth > 900) return 3;
    if (window.innerWidth > 600) return 2;
    return 1;
  }

  function updateCarousel() {
    const visibleSlides = getVisibleSlides();
    const totalSlides = slides.length;
    const maxIndex = Math.max(0, totalSlides - visibleSlides);
    currentIndex = Math.min(currentIndex, maxIndex);
    
    const slideWidth = 100 / visibleSlides;
    const gapPercent = (16 / track.offsetWidth) * 100;
    const translateX = currentIndex * (slideWidth + gapPercent);
    
    track.style.transform = `translateX(-${translateX}%)`;
    
    if (prevBtn) {
      prevBtn.style.opacity = currentIndex === 0 ? "0.5" : "1";
      prevBtn.style.pointerEvents = currentIndex === 0 ? "none" : "auto";
    }
    if (nextBtn) {
      nextBtn.style.opacity = currentIndex >= maxIndex ? "0.5" : "1";
      nextBtn.style.pointerEvents = currentIndex >= maxIndex ? "none" : "auto";
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const visibleSlides = getVisibleSlides();
      const maxIndex = Math.max(0, slides.length - visibleSlides);
      if (currentIndex < maxIndex) {
        currentIndex++;
        updateCarousel();
      }
    });
  }

  // Handle window resize
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      currentIndex = 0;
      updateCarousel();
    }, 250);
  });

  updateCarousel();
}

/* =========================
   FOOTER YEAR AUTO UPDATE
========================= */
function setFooterYear() {
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// Back to Top Button
function initBackToTop() {
  const backToTopBtn = document.getElementById('backToTop');
  if (!backToTopBtn) return;

  // Show/hide button based on scroll position
  function toggleButton() {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }

  // Scroll to top
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Listen to scroll events
  window.addEventListener('scroll', toggleButton);
  
  // Initial check
  toggleButton();
}
