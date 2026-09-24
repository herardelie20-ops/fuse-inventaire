(() => {
  document.title = 'FUSE Inventory';
  document.querySelectorAll('.brand').forEach(element => { element.textContent = 'FUSE INVENTORY'; });
  const report = document.querySelector('#report');
  const originalPdfButton = document.querySelector('#print');
  if (!report || !originalPdfButton) return;

  const controls = document.createElement('section');
  controls.className = 'export-options';
  controls.innerHTML = `
    <label>Format du rapport
      <select id="exportFormat">
        <option value="pdf">PDF</option>
        <option value="text">Fichier texte (.txt)</option>
        <option value="excel">Excel (.xls)</option>
        <option value="all">Les trois formats</option>
      </select>
    </label>
    <button class="primary" id="exportReport" type="button">Télécharger le rapport</button>
    <p class="small" id="exportHint">Le PDF sera téléchargé directement sur cet appareil, même hors ligne.</p>`;
  report.querySelector('.actions')?.before(controls);
  originalPdfButton.classList.add('hidden');

  const q = selector => controls.querySelector(selector);
  const reportRows = () => [...document.querySelectorAll('#rRows tr')].map(row => [...row.querySelectorAll('td')].map(cell => cell.textContent.trim()));
  const reportTitle = () => document.querySelector('#rTitle')?.textContent.trim() || 'Rapport inventaire Fuse';
  const safeName = () => `${reportTitle().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'rapport-inventaire'}`;
  const reportText = () => ['FUSE INVENTORY', reportTitle(), document.querySelector('#rMeta')?.textContent.trim() || '', '', ...reportRows().map(([label, value = '']) => value ? `${label} : ${value}` : label)].join('\r\n');
  function download(contents, name, type) {
    const blob = new Blob([contents], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = name;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }
  function excel() {
    const escape = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const rows = reportRows().map(([label, value = '']) => `<tr><td>${escape(label)}</td><td>${escape(value)}</td></tr>`).join('');
    return `<!doctype html><html><head><meta charset="utf-8"></head><body><table><thead><tr><th>Boisson</th><th>Quantité</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  }

  // Générateur PDF embarqué : aucun CDN ni connexion Internet n'est nécessaire.
  const cp1252 = { '€': 128, '‚': 130, 'ƒ': 131, '„': 132, '…': 133, '†': 134, '‡': 135, 'ˆ': 136, '‰': 137, 'Š': 138, '‹': 139, 'Œ': 140, 'Ž': 142, '‘': 145, '’': 146, '“': 147, '”': 148, '•': 149, '–': 150, '—': 151, '˜': 152, '™': 153, 'š': 154, '›': 155, 'œ': 156, 'ž': 158, 'Ÿ': 159 };
  const barPlans = {
    'Bar 1 - Main room': 'plan-bar-1.png',
    'Bar 2 - Main room': 'plan-bar-2.png',
    'Bar 3 - Motion': 'plan-bar-3.png',
    'Bar 4 - Cosmos': 'plan-bar-4.png'
  };
  function bytes(value) {
    const output = [];
    for (const char of String(value)) { const code = char.codePointAt(0); output.push(code <= 127 ? code : (cp1252[char] ?? (code <= 255 ? code : 63))); }
    return new Uint8Array(output);
  }
  const pdfString = value => String(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const wrapped = (value, maximum) => {
    const lines = []; let current = '';
    String(value || '—').split(/\s+/).forEach(word => {
      const next = current ? `${current} ${word}` : word;
      if (next.length > maximum && current) { lines.push(current); current = word; } else current = next;
    });
    if (current) lines.push(current); return lines;
  };
  function loadPlan(name, source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, 1400 / image.naturalWidth);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.naturalWidth * scale); canvas.height = Math.round(image.naturalHeight * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        const raw = atob(canvas.toDataURL('image/jpeg', 0.88).split(',')[1]);
        resolve({ name, width: canvas.width, height: canvas.height, data: Uint8Array.from(raw, char => char.charCodeAt(0)) });
      };
      image.onerror = () => reject(new Error(`Plan indisponible : ${name}`));
      image.src = source;
    });
  }
  function plansForReport() {
    const title = reportTitle(); const names = Object.keys(barPlans);
    const selected = names.filter(name => title.includes(name));
    return selected.length ? selected : (title.includes('Rapport général') ? names : []);
  }
  function localizedPlan(name) {
    const source = barPlans[name];
    return (localStorage.getItem('fuse-language') || 'fr') === 'nl' ? source.replace('.png', '-nl.png') : source;
  }
  function asBytes(value) { return value instanceof Uint8Array ? value : bytes(value); }
  function joinBytes(parts) {
    const total = parts.reduce((sum, part) => sum + part.length, 0); const output = new Uint8Array(total); let offset = 0;
    parts.forEach(part => { output.set(part, offset); offset += part.length; }); return output;
  }
  async function makePdf() {
    const pages = []; let stream = []; let y = 792;
    const text = (value, x, yy, size = 10, bold = false, color = '0.10 0.15 0.16') => stream.push(`${color} rg BT /${bold ? 'F2' : 'F1'} ${size} Tf 1 0 0 1 ${x} ${yy} Tm (${pdfString(value)}) Tj ET`);
    const line = (x1, yy, x2) => stream.push(`0.82 0.86 0.86 RG 0.5 w ${x1} ${yy} m ${x2} ${yy} l S`);
    const finish = () => { pages.push(stream.join('\n')); stream = []; };
    const footer = () => text(`FUSE Inventory — page ${pages.length + 1}`, 42, 25, 8, false, '0.28 0.35 0.38');
    const start = continuation => {
      if (stream.length) finish(); y = 792;
      text('FUSE INVENTORY', 42, y, 9, true); y -= 27;
      text(continuation ? `${reportTitle()} — suite` : reportTitle(), 42, y, 20, true); y -= 21;
      text(document.querySelector('#rMeta')?.textContent.trim() || `Inventaire du ${new Date().toLocaleString('fr-BE')}`, 42, y, 9, false, '0.28 0.35 0.38'); y -= 20;
      line(42, y, 553); y -= 17;
    };
    const nextPage = () => { footer(); start(true); };
    start(false);
    reportRows().forEach(([label, value = '']) => {
      const group = !value; const left = wrapped(label, group ? 65 : 46); const right = group ? [] : wrapped(value, 28);
      const height = Math.max(left.length, right.length || 1) * 14 + (group ? 12 : 8);
      if (y - height < 55) nextPage();
      if (group) {
        stream.push(`0.93 0.95 0.95 rg 42 ${y - height + 4} 511 ${height} re f`);
        left.forEach((item, index) => text(item, 49, y - 12 - index * 14, 10, true));
      } else {
        left.forEach((item, index) => text(item, 49, y - 12 - index * 14, 9));
        right.forEach((item, index) => text(item, 345, y - 12 - index * 14, 9));
      }
      y -= height; line(42, y + 3, 553); y -= 5;
    });
    footer(); finish();
    const plans = await Promise.all(plansForReport().map(async name => {
      try { return await loadPlan(name, localizedPlan(name)); } catch { return null; }
    }));
    const validPlans = plans.filter(Boolean);
    validPlans.forEach(plan => {
      const maxWidth = 511; const maxHeight = 665; const ratio = Math.min(maxWidth / plan.width, maxHeight / plan.height);
      const width = plan.width * ratio; const height = plan.height * ratio; const x = (595 - width) / 2; const imageY = 64;
      const planStream = [
        '0.10 0.15 0.16 rg BT /F2 9 Tf 1 0 0 1 42 792 Tm (FUSE INVENTORY) Tj ET',
        `0.10 0.15 0.16 rg BT /F2 20 Tf 1 0 0 1 42 758 Tm (${pdfString(`Plan — ${plan.name}`)}) Tj ET`,
        `q ${width.toFixed(2)} 0 0 ${height.toFixed(2)} ${x.toFixed(2)} ${imageY.toFixed(2)} cm /Im${validPlans.indexOf(plan) + 1} Do Q`,
        `0.28 0.35 0.38 rg BT /F1 8 Tf 1 0 0 1 42 25 Tm (FUSE Inventory — bar plan) Tj ET`
      ].join('\n');
      pages.push({ content: planStream, plan });
    });
    const textPages = pages.map(page => typeof page === 'string' ? { content: page, plan: null } : page);
    const objects = [null, '<< /Type /Catalog /Pages 2 0 R >>', ''];
    const addObject = object => { objects.push(object); return objects.length - 1; };
    const imageIds = new Map();
    validPlans.forEach(plan => {
      const header = bytes(`<< /Type /XObject /Subtype /Image /Width ${plan.width} /Height ${plan.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${plan.data.length} >>\nstream\n`);
      imageIds.set(plan, addObject(joinBytes([header, plan.data, bytes('\nendstream')])));
    });
    const pageIds = [];
    textPages.forEach(page => {
      const content = bytes(page.content); const contentId = addObject(joinBytes([bytes(`<< /Length ${content.length} >>\nstream\n`), content, bytes('\nendstream')]));
      const xObject = page.plan ? ` /XObject << /Im${validPlans.indexOf(page.plan) + 1} ${imageIds.get(page.plan)} 0 R >>` : '';
      const resources = `/Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >> >>${xObject} >>`;
      const pageId = addObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ${resources} /Contents ${contentId} 0 R >>`);
      pageIds.push(pageId);
    });
    objects[2] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
    const body = [bytes('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')]; const offsets = [0]; let position = body[0].length;
    for (let id = 1; id < objects.length; id += 1) {
      offsets[id] = position; const part = joinBytes([bytes(`${id} 0 obj\n`), asBytes(objects[id]), bytes('\nendobj\n')]); body.push(part); position += part.length;
    }
    const xref = position; let trailer = `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
    for (let id = 1; id < objects.length; id += 1) trailer += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
    trailer += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    body.push(bytes(trailer)); return new Blob([joinBytes(body)], { type: 'application/pdf' });
  }
  async function savePdf(name) {
    const pdf = await makePdf(); const filename = `${name}.pdf`;
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({ suggestedName: filename, types: [{ description: 'Document PDF', accept: { 'application/pdf': ['.pdf'] } }] });
        const writable = await handle.createWritable(); await writable.write(pdf); await writable.close();
        q('#exportHint').textContent = 'PDF enregistré sur cet appareil.'; return;
      } catch (error) { if (error?.name === 'AbortError') return; }
    }
    download(pdf, filename, 'application/pdf');
    q('#exportHint').textContent = 'PDF téléchargé localement. Retrouve-le dans Fichiers / Téléchargements.';
  }
  function updateHint() {
    const format = q('#exportFormat').value;
    q('#exportHint').textContent = format === 'pdf' ? 'Le PDF sera téléchargé directement sur cet appareil, même hors ligne.' : format === 'all' ? 'Les fichiers texte, Excel et PDF seront téléchargés sur cet appareil.' : 'Le fichier sera téléchargé directement sur cet appareil.';
  }
  q('#exportFormat').addEventListener('change', updateHint);
  q('#exportReport').addEventListener('click', async () => {
    if (report.classList.contains('hidden')) { q('#exportHint').textContent = 'Prépare d’abord un rapport détaillé.'; return; }
    const format = q('#exportFormat').value; const name = safeName();
    if (format === 'text' || format === 'all') download(reportText(), `${name}.txt`, 'text/plain;charset=utf-8');
    if (format === 'excel' || format === 'all') download(excel(), `${name}.xls`, 'application/vnd.ms-excel;charset=utf-8');
    if (format === 'pdf' || format === 'all') await savePdf(name);
  });
})();

// Le module de langue est mis en cache localement dès sa première ouverture.
fetch('language.js?v=9').then(response => {
  if (!response.ok) throw new Error('language unavailable');
  caches?.open?.('fuse-language-v9').then(cache => cache.put(response.url, response.clone()));
  return response.text();
}).then(source => {
  const script = document.createElement('script'); script.textContent = source; document.body.append(script);
}).catch(() => {});

// Espace de travail compact : le comptage photo reste disponible, sans encombrer le plan.
(() => {
  const app = document.querySelector('.app');
  const selectorCard = document.querySelector('#bar')?.closest('.card');
  const plan = document.querySelector('#barPlan');
  const photoCard = document.querySelector('#preview')?.closest('.card');
  const linesCard = document.querySelector('#lines')?.closest('.card');
  const batch = document.querySelector('.fridge-batch');
  const checklistCard = document.querySelector('#stateSummary')?.closest('.card');
  const save = document.querySelector('#save');
  const locationPanel = document.querySelector('#placeStatus')?.closest('.card');
  const detailed = document.querySelector('.detailed-report-panel');
  const complete = document.querySelector('.comprehensive-report-panel');
  const preview = document.querySelector('.report-preview');
  const share = document.querySelector('.report-share');
  if (!app || !selectorCard || !photoCard || !linesCard || !save) return;

  const style = document.createElement('style');
  style.textContent = `.counting-launch{width:100%;margin:12px 0 0}.setup-launch{width:100%;margin:8px 0 0;border-color:#708a78;color:#d1f0d9}.counting-modal{position:fixed;inset:0;z-index:80;background:#000d;display:grid;align-items:end}.counting-sheet{width:min(680px,100%);max-height:92vh;overflow:auto;background:#0a0a0a;border:1px solid #5a5a5a;border-radius:18px 18px 0 0;padding:18px 16px calc(22px + env(safe-area-inset-bottom));box-shadow:0 -18px 60px #000}.counting-sheet-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:8px}.counting-sheet-head h2{font-size:1.35rem;margin:2px 0}.counting-sheet-head p{margin:0;color:#cfcfcf;font-size:.82rem}.counting-sheet-close{min-width:40px;padding:9px;background:#242424;color:#fff}.counting-tab-panel .card{margin:12px 0}.counting-modal .manual-validation{display:none!important}.plan-status{margin:9px 0 0!important;padding:0!important;border:0!important;background:transparent!important}.plan-status b{font-size:.76rem}.plan-status .small{font-size:.72rem;margin:3px 0 0}.plan-status button{display:none!important}.report-hub{margin-top:14px}.report-hub>header{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:10px}.report-hub h2{font-size:1.05rem;margin:0}.report-hub>header p{margin:0;color:#cfcfcf;font-size:.76rem}.report-hub .report-action-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.report-hub .report-action-grid button{width:100%}.report-hub .report-section{margin:12px 0 0;padding-top:12px;border-top:1px solid #393939}.report-hub .report-section>p{margin:5px 0 9px}.report-hub .report-share label{margin:8px 0}.report-hub .report-preview,.report-hub .report-share,.report-hub .detailed-report-panel,.report-hub .comprehensive-report-panel{background:transparent;border:0;border-radius:0;padding:0}.report-hub .comprehensive-report-panel,.report-hub .detailed-report-panel{display:contents}.report-hub .detailed-report-panel>b,.report-hub .detailed-report-panel>p,.report-hub .comprehensive-report-panel>b,.report-hub .comprehensive-report-panel>p{display:none}@media(min-width:560px){.counting-modal{align-items:center;justify-content:center;padding:24px}.counting-sheet{border-radius:18px;max-height:86vh}.report-hub .report-action-grid{grid-template-columns:repeat(4,1fr)}}`;
  document.head.append(style);
  const planInfoStyle = document.createElement('style');
  planInfoStyle.textContent = '.plan-info{display:flex;flex-wrap:wrap;gap:7px 12px;align-items:center;margin:9px 0 0;color:#aeb8b5;font-size:.72rem;line-height:1.35}.plan-info #barPlanNote{margin:0}.plan-state{font-weight:850}.plan-state.white{color:#fff}.plan-state.orange{color:#ffad52}.plan-state.red{color:#ff6b6b}.plan-state.green{color:#62dd87}.plan-info .plan-status{margin:0!important;display:flex;gap:5px;align-items:baseline}.plan-info .plan-status b{display:none}.plan-info .plan-status .small{margin:0;font-size:.72rem}';
  document.head.append(planInfoStyle);
  const reportFlowStyle = document.createElement('style');
  reportFlowStyle.textContent = '.report-kind{display:grid;gap:5px;margin:0 0 10px;color:#cfcfcf;font-size:.78rem}.report-kind select{padding:9px}.report-hub .report-preview>b,.report-hub .report-preview>p,.report-hub #previewReport{display:none!important}';
  document.head.append(reportFlowStyle);

  const launcher = document.createElement('button');
  launcher.className = 'primary counting-launch'; launcher.type = 'button';
  launcher.textContent = 'Ouvrir le comptage IA et les photos';
  (plan || selectorCard).after(launcher);
  const modal = document.createElement('section');
  modal.className = 'counting-modal hidden'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `<div class="counting-sheet"><header class="counting-sheet-head"><div><h2>Comptage IA</h2><p id="countingContext"></p></div><button class="counting-sheet-close" type="button" aria-label="Fermer">×</button></header><div id="countingAI" class="counting-tab-panel"></div></div>`;
  document.body.append(modal);
  const aiWorkspace = modal.querySelector('#countingAI');
  [photoCard, batch].filter(Boolean).forEach(element => aiWorkspace.append(element));
  batch?.querySelector('#manualShelfEditor')?.remove();
  const context = modal.querySelector('#countingContext');
  const open = () => { context.textContent = `${document.querySelector('#bar')?.value || ''} · ${document.querySelector('#fridge')?.value || ''}`; modal.classList.remove('hidden'); document.body.style.overflow = 'hidden'; modal.querySelector('#camera, #nextFridgePhoto')?.focus(); };
  const close = () => { modal.classList.add('hidden'); document.body.style.overflow = ''; launcher.focus(); };
  launcher.addEventListener('click', open); modal.querySelector('.counting-sheet-close').addEventListener('click', close);
  modal.addEventListener('click', event => { if (event.target === modal) close(); });
  window.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.classList.contains('hidden')) close(); });

  if (plan) {
    const planNote = plan.querySelector('#barPlanNote');
    const planCanvas = plan.querySelector('#barPlanCanvas');
    const planInfo = document.createElement('div'); planInfo.className = 'plan-info';
    if (planCanvas) planCanvas.after(planInfo);
    if (planNote) planInfo.append(planNote);
    if (locationPanel) { locationPanel.classList.remove('card'); locationPanel.classList.add('plan-status'); planInfo.append(locationPanel); }
  }

  if (detailed || complete || preview || share) {
    const hub = document.createElement('section'); hub.className = 'card report-hub';
    hub.innerHTML = `<header><h2>Rapports</h2><p>Choisis le rapport, vérifie-le, puis envoie-le.</p></header><label class="report-kind">Type de rapport<select id="reportKind"><option value="bar">Rapport du bar</option><option value="complete">Rapport complet</option></select></label><div class="report-action-grid" id="reportActions"></div><div class="report-section hidden" id="reportPreviewSlot"></div><div class="report-section hidden" id="reportShareSlot"></div>`;
    (plan || selectorCard).after(hub);
    hub.before(launcher);
    const actions = hub.querySelector('#reportActions');
    const addAction = (label, handler) => { const button = document.createElement('button'); button.type = 'button'; button.className = 'secondary'; button.textContent = label; button.addEventListener('click', handler); actions.append(button); };
    if (detailed) { detailed.classList.remove('card'); detailed.hidden = true; hub.append(detailed); }
    if (complete) { complete.classList.remove('card'); complete.hidden = true; hub.append(complete); }
    const generateReport = () => { (hub.querySelector('#reportKind').value === 'complete' ? complete : detailed)?.querySelector('button')?.click(); };
    if (preview) { preview.classList.remove('card'); hub.querySelector('#reportPreviewSlot').append(preview); addAction('Aperçu du rapport', () => { generateReport(); hub.querySelector('#reportPreviewSlot').classList.remove('hidden'); preview.querySelector('#previewReport')?.click(); }); }
    if (share) { share.classList.remove('card'); hub.querySelector('#reportShareSlot').append(share); addAction('Envoyer', () => { hub.querySelector('#reportShareSlot').classList.remove('hidden'); share.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }); }
  }
})();

