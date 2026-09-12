import { Router } from 'express';
import { db } from '../db.js';
import { START_MONEY } from '../config.js';
import { buildState } from '../game/state.js';
import { getActivityCost } from '../game/economy.js';
import { BUSINESS_MAP, COLLECTIONS } from '../game/catalog.js';
import { pushState } from '../ws.js';

const router = Router();

function userId(req) {
  return Number(req.header('x-user-id') || req.body?.userId || 1);
}

function ok(res, id) {
  pushState(id);
  ok(res, id);
}

router.get('/state', (req, res) => {
  const state = buildState(userId(req));

  if (!state) {
    return res.status(404).json({ error: 'user not found' });
  }

  res.json(state);
});

router.post('/click', (req, res) => {
  const id = userId(req);
  const power = 1;

  db.prepare(
    'UPDATE game_state SET money = money + ?, total_earned = total_earned + ?, total_clicks = total_clicks + 1 WHERE user_id = ?'
  ).run(power, power, id);

  ok(res, id);
});

router.post('/business/buy', (req, res) => {
  const id = userId(req);
  const { businessId, activityId } = req.body;

  const business = BUSINESS_MAP.get(businessId);
  const activity = business?.activities.find((a) => a.id === activityId);

  if (!activity) {
    return res.status(404).json({ error: 'activity not found' });
  }

  const row = db
    .prepare('SELECT level FROM business_activities WHERE user_id = ? AND business_id = ? AND activity_id = ?')
    .get(id, businessId, activityId);

  const cost = getActivityCost(activity, row?.level || 0);
  const gs = db.prepare('SELECT money FROM game_state WHERE user_id = ?').get(id);

  if (gs.money < cost) {
    return res.status(400).json({ error: 'not enough money' });
  }

  db.transaction(() => {
    db.prepare('UPDATE game_state SET money = money - ? WHERE user_id = ?').run(cost, id);
    db.prepare(
      `INSERT INTO business_activities (user_id, business_id, activity_id, level)
       VALUES (?, ?, ?, 1)
       ON CONFLICT(user_id, business_id, activity_id) DO UPDATE SET level = level + 1`
    ).run(id, businessId, activityId);
  })();

  ok(res, id);
});

