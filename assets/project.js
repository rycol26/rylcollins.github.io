/* Case study renderer (RC23). Old links like ?id=field-rover resolve through each project's "aliases". */
(function () {
  const esc = RC.esc, A = RC.arrow;
  const id = new URLSearchParams(location.search).get('id');
  const isDiagram = s => /\.svg(\?|$)/i.test(s || '') || /(flow|diagram|architecture|schematic|block)/i.test(s || '');
  const isPhoto = s => /\.(jpe?g|webp)(\?|$)/i.test(s || '') || (/\.png(\?|$)/i.test(s || '') && !isDiagram(s));

  fetch('data/projects.json?v=rc23').then(r => r.json()).then(projects => {
    const p = projects.find(x => x.id === id) || projects.find(x => (x.aliases || []).includes(id)) || projects[0];
    const idx = projects.indexOf(p), next = projects[(idx + 1) % projects.length];
    document.title = `${p.title} | Ryan Collins`;
    const md = document.querySelector('meta[name="description"]') || document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'description' }));
    md.content = p.summary || '';

    /* Hero: case video, else a photo, else a text-only header (diagrams read better in the body). */
    let heroSrc = null, heroHtml = '';
    if (p.heroVideo) {
      heroSrc = p.heroVideo.src;
      heroHtml = RC.media({ type: 'video', ...p.heroVideo }, { grain: true });
    } else if (p.hero && isPhoto(p.hero)) {
      heroSrc = p.hero;
      heroHtml = RC.media({ src: p.hero, alt: p.title }, { vf: true, drift: true, grain: true });
    }
    const st = p.sectionTitles || {};
    const head = (key, k, t, n) => { const x = st[key] || [`${n} · ${k}`, t]; return `<p class="eyebrow reveal">${esc(x[0])}</p><h2 class="reveal" style="--i:1">${esc(x[1])}</h2>`; };
    const ul = items => (items || []).length ? `<ul>${items.map((x, i) => `<li class="reveal" style="--i:${i}">${esc(x)}</li>`).join('')}</ul>` : '';

    const gallery = placement => {
      const items = (p.media || []).filter(m => !m.hidden && (m.placement || 'overview') === placement && m.src !== heroSrc && m.src !== p.hero);
      if (!items.length) return '';
      return `<div class="gallery">${items.map((m, i) => {
        const diagram = m.type !== 'video' && isDiagram(m.src);
        let size = { quadrant: 'half', pair: 'half', compact: 'half', half: 'half' }[m.layout] || (m.layout ? '' : (items.length > 1 ? 'half' : ''));
        if (diagram) size = '';
        const prov = m.prov === 'hand' ? '<span class="chip prov hand">Hand-labelled</span>'
          : m.prov === 'model-unreviewed' ? '<span class="chip prov model-unreviewed">Prototype model output</span>' : '';
        return `<figure class="fig ${size}${diagram ? ' diagram' : ''} reveal" style="--i:${i % 2}">
          ${RC.media(m, { lb: true, vf: m.type === 'video', cls: diagram ? 'contain' : '' })}
          <figcaption>${prov}<span>${esc(m.caption || '')}</span></figcaption>
        </figure>`;
      }).join('')}</div>`;
    };

    const facts = (p.snapshot || []).length ? `<div class="case-facts reveal" style="--i:3">${p.snapshot.map(s => `<div><span>${esc(s[0])}</span><strong>${esc(s[1])}</strong></div>`).join('')}</div>` : '';
    const own = p.ownershipBand ? `<div class="own">
        <div><span>Owned directly</span><strong>${esc(p.ownershipBand.owned)}</strong></div>
        <div><span>System / team outcome</span><strong>${esc(p.ownershipBand.team)}</strong></div></div>` : '';
    const tech = (p.technologies || []).length ? `<div><span class="kick" style="margin-top:1.5rem">Technologies</span><div class="tech">${p.technologies.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div></div>` : '';
    const links = (p.links || []).length ? `<div class="links-row">${p.links.map((l, i) => `<a class="btn ${i ? 'ghost' : 'primary'}" href="${esc(l.href)}">${esc(l.label)}${i ? '' : ' ' + A}</a>`).join('')}</div>` : '';

    const decisions = (p.decisions || []).length ? `<section class="case-sec" aria-label="Engineering decisions">
        <p class="eyebrow reveal">Engineering decisions</p><h2 class="reveal" style="--i:1">Decisions that shaped the system</h2>
        <div class="decisions">${p.decisions.map((d, i) => `<article class="decision reveal" style="--i:${i}">
          <span class="n">${String(i + 1).padStart(2, '0')}</span><h3>${esc(d.decision)}</h3>
          <dl><div><dt>Why</dt><dd>${esc(d.why)}</dd></div><div><dt>Tradeoff</dt><dd>${esc(d.tradeoff)}</dd></div><div><dt>Evidence</dt><dd>${esc(d.evidence)}</dd></div></dl>
        </article>`).join('')}</div></section>` : '';
    const iter = p.iteration ? `<div class="iter reveal">
        <div><span class="kick">Observed</span><p>${esc(p.iteration.observed)}</p></div><div class="arrow" aria-hidden="true">&rarr;</div>
        <div><span class="kick">Changed</span><p>${esc(p.iteration.changed)}</p></div><div class="arrow" aria-hidden="true">&rarr;</div>
        <div><span class="kick">Verified</span><p>${esc(p.iteration.verified)}</p></div></div>` : '';

    document.querySelector('#main').innerHTML = `
      <section class="case-hero${heroHtml ? '' : ' no-media'}" aria-labelledby="case-title">
        ${heroHtml}
        <div class="wrap">
          <a class="back" href="index.html#projects">&larr; All projects</a>
          <p class="eyebrow">${esc(p.status)} &middot; ${esc(p.year)}</p>
          <h1 id="case-title"><span class="line-mask"><span>${esc(p.title)}</span></span></h1>
          ${(p.category || []).length ? `<div class="chips reveal" style="--i:2;margin-top:1.25rem">${p.category.map(c => `<span class="chip">${esc(c)}</span>`).join('')}</div>` : ''}
          ${facts}
        </div>
      </section>

      <div class="wrap">
        <section class="case-intro">
          <div class="reveal"><p class="summary">${esc(p.projectSummary || p.summary)}</p>${links}</div>
          <div class="reveal" style="--i:1">${own}${tech}</div>
        </section>

        <div class="case-body">
          <section class="case-sec">${head('overview', 'Context', 'Project overview', '01')}
            ${(p.overview || []).map(x => `<p class="reveal">${esc(x)}</p>`).join('')}${gallery('overview')}</section>
          ${decisions}
          <section class="case-sec">${head('objectives', 'Requirements', 'Objectives', '02')}${ul(p.objectives)}${gallery('objectives')}</section>
          <section class="case-sec">${head('role', 'Ownership', 'My contribution', '03')}${ul(p.role)}${gallery('role')}</section>
          <section class="case-sec">${head('process', 'Development', 'Process and iteration', '04')}
            <div class="proc">${(p.process || []).map((x, i) => `<div class="reveal" style="--i:${i}"><strong>${esc(x[0])}</strong><span>${esc(x[1])}</span></div>`).join('')}</div>
            ${gallery('development')}${iter}</section>
          <section class="case-sec">${head('results', 'Validation', 'Results and current status', '05')}${ul(p.results)}${gallery('validation')}</section>
        </div>

        <a class="next" href="project.html?id=${encodeURIComponent(next.id)}"><span>Next project</span><strong>${esc(next.title)}</strong><b aria-hidden="true">&rarr;</b></a>
      </div>`;
    RC.hydrate(document);
    requestAnimationFrame(() => document.body.classList.add('ready'));
  });
})();
