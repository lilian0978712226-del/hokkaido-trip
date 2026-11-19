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

 /* ---------- 1. 今日御神籤（每支手機抽到不一樣、可分享、大吉有動畫） ---------- */
 const OD={
  pre:{yi:['準備發熱衣和暖暖包','去監理站辦駕照日文譯本','每天想一次北海道','把螃蟹的日文「カニ」練到很標準','先練習在冷凍庫前面站五分鐘','把行李箱擦乾淨迎接戰利品','偷看一次網站倒數'],ji:['先買太多衣服（北海道 UNIQLO 比較便宜）','出發前一天才開始收行李','現在就開始減肥（沒用的，會吃回來）','把護照放在「很安全的地方」然後忘記在哪'],lu:['暖暖包','日文譯本','護照','行李箱']},
  post:{yi:['整理旅行照片','偷偷計畫下一次旅行','把伴手禮分完再偷吃一個','對著照片說「好想回去」'],ji:['打開行李箱發現白色戀人被壓扁','量體重','看自己的信用卡帳單','跟沒去的朋友說「其實也還好啦」'],lu:['旅途相冊','剩下的日圓硬幣','白色戀人','行李箱']},
  d:[
   {yi:['在飛機上先想好燒肉要點什麼','踏出機場第一口冷空氣大喊「好冷！」','在 UNIQLO 買發熱衣當場穿上','到飯店先在床上滾一圈','對著第一片雪花許願','跟陳肥肥說「我們到北海道了耶」十次'],ji:['燒肉吃到忘記今天才剛到','在機場就把行李箱塞滿','取車時太興奮忘記拍車子原本的刮痕','把第一天的力氣全部用完'],lu:['燒肉夾','剛拆封的發熱衣','租車鑰匙','機場的熱咖啡']},
   {yi:['在雪地上躺下來畫雪天使','坐雪盆滑下去，尖叫音量不限','搭纜車看百萬夜景偷偷許願','湯咖哩加一顆溫泉蛋','在雪裡用手指寫兩人的名字','烤羊肉吃到全身都是羊肉味'],ji:['嘴巴張開滑雪盆（會吃到雪）','湯咖哩選辣度時逞強','在夜景前說「台北也差不多」','忘記擦掉眼鏡上的霧氣就拍照'],lu:['雪盆','暖暖包','纜車票','一碗湯咖哩']},
   {yi:['在市場跟螃蟹對看三秒再決定','等蒸汽鐘「嗚～」那一刻一起錄影','甜點吃第二輪（有另一個胃）','在運河邊假裝在拍電影','在八音盒堂挑一首當今天的主題曲','海鮮丼先拍照再吃（但不要拍太久）'],ji:['在玻璃店轉身太大力','運河邊拍照後退一步（後面是河）','跟海鷗搶食物','看到第五家甜點店還說「最後一家」'],lu:['海膽','八音盒','玻璃小杯','蒸汽鐘的蒸氣']},
   {yi:['在神宮抽到大吉就收好','在展望台假裝自己是跳台滑雪選手','在白色戀人公園吃餅乾吃到笑','狸小路逛到腳痠再多逛一條','可麗餅點最貴的那個','對神社的鴿子說早安'],ji:['在狸小路說「最後一家」超過三次','可麗餅邊走邊吃，奶油掉到外套上','在展望台往下看太久（腳會軟）','在神社大聲喧嘩'],lu:['御守','可麗餅','白色戀人','狸小路的燈']},
   {yi:['在聖誕樹前拍一張明信片構圖','情人節跟陳肥肥說一句平常不好意思說的話','在牧場喝牛奶喝出白鬍子','在青池前安靜三秒','雪地開車開得比蝸牛還穩','跟美瑛的樹說「你好上相」'],ji:['在青池前說「好像也還好」','雪地開快車（美瑛的路很會滑）','情人節忘記是情人節','把聖誕樹當成普通的樹'],lu:['鮮奶','愛心形狀的雪','聖誕樹','巧克力']},
   {yi:['跟企鵝用一樣的姿勢走路','找出最胖的企鵝幫牠取名字','晚上吃天金比較誰點的菜比較好吃','對北極熊揮手（牠可能不會理你）','買一個企鵝周邊當作今天的紀念','在動物園門口拍「我們來了」的照片'],ji:['跟北極熊比賽誰比較耐冷','企鵝散步時擋在牠們前面（牠們有行程）','把企鵝的屁股照片設成手機桌布（其實可以）','在動物園講「好想吃烤肉」'],lu:['企鵝玩偶','毛帽','動物園門票','旭川拉麵']},
   {yi:['在牧場吃冰淇淋就算零下也要吃','看湖景發呆十分鐘什麼都不想','泡溫泉泡到變成紅通通的章魚','穿浴衣在旅館裡走來走去','溫泉後喝一瓶冰牛奶（傳統）','在湖邊對遠方大喊一個願望'],ji:['泡完溫泉馬上去外面拍照（會秒結冰）','浴衣穿反（右邊先包，左邊蓋在上面才對）','在溫泉裡游泳','吃太飽才去泡溫泉'],lu:['溫泉蛋','浴衣','瓶裝牛奶','湖邊的風']},
   {yi:['在地獄谷找小鬼合照比誰比較兇','還車前幫車子拍一張謝謝它的照片','最後一晚把行李箱好好整理一次','海鮮午餐點最想吃的那個，不要省','跟小鬼說「謝謝你沒有抓我」','在千歲找一家便利商店買宵夜'],ji:['在地獄谷說「好香喔」（是硫磺味）','還車前忘記加滿油','把行李箱塞到關不起來','在地獄谷亂丟垃圾（小鬼會生氣）'],lu:['小鬼吊飾','加滿油的車','空的行李箱角落','還車收據']},
   {yi:['在新千歲機場掃最後一輪伴手禮','先辦退稅再託運（綠燈綠燈綠燈）','在飛機上一起看這趟的照片','吃最後一碗拉麵當作告別','撕票根撕得很漂亮','跟北海道說「我還會再來」'],ji:['把免稅品塞進託運行李','說「我不想回家」超過五次（四次可以）','在機場買到超重','睡過頭錯過飛機（不要！）'],lu:['白色戀人','登機證票根','退稅綠燈','剩下的日圓']}
  ],
  any:{yi:['對路邊的雪人說早安','今天多喝一杯熱可可','找一個長得像臉的東西','在便利商店買一個沒吃過的東西','幫對方拍一張很美的照片','在車上一起大聲唱歌'],ji:['手機電量低於 20% 還不充電','在結冰路上邊走邊滑手機','出門忘記帶暖暖包','穿太少逞強說不冷','吃太飽錯過下一攤']}
 };
 const LV=[['大吉',22,['今天會好運到發光！','運氣滿點，螃蟹都會自己跳進碗裡','神明今天特別罩你','今天做什麼都會順順的','好運多到可以分給陳肥肥']],
  ['中吉',24,['好事會一件一件來','今天適合多吃一點','小小的驚喜在轉角等你','運氣不錯，可以大膽一點']],
  ['小吉',20,['小小的幸運藏在路邊','平凡的一天也會有好吃的','今天適合慢慢來','好運正在加熱中']],
  ['吉',16,['平平順順就是福','普通的好運，最穩','今天不會出包，很棒']],
  ['末吉',13,['先慢後好，越晚越開心','早上普通，晚餐會很好吃','好運塞車中，晚點到']],
  ['凶',5,['別擔心！把籤綁起來就沒事了','凶到底就會轉運，明天一定大吉','今天的壞運氣會被燒肉吃掉']]];
 const devId=(()=>{let d=get('hk-dev-id','');if(!d){d=Math.random().toString(36).slice(2,10);put('hk-dev-id',d);}return d;})();
 const OK='hk-omi-v2';
 function fortune(){const t=jpDate();const saved=get(OK,{})[t];if(saved)return saved;
  const r=seeded(devId+'omi'+t),i=tripIdx(),pk=a=>a[Math.floor(r()*a.length)];
  let x=r()*100,lv=LV[0];for(const l of LV){if(x<l[1]){lv=l;break;}x-=l[1];}
  const base=i>=0&&i<OD.d.length?OD.d[i]:(i<0?OD.pre:OD.post);
  const yiPool=[...base.yi,...base.yi,...OD.any.yi],jiPool=[...base.ji,...base.ji,...OD.any.ji];
  const yi1=pk(yiPool);let yi2=pk(yiPool),k=0;while(yi2===yi1&&k++<9)yi2=pk(yiPool);
  return {t,no:1+Math.floor(r()*99),lv:lv[0],msg:pk(lv[2]),yi:[yi1,yi2],ji:pk(jiPool),lu:pk(base.lu||OD.d[0].lu),day:i};}
 const NUM='〇一二三四五六七八九';const kanji=n=>n<10?NUM[n]:(n<20?'十'+(n%10?NUM[n%10]:''):NUM[Math.floor(n/10)]+'十'+(n%10?NUM[n%10]:''));
 function omiSub(){const s=$('#gOmiSub');if(!s)return;const o=get(OK,{})[jpDate()];s.textContent=o?(o.tied?'凶籤已綁好，明天再抽':`今天抽到「${o.lv}」`):'搖一搖抽今天的籤';}
 function slip(f){return `<div class="omi-slip lv-${f.lv}"><div class="omi-no">第${kanji(f.no)}番</div><div class="omi-lv">${f.lv}</div><p class="omi-msg">${esc(f.msg)}</p><ul><li><b>宜</b>${esc(f.yi[0])}</li><li><b>宜</b>${esc(f.yi[1])}</li><li><b class="ji">忌</b>${esc(f.ji)}</li><li><b class="lu">幸運小物</b>${esc(f.lu)}</li></ul><p class="omi-foot">${f.t.slice(5).replace('-','/')}・明天再來抽新的籤</p></div>`;}
 function after(f){return `<div class="omi-acts"><button type="button" class="omi-share">把籤分享出去</button>${f.lv==='凶'?'<button type="button" class="omi-tie">把籤綁起來</button>':''}</div>`;}
 function party(st){if(RM)return;const fx=document.createElement('div');fx.className='omi-fx';fx.setAttribute('aria-hidden','true');
  fx.innerHTML='<i class="ray"></i>'+Array.from({length:26},(_,k)=>`<span class="pt" style="left:${(k*37)%100}%;--d:${(k%7)*.12}s;--x:${(k%5-2)*24}px;--s:${.7+(k%4)*.15}"></span>`).join('')+Array.from({length:10},(_,k)=>`<em style="left:${8+k*9}%;top:${18+(k*23)%50}%;--d:${(k%5)*.18}s">✦</em>`).join('');
  st.appendChild(fx);setTimeout(()=>fx.remove(),4200);
  try{const C=window.AudioContext||window.webkitAudioContext;const c=new C();[1047,1319,1568,2093].forEach((h,k)=>{const o=c.createOscillator(),g=c.createGain();o.frequency.value=h;const t0=c.currentTime+k*.11;g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(.1,t0+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+.5);o.connect(g).connect(c.destination);o.start(t0);o.stop(t0+.55);});}catch(e){}
  if(navigator.vibrate)navigator.vibrate([30,40,30]);}
 function show(f,anim){const st=sh.querySelector('.omi-stage');if(!st)return;st.innerHTML=slip(f)+after(f);const s=st.querySelector('.omi-slip');
  if(anim){s.classList.add('unfold');if(f.lv==='大吉'){s.classList.add('gold');party(st);}}
  st.querySelector('.omi-share').addEventListener('click',()=>shareOmi(f));
  const tie=st.querySelector('.omi-tie');
  const tiedView=animT=>{const w=document.createElement('div');w.className='omi-rope'+(animT&&!RM?' anim':'');w.innerHTML='<svg viewBox="0 0 300 120" aria-hidden="true"><path d="M6 30Q150 60 294 30" fill="none" stroke="#B98A5A" stroke-width="4" stroke-linecap="round"/><path d="M8 34Q150 64 292 34" fill="none" stroke="#D9B98A" stroke-width="1.5" stroke-dasharray="4 5"/><g class="knot" transform="translate(150 45)"><path d="M-7 -6c5 4 9 4 14 0M-7 6c5-4 9-4 14 0" stroke="#5B4B43" stroke-width="2.4" fill="none" stroke-linecap="round"/><rect x="-6" y="0" width="12" height="62" rx="2.5" fill="#FFFDF6" stroke="#5B4B43" stroke-width="2.2"/><text x="0" y="22" text-anchor="middle" font-size="11" font-weight="900" fill="#7E8FA3">凶</text><path d="M-3 30h6M-3 38h6M-3 46h6" stroke="#D8CBC0" stroke-width="1.4"/></g><g fill="#F7B6C6"><circle cx="70" cy="44" r="4"/><circle cx="230" cy="44" r="4"/></g></svg><p>籤綁好了，厄運退散！明天一定大吉 ✨</p>';s.replaceWith(w);if(tie)tie.remove();};
  if(f.tied){tiedView(false);return;}
  if(tie)tie.addEventListener('click',()=>{const o=get(OK,{});if(o[f.t]){o[f.t].tied=1;put(OK,o);}f.tied=1;
   if(RM){tiedView(true);return;}s.classList.add('tied');tie.disabled=true;setTimeout(()=>tiedView(true),700);toast('綁起來了，明天一定大吉！');});}
 function omikuji(){
  const f=fortune(),drawn=!!get(OK,{})[f.t];
  open(`<div class="cs-panel g-panel" role="dialog" aria-modal="true" aria-label="今日御神籤"><h3>今日御神籤</h3>
   <div class="omi-stage">${drawn?'':`<div class="omi-box" id="omiBox"><svg viewBox="0 0 120 150" aria-hidden="true"><path d="M48 30V8M60 30V4M72 30V10" stroke="#C9A97A" stroke-width="5" stroke-linecap="round"/><path d="M30 34h60l-6 104H36Z" fill="#F3B6A8" stroke="#5B4B43" stroke-width="3" stroke-linejoin="round"/><path d="M30 34h60" stroke="#5B4B43" stroke-width="3"/><rect x="44" y="62" width="32" height="44" rx="4" fill="#FFF8EF" stroke="#5B4B43" stroke-width="2"/><text x="60" y="80" text-anchor="middle" font-size="12" font-weight="900" fill="#C0675B">御</text><text x="60" y="97" text-anchor="middle" font-size="12" font-weight="900" fill="#C0675B">神籤</text><path d="M36 124h48" stroke="#E7A391" stroke-width="3"/></svg><i class="omi-stick" hidden></i></div>
   <p class="g-hint">點下面按鈕，或直接搖一搖手機</p><button type="button" class="cs-save g-go" id="omiGo">搖一搖抽籤</button>`}</div>
   <div class="cs-btns"><button type="button" class="g-close g-x">關閉</button></div></div>`);
  if(drawn){show(f,false);return;}
  const go=()=>{const b=$('#omiBox');if(!b||b.dataset.busy)return;b.dataset.busy=1;shakeFns.delete(go);
   const fin=()=>{const o=get(OK,{});o[f.t]=f;put(OK,o);omiSub();show(f,true);};
   if(RM){fin();return;}b.classList.add('shaking');setTimeout(()=>{b.classList.remove('shaking');const s=b.querySelector('.omi-stick');s.hidden=false;s.textContent=f.no;s.classList.add('pop');setTimeout(fin,900);},1300);};
  shakeFns.add(go);
  $('#omiGo').addEventListener('click',()=>{askMotion();go();});
 }
 async function shareOmi(f){
  const W=720,H=1080,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');const F='"Huninn","PingFang TC","Noto Sans TC",sans-serif';
  const gold=f.lv==='大吉';
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,gold?'#FFF1C9':'#FDEFF3');g.addColorStop(1,'#FFF9F1');x.fillStyle=g;x.fillRect(0,0,W,H);
  for(let k=0;k<40;k++){x.fillStyle='rgba(255,255,255,.9)';x.beginPath();x.arc((k*97)%W,(k*61)%H,2+k%4,0,7);x.fill();}
  const rr=(X,Y,w,h,r)=>{x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath();};
  rr(110,90,500,880,14);x.fillStyle='#FFFDF6';x.fill();x.lineWidth=5;x.strokeStyle=gold?'#D4A63A':'#5B4B43';x.stroke();
  x.strokeStyle='#F4E7D3';x.lineWidth=2;[140,580].forEach(X=>{x.beginPath();x.moveTo(X,110);x.lineTo(X,950);x.stroke();});
  x.textAlign='center';x.fillStyle='#9A8B80';x.font=`800 30px ${F}`;x.fillText('北海道雪日記・今日御神籤',360,160);
  x.font=`800 28px ${F}`;x.fillText(`第${kanji(f.no)}番`,360,215);
  x.fillStyle=gold?'#D4A63A':'#C0675B';x.font=`900 150px ${F}`;x.fillText(f.lv,360,380);
  x.fillStyle='#6E5A3A';x.font=`700 30px ${F}`;wrap(f.msg,360,440,420,40);
  x.strokeStyle='#E3D6C9';x.setLineDash([10,8]);x.lineWidth=3;x.beginPath();x.moveTo(160,500);x.lineTo(560,500);x.stroke();x.setLineDash([]);
  x.textAlign='left';let y=560;
  [['宜',f.yi[0],'#C0675B'],['宜',f.yi[1],'#C0675B'],['忌',f.ji,'#5D7488'],['幸運小物',f.lu,'#B98A3E']].forEach(([k,v,col])=>{x.fillStyle=col;x.font=`900 30px ${F}`;x.fillText(k,170,y);const w=x.measureText(k).width+18;x.fillStyle='#4A3B34';x.font=`700 30px ${F}`;y=wrapL(v,170+w,y,390-w,42)+70;});
  x.textAlign='center';x.fillStyle='#A39286';x.font=`700 26px ${F}`;x.fillText(`2027 北海道大暴吃・${f.t.slice(5).replace('-','/')}`,360,1030);
  function wrap(t,cx,y0,mw,lh){let line='',yy=y0;for(const ch of t.match(/[A-Za-z0-9.]+|./gu)){if(x.measureText(line+ch).width>mw){x.fillText(line,cx,yy);line=ch;yy+=lh;}else line+=ch;}x.fillText(line,cx,yy);return yy;}
  function wrapL(t,lx,y0,mw,lh){let line='',yy=y0;for(const ch of t.match(/[A-Za-z0-9.]+|./gu)){if(x.measureText(line+ch).width>mw){x.fillText(line,lx,yy);line=ch;yy+=lh;}else line+=ch;}x.fillText(line,lx,yy);return yy;}
  const blob=await new Promise(r=>c.toBlob(r,'image/png'));const file=new File([blob],`omikuji-${f.t}.png`,{type:'image/png'});
  try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'今日御神籤',text:`我今天抽到「${f.lv}」！`});return;}}catch(e){return;}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000);toast('已存成圖片');}
 window.hkPreviewOmi=lv=>{const f=fortune();f.lv=lv||'大吉';f.msg=(LV.find(l=>l[0]===f.lv)||LV[0])[2][0];open('<div class="cs-panel g-panel"><h3>今日御神籤</h3><div class="omi-stage"></div><div class="cs-btns"><button type="button" class="g-close g-x">關閉</button></div></div>');show(f,true);};
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
   <div class="ga-stage"><button type="button" class="ga-machine" id="gaMachine" aria-label="轉扭蛋">${machine()}</button><div class="ga-out" id="gaOut"></div></div>
   <p class="g-hint" id="gaHint">點扭蛋機的轉鈕轉一顆</p><div id="gaCard"></div>
   <button type="button" class="ga-alb" id="gaAlb">打開旅途相冊</button>
   <div class="cs-btns"><button type="button" class="g-close g-x">關閉</button></div></div>`);
  $('#gaMachine').addEventListener('click',spin);
  $('#gaAlb').addEventListener('click',album);
 }
 function spin(){const m=$('#gaMachine');if(!m||m.dataset.busy)return;m.dataset.busy=1;$('#gaCard').innerHTML='';const id=pick(Math.random()<MIS.length/(MIS.length+POSE.length)?'m':'p'),c=COL[(+id.slice(1))%6];
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
 function pig(){const h=document.querySelector('#ledger h2');if(!h)return null;let p=h.querySelector('.pig');
  if(!p){const old=h.querySelector('.jp-deco');p=document.createElement('span');p.className='pig';p.setAttribute('role','img');p.innerHTML=`<span class="pig-body">${PIG}</span>`;if(old)old.replaceWith(p);else h.appendChild(p);}
  const s=spentJPY();p.style.setProperty('--fat',(1+Math.min(s/150000,1)*.35).toFixed(3));p.setAttribute('aria-label',s?`存錢筒小豬吃了 ¥${Math.round(s).toLocaleString()}`:'存錢筒小豬，記帳就會餵牠');return p;}
 function ding(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=ding.c||(ding.c=new C());const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(1568,c.currentTime);o.frequency.setValueAtTime(2093,c.currentTime+.08);g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.12,c.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.35);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+.4);}catch(e){}}
 const led=document.getElementById('ledger');
 if(led){pig();setTimeout(pig,1500);new MutationObserver(()=>{const h=document.querySelector('#ledger h2');if(h&&(!h.querySelector('.pig')||h.querySelector('.jp-deco')))pig();}).observe(led,{childList:true,subtree:true});
  led.addEventListener('click',e=>{const p=e.target.closest('#ledger h2 .pig');if(!p)return;p.classList.remove('munch');void p.offsetWidth;p.classList.add('munch');const s=spentJPY();toast(s?`小豬吃了 ¥${Math.round(s).toLocaleString()}，好飽`:'小豬好餓，記一筆帳餵牠');});
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
