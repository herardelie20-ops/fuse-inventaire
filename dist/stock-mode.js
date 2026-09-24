(() => {
  const place = document.querySelector('#bar');
  const selector = document.querySelector('#fridge');
  const lines = document.querySelector('#lines');
  const save = document.querySelector('#save');
  if (!place || !selector || !lines || !save) return;

  const productCard = lines.closest('.card');
  const preview = document.querySelector('#preview');
  const photoCard = preview && preview.closest('.card');
  const panel = document.createElement('section');
  panel.className = 'card hidden stock-panel';
  panel.innerHTML = `
    <b>Comptage du stock</b>
    <p class="small" id="stockPlanHint"></p>
    <p class="small">Ajoute plusieurs photos avant de préparer l’analyse. La saisie manuelle reste toujours disponible.</p>
    <section class="stock-photo-series">
      <b>Série photo — caisses et paquets</b>
      <label>Catégorie ou section<select id="batchCategory"></select></label>
      <p class="small" id="batchStatus">Aucune photo ajoutée.</p><p class="small">Chaque photo est un ajout distinct, même si elle ressemble à une autre. Aucune photo n’est retirée automatiquement.</p>
      <div class="actions"><button class="primary" id="batchCamera" type="button">Ajouter des photos</button><button class="secondary" id="batchImport" type="button">Importer une série</button></div>
      <input class="hidden" id="batchCameraInput" type="file" accept="image/*" capture="environment" multiple>
      <input class="hidden" id="batchImportInput" type="file" accept="image/*" multiple>
      <button class="secondary" id="batchAnalyze" type="button">Préparer l’analyse IA</button>
      <p class="small" id="batchResult"></p>
    </section>
    <section id="hangingSection" class="hidden stock-photo-series">
      <b>Bouteilles accrochées au bar</b>
      <p class="small">Une série par alcool permettra d’estimer le volume restant. Chaque photo est une bouteille distincte ; en cas de doute, l’IA demandera confirmation au lieu de l’écarter. Les photos ne sont pas ajoutées au rapport.</p>
      <label>Alcool<select id="hangingCategory"></select></label>
      <div class="actions"><button class="primary" id="hangingPhotos" type="button">Ajouter les photos</button><label>Bouteilles pleines<input id="hangingFull" type="number" min="0" inputmode="numeric" placeholder="0"></label></div>
      <div class="actions"><label>Format des pleines<select id="hangingFormat"><option value="100">1 litre</option><option value="70">70 cl</option></select></label><label>Volume entamé — cl<input id="hangingCl" type="number" min="0" step="0.1" inputmode="decimal" placeholder="0"></label></div>
      <input class="hidden" id="hangingInput" type="file" accept="image/*" capture="environment" multiple>
      <p class="small" id="hangingStatus"></p>
      <div class="actions"><button class="secondary" id="hangingAnalyze" type="button">Préparer l’analyse alcool</button><button class="primary" id="hangingValidate" type="button">Valider manuellement</button></div>
      <p class="small" id="hangingResult"></p>
    </section>
    <div id="stockRows"></div><button class="secondary" id="addStock" type="button">+ Ajouter une boisson</button>`;
  save.before(panel);

  const q = id => panel.querySelector(id);
  const stockPlans = {
    'Stock Bar 1 - Main room': "Tonic · Coca-Cola · Jus d'orange · Jus de pomme · Eau plate · Eau pétillante · Redbull (classique, rouge, vert et Zero) · Bières spéciales sous la pompe : Corona · Duvel · Salitos · Jupiler Zero"
  };
  const rows = q('#stockRows');
  const isStock = () => !place.value.startsWith('Bar ');
  const isInternalBarStock = () => place.value.startsWith('Stock Bar ');
  const packSize = product => window.FUSE_PACK_SIZES && window.FUSE_PACK_SIZES[product];
  const currentProducts = () => [...selector.options].map(option => option.text).filter(name => name && !name.includes('Liste'));
  const productKey = product => `fuse-stock-${place.value}-${product}`;
  const hangingKey = product => `fuse-hanging-${place.value}-${product}`;
  const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  let activePlace = '';
  let batchFiles = {};
  let hangingFiles = {};

  function labelFor(product) {
    const size = packSize(product);
    return size ? `${product} (${size})` : product;
  }

  function updateBatch() {
    const category = q('#batchCategory').value;
    const count = (batchFiles[category] || []).length;
    q('#batchStatus').textContent = count ? `${count} photo${count > 1 ? 's' : ''} prête${count > 1 ? 's' : ''} à analyser pour « ${category} ».` : 'Aucune photo ajoutée pour cette catégorie.';
  }

  function selectedHanging() { return q('#hangingCategory').value; }
  function updateHanging() {
    const product = selectedHanging();
    const count = (hangingFiles[product] || []).length;
    const saved = read(hangingKey(product));
    q('#hangingStatus').textContent = count ? `${count} photo${count > 1 ? 's' : ''} ajoutée${count > 1 ? 's' : ''} pour ${product}.` : 'Aucune photo ajoutée pour cet alcool.';
    q('#hangingFull').value = saved && saved.full !== undefined ? saved.full : '';
    q('#hangingFormat').value = saved && saved.format ? saved.format : '100';
    q('#hangingCl').value = saved && saved.cl !== undefined ? saved.cl : '';
    if (saved && saved.validated) {
      const full = Number(saved.full || 0);
      const format = Number(saved.format || 100);
      const partial = Number(saved.cl || 0);
      const fullText = full ? `${full} bouteille${full > 1 ? 's' : ''} pleine${full > 1 ? 's' : ''} × ${format === 100 ? '1 L' : '70 cl'}` : '';
      const partialText = partial ? `${partial} cl entamés` : '';
      q('#hangingResult').textContent = `Validé manuellement : ${[fullText, partialText].filter(Boolean).join(' + ') || 'quantité à compléter'}.`;
    } else q('#hangingResult').textContent = '';
  }

  function addRow(product = '', data = null) {
    const saved = data || (product && read(productKey(product))) || {};
    const row = document.createElement('article');
    row.className = 'stock-row';
    row.innerHTML = `<label>Boisson<input class="stock-name" list="fuseProducts" value="${product.replace(/"/g, '&quot;')}"></label><label>Complets<input class="stock-full" type="number" min="0" inputmode="numeric" placeholder="0" value="${saved.full ?? ''}"></label><label>Entamé<input class="stock-open" type="number" min="0" inputmode="numeric" placeholder="0" value="${saved.open ?? ''}"></label><span class="pack-note"></span><button class="secondary stock-validate" type="button">${saved.validated ? 'Validé' : 'Valider'}</button>`;
    rows.append(row);
    const name = row.querySelector('.stock-name');
    const note = row.querySelector('.pack-note');
    const validate = row.querySelector('.stock-validate');
    const refresh = () => { note.textContent = packSize(name.value) ? `bac / paquet de ${packSize(name.value)}` : 'quantité unitaire'; };
    refresh();
    name.addEventListener('input', refresh);
    if (saved.validated) row.classList.add('validated');
    validate.addEventListener('click', () => {
      const productName = name.value.trim();
      if (!productName) return;
      write(productKey(productName), { full: row.querySelector('.stock-full').value, open: row.querySelector('.stock-open').value, validated: true, updatedAt: new Date().toISOString() });
      row.classList.add('validated');
      validate.textContent = 'Validé';
      window.dispatchEvent(new CustomEvent('fuse:stock-product-finished', { detail: { place: place.value, product: productName } }));
    });
  }

  function renderRows() {
    rows.innerHTML = '';
    currentProducts().sort((a, b) => a.localeCompare(b, 'fr')).forEach(product => addRow(product));
  }

  function updateMode() {
    const stock = isStock();
    panel.classList.toggle('hidden', !stock);
    productCard.classList.toggle('hidden', stock);
    if (photoCard) photoCard.classList.toggle('hidden', stock);
    if (!stock) return;
    q('#stockPlanHint').textContent = stockPlans[place.value] ? `Plan de stock commun à Fuse et La Démence : ${stockPlans[place.value]}.` : '';
    if (activePlace !== place.value) {
      activePlace = place.value;
      batchFiles = {};
      hangingFiles = {};
      q('#batchResult').textContent = '';
      q('#hangingResult').textContent = '';
      renderRows();
    }
    q('#hangingSection').classList.toggle('hidden', !isInternalBarStock());
    const products = currentProducts().sort((a, b) => a.localeCompare(b, 'fr'));
    q('#batchCategory').innerHTML = ['Toutes catégories — tri IA', ...products].map(product => `<option>${product}</option>`).join('');
    q('#hangingCategory').innerHTML = (window.FUSE_SPIRITS || []).map(product => `<option>${product}</option>`).join('');
    updateBatch(); updateHanging();
  }

  q('#batchCamera').addEventListener('click', () => q('#batchCameraInput').click());
  q('#batchImport').addEventListener('click', () => q('#batchImportInput').click());
  q('#batchCategory').addEventListener('change', updateBatch);
  [q('#batchCameraInput'), q('#batchImportInput')].forEach(input => input.addEventListener('change', () => { const category = q('#batchCategory').value; batchFiles[category] = [...(batchFiles[category] || []), ...input.files]; input.value = ''; q('#batchResult').textContent = ''; updateBatch(); }));
  q('#batchAnalyze').addEventListener('click', () => { const category = q('#batchCategory').value; const count = (batchFiles[category] || []).length; q('#batchResult').textContent = count ? `Série prête : ${count} photo${count > 1 ? 's' : ''}, toutes comptées séparément. L’IA classera ensuite le total par catégorie ; une image similaire sera soumise à confirmation, jamais ignorée.` : 'Ajoute au moins une photo pour préparer une série.'; });
  q('#addStock').addEventListener('click', () => addRow());

  q('#hangingCategory').addEventListener('change', updateHanging);
  q('#hangingPhotos').addEventListener('click', () => q('#hangingInput').click());
  q('#hangingInput').addEventListener('change', () => { const product = selectedHanging(); hangingFiles[product] = [...(hangingFiles[product] || []), ...q('#hangingInput').files]; q('#hangingInput').value = ''; q('#hangingResult').textContent = ''; updateHanging(); });
  q('#hangingAnalyze').addEventListener('click', () => { const count = (hangingFiles[selectedHanging()] || []).length; q('#hangingResult').textContent = count ? `Série prête : ${count} bouteille${count > 1 ? 's' : ''} à analyser séparément. Le résultat regroupera ensuite les volumes par alcool ; aucune photo similaire ne sera déduite sans ta confirmation.` : 'Ajoute au moins une photo de la bouteille.'; });
  q('#hangingValidate').addEventListener('click', () => { const product = selectedHanging(); const full = q('#hangingFull').value; const format = q('#hangingFormat').value; const cl = q('#hangingCl').value; write(hangingKey(product), { full, format, cl, validated: true, updatedAt: new Date().toISOString() }); updateHanging(); });

  // Le rapport de stock reprend uniquement les résultats, jamais les photos source.
  save.addEventListener('click', event => {
    if (!isStock()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const entries = [...rows.querySelectorAll('.stock-row')].map(row => ({
      name: row.querySelector('.stock-name').value.trim(),
      full: row.querySelector('.stock-full').value,
      open: row.querySelector('.stock-open').value,
      validated: row.classList.contains('validated')
    })).filter(entry => entry.name && (entry.full !== '' || entry.open !== '' || entry.validated));
    if (isInternalBarStock()) {
      (window.FUSE_SPIRITS || []).forEach(product => {
        const result = read(hangingKey(product));
        if (result && result.validated) {
          const full = Number(result.full || 0), format = Number(result.format || 100), partial = Number(result.cl || 0);
          const fullText = full ? `${full} × ${format === 100 ? '1 L' : '70 cl'}` : '';
          const partialText = partial ? `${partial} cl entamés` : '';
          entries.push({ name: `${product} — bouteilles accrochées`, full: [fullText, partialText].filter(Boolean).join(' + ') || '—', open: 'validé' });
        }
      });
    }
    if (!entries.length) { alert('Valide ou encode au moins une boisson du stock.'); return; }
    document.querySelector('#rTitle').textContent = place.value;
    document.querySelector('#rMeta').textContent = window.FUSE_INVENTORY_TIMING?.() || `Inventaire du ${new Date().toLocaleString('fr-BE')}`;
    document.querySelector('#rRows').innerHTML = entries.map(entry => `<tr><td>${entry.name}</td><td>${entry.full}${entry.open !== '' ? ` / ${entry.open}` : ''}</td></tr>`).join('');
    const report = document.querySelector('#report');
    report.classList.remove('hidden');
    const status = document.querySelector('#status');
    status.textContent = 'Rapport de stock préparé localement. Les photos ne sont pas incluses.';
    status.classList.remove('hidden');
    report.scrollIntoView();
  }, true);

  place.addEventListener('change', updateMode);
  selector.addEventListener('change', () => { if (isStock()) renderRows(); });
  updateMode();
})();
