/* ===== v7：下一站、營業時間、光景倒數、北海道足跡 ===== */
(function(){
 const $=s=>document.querySelector(s);
 const RM=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const esc2=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const toMin=t=>{const [h,m]=String(t).split(':').map(Number);return h*60+(m||0);};
 const fmt=m=>{m=Math.round(m);const s=m<0?'-':'';m=Math.abs(m);const h=Math.floor(m/60),mm=m%60;return s+(h?h+' 小時 ':'')+mm+' 分';};
 const hhmm=m=>{m=Math.round(m);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');};
 const nowJP=()=>{const p=japanParts();return {key:`${p.year}-${p.month}-${p.day}`,min:+p.hour*60+ +p.minute};};
 const tripState=()=>{const k=nowJP().key;return k<'2027-02-10'?'before':k>'2027-02-18'?'after':'during';};
 const isToday=i=>tripState()==='during'&&todayDayIndex()===i;

 /* ---------- 營業時間（來源：官方／旅遊網站公開資訊，出發前請再確認） ---------- */
 const HOURS=[
  [/滝野/,'09:00','16:00','冬季 9:00–16:00'],
  [/小樽水族館/,'10:00','15:30','冬季 10:00–16:00，最後入館 15:30'],
  [/檍/,'11:00','15:00','依你的備註 11:00–15:00（分店時間不同，出發前再確認）'],
  [/藻岩山纜車/,'11:00','21:30','冬季 11:00–22:00，上山末班 21:30'],
  [/六花亭/,'10:00','18:00','約 10:00–18:00',2],
  [/北菓樓/,'09:00','18:00','冬季約 9:00–18:00'],
  [/遊船/,'10:00','18:30','依你的備註 10:00–18:30（每月班次不同，以官網為準）'],
  [/大倉山展望台/,'09:00','16:45','冬季約 9:00–17:00，最後入場 16:45'],
  [/白い恋人/,'10:00','16:30','10:00–18:00，有料區最後入館 16:30'],
  [/旭山動物園/,'10:30','15:00','冬季 10:30–15:30，最後入園 15:00'],
  [/有珠山纜車/,'09:00','16:00','冬季約 9:00–16:00'],
  [/大通雪祭/,'','22:00','雪祭 2/4–2/11，點燈到 22:00']
 ];
 const findH=(name,day)=>HOURS.find(h=>h[0].test(name)&&(h[4]==null||h[4]===day));

 /* ---------- 日落（NOAA 演算法） ---------- */
 const LOC=[[43.06,141.35,'札幌'],[43.06,141.35,'札幌'],[43.19,141.0,'小樽'],[43.06,141.35,'札幌'],[43.59,142.47,'美瑛'],[43.77,142.37,'旭川'],[42.56,140.82,'洞爺湖'],[42.77,141.40,'支笏湖'],[42.82,141.65,'千歲']];
 function sunset(lat,lon,y,mo,d){
  const rad=Math.PI/180,N=Math.floor(275*mo/9)-Math.floor((mo+9)/12)*(1+Math.floor((y-4*Math.floor(y/4)+2)/3))+d-30;
  const lngH=lon/15,t=N+((18-lngH)/24),M=0.9856*t-3.289;
  let L=(M+1.916*Math.sin(M*rad)+0.020*Math.sin(2*M*rad)+282.634+360)%360;
  let RA=(Math.atan(0.91764*Math.tan(L*rad))/rad+360)%360;RA=(RA+(Math.floor(L/90)*90-Math.floor(RA/90)*90))/15;
  const sinDec=0.39782*Math.sin(L*rad),cosDec=Math.cos(Math.asin(sinDec));
  const cosH=(Math.cos(90.833*rad)-sinDec*Math.sin(lat*rad))/(cosDec*Math.cos(lat*rad));
  const H=Math.acos(cosH)/rad/15,T=H+RA-0.06571*t-6.622;
  return (((T-lngH+9)%24+24)%24)*60;
 }
 const LIGHTS=[
  [{e:'❄️',n:'雪祭點燈到',t:'22:00'}],
  [{e:'🚠',n:'藻岩山纜車上山末班',t:'21:30'},{e:'❄️',n:'雪祭最後一天・點燈到',t:'22:00'}],
  [{e:'🕯️',n:'雪燈之路（2027 日期未公布）',t:'17:00'},{e:'🏮',n:'運河倉庫點燈到',t:'22:30'}],
  [],[],[],[],
  [{e:'✨',n:'冰濤祭點燈（到 20:00）',t:'16:30'}],
  []
 ];
 function lightRow(i){
  if(!LOC[i])return '';
  const [la,lo,place]=LOC[i];const ss=sunset(la,lo,2027,2,10+i);
  const items=[{e:'🌅',n:place+' 日落'+(i===2?'・運河煤氣燈同步亮起':''),m:ss}].concat((LIGHTS[i]||[]).map(x=>({e:x.e,n:x.n,m:toMin(x.t)})).sort((a,b)=>a.m-b.m));
  const today=isToday(i),now=nowJP().min;
  return `<div class="lt-list">${items.map(x=>{let cd='';if(today){const left=x.m-now;cd=left>0?`<em>剩 ${fmt(left)}</em>`:`<em class="past">已過</em>`;}return `<div class="lt-item"><span class="lt-e">${x.e}</span><span class="lt-n">${x.n}${cd}</span><b>${hhmm(x.m)}</b></div>`;}).join('')}</div>`;
 }

 /* ---------- 每天卡片：營業時間＋光景倒數 ---------- */
 function decorate(i){
  const dc=$('#dayCard');if(!dc)return;
  const th=dc.querySelector('.day-theme');if(th&&!th.querySelector('.lt-list')){th.classList.add('lt-mode');th.insertAdjacentHTML('beforeend',lightRow(i));}
  const today=isToday(i),now=nowJP().min;
  dc.querySelectorAll('.event:not(.custom-ev)').forEach((ev,j)=>{
   const e=days[i].events[j];if(!e)return;const h=findH(e[1],i);if(!h)return;
   const tags=ev.querySelector('.tags');if(!tags||tags.querySelector('.tag.hours'))return;
   const arr=toMin(e[0]),open=h[1]?toMin(h[1]):null,close=toMin(h[2]);
   let cls='',warn='';
   if(open!=null&&arr<open-15)warn=`・比開門早到 ${open-arr} 分`;
   if(arr>close-30)warn=`・抵達時已接近關門`;
   if(today){const left=close-now;if(left<0)cls='closed',warn='・今天已關門';else if(left<=60)cls='soon',warn=`・剩 ${left} 分鐘`;}
   if(warn&&!cls)cls='soon';
   tags.insertAdjacentHTML('beforeend',`<span class="tag hours ${cls}">🕒 ${h[3]}${warn}</span>`);
   tags.style.display='flex';
  });
 }

 /* ---------- 首頁：下一站 ---------- */
 const hero=$('.departure-countdown');
 const nx=document.createElement('div');nx.className='next-stop';nx.id='whereNow';
 if(hero)hero.insertAdjacentElement('afterend',nx);
 const EV=d=>window.hkEvents?window.hkEvents(d):days[d].events;
 function renderNext(){
  const st=tripState(),n=nowJP();let d,j,head,sub='';
  if(st==='before'){d=0;j=0;head='出發第一站';sub=`${days[0].date.slice(5).replace('-','/')} 出發後，這裡會自動顯示下一站`;}
  else if(st==='after'){nx.innerHTML=`<div class="ns-in"><span class="ns-ic">🏠</span><div><small>旅程結束</small><b>平安回家囉，北海道下次見！</b></div></div>`;return;}
  else{
   d=todayDayIndex();const ev=EV(d);
   j=ev.findIndex((e,k)=>{const t=toMin(e[0]),nt=ev[k+1]?toMin(ev[k+1][0]):t+60;return n.min<nt;});
   if(j<0){if(d<8){d=d+1;j=0;head='今天行程結束 🌙 明天第一站';}else{nx.innerHTML=`<div class="ns-in"><span class="ns-ic">✈️</span><div><small>最後一天</small><b>準備回台灣，一路平安！</b></div></div>`;return;}}
   else{const t=toMin(ev[j][0]);head=n.min>=t?'現在在':'下一站';sub=n.min>=t?`${ev[j][0]} 抵達・下一站 ${ev[j+1]?ev[j+1][0]+' '+ev[j+1][1]:'今天最後一站'}`:`${ev[j][0]} 抵達・還有 ${fmt(t-n.min)}`;}
  }
  const e=EV(d)[j];
  nx.innerHTML=`<div class="ns-in"><span class="ns-ic">${e[3]||'📍'}</span><div><small>${head}・D${d+1}</small><b>${esc2(e[1])}</b><span class="ns-sub">${sub||e[0]+' 抵達'}</span></div></div><div class="ns-btns"><button type="button" class="ns-go" data-nsmap="${esc2(e[1])}" data-nsday="${d}">📍 導航</button><button type="button" class="ns-see" data-nsday2="${d}">看行程</button></div>`;
 }
 nx.addEventListener('click',ev=>{
  const a=ev.target.closest('[data-nsmap]');if(a){maps(a.dataset.nsmap,+a.dataset.nsday);return;}
  const b=ev.target.closest('[data-nsday2]');if(b){showDay(+b.dataset.nsday2);const t=document.getElementById('itinerary');if(t)t.scrollIntoView({block:'start'});}
 });

 /* ---------- 掛上 showDay & 定時更新 ---------- */
 if(typeof showDay==='function'){const p=showDay;window.showDay=showDay=function(i){const r=p.apply(this,arguments);try{decorate(i)}catch(e){console.warn(e)}return r;};}
 try{decorate(current)}catch(e){}
 renderNext();window.hkRenderNext=renderNext;
 setInterval(()=>{renderNext();if(isToday(current)){const dc=$('#dayCard');dc.querySelectorAll('.tag.hours').forEach(t=>t.remove());const lr=dc.querySelector('.lt-list');if(lr)lr.remove();decorate(current);}},60000);

})();
