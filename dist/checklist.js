(() => {
  const style=document.createElement('style');style.textContent='.status-code{margin:12px 0;padding:10px 12px;border-radius:8px;font-weight:750}.status-code.green{background:#123d24;color:#91f5ae}.status-code.orange{background:#4b3210;color:#ffd084}.status-code.red{background:#4a1717;color:#ffaaa4}';document.head.append(style);
  const save = document.querySelector('#save');
  const panel = document.createElement('section');
  panel.className = 'card';
  panel.innerHTML = `<b>Contrôle du frigo</b><p class="small">Quantité et alignement sont contrôlés séparément.</p>
    <div id="checks" style="display:grid;gap:8px;margin:12px 0"><div>○ Photo initiale prise</div><div>○ Boissons comptées</div><div>○ État final validé</div></div>
    <div id="stateSummary" class="status-code green">✓ Conforme : quantités correctes et lignes droites.</div>
    <label>Quantité de boissons<select id="quantityState"><option value="ok">Quantité correcte</option><option value="missing">Boissons manquantes</option><option value="extra">Boissons en trop</option><option value="mixed">Boissons manquantes et en trop</option></select></label>
    <label>Alignement des lignes<select id="alignmentState"><option value="straight">Lignes droites</option><option value="crooked">Lignes de travers</option></select></label>
    <label id="issueLabel" class="hidden">Détail des écarts<input id="issue" placeholder="Ex. 3 Jupiler manquantes, ligne Coca de travers"></label>
    <label>Statut de résolution<select id="resolution"><option value="open">À corriger</option><option value="corrected">Corrigé</option><option value="validated">Validé tel quel</option></select></label>`;
  save.before(panel);
  const checks = panel.querySelector('#checks').children, quantity=panel.querySelector('#quantityState'), alignment=panel.querySelector('#alignmentState'), resolution=panel.querySelector('#resolution'), issueLabel=panel.querySelector('#issueLabel'), summary=panel.querySelector('#stateSummary');
  function refresh(){
    const hasPhoto=document.querySelector('#photo').style.display==='block';
    checks[0].textContent=hasPhoto?'✓ Photo initiale prise':'○ Photo initiale prise';
    checks[1].textContent=document.querySelector('#report').classList.contains('hidden')?'○ Boissons comptées':'✓ Boissons comptées';
    const hasError=quantity.value!=='ok'||alignment.value!=='straight';
    if(quantity.value==='missing'||quantity.value==='extra'||quantity.value==='mixed'){summary.className='status-code red';summary.textContent=quantity.value==='missing'?'● Rouge : boissons manquantes.':quantity.value==='extra'?'● Rouge : boissons en trop.':'● Rouge : boissons manquantes et en trop.'}
    else if(alignment.value==='crooked'){summary.className='status-code orange';summary.textContent='● Orange : quantités correctes, mais lignes de travers.'}
    else if(resolution.value==='open'){summary.className='status-code orange';summary.textContent='● Orange : correction à faire.'}
    else {summary.className='status-code green';summary.textContent='✓ Vert : quantités correctes, lignes droites et frigo validé.'}
    const complete=!hasError||resolution.value==='validated'||resolution.value==='corrected';
    checks[2].textContent=complete?'✓ État final validé':'○ État du frigo à finaliser';
    issueLabel.classList.toggle('hidden',!hasError);
  }
  [quantity,alignment,resolution].forEach(x=>x.onchange=refresh);
  save.addEventListener('click',()=>setTimeout(()=>{refresh();const key=`${bar.value}-${fridge.value}`;const completed=quantity.value==='ok'&&alignment.value==='straight'||resolution.value==='validated'||resolution.value==='corrected';localStorage.setItem(`fuse-check-${key}`,JSON.stringify({quantity:quantity.value,alignment:alignment.value,resolution:resolution.value,issue:panel.querySelector('#issue').value,completed,updatedAt:new Date().toISOString()}));document.dispatchEvent(new Event('fuse:fridge-finished'))},0));
  document.querySelector('#cameraInput').addEventListener('change',refresh);document.querySelector('#fileInput').addEventListener('change',refresh);refresh();
})();
