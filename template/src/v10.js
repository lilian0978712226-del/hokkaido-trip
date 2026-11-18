/* ===== v10：實用小圖示＋日本／北海道小擺飾 ===== */
(function(){
 const K='stroke="#5B4B43" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"';
 const ic=b=>`<svg class="cute-ic" viewBox="0 0 20 20" aria-hidden="true">${b}</svg>`;
 const I={
  copy:ic(`<rect x="6.5" y="6.5" width="10" height="11" rx="2.6" fill="#F7D9DF" ${K}/><rect x="3.5" y="2.8" width="10" height="11" rx="2.6" fill="#fff" ${K}/><path d="M6.4 6.6h4.2M6.4 9.4h3" ${K}/>`),
  cal:ic(`<rect x="3" y="4.5" width="14" height="12.5" rx="3" fill="#fff" ${K}/><path d="M3 8.5h14V7.5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3Z" fill="#CFE1F2" ${K}/><path d="M7 3v3M13 3v3" ${K}/><circle cx="7.4" cy="12.2" r="1" fill="#F4A9A0"/><circle cx="10.6" cy="12.2" r="1" fill="#5B4B43"/><circle cx="13.6" cy="12.2" r="1" fill="#5B4B43"/>`),
  pin:ic(`<path d="M10 18.2C6.4 14.6 4.4 11.6 4.4 8.6A5.6 5.6 0 0 1 15.6 8.6C15.6 11.6 13.6 14.6 10 18.2Z" fill="#F4A9A0" ${K}/><path d="M10 10.6C8.4 9.4 7.7 8.6 7.7 7.7A1.15 1.15 0 0 1 10 7.3A1.15 1.15 0 0 1 12.3 7.7C12.3 8.6 11.6 9.4 10 10.6Z" fill="#fff"/>`),
  snow:ic(`<circle cx="10" cy="10" r="8" fill="#DCEBF7" ${K}/><path d="M10 4.6v10.8M5.3 7.3l9.4 5.4M14.7 7.3l-9.4 5.4" stroke="#6E8FB8" stroke-width="1.5" stroke-linecap="round"/><path d="M8.6 5.4 10 6.6l1.4-1.2M8.6 14.6 10 13.4l1.4 1.2" fill="none" stroke="#6E8FB8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`),
  check:ic(`<circle cx="10" cy="10" r="8" fill="#DCEBD5" ${K}/><path d="M6.4 10.2 8.9 12.6 13.8 7.4" fill="none" ${K} stroke-width="1.8"/>`),
  trash:ic(`<path d="M5 6.5h10l-.9 9.4a1.8 1.8 0 0 1-1.8 1.6H7.7a1.8 1.8 0 0 1-1.8-1.6Z" fill="#FBE3D6" ${K}/><path d="M3.8 6.5h12.4M8 6.5V4.6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.9M8.6 9.4v5M11.4 9.4v5" ${K}/>`),
  bell:ic(`<path d="M5 13.6V9.4a5 5 0 0 1 10 0v4.2l1.4 1.6H3.6Z" fill="#F6E2A6" ${K}/><path d="M8.4 16.8a1.8 1.8 0 0 0 3.2 0" ${K}/><path d="M10 3v1.4" ${K}/>`),
  list:ic(`<rect x="4" y="4" width="12" height="14" rx="2.6" fill="#fff" ${K}/><rect x="7.2" y="2.6" width="5.6" height="3" rx="1.2" fill="#F7D9DF" ${K}/><path d="M7 9.4l1 1 1.8-2M11.6 9.6h2.2M7 13.6l1 1 1.8-2M11.6 13.8h2.2" ${K} fill="none"/>`),
  bag:ic(`<rect x="4" y="6" width="12" height="11" rx="2.6" fill="#F7D9DF" ${K}/><path d="M7.6 6V4.6a1 1 0 0 1 1-1h2.8a1 1 0 0 1 1 1V6M8 6v11M12 6v11" ${K}/>`),
  car:ic(`<path d="M3 13.2v-2.4l1.6-3.6a2 2 0 0 1 1.8-1.2h7.2a2 2 0 0 1 1.8 1.2l1.6 3.6v2.4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" fill="#F7D9DF" ${K}/><path d="M5.6 10.4h8.8" ${K}/><circle cx="6.4" cy="14.6" r="1.7" fill="#5B4B43"/><circle cx="13.6" cy="14.6" r="1.7" fill="#5B4B43"/>`),
  coin:ic(`<circle cx="10" cy="10" r="7.6" fill="#F6D98B" ${K}/><circle cx="10" cy="10" r="5" fill="none" stroke="#D9A94F" stroke-width="1"/><path d="M7.6 6.8 10 10l2.4-3.2M10 10v3.6M8 10.6h4M8 12.4h4" fill="none" stroke="#8A6A3A" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>`),
  phone:ic(`<rect x="5.5" y="2.6" width="9" height="14.8" rx="2.4" fill="#DCEBD5" ${K}/><path d="M8.6 15h2.8" ${K}/>`),
  heart:ic(`<path d="M10 16.4C5.6 13.2 3.4 10.8 3.4 8.2A3.2 3.2 0 0 1 10 6.6A3.2 3.2 0 0 1 16.6 8.2C16.6 10.8 14.4 13.2 10 16.4Z" fill="#F4A9A0" ${K}/>`),
  share:ic(`<path d="M5.4 9.6v6.2a1.6 1.6 0 0 0 1.6 1.6h6a1.6 1.6 0 0 0 1.6-1.6V9.6" fill="#E9DDF4" ${K}/><path d="M10 12.4V3.2M7 6l3-3 3 3" fill="none" ${K}/>`)
 };
 const RULES=[
  [/^複製/,'copy'],[/^看行程$|^行程$/,'cal'],[/^導航$|^地圖導航$/,'pin'],[/重新查詢/,'snow'],
  [/^儲存設定$/,'check'],[/^清除全部紀錄$/,'trash'],[/今天的重要事項/,'bell'],[/看全部待辦/,'list'],
  [/看全部行李/,'bag'],[/取車路線/,'car'],[/雪地自駕提醒/,'snow'],[/退稅.*步/,'coin'],[/^傳送|^📤/,'share']
 ];
 function deco(root){
  (root||document).querySelectorAll('button, a.smallbtn, summary').forEach(el=>{
   if(el.dataset.cuteDone||el.querySelector('.cute-ic-wrap'))return;
   const span=el.matches('summary')?el.querySelector('span')||el:el;
   const txt=span.textContent.trim();if(!txt)return;
   if(/^\p{Extended_Pictographic}/u.test(txt))return;
   const r=RULES.find(([re])=>re.test(txt));if(!r)return;
   el.dataset.cuteDone=1;
   const w=document.createElement('span');w.className='cute-ic-wrap lead';w.innerHTML=I[r[1]];
   span.insertBefore(w,span.firstChild);
  });
 }
 /* 所有「📍 導航／位置」統一換成粉紅愛心地圖釘 */
 function pins(root){
  (root||document).querySelectorAll('button, a, .smallbtn').forEach(el=>{
   if(el.dataset.pinDone||el.closest('.bottomnav'))return;
   const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let t,hit=false;
   while((t=w.nextNode())){if(t.nodeValue.includes('📍')){
    const parts=t.nodeValue.split('📍');const frag=document.createDocumentFragment();
    parts.forEach((p,k)=>{if(k){const s=document.createElement('span');s.className='cute-ic-wrap lead';s.innerHTML=I.pin;frag.appendChild(s);}const v=k?p.replace(/^\s+/,''):p;if(v)frag.appendChild(document.createTextNode(v));});
    t.parentNode.replaceChild(frag,t);hit=true;break;}}
   if(hit)el.dataset.pinDone=1;
  });
 }
 pins();
 deco();let tm;new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(()=>{pins();deco();},80);}).observe(document.body,{childList:true,subtree:true});

 /* 日本／北海道小擺飾：放在每個大標題虛線的最後面 */
 const S='stroke="#5B4B43" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"';
 const F=(c,cx,cy)=>`<circle cx="${cx-3.4}" cy="${cy}" r="1.1" fill="#5B4B43"/><circle cx="${cx+3.4}" cy="${cy}" r="1.1" fill="#5B4B43"/><ellipse cx="${cx-5.6}" cy="${cy+2.6}" rx="1.6" ry="1" fill="#F5A8A8"/><ellipse cx="${cx+5.6}" cy="${cy+2.6}" rx="1.6" ry="1" fill="#F5A8A8"/>${c?`<path d="M${cx-1.2} ${cy+2}q1.2 1.1 2.4 0" fill="none" stroke="#5B4B43" stroke-width="1.1" stroke-linecap="round"/>`:''}`;
 const M={
  chochin:`<path d="M20 3v3" ${S}/><rect x="13" y="5.6" width="14" height="3.4" rx="1.4" fill="#6B5548" ${S}/><ellipse cx="20" cy="20" rx="11" ry="11.6" fill="#F4A9A0" ${S}/><path d="M9.6 15.6h20.8M9.2 20h21.6M9.6 24.4h20.8" stroke="#D9826A" stroke-width="1"/><rect x="13" y="30.4" width="14" height="3.4" rx="1.4" fill="#6B5548" ${S}/><path d="M20 33.8v3" ${S}/>${F(1,20,19)}`,
  teru:`<path d="M20 2v4" ${S}/><path d="M12 19C9 30 8.6 34 12.4 35.4C15 33.4 17 35.8 20 34.6C23 35.8 25 33.4 27.6 35.4C31.4 34 31 30 28 19Z" fill="#fff" ${S}/><circle cx="20" cy="14" r="9" fill="#fff" ${S}/><path d="M13.8 21.4Q20 24.4 26.2 21.4" fill="none" stroke="#F4A9A0" stroke-width="2.2" stroke-linecap="round"/>${F(1,20,14)}`,
  tsubaki:`<g ${S}><circle cx="20" cy="11" r="7" fill="#E58F7B"/><circle cx="28.6" cy="17.4" r="7" fill="#E58F7B"/><circle cx="25.4" cy="27.4" r="7" fill="#E58F7B"/><circle cx="14.6" cy="27.4" r="7" fill="#E58F7B"/><circle cx="11.4" cy="17.4" r="7" fill="#E58F7B"/></g><circle cx="20" cy="20" r="5.4" fill="#F6D98B" ${S}/><path d="M17.6 18.6v-2M20 18v-2.4M22.4 18.6v-2" stroke="#D9A94F" stroke-width="1.3" stroke-linecap="round"/>`,
  koban:`<ellipse cx="20" cy="20" rx="12" ry="16" fill="#F6D98B" ${S}/><ellipse cx="20" cy="20" rx="8.6" ry="12.4" fill="none" stroke="#D9A94F" stroke-width="1.1"/><path d="M14 11.4h12M14 28.6h12" stroke="#D9A94F" stroke-width="1.1" stroke-linecap="round"/>${F(1,20,19)}`,
  kokeshi:`<rect x="11.4" y="20" width="17.2" height="16.4" rx="7" fill="#F7D9DF" ${S}/><circle cx="20" cy="29" r="3" fill="#E58F7B"/><circle cx="20" cy="29" r="1" fill="#F6D98B"/><circle cx="20" cy="13.4" r="9.4" fill="#FFF8EF" ${S}/><path d="M10.6 13.4A9.4 9.4 0 0 1 29.4 13.4C27 9.4 23 8.8 20 11.2C17 8.8 13 9.4 10.6 13.4Z" fill="#5B4B43" ${S}/><circle cx="26.4" cy="7.2" r="2.2" fill="#E58F7B" ${S}/>${F(1,20,15.6)}`,
  omamori:`<path d="M20 2.6c-2.8 0-3.8 2.6-2 4.2M20 2.6c2.8 0 3.8 2.6 2 4.2" fill="none" stroke="#E58F7B" stroke-width="1.6" stroke-linecap="round"/><path d="M11 10.6 14 7h12l3 3.6V34a2.6 2.6 0 0 1-2.6 2.6H13.6A2.6 2.6 0 0 1 11 34Z" fill="#F4A9A0" ${S}/><rect x="15.4" y="14.4" width="9.2" height="13" rx="1.6" fill="#F6D98B" ${S}/><path d="M18 18.4h4M18 21h4M18 23.6h4" stroke="#B4643F" stroke-width="1" stroke-linecap="round"/>`,
  maneki:`<path d="M10.4 16 10 6.6 15.6 11ZM29.6 16 30 6.6 24.4 11Z" fill="#fff" ${S}/><path d="M11 12.4C15 3 25 3 29 12.4C33 20 31 34 20 34.6C9 34 7 20 11 12.4Z" fill="#fff" ${S}/><path d="M29.4 20.6c3.6-1 5-4.2 4-7.6-.6-2-3.4-1.6-3.4.4" fill="#fff" ${S} class="mk-paw"/><path d="M12.4 24.4Q20 28.2 27.6 24.4" fill="none" stroke="#E58F7B" stroke-width="2.4" stroke-linecap="round"/><circle cx="20" cy="27.6" r="2.2" fill="#F6D98B" ${S}/>${F(1,20,17.4)}`,
  daruma:`<ellipse cx="20" cy="22" rx="14" ry="14.6" fill="#E58F7B" ${S}/><ellipse cx="20" cy="18.6" rx="8.8" ry="7.8" fill="#FFF8EF" ${S}/><path d="M14.6 14.4q2-1.6 4 0M21.4 14.4q2-1.6 4 0" fill="none" stroke="#5B4B43" stroke-width="1.4" stroke-linecap="round"/><circle cx="16.6" cy="18" r="1.3" fill="#5B4B43"/><circle cx="23.4" cy="18" r="1.3" fill="#5B4B43"/><path d="M17 22.4q1.6-1.4 3 0q1.4-1.4 3 0" fill="none" stroke="#5B4B43" stroke-width="1.2" stroke-linecap="round"/><path d="M14.4 31.4q5.6 3 11.2 0" fill="none" stroke="#F6D98B" stroke-width="2.2" stroke-linecap="round"/>`,
  crane:`<path d="M10 25C10 18 16 15 22 17L31 21C29.6 27 23 31.4 16 30.4C12.4 30 10 28 10 25Z" fill="#fff" ${S}/><path d="M26 21.6 33 23.4 29.4 26.8Z" fill="#5B4B43" ${S}/><path d="M14.8 19C14 13.4 13.6 9 17.4 7.2" fill="none" stroke="#5B4B43" stroke-width="2.8" stroke-linecap="round"/><circle cx="18.6" cy="6.6" r="3.2" fill="#fff" ${S}/><circle cx="18.6" cy="4.2" r="1.4" fill="#E36B5E"/><path d="M21.6 6.8 26.6 8" ${S}/><circle cx="18.4" cy="6.8" r=".8" fill="#5B4B43"/><path d="M17 30.4v6M21 30.4v6" ${S}/>`,
  onigiri:`<path d="M20 6.4C23.6 6.4 26.4 9 29.6 14.2C32.8 19.4 35.4 23.8 35.4 27.6C35.4 33 31 35.4 20 35.4C9 35.4 4.6 33 4.6 27.6C4.6 23.8 7.2 19.4 10.4 14.2C13.6 9 16.4 6.4 20 6.4Z" fill="#fff" ${S}/><path d="M14.2 26.6Q14.2 25 15.8 25H24.2Q25.8 25 25.8 26.6V35.2H14.2Z" fill="#5E7A62" ${S}/>${F(1,20,19.4)}`,
  kamakura:`<path d="M4 34Q4 9 20 9Q36 9 36 34Z" fill="#fff" ${S}/><path d="M14.6 34V27a5.4 5.4 0 0 1 10.8 0V34Z" fill="#F6D98B" ${S}/><circle cx="20" cy="29.4" r="2.4" fill="#F4A9A0" opacity=".8"/><path d="M9 20q3-1 6 0M24 15q3-1 6 0" stroke="#C6D6E4" stroke-width="1.4" stroke-linecap="round"/><path d="M2 34h36" ${S}/>`,
  kitsune:`<path d="M9 8 15.6 14.6 11 21ZM31 8 24.4 14.6 29 21Z" fill="#F0B27A" ${S}/><path d="M10.6 16C12 11.4 28 11.4 29.4 16L32 22C30 30 24 34 20 34C16 34 10 30 8 22Z" fill="#F0B27A" ${S}/><path d="M12 23.4C14 30 18 33 20 33C22 33 26 30 28 23.4C25 25.4 22 24.6 20 27.4C18 24.6 15 25.4 12 23.4Z" fill="#fff"/><path d="M14.6 20.2q1.8 1.4 3.4 0M22 20.2q1.8 1.4 3.4 0" fill="none" stroke="#5B4B43" stroke-width="1.4" stroke-linecap="round"/><circle cx="20" cy="27.6" r="1.4" fill="#5B4B43"/>`,
  torii:`<path d="M5 9.4Q20 5 35 9.4L34 13H6Z" fill="#E58F7B" ${S}/><rect x="9" y="16.4" width="22" height="3.2" rx="1" fill="#E58F7B" ${S}/><path d="M12 13v23M28 13v23" stroke="#5B4B43" stroke-width="5.2" stroke-linecap="round"/><path d="M12 13v23M28 13v23" stroke="#E58F7B" stroke-width="2.4" stroke-linecap="round"/><rect x="18" y="13" width="4" height="3.4" fill="#F6D98B" ${S}/>`
 };
 const MAP={itinerary:'chochin',weather:'teru','care-notes':'tsubaki',ledger:'koban',phrases:'kokeshi',emergency:'omamori','trip-tools':'maneki',checklists:'daruma',footprints:'crane','food-book':'onigiri',stay:'kamakura',essentials:'kitsune','arrival-tax':'torii'};
 Object.entries(MAP).forEach(([id,k],n)=>{
  const h=document.querySelector(`#${CSS.escape(id)} > h2, #${CSS.escape(id)} h2`);if(!h||h.querySelector('.jp-deco'))return;
  const s=document.createElement('span');s.className='jp-deco';s.setAttribute('aria-hidden','true');s.style.animationDelay=(n*.37%3).toFixed(2)+'s';
  s.innerHTML=`<svg viewBox="0 0 40 40">${M[k]}</svg>`;h.appendChild(s);
  s.addEventListener('click',()=>{s.classList.remove('hop');void s.offsetWidth;s.classList.add('hop');});
  s.style.pointerEvents='auto';
 });
})();
/* 三個重複羅盤的標題換成各自的圖示 */
(function(){
 const S='stroke="#5B4B43" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
 const ART={
  emergency:`<rect x="9" y="19" width="46" height="34" rx="9" fill="#F7D9DF" ${S}/><path d="M24 19v-4.4a3.6 3.6 0 0 1 3.6-3.6h8.8a3.6 3.6 0 0 1 3.6 3.6V19" fill="none" ${S}/><path d="M28.6 27.6h6.8v6.6H42v6.8h-6.6v6.6h-6.8v-6.6H22v-6.8h6.6Z" fill="#fff" ${S} stroke-width="2.4"/>`,
  'trip-tools':`<path d="M14 15 9.6 10.6M50 15l4.4-4.4" ${S}/><circle cx="16" cy="13" r="5" fill="#F6E2A6" ${S}/><circle cx="48" cy="13" r="5" fill="#F6E2A6" ${S}/><circle cx="32" cy="35" r="20" fill="#DCEBF7" ${S}/><circle cx="32" cy="35" r="14.6" fill="#fff" stroke="#5B4B43" stroke-width="2"/><path d="M32 25.6V35l6.4 4" fill="none" ${S}/><path d="M20 53.4 17 57M44 53.4l3 3.6" ${S}/><circle cx="32" cy="35" r="1.8" fill="#E58F7B"/>`,
  footprints:`<path d="M12 50 25 45 39 50 52 45V14L39 19 25 14 12 19Z" fill="#FFFBF3" ${S}/><path d="M25 14v31M39 19v31" stroke="#5B4B43" stroke-width="2" stroke-dasharray="3 3"/><path d="M32 22.6l2.6 5.4 5.8.8-4.2 4 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.2-4 5.8-.8Z" fill="#FFC94D" ${S} stroke-width="2.2"/>`
 };
 Object.entries(ART).forEach(([id,a])=>{const svg=document.querySelector(`#${id} h2 .h-ic`);if(svg){svg.setAttribute('viewBox','0 0 64 64');svg.innerHTML=a;}});
})();
