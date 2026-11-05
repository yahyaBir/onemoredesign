/* Keep one full-screen project video playing as its item becomes the main view. */
(() => {
    'use strict';

    const items = [...document.querySelectorAll('[data-project-item]')];
    if (!items.length) return;

    const videos = items.map((item) => item.querySelector('[data-project-video]'));
    const ratios = items.map(() => 0);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let activeIndex = -1;

    function setActive(index) {
        if (document.hidden || reducedMotion.matches) index = -1;
        activeIndex = index;

        videos.forEach((video, videoIndex) => {
            if (!video) return;
            if (videoIndex !== activeIndex) {
                video.pause();
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
                playback.catch(() => { /* The project poster remains visible. */ });
            }
        });
    }

    function chooseVisibleItem() {
        let candidate = -1;
        let highestRatio = 0.55;
        ratios.forEach((ratio, index) => {
            if (ratio >= highestRatio) {
                highestRatio = ratio;
                candidate = index;
            }
        });
        setActive(candidate);
    }

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const index = items.indexOf(entry.target);
                if (index >= 0) ratios[index] = entry.intersectionRatio;
            });
            chooseVisibleItem();
        }, { threshold: [0, 0.25, 0.55, 0.8, 1] });

        items.forEach((item) => observer.observe(item));
    } else {
        setActive(0);
    }

    document.addEventListener('visibilitychange', chooseVisibleItem);
    const onMotionPreferenceChange = chooseVisibleItem;
    if (typeof reducedMotion.addEventListener === 'function') {
        reducedMotion.addEventListener('change', onMotionPreferenceChange);
    } else if (typeof reducedMotion.addListener === 'function') {
        reducedMotion.addListener(onMotionPreferenceChange);
    }
})();
