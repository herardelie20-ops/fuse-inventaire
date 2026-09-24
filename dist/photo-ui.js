(() => {
  const preview = document.querySelector('#preview');
  const message = preview.querySelector('span');
  const style = document.createElement('style');
  style.textContent = '#preview{min-height:52px;height:52px;display:flex;align-items:center;justify-content:center;padding:8px}select option{color:#fff;background:#000}.profile-demence select option{color:#000;background:#fff}#preview img{display:none!important}#barPlanCanvas{position:relative;margin-top:12px}#barPlan img{display:block;width:100%;height:auto;background:#fff;border-radius:8px}.plan-hidden-fridge{position:absolute;transform:translate(-50%,-50%);width:4.4%;height:7.2%;background:#fff;z-index:1}.fridge-marker{position:absolute;transform:translate(-50%,-50%);display:grid;place-items:center;min-width:24px;height:24px;padding:0 4px;border-radius:999px;border:0;background:#fff;color:#000;font-size:12px;line-height:1;font-weight:900;box-shadow:0 0 0 2px #000,0 1px 4px #000;z-index:2;cursor:pointer;touch-action:manipulation}.fridge-marker:focus-visible{outline:3px solid #facc15;outline-offset:2px}.fridge-marker.in-progress{background:#e87918;color:#fff;box-shadow:0 0 0 2px #fff,0 1px 4px #000}.fridge-marker.error{background:#dc2626;color:#fff;box-shadow:0 0 0 2px #fff,0 1px 4px #000}.fridge-marker.done{background:#00a94f;color:#fff;box-shadow:0 0 0 2px #fff,0 1px 4px #000}#liveBadges{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}.live-badge{border-radius:999px;background:#fff;color:#000;padding:5px 9px;font-size:.73rem;font-weight:850;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.live-badge.in-progress{background:#e87918;color:#fff}.live-badge.error{background:#dc2626;color:#fff}.live-badge.done{background:#00a94f;color:#fff}.done-select{color:#91f5ae!important;border-color:#00a94f!important}.progress-select{color:#ffd084!important;border-color:#e87918!important}.error-select{color:#ffaaa4!important;border-color:#dc2626!important}.status-code.pending{background:#fff;color:#000;border:1px solid #000}.stock-photo-series{margin:14px 0;padding:13px;border:1px solid #4c4c4c;border-radius:10px}.stock-row{display:grid;grid-template-columns:minmax(130px,1.4fr) 75px 75px minmax(90px,.8fr) auto;gap:8px;align-items:end;padding:11px 0;border-top:1px solid #333}.stock-row label{margin:0}.stock-row .pack-note{color:#cfcfcf;font-size:.78rem;padding-bottom:10px}.stock-row.validated{background:#123d24;border-radius:8px;padding:10px;margin:5px -6px}.stock-row.validated .stock-validate{background:#00a94f;color:#fff}.fridge-batch #floorResults{display:grid;gap:10px;margin-top:14px}.floor-result{border:1px solid #444;border-radius:10px;padding:12px}.floor-result b{display:block}.floor-photo{display:block;color:#cfcfcf;font-size:.78rem;margin-top:3px}@media(max-width:560px){.stock-row{grid-template-columns:1fr 1fr}.stock-row label:first-child{grid-column:1/-1}.stock-row .pack-note{padding-bottom:0}.stock-row .stock-validate{grid-column:1/-1}}';
  document.head.append(style);

  function indicatePhotoReady() {
    setTimeout(() => {
      message.style.display = 'block';
      message.textContent = '✓ Photo prête pour le comptage IA';
    }, 0);
  }

  document.querySelector('#cameraInput').addEventListener('change', indicatePhotoReady);
  document.querySelector('#fileInput').addEventListener('change', indicatePhotoReady);
})();

