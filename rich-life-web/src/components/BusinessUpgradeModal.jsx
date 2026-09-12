import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, TrendingUp, DollarSign, CheckCircle2 } from 'lucide-react';

import {
  getActivityCost,
  getActivityIncome,
  getBusinessIncome,
  getBusinessTotalLevel,
} from '../utils/selectors';
import { formatMoney } from '../utils/format';

// Конфигурация времени для улучшений шаурмечной
const SHAWARMA_UPGRADE_TIMES = {
  shaurma_kiosk: 60, // 1 минута для первого уровня
  shaurma_delivery: 60,
  shaurma_night: 60,
  shaurma_franchise: 60,
};

function getUpgradeTime(activityId, currentLevel) {
  if (currentLevel === 0) {
    return SHAWARMA_UPGRADE_TIMES[activityId] || 60;
  }
  // Время увеличивается в 3 раза с каждым уровнем
  return (SHAWARMA_UPGRADE_TIMES[activityId] || 60) * Math.pow(3, currentLevel);
}

function formatTime(seconds) {
  if (seconds < 60) {
    return `${seconds} сек`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} мин`;
  }
  const hours = Math.floor(minutes / 60);
  return `${hours} ч`;
}

// Иконки для улучшений шаурмечной
const shawarmaIcons = {
  shaurma_kiosk: '🏪',
  shaurma_delivery: '🚗',
  shaurma_night: '🌙',
  shaurma_franchise: '🤝',
};

// Новые названия для улучшений с точки зрения реального бизнеса
const shawarmaActivityNames = {
  shaurma_kiosk: 'Филиалы',
  shaurma_delivery: 'Зона доставки',
  shaurma_night: 'Режим работы',
  shaurma_franchise: 'Франшиза',
};

// Описания для улучшений
const shawarmaActivityDescriptions = {
  shaurma_kiosk: 'Открытие новых точек продаж',
  shaurma_delivery: 'Расширение территории доставки',
  shaurma_night: 'Работа в ночное время',
  shaurma_franchise: 'Продажа франшизы партнёрам',
};

export default function BusinessUpgradeModal({
  business,
  money,
  isOpen,
  onClose,
  onUpgrade,
}) {
  const [upgradeTimers, setUpgradeTimers] = useState({});

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

  // Таймер обратного отсчёта для улучшений
  useEffect(() => {
    if (!isOpen || !business) {
      return undefined;
    }

    const interval = setInterval(() => {
      setUpgradeTimers((prev) => {
        const updated = { ...prev };
        let hasChanges = false;

        business.activities.forEach((activity) => {
          if (prev[activity.id]) {
            const newEndTime = prev[activity.id] - 1000;
            if (newEndTime <= Date.now()) {
              delete updated[activity.id];
              hasChanges = true;
            } else {
              updated[activity.id] = newEndTime;
              hasChanges = true;
            }
          }
        });

        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, business]);

  const handleUpgrade = (activityId) => {
    onUpgrade(activityId);
    
    // Запускаем таймер для шаурмечной
    if (business.id === 'shaurma') {
      const activity = business.activities.find((a) => a.id === activityId);
      const upgradeTime = getUpgradeTime(activityId, activity?.level || 0) * 1000;
      setUpgradeTimers((prev) => ({
        ...prev,
        [activityId]: Date.now() + upgradeTime,
      }));
    }
  };

  if (!isOpen || !business) {
    return null;
  }

  const income = getBusinessIncome(business);
  const totalLevel = getBusinessTotalLevel(business);

  const isShawarma = business.id === 'shaurma';

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-800/60 bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-50">
              {isShawarma ? '🥙' : '🏢'} {business.name}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {totalLevel > 0 ? (
                <span className="text-emerald-400">● Работает</span>
              ) : (
                <span className="text-slate-500">● Не открыт</span>
              )}{' '}
              · Уровней: <span className="font-semibold text-slate-200">{totalLevel}</span> · Доход:{' '}
              <span className="font-semibold tabular-nums text-emerald-300">
                +{formatMoney(income, 1)}/сек
              </span>
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

        {/* Список улучшений */}
        <div className="mt-4 space-y-2">
          {business.activities.map((activity) => {
            const cost = getActivityCost(activity);
            const currentIncome = getActivityIncome(activity);
            const canBuy = money >= cost;
            const isUpgrading = upgradeTimers[activity.id] !== undefined;
            const timeRemaining = isUpgrading ? upgradeTimers[activity.id] - Date.now() : 0;
            const timeRemainingSeconds = Math.max(0, Math.ceil(timeRemaining / 1000));
            const nextLevelTime = getUpgradeTime(activity.id, activity.level);
            
            // Для шаурмечной используем новые названия
            const displayName = isShawarma 
              ? (shawarmaActivityNames[activity.id] || activity.name)
              : activity.name;
            
            const description = isShawarma
              ? (shawarmaActivityDescriptions[activity.id] || '')
              : '';
            
            const icon = isShawarma
              ? (shawarmaIcons[activity.id] || '📦')
              : '📦';

            return (
              <div
                key={activity.id}
                className={`group relative overflow-hidden rounded-xl border px-4 py-3 transition-all ${
                  isUpgrading
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : canBuy
                    ? 'border-slate-700/50 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/50'
                    : 'border-slate-800/50 bg-slate-950/30'
                }`}
              >
                {/* Индикатор прогресса для шаурмечной */}
                {isUpgrading && (
                  <div
                    className="absolute bottom-0 left-0 h-0.5 bg-amber-500/50 transition-all"
                    style={{
                      width: `${Math.max(0, Math.min(100, (timeRemaining / (nextLevelTime * 1000)) * 100))}%`,
                    }}
                  />
                )}

                <div className="flex items-center gap-3">
                  {/* Иконка */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800/80 text-lg">
                    {isUpgrading ? (
                      <Clock className="h-5 w-5 animate-pulse text-amber-400" />
                    ) : activity.level > 0 ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <span>{icon}</span>
                    )}
                  </div>

                  {/* Информация */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-slate-200">
                        {displayName}
                      </p>
                      {activity.level > 0 && !isUpgrading && (
                        <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-400">
                          Ур. {activity.level}
                        </span>
                      )}
                    </div>
                    
                    {description && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {description}
                      </p>
                    )}
                    
                    <div className="mt-1 flex items-center gap-3 text-xs">
                      <span className={`tabular-nums ${
                        activity.level > 0 ? 'text-slate-500' : 'text-slate-600'
                      }`}>
                        {activity.level > 0
                          ? `${formatMoney(currentIncome, 1)}/сек`
                          : `+${formatMoney(activity.baseIncomePerSecond, 1)}/сек при покупке`}
                      </span>
                      
                      {isShawarma && !isUpgrading && activity.level > 0 && (
                        <span className="text-slate-600">
                          След. уровень: {formatTime(nextLevelTime)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Кнопка и цена */}
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    {isUpgrading ? (
                      <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1.5">
                        <Clock className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-xs font-medium tabular-nums text-amber-400">
                          {formatTime(timeRemainingSeconds)}
                        </span>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs tabular-nums text-slate-500">
                          {formatMoney(cost)}
                        </p>

                        <button
                          type="button"
                          disabled={!canBuy}
                          onClick={() => handleUpgrade(activity.id)}
                          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                            canBuy
                              ? 'bg-emerald-500/90 text-white hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20'
                              : 'cursor-not-allowed bg-slate-800/50 text-slate-500'
                          }`}
                        >
                          {activity.level === 0 ? (
                            <>
                              <DollarSign className="h-3 w-3" />
                              Открыть
                            </>
                          ) : (
                            <>
                              <TrendingUp className="h-3 w-3" />
                              Улучшить
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Подсказка для шаурмечной */}
        {isShawarma && (
          <div className="mt-4 rounded-lg bg-slate-800/30 px-3 py-2 text-xs text-slate-400">
            <Clock className="mr-1 inline h-3 w-3" />
            Для шаурмечной каждое улучшение требует времени: первый уровень — 1 минута, 
            каждое следующее — в 3 раза дольше предыдущего
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}