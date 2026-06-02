import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';

export type LineChartPoint = {
  label: string;
  value: number;
};

function clamp(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export default function LineChart({
  title,
  points,
  max = 10,
  width = 420,
  height = 220,
}: {
  title: string;
  points: LineChartPoint[];
  max?: number;
  width?: number;
  height?: number;
}) {
  const layout = useMemo(() => {
    const padL = 36;
    const padR = 16;
    const padT = 12;
    const padB = 42;
    const innerW = width - padL - padR;
    const innerH = height - padT - padB;

    const safePoints = points.length > 1 ? points : [{ label: '—', value: 0 }, ...points];
    const stepX = safePoints.length > 1 ? innerW / (safePoints.length - 1) : innerW;

    const xy = safePoints.map((p, i) => {
      const v = clamp(p.value, 0, max);
      const x = padL + stepX * i;
      const y = padT + innerH * (1 - v / max);
      return { ...p, v, x, y };
    });

    const path = xy.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
    const gridY = [0, 0.25, 0.5, 0.75, 1].map((r) => ({
      y: padT + innerH * r,
      label: String(Math.round(max * (1 - r))),
    }));

    return { padL, padR, padT, padB, innerW, innerH, xy, path, gridY };
  }, [height, max, points, width]);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Box sx={{ overflowX: 'auto' }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img">
          {layout.gridY.map((g, idx) => (
            <g key={idx}>
              <line x1={layout.padL} y1={g.y} x2={width - layout.padR} y2={g.y} stroke="rgba(0,0,0,0.08)" />
              <text x={layout.padL - 10} y={g.y} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="rgba(0,0,0,0.55)">
                {g.label}
              </text>
            </g>
          ))}

          <polyline points={layout.path} fill="none" stroke="#4facfe" strokeWidth="2.5" />
          <polyline points={`${layout.path} ${width - layout.padR},${height - layout.padB} ${layout.padL},${height - layout.padB}`} fill="rgba(79, 172, 254, 0.12)" stroke="none" />

          {layout.xy.map((p, idx) => (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r="4" fill="#4facfe" />
              <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="11" fill="rgba(0,0,0,0.75)">
                {p.v.toFixed(1)}
              </text>
              <text x={p.x} y={height - layout.padB + 20} textAnchor="middle" fontSize="11" fill="rgba(0,0,0,0.65)">
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </Box>
    </Box>
  );
}

