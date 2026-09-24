(() => {
  const place = document.querySelector('#bar');
  const fridge = document.querySelector('#fridge');
  const shelf = document.querySelector('#shelf');
  const lines = document.querySelector('#lines');
  const list = document.querySelector('#fuseProducts');
  const drinkCard = lines.closest('.card');
  window.FUSE_MAX_BOTTLES_PER_LINE = 7;
  const hint = document.createElement('p');
  hint.className = 'small';
  hint.id = 'profileDrinkHint';
  drinkCard.querySelector('#lines').before(hint);

  const fusePlan = {
    'Bar 1 - Main room': {
      'Frigo 1': {'Étage 1 — haut':'Eau plate','Étage 2':'Eau plate','Étage 3 — rez-de-chaussée':'Eau pétillante'},
      'Frigo 2': {'Étage 1 — haut':'Stella','Étage 2':'Corona · Salitos','Étage 3 — rez-de-chaussée':"Jus d'orange Minute Maid · Jus de pomme Minute Maid"},
      'Frigo 3': {'Étage 1 — haut':'Fanta · Ginger beer · Leffe blonde','Étage 2':'Hoegaarden rosé · Maté · Jupiler Zero','Étage 3 — rez-de-chaussée':'Duvel'},
      'Frigo 4': {'Étage 1 — haut':'Jupiler Zero · Salitos · Corona','Étage 2':'Redbull Zero · Fanta · Coca-Cola Zero','Étage 3 — rez-de-chaussée':'Leffe blonde · Hoegaarden rosé · Fanta'},
      'Frigo 5': {'Étage 1 — haut':'Eau plate','Étage 2':'Eau pétillante','Étage 3 — rez-de-chaussée':'Fuze Tea'},
      'Frigo 6': {'Étage 1 — haut':'Eau Chaudfontaine','Étage 2':'Coca-Cola','Étage 3 — rez-de-chaussée':"Jus d'orange Minute Maid · Jus de pomme Minute Maid"},
      'Frigo 7': {'Étage 1 — haut':'Sprite · Fanta · Maté','Étage 2':'Stella · Hoegaarden rosé · Jupiler Zero','Étage 3 — rez-de-chaussée':'Salitos · Corona · Leffe blonde'},
      'Frigo 8': {'Étage 1 — haut':'Stella','Étage 2':'Stella','Étage 3 — rez-de-chaussée':'Duvel'},
      'Frigo 9': {'Étage 1 — haut':'Stella','Étage 2':'Stella','Étage 3 — rez-de-chaussée':'Duvel'},
      'Frigo 10': {'Étage 1 — haut':'Eau plate','Étage 2':'Eau plate','Étage 3 — rez-de-chaussée':'Eau plate'},
      'Frigo 11': {'Étage 1 — haut':'Eau plate · Eau pétillante','Étage 2':'Coca-Cola · Coca-Cola Zero','Étage 3 — rez-de-chaussée':'Leffe blonde · Hoegaarden rosé · Stella'},
      'Frigo 12': {'Étage 1 — haut':'Redbull','Étage 2':'Redbull','Étage 3 — rez-de-chaussée':'Martini Prosecco · Vodka Grey Goose · Vin blanc · Vin rosé'},
      'Frigo Coca 13': {'Étage 1 — haut':'Coca-Cola','Étage 2':'Coca-Cola','Étage 3 — rez-de-chaussée':'Coca-Cola'},
      'Frigo Coca 14': {'Étage 1 — haut':'Coca-Cola','Étage 2':'Coca-Cola','Étage 3 — rez-de-chaussée':'Coca-Cola'}
    },
    'Bar 3 - Motion': {
      'Frigo 1': {'Étage 1 — haut':'Eau plate','Étage 2':'Eau plate','Étage 3 — rez-de-chaussée':'Eau plate'},
      'Frigo 2': {'Étage 1 — haut':'Eau plate','Étage 2':'Eau plate','Étage 3 — rez-de-chaussée':'Eau plate'},
      'Frigo 3': {'Étage 1 — haut':'Victoria · Hoegaarden rosé · Jupiler Zero · Leffe blonde','Étage 2 — bas':'Vin blanc · Vin rosé · Cava · Champagne · Jägermeister'},
      'Frigo 4': {'Étage 1 — haut':'Jupiler','Étage 2':'Jupiler','Étage 3 — rez-de-chaussée':'Duvel'},
      'Frigo 5': {'Étage 1 — haut':'Stella','Étage 2':'Fuze Tea','Étage 3 — rez-de-chaussée':'Tonic'},
      'Frigo 6': {'Étage 1 — haut':'Maté','Étage 2':'Sprite','Étage 3 — rez-de-chaussée':'Fanta · Fuze Tea'},
      'Frigo 7': {'Étage 1 — haut':'Coca-Cola','Étage 2':'Stella','Étage 3 — rez-de-chaussée':'Duvel'},
      'Frigo 8': {'Étage 1 — haut':'Coca-Cola','Étage 2':'Coca-Cola','Étage 3 — rez-de-chaussée':'Fanta'},
      'Frigo 11 (Bahut)': {'Étage 1 — haut':'Coca-Cola','Étage 2':'Coca-Cola Zero','Étage 3 — rez-de-chaussée':'Corona'},
      'Frigo Redbull 12': {'Étage 1 — haut':'Redbull','Étage 2 — bas':'Redbull'},
      'Frigo Redbull 13': {'Étage 1 — haut':'Redbull vert · Redbull rouge · Redbull Zero','Étage 2 — bas':'Redbull vert · Redbull rouge · Redbull Zero'}
    },
    'Bar 4 - Cosmos': {
      'Frigo 1': {'Étage 1 — haut':'Coca-Cola','Étage 2':'Coca-Cola','Étage 3 — rez-de-chaussée':'Coca-Cola'},
      'Frigo 2': {'Étage 1 — haut':'Jupiler','Étage 2':'Jupiler','Étage 3':'Jupiler','Étage 4 — bas':'Jupiler'},
      'Frigo 3': {'Étage 1 — haut':'Eau plate','Étage 2':'Eau pétillante','Étage 3 — rez-de-chaussée':'Corona · Duvel'},
      'Frigo 4': {'Étage 1 — haut':'Eau plate','Étage 2':'Eau pétillante','Étage 3 — rez-de-chaussée':'Leffe blonde · Hoegaarden rosé · Corona'},
      'Frigo 5 (Red Bull)': {'Étage 1 — haut':'Sprite · Fuze Tea · Tonic · Fanta','Étage 2':'Eau plate','Étage 3':'Eau plate','Étage 4':'Fanta','Étage 5':'Redbull','Étage 6 — bas':'Maté · Ginger beer · Redbull Zero'},
      'Frigo 6 (Coca)': {'Étage 1 — haut':'Coca-Cola','Étage 2':'Coca-Cola','Étage 3':'Coca-Cola','Étage 4 — bas':'Coca-Cola'}
    }
  };
  const demencePlan = {
    'Bar 3 - Motion': {
      'Frigo 1': {'Étage 1 — haut':'Eau plate','Étage 2':'Eau plate','Étage 3 — rez-de-chaussée':'Eau plate'},
      'Frigo 2': {'Étage 1 — haut':'Eau plate','Étage 2':'Eau plate','Étage 3 — rez-de-chaussée':'Eau plate'},
      'Frigo 3': {'Étage 1 — haut':'Victoria · Hoegaarden rosé · Jupiler Zero · Leffe blonde','Étage 2 — bas':'Vin blanc · Vin rosé · Cava · Champagne · Jägermeister'},
      'Frigo 4': {'Étage 1 — haut':'Jupiler','Étage 2':'Jupiler','Étage 3 — rez-de-chaussée':'Duvel'},
      'Frigo 5': {'Étage 1 — haut':'Stella','Étage 2':'Fuze Tea','Étage 3 — rez-de-chaussée':'Tonic'},
      'Frigo 6': {'Étage 1 — haut':'Maté','Étage 2':'Sprite','Étage 3 — rez-de-chaussée':'Fanta · Fuze Tea'},
      'Frigo 7': {'Étage 1 — haut':'Coca-Cola','Étage 2':'Stella','Étage 3 — rez-de-chaussée':'Duvel'},
      'Frigo 8': {'Étage 1 — haut':'Coca-Cola','Étage 2':'Coca-Cola','Étage 3 — rez-de-chaussée':'Fanta'},
      'Frigo 11 (Bahut)': {'Étage 1 — haut':'Coca-Cola','Étage 2':'Coca-Cola Zero','Étage 3 — rez-de-chaussée':'Corona'}
    },
    'Bar 4 - Cosmos': {
      'Frigo 2': {'Étage 1 — haut':'Stella','Étage 2':'Stella','Étage 3':'Stella','Étage 4 — bas':'Stella'},
      'Frigo 3': {'Étage 1 — haut':'Eau plate','Étage 2':'Eau pétillante','Étage 3 — rez-de-chaussée':'Corona · Duvel'},
      'Frigo 4': {'Étage 1 — haut':'Eau plate','Étage 2':'Eau pétillante','Étage 3 — rez-de-chaussée':'Leffe blonde · Hoegaarden rosé · Corona'},
      'Frigo 5 (Red Bull)': {'Étage 1 — haut':'Sprite · Fuze Tea · Tonic · Fanta','Étage 2':'Eau plate','Étage 3':'Eau plate','Étage 4':'Fanta','Étage 5':'Redbull','Étage 6 — bas':'Maté · Ginger beer · Redbull Zero'},
      'Frigo 6 (Coca)': {'Étage 1 — haut':'Coca-Cola','Étage 2':'Coca-Cola','Étage 3':'Coca-Cola','Étage 4 — bas':'Coca-Cola'}
    },
    'Bar 1 - Main room': {
      'Frigo 5': {'Étage 1 — haut':'Eau plate','Étage 2':'Eau pétillante','Étage 3 — rez-de-chaussée':'Fuze Tea'},
      'Frigo 8': {'Étage 1 — haut':'Stella','Étage 2':'Stella','Étage 3 — rez-de-chaussée':'Duvel'},
      'Frigo 9': {'Étage 1 — haut':'Stella','Étage 2':'Stella','Étage 3 — rez-de-chaussée':'Duvel'},
      'Frigo 10': {'Étage 1 — haut':'Eau plate','Étage 2':'Eau plate','Étage 3 — rez-de-chaussée':'Eau plate'},
      'Frigo 11': {'Étage 1 — haut':'Eau plate · Eau pétillante','Étage 2':'Coca-Cola · Coca-Cola Zero','Étage 3 — rez-de-chaussée':'Leffe blonde · Hoegaarden rosé · Stella'},
      'Frigo 12': {'Étage 1 — haut':'Redbull','Étage 2':'Redbull','Étage 3 — rez-de-chaussée':'Martini Prosecco · Vodka Grey Goose · Vin blanc · Vin rosé'},
      'Frigo 7': {'Étage 1 — haut':'Sprite · Fanta · Maté','Étage 2':'Stella · Hoegaarden rosé · Jupiler Zero','Étage 3 — rez-de-chaussée':'Salitos · Corona · Leffe blonde'},
      'Frigo 6': {'Étage 1 — haut':'Eau Chaudfontaine','Étage 2':'Coca-Cola','Étage 3 — rez-de-chaussée':"Jus d'orange Minute Maid · Jus de pomme Minute Maid"},
      'Frigo 2': {'Étage 1 — haut':'Stella','Étage 2':'Corona · Salitos','Étage 3 — rez-de-chaussée':"Jus d'orange Minute Maid · Jus de pomme Minute Maid"},
      'Frigo 3': {'Étage 1 — haut':'Fanta · Ginger beer · Leffe blonde','Étage 2':'Hoegaarden rosé · Maté · Jupiler Zero','Étage 3 — rez-de-chaussée':'Duvel'},
      'Frigo 4': {'Étage 1 — haut':'Jupiler Zero · Salitos · Corona','Étage 2':'Redbull · Fanta · Coca-Cola','Étage 3 — rez-de-chaussée':'Leffe blonde · Cava · Hoegaarden rosé · Victoria · Sprite'},
      'Frigo 1': {'Étage 1 — haut':'Eau plate','Étage 2':'Eau plate','Étage 3 — rez-de-chaussée':'Eau pétillante'},
      'Frigo Coca 13': {'Étage 1 — haut':'Fanta','Étage 2':'Fanta','Étage 3 — rez-de-chaussée':'Fanta'},
      'Frigo Coca 14': {'Étage 1 — haut':'Fanta','Étage 2':'Fanta','Étage 3 — rez-de-chaussée':'Coca-Cola'}
    }
  };
  const bahutPlans = {
    fuse: {
      'Bar 1 - Main room': {
        'Frigo 15 (Bahut)': 'Jupiler uniquement',
        'Frigo 16 (Bahut)': 'Jupiler'
      },
    },
    'la-demence': {
      'Bar 1 - Main room': {
        'Frigo 15 (Bahut)': 'Stella uniquement',
        'Frigo 16 (Bahut)': 'Moitié eau plate · moitié Coca-Cola'
      },
    }
  };
  const profileProducts = profile => profile === 'la-demence' ? [...new Set([...window.FUSE_PRODUCTS, 'Velvet'])].sort((a,b)=>a.localeCompare(b,'fr')) : window.FUSE_PRODUCTS;
  const isFlexibleRedbull = (selectedPlace, selectedFridge) => /Red ?Bull/i.test(selectedFridge)
    || (selectedPlace === 'Bar 2 - Main room' && ['Frigo 1', 'Frigo 6'].includes(selectedFridge));
  window.FUSE_IS_FLEXIBLE_REDBULL = isFlexibleRedbull;
  function proposedDrink(profile = window.FUSE_CURRENT_PROFILE) {
    if (isFlexibleRedbull(place.value, fridge.value)) return '';
    const plan = profile === 'la-demence' ? demencePlan : fusePlan;
    return plan[place.value]?.[fridge.value]?.[shelf.value] || '';
  }
  window.FUSE_EXPECTED_DRINK = (profile, selectedPlace, selectedFridge, selectedShelf) => {
    if (isFlexibleRedbull(selectedPlace, selectedFridge)) return '';
    const plan = profile === 'la-demence' ? demencePlan : fusePlan;
    return plan[selectedPlace]?.[selectedFridge]?.[selectedShelf] || '';
  };
  const productName = name => ({
    'Eau Chaudfontaine': 'Eau plate',
    "Jus d'orange Minute Maid": "Jus d'orange",
    'Jus de pomme Minute Maid': 'Jus de pomme'
  })[name] || name;
  window.FUSE_EXPECTED_LINES = (profile, selectedPlace, selectedFridge, selectedShelf) => {
    const plan = window.FUSE_EXPECTED_DRINK(profile, selectedPlace, selectedFridge, selectedShelf);
    return plan ? plan.split(' · ').map(name => ({ name: productName(name), quantity: '' })) : [];
  };
  window.FUSE_EXPECTED_BAHUT = (profile, selectedPlace, selectedFridge) => bahutPlans[profile]?.[selectedPlace]?.[selectedFridge] || '';
  function labelShelves() {
    [...shelf.options].forEach(option => {
      const mapped = window.FUSE_EXPECTED_DRINK(window.FUSE_CURRENT_PROFILE || 'fuse', place.value, fridge.value, option.value);
      const lineCount = window.FUSE_EXPECTED_LINES(window.FUSE_CURRENT_PROFILE || 'fuse', place.value, fridge.value, option.value).length;
      option.textContent = mapped ? `${option.value} · ${mapped} · ${lineCount} ligne${lineCount > 1 ? 's' : ''}` : `${option.value} · à définir`;
    });
  }
  function refresh() {
    const products = profileProducts(window.FUSE_CURRENT_PROFILE || 'fuse');
    list.innerHTML = products.map(product => `<option value="${product}">`).join('');
    labelShelves();
    const isBahut = /\bBahut\b/i.test(fridge.value) && !(place.value === 'Bar 3 - Motion' && fridge.value === 'Frigo 11 (Bahut)');
    const flexibleRedbull = isFlexibleRedbull(place.value, fridge.value);
    const proposal = flexibleRedbull ? '' : isBahut ? window.FUSE_EXPECTED_BAHUT(window.FUSE_CURRENT_PROFILE || 'fuse', place.value, fridge.value) : proposedDrink();
    const lineCount = isBahut || flexibleRedbull ? 0 : window.FUSE_EXPECTED_LINES(window.FUSE_CURRENT_PROFILE || 'fuse', place.value, fridge.value, shelf.value).length;
    const lineLabel = lineCount ? ` · ${lineCount} ligne${lineCount > 1 ? 's' : ''} · max. 7 boissons par ligne` : '';
    hint.textContent = flexibleRedbull ? `Frigo Red Bull modulable · saisis manuellement les couleurs et les quantités de chaque étage. Aucune proportion n’est imposée.` : proposal ? `Plan ${window.FUSE_CURRENT_PROFILE === 'la-demence' ? 'La Demence' : 'Fuse'} · ${fridge.value}${isBahut ? '' : `, ${shelf.value}`} : ${proposal}${lineLabel}` : `Plan ${window.FUSE_CURRENT_PROFILE === 'la-demence' ? 'La Demence' : 'Fuse'} : emplacement à configurer.`;
    const first = lines.querySelector('input[placeholder]');
    if (!isBahut && proposal && first && (!first.value || first.dataset.profileSuggested === 'true')) { first.value = proposal; first.dataset.profileSuggested = 'true'; }
    if ((!proposal || isBahut) && first?.dataset.profileSuggested === 'true') { first.value = ''; delete first.dataset.profileSuggested; }
  }
  [place, fridge, shelf].forEach(control => control.addEventListener('change', () => setTimeout(refresh, 0)));
  document.addEventListener('fuse-profile-changed', refresh);
  new MutationObserver(refresh).observe(lines, {childList:true});
  refresh();
})();
