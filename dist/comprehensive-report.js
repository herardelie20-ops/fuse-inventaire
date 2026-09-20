(() => {
  const place = document.querySelector('#bar');
  const save = document.querySelector('#save');
  const report = document.querySelector('#report');
  if (!place || !save || !report) return;

  const bars = ['Bar 1 - Main room', 'Bar 2 - Main room', 'Bar 3 - Motion', 'Bar 4 - Cosmos'];
  const stockPlaces = [...place.options].map(option => option.text).filter(name => !name.startsWith('Bar '));
  const style = document.createElement('style');
  style.textContent = '.report .report-group td{padding:12px 3px 7px;background:#edf1f0;color:#152124;letter-spacing:.03em}.report .report-group:first-child td{padding-top:7px}';
  document.head.append(style);
  const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
  const escape = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const packSize = product => Number(window.FUSE_PACK_SIZES?.[product] || 1);
  const number = value => Number(value || 0);
  const sortFridges = (a, b) => (Number(a.match(/(\d+)/)?.[1] || 999) - Number(b.match(/(\d+)/)?.[1] || 999)) || a.localeCompare(b, 'fr');

  const panel = document.createElement('section');
  panel.className = 'card comprehensive-report-panel';
  panel.innerHTML = `<b>Rapport complet - tous les lieux</b><p class="small">Regroupe les étages et frigos par bar, tous les stocks et les totaux cumulés. Les lieux sans relevé restent visibles pour ne rien oublier.</p><button class="primary" id="comprehensiveReport" type="button">Préparer le rapport complet</button>`;
  document.querySelector('.detailed-report-panel')?.after(panel) || save.after(panel);

  function keyParts(key, prefix, places) {
    for (const candidate of places) {
      const start = `${prefix}${candidate}-`;
      if (key.startsWith(start)) return { place: candidate, rest: key.slice(start.length) };
    }
    return null;
  }
  function collect() {
    const data = {
      bars: Object.fromEntries(bars.map(name => [name, { shelves: {}, bahuts: {} }])),
      stocks: Object.fromEntries(stockPlaces.map(name => [name, { products: [], spirits: [] }]))
    };
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      const record = read(key);
      if (!record) continue;
      let parsed = keyParts(key, 'fuse-shelf-', bars);
      if (parsed && record.counted) {
        const cut = parsed.rest.lastIndexOf('-Étage ');
        if (cut >= 0) {
          const fridge = parsed.rest.slice(0, cut);
          const shelf = parsed.rest.slice(cut + 1);
          (data.bars[parsed.place].shelves[fridge] ||= []).push({ shelf, count: number(record.count), completed: Boolean(record.completed) });
        }
        continue;
      }
      parsed = keyParts(key, 'fuse-bahut-', bars);
      if (parsed && record.completed) { data.bars[parsed.place].bahuts[parsed.rest] = record.entries || []; continue; }
      parsed = keyParts(key, 'fuse-stock-', stockPlaces);
      if (parsed && record.validated) { data.stocks[parsed.place].products.push({ name: parsed.rest, full: number(record.full), open: number(record.open), size: packSize(parsed.rest) }); continue; }
      parsed = keyParts(key, 'fuse-hanging-', stockPlaces);
      if (parsed && record.validated) { data.stocks[parsed.place].spirits.push({ name: parsed.rest, full: number(record.full), format: number(record.format || 100), cl: number(record.cl) }); }
    }
    return data;
  }
  function group(label) { return `<tr class="report-group"><td colspan="2"><strong>${escape(label)}</strong></td></tr>`; }
  function row(label, value) { return `<tr><td>${escape(label)}</td><td>${escape(value)}</td></tr>`; }
  function barRows(name, bar) {
    const rows = [group(name)]; let total = 0; let seen = false;
    Object.keys(bar.shelves).sort(sortFridges).forEach(fridge => {
      const floors = bar.shelves[fridge].sort((a, b) => a.shelf.localeCompare(b.shelf, 'fr', { numeric: true }));
      const fridgeTotal = floors.reduce((sum, floor) => sum + floor.count, 0);
      floors.forEach(floor => rows.push(row(`${fridge} - ${floor.shelf}`, `${floor.count} bouteille${floor.count > 1 ? 's' : ''}${floor.completed ? '' : ' (à confirmer)'}`)));
      rows.push(row(`Total ${fridge}`, `${fridgeTotal} bouteille${fridgeTotal > 1 ? 's' : ''}`)); total += fridgeTotal; seen = true;
    });
    Object.keys(bar.bahuts).sort(sortFridges).forEach(bahut => {
      const entries = bar.bahuts[bahut]; const bahutTotal = entries.reduce((sum, entry) => sum + number(entry.bottles), 0);
      entries.forEach(entry => rows.push(row(`${bahut} - ${entry.product} (${number(entry.crates)} bac${number(entry.crates) > 1 ? 's' : ''})`, `${number(entry.bottles)} bouteille${number(entry.bottles) > 1 ? 's' : ''}`)));
      rows.push(row(`Total ${bahut}`, `${bahutTotal} bouteille${bahutTotal > 1 ? 's' : ''}`)); total += bahutTotal; seen = true;
    });
    if (!seen) rows.push(row('Aucun frigo ou bahut validé', '0 bouteille'));
    rows.push(row(`TOTAL ${name}`, `${total} bouteille${total > 1 ? 's' : ''}`));
    return { rows, total };
  }
  function stockRows(name, stock) {
    const rows = [group(name)]; let total = 0; let volume = 0;
    if (!stock.products.length && !stock.spirits.length) rows.push(row('Aucun produit validé', '0 bouteille'));
    stock.products.sort((a, b) => a.name.localeCompare(b.name, 'fr')).forEach(entry => {
      const bottles = entry.full * entry.size + entry.open;
      total += bottles;
      rows.push(row(`${entry.name} - ${entry.full} complet(s) × ${entry.size} + ${entry.open} entamée(s)`, `${bottles} bouteille${bottles > 1 ? 's' : ''}`));
    });
    stock.spirits.sort((a, b) => a.name.localeCompare(b.name, 'fr')).forEach(entry => {
      const cl = entry.full * entry.format + entry.cl;
      volume += cl;
      rows.push(row(`${entry.name} - bouteilles accrochées`, `${entry.full} pleine(s) + ${entry.cl} cl entamés = ${cl} cl`));
    });
    rows.push(row(`TOTAL ${name}`, `${total} bouteille${total > 1 ? 's' : ''}${volume ? ` + ${volume} cl d’alcool` : ''}`));
    return { rows, total, volume };
  }
  panel.querySelector('#comprehensiveReport').addEventListener('click', () => {
    const data = collect(); const rows = []; let barTotal = 0; let stockTotal = 0; let spiritCl = 0;
    rows.push(group('FRIGOS ET BAHUTS - PAR BAR'));
    bars.forEach(name => { const result = barRows(name, data.bars[name]); rows.push(...result.rows); barTotal += result.total; });
    rows.push(group('TOTAL CUMULÉ DES QUATRE BARS'));
    rows.push(row('Total frigos et bahuts', `${barTotal} bouteille${barTotal > 1 ? 's' : ''}`));
    rows.push(group('STOCKS - PAR ZONE'));
    stockPlaces.forEach(name => { const result = stockRows(name, data.stocks[name]); rows.push(...result.rows); stockTotal += result.total; spiritCl += result.volume; });
    rows.push(group('TOTAL GÉNÉRAL'));
    rows.push(row('Total frigos, bahuts et stocks', `${barTotal + stockTotal} bouteille${barTotal + stockTotal > 1 ? 's' : ''}`));
    rows.push(row('Volume total d’alcools accrochés', `${spiritCl} cl`));
    document.querySelector('#rTitle').textContent = 'Rapport général - Fuse';
    document.querySelector('#rMeta').textContent = `${window.FUSE_INVENTORY_TIMING?.() || `Inventaire du ${new Date().toLocaleString('fr-BE')}`} - 4 bars et ${stockPlaces.length} zones de stock.`;
    document.querySelector('#rRows').innerHTML = rows.join('');
    report.classList.remove('hidden');
    const status = document.querySelector('#status');
    status.textContent = 'Rapport général préparé localement.'; status.classList.remove('hidden');
    report.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
