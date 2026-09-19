(() => {
  const place=document.querySelector('#bar'), select=document.querySelector('#fridge'), label=document.querySelector('#fridgeLabel');
  const options=items=>items.map(x=>`<option>${x}</option>`).join('');
  const numbered=n=>Array.from({length:n},(_,i)=>`Frigo ${i+1}`);
  const bar1Fridges=[...numbered(12),'Frigo Coca 13','Frigo Coca 14','Bahut 1','Bahut 2','Frigo Redbull 17'];
  const products=window.FUSE_PRODUCTS || [];
  const softsAndBeers=[...(window.FUSE_SOFTS || []), ...(window.FUSE_BEERS || [])];
  const barStock=window.FUSE_BAR_STOCK || [];
  const alcoholReserve=window.FUSE_ALCOHOL_RESERVE || [];
  const stockDrinks={
    'Stock toilettes':['Redbull','Redbull rouge','Redbull vert','Redbull Zero'],
    'Réserve alcool':alcoholReserve,
    'Stock Bar 1 - Main room':[...softsAndBeers, ...barStock],
    'Stock Bar 2 - Main room':barStock,
    'Stock chambre froide - Bar 2 Main room':softsAndBeers,
    'Stock Bar 3 - Motion':barStock,
    'Stock Bar 4 - Cosmos':barStock,
    'Stock escalier - 1er étage':['Liste boissons escalier à compléter'],
    'Stock Motion - sous plancher':['Liste boissons Motion à compléter'],
    'Stock 2e étage - sous escalier':['Liste boissons 2e étage à compléter']
  };
  function update(){
    const v=place.value; label.childNodes[0].nodeValue='Frigo';
    if(v.startsWith('Bar 1')) select.innerHTML=options(bar1Fridges);
    else if(v.startsWith('Bar 2')) select.innerHTML=options([...numbered(12),'Frigo Coca','Frigo Redbull','Frigo Salitos']);
    else if(v.startsWith('Bar 3')) select.innerHTML=options([...numbered(8),'Frigo Bayu','Frigo Coca 1','Frigo Coca 2','Frigo Coca 3','Frigo Redbull 1','Frigo Redbull 2']);
    else if(v.startsWith('Bar 4')) select.innerHTML=options([...numbered(4),'Frigo Coca','Frigo Redbull']);
    else { label.childNodes[0].nodeValue='Boisson'; select.innerHTML=options(stockDrinks[v]||['Liste de boissons à compléter']); }
  }
  place.addEventListener('change',update); update();
})();
