// ===== Mobile Menu Toggle =====
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.portfolio__menu');

menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    menuToggle.setAttribute('aria-expanded', sidebar.classList.contains('active'));
});

// Close menu when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 992 &&
        !sidebar.contains(e.target) &&
        e.target !== menuToggle) {
        sidebar.classList.remove('active');
        document.body.style.overflow = '';
        menuToggle.setAttribute('aria-expanded', 'false');
    }
});

// ===== Smooth Scrolling for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            if (window.innerWidth <= 992) {
                sidebar.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        }
    });
});

// ===== Active Navigation Highlighting on Scroll =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.portfolio__menu-list a');

function updateActiveNav() {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 150) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveNav);
updateActiveNav();

// ===== Update Copyright Year =====
// Only update if the element exists
const yearEl = document.getElementById('year');
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

// ===== Scroll-based Animations =====
const animateOnScroll = function () {
    const elements = document.querySelectorAll(
        '.project-card, .skill-category, .contact-card, .resume__placeholder, .blog__placeholder, .datasets__placeholder'
    );

    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;

        if (elementPosition < screenPosition) {
            element.style.opacity = '1';
        }
    });
};

// Set initial state — opacity only, NO translateY (translateY causes layout shifts
// which make the page briefly taller than the viewport, flickering the scrollbar)
document.querySelectorAll(
    '.project-card, .skill-category, .contact-card, .resume__placeholder, .blog__placeholder, .datasets__placeholder'
).forEach(el => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.5s ease';
});

window.addEventListener('scroll', animateOnScroll);
animateOnScroll();

// ===== Scroll to Top Button =====
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===== Toast Notification Helper =====
function showToast(message, type = 'success') {
    // Remove any existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('show'));
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}

// ===== Contact Form — AJAX Submission (user never leaves the page) =====
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault(); // Prevent default page redirect

        const submitBtn = contactForm.querySelector('.contact-submit');
        const originalBtnHTML = submitBtn.innerHTML;

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            const formData = new FormData(contactForm);

            // Remove the redirect field so Web3Forms doesn't redirect
            formData.delete('redirect');

            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                showToast('Message sent! I\'ll get back to you within 24–48 hours.', 'success');
                contactForm.reset();
            } else {
                showToast('Something went wrong. Please try again or email me directly.', 'error');
            }
        } catch (error) {
            showToast('Network error. Please check your connection and try again.', 'error');
        } finally {
            // Restore button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
        }
    });
}
