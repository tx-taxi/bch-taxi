'use strict';

// Selene currently returns block metadata and a paginated transaction summary,
// rather than a verbose coinbase transaction. Keep partial IDs internal until
// every page is verified; block metadata can still be shown while Haskoin is down.
const idPattern = /^[a-f0-9]{64}$/i;
const unavailable = message => Object.assign(new Error(message), { status: 503 });
const sats = value => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw unavailable('Block reward data unavailable');
  const result = Math.round(value * 1e8);
  if (!Number.isSafeInteger(result)) throw unavailable('Block reward data unavailable');
  return result;
};

function parseSeleneBlock(block) {
  if (!block || !idPattern.test(block.hash || '') || !Number.isSafeInteger(block.height) || !Array.isArray(block.tx)) {
    throw unavailable('Block data unavailable from fallback');
  }
  const tx = block.tx.map(t => typeof t === 'string' ? t : t?.txid);
  if (!tx.length || tx.some(id => !idPattern.test(id || '')) || new Set(tx).size !== tx.length) {
    throw unavailable('Block transaction IDs unavailable from fallback');
  }
  const count = block.nTx ?? block.pagination?.total ?? tx.length;
  const pages = block.pagination?.pages ?? 1;
  if (!Number.isSafeInteger(count) || count < tx.length || !Number.isSafeInteger(pages) || pages < 1 ||
      (block.pagination && (block.pagination.page !== 1 || block.pagination.total !== count))) {
    throw unavailable('Block pagination unavailable from fallback');
  }
  let subsidy, fees;
  if (block.stats?.subsidy != null && block.stats?.totalfee != null) {
    subsidy = sats(block.stats.subsidy); fees = sats(block.stats.totalfee);
  } else {
    const coinbase = block.tx[0];
    if (!Array.isArray(coinbase?.vout)) throw unavailable('Block reward data unavailable from fallback');
    subsidy = Math.floor(50e8 / 2 ** Math.floor(block.height / 210000));
    fees = coinbase.vout.reduce((sum, output) => sum + sats(output.value), 0) - subsidy;
    if (!Number.isSafeInteger(fees) || fees < 0) throw unavailable('Block reward data unavailable from fallback');
  }
  const bits = typeof block.bits === 'string' && /^[0-9a-f]{1,8}$/i.test(block.bits) ? parseInt(block.bits, 16) : NaN;
  if (!Number.isSafeInteger(block.time) || !Number.isSafeInteger(block.size) || !Number.isFinite(bits)) {
    throw unavailable('Block metadata unavailable from fallback');
  }
  return { hash: block.hash, height: block.height, time: block.time, size: block.size, version: block.version,
    bits, nonce: block.nonce, previous: block.previousblockhash, merkle: block.merkleroot, tx,
    tx_count: count, txComplete: tx.length === count, selenePages: pages, subsidy, fees };
}

async function completeSeleneBlock(raw, fetchPage) {
  if (raw.txComplete !== false) return raw;
  if (raw.selenePages > 100) throw unavailable('Block transaction list is too large to fetch from fallback');
  const ids = [...raw.tx];
  for (let page = 2; page <= raw.selenePages; page++) {
    const next = await fetchPage(page);
    if (next?.hash !== raw.hash || next.pagination?.page !== page || next.pagination?.pages !== raw.selenePages ||
        next.pagination?.total !== raw.tx_count || !Array.isArray(next.tx)) {
      throw unavailable('Incomplete block transaction IDs from fallback');
    }
    ids.push(...next.tx.map(t => typeof t === 'string' ? t : t?.txid));
  }
  if (ids.length !== raw.tx_count || ids.some(id => !idPattern.test(id || '')) || new Set(ids).size !== ids.length) {
    throw unavailable('Incomplete block transaction IDs from fallback');
  }
  return { ...raw, tx: ids, txComplete: true };
}

module.exports = { parseSeleneBlock, completeSeleneBlock };
