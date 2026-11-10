import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { CLAMP } from "./core";

/* Draw-on motion, adapted from the "stroke-by-stroke" idea in
   cloveric/claude-drawing-skill. That skill needs numpy + Pillow to paint
   GIFs; we only want the look, so this is done natively with SVG
   stroke-dashoffset — deterministic, dependency-free, renders in CI.

   These used to live at src/draw.tsx, where they looked like episode 5's
   private helpers. They are shared primitives, so they live in the kit now and
   src/draw.tsx re-exports them for the shipped episode. */

/** A path that draws itself on, stroke by stroke. */
export const DrawPath: React.FC<{
  d: string;
  length: number;
  color?: string;
  width?: number;
  delay?: number;
  duration?: number;
  opacity?: number;
}> = ({ d, length, color = "#22D3EE", width = 4, delay = 0, duration = 45, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, duration], [0, 1], CLAMP);
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={length}
      strokeDashoffset={length * (1 - p)}
      opacity={opacity}
    />
  );
};

/** A node that pops in as its line finishes drawing. */
export const DrawDot: React.FC<{
  cx: number;
  cy: number;
  r?: number;
  color?: string;
  delay?: number;
}> = ({ cx, cy, r = 7, color = "#22D3EE", delay = 0 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 10], [0, 1], CLAMP);
  return (
    <g opacity={p}>
      <circle cx={cx} cy={cy} r={r * 2.6} fill={color} opacity={0.12} />
      <circle cx={cx} cy={cy} r={r} fill={color} />
    </g>
  );
};
