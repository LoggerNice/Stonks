import {
  Building2,
  TrendingUp,
  Coins,
  Gem,
  User,
} from 'lucide-react';

const tabs = [
  {
    id: 'business',
    label: 'Бизнес',
    icon: Building2,
  },
  {
    id: 'investments',
    label: 'Инвестиции',
    icon: TrendingUp,
  },
  {
    id: 'earn',
    label: 'Заработок',
    icon: Coins,
  },
  {
    id: 'exclusive',
    label: 'Эксклюзив',
    icon: Gem,
  },
  {
    id: 'account',
    label: 'Аккаунт',
    icon: User,
  },
];

export default function TabBar({ active, onChange }) {
  const activeIndex = Math.max(
    tabs.findIndex((tab) => tab.id === active),
    0
  );

  return (
    <nav
      aria-label="Основное меню"
      className="fixed inset-x-0 bottom-3 z-50 px-4"
    >
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-800/60 bg-slate-950/90 p-1.5 backdrop-blur">
        <div className="relative">
          {/* Ползунок активной кнопки */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1/5 rounded-xl bg-slate-900 transition-transform duration-300 ease-out motion-reduce:transition-none"
            style={{
              transform: `translateX(${activeIndex * 100}%)`,
            }}
          />

          {/* Кнопки */}
          <div className="relative grid grid-cols-5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = active === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  title={tab.label}
                  aria-pressed={isActive}
                  onClick={() => onChange(tab.id)}
                  className={`relative z-10 flex min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition-colors duration-200 active:scale-95 ${
                    isActive
                      ? 'text-emerald-300'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-transform duration-300 ${
                      isActive ? 'scale-110' : 'scale-100'
                    }`}
                  />

                  <span className="w-full truncate text-center text-[10px] font-medium leading-none">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}