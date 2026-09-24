(() => {
  const place = document.querySelector('#bar');
  const fridge = document.querySelector('#fridge');
  const save = document.querySelector('#save');
  const productCard = document.querySelector('#lines')?.closest('.card');
  if (!place || !fridge || !save || !productCard) return;

  const style = document.createElement('style');
  style.textContent = '.bahut-row{display:grid;grid-template-columns:minmax(150px,1fr) 110px minmax(105px,.6fr);gap:9px;align-items:end;padding:11px 0;border-top:1px solid #444}.bahut-row label{margin:0}.bahut-bottles{padding:11px 0;color:#91f5ae}@media(max-width:560px){.bahut-row{grid-template-columns:1fr 1fr}.bahut-row label:first-child{grid-column:1/-1}.bahut-bottles{padding-top:0}}';
  document.head.append(style);

  const panel = document.createElement('section');
  panel.className = 'card bahut-panel hidden';
  panel.innerHTML = `<b>Comptage du bahut — bacs pleins</b>
    <p class="small">Deux catégories maximum. Chaque bac plein est converti automatiquement en nombre de bouteilles.</p>
    <div id="bahutRows"></div><p class="small" id="bahutTotal"></p>`;
  productCard.before(panel);

  const rows = panel.querySelector('#bahutRows');
  const total = panel.querySelector('#bahutTotal');
  const isBahut = () => place.value.startsWith('Bar ') && /\bBahut\b/i.test(fridge.value) && !(place.value === 'Bar 3 - Motion' && fridge.value === 'Frigo 11 (Bahut)');
  const key = () => `fuse-bahut-${place.value}-${fridge.value}`;
  const fridgeKey = () => `fuse-check-${place.value}-${fridge.value}`;
  const packProducts = () => Object.keys(window.FUSE_PACK_SIZES || {}).sort((a, b) => a.localeCompare(b, 'fr'));
  const read = () => { try { return JSON.parse(localStorage.getItem(key())); } catch { return null; } };

  function render() {
    const saved = read()?.entries || [];
    rows.innerHTML = [0, 1].map(index => {
      const entry = saved[index] || {};
      const choices = ['<option value="">Choisir une boisson</option>', ...packProducts().map(name => `<option value="${name}"${entry.product === name ? ' selected' : ''}>${name} (${window.FUSE_PACK_SIZES[name]} bouteilles)</option>`)].join('');
      return `<article class="bahut-row"><label>Catégorie ${index + 1}<select class="bahut-product">${choices}</select></label><label>Bacs pleins<input class="bahut-crates" type="number" min="0" inputmode="numeric" value="${entry.crates ?? ''}" placeholder="0"></label><strong class="bahut-bottles">0 bouteille</strong></article>`;
    }).join('');
    rows.querySelectorAll('.bahut-product, .bahut-crates').forEach(input => input.addEventListener('input', updateTotals));
    rows.querySelectorAll('.bahut-product').forEach(input => input.addEventListener('change', updateTotals));
    updateTotals();
  }

  function entries() {
    return [...rows.querySelectorAll('.bahut-row')].map(row => {
      const product = row.querySelector('.bahut-product').value;
      const crates = Number(row.querySelector('.bahut-crates').value || 0);
      const size = Number(window.FUSE_PACK_SIZES?.[product] || 0);
      return { product, crates, size, bottles: crates * size };
    }).filter(entry => entry.product);
  }

  function updateTotals() {
    const data = entries();
    [...rows.querySelectorAll('.bahut-row')].forEach((row, index) => {
      const entry = data.find(item => item.product === row.querySelector('.bahut-product').value) || { bottles: 0 };
      row.querySelector('.bahut-bottles').textContent = `${entry.bottles} bouteille${entry.bottles > 1 ? 's' : ''}`;
    });
    const crates = data.reduce((sum, entry) => sum + entry.crates, 0);
    const bottles = data.reduce((sum, entry) => sum + entry.bottles, 0);
    total.textContent = `Total bahut : ${crates} bac${crates > 1 ? 's' : ''} plein${crates > 1 ? 's' : ''} · ${bottles} bouteille${bottles > 1 ? 's' : ''}.`;
  }

  function refresh() {
    const visible = isBahut();
    panel.classList.toggle('hidden', !visible);
    productCard.classList.toggle('hidden', visible);
    if (visible) render();
  }

  save.addEventListener('click', event => {
    if (!isBahut()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const data = entries();
    if (!data.length) { alert('Choisis au moins une catégorie de boisson pour ce bahut.'); return; }
    localStorage.setItem(key(), JSON.stringify({ entries: data, completed: true, updatedAt: new Date().toISOString() }));
    localStorage.setItem(fridgeKey(), JSON.stringify({ completed: true, manualQuantity: true, updatedAt: new Date().toISOString() }));
    document.querySelector('#rTitle').textContent = `${place.value} — ${fridge.value}`;
    document.querySelector('#rMeta').textContent = window.FUSE_INVENTORY_TIMING?.() || `Inventaire du ${new Date().toLocaleString('fr-BE')}`;
    document.querySelector('#rRows').innerHTML = data.map(entry => `<tr><td>${entry.product} — ${entry.crates} bac${entry.crates > 1 ? 's' : ''} × ${entry.size}</td><td>${entry.bottles}</td></tr>`).join('');
    document.querySelector('#report').classList.remove('hidden');
    document.querySelector('#status').textContent = 'Bahut validé localement par bacs pleins.';
    document.querySelector('#status').classList.remove('hidden');
    document.dispatchEvent(new Event('fuse:fridge-finished'));
    document.querySelector('#report').scrollIntoView();
  }, true);

  place.addEventListener('change', () => setTimeout(refresh, 0));
  fridge.addEventListener('change', refresh);
  window.addEventListener('fuse-profile-changed', refresh);
  refresh();
})();
