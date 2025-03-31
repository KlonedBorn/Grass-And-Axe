// Mobile Navigation Menu Toggle
document.addEventListener('DOMContentLoaded', function () {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('nav ul');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function () {
            navMenu.classList.toggle('active');
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', function (event) {
        if (!event.target.closest('nav') && !event.target.closest('.mobile-menu-btn')) {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        }
    });

    // Gallery Filters
    const filterButtons = document.querySelectorAll('.filter-button');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function () {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));

                // Add active class to clicked button
                this.classList.add('active');

                const filterValue = this.textContent.toLowerCase();

                // Show/hide gallery items based on filter
                if (filterValue === 'all') {
                    galleryItems.forEach(item => {
                        item.style.display = 'block';
                    });
                } else {
                    galleryItems.forEach(item => {
                        const category = item.getAttribute('data-category').toLowerCase();
                        if (category.includes(filterValue)) {
                            item.style.display = 'block';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                }
            });
        });
    }

    // Before/After Image Comparison Slider
    const sliders = document.querySelectorAll('.comparison-slider');

    if (sliders.length > 0) {
        sliders.forEach(slider => {
            let isActive = false;

            // Add mouse events
            slider.addEventListener('mousedown', function () {
                isActive = true;
            });

            document.addEventListener('mouseup', function () {
                isActive = false;
            });

            document.addEventListener('mousemove', function (e) {
                if (!isActive) return;

                const container = slider.closest('.comparison-container');
                const beforeImg = container.querySelector('.before-image');
                const containerRect = container.getBoundingClientRect();

                // Calculate position percentage
                let posX = e.pageX - containerRect.left;
                posX = Math.max(0, Math.min(posX, containerRect.width));
                const percentage = (posX / containerRect.width) * 100;

                // Update slider position
                slider.style.left = `${percentage}%`;

                // Update clip-path for before image
                beforeImg.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
            });

            // Add touch events for mobile
            slider.addEventListener('touchstart', function () {
                isActive = true;
            });

            document.addEventListener('touchend', function () {
                isActive = false;
            });

            document.addEventListener('touchmove', function (e) {
                if (!isActive) return;

                const container = slider.closest('.comparison-container');
                const beforeImg = container.querySelector('.before-image');
                const containerRect = container.getBoundingClientRect();

                // Calculate position percentage
                let posX = e.touches[0].pageX - containerRect.left;
                posX = Math.max(0, Math.min(posX, containerRect.width));
                const percentage = (posX / containerRect.width) * 100;

                // Update slider position
                slider.style.left = `${percentage}%`;

                // Update clip-path for before image
                beforeImg.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
            });
        });
    }

    // Tabs functionality
    const tabButtons = document.querySelectorAll('.tab-button');

    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', function () {
                const tabContainer = this.closest('.tabs-container');
                const tabContents = tabContainer.querySelectorAll('.tab-content');
                const targetTab = this.getAttribute('data-tab');

                // Remove active class from all buttons and contents
                tabContainer.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                });

                tabContents.forEach(content => {
                    content.classList.remove('active');
                });

                // Add active class to clicked button and target content
                this.classList.add('active');
                tabContainer.querySelector(`.tab-content[data-tab="${targetTab}"]`).classList.add('active');
            });
        });
    }

    // Booking form validation
    const bookingForm = document.getElementById('booking-form');

    if (bookingForm) {
        bookingForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Basic validation
            const requiredFields = bookingForm.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });

            // Email validation
            const emailField = bookingForm.querySelector('input[type="email"]');
            if (emailField && emailField.value) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(emailField.value)) {
                    isValid = false;
                    emailField.classList.add('error');
                }
            }

            // If valid, proceed to next step or submit
            if (isValid) {
                // If multi-step form
                const currentStep = bookingForm.querySelector('.booking-step.active');
                const nextStep = currentStep.nextElementSibling;

                if (nextStep && nextStep.classList.contains('booking-step')) {
                    currentStep.classList.remove('active');
                    nextStep.classList.add('active');

                    // Update progress indicator if exists
                    const progressItems = document.querySelectorAll('.progress-item');
                    if (progressItems.length > 0) {
                        const currentIndex = Array.from(document.querySelectorAll('.booking-step')).indexOf(currentStep);
                        progressItems[currentIndex].classList.add('completed');
                        progressItems[currentIndex + 1].classList.add('active');
                    }
                } else {
                    // Final submission - would normally submit the form or make an API call
                    alert('Booking submitted successfully!');
                    window.location.href = 'booking-confirmation.html';
                }
            }
        });
    }
});