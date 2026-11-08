/* Shared navigation, header, hero video and timeline behaviour. */
(() => {
    'use strict';

    const header = document.getElementById('siteHeader');
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const heroVideo = document.getElementById('heroVideo');

    function onMediaChange(query, callback) {
        if (typeof query.addEventListener === 'function') {
            query.addEventListener('change', callback);
        } else if (typeof query.addListener === 'function') {
            query.addListener(callback);
        }
    }

    /* Smooth wheel input with a short inertial tail; native touch scrolling stays untouched. */
    function initInertialScroll() {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const rootStyle = document.documentElement.style;
        let targetY = window.scrollY;
        let frame = null;
        let previousBehavior = '';
        let previousBehaviorPriority = '';

        function restoreScrollBehavior() {
            if (previousBehavior) {
                rootStyle.setProperty('scroll-behavior', previousBehavior, previousBehaviorPriority);
            } else {
                rootStyle.removeProperty('scroll-behavior');
            }
            previousBehavior = '';
            previousBehaviorPriority = '';
        }

        function stop() {
            if (frame !== null) {
                cancelAnimationFrame(frame);
                restoreScrollBehavior();
            }
            frame = null;
            targetY = window.scrollY;
        }

        function canScrollInside(event, delta) {
            const path = typeof event.composedPath === 'function'
                ? event.composedPath()
                : [event.target];

            for (const element of path) {
                if (!(element instanceof HTMLElement)) continue;
                if (element === document.body || element === document.documentElement) break;
                if (element.matches('input, textarea, select, [contenteditable="true"], [data-native-scroll]')) {
                    return true;
                }

                const overflowY = window.getComputedStyle(element).overflowY;
                if (!/(auto|scroll|overlay)/.test(overflowY) || element.scrollHeight <= element.clientHeight + 1) {
                    continue;
                }

                const canScrollUp = element.scrollTop > 0;
                const canScrollDown = element.scrollTop + element.clientHeight < element.scrollHeight - 1;
                if ((delta < 0 && canScrollUp) || (delta > 0 && canScrollDown)) return true;
            }

            return false;
        }

        function animate(timestamp) {
            const currentY = window.scrollY;
            const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            targetY = Math.max(0, Math.min(targetY, maxY));
            const difference = targetY - currentY;

            if (Math.abs(difference) < 0.6) {
                window.scrollTo(0, targetY);
                frame = null;
                restoreScrollBehavior();
                return;
            }

            const elapsed = Math.min(50, Math.max(1, timestamp - (animate.lastTimestamp || timestamp - 16)));
            animate.lastTimestamp = timestamp;
            const progress = 1 - Math.exp(-elapsed / 190);
            window.scrollTo(0, currentY + difference * progress);
            frame = requestAnimationFrame(animate);
        }

        function onWheel(event) {
            const useNativeScroll =
                reducedMotion.matches ||
                document.body.classList.contains('menu-open') ||
                event.defaultPrevented ||
                event.ctrlKey ||
                Math.abs(event.deltaY) < Math.abs(event.deltaX) ||
                canScrollInside(event, event.deltaY);
            if (useNativeScroll) {
                if (frame !== null) stop();
                return;
            }

            let delta = event.deltaY;
            if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= 16;
            else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) delta *= window.innerHeight;

            const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            const startY = frame === null ? window.scrollY : targetY;
            const nextY = Math.max(0, Math.min(startY + delta, maxY));
            if (Math.abs(nextY - startY) < 0.5) return;

            event.preventDefault();
            targetY = nextY;

            if (frame === null) {
                previousBehavior = rootStyle.getPropertyValue('scroll-behavior');
                previousBehaviorPriority = rootStyle.getPropertyPriority('scroll-behavior');
                rootStyle.setProperty('scroll-behavior', 'auto', 'important');
                animate.lastTimestamp = 0;
                frame = requestAnimationFrame(animate);
            }
        }

        window.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('pointerdown', stop, { passive: true });
        window.addEventListener('keydown', stop, { passive: true });
        window.addEventListener('pagehide', stop, { once: true });
        onMediaChange(reducedMotion, (event) => {
            if (event.matches) stop();
        });
    }

    initInertialScroll();

    /* =========================================
       EDITORIAL SCROLL REVEALS
    ========================================= */

    function initScrollReveals() {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

        const targets = new Set();

        function register(selector, type = 'text', stagger = 0) {
            document.querySelectorAll(selector).forEach((element, index) => {
                if (targets.has(element)) return;
                targets.add(element);
                element.dataset.scrollReveal = type;
                if (stagger) {
                    element.style.setProperty('--scroll-reveal-delay', `${Math.min(index, 5) * stagger}ms`);
                }
            });
        }

        register('.projects__header,.references__header,.approach__header,.approach__footer,.about__header,.about__content,.current__header,.current__footer,.final-cta__inner', 'text');
        register('.project-tile,.current-card,.about-approach__step', 'card', 95);
        register('.projects-intro__eyebrow,.projects-intro h1,.projects-intro__bottom,.project-showcase__meta,.project-showcase__bottom,.detail-intro,.project-slider,.project-film,.project-story,.page-cta,.about-manifesto>.section-kicker,.about-manifesto__content,.about-founder__content,.about-approach__heading,.about-page-cta>*,.news-page-hero__eyebrow,.news-page-hero h1,.news-page-hero__bottom,.news-feature__content,.news-archive__heading,.news-entry__body,.news-page-cta>*,.contact-heading .section-kicker,.contact-heading h1,.contact-lead,.contact-aside,.contact-form-area,.footer__top>*,.footer__bottom', 'text', 65);
        register('.about-founder__portrait,.about__media,.news-feature__media,.news-entry__media,.media-frame', 'image', 45);

        document.querySelectorAll('main img[loading="lazy"]').forEach((image) => {
            if (image.closest('.project-tile,.current-card,.news-entry,.about-founder__portrait,.about__media,.news-feature__media,.news-entry__media,.media-frame,.reference-logo,.product-viewer-stage,.product-viewer-dialog')) return;
            if (targets.has(image)) return;
            targets.add(image);
            image.dataset.scrollReveal = 'image';
        });

        if (!targets.size) return;

        const observer = new IntersectionObserver((entries, instance) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-scroll-revealed');
                instance.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

        targets.forEach((element) => {
            if (element.matches('img') && !element.complete) {
                element.addEventListener('load', () => observer.observe(element), { once: true });
                element.addEventListener('error', () => element.classList.add('is-scroll-revealed'), { once: true });
                return;
            }
            observer.observe(element);
        });

        document.addEventListener('focusin', (event) => {
            const target = event.target.closest?.('[data-scroll-reveal]');
            if (target) target.classList.add('is-scroll-revealed');
        });

        onMediaChange(reducedMotion, (event) => {
            if (!event.matches) return;
            targets.forEach((element) => element.classList.add('is-scroll-revealed'));
            observer.disconnect();
        });
    }

    initScrollReveals();

    /* =========================================
       MOBILE MENU
    ========================================= */

    if (header && menuToggle && mobileMenu) {
        const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
        let lastFocused = null;

        const isOpen = () => mobileMenu.classList.contains('is-open');

        function getFocusable() {
            return [...mobileMenu.querySelectorAll(focusableSelector)];
        }

        function openMenu() {
            if (isOpen()) return;

            lastFocused = document.activeElement;

            mobileMenu.classList.add('is-open');
            menuToggle.classList.add('is-active');
            document.body.classList.add('menu-open');

            mobileMenu.setAttribute('aria-hidden', 'false');
            menuToggle.setAttribute('aria-expanded', 'true');
            menuToggle.setAttribute('aria-label', 'Menüyü kapat');
            header.classList.remove('is-hidden');

            setTimeout(() => {
                const first = getFocusable()[0];
                if (first) first.focus();
            }, 0);
        }

        function closeMenu({ restoreFocus = true } = {}) {
            if (!isOpen()) return;

            mobileMenu.classList.remove('is-open');
            menuToggle.classList.remove('is-active');
            document.body.classList.remove('menu-open');

            mobileMenu.setAttribute('aria-hidden', 'true');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Menüyü aç');

            if (restoreFocus) {
                const target = lastFocused && lastFocused !== document.body && !mobileMenu.contains(lastFocused)
                    ? lastFocused
                    : menuToggle;
                target.focus();
            }
        }

        menuToggle.addEventListener('click', () => {
            if (isOpen()) closeMenu();
            else openMenu();
        });

        mobileMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => closeMenu({ restoreFocus: false }));
        });

        document.addEventListener('keydown', (event) => {
            if (!isOpen()) return;

            if (event.key === 'Escape') {
                event.preventDefault();
                closeMenu();
                return;
            }

            if (event.key !== 'Tab') return;

            const focusable = getFocusable();
            if (!focusable.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 1180) closeMenu({ restoreFocus: false });
        });

        mobileMenu.setAttribute('aria-hidden', isOpen() ? 'false' : 'true');

        header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
    }

    /* =========================================
       HEADER ON SCROLL
    ========================================= */

    if (header) {
        let previousY = Math.max(0, window.scrollY);
        let distance = 0;
        let ticking = false;

        function updateHeader() {
            const y = Math.max(0, window.scrollY);

            header.classList.toggle('is-scrolled', y > 30);

            if (y < 90 || document.body.classList.contains('menu-open')) {
                header.classList.remove('is-hidden');
                distance = 0;
                previousY = y;
            } else {
                const delta = y - previousY;

                if (Math.sign(delta) !== Math.sign(distance)) distance = 0;

                distance += delta;

                if (Math.abs(distance) > 12) {
                    header.classList.toggle('is-hidden', distance > 0);
                    distance = 0;
                }

                previousY = y;
            }

            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(updateHeader);
        }, { passive: true });

        updateHeader();
    }

    /* =========================================
       HERO VIDEO
    ========================================= */

    if (heroVideo) {
        // One source at a time; the desktop file is never requested on a portrait phone.
        const mobileMedia = window.matchMedia('(max-width: 900px) and (orientation: portrait)');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let visible = true;
        let selectedSource = '';

        function updatePlayback() {
            if (reducedMotion.matches || document.hidden || !visible) {
                heroVideo.pause();
                return;
            }

            const playback = heroVideo.play();
            if (playback && typeof playback.catch === 'function') {
                playback.catch(() => { /* The poster remains if autoplay is blocked. */ });
            }
        }

        function selectSource() {
            if (reducedMotion.matches) {
                heroVideo.pause();
                heroVideo.classList.remove('is-playing');
                heroVideo.removeAttribute('src');
                selectedSource = '';
                heroVideo.load();
                return;
            }

            const source = mobileMedia.matches ? heroVideo.dataset.mobile : heroVideo.dataset.desktop;

            if (source && source !== selectedSource) {
                selectedSource = source;
                heroVideo.classList.remove('is-playing');
                heroVideo.src = source;
                heroVideo.load();
            }

            updatePlayback();
        }

        heroVideo.addEventListener('playing', () => heroVideo.classList.add('is-playing'));
        heroVideo.addEventListener('error', () => heroVideo.classList.remove('is-playing'));

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(([entry]) => {
                visible = entry.isIntersecting;
                updatePlayback();
            }, { threshold: 0.1 }).observe(heroVideo);
        }

        document.addEventListener('visibilitychange', updatePlayback);
        window.addEventListener('pagehide', () => heroVideo.pause());
        onMediaChange(mobileMedia, selectSource);
        onMediaChange(reducedMotion, selectSource);
        selectSource();
    }

    /* =========================================
       TIMELINES
    ========================================= */

    function initTimeline({ root, progress, itemSelector, triggerSelector, delay, threshold, interactive }) {
        if (!root || !progress) return;

        const items = [...root.querySelectorAll(itemSelector)];
        if (!items.length) return;

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const timers = [];
        let activeIndex = -1;
        let userActivated = false;

        function updateProgress() {
            if (activeIndex < 0) return;

            const percentage = items.length === 1
                ? 100
                : (activeIndex / (items.length - 1)) * 100;

            if (window.innerWidth <= 650) {
                progress.style.width = '100%';
                progress.style.height = `${percentage}%`;
            } else {
                progress.style.height = '100%';
                progress.style.width = `${percentage}%`;
            }
        }

        function activate(index) {
            activeIndex = index;

            items.forEach((item, itemIndex) => {
                item.classList.toggle('is-active', itemIndex <= index);

                if (!triggerSelector) return;

                const trigger = item.querySelector(triggerSelector);
                if (trigger) {
                    trigger.setAttribute('aria-expanded', itemIndex === index ? 'true' : 'false');
                }
            });

            updateProgress();
        }

        function activateAll() {
            items.forEach((_, index) => activate(index));
        }

        function clearTimers() {
            timers.forEach((timer) => clearTimeout(timer));
            timers.length = 0;
        }

        if (interactive && triggerSelector) {
            items.forEach((item, index) => {
                const trigger = item.querySelector(triggerSelector);
                if (!trigger) return;
                trigger.addEventListener('click', () => {
                    userActivated = true;
                    clearTimers();
                    activate(index);
                });
            });
        }

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, instance) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    instance.unobserve(entry.target);

                    if (userActivated) return;

                    if (reducedMotion.matches) {
                        activateAll();
                        return;
                    }

                    items.forEach((_, index) => {
                        timers.push(setTimeout(() => activate(index), index * delay));
                    });
                });
            }, { threshold });

            observer.observe(root);
        } else {
            activateAll();
        }

        window.addEventListener('resize', updateProgress);
        window.addEventListener('pagehide', clearTimers, { once: true });
        onMediaChange(reducedMotion, (event) => {
            if (!event.matches) return;
            clearTimers();
            activateAll();
        });
    }

    initTimeline({
        root: document.getElementById('designTimeline'),
        progress: document.getElementById('timelineProgress'),
        itemSelector: '[data-timeline-item]',
        triggerSelector: '.timeline__trigger',
        delay: 180,
        threshold: 0.3,
        interactive: true
    });

})();
