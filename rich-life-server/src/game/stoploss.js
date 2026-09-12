import { db } from '../db.js';

export function processStopLosses() {
  const rows = db
    .prepare(
      `SELECT ua.user_id, ua.asset_id, ua.quantity, ua.stop_loss, ma.price
       FROM user_assets ua
       JOIN market_assets ma ON ma.asset_id = ua.asset_id
       WHERE ua.quantity > 0
         AND ua.stop_loss IS NOT NULL
         AND ma.price <= ua.stop_loss`
    )
    .all();

  for (const row of rows) {
    const revenue = row.price * row.quantity;

    db.transaction(() => {
      db.prepare('UPDATE game_state SET money = money + ? WHERE user_id = ?').run(
        revenue,
        row.user_id
      );

      db.prepare(
        'UPDATE user_assets SET quantity = 0, avg_price = 0, stop_loss = NULL WHERE user_id = ? AND asset_id = ?'
      ).run(row.user_id, row.asset_id);

      db.prepare(
        'INSERT INTO transactions (user_id, asset_id, type, reason, quantity, price, total, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(
        row.user_id,
        row.asset_id,
        'sell',
        'stop-loss',
        row.quantity,
        row.price,
        revenue,
        Date.now()
      );
    })();
  }
}