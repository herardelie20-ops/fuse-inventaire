(() => {
  const place = document.querySelector('#bar');
  const selectorCard = place.closest('section');
  const plan = document.createElement('section');
  plan.id = 'barPlan';
  plan.className = 'card';
  plan.innerHTML = '<b id="barPlanTitle">Plan du lieu</b><p id="barPlanNote" class="small"></p><div id="barPlanCanvas"><img id="barPlanImage" alt="Plan du bar sélectionné"><div id="fridgeMarkers"></div></div>';
  selectorCard.after(plan);

  const title = plan.querySelector('#barPlanTitle');
  const note = plan.querySelector('#barPlanNote');
  const image = plan.querySelector('#barPlanImage');
  const markers = plan.querySelector('#fridgeMarkers');

  const bar1Markers = [
    ['Frigo 1', '1', 18.4, 65], ['Frigo 2', '2', 18.4, 56.3], ['Frigo 3', '3', 18.4, 48],
    ['Frigo 4', '4', 45.6, 19.2], ['Frigo 5', '5', 53, 19.2], ['Frigo 6', '6', 60.4, 19.2],
    ['Frigo 7', '7', 64.1, 24.1], ['Frigo 8', '8', 64.1, 33.4], ['Frigo 9', '9', 64.1, 41.2],
    ['Frigo 10', '10', 63.3, 70.3], ['Frigo 11', '11', 54.9, 74.2], ['Frigo 12', '12', 49.4, 77.1],
    ['Frigo Coca 13', '13', 40.7, 77.1], ['Frigo Coca 14', '14', 26, 77.1],
    ['Bahut 1', '15', 28.7, 42.6], ['Bahut 2', '16', 47.6, 27.4], ['Frigo Redbull 17', '17', 34.6, 45.7]
  ];

  function isFinished(fridge) {
    const saved = localStorage.getItem(`fuse-check-Bar 1 - Main room-${fridge}`);
    return Boolean(saved && JSON.parse(saved).completed);
  }

  function renderMarkers() {
    markers.innerHTML = bar1Markers.map(([fridge, label, left, top]) =>
      `<span class="fridge-marker ${isFinished(fridge) ? 'done' : ''}" title="${fridge}" style="left:${left}%;top:${top}%">${label}</span>`
    ).join('');
  }

  function updatePlan() {
    const isBar = place.value.startsWith('Bar ');
    plan.classList.toggle('hidden', !isBar);
    if (!isBar) return;
    title.textContent = `Plan — ${place.value}`;
    if (place.value === 'Bar 1 - Main room') {
      image.src = 'plan-bar-1.png';
      image.hidden = false;
      note.textContent = 'Repérez les frigos numérotés avant de lancer le comptage.';
      renderMarkers();
    } else {
      image.hidden = true;
      markers.innerHTML = '';
      note.textContent = 'Plan à ajouter pour ce bar.';
    }
  }

  place.addEventListener('change', () => setTimeout(updatePlan, 0));
  document.addEventListener('fuse:fridge-finished', renderMarkers);
  updatePlan();
})();
