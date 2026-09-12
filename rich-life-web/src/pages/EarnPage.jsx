import { useGame, useGameDispatch } from '../store/gameStore';
import { getClickPower } from '../utils/selectors';
import { formatMoney } from '../utils/format';
import Card from '../components/Card';

export default function EarnPage() {
  const state = useGame();
  const dispatch = useGameDispatch();

  const clickPower = getClickPower(state.exclusives);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Заработок</h1>
        <p className="text-sm text-slate-400">
          Активные действия дают быстрые деньги, но масштаб дают бизнес и
          инвестиции.
        </p>
      </div>

      <Card className="text-center">
        <p className="text-sm text-slate-400">Сила клика</p>
        <p className="text-2xl font-bold text-emerald-300">
          {formatMoney(clickPower)}
        </p>

        <button
          type="button"
          onClick={() => dispatch({ type: 'CLICK_EARN' })}
          className="mx-auto mt-6 flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-400 via-emerald-500 to-cyan-400 text-3xl font-black text-slate-950 shadow-2xl transition active:scale-95"
        >
          +{formatMoney(clickPower)}
        </button>

        <p className="mt-6 text-sm text-slate-400">
          Всего кликов: {state.account.totalClicks}
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Как расти быстрее</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
          <li>Покупайте бизнесы, чтобы доход капал даже без кликов.</li>
          <li>Эксклюзив усиливает клики и пассивный доход.</li>
          <li>Инвестиции могут дать прибыль на росте цены и дивидендах.</li>
        </ul>
      </Card>
    </div>
  );
}