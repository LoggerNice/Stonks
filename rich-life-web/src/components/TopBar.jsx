import { useGame } from '../store/gameStore';
import { getTotalIncomePerSecond } from '../utils/selectors';
import { formatMoney } from '../utils/format';

export default function TopBar() {
  const state = useGame();
  const incomePerSecond = getTotalIncomePerSecond(state);

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-4">
      <div className="mx-auto max-w-5xl ">
        <div className="flex justify-end px-4 py-2.5">
          <div className="text-right">
            <p className="mt-0.5 font-bold tabular-nums text-slate-50 text-xl">
              {formatMoney(state.money)}
            </p>
            <p className="mt-0.5 text-xs font-semibold tabular-nums text-emerald-300">
              +{formatMoney(incomePerSecond, 1)}/сек
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}