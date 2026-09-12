import { useState } from 'react';
import {
  Bitcoin,
  CircleDollarSign,
  Image as ImageIcon,
  LineChart,
} from 'lucide-react';

import { useGame } from '../store/gameStore';
import { getPortfolioValue } from '../utils/selectors';
import { formatMoney, formatNumber, formatPercent } from '../utils/format';
import Sparkline from '../components/Sparkline';
import InvestmentInfoModal from '../components/InvestmentInfoModal';
import { getCategoryIcon } from '../utils/assetMeta';

const categoryIcons = {
  stocks: LineChart,
  crypto: Bitcoin,
  nft: ImageIcon,
};

const categoryLabels = {
  stocks: 'Акции',
  crypto: 'Крипта',
  nft: 'NFT',
};

const filters = [
  { id: 'all', label: 'Все' },
  { id: 'stocks', label: 'Акции' },
  { id: 'crypto', label: 'Крипта' },
  { id: 'nft', label: 'NFT' },
];

export default function InvestmentsPage() {
  const state = useGame();

  const [filter, setFilter] = useState('all');
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedAsset = state.assets.find((asset) => asset.id === selectedAssetId) || null;

  const purchased = state.assets.filter((asset) => asset.quantity > 0);
  const portfolioValue = getPortfolioValue(state);
  const invested = state.assets.reduce(
    (sum, asset) => sum + (asset.avgPrice || 0) * asset.quantity,
    0
  );
  const portfolioProfit = state.assets.reduce(
    (sum, asset) => sum + (asset.price - (asset.avgPrice || 0)) * asset.quantity,
    0
  );
  const profitPercent = invested > 0 ? (portfolioProfit / invested) * 100 : 0;
  const isProfit = portfolioProfit >= 0;

  const visibleAssets = state.assets
    .filter((asset) => filter === 'all' || asset.category === filter)
    .sort((a, b) => (b.quantity > 0 ? 1 : 0) - (a.quantity > 0 ? 1 : 0));

  const openAsset = (asset) => {
    setSelectedAssetId(asset.id);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
            {/* Общие сведения баланса в стиле банковской карты */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-700/40 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/60 p-5 shadow-xl shadow-black/30">
        {/* Декоративные свечения */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

        {/* Верхняя строка: чип и логотип */}
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-10 rounded-md bg-gradient-to-br from-amber-200/90 via-amber-300/80 to-amber-500/70 p-1">
              <div className="h-full w-full rounded-sm border border-amber-600/40 bg-amber-100/20" />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-slate-400">
              Портфель
            </span>
          </div>

          <div className="flex -space-x-2">
            <span className="h-6 w-6 rounded-full bg-emerald-400/80" />
            <span className="h-6 w-6 rounded-full bg-cyan-400/60" />
          </div>
        </div>

        {/* Маскированный номер */}
        <p className="relative mt-5 text-sm tracking-[0.3em] text-slate-500">
          1621 7543 4666 4242
        </p>

        {/* Баланс и изменение */}
        <div className="relative mt-4">
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-slate-50">
            {formatMoney(portfolioValue, 2)}
          </p>

          <p
            className={`mt-1 text-sm font-medium tabular-nums ${
              invested === 0
                ? 'text-slate-500'
                : isProfit
                  ? 'text-emerald-300'
                  : 'text-rose-300'
            }`}
          >
            {isProfit ? '+' : '-'}
            {formatMoney(Math.abs(portfolioProfit), 2)} ({isProfit ? '+' : '-'}
            {Math.abs(profitPercent).toFixed(2)}%)
          </p>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              filter === item.id
                ? 'bg-emerald-500 text-slate-950'
                : 'border border-slate-700/60 bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Список активов */}
      <div className="space-y-3">
        {visibleAssets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} onOpen={() => openAsset(asset)} />
        ))}

        {visibleAssets.length === 0 && (
          <p className="text-sm text-slate-500">
            В этой категории пока нет активов.
          </p>
        )}
      </div>

            <InvestmentInfoModal
        asset={selectedAsset}
        transactions={state.transactions}
        money={state.money}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBuy={(quantity) =>
          dispatch({
            type: 'BUY_ASSET',
            assetId: selectedAssetId,
            quantity,
          })
        }
        onSell={(quantity) =>
          dispatch({
            type: 'SELL_ASSET',
            assetId: selectedAssetId,
            quantity,
          })
        }
        onSetStopLoss={(price) =>
          dispatch({
            type: 'SET_STOP_LOSS',
            assetId: selectedAssetId,
            price,
          })
        }
        onClearStopLoss={() =>
          dispatch({
            type: 'CLEAR_STOP_LOSS',
            assetId: selectedAssetId,
          })
        }
      />
    </div>
  );
}

function AssetCard({ asset, onOpen }) {
  const Icon = getCategoryIcon(asset.category);
  const history =
    Array.isArray(asset.history) && asset.history.length > 1
      ? asset.history
      : [asset.price, asset.price];

  const up = history[history.length - 1] >= history[0];

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`w-full rounded-3xl border p-4 text-left transition-transform duration-200 active:scale-[0.99] ${
        up
          ? 'border-emerald-400/20 bg-gradient-to-br from-emerald-500/15 via-slate-900/70 to-slate-950'
          : 'border-rose-400/20 bg-gradient-to-br from-rose-500/10 via-slate-900/70 to-slate-950'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {asset.category === 'nft' ? (
            <img
              src={asset.image}
              alt={asset.name}
              className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-white/10"
            />
          ) : (
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950/60 ring-1 ${
                up
                  ? 'text-emerald-300 ring-emerald-400/30'
                  : 'text-rose-300 ring-rose-400/30'
              }`}
            >
              <Icon className="h-5 w-5" />
            </span>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-slate-100">
                {asset.name}
              </p>

              {asset.quantity > 0 && (
                <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  Куплено
                </span>
              )}
            </div>

            <p className="mt-0.5 truncate text-xs text-slate-500">
              {asset.ticker} · {categoryLabels[asset.category] || 'Актив'}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
            up
              ? 'bg-emerald-500/15 text-emerald-300'
              : 'bg-rose-500/15 text-rose-300'
          }`}
        >
          {formatPercent(asset.change24h)}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-2xl font-semibold tabular-nums text-slate-50">
            {formatMoney(asset.price, 2)}
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-slate-500">
            Цена
          </p>

          {asset.quantity > 0 && (
            <p className="mt-2 text-xs tabular-nums text-slate-400">
              В портфеле: {formatNumber(asset.quantity, 4)} ·{' '}
              {formatMoney(asset.quantity * asset.price, 2)}
            </p>
          )}
        </div>

        <Sparkline
          points={history}
          positive={up}
          className="h-10 w-28 shrink-0 sm:w-40"
        />
      </div>
    </button>
  );
}