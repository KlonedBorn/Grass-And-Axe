/**
 * Grass & Axe Booking System JavaScript
 * Handles all booking form functionality, validation, and interactions
 */

document.addEventListener('DOMContentLoaded', function () {
    // Initialize booking steps
    initBookingSystem();

    // Initialize date picker
    initDatePicker();

    // Initialize time slots
    initTimeSlots();

    // Initialize service selection
    initServiceSelection();

    // Initialize form validation
    initFormValidation();

    // Initialize payment method selection
    initPaymentMethods();
});

/**
 * Initialize the booking system and step navigation
 */
function initBookingSystem() {
    const progressItems = document.querySelectorAll('.progress-item');
    const bookingSteps = document.querySelectorAll('.booking-step');
    const nextButtons = document.querySelectorAll('.next-button');
    const backButtons = document.querySelectorAll('.back-button');

    // Handle next button clicks
    nextButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            const currentStep = this.closest('.booking-step');
            const currentStepIndex = Array.from(bookingSteps).indexOf(currentStep);

            // Validate current step before proceeding
            if (validateStep(currentStepIndex + 1)) {
                // If validation passes, proceed to next step
                moveToStep(currentStepIndex + 2); // +2 because steps are 1-indexed in UI
            }
        });
    });

    // Handle back button clicks
    backButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            const currentStep = this.closest('.booking-step');
            const currentStepIndex = Array.from(bookingSteps).indexOf(currentStep);

            moveToStep(currentStepIndex); // Go to previous step
        });
    });

    // Allow clicking directly on progress items (if completed)
    progressItems.forEach((item, index) => {
        item.addEventListener('click', function () {
            // Only allow clicking on completed steps or the active step
            if (this.classList.contains('completed') || this.classList.contains('active')) {
                moveToStep(index + 1);
            }
        });
    });

    // Initialize at step 1
    moveToStep(1);
}

/**
 * Move to a specific step in the booking process
 * @param {number} stepNumber - The step number to move to (1-indexed)
 */
function moveToStep(stepNumber) {
    const progressItems = document.querySelectorAll('.progress-item');
    const bookingSteps = document.querySelectorAll('.booking-step');

    // First hide all steps
    bookingSteps.forEach(step => {
        step.classList.remove('active');
    });

    // Remove active class from all progress items
    progressItems.forEach(item => {
        item.classList.remove('active');
    });

    // Show the selected step
    if (stepNumber > 0 && stepNumber <= bookingSteps.length) {
        bookingSteps[stepNumber - 1].classList.add('active');

        // Update the progress bar
        for (let i = 0; i < progressItems.length; i++) {
            if (i < stepNumber - 1) {
                progressItems[i].classList.add('completed');
                progressItems[i].classList.remove('active');
            } else if (i === stepNumber - 1) {
                progressItems[i].classList.add('active');
            } else {
                progressItems[i].classList.remove('completed');
                progressItems[i].classList.remove('active');
            }
        }

        // Scroll to top of booking container
        const bookingContainer = document.querySelector('.booking-container');
        if (bookingContainer) {
            bookingContainer.scrollIntoView({ behavior: 'smooth' });
        }

        // Update booking summary if moving to step 4 (review)
        if (stepNumber === 4) {
            updateBookingSummary();
        }
    }
}

/**
 * Validate fields for the current step
 * @param {number} stepNumber - The step number to validate
 * @returns {boolean} - Whether validation passed
 */
