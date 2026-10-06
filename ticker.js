(() => {
  const tape = document.getElementById('network');
  const button = document.getElementById('network-pause');
  if (!tape || !button || !window.matchMedia) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  function sync() {
    tape.classList.toggle('is-animated', !reducedMotion.matches);
    tape.classList.toggle('is-paused', paused);
    button.hidden = reducedMotion.matches;
    button.setAttribute('aria-label', paused ? 'Resume network animation' : 'Pause network animation');
    button.textContent = paused ? 'Resume motion' : 'Pause motion';
  }
  button.addEventListener('click', () => { paused = !paused; sync(); });
  reducedMotion.addEventListener('change', sync);
  sync();
})();
