import { Clock, Store, Truck, Moon, Handshake } from 'lucide-react';

// Иконки Lucide для улучшений шаурмечной
const shawarmaIcons = {
  shaurma_kiosk: Store,
  shaurma_delivery: Truck,
  shaurma_night: Moon,
  shaurma_franchise: Handshake,
};

// Описания для улучшений
const shawarmaActivityDescriptions = {
  shaurma_kiosk: 'Открытие новых точек продаж',
  shaurma_delivery: 'Расширение территории доставки',
  shaurma_night: 'Работа в ночное время',
  shaurma_franchise: 'Продажа франшизы партнёрам',
};

export default function ActivityIcon({ activity, isShawarma, isUpgrading }) {
  const IconComponent = isShawarma ? shawarmaIcons[activity.id] : null;

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800/80">
      {isUpgrading ? (
        <Clock className="h-5 w-5 animate-pulse text-amber-400" />
      ) : IconComponent ? (
        <IconComponent className="h-5 w-5 text-slate-300" />
      ) : (
        <span className="text-lg">📦</span>
      )}
    </div>
  );
}

export function getActivityDescription(activityId, isShawarma) {
  return isShawarma ? (shawarmaActivityDescriptions[activityId] || '') : '';
}
