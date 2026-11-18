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
 const eff=(i,j)=>{const o=live(i+'-'+j),e=days[i].events[j];return {d:o?o.d:i,t:o?o.t:e[0],moved:!!o};};
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
   const acts=el.querySelector('.event-actions');if(acts&&!acts.querySelector('.adj-btn')){
    const key=el.classList.contains('custom-ev')?'c:'+el.dataset.cid:'o:'+el.dataset.k;
    acts.insertAdjacentHTML('beforeend',`<button type="button" class="smallbtn adj-btn" data-adj="${key}">⇅ 調整</button>`);}
  });
  if(touched){
   const tm=el=>toMin((el.querySelector('.time')||{}).textContent||'0');
   const sorted=evs.map((el,n)=>({el,n,t:tm(el)})).sort((a,b)=>a.t-b.t||a.n-b.n).map(x=>x.el);
   dc.querySelectorAll('.leg').forEach(x=>x.remove());
   const bar=dc.querySelector('.cs-addbar');
   sorted.forEach((el,n)=>{
    if(n){const prev=sorted[n-1],a=nameOf(prev),b=nameOf(el);
     dc.insertBefore(Object.assign(document.createElement('div'),{className:'leg',innerHTML:`↓ ${esc4(b)} <a href="${routeLink(a,b)}" target="_blank" rel="noopener">🚗 開車路線</a>`}),bar);}
    dc.insertBefore(el,bar);
   });
  }
  syncBar(dc);
  if(window.hkHours)window.hkHours(i);
 }
 function nameOf(el){const k=el.dataset.k;if(k){const [a,b]=k.split('-').map(Number);return days[a].events[b][1];}const c=CSget().find(x=>x.id===el.dataset.cid);return c?c.n:'';}
 function mark(el,t,why){
  const tt=el.querySelector('.time');if(tt)tt.textContent=t;
  el.classList.add('ev-adj');
  const tags=el.querySelector('.tags');if(tags&&!tags.querySelector('.tag.adj'))tags.insertAdjacentHTML('beforeend',`<span class="tag mine adj">⇅ ${why||'已調整'}</span>`);
  if(tags)tags.style.display='flex';
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
  <button type="button" class="adj-reset" hidden>↺ 恢復原本的時間和日期</button></div>`;
 document.body.appendChild(sh);
 let target=null;
 const open=key=>{
  target=key;const [k,id]=key.split(':');let name,d,t,adjd=false;
  if(k==='o'){const [i,j]=id.split('-').map(Number);const f=eff(i,j);name=days[i].events[j][1];d=f.d;t=f.t;adjd=f.moved;}
  else{const c=CSget().find(x=>x.id===id);if(!c)return;name=c.n;d=c.d;t=c.t;}
  $('#adjName').textContent=name;$('#adjDay').value=d;$('#adjTime').value=t;
  sh.querySelector('.adj-reset').hidden=!adjd;sh.hidden=false;document.body.classList.add('cs-open');
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
  if(e.target.closest('.adj-reset')&&target){
   const id=target.split(':')[1];OV[id]={r:1,ts:Date.now()};saveOV();close();redraw();toast('已恢復原本行程');
  }
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!sh.hidden)close();});
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-adj]');if(b)open(b.dataset.adj);});

 /* 傳給旅伴／收到時合併 */
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
  const m=location.hash.match(/#adj=([^&]+)/);if(!m)return;
  try{
   const got=await unpack(m[1]);let n=0;
   Object.entries(got.o||{}).forEach(([k,v])=>{if(!OV[k]||(v.ts||0)>(OV[k].ts||0)){OV[k]=v;n++;}});saveOV();
   const mine=CSget(),ids=new Set(mine.map(c=>c.id));const add=(got.c||[]).filter(c=>!ids.has(c.id));
   const upd=mine.map(c=>{const o=(got.c||[]).find(x=>x.id===c.id);return o||c;});
   CSset(upd.concat(add));n+=add.length;
   history.replaceState(null,'',location.pathname+location.search);
   redraw();toast(n?`已同步 ${n} 項行程調整 ✨`:'行程已經是最新的了');
  }catch(err){toast('這個連結打不開，請對方再傳一次');}
 }

 /* 掛上 showDay */
 if(typeof showDay==='function'){const p=showDay;window.showDay=showDay=function(i){const r=p.apply(this,arguments);try{arrange(i)}catch(e){console.warn(e)}return r;};}
 capture();
 if(window.hkRenderNext)window.hkRenderNext();
 tryMerge();addEventListener('hashchange',tryMerge);
})();
