import { formatMoney } from '../../utils/format';
import ActivityIcon, { getActivityDescription } from './ActivityIcon.jsx';
import UpgradeButton from './UpgradeButton.jsx';
import UpgradeTimer from './UpgradeTimer.jsx';

export default function ActivityItem({ 
  activity, 
  money, 
  isShawarma, 
  isUpgrading, 
  timeRemaining, 
  nextLevelTime,
  onUpgrade 
}) {
  const canBuy = money >= activity.cost;
  const timeRemainingSeconds = Math.max(0, Math.ceil(timeRemaining / 1000));
  
  const description = getActivityDescription(activity.id, isShawarma);

  return (
    <div
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
        <UpgradeTimer timeRemaining={timeRemaining} nextLevelTime={nextLevelTime} />
      )}

      <div className="flex items-center gap-3">
        {/* Иконка */}
        <ActivityIcon 
          activity={activity} 
          isShawarma={isShawarma} 
          isUpgrading={isUpgrading} 
        />

        {/* Информация */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-slate-200">
              {activity.name}
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
                ? `${formatMoney(activity.baseIncomePerSecond * Math.pow(2, activity.level - 1), 1)}/сек`
                : `+${formatMoney(activity.baseIncomePerSecond, 1)}/сек при покупке`}
            </span>
          </div>
        </div>

        {/* Кнопка и цена */}
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <UpgradeButton
            activity={activity}
            canBuy={canBuy}
            isUpgrading={isUpgrading}
            timeRemainingSeconds={timeRemainingSeconds}
            onUpgrade={() => onUpgrade(activity.id)}
          />
        </div>
      </div>
    </div>
  );
}
