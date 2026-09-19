(() => {
  const place = document.querySelector('#bar');
  const fridge = document.querySelector('#fridge');
  const shelf = document.querySelector('#shelf');
  const lines = document.querySelector('#lines');
  const list = document.querySelector('#fuseProducts');
  const drinkCard = lines.closest('.card');
  const hint = document.createElement('p');
  hint.className = 'small';
  hint.id = 'profileDrinkHint';
  drinkCard.querySelector('#lines').before(hint);

  const fusePlan = {
    'Bar 1 - Main room': {
      'Frigo 1': {'Étage 1 — haut':'Eau plate','Étage 2':'Eau plate','Étage 3 — rez-de-chaussée':'Eau pétillante'},
      'Frigo 2': {'Étage 1 — haut':'Stella','Étage 2':'Corona · Salitos','Étage 3 — rez-de-chaussée':"Jus de pomme · Jus d'orange · Fuze Tea · Tonic"},
      'Frigo 3': {'Étage 1 — haut':'Leffe blonde · Maté · Fanta','Étage 2':'Jupiler Zero · Hoegaarden rosé · Ginger beer','Étage 3 — rez-de-chaussée':'Duvel'},
      'Frigo 4': {'Étage 1 — haut':'Jupiler Zero · Salitos · Corona','Étage 2':'Redbull Zero · Fanta · Coca-Cola Zero','Étage 3 — rez-de-chaussée':'Leffe blonde · Hoegaarden rosé · Fanta'},
      'Frigo 5': {'Étage 1 — haut':'Eau plate','Étage 2':'Eau pétillante','Étage 3 — rez-de-chaussée':'Ginger beer · Fuze Tea'},
      'Frigo 6': {'Étage 1 — haut':'Eau plate','Étage 2':'Eau plate','Étage 3 — rez-de-chaussée':"Maté · Jus de pomme · Jus d'orange · Tonic"},
      'Frigo 7': {'Étage 1 — haut':'Sprite · Fanta · Maté','Étage 2':'Stella · Hoegaarden rosé · Jupiler Zero','Étage 3 — rez-de-chaussée':'Salitos · Corona · Leffe blonde'},
      'Frigo 8': {'Étage 1 — haut':'Jupiler','Étage 2':'Jupiler','Étage 3 — rez-de-chaussée':'Duvel'},
      'Frigo 9': {'Étage 1 — haut':'Jupiler','Étage 2':'Jupiler','Étage 3 — rez-de-chaussée':'Duvel'},
      'Frigo 10': {'Étage 1 — haut':'Eau plate','Étage 2':'Eau plate','Étage 3 — rez-de-chaussée':'Eau plate'},
      'Frigo 11': {'Étage 1 — haut':'Coca-Cola · Eau pétillante','Étage 2':'Coca-Cola Zero','Étage 3 — rez-de-chaussée':'Stella · Hoegaarden rosé · Leffe blonde'},
      'Frigo 12': {'Étage 1 — haut':'Redbull','Étage 2 — bas':'Vin blanc · Vin rosé · Cava · Champagne · Jägermeister'}
    },
    'Bar 3 - Motion': {
      'Frigo 1': {'Étage 1 — haut':'Eau plate','Étage 2':'Eau plate','Étage 3 — rez-de-chaussée':'Eau plate'},
      'Frigo 3': {'Étage 1 — haut':'Victoria · Hoegaarden rosé · Jupiler Zero · Leffe blonde','Étage 2 — bas':'Vin blanc · Vin rosé · Cava · Champagne · Jägermeister'},
      'Frigo Redbull 12': {'Étage 1 — haut':'Redbull','Étage 2 — bas':'Redbull'},
      'Frigo Redbull 13': {'Étage 1 — haut':'Redbull vert · Redbull rouge · Redbull Zero','Étage 2 — bas':'Redbull vert · Redbull rouge · Redbull Zero'}
    },
    'Bar 4 - Cosmos': {
      'Frigo 1': {'Étage 1 — haut':'Coca-Cola Zero','Étage 2':'Coca-Cola Zero','Étage 3 — rez-de-chaussée':'Coca-Cola Zero'},
      'Frigo 5': {'Étage 1 — haut':"Jus de pomme · Jus d'orange · Fuze Tea · Tonic · Sprite · Fanta",'Étage 2':'Coca-Cola','Étage 3':'Redbull · Ginger beer'},
      'Frigo 6': {'Étage 1 — haut':'Coca-Cola','Étage 2':'Coca-Cola','Étage 3':'Coca-Cola','Étage 4 — bas':'Coca-Cola'}
    }
  };
  const demencePlan = {
    'Bar 1 - Main room': {
      'Frigo 8': {'Étage 1 — haut':'Stella','Étage 2':'Coca-Cola Zero','Étage 3 — rez-de-chaussée':'Duvel'},
      'Frigo 9': {'Étage 1 — haut':'Stella','Étage 2':'Eau pétillante','Étage 3 — rez-de-chaussée':'Duvel'}
    }
  };
  const bahutPlans = {
    fuse: {
      'Bar 1 - Main room': {
        'Bahut 1': '18 bacs de Jupiler',
        'Bahut 2': '18 bacs de Jupiler'
      },
      'Bar 3 - Motion': {
        'Bahut 11': '8 bacs d’eau · 7 bacs de Coca-Cola'
      }
    },
    'la-demence': {
      'Bar 1 - Main room': {
        'Bahut 1': 'Aucun bac de Jupiler',
        'Bahut 2': '9 bacs de Coca-Cola · 8 bacs d’eau plate'
      },
      'Bar 3 - Motion': {
        'Bahut 11': '8 bacs d’eau · 7 bacs de Coca-Cola'
      }
    }
  };
  const profileProducts = profile => profile === 'la-demence' ? [...new Set([...window.FUSE_PRODUCTS, 'Velvet'])].sort((a,b)=>a.localeCompare(b,'fr')) : window.FUSE_PRODUCTS;
  function proposedDrink(profile = window.FUSE_CURRENT_PROFILE) {
    const plan = profile === 'la-demence' ? demencePlan : fusePlan;
    return plan[place.value]?.[fridge.value]?.[shelf.value] || '';
  }
  window.FUSE_EXPECTED_DRINK = (profile, selectedPlace, selectedFridge, selectedShelf) => {
    const plan = profile === 'la-demence' ? demencePlan : fusePlan;
    return plan[selectedPlace]?.[selectedFridge]?.[selectedShelf] || '';
  };
  window.FUSE_EXPECTED_BAHUT = (profile, selectedPlace, selectedFridge) => bahutPlans[profile]?.[selectedPlace]?.[selectedFridge] || '';
  function labelShelves() {
    [...shelf.options].forEach(option => {
      const mapped = window.FUSE_EXPECTED_DRINK(window.FUSE_CURRENT_PROFILE || 'fuse', place.value, fridge.value, option.value);
      option.textContent = mapped ? `${option.value} · ${mapped}` : `${option.value} · à définir`;
    });
  }
  function refresh() {
    const products = profileProducts(window.FUSE_CURRENT_PROFILE || 'fuse');
    list.innerHTML = products.map(product => `<option value="${product}">`).join('');
    labelShelves();
    const isBahut = /^Bahut\b/i.test(fridge.value);
    const proposal = isBahut ? window.FUSE_EXPECTED_BAHUT(window.FUSE_CURRENT_PROFILE || 'fuse', place.value, fridge.value) : proposedDrink();
    hint.textContent = proposal ? `Plan ${window.FUSE_CURRENT_PROFILE === 'la-demence' ? 'La Demence' : 'Fuse'} · ${fridge.value}${isBahut ? '' : `, ${shelf.value}`} : ${proposal}` : `Plan ${window.FUSE_CURRENT_PROFILE === 'la-demence' ? 'La Demence' : 'Fuse'} : emplacement à configurer.`;
    const first = lines.querySelector('input[placeholder]');
    if (!isBahut && proposal && first && (!first.value || first.dataset.profileSuggested === 'true')) { first.value = proposal; first.dataset.profileSuggested = 'true'; }
    if ((!proposal || isBahut) && first?.dataset.profileSuggested === 'true') { first.value = ''; delete first.dataset.profileSuggested; }
  }
  [place, fridge, shelf].forEach(control => control.addEventListener('change', () => setTimeout(refresh, 0)));
  document.addEventListener('fuse-profile-changed', refresh);
  new MutationObserver(refresh).observe(lines, {childList:true});
  refresh();
})();
