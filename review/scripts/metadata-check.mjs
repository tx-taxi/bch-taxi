import {chromium} from '/home/lukee/.local/share/pnpm/global/5/.pnpm/playwright@1.59.1/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';import fs from 'node:fs';
const origin=process.argv[2]||'http://127.0.0.1:4310';
const browser=await chromium.launch({executablePath:'/home/lukee/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',headless:true});
try{
 const p=await browser.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!m.text().startsWith('Failed to load resource'))errors.push(m.text());});
 const html=await(await p.request.get(origin+'/')).text();assert.match(html,/<title>ltc.tx.taxi - Litecoin Explorer<\/title>/);assert.match(html,/id="canonical"/);assert.match(html,/property="og:image:alt"/);assert.doesNotMatch(html,/live provider mempool/);
 await p.goto(origin+'/block/100000');await p.locator('app-block h1').filter({hasText:'100000'}).waitFor({timeout:30000});
 assert.match(await p.title(),/ltc\.tx\.taxi/);assert.doesNotMatch(await p.title(),/Litecoin block 100000 - ltc\.tx\.taxi -/);
 await p.locator('a[href="/"]').first().click();await p.waitForURL(origin+'/');await p.waitForTimeout(1200);
 assert.equal(await p.title(),'ltc.tx.taxi - Litecoin Explorer');assert.equal(await p.locator('meta[name="description"]').getAttribute('content'),'Explore Litecoin blocks, transactions, addresses, fees and mining activity.');
 assert.match(await p.locator('meta[property="og:image"]').getAttribute('content'),/og\.png\?v=2&path=%2F$/);assert.equal(new URL(await p.locator('#canonical').getAttribute('href')).href,'https://ltc.tx.taxi/');assert.deepEqual(errors,[]);
 const report={at:new Date().toISOString(),origin,checks:['initial HTML identity and alt text','entity hydration','in-app root title/description reset','versioned root image','canonical DOM hook','no JavaScript errors']};console.log(report);fs.writeFileSync('/home/lukee/dev/ltc-taxi/review/deployment/metadata/'+(origin.startsWith('https')?'public':'local')+'.json',JSON.stringify(report,null,2));
}finally{await browser.close();}
