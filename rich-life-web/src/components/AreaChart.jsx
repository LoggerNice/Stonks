import { useId } from 'react';

import { formatMoney } from '../utils/format';

export default function AreaChart({ points, positive, className = '' }) {
  const gradientId = useId().replace(/:/g, '');

  if (!Array.isArray(points) || points.length < 2) {
    return null;
  }

  const width = 320;
  const height = 140;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const mid = (min + max) / 2;
  const range = max - min || 1;
  const step = width / (points.length - 1);

  const coords = points.map((point, index) => {
    const x = index * step;
    const y = height - ((point - min) / range) * (height - 8) - 4;

    return [Number(x.toFixed(1)), Number(y.toFixed(1))];
  });

  const line = coords.map((coord) => coord.join(',')).join(' ');
  const area = `0,${height} ${line} ${width},${height}`;
  const color = positive ? '#34d399' : '#fb7185';
  const [lastX, lastY] = coords[coords.length - 1];

  const gridLines = [4, height / 2, height - 4];

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Сетка по оси Y */}
        {gridLines.map((y) => (
          <line
            key={y}
            x1="0"
            x2={width}
            y1={y}
            y2={y}
            stroke="#475569"
            strokeOpacity="0.35"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <polygon points={area} fill={`url(#${gradientId})`} />

        <polyline
          points={line}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        <circle cx={lastX} cy={lastY} r="7" fill={color} opacity="0.25" />
        <circle cx={lastX} cy={lastY} r="3.5" fill={color} />
      </svg>

      {/* Подписи цен по оси Y */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex flex-col items-start justify-between">
        <span className="rounded bg-slate-900/80 px-1 text-[9px] tabular-nums text-slate-400">
          {formatMoney(max, 2)}
        </span>
        <span className="rounded bg-slate-900/80 px-1 text-[9px] tabular-nums text-slate-400">
          {formatMoney(mid, 2)}
        </span>
        <span className="rounded bg-slate-900/80 px-1 text-[9px] tabular-nums text-slate-400">
          {formatMoney(min, 2)}
        </span>
      </div>
    </div>
  );
}