(() => {
  const style=document.createElement('style');
  style.textContent='.app{position:relative}.profile-buttons{position:absolute;top:18px;right:16px;display:flex;gap:8px;align-items:center}.profile-logo{width:88px;height:88px;object-fit:contain;background:#000;border:0;border-radius:0;padding:8px;cursor:pointer}.profile-logo img{width:100%;height:100%;object-fit:contain;filter:invert(1) contrast(300%)}.profile-logo.demence{width:164px;height:88px;padding:0}.profile-logo.demence img{filter:grayscale(1) contrast(999%) brightness(160%)}.profile-logo.active{opacity:1}.profile-name{margin:5px 0 0;color:#fff;font-size:.76rem}.brand{padding-right:270px}';
  document.head.append(style);
  const wrap=document.createElement('div');wrap.className='profile-buttons';
  wrap.innerHTML='<button class="profile-logo active" data-profile="fuse" title="Profil Fuse"><img src="fuse-logo.png" alt="Fuse"></button><button class="profile-logo demence" data-profile="la-demence" title="Profil La Demence"><img src="la-demence-logo.png" alt="La Demence"></button>';
  document.querySelector('.app').prepend(wrap);
  const profileName=document.createElement('p');profileName.className='profile-name';profileName.id='profileName';profileName.textContent='Profil : Fuse';document.querySelector('.brand').after(profileName);
  wrap.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;wrap.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));const profile=b.dataset.profile;localStorage.setItem('fuse-profile',profile);profileName.textContent=`Profil : ${profile==='fuse'?'Fuse':'La Demence'}`;document.dispatchEvent(new CustomEvent('fuse-profile-changed',{detail:{profile}}));});
})();
