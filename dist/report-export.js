(() => {
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
  const reportText = () => ['FUSE - INVENTAIRE FRIGO', reportTitle(), document.querySelector('#rMeta')?.textContent.trim() || '', '', ...reportRows().map(([label, value = '']) => value ? `${label} : ${value}` : label)].join('\r\n');
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
    const footer = () => text(`FUSE · inventaire local — page ${pages.length + 1}`, 42, 25, 8, false, '0.28 0.35 0.38');
    const start = continuation => {
      if (stream.length) finish(); y = 792;
      text('FUSE · INVENTAIRE LOCAL', 42, y, 9, true); y -= 27;
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
        '0.10 0.15 0.16 rg BT /F2 9 Tf 1 0 0 1 42 792 Tm (FUSE · INVENTAIRE LOCAL) Tj ET',
        `0.10 0.15 0.16 rg BT /F2 20 Tf 1 0 0 1 42 758 Tm (${pdfString(`Plan — ${plan.name}`)}) Tj ET`,
        `q ${width.toFixed(2)} 0 0 ${height.toFixed(2)} ${x.toFixed(2)} ${imageY.toFixed(2)} cm /Im${validPlans.indexOf(plan) + 1} Do Q`,
        `0.28 0.35 0.38 rg BT /F1 8 Tf 1 0 0 1 42 25 Tm (FUSE · inventaire local — plan du bar) Tj ET`
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
fetch('language.js?v=4').then(response => {
  if (!response.ok) throw new Error('language unavailable');
  caches?.open?.('fuse-language-v4').then(cache => cache.put(response.url, response.clone()));
  return response.text();
}).then(source => {
  const script = document.createElement('script'); script.textContent = source; document.body.append(script);
}).catch(() => {});
