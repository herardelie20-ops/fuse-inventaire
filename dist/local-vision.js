(() => {
  const app = document.querySelector('.app');
  const card = document.createElement('section');
  card.className = 'card';
  card.innerHTML = '<b>IA de vision locale</b><p class="small" id="visionStatus">Vérification du moteur local…</p>';
  app.querySelector('section')?.before(card);
  const status = card.querySelector('#visionStatus');

  async function initialise() {
    if (!window.ort) { status.textContent = 'Le moteur IA local n’a pas pu être chargé sur cet appareil.'; return; }
    window.ort.env.wasm.wasmPaths = './vendor/onnx/';
    if (location.protocol === 'file:') {
      status.textContent = 'Moteur IA installé. Pour analyser hors ligne, ouvre l’application depuis une URL locale ou HTTPS puis installe-la : le mode file:// ne peut pas charger le modèle.';
      return;
    }
    try {
      const model = await fetch('./models/fuse-inventory.onnx', { method: 'HEAD' });
      status.textContent = model.ok ? 'Moteur IA local prêt. Le modèle d’inventaire est disponible hors ligne.' : 'Moteur IA local installé. Le modèle Fuse doit encore être entraîné puis ajouté.';
    } catch {
      status.textContent = 'Moteur IA local installé. Le modèle Fuse doit encore être entraîné puis ajouté.';
    }
  }
  window.FUSE_LOCAL_VISION = {
    async loadModel(url = './models/fuse-inventory.onnx') {
      if (!window.ort) throw new Error('Moteur ONNX indisponible');
      window.ort.env.wasm.wasmPaths = './vendor/onnx/';
      let response;
      try {
        response = await fetch(url);
        if (!response.ok) throw new Error('Modèle introuvable');
        if ('caches' in window) {
          const cache = await caches.open('fuse-vision-models-v1');
          await cache.put(url, response.clone());
        }
      } catch (error) {
        response = 'caches' in window ? await caches.match(url) : null;
        if (!response) throw error;
      }
      return window.ort.InferenceSession.create(await response.arrayBuffer(), { executionProviders: ['wasm'] });
    }
  };
  initialise();
})();
