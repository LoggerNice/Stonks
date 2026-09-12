export function formatMoney(value, digits = 0) {
  const safe = Number.isFinite(value) ? value : 0;

  return (
    new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    }).format(safe) + ' $'
  );
}

export function formatNumber(value, digits = 2) {
  const safe = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(safe);
}

export function formatPercent(value) {
  const safe = Number.isFinite(value) ? value : 0;
  const sign = safe > 0 ? '+' : '';

  return `${sign}${safe.toFixed(2)}%`;
}