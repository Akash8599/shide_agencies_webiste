document.addEventListener('DOMContentLoaded', () => {

    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Navbar Scroll Transition
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3D Scroll Reveal Animation - DISABLED (Content visible immediately)
    /*
    const revealItems = document.querySelectorAll('.fade-in-3d');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealItems.forEach(item => revealObserver.observe(item));
    */

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const icon = mobileBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // Form Handling - Email Submission
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;

            // Show loading state
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            const formData = new FormData(form);

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Success - Visual feedback
                    form.innerHTML = `
                        <div class="form-success-message">
                            <i class="fas fa-check-circle"></i>
                            <h4>Message Sent Successfully!</h4>
                            <p>Thank you for reaching out. We have received your inquiry and will respond to you shortly.</p>
                            <button onclick="location.reload()" class="btn btn-secondary" style="margin-top: 2rem;">Send Another Message</button>
                        </div>
                    `;
                } else {
                    // Server error
                    const data = await response.json();
                    if (Object.hasOwn(data, 'errors')) {
                        alert(data["errors"].map(error => error["message"]).join(", "));
                    } else {
                        alert('Oops! There was a problem submitting your form. Please try again later.');
                    }
                }
            } catch (error) {
                // Network error
                alert('Oops! There was a connection problem. Please check your internet and try again.');
            } finally {
                // Restore button state
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                // Account for fixed navbar
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Hero Slider Logic
    const slides = document.querySelectorAll('.slide');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    if (slides.length > 0) {
        let currentSlide = 0;
        const slideInterval = 5000;
        let slideTimer;

        // Initialize first slide
        slides[0].classList.add('active');

        function goToSlide(index, direction) {
            if (index === currentSlide) return;

            const outgoing = slides[currentSlide];
            const incoming = slides[index];

            // Setup Transition
            // Clear any existing transitions/transforms that might conflict
            slides.forEach(s => {
                s.style.transition = '';
                s.style.transform = '';
            });

            // Define positions based on direction
            // direction 'next': Outgoing -> Left (-100%), Incoming from Right (100% -> 0)
            // direction 'prev': Outgoing -> Right (100%), Incoming from Left (-100% -> 0)

            const outMove = direction === 'next' ? '-100%' : '100%';
            const inStart = direction === 'next' ? '100%' : '-100%';

            // 1. Prepare Incoming
            incoming.style.transition = 'none';
            incoming.style.transform = `translateX(${inStart}) scale(1)`;
            incoming.style.opacity = '1';
            incoming.classList.add('active'); // Ensure it's visible (opacity handled by class too but we override)

            // Force reflow
            void incoming.offsetWidth;

            // 2. Animate
            const transitionStyle = 'transform 1s ease-in-out, opacity 1s ease-in-out';

            // Animate Incoming
            incoming.style.transition = transitionStyle;
            incoming.style.transform = 'translateX(0) scale(1.1)'; // End with zoom

            // Animate Outgoing
            outgoing.style.transition = transitionStyle;
            outgoing.style.transform = `translateX(${outMove}) scale(1)`;
            outgoing.style.opacity = '0';
            outgoing.classList.remove('active');

            // Cleanup after animation (optional, but good for cleanliness)
            setTimeout(() => {
                if (!incoming.classList.contains('active')) return; // Check if changed again
                // Reset typical state for zoom effect if needed, 
                // but simpler to just leave it as .active definition handles standard state?
                // Actually, .active in CSS has `transition: opacity 1.5s, transform 10s`.
                // We want to switch back to that "slow zoom" after the slide.
                incoming.style.transition = '';
                incoming.style.transform = ''; // Handled by CSS .active
            }, 1000);

            currentSlide = index;
        }

        function nextSlide() {
            const nextIndex = (currentSlide + 1) % slides.length;
            goToSlide(nextIndex, 'next');
            resetTimer();
        }

        function prevSlide() {
            const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
            goToSlide(prevIndex, 'prev');
            resetTimer();
        }

        function resetTimer() {
            clearInterval(slideTimer);
            slideTimer = setInterval(nextSlide, slideInterval);
        }

        // Event Listeners
        if (nextBtn) nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            nextSlide();
        });

        if (prevBtn) prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            prevSlide();
        });

        // Start Auto Slide
        resetTimer();
    }
});
