/* Project gallery slider: keyboard, touch, autoplay and live slide count. */
(() => {
    'use strict';

    const slider = document.querySelector('.project-slider');
    if (!slider) return;

    const track = slider.querySelector('.slider-track');
    const slides = track ? [...track.children] : [];
    if (!track || !slides.length) return;

    const total = slides.length;
    const counter = slider.querySelector('[data-counter]');
    const prevButton = slider.querySelector('[data-prev]');
    const nextButton = slider.querySelector('[data-next]');
    const toggleButton = slider.querySelector('[data-autoplay]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let current = 0;
    let paused = reducedMotion.matches;
    let visible = false;
    let hovering = false;
    let timer = null;

    function formatCounter(index) {
        return `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    }

    function setCounter() {
        if (counter) counter.textContent = formatCounter(current);
    }

    function scrollToSlide(index) {
        const left = index * track.clientWidth;

        if (typeof track.scrollTo === 'function') {
            track.scrollTo({
                left,
                behavior: reducedMotion.matches ? 'auto' : 'smooth'
            });
        } else {
            track.scrollLeft = left;
        }
    }

    function restartAutoplay() {
        clearTimeout(timer);

        if (
            paused ||
            reducedMotion.matches ||
            !visible ||
            hovering ||
            document.hidden ||
            slider.contains(document.activeElement)
        ) {
            return;
        }

        timer = setTimeout(() => go(current + 1), 5000);
    }

    function go(index) {
        restartAutoplay();
        current = (index + slides.length) % slides.length;
        setCounter();
        scrollToSlide(current);
    }

    function renderToggle() {
        if (!toggleButton) return;

        const isPaused = paused || reducedMotion.matches;
        toggleButton.textContent = isPaused ? '▷' : 'Ⅱ';
        toggleButton.setAttribute('aria-label', isPaused ? 'Otomatik geçişi başlat' : 'Otomatik geçişi duraklat');
        toggleButton.disabled = reducedMotion.matches;
    }

    slides.forEach((slide, index) => {
        slide.setAttribute('aria-label', `${index + 1} / ${total}`);
    });

    setCounter();

    if (prevButton) prevButton.addEventListener('click', () => go(current - 1));
    if (nextButton) nextButton.addEventListener('click', () => go(current + 1));

    slider.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            go(current - 1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            go(current + 1);
        } else if (event.key === 'Home') {
            event.preventDefault();
            go(0);
        } else if (event.key === 'End') {
            event.preventDefault();
            go(total - 1);
        }
    });

    track.addEventListener('scroll', () => {
        if (!track.clientWidth) return;
        current = Math.round(track.scrollLeft / track.clientWidth);
        setCounter();
        restartAutoplay();
    }, { passive: true });

    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            paused = !paused;
            renderToggle();
            restartAutoplay();
        });
    }

    slider.addEventListener('mouseenter', () => {
        hovering = true;
        restartAutoplay();
    });

    slider.addEventListener('mouseleave', () => {
        hovering = false;
        restartAutoplay();
    });

    slider.addEventListener('focusin', restartAutoplay);
    slider.addEventListener('focusout', () => setTimeout(restartAutoplay, 0));

    track.addEventListener('pointerdown', () => clearTimeout(timer));
    track.addEventListener('pointerup', restartAutoplay);

    document.addEventListener('visibilitychange', restartAutoplay);
    window.addEventListener('pagehide', () => clearTimeout(timer));

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            restartAutoplay();
        }, { threshold: 0.5 }).observe(slider);
    } else {
        visible = true;
        restartAutoplay();
    }

    if ('ResizeObserver' in window) {
        new ResizeObserver(() => {
            scrollToSlide(current);
        }).observe(track);
    } else {
        window.addEventListener('resize', () => scrollToSlide(current));
    }

    if (typeof reducedMotion.addEventListener === 'function') {
        reducedMotion.addEventListener('change', () => {
            renderToggle();
            restartAutoplay();
        });
    } else if (typeof reducedMotion.addListener === 'function') {
        reducedMotion.addListener(() => {
            renderToggle();
            restartAutoplay();
        });
    }

    renderToggle();
})();
