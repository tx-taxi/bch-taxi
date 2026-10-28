/** Build only Bitcoin Cash address links; never send arbitrary input to another explorer. */
export function bchAddressFallbackUrl(address: string | null | undefined): string | null {
  if (!address) { return null; }
  const cashAddress = address.replace(/^bitcoincash:/i, '');
  // CashAddr is case-insensitive but must not mix case. Blockchair accepts its
  // prefix-free form; legacy addresses retain their original case.
  if (/^[qpzr][023456789acdefghjklmnpqrstuvwxyz]{41,100}$/i.test(cashAddress) &&
      (cashAddress === cashAddress.toLowerCase() || cashAddress === cashAddress.toUpperCase())) {
    return `https://blockchair.com/bitcoin-cash/address/${encodeURIComponent(cashAddress.toLowerCase())}`;
  }
  if (/^[13][1-9A-HJ-NP-Za-km-z]{25,34}$/.test(address)) {
    return `https://blockchair.com/bitcoin-cash/address/${encodeURIComponent(address)}`;
  }
  return null;
}
