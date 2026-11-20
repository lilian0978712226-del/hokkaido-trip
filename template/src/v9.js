/* ===== v9：行程上移／下移、移到別天、改時間、傳給旅伴同步 ===== */
(function(){
 const $=s=>document.querySelector(s);
 const esc4=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const toMin=t=>{const [h,m]=String(t).split(':').map(Number);return (h||0)*60+(m||0);};
 const pad=n=>String(n).padStart(2,'0'),fromMin=m=>pad(Math.floor(((m%1440)+1440)%1440/60))+':'+pad(((m%60)+60)%60);
 const OK='hk-adjust-v1';
 let OV={};try{OV=JSON.parse(localStorage.getItem(OK)||'{}')}catch(e){}
 const saveOV=()=>{try{localStorage.setItem(OK,JSON.stringify(OV))}catch(e){}};
 const CSget=()=>window.hkCS?window.hkCS.get():[],CSset=a=>window.hkCS&&window.hkCS.set(a);
 const live=k=>OV[k]&&!OV[k].r?OV[k]:null;
 const eff=(i,j)=>{const o=live(i+'-'+j),e=days[i].events[j];if(o&&o.x)return {d:-1,t:e[0],moved:true,del:true};return {d:o?o.d:i,t:o?o.t:e[0],moved:!!o};};
 window.hkRemoved=(i,j)=>{const o=live(i+'-'+j);return !!(o&&o.x);};
 const partner=()=>{try{return (JSON.parse(localStorage.getItem('hk-ledger-set-v1')||'{}').b)||'陳肥肥'}catch(e){return '陳肥肥'}};

 /* 每天的實際行程（給「現在該去哪」、地圖用） */
 function listFor(d){
  const out=[];
  days.forEach((day,i)=>day.events.forEach((e,j)=>{const f=eff(i,j);if(f.d!==d)return;
   if(CSget().some(c=>c.d===i&&c.rep===j))return;out.push({k:'o',i,j,t:f.t,n:e[1],e});}));
  CSget().filter(c=>c.d===d).forEach(c=>out.push({k:'c',id:c.id,t:c.t,n:c.n,c}));
  return out.sort((a,b)=>toMin(a.t)-toMin(b.t)||(a.k==='o'&&b.k==='o'?(a.i-b.i)||(a.j-b.j):0));
 }
 window.hkEvents=d=>listFor(d).map(x=>x.k==='o'?[x.t,x.e[1],x.e[2],x.e[3]]:[x.t,x.c.n,x.c.p||'自己加的行程',x.c.ic||'📍']);

 /* 先把每一天的原始卡片存起來，移到別天時拿來用 */
 const CACHE={};
 function capture(){
  if(typeof showDay!=='function')return;
  const cur=current;window.hkCapturing=true;
  try{for(let k=0;k<days.length;k++){showDay(k);CACHE[k]=[...document.querySelectorAll('#dayCard .event:not(.custom-ev)')].map(e=>e.outerHTML);}}
  finally{window.hkCapturing=false;}
  showDay(cur);
 }

 /* 依實際順序重排當天卡片 */
 function arrange(i){
  if(window.hkCapturing)return;
  const dc=$('#dayCard');if(!dc)return;
  const orig=[...dc.querySelectorAll('.event:not(.custom-ev)')];
  orig.forEach((el,j)=>{el.dataset.k=i+'-'+j;});
  const touched=Object.keys(OV).some(k=>{const o=live(k);const [a]=k.split('-').map(Number);return o&&(a===i||o.d===i);});
  orig.forEach((el,j)=>{const f=eff(i,j);if(f.d!==i){el.remove();return;}if(f.moved)mark(el,f.t);});
  days.forEach((day,oi)=>{if(oi===i)return;day.events.forEach((e,oj)=>{const f=eff(oi,oj);if(f.d!==i||!CACHE[oi]||!CACHE[oi][oj])return;
   const tmp=document.createElement('div');tmp.innerHTML=CACHE[oi][oj];const el=tmp.firstElementChild;el.dataset.k=oi+'-'+oj;
   const cb=el.querySelector('input[data-check]');if(cb)cb.checked=safeGet(cb.dataset.check);
   el.classList.toggle('is-done',!!(cb&&cb.checked));
   mark(el,f.t,`從 D${oi+1} 移過來`);dc.appendChild(el);});});
  const evs=[...dc.querySelectorAll('.event')];
  evs.forEach(el=>{
   el.querySelectorAll('.adj-btn').forEach(x=>x.remove());
   if(!el.querySelector(':scope > .adj-corner')){
    const key=el.classList.contains('custom-ev')?'c:'+el.dataset.cid:'o:'+el.dataset.k;
    el.insertAdjacentHTML('beforeend',`<button type="button" class="adj-corner" data-adj="${key}" aria-label="調整這一站的順序、日期或時間"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 15.5V5.5M8 5.5 5 8.6M8 5.5l3 3.1M16 8.5v10M16 18.5l-3-3.1M16 18.5l3-3.1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`);}
  });
  if(true){
   const tm=el=>toMin((el.querySelector('.time')||{}).textContent||'0');
   const sorted=evs.map((el,n)=>({el,n,t:tm(el)})).sort((a,b)=>a.t-b.t||a.n-b.n).map(x=>x.el);
   dc.querySelectorAll('.leg').forEach(x=>x.remove());
   const bar=dc.querySelector('.cs-addbar');
   /* 每段路線：自己加的那站也有；步行或開車沿用原本那一段；顯示隔多久 */
   const WL=new Set(days[i].walkLegs||[]);let anc=-1;const anchor=sorted.map(el=>{const k=el.dataset.k;if(k){const [a,b]=k.split('-').map(Number);if(a===i)anc=b;}return anc;});
   sorted.forEach((el,n)=>{
    if(n){const prev=sorted[n-1],a=nameOf(prev),b=nameOf(el),cm=c=>{const x=c.dataset.cid&&CSget().find(y=>y.id===c.dataset.cid);return x&&x.m;},walk=cm(el)?cm(el)==='walk':anchor[n-1]>=0&&WL.has(anchor[n-1]);const gap=tm(el)-tm(prev);
     const gs=gap>0?`<span class="leg-gap">隔 ${gap>=60?Math.floor(gap/60)+' 小時'+(gap%60?' '+gap%60+' 分':''):gap+' 分'}</span>`:'';
     dc.insertBefore(Object.assign(document.createElement('div'),{className:'leg',innerHTML:`<span class="leg-n">↓ ${esc4(b)}</span>${gs}<a href="${routeLink(a,b,walk?'walking':'driving')}" target="_blank" rel="noopener">${walk?'🚶 步行路線':'🚗 開車路線'}</a>`}),bar);}
    dc.insertBefore(el,bar);
   });
  }
  delBar(dc,i);
  syncBar(dc);
  if(window.hkHours)window.hkHours(i);
 }
 function urlOf(el){const c=el.dataset.cid&&CSget().find(x=>x.id===el.dataset.cid);return c&&c.u||'';}
 function nameOf(el){const k=el.dataset.k;if(k){const [a,b]=k.split('-').map(Number);return days[a].events[b][1];}const c=CSget().find(x=>x.id===el.dataset.cid);return c?c.n:'';}
 function mark(el,t,why){
  const tt=el.querySelector('.time');if(tt)tt.textContent=t;
  el.classList.add('ev-adj');
  const tags=el.querySelector('.tags');if(tags&&!tags.querySelector('.tag.adj'))tags.insertAdjacentHTML('beforeend',`<span class="tag mine adj">${why||'已調整'}</span>`);
  if(tags)tags.style.display='flex';
 }
 function delBar(dc,i){
  const old=dc.querySelector('.del-bar');if(old)old.remove();
  const gone=[];days[i].events.forEach((e,j)=>{if(eff(i,j).del)gone.push([j,e]);});
  if(!gone.length)return;
  const html=`<details class="fold del-bar"><summary><span>🗑 這天刪掉的行程（${gone.length}）</span><i>展開</i></summary><div class="del-list">${gone.map(([j,e])=>`<div class="del-item"><span>${esc4(e[0])} ${esc4(e[1])}</span><button type="button" data-undel="${i}-${j}">↺ 加回來</button></div>`).join('')}</div></details>`;
  const bar=dc.querySelector('.cs-addbar');if(bar)bar.insertAdjacentHTML('afterend',html);else dc.insertAdjacentHTML('beforeend',html);
 }
 function syncBar(dc){
  const old=dc.querySelector('.adj-sync');if(old)old.remove();
  const n=Object.values(OV).filter(o=>!o.r).length+CSget().length;if(!n)return;
  const bar=dc.querySelector('.cs-addbar');const html=`<div class="adj-sync"><button type="button" class="adj-share">📤 把行程調整傳給${esc4(partner())}（${n} 項）</button></div>`;
  if(bar)bar.insertAdjacentHTML('afterend',html);else dc.insertAdjacentHTML('beforeend',html);
 }

 /* 調整視窗 */
 const sh=document.createElement('div');sh.className='cs-sheet adj-sheet';sh.hidden=true;
 sh.innerHTML=`<div class="cs-panel" role="dialog" aria-modal="true" aria-labelledby="adjTitle"><h3 id="adjTitle">⇅ 調整行程</h3><p class="adj-name" id="adjName"></p>
  <div class="adj-move"><button type="button" data-mv="-1">⬆ 往前一站</button><button type="button" data-mv="1">⬇ 往後一站</button></div>
  <label>移到哪一天<select id="adjDay">${days.map((d,i)=>`<option value="${i}">D${i+1}・${d.date.slice(5).replace('-','/')} ${esc4(d.label.split('・')[0])}</option>`).join('')}</select></label>
  <label>時間<input id="adjTime" type="time"></label>
  <div class="cs-btns"><button type="button" class="cs-cancel">取消</button><button type="button" class="cs-save adj-save">儲存</button></div>
  <button type="button" class="adj-reset" hidden>↺ 恢復原本的時間和日期</button><button type="button" class="adj-del">🗑 刪除這一站</button></div>`;
 document.body.appendChild(sh);
 let target=null;
 const open=key=>{
  target=key;const [k,id]=key.split(':');let name,d,t,adjd=false;
  if(k==='o'){const [i,j]=id.split('-').map(Number);const f=eff(i,j);name=days[i].events[j][1];d=f.d;t=f.t;adjd=f.moved;}
  else{const c=CSget().find(x=>x.id===id);if(!c)return;name=c.n;d=c.d;t=c.t;}
  $('#adjName').textContent=name;$('#adjDay').value=d;$('#adjTime').value=t;
  sh.querySelector('.adj-reset').hidden=!adjd;const db=sh.querySelector('.adj-del');db.classList.remove('sure');db.textContent='🗑 刪除這一站';sh.hidden=false;document.body.classList.add('cs-open');
 };
 const close=()=>{sh.hidden=true;document.body.classList.remove('cs-open');};
 const setPos=(key,d,t)=>{
  const [k,id]=key.split(':');
  if(k==='o'){const [i,j]=id.split('-').map(Number);const e=days[i].events[j];
   if(d===i&&t===e[0])OV[id]={r:1,ts:Date.now()};else OV[id]={d,t,ts:Date.now()};saveOV();}
  else{CSset(CSget().map(c=>c.id===id?Object.assign({},c,{d,t}):c));}
 };
 const posOf=key=>{const [k,id]=key.split(':');if(k==='o'){const [i,j]=id.split('-').map(Number);return eff(i,j);}const c=CSget().find(x=>x.id===id);return {d:c.d,t:c.t};};
 const keyOf=x=>x.k==='o'?'o:'+x.i+'-'+x.j:'c:'+x.id;
 const redraw=d=>{showDay(typeof d==='number'?d:current);if(window.hkRenderMap)window.hkRenderMap();if(window.hkRenderNext)window.hkRenderNext();};
 sh.addEventListener('click',e=>{
  if(e.target===sh||e.target.closest('.cs-cancel')){close();return;}
  const mv=e.target.closest('[data-mv]');
  if(mv&&target){
   const p=posOf(target),L=listFor(p.d),n=L.findIndex(x=>keyOf(x)===target),m=n+(+mv.dataset.mv);
   if(m<0||m>=L.length){toast(m<0?'已經是當天第一站囉':'已經是當天最後一站囉');return;}
   const other=L[m],ok=keyOf(other),ta=p.t,tb=other.t;
   if(ta===tb){setPos(target,p.d,fromMin(toMin(tb)+(+mv.dataset.mv)));}
   else{setPos(target,p.d,tb);setPos(ok,p.d,ta);}
   close();redraw(p.d);toast(+mv.dataset.mv<0?'往前移了一站 ⬆':'往後移了一站 ⬇');return;
  }
  if(e.target.closest('.adj-save')&&target){
   const d=+$('#adjDay').value,t=$('#adjTime').value||posOf(target).t;
   setPos(target,d,t);close();redraw(d);toast(d===current?'已更新時間 🕒':`已移到 D${d+1} 📅`);return;
  }
  const del=e.target.closest('.adj-del');
  if(del&&target){
   if(!del.classList.contains('sure')){del.classList.add('sure');del.textContent='確定要刪除嗎？再按一次';return;}
   const [k,id]=target.split(':');const d=posOf(target).d;
   if(k==='o'){OV[id]={x:1,ts:Date.now()};}
   else{CSset(CSget().filter(c=>c.id!==id));OV['c:'+id]={x:1,ts:Date.now()};}
   saveOV();close();redraw(d>=0?d:current);toast('已刪除，想加回來可以在這天最下面找到');return;
  }
  if(e.target.closest('.adj-reset')&&target){
   const id=target.split(':')[1];OV[id]={r:1,ts:Date.now()};saveOV();close();redraw();toast('已恢復原本行程');
  }
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!sh.hidden)close();});
 document.addEventListener('click',e=>{const u=e.target.closest&&e.target.closest('[data-undel]');if(!u)return;OV[u.dataset.undel]={r:1,ts:Date.now()};saveOV();redraw();toast('已經加回來了 ✨');});
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-adj]');if(b)open(b.dataset.adj);});

 /* 傳給旅伴／收到時合併 */
 window.hkAdjPack=()=>pack({v:1,o:OV,c:CSget()});
 async function pack(obj){
  let bytes=new TextEncoder().encode(JSON.stringify(obj)),tag='j';
  if(window.CompressionStream){try{const cs=new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));bytes=new Uint8Array(await new Response(cs).arrayBuffer());tag='z';}catch(e){}}
  let bin='';bytes.forEach(b=>bin+=String.fromCharCode(b));return tag+btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
 }
 async function unpack(str){
  const tag=str[0];let b=str.slice(1).replace(/-/g,'+').replace(/_/g,'/');while(b.length%4)b+='=';
  let bytes=Uint8Array.from(atob(b),c=>c.charCodeAt(0));
  if(tag==='z'){const ds=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));bytes=new Uint8Array(await new Response(ds).arrayBuffer());}
  return JSON.parse(new TextDecoder().decode(bytes));
 }
 document.addEventListener('click',async e=>{
  if(!(e.target.closest&&e.target.closest('.adj-share')))return;
  const url=location.origin+location.pathname+'#adj='+await pack({v:1,o:OV,c:CSget()});
  const text=`行程有調整，點開就會同步到你的手機：`;
  try{if(navigator.share){await navigator.share({title:'行程調整',text,url});return;}}catch(err){if(err&&err.name==='AbortError')return;}
  try{await navigator.clipboard.writeText(text+' '+url);toast('連結已複製，貼到 LINE 傳給'+partner());}catch(err){prompt('複製這個連結傳給'+partner(),url);}
 });
 async function tryMerge(){
  const m=((window.__hkHash||'')+location.hash).match(/[#&]adj=([^&]+)/);if(!m)return;window.__hkHash='';
  try{
   const got=await unpack(m[1]);let n=0;
   Object.entries(got.o||{}).forEach(([k,v])=>{if(!OV[k]||(v.ts||0)>(OV[k].ts||0)){OV[k]=v;n++;}});saveOV();
   const mine=CSget(),ids=new Set(mine.map(c=>c.id));const add=(got.c||[]).filter(c=>!ids.has(c.id));
   const upd=mine.map(c=>{const o=(got.c||[]).find(x=>x.id===c.id);return o||c;});
   CSset(upd.concat(add).filter(c=>!(OV['c:'+c.id]&&OV['c:'+c.id].x)));n+=add.length;
   {const rest=location.hash.replace(/^#/,'').split('&').filter(x=>x&&!/^adj=/.test(x)).join('&');history.replaceState(null,'',location.pathname+location.search+(rest?'#'+rest:''));}
   redraw();toast(n?`已同步 ${n} 項行程調整 ✨`:'行程已經是最新的了');
  }catch(err){toast('這個連結打不開，請對方再傳一次');}
 }

 /* 掛上 showDay */
 if(typeof showDay==='function'){const p=showDay;window.showDay=showDay=function(i){const r=p.apply(this,arguments);try{arrange(i)}catch(e){console.warn(e)}return r;};}
 capture();
 if(window.hkRenderNext)window.hkRenderNext();
 tryMerge();addEventListener('hashchange',tryMerge);

 /* ---------- 倒數結束：出發大動畫，之後把倒數藏起來 ---------- */
 (function(){
  const box=document.querySelector('.departure-countdown');if(!box)return;
  const FK='hk-departed-v1',RMv=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ids=['countDays','countHours','countMinutes','countSeconds'];
  const done=()=>ids.every(id=>{const e=document.getElementById(id);return e&&/^0+$/.test(e.textContent.trim());});
  const lab=(box.querySelector('.departure-countdown-label')||{}).textContent||'';
  const dest=(lab.match(/距離(.+?)出發/)||[])[1]||'旅行';
  const hide=anim=>{
   if(!box.isConnected)return;
   if(anim&&!RMv&&box.animate){const h=box.offsetHeight;box.style.overflow='hidden';
    const a=box.animate([{height:h+'px',opacity:1},{height:'0px',opacity:0,marginTop:'0px',marginBottom:'0px',paddingTop:'0px',paddingBottom:'0px'}],{duration:700,easing:'ease-in-out'});
    a.onfinish=()=>box.remove();}else box.remove();
  };
  function party(){
   const ov=document.createElement('div');ov.className='go-party';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','出發囉');
   const word='出發囉！'.split('').map((c,k)=>`<span style="animation-delay:${(1.1+k*.12).toFixed(2)}s">${c}</span>`).join('');
   const stars=Array.from({length:26},(_,k)=>`<i class="gp-star" style="left:${(k*37)%100}%;top:${(k*53)%70}%;animation-delay:${(k%9)*.25}s;transform:scale(${.5+(k%4)*.25})"></i>`).join('');
   const snow=Array.from({length:22},(_,k)=>`<i class="gp-snow" style="left:${(k*29)%100}%;animation-delay:${(k%11)*.35}s;animation-duration:${5+(k%5)}s"></i>`).join('');
   ov.innerHTML=`<div class="gp-sky"></div><div class="gp-glow"></div>${stars}${snow}
    <div class="gp-cloud c1"></div><div class="gp-cloud c2"></div><div class="gp-cloud c3"></div>
    <svg class="gp-path" viewBox="0 0 400 400" preserveAspectRatio="none" aria-hidden="true"><path d="M-20 360 C 90 330, 140 250, 210 200 S 330 90, 430 40" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"/></svg>
    <div class="gp-plane"><svg viewBox="0 0 64 64" aria-hidden="true"><use href="#i-plane"></use></svg></div>
    <div class="gp-center"><div class="gp-ring"></div><div class="gp-bird"><svg viewBox="0 0 100 100" aria-hidden="true"><use href="#i-enaga"></use></svg></div>
     <h2 class="gp-title">${word}</h2><p class="gp-sub">${dest}，我們來了 ✈️</p><p class="gp-tap">點一下開始旅程</p></div>`;
   document.body.appendChild(ov);document.body.classList.add('cs-open');
   const close=()=>{ov.classList.add('out');setTimeout(()=>{ov.remove();document.body.classList.remove('cs-open');hide(true);},600);};
   ov.addEventListener('click',close);setTimeout(()=>{if(ov.isConnected)close();},RMv?2500:9000);
  }
  let fired=false;
  const check=()=>{
   if(fired||!done())return;fired=true;
   let seen=false;try{seen=localStorage.getItem(FK)==='1';localStorage.setItem(FK,'1');}catch(e){}
   if(seen)hide(false);else party();
  };
  check();if(!fired){const t=setInterval(()=>{check();if(fired)clearInterval(t);},1000);}
  window.hkPreviewDeparture=party;
 })();
})();
/* ===== 美食街：雪丸走進餐廳 ===== */
(function(){
 const host=document.getElementById('foodBook');if(!host)return;
 const RMv=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 const w=document.createElement('div');w.className='fs-walker';w.setAttribute('aria-hidden','true');
 w.innerHTML='<svg viewBox="-4 -14 76 88" overflow="visible"><use href="#i-maru" x="-4" y="-14" width="76" height="88"></use></svg>';
 host.appendChild(w);
 let x=12,busy=false;
 const groundY=()=>{const d=host.querySelector('.shop-door');if(!d)return 0;const hr=host.getBoundingClientRect(),dr=d.getBoundingClientRect();return dr.bottom-hr.top+12-w.offsetHeight*(84.5/88);};
 const place=(nx,flip)=>{x=nx;w.style.transform=`translateX(${x}px) scaleX(${flip?-1:1})`;};
 const init=()=>{w.style.top=groundY()+'px';const d=host.querySelector('.shop-door');if(d&&!init.done){const hr=host.getBoundingClientRect(),dr=d.getBoundingClientRect();x=dr.right-hr.left+host.scrollLeft-w.offsetWidth*0.15;init.done=1;}place(x,false);};
 init();addEventListener('resize',init);setTimeout(init,800);setTimeout(init,2500);
 if(window.ResizeObserver)new ResizeObserver(()=>{w.style.top=groundY()+'px';}).observe(host);
 new IntersectionObserver(es=>{if(es[0].isIntersecting)w.style.top=groundY()+'px';}).observe(host);
 function walkTo(card,then){
  const d=card.querySelector('.shop-door');if(!d){then&&then();return;}
  const hr=host.getBoundingClientRect(),dr=d.getBoundingClientRect();
  const tx=dr.left-hr.left+host.scrollLeft+dr.width/2-w.offsetWidth/2;
  if(RMv){place(tx,false);then&&setTimeout(then,150);return;}
  w.style.top=groundY()+'px';busy=true;const dist=Math.abs(tx-x),dur=Math.min(2600,Math.max(500,dist*3.2)),back=tx<x;
  w.classList.remove('enter');w.style.opacity='';w.classList.add('walking');
  w.style.transition=`transform ${dur}ms linear`;place(tx,back);
  const vis=Math.max(0,Math.min(tx-host.clientWidth/2+w.offsetWidth/2,host.scrollWidth));
  host.scrollTo({left:vis,behavior:'smooth'});
  setTimeout(()=>{w.classList.remove('walking');w.style.transition='';w.classList.add('enter');
   d.classList.add('door-open');
   setTimeout(()=>{then&&then();},700);
   setTimeout(()=>{d.classList.remove('door-open');w.classList.remove('enter');busy=false;},2200);
  },dur);
 }
 host.addEventListener('click',e=>{
  const card=e.target.closest('.food-card.shop');if(!card||busy)return;
  const btn=e.target.closest('[data-food-day],[data-food-map]');
  if(btn&&!btn.dataset.walked){e.stopImmediatePropagation();e.preventDefault();
   walkTo(card,()=>{btn.dataset.walked=1;btn.click();delete btn.dataset.walked;});return;}
  if(!btn)walkTo(card);
 },true);
})();
/* ===== 天氣卡：預報出來後用圖示＋數字呈現 ===== */
(function(){
 const t=document.getElementById('homeWeatherText');if(!t)return;
 const box=t.parentNode;const pretty=document.createElement('div');pretty.className='wx-pretty';box.insertBefore(pretty,t);
 const ICON=n=>/雷/.test(n)?'⛈️':/大雪|大陣雪/.test(n)?'❄️':/雪/.test(n)?'🌨️':/雨/.test(n)?'🌧️':/霧/.test(n)?'🌫️':/陰/.test(n)?'☁️':/多雲/.test(n)?'⛅':/晴/.test(n)?'☀️':'🌤️';
 function draw(){
  const s=t.textContent.trim();
  const m=s.match(/^(.+?)｜(-?[\d.]+)–(-?[\d.]+)°C｜降雪 ([\d.—]+) cm｜降水機率 ([\d—]+)%｜最大風速 ([\d.—]+) km\/h/);
  const far=s.match(/距離出發約 (\d+) 天/);
  if(m){
   const [,name,lo,hi,snow,pop,wind]=m;
   pretty.innerHTML=`<div class="wxp-main"><span class="wxp-ic">${ICON(name)}</span><div><b class="wxp-name">${name}</b><span class="wxp-temp"><em>${Math.round(lo)}°</em> / <strong>${Math.round(hi)}°C</strong></span></div></div>
    <div class="wxp-chips"><span><i>❄️</i>降雪<b>${snow} cm</b></span><span><i>☂️</i>降水<b>${pop}%</b></span><span><i>🌬️</i>風速<b>${wind} km/h</b></span></div>`;
   box.classList.add('wxp-on');box.classList.remove('wxp-far');
  }else if(far){
   const n=+far[1],wait=Math.max(0,n-16);
   pretty.innerHTML=`<div class="wxp-main"><span class="wxp-ic">🔭</span><div><b class="wxp-name">還沒有預報</b><span class="wxp-sub">出發前 16 天開始會自動顯示當天天氣${wait?`（大約再 ${wait} 天）`:''}</span></div></div>`;
   box.classList.add('wxp-on','wxp-far');
  }else{pretty.innerHTML='';box.classList.remove('wxp-on','wxp-far');}
 }
 new MutationObserver(draw).observe(t,{childList:true,characterData:true,subtree:true});draw();
})();
/* ===== 用我現在的位置查天氣 ===== */
(function(){
 const card=document.querySelector('#weather .card');const wx=document.querySelector('#weather .weather');if(!card||!wx)return;
 const TOWNS=[['札幌',43.062,141.354],['小樽',43.19,141.0],['新千歲機場',42.775,141.692],['千歲',42.82,141.65],['美瑛',43.588,142.467],['白金',43.48,142.64],['富良野',43.342,142.383],['旭川',43.771,142.365],['洞爺湖',42.565,140.82],['登別',42.49,141.147],['白老',42.55,141.355],['支笏湖',42.773,141.405],['台中',24.147,120.674]];
 const km=(a,b,c,d)=>{const r=Math.PI/180,x=(d-b)*r*Math.cos((a+c)/2*r),y=(c-a)*r;return Math.sqrt(x*x+y*y)*6371;};
 const ICON=c=>c>=95?'⛈️':[75,86].includes(c)?'❄️':c>=71&&c<=86&&c!==80&&c!==81&&c!==82?'🌨️':c>=51?'🌧️':c>=45?'🌫️':c===3?'☁️':c===2?'⛅':c<=1?'☀️':'🌤️';
 const btn=document.createElement('button');btn.type='button';btn.className='wx-here-btn';btn.textContent='📍 用我現在的位置查天氣';
 const out=document.createElement('div');out.className='wx-here';out.hidden=true;
 wx.insertAdjacentElement('afterend',btn);btn.insertAdjacentElement('afterend',out);
 btn.addEventListener('click',()=>{
  if(!navigator.geolocation){toast('這支手機不支援定位');return;}
  btn.disabled=true;btn.textContent='定位中…';
  navigator.geolocation.getCurrentPosition(async pos=>{
   const {latitude:la,longitude:lo}=pos.coords;
   try{
    const u=`https://api.open-meteo.com/v1/forecast?latitude=${la.toFixed(3)}&longitude=${lo.toFixed(3)}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,snowfall&daily=temperature_2m_min,temperature_2m_max,snowfall_sum,precipitation_probability_max&timezone=auto&forecast_days=1`;
    const r=await fetch(u);if(!r.ok)throw 0;const d=await r.json();const c=d.current,dy=d.daily;
    const near=TOWNS.map(t=>[t[0],km(la,lo,t[1],t[2])]).sort((a,b)=>a[1]-b[1])[0];
    const place=near&&near[1]<25?`${near[0]}附近`:'你現在的位置';
    const name=(typeof wxNames!=='undefined'&&wxNames[c.weather_code])||'天氣變化';
    const t=new Date().toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',hour12:false});
    out.innerHTML=`<div class="wxh-top"><span class="wxh-ic">${ICON(c.weather_code)}</span><div><small>📍 ${place}・${t} 現在</small><b>${name} ${Math.round(c.temperature_2m)}°C</b><span>體感 ${Math.round(c.apparent_temperature)}°・今天 ${Math.round(dy.temperature_2m_min[0])}° / ${Math.round(dy.temperature_2m_max[0])}°C</span></div></div>
     <div class="wxp-chips"><span><i>❄️</i>今天降雪<b>${dy.snowfall_sum[0]??'—'} cm</b></span><span><i>☂️</i>降水<b>${dy.precipitation_probability_max[0]??'—'}%</b></span><span><i>🌬️</i>現在風速<b>${Math.round(c.wind_speed_10m)} km/h</b></span></div>`;
    out.hidden=false;btn.textContent='📍 重新用我的位置查';
   }catch(e){toast('查不到天氣，請確認網路後再試一次');btn.textContent='📍 用我現在的位置查天氣';}
   btn.disabled=false;
  },err=>{btn.disabled=false;btn.textContent='📍 用我現在的位置查天氣';toast(err.code===1?'需要允許「位置」權限才能查，請到 Safari 設定開啟':'定位失敗，請到戶外或稍後再試');},{enableHighAccuracy:false,timeout:12000,maximumAge:300000});
 });
})();
/* ===== 把「↗」換成可愛小圖示 ===== */
(function(){
 const PIN='<svg class="cute-ic pin" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 18.2C6.4 14.6 4.4 11.6 4.4 8.6A5.6 5.6 0 0 1 15.6 8.6C15.6 11.6 13.6 14.6 10 18.2Z" fill="#F4A9A0" stroke="#5B4B43" stroke-width="1.5" stroke-linejoin="round"/><path d="M10 10.6C8.4 9.4 7.7 8.6 7.7 7.7A1.15 1.15 0 0 1 10 7.3A1.15 1.15 0 0 1 12.3 7.7C12.3 8.6 11.6 9.4 10 10.6Z" fill="#fff"/></svg>';
 const GO='<svg class="cute-ic go" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="#CFE1F2" stroke="#5B4B43" stroke-width="1.5"/><path d="M8.6 6.4 12.2 10 8.6 13.6" fill="none" stroke="#5B4B43" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 let busy=false;
 function run(root){
  if(busy)return;busy=true;
  const w=document.createTreeWalker(root||document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.nodeValue.includes('↗')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});
  const list=[];let n;while((n=w.nextNode()))list.push(n);
  list.forEach(t=>{
   const el=t.parentNode;if(!el||el.closest('script,style,textarea'))return;
   const txt=(el.textContent||'');const nav=/導航|地點|車程|路線/.test(txt);
   const parts=t.nodeValue.split('↗');const frag=document.createDocumentFragment();
   parts.forEach((p,k)=>{if(k){const s=document.createElement('span');s.className='cute-ic-wrap';s.innerHTML=nav?PIN:GO;frag.appendChild(s);}if(p.trim()||!k)frag.appendChild(document.createTextNode(k?p:p.replace(/\s+$/,' ')));});
   el.replaceChild(frag,t);
  });
  busy=false;
 }
 run();
 let tm;new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(()=>run(),60);}).observe(document.body,{childList:true,subtree:true,characterData:true});
})();
