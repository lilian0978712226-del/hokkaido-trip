
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
   host.innerHTML=items.map((o,n)=>{const nm=o.e[1].replace(/（.*?）/g,'').trim();return `<article class="food-card shop r-${roofs[n%roofs.length]} c${n%5}"><div class="shop-top"><span class="shop-roof"></span><b class="shop-sign">${esc(nm)}</b></div><div class="shop-awning"></div><div class="shop-face"><div class="shop-win">${svgUse(pick(o.e[1]))}</div><div class="shop-door"></div></div><div class="shop-walk"><span class="fd">D${o.i+1} ${o.e[0]}</span><div class="fc-actions"><button class="smallbtn" type="button" data-food-day="${o.i}" aria-label="看 ${esc(nm)} 的行程">行程</button><button class="smallbtn" type="button" data-food-map="${esc(o.e[1])}" data-food-mapday="${o.i}" aria-label="導航到 ${esc(nm)}">導航</button></div></div><div class="shop-road"></div></article>`}).join('');
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
