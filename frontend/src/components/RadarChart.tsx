import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';

export type RadarChartItem = {
  label: string;
  value: number;
};

function clamp(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export default function RadarChart({
  title,
  items,
  max = 10,
  size = 260,
}: {
  title: string;
  items: RadarChartItem[];
  max?: number;
  size?: number;
}) {
  const points = useMemo(() => {
    const cx = size / 2;
    const cy = size / 2;
    const r = (size / 2) * 0.72;
    const n = Math.max(items.length, 3);
    const start = -Math.PI / 2;

    const axes = items.map((it, i) => {
      const angle = start + (2 * Math.PI * i) / n;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      return { ...it, angle, axisX: x, axisY: y };
    });

    const polygon = axes
      .map((it) => {
        const v = clamp(it.value, 0, max) / max;
        const x = cx + r * v * Math.cos(it.angle);
        const y = cy + r * v * Math.sin(it.angle);
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');

    const rings = [0.25, 0.5, 0.75, 1].map((ratio) => {
      const ring = axes
        .map((it) => {
          const x = cx + r * ratio * Math.cos(it.angle);
          const y = cy + r * ratio * Math.sin(it.angle);
          return `${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(' ');
      return ring;
    });

    return { cx, cy, r, axes, polygon, rings };
  }, [items, max, size]);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
          {points.rings.map((ring, idx) => (
            <polygon key={idx} points={ring} fill="none" stroke="rgba(102, 126, 234, 0.18)" strokeWidth="1" />
          ))}
          {points.axes.map((it, idx) => (
            <line
              key={idx}
              x1={points.cx}
              y1={points.cy}
              x2={it.axisX}
              y2={it.axisY}
              stroke="rgba(0,0,0,0.08)"
              strokeWidth="1"
            />
          ))}

          <polygon points={points.polygon} fill="rgba(102, 126, 234, 0.22)" stroke="#667eea" strokeWidth="2" />

          {points.axes.map((it, idx) => {
            const v = clamp(it.value, 0, max) / max;
            const px = points.cx + points.r * v * Math.cos(it.angle);
            const py = points.cy + points.r * v * Math.sin(it.angle);
            return <circle key={idx} cx={px} cy={py} r="3.5" fill="#667eea" />;
          })}

          {points.axes.map((it, idx) => {
            const offset = 16;
            const lx = points.cx + (points.r + offset) * Math.cos(it.angle);
            const ly = points.cy + (points.r + offset) * Math.sin(it.angle);
            const anchor = Math.abs(Math.cos(it.angle)) < 0.2 ? 'middle' : Math.cos(it.angle) > 0 ? 'start' : 'end';
            const baseline = Math.abs(Math.sin(it.angle)) < 0.2 ? 'middle' : Math.sin(it.angle) > 0 ? 'hanging' : 'baseline';
            const val = clamp(it.value, 0, max);
            return (
              <text
                key={idx}
                x={lx}
                y={ly}
                textAnchor={anchor}
                dominantBaseline={baseline as any}
                fontSize="11"
                fill="rgba(0,0,0,0.72)"
              >
                {it.label} {val.toFixed(1)}
              </text>
            );
          })}
        </svg>
      </Box>
    </Box>
  );
}

