import { db } from '../db.js';
import { getUserPassiveIncome } from './economy.js';
import { OFFLINE_CAP_SECONDS } from '../config.js';

export function runTick() {
  const now = Date.now();

  const users = db
    .prepare('SELECT user_id, last_tick FROM game_state')
    .all();

  for (const user of users) {
    const dt = Math.min(
      Math.max((now - user.last_tick) / 1000, 0),
      OFFLINE_CAP_SECONDS
    );

    if (dt <= 0) {
      db.prepare('UPDATE game_state SET last_tick = ? WHERE user_id = ?').run(
        now,
        user.user_id
      );
      continue;
    }

    const income = getUserPassiveIncome(user.user_id);
    const earned = income * dt;

    db.prepare(
      'UPDATE game_state SET money = money + ?, total_earned = total_earned + ?, last_tick = ? WHERE user_id = ?'
    ).run(earned, earned, now, user.user_id);
  }
}