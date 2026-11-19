/* ===== v13：旅途小遊戲（御神籤、拍照任務扭蛋、雪景搖搖、存錢筒、今日全破＋地區章） ===== */
(function(){
 const $=s=>document.querySelector(s);
 const RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 const get=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v}catch(e){return d}};
 const put=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
 const toast=m=>{if(window.toast)window.toast(m)};
 const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const D=(typeof days!=='undefined'&&days)||[];
 const jpDate=()=>{const n=new Date(Date.now()+9*3600e3);return n.toISOString().slice(0,10);};
 const tripIdx=()=>{const t=jpDate();const i=D.findIndex(d=>d.date===t);if(i>=0)return i;if(D.length&&t<D[0].date)return -1;return D.length?99:-1;};
 const seeded=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return()=>{h^=h<<13;h^=h>>>17;h^=h<<5;return((h>>>0)%100000)/100000;};};
 const sym=id=>document.getElementById(id)?id:'i-maru';

 /* ---------- 共用：彈出視窗 ---------- */
 const sh=document.createElement('div');sh.className='cs-sheet g-sheet';sh.hidden=true;document.body.appendChild(sh);
 const open=html=>{sh.innerHTML=html;sh.hidden=false;document.body.classList.add('cs-open');};
 const close=()=>{sh.hidden=true;document.body.classList.remove('cs-open');sh.innerHTML='';};
 sh.addEventListener('click',e=>{if(e.target===sh||e.target.closest('.g-close'))close();});

 /* ---------- 共用：搖手機 ---------- */
 let motionOK=false;const shakeFns=new Set();let lastShake=0;
 function askMotion(){if(motionOK)return Promise.resolve(true);
  const DM=window.DeviceMotionEvent;if(!DM)return Promise.resolve(false);
  const p=typeof DM.requestPermission==='function'?DM.requestPermission().then(r=>r==='granted').catch(()=>false):Promise.resolve(true);
  return p.then(ok=>{if(ok&&!motionOK){motionOK=true;window.addEventListener('devicemotion',e=>{const a=e.accelerationIncludingGravity||e.acceleration;if(!a)return;const m=Math.abs(a.x||0)+Math.abs(a.y||0)+Math.abs(a.z||0);if(m>32&&Date.now()-lastShake>900){lastShake=Date.now();shakeFns.forEach(f=>f());}});}return ok;});}

 /* ---------- 入口：旅途小遊戲 ---------- */
 const tools=$('#trip-tools .card');
 if(tools){const row=document.createElement('div');row.className='g-row';
  row.innerHTML=`<p class="g-title">旅途小遊戲</p><div class="g-btns"><button type="button" class="g-btn" data-g="omi"><span class="g-ic">${OMI_IC()}</span><b>今日御神籤</b><small id="gOmiSub">搖一搖抽今天的籤</small></button><button type="button" class="g-btn" data-g="gacha"><span class="g-ic">${GACHA_IC()}</span><b>拍照扭蛋</b><small id="gGachaSub">任務・搞笑姿勢</small></button><button type="button" class="g-btn g-alb" data-g="album"><span class="g-ic">${ALB_IC()}</span><b>旅途相冊</b><small id="gAlbumSub">拍到的都放這裡</small></button></div>`;
  const ig=tools.querySelector('.info-grid');if(ig)ig.after(row);else tools.prepend(row);
  row.addEventListener('click',e=>{const b=e.target.closest('[data-g]');if(!b)return;const k=b.dataset.g;k==='omi'?omikuji():k==='album'?album():gacha();});
 }
 function OMI_IC(){return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M12 12h16l-2 22H14Z" fill="#F3B6A8" stroke="#5B4B43" stroke-width="2" stroke-linejoin="round"/><path d="M18 12V4M22 12V6" stroke="#5B4B43" stroke-width="2.4" stroke-linecap="round"/><rect x="15" y="18" width="10" height="8" rx="1.5" fill="#FFF8EF" stroke="#5B4B43" stroke-width="1.4"/><path d="M18 21h4M18 23.5h4" stroke="#C0675B" stroke-width="1.2" stroke-linecap="round"/></svg>';}
 function ALB_IC(){return '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="6" y="8" width="26" height="26" rx="3" fill="#fff" stroke="#5B4B43" stroke-width="2" transform="rotate(-8 19 21)"/><rect x="10" y="6" width="24" height="27" rx="2.5" fill="#FFFDF9" stroke="#5B4B43" stroke-width="2"/><rect x="13" y="9" width="18" height="15" rx="1.5" fill="#BFD9F2"/><path d="M13 22l5-5 4 4 3-3 6 6v0H13Z" fill="#fff"/><circle cx="26" cy="13" r="2" fill="#FFE39A"/></svg>';}
 function GACHA_IC(){return '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="15" r="11" fill="#E9F4FB" stroke="#5B4B43" stroke-width="2"/><circle cx="15" cy="15" r="3.4" fill="#F6B9C4"/><circle cx="23" cy="12" r="3.4" fill="#FFE39A"/><circle cx="23" cy="19" r="3.4" fill="#BFE0C8"/><rect x="10" y="24" width="20" height="12" rx="3" fill="#F3B6A8" stroke="#5B4B43" stroke-width="2"/><circle cx="20" cy="30" r="2.6" fill="#fff" stroke="#5B4B43" stroke-width="1.4"/></svg>';}

 /* ---------- 1. 今日御神籤 ---------- */
 const YI=[['宜：大口吃燒肉慶祝抵達','宜：在 UNIQLO 補一件發熱衣'],['宜：在雪地打滾拍照','宜：搭纜車看百萬夜景'],['宜：聽蒸汽鐘報時','宜：在運河邊同框拍照'],['宜：在神宮許一個願','宜：狸小路慢慢逛'],['宜：和聖誕樹合照','宜：慢慢開車看雪景'],['宜：耐心等企鵝散步','宜：今晚早點睡'],['宜：泡溫泉泡到滿足','宜：看湖景發呆十分鐘'],['宜：地獄谷散步找小鬼','宜：加滿油再還車'],['宜：最後一次逛機場','宜：先辦退稅再託運']];
 const YI_PRE=['宜：準備好發熱衣和暖暖包','宜：先去辦駕照日文譯本','宜：每天想一次北海道'],YI_POST=['宜：整理旅行照片','宜：偷偷計畫下一次旅行'];
 const JI=['忌：在結冰路上邊走邊滑手機','忌：把免稅品塞進託運','忌：小看北海道的冷','忌：手機電量低於 20% 還不充電','忌：一次吃太飽錯過下一攤','忌：雪地開快車','忌：出門忘記帶暖暖包'];
 const LUCKY=['幸運小物：暖暖包','幸運小物：毛帽','幸運小物：熱可可','幸運小物：雪丸','幸運色：櫻花粉','幸運色：雪白色','幸運色：天空藍','幸運小物：手套'];
 const LV=[['大吉',30,'今天什麼都會很順利！'],['中吉',26,'好事會一件一件來'],['小吉',20,'小小的幸運藏在路邊'],['吉',14,'平平順順就是福'],['末吉',10,'先慢後好，越晚越開心']];
 function fortune(){const t=jpDate(),r=seeded('omi'+t),i=tripIdx();let x=r()*100,lv=LV[0];for(const l of LV){if(x<l[1]){lv=l;break;}x-=l[1];}
  const pool=i>=0&&i<YI.length?YI[i]:(i<0?YI_PRE:YI_POST);
  return {t,no:1+Math.floor(r()*99),lv,yi:pool[Math.floor(r()*pool.length)],ji:JI[Math.floor(r()*JI.length)],lucky:LUCKY[Math.floor(r()*LUCKY.length)],day:i};}
 const NUM='〇一二三四五六七八九';const kanji=n=>n<10?NUM[n]:(n<20?'十'+(n%10?NUM[n%10]:''):NUM[Math.floor(n/10)]+'十'+(n%10?NUM[n%10]:''));
 function omiSub(){const s=$('#gOmiSub');if(!s)return;const o=get('hk-omi-v1',{});s.textContent=o[jpDate()]?`今天抽到「${o[jpDate()]}」`:'搖一搖抽今天的籤';}
 function slip(f){return `<div class="omi-slip"><div class="omi-no">第${kanji(f.no)}番</div><div class="omi-lv">${f.lv[0]}</div><p class="omi-msg">${esc(f.lv[2])}</p><ul><li>${esc(f.yi)}</li><li>${esc(f.ji)}</li><li>${esc(f.lucky)}</li></ul><p class="omi-foot">${f.t.slice(5).replace('-','/')}・明天再來抽新的籤</p></div>`;}
 function omikuji(){
  const f=fortune(),drawn=get('hk-omi-v1',{})[f.t];
  open(`<div class="cs-panel g-panel" role="dialog" aria-modal="true" aria-label="今日御神籤"><h3>今日御神籤</h3>
   <div class="omi-stage">${drawn?slip(f):`<div class="omi-box" id="omiBox"><svg viewBox="0 0 120 150" aria-hidden="true"><path d="M48 30V8M60 30V4M72 30V10" stroke="#C9A97A" stroke-width="5" stroke-linecap="round"/><path d="M30 34h60l-6 104H36Z" fill="#F3B6A8" stroke="#5B4B43" stroke-width="3" stroke-linejoin="round"/><path d="M30 34h60" stroke="#5B4B43" stroke-width="3"/><rect x="44" y="62" width="32" height="44" rx="4" fill="#FFF8EF" stroke="#5B4B43" stroke-width="2"/><text x="60" y="80" text-anchor="middle" font-size="12" font-weight="900" fill="#C0675B">御</text><text x="60" y="97" text-anchor="middle" font-size="12" font-weight="900" fill="#C0675B">神籤</text><path d="M36 124h48" stroke="#E7A391" stroke-width="3"/></svg><i class="omi-stick" hidden></i></div>
   <p class="g-hint">點下面按鈕，或直接搖一搖手機</p><button type="button" class="cs-save g-go" id="omiGo">搖一搖抽籤</button>`}</div>
   <div class="cs-btns"><button type="button" class="g-close g-x">關閉</button></div></div>`);
  if(drawn)return;
  const go=()=>{const b=$('#omiBox');if(!b||b.dataset.busy)return;b.dataset.busy=1;shakeFns.delete(go);
   const fin=()=>{const o=get('hk-omi-v1',{});o[f.t]=f.lv[0];put('hk-omi-v1',o);omiSub();const st=sh.querySelector('.omi-stage');if(st){st.innerHTML=slip(f);st.querySelector('.omi-slip').classList.add('unfold');}};
   if(RM){fin();return;}b.classList.add('shaking');setTimeout(()=>{b.classList.remove('shaking');const s=b.querySelector('.omi-stick');s.hidden=false;s.textContent=f.no;s.classList.add('pop');setTimeout(fin,900);},1300);};
  shakeFns.add(go);
  $('#omiGo').addEventListener('click',()=>{askMotion();go();});
 }
 omiSub();

 /* ---------- 2. 拍照扭蛋（任務＋搞笑姿勢）＋旅途相冊 ---------- */
 const MIS=['和路邊的雪人合照','拍兩個人在雪地上的腳印','拍蒸汽鐘冒煙的瞬間','在運河邊拍兩人背影','找一個可愛的人孔蓋','拍企鵝走路的屁股','找一隻雪地裡的小鳥','拍一張車窗外的雪景','自拍時呼出白色霧氣','拍雪中的自動販賣機','拍一棵掛滿雪的樹','自己堆一個迷你雪人合照','找一個「北海道限定」的招牌','拍下今天最漂亮的天空','兩人在地標前比同一個手勢','拍溫泉冒出來的熱氣','拍一根亮晶晶的冰柱','找一個北海道形狀的東西','幫租來的車拍雪中英姿','拍一張可愛的車站站名牌','找一個寫著「熊」或「鹿」的標誌','在纜車上拍窗外夜景','戴手套跟對方擊掌拍下來','拍一張兩人的影子',
  '拍燒肉在烤網上滋滋叫','把螃蟹舉到臉旁邊比大小','拍一碗湯咖哩的正上方','拍冰淇淋在雪地背景前','找一個寫錯的中文標示','拍便利商店的熱食櫃','拍一杯熱飲冒煙','找一個長得像臉的東西','拍一張狸小路的燈海','和一個招財貓合照','拍一隻會動的動物（不是企鵝）','拍雪地裡的一串動物腳印','在聖誕樹前拍一張明信片構圖','拍青池的顏色','拍一張「好冷」的表情','拍兩個人的手套疊在一起','拍兩杯飲料乾杯','拍飯店房間窗外的景色','拍浴衣穿好的樣子','和地獄谷的小鬼像合照','拍溫泉蛋剝開的瞬間','找一台雪中的郵筒','拍一張只有雪和天空的照片','拍屋頂上厚厚的積雪','拍一個超大的冰柱或雪牆','偷拍對方在認真吃東西','拍一張兩人在車裡的自拍','拍伴手禮堆成一座小山','拍機場的「Welcome to Hokkaido」','拍最後一張北海道的天空'];
 const POSE=['兩人假裝被雪球打中倒地','學企鵝雙手貼身走路','假裝在雪地裡游泳','一個人抬、一個人假裝被冰凍住','比出「北海道很冷」的發抖姿勢','對著螃蟹做出驚恐表情','假裝用筷子夾起整座山','把雪人當成第三個人勾肩','一起跳起來、在半空中拍到','假裝被風吹到快飛走','背對背、兩人都比愛心的一半','假裝在蒸汽鐘旁邊被蒸氣燙到','學雪丸鼓起臉頰','兩人一起做出吶喊的表情','用手比框框把風景框起來','假裝自己是雪地裡的雕像','一個人跪下獻上伴手禮','假裝在運河上划船','學北極熊站起來的樣子','用雪做兩個愛心放在眼睛前','假裝喝溫泉水喝到很滿足','兩人同時咬一支冰淇淋','假裝打翻一碗拉麵（不要真的打翻）','模仿路邊標誌上的人','把帽子蓋在對方臉上','假裝被企鵝追著跑','一個人躺雪地、一個人假裝在畫輪廓','做出超誇張的「好吃！」表情','學電視廣告舉著伴手禮微笑','假裝在雪地裡滑倒（安全第一）'];
 const PK=p=>p==='p'?POSE:MIS;
 const title=id=>{const k=id[0],i=+id.slice(1);return (PK(k)[i])||'';};
 const COL=['#F6B9C4','#FFE39A','#BFE0C8','#BFD9F2','#E3C9F0','#FFD1A8'];
 const GK='hk-gacha-v2';
 const gs=()=>{let g=get(GK,null);if(!g){g={done:{},last:{}};const o=get('hk-gacha-v1',null);if(o&&o.done)Object.keys(o.done).forEach(i=>g.done['m'+i]=o.done[i]);put(GK,g);}g.done=g.done||{};g.last=g.last||{};return g;};
 /* 照片存在手機的 IndexedDB（每個任務一張） */
 const DB=()=>new Promise((res,rej)=>{if(!window.indexedDB){rej('no idb');return;}const r=indexedDB.open('hk-album',1);r.onupgradeneeded=()=>r.result.createObjectStore('photos');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});
 const tx=(mode,fn)=>DB().then(db=>new Promise((res,rej)=>{const t=db.transaction('photos',mode),s=t.objectStore('photos');const out=fn(s);t.oncomplete=()=>res(out&&out.result!==undefined?out.result:out);t.onerror=()=>rej(t.error);}));
 const pGet=id=>tx('readonly',s=>s.get(id));
 const pPut=(id,v)=>tx('readwrite',s=>s.put(v,id));
 const pDel=id=>tx('readwrite',s=>s.delete(id));
 const pAll=()=>DB().then(db=>new Promise((res,rej)=>{const t=db.transaction('photos','readonly'),s=t.objectStore('photos'),out={};const c=s.openCursor();c.onsuccess=()=>{const cur=c.result;if(cur){out[cur.key]=cur.value;cur.continue();}else res(out);};c.onerror=()=>rej(c.error);}));
 function shrink(file){return new Promise((res,rej)=>{const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{const m=1280,k=Math.min(1,m/Math.max(img.width,img.height)),w=Math.round(img.width*k),h=Math.round(img.height*k);const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);URL.revokeObjectURL(url);c.toBlob(b=>b?res(b):rej('blob'),'image/jpeg',.82);};img.onerror=()=>{URL.revokeObjectURL(url);rej('img');};img.src=url;});}
 const picker=document.createElement('input');picker.type='file';picker.accept='image/*';picker.hidden=true;document.body.appendChild(picker);
 function addPhoto(id,after){picker.value='';picker.onchange=async()=>{const f=picker.files&&picker.files[0];if(!f)return;try{const b=await shrink(f);await pPut(id,{blob:b,t:Date.now()});const g=gs();g.done[id]=g.done[id]||Date.now();put(GK,g);gachaSub();toast('放進相冊了 📷');after&&after();}catch(e){toast('這張照片存不進去，換一張試試');}};picker.click();}
 const urls=[];const objURL=b=>{const u=URL.createObjectURL(b);urls.push(u);return u;};const freeURLs=()=>{while(urls.length)URL.revokeObjectURL(urls.pop());};
 function gachaSub(){const s=$('#gGachaSub');const g=gs();const n=Object.keys(g.done).length;if(s)s.textContent=n?`已完成 ${n} 個`:'任務・搞笑姿勢';const a=$('#gAlbumSub');if(a)pAll().then(o=>{a.textContent=Object.keys(o).length?`${Object.keys(o).length} 張照片`:'拍到的都放這裡';}).catch(()=>{a.textContent='拍到的都放這裡';});}
 function pick(k){const g=gs(),L=PK(k);const all=L.map((_,i)=>k+i);const left=all.filter(id=>!g.done[id]&&id!==g.last[k]);const pool=left.length?left:all.filter(id=>id!==g.last[k]);const id=pool[Math.floor(Math.random()*pool.length)];g.last[k]=id;put(GK,g);return id;}
 function machine(){const caps=Array.from({length:9},(_,k)=>`<circle cx="${34+(k%3)*26+(k>5?8:0)}" cy="${34+Math.floor(k/3)*20}" r="11" fill="${COL[k%6]}" stroke="#5B4B43" stroke-width="2"/><path d="M${23+(k%3)*26+(k>5?8:0)} ${34+Math.floor(k/3)*20}h22" stroke="#5B4B43" stroke-width="1.4"/>`).join('');
  return `<svg class="ga-svg" viewBox="0 0 120 170" aria-hidden="true"><circle cx="60" cy="52" r="46" fill="#EEF6FC" stroke="#5B4B43" stroke-width="3"/><g class="ga-caps">${caps}</g><path d="M30 26a34 34 0 0 1 22-12" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/><rect x="18" y="92" width="84" height="66" rx="12" fill="var(--gm,#F3B6A8)" stroke="#5B4B43" stroke-width="3"/><rect x="42" y="136" width="36" height="16" rx="6" fill="#5B4B43" opacity=".85"/><g class="ga-handle"><circle cx="60" cy="114" r="13" fill="#FFF8EF" stroke="#5B4B43" stroke-width="3"/><rect x="56.5" y="102" width="7" height="24" rx="3.5" fill="#E7A391" stroke="#5B4B43" stroke-width="2"/></g></svg>`;}
 let mode='m';
 function gacha(){
  open(`<div class="cs-panel g-panel" role="dialog" aria-modal="true" aria-label="拍照扭蛋"><h3>拍照扭蛋</h3>
   <div class="ga-tabs" role="tablist"><button type="button" role="tab" data-mode="m" class="${mode==='m'?'on':''}">📷 拍照任務</button><button type="button" role="tab" data-mode="p" class="${mode==='p'?'on':''}">🤪 搞笑姿勢</button></div>
   <div class="ga-stage ${mode==='p'?'pose':''}"><button type="button" class="ga-machine" id="gaMachine" aria-label="轉扭蛋">${machine()}</button><div class="ga-out" id="gaOut"></div></div>
   <p class="g-hint" id="gaHint">點扭蛋機的轉鈕轉一顆</p><div id="gaCard"></div>
   <button type="button" class="ga-alb" id="gaAlb">打開旅途相冊</button>
   <div class="cs-btns"><button type="button" class="g-close g-x">關閉</button></div></div>`);
  $('#gaMachine').addEventListener('click',spin);
  $('#gaAlb').addEventListener('click',album);
  sh.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;sh.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('on',x===b));sh.querySelector('.ga-stage').classList.toggle('pose',mode==='p');$('#gaOut').innerHTML='';$('#gaCard').innerHTML='';$('#gaHint').textContent='點扭蛋機的轉鈕轉一顆';}));
 }
 function spin(){const m=$('#gaMachine');if(!m||m.dataset.busy)return;m.dataset.busy=1;$('#gaCard').innerHTML='';const id=pick(mode),c=COL[(+id.slice(1))%6];
  const drop=()=>{$('#gaOut').innerHTML=`<button type="button" class="ga-cap" style="--c:${c}" aria-label="打開扭蛋"><i class="t"></i><i class="b"></i></button>`;$('#gaHint').textContent='點扭蛋打開！';
   $('#gaOut .ga-cap').addEventListener('click',e=>{e.currentTarget.classList.add('open');setTimeout(()=>{reveal(id);delete m.dataset.busy;$('#gaHint').textContent='再轉一顆換別的';},RM?0:450);},{once:true});};
  if(RM){drop();return;}m.classList.add('turn');setTimeout(()=>{m.classList.remove('turn');drop();},900);}
 function reveal(id){const g=gs(),done=!!g.done[id];
  $('#gaCard').innerHTML=`<div class="ga-card ${id[0]==='p'?'pose':''}"><small>${id[0]==='p'?'這次的搞笑姿勢':'這次的拍照任務'}</small><b>${esc(title(id))}</b><div class="ga-acts"><button type="button" class="ga-did on2" data-act="photo">📷 拍到了！放進相冊</button><button type="button" class="ga-did" data-act="done">${done?'已完成 ✓':'完成，不放照片'}</button></div></div>`;
  $('#gaCard').addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;
   if(b.dataset.act==='photo')addPhoto(id,()=>{b.textContent='已放進相冊 ✓';});
   else{const g=gs();if(g.done[id])delete g.done[id];else g.done[id]=Date.now();put(GK,g);b.textContent=g.done[id]?'已完成 ✓':'完成，不放照片';gachaSub();}});}
 /* 相冊 */
 async function album(){freeURLs();let P={};try{P=await pAll();}catch(e){}
  const g=gs();const ids=[...new Set([...Object.keys(P),...Object.keys(g.done)])].sort((a,b)=>((P[a]&&P[a].t)||g.done[a]||0)-((P[b]&&P[b].t)||g.done[b]||0));
  const nM=ids.filter(i=>i[0]==='m').length,nP=ids.filter(i=>i[0]==='p').length;
  const cell=id=>{const p=P[id],d=new Date((p&&p.t)||g.done[id]||Date.now()),md=`${d.getMonth()+1}/${d.getDate()}`;
   return `<button type="button" class="al-pc ${id[0]==='p'?'pose':''}" data-id="${id}" style="--r:${((id.charCodeAt(1)*7+id.length*3)%7)-3}deg">${p?`<img src="${objURL(p.blob)}" alt="">`:`<span class="al-empty">＋<br>補一張照片</span>`}<b>${esc(title(id))}</b><small>${id[0]==='p'?'🤪 ':'📷 '}${md}</small></button>`;};
  open(`<div class="cs-panel g-panel al-panel" role="dialog" aria-modal="true" aria-label="旅途相冊"><h3>旅途相冊</h3>
   <p class="al-sum">拍照任務 ${nM}/${MIS.length}・搞笑姿勢 ${nP}/${POSE.length}・照片 ${Object.keys(P).length} 張</p>
   ${ids.length?`<div class="al-grid">${ids.map(cell).join('')}</div>`:'<p class="g-hint">還沒有照片，先去轉扭蛋吧！</p>'}
   <p class="al-note">照片只存在這支手機的瀏覽器裡（已自動縮小），不會上傳。原本的照片還在你的相簿，清除 Safari 資料會把這裡的照片一起清掉。</p>
   <div class="cs-btns"><button type="button" class="g-close g-x">關閉</button></div></div>`);
  sh.querySelector('.al-grid')?.addEventListener('click',e=>{const c=e.target.closest('.al-pc');if(!c)return;const id=c.dataset.id;P[id]?viewer(id,P[id]):addPhoto(id,album);});
 }
 function viewer(id,p){const u=objURL(p.blob);
  open(`<div class="cs-panel g-panel al-view" role="dialog" aria-modal="true" aria-label="照片"><div class="al-big"><img src="${u}" alt="${esc(title(id))}"><b>${esc(title(id))}</b><small>${new Date(p.t).toLocaleDateString('zh-TW')}</small></div>
   <div class="al-acts"><button type="button" data-v="save">存到手機／分享</button><button type="button" data-v="swap">換一張</button><button type="button" data-v="del">刪除照片</button></div>
   <div class="cs-btns"><button type="button" class="g-x" data-v="back">回相冊</button></div></div>`);
  sh.querySelector('.al-view').addEventListener('click',async e=>{const b=e.target.closest('[data-v]');if(!b)return;const v=b.dataset.v;
   if(v==='back')album();
   if(v==='swap')addPhoto(id,album);
   if(v==='del'){if(confirm('確定刪除這張照片？（任務仍算完成）')){await pDel(id);gachaSub();album();}}
   if(v==='save'){const f=new File([p.blob],`hokkaido-${id}.jpg`,{type:'image/jpeg'});try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:title(id)});return;}}catch(err){return;}const a=document.createElement('a');a.href=u;a.download=f.name;a.click();}});
 }
 gachaSub();

 /* ---------- 3. 雪景搖搖 ---------- */
 const hero=document.getElementById('heroArt');
 if(hero){const wrap=hero.parentElement;wrap.classList.add('snow-host');const lay=document.createElement('div');lay.className='snow-burst';lay.setAttribute('aria-hidden','true');wrap.appendChild(lay);
  let n=0;const flake=(x,big)=>{if(n>90)return;n++;const f=document.createElement('i');const s=(big?5:3)+Math.random()*6;f.style.cssText=`left:${x}%;width:${s}px;height:${s}px;--dx:${(Math.random()*40-20).toFixed(0)}px;animation-duration:${(2.2+Math.random()*2.2).toFixed(2)}s;animation-delay:${(Math.random()*.5).toFixed(2)}s`;lay.appendChild(f);f.addEventListener('animationend',()=>{f.remove();n--;});};
  const burst=(cx,k)=>{if(RM)return;for(let j=0;j<k;j++)flake(Math.max(0,Math.min(100,cx+(Math.random()*60-30))),j%4===0);};
  let lx=null,acc=0;
  wrap.addEventListener('pointerdown',e=>{lx=e.clientX;acc=0;askMotion();const r=wrap.getBoundingClientRect();burst((e.clientX-r.left)/r.width*100,10);});
  wrap.addEventListener('pointermove',e=>{if(lx==null)return;acc+=Math.abs(e.clientX-lx);lx=e.clientX;if(acc>40){acc=0;const r=wrap.getBoundingClientRect();burst((e.clientX-r.left)/r.width*100,8);}});
  ['pointerup','pointercancel','pointerleave'].forEach(t=>wrap.addEventListener(t,()=>{lx=null;}));
  shakeFns.add(()=>{const r=wrap.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)burst(50,40);});
  if(!get('hk-snowhint-v1',0)){const h=document.createElement('span');h.className='snow-hint';h.textContent='摸一下雪景，雪會下更大';wrap.appendChild(h);setTimeout(()=>h.remove(),6000);put('hk-snowhint-v1',1);}
 }

 /* ---------- 4. 存錢筒 ---------- */
 const PIG='<svg viewBox="0 0 90 70" aria-hidden="true"><ellipse cx="44" cy="40" rx="32" ry="24" fill="#F7C6CF" stroke="#5B4B43" stroke-width="2.6"/><path d="M30 20l-4-10 10 6" fill="#F7C6CF" stroke="#5B4B43" stroke-width="2.4" stroke-linejoin="round"/><path d="M50 18l6-9 2 11" fill="#F7C6CF" stroke="#5B4B43" stroke-width="2.4" stroke-linejoin="round"/><rect x="34" y="17" width="16" height="4" rx="2" fill="#5B4B43"/><ellipse cx="74" cy="42" rx="8" ry="7" fill="#F2A9B7" stroke="#5B4B43" stroke-width="2.4"/><circle cx="72" cy="41" r="1.3" fill="#5B4B43"/><circle cx="76.5" cy="41" r="1.3" fill="#5B4B43"/><circle cx="60" cy="33" r="2.2" fill="#5B4B43"/><ellipse cx="62" cy="44" rx="4" ry="2.4" fill="#F29BAC" opacity=".7"/><path d="M26 60v7M38 62v6M52 62v6M62 60v7" stroke="#5B4B43" stroke-width="5" stroke-linecap="round"/><path d="M12 38c-6-2-6 6 0 4" fill="none" stroke="#5B4B43" stroke-width="2" stroke-linecap="round"/></svg>';
 function spentJPY(){const L=get('hk-ledger-v1',[]),S=get('hk-ledger-set-v1',{});const rate=+(S.rate||0.21)||0.21;return (Array.isArray(L)?L:[]).reduce((a,e)=>a+(e.cur==='JPY'?+e.amt||0:(+e.amt||0)/rate),0);}
 function pig(){const sum=document.querySelector('#ledger .lg-sum');if(!sum)return null;let p=document.querySelector('#ledger .pig');
  if(!p){p=document.createElement('div');p.className='pig';p.innerHTML=`<div class="pig-body">${PIG}</div><small></small>`;sum.after(p);}
  const s=spentJPY();p.style.setProperty('--fat',(1+Math.min(s/150000,1)*.35).toFixed(3));p.querySelector('small').textContent=s?`小豬吃了 ¥${Math.round(s).toLocaleString()}`:'記一筆帳餵小豬';return p;}
 function ding(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=ding.c||(ding.c=new C());const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(1568,c.currentTime);o.frequency.setValueAtTime(2093,c.currentTime+.08);g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.12,c.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.35);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+.4);}catch(e){}}
 const led=document.getElementById('ledger');
 if(led){pig();new MutationObserver(()=>{if(!document.querySelector('#ledger .pig'))pig();}).observe(led,{childList:true,subtree:true});
  led.addEventListener('submit',()=>{const before=(get('hk-ledger-v1',[])||[]).length;setTimeout(()=>{const after=(get('hk-ledger-v1',[])||[]).length;const p=pig();if(after>before&&p){ding();if(!RM){const c=document.createElement('i');c.className='pig-coin';c.textContent='¥';p.appendChild(c);p.classList.remove('munch');void p.offsetWidth;p.classList.add('munch');setTimeout(()=>c.remove(),900);}}},60);},true);}

 /* ---------- 5. 今日全破＋地區章 ---------- */
 const REG=[['i-clock','札幌','#E7A391'],['s-gondola','藻岩山','#8FAFCB'],['i-lamp','小樽','#D9A75F'],['i-letter','白色戀人','#C9A0C4'],['i-tree','美瑛','#8CC7A6'],['i-penguin','旭山','#7FA6D6'],['i-onsen','溫泉鄉','#E39494'],['i-car','千歲','#A9B79A'],['i-plane','平安回家','#E7A391']];
 const AK='hk-allclear-v1';
 function stampSVG(i,on){const r=REG[i]||REG[0],d=D[i],md=d?`${+d.date.slice(5,7)}/${+d.date.slice(8,10)}`:'';const c=on?r[2]:'#D8CBC0';
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><path id="rgArc${i}${on?1:0}" d="M22 52a28 28 0 0 0 56 0"/></defs><circle cx="50" cy="50" r="45" fill="${on?'#FFFDF9':'none'}" stroke="${c}" stroke-width="${on?4:2.5}" ${on?'':'stroke-dasharray="5 5"'}/><circle cx="50" cy="50" r="38" fill="none" stroke="${c}" stroke-width="1.4" ${on?'':'opacity=".5"'}/>${on?`<text x="50" y="27" text-anchor="middle" font-size="8.5" font-weight="900" fill="${c}">D${i+1}・${md}</text><use href="#${sym(r[0])}" x="34" y="30" width="32" height="32"/><text font-size="11" font-weight="900" fill="${c}" text-anchor="middle"><textPath href="#rgArc${i}1" startOffset="50%">${r[1]}</textPath></text>`:`<text x="50" y="48" text-anchor="middle" font-size="13" font-weight="900" fill="#C9BDB2">D${i+1}</text><text x="50" y="64" text-anchor="middle" font-size="9.5" font-weight="700" fill="#C9BDB2">${r[1]}</text>`}</svg>`;}
 function stampRow(){const fp=document.querySelector('.fp-card');if(!fp)return;let el=document.querySelector('.rg-card');
  if(!el){el=document.createElement('div');el.className='card rg-card';fp.after(el);}
  const A=get(AK,{}),n=REG.filter((_,i)=>A[i]).length;
  el.innerHTML=`<div class="rg-top"><b>地區章</b><span>一天的行程全部完成，就能蓋那天的章（${n}/${REG.length}）</span></div><div class="rg-grid">${REG.map((_,i)=>`<div class="rg-s${A[i]?' on':''}" style="--r:${((i*37)%15)-7}deg">${stampSVG(i,!!A[i])}</div>`).join('')}</div>`;}
 function curDay(){const tabs=[...document.querySelectorAll('.daytab')];const a=tabs.findIndex(t=>t.classList.contains('active'));return a;}
 function celebrate(i){const r=REG[i]||REG[0];
  const ov=document.createElement('div');ov.className='ac-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-label',`D${i+1} 今日全破`);
  ov.innerHTML=`<div class="ac-fw">${Array.from({length:3},(_,k)=>`<span class="fw f${k}">${Array.from({length:12},(_,j)=>`<i style="--a:${j*30}deg"></i>`).join('')}</span>`).join('')}</div>
   <div class="ac-card"><svg class="ac-bird" viewBox="0 0 100 100" aria-hidden="true"><use href="#${sym('i-enaga')}"/></svg><p class="ac-t">D${i+1} 今日全破！</p><div class="ac-stamp">${stampSVG(i,true)}</div><p class="ac-s">今天的行程全部完成，蓋上「${r[1]}」地區章</p><button type="button" class="cs-save ac-ok">好耶！</button></div>`;
  document.body.appendChild(ov);ov.querySelector('.ac-ok').addEventListener('click',()=>ov.remove());ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});ding();}
 function checkAll(){const dc=document.getElementById('dayCard');if(!dc)return;const i=curDay();if(i<0||i>=REG.length)return;
  const box=[...dc.querySelectorAll('input[data-check],input[data-ccheck],[data-ccheck] input')];if(!box.length)return;
  const all=box.every(x=>x.checked);const A=get(AK,{});
  if(all&&!A[i]){A[i]=Date.now();put(AK,A);stampRow();celebrate(i);}
  else if(!all&&A[i]){delete A[i];put(AK,A);stampRow();}}
 document.addEventListener('change',e=>{if(e.target.closest&&e.target.closest('#dayCard')&&e.target.matches('input[type=checkbox]'))setTimeout(checkAll,60);});
 stampRow();
 if(typeof showDay==='function'){const p=showDay;window.showDay=showDay=function(i){const r=p.apply(this,arguments);try{stampRow()}catch(e){}return r;};}
 window.hkPreviewAllClear=i=>celebrate(i||0);
})();
