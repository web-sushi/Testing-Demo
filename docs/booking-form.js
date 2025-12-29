/* =========================
   BOOKING FORM LOGIC
========================= */

// Regional tour data
const regionalData = {
  kanto: {
    maxDays: 7,
    prefectures: ['Tokyo', 'Chiba', 'Kanagawa', 'Saitama', 'Gunma', 'Tochigi', 'Ibaraki']
  },
  kansai: {
    maxDays: 6,
    prefectures: ['Osaka', 'Kyoto', 'Hyogo', 'Nara', 'Shiga', 'Wakayama']
  },
  chubu: {
    maxDays: 7,
    prefectures: ['Aichi', 'Fukui', 'Gifu', 'Ishikawa', 'Nagano', 'Niigata', 'Shizuoka', 'Toyama', 'Yamanashi']
  },
  tohoku: {
    maxDays: 6,
    prefectures: ['Aomori', 'Iwate', 'Miyagi', 'Akita', 'Yamagata', 'Fukushima']
  },
  kyushu: {
    maxDays: 7,
    prefectures: ['Fukuoka', 'Saga', 'Nagasaki', 'Kumamoto', 'Oita', 'Miyazaki', 'Kagoshima']
  },
  shikoku: {
    maxDays: 4,
    prefectures: ['Ehime', 'Kagawa', 'Kōchi', 'Tokushima']
  },
  chugoku: {
    maxDays: 5,
    prefectures: ['Tottori', 'Shimane', 'Okayama', 'Hiroshima', 'Yamaguchi']
  },
  hokkaido: {
    maxDays: 3,
    prefectures: ['Hokkaido']
  }
};

// Specialized tour data
const specializedData = {
  cultural: {
    options: ['Sumo morning practices', 'Geisha experiences', 'Samurai festivals', 'Ikebana (flower arranging) lessons', 'Pottery workshops'],
    lengths: [4, 6, 8, 10],
    selections: [2, 3, 4, 5]
  },
  anime: {
    options: ['Ghibli Museum', 'Gundam Base Tokyo', 'Suginami Animation', 'Electric Town', 'Toei Animation Museum'],
    lengths: [4, 6, 8, 10],
    selections: [2, 3, 4, 5]
  },
  nature: {
    options: ['Mt. Fuji', 'Mt. Takao', 'Oshino hakkai', 'Mt. Tsukuba', 'Sarushima Island'],
    lengths: [6, 8],
    selections: [1, 1],
    autoLength: true
  },
  food: {
    options: ['Tokyo Food Tour', 'Osaka Food Tour', 'Kyoto Food Tour', 'Fukuoka Food Tour', 'Hokkaido Food Tour'],
    lengths: [4, 6],
    selections: [2, 3]
  },
  history: {
    options: ['Tokyo National Museum', 'Edo-Tokyo Museum', 'National Museum of Japanese History', 'Kyoto National Museum', 'Osaka Museum of History'],
    lengths: [4, 6],
    selections: [2, 3]
  },
  seasonal: {
    options: ['Cherry Blossom Viewing', 'Autumn Leaves Tour', 'Summer Festivals', 'Winter Illuminations', 'New Year Traditions'],
    lengths: [4, 6, 8],
    selections: [2, 3, 4]
  }
};

