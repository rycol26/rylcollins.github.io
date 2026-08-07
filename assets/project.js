const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const id=new URLSearchParams(location.search).get('id');
fetch('data/projects.json').then(r=>r.json()).then(projects=>{
  const p=projects.find(x=>x.id===id)||projects[0];
  const idx=projects.indexOf(p), next=projects[(idx+1)%projects.length];
  document.title=`${p.title} | Ryan Collins`;
  const ul=items=>`<ul>${(items||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;

  const mediaHtml=(placement)=>{
    const items=(p.media||[]).filter(m=>(m.placement||'overview')===placement);
    if(!items.length) return '';
    const html=items.map((m,i)=>{
      const layout=esc(m.layout||((i===0)?'wide':''));
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

  document.querySelector('#project-root').innerHTML=`
    <section class="project-header shell">
      <div class="project-header-top">
        <div>
          <div class="intro-label">${esc(p.status)} · ${esc(p.year)}</div>
          <h1>${esc(p.title)}</h1>
          <p class="project-summary">${esc(p.summary)}</p>
        </div>
        <div class="project-facts">
          ${(p.impact||[]).map((x,i)=>`<div class="project-fact"><span>${i===0?'Result':'Key point'}</span><strong>${esc(x)}</strong></div>`).join('')}
        </div>
      </div>
    </section>

    <div class="shell project-content">
      <article class="project-main">
        <section>
          <div class="section-kicker">01 · Context</div>
          <h2>Project overview</h2>
          ${(p.overview||[]).map(x=>`<p>${esc(x)}</p>`).join('')}
          ${mediaHtml('overview')}
        </section>

        <section>
          <div class="section-kicker">02 · Requirements</div>
          <h2>Objectives</h2>
          ${ul(p.objectives)}
        </section>

        <section>
          <div class="section-kicker">03 · Ownership</div>
          <h2>My contribution</h2>
          ${ul(p.role)}
        </section>

        <section>
          <div class="section-kicker">04 · Development</div>
          <h2>Process and iteration</h2>
          <div class="process-table">${(p.process||[]).map(x=>`<div class="process-row"><strong>${esc(x[0])}</strong><span>${esc(x[1])}</span></div>`).join('')}</div>
          ${mediaHtml('development')}
        </section>

        <section>
          <div class="section-kicker">05 · Validation</div>
          <h2>Results and current status</h2>
          ${ul(p.results)}
          ${mediaHtml('validation')}
        </section>

        <a class="next-project" href="project.html?id=${encodeURIComponent(next.id)}"><span>Next</span><strong>${esc(next.title)}</strong><b>→</b></a>
      </article>

      <aside class="project-side">
        <div class="side-section">
          <h3>Technologies</h3>
          <div class="tech-list">${(p.technologies||[]).map(t=>`<span class="tech-item">${esc(t)}</span>`).join('')}</div>
        </div>
      </aside>
    </div>

    <div class="lightbox" id="lightbox">
      <button class="lightbox-close" aria-label="Close">×</button>
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
