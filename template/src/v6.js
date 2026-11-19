/* ===== v6：日文溝通卡、緊急資訊 ===== */
(function(){
 const $=s=>document.querySelector(s);
 const ic=id=>`<svg class="h-ic" aria-hidden="true" viewBox="0 0 64 64"><use href="#${id}"></use></svg>`;
 // 卡片：[中文, 日文, 可填的格子]；{x} 會換成選到／填的內容
 const PH=[
  ['🍜 吃飯',[
   ['{n} 位，沒有預約','{n}人です。予約はしていません。',{n:{sel:[['1','1'],['2','2'],['3','3'],['4','4'],['5','5'],['6','6']],d:'2'}}],
   ['有中文或英文菜單嗎？','中国語か英語のメニューはありますか？'],
   ['請給我這個 {n} 份（用手指）','これを{n}つください。',{n:{sel:[['1','1'],['2','2'],['3','3'],['4','4']],d:'1'}}],
   ['不要 {x}','{x}抜きでお願いします。',{x:{sel:[['芥末','わさび'],['蔥','ネギ'],['香菜','パクチー'],['冰塊','氷']],d:'わさび'}}],
   ['麻煩結帳，可以刷卡嗎？','お会計をお願いします。カードは使えますか？']]],
  ['🛍️ 購物・市場',[
   ['這個多少錢？','これはいくらですか？'],
   ['可以免稅嗎？這是我的護照','免税できますか？パスポートです。'],
   ['請幫我挑一隻 {x}，可以在這裡煮好吃嗎？','{x}を一杯選んでください。ここで調理して食べられますか？',{x:{sel:[['毛蟹','毛ガニ'],['帝王蟹','タラバガニ'],['松葉蟹','ズワイガニ']],d:'毛ガニ'}}],
   ['送禮用，請分開裝','プレゼント用に、別々の袋に入れてください。']]],
  ['🧭 問路・交通',[
   ['請問 {x} 怎麼走？','{x}はどこですか？行き方を教えてください。',{x:{txt:'例：駅、トイレ、地名',d:'駅'}}],
   ['請叫一台計程車，要去 {x}','タクシーを呼んでください。行き先は{x}です。',{x:{txt:'例：店名或飯店名',d:''}}],
   ['{x} 加滿，刷卡','{x}満タンで、カードでお願いします。',{x:{sel:[['普通汽油','レギュラー'],['高級汽油','ハイオク']],d:'レギュラー'}}],
   ['車子被雪卡住動不了','車が雪にはまって動けません。']]],
  ['🏨 飯店',[
   ['我要辦入住，有預約','チェックインをお願いします。予約しています。'],
   ['可以幫我寄放行李到 {t} 嗎？','{t}まで荷物を預かってもらえますか？',{t:{time:1,d:'17:00'}}],
   ['訂到了嗎？用什麼名字？','予約できましたか？お名前は何で取りましたか？']]],
  ['🆘 求助',[
   ['請幫幫我，我不會說日文','助けてください。日本語が話せません。'],
   ['請叫救護車','救急車を呼んでください。'],
   ['我 {x} 不舒服','{x}が痛いです。',{x:{sel:[['頭','頭'],['肚子','お腹'],['喉嚨','喉'],['腳','足']],d:'お腹'}}],
   ['我的 {x} 不見了','{x}をなくしました。',{x:{sel:[['護照','パスポート'],['錢包','財布'],['手機','スマホ'],['鑰匙','鍵']],d:'パスポート'}}]]]
 ];
 const fillT=(tpl,sl,vals,zh)=>tpl.replace(/\{(\w)\}/g,(m,k)=>{const o=sl&&sl[k];const v=vals[k]!=null?vals[k]:(o?o.d:'');if(o&&o.sel){const it=o.sel.find(x=>x[1]===v)||o.sel[0];return zh?it[0]:it[1];}if(o&&o.time){const [h,mm]=String(v||'').split(':').map(Number);return zh?v:(isNaN(h)?'':(mm?`${h}時${mm}分`:`${h}時`));}return v||(zh?'＿＿':'＿＿');});
 const esc6=x=>String(x).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
 const card=([zh,ja,sl])=>{const vals={};const z=fillT(zh,sl,vals,1),j=fillT(ja,sl,vals,0);
  const ctr=sl?`<div class="ph-slots">${Object.entries(sl).map(([k,o])=>o.sel?`<select data-k="${k}">${o.sel.map(([l,v])=>`<option value="${esc6(v)}"${v===o.d?' selected':''}>${esc6(l)}</option>`).join('')}</select>`:o.time?`<input type="time" data-k="${k}" value="${o.d}">`:`<input data-k="${k}" placeholder="${esc6(o.txt)}" value="${esc6(o.d)}">`).join('')}</div>`:'';
  return `<div class="ph-card${sl?' ph-fill':''}" data-ja="${esc6(j)}" data-zh="${esc6(z)}" data-tz="${esc6(zh)}" data-tj="${esc6(ja)}" role="button" tabindex="0"><small>${esc6(z)}</small><b lang="ja">${esc6(j)}</b>${ctr}<button type="button" class="ph-say" aria-label="唸出來">🔊</button></div>`;};
 const SLOTS=new Map();PH.forEach(([,l])=>l.forEach(x=>{if(x[2])SLOTS.set(x[0],x[2]);}));
 const HOTELS=[['Hotel Vista Sapporo Odori','ホテルビスタ札幌大通',[0,1,2,3]],['Hotel Amanek Asahikawa','ホテルアマネク旭川',[4,5]],['第一瀧本館（登別溫泉）','第一滝本館（登別温泉）',[6]],['KOKO STAY 千歲','KOKO STAY 千歳',[7,8]]];
 const tonight=()=>{const d=typeof current==='number'?current:0;return HOTELS.find(h=>h[2].includes(d))||HOTELS[0];};
 const EM=[
  ['🚓','警察','110','24 小時・免費'],
  ['🚑','救護車・消防','119','24 小時・免費'],
  ['☎️','日本旅遊熱線（有中文）','050-3816-2787','JNTO・24 小時・生病、災害、遺失都可以問'],
  ['🇹🇼','駐日代表處 札幌分處','011-222-2930','平日 9:00–12:00、13:00–18:00'],
  ['🆘','札幌分處 急難專線','080-1460-2568','限重大急難（受傷就醫、被捕、重大犯罪受害）'],
  ['📞','外交部急難救助（從日本撥）','+886-800-085-095','24 小時'],
  ['🚗','Nippon 租車 新千歲','050-1712-2970','車子出問題先打這支（預約 G34218）'],
  ['🛠️','JAF 道路救援','#8139','租車請先聯絡租車公司；也可撥 0570-00-8139']
 ];
 const sec=document.createElement('div');
 sec.innerHTML=`<section class="section" id="phrases"><h2>${ic('i-note')}日文溝通卡</h2>
   <p class="muted ph-tip">點一下卡片就會放大給店員看，🔊 可以直接唸出來</p>
   <button type="button" class="ph-hotel" id="phHotel"></button>
   ${PH.map(([cat,list],i)=>`<details class="fold ph-cat"><summary><span>${cat}</span><i>展開</i></summary><div class="ph-list">${list.map(card).join('')}</div></details>`).join('')}
  </section>
  <section class="section" id="emergency"><h2>${ic('i-compass')}緊急資訊</h2>
   <div class="em-grid">${EM.map(([e,n,t,d])=>`<a class="em-card" href="tel:${t.replace(/[^\d+#]/g,'').replace('#','%23')}"><span class="em-ic">${e}</span><div><b>${n}</b><strong>${t}</strong><small>${d}</small></div></a>`).join('')}</div>
   <div class="card em-mine"><h3>🛡️ 我們的保險與重要資料</h3><p class="muted">只存在這支手機，不會上傳</p>
    <label>旅平險／不便險公司<input data-em="ins"></label>
    <label>保險 24 小時救援電話<input data-em="instel" inputmode="tel"></label>
    <label>保單號碼<input data-em="pol"></label>
    <label>其他備註（血型、過敏、家人電話）<textarea data-em="note" rows="2"></textarea></label>
    <div class="em-call" id="emInsCall"></div>
   </div>
  </section>`;
 const anchor=$('#ledger');if(!anchor)return;
 [...sec.children].reverse().forEach(n=>anchor.insertAdjacentElement('afterend',n));
 /* big card */
 const big=document.createElement('div');big.className='ph-big';big.innerHTML='<div class="ph-big-card"><small></small><b lang="ja"></b><div class="ph-big-btns"><button type="button" class="ph-big-say">🔊 唸出來</button><button type="button" class="ph-big-x">關閉</button></div></div>';document.body.appendChild(big);
 const say=t=>{try{if(!('speechSynthesis' in window)){toast('這支手機不支援朗讀');return;}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='ja-JP';u.rate=.9;const v=speechSynthesis.getVoices().find(v=>/ja/i.test(v.lang));if(v)u.voice=v;speechSynthesis.speak(u);}catch(e){}};
 const show=(zh,ja)=>{big.querySelector('small').textContent=zh;big.querySelector('b').textContent=ja;big.dataset.ja=ja;big.classList.add('open');};
 document.addEventListener('click',e=>{
  const s=e.target.closest('.ph-say');if(s){e.stopPropagation();say(s.closest('.ph-card').dataset.ja);return;}
  if(e.target.closest('.ph-slots'))return;
  const c=e.target.closest('.ph-card');if(c){show(c.dataset.zh,c.dataset.ja);return;}
  if(e.target.closest('#phHotel')){const h=tonight();show('請帶我到這家飯店　'+h[0],h[1]+'\nまでお願いします。');return;}
  if(e.target.closest('.ph-big-say')){say(big.dataset.ja);return;}
  if(e.target.closest('.ph-big-x')||e.target===big){big.classList.remove('open');}
 });
 const upFill=e=>{const el=e.target.closest('.ph-slots [data-k]');if(!el)return;const c=el.closest('.ph-card'),sl=SLOTS.get(c.dataset.tz),vals={};c.querySelectorAll('[data-k]').forEach(x=>vals[x.dataset.k]=x.value.trim());c.dataset.zh=fillT(c.dataset.tz,sl,vals,1);c.dataset.ja=fillT(c.dataset.tj,sl,vals,0);c.querySelector('small').textContent=c.dataset.zh;c.querySelector('b').textContent=c.dataset.ja;};
 document.addEventListener('input',upFill);document.addEventListener('change',upFill);
 const upH=()=>{const h=tonight();$('#phHotel').innerHTML=`🚕 計程車卡：帶我回今晚的飯店<br><b lang="ja">${h[1]}</b>`;};
 upH();if(typeof showDay==='function'){const p=showDay;window.showDay=showDay=function(){const r=p.apply(this,arguments);try{upH()}catch(e){}return r;};}
 /* my info */
 const MK='hk-emergency-mine-v1';let M={};try{M=JSON.parse(localStorage.getItem(MK))||{}}catch(e){}
 const callBtn=()=>{const t=(M.instel||'').trim();$('#emInsCall').innerHTML=t?`<a class="em-card" href="tel:${t.replace(/[^\d+]/g,'')}"><span class="em-ic">🛡️</span><div><b>${(M.ins||'保險').replace(/</g,'&lt;')} 救援</b><strong>${t.replace(/</g,'&lt;')}</strong><small>點一下直接撥打</small></div></a>`:'';};
 document.querySelectorAll('[data-em]').forEach(el=>{el.value=M[el.dataset.em]||'';el.addEventListener('input',()=>{M[el.dataset.em]=el.value;try{localStorage.setItem(MK,JSON.stringify(M))}catch(e){}callBtn();});});
 callBtn();
 /* nav */
 const nav=$('.top-nav');if(nav){const a=nav.querySelector('a[href="#flights"]');[['#phrases','日文卡'],['#emergency','緊急']].reverse().forEach(([h,t])=>{const x=document.createElement('a');x.href=h;x.textContent=t;(a||nav.lastChild).insertAdjacentElement('beforebegin',x);});}
})();
