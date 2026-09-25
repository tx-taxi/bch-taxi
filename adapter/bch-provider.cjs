'use strict';
// Bitcoin Cash mappings from Haskoin's documented BCH index and BCHN data.
const H=process.env.BCH_INDEXER||'https://api.haskoin.com/bch';
const S=process.env.BCH_NODE||'https://explorer.selene.cash/api/v1';
const F=process.env.BCH_FALLBACK||'https://bch.fullstack.cash/v6';
const cache=new Map(), pending=new Map(), stats=[];
const status={lastSuccess:null,lastFailure:null,source:H};
async function read(url,ttl=15000,body) {
 const key=url+JSON.stringify(body||''), saved=cache.get(key);if(saved&&Date.now()-saved.at<ttl)return saved.data;
 if(pending.has(key))return pending.get(key);
 const req=(async()=>{try{let r=await fetch(url,{signal:AbortSignal.timeout(10000),...(body?{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}:{})});if(r.status===503){await new Promise(resolve=>setTimeout(resolve,350));r=await fetch(url,{signal:AbortSignal.timeout(10000)});}if(!r.ok)throw Object.assign(Error(`Provider HTTP ${r.status}`),{status:r.status});const data=await r.json();if(data.error||data.success===false)throw Error(data.error||'Provider request failed');cache.set(key,{data,at:Date.now()});if(cache.size>800)cache.delete(cache.keys().next().value);status.lastSuccess=Date.now();return data;}catch(e){status.lastFailure={at:Date.now(),message:e.message};throw e;}finally{pending.delete(key);}})();pending.set(key,req);return req;
}
const h=(p,ttl)=>read(H+p,ttl);
const sat=n=>Math.round(Number(n)*1e8);
const scriptType=s=>s?.startsWith('76a914')?'p2pkh':(s?.startsWith('a914')||s?.startsWith('aa20'))?'p2sh':s?.startsWith('6a')?'op_return':'unknown';
function output(o){return {value:o.value,scriptpubkey:o.pkscript,scriptpubkey_asm:'',scriptpubkey_type:scriptType(o.pkscript),scriptpubkey_address:o.address,...(o.token?{token:o.token}:{})};}
function transaction(t,b){return {tokenMetadataUnavailable:true,txid:t.txid,version:t.version,locktime:t.locktime,size:t.size,weight:t.size*4,fee:t.fee,vin:t.inputs.map(i=>({txid:i.txid,vout:i.output,is_coinbase:i.coinbase,scriptsig:i.sigscript,scriptsig_asm:'',sequence:i.sequence,prevout:i.coinbase?null:output(i)})),vout:t.outputs.map(output),status:{confirmed:!!t.block,block_height:t.block?.height,block_hash:b?.hash,block_time:t.block?t.time:undefined},firstSeen:t.time};}
function difficulty(bits){const exponent=bits>>>24, mantissa=bits&0xffffff;return 0xffff/mantissa*Math.pow(256,0x1d-exponent);}
function block(b){return {id:b.hash,height:b.height,version:b.version,timestamp:b.time,tx_count:b.tx.length,size:b.size,weight:b.size*4,merkle_root:b.merkle,previousblockhash:b.previous,nonce:b.nonce,bits:b.bits,difficulty:difficulty(b.bits),extras:{reward:b.subsidy+b.fees,totalFees:b.fees,totalTx:b.tx.length,totalSize:b.size,avgFee:b.tx.length>1?b.fees/(b.tx.length-1):0,avgFeeRate:b.fees/b.size,coinbaseRaw:'',pool:{id:0,name:'Unattributed',slug:'unknown',minerNames:[]},matchRate:undefined}};}
async function rawBlock(id){try {if(/^\d+$/.test(String(id)))return (await h('/block/height/'+id,300000))[0];return await h('/block/'+id,300000);}catch(e){const b=await read(S+'/block/'+id,300000);const reward=b.tx[0].vout.reduce((s,o)=>s+sat(o.value),0),subsidy=Math.floor(50e8/2**Math.floor(b.height/210000));return {hash:b.hash,height:b.height,time:b.time,size:b.size,version:b.version,bits:parseInt(b.bits,16),nonce:b.nonce,previous:b.previousblockhash,merkle:b.merkleroot,tx:b.tx.map(t=>t.txid),subsidy,fees:reward-subsidy};}}
async function tx(id){const t=await h('/transaction/'+id,15000);let b;if(t.block)b=await rawBlock(t.block.height);const mapped=transaction(t,b);try{const native=await read(S+'/tx/'+id,60000);mapped.tokenMetadataUnavailable=false;for(let i=0;i<mapped.vout.length;i++){const o=native.vout[i];if(o?.scriptPubKey?.address)mapped.vout[i].scriptpubkey_address=o.scriptPubKey.address;if(o?.tokenData){mapped.vout[i].tokenData=o.tokenData;mapped.tokenInputDetailsUnavailable=true;}}}catch{mapped.tokenMetadataUnavailable=true;}return mapped;}
async function blocks(height){if(!height)return (await h('/block/latest',30000)).sort((a,b)=>b.height-a.height).slice(0,15).map(block);const heights=Array.from({length:10},(_,i)=>Math.max(0,Number(height)-i));const out=[];for(const height of heights)out.push(block(await rawBlock(height)));return out;}
async function pool(){return read(S+'/mempool',10000);}
async function snapshot(){const [bs,p]=await Promise.all([blocks(),pool()]);const nodeBlock=await read(S+'/block/'+bs[0].id,300000);const maxBlockBytes=nodeBlock.ablastate?.nextblocksizelimit;if(!Number.isSafeInteger(maxBlockBytes)||maxBlockBytes<32000000)throw Error('Current BCH ABLA block limit unavailable');const fees=p.transactions.map(t=>t.fee_rate).sort((a,b)=>a-b),totalFee=sat(p.summary.total_fee);const recent=p.transactions.slice(0,6),details=recent.length?await h('/transactions?txids='+recent.map(t=>t.txid).join(','),15000):[];return {blocks:[...bs].reverse(),maxBlockBytes,da:{adjustedTimeAvg:600000,timeAvg:600000,timeOffset:0},mempoolInfo:{size:p.summary.size,bytes:p.summary.bytes,usage:p.summary.usage,maxmempool:p.summary.maxmempool,mempoolminfee:p.summary.mempoolminfee,minrelaytxfee:p.summary.minrelaytxfee,total_fee:totalFee},'mempool-blocks':p.summary.size?[{blockSize:p.summary.bytes,blockVSize:p.summary.bytes,nTx:p.summary.size,totalFees:totalFee,medianFee:fees[Math.floor(fees.length/2)],feeRange:fees.length?[fees[0],fees.at(-1)]:[],transactionIds:p.transactions.map(t=>t.txid)}]:[],transactions:details.map(t=>({txid:t.txid,fee:t.fee,vsize:t.size,value:t.outputs.reduce((v,o)=>v+o.value,0)})),vBytesPerSecond:p.transactions.filter(t=>t.time>Date.now()/1000-60).reduce((v,t)=>v+t.size,0)/60,fees:{minimumFee:p.summary.minrelaytxfee*1e5,fastestFee:fees.at(-1)??p.summary.minrelaytxfee*1e5,halfHourFee:fees[Math.floor(fees.length*.75)]??p.summary.minrelaytxfee*1e5,hourFee:fees[Math.floor(fees.length*.5)]??p.summary.minrelaytxfee*1e5,economyFee:fees[0]??p.summary.minrelaytxfee*1e5},backendInfo:{hostname:'bch.tx.taxi',version:'local'},loadingIndicators:{mempool:100},conversions:await prices().catch(()=>({}))};}
async function prices(){const p=await read(F+'/price/bchusd',60000);return {USD:p.usd};}
async function address(a){const b=await h('/address/'+encodeURIComponent(a)+'/balance',20000),recent=await h('/address/'+encodeURIComponent(a)+'/transactions/full?limit=1000',20000),pending=recent.filter(t=>!t.block).length;if(pending===1000)throw Error('Address pending count exceeds bounded index window');return {address:b.address,utxo_count:b.utxo,chain_stats:{funded_txo_sum:b.received,spent_txo_sum:b.received-b.confirmed,tx_count:b.txs-pending},mempool_stats:{funded_txo_sum:Math.max(b.unconfirmed,0),spent_txo_sum:Math.max(-b.unconfirmed,0),tx_count:pending}};}
async function history(a,after){const ts=await h('/address/'+encodeURIComponent(a)+'/transactions/full?limit=25'+(after?'&height='+after+'&offset=1':''),20000);const bs=new Map();await Promise.all([...new Set(ts.filter(t=>t.block).map(t=>t.block.height))].map(async height=>bs.set(height,await rawBlock(height))));return ts.map(t=>transaction(t,bs.get(t.block?.height)));}
async function pendingTiles(ids){const rows=[];for(let start=0;start<Math.min(ids.length,100);start+=20){const ts=await h('/transactions?txids='+ids.slice(start,start+20).join(','),15000);rows.push(...ts.map(t=>[t.txid,t.fee,t.size,t.outputs.reduce((a,o)=>a+o.value,0),t.fee/t.size,0,t.time]));}return rows;}
async function api(path){const u=new URL(path,'http://local'),p=u.pathname;let m;
 if(p.startsWith('/api/v1/statistics/'))return [...stats].reverse();
 if(p==='/api/v1/init-data')return snapshot();
 if(p==='/api/v1/prices')return prices();
 if(p==='/api/blocks/tip/height')return String((await h('/block/best',15000)).height);
 if(p==='/api/blocks/tip/hash')return (await h('/block/best',15000)).hash;
 if(m=p.match(/^\/api\/block-height\/(\d+)$/))return (await rawBlock(m[1])).hash;
 if(m=p.match(/^\/api\/(?:v1\/)?blocks(?:\/(\d+))?$/))return blocks(m[1]);
 if(m=p.match(/^\/api\/(?:v1\/)?block\/([a-f0-9]{64}|\d+)$/))return block(await rawBlock(m[1]));
 if(m=p.match(/^\/api\/block\/([^/]+)\/txs(?:\/(\d+))?$/)){const b=await rawBlock(m[1]);const ids=b.tx.slice(Number(m[2]||0),Number(m[2]||0)+25);return (await h('/transactions?txids='+ids.join(','),300000)).map(t=>transaction(t,b));}
 if(m=p.match(/^\/api\/v1\/block\/([^/]+)\/summary$/)){const b=await rawBlock(m[1]);const ts=await h('/transactions/block/'+b.hash,300000);return ts.map(t=>({txid:t.txid,vsize:t.size,fee:t.fee,value:t.outputs.reduce((s,o)=>s+o.value,0)}));}
 if(m=p.match(/^\/api\/tx\/([^/]+)\/outspends$/)){const t=await h('/transaction/'+m[1],60000);return t.outputs.map(o=>({spent:o.spent,txid:o.spender?.txid,vin:o.spender?.input,status:undefined}));}
 if(m=p.match(/^\/api\/tx\/([^/]+)$/))return tx(m[1]);
 if(m=p.match(/^\/api\/tx\/([^/]+)\/hex$/))return h('/transaction/'+m[1]+'/raw');
 if(m=p.match(/^\/api\/address\/([^/]+)\/txs\/summary$/)){const a=decodeURIComponent(m[1]),ts=await h('/address/'+encodeURIComponent(a)+'/transactions/full?limit=100',20000);return ts.map(t=>({txid:t.txid,height:t.block?.height||0,time:t.time,tx_position:t.block?.position,value:t.outputs.filter(o=>o.address===a).reduce((v,o)=>v+o.value,0)-t.inputs.filter(o=>o.address===a).reduce((v,o)=>v+o.value,0)}));}
 if(m=p.match(/^\/api\/address\/([^/]+)\/txs(?:\/chain(?:\/([^/]+))?)?$/))return history(decodeURIComponent(m[1]),m[2]);
 if(m=p.match(/^\/api\/address\/([^/]+)$/))return address(decodeURIComponent(m[1]));
 if(m=p.match(/^\/api\/v1\/validate-address\/(.+)$/)){await address(decodeURIComponent(m[1]));return {isvalid:true,address:decodeURIComponent(m[1])};}
 if(p==='/api/mempool'){const s=await snapshot();return {count:s.mempoolInfo.size,vsize:s.mempoolInfo.bytes,total_fee:s.mempoolInfo.total_fee};}
 if(p==='/api/v1/fees/mempool-blocks')return (await snapshot())['mempool-blocks'];
 if(p==='/api/v1/fees/recommended')return (await snapshot()).fees;
 if(p==='/api/mempool/recent')return (await snapshot()).transactions;
 if(p==='/api/txs/outspends')return Promise.all((u.searchParams.get('txids')||'').split(',').filter(Boolean).slice(0,25).map(id=>api('/api/tx/'+id+'/outspends')));
 if(p==='/api/v1/backend-info')return {version:'BCH local candidate',gitCommit:'6ba310ede'};

 if(p.startsWith('/api/v1/mining/reward-stats/')){const bs=await blocks();return {startBlock:bs.at(-1).height,endBlock:bs[0].height,totalReward:bs.reduce((s,b)=>s+b.extras.reward,0),totalFee:bs.reduce((s,b)=>s+b.extras.totalFees,0),totalTx:bs.reduce((s,b)=>s+b.tx_count-1,0)};}
 if(p.startsWith('/api/v1/mining/blocks/fees'))return (await blocks()).reverse().map(b=>({timestamp:b.timestamp,avgHeight:b.height,avgFees:b.extras.totalFees}));
 if(p.startsWith('/api/v1/mining/blocks/rewards'))return (await blocks()).reverse().map(b=>({timestamp:b.timestamp,avgHeight:b.height,avgRewards:b.extras.reward}));
 if(p.startsWith('/api/v1/mining/blocks/sizes-weights')){const bs=(await blocks()).reverse();return {sizes:bs.map(b=>({timestamp:b.timestamp,avgHeight:b.height,avgSize:b.size})),weights:bs.map(b=>({timestamp:b.timestamp,avgHeight:b.height,avgWeight:b.weight}))};}
 if(p.startsWith('/api/v1/mining/hashrate')){const bs=(await blocks()).reverse();const points=bs.slice(1).map((b,i)=>({timestamp:b.timestamp,avgHashrate:bs.slice(1,i+2).reduce((sum,x)=>sum+x.difficulty*2**32,0)/Math.max(1,b.timestamp-bs[0].timestamp)}));return {currentHashrate:points.at(-1)?.avgHashrate,currentDifficulty:bs.at(-1).difficulty,hashrates:points,difficulty:bs.map(b=>({time:b.timestamp,difficulty:b.difficulty}))};}
 if(p.startsWith('/api/v1/mining/difficulty-adjustments')){const bs=await blocks();return bs.slice(0,-1).map((b,i)=>[b.timestamp,b.height,b.difficulty,b.difficulty/bs[i+1].difficulty]);}

 throw Object.assign(Error('BCH capability not yet implemented: '+p),{status:501});
}
module.exports={api,snapshot,status,transaction,block,pendingTiles,record(s){const stat={added:Math.floor(Date.now()/1000),count:s.mempoolInfo.size,vbytes_per_second:s.vBytesPerSecond,total_fee:s.mempoolInfo.total_fee,mempool_byte_weight:s.mempoolInfo.bytes*4,vsizes:[]};stats.push(stat);if(stats.length>480)stats.shift();s['live-2h-chart']=stat;}};
