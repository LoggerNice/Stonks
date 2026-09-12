import { createInitialGameState } from './initialState.js';

const initial = createInitialGameState();

export const BUSINESSES = initial.businesses;
export const ASSETS = initial.assets;
export const COLLECTIONS = initial.exclusives;

export const BUSINESS_MAP = new Map(BUSINESSES.map((b) => [b.id, b]));
export const ASSET_MAP = new Map(ASSETS.map((a) => [a.id, a]));