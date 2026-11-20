import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F } from "../theme";
import { rnd } from "./core";

/* The 3D stage.
 *
 * WHY THIS EXISTS: every scene kind in kit/portrait.tsx puts one element on an
 * empty field. That vocabulary cannot express depth, motion through space, or
 * an object that changes because something acted on it — which is why the
 * shorts read as slides with a voiceover. This module is the missing
 * vocabulary: a camera with real perspective, a floor, depth-sorted solids,
 * particles, and spring motion.
 *
 * DETERMINISM: every function here is pure in its arguments. No Math.random,
 * no accumulation, no module state. Frame N always produces the same pixels.
 *
 * SEEKABILITY: springs are analytic — the closed-form step response of a
 * damped oscillator — not integrated frame by frame. An integrated spring
 * would depend on which frames happened to render before it, and Remotion
 * makes no such guarantee. This is the single most important design choice in
 * the file; a stateful spring would render a different video on every run.
 *
 * UNITS: one world unit is roughly one "bar width". Y is up. The camera looks
 * along +Z, so a larger z is further away. There is no 3D engine: everything
 * is projected to 2D and drawn as SVG, which keeps the render deterministic
 * and the code readable.
 */

/* ---------------------------------------------------------------- */
/* vectors                                                           */
/* ---------------------------------------------------------------- */

export type V3 = { x: number; y: number; z: number };

export const v3 = (x: number, y: number, z: number): V3 => ({ x, y, z });

const sub = (a: V3, b: V3): V3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const dot = (a: V3, b: V3): number => a.x * b.x + a.y * b.y + a.z * b.z;
const cross = (a: V3, b: V3): V3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});

const norm = (a: V3): V3 => {
  const l = Math.hypot(a.x, a.y, a.z) || 1;
  return { x: a.x / l, y: a.y / l, z: a.z / l };
};

export const lerpV3 = (a: V3, b: V3, t: number): V3 => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  z: a.z + (b.z - a.z) * t,
});

const UP: V3 = { x: 0, y: 1, z: 0 };

/* ---------------------------------------------------------------- */
/* camera                                                            */
/* ---------------------------------------------------------------- */

export type Camera = { pos: V3; target: V3; fov: number };

/** A camera resolved into a projection basis. Build once per frame, not once
 *  per point: `Bars` projects a few thousand points and rebuilding the basis
 *  each time is the difference between a fast frame and a slow one. */
export type Basis = {
  pos: V3;
  right: V3;
  up: V3;
  fwd: V3;
  f: number;
};

export const basis = (cam: Camera, h: number): Basis => {
  const fwd = norm(sub(cam.target, cam.pos));
  // right = up x forward, so +x is screen-right when the camera faces +z.
  let right = cross(UP, fwd);
  if (Math.hypot(right.x, right.y, right.z) < 1e-6) right = { x: 1, y: 0, z: 0 };
  right = norm(right);
  const up = cross(fwd, right);
  // fov is VERTICAL, as in every camera ever. In a 9:16 frame the horizontal
  // field of view is much narrower than the vertical, which is why portrait
  // compositions must recede rather than spread sideways.
  const f = h / 2 / Math.tan(((cam.fov * Math.PI) / 180) / 2);
  return { pos: cam.pos, right, up, fwd, f };
};

export type Projected = { x: number; y: number; scale: number; depth: number };

export const projectB = (b: Basis, p: V3, w: number, h: number): Projected | null => {
  const rel = sub(p, b.pos);
  const cz = dot(rel, b.fwd);
  if (cz <= 0.05) return null; // behind the camera, or on the lens
  return {
    x: w / 2 + (dot(rel, b.right) * b.f) / cz,
    y: h / 2 - (dot(rel, b.up) * b.f) / cz,
    scale: b.f / cz,
    depth: cz,
  };
};

export const project = (p: V3, cam: Camera, w: number, h: number): Projected | null =>
  projectB(basis(cam, h), p, w, h);

/** Project a direction at infinity — the vanishing point of a set of parallel
 *  lines. This is how the horizon is found without guessing. */
