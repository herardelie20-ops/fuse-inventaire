(() => {
  const place = document.querySelector('#bar');
  const fridge = document.querySelector('#fridge');
  const save = document.querySelector('#save');
  if (!place || !fridge || !save) return;

  const panel = document.createElement('section');
  panel.className = 'card detailed-report-panel';
  panel.innerHTML = `<b>Rapport détaillé du bar</b><p class="small" id="detailedReportHint">Le rapport reprend les écarts signalés pendant le comptage.</p><button class="secondary" id="detailedReport" type="button">Préparer le rapport détaillé</button>`;
  save.after(panel);
  const hint = panel.querySelector('#detailedReportHint');
  const button = panel.querySelector('#detailedReport');

  const isBar = () => place.value.startsWith('Bar ');
  const dataForBar = () => {
    const prefix = `fuse-shelf-${place.value}-`;
    const records = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith(prefix)) continue;
      try {
        const record = JSON.parse(localStorage.getItem(key));
        if (!record?.counted) continue;
        const rest = key.slice(prefix.length);
        const divider = rest.lastIndexOf('-Étage ');
        if (divider < 0) continue;
        records.push({ fridge: rest.slice(0, divider), shelf: rest.slice(divider + 1), ...record });
      } catch { /* entrée locale non lisible : ignorée */ }
    }
    return records;
  };
  function refresh() {
    panel.classList.toggle('hidden', !isBar());
    if (!isBar()) return;
    const entries = dataForBar().filter(item => item.hadIssue);
    const missing = entries.reduce((total, item) => total + Number(item.missing || 0), 0);
    const extra = entries.reduce((total, item) => total + Number(item.extra || 0), 0);
    const crooked = entries.filter(item => item.alignment === 'crooked').length;
    hint.textContent = entries.length ? `${entries.length} erreur${entries.length > 1 ? 's' : ''} relevée${entries.length > 1 ? 's' : ''} · ${missing} manquante${missing > 1 ? 's' : ''} · ${extra} en trop · ${crooked} ligne${crooked > 1 ? 's' : ''} de travers.` : 'Aucun écart enregistré pour le moment.';
  }
  button.addEventListener('click', () => {
    const entries = dataForBar();
    const errors = entries.filter(item => item.hadIssue);
    const missing = errors.reduce((total, item) => total + Number(item.missing || 0), 0);
    const extra = errors.reduce((total, item) => total + Number(item.extra || 0), 0);
    const crooked = errors.filter(item => item.alignment === 'crooked').length;
    const corrected = errors.filter(item => item.correction === 'corrected').length;
    const rows = [
      ['Erreurs relevées', String(errors.length)], ['Boissons manquantes', String(missing)], ['Boissons en trop', String(extra)], ['Lignes de travers', String(crooked)], ['Corrections effectuées', String(corrected)]
    ];
    errors.forEach(item => {
      const details = [item.quantity !== 'ok' ? `${item.missing || 0} manquante(s), ${item.extra || 0} en trop` : '', item.alignment === 'crooked' ? 'ligne de travers' : '', item.issue, item.correction === 'corrected' ? 'corrigé' : 'à corriger'].filter(Boolean).join(' · ');
      rows.push([`${item.fridge} — ${item.shelf}`, details]);
    });
    document.querySelector('#rTitle').textContent = `Rapport détaillé — ${place.value}`;
    document.querySelector('#rMeta').textContent = `${window.FUSE_INVENTORY_TIMING?.() || `Inventaire du ${new Date().toLocaleString('fr-BE')}`} · ${entries.length} étage(s) contrôlé(s).`;
    document.querySelector('#rRows').innerHTML = rows.map(([name, value]) => `<tr><td>${name}</td><td>${value}</td></tr>`).join('');
    const report = document.querySelector('#report');
    report.classList.remove('hidden');
    const status = document.querySelector('#status');
    status.textContent = 'Rapport détaillé préparé localement.';
    status.classList.remove('hidden');
    report.scrollIntoView();
  });
  place.addEventListener('change', () => setTimeout(refresh, 0));
  document.addEventListener('fuse:fridge-finished', refresh);
  refresh();
})();
