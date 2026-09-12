import ActivityItem from './ActivityItem';

export default function ActivityList({ 
  activities, 
  money, 
  isShawarma, 
  upgradeTimers, 
  onUpgrade 
}) {
  return (
    <div className="mt-4 space-y-2">
      {activities.map((activity) => {
        const isUpgrading = upgradeTimers[activity.id] !== undefined;
        const timeRemaining = isUpgrading ? upgradeTimers[activity.id] - Date.now() : 0;
        
        // Получаем время улучшения для текущего уровня
        let nextLevelTime = 60; // значение по умолчанию
        if (isShawarma) {
          const SHAWARMA_UPGRADE_TIMES = {
            shaurma_kiosk: 60,
            shaurma_delivery: 60,
            shaurma_night: 60,
            shaurma_franchise: 60,
          };
          const baseTime = SHAWARMA_UPGRADE_TIMES[activity.id] || 60;
          nextLevelTime = activity.level === 0 
            ? baseTime 
            : baseTime * Math.pow(3, activity.level);
        }

        return (
          <ActivityItem
            key={activity.id}
            activity={activity}
            money={money}
            isShawarma={isShawarma}
            isUpgrading={isUpgrading}
            timeRemaining={timeRemaining}
            nextLevelTime={nextLevelTime}
            onUpgrade={onUpgrade}
          />
        );
      })}
    </div>
  );
}
