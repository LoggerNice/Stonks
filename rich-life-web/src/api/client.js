const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const USER_ID = localStorage.getItem('rich-life-user-id') || '1';

export const WS_URL = (
  import.meta.env.VITE_WS_URL || 'ws://localhost:4000'
).replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': USER_ID,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || response.statusText);
  }

  return response.json();
}

export const api = {
  getState: () => request('/state'),

  click: () => request('/click', { method: 'POST', body: '{}' }),

  buyBusinessActivity: (businessId, activityId) =>
    request('/business/buy', {
      method: 'POST',
      body: JSON.stringify({ businessId, activityId }),
    }),

  buyAsset: (assetId, quantity, price) =>
    request('/assets/buy', {
      method: 'POST',
      body: JSON.stringify({ assetId, quantity, price }),
    }),

  sellAsset: (assetId, quantity, price, reason = null) =>
    request('/assets/sell', {
      method: 'POST',
      body: JSON.stringify({ assetId, quantity, price, reason }),
    }),

  setStopLoss: (assetId, price) =>
    request('/assets/stop-loss', {
      method: 'POST',
      body: JSON.stringify({ assetId, price }),
    }),

  clearStopLoss: (assetId) =>
    request('/assets/stop-loss', {
      method: 'DELETE',
      body: JSON.stringify({ assetId }),
    }),

  buyCollectionItem: (collectionId, itemId) =>
    request('/collections/buy', {
      method: 'POST',
      body: JSON.stringify({ collectionId, itemId }),
    }),

  setNickname: (nickname) =>
    request('/user/nickname', {
      method: 'PATCH',
      body: JSON.stringify({ nickname }),
    }),

  reset: () => request('/reset', { method: 'POST', body: '{}' }),
};