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
    <button class="primary" id="exportReport" type="button">Exporter le rapport</button>
    <p class="small" id="exportHint">Le PDF s’ouvre dans la fenêtre d’impression : choisis « Enregistrer au format PDF ».</p>`;
  report.querySelector('.actions')?.before(controls);
  originalPdfButton.classList.add('hidden');

  const q = selector => controls.querySelector(selector);
  const reportRows = () => [...document.querySelectorAll('#rRows tr')].map(row => [...row.querySelectorAll('td')].map(cell => cell.textContent.trim()));
  const reportTitle = () => document.querySelector('#rTitle')?.textContent.trim() || 'Rapport inventaire Fuse';
  const safeName = () => `${reportTitle().toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'rapport-inventaire'}`;
  const reportText = () => ['FUSE - INVENTAIRE FRIGO', reportTitle(), document.querySelector('#rMeta')?.textContent.trim() || '', '', ...reportRows().map(([label, value]) => `${label} : ${value}`)].join('\\r\\n');
  function download(contents, name, type) {
    const blob = new Blob([contents], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = name;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }
  function excel() {
    const escape = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const rows = reportRows().map(([label, value]) => `<tr><td>${escape(label)}</td><td>${escape(value)}</td></tr>`).join('');
    return `<!doctype html><html><head><meta charset="utf-8"></head><body><table><thead><tr><th>Boisson</th><th>Quantité</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  }
  function updateHint() {
    const format = q('#exportFormat').value;
    q('#exportHint').textContent = format === 'pdf' ? 'Le PDF s’ouvre dans la fenêtre d’impression : choisis « Enregistrer au format PDF ».' : format === 'all' ? 'Le texte et le fichier Excel se téléchargent ; choisis ensuite « Enregistrer au format PDF » dans la fenêtre d’impression.' : 'Le fichier sera téléchargé directement sur cet appareil.';
  }
  q('#exportFormat').addEventListener('change', updateHint);
  q('#exportReport').addEventListener('click', () => {
    if (report.classList.contains('hidden')) { q('#exportHint').textContent = 'Prépare d’abord le rapport détaillé.'; return; }
    const format = q('#exportFormat').value;
    const name = safeName();
    if (format === 'text' || format === 'all') download(reportText(), `${name}.txt`, 'text/plain;charset=utf-8');
    if (format === 'excel' || format === 'all') download(excel(), `${name}.xls`, 'application/vnd.ms-excel;charset=utf-8');
    if (format === 'pdf' || format === 'all') window.print();
  });
})();
