'use strict';
// Litecoin API gateway and native explorer runtime; local mode proxies Angular.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {WebSocket, WebSocketServer} = require('ws');
const sharp = require('sharp');
const {providerStatus} = require('./provider-health.cjs');
const STATIC_ROOT = process.env.LTC_STATIC_ROOT && path.resolve(process.env.LTC_STATIC_ROOT);
const ROUTER_ORIGIN = process.env.LTC_ROUTER_ORIGIN || 'http://127.0.0.1:4312';
const SITE_ORIGIN = process.env.LTC_SITE_ORIGIN || 'http://127.0.0.1:4310';
const PRIMARY = process.env.LTC_PROVIDER || 'https://litecoinspace.org';
const cache = new Map(), inflight = new Map(), failedPaths = new Map();
const health = {primary: PRIMARY, lastSuccess: null, lastFailure: null, websocket: 'connecting'};
const MAX_CACHE = 500;
function result(data, source='litecoinspace', status=200) {return {data,source,status,at:Date.now()};}
async function fetchData(url, timeout=7000, metadata=false) {
 const r=await fetch(url,{signal:AbortSignal.timeout(timeout)});
 const raw=await r.text(); let data;try {data=JSON.parse(raw);}catch {data=raw;}
 if(!r.ok) throw Object.assign(new Error(`Provider HTTP ${r.status}`),{status:r.status});
 return metadata ? {data,headers:Object.fromEntries(['x-total-count','retry-after'].filter(h=>r.headers.has(h)).map(h=>[h,r.headers.get(h)]))} : data;
}
async function fallback(path) {
 if(path==='/api/blocks/tip/height' || path==='/api/blocks/tip/hash') {
  const d=await fetchData('https://api.blockcypher.com/v1/ltc/main',4000);
  return result(path.endsWith('height')?String(d.height):d.hash,'blockcypher');
 }
 const m=path.match(/^\/api\/(?:v1\/)?block(?:-height)?\/([a-f0-9]{64}|\d+)$/);
 if(m) {
  const b=await fetchData('https://api.blockcypher.com/v1/ltc/main/blocks/'+m[1]+'?txstart=1&limit=1',4000);
  if(path.includes('block-height')) return result(b.hash,'blockcypher');
  // BlockCypher does not supply weight or all fees; don't fabricate an extended block.
  throw new Error('Extended block unavailable from fallback');
 }
 throw new Error('No independent equivalent for this capability');
}
function ttl(path) {
 if(/^\/api\/block-height\/\d+$/.test(path) || /^\/api\/(?:v1\/)?block\/[a-f0-9]{64}(?:\/.*)?$/.test(path))return 300000;
 if(path.includes('statistics')||path.includes('/mining/'))return 60000;
 if(path.includes('prices'))return 60000;
 return 5000;
}
async function api(path) {
 const saved=cache.get(path);
 if(saved && Date.now()-saved.at<ttl(path))return saved;
 if(inflight.has(path))return inflight.get(path);
 const pending=(async()=>{
  try {
   const {data,headers}=await fetchData(PRIMARY+path,7000,true);
   health.lastSuccess=Date.now();failedPaths.delete(path);
   const r={...result(data),headers};cache.delete(path);cache.set(path,r);
   if(cache.size>MAX_CACHE)cache.delete(cache.keys().next().value);
   return r;
  } catch(e) {
   // 404 is entity absence, never convert a timeout/outage to absence.
   if(e.status===404) {failedPaths.delete(path);return result({error:'Not found'},'litecoinspace',404);}
   failedPaths.set(path,Date.now());if(failedPaths.size>500)failedPaths.delete(failedPaths.keys().next().value);
   health.lastFailure={at:Date.now(),message:e.message};
   try{return await fallback(path);}catch{}
   if(saved && Date.now()-saved.at<3600000)return {...saved,stale:true};
   return result({error:'Provider unavailable',retryable:true},'unavailable',503);
  } finally {inflight.delete(path);}
 })();inflight.set(path,pending);return pending;
}
function send(res,status,data,type='application/json',headers={}) {
 res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store',...headers});res.end(typeof data==='string'||Buffer.isBuffer(data)?data:JSON.stringify(data));
}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function metadata(path) {
 const m=path.match(/^\/(tx|block|address)\/([A-Za-z0-9]+)$/);
 let title='ltc.tx.taxi · Litecoin explorer', description='Explore Litecoin blocks, transparent transactions, indexed addresses and the live provider mempool.';
 if(m) {
  const kind=m[1],id=m[2];title=`Litecoin ${kind} ${id} · ltc.tx.taxi`;
  let p=kind==='block'?'/api/v1/block/'+id:'/api/'+kind+'/'+id;
  if(kind==='block' && /^\d+$/.test(id)) {const h=await api('/api/block-height/'+id);if(h.status===200)p='/api/v1/block/'+h.data;}
  const r=await api(p);
  if(r.status===200) {
   if(kind==='tx')description=`${r.data.status?.confirmed?'Confirmed':'Pending'} Litecoin transaction. Fee: ${(r.data.fee/1e8).toFixed(8)} LTC. Transparent outputs; MWEB amounts remain private.`;
   if(kind==='block')description=`Litecoin block ${r.data.height}. ${r.data.tx_count} transactions. Mined ${new Date(r.data.timestamp*1000).toISOString()}.`;
   if(kind==='address')description=`Litecoin address with ${r.data.chain_stats?.tx_count ?? 'indexed'} confirmed transactions. Transparent-chain history.`;
  } else description='Litecoin entity data is temporarily unavailable. Retry to retrieve current details.';
 }
 return {title,description,path:m?path:'/'};
}
async function card(path) {
 const m=await metadata(path),lines=[m.title.length>66?m.title.slice(0,61)+'…':m.title,...m.description.match(/.{1,75}(?:\s|$)/g)||[]];
 const logo=fs.readFileSync(__dirname+'/../frontend/src/resources/branding/ltc-dark-navbar.svg').toString('base64');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#111827"/><rect x="0" y="0" width="1200" height="12" fill="#789de0"/><image href="data:image/svg+xml;base64,${logo}" x="65" y="60" width="360" height="80"/><text x="65" y="205" font-family="DejaVu Sans" font-size="24" fill="#789de0">LITECOIN · TRANSPARENT CHAIN</text>${lines.map((l,i)=>`<text x="65" y="${285+i*52}" font-family="DejaVu Sans" font-size="${i?24:27}" fill="#e4e7ec">${escape(l.trim())}</text>`).join('')}<text x="65" y="570" font-family="DejaVu Sans" font-size="22" fill="#9ca3af">ltc.tx.taxi</text></svg>`;
 return sharp(Buffer.from(svg)).png().toBuffer();
}
const server=http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://localhost');
 try {
  if(req.method!=='GET' && req.method!=='HEAD')return send(res,405,{error:'Read-only local explorer'});
  if(u.pathname.startsWith('/local-router/')) {
   const path=u.pathname.slice('/local-router'.length)+u.search;
   if(!/^\/(api|assets)\//.test(path)) {res.writeHead(302,{location:ROUTER_ORIGIN+path});return res.end();}
   const r=await fetch(ROUTER_ORIGIN+path,{signal:AbortSignal.timeout(12000),redirect:'manual'});
   if(r.status>=300&&r.status<400) { const dest=r.headers.get('location');res.writeHead(r.status,{location:dest});return res.end(); }
   return send(res,r.status,Buffer.from(await r.arrayBuffer()),r.headers.get('content-type')||'application/json');
  }
  if(u.pathname==='/healthz')return send(res,200,{...providerStatus(health,failedPaths),cacheEntries:cache.size});
  if(u.pathname==='/api/local-resolve') {
   try {return send(res,200,await fetchData(ROUTER_ORIGIN+'/api/v1/resolve?value='+encodeURIComponent(u.searchParams.get('value')||''),12000));} catch {return send(res,503,{unavailable:true});}
  }
  if(u.pathname.startsWith('/api/')) {
   const r=await api(u.pathname+u.search);
   return send(res,r.status,r.data,typeof r.data==='string'?'text/plain':'application/json',{...r.headers,'X-LTC-Source':r.source,'X-LTC-Stale':String(!!r.stale),'X-LTC-Observed-At':String(r.at)});
  }
  if(u.pathname.startsWith('/resources/mining-pools/')) {
   const r=await fetch(PRIMARY+u.pathname,{signal:AbortSignal.timeout(5000)});return send(res,r.status,Buffer.from(await r.arrayBuffer()),r.headers.get('content-type')||'image/svg+xml');
  }
  if(u.pathname==='/og.png') return send(res,200,await card(u.searchParams.get('path')||'/'),'image/png');
  if(u.pathname.startsWith('/source/')||u.pathname.endsWith('.map'))return send(res,404,{error:'Not found'});
  let r;
  if(STATIC_ROOT) {
   const relative=decodeURIComponent(u.pathname).replace(/^\/+/, '');
   let file=path.resolve(STATIC_ROOT,relative);
   if(file!==STATIC_ROOT&&!file.startsWith(STATIC_ROOT+path.sep))return send(res,404,{error:'Not found'});
   if(!path.extname(relative))file=path.join(STATIC_ROOT,'index.html');
   let bytes;try{bytes=await fs.promises.readFile(file);}catch{return send(res,404,{error:'Not found'});}
   const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.webmanifest':'application/manifest+json','.txt':'text/plain','.wasm':'application/wasm'};
   r=new Response(bytes,{headers:{'content-type':types[path.extname(file)]||'application/octet-stream'}});
  } else r=await fetch('http://127.0.0.1:4311'+req.url,{headers:{accept:req.headers.accept||'*/*'},signal:AbortSignal.timeout(15000)});
  const type=r.headers.get('content-type')||'text/plain';
  if(type.includes('text/html')) {
   let html=await r.text();const m=await metadata(u.pathname),origin=SITE_ORIGIN;
   html=html.replace(/<title>[\s\S]*?<\/title>/,'').replace(/<meta[^>]+(?:name|property)=["'](?:description|og:[^"']+|twitter:[^"']+)["'][^>]*>/g,'').replace(/<link[^>]+rel=["']canonical["'][^>]*>/g,'');
   html=html.replace('</head>',`<title>${escape(m.title)}</title><meta name="description" content="${escape(m.description)}"><link rel="canonical" href="https://ltc.tx.taxi${escape(m.path)}"><meta property="og:title" content="${escape(m.title)}"><meta property="og:description" content="${escape(m.description)}"><meta property="og:type" content="website"><meta property="og:image" content="${origin}/og.png?path=${encodeURIComponent(m.path)}"><meta property="og:url" content="https://ltc.tx.taxi${escape(m.path)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(m.title)}"><meta name="twitter:description" content="${escape(m.description)}"><meta name="twitter:image" content="${origin}/og.png?path=${encodeURIComponent(m.path)}"></head>`);
   return send(res,r.status,html,type);
  }
  return send(res,r.status,Buffer.from(await r.arrayBuffer()),type);
 }catch(e){send(res,503,{error:'Local service unavailable',message:e.message});}
});
const wss=new WebSocketServer({noServer:true});
server.on('upgrade',(req,socket,head)=>{
 if(req.url==='/api/v1/ws')wss.handleUpgrade(req,socket,head,client=>wss.emit('connection',client));
 else {
  if(STATIC_ROOT){socket.destroy();return;}
  // Preserve Angular incremental rebuild notifications.
  const upstream=http.request({host:'127.0.0.1',port:4311,path:req.url,headers:req.headers});
  upstream.on('upgrade',(r,s,h)=>{socket.write('HTTP/1.1 101 Switching Protocols\r\n'+Object.entries(r.headers).map(([k,v])=>`${k}: ${v}`).join('\r\n')+'\r\n\r\n');if(h.length)socket.write(h);if(head.length)s.write(head);s.pipe(socket).pipe(s);});upstream.on('error',()=>socket.destroy());upstream.end();
 }
});
wss.on('connection',client=>{
 const upstream=new WebSocket(PRIMARY.replace(/^http/,'ws')+'/api/v1/ws',{handshakeTimeout:7000});let queue=[];
 upstream.on('open',()=>{health.websocket='live';for(const m of queue)upstream.send(m);queue=[];});
 client.on('message',m=>{if(upstream.readyState===1)upstream.send(m);else if(queue.length<25)queue.push(m.toString());});
 upstream.on('message',m=>{health.lastSuccess=Date.now();if(client.readyState===1)client.send(m.toString());});
 upstream.on('error',()=>{health.websocket='unavailable';client.close(1013,'Provider unavailable');});
 upstream.on('close',()=>{health.websocket='disconnected';if(client.readyState===1)client.close(1012,'Reconnect provider');});
 client.on('close',()=>upstream.close());client.on('error',()=>upstream.close());
});
server.listen(Number(process.env.PORT||9332),process.env.LTC_HOST||'127.0.0.1',()=>console.log('LTC adapter on 127.0.0.1:'+ (process.env.PORT||9332)));
// Separate public local review port; same handler includes initial metadata.
if(!process.env.PORT)http.createServer(server.listeners('request')[0]).on('upgrade',server.listeners('upgrade')[0]).listen(4310,'127.0.0.1');
