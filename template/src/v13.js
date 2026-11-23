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
 let motionAsked=false,lastA=null;
 function onMotion(e){const a=e.accelerationIncludingGravity||e.acceleration;if(!a)return;const v=[a.x||0,a.y||0,a.z||0];
  if(lastA){const d=Math.abs(v[0]-lastA[0])+Math.abs(v[1]-lastA[1])+Math.abs(v[2]-lastA[2]);if(d>22&&Date.now()-lastShake>700){lastShake=Date.now();shakeFns.forEach(f=>f());}}lastA=v;}
 function askMotion(){if(motionOK)return Promise.resolve(true);
  const DM=window.DeviceMotionEvent;if(!DM)return Promise.resolve(false);
  if(typeof DM.requestPermission!=='function'){motionOK=true;window.addEventListener('devicemotion',onMotion);return Promise.resolve(true);}
  if(motionAsked&&!motionOK)return Promise.resolve(false);motionAsked=true;
  return DM.requestPermission().then(r=>{if(r==='granted'){motionOK=true;window.addEventListener('devicemotion',onMotion);document.querySelectorAll('.shake-on').forEach(x=>x.remove());toast('開好了！搖一搖手機試試看');return true;}toast('沒有開啟動作感應，可以用手指點雪景');return false;}).catch(()=>false);}
 if(window.DeviceMotionEvent&&typeof DeviceMotionEvent.requestPermission!=='function'){motionOK=true;window.addEventListener('devicemotion',onMotion);}

 /* ---------- 入口：旅途小遊戲 ---------- */
 function funRow(){const fp=document.getElementById('footprints');if(!fp)return;if(fp.querySelector('.fun-row'))return;
  const h=fp.querySelector('h2');if(h)[...h.childNodes].forEach(n=>{if(n.nodeType===3&&/點亮北海道/.test(n.textContent))n.textContent='北海道遊樂園';});
  const row=document.createElement('div');row.className='fun-row';
  const B=(g,ic,t,bg,id)=>`<button type="button" class="fun-b" data-g="${g}" style="--bg:${bg}"><span class="fun-c">${ic}<em class="fun-badge" id="${id}" hidden></em></span><b>${t}</b></button>`;
  row.innerHTML=`<p class="fun-t">✦ 點一下玩玩看 ✦</p><div class="fun-btns">${B('omi',OMI_IC(),'御神籤','#FDE3E3','gOmiSub')}${B('gacha',GACHA_IC(),'拍照扭蛋','#E4F0FA','gGachaSub')}${B('album',ALB_IC(),'旅途相冊','#E6F3E2','gAlbumSub')}${B('book',BOOK_IC(),'蓋章簿','#FFF1C9','gBookSub')}${B('pig',PIG_IC(),'存錢小豬','#FBE4EC','gPigSub')}</div>`;
  const card=fp.querySelector('.fp-card');(card||h).after(row);
  row.addEventListener('click',e=>{const b=e.target.closest('[data-g]');if(!b)return;const k=b.dataset.g;
   if(!RM){b.classList.remove('boing');void b.offsetWidth;b.classList.add('boing');}
   ({omi:omikuji,album:album,gacha:gacha,book:stampBook,pig:pigTap})[k]();});}
 const badge=(id,t)=>{const e=document.getElementById(id);if(!e)return;e.hidden=!t;e.textContent=t||'';};
 function BOOK_IC(){return '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="7" y="6" width="26" height="30" rx="3" fill="#F6C98B" stroke="#5B4B43" stroke-width="2"/><path d="M11 6v30" stroke="#5B4B43" stroke-width="1.6"/><rect x="15" y="11" width="14" height="7" rx="1.5" fill="#FFFDF6" stroke="#5B4B43" stroke-width="1.3"/><circle cx="22" cy="27" r="5" fill="none" stroke="#E07B6E" stroke-width="2"/><circle cx="22" cy="27" r="1.6" fill="#E07B6E"/></svg>';}
 function PIG_IC(){return '<svg viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="19" cy="22" rx="13" ry="10" fill="#F7C6CF" stroke="#5B4B43" stroke-width="2"/><path d="M12 14l-2-5 5 3M24 12l3-4 1 5" fill="#F7C6CF" stroke="#5B4B43" stroke-width="1.8" stroke-linejoin="round"/><rect x="15" y="11.5" width="7" height="2" rx="1" fill="#5B4B43"/><ellipse cx="31" cy="23" rx="3.6" ry="3.2" fill="#F2A9B7" stroke="#5B4B43" stroke-width="1.6"/><circle cx="25" cy="19" r="1.1" fill="#5B4B43"/><path d="M12 31v3M17 32v3M23 32v3M27 31v3" stroke="#5B4B43" stroke-width="2.4" stroke-linecap="round"/><circle cx="20" cy="4.5" r="3" fill="#FFD86B" stroke="#B98A3E" stroke-width="1.3"/></svg>';}
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
 function omiSub(){const o=get(OK,{})[jpDate()];badge('gOmiSub',o?(o.tied?'綁好':o.lv):'NEW');}
 /* 籤紙：紅色版畫風（雪丸＋格紋＋運勢直書＋五格小籤） */
 const POEM={'大吉':[['雪落北國福滿門','蟹肥湯暖好時辰','今朝萬事皆如意','吃到撐也不心疼'],['白雪紛飛映笑顏','企鵝列隊來相迎','一路順風皆大吉','好運滿滿到天明']],
  '中吉':[['慢行雪路莫心急','轉角自有好風景','熱湯一碗暖心頭','小小幸福隨身行'],['市場海鮮正當時','運河燈影映雙人','莫問前路有多遠','有吃有玩就是福']],
  '小吉':[['天寒記得多加衣','小確幸在路邊棲','抬頭看看雪中景','慢慢走也很美麗']],
  '吉':[['平平安安出門去','開開心心回家來','不求大富與大貴','只求今晚吃得好']],
  '末吉':[['早上睡眼還矇矓','午後漸漸好運來','晚餐一口好滋味','先苦後甜最開懷']],
  '凶':[['風雪雖大莫驚慌','綁好籤紙轉運忙','今日小凶明日吉','燒肉一吃全忘光']]};
 const FOOD=['吃到第三碗才算數','甜點有另一個胃','排隊的店今天很快','海鮮會特別鮮甜','宵夜才是今天重點','大方點第二份吧','熱湯先喝一口再說','便利商店有驚喜'];
 const SHOT=['逆光拍會很美','跟雪人合照大吉','今天特別上相','抓到企鵝回頭','自拍角度往上抬','背影照很有故事','雪花入鏡加分','兩人比愛心必拍'];
 const VMAP={'（':'︵','）':'︶','(':'︵',')':'︶','「':'﹁','」':'﹂','…':'︙','ー':'｜','—':'｜','-':'｜','~':'≀','～':'≀'};
 const vch=c=>VMAP[c]||c;
 /* 籤紙變化：顏色 × 花紋 × 主角，版面不變 */
 const PAL=[['#D9474F','#F9D5D6','#FFF6F4'],['#E0739A','#FBDCE7','#FFF6F9'],['#4F8DC2','#D6E7F5','#F6FAFD'],['#3F9A86','#D3EDE6','#F5FBF9'],['#8A6CC0','#E5DCF4','#FAF7FE'],['#E08A3A','#FBE3C9','#FFF9F2'],['#C9A23A','#F5E8B8','#FFFBEE']];
 const PATS=[
  (I,L,P,id)=>`<pattern id="${id}" width="36" height="36" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="36" height="36" fill="${P}"/><rect width="18" height="18" fill="${L}"/><rect x="18" y="18" width="18" height="18" fill="${L}"/></pattern>`,
  (I,L,P,id)=>`<pattern id="${id}" width="32" height="20" patternUnits="userSpaceOnUse"><rect width="32" height="20" fill="${P}"/><g fill="none" stroke="${L}" stroke-width="2.4"><path d="M-16 20a16 16 0 0 1 32 0M16 20a16 16 0 0 1 32 0M0 10a16 16 0 0 1 32 0"/><path d="M-10 20a10 10 0 0 1 20 0M22 20a10 10 0 0 1 20 0M6 10a10 10 0 0 1 20 0"/></g></pattern>`,
  (I,L,P,id)=>`<pattern id="${id}" width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="${P}"/><circle cx="6.5" cy="6.5" r="4.2" fill="${L}"/><circle cx="19.5" cy="19.5" r="4.2" fill="${L}"/></pattern>`,
  (I,L,P,id)=>`<pattern id="${id}" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="${P}"/><g stroke="${L}" stroke-width="2.2" stroke-linecap="round"><path d="M15 6v18M7 10.5l16 9M7 19.5l16-9"/></g><circle cx="0" cy="0" r="2" fill="${L}"/><circle cx="30" cy="30" r="2" fill="${L}"/></pattern>`,
  (I,L,P,id)=>`<pattern id="${id}" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><rect width="24" height="24" fill="${P}"/><rect width="10" height="24" fill="${L}"/></pattern>`,
  (I,L,P,id)=>`<pattern id="${id}" width="28" height="48" patternUnits="userSpaceOnUse"><rect width="28" height="48" fill="${P}"/><g fill="none" stroke="${L}" stroke-width="2.2"><path d="M0 12L14 0 28 12M0 12L14 24 28 12M0 36L14 24 28 36M0 36L14 48 28 36"/><path d="M14 0v48M0 12h28M0 36h28"/></g></pattern>`,
  (I,L,P,id)=>`<pattern id="${id}" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="${P}"/><g fill="${L}">${[0,72,144,216,288].map(a=>`<circle cx="${(10+Math.sin(a*Math.PI/180)*4.4).toFixed(1)}" cy="${(10-Math.cos(a*Math.PI/180)*4.4).toFixed(1)}" r="3.6"/>`).join('')}${[0,72,144,216,288].map(a=>`<circle cx="${(30+Math.sin(a*Math.PI/180)*4.4).toFixed(1)}" cy="${(30-Math.cos(a*Math.PI/180)*4.4).toFixed(1)}" r="3.6"/>`).join('')}</g></pattern>`];
 const W='#fff';
 const CHARS=[
  I=>`<path d="M28 18c26 6 54 20 70 36" stroke="#fff" stroke-width="16" stroke-linecap="round" fill="none"/><path d="M28 18c26 6 54 20 70 36" stroke="${I}" stroke-width="9" stroke-linecap="round" fill="none"/><ellipse rx="62" ry="56" fill="#fff"/><ellipse rx="56" ry="50" fill="${I}"/><path d="M-52 2c-18 4-26 18-22 30 12-4 22-14 24-26Z M52 2c18 4 26 18 22 30-12-4-22-14-24-26Z" fill="${I}" stroke="#fff" stroke-width="4" paint-order="stroke"/><circle cx="-18" cy="-6" r="8" fill="#fff"/><circle cx="18" cy="-6" r="8" fill="#fff"/><circle cx="-18" cy="-6" r="3.4" fill="${I}"/><circle cx="18" cy="-6" r="3.4" fill="${I}"/><path d="M-7 6h14L0 15Z" fill="#fff"/><ellipse cx="-34" cy="12" rx="8" ry="4.5" fill="#fff" opacity=".55"/><ellipse cx="34" cy="12" rx="8" ry="4.5" fill="#fff" opacity=".55"/><path d="M-16 -50c4-12 14-14 16-4 4-10 14-8 14 4" fill="${I}" stroke="#fff" stroke-width="3" paint-order="stroke"/>`,
  I=>`<ellipse cy="4" rx="54" ry="62" fill="#fff"/><ellipse cy="4" rx="48" ry="56" fill="${I}"/><ellipse cy="16" rx="32" ry="38" fill="#fff"/><path d="M-48 0c-16 10-20 26-14 36 10-6 16-18 16-30Z M48 0c16 10 20 26 14 36-10-6-16-18-16-30Z" fill="${I}" stroke="#fff" stroke-width="4" paint-order="stroke"/><circle cx="-15" cy="-18" r="6" fill="#fff"/><circle cx="15" cy="-18" r="6" fill="#fff"/><circle cx="-15" cy="-18" r="2.8" fill="${I}"/><circle cx="15" cy="-18" r="2.8" fill="${I}"/><path d="M-8 -8h16L0 2Z" fill="${I}"/><ellipse cx="-24" cy="2" rx="6" ry="3.5" fill="${I}" opacity=".35"/><ellipse cx="24" cy="2" rx="6" ry="3.5" fill="${I}" opacity=".35"/>`,
  I=>`<g stroke="#fff" stroke-width="4" paint-order="stroke"><path d="M-46 -6c-22-10-32-34-22-46 6 10 18 10 22 2 4 14-2 30 0 44Z M46 -6c22-10 32-34 22-46-6 10-18 10-22 2-4 14 2 30 0 44Z" fill="${I}"/><path d="M-40 34l-24 18M-34 42l-18 22M40 34l24 18M34 42l18 22" stroke="${I}" stroke-width="7" stroke-linecap="round"/></g><ellipse cy="10" rx="56" ry="42" fill="#fff"/><ellipse cy="10" rx="50" ry="36" fill="${I}"/><circle cx="-16" cy="-36" r="11" fill="#fff" stroke="${I}" stroke-width="5"/><circle cx="16" cy="-36" r="11" fill="#fff" stroke="${I}" stroke-width="5"/><circle cx="-16" cy="-36" r="4" fill="${I}"/><circle cx="16" cy="-36" r="4" fill="${I}"/><path d="M-16 -25v10M16 -25v10" stroke="${I}" stroke-width="5"/><path d="M-16 14q16 12 32 0" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/><ellipse cx="-30" cy="6" rx="7" ry="4" fill="#fff" opacity=".5"/><ellipse cx="30" cy="6" rx="7" ry="4" fill="#fff" opacity=".5"/>`,
  I=>`<circle cy="24" r="44" fill="#fff"/><circle cy="24" r="38" fill="${I}"/><circle cy="-26" r="31" fill="#fff"/><circle cy="-26" r="26" fill="${I}"/><path d="M-26 -36c0-22 12-32 26-32s26 10 26 32Z" fill="#fff"/><path d="M-21 -38c0-18 9-26 21-26s21 8 21 26Z" fill="${I}"/><path d="M-27 -40h54" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M-12 -48v-8M-4 -50v-10M4 -50v-10M12 -48v-8" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/><circle cy="-70" r="9" fill="${I}" stroke="#fff" stroke-width="3.5"/><circle cx="-9" cy="-24" r="3.6" fill="#fff"/><circle cx="9" cy="-24" r="3.6" fill="#fff"/><path d="M-6 -14q6 5 12 0" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/><ellipse cx="-17" cy="-16" rx="5" ry="3" fill="#fff" opacity=".5"/><ellipse cx="17" cy="-16" rx="5" ry="3" fill="#fff" opacity=".5"/><path d="M-26 0q26 10 52 0" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M18 2l6 18" stroke="#fff" stroke-width="7" stroke-linecap="round"/><circle cy="20" r="4" fill="#fff"/><circle cy="36" r="4" fill="#fff"/><path d="M-38 16l-22-12M38 16l22-12" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="M-38 16l-22-12M38 16l22-12" stroke="${I}" stroke-width="4.5" stroke-linecap="round"/>`,
  I=>`<path d="M44 40c26 4 34-20 22-30" stroke="#fff" stroke-width="16" stroke-linecap="round" fill="none"/><path d="M44 40c26 4 34-20 22-30" stroke="${I}" stroke-width="9" stroke-linecap="round" fill="none"/>
   <path d="M-52 -14L-46 -64-12 -44Z M52 -14L46 -64 12 -44Z" fill="${I}" stroke="#fff" stroke-width="8" stroke-linejoin="round" paint-order="stroke"/>
   <path d="M-42 -26L-40 -52-22 -42Z M42 -26L40 -52 22 -42Z" fill="#fff" opacity=".75"/>
   <ellipse cy="8" rx="62" ry="52" fill="#fff"/><ellipse cy="8" rx="56" ry="46" fill="${I}"/>
   <path d="M-30 -2q8-9 16 0M14 -2q8-9 16 0" stroke="#fff" stroke-width="4.5" stroke-linecap="round" fill="none"/>
   <path d="M-5 12h10L0 18Z" fill="#fff"/><path d="M0 18v4M-8 24q4 4 8 0 4 4 8 0" stroke="#fff" stroke-width="2.6" stroke-linecap="round" fill="none"/>
   <path d="M-22 14h-26M-22 20l-24 6M22 14h26M22 20l24 6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
   <ellipse cx="-32" cy="22" rx="7" ry="4" fill="#F6B9C4"/><ellipse cx="32" cy="22" rx="7" ry="4" fill="#F6B9C4"/>
   <path d="M-12 -34l4 8M0 -36v9M12 -34l-4 8" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>`,
  I=>`<circle cx="-40" cy="-38" r="18" fill="#fff"/><circle cx="40" cy="-38" r="18" fill="#fff"/><circle cx="-40" cy="-38" r="13" fill="${I}"/><circle cx="40" cy="-38" r="13" fill="${I}"/><circle cx="-40" cy="-38" r="5" fill="#fff" opacity=".6"/><circle cx="40" cy="-38" r="5" fill="#fff" opacity=".6"/><circle cy="4" r="56" fill="#fff"/><circle cy="4" r="50" fill="${I}"/><ellipse cy="22" rx="20" ry="15" fill="#fff"/><ellipse cy="15" rx="7" ry="5" fill="${I}"/><path d="M0 20v7M-8 30q8 6 16 0" stroke="${I}" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="-20" cy="-8" r="5.5" fill="#fff"/><circle cx="20" cy="-8" r="5.5" fill="#fff"/><ellipse cx="-34" cy="12" rx="7" ry="4" fill="#fff" opacity=".5"/><ellipse cx="34" cy="12" rx="7" ry="4" fill="#fff" opacity=".5"/>`,
  I=>`<g stroke="#fff" stroke-width="4" paint-order="stroke"><path d="M-44 -30c-18-2-28-12-26-20 12 0 22 6 28 12Z M44 -30c18-2 28-12 26-20-12 0-22 6-28 12Z" fill="${I}"/><path d="M-28 -46c-4-12 0-20 6-22 2 8 0 16-2 22Z M28 -46c4-12 0-20-6-22-2 8 0 16 2 22Z" fill="#fff" stroke="${I}" stroke-width="3"/></g><ellipse cy="0" rx="52" ry="50" fill="#fff"/><ellipse cy="0" rx="46" ry="44" fill="#fff" stroke="${I}" stroke-width="4"/><path d="M-30 -34c10-6 20-2 22 8-8 8-20 6-26 0Z M22 -12c8-6 18-2 20 6-6 6-16 6-20-6Z" fill="${I}"/><circle cx="-16" cy="-4" r="5" fill="${I}"/><circle cx="16" cy="-4" r="5" fill="${I}"/><ellipse cy="26" rx="30" ry="18" fill="${I}"/><ellipse cx="-10" cy="26" rx="4" ry="5" fill="#fff"/><ellipse cx="10" cy="26" rx="4" ry="5" fill="#fff"/><ellipse cx="-34" cy="8" rx="6" ry="3.5" fill="${I}" opacity=".35"/><ellipse cx="34" cy="8" rx="6" ry="3.5" fill="${I}" opacity=".35"/>`,
  I=>`<path d="M-64 26c-10 4-14 14-10 20 10-2 18-10 18-18Z M64 26c10 4 14 14 10 20-10-2-18-10-18-18Z" fill="${I}" stroke="#fff" stroke-width="4" paint-order="stroke"/><ellipse cy="8" rx="66" ry="50" fill="#fff"/><ellipse cy="8" rx="60" ry="44" fill="${I}"/><circle cx="-20" cy="-4" r="7" fill="#fff"/><circle cx="20" cy="-4" r="7" fill="#fff"/><circle cx="-19" cy="-3" r="3.4" fill="${I}"/><circle cx="21" cy="-3" r="3.4" fill="${I}"/><ellipse cy="14" rx="15" ry="10" fill="#fff"/><ellipse cy="9" rx="5" ry="3.4" fill="${I}"/><path d="M-6 16q6 5 12 0" stroke="${I}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M-14 14h-16M-14 18l-14 4M14 14h16M14 18l14 4" stroke="#fff" stroke-width="2" stroke-linecap="round"/><ellipse cx="-38" cy="14" rx="7" ry="4" fill="#fff" opacity=".5"/><ellipse cx="38" cy="14" rx="7" ry="4" fill="#fff" opacity=".5"/>`
 ];
 const varOf=f=>{const n=f.no;return {pal:f.lv==='凶'?['#6E86A3','#DCE6F0','#F6F9FC']:PAL[(n*3)%PAL.length],pat:(n*5+1)%PATS.length,ch:(n*3+Math.floor(n/8))%CHARS.length};};
 function slipSVG(f){
  const VV=varOf(f),[ink,inkL,paper]=VV.pal;
  const P=(POEM[f.lv]||POEM['吉']),poem=P[f.no%P.length];
  const cats=[['宜',f.yi[0]],['忌',f.ji],['食運',FOOD[f.no%FOOD.length]],['拍照',SHOT[(f.no*7+3)%SHOT.length]],['幸運',f.lu]];
  const V=(t,x,y,fs,step,max,colGap,anchorFill)=>{
   /* 直書不放括號和逗號（直排時位置會歪）：括號拿掉，逗號變成空一格 */
   const ch=[...String(t).replace(/\s/g,'').replace(/[）)」]/g,'').replace(/[（(「]/g,'，').replace(/[，、。,]+$/,'').replace(/^[，、。,]+/,'').replace(/[，、。,]+/g,'　')].map(vch);let o='';
   ch.forEach((c,i)=>{if(c==='　')return;const col=Math.floor(i/max),row=i%max;o+=`<text x="${x-col*colGap}" y="${y+row*step}" font-size="${fs}" text-anchor="middle" fill="${anchorFill}">${esc(c)}</text>`;});return o;};
  const poemSvg=poem.map((ln,i)=>V(ln,252-i*46,322,22,25.5,7,0,ink)).join('');
  const catSvg=cats.map(([k,v],i)=>{const x=316-i*68;const lab=k.length>1?`<text x="${x}" y="${541}" font-size="12.5" font-weight="900" text-anchor="middle" fill="#fff" letter-spacing="-.5">${k}</text>`:`<text x="${x}" y="${543}" font-size="16" font-weight="900" text-anchor="middle" fill="#fff">${k}</text>`;
   return `<path d="M${x} ${512}c-3 6-16 9-16 22a16 14 0 0 0 32 0c0-13-13-16-16-22Z" fill="${ink}"/><path d="M${x-9} ${526}q9-5 18 0" stroke="#fff" stroke-width="1.6" fill="none" opacity=".7"/>${lab}${V(v,x+8,570,14,15.2,8,16,ink)}`;}).join('');
  const plum=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" stroke="${ink}" stroke-width="1.6">${[0,72,144,216,288].map(a=>`<circle cx="${(Math.sin(a*Math.PI/180)*7).toFixed(1)}" cy="${(-Math.cos(a*Math.PI/180)*7).toFixed(1)}" r="6"/>`).join('')}<circle r="3.4" fill="${inkL}"/><path d="M0 0l0-4M0 0l3.5 2M0 0l-3.5 2" stroke="${ink}" stroke-width="1"/></g>`;
  const rays=[-62,-40,-18,18,40,62].map(a=>{const r=a*Math.PI/180;return `<path d="M${(180+Math.sin(r)*88).toFixed(1)} ${(122-Math.cos(r)*88).toFixed(1)}L${(180+Math.sin(r)*104).toFixed(1)} ${(122-Math.cos(r)*104).toFixed(1)}" stroke="${ink}" stroke-width="7" stroke-linecap="round"/>`;}).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 720" font-family="'Huninn','PingFang TC','Noto Sans TC','Hiragino Sans',sans-serif" font-weight="900">
   <defs>${PATS[VV.pat](ink,inkL,paper,'ckr'+f.no)}
   <filter id="grn${f.no}"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -.45 1.1"/><feComposite in="SourceGraphic" operator="in"/></filter>
   <clipPath id="hdr${f.no}"><rect x="26" y="40" width="308" height="160"/></clipPath></defs>
   <rect width="360" height="720" rx="18" fill="${paper}"/>
   <g filter="url(#grn${f.no})">
   <rect x="9" y="9" width="342" height="702" rx="12" fill="none" stroke="${ink}" stroke-width="5"/><rect x="18" y="18" width="324" height="684" rx="6" fill="none" stroke="${ink}" stroke-width="1.6"/>
   <circle cx="180" cy="28" r="6" fill="#fff" stroke="${ink}" stroke-width="1.6"/>
   <g clip-path="url(#hdr${f.no})"><rect x="26" y="40" width="308" height="160" fill="url(#ckr${f.no})" opacity=".85"/></g>
   ${rays}
   <g transform="translate(180 128)">${CHARS[VV.ch](ink)}</g>
   <g transform="translate(272 50)"><rect width="54" height="54" rx="8" fill="${ink}" stroke="#fff" stroke-width="3"/><rect x="5" y="5" width="44" height="44" rx="4" fill="none" stroke="#fff" stroke-width="1.4"/><text x="27" y="25" font-size="15" text-anchor="middle" fill="#fff">北海</text><text x="27" y="43" font-size="15" text-anchor="middle" fill="#fff">道籤</text></g>
   <rect x="26" y="206" width="308" height="74" fill="${ink}"/>
   <g stroke="#fff" stroke-width="1" opacity=".22" fill="none">${Array.from({length:9},(_,k)=>`<path d="M${30+k*36} 280a18 18 0 0 1 36 0M${30+k*36} 268a18 18 0 0 1 36 0"/>`).join('')}</g>
   ${plum(52,226,1)}${plum(74,256,.85)}${plum(308,238,1)}
   <text x="180" y="263" font-size="${f.lv.length>1?54:62}" text-anchor="middle" fill="#fff" letter-spacing="6">${f.lv}</text>
   <g transform="translate(312 330)"><path d="M0 -26L24 0 0 26-24 0Z" fill="${ink}" stroke="#fff" stroke-width="2.5"/><text x="0" y="8" font-size="22" text-anchor="middle" fill="#fff">運</text></g>
   <g transform="translate(312 384)"><path d="M0 -26L24 0 0 26-24 0Z" fill="${ink}" stroke="#fff" stroke-width="2.5"/><text x="0" y="8" font-size="22" text-anchor="middle" fill="#fff">勢</text></g>
   <path d="M36 494H324" stroke="${ink}" stroke-width="3.4" stroke-linecap="round" stroke-dasharray=".1 9"/>
   </g>
   <g text-rendering="geometricPrecision">
   ${poemSvg}
   ${V(`第${kanji(f.no)}番`,48,320,15,19,9,0,ink)}
   ${catSvg}
   <text x="180" y="696" font-size="11.5" text-anchor="middle" fill="${ink}" opacity=".8" letter-spacing="2">北海道雪日記・${f.t.slice(5).replace('-','/')}・明天再來抽</text>
   </g></svg>`;}
 function slip(f){return `<div class="omi-slip omi-slip2 lv-${f.lv}" role="img" aria-label="${esc(`第${f.no}番 ${f.lv}：${f.msg}。宜：${f.yi[0]}；忌：${f.ji}；幸運小物：${f.lu}`)}">${slipSVG(f)}<p class="omi-msg2">${esc(f.msg)}</p></div>`;}
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
  try{const svg=slipSVG(f).replace('<svg ','<svg width="1080" height="2160" ');const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));const img=new Image();img.src=url;await img.decode();
   const c=document.createElement('canvas');c.width=1080;c.height=2160;const x=c.getContext('2d');x.drawImage(img,0,0,1080,2160);URL.revokeObjectURL(url);
   const blob=await new Promise(r=>c.toBlob(r,'image/png'));const file=new File([blob],`omikuji-${f.t}.png`,{type:'image/png'});
   try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'今日御神籤',text:`我今天抽到「${f.lv}」！`});return;}}catch(e){return;}
   const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000);toast('已存成圖片');
  }catch(e){toast('這支手機無法直接存圖，請用截圖分享');}}
 window.hkPreviewOmi=(lv,no)=>{const f=Object.assign({},fortune());if(no)f.no=no;f.lv=lv||'大吉';f.msg=(LV.find(l=>l[0]===f.lv)||LV[0])[2][0];open('<div class="cs-panel g-panel"><h3>今日御神籤</h3><div class="omi-stage"></div><div class="cs-btns"><button type="button" class="g-close g-x">關閉</button></div></div>');show(f,true);};
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
 function gachaSub(){const g=gs();const n=Object.keys(g.done).length;badge('gGachaSub',n?String(n):'');pAll().then(o=>badge('gAlbumSub',Object.keys(o).length?String(Object.keys(o).length):'')).catch(()=>{});}
 function pick(k){const g=gs(),L=PK(k);const all=L.map((_,i)=>k+i);const left=all.filter(id=>!g.done[id]&&id!==g.last[k]);const pool=left.length?left:all.filter(id=>id!==g.last[k]);const id=pool[Math.floor(Math.random()*pool.length)];g.last[k]=id;put(GK,g);return id;}
 /* 扭蛋機：玻璃大肚＋北海道小物扭蛋，要先投 ¥100 */
 const IT={
  penguin:'<ellipse cx="0" cy="1" rx="6.5" ry="8" fill="#4A4E63"/><ellipse cx="0" cy="3" rx="4.2" ry="5.5" fill="#fff"/><circle cx="-1.8" cy="-2.5" r=".9" fill="#fff"/><circle cx="1.8" cy="-2.5" r=".9" fill="#fff"/><path d="M-1.2 -.8h2.4L0 .8Z" fill="#F2B544"/>',
  crab:'<ellipse cx="0" cy="2" rx="7" ry="4.6" fill="#E9806C"/><circle cx="-2.5" cy="-2.6" r="1.6" fill="#fff" stroke="#5B4B43" stroke-width=".6"/><circle cx="2.5" cy="-2.6" r="1.6" fill="#fff" stroke="#5B4B43" stroke-width=".6"/><path d="M-7 0l-2.5-3M7 0l2.5-3" stroke="#E9806C" stroke-width="2" stroke-linecap="round"/>',
  snowman:'<circle cx="0" cy="3.5" r="5" fill="#fff" stroke="#9BB3C8" stroke-width=".7"/><circle cx="0" cy="-3.3" r="3.6" fill="#fff" stroke="#9BB3C8" stroke-width=".7"/><path d="M-3.4 -.5h6.8" stroke="#E07B6E" stroke-width="1.4"/><path d="M-3 -6.2h6l-1-3h-4Z" fill="#7FA6D6"/>',
  fox:'<path d="M-6.5 -5l2.5 7h8l2.5-7-4.5 2.5h-4Z" fill="#F0B27A"/><path d="M-4 2l4 4.5L4 2Z" fill="#fff"/><circle cx="-2" cy="0" r=".8" fill="#5B4B43"/><circle cx="2" cy="0" r=".8" fill="#5B4B43"/>',
  icecream:'<path d="M-3.5 0h7L0 8.5Z" fill="#E8B97A"/><path d="M-4 1C-6 -1-4-4-1.5-4 0-7.5 3.5-6.5 3-3.5 5.5-3 5.5 0 4 1Z" fill="#FFFDF6" stroke="#E3D6C9" stroke-width=".6"/>',
  ramen:'<path d="M-7 -1h14a7 6.5 0 0 1-14 0Z" fill="#E9806C"/><path d="M-5 -1.5q2.5-3 5 0t5 0" stroke="#F6D98B" stroke-width="1.4" fill="none"/><path d="M1 -2l4-6M3 -2l4-6" stroke="#B98A5A" stroke-width=".9"/>',
  melon:'<path d="M-7 0a7 7 0 0 0 14 0Z" fill="#9CCB86"/><path d="M-5.6 0a5.6 5.6 0 0 0 11.2 0Z" fill="#F7B06A"/><path d="M-2 2.4h.1M1 3.5h.1M2.8 1.6h.1" stroke="#5B4B43" stroke-width="1" stroke-linecap="round"/>',
  daruma:'<ellipse cx="0" cy="1" rx="6" ry="7" fill="#E07B6E"/><ellipse cx="0" cy="-.5" rx="3.6" ry="3.2" fill="#FFF3E8"/><circle cx="-1.3" cy="-.8" r=".7" fill="#5B4B43"/><circle cx="1.3" cy="-.8" r=".7" fill="#5B4B43"/><path d="M-2 5h4" stroke="#F6D98B" stroke-width="1"/>',
  tower:'<path d="M-4 8V-1l4-6 4 6v9Z" fill="#C97D6A"/><path d="M-4.5 -1h9" stroke="#fff" stroke-width="1.2"/><circle cx="0" cy="2" r="2.2" fill="#fff"/><path d="M-1-4.5L0-8 1-4.5" fill="#8CC7A6"/>',
  corn:'<ellipse cx="0" cy="0" rx="3.4" ry="6.8" fill="#F6D06A"/><path d="M-3.4 4c-2 2-1 4 1 4.5L0 5M3.4 4c2 2 1 4-1 4.5L0 5" fill="#9CCB86"/>',
  bear:'<circle cx="-4.2" cy="-4.5" r="2" fill="#B98A5A"/><circle cx="4.2" cy="-4.5" r="2" fill="#B98A5A"/><circle cx="0" cy="0" r="6" fill="#B98A5A"/><ellipse cx="0" cy="2" rx="2.6" ry="2" fill="#EBD3B5"/><circle cx="-2" cy="-1.2" r=".8" fill="#5B4B43"/><circle cx="2" cy="-1.2" r=".8" fill="#5B4B43"/>',
  bird:'<ellipse cx="0" cy="1" rx="6" ry="5.2" fill="#fff" stroke="#C9BDB2" stroke-width=".6"/><path d="M5 2l6 1-6 1.4" fill="#8E7A6C"/><circle cx="-1.5" cy="0" r=".7" fill="#5B4B43"/><circle cx="1.5" cy="0" r=".7" fill="#5B4B43"/><ellipse cx="-3" cy="1.8" rx="1" ry=".6" fill="#F6B9C4"/>'};
 const ITK=Object.keys(IT);
 const capSVG=(x,y,c,it,r=15,rot=0)=>`<g transform="translate(${x} ${y}) rotate(${rot})"><circle r="${r}" fill="#FFFFFF" fill-opacity=".72"/><path d="M${-r} 0a${r} ${r} 0 0 1 ${2*r} 0Z" fill="${c}"/><g transform="scale(${(r/17).toFixed(2)})">${IT[it]}</g><path d="M${-r} 0h${2*r}" stroke="#5B4B43" stroke-width="1" opacity=".35"/><circle r="${r}" fill="none" stroke="#5B4B43" stroke-width="1.5"/><path d="M${(-r*.6).toFixed(1)} ${(-r*.5).toFixed(1)}a${(r*.75).toFixed(1)} ${(r*.75).toFixed(1)} 0 0 1 ${(r*.45).toFixed(1)} ${(-r*.32).toFixed(1)}" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/></g>`;
 function machine(){
  const rows=[[134,[34,61,88,115,142,169,192]],[111,[47,74,101,128,155,182]],[88,[60,87,114,141,168]],[66,[86,113,140]]];
  let j=0;const caps=rows.map(([y,xs])=>xs.map(x=>{const k=j++;return capSVG(x+(k%3-1)*1.5,y+(k%2)*1.5,COL[(k*5)%6],ITK[(k*7)%ITK.length],13,(k*37)%50-25);}).join('')).join('');
  const bowl='M20 38h180c6 0 10 18 10 52s-6 56-14 58H24c-8-2-14-24-14-58s4-52 10-52Z';
  return `<div class="gm" id="gaMachine"><svg class="gm-svg" viewBox="0 0 220 256" aria-hidden="true">
   <defs><clipPath id="gmBowl"><path d="${bowl}"/></clipPath>
    <linearGradient id="gmGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#BFD9F2" stop-opacity=".35"/></linearGradient>
    <linearGradient id="gmBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0B3C2"/><stop offset="1" stop-color="#E496AA"/></linearGradient></defs>
   <ellipse cx="110" cy="250" rx="96" ry="5" fill="#E8DCD0" opacity=".7"/>
   <path d="${bowl}" fill="#EEF6FC"/>
   <g clip-path="url(#gmBowl)"><g class="ga-caps">${caps}</g>
    <g fill="#fff" opacity=".9"><circle cx="40" cy="58" r="1.8"/><circle cx="182" cy="52" r="1.4"/><circle cx="160" cy="70" r="1.1"/></g>
    <path d="M190 46v7M186.5 49.5h7M187.5 47l5 5M192.5 47l-5 5" stroke="#9BB3C8" stroke-width="1.1" stroke-linecap="round"/>
    <rect x="0" y="30" width="220" height="130" fill="url(#gmGlass)"/></g>
   <path d="M28 52c-6 14-7 44-1 66" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".85"/><path d="M38 48c-2 4-3 8-3 12" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".7"/>
   <path d="${bowl}" fill="none" stroke="#5B4B43" stroke-width="2.4"/>
   <rect x="14" y="22" width="192" height="18" rx="9" fill="url(#gmBody)" stroke="#5B4B43" stroke-width="2.4"/><path d="M148 28h44" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/>
   <rect x="26" y="146" width="168" height="98" rx="12" fill="url(#gmBody)" stroke="#5B4B43" stroke-width="2.4"/>
   <path d="M34 152h152" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".5"/>
   <rect x="38" y="158" width="48" height="26" rx="5" fill="#A9CBE6" stroke="#5B4B43" stroke-width="1.6"/><text x="62" y="169" text-anchor="middle" font-size="8" font-weight="900" fill="#fff">ほっかい</text><text x="62" y="179.5" text-anchor="middle" font-size="8" font-weight="900" fill="#fff">ガチャ</text>
   <g class="gm-knob"><circle cx="110" cy="198" r="24" fill="#A9CBE6" stroke="#5B4B43" stroke-width="2.4"/><path d="M92 188a20 20 0 0 1 10-10M128 208a20 20 0 0 1-10 10" stroke="#F6D98B" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="110" cy="198" r="15" fill="#E58FA6" stroke="#5B4B43" stroke-width="2"/><rect x="104" y="184" width="12" height="28" rx="5" fill="#F3BCCA" stroke="#5B4B43" stroke-width="1.6"/></g>
   <circle cx="168" cy="168" r="10" fill="#E4E4E8" stroke="#5B4B43" stroke-width="1.8"/><rect x="163" y="166.5" width="10" height="3" rx="1.5" fill="#5B4B43"/>
   <rect x="160" y="184" width="16" height="40" rx="8" fill="#F6D98B" stroke="#5B4B43" stroke-width="1.6"/><text x="168" y="198" text-anchor="middle" font-size="7.5" font-weight="900" fill="#8A6A2E">¥</text><text x="168" y="208" text-anchor="middle" font-size="6.5" font-weight="900" fill="#8A6A2E">100</text><path d="M165 215l3-3 3 3" stroke="#8A6A2E" stroke-width="1.2" fill="none"/>
   <path d="M44 244v-14a20 20 0 0 1 40 0v14Z" fill="#C9677F" stroke="#5B4B43" stroke-width="2.2"/><rect x="40" y="240" width="48" height="6" rx="3" fill="#F6D98B" stroke="#5B4B43" stroke-width="1.4"/>
   <path d="M30 240v10M190 240v10" stroke="#5B4B43" stroke-width="5" stroke-linecap="round"/>
  </svg>
  <button type="button" class="gm-coin" id="gmCoin" aria-label="撿起 100 日圓投進去"><span>¥100</span></button>
  <button type="button" class="gm-knob-hit" id="gmKnob" aria-label="轉轉鈕"></button>
  <div class="gm-drop" id="gmDrop"></div></div>`;}
 let paid=false;
 function knobTo(a){const k=document.querySelector('#gaMachine .gm-knob');if(k)k.setAttribute('transform',`rotate(${a.toFixed(1)} 110 198)`);}
 function knobAnim(from,to,ms,ease,done){const t0=performance.now();const f=t=>{const p=Math.min(1,(t-t0)/ms);knobTo(from+(to-from)*ease(p));if(p<1)requestAnimationFrame(f);else done&&done();};requestAnimationFrame(f);}
 const easeIO=p=>p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
 const wobble=p=>Math.sin(p*Math.PI*4)*(1-p);
 function chink(){try{const C=window.AudioContext||window.webkitAudioContext;const c=chink.c||(chink.c=new C());[2637,3520].forEach((h,k)=>{const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=h;const t=c.currentTime+k*.07;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.09,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.25);o.connect(g).connect(c.destination);o.start(t);o.stop(t+.3);});}catch(e){}}
 function clicks(){try{const C=window.AudioContext||window.webkitAudioContext;const c=chink.c||(chink.c=new C());for(let k=0;k<5;k++){const o=c.createOscillator(),g=c.createGain();o.type='square';o.frequency.value=180;const t=c.currentTime+k*.16;g.gain.setValueAtTime(.05,t);g.gain.exponentialRampToValueAtTime(.0001,t+.04);o.connect(g).connect(c.destination);o.start(t);o.stop(t+.05);}}catch(e){}}
 function gacha(){paid=false;
  open(`<div class="cs-panel g-panel" role="dialog" aria-modal="true" aria-label="拍照扭蛋"><h3>北海道拍照扭蛋</h3>
   <div class="ga-stage">${machine()}</div>
   <p class="g-hint" id="gaHint">① 地上有一枚 ¥100，撿起來拖進投幣口</p><div id="gaCard"></div>
   <button type="button" class="ga-alb" id="gaAlb">打開旅途相冊</button>
   <div class="cs-btns"><button type="button" class="g-close g-x">關閉</button></div></div>`);
  $('#gaAlb').addEventListener('click',album);
  setupCoin();$('#gmKnob').addEventListener('click',spin);
 }
 function slotPos(){const m=$('#gaMachine'),r=m.getBoundingClientRect(),k=r.width/220;return {x:r.left+168*k,y:r.top+166*k,k};}
 function setupCoin(){const coin=$('#gmCoin');if(!coin)return;let sx=0,sy=0,drag=false,moved=0;
  const insert=()=>{if(paid)return;paid=true;const m=$('#gaMachine'),s=slotPos(),r=coin.getBoundingClientRect(),mr=m.getBoundingClientRect();
   coin.style.transition='transform .35s cubic-bezier(.5,0,.7,1), opacity .2s .3s';coin.style.transform=`translate(${s.x-(r.left+r.width/2)+(parseFloat(coin.dataset.dx||0))}px,${s.y-(r.top+r.height/2)+(parseFloat(coin.dataset.dy||0))}px) rotateY(80deg) scale(.6)`;coin.style.opacity='0';
   setTimeout(()=>{chink();m.classList.add('paid');$('#gaHint').textContent='② 轉一下轉鈕！';if(navigator.vibrate)navigator.vibrate(15);},RM?0:340);};
  coin.addEventListener('pointerdown',e=>{if(paid)return;drag=true;moved=0;sx=e.clientX;sy=e.clientY;coin.setPointerCapture&&coin.setPointerCapture(e.pointerId);coin.style.transition='none';coin.classList.add('lift');coin.classList.remove('fall');});
  coin.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-sx,dy=e.clientY-sy;moved=Math.abs(dx)+Math.abs(dy);coin.dataset.dx=dx;coin.dataset.dy=dy;coin.style.transform=`translate(${dx}px,${dy}px) scale(1.08)`;});
  const end=e=>{if(!drag)return;drag=false;const s=slotPos(),r=coin.getBoundingClientRect(),d=Math.hypot(r.left+r.width/2-s.x,r.top+r.height/2-s.y);
   if(moved<6||d<60*s.k+20){coin.dataset.dx=0;coin.dataset.dy=0;coin.style.transform='';requestAnimationFrame(insert);}else{coin.classList.remove('lift');coin.style.transition='transform .3s';coin.style.transform='';coin.dataset.dx=0;coin.dataset.dy=0;}};
  coin.addEventListener('pointerup',end);coin.addEventListener('pointercancel',end);
  coin.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();insert();}});}
 function spin(){const m=$('#gaMachine');if(!m||m.dataset.busy)return;
  if(!paid){if(!RM)knobAnim(0,1,500,p=>wobble(p)*14,()=>knobTo(0));const c=$('#gmCoin');if(c&&!RM){c.classList.remove('nudge');void c.offsetWidth;c.classList.add('nudge');}$('#gaHint').textContent='要先投 ¥100 喔！地上的硬幣撿起來投進去';return;}
  m.dataset.busy=1;$('#gaCard').innerHTML='';const id=pick(Math.random()<MIS.length/(MIS.length+POSE.length)?'m':'p'),c=COL[(+id.slice(1))%6],it=ITK[Math.floor(Math.random()*ITK.length)];
  const drop=()=>{const d=$('#gmDrop');d.innerHTML=`<button type="button" class="ga-cap2" aria-label="打開扭蛋"><svg viewBox="-18 -18 36 36" aria-hidden="true">${capSVG(0,0,c,it,16)}</svg></button>`;$('#gaHint').textContent='③ 點扭蛋打開！';
   d.querySelector('.ga-cap2').addEventListener('click',e=>{const b=e.currentTarget;b.classList.add('open');setTimeout(()=>{reveal(id);m.classList.remove('paid');paid=false;delete m.dataset.busy;const cn=$('#gmCoin');if(cn){cn.style.transition='none';cn.style.transform='';cn.style.opacity='';cn.classList.remove('lift');void cn.offsetWidth;cn.classList.add('fall');}
    $('#gaHint').textContent='地上又掉了一枚 ¥100，可以再轉一次';b.closest('.gm-drop').innerHTML='';},RM?0:450);},{once:true});};
  if(RM){drop();return;}clicks();m.classList.add('turn');knobAnim(0,360,950,easeIO,()=>{knobTo(0);m.classList.remove('turn');drop();});}
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
 if(hero){const wrap=hero;wrap.classList.add('snow-host');const lay=document.createElement('div');lay.className='snow-burst';lay.setAttribute('aria-hidden','true');wrap.appendChild(lay);
  let n=0;const flake=(x,big)=>{if(n>90)return;n++;const f=document.createElement('i');const s=(big?5:3)+Math.random()*6;f.style.cssText=`left:${x}%;width:${s}px;height:${s}px;--dx:${(Math.random()*40-20).toFixed(0)}px;animation-duration:${(2.2+Math.random()*2.2).toFixed(2)}s;animation-delay:${(Math.random()*.5).toFixed(2)}s`;lay.appendChild(f);f.addEventListener('animationend',()=>{f.remove();n--;});};
  const burst=(cx,k)=>{if(RM)return;for(let j=0;j<k;j++)flake(Math.max(0,Math.min(100,cx+(Math.random()*60-30))),j%4===0);};
  let lx=null,acc=0;
  wrap.addEventListener('click',()=>{askMotion();});
  wrap.addEventListener('pointerdown',e=>{lx=e.clientX;acc=0;const r=wrap.getBoundingClientRect();burst((e.clientX-r.left)/r.width*100,10);});
  wrap.addEventListener('pointermove',e=>{if(lx==null)return;acc+=Math.abs(e.clientX-lx);lx=e.clientX;if(acc>40){acc=0;const r=wrap.getBoundingClientRect();burst((e.clientX-r.left)/r.width*100,8);}});
  ['pointerup','pointercancel','pointerleave'].forEach(t=>wrap.addEventListener(t,()=>{lx=null;}));
  shakeFns.add(()=>{const r=wrap.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)burst(50,40);});
  if(!motionOK&&window.DeviceMotionEvent&&typeof DeviceMotionEvent.requestPermission==='function'){const c=document.createElement('button');c.type='button';c.className='shake-on';c.textContent='❄ 開啟搖一搖';c.addEventListener('click',e=>{e.stopPropagation();askMotion().then(ok=>{if(ok)c.remove();});});wrap.appendChild(c);}
  else if(!get('hk-snowhint-v1',0)){const h=document.createElement('span');h.className='snow-hint';h.textContent='摸一下或搖手機，雪會下更大';wrap.appendChild(h);setTimeout(()=>h.remove(),6000);put('hk-snowhint-v1',1);}
 }

 /* ---------- 4. 存錢筒 ---------- */
 const PIG='<svg viewBox="0 0 90 70" aria-hidden="true"><ellipse cx="44" cy="40" rx="32" ry="24" fill="#F7C6CF" stroke="#5B4B43" stroke-width="2.6"/><path d="M30 20l-4-10 10 6" fill="#F7C6CF" stroke="#5B4B43" stroke-width="2.4" stroke-linejoin="round"/><path d="M50 18l6-9 2 11" fill="#F7C6CF" stroke="#5B4B43" stroke-width="2.4" stroke-linejoin="round"/><rect x="34" y="17" width="16" height="4" rx="2" fill="#5B4B43"/><ellipse cx="74" cy="42" rx="8" ry="7" fill="#F2A9B7" stroke="#5B4B43" stroke-width="2.4"/><circle cx="72" cy="41" r="1.3" fill="#5B4B43"/><circle cx="76.5" cy="41" r="1.3" fill="#5B4B43"/><circle cx="60" cy="33" r="2.2" fill="#5B4B43"/><ellipse cx="62" cy="44" rx="4" ry="2.4" fill="#F29BAC" opacity=".7"/><path d="M26 60v7M38 62v6M52 62v6M62 60v7" stroke="#5B4B43" stroke-width="5" stroke-linecap="round"/><path d="M12 38c-6-2-6 6 0 4" fill="none" stroke="#5B4B43" stroke-width="2" stroke-linecap="round"/></svg>';
 /* 小豬胖瘦只看旅途中的花費：出發前已付的機票、租車、住宿不算，不然一開始就撐到最大 */
 function tripTWD(){const L=get('hk-ledger-v1',[]),S=get('hk-ledger-set-v1',{});const r=+(S.rate||0.21)||0.21;return (Array.isArray(L)?L:[]).filter(e=>!(e.t>=1763600000001&&e.t<=1763600000099)).reduce((a,e)=>a+(e.cur==='TWD'?+e.amt||0:(+e.amt||0)*r),0);}
 function spentJPY(){const L=get('hk-ledger-v1',[]),S=get('hk-ledger-set-v1',{});const rate=+(S.rate||0.21)||0.21;return (Array.isArray(L)?L:[]).reduce((a,e)=>a+(e.cur==='JPY'?+e.amt||0:(+e.amt||0)/rate),0);}
 function pig(){const h=document.querySelector('#ledger h2');if(!h)return null;let p=h.querySelector('.pig');
  if(!p){const old=h.querySelector('.jp-deco');p=document.createElement('span');p.className='pig';p.setAttribute('role','img');p.innerHTML=`<span class="pig-body">${PIG}</span>`;if(old)old.replaceWith(p);else h.appendChild(p);}
  const s=spentJPY(),tw=tripTWD();p.style.setProperty('--fat',(1+Math.min(tw/60000,1)*.35).toFixed(3));p.setAttribute('aria-label',s?`存錢筒小豬吃了 NT$${Math.round(s*(+(get('hk-ledger-set-v1',{}).rate)||0.21)).toLocaleString()}`:'存錢筒小豬，記帳就會餵牠');return p;}
 function ding(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=ding.c||(ding.c=new C());const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(1568,c.currentTime);o.frequency.setValueAtTime(2093,c.currentTime+.08);g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.12,c.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.35);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+.4);}catch(e){}}
 const led=document.getElementById('ledger');
 if(led){pig();setTimeout(pig,1500);new MutationObserver(()=>{const h=document.querySelector('#ledger h2');if(h&&(!h.querySelector('.pig')||h.querySelector('.jp-deco')))pig();}).observe(led,{childList:true,subtree:true});
  led.addEventListener('click',e=>{const p=e.target.closest('#ledger h2 .pig');if(!p)return;
   if(canSmash()){smashAsk();return;}
   p.classList.remove('munch');void p.offsetWidth;p.classList.add('munch');const s=spentJPY();(window.hkSay||toast)(p,s?`吃了 NT$${Math.round(s*(+(get('hk-ledger-set-v1',{}).rate)||0.21)).toLocaleString()}，好飽～`:'好餓…記一筆帳餵我嘛');});
  led.addEventListener('submit',()=>{const before=(get('hk-ledger-v1',[])||[]).length;setTimeout(()=>{const after=(get('hk-ledger-v1',[])||[]).length;const p=pig();if(after>before&&p){ding();setTimeout(()=>window.hkSay&&window.hkSay(p,['好吃！','謝謝餵食～','嗝～','還要還要！'][Math.floor(Math.random()*4)]),500);if(!RM){const c=document.createElement('i');c.className='pig-coin';c.textContent='¥';p.appendChild(c);p.classList.remove('munch');void p.offsetWidth;p.classList.add('munch');setTimeout(()=>c.remove(),900);}}},60);},true);}

 /* 最後一天敲破小豬：看這趟花了多少 */
 const SMK='hk-pig-smash-v1';
 const lastDay=()=>D.length?D[D.length-1].date:'9999';
 const canSmash=()=>jpDate()>=lastDay()||window.__hkPigPreview;
 function pigData(){const L=get('hk-ledger-v1',[])||[],S=get('hk-ledger-set-v1',{});const rate=+(S.rate||0.21)||0.21,A=S.a||'我',B=S.b||'陳肥肥';
  const J=e=>e.cur==='JPY'?+e.amt||0:(+e.amt||0)/rate;
  const CAT={food:['🍜','餐飲'],move:['🚗','交通'],shop:['🛍️','購物'],stay:['🏨','住宿'],ticket:['🎟️','門票'],other:['✨','其他']};
  const tot=L.reduce((a,e)=>a+J(e),0);
  const by=Object.keys(CAT).map(k=>({k,ic:CAT[k][0],n:CAT[k][1],v:L.filter(e=>(e.cat||'other')===k).reduce((a,e)=>a+J(e),0)})).filter(x=>x.v>0).sort((a,b)=>b.v-a.v);
  const sh=L.filter(e=>e.shared),shT=sh.reduce((a,e)=>a+J(e),0),pa=sh.filter(e=>e.payer==='a').reduce((a,e)=>a+J(e),0),diff=pa-shT/2;
  const big=L.slice().sort((a,b)=>J(b)-J(a))[0];
  const days={};L.forEach(e=>{if(e.day>=0)days[e.day]=(days[e.day]||0)+J(e);});const bd=Object.entries(days).sort((a,b)=>b[1]-a[1])[0];
  return {tot,rate,by,diff,A,B,n:L.length,big,bigV:big?J(big):0,bd,CAT};}
 const Y=v=>'¥'+Math.round(v).toLocaleString(),T=(v,r)=>'NT$'+Math.round(v*r).toLocaleString();
 function smashAsk(){const d=pigData();const done=get(SMK,0);
  open(`<div class="cs-panel g-panel pig-panel" role="dialog" aria-modal="true" aria-label="敲破小豬"><h3>${done?'小豬的肚子裡有…':'旅行結束了，要敲破小豬嗎？'}</h3>
   <div class="pig-stage${done?' broken still':''}" id="pigStage"><div class="pig-big">${done?`<span class="half l">${PIG}</span><span class="half r">${PIG}</span>`:PIG}</div><svg class="pig-hammer" viewBox="0 0 60 60" aria-hidden="true"><rect x="27" y="22" width="6" height="34" rx="3" fill="#D9B98A" stroke="#5B4B43" stroke-width="2"/><rect x="10" y="8" width="40" height="18" rx="6" fill="#F3B6A8" stroke="#5B4B43" stroke-width="2.4"/><path d="M14 13h8" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg></div>
   ${done?'':`<p class="g-hint">這趟一共餵了小豬 ${d.n} 筆帳</p><button type="button" class="cs-save g-go" id="pigGo">敲下去！</button>`}
   <div id="pigOut"></div>
   <div class="cs-btns"><button type="button" class="g-close g-x">關閉</button></div></div>`);
  if(done){reveal2(d,false);return;}
  $('#pigGo').addEventListener('click',()=>{$('#pigGo').remove();const st=$('#pigStage');
   const fin=()=>{put(SMK,Date.now());pigBadge();const pb=st.querySelector('.pig-big');pb.innerHTML=`<span class="half l">${PIG}</span><span class="half r">${PIG}</span>`;st.classList.add('broken');coins(st);reveal2(d,true);const p=document.querySelector('#ledger h2 .pig');if(p)p.classList.add('smashed');};
   if(RM){fin();return;}st.classList.add('swing');let k=0;const hit=()=>{k++;st.classList.remove('hit');void st.offsetWidth;st.classList.add('hit');if(navigator.vibrate)navigator.vibrate(25);if(k<3)setTimeout(hit,380);else setTimeout(fin,260);};setTimeout(hit,300);});}
 function coins(st){if(RM)return;const fx=document.createElement('div');fx.className='pig-fx';fx.innerHTML=Array.from({length:18},(_,k)=>`<i style="--x:${(k%9-4)*24+(k>8?12:0)}px;--y:${-60-(k*17)%70}px;--e:${44+(k%4)*9-(Math.abs(k%9-4)*3)}px;--d:${(k%6)*.05}s">¥</i>`).join('')+Array.from({length:5},(_,k)=>`<b style="--x:${(k-2)*30}px;--r:${(k-2)*40}deg"></b>`).join('');st.appendChild(fx);ding();setTimeout(ding,150);setTimeout(ding,300);}
 function reveal2(d,anim){const out=$('#pigOut');if(!out)return;
  const max=d.by[0]?d.by[0].v:1;
  const settle=Math.abs(d.diff)<1?'兩人剛好打平 🎉':d.diff>0?`${esc(d.B)} 要給 ${esc(d.A)} <b>${T(d.diff,d.rate)}</b>`:`${esc(d.A)} 要給 ${esc(d.B)} <b>${T(-d.diff,d.rate)}</b>`;
  out.innerHTML=`<div class="pig-res${anim?' in':''}"><small>這趟北海道一共花了</small><div class="pig-tot">${T(d.tot,d.rate)}</div><p class="pig-twd">≈ ${Y(d.tot)}</p>
   ${d.by.length?`<div class="pig-bars">${d.by.map(x=>`<div><span>${x.ic} ${x.n}</span><i style="--w:${(x.v/max*100).toFixed(1)}%"></i><b>${T(x.v,d.rate)}</b></div>`).join('')}</div>`:''}
   <ul class="pig-facts">${d.bd?`<li>花最多的一天：<b>D${+d.bd[0]+1}</b>（${T(d.bd[1],d.rate)}）</li>`:''}${d.big?`<li>最貴的一筆：<b>${esc(d.big.note||(d.CAT[d.big.cat]||d.CAT.other)[1])}</b>（${T(d.bigV,d.rate)}）</li>`:''}<li>結算：${settle}</li></ul>
   <button type="button" class="pig-glue">把小豬黏回去</button></div>`;
  out.querySelector('.pig-glue').addEventListener('click',()=>{localStorage.removeItem(SMK);pigBadge();const p=document.querySelector('#ledger h2 .pig');if(p)p.classList.remove('smashed');close();toast('小豬黏好了，繼續餵牠吧');});}
 function pigTap(){if(canSmash()||get(SMK,0)){smashAsk();return;}const v=spentJPY();
  open(`<div class="cs-panel g-panel" role="dialog" aria-modal="true" aria-label="存錢小豬"><h3>存錢小豬</h3><div class="pig-stage"><div class="pig-big" style="transform:scale(${(1+Math.min(v/150000,1)*.35).toFixed(3)})">${PIG}</div></div>
   <p class="pig-say">${v?`小豬已經吃了 <b>¥${Math.round(v).toLocaleString()}</b>`:'小豬好餓，去記帳餵牠吧'}</p><p class="g-hint">每記一筆帳就會餵牠一枚硬幣，越花越胖。<br>最後一天（2/18）可以敲破牠，看這趟一共花了多少。</p>
   <div class="cs-btns"><button type="button" class="g-close g-x">關閉</button></div></div>`);}
 function pigBadge(){badge('gPigSub',get(SMK,0)?'破':'');}
 window.hkPreviewPig=()=>{window.__hkPigPreview=1;smashAsk();};
 if(get(SMK,0)){const p=document.querySelector('#ledger h2 .pig');if(p)p.classList.add('smashed');}

 /* ---------- 5. 今日全破＋地區章 ---------- */
 const REG=[['i-clock','札幌','#E7A391'],['i-snowcap','滝野','#7FA6D6'],['i-lamp','小樽','#D9A75F'],['i-torii','神社','#E07B6E'],['i-tree','美瑛','#8CC7A6'],['i-penguin','旭山','#7FA6D6'],['i-onsen','溫泉鄉','#E39494'],['i-car','千歲','#A9B79A'],['i-plane','平安回家','#E7A391']];
 if(!document.getElementById('i-torii')){const d=document.createElement('div');d.hidden=true;d.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><symbol id="i-snowcap" viewBox="0 0 64 64"><g stroke="#4A3B33" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"><circle cx="32" cy="45" r="14" fill="#fff"/><circle cx="32" cy="24" r="10.5" fill="#fff"/><path d="M21.5 21c0-9 4.5-13 10.5-13s10.5 4 10.5 13Z" fill="#7FA6D6"/><rect x="20" y="19" width="24" height="5" rx="2.5" fill="#BFD9F2"/><circle cx="32" cy="7" r="3.4" fill="#F6B9C4"/><path d="M27 12v5M32 11v6M37 12v5" stroke="#BFD9F2" stroke-width="1.6"/><circle cx="28.3" cy="27" r="1.3" fill="#4A3B33" stroke="none"/><circle cx="35.7" cy="27" r="1.3" fill="#4A3B33" stroke="none"/><path d="M32 29l4 1.4-4 1" fill="#F2A65A" stroke-width="1.2"/><path d="M22 33.5q10 4 20 0" stroke="#E07B6E" stroke-width="3.4"/><path d="M38 34l2 6" stroke="#E07B6E" stroke-width="3.4"/><circle cx="32" cy="42" r="1.4" fill="#4A3B33" stroke="none"/><circle cx="32" cy="48" r="1.4" fill="#4A3B33" stroke="none"/><path d="M18 41l-8-5M46 41l8-5" stroke="#9C7A5C"/><ellipse cx="25.5" cy="30" rx="2" ry="1.2" fill="#F6B9C4" stroke="none"/><ellipse cx="38.5" cy="30" rx="2" ry="1.2" fill="#F6B9C4" stroke="none"/></g></symbol><symbol id="i-torii" viewBox="0 0 64 64"><g stroke="#4A3B33" stroke-width="2.6" stroke-linejoin="round"><path d="M6 14c14 4 38 4 52 0l-2 7c-14 3-34 3-48 0Z" fill="#E07B6E"/><rect x="12" y="25" width="40" height="5" rx="1.5" fill="#E07B6E"/><path d="M17 21v35M47 21v35" stroke-width="7" stroke="#4A3B33"/><path d="M17 21v35M47 21v35" stroke-width="3.4" stroke="#E07B6E"/><path d="M29 30v-9h6v9" fill="#FFF3E8"/></g></symbol></svg>';document.body.appendChild(d.firstChild);}
 const AK='hk-allclear-v1';
 function stampSVG(i,on){const r=REG[i]||REG[0],d=D[i],md=d?`${+d.date.slice(5,7)}/${+d.date.slice(8,10)}`:'';const c=on?r[2]:'#D8CBC0';
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><path id="rgArc${i}${on?1:0}" d="M22 52a28 28 0 0 0 56 0"/></defs><circle cx="50" cy="50" r="45" fill="${on?'#FFFDF9':'none'}" stroke="${c}" stroke-width="${on?4:2.5}" ${on?'':'stroke-dasharray="5 5"'}/><circle cx="50" cy="50" r="38" fill="none" stroke="${c}" stroke-width="1.4" ${on?'':'opacity=".5"'}/>${on?`<text x="50" y="27" text-anchor="middle" font-size="8.5" font-weight="900" fill="${c}">D${i+1}・${md}</text><use href="#${sym(r[0])}" x="34" y="30" width="32" height="32"/><text font-size="11" font-weight="900" fill="${c}" text-anchor="middle"><textPath href="#rgArc${i}1" startOffset="50%">${r[1]}</textPath></text>`:`<text x="50" y="48" text-anchor="middle" font-size="13" font-weight="900" fill="#C9BDB2">D${i+1}</text><text x="50" y="64" text-anchor="middle" font-size="9.5" font-weight="700" fill="#C9BDB2">${r[1]}</text>`}</svg>`;}
 function stampRow(){const A=get(AK,{}),n=REG.filter((_,i)=>A[i]).length;badge('gBookSub',n?`${n}/${REG.length}`:'');}
 function stampBook(){const A=get(AK,{}),n=REG.filter((_,i)=>A[i]).length;
  open(`<div class="cs-panel g-panel" role="dialog" aria-modal="true" aria-label="蓋章簿"><div class="sb-book"><div class="sb-cover"><b>北海道 蓋章簿</b><span>一天的行程全部完成，就會蓋上那天的章</span><em>${n} / ${REG.length}</em></div>
   <div class="rg-grid">${REG.map((_,i)=>`<div class="rg-s${A[i]?' on':''}" style="--r:${((i*37)%15)-7}deg">${stampSVG(i,!!A[i])}</div>`).join('')}</div></div>
   <div class="cs-btns"><button type="button" class="g-close g-x">關閉</button></div></div>`);}
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
 funRow();omiSub();gachaSub();stampRow();pigBadge();
})();

