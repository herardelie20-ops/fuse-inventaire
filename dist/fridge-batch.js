(() => {
  const place = document.querySelector('#bar');
  const fridge = document.querySelector('#fridge');
  const shelf = document.querySelector('#shelf');
  const save = document.querySelector('#save');
  const individualPhotoCard = document.querySelector('#preview')?.closest('.card');
  const individualLinesCard = document.querySelector('#lines')?.closest('.card');
  const individualChecklistCard = document.querySelector('#stateSummary')?.closest('.card');
  if (!place || !fridge || !shelf || !save) return;
  const manualStyle = document.createElement('style');
  manualStyle.textContent = '.manual-shelf-editor{margin-top:16px;padding-top:14px;border-top:1px solid #444}.manual-shelf{margin:10px 0;border:1px solid #4d4d4d;border-radius:10px;overflow:hidden}.manual-shelf summary{display:flex;justify-content:space-between;gap:10px;padding:12px;cursor:pointer;font-weight:800}.manual-shelf summary small{color:#cfcfcf;font-weight:500;text-align:right}.manual-shelf-body{padding:0 12px 12px;border-top:1px solid #444}.manual-catalogue{max-height:220px;overflow:auto;border:1px solid #555;border-radius:8px;padding:8px;margin:8px 0}.manual-category{margin:7px 0}.manual-category>b{display:block;font-size:.78rem;color:#cfcfcf;margin-bottom:5px}.manual-category>div{display:flex;flex-wrap:wrap;gap:6px}.manual-product{padding:6px 8px;border-radius:999px;background:#242424;color:#fff;font-size:.78rem}.manual-drink-lines{display:grid;gap:8px;margin:10px 0}.manual-drink-line{display:grid;grid-template-columns:1fr 76px 34px;gap:8px}.manual-drink-line input{min-width:0}.manual-remove{background:#333;color:#fff;padding:8px}.manual-add-line{width:100%;margin:2px 0 8px}.manual-save-shelf{width:100%}.manual-save-note{margin:8px 0 0;min-height:1.2em}';
  document.head.append(manualStyle);

  const panel = document.createElement('section');
  panel.className = 'card fridge-batch hidden';
  panel.innerHTML = `
    <b>Série complète du frigo</b>
    <p class="small">Prends les photos dans l’ordre : étage 1 (tout en haut), puis les étages inférieurs. Une seule analyse regroupera le décompte par étage.</p>
    <p class="small" id="batchProgress"></p>
    <div class="actions"><button class="primary" id="nextFridgePhoto" type="button">Prendre la photo suivante</button><button class="secondary" id="importFridgePhotos" type="button">Importer les photos</button></div>
    <input class="hidden" id="nextFridgeInput" type="file" accept="image/*" capture="environment">
    <input class="hidden" id="importFridgeInput" type="file" accept="image/*" multiple>
    <button class="secondary" id="analyzeFridge" type="button">Analyser le frigo</button>
    <p class="small" id="analysisNotice"></p>
    <div id="floorResults" class="hidden"></div>
    <button class="primary hidden" id="validateFridge" type="button">Valider le résultat du frigo</button>
    <section class="manual-validation"><b>Validation manuelle</b><p class="small">Disponible même sans photo ou malgré un écart. Elle ne supprime pas les anomalies déjà enregistrées dans le rapport.</p><div class="actions"><button class="secondary" id="manualShelf" type="button">Valider cet étage</button><button class="primary" id="manualFridge" type="button">Valider tout le frigo</button></div><p class="small" id="manualNote"></p></section>
    <section class="manual-shelf-editor" id="manualShelfEditor"><b>Saisie manuelle par étage</b><p class="small">Ouvre un étage, cherche une boisson ou choisis-la dans le catalogue, puis indique la quantité présente sur chaque ligne.</p><div id="manualShelfList"></div></section>
    <section class="manual-validation"><b>Reprendre un contrôle</b><p class="small">Tu peux refaire une photo ou recommencer un relevé, même après validation.</p><div class="actions"><button class="secondary" id="redoShelf" type="button">Refaire cet étage</button><button class="secondary" id="redoFridge" type="button">Reprendre tout le frigo</button></div><p class="small" id="redoNote"></p></section>
    <section class="manual-validation"><b>Remise à zéro</b><p class="small">Efface entièrement le relevé, les erreurs et les validations de ce frigo pour repartir de zéro.</p><button class="secondary" id="resetFridge" type="button">Réinitialiser ce frigo</button><p class="small" id="resetNote"></p></section>
    <p id="fridgeState" class="status-code orange">● À photographier et contrôler.</p>`;
  individualPhotoCard.before(panel);

  const q = id => panel.querySelector(id);
  const isBar = () => place.value.startsWith('Bar ');
  const isBahut = () => /^Bahut\b/i.test(fridge.value);
  const fridgeKey = () => `fuse-check-${place.value}-${fridge.value}`;
  const shelfKey = name => `fuse-shelf-${place.value}-${fridge.value}-${name}`;
  const shelfNames = () => [...shelf.options].map(option => option.value);
  const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
  let currentKey = '';
  let files = [];
  let retakeShelf = '';

  const catalogue = () => [
    ['Soft drinks', window.FUSE_SOFTS || []], ['Bières', window.FUSE_BEERS || []], ['Vins et spéciaux', window.FUSE_FRIDGE_SPECIALS || []], ['Spiritueux', window.FUSE_SPIRITS || []], ['Sirops', window.FUSE_SYRUPS || []]
  ].map(([category, products]) => [category, [...products].sort((a, b) => a.localeCompare(b, 'fr'))]);
  const lineMarkup = (item = {}) => `<div class="manual-drink-line"><input class="manual-drink-name" value="${String(item.name || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" placeholder="Boisson"><input class="manual-drink-quantity" type="number" min="0" inputmode="numeric" value="${item.quantity ?? ''}" placeholder="0"><button type="button" class="manual-remove" aria-label="Supprimer">×</button></div>`;
  function renderManualShelves() {
    const list = q('#manualShelfList');
    if (!list) return;
    list.innerHTML = shelfNames().map(name => {
      const record = read(shelfKey(name)) || {};
      const entries = record.referenceLines || [];
      const total = entries.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      const groups = catalogue().map(([category, products]) => `<section class="manual-category"><b>${category}</b><div>${products.map(product => `<button type="button" class="manual-product" data-product="${product}">${product}</button>`).join('')}</div></section>`).join('');
      return `<details class="manual-shelf" data-shelf="${name}"><summary><span>${label(name)}</span><small>${entries.length ? `${entries.length} ligne(s) · ${total} boisson(s)` : 'À configurer'}</small></summary><div class="manual-shelf-body"><label>Recherche rapide<input class="manual-search" type="search" placeholder="Rechercher une boisson"></label><div class="manual-catalogue">${groups}</div><div class="manual-drink-lines">${entries.length ? entries.map(lineMarkup).join('') : lineMarkup()}</div><button type="button" class="secondary manual-add-line">+ Ligne de boisson</button><button type="button" class="primary manual-save-shelf">Enregistrer cet étage</button><p class="small manual-save-note"></p></div></details>`;
    }).join('');
  }

  function label(name) {
    const drink = window.FUSE_EXPECTED_DRINK?.(window.FUSE_CURRENT_PROFILE || 'fuse', place.value, fridge.value, name);
    const position = name.replace(' — haut', ' — photo 1').replace(' — bas', ' — dernière photo');
    return drink ? `${position} · ${drink}` : `${position} · à définir`;
  }
  function updateProgress() {
    const expected = shelfNames().length;
    const count = files.filter(Boolean).length;
    const nextIndex = shelfNames().findIndex((_, index) => !files[index]);
    const next = nextIndex >= 0 ? shelfNames()[nextIndex] : '';
    q('#batchProgress').textContent = `${count}/${expected} photo${count > 1 ? 's' : ''} ajoutée${count > 1 ? 's' : ''}${next ? ` · suivante : ${label(next)}` : ' · série complète.'}`;
    q('#nextFridgePhoto').disabled = !next;
  }
  function state() {
    const stored = read(fridgeKey());
    if (stored?.completed) { q('#fridgeState').className = 'status-code green'; q('#fridgeState').textContent = '✓ Frigo validé en vert.'; return; }
    if (stored?.hasIssues) { q('#fridgeState').className = 'status-code red'; q('#fridgeState').textContent = '● Rouge : erreur validée, correction nécessaire.'; return; }
    q('#fridgeState').className = files.filter(Boolean).length || stored?.inProgress ? 'status-code orange' : 'status-code pending'; q('#fridgeState').textContent = files.filter(Boolean).length || stored?.inProgress ? '● Orange : frigo en cours, analyse et validation à faire.' : '● Blanc : frigo pas encore commencé.';
  }
  function markProgress() {
    const stored = read(fridgeKey()) || {};
    if (!stored.completed) localStorage.setItem(fridgeKey(), JSON.stringify({ ...stored, completed: false, inProgress: true, updatedAt: new Date().toISOString() }));
    document.dispatchEvent(new Event('fuse:fridge-progress'));
  }
  function finishIfAllShelvesDone() {
    const allDone = shelfNames().every(name => {
      const record = read(shelfKey(name));
      return record?.completed && Array.isArray(record.referenceLines) && record.referenceLines.length > 0;
    });
    localStorage.setItem(fridgeKey(), JSON.stringify({ completed: allDone, inProgress: !allDone, manualValidated: allDone, editValidated: allDone, updatedAt: new Date().toISOString() }));
    document.dispatchEvent(new Event(allDone ? 'fuse:fridge-finished' : 'fuse:fridge-progress'));
    return allDone;
  }
  function results() {
    const floors = shelfNames();
    q('#floorResults').innerHTML = floors.map((name, index) => `
      <article class="floor-result"><b>${label(name)}</b><span class="floor-photo">Photo ${index + 1}: ${files[index] ? 'ajoutée' : 'manquante'}</span>
      <label>Bouteilles comptées<input class="floor-count" type="number" min="0" inputmode="numeric" placeholder="0"></label>
      <label>Quantités<select class="floor-status"><option value="ok">Quantité correcte</option><option value="missing">Boissons manquantes</option><option value="extra">Boissons en trop</option><option value="both">Manquantes et en trop</option></select></label>
      <div class="floor-detail hidden"><div class="actions"><label>Manquantes<input class="floor-missing" type="number" min="0" inputmode="numeric" placeholder="0"></label><label>En trop<input class="floor-extra" type="number" min="0" inputmode="numeric" placeholder="0"></label></div><label>Détail<input class="floor-issue" placeholder="Ex. 2 Coca-Cola manquantes"></label></div>
      <label>Alignement<select class="floor-alignment"><option value="straight">Lignes droites</option><option value="crooked">Lignes de travers</option></select></label>
      <label class="floor-resolution hidden">Correction<select class="floor-correction"><option value="pending">À corriger</option><option value="corrected">Corrigé par la personne qui compte</option></select></label></article>`).join('');
    q('#floorResults').classList.remove('hidden'); q('#validateFridge').classList.remove('hidden');
    q('#floorResults').querySelectorAll('.floor-status, .floor-alignment').forEach(control => control.addEventListener('change', () => {
      const row = control.closest('.floor-result');
      const problem = row.querySelector('.floor-status').value !== 'ok' || row.querySelector('.floor-alignment').value === 'crooked';
      row.querySelector('.floor-detail').classList.toggle('hidden', row.querySelector('.floor-status').value === 'ok');
      row.querySelector('.floor-resolution').classList.toggle('hidden', !problem);
    }));
  }
  function refresh() {
    const enabled = isBar() && !isBahut();
    const manualOnly = isBar() && isBahut();
    panel.classList.toggle('hidden', !enabled);
    if (individualPhotoCard) individualPhotoCard.classList.toggle('hidden', enabled || manualOnly);
    if (individualLinesCard) individualLinesCard.classList.toggle('hidden', enabled);
    if (individualChecklistCard) individualChecklistCard.classList.toggle('hidden', enabled);
    if (!enabled) return;
    const key = `${place.value}|${fridge.value}|${shelfNames().join('|')}`;
    if (key !== currentKey) { currentKey = key; files = []; retakeShelf = ''; q('#floorResults').classList.add('hidden'); q('#validateFridge').classList.add('hidden'); q('#analysisNotice').textContent = ''; }
    renderManualShelves();
    updateProgress(); state();
  }
  q('#nextFridgePhoto').addEventListener('click', () => q('#nextFridgeInput').click());
  q('#nextFridgeInput').addEventListener('change', () => { if (q('#nextFridgeInput').files[0]) { const selectedIndex = retakeShelf ? shelfNames().indexOf(retakeShelf) : shelfNames().findIndex((_, position) => !files[position]); files[selectedIndex >= 0 ? selectedIndex : files.length] = q('#nextFridgeInput').files[0]; retakeShelf = ''; markProgress(); } q('#nextFridgeInput').value = ''; q('#analysisNotice').textContent = ''; updateProgress(); state(); });
  q('#importFridgePhotos').addEventListener('click', () => q('#importFridgeInput').click());
  q('#importFridgeInput').addEventListener('change', () => { files = [...q('#importFridgeInput').files].slice(0, shelfNames().length); if (files.length) markProgress(); q('#importFridgeInput').value = ''; q('#analysisNotice').textContent = ''; updateProgress(); state(); });
  q('#analyzeFridge').addEventListener('click', () => {
    const expected = shelfNames().length;
    if (files.filter(Boolean).length !== expected) { q('#analysisNotice').textContent = `Il faut ${expected} photos pour ce frigo, dans l’ordre du haut vers le bas.`; return; }
    q('#analysisNotice').textContent = 'Série prête pour l’analyse IA. En attendant la connexion du modèle de vision, confirme le résultat de chaque étage ci-dessous.';
    results();
  });
  q('#validateFridge').addEventListener('click', () => {
    const floorRows = [...q('#floorResults').querySelectorAll('.floor-result')];
    if (floorRows.length !== shelfNames().length) return;
    let hasIssues = false;
    floorRows.forEach((row, index) => {
      const count = Number(row.querySelector('.floor-count').value || 0);
      const status = row.querySelector('.floor-status').value;
      const alignment = row.querySelector('.floor-alignment').value;
      const issue = row.querySelector('.floor-issue').value.trim();
      const missing = Number(row.querySelector('.floor-missing').value || 0);
      const extra = Number(row.querySelector('.floor-extra').value || 0);
      const correction = row.querySelector('.floor-correction').value;
      const problem = status !== 'ok' || alignment === 'crooked';
      const unresolved = problem && correction !== 'corrected';
      hasIssues ||= unresolved;
      localStorage.setItem(shelfKey(shelfNames()[index]), JSON.stringify({ ...read(shelfKey(shelfNames()[index])), count, quantity: status, alignment, correction, issue, missing, extra, hadIssue: problem, analysisSource: 'ai', counted: true, completed: !unresolved, updatedAt: new Date().toISOString() }));
    });
    localStorage.setItem(fridgeKey(), JSON.stringify({ completed: !hasIssues, hasIssues, inProgress: hasIssues, updatedAt: new Date().toISOString() }));
    q('#analysisNotice').textContent = hasIssues ? 'Le frigo reste orange : les étages signalés doivent être corrigés.' : 'Le décompte est validé : le frigo devient vert.';
    document.dispatchEvent(new Event('fuse:fridge-finished'));
    state();
  });
  q('#manualShelf').addEventListener('click', () => {
    const existing = read(shelfKey(shelf.value)) || {};
    localStorage.setItem(shelfKey(shelf.value), JSON.stringify({ ...existing, quantity: existing.quantity || 'manual', alignment: 'manual', hadIssue: false, analysisSource: 'manual', counted: true, completed: true, manualValidated: true, updatedAt: new Date().toISOString() }));
    const allDone = finishIfAllShelvesDone();
    q('#manualNote').textContent = allDone ? 'Étages tous validés manuellement : le frigo est vert.' : `${shelf.value} est validé manuellement. Les autres étages restent à faire.`;
    state();
  });
  q('#manualFridge').addEventListener('click', () => {
    shelfNames().forEach(name => {
      const existing = read(shelfKey(name)) || {};
      localStorage.setItem(shelfKey(name), JSON.stringify({ ...existing, quantity: existing.quantity || 'manual', alignment: 'manual', hadIssue: false, analysisSource: 'manual', counted: true, completed: true, manualValidated: true, updatedAt: new Date().toISOString() }));
    });
    localStorage.setItem(fridgeKey(), JSON.stringify({ completed: true, inProgress: false, manualValidated: true, updatedAt: new Date().toISOString() }));
    q('#manualNote').textContent = 'Frigo validé manuellement en vert.';
    document.dispatchEvent(new Event('fuse:fridge-finished'));
    state();
  });
  q('#manualShelfList').addEventListener('click', event => {
    const floor = event.target.closest('.manual-shelf');
    if (!floor) return;
    const lines = floor.querySelector('.manual-drink-lines');
    if (event.target.closest('.manual-product')) {
      lines.insertAdjacentHTML('beforeend', lineMarkup({ name: event.target.closest('.manual-product').dataset.product }));
    }
    if (event.target.closest('.manual-add-line')) lines.insertAdjacentHTML('beforeend', lineMarkup());
    if (event.target.closest('.manual-remove')) event.target.closest('.manual-drink-line').remove();
    if (event.target.closest('.manual-save-shelf')) {
      const name = floor.dataset.shelf;
      const referenceLines = [...lines.querySelectorAll('.manual-drink-line')].map(row => ({ name: row.querySelector('.manual-drink-name').value.trim(), quantity: Number(row.querySelector('.manual-drink-quantity').value || 0) })).filter(item => item.name);
      const note = floor.querySelector('.manual-save-note');
      if (!referenceLines.length) { note.textContent = 'Ajoute au moins une boisson avant d’enregistrer.'; return; }
      const existing = read(shelfKey(name)) || {};
      const total = referenceLines.reduce((sum, item) => sum + item.quantity, 0);
      localStorage.setItem(shelfKey(name), JSON.stringify({ ...existing, referenceLines, count: total, quantity: 'manual', alignment: 'manual', hadIssue: false, analysisSource: 'manual', counted: true, completed: true, manualValidated: true, referenceSavedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
      finishIfAllShelvesDone();
      note.textContent = `${referenceLines.length} ligne(s) enregistrée(s) · ${total} boisson(s). Le frigo deviendra vert dès que tous les étages seront enregistrés.`;
      floor.querySelector('summary small').textContent = `${referenceLines.length} ligne(s) · ${total} boisson(s)`;
      document.dispatchEvent(new Event('fuse:fridge-progress'));
      state();
    }
  });
  q('#manualShelfList').addEventListener('input', event => {
    if (!event.target.matches('.manual-search')) return;
    const query = event.target.value.trim().toLocaleLowerCase('fr');
    const floor = event.target.closest('.manual-shelf');
    floor.querySelectorAll('.manual-product').forEach(button => { button.hidden = !!query && !button.textContent.toLocaleLowerCase('fr').includes(query); });
    floor.querySelectorAll('.manual-category').forEach(group => { group.hidden = ![...group.querySelectorAll('.manual-product')].some(button => !button.hidden); });
  });
  document.addEventListener('fuse:open-manual-shelves', () => {
    renderManualShelves();
    const first = q('.manual-shelf'); if (first) { first.open = true; first.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
  q('#redoShelf').addEventListener('click', () => {
    const position = shelfNames().indexOf(shelf.value);
    if (position >= 0) files[position] = undefined;
    retakeShelf = shelf.value;
    const existing = read(shelfKey(shelf.value)) || {};
    localStorage.setItem(shelfKey(shelf.value), JSON.stringify({ ...existing, completed: false, inProgress: true, rechecking: true, updatedAt: new Date().toISOString() }));
    localStorage.setItem(fridgeKey(), JSON.stringify({ completed: false, inProgress: true, rechecking: true, updatedAt: new Date().toISOString() }));
    q('#floorResults').classList.add('hidden'); q('#validateFridge').classList.add('hidden');
    q('#redoNote').textContent = `${shelf.value} est repassé en contrôle. La prochaine photo prise remplacera la précédente pour cet étage.`;
    document.dispatchEvent(new Event('fuse:fridge-progress'));
    updateProgress(); state();
  });
  q('#redoFridge').addEventListener('click', () => {
    files = [];
    retakeShelf = '';
    shelfNames().forEach(name => {
      const existing = read(shelfKey(name)) || {};
      localStorage.setItem(shelfKey(name), JSON.stringify({ ...existing, completed: false, inProgress: true, rechecking: true, updatedAt: new Date().toISOString() }));
    });
    localStorage.setItem(fridgeKey(), JSON.stringify({ completed: false, inProgress: true, rechecking: true, updatedAt: new Date().toISOString() }));
    q('#floorResults').classList.add('hidden'); q('#validateFridge').classList.add('hidden');
    q('#redoNote').textContent = 'Le frigo est repassé en contrôle. Reprends les photos du haut vers le bas.';
    document.dispatchEvent(new Event('fuse:fridge-progress'));
    updateProgress(); state();
  });
  q('#resetFridge').addEventListener('click', () => {
    const language = localStorage.getItem('fuse-language') || 'fr';
    const messages = {
      fr: `Réinitialiser entièrement ${fridge.value} ? Les étages, photos et validations de ce frigo seront effacés.`,
      nl: `${fridge.value} volledig resetten? De niveaus, foto's en validaties van deze koelkast worden gewist.`,
      en: `Completely reset ${fridge.value}? This fridge’s shelves, photos, and validations will be erased.`
    };
    if (!window.confirm(messages[language] || messages.fr)) return;
    files = [];
    retakeShelf = '';
    shelfNames().forEach(name => localStorage.removeItem(shelfKey(name)));
    localStorage.removeItem(fridgeKey());
    q('#nextFridgeInput').value = '';
    q('#importFridgeInput').value = '';
    q('#floorResults').classList.add('hidden');
    q('#validateFridge').classList.add('hidden');
    q('#analysisNotice').textContent = '';
    q('#manualNote').textContent = '';
    q('#redoNote').textContent = '';
    q('#resetNote').textContent = 'Frigo réinitialisé : il est de nouveau blanc et prêt pour un nouvel inventaire.';
    document.dispatchEvent(new Event('fuse:fridge-progress'));
    document.dispatchEvent(new Event('fuse:fridge-reset'));
    updateProgress();
    state();
  });
  place.addEventListener('change', () => setTimeout(refresh, 0));
  fridge.addEventListener('change', () => setTimeout(refresh, 0));
  window.addEventListener('fuse-profile-changed', refresh);
  refresh();
})();
