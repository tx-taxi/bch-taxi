const DECIMALS = 8, SYMBOL = 'BCH', FEE_UNIT = 'sat/B', FEE_SCALE = 1;
const decimalSeparators = new Map<string, string>();
function decimalSeparator(locale: string): string {
  if (!decimalSeparators.has(locale)) {
    try { decimalSeparators.set(locale, new Intl.NumberFormat(locale).formatToParts(1.1).find(part => part.type === 'decimal')?.value || '.'); }
    catch { decimalSeparators.set(locale, '.'); }
  }
  return decimalSeparators.get(locale)!;
}
function localizeDecimal(value: string, locale: string): string {
  return value.replace('.', decimalSeparator(locale));
}

// Presentation only: never round provider data or detail-page amounts.
export function compactBlockNumber(value: number, amount = false, locale = 'en-US'): string {
  if (!Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs > 0 && abs < 0.001) return (value < 0 ? '>−' : '<') + localizeDecimal('0.001', locale);
  if (abs >= 1000) {
    const units = ['', 'k', 'M', 'B', 'T'];
    let group = Math.min(4, Math.floor(Math.log10(abs) / 3));
    let scaled = Number((value / 1000 ** group).toPrecision(3));
    if (Math.abs(scaled) >= 1000 && group < 4) { group++; scaled /= 1000; }
    return scaled.toLocaleString(locale, { maximumSignificantDigits: 3, useGrouping: false }) + units[group];
  }
  return value.toLocaleString(locale, amount
    ? { minimumFractionDigits: 2, maximumFractionDigits: 3, useGrouping: false }
    : { maximumSignificantDigits: 3, useGrouping: false });
}

export function compactBlockAmount(value: number | string, atomic = false, locale = 'en-US'): string {
  if (value == null) return '—';
  return compactBlockNumber(Number(value) / (atomic ? 1 : 10 ** DECIMALS), !atomic, locale);
}

export function exactBlockAmount(value: number | string, locale = 'en-US'): string {
  if (value == null) return '—';
  try {
    const n = BigInt(value), abs = n < 0n ? -n : n, scale = 10n ** BigInt(DECIMALS);
    const fraction = (abs % scale).toString().padStart(DECIMALS, '0').replace(/0+$/, '');
    return (n < 0n ? '-' : '') + (abs / scale).toString() + (fraction ? decimalSeparator(locale) + fraction : '');
  } catch { return '—'; }
}

export function blockValueDetails(total: number | string, median: number, min: number, max: number, locale = 'en-US'): string {
  const rate = (value: number) => value == null || !Number.isFinite(value) ? '—' : localizeDecimal(String(value / FEE_SCALE), locale);
  return $localize`:@@bch.strip.details:Total fees: ${exactBlockAmount(total, locale)}:AMOUNT: ${SYMBOL}:SYMBOL:. Median fee rate: ${rate(median)}:MEDIAN: ${FEE_UNIT}:UNIT:. Fee range: ${rate(min)}:MIN:–${rate(max)}:MAX: ${FEE_UNIT}:RANGE_UNIT:.`;
}