/* 角色對話框 */
window.hkSay=function(el,text,ms){if(!el)return;document.querySelectorAll('.say-bubble').forEach(b=>{if(b._for===el)b.remove();});
 const r=el.getBoundingClientRect();if(!r.width)return;const b=document.createElement('div');b.className='say-bubble';b._for=el;b.textContent=text;b.setAttribute('role','status');document.body.appendChild(b);
 const bw=b.offsetWidth,bh=b.offsetHeight,vw=document.documentElement.clientWidth;let x=r.left+r.width/2-bw/2;x=Math.max(8,Math.min(vw-bw-8,x));let y=r.top-bh-10;let below=false;if(y<64){y=r.bottom+10;below=true;}
 b.style.left=x+'px';b.style.top=(y+window.scrollY)+'px';b.style.setProperty('--ax',(r.left+r.width/2-x)+'px');if(below)b.classList.add('below');
 setTimeout(()=>{b.classList.add('out');setTimeout(()=>b.remove(),300);},ms||1900);};
/* 招財貓達摩：點了會張眼生氣打人 */
(function(){const c=document.getElementById('hgCat');if(!c)return;let t,n=0;
 const LINES=['不要戳我！','喵的咧！','生氣了喔！','再戳就揍你！','招財中，請勿打擾！'];
 const hit=e=>{e.stopPropagation();if(e.type==='pointerdown')return;c.classList.remove('mad');void c.getBBox();c.classList.add('mad');clearTimeout(t);t=setTimeout(()=>c.classList.remove('mad'),1700);
  if(navigator.vibrate)navigator.vibrate([20,40,30]);window.hkSay(c,LINES[n++%LINES.length]);};
 c.addEventListener('pointerdown',hit);c.addEventListener('click',hit);})();

