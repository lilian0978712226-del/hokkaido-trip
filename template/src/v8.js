/* ===== v8：自己新增行程、點亮地圖、保險收合、記帳小改 ===== */
(function(){
 const $=s=>document.querySelector(s);
 const esc3=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const toMin=t=>{const [h,m]=String(t).split(':').map(Number);return (h||0)*60+(m||0);};
 const CK='hk-custom-stops-v1';
 const load=()=>{try{return JSON.parse(localStorage.getItem(CK)||'[]')}catch(e){return[]}};
 const save=a=>{try{localStorage.setItem(CK,JSON.stringify(a))}catch(e){}};
 let CS=load();
 const isDone=k=>safeGet(k);

 /* 合併後的每日行程（給「現在該去哪」用） */
 window.hkEvents=function(d){
  const rep=new Set(CS.filter(c=>c.d===d&&c.rep>=0).map(c=>c.rep));
  const a=days[d].events.filter((e,j)=>!rep.has(j)).map(e=>e);
  CS.filter(c=>c.d===d).forEach(c=>a.push([c.t,c.n,c.p||'自己加的行程',c.ic||'📍']));
  return a.sort((x,y)=>toMin(x[0])-toMin(y[0]));
 };

 /* ---------- 行程卡：顯示自己加的、被取代的 ---------- */
 function cardHTML(c){
  const k='cstop-'+c.id;
  return `<div class="event custom-ev" data-cid="${c.id}"><div class="time">${esc3(c.t)}</div><div><h4>${c.ic||'📍'} ${esc3(c.n)}</h4>${c.p?`<p>${esc3(c.p)}</p>`:''}<div class="tags" style="display:flex"><span class="tag mine">✏️ 自己加的</span>${c.rep>=0&&days[c.d].events[c.rep]?`<span class="tag mine-rep">取代：${esc3(days[c.d].events[c.rep][1])}</span>`:''}</div><div class="event-actions"><button type="button" class="smallbtn" data-cmap="${c.id}">📍 導航</button><label class="smallbtn"><input type="checkbox" data-ccheck="${k}" ${isDone(k)?'checked':''}> 完成</label><button type="button" class="smallbtn cs-del" data-cdel="${c.id}">刪除</button></div></div></div>`;
 }
 function decorate(i){
  const dc=$('#dayCard');if(!dc)return;
  dc.querySelectorAll('.custom-ev,.cs-addbar').forEach(x=>x.remove());
  const orig=[...dc.querySelectorAll('.event:not(.custom-ev)')];
  orig.forEach((ev,j)=>{
   ev.classList.remove('ev-replaced');const old=ev.querySelector('.rep-note');if(old)old.remove();
   const by=CS.find(c=>c.d===i&&c.rep===j);
   if(by){ev.classList.add('ev-replaced');const h=ev.querySelector('h4');if(h)h.insertAdjacentHTML('afterend',`<span class="rep-note">↪ 改去「${esc3(by.n)}」<button type="button" class="rep-undo" data-cundo="${by.id}">恢復</button></span>`);}
  });
  CS.filter(c=>c.d===i).sort((a,b)=>toMin(a.t)-toMin(b.t)).forEach(c=>{
   const k=orig.findIndex((ev,j)=>toMin(days[i].events[j][0])>toMin(c.t));
   const html=cardHTML(c);
   if(k===0)orig[0].insertAdjacentHTML('beforebegin',html);
   else{const ref=k<0?orig[orig.length-1]:orig[k-1];let after=ref;while(after.nextElementSibling&&after.nextElementSibling.classList.contains('custom-ev'))after=after.nextElementSibling;after.insertAdjacentHTML('afterend',html);}
  });
  const last=[...dc.querySelectorAll('.event')].pop();
  orderBtns();tagsToTime();
  if(last)last.insertAdjacentHTML('afterend',`<div class="cs-addbar"><button type="button" class="cs-add" data-cadd="${i}">＋ 新增行程・改去別家</button></div>`);
 }

 /* 按鈕順序：導航、複製、完成，備註在下一行 */
 function catOf(ev){
  const has=c=>ev.querySelector('.tags .tag.'+c),ic=(ev.querySelector('h4')||{}).textContent||'';
  if(ev.classList.contains('custom-ev')){if(/🍜|🍣|🍰|☕/.test(ic))return['food','美食'];if(/🛍️/.test(ic))return['shop','逛街'];return['spot','景點'];}
  if(has('food'))return['food','美食'];if(has('stay'))return['stay','住宿'];if(/🅿️/.test(ic))return['park','停車'];if(has('move'))return['move','交通'];
  if(/🧥|🐰|🐶|🛍️|🍞/.test(ic))return['shop','逛街'];return['spot','景點'];
 }
 function tagsToTime(){document.querySelectorAll('#dayCard .event').forEach(ev=>{const t=ev.querySelector(':scope > .time, :scope > .time-col > .time');if(!t)return;let col=t.parentNode.classList.contains('time-col')?t.parentNode:null;if(!col){col=document.createElement('div');col.className='time-col';ev.insertBefore(col,t);col.appendChild(t);}
  col.querySelectorAll('.cat,.tag').forEach(x=>{if(x.classList.contains('tag')&&!x.classList.contains('cat'))ev.querySelector('.tags')&&ev.querySelector('.tags').appendChild(x);else x.remove();});
  const [k,l]=catOf(ev);col.insertAdjacentHTML('beforeend',`<span class="cat cat-${k}">${l}</span>`);
  t.classList.toggle('must',!!ev.querySelector('.tags .tag.must'));});}
 function orderBtns(){document.querySelectorAll('#dayCard .event-actions').forEach(ac=>{if(ac.dataset.ord)return;const nav=ac.querySelector('[data-map-place],[data-cmap]'),cp=ac.querySelector('[data-copy-place]'),dn=ac.querySelector('label'),dl=ac.querySelector('[data-cdel]'),nt=ac.querySelector('[data-note-title]');[nav,cp,dn,dl].forEach(x=>x&&ac.appendChild(x));if(nt){nt.classList.add('note-row');ac.appendChild(nt);}ac.dataset.ord=1;});}
 /* ---------- 新增表單 ---------- */
 const sh=document.createElement('div');sh.className='cs-sheet';sh.hidden=true;
 sh.innerHTML=`<div class="cs-panel" role="dialog" aria-modal="true" aria-labelledby="csTitle"><h3 id="csTitle">✏️ 新增行程</h3>
  <label>哪一天<select id="csDay">${days.map((d,i)=>`<option value="${i}">D${i+1}・${d.date.slice(5).replace('-','/')} ${esc3(d.label.split('・')[0])}</option>`).join('')}</select></label>
  <label>幾點<input id="csTime" type="time" value="12:00"></label>
  <label>去哪裡（店名或地點）<input id="csName" placeholder="例：二条市場 大磯" enterkeyhint="done"></label>
  <div class="cs-icons" id="csIcons">${['📍','🍜','🍣','🍰','☕','🛍️','📸','♨️'].map((x,k)=>`<button type="button" data-ic="${x}" class="${k?'':'on'}">${x}</button>`).join('')}</div>
  <label>備註（選填）<input id="csNote" placeholder="例：排隊很久就換這家"></label>
  <label>要取代原本哪一站？<select id="csRep"></select></label>
  <div class="cs-btns"><button type="button" class="cs-cancel">取消</button><button type="button" class="cs-save">加進行程</button></div></div>`;
 document.body.appendChild(sh);
 let ic='📍';
 const fillRep=()=>{const d=+$('#csDay').value;$('#csRep').innerHTML=`<option value="-1">不取代，另外加一站</option>`+days[d].events.map((e,j)=>`<option value="${j}">${e[0]} ${esc3(e[1])}</option>`).join('');};
 $('#csDay').addEventListener('change',fillRep);
 $('#csIcons').addEventListener('click',e=>{const b=e.target.closest('[data-ic]');if(!b)return;ic=b.dataset.ic;$('#csIcons').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));});
 $('#csRep').addEventListener('change',()=>{const d=+$('#csDay').value,j=+$('#csRep').value;if(j>=0&&!$('#csName').value)$('#csTime').value=days[d].events[j][0];else if(j>=0)$('#csTime').value=days[d].events[j][0];});
 function openSheet(d){$('#csDay').value=d;fillRep();$('#csName').value='';$('#csNote').value='';const ev=days[d].events;$('#csTime').value=ev.length?ev[Math.floor(ev.length/2)][0]:'12:00';sh.hidden=false;document.body.classList.add('cs-open');setTimeout(()=>$('#csName').focus(),60);}
 function closeSheet(){sh.hidden=true;document.body.classList.remove('cs-open');}
 sh.addEventListener('click',e=>{if(e.target===sh||e.target.closest('.cs-cancel'))closeSheet();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!sh.hidden)closeSheet();});
 sh.querySelector('.cs-save').addEventListener('click',()=>{
  const n=$('#csName').value.trim();if(!n){$('#csName').focus();toast('請填地點名稱');return;}
  const d=+$('#csDay').value,rep=+$('#csRep').value;
  CS=CS.filter(c=>!(rep>=0&&c.d===d&&c.rep===rep));
  CS.push({id:Date.now().toString(36),d,t:$('#csTime').value||'12:00',n,p:$('#csNote').value.trim(),ic,rep});
  save(CS);closeSheet();refresh(d);toast(rep>=0?'已換成新的一站 ✨':'已加進行程 ✨');
 });
 window.hkCS={get:()=>CS,set:a=>{CS=a;save(CS);}};
 function refresh(d){showDay(typeof d==='number'?d:current);renderMap();if(window.hkRenderNext)window.hkRenderNext();}
 document.addEventListener('click',e=>{
  const t=e.target.closest&&e.target.closest('[data-cadd],[data-cmap],[data-cdel],[data-cundo]');if(!t)return;
  if(t.dataset.cadd!=null)openSheet(+t.dataset.cadd);
  else if(t.dataset.cmap){const c=CS.find(x=>x.id===t.dataset.cmap);if(c)maps(c.n,c.d);}
  else if(t.dataset.cundo){CS=CS.filter(x=>x.id!==t.dataset.cundo);save(CS);refresh();toast('已恢復原本行程');}
  else if(t.dataset.cdel){if(!t.classList.contains('sure')){t.classList.add('sure');t.textContent='確定刪除？';setTimeout(()=>{if(t.isConnected){t.classList.remove('sure');t.textContent='刪除';}},2600);return;}CS=CS.filter(x=>x.id!==t.dataset.cdel);save(CS);refresh();toast('已刪除');}
 });
 document.addEventListener('change',e=>{
  const c=e.target.closest&&e.target.closest('[data-ccheck]');if(c){safeSet(c.dataset.ccheck,c.checked?'1':'0');renderMap(true);return;}
  if(e.target.matches&&e.target.matches('#dayCard input[data-check]'))setTimeout(()=>renderMap(true),30);
 });

 /* ---------- 點亮北海道 ---------- */
 const C={asahikawa:[282,64],biei:[262,130],shirogane:[322,152],furano:[282,200],sapporo:[150,172],otaru:[64,148],takino:[208,234],shikotsu:[138,272],chitose:[236,300],toya:[60,292],noboribetsu:[114,344],shiraoi:[184,350]};
 const ICON={asahikawa:'i-penguin',biei:'i-tree',furano:'i-house',sapporo:'i-clock',otaru:'i-lamp',chitose:'i-plane',toya:'s-gondola',noboribetsu:'i-onsen',shiraoi:'s-cow'};
 const CUSTOM_IC={
  takino:'<g transform="translate(-9 -10)"><circle cx="9" cy="14" r="6" fill="#fff" stroke="#5B4B43" stroke-width="1.4"/><circle cx="9" cy="5.5" r="4.2" fill="#fff" stroke="#5B4B43" stroke-width="1.4"/><circle cx="7.6" cy="5" r=".7" fill="#5B4B43"/><circle cx="10.4" cy="5" r=".7" fill="#5B4B43"/><path d="M8.6 6.6h1.6l-.8 1z" fill="#E8977A"/><path d="M5.2 8.8h7.6" stroke="#E8977A" stroke-width="1.6" stroke-linecap="round"/></g>',
  shirogane:'<g><path d="M0 -9C4 -3 7 0 7 3.5A7 7 0 0 1 -7 3.5C-7 0 -4 -3 0 -9Z" fill="#9FD3E8" stroke="#5B4B43" stroke-width="1.4"/><path d="M-3 2a3.5 3.5 0 0 0 3 3.5" stroke="#fff" stroke-width="1.3" fill="none" stroke-linecap="round"/></g>',
  shikotsu:'<g stroke="#5B4B43" stroke-width="1.3" stroke-linejoin="round"><path d="M-6 6L-3 -6 1 -1 4 -8 7 6Z" fill="#D7ECF8"/><path d="M-3 -6L-1 2M4 -8L3 3" stroke="#fff" stroke-width="1"/></g>'
 };
 const NAME={asahikawa:'旭川',biei:'美瑛',shirogane:'白金青池',furano:'富良野',sapporo:'札幌',otaru:'小樽',takino:'滝野',shikotsu:'支笏湖',chitose:'千歲',toya:'洞爺湖',noboribetsu:'登別',shiraoi:'白老'};
 const ROADS=[['chitose','takino'],['takino','sapporo'],['sapporo','otaru'],['sapporo','biei'],['biei','asahikawa'],['biei','shirogane'],['shirogane','furano'],['furano','biei'],['sapporo','toya'],['toya','noboribetsu'],['noboribetsu','shiraoi'],['shiraoi','chitose'],['chitose','shikotsu'],['shikotsu','sapporo']];
 function city(n,i){
  if(/台中/.test(n))return null;
  if(/新千歲|Nippon|KOKO|山線/.test(n))return'chitose';if(/支笏/.test(n))return'shikotsu';if(/滝野/.test(n))return'takino';
  if(i===2)return /Hotel|Shinobure/.test(n)?'sapporo':'otaru';
  if(i===4){if(/美瑛/.test(n))return'biei';if(/白鬚|青池/.test(n))return'shirogane';if(/麵包超人|森林精靈/.test(n))return'furano';return'asahikawa';}
  if(i===5)return'asahikawa';
  if(i===6){if(/Amanek/.test(n))return'asahikawa';if(/白老/.test(n))return'shiraoi';if(/瀧本/.test(n))return'noboribetsu';return'toya';}
  if(i===7)return /瀧本|地獄|海膽/.test(n)?'noboribetsu':'chitose';
  if(i===8)return'chitose';
  return'sapporo';
 }
 const DEF=['sapporo','sapporo','otaru','sapporo','biei','asahikawa','toya','noboribetsu','chitose'];
 function stops(){
  const map=new Map(),out=[];
  days.forEach((d,i)=>{const rep=new Set(CS.filter(c=>c.d===i&&c.rep>=0).map(c=>c.rep));
   d.events.forEach((e,j)=>{if(rep.has(j)||(window.hkRemoved&&window.hkRemoved(i,j)))return;const c=city(e[1],i);if(!c)return;const key=e[1];
    let s=map.get(key);if(!s){s={n:e[1],c,keys:[],o:i*10000+toMin(e[0])};map.set(key,s);out.push(s);}s.keys.push(`event-${i}-${j}`);});
   CS.filter(c=>c.d===i).forEach(c=>{const ct=city(c.n,i);out.push({n:c.n,c:(ct&&ct!=='sapporo')?ct:(DEF[i]||DEF[0]),keys:['cstop-'+c.id],o:i*10000+toMin(c.t),mine:1});});
  });
  out.forEach(s=>s.done=s.keys.some(isDone));
  const groups={};out.slice().sort((a,b)=>a.o-b.o).forEach(s=>(groups[s.c]=groups[s.c]||[]).push(s));
  Object.entries(groups).forEach(([c,arr])=>{
   if(!C[c]){arr.forEach(s=>{s.x=-99;s.y=-99;});return;}
   const [cx,cy]=C[c];const n=arr.length;
   const rings=n<=6?[[21,n]]:n<=12?[[25,n]]:[[25,Math.min(13,Math.ceil(n*0.55))],[35,0]];
   if(rings.length>1)rings[1][1]=n-rings[0][1];
   let k=0;rings.forEach(([r,m],ri)=>{const A0=Math.PI*(m<=2?1.2:0.72),SW=Math.PI*(m<=2?0.6:1.56);for(let q=0;q<m;q++,k++){const a=m===1?-Math.PI/2:A0+(q+.5)*SW/m;arr[k].x=cx+Math.cos(a)*r;arr[k].y=cy+Math.sin(a)*r;}});
  });
  return {S:out,G:groups};
 }
 /* 柔和海岸線（Catmull-Rom 轉平滑曲線） */
 const smooth=(pts,close)=>{const P=close?[pts[pts.length-1],...pts,pts[0],pts[1]]:[pts[0],...pts,pts[pts.length-1]];let d=`M${pts[0][0]} ${pts[0][1]}`;for(let i=1;i<P.length-2;i++){const [p0,p1,p2,p3]=[P[i-1],P[i],P[i+1],P[i+2]];d+=` C${(p1[0]+(p2[0]-p0[0])/6).toFixed(1)} ${(p1[1]+(p2[1]-p0[1])/6).toFixed(1)} ${(p2[0]-(p3[0]-p1[0])/6).toFixed(1)} ${(p2[1]-(p3[1]-p1[1])/6).toFixed(1)} ${p2[0]} ${p2[1]}`;}return d+(close?'Z':'');};
 const LANDPTS=[[222,-30],[380,-30],[380,300],[330,318],[288,334],[248,352],[214,384],[170,392],[120,388],[90,398],[72,420],[50,392],[28,360],[-30,330],[-30,110],[22,104],[66,100],[104,112],[136,124],[176,116],[198,92],[210,46]];
 const LAND=smooth(LANDPTS,true);
 const HK=[[141.94,45.52],[142.6,44.95],[143.3,44.45],[144.27,44.02],[144.9,44.0],[145.33,44.35],[145.15,43.75],[145.58,43.33],[144.85,43.03],[144.07,42.95],[143.33,42.28],[143.25,41.92],[142.37,42.33],[141.6,42.63],[141.0,42.32],[140.7,42.58],[140.38,42.52],[140.82,42.03],[140.73,41.77],[140.1,41.43],[139.85,42.45],[140.5,42.98],[140.4,43.38],[141.0,43.2],[141.38,43.4],[141.65,43.95],[141.75,44.88],[141.65,45.4]];
 const mini=(x0,y0,w)=>{const s=w/((145.85-139.8)*0.731);const pts=HK.map(([lo,la])=>[+(x0+(lo-139.8)*0.731*s).toFixed(1),+(y0+(45.6-la)*s).toFixed(1)]);const bx=x0+(140.6-139.8)*0.731*s,by=y0+(45.6-43.95)*s,bw=(142.9-140.6)*0.731*s,bh=(43.95-42.3)*s;return `<g><path d="${smooth(pts,true)}" fill="#FFFBF3" stroke="#B9A797" stroke-width=".9"/><rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="2" fill="#F6C7A9" fill-opacity=".45" stroke="#E8977A" stroke-width="1"/></g>`;};
 const STAR='M0 -4.2 L1.25 -1.35 L4.1 -1.25 L1.9 0.65 L2.6 3.5 L0 1.85 L-2.6 3.5 L-1.9 0.65 L-4.1 -1.25 L-1.25 -1.35Z';
 const wave=(x,y)=>`<path d="M${x} ${y}q3 -3 6 0t6 0" fill="none" stroke="#B9D4EA" stroke-width="1.3" stroke-linecap="round"/>`;
 const MT=(x,y,k)=>`<g transform="translate(${x} ${y}) scale(${k})"><path d="M-22 0C-15 -6 -9 -17 -3 -24C-1 -26.5 1 -26.5 3 -24C9 -17 15 -6 22 0Z" fill="#DCE7F0"/><path d="M0 -25.5C1 -25.5 2 -25 3 -24C9 -17 15 -6 22 0H4C6 -9 3 -18 0 -25.5Z" fill="#C6D6E4"/><path d="M-9.5 -15C-6 -19 -4 -22 -3 -24C-1 -26.5 1 -26.5 3 -24C5 -21.5 7 -18.5 9.5 -15C7 -13 5.5 -15.5 3.5 -13.5C1.5 -11.5 0 -15 -2 -13C-4 -11 -6 -14.5 -9.5 -15Z" fill="#fff"/><path d="M-22 0C-15 -6 -9 -17 -3 -24C-1 -26.5 1 -26.5 3 -24C9 -17 15 -6 22 0" fill="none" stroke="#A9BBCB" stroke-width=".9" stroke-linejoin="round"/></g>`;
 const TREE=(x,y,k)=>`<g transform="translate(${x} ${y}) scale(${k})"><rect x="-1" y="-1" width="2" height="4" rx=".6" fill="#C9AE97"/><path d="M0 -15C2 -12 4.5 -9.5 6 -8.5C4.5 -8 3.5 -8 3 -8C5 -5.5 7 -3 8.5 -1.5C5 -.8 -5 -.8 -8.5 -1.5C-7 -3 -5 -5.5 -3 -8C-3.5 -8 -4.5 -8 -6 -8.5C-4.5 -9.5 -2 -12 0 -15Z" fill="#B5D2AE"/><path d="M0 -15C1.2 -13.2 2.4 -11.8 3.6 -10.7C2 -10 1 -11 0 -10.2C-1 -11 -2 -10 -3.6 -10.7C-2.4 -11.8 -1.2 -13.2 0 -15ZM-3 -8C-1.5 -7.2 0 -8 0 -8C0 -8 1.5 -7.2 3 -8L4 -6.6C2 -6 1 -6.8 0 -6.2C-1 -6.8 -2 -6 -4 -6.6Z" fill="#fff"/></g>`;
 function svg(R,exp){
  const {S,G}=R,done=S.filter(s=>s.done);
  const lit=c=>(G[c]||[]).some(s=>s.done),full=c=>(G[c]||[]).length&&(G[c]||[]).every(s=>s.done);
  const syms=exp?[...new Set(Object.values(ICON))].map(id=>{const el=document.getElementById(id);return el?el.outerHTML:'';}).join(''):'';
  const roads=ROADS.map(([a,b])=>{const [x1,y1]=C[a],[x2,y2]=C[b],mx=(x1+x2)/2+(y2-y1)*.12,my=(y1+y2)/2-(x2-x1)*.12,on=lit(a)&&lit(b);return `<path d="M${x1} ${y1}Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2} ${y2}" fill="none" stroke="${on?'#F6C3AA':'#EFE6DB'}" stroke-width="3.6" stroke-linecap="round"/><path d="M${x1} ${y1}Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2} ${y2}" fill="none" stroke="#fff" stroke-width=".9" stroke-dasharray="2.5 3.5" stroke-linecap="round"/>`;}).join('');
  const badges=Object.keys(C).filter(c=>G[c]).map(c=>{const [x,y]=C[c],f=full(c),l=lit(c);
   const ic=ICON[c]?`<use href="#${ICON[c]}" xlink:href="#${ICON[c]}" x="${x-11}" y="${y-11}" width="22" height="22"/>`:`<g transform="translate(${x} ${y})">${CUSTOM_IC[c]}</g>`;
   return `<g class="fp-badge${f?' full':''}">${f?`<circle cx="${x}" cy="${y}" r="19" fill="url(#fpGlow)"/>`:''}<circle cx="${x}" cy="${y}" r="14.5" fill="${f?'#FFF1C9':l?'#FFF6EE':'#fff'}" stroke="${l?'#D99A7C':'#B9A797'}" stroke-width="1.5"/>${ic}${f?`<path transform="translate(${x+11} ${y-11}) scale(.8)" d="${STAR}" fill="#FFC94D" stroke="#E0904A" stroke-width=".7"/>`:''}${(()=>{const nm=NAME[c],w=nm.length*7.6+10;return `<g class="fp-name"><rect x="${(x-w/2).toFixed(1)}" y="${y+12}" width="${w.toFixed(1)}" height="12" rx="6" fill="${f?'#FFE3A3':'#fff'}" stroke="#C7B6A6" stroke-width=".9"/><text x="${x}" y="${y+21}" text-anchor="middle" font-size="7.4" font-weight="700" fill="#7A675C">${nm}</text></g>`;})()}</g>`;}).join('');
  const stars=S.map((s,k)=>s.done
   ?`<g class="fp-lit" data-fpn="${esc3(s.n)}" style="animation-delay:${(k%9*.2).toFixed(1)}s"><circle cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="6.5" fill="url(#fpGlow)"/><path transform="translate(${s.x.toFixed(1)} ${s.y.toFixed(1)})" d="${STAR}" fill="${s.mine?'#F6AFC4':'#FFC94D'}" stroke="${s.mine?'#C76F8C':'#D98A45'}" stroke-width=".8" stroke-linejoin="round"/></g>`
   :`<path class="fp-dot" data-fpn="${esc3(s.n)}" transform="translate(${s.x.toFixed(1)} ${s.y.toFixed(1)}) scale(.85)" d="${STAR}" fill="#fff" stroke="${s.mine?'#E3A7BA':'#D3C5B8'}" stroke-width="1" stroke-linejoin="round"/>`).join('');
  const pct=S.length?Math.round(done.length/S.length*100):0;
  const H=exp?580:400,Y0=exp?-82:0;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${exp?-16:0} ${Y0} ${exp?392:360} ${H}" ${exp?'width="1080" height="1598"':''} font-family="'Huninn','jf open 粉圓','PingFang TC','Noto Sans TC',sans-serif">
  <defs>${syms}<radialGradient id="fpGlow"><stop offset="0" stop-color="#FFF4C2"/><stop offset=".5" stop-color="#FFDB8E" stop-opacity=".7"/><stop offset="1" stop-color="#FFC27A" stop-opacity="0"/></radialGradient>
  <linearGradient id="fpSea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D6E8F6"/><stop offset="1" stop-color="#E9F2FA"/></linearGradient>
  <radialGradient id="fpLand" cx=".55" cy=".45" r=".75"><stop offset="0" stop-color="#FFFDF8"/><stop offset="1" stop-color="#FBF4E8"/></radialGradient><clipPath id="fpClip"><rect x="0" y="0" width="360" height="400" rx="22"/></clipPath></defs>
  ${exp?`<rect x="-16" y="${Y0}" width="392" height="${H}" fill="#FFF8EF"/><text x="180" y="-46" text-anchor="middle" font-size="22" font-weight="700" fill="#5B4B43">北海道大暴吃 ✦ 點亮地圖</text><text x="180" y="-22" text-anchor="middle" font-size="11" fill="#9A8A7E" letter-spacing="2">2027.02.10 – 02.18 ・ 冬天的北海道</text>`:''}
  <g clip-path="url(#fpClip)">
   <rect x="0" y="0" width="360" height="400" fill="url(#fpSea)"/>
   ${[[22,40],[70,62],[120,36],[160,72],[30,250],[20,390],[300,380],[250,392],[340,345],[120,20]].map(([x,y])=>wave(x,y)).join('')}
   ${[[48,22],[96,80],[150,50],[10,300],[280,365]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.6" fill="#fff"/>`).join('')}
   <path d="${LAND}" fill="none" stroke="#F4F9FD" stroke-width="9" stroke-linejoin="round" opacity=".9"/><path d="${LAND}" fill="none" stroke="#C9DEEE" stroke-width="4" stroke-linejoin="round" opacity=".8"/><path d="${LAND}" fill="url(#fpLand)" stroke="#C7B6A6" stroke-width="1.3" stroke-linejoin="round"/>
   <path d="${LAND}" fill="none" stroke="#F3E6D6" stroke-width="7" stroke-linejoin="round" clip-path="url(#fpClip)" opacity=".0"/>
   <g opacity=".75"><ellipse cx="92" cy="232" rx="36" ry="15" fill="#E8F1E0"/><ellipse cx="238" cy="172" rx="42" ry="17" fill="#E8F1E0"/><ellipse cx="318" cy="254" rx="38" ry="19" fill="#E8F1E0"/><ellipse cx="196" cy="40" rx="32" ry="13" fill="#E8F1E0"/><ellipse cx="250" cy="250" rx="26" ry="10" fill="#F3EEE4"/></g>
   ${MT(102,238,1.05)}${MT(326,110,1.15)}${MT(346,116,.8)}${MT(306,118,.75)}${MT(332,236,.7)}
   ${TREE(228,262,1)}${TREE(238,266,.8)}${TREE(40,200,.9)}${TREE(50,204,.7)}${TREE(326,228,.8)}${TREE(196,120,.8)}${TREE(206,124,.65)}${TREE(262,232,.75)}${TREE(90,330,.75)}${TREE(150,312,.7)}${[[220,200],[300,280],[70,250],[180,290],[250,60],[120,212]].map(([x,y])=>`<path transform="translate(${x} ${y})" d="M0 -2.2V2.2M-2.2 0H2.2M-1.5 -1.5L1.5 1.5M1.5 -1.5L-1.5 1.5" stroke="#D6E3EE" stroke-width=".7" stroke-linecap="round"/>`).join('')}
   
   <defs><linearGradient id="fpLake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFDDF2"/><stop offset="1" stop-color="#9CC8E8"/></linearGradient></defs>
   <g class="fp-lake"><path d="M30 286C26 270 40 258 56 260C70 262 84 270 84 286C84 302 72 314 56 314C40 314 33 302 30 286Z" fill="url(#fpLake)" stroke="#A9CBE6" stroke-width="1"/><path d="M38 280C42 270 52 266 60 267" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".8"/><ellipse cx="58" cy="288" rx="7" ry="5.5" fill="#CFE5C6" stroke="#7FAFD3" stroke-width="1"/><path d="M55 287l2.5-4 2.5 4z" fill="#9CC59A"/><path d="M40 300q3-2 6 0t6 0M64 304q3-2 6 0t6 0" fill="none" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity=".9"/></g>
   <g class="fp-lake"><path d="M114 266C118 254 136 252 146 258C158 265 160 280 152 290C143 300 124 298 116 290C110 283 111 274 114 266Z" fill="url(#fpLake)" stroke="#A9CBE6" stroke-width="1"/><path d="M121 264C126 258 134 257 140 259" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".8"/><path d="M122 286q3-2 6 0t6 0M138 280q3-2 6 0t6 0" fill="none" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity=".9"/></g>
   ${roads}
   ${badges}
   ${stars}
   <g transform="translate(300 342)"><rect x="-8" y="-8" width="62" height="56" rx="12" fill="#fff" fill-opacity=".8" stroke="#C7B6A6" stroke-width="1"/>${mini(-2,-3,50)}</g>
   <g transform="translate(18 384)" stroke="#B9A797" stroke-width="1"><circle r="11" fill="#fff"/><path d="M0 -8L2.6 0 0 8 -2.6 0Z" fill="#F3B497"/><path d="M0 -8L2.6 0H-2.6Z" fill="#E8977A"/><circle r="1.3" fill="#5B4B43" stroke="none"/></g>
  </g>
  <rect x="1" y="1" width="358" height="398" rx="21" fill="none" stroke="#A8968A" stroke-width="1.6"/>
  ${exp?`<g transform="translate(180 452)"><rect x="-130" y="-24" width="260" height="48" rx="24" fill="#fff" stroke="#5B4B43" stroke-width="2"/><path transform="translate(-100 0) scale(1.7)" d="${STAR}" fill="#FFC94D" stroke="#D98A45" stroke-width=".8"/><text x="-80" y="7" font-size="18" font-weight="700" fill="#5B4B43">點亮 ${done.length} / ${S.length} 個地方</text><text x="112" y="7" text-anchor="end" font-size="16" font-weight="700" fill="#E8977A">${pct}%</text></g>`:''}
  </svg>`;
 }
 const fp=document.createElement('section');fp.className='section';fp.id='footprints';
 fp.innerHTML=`<h2><svg class="h-ic" aria-hidden="true" viewBox="0 0 64 64"><use href="#i-compass"></use></svg>點亮北海道</h2><div class="card fp-card"><div class="fp-top"><b id="fpNum">0</b><span id="fpOf">/ 0</span><em id="fpPct">0%</em></div><div class="fp-bar"><i id="fpBar"></i></div><div class="fp-map" id="fpMap"></div><p class="fp-hint">按「完成」小星星就會亮起來 ✦ 點星星看是哪裡</p><div class="fp-acts"><button type="button" class="fp-btn" id="fpAdd">＋ 新增行程</button><button type="button" class="fp-btn pri" id="fpSave">📸 存圖分享</button></div></div>`;
 const anchor=$('#food-book')||$('#stay');if(anchor)anchor.insertAdjacentElement('beforebegin',fp);
 const topn=$('.top-nav');if(topn){const a=topn.querySelector('a[href="#food-book"]');if(a&&!topn.querySelector('a[href="#footprints"]')){const x=document.createElement('a');x.href='#footprints';x.textContent='地圖';a.insertAdjacentElement('beforebegin',x);}}
 let lastDone=-1;
 function renderMap(bump){
  const R=stops(),S=R.S,n=S.filter(s=>s.done).length,p=S.length?Math.round(n/S.length*100):0;
  $('#fpMap').innerHTML=svg(R,false);$('#fpNum').textContent=n;$('#fpOf').textContent='/ '+S.length+' 個地方';$('#fpPct').textContent=p+'%';$('#fpBar').style.width=p+'%';
  if(bump&&n>lastDone&&lastDone>=0){const c=$('.fp-card');c.classList.remove('pop');void c.offsetWidth;c.classList.add('pop');}
  lastDone=n;
 }
 $('#fpMap').addEventListener('click',e=>{const g=e.target.closest('[data-fpn]');if(g)toast((g.classList.contains('fp-lit')?'✨ ':'○ ')+g.dataset.fpn);});
 $('#fpAdd').addEventListener('click',()=>openSheet(typeof current==='number'?current:0));
 $('#fpSave').addEventListener('click',async()=>{
  try{const blob=new Blob([svg(stops(),true)],{type:'image/svg+xml'});const url=URL.createObjectURL(blob);
   const img=new Image();img.src=url;await img.decode();const cv=document.createElement('canvas');cv.width=1080;cv.height=1598;cv.getContext('2d').drawImage(img,0,0,1080,1598);URL.revokeObjectURL(url);
   const png=await new Promise(r=>cv.toBlob(r,'image/png'));const file=new File([png],'hokkaido-map.png',{type:'image/png'});
   if(navigator.canShare&&navigator.canShare({files:[file]}))await navigator.share({files:[file],title:'點亮北海道'});
   else{const a=document.createElement('a');a.href=URL.createObjectURL(png);a.download=file.name;a.click();}
  }catch(e){if(!e||e.name!=='AbortError')toast('這支手機無法直接存圖，請用截圖分享');}
 });

 /* ---------- 緊急電話收合 ---------- */
 const eg=$('#emergency .em-grid');
 if(eg&&!eg.closest('details')){const n=eg.querySelectorAll('.em-card').length;const d=document.createElement('details');d.className='fold em-fold2';d.innerHTML=`<summary><span>📞 緊急電話（${n} 支，點了可以直接撥）</span><i>展開</i></summary>`;eg.parentNode.insertBefore(d,eg);d.appendChild(eg);}
 /* ---------- 保險收合 ---------- */
 const em=$('.em-mine');
 if(em&&!em.closest('details')){const h=em.querySelector('h3');const d=document.createElement('details');d.className='fold em-fold';d.innerHTML=`<summary><span>🛡️ 我們的保險與重要資料</span><i>展開</i></summary>`;em.parentNode.insertBefore(d,em);d.appendChild(em);if(h)h.remove();}

 /* ---------- 掛上 showDay ---------- */
 if(typeof showDay==='function'){const p=showDay;window.showDay=showDay=function(i){const r=p.apply(this,arguments);try{decorate(i)}catch(e){console.warn(e)}return r;};}
 try{decorate(current)}catch(e){}
 renderMap();if(window.hkRenderNext)window.hkRenderNext();window.hkRenderMap=renderMap;

 /* ---------- 翻頁倒數 ---------- */
 (function(){
  const RMv=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  ['countDays','countHours','countMinutes','countSeconds'].forEach(id=>{
   const b=document.getElementById(id);if(!b||b.dataset.flip)return;b.dataset.flip=1;
   const box=b.parentNode,cs=getComputedStyle(b),bg=getComputedStyle(box).backgroundColor;
   const fl=document.createElement('div');fl.className='flip';fl.setAttribute('aria-hidden','true');
   fl.style.fontSize=(parseFloat(cs.fontSize)*0.92)+'px';fl.style.setProperty('--fbg',bg&&bg!=='rgba(0, 0, 0, 0)'?bg:'#fff');
   const half=(c,v)=>`<span class="fl-h ${c}"><i>${v}</i></span>`;
   let cur=b.textContent.trim();
   fl.innerHTML=half('fl-top',cur)+half('fl-bot',cur);
   b.classList.add('flip-src');box.insertBefore(fl,b);const setW=()=>fl.style.setProperty('--fw',fl.offsetWidth*0.98+'px');setW();addEventListener('resize',setW);
   new MutationObserver(()=>{
    const nv=b.textContent.trim();if(nv===cur)return;const old=cur;cur=nv;
    const top=fl.querySelector('.fl-top i'),bot=fl.querySelector('.fl-bot i');
    if(RMv||document.hidden){top.textContent=nv;bot.textContent=nv;return;}
    fl.querySelectorAll('.fl-flap').forEach(x=>x.remove());
    top.textContent=nv;
    fl.insertAdjacentHTML('beforeend',half('fl-top fl-flap fl-f1',old)+half('fl-bot fl-flap fl-f2',nv));
    setTimeout(()=>{bot.textContent=nv;fl.querySelectorAll('.fl-flap').forEach(x=>x.remove());},560);
   }).observe(b,{childList:true,characterData:true,subtree:true});
  });
 })();
})();
