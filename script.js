document.addEventListener('DOMContentLoaded', function() {
    initNavbar();
    initScrollAnimations();
    initLightbox();
    initWishForm();
    initCountdown();
    initPetals();
});

function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    const scrollBtn = document.getElementById('scrollBtn');
    if (scrollBtn) {
        scrollBtn.addEventListener('click', function() {
            document.getElementById('wishes').scrollIntoView({ behavior: 'smooth' });
        });
    }
}

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                
                if (target.classList.contains('card')) {
                    setTimeout(() => {
                        target.classList.add('animate');
                    }, Array.from(target.parentElement.children).indexOf(target) * 80);
                } else if (target.classList.contains('gallery-item')) {
                    setTimeout(() => {
                        target.classList.add('animate');
                    }, Array.from(target.parentElement.children).indexOf(target) * 80);
                } else if (target.classList.contains('timer-item')) {
                    setTimeout(() => {
                        target.classList.add('animate');
                    }, Array.from(target.parentElement.children).indexOf(target) * 120);
                } else {
                    target.classList.add('animate');
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.card, .gallery-item, .wish-form, .wish-list, .timer-item').forEach(el => {
        observer.observe(el);
    });
}

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const galleryItems = document.querySelectorAll('.gallery-item');
    let currentIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;

    const images = Array.from(galleryItems).map(item => ({
        src: item.querySelector('img').src,
        caption: item.querySelector('.gallery-caption').textContent
    }));

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            currentIndex = index;
            openLightbox();
        });
    });

    function openLightbox() {
        lightboxImage.src = images[currentIndex].src;
        lightboxCaption.textContent = images[currentIndex].caption;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function prevImage() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        openLightbox();
    }

    function nextImage() {
        currentIndex = (currentIndex + 1) % images.length;
        openLightbox();
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', prevImage);
    lightboxNext.addEventListener('click', nextImage);

    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (lightbox.classList.contains('active')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
        }
    });

    lightbox.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextImage();
            } else {
                prevImage();
            }
        }
    }
}

function initWishForm() {
    const form = document.getElementById('wishForm');
    const successMessage = document.getElementById('successMessage');
    const wishItems = document.getElementById('wishItems');

    loadWishes();

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const message = document.getElementById('message').value;
        const timestamp = new Date().toLocaleString('zh-CN');

        const wish = {
            id: Date.now(),
            name: name,
            message: message,
            timestamp: timestamp
        };

        saveWish(wish);
        displayWish(wish);

        form.reset();
        
        successMessage.classList.add('active');
        setTimeout(() => {
            successMessage.classList.remove('active');
        }, 3000);
    });

    function saveWish(wish) {
        const wishes = getWishes();
        wishes.push(wish);
        localStorage.setItem('mothersDayWishes', JSON.stringify(wishes));
    }

    function getWishes() {
        const stored = localStorage.getItem('mothersDayWishes');
        return stored ? JSON.parse(stored) : [];
    }

    function loadWishes() {
        const wishes = getWishes();
        wishes.forEach(wish => {
            displayWish(wish);
        });
    }

    function displayWish(wish) {
        const wishItem = document.createElement('div');
        wishItem.className = 'wish-item';
        wishItem.innerHTML = `
            <div class="wish-name">${escapeHtml(wish.name)}</div>
            <div class="wish-text">${escapeHtml(wish.message)}</div>
            <div class="wish-time">${wish.timestamp}</div>
        `;
        wishItems.appendChild(wishItem);
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

function initCountdown() {
    function getNextMothersDay() {
        const now = new Date();
        const currentYear = now.getFullYear();
        let mothersDay = new Date(currentYear, 4, 1);
        
        const firstSunday = (7 - mothersDay.getDay()) % 7;
        mothersDay.setDate(1 + firstSunday + 7);
        
        if (mothersDay < now) {
            mothersDay.setFullYear(currentYear + 1);
        }
        
        return mothersDay;
    }

    function updateCountdown() {
        const targetDate = getNextMothersDay();
        const now = new Date().getTime();
        const diff = targetDate.getTime() - now;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function initPetals() {
    const container = document.getElementById('petalsContainer');
    const petalChars = ['🌸', '🌺', '💐', '🌹', '🌷', '🌼'];
    const petalCount = 15;

    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('span');
        petal.className = 'petal';
        petal.textContent = petalChars[Math.floor(Math.random() * petalChars.length)];
        
        petal.style.left = `${Math.random() * 100}%`;
        petal.style.animationDuration = `${10 + Math.random() * 15}s`;
        petal.style.animationDelay = `${Math.random() * 12}s`;
        petal.style.fontSize = `${14 + Math.random() * 14}px`;
        petal.style.opacity = 0.5 + Math.random() * 0.3;
        
        container.appendChild(petal);
    }
}