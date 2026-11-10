(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Nav: solid after leaving the hero; mobile menu
  const nav = document.getElementById('site-nav');
  const menu = document.getElementById('menu-btn');
  const hero = document.querySelector('.hero');
  if (menu) menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? 'Close' : 'Menu';
  });
  nav && nav.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open'); if (menu) { menu.setAttribute('aria-expanded', 'false'); menu.textContent = 'Menu'; }
  }));

  // Scroll-linked values: hero parallax (--hp) and the expanding trip photo (--ep)
  const expand = document.querySelector('.expand');
  let ticking = false;
  function onScroll() {
    const y = window.scrollY, vh = window.innerHeight;
    if (nav) nav.classList.toggle('solid', y > (hero ? hero.offsetHeight - 90 : 40));
    if (!reduce) {
      if (hero) hero.style.setProperty('--hp', Math.min(Math.max(y / hero.offsetHeight, 0), 1).toFixed(3));
      if (expand) {
        const r = expand.getBoundingClientRect();
        const total = expand.offsetHeight - vh;
        const p = Math.min(Math.max(-r.top / (total * 0.75), 0), 1);
        expand.style.setProperty('--ep', p.toFixed(3));
      }
    }
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  // Reveal on scroll + count-up numbers
  const countUp = el => {
    const end = Number(el.dataset.count), suffix = el.dataset.suffix || '';
    if (reduce || !end) { el.textContent = end + suffix; return; }
    const t0 = performance.now(), dur = 1200;
    const step = t => { const k = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + suffix; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) {
        e.target.classList.add('in');
        e.target.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(e.target);
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.rv, .rv-stagger').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.rv, .rv-stagger').forEach(el => el.classList.add('in'));
  }

  // Calendar: past events move to "Earlier this semester"; the next one fills the bar under the hero
  const up = document.getElementById('events-upcoming'), past = document.getElementById('events-past');
  if (up && past) {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
    [...up.querySelectorAll('.event[data-date]')].reverse().forEach(ev => { if (ev.dataset.date < today) past.prepend(ev); });
    const next = up.querySelector('.event[data-date]');
    const bar = document.getElementById('nextup');
    if (next && bar) {
      bar.querySelector('.date').textContent = next.dataset.short;
      bar.querySelector('.title').textContent = next.querySelector('h3').textContent;
      bar.querySelector('.meta').textContent = next.querySelector('p').textContent;
    } else if (bar) {
      bar.querySelector('.date').textContent = 'Soon';
      bar.querySelector('.title').textContent = 'New events are on the way';
      bar.querySelector('.meta').textContent = 'GroupMe has the latest.';
    }
    if (!next) { const li = document.createElement('li'); li.className = 'cal-note'; li.textContent = 'New events coming soon. GroupMe has the latest.'; up.append(li); }
  }
  // 60-second recap video in a dialog
  const dlg = document.getElementById('recap');
  if (dlg && dlg.showModal) {
    const v = dlg.querySelector('video');
    document.querySelectorAll('[data-recap]').forEach(b => b.addEventListener('click', () => { dlg.showModal(); v.play().catch(() => {}); }));
    dlg.querySelector('.recap-x').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', () => v.pause());
  } else {
    document.querySelectorAll('[data-recap]').forEach(b => b.addEventListener('click', () => { location.href = 'assets/nyc26/recap.mp4'; }));
  }
})();
