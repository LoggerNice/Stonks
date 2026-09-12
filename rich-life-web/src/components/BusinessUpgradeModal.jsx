import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUpgradeTimers, getUpgradeTime } from './BusinessUpgradeModal/useUpgradeTimers.js';
import ModalHeader from './BusinessUpgradeModal/ModalHeader.jsx';
import ActivityList from './BusinessUpgradeModal/ActivityList.jsx';

export default function BusinessUpgradeModal({
  business,
  money,
  isOpen,
  onClose,
  onUpgrade,
}) {
  const { upgradeTimers, startTimer } = useUpgradeTimers(business, isOpen);

  useEffect(() => {
    if (!isOpen) {
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

  const handleUpgrade = (activityId) => {
    onUpgrade(activityId);
    
    // Запускаем таймер для шаурмечной
    if (business.id === 'shaurma') {
      const activity = business.activities.find((a) => a.id === activityId);
      startTimer(activityId, activity?.level || 0);
    }
  };

  if (!isOpen || !business) {
    return null;
  }

  const isShawarma = business.id === 'shaurma';

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-800/60 bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Заголовок */}
        <ModalHeader business={business} onClose={onClose} />

        {/* Список улучшений */}
        <ActivityList
          activities={business.activities}
          money={money}
          isShawarma={isShawarma}
          upgradeTimers={upgradeTimers}
          onUpgrade={handleUpgrade}
        />
      </div>
    </div>,
    document.body
  );
}