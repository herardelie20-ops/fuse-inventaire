(() => {
  const place = document.querySelector('#bar');
  const fridge = document.querySelector('#fridge');
  const save = document.querySelector('#save');
  const panel = document.createElement('section');
  panel.className = 'card';
  panel.innerHTML = '<b>État du lieu</b><p class="small" id="placeStatus"></p><button class="primary" id="validatePlace" type="button">Valider ce stock manuellement</button>';
  save.after(panel);
  const status = panel.querySelector('#placeStatus');
  const button = panel.querySelector('#validatePlace');
  const isStock = () => !place.value.startsWith('Bar ');
  const stockKey = () => `fuse-location-${place.value}`;
  const allFridgesDone = () => [...fridge.options].every(option => {
    try { return Boolean(JSON.parse(localStorage.getItem(`fuse-check-${place.value}-${option.value}`))?.completed); }
    catch { return false; }
  });
  function refresh() {
    if (isStock()) {
      const done = localStorage.getItem(stockKey());
      status.textContent = done ? `✓ ${place.value} validé le ${new Date(done).toLocaleString('fr-BE')}.` : 'Stock séparé des frigos : valide-le lorsque toutes ses boissons sont terminées.';
      status.style.color = done ? '#91f5ae' : '';
      button.hidden = false;
      button.disabled = Boolean(done);
      button.textContent = done ? 'Stock validé' : 'Valider ce stock manuellement';
      return;
    }
    const done = allFridgesDone();
    status.textContent = done ? `✓ ${place.value} est terminé : tous les frigos et leurs étages sont validés.` : 'Le bar deviendra vert automatiquement lorsque tous les étages de tous les frigos seront validés.';
    status.style.color = done ? '#91f5ae' : '';
    button.hidden = true;
  }
  button.onclick = () => { if (confirm(`Valider ${place.value} ?`)) { localStorage.setItem(stockKey(), new Date().toISOString()); refresh(); document.dispatchEvent(new Event('fuse:location-finished')); } };
  place.addEventListener('change', () => setTimeout(refresh, 0));
  document.addEventListener('fuse:fridge-finished', refresh);
  refresh();
})();
