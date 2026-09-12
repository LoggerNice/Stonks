import { useEffect, useState } from 'react';

// Конфигурация времени для улучшений шаурмечной
const SHAWARMA_UPGRADE_TIMES = {
  shaurma_kiosk: 60, // 1 минута для первого уровня
  shaurma_delivery: 60,
  shaurma_night: 60,
  shaurma_franchise: 60,
};

export function getUpgradeTime(activityId, currentLevel) {
  if (currentLevel === 0) {
    return SHAWARMA_UPGRADE_TIMES[activityId] || 60;
  }
  // Время увеличивается в 3 раза с каждым уровнем
  return (SHAWARMA_UPGRADE_TIMES[activityId] || 60) * Math.pow(3, currentLevel);
}

export function useUpgradeTimers(business, isOpen) {
  const [upgradeTimers, setUpgradeTimers] = useState({});

  // Восстановление таймеров из localStorage при монтировании
  useEffect(() => {
    if (!business || !isOpen) {
      return;
    }

    try {
      const savedTimers = localStorage.getItem(`business_timers_${business.id}`);
      if (savedTimers) {
        const parsed = JSON.parse(savedTimers);
        const now = Date.now();
        // Фильтруем только активные таймеры (которые ещё не истекли)
        const activeTimers = {};
        let hasActiveTimers = false;
        
        Object.entries(parsed).forEach(([activityId, endTime]) => {
          if (endTime > now) {
            activeTimers[activityId] = endTime;
            hasActiveTimers = true;
          }
        });
        
        if (hasActiveTimers) {
          setUpgradeTimers(activeTimers);
        } else {
          // Если все таймеры истекли, очищаем localStorage
          localStorage.removeItem(`business_timers_${business.id}`);
        }
      }
    } catch (error) {
      console.error('Failed to restore upgrade timers:', error);
    }
  }, [business, isOpen]);

  // Таймер обратного отсчёта для улучшений
  useEffect(() => {
    if (!isOpen || !business) {
      return undefined;
    }

    const interval = setInterval(() => {
      setUpgradeTimers((prev) => {
        const updated = { ...prev };
        let hasChanges = false;

        business.activities.forEach((activity) => {
          if (prev[activity.id]) {
            const newEndTime = prev[activity.id] - 1000;
            if (newEndTime <= Date.now()) {
              delete updated[activity.id];
              hasChanges = true;
            } else {
              updated[activity.id] = newEndTime;
              hasChanges = true;
            }
          }
        });

        // Сохраняем обновлённые таймеры в localStorage
        if (hasChanges && business.id === 'shaurma') {
          try {
            if (Object.keys(updated).length > 0) {
              localStorage.setItem(`business_timers_${business.id}`, JSON.stringify(updated));
            } else {
              localStorage.removeItem(`business_timers_${business.id}`);
            }
          } catch (error) {
            console.error('Failed to save upgrade timers:', error);
          }
        }

        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, business]);

  const startTimer = (activityId, activityLevel) => {
    const upgradeTime = getUpgradeTime(activityId, activityLevel) * 1000;
    const endTime = Date.now() + upgradeTime;
    
    setUpgradeTimers((prev) => {
      const updated = {
        ...prev,
        [activityId]: endTime,
      };
      // Сохраняем в localStorage
      try {
        localStorage.setItem(`business_timers_${business.id}`, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save upgrade timers:', error);
      }
      return updated;
    });
  };

  return { upgradeTimers, startTimer };
}
