import http from 'node:http';
import express from 'express';
import cors from 'cors';

import { PORT, TICK_MS, START_MONEY } from './config.js';
import { db } from './db.js';
import { seedMarket } from './game/market.js';
import { runTick } from './game/tick.js';
import { attachWebSocket, broadcastAll } from './ws.js';
import gameRouter from './routes/game.js';

seedMarket();

const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;

if (userCount === 0) {
  const now = Date.now();
  const info = db
    .prepare('INSERT INTO users (nickname, created_at) VALUES (?, ?)')
    .run('Игрок', now);

  db.prepare(
    'INSERT INTO game_state (user_id, money, total_earned, total_clicks, last_tick) VALUES (?, ?, 0, 0, ?)'
  ).run(info.lastInsertRowid, START_MONEY, now);
}

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', gameRouter);

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

const server = http.createServer(app);

attachWebSocket(server);

setInterval(() => {
  runTick();
  broadcastAll();
}, TICK_MS);

server.listen(PORT, () => {
  console.log(`Rich Life server running on http://localhost:${PORT}`);
});