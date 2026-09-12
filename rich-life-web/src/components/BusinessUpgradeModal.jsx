import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import {
  getActivityCost,
  getActivityIncome,
  getBusinessIncome,
  getBusinessTotalLevel,
} from '../utils/selectors';
import { formatMoney } from '../utils/format';

export default function BusinessUpgradeModal({
  business,
  money,
  isOpen,
  onClose,
  onUpgrade,
}) {
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

  if (!isOpen || !business) {
    return null;
  }

  const income = getBusinessIncome(business);
  const totalLevel = getBusinessTotalLevel(business);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-800/60 bg-slate-900/95 p-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-50">
              {business.name}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {totalLevel > 0 ? 'Работает' : 'Не открыт'} · Уровней:{' '}
              {totalLevel} · Доход: +{formatMoney(income, 1)}/сек
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

        <div className="mt-4 space-y-1">
          {business.activities.map((activity) => {
            const cost = getActivityCost(activity);
            const currentIncome = getActivityIncome(activity);
            const canBuy = money >= cost;

            return (
              <div
                key={activity.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-slate-950/50 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-200">
                    {activity.name}
                  </p>
                  <p className="mt-0.5 text-xs tabular-nums text-slate-500">
                    Ур. {activity.level} ·{' '}
                    {activity.level > 0
                      ? `${formatMoney(currentIncome, 1)}/сек`
                      : `+${formatMoney(activity.baseIncomePerSecond, 1)}/сек`}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <p className="text-xs tabular-nums text-slate-500">
                    {formatMoney(cost)}
                  </p>

                  <button
                    type="button"
                    disabled={!canBuy}
                    onClick={() => onUpgrade(activity.id)}
                    className="rounded-lg border border-slate-700/60 bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700/60 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {activity.level === 0 ? 'Добавить' : 'Улучшить'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}