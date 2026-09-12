import { X } from 'lucide-react';
import { formatMoney } from '../../utils/format';
import { getBusinessIncome, getBusinessTotalLevel } from '../../utils/selectors';

export default function ModalHeader({ business, onClose }) {
  const income = getBusinessIncome(business);
  const totalLevel = getBusinessTotalLevel(business);

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-slate-50">
          {business.name}
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          {totalLevel > 0 ? (
            <span className="text-emerald-400">● Работает</span>
          ) : (
            <span className="text-slate-500">● Не открыт</span>
          )}{' '}· Доход:{' '}
          <span className="font-semibold tabular-nums text-emerald-300">
            +{formatMoney(income, 1)}/сек
          </span>
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
  );
}
