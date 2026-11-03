/* Shared UI for the portfolio: nav state, scroll reveal, in-view video playback, lightbox.
   Videos play muted only while visible; reduced motion or Save-Data keeps them paused with a play button. */
(function () {
  const doc = document.documentElement;
  doc.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  window.RC = window.RC || {};
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
  RC.esc = esc;
  RC.arrow = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  RC.vf = '<span class="vf" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';

  /* Media markup: a muted looping clip with poster, or a still. */
  RC.media = (m, opts = {}) => {
    const cls = ['media', opts.grain ? 'grain' : '', opts.cls || ''].join(' ').trim();
    if (m.type === 'video' || /\.mp4(\?|$)/i.test(m.src || '')) {
      return `<div class="${cls}"${opts.lb ? ` data-lb="${esc(m.src)}" data-lb-type="video" data-lb-cap="${esc(m.caption || '')}" role="button" tabindex="0" aria-label="Open video: ${esc(m.alt || m.caption || '')}"` : ''}>
        <video muted loop playsinline preload="none" poster="${esc(m.poster || '')}" aria-label="${esc(m.alt || '')}" data-auto>
          <source src="${esc(m.src)}" type="video/mp4"></video>${opts.vf === false ? '' : RC.vf}
        <button class="video-toggle" type="button" data-toggle>Pause video</button></div>`;
    }
    return `<div class="${cls}"${opts.lb ? ` data-lb="${esc(m.src)}" data-lb-type="image" data-lb-cap="${esc(m.caption || '')}" role="button" tabindex="0" aria-label="Open image: ${esc(m.alt || '')}"` : ''}>
      <img loading="lazy" src="${esc(m.src)}" alt="${esc(m.alt || '')}"${opts.drift ? ' class="still-drift"' : ''}>${opts.vf ? RC.vf : ''}</div>`;
  };

  /* Nav: solid after scrolling, tucks on scroll down, mobile toggle. */
  function initNav() {
    const nav = document.querySelector('.nav'); if (!nav) return;
    const toggle = nav.querySelector('.nav-toggle'), links = nav.querySelector('.nav-links');
    let last = scrollY;
    const onScroll = () => {
      const y = scrollY;
      nav.classList.toggle('solid', y > 24);
      nav.classList.toggle('tucked', y > 400 && y > last && !nav.classList.contains('is-open'));
      last = y;
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    if (toggle) toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open'); nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open)); toggle.textContent = open ? 'Close' : 'Menu';
    });
    links && links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open'); nav.classList.remove('is-open');
      if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = 'Menu'; }
    }));
    const sections = [...document.querySelectorAll('section[id]')];
    if ('IntersectionObserver' in window && sections.length) {
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        links.querySelectorAll('a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      }), { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(s => io.observe(s));
    }
  }

  /* Reveal on scroll. */
  RC.reveal = root => {
    const els = (root || document).querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
  };

  /* Videos: play while in view unless the viewer paused them, reduced motion, or Save-Data. */
  RC.videos = root => {
    (root || document).querySelectorAll('video[data-auto]:not([data-init])').forEach(v => {
      v.dataset.init = '1';
      const wrap = v.parentElement, btn = wrap.querySelector('[data-toggle]');
      let userPaused = reduce || saveData;
      const label = () => { if (btn) btn.textContent = v.paused ? 'Play video' : 'Pause video'; };
      v.addEventListener('play', label); v.addEventListener('pause', label);
      label();
      if (btn) btn.addEventListener('click', e => {
        e.stopPropagation();
        if (v.paused) { userPaused = false; v.preload = 'auto'; v.play().catch(() => {}); } else { userPaused = true; v.pause(); }
      });
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting && !userPaused) { v.preload = 'auto'; v.play().catch(label); }
        else if (!e.isIntersecting && !v.paused) v.pause();
      }), { threshold: .25 });
      io.observe(v);
    });
  };

  /* Lightbox for stills and clips. */
  RC.lightbox = root => {
    let dlg = document.querySelector('dialog.lightbox');
    if (!dlg) {
      dlg = document.createElement('dialog'); dlg.className = 'lightbox';
      dlg.innerHTML = '<button class="btn ghost lb-close" type="button">Close</button><div class="lb-media"></div><p class="lb-cap"></p>';
      document.body.appendChild(dlg);
      dlg.querySelector('.lb-close').addEventListener('click', () => dlg.close());
      dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener('close', () => { dlg.querySelector('.lb-media').innerHTML = ''; });
    }
    (root || document).querySelectorAll('[data-lb]:not([data-lb-init])').forEach(el => {
      el.dataset.lbInit = '1';
      const open = () => {
        const src = el.dataset.lb, cap = el.dataset.lbCap || '';
        dlg.querySelector('.lb-media').innerHTML = el.dataset.lbType === 'video'
          ? `<video controls autoplay muted loop playsinline src="${esc(src)}"></video>`
          : `<img src="${esc(src)}" alt="${esc(cap)}">`;
        dlg.querySelector('.lb-cap').textContent = cap;
        if (dlg.showModal) dlg.showModal(); else window.open(src, '_blank');
      };
      el.addEventListener('click', e => { if (e.target.closest('[data-toggle]')) return; open(); });
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
  };

  RC.hydrate = root => { RC.reveal(root); RC.videos(root); RC.lightbox(root); };
  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    requestAnimationFrame(() => document.body.classList.add('ready'));
    RC.hydrate();
    const y = document.querySelector('[data-year]'); if (y) y.textContent = new Date().getFullYear();
  });
})();
