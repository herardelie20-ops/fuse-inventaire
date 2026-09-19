(() => {
  const place = document.querySelector('#bar');
  const fridge = document.querySelector('#fridge');
  const shelf = document.querySelector('#shelf');
  const selectorCard = place.closest('section');
  const badges = document.createElement('div');
  badges.id = 'liveBadges';
  badges.innerHTML = '<span id="placeBadge" class="live-badge">Lieu</span><span id="fridgeBadge" class="live-badge">Frigo</span><span id="shelfBadge" class="live-badge">Étage</span>';
  selectorCard.append(badges);

  const placeBadge = badges.querySelector('#placeBadge');
  const fridgeBadge = badges.querySelector('#fridgeBadge');
  const shelfBadge = badges.querySelector('#shelfBadge');
  const unitName = () => fridge.options[fridge.selectedIndex]?.text || 'Élément';
  const isStock = () => !place.value.startsWith('Bar ');
  const hasKey = prefix => {
    for (let index = 0; index < localStorage.length; index += 1) if (localStorage.key(index)?.startsWith(prefix)) return true;
    return false;
  };
  const stockState = placeName => {
    if (localStorage.getItem(`fuse-location-${placeName}`)) return 'done';
    return hasKey(`fuse-stock-${placeName}-`) || hasKey(`fuse-hanging-${placeName}-`) ? 'progress' : 'pending';
  };
  const barState = placeName => {
    const units = window.FUSE_UNITS_BY_PLACE?.[placeName] || [];
    if (!units.length) return 'pending';
    const states = units.map(name => {
      try {
        const stored = JSON.parse(localStorage.getItem(`fuse-check-${placeName}-${name}`));
        if (stored?.hasIssues) return 'error';
        const prefix = `fuse-shelf-${placeName}-${name}-`;
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
      } catch { /* unité non commencée */ }
      return 'pending';
    });
    if (states.every(state => state === 'done')) return 'done';
    if (states.includes('error')) return 'error';
    return states.includes('progress') ? 'progress' : 'pending';
  };
  const hasShelf = () => !isStock() && !/^Bahut\b/i.test(unitName());
  const unitState = name => {
    if (isStock()) {
      try {
        const stored = JSON.parse(localStorage.getItem(`fuse-stock-${place.value}-${name}`));
        if (stored?.validated) return 'done';
        if (stored) return 'progress';
        const hanging = JSON.parse(localStorage.getItem(`fuse-hanging-${place.value}-${name}`));
        return hanging?.validated ? 'done' : hanging ? 'progress' : 'pending';
      } catch { return 'pending'; }
    }
    try {
      const stored = JSON.parse(localStorage.getItem(`fuse-check-${place.value}-${name}`));
      if (stored?.hasIssues) return 'error';
      const prefix = `fuse-shelf-${place.value}-${name}-`;
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
    } catch { return 'pending'; }
    return 'pending';
  };
  const locationState = () => {
    return isStock() ? stockState(place.value) : barState(place.value);
  };
  const shelfState = () => {
    if (isStock()) return 'pending';
    try { const stored = JSON.parse(localStorage.getItem(`fuse-shelf-${place.value}-${unitName()}-${shelf.value}`)); return stored?.completed ? 'done' : stored?.rechecking ? 'progress' : stored?.hadIssue || stored?.quantity === 'missing' || stored?.quantity === 'extra' || stored?.quantity === 'both' || stored?.alignment === 'crooked' ? 'error' : stored ? 'progress' : 'pending'; }
    catch { return 'pending'; }
  }
  const isLocationDone = () => locationState() === 'done';
  const isUnitDone = () => unitState(unitName()) === 'done';
  const isShelfDone = () => shelfState() === 'done';
  function setBadge(node, text, state) {
    node.textContent = `${state === 'done' ? '✓' : '●'} ${text}`;
    node.classList.toggle('done', state === 'done');
    node.classList.toggle('in-progress', state === 'progress');
    node.classList.toggle('error', state === 'error');
  }
  function colorOption(option, state) {
    option.style.color = state === 'done' ? '#00a94f' : state === 'progress' ? '#e87918' : state === 'error' ? '#dc2626' : '';
    option.dataset.done = state === 'done' ? 'true' : 'false';
  }
  function colorTabs() {
    [...place.options].forEach(option => {
      const isStockOption = !option.value.startsWith('Bar ');
      const state = isStockOption ? stockState(option.value) : barState(option.value);
      colorOption(option, state);
    });
    [...fridge.options].forEach(option => {
      colorOption(option, unitState(option.value));
    });
    [...shelf.options].forEach(option => {
      try { const record = JSON.parse(localStorage.getItem(`fuse-shelf-${place.value}-${unitName()}-${option.value}`)); colorOption(option, record?.completed ? 'done' : record?.rechecking ? 'progress' : record?.hadIssue || record?.alignment === 'crooked' || ['missing','extra','both'].includes(record?.quantity) ? 'error' : record ? 'progress' : 'pending'); }
      catch { colorOption(option, 'pending'); }
    });
    const applySelect = (element, state) => { element.classList.toggle('done-select', state === 'done'); element.classList.toggle('progress-select', state === 'progress'); element.classList.toggle('error-select', state === 'error'); element.classList.remove('pending-select'); };
    applySelect(place, locationState());
    applySelect(fridge, unitState(unitName()));
    applySelect(shelf, hasShelf() ? shelfState() : 'pending');
  }
  function refresh() {
    setBadge(placeBadge, place.value, locationState());
    setBadge(fridgeBadge, unitName(), unitState(unitName()));
    shelfBadge.classList.toggle('hidden', !hasShelf());
    if (hasShelf()) setBadge(shelfBadge, shelf.value, shelfState());
    colorTabs();
  }
  place.addEventListener('change', () => setTimeout(refresh, 0));
  fridge.addEventListener('change', refresh);
  shelf.addEventListener('change', refresh);
  document.addEventListener('fuse:fridge-finished', refresh);
  document.addEventListener('fuse:fridge-progress', refresh);
  document.addEventListener('fuse:location-finished', refresh);
  window.addEventListener('fuse:stock-product-finished', refresh);
  document.addEventListener('fuse-profile-changed', refresh);
  refresh();
})();
