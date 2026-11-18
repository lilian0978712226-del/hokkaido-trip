/* ===== v5：底部日期切換、全部完成動畫 ===== */
(function(){
 const RM=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 /* 1. 行程最下方再一排 D1–D9 */
 const dc=document.getElementById('dayCard');
 if(dc&&typeof showDay==='function'){
  const bt=document.createElement('div');bt.className='tabs tabs-bottom';bt.id='tabsBottom';bt.setAttribute('aria-label','切換旅行日期（下方）');
  dc.insertAdjacentElement('afterend',bt);
  bt.innerHTML=days.map((d,i)=>`<button type="button" class="daytab" data-bday="${i}"><b>D${i+1}</b><small>${d.date.slice(5).replace('-','/')}</small></button>`).join('');
  const btns=[...bt.children];
  const mark=()=>{btns.forEach((x,i)=>x.classList.toggle('active',i===current));const a=btns[current];if(a){const L=a.offsetLeft-bt.clientWidth/2+a.clientWidth/2;bt.scrollTo({left:L,behavior:'auto'});}};
  const root=document.documentElement;
  const jump=y=>{const old=root.style.scrollBehavior;root.style.scrollBehavior='auto';window.scrollTo(0,y);root.style.scrollBehavior=old;};
  bt.addEventListener('click',e=>{
   const b=e.target.closest('[data-bday]');if(!b)return;
   const i=+b.dataset.bday;if(i===current)return;
   const y0=bt.getBoundingClientRect().top;
   showDay(i);
   const y1=bt.getBoundingClientRect().top;   /* forces layout of the new day */
   jump(window.scrollY+(y1-y0));              /* keep this row exactly where the finger is, no smooth scrolling */
   requestAnimationFrame(()=>{const y2=bt.getBoundingClientRect().top;if(Math.abs(y2-y0)>1)jump(window.scrollY+(y2-y0));});
   b.blur();
  });
  const p=showDay;window.showDay=showDay=function(){const r=p.apply(this,arguments);try{mark()}catch(e){}return r;};
  mark();
 }
 /* 3. 清單全部完成動畫 */
 const LISTS={prepList:'出發前待辦',bagList:'行李清單',entryTaxList:'出國前確認'};
 const full={};
 const isFull=id=>{const ins=[...document.querySelectorAll('#'+id+' input[type=checkbox]')];return ins.length>0&&ins.every(x=>x.checked);};
 Object.keys(LISTS).forEach(id=>full[id]=isFull(id));
 function celebrate(name){
  const o=document.createElement('div');o.className='dream';o.setAttribute('role','status');
  const msg=name+'全部完成';
  const orbit=Array.from({length:12},(_,k)=>`<i class="dr-orb ${k%3===0?'dr-star':k%3===1?'dr-flake':'dr-heart'}" style="--a:${k*30}deg;--d:${(k%2?92:112)}px"></i>`).join('');
  o.innerHTML=`<div class="dr-aurora"></div><div class="dr-rays"></div><div class="dr-halo"></div>
   <div class="dr-stage"><div class="dr-ring">${orbit}</div><div class="dr-bird"><svg viewBox="0 0 100 100" aria-hidden="true"><use href="#i-enaga"></use></svg></div></div>
   <div class="dr-text"><b>${[...msg].map((c,i)=>`<span style="animation-delay:${(1+i*.07).toFixed(2)}s">${c}</span>`).join('')}</b><small>辛苦了～一起去北海道吧 ❄</small></div>`;
  if(!RM){
   for(let k=0;k<18;k++){const t=document.createElement('i');t.className='dr-twinkle';t.style.left=(4+Math.random()*92)+'%';t.style.top=(4+Math.random()*80)+'%';t.style.setProperty('--s',(.5+Math.random()*.9).toFixed(2));t.style.animationDelay=(Math.random()*1.8)+'s';o.appendChild(t);}
   for(let k=0;k<14;k++){const b=document.createElement('i');b.className='dr-bokeh';b.style.left=Math.random()*100+'%';const z=20+Math.random()*60;b.style.width=b.style.height=z+'px';b.style.animationDelay=(Math.random()*1.5)+'s';b.style.animationDuration=(4+Math.random()*3)+'s';b.style.setProperty('--c',['#F6D3D8','#DCE8F2','#E6DDF3','#FCEDC0'][k%4]);o.appendChild(b);}
   for(let k=0;k<36;k++){const s=document.createElement('i');s.className='dr-bit '+['dr-star','dr-flake','dr-heart','dr-dot'][k%4];
    const ang=Math.random()*Math.PI*2,dist=110+Math.random()*170;
    s.style.setProperty('--x',Math.cos(ang)*dist+'px');s.style.setProperty('--y',Math.sin(ang)*dist+'px');
    s.style.setProperty('--s',(.6+Math.random()*.8).toFixed(2));s.style.animationDelay=(.7+Math.random()*.5)+'s';o.appendChild(s);}
   for(let k=0;k<24;k++){const f=document.createElement('i');f.className='dr-fall '+(k%3?'dr-flake':'dr-star');f.style.left=Math.random()*100+'%';f.style.setProperty('--s',(.4+Math.random()*.7).toFixed(2));f.style.setProperty('--w',(Math.random()*60-30)+'px');f.style.animationDelay=(Math.random()*3)+'s';f.style.animationDuration=(4+Math.random()*3)+'s';o.appendChild(f);}
  }
  document.body.appendChild(o);
  const close=()=>{if(o.classList.contains('out'))return;o.classList.add('out');setTimeout(()=>o.remove(),1100);};
  o.addEventListener('click',close);setTimeout(close,RM?2800:5600);
 }
 document.addEventListener('change',e=>{
  const id=Object.keys(LISTS).find(k=>e.target.closest&&e.target.closest('#'+k));if(!id)return;
  setTimeout(()=>{const f=isFull(id);if(f&&!full[id])celebrate(LISTS[id]);full[id]=f;},30);
 });
})();
