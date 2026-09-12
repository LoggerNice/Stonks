import { Clock, DollarSign, TrendingUp } from 'lucide-react';
import { formatMoney } from '../../utils/format';

export default function UpgradeButton({ 
  activity, 
  canBuy, 
  isUpgrading, 
  timeRemainingSeconds,
  onUpgrade 
}) {
  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds} сек`;
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} мин`;
    }
    const hours = Math.floor(minutes / 60);
    return `${hours} ч`;
  };

  if (isUpgrading) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1.5">
        <Clock className="h-3.5 w-3.5 text-amber-400" />
        <span className="text-xs font-medium tabular-nums text-amber-400">
          {formatTime(timeRemainingSeconds)}
        </span>
      </div>
    );
  }

  return (
    <>
      <p className="text-xs tabular-nums text-slate-500">
        {formatMoney(activity.cost)}
      </p>

      <button
        type="button"
        disabled={!canBuy}
        onClick={onUpgrade}
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
  );
}
