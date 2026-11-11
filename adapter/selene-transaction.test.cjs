'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {seleneTransaction}=require('./selene-transaction.cjs');
const original=require('./fixtures/selene-confirmed-tx.json');
test('node fallback preserves verified transaction identity, confirmation height, fees and CashTokens',async()=>{
 const t=await seleneTransaction(original.txid,async()=>original);
 assert.equal(t.status.block_height,976810);assert.equal(t.status.block_hash,original.blockhash);assert.equal(t.status.confirmed,true);
 assert.equal(t.fee,1240);assert.equal(t.vin.length,5);assert.equal(t.vout.length,5);assert.equal(t.vout[0].tokenData.category,original.vout[0].tokenData.category);
});
test('missing confirmation fields, partial data and mismatched bytes cannot become a confirmed transaction',async()=>{
 for(const change of [d=>delete d.confirmations,d=>delete d.height,d=>d.vin.pop(),d=>d.hex='00',d=>d.economics.fee_satoshis++]){
  const d=structuredClone(original);change(d);await assert.rejects(seleneTransaction(d.txid,async()=>d));
 }
});
test('pending transactions do not inherit old confirmation metadata',async()=>{
 const d={...original,confirmations:0};const t=await seleneTransaction(d.txid,async()=>d);assert.deepEqual(t.status,{confirmed:false});
});
