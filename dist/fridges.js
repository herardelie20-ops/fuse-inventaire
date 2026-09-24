(() => {
  const place=document.querySelector('#bar'), select=document.querySelector('#fridge'), label=document.querySelector('#fridgeLabel');
  const options=items=>items.map(x=>`<option>${x}</option>`).join('');
  const numbered=n=>Array.from({length:n},(_,i)=>`Frigo ${i+1}`);
  const bar1Fridges=[...numbered(12),'Frigo Coca 13','Frigo Coca 14','Frigo 15 (Bahut)','Frigo 16 (Bahut)','Frigo Redbull 17'];
  const barUnits={
    'Bar 1 - Main room':bar1Fridges,
    'Bar 2 - Main room':[...numbered(7),'Frigo Coca 8','Frigo Coca 9','Frigo Redbull','Frigo Salitos'],
    'Bar 3 - Motion':['Frigo 1','Frigo 2','Frigo 3','Frigo 4','Frigo 5','Frigo 6','Frigo 7','Frigo 8','Frigo 9 (Red Bull)','Frigo 10','Frigo 11 (Bahut)','Frigo Redbull 12','Frigo Redbull 13'],
    'Bar 4 - Cosmos':['Frigo 1','Frigo 2','Frigo 3','Frigo 4','Frigo 5 (Red Bull)','Frigo 6 (Coca)']
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
    'Stock Bar 1 - Main room':['Tonic','Coca-Cola',"Jus d'orange","Jus de pomme",'Eau plate','Eau pétillante','Redbull','Redbull rouge','Redbull vert','Redbull Zero','Corona','Duvel','Salitos','Jupiler Zero'],
    'Stock Bar 2 - Main room':barStock,
    'Stock chambre froide - Bar 2 Main room':softsAndBeers,
    'Stock Bar 3 - Motion':barStock,
    'Stock Bar 4 - Cosmos':barStock,
    'Stock escalier - 1er étage':['Liste boissons escalier à compléter'],
    'Stock Motion - sous plancher':['Liste boissons Motion à compléter'],
    "Stock étage Cosmos - sous l'escalier":['Liste boissons étage Cosmos à compléter']
  };
  const visibleUnits = value => barUnits[value];
  function update(){
    const v=place.value, previous=select.value; label.childNodes[0].nodeValue='Frigo';
    if(barUnits[v]) { const units=visibleUnits(v); select.innerHTML=options(units); if(units.includes(previous)) select.value=previous; }
    else { label.childNodes[0].nodeValue='Boisson'; select.innerHTML=options(stockDrinks[v]||['Liste de boissons à compléter']); }
  }
  place.addEventListener('change',update); document.addEventListener('fuse-profile-changed',update); window.addEventListener('load',update); update();
})();