router.post('/assets/buy', (req, res) => {
  const id = userId(req);
  const { assetId, quantity } = req.body;
  const qty = Number(quantity);

  if (!Number.isFinite(qty) || qty <= 0) {
    return res.status(400).json({ error: 'bad quantity' });
  }

  const market = db.prepare('SELECT price FROM market_assets WHERE asset_id = ?').get(assetId);

  if (!market) {
    return res.status(404).json({ error: 'asset not found' });
  }

  const clientPrice = Number(req.body?.price);
  const price =
    Number.isFinite(clientPrice) && clientPrice > 0
      ? clientPrice
      : market.price;
  const cost = price * qty;
  const gs = db.prepare('SELECT money FROM game_state WHERE user_id = ?').get(id);

  if (gs.money < cost) {
    return res.status(400).json({ error: 'not enough money' });
  }

  db.transaction(() => {
    db.prepare('UPDATE game_state SET money = money - ? WHERE user_id = ?').run(cost, id);

    const row = db
      .prepare('SELECT quantity, avg_price FROM user_assets WHERE user_id = ? AND asset_id = ?')
      .get(id, assetId);

    if (row) {
      const newQuantity = row.quantity + qty;
      const avg = (row.avg_price * row.quantity + cost) / newQuantity;
      db.prepare('UPDATE user_assets SET quantity = ?, avg_price = ? WHERE user_id = ? AND asset_id = ?')
        .run(newQuantity, avg, id, assetId);
    } else {
      db.prepare('INSERT INTO user_assets (user_id, asset_id, quantity, avg_price, stop_loss) VALUES (?, ?, ?, ?, NULL)')
        .run(id, assetId, qty, cost / qty);
    }

    db.prepare(
      'INSERT INTO transactions (user_id, asset_id, type, reason, quantity, price, total, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(id, assetId, 'buy', null, qty, market.price, cost, Date.now());
  })();

  ok(res, id);
});

router.post('/assets/sell', (req, res) => {
  const id = userId(req);
  const { assetId, quantity } = req.body;
  const qty = Number(quantity);

  if (!Number.isFinite(qty) || qty <= 0) {
    return res.status(400).json({ error: 'bad quantity' });
  }

  const row = db.prepare('SELECT quantity FROM user_assets WHERE user_id = ? AND asset_id = ?').get(id, assetId);

  if (!row || row.quantity + 0.000001 < qty) {
    return res.status(400).json({ error: 'not enough assets' });
  }

  const market = db.prepare('SELECT price FROM market_assets WHERE asset_id = ?').get(assetId);
  const clientPrice = Number(req.body?.price);
  const price =
    Number.isFinite(clientPrice) && clientPrice > 0
      ? clientPrice
      : market.price;
  const revenue = price * qty;
  const reason = req.body?.reason || null;

  db.transaction(() => {
    db.prepare('UPDATE game_state SET money = money + ? WHERE user_id = ?').run(revenue, id);

    const newQuantity = Math.max(0, row.quantity - qty);
    db.prepare('UPDATE user_assets SET quantity = ?, avg_price = ? WHERE user_id = ? AND asset_id = ?')
      .run(newQuantity, newQuantity > 0 ? row.avg_price : 0, id, assetId);

    db.prepare('UPDATE market_assets SET price = ? WHERE asset_id = ?').run(
      price,
      assetId
    );

    db.prepare('UPDATE market_assets SET price = ? WHERE asset_id = ?').run(
      price,
      assetId
    );
  })();

  ok(res, id);
});

router.post('/assets/stop-loss', (req, res) => {
  const id = userId(req);
  const { assetId, price } = req.body;

  if (!Number.isFinite(price) || price <= 0) {
    return res.status(400).json({ error: 'bad price' });
  }

  db.prepare(
    `INSERT INTO user_assets (user_id, asset_id, quantity, avg_price, stop_loss)
     VALUES (?, ?, 0, 0, ?)
     ON CONFLICT(user_id, asset_id) DO UPDATE SET stop_loss = ?`
  ).run(id, assetId, price, price);

  ok(res, id);
});

router.delete('/assets/stop-loss', (req, res) => {
  const id = userId(req);
  const { assetId } = req.body;

  db.prepare('UPDATE user_assets SET stop_loss = NULL WHERE user_id = ? AND asset_id = ?').run(id, assetId);

  ok(res, id);
});

router.post('/collections/buy', (req, res) => {
  const id = userId(req);
  const { collectionId, itemId } = req.body;

  const collection = COLLECTIONS[collectionId];
  const item = collection?.items.find((i) => i.id === itemId);

  if (!item) {
    return res.status(404).json({ error: 'item not found' });
  }

  const owned = db
    .prepare('SELECT owned FROM collection_items WHERE user_id = ? AND collection_id = ? AND item_id = ?')
    .get(id, collectionId, itemId);

  if (owned?.owned) {
    return res.status(400).json({ error: 'already owned' });
  }

  const gs = db.prepare('SELECT money FROM game_state WHERE user_id = ?').get(id);

  if (gs.money < item.price) {
    return res.status(400).json({ error: 'not enough money' });
  }

  db.transaction(() => {
    db.prepare('UPDATE game_state SET money = money - ? WHERE user_id = ?').run(item.price, id);
    db.prepare(
      `INSERT INTO collection_items (user_id, collection_id, item_id, owned)
       VALUES (?, ?, ?, 1)
       ON CONFLICT(user_id, collection_id, item_id) DO UPDATE SET owned = 1`
    ).run(id, collectionId, itemId);
  })();

  ok(res, id);
});

router.patch('/user/nickname', (req, res) => {
  const id = userId(req);
  const nickname = String(req.body?.nickname || '').trim();

  if (!nickname) {
    return res.status(400).json({ error: 'bad nickname' });
  }

  db.prepare('UPDATE users SET nickname = ? WHERE id = ?').run(nickname, id);

  ok(res, id);
});

router.post('/reset', (req, res) => {
  const id = userId(req);
  const now = Date.now();

  db.transaction(() => {
    db.prepare('DELETE FROM business_activities WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM user_assets WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM collection_items WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM transactions WHERE user_id = ?').run(id);
    db.prepare(
      'UPDATE game_state SET money = ?, total_earned = 0, total_clicks = 0, last_tick = ? WHERE user_id = ?'
    ).run(START_MONEY, now, id);
  })();

  ok(res, id);
});

export default router;