export const projectDir = (
  b: Basis,
  d: V3,
  w: number,
  h: number
): { x: number; y: number } | null => {
  const cz = dot(d, b.fwd);
  if (Math.abs(cz) < 1e-5) return null;
  return {
    x: w / 2 + (dot(d, b.right) / cz) * b.f,
    y: h / 2 - (dot(d, b.up) / cz) * b.f,
  };
};

/** Screen y of the horizon. Correct for any pitch, including one that puts the
 *  horizon off screen. */
export const horizonY = (b: Basis, w: number, h: number): number => {
  const flat = norm({ x: b.fwd.x, y: 0, z: b.fwd.z });
  const p = projectDir(b, flat, w, h);
  return p ? p.y : h / 2;
};

/* ---------------------------------------------------------------- */
/* motion                                                            */
/* ---------------------------------------------------------------- */

export const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);

export const smoothstep = (t: number): number => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

/** Step response of a damped spring, 0 -> 1 with overshoot.
 *
 *  freq is in oscillations per second, damp is the damping ratio (1 is
 *  critical, below 1 overshoots). Closed form, so it is a pure function of
 *  time and can be sampled in any order — see SEEKABILITY at the top. */
export const spring = (t: number, freq = 1.2, damp = 0.55): number => {
  if (t <= 0) return 0;
  const w = freq * Math.PI * 2;
  const wd = w * Math.sqrt(Math.max(1e-4, 1 - damp * damp));
  return (
    1 -
    Math.exp(-damp * w * t) *
      (Math.cos(wd * t) + ((damp * w) / wd) * Math.sin(wd * t))
  );
};

export const springTo = (
  t: number,
  from: number,
  to: number,
  freq?: number,
  damp?: number
): number => from + (to - from) * spring(t, freq, damp);

export type CamKey = { t: number; pos: V3; target: V3; fov?: number };

/** A camera that travels through keyframes. Each segment is smoothstepped, so
 *  the camera is at rest at every key — which reads as deliberate framing
 *  rather than as a constant drift. */
export const camPath = (keys: CamKey[], t: number): Camera => {
  const first = keys[0];
  const last = keys[keys.length - 1];
  if (t <= first.t) return { pos: first.pos, target: first.target, fov: first.fov ?? 40 };
  if (t >= last.t) return { pos: last.pos, target: last.target, fov: last.fov ?? 40 };
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (t <= b.t) {
      const k = smoothstep((t - a.t) / Math.max(1e-6, b.t - a.t));
      return {
        pos: lerpV3(a.pos, b.pos, k),
        target: lerpV3(a.target, b.target, k),
        fov: (a.fov ?? 40) + ((b.fov ?? 40) - (a.fov ?? 40)) * k,
      };
    }
  }
  return { pos: last.pos, target: last.target, fov: last.fov ?? 40 };
};

/* ---------------------------------------------------------------- */
/* the world                                                         */
/* ---------------------------------------------------------------- */

/** Sky, horizon and the glow that sits on it. The horizon is computed from the
 *  camera, so pitching the camera moves the world instead of the backdrop. */
export const Sky: React.FC<{
  b: Basis;
  w: number;
  h: number;
  top?: string;
  mid?: string;
  glow?: string;
  glowStrength?: number;
}> = ({ b, w, h, top = "#05060B", mid = "#0D1120", glow = C.cyan, glowStrength = 0.20 }) => {
  const hy = horizonY(b, w, h);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{ background: `linear-gradient(to bottom, ${top} 0%, ${mid} 62%, ${top} 100%)` }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 78% 26% at 50% ${hy}px, ${glow} 0%, transparent 70%)`,
          opacity: glowStrength,
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 120% 40% at 50% ${hy}px, ${glow} 0%, transparent 65%)`,
          opacity: glowStrength * 0.35,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};

/** The floor plane and its grid. This is the cheapest, strongest depth cue in
 *  the whole module: converging lines tell the eye there is a world here. */
