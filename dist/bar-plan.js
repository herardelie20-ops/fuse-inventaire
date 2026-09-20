(() => {
  const place = document.querySelector('#bar');
  const selectorCard = place.closest('section');
  const plan = document.createElement('section');
  plan.id = 'barPlan';
  plan.className = 'card';
  plan.innerHTML = '<b id="barPlanTitle">Plan du lieu</b><p id="barPlanNote" class="small"></p><div id="barPlanCanvas"><img id="barPlanImage" alt="Plan du bar sélectionné"><div id="planMasks"></div><div id="fridgeMarkers"></div></div>';
  selectorCard.after(plan);

  const title = plan.querySelector('#barPlanTitle');
  const note = plan.querySelector('#barPlanNote');
  const image = plan.querySelector('#barPlanImage');
  const markers = plan.querySelector('#fridgeMarkers');
  const masks = plan.querySelector('#planMasks');
  const planImages = {
    'Bar 1 - Main room': 'plan-bar-1.png',
    'Bar 2 - Main room': 'plan-bar-2.png',
    'Bar 3 - Motion': 'plan-bar-3.png',
    'Bar 4 - Cosmos': 'plan-bar-4.png',
    'Stock Bar 1 - Main room': 'plan-bar-1.png',
    'Stock Bar 2 - Main room': 'plan-bar-2.png',
    'Stock chambre froide - Bar 2 Main room': 'plan-bar-2.png',
    'Stock Bar 3 - Motion': 'plan-bar-3.png',
    'Stock Bar 4 - Cosmos': 'plan-bar-4.png'
  };

  const bar1Markers = [
    ['Frigo 1', '1', 18.4, 65], ['Frigo 2', '2', 18.4, 56.3], ['Frigo 3', '3', 18.4, 48],
    ['Frigo 4', '4', 45.6, 19.2], ['Frigo 5', '5', 53, 19.2], ['Frigo 6', '6', 60.4, 19.2],
    ['Frigo 7', '7', 64.1, 24.1], ['Frigo 8', '8', 64.1, 33.4], ['Frigo 9', '9', 64.1, 41.2],
    ['Frigo 10', '10', 63.3, 70.3], ['Frigo 11', '11', 54.9, 74.2], ['Frigo 12', '12', 49.4, 77.1],
    ['Frigo Coca 13', '13', 40.7, 77.1], ['Frigo Coca 14', '14', 26, 77.1],
    ['Bahut 1', '15', 28.7, 42.6], ['Bahut 2', '16', 47.6, 27.4], ['Frigo Redbull 17', '17', 34.6, 45.7]
  ];
  const planMarkers = {
    'Bar 1 - Main room': bar1Markers,
    'Bar 2 - Main room': [
      ['Frigo 1', '1', 31.6, 59.8], ['Frigo 2', '2', 40.4, 59.8], ['Frigo 3', '3', 49.3, 59.8],
      ['Frigo 4', '4', 58.2, 59.8], ['Frigo 5', '5', 67.1, 59.8], ['Frigo 6', '6', 76.2, 59.8], ['Frigo 7', '7', 62.2, 28.5],
      ['Frigo Coca 8', '8', 27, 28.6], ['Frigo Coca 9', '9', 72.5, 28.7]
    ],
    'Bar 3 - Motion': [
      ['Frigo 1', '1', 26.9, 32.1], ['Frigo 2', '2', 35.9, 32.1], ['Frigo 3', '3', 44.9, 32.1],
      ['Frigo 4', '4', 53.9, 32.1], ['Frigo 5', '5', 62.9, 32.1], ['Frigo 6', '6', 72.1, 32.1],
      ['Frigo 7', '7', 16.3, 49.4], ['Frigo 8', '8', 23.8, 49.4], ['Frigo 9', '9', 31.2, 49.4], ['Frigo 10', '10', 50.8, 49.4],
      ['Bahut 11', '11', 66.8, 47.9], ['Frigo Redbull 12', '12', 22.7, 23.8], ['Frigo Redbull 13', '13', 72.2, 25.8]
    ],
    'Bar 4 - Cosmos': [
      ['Frigo 1', '1', 73, 46.1], ['Frigo 2', '2', 64.9, 46.1], ['Frigo 3', '3', 56.4, 46.1],
      ['Frigo 4', '4', 48.8, 46.1], ['Frigo 5', '5', 38.1, 60.8], ['Frigo 6', '6', 26.4, 60.8]
    ]
  };

  function fridgeState(fridge) {
    try {
      const stored = JSON.parse(localStorage.getItem(`fuse-check-${place.value}-${fridge}`));
      if (stored?.hasIssues) return 'error';
      const prefix = `fuse-shelf-${place.value}-${fridge}-`;
      let started = Boolean(stored?.inProgress);
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (!key?.startsWith(prefix)) continue;
        started = true;
        const floor = JSON.parse(localStorage.getItem(key));
        if (!floor?.completed && (floor?.hadIssue || floor?.alignment === 'crooked' || ['missing', 'extra', 'both'].includes(floor?.quantity))) return 'error';
      }
      if (stored?.completed) return 'done';
      if (started) return 'progress';
    } catch { /* état absent : à faire */ }
    return 'pending';
  }

  function renderMarkers() {
    markers.innerHTML = (planMarkers[place.value] || []).filter(([fridge]) => !(window.FUSE_CURRENT_PROFILE === 'la-demence' && place.value === 'Bar 1 - Main room' && fridge === 'Frigo Redbull 17')).map(([fridge, label, left, top]) => {
      const state = fridgeState(fridge);
      return `<span class="fridge-marker ${state}" title="${fridge}" style="left:${left}%;top:${top}%">${label}</span>`;
    }
    ).join('');
  }
  function renderMasks() {
    const hideRedbull = window.FUSE_CURRENT_PROFILE === 'la-demence' && place.value === 'Bar 1 - Main room';
    masks.innerHTML = hideRedbull ? '<span class="plan-hidden-fridge" style="left:34.6%;top:45.7%"></span>' : '';
  }

  function updatePlan() {
    const planImage = planImages[place.value];
    plan.classList.toggle('hidden', !planImage);
    if (!planImage) return;
    title.textContent = `Plan — ${place.value}`;
    if (planImage) {
      const language = window.FUSE_LANGUAGE || localStorage.getItem('fuse-language') || 'fr';
      image.src = language === 'nl' ? planImage.replace('.png', '-nl.png') : planImage;
      image.hidden = false;
      if (place.value.startsWith('Bar ')) {
        note.textContent = 'Repères de suivi : blanc à faire, orange en cours, rouge avec erreur, vert validé.';
        renderMarkers();
        renderMasks();
      } else {
        note.textContent = 'Plan du bar associé à ce stock interne.';
        markers.innerHTML = '';
        masks.innerHTML = '';
      }
    } else {
      image.hidden = true;
      markers.innerHTML = '';
      note.textContent = 'Plan à ajouter pour ce bar.';
    }
  }

  place.addEventListener('change', () => setTimeout(updatePlan, 0));
  place.addEventListener('input', () => setTimeout(updatePlan, 0));
  document.addEventListener('fuse:fridge-finished', renderMarkers);
  document.addEventListener('fuse:fridge-progress', renderMarkers);
  document.addEventListener('fuse-profile-changed', updatePlan);
  document.addEventListener('fuse-language-changed', updatePlan);
  updatePlan();
})();
