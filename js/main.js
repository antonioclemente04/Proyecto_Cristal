document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Carousel functionality
    function initializeCarousel(carouselId, interval = 3000) {
        const carousel = document.getElementById(carouselId);
        if (!carousel) return;
        
        const track = carousel.querySelector('.carousel-track');
        const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
        const slideCount = slides.length;
        
        if (slideCount <= 1) return; // No need for carousel if only one slide
        
        let currentIndex = 0;
        const slideWidth = 100; // Percentage
        
        // Clone first and last slides for infinite effect
        const firstClone = slides[0].cloneNode(true);
        const lastClone = slides[slideCount - 1].cloneNode(true);
        
        track.appendChild(firstClone);
        track.insertBefore(lastClone, slides[0]);
        
        // Update slide count and set initial position
        const totalSlides = slideCount + 2;
        track.style.width = `${totalSlides * 100}%`;
        track.style.transform = `translateX(-${slideWidth}%)`;
        
        // Auto-advance carousel
        let slideInterval = setInterval(nextSlide, interval);
        
        // Pause on hover
        carousel.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        carousel.addEventListener('mouseleave', () => {
            slideInterval = setInterval(nextSlide, interval);
        });
        
        function nextSlide() {
            currentIndex++;
            moveToSlide(currentIndex);
        }
        
        function moveToSlide(index) {
            // If at the first clone, jump to the last real slide
            if (index >= totalSlides - 1) {
                currentIndex = 1;
                track.style.transition = 'none';
                track.style.transform = `translateX(-${currentIndex * slideWidth}%)`;
                // Force reflow
                track.offsetHeight;
            }
            // If at the last clone, jump to the first real slide
            else if (index < 0) {
                currentIndex = totalSlides - 2;
                track.style.transition = 'none';
                track.style.transform = `translateX(-${currentIndex * slideWidth}%)`;
                // Force reflow
                track.offsetHeight;
            }
            
            // Normal slide transition
            track.style.transition = 'transform 0.5s ease-in-out';
            track.style.transform = `translateX(-${(currentIndex + 1) * slideWidth}%)`;
        }
        
        // Reset transition for infinite effect
        track.addEventListener('transitionend', () => {
            if (currentIndex >= totalSlides - 2) {
                currentIndex = 0;
                track.style.transition = 'none';
                track.style.transform = `translateX(-${slideWidth}%)`;
            } else if (currentIndex < 0) {
                currentIndex = totalSlides - 3;
                track.style.transition = 'none';
                track.style.transform = `translateX(-${(totalSlides - 2) * slideWidth}%)`;
            }
        });
    }
    
    // Initialize all carousels
    initializeCarousel('carousel1', 3500);
    initializeCarousel('carousel2', 4000);
    initializeCarousel('carousel3', 4500);
    
    // Form submission handling
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const formValues = Object.fromEntries(formData.entries());
            
            // Here you would typically send the form data to a server
            console.log('Form submitted:', formValues);
            
            // Show success message
            alert('¡Mensaje enviado con éxito! Me pondré en contacto contigo pronto.');
            
            // Reset form
            contactForm.reset();
        });
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add animation to elements when they come into view
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.carousel-container, .masonry-item, .contact-container > div');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Set initial styles for animation
    document.addEventListener('DOMContentLoaded', () => {
        const elements = document.querySelectorAll('.carousel-container, .masonry-item, .contact-container > div');
        elements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        });
        
        // Trigger initial animation check
        animateOnScroll();
    });
    
    // Add scroll event listener for animations
    window.addEventListener('scroll', animateOnScroll);
});