function initBookingForm() {
  const tabButtons = document.querySelectorAll('.booking-tab-btn');
  const panels = document.querySelectorAll('.booking-form-panel');
  let currentStep = 1;
  let formData = {};
  
  // Make currentStep accessible globally for reset
  window.bookingCurrentStep = () => currentStep;
  window.setBookingCurrentStep = (step) => {
    currentStep = step;
  };

  // Tab switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.bookingTab;
      
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      panels.forEach(p => {
        if (p.dataset.panel === target) {
          p.hidden = false;
          
          // If switching to booking panel, reset to step 0 (calendar)
          if (target === 'booking') {
            // Check if this is the contact page (has calendar step 0)
            const calendarStep = p.querySelector('[data-step="0"]');
            if (calendarStep) {
              // Reset to calendar step
              currentStep = 0;
              const allSteps = p.querySelectorAll('.booking-step');
              allSteps.forEach((step) => {
                const stepNum = parseInt(step.dataset.step) || 0;
                step.hidden = stepNum !== 0;
              });
              
              // Reset calendar next button
              const calendarNextBtn = document.getElementById('contact-calendar-next-btn');
              if (calendarNextBtn) {
                calendarNextBtn.disabled = true;
              }
              
              // Initialize/re-render calendar if it exists (for contact page)
              setTimeout(() => {
                const calendarGrid = p.querySelector('[data-cal-grid]');
                const monthDisplay = p.querySelector('[data-cal-month]');
                const prevBtn = p.querySelector('[data-cal-prev]');
                const nextBtn = p.querySelector('[data-cal-next]');
                
                if (calendarGrid && monthDisplay) {
                  // Check if calendar is already rendered
                  if (!calendarGrid.innerHTML.trim() || !monthDisplay.textContent.trim()) {
                    // Calendar needs to be initialized
                    // Call the initialization function directly with these elements
                    if (typeof initializeCalendarInstance === 'function') {
                      initializeCalendarInstance(calendarGrid, monthDisplay, prevBtn, nextBtn);
                    } else if (typeof initBookingCalendar === 'function') {
                      // Fallback: try the main init function
                      initBookingCalendar();
                    }
                  } else if (window.renderBookingCalendar) {
                    // Calendar is already rendered, but refresh it
                    window.renderBookingCalendar();
                  }
                }
              }, 200);
            } else {
              // For modal, start at step 1
              currentStep = 1;
            }
          }
        } else {
          p.hidden = true;
        }
      });
    });
  });
  
  // Calendar Next button handler (for contact page)
  const contactCalendarNextBtn = document.getElementById('contact-calendar-next-btn');
  if (contactCalendarNextBtn) {
    contactCalendarNextBtn.addEventListener('click', () => {
      const bookingPanel = document.querySelector('[data-panel="booking"]');
      if (bookingPanel && !bookingPanel.hidden) {
        // Move to step 1
        currentStep = 1;
        const allSteps = bookingPanel.querySelectorAll('.booking-step');
        allSteps.forEach((step, index) => {
          if (index === 1) {
            step.hidden = false;
          } else {
            step.hidden = true;
          }
        });
      }
    });
  }

  // General Inquiry Form
  const inquiryAbout = document.getElementById('inquiry-about');
  const inquirySuggestion = document.getElementById('inquiry-suggestion');
  const inquiryMessageGroup = document.getElementById('inquiry-message-group');
  
  if (inquiryAbout) {
    inquiryAbout.addEventListener('change', (e) => {
      const value = e.target.value;
      inquirySuggestion.hidden = true;
      inquiryMessageGroup.hidden = true;
      
      if (value === 'available-tours') {
        inquirySuggestion.innerHTML = '💡 <strong>Suggestion:</strong> Visit our <a href="tours.html">Tours & Pricing</a> section to see all available tours.';
        inquirySuggestion.hidden = false;
      } else if (value === 'pricing') {
        inquirySuggestion.innerHTML = '💡 <strong>Suggestion:</strong> Check our <a href="tours.html">Tours & Pricing</a> section for detailed pricing information.';
        inquirySuggestion.hidden = false;
      } else if (value === 'about-company') {
        inquirySuggestion.innerHTML = '💡 <strong>Suggestion:</strong> Learn more about us on our <a href="about.html">About Us</a> page.';
        inquirySuggestion.hidden = false;
      } else if (value === 'others') {
        inquiryMessageGroup.hidden = false;
      }
    });
  }

  // Transport options based on number of people
  const transportOptions = {
    'car-sedan': { value: 'car-sedan', label: 'Car - Sedan', maxPeople: 3 },
    'van-alphard': { value: 'van-alphard', label: 'Van - Alphard', minPeople: 1, maxPeople: 7 },
    'van-hiace': { value: 'van-hiace', label: 'Van - Hi Ace', minPeople: 4, maxPeople: 10 },
    'minibus': { value: 'minibus', label: 'Mini Bus', minPeople: 8, maxPeople: 20 },
    'bus': { value: 'bus', label: 'Bus', minPeople: 11 }
  };

  // Get allowed transport options based on number of people
  function getAllowedTransportOptions(numPeople) {
    const allowed = [];
    
    for (const [key, option] of Object.entries(transportOptions)) {
      if (key === 'car-sedan' && numPeople <= 3) {
        allowed.push(option);
      } else if (key === 'van-alphard' && numPeople >= 1 && numPeople <= 7) {
        allowed.push(option);
      } else if (key === 'van-hiace' && numPeople >= 4 && numPeople <= 10) {
        allowed.push(option);
      } else if (key === 'minibus' && numPeople >= 8) {
        allowed.push(option);
      } else if (key === 'bus' && numPeople >= 11) {
        allowed.push(option);
      }
    }
    
    return allowed;
  }

  // Generate transport buttons
  function generateTransportButtons(containerId, numPeople, force = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Check if the parent group is visible (unless forced)
    // Also check if the container's parent tour-fields is visible
    if (!force) {
      const parentGroup = container.closest('.form-group');
      const tourFields = container.closest('.tour-fields');
      
      // Don't generate if parent form-group is hidden
      if (parentGroup && parentGroup.hidden) {
        return;
      }
      
      // Don't generate if parent tour-fields is hidden (for specialized/customized)
      if (tourFields && tourFields.hidden) {
        return;
      }
    }
    
    container.innerHTML = '';
    
    // Clear helper text
    const helper = document.getElementById(containerId.replace('-buttons', '-helper'));
    if (helper) {
      helper.textContent = '';
      helper.style.color = '';
    }
    
    if (numPeople === 0) {
      if (helper) {
        helper.textContent = 'Please select number of people first';
        helper.style.color = '#dc2626';
      }
      return;
    }
    
    const allowedOptions = getAllowedTransportOptions(numPeople);
    
    if (allowedOptions.length === 0) {
      if (helper) {
        helper.textContent = 'No transport options available for this number of people';
        helper.style.color = '#dc2626';
      }
      return;
    }
    
    allowedOptions.forEach(option => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'transport-btn';
      btn.textContent = option.label;
      btn.dataset.value = option.value;
      btn.dataset.name = 'transport';
      
      btn.addEventListener('click', function() {
        // Remove selection from all buttons in this container
        container.querySelectorAll('.transport-btn').forEach(b => {
          b.classList.remove('selected');
        });
        
        // Select clicked button
        this.classList.add('selected');
        
        // Clear error message
        const helper = document.getElementById(containerId.replace('-buttons', '-helper'));
        if (helper) {
          helper.textContent = '';
          helper.style.color = '';
        }
      });
      
      container.appendChild(btn);
    });
  }

  // Number of people handler
  const bookingPeople = document.getElementById('booking-people');
  const peopleCustomGroup = document.getElementById('people-custom-group');
  const peopleCustomInput = document.getElementById('people-custom');
  
  function updateTransportButtons(force = false) {
    let numPeople = 0;
    
    if (bookingPeople && bookingPeople.value) {
      if (bookingPeople.value === '11+') {
        if (peopleCustomInput && peopleCustomInput.value) {
          numPeople = parseInt(peopleCustomInput.value) || 0;
        } else {
          numPeople = 11; // Default for 11+
        }
      } else {
        numPeople = parseInt(bookingPeople.value) || 0;
      }
    }
    
    // Always try to generate buttons (force=true when tour type is selected)
    // Update all transport button containers
    generateTransportButtons('regional-vehicle-buttons', numPeople, force);
    generateTransportButtons('specialized-transport-buttons', numPeople, force);
    generateTransportButtons('customized-transport-buttons', numPeople, force);
  }
  
  if (bookingPeople) {
    bookingPeople.addEventListener('change', (e) => {
      if (e.target.value === '11+') {
        peopleCustomGroup.hidden = false;
        peopleCustomGroup.querySelector('input').required = true;
      } else {
        peopleCustomGroup.hidden = true;
        peopleCustomGroup.querySelector('input').required = false;
        updateTransportButtons();
      }
    });
  }
  
  if (peopleCustomInput) {
    peopleCustomInput.addEventListener('input', () => {
      updateTransportButtons();
    });
  }

  // Tour type selection
  const tourTypeRadios = document.querySelectorAll('input[name="tour_type"]');
  const regionalFields = document.getElementById('regional-fields');
  const specializedFields = document.getElementById('specialized-fields');
  const customizedFields = document.getElementById('customized-fields');

  tourTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const type = e.target.value;
      
      regionalFields.hidden = type !== 'regional';
      specializedFields.hidden = type !== 'specialized';
      customizedFields.hidden = type !== 'customized';
      
      // Update transport buttons when tour type changes (force to generate after fields are shown)
      setTimeout(() => {
        updateTransportButtons(true);
      }, 100);
    });
  });

  // Regional tour handlers
  const regionalRegion = document.getElementById('regional-region');
  const regionalLength = document.getElementById('regional-length');
  const regionalPrefecturesGroup = document.getElementById('regional-prefectures-group');
  const regionalPrefectures = document.getElementById('regional-prefectures');

  if (regionalRegion) {
    regionalRegion.addEventListener('change', (e) => {
      const region = e.target.value;
      const helper = document.getElementById('regional-helper');
      
      // Reset length selection
      regionalLength.value = '';
      helper.textContent = '';
      
      if (region && regionalData[region]) {
        const data = regionalData[region];
        
        // Update length options
        regionalLength.innerHTML = '<option value="">Select length</option>';
        for (let i = 1; i <= data.maxDays; i++) {
          regionalLength.innerHTML += `<option value="${i}">${i} ${i === 1 ? 'day' : 'days'}</option>`;
        }
        
        // Update prefectures as buttons (reset)
        regionalPrefectures.innerHTML = '';
        data.prefectures.forEach(pref => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'prefecture-btn';
          btn.textContent = pref;
          btn.dataset.value = pref;
          btn.dataset.name = 'prefectures[]';
          regionalPrefectures.appendChild(btn);
        });
        regionalPrefecturesGroup.hidden = false;
        // Show vehicle group and update transport buttons when region is selected
        const regionalVehicleGroup = document.getElementById('regional-vehicle-group');
        if (regionalVehicleGroup) {
          regionalVehicleGroup.hidden = false;
        }
        // Force update to generate buttons even if parent was hidden
        updateTransportButtons(true);
      } else {
        regionalPrefecturesGroup.hidden = true;
        const regionalVehicleGroup = document.getElementById('regional-vehicle-group');
        if (regionalVehicleGroup) {
          regionalVehicleGroup.hidden = true;
        }
      }
    });

    // Limit prefecture selections based on tour length
    if (regionalLength) {
      regionalLength.addEventListener('change', (e) => {
        const selectedLength = parseInt(e.target.value);
        const helper = document.getElementById('regional-helper');
        
        // Reset all prefecture buttons
        const buttons = regionalPrefectures.querySelectorAll('.prefecture-btn');
        buttons.forEach(btn => {
          btn.classList.remove('selected', 'disabled');
          // Remove old event listeners by cloning
          const newBtn = btn.cloneNode(true);
          btn.parentNode.replaceChild(newBtn, btn);
        });
        
        // Get fresh button references after reset
        const freshButtons = regionalPrefectures.querySelectorAll('.prefecture-btn');
        
        if (selectedLength) {
          helper.textContent = `Select up to ${selectedLength} ${selectedLength === 1 ? 'prefecture' : 'prefectures'} (${selectedLength} ${selectedLength === 1 ? 'day' : 'days'} = ${selectedLength} ${selectedLength === 1 ? 'prefecture' : 'prefectures'})`;
          
          // Add click handlers to buttons
          freshButtons.forEach(btn => {
            btn.addEventListener('click', function() {
              const selected = regionalPrefectures.querySelectorAll('.prefecture-btn.selected');
              
              if (this.classList.contains('selected')) {
                // Deselect
                this.classList.remove('selected');
              } else {
                // Check if we can select more
                if (selected.length < selectedLength) {
                  this.classList.add('selected');
                }
              }
              
              // Update disabled state
              const currentSelected = regionalPrefectures.querySelectorAll('.prefecture-btn.selected');
              freshButtons.forEach(b => {
                if (!b.classList.contains('selected')) {
                  b.classList.toggle('disabled', currentSelected.length >= selectedLength);
                }
              });
              
              // Clear error message if selection is made
              const helper = document.getElementById('regional-helper');
              if (helper && currentSelected.length > 0) {
                helper.style.color = '';
                helper.textContent = helper.textContent.replace(' (Please select at least one prefecture)', '');
              }
            });
          });
        } else {
          helper.textContent = '';
        }
      });
    }
  }

  // Specialized tour handlers
  const specializedType = document.getElementById('specialized-type');
  const specializedLengthGroup = document.getElementById('specialized-length-group');
  const specializedLength = document.getElementById('specialized-length');
  const specializedOptionsGroup = document.getElementById('specialized-options-group');
  const specializedOptions = document.getElementById('specialized-options');
  const specializedTransportGroup = document.getElementById('specialized-transport-group');

  if (specializedType) {
    specializedType.addEventListener('change', (e) => {
      const type = e.target.value;
      const helper = document.getElementById('specialized-helper');
      
      // Reset length selection
      specializedLength.value = '';
      helper.textContent = '';
      
      if (type && specializedData[type]) {
        const data = specializedData[type];
        
        // Update length options
        specializedLength.innerHTML = '<option value="">Select length</option>';
        data.lengths.forEach((length, index) => {
          const selectionText = data.selections[index] === 1 ? 'selection' : 'selections';
          specializedLength.innerHTML += `<option value="${length}hours">${length} hours (${data.selections[index]} ${selectionText})</option>`;
        });
        specializedLengthGroup.hidden = false;
        
        // Update options as buttons (reset)
        specializedOptions.innerHTML = '';
        data.options.forEach(option => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'specialized-btn';
          btn.textContent = option;
          btn.dataset.value = option;
          btn.dataset.name = 'specialized_options[]';
          specializedOptions.appendChild(btn);
        });
        specializedOptionsGroup.hidden = false;
        specializedTransportGroup.hidden = false;
        // Update transport buttons when specialized type is selected (force to generate)
        updateTransportButtons(true);
      } else {
        specializedLengthGroup.hidden = true;
        specializedOptionsGroup.hidden = true;
        specializedTransportGroup.hidden = true;
      }
    });
  }

  // Specialized length handler - limit selections
  if (specializedLength) {
    specializedLength.addEventListener('change', (e) => {
      const selectedLength = e.target.value;
      const helper = document.getElementById('specialized-helper');
      
      // Reset all specialized option buttons
      const buttons = specializedOptions.querySelectorAll('.specialized-btn');
      buttons.forEach(btn => {
        btn.classList.remove('selected', 'disabled');
        // Remove old event listeners by cloning
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
      });
      
      // Get fresh button references after reset
      const freshButtons = specializedOptions.querySelectorAll('.specialized-btn');
      
      if (selectedLength) {
        const type = specializedType.value;
        const data = specializedData[type];
        const lengthIndex = data.lengths.indexOf(parseInt(selectedLength.replace('hours', '')));
        const maxSelections = data.selections[lengthIndex];
        
        helper.textContent = `Select up to ${maxSelections} ${maxSelections === 1 ? 'option' : 'options'}`;
        
        // Add click handlers to buttons
        freshButtons.forEach(btn => {
          btn.addEventListener('click', function() {
            const selected = specializedOptions.querySelectorAll('.specialized-btn.selected');
            
            if (this.classList.contains('selected')) {
              // Deselect
              this.classList.remove('selected');
            } else {
              // Check if we can select more
              if (selected.length < maxSelections) {
                this.classList.add('selected');
              }
            }
            
            // Update disabled state
            const currentSelected = specializedOptions.querySelectorAll('.specialized-btn.selected');
            freshButtons.forEach(b => {
              if (!b.classList.contains('selected')) {
                b.classList.toggle('disabled', currentSelected.length >= maxSelections);
              }
            });
            
            // Clear error message if selection is made
            const helper = document.getElementById('specialized-helper');
            if (helper && currentSelected.length > 0) {
              helper.style.color = '';
              helper.textContent = helper.textContent.replace(' (Please select at least one option)', '');
            }
          });
        });
      } else {
        helper.textContent = '';
      }
    });
  }

  // Customized tour handlers
  const customizedLength = document.getElementById('customized-length');
  const customizedTransportGroup = document.getElementById('customized-transport-group');

  if (customizedLength) {
    customizedLength.addEventListener('change', (e) => {
      const length = e.target.value;
      // Update transport buttons when customized length is selected (force to generate)
      updateTransportButtons(true);
    });
  }

  // Pickup/Dropoff handlers
  const pickupType = document.getElementById('pickup-type');
  const pickupDetailsGroup = document.getElementById('pickup-details-group');
  const pickupDetails = document.getElementById('pickup-details');
  const pickupAirport = document.getElementById('pickup-airport');
  const pickupDetailsLabel = document.getElementById('pickup-details-label');

  if (pickupType) {
    pickupType.addEventListener('change', (e) => {
      const type = e.target.value;
      pickupDetailsGroup.hidden = !type;
      pickupDetails.hidden = type !== 'hotel' && type !== 'station';
      pickupAirport.hidden = type !== 'airport';
      
      if (type === 'hotel') {
        pickupDetailsLabel.textContent = 'Hotel Details *';
      } else if (type === 'station') {
        pickupDetailsLabel.textContent = 'Station Name *';
      }
    });
  }

  const dropoffType = document.getElementById('dropoff-type');
  const dropoffDetailsGroup = document.getElementById('dropoff-details-group');
  const dropoffDetails = document.getElementById('dropoff-details');
  const dropoffAirport = document.getElementById('dropoff-airport');
  const dropoffDetailsLabel = document.getElementById('dropoff-details-label');

  if (dropoffType) {
    dropoffType.addEventListener('change', (e) => {
      const type = e.target.value;
      dropoffDetailsGroup.hidden = !type;
      dropoffDetails.hidden = type !== 'hotel' && type !== 'station';
      dropoffAirport.hidden = type !== 'airport';
      
      if (type === 'hotel') {
        dropoffDetailsLabel.textContent = 'Hotel Details *';
      } else if (type === 'station') {
        dropoffDetailsLabel.textContent = 'Station Name *';
      }
    });
  }

  // Prevent form submission
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Don't submit - use Next button instead
    });
  }

  // Step navigation
  const nextButtons = document.querySelectorAll('[data-next-step]');
  const prevButtons = document.querySelectorAll('[data-prev-step]');
  const steps = document.querySelectorAll('.booking-step');

  function showStep(stepNum) {
    steps.forEach((step) => {
      const stepAttr = parseInt(step.dataset.step) || 0;
      step.hidden = stepAttr !== stepNum;
    });
    currentStep = stepNum;
    if (window.setBookingCurrentStep) {
      window.setBookingCurrentStep(stepNum);
    }
    
    // When Step 2 is shown, generate transport buttons if number of people is already selected
    if (stepNum === 2) {
      setTimeout(() => {
        updateTransportButtons(true);
      }, 150);
    }
    
    // Apply prefill when Step 2 is shown
    if (stepNum === 2 && window.bookingPrefillData) {
      setTimeout(() => {
        applyBookingPrefill();
      }, 100);
    }
  }

  nextButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Skip validation for step 0 (calendar)
      if (currentStep === 0) {
        showStep(1);
        return;
      }
      
      if (validateStep(currentStep)) {
        if (currentStep === 3) {
          generateSummary();
        }
        if (currentStep < 4) {
          showStep(currentStep + 1);
        }
      }
    });
  });

  prevButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Allow going back to step 0 (calendar) if it exists
      const calendarStep = document.querySelector('[data-step="0"]');
      if (currentStep > 0) {
        if (currentStep === 1 && calendarStep) {
          showStep(0);
        } else if (currentStep > 1) {
          showStep(currentStep - 1);
        }
      }
    });
  });

  function validateStep(step) {
    const stepElement = document.querySelector(`[data-step="${step}"]`);
    if (!stepElement) {
      console.warn(`Step ${step} element not found`);
      return false;
    }
    
    let isValid = true;

    if (step === 1) {
      // Validate Step 1: Personal Information
      const name = document.getElementById('booking-name')?.value?.trim();
      const email = document.getElementById('booking-email')?.value?.trim();
      const contact = document.getElementById('booking-contact')?.value?.trim();
      const people = document.getElementById('booking-people')?.value;
      const peopleCustom = document.getElementById('people-custom')?.value;
      const peopleCustomGroup = document.getElementById('people-custom-group');

      // Validate name
      if (!name) {
        isValid = false;
        const nameField = document.getElementById('booking-name');
        if (nameField) {
          nameField.style.borderColor = '#dc2626';
        }
      } else {
        const nameField = document.getElementById('booking-name');
        if (nameField) {
          nameField.style.borderColor = '';
        }
      }

      // Validate email
      if (!email || !email.includes('@')) {
        isValid = false;
        const emailField = document.getElementById('booking-email');
        if (emailField) {
          emailField.style.borderColor = '#dc2626';
        }
      } else {
        const emailField = document.getElementById('booking-email');
        if (emailField) {
          emailField.style.borderColor = '';
        }
      }

      // Validate contact
      if (!contact) {
        isValid = false;
        const contactField = document.getElementById('booking-contact');
        if (contactField) {
          contactField.style.borderColor = '#dc2626';
        }
      } else {
        const contactField = document.getElementById('booking-contact');
        if (contactField) {
          contactField.style.borderColor = '';
        }
      }

      // Validate number of people
      if (!people) {
        isValid = false;
        const peopleField = document.getElementById('booking-people');
        if (peopleField) {
          peopleField.style.borderColor = '#dc2626';
        }
      } else {
        const peopleField = document.getElementById('booking-people');
        if (peopleField) {
          peopleField.style.borderColor = '';
        }

        // If "11+" is selected, validate the custom input
        if (people === '11+') {
          if (peopleCustomGroup && !peopleCustomGroup.hidden) {
            if (!peopleCustom || parseInt(peopleCustom) < 11) {
              isValid = false;
              const peopleCustomField = document.getElementById('people-custom');
              if (peopleCustomField) {
                peopleCustomField.style.borderColor = '#dc2626';
              }
            } else {
              const peopleCustomField = document.getElementById('people-custom');
              if (peopleCustomField) {
                peopleCustomField.style.borderColor = '';
              }
            }
          }
        }
      }

      if (!isValid) {
        // Scroll to first invalid field
        const firstInvalid = stepElement.querySelector('[style*="border-color: rgb(220, 38, 38)"]');
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstInvalid.focus();
        }
      }

      return isValid;
    } else if (step === 2) {
      // Skip validation if we're currently prefilling (to avoid false alerts)
      if (window.isPrefilling) {
        return true;
      }
      
      // Validate tour type
      const tourType = document.querySelector('input[name="tour_type"]:checked');
      if (!tourType) {
        isValid = false;
        alert('Please select a tour type');
        return false;
      }

      const type = tourType.value;

      // Validate based on tour type
      if (type === 'regional') {
        const region = document.getElementById('regional-region')?.value;
        const length = document.getElementById('regional-length')?.value;
        const selectedVehicle = document.querySelector('#regional-vehicle-buttons .transport-btn.selected');
        const vehicle = selectedVehicle?.dataset.value;
        const selectedPrefectures = document.querySelectorAll('.prefecture-btn.selected');

        if (!region) {
          isValid = false;
          document.getElementById('regional-region').style.borderColor = '#dc2626';
        } else {
          document.getElementById('regional-region').style.borderColor = '';
        }

        if (!length) {
          isValid = false;
          document.getElementById('regional-length').style.borderColor = '#dc2626';
        } else {
          document.getElementById('regional-length').style.borderColor = '';
        }

        if (selectedPrefectures.length === 0) {
          isValid = false;
          const helper = document.getElementById('regional-helper');
          if (helper) {
            helper.style.color = '#dc2626';
            const originalText = helper.textContent.replace(' (Please select at least one prefecture)', '');
            if (!helper.textContent.includes('(Please select')) {
              helper.textContent = originalText + ' (Please select at least one prefecture)';
            }
          }
        } else {
          const helper = document.getElementById('regional-helper');
          if (helper) {
            helper.style.color = '';
            helper.textContent = helper.textContent.replace(' (Please select at least one prefecture)', '');
          }
        }

        if (!vehicle) {
          isValid = false;
          const helper = document.getElementById('regional-vehicle-helper');
          if (helper) {
            helper.textContent = 'Please select a vehicle';
            helper.style.color = '#dc2626';
          }
        } else {
          const helper = document.getElementById('regional-vehicle-helper');
          if (helper) {
            helper.textContent = '';
            helper.style.color = '';
          }
        }
      } else if (type === 'specialized') {
        const specializedType = document.getElementById('specialized-type')?.value;
        const length = document.getElementById('specialized-length')?.value;
        const selectedTransport = document.querySelector('#specialized-transport-buttons .transport-btn.selected');
        const transport = selectedTransport?.dataset.value;
        const selectedOptions = document.querySelectorAll('.specialized-btn.selected');

        if (!specializedType) {
          isValid = false;
          document.getElementById('specialized-type').style.borderColor = '#dc2626';
        } else {
          document.getElementById('specialized-type').style.borderColor = '';
        }

        if (!length) {
          isValid = false;
          document.getElementById('specialized-length').style.borderColor = '#dc2626';
        } else {
          document.getElementById('specialized-length').style.borderColor = '';
        }

        if (selectedOptions.length === 0) {
          isValid = false;
          const helper = document.getElementById('specialized-helper');
          if (helper) {
            helper.style.color = '#dc2626';
            const originalText = helper.textContent.replace(' (Please select at least one option)', '');
            if (!helper.textContent.includes('(Please select')) {
              helper.textContent = originalText + ' (Please select at least one option)';
            }
          }
        } else {
          const helper = document.getElementById('specialized-helper');
          if (helper) {
            helper.style.color = '';
            helper.textContent = helper.textContent.replace(' (Please select at least one option)', '');
          }
        }

        if (!transport) {
          isValid = false;
          const helper = document.getElementById('specialized-transport-helper');
          if (helper) {
            helper.textContent = 'Please select transportation';
            helper.style.color = '#dc2626';
          }
        } else {
          const helper = document.getElementById('specialized-transport-helper');
          if (helper) {
            helper.textContent = '';
            helper.style.color = '';
          }
        }
      } else if (type === 'customized') {
        const length = document.getElementById('customized-length')?.value;
        const interest = document.getElementById('customized-interest')?.value;
        const selectedTransport = document.querySelector('#customized-transport-buttons .transport-btn.selected');
        const transport = selectedTransport?.dataset.value;

        if (!length) {
          isValid = false;
          document.getElementById('customized-length').style.borderColor = '#dc2626';
        } else {
          document.getElementById('customized-length').style.borderColor = '';
        }

        if (!interest || interest.trim() === '') {
          isValid = false;
          document.getElementById('customized-interest').style.borderColor = '#dc2626';
        } else {
          document.getElementById('customized-interest').style.borderColor = '';
        }

        if (!transport) {
          isValid = false;
          const helper = document.getElementById('customized-transport-helper');
          if (helper) {
            helper.textContent = 'Please select transportation';
            helper.style.color = '#dc2626';
          }
        } else {
          const helper = document.getElementById('customized-transport-helper');
          if (helper) {
            helper.textContent = '';
            helper.style.color = '';
          }
        }
      }
    } else {
      // Validate other steps normally
      const requiredFields = stepElement.querySelectorAll('[required]');
      requiredFields.forEach(field => {
        // Only validate visible fields
        if (field.offsetParent !== null) {
          if (!field.value || (field.type === 'checkbox' && !field.checked)) {
            isValid = false;
            field.style.borderColor = '#dc2626';
          } else {
            field.style.borderColor = '';
          }
        }
      });
    }

    return isValid;
  }

  function generateSummary() {
    const summary = document.getElementById('booking-summary');
    const priceDiv = document.getElementById('booking-price');
    
    if (!summary || !priceDiv) return;
    
    // Collect all form data
    const selectedDate = document.querySelector('.calendar-day.selected');
    const dateText = selectedDate ? selectedDate.textContent : 'Not selected';
    const monthYear = document.querySelector('[data-cal-month]')?.textContent || '';
    
    formData = {
      date: `${monthYear} ${dateText}`,
      name: document.getElementById('booking-name')?.value || '',
      email: document.getElementById('booking-email')?.value || '',
      contact: document.getElementById('booking-contact')?.value || '',
      people: document.getElementById('booking-people')?.value || '',
      peopleCustom: document.getElementById('people-custom')?.value || '',
      tourType: document.querySelector('input[name="tour_type"]:checked')?.value || '',
      region: document.getElementById('regional-region')?.value || '',
      regionalLength: document.getElementById('regional-length')?.value || '',
      specializedLength: document.getElementById('specialized-length')?.value || '',
      customizedLength: document.getElementById('customized-length')?.value || '',
      tourLength: document.getElementById('regional-length')?.value || 
                  document.getElementById('specialized-length')?.value ||
                  document.getElementById('customized-length')?.value || '',
      prefectures: Array.from(document.querySelectorAll('.prefecture-btn.selected')).map(btn => btn.dataset.value),
      specializedType: document.getElementById('specialized-type')?.value || '',
      specializedOptions: Array.from(document.querySelectorAll('.specialized-btn.selected')).map(btn => btn.dataset.value),
      interest: document.getElementById('customized-interest')?.value || '',
      vehicle: getTransportType(),
      pickupType: document.getElementById('pickup-type')?.value || '',
      pickupDetails: document.getElementById('pickup-details')?.value || 
                    document.getElementById('pickup-airport')?.value || '',
      dropoffType: document.getElementById('dropoff-type')?.value || '',
      dropoffDetails: document.getElementById('dropoff-details')?.value || 
                     document.getElementById('dropoff-airport')?.value || '',
      extraInfo: document.getElementById('extra-info')?.value || ''
    };

    // Generate summary HTML
    let summaryHTML = `
      <h4>Booking Summary</h4>
      <div class="booking-summary-item">
        <span class="booking-summary-label">Selected Date:</span>
        <span class="booking-summary-value">${formData.date}</span>
      </div>
      <div class="booking-summary-item">
        <span class="booking-summary-label">Name:</span>
        <span class="booking-summary-value">${formData.name}</span>
      </div>
      <div class="booking-summary-item">
        <span class="booking-summary-label">Email:</span>
        <span class="booking-summary-value">${formData.email}</span>
      </div>
      <div class="booking-summary-item">
        <span class="booking-summary-label">Contact:</span>
        <span class="booking-summary-value">${formData.contact}</span>
      </div>
      <div class="booking-summary-item">
        <span class="booking-summary-label">Number of People:</span>
        <span class="booking-summary-value">${formData.people === '11+' ? formData.peopleCustom : formData.people}</span>
      </div>
      <div class="booking-summary-item">
        <span class="booking-summary-label">Tour Type:</span>
        <span class="booking-summary-value">${formData.tourType.charAt(0).toUpperCase() + formData.tourType.slice(1)} Tour</span>
      </div>
    `;

    // Add tour-specific details
    if (formData.tourType === 'regional' && formData.region) {
      const regionName = document.getElementById('regional-region').selectedOptions[0].text.split(' (')[0];
      summaryHTML += `
        <div class="booking-summary-item">
          <span class="booking-summary-label">Region:</span>
          <span class="booking-summary-value">${regionName}</span>
        </div>
        <div class="booking-summary-item">
          <span class="booking-summary-label">Tour Length:</span>
          <span class="booking-summary-value">${formData.tourLength} ${formData.tourLength === '1' ? 'day' : 'days'}</span>
        </div>
        ${formData.prefectures.length > 0 ? `
        <div class="booking-summary-item">
          <span class="booking-summary-label">Prefectures:</span>
          <span class="booking-summary-value">${formData.prefectures.join(', ')}</span>
        </div>
        ` : ''}
      `;
    } else if (formData.tourType === 'specialized' && formData.specializedType) {
      const typeName = document.getElementById('specialized-type').selectedOptions[0].text;
      summaryHTML += `
        <div class="booking-summary-item">
          <span class="booking-summary-label">Specialized Type:</span>
          <span class="booking-summary-value">${typeName}</span>
        </div>
        <div class="booking-summary-item">
          <span class="booking-summary-label">Tour Length:</span>
          <span class="booking-summary-value">${formData.tourLength}</span>
        </div>
        ${formData.specializedOptions.length > 0 ? `
        <div class="booking-summary-item">
          <span class="booking-summary-label">Selected Options:</span>
          <span class="booking-summary-value">${formData.specializedOptions.join(', ')}</span>
        </div>
        ` : ''}
      `;
    } else if (formData.tourType === 'customized') {
      summaryHTML += `
        <div class="booking-summary-item">
          <span class="booking-summary-label">Tour Length:</span>
          <span class="booking-summary-value">${formData.tourLength}</span>
        </div>
        ${formData.interest ? `
        <div class="booking-summary-item">
          <span class="booking-summary-label">Interest/Hobby:</span>
          <span class="booking-summary-value">${formData.interest}</span>
        </div>
        ` : ''}
      `;
    }

    // Add transportation
    const vehicleText = document.getElementById('regional-vehicle')?.selectedOptions[0]?.text ||
                       document.getElementById('specialized-transport')?.selectedOptions[0]?.text ||
                       document.getElementById('customized-transport')?.selectedOptions[0]?.text || '';
    
    if (vehicleText) {
      summaryHTML += `
        <div class="booking-summary-item">
          <span class="booking-summary-label">Transportation:</span>
          <span class="booking-summary-value">${vehicleText}</span>
        </div>
      `;
    }

    // Add pickup/dropoff
    if (formData.pickupType) {
      const pickupLabel = formData.pickupType === 'hotel' ? 'Hotel' : 
                         formData.pickupType === 'station' ? 'Station' : 'Airport';
      summaryHTML += `
        <div class="booking-summary-item">
          <span class="booking-summary-label">Pickup:</span>
          <span class="booking-summary-value">${pickupLabel} - ${formData.pickupDetails}</span>
        </div>
      `;
    }

    if (formData.dropoffType) {
      const dropoffLabel = formData.dropoffType === 'hotel' ? 'Hotel' : 
                           formData.dropoffType === 'station' ? 'Station' : 'Airport';
      summaryHTML += `
        <div class="booking-summary-item">
          <span class="booking-summary-label">Dropoff:</span>
          <span class="booking-summary-value">${dropoffLabel} - ${formData.dropoffDetails}</span>
        </div>
      `;
    }

    if (formData.extraInfo) {
      summaryHTML += `
        <div class="booking-summary-item">
          <span class="booking-summary-label">Extra Information:</span>
          <span class="booking-summary-value">${formData.extraInfo}</span>
        </div>
      `;
    }

    summary.innerHTML = summaryHTML;

    // Calculate price based on tour type and transport
    const numPeople = formData.people === '11+' ? parseInt(formData.peopleCustom) : parseInt(formData.people);
    const transport = getTransportType();
    const tourType = formData.tourType;
    // Get the appropriate length based on tour type
    let tourLength = '1';
    if (tourType === 'regional') {
      tourLength = formData.regionalLength || '1';
    } else if (tourType === 'specialized') {
      tourLength = formData.specializedLength || '4hours';
    } else if (tourType === 'customized') {
      tourLength = formData.customizedLength || '4hours';
    }
    
    let totalPrice = 0;
    let priceDescription = '';
    
    if (tourType === 'regional') {
      // Regional tours: per day pricing
      const days = parseInt(tourLength) || 1;
      
      if (transport === 'car-sedan') {
        // 20,000 yen per day for 1-3 people (car)
        totalPrice = 20000 * days;
        priceDescription = `¥20,000 per day × ${days} ${days === 1 ? 'day' : 'days'}`;
      } else if (transport === 'van-alphard') {
        // 50,000 yen per day for 4-6 people (Alphard)
        totalPrice = 50000 * days;
        priceDescription = `¥50,000 per day × ${days} ${days === 1 ? 'day' : 'days'}`;
      } else if (transport === 'van-hiace') {
        // 75,000 yen per day for 7-10 people (HiAce)
        totalPrice = 75000 * days;
        priceDescription = `¥75,000 per day × ${days} ${days === 1 ? 'day' : 'days'}`;
      } else if (transport === 'minibus') {
        // 10,000 yen per day per person for 11-20 people (MiniBus)
        totalPrice = 10000 * numPeople * days;
        priceDescription = `¥10,000 per person per day × ${numPeople} ${numPeople === 1 ? 'person' : 'people'} × ${days} ${days === 1 ? 'day' : 'days'}`;
      } else if (transport === 'bus') {
        // 15,000 yen per day per person for 20+ people (Bus)
        totalPrice = 15000 * numPeople * days;
        priceDescription = `¥15,000 per person per day × ${numPeople} ${numPeople === 1 ? 'person' : 'people'} × ${days} ${days === 1 ? 'day' : 'days'}`;
      }
    } else if (tourType === 'specialized') {
      // Specialized tours: per vehicle or per person
      const hours = parseInt(tourLength.replace('hours', '')) || 4;
      // For specialized tours, treat hours same as days for pricing
      const days = 1; // Hours are treated as single day rate
      
      if (transport === 'car-sedan') {
        // 20,000 yen for car
        totalPrice = 20000;
        priceDescription = `¥20,000 per day`;
      } else if (transport === 'van-alphard') {
        // 50,000 yen for Alphard
        totalPrice = 50000;
        priceDescription = `¥50,000 per day`;
      } else if (transport === 'van-hiace') {
        // 75,000 yen for HiAce
        totalPrice = 75000;
        priceDescription = `¥75,000 per day`;
      } else if (transport === 'minibus') {
        // 10,000 yen per person for minibus
        totalPrice = 10000 * numPeople;
        priceDescription = `¥10,000 per person × ${numPeople} ${numPeople === 1 ? 'person' : 'people'}`;
      } else if (transport === 'bus') {
        // 15,000 yen per person for bus
        totalPrice = 15000 * numPeople;
        priceDescription = `¥15,000 per person × ${numPeople} ${numPeople === 1 ? 'person' : 'people'}`;
      }
    } else if (tourType === 'customized') {
      // Customized tours: same logic as specialized
      const isDays = tourLength && tourLength.includes('days');
      const days = isDays ? parseInt(tourLength.replace('days', '')) : 1;
      
      if (transport === 'car-sedan') {
        // 20,000 yen per day for car
        totalPrice = 20000 * days;
        priceDescription = `¥20,000 per day × ${days} ${days === 1 ? 'day' : 'days'}`;
      } else if (transport === 'van-alphard') {
        // 50,000 yen per day for Alphard
        totalPrice = 50000 * days;
        priceDescription = `¥50,000 per day × ${days} ${days === 1 ? 'day' : 'days'}`;
      } else if (transport === 'van-hiace') {
        // 75,000 yen per day for HiAce
        totalPrice = 75000 * days;
        priceDescription = `¥75,000 per day × ${days} ${days === 1 ? 'day' : 'days'}`;
      } else if (transport === 'minibus') {
        // 10,000 yen per person per day for minibus
        totalPrice = 10000 * numPeople * days;
        priceDescription = `¥10,000 per person per day × ${numPeople} ${numPeople === 1 ? 'person' : 'people'} × ${days} ${days === 1 ? 'day' : 'days'}`;
      } else if (transport === 'bus') {
        // 15,000 yen per person per day for bus
        totalPrice = 15000 * numPeople * days;
        priceDescription = `¥15,000 per person per day × ${numPeople} ${numPeople === 1 ? 'person' : 'people'} × ${days} ${days === 1 ? 'day' : 'days'}`;
      }
    }
    
    // Calculate USD equivalent (using 150 JPY = 1 USD exchange rate)
    const totalPriceUSD = Math.round(totalPrice / 150);
    
    priceDiv.innerHTML = `
      <h4>Total Price</h4>
      <p class="price-amount">¥${totalPrice.toLocaleString()} / $${totalPriceUSD.toLocaleString()}</p>
      <p style="font-size: 14px; opacity: 0.9; margin-top: 8px;">${priceDescription}</p>
      <p style="font-size: 12px; opacity: 0.7; margin-top: 4px; font-style: italic;">* Exchange rate: 150 JPY = 1 USD (approximate)</p>
    `;
  }

  function getTransportType() {
    // Get from buttons instead of selects
    const regionalVehicleBtn = document.querySelector('#regional-vehicle-buttons .transport-btn.selected');
    const specializedTransportBtn = document.querySelector('#specialized-transport-buttons .transport-btn.selected');
    const customizedTransportBtn = document.querySelector('#customized-transport-buttons .transport-btn.selected');
    
    return regionalVehicleBtn?.dataset.value || 
           specializedTransportBtn?.dataset.value || 
           customizedTransportBtn?.dataset.value || '';
  }
  
  function getTransportLabel() {
    // Get label from selected button
    const regionalVehicleBtn = document.querySelector('#regional-vehicle-buttons .transport-btn.selected');
    const specializedTransportBtn = document.querySelector('#specialized-transport-buttons .transport-btn.selected');
    const customizedTransportBtn = document.querySelector('#customized-transport-buttons .transport-btn.selected');
    
    return regionalVehicleBtn?.textContent || 
           specializedTransportBtn?.textContent || 
           customizedTransportBtn?.textContent || '';
  }

  // Function to show message in modal
  function showBookingMessage(message, type = 'success') {
    const step4 = document.querySelector('[data-step="4"]');
    if (!step4) return;
    
    // Remove existing message if any
    const existingMessage = step4.querySelector('.booking-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `booking-message booking-message-${type}`;
    messageDiv.innerHTML = message;
    
    // Insert message before form actions
    const formActions = step4.querySelector('.form-actions');
    if (formActions) {
      formActions.insertAdjacentElement('beforebegin', messageDiv);
    } else {
      step4.appendChild(messageDiv);
    }
    
    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Function to reset booking form
  function resetBookingForm() {
    // Get modal context
    const modal = document.getElementById('bookingModal') || document.querySelector('[data-modal="booking"]');
    if (!modal) return;
    
    // Reset all form inputs within modal
    const allInputs = modal.querySelectorAll('input, select, textarea');
    allInputs.forEach(input => {
      if (input.type === 'radio' || input.type === 'checkbox') {
        input.checked = false;
      } else {
        input.value = '';
      }
      input.classList.remove('error');
    });
    
    // Reset selected buttons
    modal.querySelectorAll('.prefecture-btn.selected, .specialized-btn.selected, .transport-btn.selected').forEach(btn => {
      btn.classList.remove('selected');
    });
    
    // Reset calendar selection
    modal.querySelectorAll('.calendar-day.selected').forEach(day => {
      day.classList.remove('selected');
    });
    
    // Reset to Step 1
    const allSteps = modal.querySelectorAll('.booking-step');
    allSteps.forEach((step) => {
      const stepNum = parseInt(step.dataset.step) || 0;
      step.hidden = stepNum !== 1;
    });
    
    // Reset currentStep
    currentStep = 1;
    if (window.setBookingCurrentStep) {
      window.setBookingCurrentStep(1);
    }
    
    // Clear summary and price
    const summary = modal.querySelector('#booking-summary');
    const priceDiv = modal.querySelector('#booking-price');
    if (summary) summary.innerHTML = '';
    if (priceDiv) priceDiv.innerHTML = '';
    
    // Clear any messages
    const existingMessage = modal.querySelector('.booking-message');
    if (existingMessage) {
      existingMessage.remove();
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
  }

  // Form submission
  const submitBooking = document.getElementById('submit-booking');
  if (submitBooking) {
    submitBooking.addEventListener('click', async (e) => {
      e.preventDefault();
      
      // Collect all booking form values
      const name = document.getElementById('booking-name')?.value?.trim() || '';
      const email = document.getElementById('booking-email')?.value?.trim() || '';
      const contact = document.getElementById('booking-contact')?.value?.trim() || '';
      const peopleSelect = document.getElementById('booking-people')?.value || '';
      const peopleCustom = document.getElementById('people-custom')?.value || '';
      const people = peopleSelect === '11+' ? parseInt(peopleCustom, 10) : parseInt(peopleSelect, 10);
      
      // Get tour type
      const tourTypeRadio = document.querySelector('input[name="tour_type"]:checked');
      const booking_type = tourTypeRadio?.value || '';
      
      // Get selected date from calendar
      const selectedDateElement = document.querySelector('.calendar-day.selected');
      const monthYear = document.querySelector('[data-cal-month]')?.textContent || '';
      const dayText = selectedDateElement?.textContent || '';
      const selected_date = selectedDateElement ? `${monthYear} ${dayText}` : '';
      
      // Get estimated price (from summary or calculate)
      let estimated_price = null;
      const priceDiv = document.getElementById('booking-price');
      if (priceDiv) {
        const priceText = priceDiv.textContent;
        const yenMatch = priceText.match(/¥([\d,]+)/);
        if (yenMatch) {
          estimated_price = parseFloat(yenMatch[1].replace(/,/g, ''));
        }
      }
      
      // Collect all form details for the details JSON payload
      const details = {
        date: selected_date,
        name: name,
        email: email,
        contact: contact,
        people: peopleSelect === '11+' ? peopleCustom : peopleSelect,
        peopleCustom: peopleCustom,
        tourType: booking_type,
        region: document.getElementById('regional-region')?.value || '',
        regionalLength: document.getElementById('regional-length')?.value || '',
        specializedLength: document.getElementById('specialized-length')?.value || '',
        customizedLength: document.getElementById('customized-length')?.value || '',
        tourLength: document.getElementById('regional-length')?.value || 
                    document.getElementById('specialized-length')?.value ||
                    document.getElementById('customized-length')?.value || '',
        prefectures: Array.from(document.querySelectorAll('.prefecture-btn.selected')).map(btn => btn.dataset.value),
        specializedType: document.getElementById('specialized-type')?.value || '',
        specializedOptions: Array.from(document.querySelectorAll('.specialized-btn.selected')).map(btn => btn.dataset.value),
        interest: document.getElementById('customized-interest')?.value || '',
        vehicle: getTransportType(),
        pickupType: document.getElementById('pickup-type')?.value || '',
        pickupDetails: document.getElementById('pickup-details')?.value || 
                      document.getElementById('pickup-airport')?.value || '',
        dropoffType: document.getElementById('dropoff-type')?.value || '',
        dropoffDetails: document.getElementById('dropoff-details')?.value || 
                       document.getElementById('dropoff-airport')?.value || '',
        extraInfo: document.getElementById('extra-info')?.value || ''
      };
      
      // Build JSON payload with core fields and details
      const payload = {
        name: name,
        email: email,
        contact: contact,
        people: people,
        booking_type: booking_type,
        selected_date: selected_date,
        estimated_price: estimated_price,
        details: details
      };
      
      // Disable submit button and show loading state
      submitBooking.disabled = true;
      const originalText = submitBooking.textContent;
      submitBooking.textContent = 'Submitting...';
      
      // Clear any previous messages
      const existingMessage = document.querySelector('.booking-message');
      if (existingMessage) {
        existingMessage.remove();
      }
      
      try {
        // Send POST request to backend API
        const response = await fetch('http://localhost:3000/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          // Success - show success message in modal
          const successMessage = `
            <div style="text-align: center; padding: 2rem;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">✓</div>
              <h3 style="color: #10b981; margin-bottom: 0.5rem;">Booking request received</h3>
              <p style="font-size: 1.1rem; margin-bottom: 0.5rem; color: #374151;">
                Your booking ID: <strong>${data.booking_id}</strong>
              </p>
              <p style="color: #6b7280; margin-top: 0.5rem;">We'll contact you shortly.</p>
            </div>
          `;
          showBookingMessage(successMessage, 'success');
          
          // Hide submit button and form actions on success
          const formActions = document.querySelector('[data-step="4"] .form-actions');
          if (formActions) {
            formActions.style.display = 'none';
          }
          
          // Reset form after a short delay
          setTimeout(() => {
            resetBookingForm();
          }, 500);
          
          // Close modal after 2.5 seconds
          const modal = document.getElementById('bookingModal') || document.querySelector('[data-modal="booking"]');
          if (modal) {
            setTimeout(() => {
              modal.hidden = true;
              document.body.style.overflow = '';
              
              // Restore form actions for next use
              if (formActions) {
                formActions.style.display = '';
              }
            }, 2500);
          }
        } else {
          // Error from server - show error message in modal
          const errorMessage = data.error || 'Failed to submit booking';
          const errorHtml = `
            <div style="text-align: center; padding: 2rem;">
              <div style="font-size: 3rem; margin-bottom: 1rem; color: #ef4444;">✗</div>
              <h3 style="color: #ef4444; margin-bottom: 0.5rem;">Error</h3>
              <p style="color: #6b7280;">${errorMessage}</p>
            </div>
          `;
          showBookingMessage(errorHtml, 'error');
          
          // Re-enable submit button on error
          submitBooking.disabled = false;
          submitBooking.textContent = originalText;
        }
      } catch (error) {
        // Network or other error - show error message in modal
        console.error('Error submitting booking:', error);
        const errorHtml = `
          <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem; color: #ef4444;">✗</div>
            <h3 style="color: #ef4444; margin-bottom: 0.5rem;">Connection Error</h3>
            <p style="color: #6b7280;">Failed to connect to server. Please try again later.</p>
          </div>
        `;
        showBookingMessage(errorHtml, 'error');
        
        // Re-enable submit button on error
        submitBooking.disabled = false;
        submitBooking.textContent = originalText;
      }
    });
  }

  const inquiryForm = document.getElementById('inquiryForm');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Inquiry submitted! (This is a demo - in production, this would send the data to your server)');
      // In production, you would send form data to your backend
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBookingForm);
} else {
  initBookingForm();
}

/* =========================
   BOOK TOUR BUTTON HANDLER
   Pre-fills booking form based on tour selection
========================= */
function initBookTourButtons() {
  const bookTourButtons = document.querySelectorAll('[data-book-tour]');
  
  bookTourButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      const tourType = button.dataset.tourType;
      const tourName = button.dataset.tourName || '';
      
      // Store tour data for pre-filling
      window.pendingTourData = {
        type: tourType,
        data: button.dataset,
        name: tourName
      };
      
      // Open booking modal using existing mechanism
      const bookingModal = document.querySelector('[data-modal="booking"]');
      if (bookingModal) {
        bookingModal.hidden = false;
        document.body.style.overflow = 'hidden';
        
        // Switch to booking tab
        const bookingTab = document.querySelector('[data-booking-tab="booking"]');
        const inquiryTab = document.querySelector('[data-booking-tab="inquiry"]');
        const bookingPanel = document.querySelector('[data-panel="booking"]');
        const inquiryPanel = document.querySelector('[data-panel="inquiry"]');
        
        if (bookingTab && inquiryTab && bookingPanel && inquiryPanel) {
          inquiryTab.classList.remove('active');
          bookingTab.classList.add('active');
          inquiryPanel.hidden = true;
          bookingPanel.hidden = false;
        }
        
        // Wait for modal to render, then pre-fill form
        setTimeout(() => {
          prefillBookingForm(tourType, button.dataset);
          // Clear pending data
          window.pendingTourData = null;
        }, 300);
      }
    });
  });
}

