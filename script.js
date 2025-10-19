
/* Enhanced script for Diwali Community Wish */
(function(){
  const MAX_URL_LENGTH = 1900;
  const qs = id => document.getElementById(id);

  const yourNameInput = qs('yourName');
  const recipientInput = qs('recipientName');
  const toneSelect = qs('tone');
  const createBtn = qs('createBtn');
  const addMyNameBtn = qs('addMyNameBtn');
  const shareArea = qs('shareArea');
  const shareLinkInput = qs('shareLink');
  const copyBtn = qs('copyBtn');
  const mailBtn = qs('mailBtn');
  const chainListEl = qs('chainList');
  const greetingEl = qs('greeting');
  const subEl = qs('sub');
  const musicToggle = qs('musicToggle');
  const bgMusic = qs('bgMusic');

  function encodeChain(chain){
    const json = JSON.stringify(chain);
    return btoa(unescape(encodeURIComponent(json))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function decodeChain(token){
    try{
      const padded = token.replace(/-/g,'+').replace(/_/g,'/');
      const json = decodeURIComponent(escape(atob(padded)));
      return JSON.parse(json);
    }catch(e){return null}
  }

  function getChainFromURL(){
    const p = new URLSearchParams(location.search);
    const t = p.get('chain');
    if(!t) return [];
    return Array.isArray(decodeChain(t)) ? decodeChain(t) : [];
  }

  function renderChain(list){
    if(!list || list.length===0){ chainListEl.innerHTML = 'No names yet — be the first to share!'; return; }
    chainListEl.innerHTML = '';
    list.forEach(n=>{
      const d = document.createElement('div'); d.className='name'; d.textContent = n;
      chainListEl.appendChild(d);
    });
  }

  function makeShareURL(chain){
    const token = encodeChain(chain);
    const base = location.origin + location.pathname;
    return base + '?chain=' + encodeURIComponent(token);
  }

  function saveLocal(chain){
    try{ localStorage.setItem('diwali_chain_v1', JSON.stringify(chain)); }catch(e){}
  }
  function loadLocal(){
    try{ const raw = localStorage.getItem('diwali_chain_v1'); return raw?JSON.parse(raw):null;}catch(e){return null}
  }

  function shortFallback(chain){
    saveLocal(chain);
    return {url: location.origin + location.pathname + '#local'};
  }

  function applyTone(tone, creator){
    if(tone === 'spiritual'){
      greetingEl.textContent = 'शुभ दीपावली — शुभकामनाएँ';
      subEl.textContent = 'भगवान लक्ष्मी आपकी जीवन में समृद्धि एवं प्रकाश लाए।';
    }else{
      greetingEl.textContent = 'Wishing you a Joyful Diwali';
      subEl.textContent = 'May your life be filled with light, laughter & love.';
    }
    if(creator) greetingEl.textContent += '\n\u2014 ' + creator;
  }

  // init
  (function init(){
    const chain = getChainFromURL();
    if(chain && chain.length){ renderChain(chain); applyTone(toneSelect.value, chain[0]); }
    else if(location.hash === '#local'){ const local = loadLocal(); if(local) renderChain(local); else renderChain([]); }
    else renderChain([]);
  })();

  // events
  createBtn.addEventListener('click', ()=>{
    const your = (yourNameInput.value||'').trim();
    if(!your){ alert('Please enter your name to create a chain.'); yourNameInput.focus(); return; }
    const rec = (recipientInput.value||'').trim();
    const chain = [your].concat(rec? [rec]:[]);
    applyTone(toneSelect.value, your);
    const url = makeShareURL(chain);
    if(url.length > MAX_URL_LENGTH){ const fb = shortFallback(chain); shareArea.hidden=false; shareLinkInput.value = fb.url; alert('Long chain — saved locally on this device. Use local link.'); renderChain(chain); return; }
    shareArea.hidden=false; shareLinkInput.value = url; navigator.clipboard?.writeText(url); renderChain(chain);
    try{ history.replaceState(null,'',url); }catch(e){}
  });

  addMyNameBtn.addEventListener('click', ()=>{
    const your = (yourNameInput.value||'').trim();
    if(!your){ alert('Enter your name to add to chain'); yourNameInput.focus(); return; }
    const chain = getChainFromURL();
    if(chain.length===0 && location.hash === '#local'){ const local = loadLocal(); if(local){ local.push(your); saveLocal(local); renderChain(local); shareArea.hidden=false; shareLinkInput.value = location.origin + location.pathname + '#local'; return; } }
    chain.push(your);
    const url = makeShareURL(chain);
    if(url.length > MAX_URL_LENGTH){ const fb = shortFallback(chain); shareArea.hidden=false; shareLinkInput.value = fb.url; alert('Chain too long — saved locally on this device.'); renderChain(chain); return; }
    renderChain(chain); shareArea.hidden=false; shareLinkInput.value = url; try{ history.replaceState(null,'',url);}catch(e){}
  });

  copyBtn?.addEventListener('click', async ()=>{
    if(!shareLinkInput.value) return;
    try{ await navigator.clipboard.writeText(shareLinkInput.value); copyBtn.textContent='Copied!'; setTimeout(()=>copyBtn.textContent='Copy',1500); }catch(e){ shareLinkInput.select(); document.execCommand('copy'); }
  });

  mailBtn?.addEventListener('click', ()=>{
    if(!shareLinkInput.value) return;
    const subj = encodeURIComponent('Diwali wish for you — Open & pass it on');
    const body = encodeURIComponent('Hi,%0D%0A%0D%0AI sent you a Diwali wish. Open and add your name to pass it on:%0D%0A%0D%0A' + shareLinkInput.value + '%0D%0A%0D%0AHappy Diwali!');
    window.location.href = `mailto:?subject=${subj}&body=${body}`;
  });

  chainListEl.addEventListener('click', (e)=>{
    if(e.target.classList.contains('name')) recipientInput.value = e.target.textContent;
  });

  // music toggle
  musicToggle.addEventListener('click', ()=>{
    const playing = bgMusic.paused === false;
    if(playing){ bgMusic.pause(); musicToggle.textContent = '🔈'; musicToggle.setAttribute('aria-pressed','false'); }
    else{ bgMusic.play().catch(()=>{}); musicToggle.textContent = '🔊'; musicToggle.setAttribute('aria-pressed','true'); }
  });

})();
