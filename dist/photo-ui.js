(() => {
  const preview = document.querySelector('#preview');
  const message = preview.querySelector('span');
  const style = document.createElement('style');
  style.textContent = '#preview{min-height:52px;height:52px;display:flex;align-items:center;justify-content:center;padding:8px}select option{color:#fff;background:#000}.profile-demence select option{color:#000;background:#fff}#preview img{display:none!important}#barPlanCanvas{position:relative;margin-top:12px}#barPlan img{display:block;width:100%;height:auto;background:#fff;border-radius:8px}.plan-hidden-fridge{position:absolute;transform:translate(-50%,-50%);width:4.4%;height:7.2%;background:#fff;z-index:1}.fridge-marker{position:absolute;transform:translate(-50%,-50%);display:grid;place-items:center;min-width:24px;height:24px;padding:0 4px;border-radius:999px;background:#fff;color:#000;font-size:12px;line-height:1;font-weight:900;box-shadow:0 0 0 2px #000,0 1px 4px #000;z-index:2}.fridge-marker.in-progress{background:#e87918;color:#fff;box-shadow:0 0 0 2px #fff,0 1px 4px #000}.fridge-marker.error{background:#dc2626;color:#fff;box-shadow:0 0 0 2px #fff,0 1px 4px #000}.fridge-marker.done{background:#00a94f;color:#fff;box-shadow:0 0 0 2px #fff,0 1px 4px #000}#liveBadges{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}.live-badge{border-radius:999px;background:#fff;color:#000;padding:5px 9px;font-size:.73rem;font-weight:850;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.live-badge.in-progress{background:#e87918;color:#fff}.live-badge.error{background:#dc2626;color:#fff}.live-badge.done{background:#00a94f;color:#fff}.done-select{color:#91f5ae!important;border-color:#00a94f!important}.progress-select{color:#ffd084!important;border-color:#e87918!important}.error-select{color:#ffaaa4!important;border-color:#dc2626!important}.status-code.pending{background:#fff;color:#000;border:1px solid #000}.stock-photo-series{margin:14px 0;padding:13px;border:1px solid #4c4c4c;border-radius:10px}.stock-row{display:grid;grid-template-columns:minmax(130px,1.4fr) 75px 75px minmax(90px,.8fr) auto;gap:8px;align-items:end;padding:11px 0;border-top:1px solid #333}.stock-row label{margin:0}.stock-row .pack-note{color:#cfcfcf;font-size:.78rem;padding-bottom:10px}.stock-row.validated{background:#123d24;border-radius:8px;padding:10px;margin:5px -6px}.stock-row.validated .stock-validate{background:#00a94f;color:#fff}.fridge-batch #floorResults{display:grid;gap:10px;margin-top:14px}.floor-result{border:1px solid #444;border-radius:10px;padding:12px}.floor-result b{display:block}.floor-photo{display:block;color:#cfcfcf;font-size:.78rem;margin-top:3px}@media(max-width:560px){.stock-row{grid-template-columns:1fr 1fr}.stock-row label:first-child{grid-column:1/-1}.stock-row .pack-note{padding-bottom:0}.stock-row .stock-validate{grid-column:1/-1}}';
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
