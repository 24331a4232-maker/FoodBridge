import { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function Sparkline({ data, width = 80, height = 28, color = '#4F8060', className = '' }: SparklineProps) {
  const { path, areaPath } = useMemo(() => {
    if (data.length < 2) return { path: '', areaPath: '' };
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);
    const points = data.map((d, i) => ({
      x: i * stepX,
      y: height - ((d - min) / range) * (height - 4) - 2,
    }));
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;
    return { path, areaPath };
  }, [data, width, height]);

  const gradientId = useMemo(() => `spark-grad-${color.replace('#', '')}`, [color]);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={`overflow-visible ${className}`} fill="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}
      {path && <path d={path} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}
