/* 北海道大暴吃｜離線快取 */
const V='hk-trip-v14';
const CORE=['./','./index.html','./manifest.webmanifest','./apple-touch-icon.png','./icon-192.png','./icon-512.png','./favicon-32.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>null)))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
const timeout=(p,ms)=>new Promise((res,rej)=>{const t=setTimeout(()=>rej(new Error('timeout')),ms);p.then(r=>{clearTimeout(t);res(r)},err=>{clearTimeout(t);rej(err)});});
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 const u=new URL(r.url);
 if(/open-meteo|api\./.test(u.hostname))return; // 天氣即時資料不快取
 const isPage=r.mode==='navigate'||(u.origin===location.origin&&/\.html?$|\/$/.test(u.pathname));
 if(isPage){ // 先用網路拿最新版，沒網路就用上次存的
  e.respondWith(timeout(fetch(r),4000).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put('./index.html',cp));return res;}).catch(()=>caches.match('./index.html').then(m=>m||caches.match(r))));
  return;
 }
 if(u.origin===location.origin||/fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net/.test(u.hostname)){
  e.respondWith(caches.open(V).then(c=>c.match(r).then(hit=>{const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res;}).catch(()=>hit);return hit||net;})));
 }
});
