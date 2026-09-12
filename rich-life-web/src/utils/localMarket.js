const STORAGE_KEY = 'rich-life-market-v1';
const HISTORY_LIMIT = 3600;

let market = load();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // игнорируем битый сейв
  }

  return {};
}

export function saveMarket() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(market));
  } catch {
    // переполнение localStorage не критично
  }
}

export function ensureAsset(asset) {
  if (!market[asset.id]) {
    market[asset.id] = {
      price: asset.price,
      change24h: asset.change24h || 0,
      history: [asset.price],
    };
  }

  return market[asset.id];
}

export function tickMarket(assets) {
  for (const asset of assets) {
    const entry = ensureAsset(asset);
    const volatility = asset.volatility ?? 0.01;

    const percent = (Math.random() - 0.5) * 2 * volatility;
    const price = Number(
      Math.max(0.01, entry.price * (1 + percent)).toPrecision(6)
    );

    entry.change24h =
      Math.round((entry.change24h * 0.9 + percent * 100 * 0.1) * 100) / 100;
    entry.price = price;
    entry.history = [...entry.history, price].slice(-HISTORY_LIMIT);
  }
}