function validateStep(stepNumber) {
    // Clear any previous error messages
    clearValidationErrors();

    let isValid = true;

    // Validation for Step 1: Service Selection
    if (stepNumber === 1) {
        // Check if a service type is selected
        const selectedService = document.querySelector('.service-category .service-option.selected');
        if (!selectedService) {
            showValidationError('service-selection-error');
            isValid = false;
        }

        // Check if a specific service is selected
        const specificService = document.querySelector('.specific-services .service-option.selected');
        if (!specificService) {
            showValidationError('specific-service-error');
            isValid = false;
        }

        // Check property type and size
        const propertyType = document.getElementById('property-type');
        if (propertyType && propertyType.value === '') {
            showFieldError(propertyType, 'Please select a property type');
            isValid = false;
        }

        const propertySize = document.getElementById('property-size');
        if (propertySize && (!propertySize.value || propertySize.value <= 0)) {
            showFieldError(propertySize, 'Please enter a valid property size');
            isValid = false;
        }
    }

    // Validation for Step 2: Date and Time
    else if (stepNumber === 2) {
        // Check if date is selected
        const selectedDate = document.querySelector('.calendar-day.selected');
        if (!selectedDate) {
            showValidationError('date-selection-error');
            isValid = false;
        }

        // Check if time slot is selected
        const selectedTime = document.querySelector('.time-slot.selected');
        if (!selectedTime) {
            showValidationError('time-selection-error');
            isValid = false;
        }

        // Check if service frequency is selected
        const serviceFrequency = document.querySelector('input[name="service-frequency"]:checked');
        if (!serviceFrequency) {
            showValidationError('frequency-selection-error');
            isValid = false;
        }
    }

    // Validation for Step 3: Customer Information
    else if (stepNumber === 3) {
        // Required personal information fields
        const requiredFields = [
            'customer-name',
            'customer-email',
            'customer-phone',
            'street-address',
            'city',
            'state',
            'zip'
        ];

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                showFieldError(field, 'This field is required');
                isValid = false;
            }
        });

        // Email validation
        const emailField = document.getElementById('customer-email');
        if (emailField && emailField.value) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(emailField.value)) {
                showFieldError(emailField, 'Please enter a valid email address');
                isValid = false;
            }
        }

        // Phone validation (simple check for now)
        const phoneField = document.getElementById('customer-phone');
        if (phoneField && phoneField.value) {
            if (phoneField.value.replace(/[^0-9]/g, '').length < 10) {
                showFieldError(phoneField, 'Please enter a valid phone number');
                isValid = false;
            }
        }

        // ZIP code validation (simple check for US)
        const zipField = document.getElementById('zip');
        if (zipField && zipField.value) {
            if (!/^\d{5}(-\d{4})?$/.test(zipField.value)) {
                showFieldError(zipField, 'Please enter a valid ZIP code');
                isValid = false;
            }
        }
    }

    // Validation for Step 4: Review and Payment
    else if (stepNumber === 4) {
        // Check if terms are accepted
        const termsCheckbox = document.getElementById('accept-terms');
        if (termsCheckbox && !termsCheckbox.checked) {
            showValidationError('terms-error');
            isValid = false;
        }

        // Check if payment method is selected
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
        if (!paymentMethod) {
            showValidationError('payment-method-error');
            isValid = false;
        }

        // If credit card is selected, validate card info
        if (paymentMethod && paymentMethod.value === 'credit-card') {
            const cardFields = [
                'card-number',
                'card-name',
                'expiry-date',
                'cvv'
            ];

            cardFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && !field.value.trim()) {
                    showFieldError(field, 'This field is required');
                    isValid = false;
                }
            });

            // Basic card validation 
            const cardNumber = document.getElementById('card-number');
            if (cardNumber && cardNumber.value) {
                if (cardNumber.value.replace(/\s/g, '').length < 16) {
                    showFieldError(cardNumber, 'Please enter a valid card number');
                    isValid = false;
                }
            }
        }
    }

    return isValid;
}

/**
 * Show an error message for a validation group
 * @param {string} errorId - The ID of the error message element
 */
function showValidationError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.style.display = 'block';
    }
}

/**
 * Show an error message for a specific field
 * @param {HTMLElement} field - The field with the error
 * @param {string} message - The error message to display
 */
function showFieldError(field, message) {
    field.classList.add('error');

    // Find or create error message element
    let errorMessage = field.nextElementSibling;
    if (!errorMessage || !errorMessage.classList.contains('error-message')) {
        errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        field.parentNode.insertBefore(errorMessage, field.nextSibling);
    }

    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

/**
 * Clear all validation error messages
 */
function clearValidationErrors() {
    // Clear general error messages
    const errorMessages = document.querySelectorAll('.error-message, .validation-error');
    errorMessages.forEach(message => {
        message.style.display = 'none';
    });

    // Clear field-specific errors
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => {
        field.classList.remove('error');
    });
}

/**
 * Initialize the service selection functionality
 */
