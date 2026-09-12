export default function Sparkline({ points, positive, className = '' }) {
  if (!Array.isArray(points) || points.length < 2) {
    return null;
  }

  const width = 120;
  const height = 36;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = width / (points.length - 1);

  const coords = points.map((point, index) => {
    const x = index * step;
    const y = height - ((point - min) / range) * (height - 6) - 3;

    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const color = positive ? '#34d399' : '#fb7185';
  const [lastX, lastY] = coords[coords.length - 1].split(',');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
    >
      <polyline
        points={coords.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r="3" fill={color} />
    </svg>
  );
}