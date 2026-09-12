import { db } from '../db.js';
import { BUSINESSES, ASSETS, COLLECTIONS } from './catalog.js';

function sig(value) {
  return Number(Number(value).toPrecision(6));
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

export function buildState(userId) {
  const gs = db.prepare('SELECT * FROM game_state WHERE user_id = ?').get(userId);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

  if (!gs || !user) {
    return null;
  }

  const levels = db
    .prepare('SELECT business_id, activity_id, level FROM business_activities WHERE user_id = ?')
    .all(userId);
  const levelMap = new Map(levels.map((l) => [`${l.business_id}:${l.activity_id}`, l.level]));

  const businesses = BUSINESSES.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    activities: b.activities.map((a) => ({
      id: a.id,
      name: a.name,
      baseCost: a.baseCost,
      baseIncomePerSecond: a.baseIncomePerSecond,
      level: levelMap.get(`${b.id}:${a.id}`) || 0,
    })),
  }));

  const owned = db.prepare('SELECT * FROM user_assets WHERE user_id = ?').all(userId);
  const ownedMap = new Map(owned.map((o) => [o.asset_id, o]));

  const market = db.prepare('SELECT * FROM market_assets').all();
  const marketMap = new Map(market.map((m) => [m.asset_id, m]));

  const assets = ASSETS.map((a) => {
    const o = ownedMap.get(a.id);
    const m = marketMap.get(a.id);

    return {
      ...a,
      price: sig(m?.price ?? a.price),
      change24h: round2(m?.change24h ?? 0),
      quantity: o?.quantity ?? 0,
      avgPrice: sig(o?.avg_price ?? 0),
      stopLoss: o?.stop_loss != null ? sig(o.stop_loss) : null,
    };
  });

  const ownedItems = db
    .prepare('SELECT collection_id, item_id, owned FROM collection_items WHERE user_id = ?')
    .all(userId);
  const ownedSet = new Set(
    ownedItems.filter((i) => i.owned).map((i) => `${i.collection_id}:${i.item_id}`)
  );

  const exclusives = {};

  for (const [cid, c] of Object.entries(COLLECTIONS)) {
    exclusives[cid] = {
      ...c,
      items: c.items.map((it) => ({
        ...it,
        owned: ownedSet.has(`${cid}:${it.id}`),
      })),
    };
  }

  const transactions = db
    .prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY time DESC LIMIT 100')
    .all(userId);

  return {
    user: {
      id: user.id,
      nickname: user.nickname,
      totalEarned: gs.total_earned,
      totalClicks: gs.total_clicks,
      createdAt: user.created_at,
    },
    money: gs.money,
    businesses,
    assets,
    exclusives,
    transactions,
  };
}