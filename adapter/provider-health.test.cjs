const {test}=require('node:test');
const assert=require('node:assert/strict');
const {providerStatus}=require('./provider-health.cjs');
test('healthy live data does not retain a warning from an abandoned failed route',()=>{
 const failures=new Map([['/api/address/old/txs',100000]]);
 assert.equal(providerStatus({lastSuccess:110000},failures,110001).degraded,true);
 const recovered=providerStatus({lastSuccess:200000},failures,200001);
 assert.equal(recovered.degraded,false);
 assert.equal(recovered.stale,false);
});
test('current partial failure and stale aggregate data remain distinct',()=>{
 const failures=new Map([['/api/address/current/txs',200000]]);
 const partial=providerStatus({lastSuccess:200000},failures,200001);
 assert.equal(partial.degraded,true);
 assert.equal(partial.stale,false);
 assert.equal(providerStatus({lastSuccess:100000},failures,200001).stale,true);
});
