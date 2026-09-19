(() => {
  const list=document.createElement('datalist'); list.id='fuseProducts';
  list.innerHTML=window.FUSE_PRODUCTS.map(p=>`<option value="${p}">`).join('');
  document.body.append(list);
  const apply=()=>document.querySelectorAll('#lines input[placeholder]').forEach(input=>{
    input.setAttribute('list','fuseProducts');
    input.onchange=()=>{
      const stock=!document.querySelector('#bar').value.startsWith('Bar ');
      const pack=window.FUSE_PACK_SIZES[input.value];
      const quantityLabel=input.closest('.line').querySelectorAll('label')[1];
      if(stock&&pack) quantityLabel.childNodes[0].nodeValue=`Bacs / paquets (${pack})`;
      else quantityLabel.childNodes[0].nodeValue='Qté';
    };
  });
  new MutationObserver(apply).observe(document.querySelector('#lines'),{childList:true,subtree:true});
  apply();
})();
