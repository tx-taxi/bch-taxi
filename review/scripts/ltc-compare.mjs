import { chromium } from '/home/lukee/.local/share/pnpm/global/5/.pnpm/playwright@1.59.1/node_modules/playwright/index.mjs';
import fs from 'node:fs';import sharp from '/home/lukee/dev/ltc-taxi/adapter/node_modules/sharp/lib/index.js';
const dir='/home/lukee/dev/ltc-taxi/review';const b=await chromium.launch({headless:true,executablePath:'/home/lukee/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'}),report=[];
for(const [size,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
 for(const [chain,origin] of [['btc','http://127.0.0.1:4313'],['ltc','http://127.0.0.1:4310']]){
  const p=await b.newPage({viewport});
  if(chain==='btc') {
   const chains=JSON.parse(fs.readFileSync('/home/lukee/dev/ltc-taxi/.local/router-chains.json'));
   await p.route('https://tx.taxi/api/v1/chains',r=>r.fulfill({json:chains}));
   await p.route('https://tx.taxi/api/v1/health',r=>r.fulfill({json:{explorers:[]}}));
  }
  await p.goto(origin,{waitUntil:'domcontentloaded',timeout:120000});await p.locator('.search-chain-trigger').first().waitFor({timeout:120000});await p.waitForTimeout(2500);
  if(!await p.locator('.search-chain-trigger').first().isVisible()){await p.locator('.navbar-toggler').first().click();}
  for(const state of ['closed','open','ethereum']){
   if(state==='open')await p.locator('.search-chain-trigger').first().click();
   if(state==='ethereum'){(await p.locator('.search-chain-menu .search-chain-option').filter({hasText:'Ethereum'}).first().locator('button').count()) ? await p.locator('.search-chain-menu .search-chain-select').filter({hasText:'Ethereum'}).click() : await p.locator('.search-chain-menu .search-chain-option').filter({hasText:'Ethereum'}).first().click();await p.waitForTimeout(400);}
   await p.screenshot({path:`${dir}/compare-${chain}-${size}-${state}.png`});
   report.push({chain,size,state,...await p.evaluate(()=>{const s=document.querySelector('.search-form-row'),menu=document.querySelector('.search-chain-menu'),input=s.querySelector('input'),btn=s.querySelector('.search-submit');return {accent:getComputedStyle(s).getPropertyValue('--search-chain-accent'),inputBg:getComputedStyle(input).backgroundColor,buttonBg:getComputedStyle(btn).backgroundColor,selected:[...menu.querySelectorAll('.is-current')].map(x=>x.textContent.trim()),width:menu.getBoundingClientRect().width,overflow:document.documentElement.scrollWidth>innerWidth};})});
  }await p.close();
 }
 for(const state of ['closed','open','ethereum']){const w=viewport.width,h=viewport.height;await sharp({create:{width:w*2,height:h,channels:4,background:'#111827'}}).composite([{input:`${dir}/compare-btc-${size}-${state}.png`,left:0,top:0},{input:`${dir}/compare-ltc-${size}-${state}.png`,left:w,top:0}]).png().toFile(`${dir}/comparison-${size}-${state}.png`);}
}
fs.writeFileSync(dir+'/comparison.json',JSON.stringify(report,null,2));await b.close();console.log(report);
