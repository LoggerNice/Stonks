import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Car, Home, Plane, Watch } from 'lucide-react';
import { formatMoney } from '../utils/format';


export default function CollectionModal({
  collection,
  money,
  isOpen,
  onClose,
  onBuy,
}) {
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedItem(null);
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

  if (!isOpen || !collection) {
    return null;
  }

  const canAfford = (item) => money >= item.price && !item.owned;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/95 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
                {/* Шапка */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-800/60 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-emerald-300">
                {(() => {
                    const iconMap = {
                        Car,
                        Home,
                        Plane,
                        Watch,
                    };
                    const Icon = iconMap[collection.iconName] || Car;
                    return <Icon className="h-5 w-5" />;
                })()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-50">
                {collection.name}
              </h2>
              <p className="text-xs text-slate-500">{collection.description}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Сетка товаров */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {collection.items.map((item) => {
              const owned = item.owned;
              const affordable = canAfford(item);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className={`group relative overflow-hidden rounded-2xl border text-left transition-all duration-200 ${
                    owned
                      ? 'cursor-default border-emerald-500/30 bg-emerald-500/5'
                      : affordable
                        ? 'border-slate-700/60 bg-slate-950/50 hover:border-emerald-400/40 hover:bg-slate-800/60'
                        : 'border-slate-800/60 bg-slate-950/30 opacity-70'
                  }`}
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-100">
                          {item.name}
                        </h3>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {item.description}
                        </p>
                      </div>

                      {owned && (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <p
                        className={`text-sm font-semibold tabular-nums ${
                          owned
                            ? 'text-emerald-300'
                            : affordable
                              ? 'text-slate-100'
                              : 'text-rose-300'
                        }`}
                      >
                        {formatMoney(item.price)}
                      </p>

                      {!owned && (
                        <button
                          type="button"
                          disabled={!affordable}
                          onClick={(e) => {
                            e.stopPropagation();
                            onBuy(collection.id, item.id);
                          }}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                            affordable
                              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                              : 'cursor-not-allowed bg-slate-800 text-slate-500'
                          }`}
                        >
                          Купить
                        </button>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}