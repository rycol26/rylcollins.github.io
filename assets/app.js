const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
Promise.all([fetch('data/projects.json').then(r=>r.json()),fetch('data/site.json').then(r=>r.json())]).then(([projects,site])=>{
  const featured=projects.filter(p=>p.featured).slice(0,3);
  const featuredEl=document.querySelector('#featured-projects');
  featuredEl.innerHTML=featured.map(p=>`
    <a class="featured-card" href="project.html?id=${encodeURIComponent(p.id)}">
      <div class="featured-image">${p.hero?`<img src="${esc(p.hero)}" alt="${esc(p.title)}">`:''}</div>
      <div class="featured-body">
        <div class="project-meta"><span>${esc(p.year)}</span><span>${esc(p.status)}</span></div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.summary)}</p>
        <div class="featured-link">View case study →</div>
      </div>
    </a>`).join('');

  const cats=['All',...new Set(projects.flatMap(p=>p.category||[]))];
  let active='All';
  const filters=document.querySelector('#filters');
  const list=document.querySelector('#project-list');
  function renderFilters(){
    filters.innerHTML=cats.map(c=>`<button class="filter ${c===active?'active':''}" data-filter="${esc(c)}">${esc(c)}</button>`).join('');
    [...filters.querySelectorAll('.filter')].forEach(b=>b.addEventListener('click',()=>{active=b.dataset.filter;renderFilters();renderList()}));
  }
  function renderList(){
    const shown=active==='All'?projects:projects.filter(p=>(p.category||[]).includes(active));
    list.innerHTML=shown.map(p=>`
      <a class="project-row" href="project.html?id=${encodeURIComponent(p.id)}">
        <div class="row-year">${esc(p.year)}</div>
        <h4>${esc(p.title)}</h4>
        <p>${esc(p.summary)}</p>
        <div class="row-category">${esc((p.category||[]).slice(0,2).join(' / '))}</div>
      </a>`).join('');
  }
  renderFilters(); renderList();

  document.querySelector('#experience-list').innerHTML=(site.experience||[]).map(e=>`
    <div class="experience-row">
      <div class="dates">${esc(e.dates)}</div>
      <div><strong>${esc(e.company)}</strong><div class="role">${esc(e.role)}</div></div>
      <p>${esc(e.summary)}</p>
    </div>`).join('');
});
