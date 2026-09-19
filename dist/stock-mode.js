(() => {
  const place=document.querySelector('#bar'), productCard=document.querySelector('#lines').closest('.card'), save=document.querySelector('#save');
  const panel=document.createElement('section');panel.className='card hidden';
  panel.innerHTML='<b>Comptage du stock</b><p class="small">L’IA proposera les quantités à partir de la photo. Tu confirmes ou corriges chaque ligne.</p><div id="stockRows"></div><button class="secondary" id="addStock">+ Ajouter une boisson</button>';
  save.before(panel);
  const rows=panel.querySelector('#stockRows');
  const currentProducts=()=>[...document.querySelector('#fridge').options].map(x=>x.text).filter(x=>!x.includes('Liste'));
  function row(product=''){
    const items=currentProducts(); const d=document.createElement('div');d.style.cssText='border-top:1px solid #555;padding:12px 0;margin-top:8px';
    d.innerHTML=`<label>Boisson<select class="stockProduct">${items.map(x=>{const n=window.FUSE_PACK_SIZES[x];return `<option value="${x}"${x===product?' selected':''}>${x}${n?` (${n})`:''}</option>`}).join('')}</select></label><div class="actions"><label>Bacs / paquets pleins<input class="full" type="number" min="0" value="0"></label><label>Unités bac entamé<input class="open" type="number" min="0" value="0"></label></div><p class="small pack"></p><button class="secondary ai" type="button">Résultat IA : à analyser</button> <button class="primary validate" type="button">Valider</button>`;
    const info=()=>{const p=d.querySelector('.stockProduct').value,n=window.FUSE_PACK_SIZES[p];d.querySelector('.pack').textContent=n?`Conditionnement : ${n} unités. Total : ${(Number(d.querySelector('.full').value)*n)+Number(d.querySelector('.open').value)} unités.`:'Conditionnement à préciser - saisie manuelle.'};
    d.querySelectorAll('input,.stockProduct').forEach(x=>x.oninput=info);d.querySelector('.stockProduct').onchange=info;d.querySelector('.validate').onclick=()=>{d.style.background='#123d24';d.querySelector('.validate').textContent='✓ Validé';d.querySelector('.validate').disabled=true};info();rows.append(d);
  }
  panel.querySelector('#addStock').onclick=()=>row();
  function mode(){const stock=!place.value.startsWith('Bar ');productCard.classList.toggle('hidden',stock);panel.classList.toggle('hidden',!stock);if(stock&&!rows.children.length)row();}
  place.addEventListener('change',()=>setTimeout(mode,0));mode();
})();