/* ---------- 🍓 住宿附近的草莓超市 ---------- */
(function(){
 const h=document.querySelector('#stay h2');if(!h)return;
 const G=pid=>'https://www.google.com/maps/search/?api=1&query=%E3%82%B9%E3%83%BC%E3%83%91%E3%83%BC&query_place_id='+pid;
 const BERRY='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 18c-12 0-20 7-20 17 0 12 11 23 20 23s20-11 20-23c0-10-8-17-20-17z" fill="#F07A8A" stroke="#5B4B43" stroke-width="3"/><path d="M20 20c4-5 8-6 12-3 4-3 8-2 12 3-5 1-8 3-12 3s-7-2-12-3z" fill="#8CC79A" stroke="#5B4B43" stroke-width="3" stroke-linejoin="round"/><path d="M32 17v-7" stroke="#5B4B43" stroke-width="3" stroke-linecap="round"/><g fill="#FFF3B0"><ellipse cx="24" cy="33" rx="1.6" ry="2.3"/><ellipse cx="32" cy="30" rx="1.6" ry="2.3"/><ellipse cx="40" cy="33" rx="1.6" ry="2.3"/><ellipse cx="28" cy="41" rx="1.6" ry="2.3"/><ellipse cx="36" cy="41" rx="1.6" ry="2.3"/><ellipse cx="32" cy="49" rx="1.6" ry="2.3"/></g><circle cx="22" cy="38" r="2.4" fill="#FFB3C0" opacity=".8"/><circle cx="42" cy="38" r="2.4" fill="#FFB3C0" opacity=".8"/></svg>';
 const L=[
  {hotel:'Hotel Vista 札幌',when:'D1–D5（2/10–2/14）',shops:[
   ['Daiichi すすきの店','COCONO SUSUKINO 地下 2 樓','走路約 3 分','10:00–21:00','水果區很大，首選','ChIJvWHaNecpC18R8GTqg_86Ggg'],
   ['Dinner Bell 南7条店','24 小時超市','走路約 10 分','24 小時','晚上 21:00 以後來這家','ChIJxWYoxIgpC18R_7st2JpY6fo']]},
  {hotel:'Hotel Amanek 旭川',when:'D5–D7（2/14–2/16）',shops:[
   ['北のエース フィール旭川店','フィール旭川 地下 1 樓','就在飯店隔壁','10:00–19:30','北海道水果、生鮮','ChIJMw17mRHmDF8R7f-OY7_LYHY'],
   ['AEON 旭川站前','AEON MALL 1 樓','走路約 5 分','8:00–22:00','晚一點去這家','ChIJY-alVxDmDF8RzMwKG3gc9BM']]},
  {hotel:'第一瀧本館（登別）',when:'D7（2/16）',note:'溫泉街上沒有超市，要在上山前先買',shops:[
   ['MaxValu 登別店','登別市區','開車約 15–20 分','8:00–23:00','2 月放車上不會壞','ChIJKbu1bE7Yn18RMGaSZhI1t0U']]},
  {hotel:'KOKO STAY 千歲',when:'D8（2/17）',shops:[
   ['AEON 千歲店','千歲站旁','走路約 7–8 分','8:00–21:45','從千歲站走回飯店會經過','ChIJy8G2GKogdV8R5Hwe5rBX1r8']]}];
 const b=document.createElement('button');b.type='button';b.className='berry-btn';b.setAttribute('aria-label','住宿附近的草莓超市');b.innerHTML=BERRY;h.appendChild(b);
 const sh=document.createElement('div');sh.className='cs-sheet g-sheet';sh.hidden=true;document.body.appendChild(sh);
 const close=()=>{sh.hidden=true;document.body.classList.remove('cs-open');};
 sh.addEventListener('click',e=>{if(e.target===sh||e.target.closest('.g-close'))close();});
 const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 b.addEventListener('click',()=>{
  sh.innerHTML=`<div class="cs-panel g-panel berry-panel" role="dialog" aria-modal="true" aria-label="住宿附近的草莓超市"><h3><span class="bp-ic">${BERRY}</span>住宿附近的草莓超市</h3><p class="bp-tip">標籤寫「いちご」就是草莓。2 月是日本草莓季，超市都買得到。吃之前用水沖一下；新鮮水果不能帶回台灣。</p>${L.map(x=>`<section class="bp-hotel"><h4>${esc(x.hotel)}<small>${esc(x.when)}</small></h4>${x.note?`<p class="bp-note">${esc(x.note)}</p>`:''}${x.shops.map(s=>`<div class="bp-shop"><div><b>${esc(s[0])}</b><span>${esc(s[1])}</span><span class="bp-meta">${esc(s[2])}・${esc(s[3])}</span><span class="bp-why">${esc(s[4])}</span></div><a class="smallbtn" href="${G(s[5])}" target="_blank" rel="noopener">導航</a></div>`).join('')}</section>`).join('')}<button type="button" class="smallbtn g-close">關閉</button></div>`;
  sh.hidden=false;document.body.classList.add('cs-open');});
})();
