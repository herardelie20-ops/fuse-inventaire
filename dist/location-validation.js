(() => {
  const place=document.querySelector('#bar'), save=document.querySelector('#save');
  const panel=document.createElement('section');panel.className='card';
  panel.innerHTML='<b>Validation du lieu</b><p class="small" id="placeStatus">À valider lorsque tous les frigos ou stocks du lieu sont terminés.</p><button class="primary" id="validatePlace" type="button">Valider ce lieu manuellement</button>';
  save.after(panel);
  const status=panel.querySelector('#placeStatus'), button=panel.querySelector('#validatePlace');
  function key(){return `fuse-location-${place.value}`}
  function refresh(){const done=localStorage.getItem(key());if(done){status.textContent=`✓ ${place.value} validé manuellement le ${new Date(done).toLocaleString('fr-BE')}.`;status.style.color='#91f5ae';button.textContent='Lieu validé';button.disabled=true}else{status.textContent='À valider lorsque tous les frigos ou stocks du lieu sont terminés.';status.style.color='';button.textContent='Valider ce lieu manuellement';button.disabled=false}}
  button.onclick=()=>{if(confirm(`Valider ${place.value} ?`)){localStorage.setItem(key(),new Date().toISOString());refresh();document.dispatchEvent(new Event('fuse:location-finished'))}};
  place.addEventListener('change',refresh);refresh();
})();
