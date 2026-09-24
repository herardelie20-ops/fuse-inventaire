(() => {
  const place = document.querySelector('#bar');
  const selectorCard = place.closest('section');
  const plan = document.createElement('section');
  plan.id = 'barPlan';
  plan.className = 'card';
  plan.innerHTML = '<b id="barPlanTitle">Plan du lieu</b><p id="barPlanNote" class="small"></p><div id="planReferenceLayout"><figure id="fridgeReference" class="hidden"><img id="fridgeReferenceImage" alt="Photo de référence du frigo"><figcaption id="fridgeReferenceCaption"></figcaption></figure><div id="barPlanCanvas"><img id="barPlanImage" alt="Plan du bar sélectionné"><div id="planMasks"></div><div id="fridgeMarkers"></div></div></div>';
  selectorCard.after(plan);

  const planStyle = document.createElement('style');
  planStyle.textContent = '#planReferenceLayout{display:grid;grid-template-columns:minmax(170px,.72fr) minmax(0,1.28fr);gap:12px;align-items:start;margin-top:12px}#fridgeReference{margin:0;border:1px solid #555;border-radius:9px;overflow:hidden;background:#050505}#fridgeReference img{display:block;width:100%;max-height:390px;object-fit:contain;background:#000}#fridgeReference figcaption{padding:8px 9px;color:#d4d4d4;font-size:.78rem;font-weight:700;line-height:1.3}@media(max-width:560px){#planReferenceLayout{grid-template-columns:1fr}#fridgeReference img{max-height:300px}}';
  document.head.append(planStyle);

  const title = plan.querySelector('#barPlanTitle');
  const note = plan.querySelector('#barPlanNote');
  const image = plan.querySelector('#barPlanImage');
  const markers = plan.querySelector('#fridgeMarkers');
  const masks = plan.querySelector('#planMasks');
  const reference = plan.querySelector('#fridgeReference');
  const referenceImage = plan.querySelector('#fridgeReferenceImage');
  const referenceCaption = plan.querySelector('#fridgeReferenceCaption');
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
  const referencePhotos = {
    'Bar 1 - Main room': {
      'Frigo 1': 'IMG-20260924-WA0012.jpg', 'Frigo 2': 'IMG-20260924-WA0011.jpg', 'Frigo 3': 'IMG-20260924-WA0010.jpg',
      'Frigo 4': 'IMG-20260924-WA0009.jpg', 'Frigo 5': 'IMG-20260924-WA0008.jpg', 'Frigo 6': 'IMG-20260924-WA0007.jpg',
      'Frigo 7': 'IMG-20260924-WA0006.jpg', 'Frigo 8': 'IMG-20260924-WA0004.jpg', 'Frigo 9': 'IMG-20260924-WA0005.jpg', 'Frigo 10': 'IMG-20260924-WA0003.jpg', 'Frigo 11': 'IMG-20260924-WA0002.jpg', 'Frigo 12': 'IMG-20260924-WA0001.jpg',
      'Frigo 15 (Bahut)': 'IMG-20260924-WA0017.jpg',
      'Frigo 16 (Bahut)': 'IMG-20260924-WA0018.jpg', 'Frigo Redbull 17': 'IMG-20260924-WA0019.jpg'
    },
    'Bar 2 - Main room': {'Frigo 1': 'IMG-20260924-WA0021.jpg', 'Frigo 6': 'IMG-20260924-WA0021(1).jpg'},
    'Bar 3 - Motion': {
      'Frigo 1': 'IMG-20260924-WA0034.jpg', 'Frigo 2': 'IMG-20260924-WA0035.jpg', 'Frigo 3': 'IMG-20260924-WA0036.jpg',
      'Frigo 4': 'IMG-20260924-WA0037.jpg', 'Frigo 5': 'IMG-20260924-WA0038.jpg', 'Frigo 6': 'IMG-20260924-WA0039.jpg',
      'Frigo Redbull 13': 'IMG-20260924-WA0040.jpg'
    },
    'Bar 4 - Cosmos': {
      'Frigo 1': 'IMG-20260924-WA0047.jpg', 'Frigo 2': 'IMG-20260924-WA0046.jpg', 'Frigo 3': 'IMG-20260924-WA0045.jpg',
      'Frigo 4': 'IMG-20260924-WA0044.jpg', 'Frigo 5 (Red Bull)': 'IMG-20260924-WA0042.jpg', 'Frigo 6 (Coca)': 'IMG-20260924-WA0043.jpg'
    }
  };
  const profileReferencePhotos = {
    'Bar 1 - Main room': {
      fuse: {'Frigo Coca 13': 'IMG-20260924-WA0020.jpg', 'Frigo Coca 14': 'IMG-20260924-WA0020.jpg'},
      'la-demence': {'Frigo Coca 13': 'IMG-20260924-WA0000(1).jpg', 'Frigo Coca 14': 'IMG-20260924-WA0013.jpg'}
    }
  };

  const bar1Markers = [
    ['Frigo 1', '1', 18.4, 65], ['Frigo 2', '2', 18.4, 56.3], ['Frigo 3', '3', 18.4, 48],
    ['Frigo 4', '4', 45.6, 19.2], ['Frigo 5', '5', 53, 19.2], ['Frigo 6', '6', 60.4, 19.2],
    ['Frigo 7', '7', 64.1, 24.1], ['Frigo 8', '8', 64.1, 33.4], ['Frigo 9', '9', 64.1, 41.2],
    ['Frigo 10', '10', 63.3, 70.3], ['Frigo 11', '11', 54.9, 74.2], ['Frigo 12', '12', 49.4, 77.1],
    ['Frigo Coca 13', '13', 40.7, 77.1], ['Frigo Coca 14', '14', 26, 77.1],
    ['Frigo 15 (Bahut)', '15', 28.7, 42.6], ['Frigo 16 (Bahut)', '16', 47.6, 27.4], ['Frigo Redbull 17', '17', 34.6, 45.7]
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
      ['Frigo 7', '7', 16.3, 49.4], ['Frigo 8', '8', 23.8, 49.4], ['Frigo 9 (Red Bull)', '9', 31.2, 49.4], ['Frigo 10', '10', 50.8, 49.4],
      ['Frigo 11 (Bahut)', '11', 66.8, 47.9], ['Frigo Redbull 12', '12', 22.7, 23.8], ['Frigo Redbull 13', '13', 72.2, 25.8]
    ],
    'Bar 4 - Cosmos': [
      ['Frigo 1', '1', 73, 46.1], ['Frigo 2', '2', 64.9, 46.1], ['Frigo 3', '3', 56.4, 46.1],
      ['Frigo 4', '4', 48.8, 46.1], ['Frigo 5 (Red Bull)', '5', 38.1, 60.8], ['Frigo 6 (Coca)', '6', 26.4, 60.8]
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
    markers.innerHTML = (planMarkers[place.value] || []).map(([fridge, label, left, top]) => {
      const state = fridgeState(fridge);
      return `<button class="fridge-marker ${state}" type="button" data-fridge="${fridge}" title="Ouvrir ${fridge}" aria-label="Ouvrir ${fridge}" style="left:${left}%;top:${top}%">${label}</button>`;
    }
    ).join('');
  }
  function renderMasks() {
    masks.innerHTML = '';
  }
  function renderReferencePhoto() {
    const selectedFridge = document.querySelector('#fridge').value;
    const source = profileReferencePhotos[place.value]?.[window.FUSE_CURRENT_PROFILE]?.[selectedFridge]
      || referencePhotos[place.value]?.[selectedFridge];
    reference.classList.toggle('hidden', !source);
    if (!source) return;
    referenceImage.src = `reference-photos/${source}`;
    referenceCaption.textContent = `Photo de référence — ${document.querySelector('#fridge').value}`;
  }

  function updatePlan() {
    const planImage = planImages[place.value];
    plan.classList.toggle('hidden', !planImage);
    if (!planImage) return;
    title.textContent = `Plan — ${place.value}`;
    if (planImage) {
      const language = localStorage.getItem('fuse-language') || window.FUSE_LANGUAGE || 'fr';
      image.src = language === 'nl' ? planImage.replace('.png', '-nl.png') : planImage;
      image.hidden = false;
      if (place.value.startsWith('Bar ')) {
        note.innerHTML = 'Repères : <span class="plan-state white">blanc</span> à faire · <span class="plan-state orange">orange</span> en cours · <span class="plan-state red">rouge</span> avec erreur · <span class="plan-state green">vert</span> validé.';
        renderMarkers();
        renderMasks();
        renderReferencePhoto();
      } else {
        note.textContent = 'Plan du bar associé à ce stock interne.';
        markers.innerHTML = '';
        masks.innerHTML = '';
        reference.classList.add('hidden');
      }
    } else {
      image.hidden = true;
      markers.innerHTML = '';
      note.textContent = 'Plan à ajouter pour ce bar.';
      reference.classList.add('hidden');
    }
  }

  place.addEventListener('change', () => setTimeout(updatePlan, 0));
  place.addEventListener('input', () => setTimeout(updatePlan, 0));
  document.querySelector('#fridge').addEventListener('change', renderReferencePhoto);
  markers.addEventListener('click', event => {
    const marker = event.target.closest('[data-fridge]');
    if (!marker) return;
    const selected = marker.dataset.fridge;
    if (![...document.querySelector('#fridge').options].some(option => option.value === selected)) return;
    document.querySelector('#fridge').value = selected;
    document.querySelector('#fridge').dispatchEvent(new Event('change', { bubbles: true }));
    document.querySelector('#fridge').dispatchEvent(new Event('input', { bubbles: true }));
    renderReferencePhoto();
  });
  document.addEventListener('fuse:fridge-finished', renderMarkers);
  document.addEventListener('fuse:fridge-progress', renderMarkers);
  document.addEventListener('fuse-profile-changed', updatePlan);
  document.addEventListener('fuse-language-changed', updatePlan);
  document.addEventListener('click', event => {
    if (event.target.closest('[data-lang]')) setTimeout(updatePlan, 0);
  });
  updatePlan();
})();
