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
  function makePdf() {
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
    const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '']; const pageIds = [];
    pages.forEach(content => { pageIds.push(3 + pageIds.length * 2); objects.push('', content); });
    objects[1] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`;
    pages.forEach((content, index) => {
      const pageId = 3 + index * 2; const streamId = pageId + 1;
      objects[pageId - 1] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >> >> >> /Contents ${streamId} 0 R >>`;
      objects[streamId - 1] = `<< /Length ${bytes(content).length} >>\nstream\n${content}\nendstream`;
    });
    let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'; const offsets = [0];
    objects.forEach((object, index) => { offsets.push(bytes(pdf).length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
    const xref = bytes(pdf).length; pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach(offset => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return new Blob([bytes(pdf)], { type: 'application/pdf' });
  }
  async function savePdf(name) {
    const pdf = makePdf(); const filename = `${name}.pdf`;
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
