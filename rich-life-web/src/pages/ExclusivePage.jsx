import { useState } from 'react';
import { Car, Home, Plane, Watch } from 'lucide-react';
import { useGame, useGameDispatch } from '../store/gameStore';
import CollectionModal from '../components/CollectionModal';



export default function ExclusivePage() {
  const state = useGame();
  const dispatch = useGameDispatch();

  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const collections = Object.values(state.exclusives);
  const iconMap = {
    Car,
    Home,
    Plane,
    Watch,
  };
  const openCollection = (collection) => {
    setSelectedCollection(collection);
    setIsModalOpen(true);
  };

  const handleBuy = (collectionId, itemId) => {
    const collection = state.exclusives[collectionId];
    const item = collection.items.find((i) => i.id === itemId);

    if (!item || item.owned || state.money < item.price) {
      return;
    }

    dispatch({
      type: 'BUY_COLLECTION_ITEM',
      collectionId,
      itemId,
      price: item.price,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Эксклюзив</h1>
        <p className="text-sm text-slate-400">
          Коллекционируй редкие предметы роскоши
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {collections.map((collection) => {
          const ownedCount = collection.items.filter((item) => item.owned)
            .length;
          const totalCount = collection.items.length;
          const Icon = iconMap[collection.icon] || Car;

          return (
            <button
              key={collection.id}
              type="button"
              onClick={() => openCollection(collection)}
              className="group relative overflow-hidden rounded-3xl border border-slate-800/60 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-5 text-left transition-all duration-200 hover:border-emerald-400/30 hover:shadow-lg hover:shadow-emerald-500/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-emerald-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-50">
                      {collection.name}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {collection.description}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums text-emerald-300">
                    {ownedCount}/{totalCount}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500">
                    Собрано
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300 transition-all duration-500"
                    style={{
                      width: `${(ownedCount / totalCount) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  {ownedCount === totalCount
                    ? 'Коллекция собрана!'
                    : `${totalCount - ownedCount} предметов осталось`}
                </p>

                <span className="text-xs font-medium text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                  Открыть →
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <CollectionModal
        collection={selectedCollection}
        money={state.money}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBuy={handleBuy}
      />
    </div>
  );
} 