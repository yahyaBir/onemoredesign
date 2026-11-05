/* Contact brief: validation, mail draft and clipboard fallback. */
(() => {
    'use strict';

    const form = document.getElementById('projectForm');
    if (!form) return;

    const status = document.getElementById('formStatus');
    const copyButton = document.getElementById('copyBrief');
    const email = 'hello@onemoredesign.com';
    const projectNames = {
        ecopak: 'Ecopak',
        robomation: 'Robomation',
        kuver: 'Kuver Professional',
        zeron: 'Zeron Lock',
        skyart: 'Skyart',
        'ecopak-trx': 'Ecopak TRX'
    };

    const project = projectNames[new URLSearchParams(window.location.search).get('proje')];
    if (project && form.elements.message) {
        form.elements.message.value = `${project} projesine benzer bir çalışma hakkında görüşmek istiyorum.\n\n`;
    }

    function value(name) {
        return String(form.elements[name]?.value ?? '').trim();
    }

    function brief() {
        const data = new FormData(form);
        const read = (name) => String(data.get(name) ?? '').trim();

        return [
            'Yeni proje / One More Design', '',
            `Ad Soyad: ${read('name')}`,
            `Şirket: ${read('company') || 'Belirtilmedi'}`,
            `E-posta: ${read('email')}`,
            `Telefon: ${read('phone') || 'Belirtilmedi'}`, '',
            `İhtiyaçlar: ${data.getAll('services').join(', ') || 'Birlikte belirleyelim'}`,
            `Takvim: ${read('timeline') || 'Henüz net değil'}`,
            `Bütçe: ${read('budget') || 'Belirtilmedi'}`, '',
            'Proje hakkında:', read('message')
        ].join('\n');
    }

    function validate() {
        for (const name of ['name', 'message']) {
            const input = form.elements[name];
            if (!input) continue;

            input.setCustomValidity(
                input.value.trim() ? '' : 'Lütfen bu alanı doldurun.'
            );
        }

        return form.reportValidity();
    }

    function setStatus(message) {
        if (status) status.textContent = message;
    }

    async function copyBrief() {
        if (!validate()) return;

        const text = brief();

        try {
            if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
            await navigator.clipboard.writeText(text);
            setStatus('Brief kopyalandı. E-posta uygulamanıza yapıştırıp hello@onemoredesign.com adresine gönderebilirsiniz.');
        } catch {
            // Works on local file:// pages and when clipboard access is unavailable.
            let preview = document.getElementById('briefPreview');

            if (!preview) {
                preview = document.createElement('textarea');
                preview.id = 'briefPreview';
                preview.setAttribute('aria-label', 'Kopyalanacak proje briefi');
                preview.readOnly = true;
                preview.rows = 10;
                (status || form).after(preview);
            }

            preview.value = text;
            preview.focus();
            preview.select();
            setStatus('Otomatik kopyalama kullanılamadı. Aşağıdaki seçili metni kopyalayabilirsiniz.');
        }
    }

    form.addEventListener('input', (event) => {
        if (typeof event.target.setCustomValidity === 'function') {
            event.target.setCustomValidity('');
        }
        setStatus('');
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!validate()) return;

        const subject = `Yeni proje — ${value('name')}`;
        const draft = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(brief())}`;

        if (draft.length > 7000) {
            copyBrief();
            setStatus('Brief e-posta bağlantısı için çok uzun. Metni kopyaladık; hello@onemoredesign.com adresine yapıştırarak gönderebilirsiniz.');
            return;
        }

        window.location.href = draft;
        setStatus('E-posta uygulamanızda açılan taslağı göndererek işlemi tamamlayın. Açılmadıysa “Briefi kopyala” ile metni kopyalayıp hello@onemoredesign.com adresine gönderebilirsiniz.');
    });

    if (copyButton) copyButton.addEventListener('click', copyBrief);
})();
