import { db } from '../db.js';
import { ASSET_MAP } from './catalog.js';
import { HISTORY_LIMIT } from '../config.js';

export function seedMarket() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM market_assets').get().c;

  if (count > 0) {
    return;
  }

  const insert = db.prepare(
    'INSERT INTO market_assets (asset_id, price, change24h, history) VALUES (?, ?, ?, ?)'
  );

  for (const asset of ASSET_MAP.values()) {
    insert.run(
      asset.id,
      asset.price,
      asset.change24h,
      JSON.stringify(asset.history)
    );
  }
}

export function tickMarket() {
  const rows = db.prepare('SELECT * FROM market_assets').all();
  const update = db.prepare(
    'UPDATE market_assets SET price = ?, change24h = ?, history = ? WHERE asset_id = ?'
  );

  for (const row of rows) {
    const meta = ASSET_MAP.get(row.asset_id);
    const volatility = meta?.volatility ?? 0.01;

    const percent = (Math.random() - 0.5) * 2 * volatility;
    const price = Number(Math.max(0.01, row.price * (1 + percent)).toPrecision(6));
    const change24h = Math.round((row.change24h * 0.9 + percent * 100 * 0.1) * 100) / 100;
    const history = [...JSON.parse(row.history), price].slice(-HISTORY_LIMIT);

    update.run(price, change24h, JSON.stringify(history), row.asset_id);
  }
}