/* Reference logos: a static grid without JS, a centered carousel with JS. */
(() => {
    'use strict';

    const carousel = document.querySelector('.references__carousel');
    if (!carousel) return;

    const logos = [...carousel.children];
    if (!logos.length) return;

    const section = carousel.closest('section') || carousel;
    if (section.querySelector('.references__controls')) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = Math.min(2, logos.length - 1);
    let paused = false;
    let visible = false;
    let hovered = false;
    let timer = null;

    function button(label, text) {
        const element = document.createElement('button');
        element.type = 'button';
        element.setAttribute('aria-label', label);
        element.textContent = text;
        return element;
    }

    const controls = document.createElement('div');
    controls.className = 'references__controls';

    const prevButton = button('Önceki referans', '←');
    const pauseButton = button('Otomatik geçişi duraklat', 'Ⅱ');
    const nextButton = button('Sonraki referans', '→');

    prevButton.dataset.prev = '';
    pauseButton.dataset.pause = '';
    nextButton.dataset.next = '';

    controls.append(prevButton, pauseButton, nextButton);
    carousel.after(controls);

    function schedule() {
        clearTimeout(timer);

        if (
            paused ||
            motion.matches ||
            !visible ||
            hovered ||
            document.hidden ||
            section.contains(document.activeElement)
        ) {
            return;
        }

        timer = setTimeout(() => move(1), 3000);
    }

    function render() {
        logos.forEach((logo, index) => {
            let offset = (index - current + logos.length) % logos.length;
            if (offset > logos.length / 2) offset -= logos.length;

            logo.style.transform = `translateX(${offset * 100}%)`;
            logo.classList.toggle('is-visible', Math.abs(offset) <= 2);
            logo.classList.toggle('is-center', offset === 0);
            logo.classList.toggle('is-edge', Math.abs(offset) === 2);
            logo.setAttribute('aria-hidden', String(Math.abs(offset) > 2));
        });

        const isPaused = paused || motion.matches;
        pauseButton.textContent = isPaused ? '▷' : 'Ⅱ';
        pauseButton.setAttribute('aria-label', isPaused ? 'Otomatik geçişi başlat' : 'Otomatik geçişi duraklat');
        pauseButton.disabled = motion.matches;

        schedule();
    }

    function move(step) {
        current = (current + step + logos.length) % logos.length;
        render();
    }

    prevButton.addEventListener('click', () => move(-1));
    nextButton.addEventListener('click', () => move(1));
    pauseButton.addEventListener('click', () => {
        paused = !paused;
        render();
    });

    section.addEventListener('mouseenter', () => {
        hovered = true;
        schedule();
    });

    section.addEventListener('mouseleave', () => {
        hovered = false;
        schedule();
    });

    section.addEventListener('focusin', schedule);
    section.addEventListener('focusout', () => setTimeout(schedule, 0));
    document.addEventListener('visibilitychange', schedule);
    window.addEventListener('pagehide', () => clearTimeout(timer));

    if (typeof motion.addEventListener === 'function') {
        motion.addEventListener('change', render);
    } else if (typeof motion.addListener === 'function') {
        motion.addListener(render);
    }

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            schedule();
        }, { threshold: 0.2 }).observe(carousel);
    } else {
        visible = true;
    }

    carousel.classList.add('is-ready');
    render();
})();
