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

 /* ---------- 2. 行程：已訂位／已訂房／已買票 ---------- */
 const BK='hk-booked-v1';let BKD=get(BK,{});
 const word=cat=>/美食/.test(cat)?'訂位':/住宿/.test(cat)?'訂房':/交通/.test(cat)?'預約':'買票';
 const TICKET=on=>`<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6.2a1.6 1.6 0 0 1 1.6-1.6h10.8A1.6 1.6 0 0 1 17 6.2v1.7a2.1 2.1 0 0 0 0 4.2v1.7a1.6 1.6 0 0 1-1.6 1.6H4.6A1.6 1.6 0 0 1 3 13.8v-1.7a2.1 2.1 0 0 0 0-4.2Z" fill="${on?'#FFE39A':'#fff'}" stroke="${on?'#B98A3E':'#C9BDB2'}" stroke-width="1.4" stroke-linejoin="round"/><path d="M12.6 5v10" stroke="${on?'#B98A3E':'#C9BDB2'}" stroke-width="1.2" stroke-dasharray="1.4 1.6"/>${on?'<path d="M6 10.2l1.7 1.7 3-3.4" fill="none" stroke="#8A6A2E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>':'<path d="M7.8 8v4M5.8 10h4" stroke="#C9BDB2" stroke-width="1.5" stroke-linecap="round"/>'}</svg>`;
 function keyOf(ev){const cb=ev.querySelector('input[data-check]');if(cb)return cb.dataset.check;const c=ev.querySelector('[data-ccheck]');return c?c.dataset.ccheck:null;}
 function books(){
  const dc=$('#dayCard');if(!dc)return;
  dc.querySelectorAll('.event').forEach(ev=>{
   ev.querySelectorAll('.bk-chip').forEach(x=>x.remove());
   const k=keyOf(ev);if(!k||!ev.querySelector('[data-map-place]'))return;
   const cat=(ev.querySelector('.cat')||{}).textContent||'';if(/停車/.test(cat)||/機場/.test((ev.querySelector('h4')||{}).textContent||''))return;
   const w=word(cat),on=!!BKD[k];
   const html=`<button type="button" class="bk-chip${on?' on':''}" data-bk="${k}" data-w="${w}" aria-pressed="${on}" aria-label="${on?'已'+w+'，點一下取消':'標記為已'+w}">${TICKET(on)}<span>${on?'已'+w:w+'了嗎'}</span></button>`;
   const tags=ev.querySelector('.tags');
   if(tags)tags.insertAdjacentHTML('beforeend',html);
   else{const a=ev.querySelector('.event-actions');if(a)a.insertAdjacentHTML('beforebegin','<div class="tags">'+html+'</div>');}
  });
 }
 document.addEventListener('click',e=>{
  const b=e.target.closest('.bk-chip');if(!b)return;
  e.preventDefault();const k=b.dataset.bk,w=b.dataset.w;
  if(BKD[k])delete BKD[k];else BKD[k]=1;put(BK,BKD);books();
  if(BKD[k]){const nb=document.querySelector(`.bk-chip[data-bk="${CSS.escape(k)}"]`);if(nb&&!RM)nb.classList.add('pop');toast('已'+w+' ✓');}
 });
 if(typeof showDay==='function'){const p=showDay;window.showDay=showDay=function(i){const r=p.apply(this,arguments);try{books()}catch(e){console.warn(e)}return r;};}
 try{books()}catch(e){}
})();
