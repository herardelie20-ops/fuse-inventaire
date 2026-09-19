(() => {
  const preview = document.querySelector('#preview');
  const message = preview.querySelector('span');
  const style = document.createElement('style');
  style.textContent = '#preview{min-height:52px;height:52px;display:flex;align-items:center;justify-content:center;padding:8px}#preview img{display:none!important}#barPlanCanvas{position:relative;margin-top:12px}#barPlan img{display:block;width:100%;height:auto;background:#fff;border-radius:8px}.fridge-marker{position:absolute;transform:translate(-50%,-50%);display:grid;place-items:center;min-width:24px;height:24px;padding:0 4px;border-radius:999px;background:#d71920;color:#fff;font-size:12px;line-height:1;font-weight:900;box-shadow:0 0 0 2px #fff,0 1px 4px #000}.fridge-marker.done{background:#00a94f}#liveBadges{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}.live-badge{border-radius:999px;background:#d71920;color:#fff;padding:5px 9px;font-size:.73rem;font-weight:850;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.live-badge.done{background:#00a94f}';
  document.head.append(style);

  function indicatePhotoReady() {
    setTimeout(() => {
      message.style.display = 'block';
      message.textContent = '✓ Photo prête pour le comptage IA';
    }, 0);
  }

  document.querySelector('#cameraInput').addEventListener('change', indicatePhotoReady);
  document.querySelector('#fileInput').addEventListener('change', indicatePhotoReady);
})();
