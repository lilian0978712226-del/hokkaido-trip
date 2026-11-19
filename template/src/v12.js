/* ===== v12：登機證抵達蓋章、行程「已訂位／已買票」標記 ===== */
(function(){
 const $=s=>document.querySelector(s);
 const RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'')||d}catch(e){return d}};
 const put=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
 const toast=m=>{if(window.toast)return window.toast(m);};

 /* ---------- 1. 登機證：抵達後蓋上入境章 ---------- */
 const TZ={CTS:9,HND:9,NRT:9,KIX:9,FUK:9,OKA:9,NGO:9,RMQ:8,TPE:8,TSA:8,KHH:8,ICN:9,PUS:9,HKG:8,BKK:7};
 const YEAR=(()=>{try{return +String(days[0].date).slice(0,4)}catch(e){return new Date().getFullYear()}})();
 const SK='hk-stamp-v1';
 function info(p){
  const l=p.getAttribute('aria-label')||'';
  const m=l.match(/(\d{1,2})\/(\d{1,2}).*?到\s*(\S+)\s+([A-Z]{3})\s+(\d{1,2}):(\d{2})/);if(!m)return null;
  const off=TZ[m[4]]!=null?TZ[m[4]]:9;
  return {id:m[4]+m[1]+m[2],home:/^回程/.test(l),city:m[3],code:m[4],
   date:`${YEAR}.${m[1].padStart(2,'0')}.${m[2].padStart(2,'0')}`,
   at:Date.UTC(YEAR,+m[1]-1,+m[2],+m[5]-off,+m[6])};
 }
 function stampSVG(o){
  const top=o.home?'WELCOME HOME':'ARRIVED',bot=o.home?'旅程圓滿':'入境紀念';
  const ink=o.home?'#7C9BB8':'#D9837A';
  return `<svg viewBox="0 0 120 120" aria-hidden="true"><defs>
   <path id="stT${o.id}" d="M22 60a38 38 0 0 1 76 0"/><path id="stB${o.id}" d="M24 64a36 36 0 0 0 72 0"/>
   <filter id="stR${o.id}"><feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.85 1.12"/><feComposite in="SourceGraphic" operator="in"/></filter></defs>
   <g filter="url(#stR${o.id})" fill="none" stroke="${ink}">
    <circle cx="60" cy="60" r="55" stroke-width="3.2"/><circle cx="60" cy="60" r="48" stroke-width="1.4" stroke-dasharray="3 3.4"/>
    <circle cx="60" cy="60" r="30" stroke-width="1.6"/>
    <text font-size="10.5" font-weight="800" letter-spacing="2.2" fill="${ink}" stroke="none" text-anchor="middle"><textPath href="#stT${o.id}" startOffset="50%">${top}</textPath></text>
    <text font-size="9.5" font-weight="800" letter-spacing="3" fill="${ink}" stroke="none" text-anchor="middle" dominant-baseline="hanging"><textPath href="#stB${o.id}" startOffset="50%">${bot}</textPath></text>
    <text x="60" y="56" font-size="15" font-weight="900" fill="${ink}" stroke="none" text-anchor="middle">${o.city}</text>
    <text x="60" y="71" font-size="8.6" font-weight="800" fill="${ink}" stroke="none" text-anchor="middle" letter-spacing=".4">${o.date}</text>
    <path d="M48 79.5q12 6 24 0" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M14 60h-6M112 60h-6" stroke-width="2" stroke-linecap="round"/>
    <path d="M60 16.5l1.3 2.7 3 .4-2.2 2 .5 3-2.6-1.4-2.6 1.4.5-3-2.2-2 3-.4Z" fill="${ink}" stroke="none" transform="translate(0 86)"/>
   </g></svg>`;
 }
 function stamp(p,o,anim){
  if(p.querySelector('.pass-stamp'))return;
  const s=document.createElement('div');s.className='pass-stamp'+(o.home?' home':'');s.innerHTML=stampSVG(o);
  s.setAttribute('role','img');s.setAttribute('aria-label',o.home?'已平安回家':'已抵達'+o.city);
  p.appendChild(s);p.classList.add('stamped');
  if(anim&&!RM){
   const go=()=>{s.classList.add('thump');p.classList.add('jolt');setTimeout(()=>p.classList.remove('jolt'),500);};
   if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();setTimeout(go,250);}},{threshold:.6});io.observe(p);}
   else go();
  }
 }
 function passes(preview){
  const seen=get(SK,{});let ch=false;
  document.querySelectorAll('article.pass').forEach(p=>{
   const o=info(p);if(!o)return;
   if(preview||Date.now()>=o.at){stamp(p,o,preview||!seen[o.id]);if(!preview&&!seen[o.id]){seen[o.id]=1;ch=true;}}
  });
  if(ch)put(SK,seen);
 }
 passes();setInterval(()=>passes(),60000);
 window.hkPreviewStamp=()=>{document.querySelectorAll('.pass-stamp').forEach(x=>x.remove());passes(true);
  const f=$('#flights');if(f)f.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});};

 /* ---------- 2. 訂位／訂房／買票：記在哪個 App、確認編號，加上總清單 ---------- */
 const TICKET=on=>`<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6.2a1.6 1.6 0 0 1 1.6-1.6h10.8A1.6 1.6 0 0 1 17 6.2v1.7a2.1 2.1 0 0 0 0 4.2v1.7a1.6 1.6 0 0 1-1.6 1.6H4.6A1.6 1.6 0 0 1 3 13.8v-1.7a2.1 2.1 0 0 0 0-4.2Z" fill="${on?'#FFE39A':'#fff'}" stroke="${on?'#B98A3E':'#D9A48F'}" stroke-width="1.4" stroke-linejoin="round"/><path d="M12.6 5v10" stroke="${on?'#B98A3E':'#D9A48F'}" stroke-width="1.2" stroke-dasharray="1.4 1.6"/>${on?'<path d="M6 10.2l1.7 1.7 3-3.4" fill="none" stroke="#8A6A2E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>':'<path d="M7.8 8v4M5.8 10h4" stroke="#D9A48F" stroke-width="1.5" stroke-linecap="round"/>'}</svg>`;
 const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const H=['Booking','Agoda','Trip.com','官網'];
 // lv：must 建議先訂、can 可以訂、walk 不用訂（只顯示提示）
 const BOOK=[
  ['car',/Nippon 租車/,{lv:'must',w:'預約',apps:['官網','Klook','KKday'],def:{app:'官網',ref:'G34218'},tip:'取車和還車是同一筆預約'}],
  ['vista',/Hotel Vista/,{lv:'must',w:'訂房',apps:H,def:{app:'Booking'},tip:'用 Booking 訂；4 晚（2/10–2/14）'}],
  ['amanek',/Amanek/,{lv:'must',w:'訂房',apps:H,def:{app:'Booking'},tip:'2 晚（2/14–2/16）'}],
  ['takimoto',/第一瀧本館/,{lv:'must',w:'訂房',apps:H,def:{app:'官網'},tip:'溫泉旅館，含不含早晚餐記在備註'}],
  ['koko',/KOKO STAY/,{lv:'must',w:'訂房',apps:H,def:{app:'Trip.com'},tip:'最後 2 晚（2/16–2/18）'}],
  ['tokuju',/徳寿|德壽/,{lv:'must',w:'訂位',apps:['Google 地圖','Tabelog','Toreta','ぐるなび'],tip:'Google 地圖（Toreta）或ぐるなび 可以網路訂位'}],
  ['masajin',/Masajin/i,{lv:'can',w:'訂位',apps:['Google 地圖','Tabelog','Toreta','ぐるなび'],tip:'Google 地圖（Toreta）或ぐるなび 可以網路訂位'}],
  ['aoki',/檍/,{lv:'can',w:'訂位',apps:['Google 地圖','Tabelog','Toreta','Hot Pepper'],tip:'人氣排隊店，可不可以訂座以官網為準'}],
  ['shinobure',/Shinobure/i,{lv:'can',w:'訂位',apps:['Google 地圖','Tabelog','Toreta','ぐるなび'],tip:'Google 地圖（Toreta）或ぐるなび 可以網路訂位'}],
  ['zen',/禪|禅/,{lv:'must',w:'訂位',apps:['Google 地圖','Tabelog','Toreta','ぐるなび'],tip:'2/13 是週六，週末常提早客滿'}],
  ['kotetsu',/こてつ/,{lv:'can',w:'訂位',apps:['Google 地圖','Tabelog','Toreta','Hot Pepper'],tip:'商場裡的店，可不可以訂以官網為準'}],
  ['tenkin',/天金/,{lv:'walk',txt:'只能電話訂・現場候位'}],
  ['moiwa',/藻岩山纜車/,{lv:'can',w:'買票',apps:['KKday','Klook','官網'],tip:'備註有 KKday 連結，先買可以快速上山'}],
  ['cruise',/運河遊船/,{lv:'must',w:'訂船',apps:['官網','KKday','Klook'],tip:'官網 otaru.cc 60 天前開放，傍晚班次熱門'}],
  ['asahiyama',/旭山動物園/,{lv:'can',w:'買票',apps:['KKday','Klook','官網'],tip:'¥1,000，網路票出示 QR 碼入園'}],
  ['okushiba',/奧芝|奥芝/,{lv:'walk',txt:'不能訂・現場排隊'}],
  ['ichiran',/一蘭/,{lv:'walk',txt:'不用訂・現場排隊'}],
  ['aquarium',/小樽水族館/,{lv:'walk',txt:'現場買票較便宜'}],
  ['okurayama',/大倉山展望台/,{lv:'walk',txt:'現場買票'}],
  ['shiroi',/白い恋人パーク/,{lv:'walk',txt:'現場買票'}],
  ['usu',/有珠山纜車/,{lv:'walk',txt:'現場買票'}],
 ];

 const APC={'Booking':['B','#7FA6D6'],'Agoda':['A','#C9A0C4'],'Trip.com':['T','#6FB3CF'],'Hotels.com':['H','#D99A9A'],'樂天':['樂','#D98C8C'],'Jalan':['J','#E2A86B'],
  'Klook':['K','#E9A08A'],'KKday':['K','#8CC7A6'],'VELTRA':['V','#8FA9D9'],'LAWSON':['L','#8DB2D9'],'asoview':['a','#E3B565'],
  'Google 地圖':['G','#8FB3E0'],'ぐるなび':['ぐ','#E39494'],'Hot Pepper':['H','#E7A866'],'TableCheck':['T','#9AA9C9'],'Tabelog':['食','#E8B060'],'Toreta':['To','#9CC98A'],'現場':['現','#A9B79A'],'其他':['…','#B9ADA3']};
 const appIc=a=>{if(a==='官網')return '<svg class="bk-ap" viewBox="0 0 20 20" aria-hidden="true"><rect x="1" y="1" width="18" height="18" rx="5.5" fill="#E7B9A8"/><path d="M5.2 9.6 10 5.6l4.8 4v4.8H5.2Z" fill="#fff"/><rect x="8.6" y="11.2" width="2.8" height="3.2" rx=".8" fill="#E7B9A8"/></svg>';
  if(a==='電話')return '<svg class="bk-ap" viewBox="0 0 20 20" aria-hidden="true"><rect x="1" y="1" width="18" height="18" rx="5.5" fill="#9CC3A8"/><path d="M7 5.2c.5 0 1.6 2 1.6 2.4s-.9.9-.9 1.3c.3 1 1.4 2.1 2.4 2.4.4 0 .9-.9 1.3-.9s2.4 1.1 2.4 1.6c0 .9-1.1 1.8-2 1.8-3.1 0-6.6-3.5-6.6-6.6 0-.9.9-2 1.8-2Z" fill="#fff"/></svg>';
  const c=APC[a];if(!c)return '';return `<svg class="bk-ap" viewBox="0 0 20 20" aria-hidden="true"><rect x="1" y="1" width="18" height="18" rx="5.5" fill="${c[1]}"/><text x="10" y="14.2" text-anchor="middle" font-size="${c[0].length>1?8:11.5}" font-weight="900" fill="#fff" font-family="inherit">${c[0]}</text></svg>`;};
 const ALLAPPS=['其他'];
 const BK='hk-booked-v2';let BKD=get(BK,{});
 const st=id=>{const r=BOOK.find(b=>b[0]===id),o=BKD[id];if(o&&o.off)return null;if(o)return o;return r&&r[2].def?Object.assign({},r[2].def):null;};
 const ov=()=>get('hk-adjust-v1',{});
 function firstOf(rule){const O=ov();for(let i=0;i<days.length;i++)for(let j=0;j<days[i].events.length;j++){
   if(!rule[1].test(days[i].events[j][1]))continue;const o=O[i+'-'+j];if(o&&!o.r&&o.x)continue;
   return {i,j,d:o&&!o.r&&o.d!=null?o.d:i,t:o&&!o.r&&o.t?o.t:days[i].events[j][0],n:days[i].events[j][1]};}return null;}
 const ruleFor=n=>BOOK.find(b=>b[1].test(n));
 const shortName=n=>String(n).replace(/（.*?）|\(.*?\)/g,'').trim();
 function chipHTML(id,r,custom){
  const c=r||{lv:'can',w:'訂位'},o=st(id),w=c.w||'訂位';
  if(c.lv==='walk')return `<span class="bk-chip walk">${esc(c.txt)}</span>`;
  const lab=o?(o.app?`${esc(o.app)} 已${w==='預約'?'預約':'訂好'}`:`已${w}`):(c.lv==='must'?`要先${w}`:`${w}了嗎`);
  return `<button type="button" class="bk-chip${o?' on':''}${!o&&c.lv==='must'?' must':''}" data-bk="${id}" aria-label="${o?'已'+w+'，點一下看或修改':'記錄'+w}">${o&&o.app&&appIc(o.app)||TICKET(!!o)}<span>${lab}</span></button>`;
 }
 function keyOf(ev){const cb=ev.querySelector('input[data-check]');if(cb)return cb.dataset.check;const c=ev.querySelector('[data-ccheck]');return c?c.dataset.ccheck:null;}
 function books(){
  const dc=$('#dayCard');if(!dc)return;
  dc.querySelectorAll('.event').forEach(ev=>{
   ev.querySelectorAll('.bk-chip,.bk-info').forEach(x=>x.remove());
   const k=keyOf(ev);if(!k)return;let id=null,r=null;
   const m=k.match(/^event-(\d+)-(\d+)$/);
   if(m){const i=+m[1],j=+m[2],n=days[i].events[j][1];const R=ruleFor(n);if(!R)return;const f=firstOf(R);
    if(!f||f.i!==i||f.j!==j){if(R[2].lv==='walk'){id=R[0];r=R[2];}else return;}else{id=R[0];r=R[2];}}
   else{if(!ev.querySelector('[data-map-place]'))return;id='c:'+k;r={lv:'can',w:'訂位'};}
   const html=chipHTML(id,r);
   const tags=ev.querySelector('.tags');
   if(tags)tags.insertAdjacentHTML('beforeend',html);
   else{const a=ev.querySelector('.event-actions');if(a)a.insertAdjacentHTML('beforebegin','<div class="tags">'+html+'</div>');}
   const o=r.lv!=='walk'&&st(id);
   if(o&&(o.ref||o.when||o.note)){const a=ev.querySelector('.event-actions');if(a)a.insertAdjacentHTML('beforebegin',`<p class="bk-info">${[o.when,o.ref?'編號 '+o.ref:'',o.note].filter(Boolean).map(esc).join('　・　')}</p>`);}
  });
  bar();
 }
 /* 編輯視窗 */
 const sh=document.createElement('div');sh.className='cs-sheet bk-sheet';sh.hidden=true;document.body.appendChild(sh);
 let cur=null;
 const open=html=>{sh.innerHTML=html;sh.hidden=false;document.body.classList.add('cs-open');};
 const close=()=>{sh.hidden=true;document.body.classList.remove('cs-open');};
 function edit(id){
  cur=id;const R=BOOK.find(b=>b[0]===id),c=R?R[2]:{lv:'can',w:'訂位'},w=c.w||'訂位',o=st(id)||{};
  let name='';if(R){const f=firstOf(R);name=f?shortName(f.n):'';}else{const ev=document.querySelector(`.bk-chip[data-bk="${CSS.escape(id)}"]`);const h=ev&&ev.closest('.event').querySelector('h4');name=h?shortName(h.textContent.replace(/^\S+\s/,'')):'';}
  const sug=c.apps||['Google 地圖','Tabelog','Toreta'],apps=[...sug,...ALLAPPS.filter(a=>!sug.includes(a))],pick=o.app||(!BKD[id]&&c.pre)||'';
  open(`<div class="cs-panel" role="dialog" aria-modal="true" aria-label="${w}紀錄"><h3>${w}紀錄</h3><p class="adj-name">${esc(name)}</p>
   ${c.tip?`<p class="bk-tip">${esc(c.tip)}</p>`:''}
   <p class="bk-lab">在哪裡${w}？</p><div class="bk-apps">${apps.map(a=>`<button type="button" data-app="${esc(a)}" class="${a===pick?'on':''}${sug.includes(a)?' sug':''}">${appIc(a)}${esc(a)}</button>`).join('')}</div>
   <label>時間・人數（選填）<input id="bkWhen" maxlength="30" placeholder="${w==='訂房'?'例：2/10 入住 2 晚・2 人':'例：2/10 20:30・2 位'}" value="${esc(o.when||'')}"></label>
   <label>確認編號（選填）<input id="bkRef" maxlength="30" autocapitalize="characters" placeholder="例：AB12345" value="${esc(o.ref||'')}"></label>
   <label>備註（選填）<input id="bkNote" maxlength="40" placeholder="${w==='訂房'?'例：含早餐、已付款':'例：已付訂金、要準時到'}" value="${esc(o.note||'')}" enterkeyhint="done"></label>
   <div class="cs-btns"><button type="button" class="cs-cancel">${st(id)?'改成還沒'+w:'取消'}</button><button type="button" class="cs-save bk-save">已${w} ✓</button></div></div>`);
 }
 sh.addEventListener('click',e=>{
  if(e.target===sh){close();return;}
  if(e.target.closest('.bk-x')){close();return;}
  const a=e.target.closest('[data-app]');if(a){const was=a.classList.contains('on');sh.querySelectorAll('[data-app]').forEach(x=>x.classList.remove('on'));if(!was)a.classList.add('on');return;}
  const g=e.target.closest('[data-go]');if(g){close();goTo(g.dataset.go);return;}
  if(e.target.closest('.cs-cancel')){if(cur&&st(cur)){BKD[cur]={off:1};put(BK,BKD);books();}close();return;}
  if(e.target.closest('.bk-save')){const ap=sh.querySelector('[data-app].on');
   BKD[cur]={app:ap?ap.dataset.app:'',when:($('#bkWhen').value||'').trim(),ref:($('#bkRef').value||'').trim(),note:($('#bkNote').value||'').trim(),at:Date.now()};
   put(BK,BKD);close();books();const nb=document.querySelector(`.bk-chip[data-bk="${CSS.escape(cur)}"]`);if(nb&&!RM)nb.classList.add('pop');toast('記好了 ✓');}
 });
 document.addEventListener('click',e=>{const b=e.target.closest('button.bk-chip');if(b){e.preventDefault();edit(b.dataset.bk);return;}
  if(e.target.closest('.bk-bar')){e.preventDefault();list();}});
 /* 總清單 */
 function rows(){return BOOK.filter(b=>b[2].lv!=='walk').map(b=>{const f=firstOf(b);return f?{id:b[0],c:b[2],f,o:st(b[0])}:null;}).filter(Boolean)
  .sort((a,b)=>a.f.d-b.f.d||String(a.f.t).localeCompare(String(b.f.t)));}
 function bar(){
  const host=$('#tabs');if(!host)return;let el=$('.bk-bar');
  if(!el){el=document.createElement('button');el.type='button';el.className='bk-bar';host.parentNode.insertBefore(el,host);}
  const R=rows(),left=R.filter(x=>!x.o),must=left.filter(x=>x.c.lv==='must').length;
  el.innerHTML=`${TICKET(!left.length)}<span>訂位・買票清單</span><b>${left.length?`還有 ${left.length} 個沒訂${must?`（${must} 個要先訂）`:''}`:'全部訂好了 ✓'}</b>`;
  el.classList.toggle('done',!left.length);
 }
 function list(){
  const R=rows(),left=R.filter(x=>!x.o),done=R.filter(x=>x.o);
  const row=x=>{const w=x.c.w||'訂位';return `<button type="button" class="bk-row${x.o?' ok':''}${!x.o&&x.c.lv==='must'?' must':''}" data-go="${x.id}"><i>D${x.f.d+1}</i><span><b>${esc(shortName(x.f.n))}</b><small>${x.o?`${x.o.app?appIc(x.o.app):''}已${w}${x.o.app?'・'+esc(x.o.app):''}${x.o.ref?'・'+esc(x.o.ref):''}`:(x.c.lv==='must'?`要先${w}`:`可以${w}`)+(x.c.apps?'：'+esc(x.c.apps.slice(0,2).join('／')):'')}</small></span></button>`;};
  open(`<div class="cs-panel bk-list" role="dialog" aria-modal="true" aria-label="訂位・買票清單"><h3>訂位・買票清單</h3>
   ${left.length?`<p class="bk-lab">還沒訂（${left.length}）</p>${left.map(row).join('')}`:'<p class="bk-tip">全部都訂好了，安心出發！</p>'}
   ${done.length?`<p class="bk-lab">已經訂好（${done.length}）</p>${done.map(row).join('')}`:''}
   <p class="bk-foot">點一下就跳到那天的行程。不用訂位的地方（例如一蘭、奧芝商店、水族館現場買票）會直接在行程上標示。</p>
   <div class="cs-btns"><button type="button" class="bk-x">關閉</button></div></div>`);
 }
 function goTo(id){
  const R=BOOK.find(b=>b[0]===id);const f=R&&firstOf(R);if(!f||typeof showDay!=='function')return;
  showDay(f.d);setTimeout(()=>{const c=document.querySelector(`.bk-chip[data-bk="${CSS.escape(id)}"]`);const ev=c&&c.closest('.event');
   if(ev){ev.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});ev.classList.add('bk-flash');setTimeout(()=>ev.classList.remove('bk-flash'),1600);}},80);
 }
 if(typeof showDay==='function'){const p=showDay;window.showDay=showDay=function(i){const r=p.apply(this,arguments);try{books()}catch(e){console.warn(e)}return r;};}
 try{books()}catch(e){console.warn(e)}
})();
