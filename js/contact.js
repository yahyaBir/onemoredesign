(() => {
    const form = document.getElementById('projectForm');
    if (!form) return;
    const status = document.getElementById('formStatus');
    const email = 'hello@onemoredesign.com';
    const projectNames = {ecopak:'Ecopak',robomation:'Robomation',kuver:'Kuver Professional',zeron:'Zeron Lock',skyart:'Skyart','ecopak-trx':'Ecopak TRX'};
    const project = projectNames[new URLSearchParams(location.search).get('proje')];
    if (project) form.elements.message.value = `${project} projesine benzer bir çalışma hakkında görüşmek istiyorum.\n\n`;
    function brief() {
        const data = new FormData(form);
        return [
            'Yeni proje / One More Design', '',
            `Ad Soyad: ${data.get('name').trim()}`,
            `Şirket: ${data.get('company').trim() || 'Belirtilmedi'}`,
            `E-posta: ${data.get('email').trim()}`,
            `Telefon: ${data.get('phone').trim() || 'Belirtilmedi'}`, '',
            `İhtiyaçlar: ${data.getAll('services').join(', ') || 'Birlikte belirleyelim'}`,
            `Takvim: ${data.get('timeline') || 'Henüz net değil'}`,
            `Bütçe: ${data.get('budget').trim() || 'Belirtilmedi'}`, '',
            'Proje hakkında:', data.get('message').trim()
        ].join('\n');
    }
    function validate() {
        for (const name of ['name', 'message']) {
            const input = form.elements[name];
            input.setCustomValidity(input.value.trim() ? '' : 'Lütfen bu alanı doldurun.');
        }
        return form.reportValidity();
    }
    form.addEventListener('input', event => {
        if (event.target.setCustomValidity) event.target.setCustomValidity('');
        status.textContent = '';
    });
    form.addEventListener('submit', event => {
        event.preventDefault();
        if (!validate()) return;
        const subject = `Yeni proje — ${form.elements.name.value.trim()}`;
        location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(brief())}`;
        status.textContent = 'E-posta uygulamanızda açılan taslağı göndererek işlemi tamamlayın. Açılmadıysa “Briefi kopyala” ile metni kopyalayıp hello@onemoredesign.com adresine gönderebilirsiniz.';
    });
    document.getElementById('copyBrief').addEventListener('click', async () => {
        if (!validate()) return;
        try {
            await navigator.clipboard.writeText(brief());
            status.textContent = 'Brief kopyalandı. E-posta uygulamanıza yapıştırıp hello@onemoredesign.com adresine gönderebilirsiniz.';
        } catch {
            // Works on local file:// pages and when clipboard access is unavailable.
            let preview = document.getElementById('briefPreview');
            if (!preview) {
                preview = document.createElement('textarea');
                preview.id = 'briefPreview';
                preview.setAttribute('aria-label', 'Kopyalanacak proje briefi');
                preview.readOnly = true;
                preview.rows = 10;
                status.after(preview);
            }
            preview.value = brief();
            preview.focus();
            preview.select();
            status.textContent = 'Otomatik kopyalama kullanılamadı. Aşağıdaki seçili metni kopyalayabilirsiniz.';
        }
    });
})();
