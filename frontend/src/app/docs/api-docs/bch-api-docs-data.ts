export interface BchDocsItem {
  type: 'category' | 'endpoint';
  category: string;
  fragment: string;
  title: string;
  method?: string;
  path?: string;
  description?: string;
  request?: string;
  response?: string;
}

const tipHash = '0000000000000000000000000000000000000000000000000000000000000000';
const txid = 'bcf7ae875b585e00a61055372c1e99046b20f5fbfcd8659959afb6f428326bfa';
const cashaddr = 'bitcoincash:qpazjhpjetdf287vyfvslgg868mdqs4p2v0583dq6t';

export const bchFaqDocs: BchDocsItem[] = [
  { type: 'category', category: 'Explorer', fragment: 'explorer', title: 'Using the explorer' },
  { type: 'endpoint', category: 'Explorer', fragment: 'search', title: 'Search blocks, transactions and addresses', description: 'Search supports BCH block heights, block hashes, transaction IDs, CashAddr and legacy BCH addresses. A 64-character hash can be meaningful on more than one chain, so tx.taxi keeps the chain selector available when resolution is ambiguous.' },
  { type: 'endpoint', category: 'Explorer', fragment: 'amounts', title: 'Amounts, fees and pending data', description: '1 BCH equals 100,000,000 satoshis. This explorer displays fee rates in satoshis per serialized byte (sat/B). Pending data is one BCHN node observation and can differ from another node or miner. Fee observations guide expectations; they do not guarantee confirmation.' },
  { type: 'category', category: 'Addresses', fragment: 'addresses', title: 'Addresses and UTXOs' },
  { type: 'endpoint', category: 'Addresses', fragment: 'cashaddr', title: 'CashAddr and legacy addresses', description: 'CashAddr may include the bitcoincash: prefix. Legacy 1/3 addresses are shared with Bitcoin-derived networks, so they need explicit chain context. Address history is indexed in pages of 25 transactions; the balance endpoint reports source-provided UTXO totals.' },
  { type: 'endpoint', category: 'Addresses', fragment: 'tokens', title: 'CashTokens', description: 'CashTokens are decoded only when the BCHN source provides token data for an output. The displayed category and raw token units are separate from the BCH value of that output. This explorer does not infer input token quantities, token names, symbols, or decimal scales when the source does not verify them.' },
  { type: 'category', category: 'Network', fragment: 'network', title: 'Blocks, mining and availability' },
  { type: 'endpoint', category: 'Network', fragment: 'mining', title: 'Mining coverage', description: 'The mining view derives recent reward, fee, difficulty and elapsed-work hashrate estimates from the latest indexed blocks. It is a recent-window view, not a long-range mining history. Bitcoin Cash targets roughly 600 seconds per block; ASERT adjusts difficulty after each block.' },
  { type: 'endpoint', category: 'Network', fragment: 'availability', title: 'Data availability', description: 'The explorer reads indexed BCH data from Haskoin and uses BCHN-derived Selene data for pending transactions and token output details. A provider failure is reported as unavailable rather than a missing entity. Historical fiat conversion is not available; the displayed USD price is current only.' },
];

