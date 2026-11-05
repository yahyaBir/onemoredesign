// Each project has two 4:3 photos, one 16:9 photo, three slider photos and an optional film.
// video: local MP4/WebM path; when empty the film area keeps its waiting state.
window.PROJECT_MEDIA = {
  "ecopak-trx": {
    "pair": [
      "./images/projects/ecopak-trx-1920.webp",
      "./images/projects/ecopak-trx-1920.webp"
    ],
    "wide": "./images/projects/ecopak-trx-1920.webp",
    "slides": [
      "./images/projects/ecopak-trx-1920.webp",
      "./images/projects/ecopak-trx-1920.webp",
      "./images/projects/ecopak-trx-1920.webp"
    ],
    "video": "",
    "poster": "./images/projects/ecopak-trx-1920.webp"
  },
  "ecopak": {
    "pair": [
      "./images/projects/ecopak-1920.webp",
      "./images/projects/ecopak-1920.webp"
    ],
    "wide": "./images/projects/ecopak-1920.webp",
    "slides": [
      "./images/projects/ecopak-1920.webp",
      "./images/projects/ecopak-1920.webp",
      "./images/projects/ecopak-1920.webp"
    ],
    "video": "",
    "poster": "./images/projects/ecopak-1920.webp"
  },
  "robomation": {
    "pair": [
      "./images/projects/robomation-1920.webp",
      "./images/projects/robomation-1920.webp"
    ],
    "wide": "./images/projects/robomation-1920.webp",
    "slides": [
      "./images/projects/robomation-1920.webp",
      "./images/projects/robomation-1920.webp",
      "./images/projects/robomation-1920.webp"
    ],
    "video": "",
    "poster": "./images/projects/robomation-1920.webp"
  },
  "skyart": {
    "pair": [
      "./images/projects/skyart-1920.webp",
      "./images/projects/skyart-1920.webp"
    ],
    "wide": "./images/projects/skyart-1920.webp",
    "slides": [
      "./images/projects/skyart-1920.webp",
      "./images/projects/skyart-1920.webp",
      "./images/projects/skyart-1920.webp"
    ],
    "video": "",
    "poster": "./images/projects/skyart-1920.webp"
  },
  "zeron": {
    "pair": [
      "./images/projects/zeron-1920.webp",
      "./images/projects/zeron-1920.webp"
    ],
    "wide": "./images/projects/zeron-1920.webp",
    "slides": [
      "./images/projects/zeron-1920.webp",
      "./images/projects/zeron-1920.webp",
      "./images/projects/zeron-1920.webp"
    ],
    "video": "",
    "poster": "./images/projects/zeron-1920.webp"
  },
  "kuver": {
    "pair": [
      "./images/projects/kuver-1920.webp",
      "./images/projects/kuver-1920.webp"
    ],
    "wide": "./images/projects/kuver-1920.webp",
    "slides": [
      "./images/projects/kuver-1920.webp",
      "./images/projects/kuver-1920.webp",
      "./images/projects/kuver-1920.webp"
    ],
    "video": "",
    "poster": "./images/projects/kuver-1920.webp"
  }
};

/* Apply the selected project's media and offer responsive sources when available. */
(() => {
    'use strict';

    const media = window.PROJECT_MEDIA?.[document.body.dataset.project];
    if (!media) return;

    const largePattern = /^(.*)-1920\.webp$/;

    function setImageSource(image, source, sizes) {
        if (!source) return;

        image.src = source;

        const match = source.match(largePattern);
        if (!match) return;

        image.srcset = `${match[1]}-640.webp 640w, ${match[1]}-1280.webp 1280w, ${source} 1920w`;
        image.sizes = sizes;
    }

    document.querySelectorAll('[data-media]').forEach((image) => {
        const [type, index] = image.dataset.media.split('-');
        const source = type === 'pair'
            ? media.pair?.[index]
            : type === 'slide'
                ? media.slides?.[index]
                : media.wide;

        setImageSource(
            image,
            source,
            type === 'pair' ? '(max-width: 700px) 100vw, 50vw' : '100vw'
        );
    });

    const video = document.querySelector('.project-film video');
    const placeholder = document.querySelector('.film-placeholder');

    if (video && media.video) {
        video.src = media.video;
        if (media.poster || media.wide) video.poster = media.poster || media.wide;
        video.hidden = false;
        if (placeholder) placeholder.hidden = true;
    }
})();
