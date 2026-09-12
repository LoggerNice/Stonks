import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { api, USER_ID, WS_URL } from '../api/client.js';
import { ensureAsset, tickMarket, saveMarket } from '../utils/localMarket.js';

const GameStateContext = createContext(null);
const GameDispatchContext = createContext(null);
const GameErrorContext = createContext(null);

function mergeMarket(serverState) {
  const assets = serverState.assets.map((asset) => {
    const entry = ensureAsset(asset);

    return {
      ...asset,
      price: entry.price,
      change24h: entry.change24h,
      history: entry.history,
    };
  });

  return {
    ...serverState,
    assets,
    account: serverState.user,
  };
}

export function GameProvider({ children }) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const reconnectRef = useRef(0);
  const lastMessageRef = useRef(0);
  const disposedRef = useRef(false);
  const stateRef = useRef(null);

  const applyState = useCallback((serverState) => {
    const merged = mergeMarket(serverState);
    stateRef.current = merged;
    setState(merged);
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      applyState(await api.getState());
      lastMessageRef.current = Date.now();
    } catch (refreshError) {
      setError(refreshError.message);
    }
  }, [applyState]);

  const connect = useCallback(() => {
    if (disposedRef.current) {
      return;
    }

    const ws = new WebSocket(`${WS_URL}?userId=${USER_ID}`);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectRef.current = 0;
      refresh();
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'state') {
          lastMessageRef.current = Date.now();
          applyState(message.state);
        }
      } catch {
        // игнорируем битые сообщения
      }
    };

    ws.onclose = () => {
      if (disposedRef.current) {
        return;
      }

      const delay = Math.min(1000 * 2 ** reconnectRef.current, 10000);
      reconnectRef.current += 1;
      setTimeout(connect, delay);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [applyState, refresh]);

  // Локальный тик рынка + клиентский стоп-лосс
  useEffect(() => {
    const id = setInterval(async () => {
      const prev = stateRef.current;

      if (!prev) {
        return;
      }

      tickMarket(prev.assets);

      const merged = mergeMarket(prev);
      stateRef.current = merged;
      setState(merged);

      for (const asset of merged.assets) {
        const triggered =
          asset.quantity > 0 &&
          asset.stopLoss != null &&
          asset.price <= asset.stopLoss;

        if (!triggered) {
          continue;
        }

        try {
          await api.sellAsset(
            asset.id,
            asset.quantity,
            asset.price,
            'stop-loss'
          );
          await refresh();
        } catch (stopError) {
          setError(stopError.message);
        }
      }

      saveMarket();
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, [refresh]);

  useEffect(() => {
    disposedRef.current = false;

    refresh();
    connect();

    const watchdog = setInterval(() => {
      if (Date.now() - lastMessageRef.current > 5000) {
        refresh();
      }
    }, 3000);

    return () => {
      disposedRef.current = true;
      clearInterval(watchdog);

      const ws = wsRef.current;

      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, [refresh, connect]);

  const dispatch = useCallback(
    async (action) => {
      const current = stateRef.current;

      const priceOf = (assetId) =>
        current?.assets.find((a) => a.id === assetId)?.price;

      try {
        switch (action.type) {
          case 'CLICK_EARN':
            await api.click();
            break;

          case 'BUY_BUSINESS_ACTIVITY':
            await api.buyBusinessActivity(action.businessId, action.activityId);
            break;

          case 'BUY_ASSET':
            await api.buyAsset(action.assetId, action.quantity, priceOf(action.assetId));
            break;

          case 'SELL_ASSET':
            await api.sellAsset(
              action.assetId,
              action.quantity,
              priceOf(action.assetId),
              action.reason || null
            );
            break;

          case 'SET_STOP_LOSS':
            await api.setStopLoss(action.assetId, action.price);
            break;

          case 'CLEAR_STOP_LOSS':
            await api.clearStopLoss(action.assetId);
            break;

          case 'BUY_COLLECTION_ITEM':
            await api.buyCollectionItem(action.collectionId, action.itemId);
            break;

          case 'SET_NICKNAME':
            await api.setNickname(action.nickname);
            break;

          case 'RESET':
            await api.reset();
            break;

          default:
            break;
        }

        if (Date.now() - lastMessageRef.current > 2000) {
          await refresh();
        }
      } catch (actionError) {
        setError(actionError.message);
        await refresh();
      }
    },
    [refresh]
  );

  return (
    <GameStateContext.Provider value={state}>
      <GameDispatchContext.Provider value={dispatch}>
        <GameErrorContext.Provider value={error}>
          {children}
        </GameErrorContext.Provider>
      </GameDispatchContext.Provider>
    </GameStateContext.Provider>
  );
}

export function useGame() {
  return useContext(GameStateContext);
}

export function useGameDispatch() {
  return useContext(GameDispatchContext);
}

export function useGameError() {
  return useContext(GameErrorContext);
}