export const bchRestDocs: BchDocsItem[] = [
  { type: 'category', category: 'Chain', fragment: 'chain', title: 'Chain data' },
  { type: 'endpoint', category: 'Chain', fragment: 'tip-height', title: 'Get tip height', method: 'GET', path: '/api/blocks/tip/height', description: 'Returns the current indexed BCH tip height as plain text.', response: '902000' },
  { type: 'endpoint', category: 'Chain', fragment: 'tip-hash', title: 'Get tip hash', method: 'GET', path: '/api/blocks/tip/hash', description: 'Returns the current indexed BCH tip hash as plain text.', response: tipHash },
  { type: 'endpoint', category: 'Blocks', fragment: 'block-height', title: 'Resolve a block height', method: 'GET', path: '/api/block-height/:height', description: 'Resolves a block height to its block hash.', request: 'curl https://bch.tx.taxi/api/block-height/500000', response: tipHash },
  { type: 'endpoint', category: 'Blocks', fragment: 'block', title: 'Get a block', method: 'GET', path: '/api/block/:hash-or-height', description: 'Returns a normalized block with BCH amount fields in satoshis. /api/v1/block/:hash-or-height is also accepted.', request: 'curl https://bch.tx.taxi/api/block/500000', response: '{\n  "id": "…",\n  "height": 500000,\n  "timestamp": 0,\n  "tx_count": 0,\n  "size": 0,\n  "extras": { "reward": 0, "totalFees": 0 }\n}' },
  { type: 'endpoint', category: 'Blocks', fragment: 'block-txids', title: 'Get complete block transaction IDs', method: 'GET', path: '/api/block/:hash-or-height/txids', description: 'Returns the complete raw transaction ID list for the block. This is the source for the explorer’s complete block coverage.', request: 'curl https://bch.tx.taxi/api/block/500000/txids', response: '["…", "…"]' },
  { type: 'endpoint', category: 'Blocks', fragment: 'block-transactions', title: 'Get a block transaction page', method: 'GET', path: '/api/block/:hash-or-height/txs/:start-index', description: 'Returns up to 25 normalized transactions beginning at start-index. Omit start-index for the first page.', request: 'curl https://bch.tx.taxi/api/block/500000/txs/0', response: '[{ "txid": "…", "status": { "confirmed": true } }]' },
  { type: 'category', category: 'Transactions', fragment: 'transactions', title: 'Transactions and outputs' },
  { type: 'endpoint', category: 'Transactions', fragment: 'transaction', title: 'Get a transaction', method: 'GET', path: '/api/tx/:txid', description: 'Returns inputs, outputs, fee and confirmation status. CashToken output data appears only when it is available from the BCHN source.', request: `curl https://bch.tx.taxi/api/tx/${txid}`, response: '{\n  "txid": "…",\n  "fee": 0,\n  "size": 0,\n  "vin": [],\n  "vout": [],\n  "status": { "confirmed": true }\n}' },
  { type: 'endpoint', category: 'Transactions', fragment: 'outspends', title: 'Get output spend state', method: 'GET', path: '/api/tx/:txid/outspends', description: 'Returns one spend-state entry per transaction output.', request: `curl https://bch.tx.taxi/api/tx/${txid}/outspends`, response: '[{ "spent": false }]' },
  { type: 'category', category: 'Addresses', fragment: 'api-addresses', title: 'Addresses' },
  { type: 'endpoint', category: 'Addresses', fragment: 'address', title: 'Get an address summary', method: 'GET', path: '/api/address/:address', description: 'Returns indexed confirmed and pending statistics plus the source-reported UTXO count. Pending UTXO deltas are not separately available.', request: `curl 'https://bch.tx.taxi/api/address/${cashaddr}'`, response: '{\n  "address": "bitcoincash:…",\n  "utxo_count": 0,\n  "chain_stats": { "tx_count": 0 },\n  "mempool_stats": { "tx_count": 0 }\n}' },
  { type: 'endpoint', category: 'Addresses', fragment: 'address-history', title: 'Get address history', method: 'GET', path: '/api/address/:address/txs/chain/:last-confirmed-txid', description: 'Returns a 25-transaction history page. Omit /chain/:last-confirmed-txid for the first page.', request: `curl 'https://bch.tx.taxi/api/address/${cashaddr}/txs'`, response: '[{ "txid": "…", "status": { "confirmed": true } }]' },
  { type: 'category', category: 'Pending', fragment: 'pending', title: 'Pending and mining observations' },
  { type: 'endpoint', category: 'Pending', fragment: 'mempool', title: 'Get pending summary', method: 'GET', path: '/api/mempool', description: 'Returns the observed BCHN mempool count, serialized bytes and total fee in satoshis.', response: '{ "count": 0, "vsize": 0, "total_fee": 0 }' },
  { type: 'endpoint', category: 'Pending', fragment: 'fees', title: 'Get observed fee values', method: 'GET', path: '/api/v1/fees/recommended', description: 'Returns observed fee values in sat/B from the current pending sample.', response: '{ "fastestFee": 1, "halfHourFee": 1, "hourFee": 1, "economyFee": 1, "minimumFee": 1 }' },
  { type: 'endpoint', category: 'Mining', fragment: 'mining-api', title: 'Get recent mining series', method: 'GET', path: '/api/v1/mining/blocks/fees', description: 'Returns the recent indexed block fee series. Related implemented endpoints provide rewards, block sizes and hashrate/difficulty from the same recent window.', response: '[{ "timestamp": 0, "avgHeight": 0, "avgFees": 0 }]' },
];

export const bchWebsocketDocs: BchDocsItem[] = [
  { type: 'category', category: 'Connection', fragment: 'connection', title: 'Connection' },
  { type: 'endpoint', category: 'Connection', fragment: 'ws-connect', title: 'Connect', path: 'wss://bch.tx.taxi/api/v1/ws', description: 'The gateway sends its current live snapshot after a client message. Snapshots contain the latest blocks, pending sample, observed fee values and current USD conversion when available.', request: 'new WebSocket("wss://bch.tx.taxi/api/v1/ws")', response: '{ "blocks": [], "mempoolInfo": {}, "fees": {} }' },
  { type: 'endpoint', category: 'Connection', fragment: 'ws-ping', title: 'Ping', description: 'Send an application-level ping to confirm that the gateway is responsive.', request: '{ "action": "ping" }', response: '{ "pong": true }' },
  { type: 'category', category: 'Tracking', fragment: 'tracking', title: 'Transaction tracking' },
  { type: 'endpoint', category: 'Tracking', fragment: 'ws-track-tx', title: 'Track one transaction', description: 'Track a single transaction ID. The gateway sends the current transaction and polls it with the live refresh cycle. When it becomes confirmed, a block and txConfirmed notification are sent.', request: `{ "track-tx": "${txid}" }`, response: '{ "tx": { "txid": "…", "status": { "confirmed": false } } }\n\n{ "block": { "id": "…" }, "txConfirmed": "…" }' },
  { type: 'endpoint', category: 'Tracking', fragment: 'ws-stop', title: 'Stop tracking', description: 'Stop the currently tracked transaction.', request: '{ "track-tx": "stop" }' },
];
