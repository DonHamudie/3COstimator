const V='3co-v3.4.1';
const CORE=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x.startsWith('3co-')).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
const put=(req,r)=>{if(r&&(r.ok||r.type==='opaque')){const cp=r.clone();caches.open(V).then(c=>c.put(req,cp));}return r;};
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const u=new URL(req.url);
  const font=/(^|\.)(fonts\.googleapis|fonts\.gstatic)\.com$/.test(u.hostname);
  if(u.origin!==location.origin&&!font)return;
  if(req.mode==='navigate'){
    // Page loads: network first (so updates always arrive), cache only if offline or slow (>4s)
    e.respondWith(new Promise(resolve=>{
      const fall=()=>caches.match('index.html').then(h=>resolve(h||Response.error()));
      const t=setTimeout(fall,4000);
      fetch(req.url,{cache:'no-cache'}).then(r=>{clearTimeout(t);if(r&&r.ok){put('index.html',r.clone());resolve(r);}else fall();}).catch(()=>{clearTimeout(t);fall();});
    }));
    return;
  }
  // Everything else: serve cache instantly, refresh in background
  e.respondWith(caches.match(req).then(hit=>{
    const net=fetch(req).then(r=>put(req,r)).catch(()=>hit||Response.error());
    return hit||net;
  }));
});
