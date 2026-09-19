window.FUSE_SOFTS = [
  'Coca-Cola', 'Coca-Cola Zero', 'Fuze Tea', "Jus d'orange", "Jus de pomme",
  'Eau pétillante', 'Eau plate', 'Maté', 'Ginger beer', 'Tonic', 'Redbull', 'Redbull rouge',
  'Redbull Zero', 'Redbull vert', 'Sprite', 'Fanta'
];
window.FUSE_BEERS = ['Jupiler', 'Jupiler Zero', 'Stella', 'Hoegaarden rosé', 'Duvel', 'Sanlitros', 'Corona', 'Victoria', 'Leffe blonde'];
window.FUSE_FRIDGE_SPECIALS = ['Vin blanc', 'Vin rosé', 'Champagne', 'Cava', 'Jägermeister'];
window.FUSE_SPIRITS = ['Tequila', 'Rhum brun', 'Rhum blanc', 'Vodka', 'Gin', 'Whisky', "Whisky Jack Daniel's", 'Vodka Grey Goose', 'Vodka rouge', 'Gen 27'];
window.FUSE_SYRUPS = ['Sirop de grenadine', 'Sirop de menthe'];
const alphabetical = list => [...list].sort((a, b) => a.localeCompare(b, 'fr'));
window.FUSE_SOFTS = alphabetical(window.FUSE_SOFTS);
window.FUSE_BEERS = alphabetical(window.FUSE_BEERS);
window.FUSE_FRIDGE_SPECIALS = alphabetical(window.FUSE_FRIDGE_SPECIALS);
window.FUSE_SPIRITS = alphabetical(window.FUSE_SPIRITS);
window.FUSE_SYRUPS = alphabetical(window.FUSE_SYRUPS);
window.FUSE_PRODUCTS = alphabetical([...window.FUSE_SOFTS, ...window.FUSE_BEERS, ...window.FUSE_FRIDGE_SPECIALS]);
window.FUSE_BAR_STOCK = alphabetical([...window.FUSE_SPIRITS, ...window.FUSE_SYRUPS, 'Produits d’entretien']);
window.FUSE_ALCOHOL_RESERVE = alphabetical([...window.FUSE_FRIDGE_SPECIALS, ...window.FUSE_SPIRITS]);
window.FUSE_PACK_SIZES = {
  'Coca-Cola':24, 'Coca-Cola Zero':24, 'Fuze Tea':24, 'Fanta':24, 'Sprite':24,
  "Jus de pomme":24, "Jus d'orange":24, 'Tonic':24, 'Eau plate':24, 'Eau pétillante':24,
  'Jupiler':24, 'Jupiler Zero':24, 'Duvel':24, 'Stella':24, 'Hoegaarden rosé':24,
  'Victoria':24, 'Leffe blonde':24, 'Redbull':24, 'Redbull rouge':24, 'Redbull Zero':24,
  'Redbull vert':24, 'Corona':24, 'Sanlitros':24, 'Maté':12, 'Ginger beer':24
};
