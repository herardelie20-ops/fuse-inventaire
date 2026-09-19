(() => {
  const place = document.querySelector('#bar');
  const fridge = document.querySelector('#fridge');
  const shelfLabel = document.querySelector('#shelfLabel');
  const shelf = document.querySelector('#shelf');
  const lines = document.querySelector('#lines');
  const productCard = lines.closest('.card');
  const heading = productCard.querySelector('b');
  const addButton = document.querySelector('#add');
  const standardShelves = ['Étage 1 — haut', 'Étage 2', 'Étage 3 — rez-de-chaussée'];
  const fourShelves = ['Étage 1 — haut', 'Étage 2', 'Étage 3', 'Étage 4 — bas'];
  const blueFridgeShelves = ['Étage 1 — haut', 'Étage 2', 'Étage 3 — rez-de-chaussée'];
  const redbullShelves = ['Étage 1 — haut', 'Étage 2 — bas'];
  const isBahut = () => /^Bahut\b/i.test(fridge.value);
  const isRedbull = () => /redbull/i.test(fridge.value);
  const isBlueFridge = () => /^Frigo \d+$/.test(fridge.value);
  const hasTwoFloors = () => (place.value === 'Bar 3 - Motion' && fridge.value === 'Frigo 3') || (place.value === 'Bar 2 - Main room' && fridge.value === 'Frigo 4') || (place.value === 'Bar 1 - Main room' && fridge.value === 'Frigo 12');
  const hasFourFloors = () => place.value === 'Bar 4 - Cosmos' && ['Frigo 5', 'Frigo 6'].includes(fridge.value);
  const isBar = () => place.value.startsWith('Bar ');
  function setOptions(names) {
    if ([...shelf.options].map(option => option.value).join('|') !== names.join('|')) shelf.innerHTML = names.map(name => `<option value="${name}">${name}</option>`).join('');
  }
  function setBahutInput(enabled) {
    const first = lines.children[0];
    if (!first) return;
    const nameLabel = first.querySelector('label');
    const nameInput = nameLabel.querySelector('input');
    if (enabled) {
      nameLabel.classList.add('hidden');
      nameInput.value = 'Total bahut';
      heading.textContent = 'Quantité manuelle du bahut';
      addButton.classList.add('hidden');
    } else {
      nameLabel.classList.remove('hidden');
      if (nameInput.value === 'Total bahut') nameInput.value = '';
      heading.textContent = 'Boissons comptées';
      addButton.classList.remove('hidden');
    }
  }
  function refresh() {
    const showShelves = isBar() && !isBahut();
    shelfLabel.classList.toggle('hidden', !showShelves);
    if (showShelves) setOptions(hasFourFloors() ? fourShelves : isRedbull() || (isBlueFridge() && hasTwoFloors()) ? redbullShelves : isBlueFridge() ? blueFridgeShelves : standardShelves);
    setBahutInput(isBar() && isBahut());
  }
  place.addEventListener('change', () => setTimeout(refresh, 0));
  fridge.addEventListener('change', () => setTimeout(refresh, 0));
  refresh();
})();