// Première configuration : une référence précise est enregistrée pour chaque étage.
(() => {
  const workspace = document.querySelector('#countingManual');
  const place = document.querySelector('#bar');
  const fridge = document.querySelector('#fridge');
  const shelf = document.querySelector('#shelf');
  const lines = document.querySelector('#lines');
  if (!workspace || !place || !fridge || !shelf || !lines) return;

  const card = document.createElement('section');
  card.className = 'card reference-editor';
  card.innerHTML = `<b>Mode édition de référence</b><p class="small">Définis une première fois le contenu exact de cet étage, boisson par boisson. Cette base restera disponible pour les prochains contrôles.</p><p class="small" id="referenceState"></p><button class="primary" id="saveReference" type="button">Enregistrer la référence de l’étage</button>`;
  workspace.prepend(card);

  const style = document.createElement('style');
  style.textContent = '.reference-editor{border-color:#708a78!important}.reference-editor #referenceState{color:#bde8c7;min-height:1.2em}.reference-editor button{width:100%}';
  document.head.append(style);
  const state = card.querySelector('#referenceState');
  const copy = (fr, nl, en) => ({ fr, nl, en })[localStorage.getItem('fuse-language') || 'fr'];
  const key = () => `fuse-shelf-${place.value}-${fridge.value}-${shelf.value}`;
  const fridgeKey = () => `fuse-check-${place.value}-${fridge.value}`;
  const shelfNames = () => [...shelf.options].map(option => option.value);
  const isFridgeShelf = () => place.value.startsWith('Bar ') && !/^Bahut\b/i.test(fridge.value);
  const read = () => { try { return JSON.parse(localStorage.getItem(key())); } catch { return null; } };
  const addLine = item => {
    const row = document.createElement('div'); row.className = 'line';
    const name = document.createElement('input'); name.placeholder = 'Ex. Jupiler'; name.value = item?.name || ''; name.setAttribute('list', 'fuseProducts');
    const quantity = document.createElement('input'); quantity.type = 'number'; quantity.min = '0'; quantity.inputMode = 'numeric'; quantity.value = item?.quantity ?? '';
    const nameLabel = document.createElement('label'); nameLabel.append('Boisson', name);
    const quantityLabel = document.createElement('label'); quantityLabel.append('Qté', quantity);
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '×'; remove.addEventListener('click', () => row.remove());
    row.append(nameLabel, quantityLabel, remove); lines.append(row);
  };
  function restore() {
    const record = read(); const reference = record?.referenceLines || [];
    card.classList.toggle('hidden', !isFridgeShelf());
    if (!isFridgeShelf()) return;
    if (reference.length) {
      lines.replaceChildren(); reference.forEach(addLine);
      const total = reference.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      state.textContent = copy(`Référence enregistrée : ${reference.length} ligne(s), ${total} boisson(s).`, `Referentie opgeslagen: ${reference.length} regel(s), ${total} drank(en).`, `Reference saved: ${reference.length} row(s), ${total} drink(s).`);
    } else {
      if (!lines.children.length) addLine();
      state.textContent = copy('Aucune référence enregistrée pour cet étage.', 'Geen referentie opgeslagen voor dit niveau.', 'No reference saved for this shelf.');
    }
  }
  card.querySelector('#saveReference').addEventListener('click', () => {
    const referenceLines = [...lines.children].map(row => {
      const inputs = row.querySelectorAll('input'); return { name: inputs[0]?.value.trim(), quantity: Number(inputs[1]?.value || 0) };
    }).filter(item => item.name);
    if (!referenceLines.length) { state.textContent = copy('Ajoute au moins une boisson avant d’enregistrer.', 'Voeg minstens één drank toe voordat je opslaat.', 'Add at least one drink before saving.'); return; }
    const current = read() || {}; const total = referenceLines.reduce((sum, item) => sum + item.quantity, 0);
    localStorage.setItem(key(), JSON.stringify({ ...current, referenceLines, count: total, quantity: 'manual', alignment: 'manual', hadIssue: false, analysisSource: 'manual', counted: true, completed: true, manualValidated: true, referenceSavedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
    const allDone = shelfNames().every(name => {
      try { const record = JSON.parse(localStorage.getItem(`fuse-shelf-${place.value}-${fridge.value}-${name}`)); return record?.completed && Array.isArray(record.referenceLines) && record.referenceLines.length > 0; } catch { return false; }
    });
    localStorage.setItem(fridgeKey(), JSON.stringify({ completed: allDone, inProgress: !allDone, manualValidated: allDone, editValidated: allDone, updatedAt: new Date().toISOString() }));
    state.textContent = copy(`Référence enregistrée : ${referenceLines.length} ligne(s), ${total} boisson(s).`, `Referentie opgeslagen: ${referenceLines.length} regel(s), ${total} drank(en).`, `Reference saved: ${referenceLines.length} row(s), ${total} drink(s).`);
    document.dispatchEvent(new Event('fuse:fridge-progress'));
  });
  [place, fridge, shelf].forEach(control => control.addEventListener('change', () => setTimeout(restore, 0)));
  restore();
})();
