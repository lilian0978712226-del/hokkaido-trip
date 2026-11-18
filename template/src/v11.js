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
   <p class="bk-note">備份包含記帳、打勾、行程調整、小日記和設定。換手機或怕資料不見時用。</p>
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
  <div class="yen-disp"><div class="yen-in" id="yenIn">0</div><div class="yen-out" id="yenOut">≈ NT$ 0</div></div>
  <div class="yen-pad">${['7','8','9','⌫','4','5','6','C','1','2','3','×1.1','0','00','000','記帳'].map(k=>`<button type="button" data-k="${k}" class="${k==='記帳'?'yk-go':isNaN(+k)&&k!=='00'&&k!=='000'?'yk-op':''}">${k==='×1.1'?'＋稅10%':k==='記帳'?'記進帳本':k}</button>`).join('')}</div></div>`;
 document.body.appendChild(cs);
 let val='0',toNT=true;
 const draw=()=>{const v=+val||0,r=rate();$('#yenIn').textContent=(toNT?'¥ ':'NT$ ')+v.toLocaleString();
  $('#yenOut').textContent=toNT?`≈ NT$ ${(v*r).toLocaleString(undefined,{maximumFractionDigits:0})}`:`≈ ¥ ${(v/r).toLocaleString(undefined,{maximumFractionDigits:0})}`;
  $('#yenRate').textContent=`匯率 1 日圓 ≈ ${r} 台幣（可在記帳設定改）`;$('#yenSwap').textContent=toNT?'¥ → NT$':'NT$ → ¥';};
 fab.addEventListener('click',()=>{cs.hidden=false;document.body.classList.add('cs-open');draw();});
 cs.addEventListener('click',e=>{
  if(e.target===cs){cs.hidden=true;document.body.classList.remove('cs-open');return;}
  if(e.target.closest('#yenSwap')){toNT=!toNT;val='0';draw();return;}
  const b=e.target.closest('[data-k]');if(!b)return;const k=b.dataset.k;
  if(k==='C')val='0';else if(k==='⌫')val=val.length>1?val.slice(0,-1):'0';
  else if(k==='×1.1')val=String(Math.round((+val||0)*1.1));
  else if(k==='記帳'){const amt=toNT?+val:Math.round((+val||0)/rate());if(!amt){toast('先輸入金額');return;}
   cs.hidden=true;document.body.classList.remove('cs-open');const a=$('#lgAmt');if(a){a.value=amt;a.dispatchEvent(new Event('input',{bubbles:true}));const sec=$('#ledger');if(sec)sec.scrollIntoView({block:'start'});setTimeout(()=>a.focus(),400);toast('金額填好了，選分類後按 ＋');}return;}
  else{val=(val==='0'?'':val)+k;if(val.length>9)val=val.slice(0,9);val=String(+val||0);}
  draw();
 });

 /* ---------- 4. 每日小日記 ---------- */
 const DK='hk-diary-v1';let DI={};try{DI=JSON.parse(localStorage.getItem(DK)||'{}')}catch(e){}
 const saveDI=()=>{try{localStorage.setItem(DK,JSON.stringify(DI))}catch(e){}};
 const MOODS=[['😋','好吃'],['🥰','幸福'],['🤩','好興奮'],['🥶','好冷'],['😴','好累']];
 function diary(i){
  const dc=$('#dayCard');if(!dc)return;const old=dc.querySelector('.dy-box');if(old)old.remove();
  const o=DI[i]||{};
  dc.insertAdjacentHTML('beforeend',`<div class="dy-box"><div class="dy-head"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="15" height="18" rx="2.6" fill="#FBE1EA" ${K}/><path d="M8 3v18" ${K}/><path d="M11 8h5M11 11.4h4" ${K}/></svg><b>D${i+1} 的小日記</b><small>${o.t||o.m?'已存好 ✓':'寫一句今天的心情'}</small></div>
   <div class="dy-moods">${MOODS.map(([e,l])=>`<button type="button" class="dy-m${o.m===e?' on':''}" data-mood="${e}" aria-label="${l}"><span>${e}</span><small>${l}</small></button>`).join('')}</div>
   <input class="dy-text" maxlength="60" placeholder="例：螃蟹好大隻，陳肥肥吃到不說話" value="${esc5(o.t||'')}" enterkeyhint="done"></div>`);
  const box=dc.querySelector('.dy-box');
  box.addEventListener('click',e=>{const b=e.target.closest('[data-mood]');if(!b)return;const m=b.dataset.mood;DI[i]=Object.assign({},DI[i],{m:DI[i]&&DI[i].m===m?'':m});saveDI();box.querySelectorAll('.dy-m').forEach(x=>x.classList.toggle('on',x.dataset.mood===DI[i].m));box.querySelector('.dy-head small').textContent='已存好 ✓';});
  let tm;box.querySelector('.dy-text').addEventListener('input',e=>{clearTimeout(tm);tm=setTimeout(()=>{DI[i]=Object.assign({},DI[i],{t:e.target.value.trim()});saveDI();box.querySelector('.dy-head small').textContent='已存好 ✓';},400);});
 }
 if(typeof showDay==='function'){const p=showDay;window.showDay=showDay=function(i){const r=p.apply(this,arguments);try{diary(i)}catch(e){console.warn(e)}return r;};}
 try{diary(current)}catch(e){}

 /* ---------- 5. 北海道回憶卡 ---------- */
 const acts=$('#footprints .fp-acts');
 if(acts){acts.insertAdjacentHTML('afterend',`<button type="button" class="fp-btn mem-btn" id="hkMemory"><span class="cute-ic-wrap lead"><svg class="cute-ic" viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="4" width="14" height="12" rx="2.4" fill="#E9DDF4" ${K}/><path d="M3 13.4 7.4 9.6l3 2.6 2.4-2 4.2 3.6" fill="none" ${K}/><circle cx="13" cy="7.6" r="1.4" fill="#F6D98B" ${K}/></svg></span>做成回憶卡</button>`);}
 document.addEventListener('click',async e=>{
  if(!(e.target.closest&&e.target.closest('#hkMemory')))return;
  const lit=(($('#fpNum')||{}).textContent||'0'),of=(($('#fpOf')||{}).textContent||'').replace(/[^\d]/g,'');
  let spent=0;try{const r=rate();JSON.parse(localStorage.getItem('hk-ledger-v1')||'[]').forEach(x=>{spent+=x.cur==='TWD'?(+x.amt||0)/r:(+x.amt||0);});}catch(err){}
  const rows=days.map((d,i)=>{const o=DI[i]||{};const t=(o.t||'').slice(0,26);return `<g transform="translate(0 ${190+i*74})"><rect x="40" y="0" width="640" height="62" rx="18" fill="${i%2?'#FFF7F0':'#F4F8FC'}" stroke="#E6DACE" stroke-width="2"/><text x="66" y="40" font-size="22" font-weight="700" fill="#E8977A">D${i+1}</text><text x="118" y="40" font-size="18" fill="#9A8A7E">${d.date.slice(5).replace('-','/')}</text><text x="200" y="42" font-size="30">${o.m||'·'}</text><text x="250" y="27" font-size="16" font-weight="700" fill="#5B4B43">${esc5(d.label.split('・')[0])}</text><text x="250" y="49" font-size="17" fill="#6B5A50">${esc5(t||'—')}</text></g>`;}).join('');
  const H=190+9*74+130;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1080" height="${Math.round(H*1.5)}" viewBox="0 0 720 ${H}" font-family="'Huninn','PingFang TC','Noto Sans TC',sans-serif">
   <defs>${['i-enaga'].map(id=>{const el=document.getElementById(id);return el?el.outerHTML:'';}).join('')}<linearGradient id="mbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDEFF3"/><stop offset=".5" stop-color="#FFF9F1"/><stop offset="1" stop-color="#EEF5FB"/></linearGradient></defs>
   <rect width="720" height="${H}" fill="url(#mbg)"/>
   ${Array.from({length:26},(_,k)=>`<circle cx="${(k*97)%720}" cy="${(k*53)%H}" r="${2+k%3}" fill="#fff" opacity=".9"/>`).join('')}
   <use href="#i-enaga" xlink:href="#i-enaga" x="570" y="26" width="110" height="110"/>
   <text x="44" y="70" font-size="40" font-weight="700" fill="#5B4B43">北海道大暴吃</text>
   <text x="46" y="104" font-size="18" fill="#9A8A7E" letter-spacing="3">2027.02.10 – 02.18 ・ 回憶卡</text>
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
