import { db } from '../db.js';
import { BUSINESS_MAP, ASSET_MAP } from './catalog.js';
import { BUSINESS_COST_MULTIPLIER, BUSINESS_INCOME_DIVIDER } from '../config.js';

export function getActivityCost(activity, level) {
  return Math.floor(activity.baseCost * Math.pow(BUSINESS_COST_MULTIPLIER, level));
}

export function getUserBusinessIncome(userId) {
  const rows = db
    .prepare(
      'SELECT business_id, activity_id, level FROM business_activities WHERE user_id = ? AND level > 0'
    )
    .all(userId);

  let sum = 0;

  for (const row of rows) {
    const business = BUSINESS_MAP.get(row.business_id);
    const activity = business?.activities.find(
      (a) => a.id === row.activity_id
    );

    if (activity) {
      sum += (activity.baseIncomePerSecond / BUSINESS_INCOME_DIVIDER) * row.level;
    }
  }

  return sum;
}

export function getUserDividends(userId) {
  const rows = db
    .prepare(
      `SELECT ua.asset_id, ua.quantity
       FROM user_assets ua
       WHERE ua.user_id = ? AND ua.quantity > 0`
    )
    .all(userId);

  return rows.reduce((sum, row) => {
    const asset = ASSET_MAP.get(row.asset_id);
    return sum + (asset?.dividendPerSecond || 0) * row.quantity;
  }, 0);
}

export function getUserPassiveIncome(userId) {
  return getUserBusinessIncome(userId) + getUserDividends(userId);
}