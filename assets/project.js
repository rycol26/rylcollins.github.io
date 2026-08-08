const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const id=new URLSearchParams(location.search).get('id');

fetch('data/projects.json?v=rc16').then(r=>r.json()).then(projects=>{
  const p=projects.find(x=>x.id===id)||projects[0];
  const idx=projects.indexOf(p), next=projects[(idx+1)%projects.length];

  document.title=`${p.title} | Ryan Collins`;

  const ul=items=>`<ul>${(items||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;

  const mediaHtml=(placement)=>{
    const items=(p.media||[]).filter(m=>(m.placement||'overview')===placement);
    if(!items.length) return '';

    const html=items.map((m,i)=>{
      const layout=esc(m.layout||((items.length===1||i===0)?'wide':''));

      if(m.type==='video'){
        return `<figure class="media-item ${layout}">
          <video controls playsinline preload="metadata" ${m.poster?`poster="${esc(m.poster)}"`:''}>
            <source src="${esc(m.src)}" type="video/mp4">
          </video>
          <figcaption>${esc(m.caption||'')}</figcaption>
        </figure>`;
      }

      return `<figure class="media-item ${layout}">
        <button class="media-button" data-lightbox="${esc(m.src)}">
          <img loading="lazy" src="${esc(m.src)}" alt="${esc(m.alt||p.title)}">
        </button>
        <figcaption>${esc(m.caption||'')}</figcaption>
      </figure>`;
    }).join('');

    return `<div class="media-grid">${html}</div>`;
  };

  const snapshot=(p.snapshot||[]).length ? `
    <div class="project-snapshot">
      ${p.snapshot.map(x=>`
        <div class="snapshot-item">
          <span>${esc(x[0])}</span>
          <strong>${esc(x[1])}</strong>
        </div>`).join('')}
    </div>` : '';

  const tech=(p.technologies||[]).length ? `
    <div class="project-tech-inline">
      <div class="section-kicker">Technologies</div>
      <div class="tech-list">${(p.technologies||[]).map(t=>`<span class="tech-item">${esc(t)}</span>`).join('')}</div>
    </div>` : '';

  const st=p.sectionTitles||{};
  const head=(key, fallbackKicker, fallbackTitle)=>{
    const x=st[key]||[fallbackKicker,fallbackTitle];
    return `<div class="section-kicker">${esc(x[0])}</div><h2>${esc(x[1])}</h2>`;
  };

  document.querySelector('#project-root').innerHTML=`
    <section class="project-header shell">
      <div class="intro-label">${esc(p.status)} &middot; ${esc(p.year)}</div>
      <h1>${esc(p.title)}</h1>
      <p class="project-summary">${esc(p.summary)}</p>
      ${tech}
      ${snapshot}
    </section>

    <div class="shell project-content">
      <article class="project-main">
        <section class="case-section case-overview">
          ${head('overview','01 · Context','Project overview')}
          ${(p.overview||[]).map(x=>`<p>${esc(x)}</p>`).join('')}
          ${mediaHtml('overview')}
        </section>

        <section class="case-section case-objectives">
          ${head('objectives','02 · Requirements','Objectives')}
          ${ul(p.objectives)}
          ${mediaHtml('objectives')}
        </section>

        <section class="case-section case-role">
          ${head('role','03 · Ownership','My contribution')}
          ${ul(p.role)}
          ${mediaHtml('role')}
        </section>

        <section class="case-section case-process">
          ${head('process','04 · Development','Process and iteration')}
          <div class="process-table">${(p.process||[]).map(x=>`<div class="process-row"><strong>${esc(x[0])}</strong><span>${esc(x[1])}</span></div>`).join('')}</div>
          ${mediaHtml('development')}
        </section>

        <section class="case-section case-results">
          ${head('results','05 · Validation','Results and current status')}
          ${ul(p.results)}
          ${mediaHtml('validation')}
        </section>

        <a class="next-project" href="project.html?id=${encodeURIComponent(next.id)}">
          <span>Next</span><strong>${esc(next.title)}</strong><b>&rarr;</b>
        </a>
      </article>
    </div>

    <div class="lightbox" id="lightbox">
      <button class="lightbox-close" aria-label="Close">&times;</button>
      <img alt="Expanded project image">
    </div>`;

  const lb=document.querySelector('#lightbox'), lbImg=lb.querySelector('img');

  document.querySelectorAll('[data-lightbox]').forEach(b=>b.addEventListener('click',()=>{
    lbImg.src=b.dataset.lightbox;
    lb.classList.add('open');
  }));

  lb.addEventListener('click',e=>{
    if(e.target===lb||e.target.classList.contains('lightbox-close')) lb.classList.remove('open');
  });
});
