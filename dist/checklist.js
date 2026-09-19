(() => {
  const style = document.createElement('style');
  style.textContent = '.status-code{margin:12px 0;padding:10px 12px;border-radius:8px;font-weight:750}.status-code.green{background:#123d24;color:#91f5ae}.status-code.orange{background:#4b3210;color:#ffd084}.status-code.red{background:#4a1717;color:#ffaaa4}';
  document.head.append(style);

  const place = document.querySelector('#bar');
  const fridge = document.querySelector('#fridge');
  const shelf = document.querySelector('#shelf');
  const save = document.querySelector('#save');
  const panel = document.createElement('section');
  panel.className = 'card';
  panel.innerHTML = `<b>Contrôle de l’étage</b><p class="small">Toujours compter du premier étage, le plus haut, vers le bas. Chaque étage est validé séparément.</p>
    <div id="checks" style="display:grid;gap:8px;margin:12px 0"><div>○ Photo initiale prise</div><div>○ Boissons comptées</div><div>○ Étage validé</div></div>
    <div id="stateSummary" class="status-code orange">● Étape à contrôler.</div>
    <label>Quantité de boissons<select id="quantityState"><option value="ok">Quantité correcte</option><option value="missing">Boissons manquantes</option><option value="extra">Boissons en trop</option><option value="mixed">Boissons manquantes et en trop</option></select></label>
    <label>Alignement des lignes<select id="alignmentState"><option value="straight">Lignes droites</option><option value="crooked">Lignes de travers</option></select></label>
    <label id="issueLabel" class="hidden">Détail des écarts<input id="issue" placeholder="Ex. 3 Jupiler manquantes, ligne Coca de travers"></label>
    <label>Statut de résolution<select id="resolution"><option value="open">À corriger</option><option value="corrected">Corrigé</option><option value="validated">Validé tel quel</option></select></label>`;
  save.before(panel);

  const checks = panel.querySelector('#checks').children;
  const quantity = panel.querySelector('#quantityState');
  const alignment = panel.querySelector('#alignmentState');
  const resolution = panel.querySelector('#resolution');
  const issue = panel.querySelector('#issue');
  const issueLabel = panel.querySelector('#issueLabel');
  const summary = panel.querySelector('#stateSummary');
  const isBar = () => place.value.startsWith('Bar ');
  const isBahut = () => /^Bahut\b/i.test(fridge.value);
  const hasShelves = () => isBar() && !isBahut();
  const shelfKey = name => `fuse-shelf-${place.value}-${fridge.value}-${name}`;
  const fridgeKey = () => `fuse-check-${place.value}-${fridge.value}`;
  const shelfNames = () => [...shelf.options].map(option => option.value);
  const getShelf = name => { try { return JSON.parse(localStorage.getItem(shelfKey(name))); } catch { return null; } };
  const fridgeDone = () => hasShelves() && shelfNames().every(name => getShelf(name)?.completed);
  const counted = () => [...document.querySelector('#lines').children].some(line => line.querySelector('input')?.value.trim());
  const currentComplete = () => (quantity.value === 'ok' && alignment.value === 'straight') || resolution.value === 'corrected' || resolution.value === 'validated';

  function restoreShelf() {
    const previous = getShelf(shelf.value);
    quantity.value = previous?.quantity || 'ok';
    alignment.value = previous?.alignment || 'straight';
    resolution.value = previous?.resolution || 'open';
    issue.value = previous?.issue || '';
  }
  function refresh() {
    panel.classList.toggle('hidden', !hasShelves());
    if (!hasShelves()) return;
    const saved = getShelf(shelf.value);
    checks[0].textContent = document.querySelector('#photo').style.display === 'block' ? '✓ Photo initiale prise' : '○ Photo initiale prise';
    checks[1].textContent = saved?.counted ? '✓ Boissons comptées' : '○ Boissons comptées';
    checks[2].textContent = saved?.completed ? `✓ ${shelf.value} validé` : `○ ${shelf.value} à valider`;
    const hasError = quantity.value !== 'ok' || alignment.value !== 'straight';
    issueLabel.classList.toggle('hidden', !hasError);
    if (fridgeDone()) {
      summary.className = 'status-code green';
      summary.textContent = `✓ Frigo validé : ${shelfNames().length}/${shelfNames().length} étages terminés.`;
    } else if (hasError && resolution.value === 'open') {
      summary.className = quantity.value === 'ok' ? 'status-code orange' : 'status-code red';
      summary.textContent = quantity.value === 'ok' ? '● Orange : lignes de travers.' : '● Rouge : écart à corriger.';
    } else {
      const completed = shelfNames().filter(name => getShelf(name)?.completed).length;
      summary.className = 'status-code orange';
      summary.textContent = `● ${completed}/${shelfNames().length} étages validés pour ce frigo.`;
    }
  }
  function changeShelf() { restoreShelf(); refresh(); }
  [quantity, alignment, resolution].forEach(input => input.addEventListener('change', refresh));
  shelf.addEventListener('change', changeShelf);
  place.addEventListener('change', () => setTimeout(changeShelf, 0));
  fridge.addEventListener('change', () => setTimeout(changeShelf, 0));
  document.querySelector('#cameraInput').addEventListener('change', refresh);
  document.querySelector('#fileInput').addEventListener('change', refresh);
  save.addEventListener('click', () => setTimeout(() => {
    if (!isBar() || !counted()) return;
    if (isBahut()) {
      localStorage.setItem(fridgeKey(), JSON.stringify({ completed: true, manualQuantity: true, updatedAt: new Date().toISOString() }));
      document.dispatchEvent(new Event('fuse:fridge-finished'));
      return;
    }
    const completed = currentComplete();
    localStorage.setItem(shelfKey(shelf.value), JSON.stringify({ quantity: quantity.value, alignment: alignment.value, resolution: resolution.value, issue: issue.value, counted: true, completed, updatedAt: new Date().toISOString() }));
    const allDone = fridgeDone();
    localStorage.setItem(fridgeKey(), JSON.stringify({ completed: allDone, updatedAt: new Date().toISOString() }));
    document.dispatchEvent(new Event('fuse:fridge-finished'));
    refresh();
  }, 0));
  restoreShelf();
  refresh();
})();
