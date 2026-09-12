import { useEffect, useState } from 'react';
import {
  User,
  Calendar,
  DollarSign,
  MousePointerClick,
  Building2,
  TrendingUp,
  Gem,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
} from 'lucide-react';

import { useGame, useGameDispatch } from '../store/gameStore';
import {
  getBusinessIncome,
  getBusinessTotalLevel,
  getPortfolioValue,
  getTotalIncomePerSecond,
} from '../utils/selectors';
import { formatMoney, formatNumber } from '../utils/format';

export default function AccountPage() {
  const state = useGame();
  const dispatch = useGameDispatch();

  const [nickname, setNickname] = useState(state.account.nickname);

  useEffect(() => {
    setNickname(state.account.nickname);
  }, [state.account.nickname]);

  const totalIncomePerSecond = getTotalIncomePerSecond(state);

  const businessesOwned = state.businesses.filter((b) =>
    b.activities.some((a) => a.level > 0)
  ).length;

  const totalBusinessLevels = state.businesses.reduce(
    (sum, b) => sum + getBusinessTotalLevel(b),
    0
  );

  const businessIncome = state.businesses.reduce(
    (sum, b) => sum + getBusinessIncome(b),
    0
  );

  const portfolioValue = getPortfolioValue(state);

  const assetsOwned = state.assets.filter((a) => a.quantity > 0).length;

  const invested = state.assets.reduce(
    (sum, a) => sum + (a.avgPrice || 0) * a.quantity,
    0
  );

  const portfolioProfit = state.assets.reduce(
    (sum, a) => sum + (a.price - (a.avgPrice || 0)) * a.quantity,
    0
  );

  const totalExclusives = Object.values(state.exclusives).reduce(
    (sum, c) => sum + c.items.length,
    0
  );

  const exclusivesOwned = Object.values(state.exclusives).reduce(
    (sum, c) => sum + c.items.filter((i) => i.owned).length,
    0
  );

  const recentTransactions = [...state.transactions]
    .sort((a, b) => b.time - a.time)
    .slice(0, 5);

  const stats = [
    {
      label: 'Бизнесов',
      value: `${businessesOwned}/${state.businesses.length}`,
      icon: Building2,
      color: 'text-emerald-300',
    },
    {
      label: 'Активностей',
      value: totalBusinessLevels,
      icon: TrendingUp,
      color: 'text-cyan-300',
    },
    {
      label: 'Доход бизнеса',
      value: `${formatMoney(businessIncome, 1)}/сек`,
      icon: DollarSign,
      color: 'text-emerald-300',
    },
    {
      label: 'Активов',
      value: `${assetsOwned}/${state.assets.length}`,
      icon: TrendingUp,
      color: 'text-amber-300',
    },
    {
      label: 'Портфель',
      value: formatMoney(portfolioValue, 2),
      icon: DollarSign,
      color: 'text-emerald-300',
    },
    {
      label: 'Прибыль',
      value: `${portfolioProfit >= 0 ? '+' : ''}${formatMoney(portfolioProfit, 2)}`,
      icon: TrendingUp,
      color: portfolioProfit >= 0 ? 'text-emerald-300' : 'text-rose-300',
    },
    {
      label: 'Коллекций',
      value: `${exclusivesOwned}/${totalExclusives}`,
      icon: Gem,
      color: 'text-purple-300',
    },
    {
      label: 'Транзакций',
      value: state.transactions.length,
      icon: ArrowDownLeft,
      color: 'text-slate-300',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Карточка профиля */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-700/40 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/60 p-5 shadow-xl shadow-black/30">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-emerald-300">
              <User className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                Игрок
              </p>
              <p className="truncate text-lg font-semibold text-slate-50">
                {state.account.nickname}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                Всего заработано
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-emerald-300">
                {formatMoney(state.account.totalEarned)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                Кликов
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-cyan-300">
                {formatNumber(state.account.totalClicks, 0)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              Регистрация:{' '}
              {new Date(state.account.createdAt).toLocaleDateString('ru-RU')}
            </span>
          </div>
        </div>
      </div>

      {/* Смена никнейма */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4 backdrop-blur">
        <label
          className="text-sm font-medium text-slate-300"
          htmlFor="nickname"
        >
          Никнейм
        </label>

        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="nickname"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="Введите никнейм"
          />

          <button
            type="button"
            disabled={!nickname.trim()}
            onClick={() =>
              dispatch({
                type: 'SET_NICKNAME',
                nickname,
              })
            }
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Сохранить
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4 backdrop-blur">
        <h2 className="text-lg font-semibold text-slate-50">Статистика</h2>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-xl bg-slate-950/60 p-3"
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                  <p className="text-[10px] uppercase tracking-widest text-slate-500">
                    {stat.label}
                  </p>
                </div>
                <p className={`mt-1 text-sm font-semibold tabular-nums ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Последние транзакции */}
      {recentTransactions.length > 0 && (
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4 backdrop-blur">
          <h2 className="text-lg font-semibold text-slate-50">
            Последние сделки
          </h2>

          <div className="mt-3 space-y-1">
            {recentTransactions.map((trade) => {
              const asset = state.assets.find((a) => a.id === trade.assetId);

              return (
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
                        {trade.type === 'buy' ? 'Покупка' : 'Продажа'}
                        {trade.reason === 'stop-loss' && ' · Стоп-лосс'}
                      </p>
                      <p className="truncate text-xs tabular-nums text-slate-500">
                        {asset?.name || trade.assetId} ·{' '}
                        {formatNumber(trade.quantity, 4)} @{' '}
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
              );
            })}
          </div>
        </div>
      )}

      {/* Опасная зона */}
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300">
            <Trash2 className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <h2 className="text-base font-semibold text-rose-300">
              Опасная зона
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Сброс удалит весь прогресс игры. Это действие нельзя отменить.
            </p>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Точно сбросить весь прогресс?')) {
                  dispatch({ type: 'RESET' });
                }
              }}
              className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
            >
              Сбросить прогресс
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}