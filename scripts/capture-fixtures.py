import requests,json,pathlib,time
p=pathlib.Path('review/fixtures');p.mkdir(exist_ok=True)
s=requests.Session()
def get(path,name):
 r=s.get('https://litecoinspace.org/api/'+path,timeout=15);r.raise_for_status();d=r.json();(p/(name+'.json')).write_text(json.dumps(d,indent=2));return d
blocks=get('v1/blocks','recent-blocks');b=blocks[1]
txs=get('block/'+b['id']+'/txs','recent-transactions');tx=next(t for t in txs if not t['vin'][0]['is_coinbase'] and all(x.get('prevout') for x in t['vin']))
get('tx/'+tx['txid'],'simple-transaction');get('block/e11049dfa5858be3809f285685e12a5d6f84b936b0f8e8272b5363bf3946ce60/txs','historical-transactions')
a=tx['vout'][0].get('scriptpubkey_address') or 'LYhttvnKawAv6RcHQ4eBkNtifuiEA99PFe';get('address/'+a,'address');hist=get('address/'+a+'/txs','address-history');pending=get('mempool/recent','pending')
facts={'capturedAt':time.time(),'provider':'https://litecoinspace.org','txid':tx['txid'],'block':b['id'],'historicalBlock':'e11049dfa5858be3809f285685e12a5d6f84b936b0f8e8272b5363bf3946ce60','address':a,'pending':pending[0]['txid'] if pending else None,'feeLitoshis':tx['fee'],'inputLitoshis':sum(x['prevout']['value'] for x in tx['vin']),'outputLitoshis':sum(x['value'] for x in tx['vout'])}
assert facts['inputLitoshis']-facts['outputLitoshis']==facts['feeLitoshis']
(p/'facts.json').write_text(json.dumps(facts,indent=2));print(json.dumps(facts,indent=2))
