import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";

/* Shared primitives for the vertical 1080x1920 shorts.
 *
 * WHY THIS IS NOT IN src/chrome: render.yml treats video/src/chrome,
 * video/src/theme and video/tools as shared, so touching them re-renders EVERY
 * episode in episodes.json. A helper used by one short must not cost seven
 * renders per tweak.
 *
 * CONSEQUENCE, ON PURPOSE: a change here resolves to no episode in the plan
 * job (owner() matches srcDir prefixes only), so it never auto-selects its
 * consumers. After editing this file, dispatch the affected composition
 * manually. That is the zero-waste policy, applied literally.
 */

/** Usable width at 1080 wide with 64px padding on both sides. */
export const PW = 920;

export const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
export const ease = Easing.bezier(0.22, 1, 0.36, 1);

export const prog = (frame: number, start: number, dur: number) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...CLAMP, easing: ease });

/** Progress between two FRACTIONS of a scene's measured length.
 *  Scenes are cut to measured narration, so absolute frame numbers drift;
 *  fractions do not. */
export const ph = (frame: number, d: number, a: number, b: number) =>
  interpolate(frame, [a * d, b * d], [0, 1], { ...CLAMP, easing: ease });

export const useScene = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return { frame, d: durationInFrames };
};

/** Fade + rise, the default entrance for anything that is not a hard cut. */
export const rise = (p: number, dist = 28) => ({
  opacity: p,
  transform: `translateY(${(1 - p) * dist}px)`,
});

/* ---------------------------------------------------------------- text --- */

export const Top: React.FC<{ text: string; color?: string }> = ({ text, color = C.faint }) => (
  <div
    style={{
      position: "absolute",
      top: 120,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
    }}
  >
    <div style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: "0.32em", color }}>{text}</div>
  </div>
);

export const Sub: React.FC<{ text: string; p: number; size?: number; color?: string }> = ({
  text,
  p,
  size = 46,
  color = C.dim,
}) => (
  <div
    style={{
      fontFamily: F.sans,
      fontSize: size,
      lineHeight: 1.34,
      color,
      textAlign: "center",
      maxWidth: PW,
      ...rise(p, 16),
    }}
  >
    {text}
  </div>
);

/** The big line. 92-130 is the range that reads on a phone at arm's length.
 *  Takes children, not a string, so the caller controls the line breaks:
 *  at 96px a centre-wrapped headline lands wherever the box decides, and that
 *  is how a two-word orphan ships. */
export const Statement: React.FC<{
  p: number;
  size?: number;
  color?: string;
  weight?: number;
  children: React.ReactNode;
}> = ({ p, size = 108, color = C.text, weight = 800, children }) => (
  <div
    style={{
      fontFamily: F.sans,
      fontWeight: weight,
      fontSize: size,
      letterSpacing: "-0.045em",
      lineHeight: 1.04,
      color,
      textAlign: "center",
      maxWidth: PW,
      ...rise(p, 30),
    }}
  >
    {children}
  </div>
);

/* ---------------------------------------------------------------- atoms --- */

export const Bar: React.FC<{
  frac: number;
  color: string;
  width?: number;
  height?: number;
  track?: string;
}> = ({ frac, color, width = PW, height = 26, track = "#151823" }) => (
  <div
    style={{
      width,
      height,
      borderRadius: height,
      backgroundColor: track,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        width: Math.max(0, Math.min(1, frac)) * width,
        height,
        borderRadius: height,
        backgroundColor: color,
      }}
    />
  </div>
);

export const Chip: React.FC<{
  label: string;
  color?: string;
  p?: number;
  size?: number;
}> = ({ label, color = C.dim, p = 1, size = 26 }) => (
  <div
    style={{
      border: `1px solid ${C.panelEdge}`,
      borderRadius: 14,
      padding: "18px 26px",
      backgroundColor: C.panel,
      opacity: p,
    }}
  >
    <div style={{ fontFamily: F.mono, fontSize: size, letterSpacing: "0.14em", color }}>{label}</div>
  </div>
);

export const Stat: React.FC<{
  value: string;
  label: string;
  color?: string;
  p: number;
  size?: number;
  note?: string;
}> = ({ value, label, color = C.text, p, size = 210, note }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: p }}>
    <div
      style={{
        fontFamily: F.sans,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 0.94,
        letterSpacing: "-0.055em",
        color,
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontFamily: F.mono,
        fontSize: 27,
        letterSpacing: "0.24em",
        color: C.dim,
        marginTop: 12,
        textAlign: "center",
      }}
    >
      {label}
    </div>
    {note ? (
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 20,
          letterSpacing: "0.1em",
          color: C.amber,
          marginTop: 14,
          border: `1px solid rgba(251,191,36,0.35)`,
          borderRadius: 8,
          padding: "8px 14px",
        }}
      >
        {note}
      </div>
    ) : null}
  </div>
);

/* --------------------------------------------------------------- matrix --- */

type MatrixProps = {
  rows: number;
  cols: number;
  cell: number;
  gap?: number;
  text: (r: number, c: number) => string;
  color?: (r: number, c: number) => string;
  bg?: (r: number, c: number) => string;
  opacity?: (r: number, c: number) => number;
  border?: (r: number, c: number) => string;
  font?: number;
  radius?: number;
};

export const Matrix: React.FC<MatrixProps> = ({
  rows,
  cols,
  cell,
  gap = 6,
  text,
  color,
  bg,
  opacity,
  border,
  font = 18,
  radius = 8,
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
      gap,
      width: cols * cell + (cols - 1) * gap,
    }}
  >
    {Array.from({ length: rows * cols }).map((_, i) => {
      const r = Math.floor(i / cols);
      const c = i % cols;
      return (
        <div
          key={i}
          style={{
            width: cell,
            height: cell,
            borderRadius: radius,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: F.mono,
            fontSize: font,
            color: color ? color(r, c) : C.text,
            backgroundColor: bg ? bg(r, c) : "transparent",
            border: `1px solid ${border ? border(r, c) : C.panelEdge}`,
            opacity: opacity ? opacity(r, c) : 1,
            boxSizing: "border-box",
          }}
        >
          {text(r, c)}
        </div>
      );
    })}
  </div>
);

/* ----------------------------------------------------------- determinism --- */

/** Seeded pseudo-random in [0,1). No Math.random: the same frame must render
 *  the same pixels on every machine, or the render is not reproducible. */
export const rnd = (seed: number): number => {
  const x = Math.sin(seed * 12.9898 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** A plausible weight, stable per index. */
export const weight = (i: number): string => (rnd(i) * 2 - 1).toFixed(4);

export const sign = (i: number): string => (rnd(i) > 0.5 ? "+1" : "-1");
