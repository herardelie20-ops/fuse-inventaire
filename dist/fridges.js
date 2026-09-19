(() => {
  const place=document.querySelector('#bar'), select=document.querySelector('#fridge'), label=document.querySelector('#fridgeLabel');
  const options=items=>items.map(x=>`<option>${x}</option>`).join('');
  const numbered=n=>Array.from({length:n},(_,i)=>`Frigo ${i+1}`);
  const bar1Fridges=[...numbered(12),'Frigo Coca 13','Frigo Coca 14','Bahut 1','Bahut 2','Frigo Redbull 17'];
  const barUnits={
    'Bar 1 - Main room':bar1Fridges,
    'Bar 2 - Main room':[...numbered(7),'Frigo Coca 8','Frigo Coca 9','Frigo Redbull','Frigo Salitos'],
    'Bar 3 - Motion':[...numbered(10),'Bahut 11','Frigo Redbull 12','Frigo Redbull 13'],
    'Bar 4 - Cosmos':[...numbered(6),'Frigo Coca','Frigo Redbull']
  };
  window.FUSE_UNITS_BY_PLACE=barUnits;
  const products=window.FUSE_PRODUCTS || [];
  const softsAndBeers=[...(window.FUSE_SOFTS || []), ...(window.FUSE_BEERS || [])];
  const barStock=window.FUSE_BAR_STOCK || [];
  const alcoholReserve=window.FUSE_ALCOHOL_RESERVE || [];
  const stockDrinks={
    'Stock toilettes':['Redbull','Redbull rouge','Redbull vert','Redbull Zero'],
    'Stock principal et réserve vidange':['Machine à glaçons'],
    'Réserve alcool':alcoholReserve,
    'Stock Bar 1 - Main room':[...softsAndBeers, ...barStock],
    'Stock Bar 2 - Main room':barStock,
    'Stock chambre froide - Bar 2 Main room':softsAndBeers,
    'Stock Bar 3 - Motion':barStock,
    'Stock Bar 4 - Cosmos':barStock,
    'Stock escalier - 1er étage':['Liste boissons escalier à compléter'],
    'Stock Motion - sous plancher':['Liste boissons Motion à compléter'],
    "Stock étage Cosmos - sous l'escalier":['Liste boissons étage Cosmos à compléter']
  };
  function update(){
    const v=place.value; label.childNodes[0].nodeValue='Frigo';
    if(barUnits[v]) select.innerHTML=options(barUnits[v]);
    else { label.childNodes[0].nodeValue='Boisson'; select.innerHTML=options(stockDrinks[v]||['Liste de boissons à compléter']); }
  }
  place.addEventListener('change',update); update();
})();
