/* Load and render the product model only when its detail-page viewer is in view. */
(() => {
    'use strict';

    const card = document.querySelector('[data-product-viewer]');
    if (!card) return;

    const viewer = card.querySelector('[data-product-model]');
    const dialog = card.querySelector('[data-model-dialog]');
    const dialogViewer = dialog?.querySelector('[data-dialog-model]');
    const dialogStatus = dialog?.querySelector('[data-dialog-status]');
    const expandButton = card.querySelector('[data-open-viewer]');
    const rotateHint = card.querySelector('[data-rotate-hint]');
    const status = card.querySelector('[data-model-status]');
    const source = viewer?.dataset.modelSrc?.trim();
    if (!viewer || !source) return;

    const modelViewerUrl = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
    let modelViewerPromise;

    function loadModelViewer() {
        if (customElements.get('model-viewer')) return Promise.resolve();
        if (modelViewerPromise) return modelViewerPromise;

        modelViewerPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = modelViewerUrl;
            script.onload = () => customElements.whenDefined('model-viewer').then(resolve, reject);
            script.onerror = reject;
            document.head.append(script);
        });
        return modelViewerPromise;
    }

    function activate() {
        if (viewer.dataset.sourceRequested) return;

        viewer.dataset.sourceRequested = 'true';
        card.classList.add('has-3d-model');
        status.classList.remove('is-error');
        status.textContent = '3D model yükleniyor…';
        status.hidden = false;
        loadModelViewer().then(() => {
            viewer.setAttribute('src', source);
        }).catch(() => {
            card.classList.remove('has-3d-model');
            status.classList.add('is-error');
            status.textContent = '3D görüntüleyici yüklenemedi.';
            status.hidden = false;
        });
    }

    viewer.addEventListener('load', () => {
        card.classList.add('has-loaded-model');
        rotateHint.hidden = false;
        expandButton.hidden = false;
        status.hidden = true;
    }, { once: true });
    viewer.addEventListener('error', () => {
        card.classList.remove('has-3d-model', 'has-loaded-model');
        rotateHint.hidden = true;
        expandButton.hidden = true;
        status.classList.add('is-error');
        status.textContent = 'Model yüklenemedi; lütfen daha sonra tekrar deneyin.';
        status.hidden = false;
    }, { once: true });
    viewer.addEventListener('progress', (event) => {
        const progress = Math.round(event.detail.totalProgress * 100);
        status.textContent = progress < 100 ? `3D model yükleniyor… ${progress}%` : '3D model hazırlanıyor…';
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0) activate();
        }, { threshold: [0, 0.05, 0.25] });
        observer.observe(card);
    } else {
        activate();
    }

    if (expandButton && dialog && dialogViewer) {
        dialogViewer.addEventListener('load', () => {
            dialog.classList.add('has-loaded-model');
            dialogStatus.hidden = true;
        });
        dialogViewer.addEventListener('error', () => {
            dialogStatus.classList.add('is-error');
            dialogStatus.textContent = 'Model yüklenemedi.';
        });
        dialogViewer.addEventListener('progress', (event) => {
            const progress = Math.round(event.detail.totalProgress * 100);
            dialogStatus.textContent = progress < 100 ? `3D model hazırlanıyor… ${progress}%` : '3D model hazırlanıyor…';
        });
        expandButton.addEventListener('click', () => {
            dialog.showModal();
            if (dialog.classList.contains('has-loaded-model') && dialogViewer.getAttribute('src') === source) {
                dialogStatus.hidden = true;
                return;
            }
            dialogStatus.classList.remove('is-error');
            dialogStatus.textContent = '3D model hazırlanıyor…';
            dialogStatus.hidden = false;
            dialogViewer.setAttribute('src', source);
        });
        dialog.querySelector('[data-close-viewer]')?.addEventListener('click', () => dialog.close());
    }
})();