function initServiceSelection() {
    // Service category selection
    const categoryOptions = document.querySelectorAll('.service-category .service-option');

    categoryOptions.forEach(option => {
        option.addEventListener('click', function () {
            // Deselect all options
            categoryOptions.forEach(opt => {
                opt.classList.remove('selected');
            });

            // Select this option
            this.classList.add('selected');

            // Hide all specific service sections
            const specificServices = document.querySelectorAll('.specific-services');
            specificServices.forEach(section => {
                section.style.display = 'none';
            });

            // Show the corresponding specific services
            const serviceType = this.getAttribute('data-service');
            if (serviceType) {
                const targetSection = document.getElementById(`${serviceType}-services`);
                if (targetSection) {
                    targetSection.style.display = 'block';
                }
            }

            // Update booking data
            const bookingData = getBookingData();
            bookingData.serviceCategory = this.querySelector('.service-name').textContent;
            saveBookingData(bookingData);
        });
    });

    // Specific service selection
    const specificOptions = document.querySelectorAll('.specific-services .service-option');

    specificOptions.forEach(option => {
        option.addEventListener('click', function () {
            // Get the parent container to only deselect siblings
            const parent = this.closest('.specific-services');

            // Deselect siblings
            const siblings = parent.querySelectorAll('.service-option');
            siblings.forEach(sib => {
                sib.classList.remove('selected');
            });

            // Select this option
            this.classList.add('selected');

            // Update booking data
            const bookingData = getBookingData();
            bookingData.specificService = this.querySelector('.service-name').textContent;
            saveBookingData(bookingData);
        });
    });

    // Property type and size
    const propertyType = document.getElementById('property-type');
    const propertySize = document.getElementById('property-size');

    if (propertyType) {
        propertyType.addEventListener('change', function () {
            const bookingData = getBookingData();
            bookingData.propertyType = this.options[this.selectedIndex].text;
            saveBookingData(bookingData);
        });
    }

    if (propertySize) {
        propertySize.addEventListener('change', function () {
            const bookingData = getBookingData();
            bookingData.propertySize = this.value;
            saveBookingData(bookingData);
        });
    }
}

/**
 * Initialize the date picker calendar
 */
function initDatePicker() {
    const calendar = document.querySelector('.calendar-grid');
    if (!calendar) return;

    // Get current date info
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Store current view
    let viewMonth = currentMonth;
    let viewYear = currentYear;

    // Render initial calendar
    renderCalendar(viewMonth, viewYear);

    // Previous month button
    const prevMonthBtn = document.querySelector('.prev-month');
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', function () {
            viewMonth--;
            if (viewMonth < 0) {
                viewMonth = 11;
                viewYear--;
            }
            renderCalendar(viewMonth, viewYear);
        });
    }

    // Next month button
    const nextMonthBtn = document.querySelector('.next-month');
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', function () {
            viewMonth++;
            if (viewMonth > 11) {
                viewMonth = 0;
                viewYear++;
            }
            renderCalendar(viewMonth, viewYear);
        });
    }

    /**
     * Render the calendar for a specific month/year
     */
    function renderCalendar(month, year) {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Update month/year display
        const monthYearElement = document.querySelector('.calendar-month-year');
        if (monthYearElement) {
            monthYearElement.textContent = `${monthNames[month]} ${year}`;
        }

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Clear previous calendar
        calendar.innerHTML = '';

        // Add day headers (Sun-Sat)
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendar.appendChild(dayHeader);
        });

        // Add empty cells for days before the first of the month
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendar.appendChild(emptyDay);
        }

        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            day.className = 'calendar-day';
            day.textContent = i;

            // Set data attributes for day selection
            day.setAttribute('data-date', `${year}-${month + 1}-${i}`);

            // Check if this day is in the past
            const dayDate = new Date(year, month, i);
            if (dayDate < today) {
                day.classList.add('disabled');
            } else {
                // Make selectable
                day.addEventListener('click', selectDate);
            }

            calendar.appendChild(day);
        }
    }

    /**
     * Handle date selection
     */
    function selectDate() {
        // If date is disabled, do nothing
        if (this.classList.contains('disabled')) {
            return;
        }

        // Deselect any previously selected date
        const selectedDates = document.querySelectorAll('.calendar-day.selected');
        selectedDates.forEach(date => {
            date.classList.remove('selected');
        });

        // Select this date
        this.classList.add('selected');

        // Update booking data
        const bookingData = getBookingData();
        bookingData.selectedDate = this.getAttribute('data-date');
        saveBookingData(bookingData);

        // Update time slots availability based on selected date
        updateTimeSlots(this.getAttribute('data-date'));
    }
}

/**
 * Initialize time slots selection
 */
