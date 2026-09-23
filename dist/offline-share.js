(() => {
  const app = document.querySelector('.app');
  const report = document.querySelector('#report');
  if (!app || !report) return;

  app.querySelector('.intro')?.remove();
  const info = document.createElement('p');
  info.className = 'offline-note';
  info.textContent = 'Mode autonome · Les données et photos restent sur cet appareil.';
  app.querySelector('h1')?.after(info);

  const offlineStyle = document.createElement('style');
  offlineStyle.textContent = '.offline-note{margin:4px 0 14px;color:#aeb8b5;font-size:.72rem;line-height:1.35}';
  document.head.append(offlineStyle);

  const preview = document.createElement('section');
  preview.className = 'card report-preview';
  preview.innerHTML = `<b>Aperçu avant envoi</b><p class="small">Vérifie le rapport final avant de le télécharger, l’envoyer par SMS ou par e-mail.</p><button class="secondary" id="previewReport" type="button">Afficher l’aperçu du rapport</button><div class="hidden" id="reportPreviewContent"></div><p class="small" id="previewStatus"></p>`;
  report.after(preview);

  const share = document.createElement('section');
  share.className = 'card report-share';
  share.innerHTML = `<b>Envoyer le rapport</b><p class="small">Choisis un téléphone ou une adresse e-mail. L’application prépare le message ; l’envoi final se fait dans ton application SMS ou e-mail.</p><label>Destinataire<select id="sendMethod"><option value="sms">Numéro de téléphone</option><option value="email">Adresse e-mail</option><option value="share">Choisir une application</option></select></label><label id="recipientLabel">Numéro de téléphone<input id="recipient" type="tel" inputmode="tel" placeholder="Ex. +32 470 00 00 00"></label><button class="primary" id="sendReport" type="button">Préparer l’envoi</button><p class="small" id="sendStatus"></p>`;
  preview.after(share);

  const q = id => share.querySelector(id);
  const previewQ = id => preview.querySelector(id);
  const text = () => {
    const title = document.querySelector('#rTitle').textContent.trim();
    const meta = document.querySelector('#rMeta').textContent.trim();
    const rows = [...document.querySelectorAll('#rRows tr')].map(row => {
      const cells = [...row.querySelectorAll('td')].map(cell => cell.textContent.trim());
      return `- ${cells.join(' : ')}`;
    });
    return [`FUSE — ${title}`, meta, '', ...rows].join('\n');
  };
  function updateRecipient() {
    const mode = q('#sendMethod').value;
    const label = q('#recipientLabel');
    const input = q('#recipient');
    label.classList.toggle('hidden', mode === 'share');
    label.childNodes[0].nodeValue = mode === 'email' ? 'Adresse e-mail' : 'Numéro de téléphone';
    input.type = mode === 'email' ? 'email' : 'tel';
    input.placeholder = mode === 'email' ? 'Ex. manager@fuse.be' : 'Ex. +32 470 00 00 00';
  }
  q('#sendMethod').addEventListener('change', updateRecipient);
  previewQ('#previewReport').addEventListener('click', () => {
    if (report.classList.contains('hidden')) document.querySelector('#detailedReport')?.click();
    const source = report.querySelector('.report');
    if (!source) { previewQ('#previewStatus').textContent = 'Prépare d’abord un rapport détaillé.'; return; }
    const copy = source.cloneNode(true);
    copy.removeAttribute('id');
    const target = previewQ('#reportPreviewContent');
    target.replaceChildren(copy);
    target.classList.remove('hidden');
    previewQ('#previewStatus').textContent = 'Aperçu prêt. Tu peux maintenant choisir le format ou préparer l’envoi.';
    preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  q('#sendReport').addEventListener('click', async () => {
    if (report.classList.contains('hidden')) { q('#sendStatus').textContent = 'Prépare d’abord un rapport d’inventaire.'; return; }
    const body = text();
    const mode = q('#sendMethod').value;
    const recipient = q('#recipient').value.trim();
    if (mode !== 'share' && !recipient) { q('#sendStatus').textContent = 'Indique un destinataire.'; return; }
    if (mode === 'email') { window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent('Rapport inventaire Fuse')}&body=${encodeURIComponent(body)}`; return; }
    if (mode === 'sms') { window.location.href = `sms:${encodeURIComponent(recipient)}?body=${encodeURIComponent(body)}`; return; }
    if (navigator.share) {
      try { await navigator.share({ title: 'Rapport inventaire Fuse', text: body }); } catch { q('#sendStatus').textContent = 'Partage annulé.'; }
    } else q('#sendStatus').textContent = 'Le partage natif n’est pas disponible sur cet appareil : choisis SMS ou e-mail.';
  });
  updateRecipient();
})();
