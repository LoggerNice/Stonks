export default function UpgradeTimer({ timeRemaining, nextLevelTime }) {
  const percentage = Math.max(0, Math.min(100, (timeRemaining / (nextLevelTime * 1000)) * 100));

  return (
    <div className="absolute bottom-0 left-0 h-0.5 bg-amber-500/50 transition-all" style={{ width: `${percentage}%` }} />
  );
}
