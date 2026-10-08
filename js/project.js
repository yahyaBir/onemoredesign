(() => {
  const media = window.PROJECT_MEDIA?.[document.body.dataset.project];
  if (!media) return;
  document.querySelectorAll('[data-media]').forEach(img => {
    const [type, index] = img.dataset.media.split('-');
    const src = type === 'pair' ? media.pair?.[index] : type === 'slide' ? media.slides?.[index] : media.wide;
    if (src) img.src = src;
  });
  const video = document.querySelector('.project-film video');
  if (media.video && video) {
    video.src = media.video;
    video.poster = media.poster || media.wide;
    video.hidden = false;
    document.querySelector('.film-placeholder').hidden = true;
  }
  const slider = document.querySelector('.project-slider');
  const track = slider.querySelector('.slider-track');
  const slides = [...track.children];
  let current = 0;
  function go(index) {
    restartAutoplay();
    current = (index + slides.length) % slides.length;
    track.scrollTo({left: current * track.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }
  slider.querySelector('[data-prev]').addEventListener('click', () => go(current - 1));
  slider.querySelector('[data-next]').addEventListener('click', () => go(current + 1));
  slider.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault(); go(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  track.addEventListener('scroll', () => {
    current = Math.round(track.scrollLeft / track.clientWidth);
    slider.querySelector('[data-counter]').textContent = `${String(current + 1).padStart(2, '0')} / 03`;
  }, {passive:true});
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = slider.querySelector('[data-autoplay]');
  let paused = reduced.matches;
  let visible = false;
  let hovering = false;
  let timer;
  function restartAutoplay() {
    clearTimeout(timer);
    if (!paused && !reduced.matches && visible && !hovering && !document.hidden && !slider.contains(document.activeElement)) {
      timer = setTimeout(() => go(current + 1), 5000);
    }
  }
  function renderToggle() {
    toggle.textContent = paused || reduced.matches ? '▷' : 'Ⅱ';
    toggle.setAttribute('aria-label', paused || reduced.matches ? 'Otomatik geçişi başlat' : 'Otomatik geçişi duraklat');
    toggle.disabled = reduced.matches;
  }
  toggle.addEventListener('click', () => { paused = !paused; renderToggle(); restartAutoplay(); });
  slider.addEventListener('mouseenter', () => { hovering = true; restartAutoplay(); });
  slider.addEventListener('mouseleave', () => { hovering = false; restartAutoplay(); });
  slider.addEventListener('focusin', restartAutoplay);
  slider.addEventListener('focusout', () => setTimeout(restartAutoplay, 0));
  track.addEventListener('pointerdown', () => { clearTimeout(timer); });
  track.addEventListener('pointerup', restartAutoplay);
  track.addEventListener('scroll', restartAutoplay, {passive:true});
  document.addEventListener('visibilitychange', restartAutoplay);
  reduced.addEventListener('change', () => {renderToggle(); restartAutoplay();});
  new IntersectionObserver(([entry]) => {visible = entry.isIntersecting; restartAutoplay();}, {threshold:0.5}).observe(slider);
  renderToggle();
  new ResizeObserver(() => {track.scrollTo({left:current * track.clientWidth, behavior:'instant'});}).observe(track);
})();
