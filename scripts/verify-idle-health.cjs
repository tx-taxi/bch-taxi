const http=require('node:http'),{spawn}=require('node:child_process'),assert=require('node:assert/strict');
let calls=0,down=false;
const provider=http.createServer((req,res)=>{calls++;res.writeHead(down?503:200,{'content-type':'application/json'});res.end(down?'{}':'{"count":12,"vsize":1200,"total_fee":500}');});
(async()=>{
 await new Promise(r=>provider.listen(0,'127.0.0.1',r));
 const child=spawn(process.execPath,['adapter/server.cjs'],{env:{...process.env,PORT:'9346',LTC_PROVIDER:`http://127.0.0.1:${provider.address().port}`},stdio:'ignore'});
 try {
  let response;
  for(let i=0;i<40;i++){try{response=await fetch('http://127.0.0.1:9346/api/provider-health');break;}catch{await new Promise(r=>setTimeout(r,100));}}
  let h=await response.json();assert.equal(h.stale,false,'a healthy provider must not show a stale warning to the first visitor');assert.equal(calls,1);
  await fetch('http://127.0.0.1:9346/api/provider-health');assert.equal(calls,1,'fresh data avoids unnecessary upstream probes');
  down=true;await new Promise(r=>setTimeout(r,30500));h=await (await fetch('http://127.0.0.1:9346/api/provider-health')).json();assert.equal(h.degraded,true);assert.equal(h.stale,false);
  await new Promise(r=>setTimeout(r,60000));h=await (await fetch('http://127.0.0.1:9346/api/provider-health')).json();assert.equal(h.stale,true,'an actual prolonged outage must retain the stale warning');
  down=false;h=await (await fetch('http://127.0.0.1:9346/api/provider-health')).json();assert.equal(h.stale,false);assert.equal(h.degraded,false);console.log('PASS first visitor, probe reuse, actual outage, prolonged stale data, recovery');
 }finally{child.kill();provider.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
