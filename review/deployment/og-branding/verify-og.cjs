const fs=require('fs'),vm=require('vm'),path=require('path');
const sharp=require('/home/lukee/dev/ltc-taxi/adapter/node_modules/sharp');
const ts=require('/home/lukee/dev/xmr-explorer-row-actions/frontend/node_modules/typescript');
const root='/home/lukee/dev';
fs.mkdirSync('/tmp/og-review',{recursive:true});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const short=(s,n)=>String(s).length>n?String(s).slice(0,n-3)+'...':String(s);
(async()=>{
for(const chain of ['btc','eth']){
const repo=`${root}/${chain}-explorer-row-actions`;
const source=fs.readFileSync(`${repo}/${chain==='btc'?'og':'adapter'}/server.cjs`,'utf8');
const name=chain==='btc'?'cardSvg':'ogImageSvg';
const code=source.slice(source.indexOf(`function ${name}(`),source.indexOf('\nasync function ',source.indexOf(`function ${name}(`)));
const logo='data:image/svg+xml;base64,'+fs.readFileSync(`${repo}/frontend/src/resources/branding/${chain}-dark-navbar.svg`).toString('base64');
const context={logo,ogBrandLogo:()=>logo,escape:esc,ogEscape:esc,short,ogShort:short,OG_IMAGE_WIDTH:1200,OG_IMAGE_HEIGHT:630};vm.createContext(context);vm.runInContext(code,context);
for(const kind of ['transaction','block','address',...(chain==='eth'?['token']:[])]){
const entity={heading:`${chain==='btc'?'Bitcoin':'Ethereum'} ${kind}`,subtitle:kind==='transaction'?'0x0123456789abcdef · Confirmed':'Public chain metadata',rows:[['Status','Confirmed'],['Block','1,234,567'],['Fee',chain==='btc'?'0.000014 BTC':'0.000041 ETH'],['Value','1.25'],['Timestamp','2026-09-24 22:00 UTC'],['Network','Mainnet']]};
await sharp(Buffer.from(context[name](entity,{url:`https://${chain}.tx.taxi/${kind}/0123456789`}))).png().toFile(`/tmp/og-review/${chain}-${kind}.png`);
}
}
const repo=`${root}/xmr-explorer-row-actions`;
const source=fs.readFileSync(`${repo}/backend/src/api/monero/xmr-entity-meta.routes.ts`,'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2020}}).outputText;
const context={Buffer,exports:{},require:n=>n==='sharp'?sharp:require(n),process:{env:{XMR_CARD_LOGO_PATH:`${repo}/frontend/src/resources/branding/xmr-dark-navbar.svg`}},__dirname:'/tmp',setTimeout};vm.createContext(context);vm.runInContext(compiled,context);
const routes=new context.exports.XmrEntityMetaRoutes({getTransactionByHash:async()=>({tx_hash:'a'.repeat(64),block_height:1234567}),getBlockByHeight:async()=>({block_header:{height:1234567,hash:'a'.repeat(64),num_txes:42}})});
for(const kind of ['tx','block']){await routes.card({params:{kind,id:kind==='tx'?'a'.repeat(64):'1234567'}},{setHeader(){},type(){return this},send(png){if(!Buffer.isBuffer(png))throw Error(png);fs.writeFileSync(`/tmp/og-review/xmr-${kind}.png`,png)},status(n){throw Error(n)}})}
const template=fs.readFileSync(`${root}/ltc-taxi/adapter/assets/social-card.svg`,'utf8');
const logo='data:image/svg+xml;base64,'+fs.readFileSync(`${root}/ltc-taxi/frontend/src/resources/branding/ltc-dark-navbar.svg`).toString('base64');
console.log(template.match(/\{[^}]+\}/g)?.slice(-10));
for(const chain of ['bitcoin','ethereum','monero','litecoin'])fs.copyFileSync(`${root}/router-og-review/public/assets/og/explorers/${chain}.png`,`/tmp/og-review/${chain}-root.png`);
console.log('Rendered native entity cards and copied root cards to /tmp/og-review');
})();
