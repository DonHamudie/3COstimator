const V='3co-v3.4';
const CORE=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x.startsWith('3co-')).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  const font=/(^|\.)(fonts\.googleapis|fonts\.gstatic)\.com$/.test(u.hostname);
  if(u.origin!==location.origin&&!font)return;
  e.respondWith(caches.match(e.request).then(hit=>{
    // stale-while-revalidate: serve cache instantly, refresh it in the background
    const net=fetch(e.request).then(r=>{if(r&&(r.ok||r.type==='opaque')){const cp=r.clone();caches.open(V).then(c=>c.put(e.request,cp));}return r;})
      .catch(()=>hit||(e.request.mode==='navigate'?caches.match('index.html'):Response.error()));
    return hit||net;
  }));
});
