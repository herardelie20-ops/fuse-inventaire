(() => {
  const key = 'fuse-inventory-session-start';
  const format = value => new Date(value).toLocaleString('fr-BE');
  function start() {
    let value = localStorage.getItem(key);
    if (!value) { value = new Date().toISOString(); localStorage.setItem(key, value); }
    return value;
  }
  window.FUSE_INVENTORY_TIMING = () => `Début : ${format(start())} · Fin : ${format(new Date())}`;
  window.FUSE_NEW_INVENTORY_SESSION = () => localStorage.setItem(key, new Date().toISOString());
  start();

  const newCount = document.querySelector('#newCount');
  newCount?.addEventListener('click', () => window.FUSE_NEW_INVENTORY_SESSION(), true);
  document.querySelector('#save')?.addEventListener('click', () => setTimeout(() => {
    const meta = document.querySelector('#rMeta');
    const report = document.querySelector('#report');
    if (meta && report && !report.classList.contains('hidden')) meta.textContent = window.FUSE_INVENTORY_TIMING();
  }, 0));
})();
