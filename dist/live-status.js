(() => {
  const place = document.querySelector('#bar');
  const fridge = document.querySelector('#fridge');
  const selectorCard = place.closest('section');
  const badges = document.createElement('div');
  badges.id = 'liveBadges';
  badges.innerHTML = '<span id="placeBadge" class="live-badge">Lieu</span><span id="fridgeBadge" class="live-badge">Frigo</span>';
  selectorCard.append(badges);

  const placeBadge = badges.querySelector('#placeBadge');
  const fridgeBadge = badges.querySelector('#fridgeBadge');
  const unitName = () => fridge.options[fridge.selectedIndex]?.text || 'Élément';
  const isStock = () => !place.value.startsWith('Bar ');
  const isLocationDone = () => Boolean(localStorage.getItem(`fuse-location-${place.value}`));
  const isUnitDone = () => {
    if (isStock()) return isLocationDone();
    try {
      return Boolean(JSON.parse(localStorage.getItem(`fuse-check-${place.value}-${unitName()}`))?.completed);
    } catch { return false; }
  };
  function setBadge(node, text, done) {
    node.textContent = `${done ? '✓' : '●'} ${text}`;
    node.classList.toggle('done', done);
  }
  function refresh() {
    setBadge(placeBadge, place.value, isLocationDone());
    setBadge(fridgeBadge, unitName(), isUnitDone());
  }
  place.addEventListener('change', () => setTimeout(refresh, 0));
  fridge.addEventListener('change', refresh);
  document.addEventListener('fuse:fridge-finished', refresh);
  document.addEventListener('fuse:location-finished', refresh);
  refresh();
})();
