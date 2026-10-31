(() => {
  const carousel = document.querySelector('.references__carousel');
  if (!carousel) return;
  const logos = [...carousel.children];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 2, paused = false, visible = false, hovered = false, timer;
  const controls = document.createElement('div');
  controls.className = 'references__controls';
  controls.innerHTML = '<button type="button" data-prev aria-label="Önceki referans">←</button><button type="button" data-pause aria-label="Otomatik geçişi duraklat">Ⅱ</button><button type="button" data-next aria-label="Sonraki referans">→</button>';
  carousel.after(controls);
  const section = carousel.closest('section');
  const pauseButton = controls.querySelector('[data-pause]');
  function schedule() {
    clearTimeout(timer);
    if (!paused && !motion.matches && visible && !hovered && !document.hidden && !section.contains(document.activeElement)) timer = setTimeout(() => move(1), 3000);
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
    pauseButton.textContent = paused || motion.matches ? '▷' : 'Ⅱ';
    pauseButton.setAttribute('aria-label', paused ? 'Otomatik geçişi başlat' : 'Otomatik geçişi duraklat');
    pauseButton.disabled = motion.matches;
    schedule();
  }
  function move(step) { current = (current + step + logos.length) % logos.length; render(); }
  controls.querySelector('[data-prev]').addEventListener('click', () => move(-1));
  controls.querySelector('[data-next]').addEventListener('click', () => move(1));
  pauseButton.addEventListener('click', () => {paused = !paused; render();});
  section.addEventListener('mouseenter', () => {hovered = true; schedule();});
  section.addEventListener('mouseleave', () => {hovered = false; schedule();});
  section.addEventListener('focusin', schedule);
  section.addEventListener('focusout', () => setTimeout(schedule, 0));
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', render);
  new IntersectionObserver(([entry]) => {visible = entry.isIntersecting; schedule();}, {threshold:.2}).observe(carousel);
  render();
})();
