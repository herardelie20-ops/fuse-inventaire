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
    <label id="issueLabel" class="hidden">Détail des écarts<input id="issue" placeholder="Ex. 3 Jupiler manquantes"></label>`;
  save.before(panel);

  const checks = panel.querySelector('#checks').children;
  const quantity = panel.querySelector('#quantityState');
  const issue = panel.querySelector('#issue');
  const issueLabel = panel.querySelector('#issueLabel');
  const summary = panel.querySelector('#stateSummary');
  const isBar = () => place.value.startsWith('Bar ');
  const isBahut = () => /\bBahut\b/i.test(fridge.value) && !(place.value === 'Bar 3 - Motion' && fridge.value === 'Frigo 11 (Bahut)');
  const hasShelves = () => isBar() && !isBahut();
  const shelfKey = name => `fuse-shelf-${place.value}-${fridge.value}-${name}`;
  const fridgeKey = () => `fuse-check-${place.value}-${fridge.value}`;
  const shelfNames = () => [...shelf.options].map(option => option.value);
  const getShelf = name => { try { return JSON.parse(localStorage.getItem(shelfKey(name))); } catch { return null; } };
  const fridgeDone = () => hasShelves() && shelfNames().every(name => getShelf(name)?.completed);
  const counted = () => [...document.querySelector('#lines').children].some(line => line.querySelector('input')?.value.trim());
  const currentComplete = () => true;

  function restoreShelf() {
    const previous = getShelf(shelf.value);
    quantity.value = previous?.quantity || 'ok';
    issue.value = previous?.issue || '';
  }
  function refresh() {
    panel.classList.toggle('hidden', !hasShelves());
    if (!hasShelves()) return;
    const saved = getShelf(shelf.value);
    checks[0].textContent = document.querySelector('#photo').style.display === 'block' ? '✓ Photo initiale prise' : '○ Photo initiale prise';
    checks[1].textContent = saved?.counted ? '✓ Boissons comptées' : '○ Boissons comptées';
    checks[2].textContent = saved?.completed ? `✓ ${shelf.value} validé` : `○ ${shelf.value} à valider`;
    const hasError = quantity.value !== 'ok';
    issueLabel.classList.toggle('hidden', !hasError);
    if (fridgeDone()) {
      summary.className = 'status-code green';
      summary.textContent = `✓ Frigo validé : ${shelfNames().length}/${shelfNames().length} étages terminés.`;
    } else if (hasError) {
      summary.className = 'status-code red';
      summary.textContent = '● Rouge : écart signalé.';
    } else {
      const completed = shelfNames().filter(name => getShelf(name)?.completed).length;
      summary.className = 'status-code orange';
      summary.textContent = `● ${completed}/${shelfNames().length} étages validés pour ce frigo.`;
    }
  }
  function changeShelf() { restoreShelf(); refresh(); }
  quantity.addEventListener('change', refresh);
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
    const { alignment: unusedAlignment, correction: unusedCorrection, resolution: unusedResolution, ...existing } = getShelf(shelf.value) || {};
    const completed = currentComplete();
    localStorage.setItem(shelfKey(shelf.value), JSON.stringify({ ...existing, quantity: quantity.value, issue: issue.value, hadIssue: quantity.value !== 'ok', analysisSource: 'manual', counted: true, completed, updatedAt: new Date().toISOString() }));
    const allDone = fridgeDone();
    localStorage.setItem(fridgeKey(), JSON.stringify({ completed: allDone, updatedAt: new Date().toISOString() }));
    document.dispatchEvent(new Event('fuse:fridge-finished'));
    refresh();
  }, 0));
  restoreShelf();
  refresh();
})();
