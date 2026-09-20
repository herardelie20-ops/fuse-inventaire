(() => {
  const translations = {
    nl: {
      'Compter un frigo': 'Een koelkast tellen', 'Photos et relevés restent sur ce téléphone.': 'Foto’s en inventarissen blijven op deze telefoon.',
      'Mode autonome': 'Autonome modus', 'Lieu': 'Locatie', 'Frigo': 'Koelkast', 'Étage — du haut vers le bas': 'Niveau — van boven naar beneden',
      'Photo du frigo': 'Foto van de koelkast', 'Photo nette de face. Tu confirmes ensuite les quantités.': 'Duidelijke foto van voren. Bevestig daarna de aantallen.',
      'Pas encore de photo': 'Nog geen foto', 'Prendre une photo': 'Foto nemen', 'Prendre la photo suivante': 'Volgende foto nemen', 'Importer': 'Importeren', 'Importer les photos': 'Foto’s importeren',
      'Boissons comptées': 'Getelde dranken', '+ Ligne': '+ Regel', 'Enregistrer et préparer le rapport': 'Opslaan en rapport voorbereiden',
      'Série complète du frigo': 'Volledige reeks van de koelkast', 'Analyser le frigo': 'Koelkast analyseren', 'Validation manuelle': 'Handmatige validatie',
      'Valider cet étage': 'Dit niveau valideren', 'Valider tout le frigo': 'De hele koelkast valideren', 'Reprendre un contrôle': 'Controle opnieuw doen',
      'Refaire cet étage': 'Dit niveau opnieuw doen', 'Reprendre tout le frigo': 'De hele koelkast opnieuw doen', 'Rapport détaillé du bar': 'Gedetailleerd barrapport',
      'Préparer le rapport détaillé': 'Gedetailleerd rapport voorbereiden', 'Rapport complet - tous les lieux': 'Volledig rapport — alle locaties',
      'Préparer le rapport complet': 'Volledig rapport voorbereiden', 'État du lieu': 'Status van de locatie', 'Aperçu avant envoi': 'Voorbeeld vóór verzenden',
      'Afficher l’aperçu du rapport': 'Rapportvoorbeeld tonen', 'Envoyer le rapport': 'Rapport versturen', 'Destinataire': 'Ontvanger',
      'Numéro de téléphone': 'Telefoonnummer', 'Adresse e-mail': 'E-mailadres', 'Choisir une application': 'Een app kiezen', 'Préparer l’envoi': 'Verzenden voorbereiden',
      'Format du rapport': 'Rapportformaat', 'Fichier texte (.txt)': 'Tekstbestand (.txt)', 'Excel (.xls)': 'Excel (.xls)', 'Les trois formats': 'Alle drie formaten',
      'Télécharger le rapport': 'Rapport downloaden', 'Nouveau': 'Nieuw', 'Boisson': 'Drank', 'Quantité': 'Aantal',
      'Blanc : frigo pas encore commencé.': 'Wit: koelkast nog niet gestart.', 'Repères de suivi : blanc à faire, orange en cours, rouge avec erreur, vert validé.': 'Status: wit te doen, oranje bezig, rood met fout, groen gevalideerd.',
      'IA de vision locale': 'Lokale visuele AI', 'Moteur IA local installé. Le modèle Fuse doit encore être entraîné puis ajouté.': 'Lokale AI-motor geïnstalleerd. Het Fuse-model moet nog worden getraind en toegevoegd.',
      'Rapport général - Fuse': 'Algemeen rapport - Fuse', 'Profil :': 'Profiel:', 'Plan —': 'Plan —', 'À définir': 'Te bepalen', 'Aucun produit validé': 'Geen gevalideerd product',
      'FRIGOS ET BAHUTS - PAR BAR': 'KOELKASTEN EN KASTEN — PER BAR', 'STOCKS - PAR ZONE': 'VOORRADEN — PER ZONE', 'TOTAL GÉNÉRAL': 'ALGEMEEN TOTAAL'
    },
    en: {
      'Compter un frigo': 'Count a fridge', 'Photos et relevés restent sur ce téléphone.': 'Photos and inventory records stay on this phone.',
      'Mode autonome': 'Offline mode', 'Lieu': 'Location', 'Frigo': 'Fridge', 'Étage — du haut vers le bas': 'Shelf — top to bottom',
      'Photo du frigo': 'Fridge photo', 'Photo nette de face. Tu confirmes ensuite les quantités.': 'Clear front photo. Then confirm the quantities.',
      'Pas encore de photo': 'No photo yet', 'Prendre une photo': 'Take a photo', 'Prendre la photo suivante': 'Take the next photo', 'Importer': 'Import', 'Importer les photos': 'Import photos',
      'Boissons comptées': 'Counted drinks', '+ Ligne': '+ Row', 'Enregistrer et préparer le rapport': 'Save and prepare the report',
      'Série complète du frigo': 'Complete fridge series', 'Analyser le frigo': 'Analyse the fridge', 'Validation manuelle': 'Manual validation',
      'Valider cet étage': 'Validate this shelf', 'Valider tout le frigo': 'Validate the whole fridge', 'Reprendre un contrôle': 'Redo a check',
      'Refaire cet étage': 'Redo this shelf', 'Reprendre tout le frigo': 'Redo the whole fridge', 'Rapport détaillé du bar': 'Detailed bar report',
      'Préparer le rapport détaillé': 'Prepare detailed report', 'Rapport complet - tous les lieux': 'Complete report — all locations',
      'Préparer le rapport complet': 'Prepare complete report', 'État du lieu': 'Location status', 'Aperçu avant envoi': 'Preview before sending',
      'Afficher l’aperçu du rapport': 'Show report preview', 'Envoyer le rapport': 'Send report', 'Destinataire': 'Recipient',
      'Numéro de téléphone': 'Phone number', 'Adresse e-mail': 'Email address', 'Choisir une application': 'Choose an app', 'Préparer l’envoi': 'Prepare sending',
      'Format du rapport': 'Report format', 'Fichier texte (.txt)': 'Text file (.txt)', 'Excel (.xls)': 'Excel (.xls)', 'Les trois formats': 'All three formats',
      'Télécharger le rapport': 'Download report', 'Nouveau': 'New', 'Boisson': 'Drink', 'Quantité': 'Quantity',
      'Blanc : frigo pas encore commencé.': 'White: fridge not started yet.', 'Repères de suivi : blanc à faire, orange en cours, rouge avec erreur, vert validé.': 'Status: white to do, orange in progress, red with an error, green validated.',
      'IA de vision locale': 'Local vision AI', 'Moteur IA local installé. Le modèle Fuse doit encore être entraîné puis ajouté.': 'Local AI engine installed. The Fuse model still needs training and adding.',
      'Rapport général - Fuse': 'General report - Fuse', 'Profil :': 'Profile:', 'Plan —': 'Plan —', 'À définir': 'To be defined', 'Aucun produit validé': 'No validated product',
      'FRIGOS ET BAHUTS - PAR BAR': 'FRIDGES AND CABINETS — BY BAR', 'STOCKS - PAR ZONE': 'STOCKS — BY AREA', 'TOTAL GÉNÉRAL': 'GRAND TOTAL'
    }
  };
  const originals = new WeakMap(); const attributes = ['placeholder', 'title', 'aria-label'];
  const locale = () => localStorage.getItem('fuse-language') || 'fr';
  function translate(value, language) {
    if (language === 'fr') return value;
    const table = translations[language] || {}; let result = table[value] || value;
    const replacements = language === 'nl'
      ? [['Rapport détaillé — ', 'Gedetailleerd rapport — '], ['Rapport général', 'Algemeen rapport'], ['Plan ', 'Plan '], ['Étage ', 'Niveau '], ['Frigo ', 'Koelkast '], ['bouteilles', 'flessen'], ['bouteille', 'fles'], ['à confirmer', 'te bevestigen'], ['à définir', 'te bepalen'], ['validé', 'gevalideerd'], ['en cours', 'bezig']]
      : [['Rapport détaillé — ', 'Detailed report — '], ['Rapport général', 'General report'], ['Étage ', 'Shelf '], ['Frigo ', 'Fridge '], ['bouteilles', 'bottles'], ['bouteille', 'bottle'], ['à confirmer', 'to confirm'], ['à définir', 'to be defined'], ['validé', 'validated'], ['en cours', 'in progress']];
    replacements.forEach(([from, to]) => { result = result.replaceAll(from, to); }); return result;
  }
  function apply(root = document.body) {
    const language = locale();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode(node) {
      return node.parentElement?.closest('script,style') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    }});
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const source = originals.get(node) ?? node.nodeValue; if (!originals.has(node)) originals.set(node, source);
      node.nodeValue = translate(source, language);
    });
    root.querySelectorAll?.('[placeholder],[title],[aria-label]').forEach(element => attributes.forEach(attribute => {
      if (!element.hasAttribute(attribute)) return; const key = `fuseFr${attribute}`;
      const source = element.dataset[key] ?? element.getAttribute(attribute); if (!(key in element.dataset)) element.dataset[key] = source;
      element.setAttribute(attribute, translate(source, language));
    }));
    document.documentElement.lang = language === 'nl' ? 'nl' : language === 'en' ? 'en' : 'fr';
  }
  const chooser = document.createElement('nav'); chooser.className = 'language-switcher';
  chooser.setAttribute('aria-label', 'Language');
  chooser.innerHTML = '<button type="button" data-lang="fr">FR</button><button type="button" data-lang="nl">NL</button><button type="button" data-lang="en">ENG</button>';
  const style = document.createElement('style');
  style.textContent = '.language-switcher{position:fixed;right:12px;bottom:12px;z-index:30;display:flex;background:#111;border:1px solid #555;border-radius:999px;padding:2px;box-shadow:0 4px 14px #0005}.language-switcher button{padding:4px 7px;border-radius:999px;background:transparent;color:#fff;font-size:11px;letter-spacing:.04em}.language-switcher button.active{background:#fff;color:#000}.profile-demence .language-switcher{background:#fff;border-color:#fff}.profile-demence .language-switcher button{color:#111}.profile-demence .language-switcher button.active{background:#ff72b3;color:#fff}@media print{.language-switcher{display:none}}';
  document.head.append(style); document.body.append(chooser);
  function choose(language) {
    localStorage.setItem('fuse-language', language); chooser.querySelectorAll('button').forEach(button => button.classList.toggle('active', button.dataset.lang === language)); apply();
  }
  chooser.addEventListener('click', event => { const button = event.target.closest('button'); if (button) choose(button.dataset.lang); });
  const observer = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => { if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) apply(node.nodeType === Node.TEXT_NODE ? node.parentElement : node); })));
  observer.observe(document.body, { childList: true, subtree: true }); choose(locale());
})();
