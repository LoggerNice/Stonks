import { WebSocketServer } from 'ws';
import { buildState } from './game/state.js';

const clients = new Map();

function serialize(userId) {
  const state = buildState(userId);

  if (!state) {
    return null;
  }

  return JSON.stringify({
    type: 'state',
    state: {
      ...state,
      account: state.user,
    },
  });
}

export function attachWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost');
    const userId = Number(url.searchParams.get('userId') || 1);

    if (!clients.has(userId)) {
      clients.set(userId, new Set());
    }

    clients.get(userId).add(ws);

    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('close', () => {
      const set = clients.get(userId);
      set.delete(ws);

      if (set.size === 0) {
        clients.delete(userId);
      }
    });

    const payload = serialize(userId);

    if (payload && ws.readyState === 1) {
      ws.send(payload);
    }
  });

  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => clearInterval(heartbeat));
}

const pendingPush = new Map();

function sendNow(userId) {
  const set = clients.get(userId);

  if (!set || set.size === 0) {
    return;
  }

  const payload = serialize(userId);

  if (!payload) {
    return;
  }

  for (const ws of set) {
    if (ws.readyState === 1 && ws.bufferedAmount < 250_000) {
      ws.send(payload);
    }
  }
}

export function pushState(userId) {
  // Уже запланировано — не плодим пуши при спаме кликов
  if (pendingPush.has(userId)) {
    return;
  }

  const timer = setTimeout(() => {
    pendingPush.delete(userId);
    sendNow(userId);
  }, 150);

  pendingPush.set(userId, timer);
}

export function broadcastAll() {
  for (const userId of clients.keys()) {
    pushState(userId);
  }
}