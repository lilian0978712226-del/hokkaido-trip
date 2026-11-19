/* ===== v6：日文溝通卡、緊急資訊 ===== */
(function(){
 const $=s=>document.querySelector(s);
 const ic=id=>`<svg class="h-ic" aria-hidden="true" viewBox="0 0 64 64"><use href="#${id}"></use></svg>`;
 const PH=[
  ['🍜 餐廳',[
   ['兩位，沒有預約','2人です。予約はしていません。'],
   ['有中文或英文菜單嗎？','中国語か英語のメニューはありますか？'],
   ['請給我這個','これをください。'],
   ['不要芥末','わさび抜きでお願いします。'],
   ['麻煩結帳','お会計をお願いします。'],
   ['可以刷卡嗎？','カードは使えますか？']]],
  ['🦀 市場・螃蟹',[
   ['這個多少錢？','これはいくらですか？'],
   ['請幫我挑一隻毛蟹','毛ガニを一杯選んでください。'],
   ['可以在這裡煮好直接吃嗎？','ここで調理して食べられますか？'],
   ['料理費是多少？','調理代はいくらですか？']]],
  ['🛍️ 購物・退稅',[
   ['可以免稅嗎？','免税できますか？'],
   ['這是我的護照','パスポートです。'],
   ['可以試吃嗎？','試食できますか？'],
   ['請給我袋子','袋をください。'],
   ['送禮用，請分開裝','プレゼント用に、別々の袋に入れてください。']]],
  ['🚗 自駕・加油',[
   ['普通汽油，加滿','レギュラー満タンでお願いします。'],
   ['用信用卡付款','カードでお願いします。'],
   ['停車場在哪裡？','駐車場はどこですか？'],
   ['車子被雪卡住動不了','車が雪にはまって動けません。']]],
  ['🏨 飯店',[
   ['我要辦入住，有預約','チェックインをお願いします。予約しています。'],
   ['請幫我訂天金（2/15 週一 17:00・2 位）','居酒屋「天金」（0166-22-3953）に、2月15日（月）17時、2名で予約していただけますか？満席でしたら17時〜18時の間で大丈夫です。'],
   ['可以幫我打電話訂這家餐廳嗎？','このお店に電話で予約していただけますか？'],
   ['訂到了嗎？用什麼名字？','予約できましたか？お名前は何で取りましたか？'],
   ['可以寄放行李嗎？','荷物を預かってもらえますか？'],
   ['請叫一台計程車','タクシーを呼んでください。']]],
  ['🆘 求助',[
   ['我不會說日文','日本語が話せません。'],
   ['請幫幫我','助けてください。'],
   ['請叫救護車','救急車を呼んでください。'],
   ['我身體不舒服','気分が悪いです。'],
   ['最近的醫院在哪裡？','一番近い病院はどこですか？'],
   ['我的護照不見了','パスポートをなくしました。']]]
 ];
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
   ${PH.map(([cat,list],i)=>`<details class="fold ph-cat"><summary><span>${cat}</span><i>展開</i></summary><div class="ph-list">${list.map(([zh,ja])=>`<div class="ph-card" data-ja="${ja}" data-zh="${zh}" role="button" tabindex="0"><small>${zh}</small><b lang="ja">${ja}</b><button type="button" class="ph-say" aria-label="唸出來">🔊</button></div>`).join('')}</div></details>`).join('')}
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
  const c=e.target.closest('.ph-card');if(c){show(c.dataset.zh,c.dataset.ja);return;}
  if(e.target.closest('#phHotel')){const h=tonight();show('請帶我到這家飯店　'+h[0],h[1]+'\nまでお願いします。');return;}
  if(e.target.closest('.ph-big-say')){say(big.dataset.ja);return;}
  if(e.target.closest('.ph-big-x')||e.target===big){big.classList.remove('open');}
 });
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
