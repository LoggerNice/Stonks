import { useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

import { useGame, useGameDispatch } from '../store/gameStore';
import { getBusinessIncome } from '../utils/selectors';
import { formatMoney } from '../utils/format';
import BusinessUpgradeModal from '../components/BusinessUpgradeModal';

const businessImages = {
  shaurma: '/images/shaurma.png',
  cargo: '/images/cargo.png',
  carwash: '/images/carwash.png',
  factory: '/images/factory.png',
  autoservice: '/images/autoservice.png',
  construction: '/images/construction.png',
  it: '/images/it.png',
  hospital: '/images/hospital.png',
};

export default function BusinessPage() {
  const state = useGame();
  const dispatch = useGameDispatch();

  const [selectedId, setSelectedId] = useState(
    state.businesses[0]?.id ?? null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sliderRef = useRef(null);

  const selected =
    state.businesses.find((business) => business.id === selectedId) ||
    state.businesses[0];

  if (!selected) {
    return null;
  }

  const income = getBusinessIncome(selected);

  const selectBusiness = (businessId) => {
    setSelectedId(businessId);
    setIsModalOpen(false);
  };

  const scrollSlider = (direction) => {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    slider.scrollBy({
      left: direction * slider.clientWidth * 0.8,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative z-10">
      {/* Фон на всю страницу */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <img
          key={selected.id}
          src={businessImages[selected.id]}
          alt=""
          className="bg-fade h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/30 to-slate-950/95" />
      </div>

      {/* Контент, центрированный по вертикали */}
      <div className="relative z-10 flex min-h-[calc(100dvh-14rem)] flex-col justify-center gap-6">
        {/* Слайдер карточек */}
        <div className="relative">
          <button
            type="button"
            aria-label="Назад"
            onClick={() => scrollSlider(-1)}
            className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-700/60 bg-slate-950/70 p-2 text-slate-200 backdrop-blur transition-colors hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div
            ref={sliderRef}
            className="flex snap-x snap-mandatory items-end gap-3 overflow-x-auto scroll-smooth px-10 pb-2 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {state.businesses.map((business) => {
              const isActive = business.id === selected.id;

              return (
                <button
                  key={business.id}
                  type="button"
                  title={business.name}
                  aria-pressed={isActive}
                  onClick={() => selectBusiness(business.id)}
                  className={`relative h-32 w-44 shrink-0 snap-start overflow-hidden rounded-2xl transition-all duration-300 sm:h-40 sm:w-56 ${
                    isActive
                      ? 'mb-6 border-2 border-emerald-400'
                      : 'opacity-60 border-2 border-white/10 hover:opacity-100'
                  }`}
                >
                  <img
                    src={businessImages[business.id]}
                    alt={business.name}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-2">
                    <p className="truncate text-xs font-medium text-slate-100">
                      {business.name}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            aria-label="Вперёд"
            onClick={() => scrollSlider(1)}
            className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-700/60 bg-slate-950/70 p-2 text-slate-200 backdrop-blur transition-colors hover:bg-slate-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Слева текст и описание, справа доход над кнопкой */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-prose space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
              {selected.name}
            </h1>

            <p className="text-sm leading-relaxed text-slate-300">
              {selected.description}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-3">
            <div className="text-right">
              <p className="mt-1 text-xl font-semibold tabular-nums text-emerald-300">
                +{formatMoney(income, 1)}/сек
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
            >
              Подробнее
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Модальное окно вынесено в отдельный компонент */}
      <BusinessUpgradeModal
        business={selected}
        money={state.money}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpgrade={(activityId) =>
          dispatch({
            type: 'BUY_BUSINESS_ACTIVITY',
            businessId: selected.id,
            activityId,
          })
        }
      />
    </div>
  );
}