(() => {
  const place = document.querySelector('#bar');
  const fridge = document.querySelector('#fridge');
  const shelf = document.querySelector('#shelf');
  if (!place || !fridge || !shelf || !('indexedDB' in window)) return;

  const card = document.createElement('section');
  card.className = 'card';
  card.innerHTML = `<b>Photo d’apprentissage — étage</b><p class="small" id="trainingMeta"></p><p class="small">Prends une photo nette de cet étage uniquement. Elle est conservée hors ligne avec le lieu, le frigo, l’étage et ta validation manuelle.</p><div class="camera" id="trainingPreview"><span>Aucune photo d’apprentissage sélectionnée</span><img></div><div class="actions"><button class="primary" id="trainingCamera" type="button">Prendre la photo de l’étage</button><button class="secondary" id="trainingImport" type="button">Importer</button></div><input class="hidden" id="trainingCameraInput" type="file" accept="image/*" capture="environment"><input class="hidden" id="trainingImportInput" type="file" accept="image/*"><button class="primary" id="trainingSave" type="button">Archiver la photo validée</button><p class="small" id="trainingStatus"></p><button class="secondary" id="trainingExport" type="button">Exporter les données IA</button><p class="small" id="trainingCount"></p>`;
  shelf.closest('section')?.after(card);

  const q = id => card.querySelector(id);
  const preview = q('#trainingPreview');
  const previewImage = preview.querySelector('img');
  const previewLabel = preview.querySelector('span');
  let selectedFile = null;
  let previewUrl = '';
  const db = () => new Promise((resolve, reject) => {
    const request = indexedDB.open('fuse-training-data', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('samples', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const withStore = (mode, action) => db().then(database => new Promise((resolve, reject) => {
    const transaction = database.transaction('samples', mode);
    const request = action(transaction.objectStore('samples'));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }));
  const allSamples = () => withStore('readonly', store => store.getAll());
  const saveSample = sample => withStore('readwrite', store => store.put(sample));
  const imageData = file => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(reader.error); reader.readAsDataURL(file); });
  const shelfKey = () => `fuse-shelf-${place.value}-${fridge.value}-${shelf.value}`;
  const currentValidation = () => { try { return JSON.parse(localStorage.getItem(shelfKey())); } catch { return null; } };
  const expectedLines = () => window.FUSE_EXPECTED_LINES?.(window.FUSE_CURRENT_PROFILE || 'fuse', place.value, fridge.value, shelf.value) || [];
  const currentLines = () => currentValidation()?.referenceLines || [];
  const lineSummary = () => {
    const lines = currentLines();
    if (lines.length) return `${lines.length} ligne(s) validée(s) · ${lines.map(line => `${line.name} : ${line.quantity}`).join(' · ')}`;
    const expected = expectedLines();
    return expected.length ? `Plan prévu : ${expected.map(line => line.name).join(' · ')} · validation manuelle à enregistrer` : 'Validation manuelle à enregistrer';
  };
  const updateCount = async () => { try { q('#trainingCount').textContent = `${(await allSamples()).length} photo(s) validée(s) stockée(s) localement pour l’IA.`; } catch { q('#trainingCount').textContent = 'Stockage local indisponible sur cet appareil.'; } };
  const refresh = () => {
    q('#trainingMeta').textContent = `${place.value} · ${fridge.value} · ${shelf.value} · ${lineSummary()}`;
    updateCount();
  };
  const pick = file => {
    if (!file) return;
    selectedFile = file;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(file);
    previewImage.src = previewUrl;
    previewImage.style.display = 'block';
    previewLabel.style.display = 'none';
    q('#trainingStatus').textContent = 'Photo prête. Enregistre d’abord les lignes et quantités dans la validation manuelle, puis archive-la.';
  };
  q('#trainingCamera').addEventListener('click', () => q('#trainingCameraInput').click());
  q('#trainingImport').addEventListener('click', () => q('#trainingImportInput').click());
  q('#trainingCameraInput').addEventListener('change', event => pick(event.target.files[0]));
  q('#trainingImportInput').addEventListener('change', event => pick(event.target.files[0]));
  q('#trainingSave').addEventListener('click', async () => {
    if (!selectedFile) { q('#trainingStatus').textContent = 'Prends ou importe d’abord la photo de cet étage.'; return; }
    const lines = currentLines();
    if (!lines.length) { q('#trainingStatus').textContent = 'Enregistre d’abord la validation manuelle de cet étage : boissons et quantités par ligne.'; return; }
    const sample = {
      id: `${Date.now()}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
      place: place.value,
      fridge: fridge.value,
      shelf: shelf.value,
      profile: window.FUSE_CURRENT_PROFILE || 'fuse',
      maxBottlesPerLine: window.FUSE_MAX_BOTTLES_PER_LINE || 7,
      lines,
      photoName: selectedFile.name || 'etage.jpg',
      photoType: selectedFile.type || 'image/jpeg',
      photo: selectedFile
    };
    try {
      await saveSample(sample);
      q('#trainingStatus').textContent = 'Photo et validation archivées hors ligne. Elles seront incluses dans l’export IA.';
      selectedFile = null;
      q('#trainingCameraInput').value = ''; q('#trainingImportInput').value = '';
      refresh();
    } catch { q('#trainingStatus').textContent = 'Impossible d’archiver la photo sur cet appareil.'; }
  });
  q('#trainingExport').addEventListener('click', async () => {
    try {
      const samples = await allSamples();
      if (!samples.length) { q('#trainingStatus').textContent = 'Aucune photo validée à exporter.'; return; }
      q('#trainingStatus').textContent = 'Préparation de l’export IA…';
      const exported = await Promise.all(samples.map(async sample => ({ ...sample, photo: await imageData(sample.photo) })));
      const blob = new Blob([JSON.stringify({ format: 'fuse-training-export/v1', exportedAt: new Date().toISOString(), samples: exported }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = `fuse-ia-${new Date().toISOString().slice(0, 10)}.json`; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      q('#trainingStatus').textContent = `${samples.length} photo(s) et leurs validations ont été exportées.`;
    } catch { q('#trainingStatus').textContent = 'Impossible de préparer l’export IA.'; }
  });
  [place, fridge, shelf].forEach(control => control.addEventListener('change', () => setTimeout(refresh, 0)));
  document.addEventListener('fuse:fridge-progress', refresh);
  document.addEventListener('fuse-profile-changed', refresh);
  refresh();
})();
