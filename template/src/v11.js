/* ===== v11：備份還原、一鍵同步、行事曆、日圓計算機、小日記與回憶卡 ===== */
(function(){
 const $=s=>document.querySelector(s);
 const esc5=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const pad=n=>String(n).padStart(2,'0');
 const toMin=t=>{const [h,m]=String(t).split(':').map(Number);return (h||0)*60+(m||0);};
 const partner=()=>{try{return (JSON.parse(localStorage.getItem('hk-ledger-set-v1')||'{}').b)||'陳肥肥'}catch(e){return '陳肥肥'}};
 const TITLE=(document.querySelector('.brand b,.brand,.top-brand')||{}).textContent||'旅行';
 const K='stroke="#5B4B43" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"';
 const ic=b=>`<span class="cute-ic-wrap lead"><svg class="cute-ic" viewBox="0 0 20 20" aria-hidden="true">${b}</svg></span>`;
 const IC={
  save:ic(`<path d="M4 4.6A1.6 1.6 0 0 1 5.6 3h7.6L16 5.8v9.6a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 15.4Z" fill="#DCEBF7" ${K}/><rect x="6.6" y="3" width="6" height="4" rx=".8" fill="#fff" ${K}/><path d="M10 14.6c-2-1.4-2.8-2.4-2.8-3.4a1.4 1.4 0 0 1 2.8-.4 1.4 1.4 0 0 1 2.8.4c0 1-.8 2-2.8 3.4Z" fill="#F4A9A0" ${K}/>`),
  load:ic(`<path d="M4 12.4v2.8A1.8 1.8 0 0 0 5.8 17h8.4a1.8 1.8 0 0 0 1.8-1.8v-2.8" fill="none" ${K}/><path d="M10 3.4v9M6.6 9.2 10 12.6l3.4-3.4" fill="none" ${K}/>`),
  sync:ic(`<circle cx="10" cy="10" r="8" fill="#E9DDF4" ${K}/><path d="M6.4 9A3.8 3.8 0 0 1 13 7.2M13.6 11A3.8 3.8 0 0 1 7 12.8" fill="none" ${K}/><path d="M13.4 4.8 13 7.2l-2.4-.4M6.6 15.2l.4-2.4 2.4.4" fill="none" ${K}/>`),
  cal:ic(`<rect x="3" y="4.5" width="14" height="12.5" rx="3" fill="#fff" ${K}/><path d="M3 8.5h14V7.5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3Z" fill="#F6E2A6" ${K}/><path d="M7 3v3M13 3v3" ${K}/><path d="M10 15c-1.6-1.1-2.3-1.9-2.3-2.7a1.15 1.15 0 0 1 2.3-.3 1.15 1.15 0 0 1 2.3.3c0 .8-.7 1.6-2.3 2.7Z" fill="#F4A9A0"/>`),
  home:ic(`<path d="M3.4 9.4 10 3.6l6.6 5.8" fill="none" ${K}/><path d="M5 8.2V16a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8.2" fill="#FBE1EA" ${K}/><rect x="8.4" y="11.4" width="3.2" height="5.6" rx=".8" fill="#fff" ${K}/>`)
 };

 /* ---------- 1. 備份／還原＋加到主畫面 ---------- */
 try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist();}catch(e){}
 const standalone=(window.navigator.standalone===true)||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches);
 const tools=$('#trip-tools .card')||$('#trip-tools');
 if(tools){
  const box=document.createElement('div');box.className='bk-box';
  box.innerHTML=`${standalone?'':`<div class="bk-tip"><b>${IC.home}先把網站加到主畫面</b><span>Safari 下方「分享」→「加入主畫面」。加了之後資料比較不會被 iPhone 自動清掉，打開也像 App 一樣。</span></div>`}
   <div class="bk-grid">
    <button type="button" class="bk-btn" id="hkSync">${IC.sync}一鍵同步給<span class="pn"></span></button>
    <button type="button" class="bk-btn" id="hkIcs">${IC.cal}匯入手機行事曆</button>
    <button type="button" class="bk-btn" id="hkBackup">${IC.save}備份全部資料</button>
    <button type="button" class="bk-btn" id="hkRestore">${IC.load}還原備份</button>
   </div>
   <p class="bk-note">備份包含記帳、打勾、行程調整、評價和設定。換手機或怕資料不見時用。</p>
   <input type="file" id="hkRestoreFile" accept=".json,application/json,text/plain" hidden>`;
  tools.appendChild(box);
  const setPN=()=>box.querySelectorAll('.pn').forEach(x=>x.textContent=partner());setPN();
  document.addEventListener('change',e=>{if(e.target&&e.target.closest&&e.target.closest('#ledger'))setTimeout(setPN,100);});
 }
 const snapshot=()=>{const data={};Object.keys(localStorage).forEach(k=>{data[k]=localStorage[k];});return {app:'hk-trip',v:1,at:new Date().toISOString(),data};};
 async function share(file,title,fallbackName){
  try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title});return true;}}catch(e){if(e&&e.name==='AbortError')return true;}
  const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download=fallbackName||file.name;document.body.appendChild(a);a.click();a.remove();return true;
 }
 document.addEventListener('click',async e=>{
  const t=e.target.closest&&e.target.closest('#hkBackup,#hkRestore,#hkSync,#hkIcs');if(!t)return;
  if(t.id==='hkBackup'){
   const d=new Date(),name=`北海道雪日記備份-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}.json`;
   const file=new File([JSON.stringify(snapshot())],name,{type:'application/json'});
   await share(file,'北海道雪日記備份',name);toast('備份好了，可以存到「檔案」或傳到 LINE 記事本');
  }
  if(t.id==='hkRestore')$('#hkRestoreFile').click();
  if(t.id==='hkSync'){
   const parts=[];
   try{if(window.hkLedgerPack)parts.push('merge='+await window.hkLedgerPack());}catch(err){}
   try{if(window.hkAdjPack)parts.push('adj='+await window.hkAdjPack());}catch(err){}
   if(!parts.length){toast('目前沒有可以同步的資料');return;}
   const url=location.origin+location.pathname+'#'+parts.join('&');
   const text=`記帳和行程調整都在這裡，點開就會同步到你的手機：`;
   try{if(navigator.share){await navigator.share({title:'北海道雪日記同步',text,url});return;}}catch(err){if(err&&err.name==='AbortError')return;}
   copyText(text+' '+url);
  }
  if(t.id==='hkIcs')makeIcs();
 });
 document.addEventListener('change',e=>{
  if(!e.target||e.target.id!=='hkRestoreFile')return;const f=e.target.files&&e.target.files[0];if(!f)return;
  const rd=new FileReader();rd.onload=()=>{
   try{const o=JSON.parse(rd.result);if(!o||o.app!=='hk-trip'||!o.data)throw 0;
    const n=Object.keys(o.data).length;
    if(!confirm(`要用 ${o.at?o.at.slice(0,10):''} 的備份（${n} 項資料）蓋掉這支手機現在的資料嗎？`))return;
    Object.entries(o.data).forEach(([k,v])=>{localStorage[k]=v;});
    toast('還原完成，重新整理中…');setTimeout(()=>location.reload(),900);
   }catch(err){toast('這個檔案不是網站的備份檔');}
  };rd.readAsText(f);e.target.value='';
 });

 /* ---------- 2. 匯入手機行事曆（.ics） ---------- */
 function makeIcs(){
  const ev=d=>window.hkEvents?window.hkEvents(d):days[d].events;
  const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//hk-trip//snowmaru//ZH','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:'+TITLE.trim()];
  const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
  const fold=s=>String(s).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n');
  const utc=(date,min,off)=>{const [y,m,dd]=date.split('-').map(Number);const t=Date.UTC(y,m-1,dd,0,min)-off*3600000;const x=new Date(t);return `${x.getUTCFullYear()}${pad(x.getUTCMonth()+1)}${pad(x.getUTCDate())}T${pad(x.getUTCHours())}${pad(x.getUTCMinutes())}00Z`;};
  let n=0;
  days.forEach((day,d)=>{
   const list=ev(d);
   list.forEach((e,k)=>{
    const off=/台中|桃園|台北/.test(e[1])?8:9;
    const st=toMin(e[0]);let en=list[k+1]?toMin(list[k+1][0]):st+60;if(en<=st)en=st+30;if(en-st>180)en=st+180;
    L.push('BEGIN:VEVENT','UID:hk-'+d+'-'+k+'-'+st+'@snowmaru','DTSTAMP:'+stamp,'DTSTART:'+utc(day.date,st,off),'DTEND:'+utc(day.date,en,off),
     'SUMMARY:'+fold(`${e[3]||''} ${e[1]}`.trim()),'LOCATION:'+fold(e[1]),'DESCRIPTION:'+fold(`D${d+1}・${e[2]||''}`),
     'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+fold('15 分鐘後：'+e[1]),'TRIGGER:-PT15M','END:VALARM','END:VEVENT');n++;
   });
  });
  L.push('END:VCALENDAR');
  const ics=L.join('\r\n');
  const ios=/iPhone|iPad|iPod/.test(navigator.userAgent);
  if(ios){location.href='data:text/calendar;charset=utf-8,'+encodeURIComponent(ics);}
  else{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));a.download='hokkaido-trip.ics';document.body.appendChild(a);a.click();a.remove();}
  toast(`共 ${n} 個行程，每站前 15 分鐘會提醒`);
 }

 /* ---------- 3. 日圓計算機 ---------- */
 const rate=()=>{try{const r=+JSON.parse(localStorage.getItem('hk-ledger-set-v1')||'{}').rate;return r>0?r:0.21}catch(e){return 0.21}};
 const fab=document.createElement('button');fab.type='button';fab.className='yen-fab';fab.setAttribute('aria-label','日圓台幣計算機');
 fab.innerHTML='<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16" fill="#F6D98B" stroke="#5B4B43" stroke-width="2.2"/><circle cx="20" cy="20" r="11" fill="none" stroke="#D9A94F" stroke-width="1.4"/><path d="M15.4 13.2 20 19.4l4.6-6.2M20 19.4v7.2M16.4 20.6h7.2M16.4 23.8h7.2" fill="none" stroke="#7A5A2E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 document.body.appendChild(fab);
 const cs=document.createElement('div');cs.className='cs-sheet yen-sheet';cs.hidden=true;
 cs.innerHTML=`<div class="cs-panel yen-panel" role="dialog" aria-modal="true" aria-label="日圓計算機"><div class="yen-top"><button type="button" class="yen-swap" id="yenSwap">¥ → NT$</button><small id="yenRate"></small></div>
  <div class="yen-disp"><div class="yen-expr" id="yenExpr">&nbsp;</div><div class="yen-in" id="yenIn">0</div><div class="yen-out" id="yenOut">≈ NT$ 0</div></div>
  <div class="yen-pad">${[['C','yk-op'],['⌫','yk-op'],['tax','yk-op'],['÷','yk-f'],['7'],['8'],['9'],['×','yk-f'],['4'],['5'],['6'],['−','yk-f'],['1'],['2'],['3'],['+','yk-f'],['0'],['00'],['=','yk-eq'],['go','yk-go']].map(([k,c])=>`<button type="button" data-k="${k}" class="${c||''}">${k==='tax'?'＋稅10%':k==='go'?'記帳':k}</button>`).join('')}</div></div>`;
 document.body.appendChild(cs);
 let expr='',toNT=true;
 const calc=x=>{const t=x.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-');if(!/^[\d.+\-*/]*$/.test(t))return 0;
  const tk=t.match(/\d+(?:\.\d+)?|[+\-*/]/g)||[];const out=[],ops=[],P={'+':1,'-':1,'*':2,'/':2};
  const ap=()=>{const o=ops.pop(),b=out.pop()||0,a=out.pop()||0;out.push(o==='+'?a+b:o==='-'?a-b:o==='*'?a*b:(b?a/b:0));};
  tk.forEach(x=>{if(/\d/.test(x))out.push(+x);else{while(ops.length&&P[ops[ops.length-1]]>=P[x])ap();ops.push(x);}});
  while(ops.length&&out.length>1)ap();return out.length?out[out.length-1]:0;};
 const val=()=>{const e=expr.replace(/[+\-×÷−]$/,'');return Math.round(calc(e)*100)/100;};
 const draw=()=>{const v=val(),r=rate();$('#yenExpr').textContent=/[+×÷−]/.test(expr)?expr:' ';$('#yenIn').textContent=(toNT?'¥ ':'NT$ ')+v.toLocaleString();
  $('#yenOut').textContent=toNT?`≈ NT$ ${(v*r).toLocaleString(undefined,{maximumFractionDigits:0})}`:`≈ ¥ ${(v/r).toLocaleString(undefined,{maximumFractionDigits:0})}`;
  $('#yenRate').textContent=`匯率 1 日圓 ≈ ${r} 台幣（可在記帳設定改）`;$('#yenSwap').textContent=toNT?'¥ → NT$':'NT$ → ¥';};
 fab.addEventListener('click',()=>{cs.hidden=false;document.body.classList.add('cs-open');draw();});
 cs.addEventListener('click',e=>{
  if(e.target===cs){cs.hidden=true;document.body.classList.remove('cs-open');return;}
  if(e.target.closest('#yenSwap')){toNT=!toNT;expr='';draw();return;}
  const b=e.target.closest('[data-k]');if(!b)return;const k=b.dataset.k;
  if(k==='C')expr='';
  else if(k==='⌫')expr=expr.slice(0,-1);
  else if(k==='tax')expr=String(Math.round(val()*1.1));
  else if(k==='=')expr=String(val());
  else if(/[+×÷−]/.test(k)){if(!expr)expr='0';expr=expr.replace(/[+×÷−]$/,'')+k;}
  else if(k==='go'){const v=val(),amt=toNT?v:Math.round(v/rate());if(!amt){toast('先輸入金額');return;}
   cs.hidden=true;document.body.classList.remove('cs-open');const a=$('#lgAmt');if(a){a.value=Math.round(amt);a.dispatchEvent(new Event('input',{bubbles:true}));const sec=$('#ledger');if(sec)sec.scrollIntoView({block:'start'});setTimeout(()=>a.focus(),400);toast('金額填好了，選分類後按 ＋');}return;}
  else{const last=expr.split(/[+×÷−]/).pop();if(last.replace('.','').length>=9)return;expr=(last==='0'&&k!=='00'?expr.slice(0,-1):expr)+k;if(/^0+\d/.test(expr))expr=expr.replace(/^0+/,'');}
  draw();
 });

 /* ---------- 4. 每一站的評價（好吃／好玩／踩雷） ---------- */
 const RK='hk-rate-v1';let RT={};try{RT=JSON.parse(localStorage.getItem(RK)||'{}')}catch(e){}
 const saveRT=()=>{try{localStorage.setItem(RK,JSON.stringify(RT))}catch(e){}};
 const FACE={
  3:`<circle cx="12" cy="12" r="9.6" fill="#FFD98A" ${K}/><path d="M7.6 9.4c-.9-.8-.3-2 .7-1.6.3-.9 1.7-.8 1.6.4-.1.9-1.1 1.5-1.6 1.9-.3-.2-.5-.4-.7-.7ZM16.4 9.4c.9-.8.3-2-.7-1.6-.3-.9-1.7-.8-1.6.4.1.9 1.1 1.5 1.6 1.9.3-.2.5-.4.7-.7Z" fill="#E8708A"/><path d="M8.2 13.6Q12 17.6 15.8 13.6Z" fill="#fff" stroke="#5B4B43" stroke-width="1.3" stroke-linejoin="round"/><ellipse cx="6.6" cy="13.4" rx="1.3" ry=".8" fill="#F5A8A8"/><ellipse cx="17.4" cy="13.4" rx="1.3" ry=".8" fill="#F5A8A8"/>`,
  2:`<circle cx="12" cy="12" r="9.6" fill="#D9ECF7" ${K}/><circle cx="9" cy="10.4" r="1.1" fill="#5B4B43"/><circle cx="15" cy="10.4" r="1.1" fill="#5B4B43"/><path d="M9.4 14.8h5.2" ${K}/><ellipse cx="6.8" cy="13" rx="1.2" ry=".7" fill="#F5A8A8"/><ellipse cx="17.2" cy="13" rx="1.2" ry=".7" fill="#F5A8A8"/>`,
  1:`<circle cx="12" cy="12" r="9.6" fill="#E6E1EE" ${K}/><path d="M7.8 9.8l2.2.8M16.2 9.8l-2.2.8" ${K}/><path d="M8.8 15.8q1.6-1.6 3.2 0t3.2 0" fill="none" ${K}/><path d="M18.4 5.6c.9 1.2 1.3 2 1.3 2.6a1.3 1.3 0 0 1-2.6 0c0-.6.4-1.4 1.3-2.6Z" fill="#AFCDEB" stroke="#5B4B43" stroke-width="1"/>`,
  0:`<circle cx="12" cy="12" r="9.6" fill="#fff" stroke="#C9BDB2" stroke-width="1.4" stroke-dasharray="2.4 2.2"/><path d="M12 7.6l1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4Z" fill="#FFE6A3" stroke="#C9A35A" stroke-width="1" stroke-linejoin="round"/>`
 };
 const face=r=>`<svg viewBox="0 0 24 24" aria-hidden="true">${FACE[r||0]}</svg>`;
 const WORDS=food=>food?{3:'超好吃',2:'還可以',1:'踩雷'}:{3:'超好玩',2:'還可以',1:'不推'};
 function keyOf(ev){const cb=ev.querySelector('input[data-check]');if(cb)return cb.dataset.check;const c=ev.querySelector('[data-ccheck]');return c?c.dataset.ccheck:null;}
 function nameOf(ev){const h=ev.querySelector('h4');return h?h.textContent.replace(/^\s*\S+\s/,'').trim():'';}
 function rates(){
  const dc=$('#dayCard');if(!dc)return;
  dc.querySelectorAll('.event').forEach(ev=>{
   const k=keyOf(ev),col=ev.querySelector('.time-col');if(!k||!col)return;
   const old=col.querySelector('.rt-btn');if(old)old.remove();
   const food=/美食/.test((col.querySelector('.cat')||{}).textContent||''),o=RT[k]||{};
   col.insertAdjacentHTML('beforeend',`<button type="button" class="rt-btn${o.r?' on r'+o.r:''}" data-rate="${k}" data-food="${food?1:0}" aria-label="評價這一站">${face(o.r)}<small>${o.r?WORDS(food)[o.r]:'評價'}</small></button>`);
   ev.querySelectorAll('.rt-note').forEach(x=>x.remove());
   if(o.n){const p=ev.querySelector('h4');if(p)p.parentNode.querySelector('.event-actions').insertAdjacentHTML('beforebegin',`<p class="rt-note">「${esc5(o.n)}」</p>`);}
  });
 }
 const rs=document.createElement('div');rs.className='cs-sheet rt-sheet';rs.hidden=true;document.body.appendChild(rs);
 let rk=null,rname='';
 function openRate(btn){
  rk=btn.dataset.rate;const food=btn.dataset.food==='1',W=WORDS(food),o=RT[rk]||{};
  rname=nameOf(btn.closest('.event')).replace(/（.*?）/g,'').trim();
  rs.innerHTML=`<div class="cs-panel" role="dialog" aria-modal="true" aria-label="評價"><h3>${food?'好不好吃？':'好不好玩？'}</h3><p class="adj-name">${esc5(rname)}</p>
   <div class="rt-pick">${[3,2,1].map(r=>`<button type="button" data-r="${r}" class="${o.r===r?'on':''}">${face(r)}<b>${W[r]}</b></button>`).join('')}</div>
   <label>一句話筆記（選填）<input id="rtNote" maxlength="40" placeholder="${food?'例：湯頭超濃，下次點加麵':'例：企鵝走超可愛，排隊 20 分'}" value="${esc5(o.n||'')}" enterkeyhint="done"></label>
   <div class="cs-btns"><button type="button" class="cs-cancel">${o.r?'清除評價':'取消'}</button><button type="button" class="cs-save rt-save">儲存</button></div></div>`;
  rs.hidden=false;document.body.classList.add('cs-open');
 }
 const closeRate=()=>{rs.hidden=true;document.body.classList.remove('cs-open');};
 rs.addEventListener('click',e=>{
  if(e.target===rs){closeRate();return;}
  const p=e.target.closest('[data-r]');if(p){rs.querySelectorAll('[data-r]').forEach(x=>x.classList.toggle('on',x===p));return;}
  if(e.target.closest('.cs-cancel')){if(RT[rk]&&RT[rk].r){delete RT[rk];saveRT();rates();}closeRate();return;}
  if(e.target.closest('.rt-save')){const on=rs.querySelector('[data-r].on');const n=($('#rtNote').value||'').trim();
   if(!on&&!n){toast('先選一個表情');return;}
   RT[rk]={r:on?+on.dataset.r:0,n,name:rname,d:current};saveRT();closeRate();rates();toast('記下來了 ✨');}
 });
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.rt-btn');if(b)openRate(b);});
 if(typeof showDay==='function'){const p=showDay;window.showDay=showDay=function(i){const r=p.apply(this,arguments);try{rates()}catch(e){console.warn(e)}return r;};}
 try{rates()}catch(e){}

 /* ---------- 5. 北海道回憶卡 ---------- */
 const acts=$('#footprints .fp-acts');
 if(acts){acts.insertAdjacentHTML('afterend',`<button type="button" class="fp-btn mem-btn" id="hkMemory"><span class="cute-ic-wrap lead"><svg class="cute-ic" viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="4" width="14" height="12" rx="2.4" fill="#E9DDF4" ${K}/><path d="M3 13.4 7.4 9.6l3 2.6 2.4-2 4.2 3.6" fill="none" ${K}/><circle cx="13" cy="7.6" r="1.4" fill="#F6D98B" ${K}/></svg></span>做成回憶卡</button>`);}
 document.addEventListener('click',async e=>{
  if(!(e.target.closest&&e.target.closest('#hkMemory')))return;
  const lit=(($('#fpNum')||{}).textContent||'0'),of=(($('#fpOf')||{}).textContent||'').replace(/[^\d]/g,'');
  let spent=0;try{const r=rate();JSON.parse(localStorage.getItem('hk-ledger-v1')||'[]').forEach(x=>{spent+=x.cur==='TWD'?(+x.amt||0)/r:(+x.amt||0);});}catch(err){}
  const all=Object.values(RT).filter(o=>o&&o.r);
  const grp=[[3,'超讚推薦','#FFE6A3','#C99A4A'],[2,'還可以','#D9ECF7','#7FA6C6'],[1,'踩雷／不推','#ECE7F3','#A897C2']].map(([r,t,bg,ed])=>[r,t,bg,ed,all.filter(o=>o.r===r).sort((a,b)=>(a.d||0)-(b.d||0))]).filter(g=>g[4].length);
  let y=190,rows='';
  if(!grp.length)rows=`<text x="360" y="260" text-anchor="middle" font-size="20" fill="#9A8A7E">在行程卡片左邊點「評價」，這裡就會出現你的推薦清單</text>`,y=320;
  grp.forEach(([r,t,bg,ed,items])=>{
   rows+=`<g transform="translate(40 ${y})"><rect width="640" height="${58+items.length*44}" rx="22" fill="${bg}" fill-opacity=".55" stroke="${ed}" stroke-width="2"/><svg x="18" y="12" width="34" height="34" viewBox="0 0 24 24">${FACE[r]}</svg><text x="62" y="37" font-size="22" font-weight="700" fill="#5B4B43">${t}</text>`+
    items.map((o,k)=>`<text x="62" y="${80+k*44}" font-size="18" fill="#5B4B43"><tspan fill="#E8977A" font-weight="700">D${(o.d||0)+1}</tspan>  ${esc5((o.name||'').slice(0,16))}${o.n?`<tspan fill="#8A7A70">「${esc5(o.n.slice(0,16))}」</tspan>`:''}</text>`).join('')+`</g>`;
   y+=58+items.length*44+18;
  });
  const H=y+110;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1080" height="${Math.round(H*1.5)}" viewBox="0 0 720 ${H}" font-family="'Huninn','PingFang TC','Noto Sans TC',sans-serif">
   <defs>${['i-enaga'].map(id=>{const el=document.getElementById(id);return el?el.outerHTML:'';}).join('')}<linearGradient id="mbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDEFF3"/><stop offset=".5" stop-color="#FFF9F1"/><stop offset="1" stop-color="#EEF5FB"/></linearGradient></defs>
   <rect width="720" height="${H}" fill="url(#mbg)"/>
   ${Array.from({length:26},(_,k)=>`<circle cx="${(k*97)%720}" cy="${(k*53)%H}" r="${2+k%3}" fill="#fff" opacity=".9"/>`).join('')}
   <use href="#i-enaga" xlink:href="#i-enaga" x="570" y="26" width="110" height="110"/>
   <text x="44" y="70" font-size="40" font-weight="700" fill="#5B4B43">北海道大暴吃</text>
   <text x="46" y="104" font-size="18" fill="#9A8A7E" letter-spacing="3">2027.02.10 – 02.18 ・ 吃喝玩樂回憶卡</text>
   <g transform="translate(44 126)"><rect width="200" height="44" rx="22" fill="#FFE6A3" stroke="#C99A4A" stroke-width="2"/><text x="100" y="29" text-anchor="middle" font-size="18" font-weight="700" fill="#5B4B43">★ 點亮 ${lit}/${of}</text>
    <rect x="216" width="230" height="44" rx="22" fill="#D9ECF7" stroke="#7FA6C6" stroke-width="2"/><text x="331" y="29" text-anchor="middle" font-size="18" font-weight="700" fill="#5B4B43">一起花了 ¥${Math.round(spent).toLocaleString()}</text></g>
   ${rows}
   <text x="360" y="${H-46}" text-anchor="middle" font-size="18" fill="#9A8A7E">我 &amp; ${esc5(partner())} ・ 北海道雪日記</text></svg>`;
  try{const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));const img=new Image();img.src=url;await img.decode();
   const W=1080,HH=Math.round(H*1.5),cv=document.createElement('canvas');cv.width=W;cv.height=HH;cv.getContext('2d').drawImage(img,0,0,W,HH);URL.revokeObjectURL(url);
   const png=await new Promise(r=>cv.toBlob(r,'image/png'));await share(new File([png],'hokkaido-memory.png',{type:'image/png'}),'北海道回憶卡','hokkaido-memory.png');
  }catch(err){toast('這支手機無法直接存圖，請用截圖分享');}
 });
})();
/* ===== 主圖依時間變天色：清晨／早上／中午／下午／傍晚／夜晚 ===== */
(function(){
 const art=document.getElementById('heroArt');if(!art)return;
 const P={
  dawn:{n:'清晨',sky:['#8F9BD0','#D9B8D3','#F7CBC4','#FFE3C6'],mt:['#B6B2D6','#928EBC'],cap:'#F4EEF7',cl:'#F6DDE6',st:'#E4DCE9',h:'#A7A3C8',sun:[262,128]},
  day:{n:'早上',sky:['#86BCE6','#B7D8F0','#DDEDF8','#F0F6FB'],mt:['#C4D5E6','#9FB4C9'],cap:'#FFFFFF',cl:'#FFFFFF',st:'#E6ECF2',h:'#B4C2D2',sun:[110,52]},
  noon:{n:'中午',sky:['#74B4E6','#A9D3F1','#D4EAF8','#EEF6FC'],mt:['#C8D8E8','#A3B7CB'],cap:'#FFFFFF',cl:'#FFFFFF',st:'#E8EEF3',h:'#B9C6D5',sun:[200,30]},
  pm:{n:'下午',sky:['#93BDE2','#C4D7EA','#EADFE0','#FBE6CF'],mt:['#C8D0E2','#A3ACC6'],cap:'#FDFAFB',cl:'#FFF6EE',st:'#E8E3EA',h:'#B3B6CF',sun:[262,60]},
  eve:{n:'傍晚',sky:['#A7AEDB','#D9C3DD','#F6D2C6','#FBE3CF'],mt:['#C9C4DE','#A39DC0'],cap:'#FBF4F8',cl:'#FBE6EE',st:'#E6DFEA',h:'#A9A4CA',sun:[262,130]},
  night:{n:'夜晚',sky:['#5E6AA6','#8E8DC2','#C9A9C9','#F2C7B8'],mt:['#9F9CC6','#7F7BAA'],cap:'#E9E6F5',cl:'#B9B4DA',st:'#DCD5E6',h:'#8784B4',moon:[96,40]}
 };
 const ORDER=['dawn','day','noon','pm','eve','night'];
 const pick=h=>h<5?'night':h<7?'dawn':h<11?'day':h<14?'noon':h<16.5?'pm':h<18.5?'eve':'night';
 let forced=null,lab=null;
 const $i=id=>document.getElementById(id);
 function apply(k){
  const p=P[k];ORDER.forEach(x=>art.classList.remove('tod-'+x));art.classList.add('tod-'+k);
  p.sky.forEach((c,i)=>{const e=$i('hgS'+i);if(e)e.setAttribute('stop-color',c);});
  const m=$i('hgMtn');if(m){m.setAttribute('fill',p.mt[0]);m.setAttribute('stroke',p.mt[1]);}
  const cp=$i('hgCaps');if(cp)cp.setAttribute('fill',p.cap);
  const cl=$i('hgCloud');if(cl){cl.setAttribute('fill',p.cl);cl.setAttribute('opacity',k==='night'?.75:.92);}
  const st=$i('hgStreet');if(st)st.setAttribute('fill',p.st);
  art.querySelectorAll('.hg-house').forEach(e=>e.setAttribute('fill',p.h));
  const sun=$i('hgSun'),moon=$i('hgMoon');
  if(sun){sun.style.display=p.sun?'':'none';if(p.sun)sun.setAttribute('transform',`translate(${p.sun[0]} ${p.sun[1]})`);}
  if(moon){moon.style.display=p.moon?'':'none';if(p.moon)moon.setAttribute('transform',`translate(${p.moon[0]} ${p.moon[1]})`);}
  if(forced){if(!lab){lab=document.createElement('span');lab.className='tod-label';art.appendChild(lab);}lab.textContent='預覽：'+p.n;}
  else if(lab){lab.remove();lab=null;}
 }
 const now=()=>{const d=new Date();return d.getHours()+d.getMinutes()/60;};
 const tick=()=>apply(forced||pick(now()));
 tick();setInterval(()=>{if(!forced)tick();},5*60*1000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!forced)tick();});
 const stamp=art.querySelector('.cover-stamp');
 if(stamp)stamp.addEventListener('click',()=>{
  const cur=forced||pick(now());const nx=ORDER[(ORDER.indexOf(cur)+1)%ORDER.length];
  forced=nx===pick(now())?null:nx;tick();
  clearTimeout(window.__todT);if(forced)window.__todT=setTimeout(()=>{forced=null;tick();},20000);
 });
})();
