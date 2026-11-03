/* Home page renderer (RC23): Now band, featured case studies, project index, experience, contact. */
(function () {
  const esc = RC.esc, A = RC.arrow;
  Promise.all([
    fetch('data/projects.json?v=rc23').then(r => r.json()),
    fetch('data/site.json?v=rc23').then(r => r.json()),
  ]).then(([projects, site]) => {
    /* Now band */
    const now = site.now;
    if (now) {
      document.querySelector('#now-root').innerHTML = `
        <div>
          <p class="eyebrow reveal"><span class="num">01</span>${esc(now.kicker)}</p>
          <h2 id="now-title" class="reveal" style="--i:1">${esc(now.title)}</h2>
          <p class="lead reveal" style="--i:2">${esc(now.body)}</p>
          <div class="actions reveal" style="--i:3">${(now.links || []).map(l =>
            `<a class="btn ${l.primary ? 'primary' : 'ghost'}" href="${esc(l.href)}">${esc(l.label)}${l.primary ? ' ' + A : ''}</a>`).join('')}</div>
        </div>
        <div class="reveal" style="--i:2">
          <div class="stats">${(now.stats || []).map(s => `<div class="stat"><b>${esc(s[0])}</b><span>${esc(s[1])}</span></div>`).join('')}</div>
          <p style="margin:1rem 0 0;font-size:.85rem;color:var(--dim)">Counts from Iron Leaf's field and interview records, fall 2026. The pilot letter is non-binding; no paid pilots yet.</p>
        </div>`;
    }

    /* Featured */
    const featured = projects.filter(p => p.featured).slice(0, 3);
    document.querySelector('#featured').innerHTML = featured.map((p, i) => `
      <a class="f-card reveal" style="--i:${i}" href="project.html?id=${encodeURIComponent(p.id)}">
        ${p.hero ? RC.media({ src: p.hero, alt: p.title }, { vf: i === 0, drift: i === 0 }) : ''}
        ${i === 0 ? '<span class="chip mint live chip-over"><span class="dot"></span>Current</span>' : ''}
        <div class="f-body">
          <div class="f-meta"><span>${esc(p.year)}</span><span>${esc(p.status)}</span></div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.summary)}</p>
          ${(p.impact || []).length ? `<div class="chips">${p.impact.map(x => `<span class="chip">${esc(x)}</span>`).join('')}</div>` : ''}
          <span class="link-arrow">View case study ${A}</span>
        </div>
      </a>`).join('');

    /* Index with filters */
    const cats = ['All', ...new Set(projects.flatMap(p => p.category || []))];
    let active = 'All';
    const filters = document.querySelector('#filters'), rows = document.querySelector('#rows');
    const renderFilters = () => {
      filters.innerHTML = cats.map(c => `<button type="button" class="filter${c === active ? ' active' : ''}" aria-pressed="${c === active}" data-f="${esc(c)}">${esc(c)}</button>`).join('');
      filters.querySelectorAll('.filter').forEach(b => b.addEventListener('click', () => { active = b.dataset.f; renderFilters(); renderRows(); }));
    };
    const renderRows = () => {
      const shown = active === 'All' ? projects : projects.filter(p => (p.category || []).includes(active));
      rows.innerHTML = shown.map(p => `
        <a class="row" href="project.html?id=${encodeURIComponent(p.id)}">
          <span class="yr">${esc(p.year)}</span>
          <h4>${esc(p.title)}</h4>
          <p>${esc(p.summary)}</p>
          <span class="cat">${esc((p.category || []).slice(0, 2).join(' / '))}</span>
          <span class="arr" aria-hidden="true">&rarr;</span>
        </a>`).join('');
    };
    renderFilters(); renderRows();

    /* Experience */
    document.querySelector('#timeline').innerHTML = (site.experience || []).map((e, i) => `
      <div class="exp reveal${/Present/.test(e.dates) ? ' current' : ''}" style="--i:${i}">
        <div class="dates">${esc(e.dates)}</div>
        <div><strong>${e.href ? `<a href="${esc(e.href)}">${esc(e.company)}</a>` : esc(e.company)}</strong><div class="role">${esc(e.role)}</div></div>
        <p>${esc(e.summary)}</p>
      </div>`).join('');

    /* Contact */
    const acts = [];
    if (site.email) acts.push(`<a class="btn primary" href="mailto:${esc(site.email)}">Email me ${A}</a>`);
    acts.push(`<a class="btn ghost" href="https://www.ironleafrobotics.ca/">ironleafrobotics.ca</a>`);
    document.querySelector('#contact-actions').innerHTML = acts.join('');

    RC.hydrate(document);
  });
})();
