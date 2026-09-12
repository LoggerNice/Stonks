import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';

import { getCategoryIcon, categoryLabels } from '../utils/assetMeta';
import { formatMoney, formatNumber, formatPercent } from '../utils/format';
import AreaChart from './AreaChart';

const periods = [
  { minutes: 1, label: '1М' },
  { minutes: 5, label: '5М' },
  { minutes: 15, label: '15М' },
  { minutes: 30, label: '30М' },
  { minutes: 60, label: '1Ч' },
];

const tabs = [
  { id: 'overview', label: 'Обзор' },
  { id: 'history', label: 'Сделки' },
];

export default function InvestmentInfoModal({
  asset,
  transactions,
  money,
  isOpen,
  onClose,
  onBuy,
  onSell,
  onSetStopLoss,
  onClearStopLoss,
}) {
  const [period, setPeriod] = useState(60);
  const [tab, setTab] = useState('overview');
  const [amount, setAmount] = useState('1');
  const [stopLossAmount, setStopLossAmount] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setPeriod(60);
      setTab('overview');
      setAmount('1');
      setStopLossAmount('');
    }
  }, [isOpen, asset?.id]);

  if (!isOpen || !asset) {
    return null;
  }

  const Icon = getCategoryIcon(asset.category);

  const history = Array.isArray(asset.history) ? asset.history : [asset.price];
  const windowPoints = history.slice(-period * 60);
  const step = Math.max(1, Math.ceil(windowPoints.length / 90));
  const chartPoints = windowPoints.filter(
    (_, index) => index % step === 0 || index === windowPoints.length - 1
  );
  const positive =
    chartPoints.length > 1
      ? chartPoints[chartPoints.length - 1] >= chartPoints[0]
      : asset.change24h >= 0;

  const quantity = Number(amount);
  const isValid = Number.isFinite(quantity) && quantity > 0;
  const tradeCost = isValid ? asset.price * quantity : 0;
  const canBuy = isValid && money >= tradeCost;
  const canSell = isValid && asset.quantity >= quantity;

  const stopLossValue = Number(stopLossAmount);
  const canSetStopLoss =
    Number.isFinite(stopLossValue) && stopLossValue > 0;

  const positionProfit =
    (asset.price - (asset.avgPrice || 0)) * asset.quantity;

  const assetTransactions = (transactions || [])
    .filter((item) => item.assetId === asset.id)
    .slice()
    .reverse();

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/95 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Шапка */}
        <div className="flex items-start justify-between gap-3 p-4 pb-3">
          <div className="flex min-w-0 items-center gap-3">
            {asset.category === 'nft' ? (
              <img
                src={asset.image}
                alt={asset.name}
                className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-white/10"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950/60 text-emerald-300 ring-1 ring-white/10">
                <Icon className="h-5 w-5" />
              </span>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-50">
                {asset.name}
              </p>
              <p className="truncate text-xs text-slate-500">
                {asset.ticker} · {categoryLabels[asset.category] || 'Актив'}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-start gap-2">
            <div className="text-right">
              <p className="text-lg font-semibold tabular-nums text-slate-50">
                {formatMoney(asset.price, 2)}
              </p>
              <p
                className={`flex items-center justify-end gap-1 text-xs font-medium tabular-nums ${
                  asset.change24h >= 0 ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {asset.change24h >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownLeft className="h-3 w-3" />
                )}
                {formatPercent(asset.change24h)}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Прокручиваемая часть */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* График */}
          <div>
            <AreaChart
              points={chartPoints}
              positive={positive}
              className="h-36 w-full"
            />
            <div className="mt-1 flex justify-between text-[10px] text-slate-600">
              <span>-{period} мин</span>
              <span>сейчас</span>
            </div>
          </div>

          {/* Периоды */}
          <div className="mt-3 flex gap-1.5">
            {periods.map((item) => (
              <button
                key={item.minutes}
                type="button"
                onClick={() => setPeriod(item.minutes)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  period === item.minutes
                    ? 'bg-slate-700/80 text-slate-100'
                    : 'bg-slate-950/50 text-slate-500 hover:text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Вкладки */}
          <div className="mt-4 flex gap-4 border-b border-slate-800/60">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`-mb-px border-b-2 pb-2 text-sm font-medium transition ${
                  tab === item.id
                    ? 'border-emerald-400 text-slate-100'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === 'overview' ? (
            <div className="mt-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                {asset.category !== 'nft' && asset.marketCap && (
                  <div className="rounded-xl bg-slate-950/50 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">
                      Капитализация
                    </p>
                    <p className="mt-1 text-sm font-semibold tabular-nums text-slate-100">
                      {formatMoney(asset.marketCap, 0)}
                    </p>
                    <p className="text-xs text-slate-500">рынка</p>
                  </div>
                )}

                <div className={`rounded-xl bg-slate-950/50 p-3 ${asset.category !== 'nft' && asset.marketCap ? '' : 'col-span-2'}`}>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500">
                    В портфеле
                  </p>
                  <p className="mt-1 text-sm font-semibold tabular-nums text-slate-100">
                    {formatNumber(asset.quantity, 4)}
                  </p>
                  <p className="text-xs tabular-nums text-slate-500">
                    {formatMoney(asset.quantity * asset.price, 2)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950/50 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500">
                    Средняя цена
                  </p>
                  <p className="mt-1 text-sm font-semibold tabular-nums text-slate-100">
                    {formatMoney(asset.avgPrice || 0, 2)}
                  </p>
                  <p className="text-xs text-slate-500">покупки</p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-950/50 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500">
                    Прибыль позиции
                  </p>
                  <p
                    className={`text-sm font-semibold tabular-nums ${
                      positionProfit >= 0 ? 'text-emerald-300' : 'text-rose-300'
                    }`}
                  >
                    {positionProfit >= 0 ? '+' : '-'}
                    {formatMoney(Math.abs(positionProfit), 2)}
                  </p>
                </div>
              </div>

              {/* Стоп-лосс */}
              <div className="rounded-xl bg-slate-950/50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">
                      Стоп-лосс
                    </p>
                    <p
                      className={`mt-1 text-sm font-semibold tabular-nums ${
                        asset.stopLoss != null
                          ? 'text-rose-300'
                          : 'text-slate-500'
                      }`}
                    >
                      {asset.stopLoss != null
                        ? formatMoney(asset.stopLoss, 2)
                        : 'Не установлен'}
                    </p>
                  </div>

                  {asset.stopLoss != null ? (
                    <button
                      type="button"
                      onClick={onClearStopLoss}
                      className="shrink-0 rounded-lg border border-slate-700/60 bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700/60"
                    >
                      Убрать
                    </button>
                  ) : (
                    <div className="flex shrink-0 items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={stopLossAmount}
                        onChange={(event) =>
                          setStopLossAmount(event.target.value)
                        }
                        placeholder="Цена"
                        className="w-24 rounded-lg border border-slate-700/60 bg-slate-950/60 px-2 py-1.5 text-right text-xs tabular-nums text-slate-100 placeholder:text-slate-600"
                      />

                      <button
                        type="button"
                        disabled={!canSetStopLoss}
                        onClick={() => onSetStopLoss(stopLossValue)}
                        className="rounded-lg border border-slate-700/60 bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700/60 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Set
                      </button>
                    </div>
                  )}
                </div>

                {asset.stopLoss != null && (
                  <p className="mt-2 text-xs text-slate-500">
                    Позиция продастся автоматически, если цена упадёт до
                    этого уровня.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-1">
              {assetTransactions.length === 0 && (
                <p className="py-6 text-center text-sm text-slate-500">
                  Покупок и продаж ещё не было
                </p>
              )}

              {assetTransactions.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-950/50 px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        trade.type === 'buy'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-rose-500/15 text-rose-300'
                      }`}
                    >
                      {trade.type === 'buy' ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </span>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200">
                        {trade.type === 'buy'
                          ? 'Покупка'
                          : trade.reason === 'stop-loss'
                            ? 'Продажа · Стоп-лосс'
                            : 'Продажа'}
                      </p>
                      <p className="truncate text-xs tabular-nums text-slate-500">
                        {new Date(trade.time).toLocaleString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · {formatNumber(trade.quantity, 4)} @{' '}
                        {formatMoney(trade.price, 2)}
                      </p>
                    </div>
                  </div>

                  <p
                    className={`shrink-0 text-sm font-semibold tabular-nums ${
                      trade.type === 'buy' ? 'text-rose-300' : 'text-emerald-300'
                    }`}
                  >
                    {trade.type === 'buy' ? '-' : '+'}
                    {formatMoney(trade.total, 2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Торговля */}
        <div className="flex shrink-0 items-center gap-2 border-t border-slate-800/60 bg-slate-900/95 p-3">
          <input
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-20 rounded-xl border border-slate-700/60 bg-slate-950/60 px-2 py-2 text-center text-sm tabular-nums text-slate-100"
          />

          <button
            type="button"
            disabled={!canSell}
            onClick={() => onSell(quantity)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-800/80 px-3 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-700/80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            − Продать
          </button>

          <button
            type="button"
            disabled={!canBuy}
            onClick={() => onBuy(quantity)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            + Купить
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}