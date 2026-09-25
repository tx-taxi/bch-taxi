/** Only an attributed pool name is a miner identity; payout addresses come from verified adapter data. */
export function hasAttributedMiner(pool: {name?: string} | null | undefined): boolean {
  const name = pool?.name?.trim();
  return !!name && !/^(unknown|unattributed)$/i.test(name);
}
