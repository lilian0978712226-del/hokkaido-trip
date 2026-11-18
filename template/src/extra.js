
/* ===== 雪丸繪本 visual helpers — additive only; original functions/data untouched ===== */
(function(){
 const reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const svgUse=(id,cls)=>`<svg class="${cls||''}" aria-hidden="true" viewBox="0 0 64 64"><use href="#${id}"></use></svg>`;

 /* 1. Per-day illustration inside the day theme band + done-state on timeline cards */
 const dayArt=['i-plane','i-clock','i-lamp','i-clock','i-tree','i-penguin','i-onsen','i-car','i-plane'];
 function decorateDay(i){
  try{
   const band=document.querySelector('#dayCard .day-theme');
   if(band&&!band.querySelector('.day-illus')){band.insertAdjacentHTML('afterbegin',svgUse(dayArt[i]||'i-train','day-illus'));}
   document.querySelectorAll('#dayCard .tag').forEach(t=>{const x=t.textContent.trim();if(x==='住宿')t.classList.add('stay');if(x==='行程')t.classList.add('plain');if(x.startsWith('交通'))t.classList.add('move');});
   document.querySelectorAll('#dayCard [data-map-place]').forEach(b=>{b.innerHTML='📍 導航';});
   document.querySelectorAll('#dayCard [data-copy-place]').forEach(b=>{b.textContent='複製';b.setAttribute('aria-label','複製地點');});
   document.querySelectorAll('#dayCard .smallbtn.note').forEach(b=>{b.textContent='備註';b.setAttribute('aria-label','查看貼心備註');});
   document.querySelectorAll('#dayCard .leg a').forEach(a=>{a.textContent=a.textContent.includes('步行')?'🚶 步行路線':'🚗 開車路線';});
   document.querySelectorAll('#dayCard .leg').forEach(l=>{const n=l.firstChild;if(n&&n.nodeType===3)n.textContent=n.textContent.replace('↳ 下一站：','↓ ').trim()+' ';});
   document.querySelectorAll('#dayCard input[data-check]').forEach(inp=>{
    const ev=inp.closest('.event');if(ev)ev.classList.toggle('is-done',inp.checked);
   });
  }catch(e){console.warn(e)}
 }
 if(typeof showDay==='function'){
  const originalShowDay=showDay;
  window.showDay=showDay=function(i){const r=originalShowDay.apply(this,arguments);decorateDay(i);return r;};
  decorateDay(typeof current==='number'?current:0);
 }

 /* 2. Star burst whenever any checkbox gets checked (lists + timeline) */
 function burst(x,y){
  if(reduceMotion)return;
  for(let k=0;k<6;k++){
   const s=document.createElement('span');s.className='sb-star';
   const a=(Math.PI*2/6)*k+Math.random()*.5,d=26+Math.random()*18;
   s.style.left=x+'px';s.style.top=y+'px';s.style.setProperty('--dx',Math.cos(a)*d+'px');s.style.setProperty('--dy',Math.sin(a)*d+'px');
   document.body.appendChild(s);setTimeout(()=>s.remove(),750);
  }
 }
 document.addEventListener('sb-burst',e=>burst(e.detail.x,e.detail.y));
 document.addEventListener('change',ev=>{
  const inp=ev.target;if(!(inp instanceof HTMLInputElement)||inp.type!=='checkbox')return;
  const ev2=inp.closest('#dayCard .event');if(ev2)ev2.classList.toggle('is-done',inp.checked);
  if(inp.checked){const r=inp.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2);}
 });

 /* 3. Hero quick-weather mirrors the original #homeWeatherText (kept as the single source) */
 const src=document.getElementById('homeWeatherText'),dst=document.getElementById('heroWeatherMirror');
 if(src&&dst){const sync=()=>{dst.textContent=src.textContent||'—';};sync();new MutationObserver(sync).observe(src,{childList:true,characterData:true,subtree:true});}
 const wTitle=document.getElementById('weatherDayTitle'),hwT=document.getElementById('heroWeatherTitle');
 if(wTitle&&hwT){const s2=()=>{hwT.textContent=(wTitle.textContent||'今日天氣').replace('｜',' ');};s2();new MutationObserver(s2).observe(wTitle,{childList:true,characterData:true,subtree:true});}

 /* 4. Countdown tick animation (the original updater still writes the numbers) */
 if(!reduceMotion){['countSeconds'].forEach(id=>{const el=document.getElementById(id);if(!el)return;new MutationObserver(()=>{el.classList.remove('count-tick');void el.offsetWidth;el.classList.add('count-tick');}).observe(el,{childList:true});});}

 /* 5. Food encyclopedia — built from the original `days` data with the same keywords the timeline uses for 美食 tags */
 try{
  const host=document.getElementById('foodBook');
  if(host&&Array.isArray(days)){
   const keys=['德壽','焼肉','一蘭','檍','だんご','成吉思汗','Parfaiteria','鱗友','茶和','六花亭','北菓樓','BaaL','Shinobure','湯咖哩','Enikaitamochi','可麗餅','禪','牧場','酪農場','文字燒','天金','白老牛','Lake Hill','海膽'];
   const pick=n=>/鱗友/.test(n)?'f-crab':/湯咖哩/.test(n)?'f-curry':/德壽|焼肉|白老牛/.test(n)?'f-yakiniku':/成吉思汗/.test(n)?'f-meat':/Parfaiteria/.test(n)?'f-parfait':/六花亭/.test(n)?'f-butter':/北菓樓/.test(n)?'f-puff':/BaaL/.test(n)?'f-steak':/Shinobure/.test(n)?'f-yakitori':/可麗餅/.test(n)?'f-crepe':/牧場|酪農場/.test(n)?'f-milk':/海膽/.test(n)?'f-don':/天金/.test(n)?'f-sashimi':/一蘭/.test(n)?'f-ramen':/檍/.test(n)?'f-tonkatsu':/だんご|Enikaitamochi/.test(n)?'f-dango':/茶和/.test(n)?'f-matcha':/禪/.test(n)?'f-shabu':/文字燒/.test(n)?'f-okonomi':/Lake Hill/.test(n)?'f-softcream':'f-sweet';
   const items=[];days.forEach((d,i)=>d.events.forEach((e,j)=>{if(keys.some(k=>e[1].includes(k)))items.push({i,j,e,d});}));
   const roofs=['flat','slant','gable','flat2','slant2','dome'];
   const ROOFSVG={'flat':'<svg viewBox="0 0 136 44" preserveAspectRatio="none" aria-hidden="true"><path d="M3 30Q3 24 9 24H127Q133 24 133 30V36Q133 42 127 42H9Q3 42 3 36Z" style="fill:var(--roof)" stroke="#5B4B43" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M5 27Q5 14 16 14H120Q131 14 131 27Q124.0 32.0 117.0 27.0Q110.0 32.0 103.0 27.0Q96.0 32.0 89.0 27.0Q82.0 32.0 75.0 27.0Q68.0 32.0 61.0 27.0Q54.0 32.0 47.0 27.0Q40.0 32.0 33.0 27.0Q26.0 32.0 19.0 27.0Q12.0 32.0 5.0 27.0Z" fill="#fff" stroke="#5B4B43" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></svg>', 'flat2':'<svg viewBox="0 0 136 44" preserveAspectRatio="none" aria-hidden="true"><path d="M3 31H133V38Q133 42 129 42H7Q3 42 3 38Z" style="fill:var(--roof)" stroke="#5B4B43" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M3 31Q8 18 20 18H116Q128 18 133 31Q126.5 35.5 120.0 31.0Q113.5 35.5 107.0 31.0Q100.5 35.5 94.0 31.0Q87.5 35.5 81.0 31.0Q74.5 35.5 68.0 31.0Q61.5 35.5 55.0 31.0Q48.5 35.5 42.0 31.0Q35.5 35.5 29.0 31.0Q22.5 35.5 16.0 31.0Q9.5 35.5 3.0 31.0Z" fill="#fff" stroke="#5B4B43" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></svg>', 'slant':'<svg viewBox="0 0 136 44" preserveAspectRatio="none" aria-hidden="true"><path d="M2 42L2 34L134 16L134 25L8 42Z" style="fill:var(--roof)" stroke="#5B4B43" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M3 33.5L134 15.5Q132 9 124 10L8 26Q2 27.5 3 33.5Z" fill="#fff" stroke="#5B4B43" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></svg>', 'slant2':'<svg viewBox="0 0 136 44" preserveAspectRatio="none" aria-hidden="true"><path d="M134 42L134 34L2 16L2 25L128 42Z" style="fill:var(--roof)" stroke="#5B4B43" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M133 33.5L2 15.5Q4 9 12 10L128 26Q134 27.5 133 33.5Z" fill="#fff" stroke="#5B4B43" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></svg>', 'gable':'<svg viewBox="0 0 136 44" preserveAspectRatio="none" aria-hidden="true"><path d="M68 3L134 40Q134 43 131 43H5Q2 43 2 40Z" style="fill:var(--roof)" stroke="#5B4B43" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M68 3L97 19.3Q91.2 23.8 85.4 19.3Q79.6 23.8 73.8 19.3Q68.0 23.8 62.2 19.3Q56.4 23.8 50.6 19.3Q44.8 23.8 39.0 19.3Z" fill="#fff" stroke="#5B4B43" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M60 43V32H76V43" fill="#FFF6E0" stroke="#5B4B43" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></svg>', 'dome':'<svg viewBox="0 0 136 44" preserveAspectRatio="none" aria-hidden="true"><path d="M3 42Q3 10 68 10Q133 10 133 42Z" style="fill:var(--roof)" stroke="#5B4B43" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M14 24Q30 10 68 10Q106 10 122 24Q115.2 28.5 108.5 24.0Q101.8 28.5 95.0 24.0Q88.2 28.5 81.5 24.0Q74.8 28.5 68.0 24.0Q61.2 28.5 54.5 24.0Q47.8 28.5 41.0 24.0Q34.2 28.5 27.5 24.0Q20.8 28.5 14.0 24.0Z" fill="#fff" stroke="#5B4B43" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></svg>'};
   host.innerHTML=items.map((o,n)=>{const nm=o.e[1].replace(/（.*?）/g,'').trim();return `<article class="food-card shop r-${roofs[n%roofs.length]} c${n%5}"><span class="shop-roof">${ROOFSVG[roofs[n%roofs.length]]}</span><div class="shop-top"><b class="shop-sign">${esc(nm)}</b></div><div class="shop-awning"></div><div class="shop-face"><div class="shop-win">${svgUse(pick(o.e[1]))}</div><div class="shop-door"></div></div><div class="shop-walk"><span class="fd">D${o.i+1} ${o.e[0]}</span><div class="fc-actions"><button class="smallbtn" type="button" data-food-day="${o.i}" aria-label="看 ${esc(nm)} 的行程">行程</button><button class="smallbtn" type="button" data-food-map="${esc(o.e[1])}" data-food-mapday="${o.i}" aria-label="導航到 ${esc(nm)}">導航</button></div></div><div class="shop-road"></div></article>`}).join('');
   const cnt=document.getElementById('foodCount');if(cnt)cnt.textContent=`共 ${items.length} 站美食・依原行程自動整理`;
   host.addEventListener('click',ev=>{
    const g=ev.target.closest('[data-food-day]');if(g){showDay(+g.dataset.foodDay);document.getElementById('itinerary').scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});return;}
    const m=ev.target.closest('[data-food-map]');if(m)maps(m.dataset.foodMap,+m.dataset.foodMapday);
   });
  }
 }catch(e){console.warn('food book',e)}

 /* 6. Soft reveal for sections (only when motion allowed and IO exists) */
 if(!reduceMotion&&'IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('sb-in');io.unobserve(en.target);}}),{rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('main .section:not(#itinerary), .stay-card, .pass, .food-card').forEach(el=>{el.classList.add('sb-reveal');io.observe(el);});
 }

 /* 7. Escape closes the note memo */
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&typeof closeNote==='function')closeNote();});
})();
