/* Play a muted sample clip while a homepage project tile is hovered or focused. */
(() => {
    'use strict';

    const videos = [...document.querySelectorAll('[data-project-preview]')];
    if (!videos.length) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const activeStates = new WeakMap();

    function update(video) {
        const state = activeStates.get(video);
        const shouldPlay = state && (state.hovered || state.focused)
            && !document.hidden
            && !reducedMotion.matches;

        if (!shouldPlay) {
            video.pause();
            video.classList.remove('is-playing');
            if (video.readyState > 0) {
                try {
                    video.currentTime = 0;
                } catch {
                    // Some browsers cannot seek until media metadata is available.
                }
            }
            return;
        }

        const source = video.dataset.src;
        if (!source) return;

        if (video.dataset.activeSrc !== source) {
            video.dataset.activeSrc = source;
            video.src = source;
            video.load();
        }

        const playback = video.play();
        if (playback && typeof playback.catch === 'function') {
            playback.catch(() => { /* The original project image remains visible. */ });
        }
    }

    videos.forEach((video) => {
        const tile = video.closest('.project-tile');
        if (!tile) return;

        activeStates.set(video, { hovered: false, focused: false });

        video.addEventListener('playing', () => {
            const state = activeStates.get(video);
            if (
                state && (state.hovered || state.focused)
                && !document.hidden
                && !reducedMotion.matches
            ) {
                video.classList.add('is-playing');
            }
        });
        video.addEventListener('pause', () => video.classList.remove('is-playing'));

        tile.addEventListener('mouseenter', () => {
            activeStates.get(video).hovered = true;
            update(video);
        });
        tile.addEventListener('mouseleave', () => {
            activeStates.get(video).hovered = false;
            update(video);
        });
        tile.addEventListener('focusin', () => {
            activeStates.get(video).focused = true;
            update(video);
        });
        tile.addEventListener('focusout', () => {
            activeStates.get(video).focused = false;
            update(video);
        });
    });

    document.addEventListener('visibilitychange', () => videos.forEach(update));

    const onMotionPreferenceChange = () => videos.forEach(update);
    if (typeof reducedMotion.addEventListener === 'function') {
        reducedMotion.addEventListener('change', onMotionPreferenceChange);
    } else if (typeof reducedMotion.addListener === 'function') {
        reducedMotion.addListener(onMotionPreferenceChange);
    }
})();