export const Floor: React.FC<{
  b: Basis;
  w: number;
  h: number;
  x0?: number;
  x1?: number;
  z0?: number;
  z1?: number;
  step?: number;
  color?: string;
  opacity?: number;
}> = ({ b, w, h, x0 = -14, x1 = 14, z0 = -2, z1 = 34, step = 1, color = C.cyan, opacity = 0.16 }) => {
  const lines: React.ReactNode[] = [];

  const at = (x: number, z: number) => projectB(b, { x, y: 0, z }, w, h);

  // lines running across (constant z), fading with distance
  for (let z = z0; z <= z1; z += step) {
    const a = at(x0, z);
    const c = at(x1, z);
    if (!a || !c) continue;
    const fade = clamp01(1 - (z - z0) / (z1 - z0));
    lines.push(
      <line
        key={`z${z.toFixed(2)}`}
        x1={a.x}
        y1={a.y}
        x2={c.x}
        y2={c.y}
        stroke={color}
        strokeWidth={1}
        strokeOpacity={opacity * fade * fade}
      />
    );
  }

  // lines running away (constant x)
  for (let x = x0; x <= x1; x += step) {
    const a = at(x, z0);
    const c = at(x, z1);
    if (!a || !c) continue;
    const edge = 1 - Math.min(1, Math.abs(x) / Math.max(1e-6, Math.max(-x0, x1)));
    lines.push(
      <line
        key={`x${x.toFixed(2)}`}
        x1={a.x}
        y1={a.y}
        x2={c.x}
        y2={c.y}
        stroke={color}
        strokeWidth={1}
        strokeOpacity={opacity * (0.25 + 0.75 * edge)}
      />
    );
  }

  return (
    <AbsoluteFill>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {lines}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- */
/* solids                                                            */
/* ---------------------------------------------------------------- */

export type Tone = "warm" | "cool" | "dead";

export type BarSpec = {
  /** ground position */
  x: number;
  z: number;
  /** base elevation. 0 sits on the floor; >0 is a bar lifted out of it. */
  y?: number;
  /** height above the base */
  h: number;
  w: number;
  d: number;
  tone: Tone;
  opacity?: number;
  /** horizontal banding across the front face. Gives a large bar scale and
   *  surface — without it a tall box is a flat gradient and reads as a slab. */
  bands?: number;
  /** override the layer-wide reflection flag */
  reflect?: boolean;
  /** draw only the reflected image, not the bar. For a bar already drawn by
   *  another call that still needs its reflection on the floor. */
  mirrorOnly?: boolean;
};

const fillOf = (tone: Tone, id: string): string =>
  tone === "warm" ? `url(#${id}Warm)` : tone === "dead" ? `url(#${id}Dead)` : `url(#${id}Cool)`;

const topOf = (tone: Tone): string =>
  tone === "warm" ? "#FFE7B0" : tone === "dead" ? "#2B2444" : "#6FC9DC";

const sideOf = (tone: Tone): string =>
  tone === "warm" ? "#8A5A10" : tone === "dead" ? "#191530" : "#0A4E5C";

/** Depth-sorted boxes. Each bar is a real solid — front face, the side that
 *  faces the camera, and a lit top face — so it reads as an object rather than
 *  as a rectangle. Painter's algorithm by distance along the view axis. */
export const Bars: React.FC<{
  b: Basis;
  w: number;
  h: number;
  bars: BarSpec[];
  id?: string;
  reflect?: boolean;
  /** depth-of-field blur in px. Split a field into a near and a far call and
   *  blur only the far one: the painter's algorithm still holds because every
   *  far bar is drawn before every near bar. */
  blur?: number;
}> = ({ b, w, h, bars, id = "w", reflect = false, blur = 0 }) => {
  type Poly = { key: string; pts: string; fill: string; opacity: number };

  const order = bars
    .map((bar, i) => ({
      bar,
      i,
      depth: dot(sub({ x: bar.x, y: (bar.y ?? 0) + bar.h / 2, z: bar.z }, b.pos), b.fwd),
    }))
    .sort((p, q) => q.depth - p.depth);

  const polys: Poly[] = [];
  const P = (x: number, y: number, z: number) => projectB(b, { x, y, z }, w, h);
  const pts = (...p: (Projected | null)[]): string | null =>
    p.every((q) => q !== null) ? p.map((q) => `${(q as Projected).x.toFixed(1)},${(q as Projected).y.toFixed(1)}`).join(" ") : null;

  for (const { bar, i } of order) {
    const y0 = bar.y ?? 0;
    const y1 = y0 + bar.h;
    const xa = bar.x - bar.w / 2;
    const xb = bar.x + bar.w / 2;
    const za = bar.z - bar.d / 2;
    const zb = bar.z + bar.d / 2;
    const op = bar.opacity ?? 1;
    if (op <= 0.002) continue;

    if (bar.mirrorOnly) {
      const r = pts(P(xa, 0, za), P(xb, 0, za), P(xb, -bar.h, za), P(xa, -bar.h, za));
      if (r) polys.push({ key: `r${i}`, pts: r, fill: topOf(bar.tone), opacity: op });
      continue;
    }

    // A face is only visible from the side it faces. Drawing the top when the
    // camera is below it is what makes a box look like a lid floating over a
    // slab — the single most obvious "this is not really 3D" tell.
    const showTop = b.pos.y > y1;
    const showBottom = b.pos.y < y0;

    if ((bar.reflect ?? reflect) && y0 === 0) {
      const r = pts(P(xa, 0, za), P(xb, 0, za), P(xb, -bar.h, za), P(xa, -bar.h, za));
      if (r) polys.push({ key: `r${i}`, pts: r, fill: topOf(bar.tone), opacity: op * 0.12 });
    }

    if (b.pos.x < xa) {
      const s = pts(P(xa, y0, za), P(xa, y0, zb), P(xa, y1, zb), P(xa, y1, za));
      if (s) polys.push({ key: `l${i}`, pts: s, fill: sideOf(bar.tone), opacity: op * 0.9 });
    } else if (b.pos.x > xb) {
      const s = pts(P(xb, y0, za), P(xb, y0, zb), P(xb, y1, zb), P(xb, y1, za));
      if (s) polys.push({ key: `r2${i}`, pts: s, fill: sideOf(bar.tone), opacity: op * 0.9 });
    }

    const front = pts(P(xa, y0, za), P(xb, y0, za), P(xb, y1, za), P(xa, y1, za));
    if (front) polys.push({ key: `f${i}`, pts: front, fill: fillOf(bar.tone, id), opacity: op });

    if (bar.bands && bar.bands > 1) {
      const step = bar.h / bar.bands;
      for (let k = 1; k < bar.bands; k++) {
        const yy = y0 + step * k;
        const s = pts(P(xa, yy, za), P(xb, yy, za), P(xb, yy + step * 0.055, za), P(xa, yy + step * 0.055, za));
        if (s) polys.push({ key: `b${i}_${k}`, pts: s, fill: sideOf(bar.tone), opacity: op * 0.55 });
      }
    }

    if (showTop) {
      const t = pts(P(xa, y1, za), P(xb, y1, za), P(xb, y1, zb), P(xa, y1, zb));
      if (t) polys.push({ key: `t${i}`, pts: t, fill: topOf(bar.tone), opacity: op * 0.88 });
    }
    if (showBottom) {
      const d = pts(P(xa, y0, za), P(xb, y0, za), P(xb, y0, zb), P(xa, y0, zb));
      if (d) polys.push({ key: `d${i}`, pts: d, fill: topOf(bar.tone), opacity: op * 0.5 });
    }
  }

  return (
    <AbsoluteFill>
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={blur > 0 ? { filter: `blur(${blur}px)` } : undefined}
      >
        <defs>
          <linearGradient id={`${id}Cool`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={C.cyan} stopOpacity="0.05" />
            <stop offset="45%" stopColor={C.cyan} stopOpacity="0.40" />
            <stop offset="100%" stopColor="#8FE9F7" stopOpacity="0.82" />
          </linearGradient>
          <linearGradient id={`${id}Warm`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#6B3400" stopOpacity="0.12" />
            <stop offset="30%" stopColor={C.amber} stopOpacity="0.80" />
            <stop offset="78%" stopColor="#FFD978" stopOpacity="1" />
            <stop offset="100%" stopColor="#FFF3D2" stopOpacity="1" />
          </linearGradient>
          <linearGradient id={`${id}Dead`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#1B2138" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#4E6296" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        {polys.map((p) => (
          <polygon key={p.key} points={p.pts} fill={p.fill} opacity={p.opacity} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- */
/* atmosphere                                                        */
/* ---------------------------------------------------------------- */

/** Drifting motes. Deterministic: every value comes from rnd() of the index.
 *  They exist to keep the frame alive between events — a still frame is a bug
 *  in this repo, not a style. */
export const Particles: React.FC<{
  b: Basis;
  w: number;
  h: number;
  count: number;
  t: number;
  seed?: number;
  span?: { x: number; y: number; z: number };
  rise?: number;
  size?: number;
  color?: string;
}> = ({
  b,
  w,
  h,
  count,
  t,
  seed = 1,
  span = { x: 9, y: 5, z: 22 },
  rise = 0.32,
  size = 2.2,
  color = "#BFEFFF",
}) => {
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const rx = rnd(i * 7.13 + seed);
    const ry = rnd(i * 3.71 + seed + 11);
    const rz = rnd(i * 11.37 + seed + 23);
    const sp = 0.45 + rnd(i * 5.91 + seed + 37) * 0.95;
    const phase = rnd(i * 2.17 + seed + 53) * Math.PI * 2;

    const yRaw = ry * span.y + t * rise * sp;
    const y = yRaw % span.y;
    const fadeIn = smoothstep(y / (span.y * 0.18));
    const fadeOut = 1 - smoothstep((y - span.y * 0.72) / (span.y * 0.28));
    const alpha = fadeIn * fadeOut * (0.25 + 0.75 * rnd(i * 13.7 + seed + 71));
    if (alpha <= 0.01) continue;

    const p = projectB(
      b,
      {
        x: (rx - 0.5) * span.x + Math.sin(t * 0.5 * sp + phase) * 0.22,
        y,
        z: (rz - 0.5) * span.z + Math.cos(t * 0.42 * sp + phase) * 0.3,
      },
      w,
      h
    );
    if (!p) continue;
    if (p.x < -40 || p.x > w + 40 || p.y < -40 || p.y > h + 40) continue;

    const r = Math.max(0.6, Math.min(5, size * p.scale * 0.012));
    dots.push(
      <circle
        key={i}
        cx={p.x}
        cy={p.y}
        r={r}
        fill={color}
        opacity={alpha * (0.35 + 0.65 * clamp01(1 - p.depth / 26))}
      />
    );
  }
  return (
    <AbsoluteFill>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {dots}
      </svg>
    </AbsoluteFill>
  );
};

/** A strip lying on the floor — a runway line, a leading line. Fills the
 *  foreground and pulls the eye down the corridor. */
export const Beam: React.FC<{
  b: Basis;
  w: number;
  h: number;
  x: number;
  z0: number;
  z1: number;
  width?: number;
  color: string;
  opacity?: number;
}> = ({ b, w, h, x, z0, z1, width = 0.12, color, opacity = 0.5 }) => {
  const a = projectB(b, { x: x - width / 2, y: 0.001, z: z0 }, w, h);
  const c = projectB(b, { x: x + width / 2, y: 0.001, z: z0 }, w, h);
  const d = projectB(b, { x: x + width / 2, y: 0.001, z: z1 }, w, h);
  const e = projectB(b, { x: x - width / 2, y: 0.001, z: z1 }, w, h);
  if (!a || !c || !d || !e) return null;
  return (
    <AbsoluteFill>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <polygon
          points={`${a.x.toFixed(1)},${a.y.toFixed(1)} ${c.x.toFixed(1)},${c.y.toFixed(1)} ${d.x.toFixed(1)},${d.y.toFixed(1)} ${e.x.toFixed(1)},${e.y.toFixed(1)}`}
          fill={color}
          opacity={opacity}
        />
      </svg>
    </AbsoluteFill>
  );
};

/** A ring lying on the floor — a shockwave, a pulse, the footprint of
 *  something that just left. Sampled as a real 3D circle, so it is an ellipse
 *  in the right perspective rather than a stretched oval. */
export const GroundRing: React.FC<{
  b: Basis;
  w: number;
  h: number;
  cx: number;
  cz: number;
  r: number;
  color: string;
  opacity: number;
  width?: number;
}> = ({ b, w, h, cx, cz, r, color, opacity, width = 2 }) => {
  if (opacity <= 0.002 || r <= 0.001) return null;
  const N = 64;
  // A ring big enough to leave the frame has its near arc behind the camera.
  // Break the polyline there instead of dropping the whole ring — the visible
  // far arc is exactly what reads as a wavefront coming toward you.
  const segs: string[] = [];
  let cur: string[] = [];
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const p = projectB(b, { x: cx + Math.cos(a) * r, y: 0.002, z: cz + Math.sin(a) * r }, w, h);
    if (!p) {
      if (cur.length > 1) segs.push(cur.join(" "));
      cur = [];
      continue;
    }
    cur.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  if (cur.length > 1) segs.push(cur.join(" "));
  if (segs.length === 0) return null;

  return (
    <AbsoluteFill>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {segs.map((pts, i) => (
          <polyline key={i} points={pts} fill="none" stroke={color} strokeWidth={width} opacity={opacity} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/** Text anchored to a point in the world. Size is in world units, so the type
 *  shrinks with distance exactly as the object it labels does.
 *
 *  `plate` is the legibility switch. A label painted straight onto a bright
 *  object is camouflage — amber type on an amber block, white type on a white
 *  gradient. The plate puts a dark field behind the glyphs so the label is a
 *  LAYER rather than a texture, and it drops the glow: a glow reads as bloom
 *  on a dark background and as a smudge on a bright one. */
export const Label3D: React.FC<{
  b: Basis;
  w: number;
  h: number;
  at: V3;
  children: React.ReactNode;
  size?: number;
  color?: string;
  align?: "center" | "left" | "right";
  mono?: boolean;
  weight?: number;
  opacity?: number;
  letterSpacing?: number;
  plate?: boolean;
  plateOpacity?: number;
}> = ({
  b,
  w,
  h,
  at,
  children,
  size = 0.14,
  color = C.text,
  align = "center",
  mono = true,
  weight = 600,
  opacity = 1,
  letterSpacing = 0.06,
  plate = false,
  plateOpacity = 0.72,
}) => {
  const p = projectB(b, at, w, h);
  if (!p || opacity <= 0.002) return null;
  const px = Math.max(7, Math.min(260, size * p.scale));
  const shift = align === "center" ? "-50%" : align === "right" ? "-100%" : "0";
  return (
    <div
      style={{
        position: "absolute",
        left: p.x,
        top: p.y,
        transform: `translate(${shift}, -50%)`,
        fontFamily: mono ? F.mono : F.sans,
        fontSize: px,
        fontWeight: weight,
        letterSpacing: `${letterSpacing}em`,
        color,
        opacity,
        whiteSpace: "nowrap",
        ...(plate
          ? {
              background: `rgba(5,7,11,${plateOpacity})`,
              padding: `${px * 0.16}px ${px * 0.3}px`,
              borderRadius: px * 0.2,
              border: `1px solid ${C.panelEdge}`,
              textShadow: "0 2px 8px rgba(0,0,0,0.7)",
            }
          : { textShadow: `0 0 ${px * 0.6}px ${color}55` }),
      }}
    >
      {children}
    </div>
  );
};

/** A screen-space light source. Screen space on purpose: it is the one element
 *  that should not obey the camera, because it stands in for the lens. */
export const Light: React.FC<{
  x: number;
  y: number;
  r: number;
  color: string;
  opacity?: number;
}> = ({ x, y, r, color, opacity = 0.5 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle ${r}px at ${x}px ${y}px, ${color} 0%, transparent 68%)`,
      opacity,
      mixBlendMode: "screen",
      pointerEvents: "none",
    }}
  />
);

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.72 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 68% 52% at 50% 48%, transparent 42%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

/** Film grain. Breaks up the flat gradients that make a code render look like
 *  a code render, and hides banding after H.264. */
export const Grain: React.FC<{ opacity?: number; seed?: number }> = ({ opacity = 0.055, seed = 7 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity }}>
    <svg width="100%" height="100%">
      <filter id={`grain${seed}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.86" numOctaves={2} seed={seed} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#grain${seed})`} />
    </svg>
  </AbsoluteFill>
);

/** Screen-space bloom for one element. Duplicating a blurred copy of the
 *  brightest object is what separates "rendered" from "photographed". */
export const Bloom: React.FC<{ blur?: number; opacity?: number; children: React.ReactNode }> = ({
  blur = 26,
  opacity = 0.5,
  children,
}) => (
  <AbsoluteFill style={{ filter: `blur(${blur}px)`, opacity, mixBlendMode: "screen", pointerEvents: "none" }}>
    {children}
  </AbsoluteFill>
);
