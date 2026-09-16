(() => {
  const grid = document.querySelector('#staff .teams');
  if (!grid) return;
  const cards = [
    ['BAR','Bar','Bars 1, 2, 3 et 4'], ['SEC','Security','Sécurité et responsable sécurité'],
    ['CARE','Care team','Accueil et accompagnement'], ['WC','WC','Toilettes 1 et 2'],
    ['LIGHT','Light','Équipe lumières'], ['SOUND','Sound','Ingénieur son'],
    ['ART','Artist care','Accueil et accompagnement des artistes']
  ];
  const card = ([code,title,text]) => `<button class="team staff-category" data-category="${code}"><span class="code">${code}</span><h3>${title}</h3><p>${text}</p><span class="cap">Ouvrir →</span></button>`;
  const showTop = () => { grid.innerHTML = cards.map(card).join(''); };
  const showBar = () => { grid.innerHTML = `<button class="team back-category">← Retour</button>${[1,2,3,4].map(n=>`<button class="team bar-select" data-bar="${n}"><span class="code">BAR ${n}</span><h3>Bar ${n}</h3><p>Choisir ce bar</p><span class="cap">Ouvrir →</span></button>`).join('')}`; };
  const showChoice = n => { grid.innerHTML = `<button class="team back-category">← Bars</button><button class="team role-select"><span class="code">BAR ${n}</span><h3>Caissier</h3><p>Accès caisse du Bar ${n}${n===4?' — non disponible':''}</p><span class="cap">Caissier ${n}</span></button><button class="team role-select"><span class="code">BAR ${n}</span><h3>Équipe bar</h3><p>Choisir le rôle de service</p><span class="cap">Ouvrir →</span></button>`; };
  const showBarRoles = n => { grid.innerHTML = `<button class="team back-category">← Bar ${n}</button><button class="team"><span class="code">BAR ${n}</span><h3>Responsable</h3><p>Gestion du Bar ${n}, de l’équipe et des inventaires.</p><span class="cap">Responsable</span></button><button class="team"><span class="code">BAR ${n}</span><h3>Bartender</h3><p>Service et opérations du Bar ${n}.</p><span class="cap">Bartender</span></button>`; };
  showTop();
  grid.addEventListener('click', e => {
    const b=e.target.closest('button'); if(!b) return;
    if(b.dataset.category==='BAR') showBar();
    else if(b.dataset.category) grid.innerHTML=`<button class="team back-category">← Retour</button><article class="team"><span class="code">${b.dataset.category}</span><h3>${b.querySelector('h3').textContent}</h3><p>Les sous-catégories de ce pôle seront ajoutées ensuite.</p></article>`;
    else if(b.dataset.bar) showChoice(b.dataset.bar);
    else if(b.classList.contains('role-select')) showBarRoles(b.closest('.teams').querySelector('.code').textContent.replace('BAR ',''));
    else if(b.classList.contains('back-category')) showTop();
  });
})();
