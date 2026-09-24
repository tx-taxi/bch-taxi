import {chromium} from '/home/lukee/.local/share/pnpm/global/5/.pnpm/playwright@1.59.1/node_modules/playwright/index.mjs';
import {createRequire} from 'node:module';import fs from 'node:fs';import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{WebSocket}=require('/home/lukee/dev/ltc-taxi/adapter/node_modules/ws');
const dir='/home/lukee/dev/ltc-taxi/review/deployment/connection';
async function initial(host){return new Promise((resolve,reject)=>{const s=new WebSocket('wss://'+host+'/api/v1/ws');const timer=setTimeout(()=>{s.terminate();reject(Error('init timeout'));},12000);s.on('open',()=>s.send('{"action":"init"}'));s.on('message',m=>{clearTimeout(timer);s.close();resolve(m.toString());});s.on('error',reject);});}
const fixtures={ltc:await initial('ltc.tx.taxi'),btc:await initial('btc.tx.taxi')};
const browser=await chromium.launch({executablePath:'/home/lukee/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',headless:true});const results=[];
try{
for(const [chain,origin] of [['btc','https://btc.tx.taxi'],['ltc',process.argv[2]||'http://127.0.0.1:4310']])for(const [size,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
 const p=await browser.newPage({viewport});let socket;let sendInit=true;let opened=0;
 await p.routeWebSocket('**/api/v1/ws',ws=>{socket=ws;opened++;ws.onMessage(m=>{if(JSON.parse(m).action==='init'&&sendInit){ws.send(fixtures[chain]);ws.send('{"rbfLatestSummary":[]}');}});});
 await p.goto(origin+'/');await p.waitForTimeout(1600);const badge=p.locator('.connection-badge .badge:visible');assert.equal(await badge.count(),0);
 if(chain==='ltc'){assert.equal(await p.getByText('No replacements in the current feed.',{exact:true}).count(),1);assert.equal(await p.getByText('Pending Transactions : All',{exact:true}).count(),0);}
 sendInit=false;socket.close({code:1012,reason:'Simulated backend restart'});await badge.filter({hasText:/^Offline$/i}).waitFor();await p.screenshot({path:`${dir}/${chain}-${size}-offline.png`});
 if(chain==='ltc'){assert.equal(await p.getByText('No replacements in the current feed.',{exact:true}).count(),0);}
 await badge.filter({hasText:'Reconnecting...'}).waitFor({timeout:8000});await p.screenshot({path:`${dir}/${chain}-${size}-reconnecting.png`});
 assert.ok(opened>=2);sendInit=true;socket.send(fixtures[chain]);socket.send('{"rbfLatestSummary":[]}');await badge.waitFor({state:'hidden'});await p.screenshot({path:`${dir}/${chain}-${size}-recovered.png`});
 results.push({chain,size,checks:['Offline after clean backend restart','Reconnecting during new handshake','recovered after fresh data'],connections:opened});await p.close();
}
const p=await browser.newPage();await p.clock.install();await p.routeWebSocket('**/api/v1/ws',ws=>ws.onMessage(()=>{}));await p.goto((process.argv[2]||'http://127.0.0.1:4310')+'/');await p.clock.runFor(35100);await p.locator('.connection-badge .badge:visible').filter({hasText:/^Offline$/i}).waitFor();results.push({chain:'ltc',checks:['silent initial connection times out to Offline']});await p.close();
fs.writeFileSync(dir+'/'+(process.argv[2]?'public':'local')+'.json',JSON.stringify({at:new Date().toISOString(),results},null,2));console.log(results);
}finally{await browser.close();}