function prefillBookingForm(tourType, tourData) {
  // Reset to Step 1 first (user still needs to fill personal info)
  const allSteps = document.querySelectorAll('.booking-step');
  allSteps.forEach(step => {
    step.hidden = true;
  });
  const step1 = document.querySelector('.booking-step[data-step="1"]');
  if (step1) {
    step1.hidden = false;
  }
  
  // Store prefill data to apply when user reaches Step 2
  window.bookingPrefillData = {
    type: tourType,
    data: tourData
  };
  
  // Prefill will be applied automatically when Step 2 is shown via showStep function
}

function applyBookingPrefill() {
  // Set flag to prevent validation during prefill
  window.isPrefilling = true;
  
  // Wait for Step 2 to be shown
  setTimeout(() => {
    const prefillData = window.bookingPrefillData;
    if (!prefillData) {
      window.isPrefilling = false;
      return;
    }
    
    const tourType = prefillData.type;
    const tourData = prefillData.data;
    
    if (tourType === 'regional') {
      const region = tourData.region;
      
      // Select regional tour type
      const regionalRadio = document.querySelector('input[name="tour_type"][value="regional"]');
      if (regionalRadio) {
        regionalRadio.checked = true;
        regionalRadio.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      // Wait for fields to show, then pre-fill
      setTimeout(() => {
        // Set region
        const regionSelect = document.getElementById('regional-region');
        if (regionSelect && region) {
          regionSelect.value = region;
          regionSelect.dispatchEvent(new Event('change', { bubbles: true }));
          
          // Set length to 1 day
          setTimeout(() => {
            const lengthSelect = document.getElementById('regional-length');
            if (lengthSelect && lengthSelect.options.length > 1) {
              lengthSelect.value = '1';
              lengthSelect.dispatchEvent(new Event('change', { bubbles: true }));
              
              // Select first prefecture
              setTimeout(() => {
                const firstPrefectureBtn = document.querySelector('#regional-prefectures .prefecture-btn');
                if (firstPrefectureBtn && !firstPrefectureBtn.classList.contains('disabled')) {
                  firstPrefectureBtn.click();
                }
              }, 150);
            }
          }, 200);
        }
      }, 200);
      
    } else if (tourType === 'specialized') {
      // Get specialized type from dataset (data-specialized-type becomes specializedType in JS)
      const specializedType = tourData.specializedType;
      
      if (!specializedType) {
        console.warn('Specialized tour type not found in tour data');
        return;
      }
      
      // Verify the type exists in specializedData
      if (!specializedData[specializedType]) {
        console.warn(`Specialized tour type "${specializedType}" not found in specializedData`);
        return;
      }
      
      // Select specialized tour type
      const specializedRadio = document.querySelector('input[name="tour_type"][value="specialized"]');
      if (specializedRadio) {
        specializedRadio.checked = true;
        specializedRadio.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      // Wait for fields to show, then pre-fill
      setTimeout(() => {
        const typeSelect = document.getElementById('specialized-type');
        if (typeSelect && specializedType) {
          // Verify the option exists
          const optionExists = Array.from(typeSelect.options).some(opt => opt.value === specializedType);
          if (!optionExists) {
            console.warn(`Option value "${specializedType}" not found in specialized-type select`);
            return;
          }
          
          typeSelect.value = specializedType;
          typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
          
          // Set appropriate length based on type
          setTimeout(() => {
            const lengthSelect = document.getElementById('specialized-length');
            if (lengthSelect && lengthSelect.options.length > 1) {
              // Select first available length option (skip the empty first option)
              lengthSelect.value = lengthSelect.options[1].value;
              lengthSelect.dispatchEvent(new Event('change', { bubbles: true }));
              
              // Select first option button after handlers are attached
              setTimeout(() => {
                const firstOptionBtn = document.querySelector('#specialized-options .specialized-btn');
                if (firstOptionBtn && !firstOptionBtn.classList.contains('disabled')) {
                  firstOptionBtn.click();
                }
              }, 150);
            }
          }, 200);
        }
      }, 200);
      
    } else if (tourType === 'customized') {
      // Select customized tour type
      const customizedRadio = document.querySelector('input[name="tour_type"][value="customized"]');
      if (customizedRadio) {
        customizedRadio.checked = true;
        customizedRadio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    
    // Clear prefill data after applying
    window.bookingPrefillData = null;
    
    // Clear prefilling flag after all prefill operations complete
    // (all nested timeouts should complete within 600ms)
    setTimeout(() => {
      window.isPrefilling = false;
    }, 600);
  }, 100);
}

// Initialize book tour buttons
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBookTourButtons);
} else {
  initBookTourButtons();
}