function initTimeSlots() {
    const timeSlots = document.querySelectorAll('.time-slot');

    timeSlots.forEach(slot => {
        slot.addEventListener('click', function () {
            // Skip if disabled
            if (this.classList.contains('unavailable')) {
                return;
            }

            // Deselect all time slots
            timeSlots.forEach(s => {
                s.classList.remove('selected');
            });

            // Select this time slot
            this.classList.add('selected');

            // Update booking data
            const bookingData = getBookingData();
            bookingData.selectedTime = this.textContent.trim();
            saveBookingData(bookingData);
        });
    });

    // Service frequency selection
    const frequencyOptions = document.querySelectorAll('input[name="service-frequency"]');

    frequencyOptions.forEach(option => {
        option.addEventListener('change', function () {
            // Update booking data
            const bookingData = getBookingData();
            bookingData.serviceFrequency = this.nextElementSibling.textContent.trim();
            saveBookingData(bookingData);
        });
    });
}

/**
 * Update time slots based on selected date
 * In a real system, this would check availability from a database
 * @param {string} dateString - The selected date in YYYY-MM-DD format
 */
function updateTimeSlots(dateString) {
    const timeSlots = document.querySelectorAll('.time-slot');

    // For demo purposes, randomly mark some time slots as unavailable
    timeSlots.forEach(slot => {
        slot.classList.remove('unavailable');

        // Randomly make some slots unavailable (for demo)
        if (Math.random() > 0.7) {
            slot.classList.add('unavailable');
        }
    });
}

/**
 * Initialize form validation for customer information
 */
function initFormValidation() {
    // Customer info form fields
    const formFields = document.querySelectorAll('.customer-info input, .customer-info select, .customer-info textarea');

    formFields.forEach(field => {
        field.addEventListener('blur', function () {
            // Validate on blur
            if (field.hasAttribute('required') && !field.value.trim()) {
                showFieldError(field, 'This field is required');
            } else if (field.id === 'customer-email' && field.value.trim()) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(field.value)) {
                    showFieldError(field, 'Please enter a valid email address');
                }
            } else if (field.id === 'customer-phone' && field.value.trim()) {
                if (field.value.replace(/[^0-9]/g, '').length < 10) {
                    showFieldError(field, 'Please enter a valid phone number');
                }
            } else if (field.id === 'zip' && field.value.trim()) {
                if (!/^\d{5}(-\d{4})?$/.test(field.value)) {
                    showFieldError(field, 'Please enter a valid ZIP code');
                }
            } else {
                // Remove error if field is valid
                field.classList.remove('error');
                const errorMessage = field.nextElementSibling;
                if (errorMessage && errorMessage.classList.contains('error-message')) {
                    errorMessage.style.display = 'none';
                }

                // Update booking data
                if (field.id) {
                    const bookingData = getBookingData();
                    bookingData[field.id] = field.value;
                    saveBookingData(bookingData);
                }
            }
        });
    });
}

/**
 * Initialize payment method selection
 */
function initPaymentMethods() {
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    const creditCardFields = document.querySelector('.credit-card-fields');

    paymentMethods.forEach(method => {
        method.addEventListener('change', function () {
            // Show/hide credit card fields based on selection
            if (this.value === 'credit-card' && creditCardFields) {
                creditCardFields.style.display = 'block';
            } else if (creditCardFields) {
                creditCardFields.style.display = 'none';
            }

            // Update booking data
            const bookingData = getBookingData();
            bookingData.paymentMethod = this.value;
            saveBookingData(bookingData);
        });
    });

    // Format credit card number with spaces
    const cardNumberField = document.getElementById('card-number');
    if (cardNumberField) {
        cardNumberField.addEventListener('input', function () {
            let value = this.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = '';

            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }

            this.value = formattedValue;
        });
    }

    // Format expiry date
    const expiryField = document.getElementById('expiry-date');
    if (expiryField) {
        expiryField.addEventListener('input', function () {
            let value = this.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');

            if (value.length > 2) {
                this.value = value.substring(0, 2) + '/' + value.substring(2, 4);
            } else {
                this.value = value;
            }
        });
    }
}

/**
 * Update the booking summary with selected options
 */
