import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const db = new Database(path.join(__dirname, '..', 'game.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS game_state (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    money REAL NOT NULL DEFAULT 100,
    total_earned REAL NOT NULL DEFAULT 0,
    total_clicks INTEGER NOT NULL DEFAULT 0,
    last_tick INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS business_activities (
    user_id INTEGER NOT NULL,
    business_id TEXT NOT NULL,
    activity_id TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, business_id, activity_id)
  );

  CREATE TABLE IF NOT EXISTS user_assets (
    user_id INTEGER NOT NULL,
    asset_id TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 0,
    avg_price REAL NOT NULL DEFAULT 0,
    stop_loss REAL,
    PRIMARY KEY (user_id, asset_id)
  );

  CREATE TABLE IF NOT EXISTS market_assets (
    asset_id TEXT PRIMARY KEY,
    price REAL NOT NULL,
    change24h REAL NOT NULL DEFAULT 0,
    history TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS collection_items (
    user_id INTEGER NOT NULL,
    collection_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    owned INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, collection_id, item_id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    asset_id TEXT NOT NULL,
    type TEXT NOT NULL,
    reason TEXT,
    quantity REAL,
    price REAL,
    total REAL,
    time INTEGER NOT NULL
  );
`);