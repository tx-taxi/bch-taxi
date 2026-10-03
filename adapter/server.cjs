'use strict';
// Bitcoin Cash API gateway and native explorer runtime; local mode proxies Angular.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const staticSeo = require('./static-seo.cjs');
const {WebSocket, WebSocketServer} = require('ws');
const sharp = require('sharp');
const {providerStatus} = require('./provider-health.cjs');
const STATIC_ROOT = process.env.BCH_STATIC_ROOT && path.resolve(process.env.BCH_STATIC_ROOT);
const ROUTER_ORIGIN = process.env.BCH_ROUTER_ORIGIN || 'http://127.0.0.1:4340';
const SITE_ORIGIN = process.env.BCH_SITE_ORIGIN || 'http://127.0.0.1:4361';
const PRIMARY = process.env.BCH_PROVIDER || 'https://api.haskoin.com/bch';
const cache = new Map(), inflight = new Map(), failedPaths = new Map();
const health = {primary: PRIMARY, blockFallback:'https://explorer.selene.cash/api/v1', mempool:'https://explorer.selene.cash/api/v1', price:'https://bch.fullstack.cash/v6', lastSuccess: null, lastFailure: null, websocket: 'connecting'};
const MAX_CACHE = 500;
function result(data, source='bitcoincashspace', status=200) {return {data,source,status,at:Date.now()};}
async function fetchData(url, timeout=7000, metadata=false) {
 const r=await fetch(url,{signal:AbortSignal.timeout(timeout)});
 const raw=await r.text(); let data;try {data=JSON.parse(raw);}catch {data=raw;}
 if(!r.ok) throw Object.assign(new Error(`Provider HTTP ${r.status}`),{status:r.status});
 return metadata ? {data,headers:Object.fromEntries(['x-total-count','retry-after'].filter(h=>r.headers.has(h)).map(h=>[h,r.headers.get(h)]))} : data;
}
async function fallback(path) {
 if(path==='/api/blocks/tip/height' || path==='/api/blocks/tip/hash') {
  const d=await fetchData('https://api.blockcypher.com/v1/bch/main',4000);
  return result(path.endsWith('height')?String(d.height):d.hash,'blockcypher');
 }
 const m=path.match(/^\/api\/(?:v1\/)?block(?:-height)?\/([a-f0-9]{64}|\d+)$/);
 if(m) {
  const b=await fetchData('https://api.blockcypher.com/v1/bch/main/blocks/'+m[1]+'?txstart=1&limit=1',4000);
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
const provider=require('./bch-provider.cjs');
async function api(path) {
 try {const data=await provider.api(path);if(['/api/v1/init-data','/api/mempool'].includes(path))health.lastSuccess=Date.now();failedPaths.delete(path);return result(data,'haskoin-bchn');}
 catch(e){if(e.status!==404&&e.status!==501){failedPaths.set(path,Date.now());health.lastFailure={at:Date.now(),path,message:e.message};}return result({error:e.message,retryable:e.status!==404&&e.status!==501},'unavailable',e.status||503);}
}

function send(res,status,data,type='application/json',headers={}) {
 res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store',...headers});res.end(typeof data==='string'||Buffer.isBuffer(data)?data:JSON.stringify(data));
}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function metadata(path) {
 path = staticSeo.normalize(path);
 const documentPage = staticSeo.page(path);
 if (documentPage) return {...documentPage, cardDescription:documentPage.description};
 const m=staticSeo.entity(path) ? path.match(/^\/(tx|block|address)\/([A-Za-z0-9:]+)$/) : null;
 let entityStatus;
 let cardDescription='Entity data temporarily unavailable. Please retry.';
 let title='bch.tx.taxi - Bitcoin Cash Explorer', description='Explore Bitcoin Cash blocks, transactions, addresses, fees and mining activity.';
 if(m) {
  const kind=m[1],id=m[2];title=`Bitcoin Cash ${kind} ${id} - bch.tx.taxi`;
  let p=kind==='block'?'/api/v1/block/'+id:'/api/'+kind+'/'+id;
  if(kind==='block' && /^\d+$/.test(id)) {const h=await api('/api/block-height/'+id);if(h.status===200)p='/api/v1/block/'+h.data;}
  const r=await api(p);
  entityStatus=r.status;
  if(r.status===200) {
   if(kind==='tx')description=`${r.data.status?.confirmed?'Confirmed':'Pending'} Bitcoin Cash transaction. Fee: ${(r.data.fee/1e8).toFixed(8)} BCH. `;
   if(kind==='block')description=`Bitcoin Cash block ${r.data.height}. ${r.data.tx_count} transactions. Mined ${new Date(r.data.timestamp*1000).toISOString()}.`;
   if(kind==='address')description=`Bitcoin Cash address with ${r.data.chain_stats?.tx_count ?? 'indexed'} confirmed transactions. Indexed CashAddr history.`;
   if(kind==='tx')cardDescription=`${r.data.status?.confirmed?'Confirmed':'Pending'} transaction · Fee: ${(r.data.fee/1e8).toFixed(8)} BCH`;
   if(kind==='block')cardDescription=`Block ${r.data.height} · ${r.data.tx_count} transaction${r.data.tx_count===1?'':'s'} · ${new Date(r.data.timestamp*1000).toISOString().slice(0,10)}`;
   if(kind==='address')cardDescription=`${r.data.chain_stats?.tx_count ?? 'Indexed'} confirmed transaction${r.data.chain_stats?.tx_count===1?'':'s'}`;
  } else description='Bitcoin Cash entity data is temporarily unavailable. Retry to retrieve current details.';
 }
 return {title,description,cardDescription,path,entityStatus};
}
const cardTemplate=fs.readFileSync(__dirname+'/assets/social-card.svg','utf8');
const cardLogo='data:image/svg+xml;base64,'+fs.readFileSync(__dirname+'/../frontend/src/resources/branding/bch-dark-navbar.svg').toString('base64');
async function card(path) {
 const m=await metadata(path), entity=m.path.match(/^\/(tx|block|address)\/([A-Za-z0-9:]+)$/);
 const headline=entity?({tx:'transaction',block:'block',address:'address'}[entity[1]]):'explorer';
 const subtitle=entity?m.cardDescription:'Live Bitcoin Cash blocks, transactions, fees and mining.';
 const bounded=subtitle.length>61?subtitle.slice(0,60).trimEnd()+'…':subtitle;
 const identifier=entity?`<text x="80" y="548" fill="#747474" font-family="DejaVu Sans Mono, monospace" font-size="18">${escape(entity[2])}</text>`:'';
 const values={headline:escape(headline),subtitle:escape(bounded),logo:cardLogo,identifier};
 const svg=cardTemplate.replace(/\{\{(headline|subtitle|logo|identifier)\}\}/g,(_,key)=>values[key]);
 return sharp(Buffer.from(svg)).png().toBuffer();
}
const server=http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://localhost');
 try {
  if(req.method!=='GET' && req.method!=='HEAD')return send(res,405,{error:'Read-only local explorer'});
  const crawl = staticSeo.endpoint(u.pathname);
  if (crawl) {
   res.writeHead(crawl.status || 200, {'Content-Type':crawl.type || 'text/plain; charset=utf-8','Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff',...crawl.headers});
   return res.end(req.method === 'HEAD' ? undefined : crawl.body);
  }
  const canonicalRedirect = staticSeo.redirect(u.pathname);
  if (canonicalRedirect) {res.writeHead(308,{Location:'https://bch.tx.taxi'+canonicalRedirect});return res.end();}
  if(u.pathname.startsWith('/local-router/')) {
   const path=u.pathname.slice('/local-router'.length)+u.search;
   if(!/^\/(api|assets)\//.test(path)) {res.writeHead(302,{location:ROUTER_ORIGIN+path});return res.end();}
   const r=await fetch(ROUTER_ORIGIN+path,{signal:AbortSignal.timeout(12000),redirect:'manual'});
   if(r.status>=300&&r.status<400) { const dest=r.headers.get('location');res.writeHead(r.status,{location:dest});return res.end(); }
   return send(res,r.status,Buffer.from(await r.arrayBuffer()),r.headers.get('content-type')||'application/json');
  }
  if(u.pathname==='/api/provider-health') {
   // An idle gateway has no observations, not evidence of an upstream outage.
   // Probe current mempool data before reporting stale health to a visitor.
   if(!health.lastSuccess || Date.now()-health.lastSuccess>30000)await api('/api/mempool');
   return send(res,200,{...providerStatus(health,failedPaths),cacheEntries:cache.size});
  }
  if(u.pathname==='/healthz')return send(res,200,{...providerStatus(health,failedPaths),cacheEntries:cache.size});
  if(u.pathname==='/api/local-resolve') {
   try {return send(res,200,await fetchData(ROUTER_ORIGIN+'/api/v1/resolve?value='+encodeURIComponent(u.searchParams.get('value')||''),12000));} catch {return send(res,503,{unavailable:true});}
  }
  if(u.pathname.startsWith('/api/')) {
   const r=await api(u.pathname+u.search);
   return send(res,r.status,r.data,typeof r.data==='string'?'text/plain':'application/json',{...r.headers,'X-BCH-Source':r.source,'X-BCH-Stale':String(!!r.stale),'X-BCH-Observed-At':String(r.at)});
  }
  if(u.pathname.startsWith('/resources/mining-pools/')) {
   return send(res,200,fs.readFileSync(__dirname+'/../frontend/src/resources/mining-pools/default.svg'),'image/svg+xml');
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
  } else r=await fetch('http://127.0.0.1:4360'+req.url,{headers:{accept:req.headers.accept||'*/*'},signal:AbortSignal.timeout(15000)});
  const type=r.headers.get('content-type')||'text/plain';
  if(type.includes('text/html')) {
   let html=await r.text();const m=await metadata(u.pathname),origin=SITE_ORIGIN;
   const preview = staticSeo.data.socialScreenshot;
   html=html.replace(/<title>[\s\S]*?<\/title>/,'').replace(/<meta[^>]+(?:name|property)=["'](?:description|og:[^"']+|twitter:[^"']+)["'][^>]*>/g,'').replace(/<link[^>]+rel=["']canonical["'][^>]*>/g,'');
   html=html.replace('</head>',`<title>${escape(m.title)}</title><meta name="description" content="${escape(m.description)}"><link id="canonical" rel="canonical" href="https://bch.tx.taxi${escape(m.path)}"><meta property="og:title" content="${escape(m.title)}"><meta property="og:description" content="${escape(m.description)}"><meta property="og:type" content="website"><meta property="og:site_name" content="bch.tx.taxi"><meta property="og:locale" content="en_US"><meta property="og:image" content="${escape(preview.url)}"><meta property="og:url" content="https://bch.tx.taxi${escape(m.path)}"><meta property="og:image:type" content="${preview.mime}"><meta property="og:image:alt" content="${escape(preview.alt)}"><meta property="og:image:width" content="${preview.width}"><meta property="og:image:height" content="${preview.height}"><meta name="twitter:domain" content="bch.tx.taxi"><meta name="twitter:image:alt" content="${escape(preview.alt)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(m.title)}"><meta name="twitter:description" content="${escape(m.description)}"><meta name="twitter:image" content="${escape(preview.url)}"></head>`);
   const documentPage = staticSeo.page(u.pathname);
   const semanticPage = documentPage || (staticSeo.entity(u.pathname) ? {...m,label:m.title,html:`<p>${escape(m.description)}</p>`} : null);
   html = staticSeo.render(html, semanticPage).replace('</head>',staticSeo.headLinks(documentPage)+'</head>');
   const noindex = staticSeo.nonIndexable(u.pathname);
   return send(res,noindex && !staticSeo.existingNonIndexable(u.pathname) ? 404 : m.entityStatus || r.status,req.method === 'HEAD' ? undefined : html,type,noindex ? {'X-Robots-Tag':'noindex, follow'} : {});
  }
  return send(res,r.status,Buffer.from(await r.arrayBuffer()),type);
 }catch(e){send(res,503,{error:'Local service unavailable',message:e.message});}
});
const wss=new WebSocketServer({noServer:true});
server.on('upgrade',(req,socket,head)=>{
 socket.on('error',()=>socket.destroy());
 if(req.url==='/api/v1/ws')wss.handleUpgrade(req,socket,head,client=>wss.emit('connection',client));
 else {
  if(STATIC_ROOT){socket.destroy();return;}
  // Preserve Angular incremental rebuild notifications.
  const upstream=http.request({host:'127.0.0.1',port:4360,path:req.url,headers:req.headers});
  upstream.on('upgrade',(r,s,h)=>{s.on('error',()=>{s.destroy();socket.destroy();});socket.on('close',()=>s.destroy());socket.write('HTTP/1.1 101 Switching Protocols\r\n'+Object.entries(r.headers).map(([k,v])=>`${k}: ${v}`).join('\r\n')+'\r\n\r\n');if(h.length)socket.write(h);if(head.length)s.write(head);s.pipe(socket).pipe(s);});upstream.on('error',()=>socket.destroy());upstream.end();
 }
});
let latestSnapshot, refreshInFlight;
function refresh() {
 if(refreshInFlight)return refreshInFlight;
 refreshInFlight=collectSnapshot().finally(()=>{refreshInFlight=null;});
 return refreshInFlight;
}
async function collectSnapshot() {try {
 const previous=latestSnapshot?.blocks.at(-1);latestSnapshot=await provider.snapshot();provider.record(latestSnapshot);failedPaths.delete('live-snapshot');health.lastSuccess=Date.now();health.websocket='live';
 const tip=latestSnapshot.blocks.at(-1);
 for(const client of wss.clients)if(client.readyState===1){
   if(client.trackedTx){try {const t=await provider.api('/api/tx/'+client.trackedTx);if(t.status.confirmed&&!client.trackedConfirmed){const confirmedBlock=latestSnapshot.blocks.find(b=>b.height===t.status.block_height)||await provider.api('/api/block/'+t.status.block_hash);client.send(JSON.stringify({block:confirmedBlock,txConfirmed:t.txid}));client.trackedConfirmed=true;}client.send(JSON.stringify({tx:t}));}catch(e){client.send(JSON.stringify({trackedTransactionUnavailable:true}));}}
   if(previous&&tip.height>previous.height)client.send(JSON.stringify({block:tip}));
   client.send(JSON.stringify(latestSnapshot));
 }
}catch(e){failedPaths.set('live-snapshot',Date.now());health.lastFailure={at:Date.now(),message:e.message};health.websocket='unavailable';for(const client of wss.clients)client.close(1013,'Provider unavailable');}}
wss.on('connection',client=>{client.on('message',raw=>{(async()=>{let m;try{m=JSON.parse(raw)}catch{return;}if(m['track-tx']==='stop')client.trackedTx=null;if(m['track-tx']&&m['track-tx']!=='stop'){client.trackedTx=m['track-tx'];client.trackedConfirmed=false;const t=await api('/api/tx/'+m['track-tx']);if(t.status===200){client.trackedConfirmed=t.data.status.confirmed;client.send(JSON.stringify({tx:t.data}));}}

if(m.action==='ping')return client.send(JSON.stringify({pong:true}));if(latestSnapshot)client.send(JSON.stringify(latestSnapshot));else await refresh();})().catch(()=>client.close(1013,'Provider unavailable'));});client.on('error',()=>{});});
setInterval(refresh,15000);refresh();

server.listen(Number(process.env.PORT||4361),process.env.BCH_HOST||'127.0.0.1',()=>console.log('BCH adapter on 127.0.0.1:'+ (process.env.PORT||4361)));