function updateBookingSummary() {
    const bookingData = getBookingData();

    // Update summary fields
    updateSummaryField('summary-service', bookingData.specificService);
    updateSummaryField('summary-date', formatDate(bookingData.selectedDate));
    updateSummaryField('summary-time', bookingData.selectedTime);
    updateSummaryField('summary-frequency', bookingData.serviceFrequency);
    updateSummaryField('summary-property-type', bookingData.propertyType);
    updateSummaryField('summary-property-size', `${bookingData.propertySize} sq ft`);
    updateSummaryField('summary-customer-name', bookingData.customerName);
    updateSummaryField('summary-address', formatAddress(bookingData));
    updateSummaryField('summary-contact', formatContact(bookingData));

    // Calculate pricing (demo values)
    let basePrice = 0;

    switch (bookingData.serviceCategory) {
        case 'Residential Services':
            basePrice = 99;
            break;
        case 'Commercial Services':
            basePrice = 199;
            break;
        case 'Specialized Services':
            basePrice = 149;
            break;
        default:
            basePrice = 99;
    }

    // Adjust based on property size
    const size = parseInt(bookingData.propertySize) || 1000;
    const sizeFactor = Math.max(1, Math.min(3, Math.floor(size / 1000)));
    const adjustedPrice = basePrice * sizeFactor;

    // Apply frequency discount
    let frequencyMultiplier = 1;
    if (bookingData.serviceFrequency === 'Weekly') {
        frequencyMultiplier = 0.9; // 10% discount
    } else if (bookingData.serviceFrequency === 'Bi-weekly') {
        frequencyMultiplier = 0.95; // 5% discount
    }

    const finalPrice = adjustedPrice * frequencyMultiplier;

    // Update price summary
    updateSummaryField('summary-base-price', `$${adjustedPrice.toFixed(2)}`);

    const discount = adjustedPrice - finalPrice;
    if (discount > 0) {
        document.getElementById('discount-row').style.display = 'table-row';
        updateSummaryField('summary-discount', `-$${discount.toFixed(2)}`);
    } else {
        document.getElementById('discount-row').style.display = 'none';
    }

    updateSummaryField('summary-total', `$${finalPrice.toFixed(2)}`);
}

/**
 * Update a field in the booking summary
 * @param {string} elementId - The ID of the element to update
 * @param {string} value - The value to set
 */
function updateSummaryField(elementId, value) {
    const element = document.getElementById(elementId);
    if (element && value) {
        element.textContent = value;
    }
}

/**
 * Format a date for display
 * @param {string} dateString - The date in YYYY-MM-DD format
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
    if (!dateString) return '';

    try {
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

/**
 * Format address for display
 * @param {Object} bookingData - The booking data object
 * @returns {string} - Formatted address
 */
function formatAddress(bookingData) {
    const addressParts = [];

    if (bookingData['street-address']) {
        addressParts.push(bookingData['street-address']);
    }

    let cityStateZip = '';
    if (bookingData.city) {
        cityStateZip += bookingData.city;
    }

    if (bookingData.state) {
        cityStateZip += cityStateZip ? `, ${bookingData.state}` : bookingData.state;
    }

    if (bookingData.zip) {
        cityStateZip += cityStateZip ? ` ${bookingData.zip}` : bookingData.zip;
    }

    if (cityStateZip) {
        addressParts.push(cityStateZip);
    }

    return addressParts.join('<br>');
}

/**
 * Format contact information for display
 * @param {Object} bookingData - The booking data object
 * @returns {string} - Formatted contact info
 */
function formatContact(bookingData) {
    const contactParts = [];

    if (bookingData['customer-email']) {
        contactParts.push(`Email: ${bookingData['customer-email']}`);
    }

    if (bookingData['customer-phone']) {
        contactParts.push(`Phone: ${bookingData['customer-phone']}`);
    }

    return contactParts.join('<br>');
}

/**
 * Get the current booking data from local storage
 * @returns {Object} - The booking data object
 */
function getBookingData() {
    try {
        const savedData = localStorage.getItem('bookingData');
        return savedData ? JSON.parse(savedData) : {};
    } catch (e) {
        console.error('Error loading booking data:', e);
        return {};
    }
}

/**
 * Save booking data to local storage
 * @param {Object} data - The booking data to save
 */
function saveBookingData(data) {
    try {
        localStorage.setItem('bookingData', JSON.stringify(data));
    } catch (e) {
        console.error('Error saving booking data:', e);
    }
}

/**
 * Complete the booking process
 * In a real system, this would submit the data to a server
 */
function completeBooking() {
    // Get the booking data
    const bookingData = getBookingData();

    // In a real system, you would submit this to the server
    console.log('Booking data submitted:', bookingData);

    // Move to confirmation step
    moveToStep(5);

    // Generate a random booking reference number
    const bookingRef = 'GA' + Math.floor(100000 + Math.random() * 900000);
    document.getElementById('booking-reference').textContent = bookingRef;

    // Display confirmation date and time
    const confirmationDateTime = new Date().toLocaleString();
    document.getElementById('confirmation-datetime').textContent = confirmationDateTime;

    // Clear booking data for new booking
    localStorage.removeItem('bookingData');
}