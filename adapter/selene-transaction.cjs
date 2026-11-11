'use strict';
const hash=/^[a-f0-9]{64}$/i;
const fail=message=>{throw Object.assign(Error(message),{status:503});};
const value=n=>Number.isSafeInteger(n)&&n>=0?n:fail('Transaction value unavailable');
function mapOutput(o){const script=o.scriptPubKey;return {value:value(o.satoshis),scriptpubkey:script?.hex||'',scriptpubkey_asm:script?.asm||'',scriptpubkey_type:({pubkeyhash:'p2pkh',scripthash:'p2sh',pubkey:'p2pk',nulldata:'op_return'})[script?.type]||'unknown',scriptpubkey_address:script?.address||o.address,...(o.tokenData?{tokenData:o.tokenData}:{})};}
async function seleneTransaction(id,read){
 const first=await read('/tx/'+id,15000);
 if(first.txid!==id||!Array.isArray(first.vin)||!Array.isArray(first.vout))fail('Fallback transaction identity mismatch');
 const bytes=typeof first.hex==='string'&&/^(?:[a-f0-9]{2})+$/i.test(first.hex)?Buffer.from(first.hex,'hex'):null;
 if(!bytes||bytes.length!==first.size||require('node:crypto').createHash('sha256').update(require('node:crypto').createHash('sha256').update(bytes).digest()).digest().reverse().toString('hex')!==id)fail('Fallback transaction bytes mismatch');
 const vin=[...first.vin],vout=[...first.vout];
 const pages=Math.max(first.pagination?.inputs?.pages||1,first.pagination?.outputs?.pages||1);
 if(!Number.isSafeInteger(pages)||pages>100)fail('Transaction pagination exceeds bound');
 for(let page=2;page<=pages;page++){
  const ip=Math.min(page,first.pagination.inputs.pages),op=Math.min(page,first.pagination.outputs.pages);
  const part=await read(`/tx/${id}?input_page=${ip}&output_page=${op}`,15000);
  if(part.txid!==id||part.input_count!==first.input_count||part.output_count!==first.output_count||part.blockhash!==first.blockhash)fail('Transaction changed during pagination');
  if(page<=first.pagination.inputs.pages)vin.push(...part.vin);
  if(page<=first.pagination.outputs.pages)vout.push(...part.vout);
 }
 if(vin.length!==first.input_count||vout.length!==first.output_count||vin.some((v,i)=>v.n!==i)||vout.some((v,i)=>v.n!==i))fail('Incomplete transaction inputs or outputs');
 if(!first.coinbase&&!first.economics?.complete)fail('Transaction fee unavailable');
 if(!Number.isInteger(first.confirmations)||first.confirmations<0)fail('Confirmation state unavailable');
 if(!first.coinbase&&vin.reduce((sum,i)=>sum+value(i.prevout?.satoshis),0)-vout.reduce((sum,o)=>sum+value(o.satoshis),0)!==first.economics.fee_satoshis)fail('Transaction fee does not reconcile');
 const confirmed=first.confirmations>0;
 if(confirmed&&(!hash.test(first.blockhash)||!Number.isSafeInteger(first.height)||first.height<0||!Number.isSafeInteger(first.blocktime)))fail('Confirmation metadata unavailable');
 return {txid:id,version:first.version,locktime:first.locktime,size:first.size,weight:first.size*4,fee:first.coinbase?0:value(first.economics.fee_satoshis),
  vin:vin.map(i=>({txid:i.txid||'0'.repeat(64),vout:i.vout??4294967295,is_coinbase:!!first.coinbase,scriptsig:i.coinbase||i.scriptSig?.hex||'',scriptsig_asm:i.scriptSig?.asm||'',sequence:i.sequence,prevout:first.coinbase?null:mapOutput(i.prevout||{})})),vout:vout.map(mapOutput),
  status:{confirmed,...(confirmed?{block_height:first.height,block_hash:first.blockhash,block_time:first.blocktime}:{})},firstSeen:first.time,tokenMetadataUnavailable:false};
}
module.exports={seleneTransaction};
