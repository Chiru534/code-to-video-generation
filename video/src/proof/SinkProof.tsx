import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { rnd } from "../kit/core";
import {
  Bars,
  Beam,
  Bloom,
  Floor,
  Grain,
  GroundRing,
  Label3D,
  Light,
  Particles,
  Sky,
  Vignette,
  basis,
  camPath,
  clamp01,
  projectB,
  smoothstep,
  spring,
  type BarSpec,
  type CamKey,
} from "../kit/world";

/* THE PROOF SHOT.
 *
 * One scene from attention-sink, rebuilt in the new vocabulary. Ten seconds,
 * no narration, no music. The only question it has to answer is whether a
 * stranger would stop scrolling — which is why it is one shot and not a video.
 *
 * The claim: one token absorbs the attention, and removing it does not
 * redistribute that attention to the others. It takes the attention with it.
 *
 * Old version: a pink numeral 0 on an empty field.
 * This version: 336 bars in a corridor, one of them towering, pulled out of
 * the ground, and the field collapsing behind it in a wave.
 *
 * MUTE TEST: turn the sound off (there is none) and the claim still reads.
 */

const COLS = 11;
const ROWS = 20;
const SX = 0.42;
const SZ = 0.80;
const SINK_I = 6;
const SINK_J = 0;
const SINK_H = 3.00;
const SINK_W = 0.70;
const SINK_D = 0.55;
const SINK_BANDS = 30;
const FLOOR_H = 0.055;

/** nearer than this stays sharp; further is defocused. */
const DOF_Z = 9.5;

const cellX = (i: number) => (i - (COLS - 1) / 2) * SX;
const cellZ = (j: number) => j * SZ;
const SINK_X = cellX(SINK_I);
const SINK_Z = cellZ(SINK_J);

/* Beats, in seconds. Nothing here is a frame number: the shot is fixed length
 * today, but keeping the clock in seconds means it survives a change of fps. */
const T_LIFT = 3.00; // the sink detaches from the floor
const T_COLLAPSE = 4.80; // the wave starts at the hole it left
const WAVE = 0.075; // seconds of delay per world unit of distance
const T_TEXT = 6.30; // the closing line

const KEYS: CamKey[] = [
  { t: 0.0, pos: { x: -1.90, y: 2.20, z: -9.5 }, target: { x: 0.55, y: 0.35, z: 6.5 }, fov: 36 },
  { t: 2.8, pos: { x: -1.72, y: 2.12, z: -8.6 }, target: { x: 0.55, y: 0.36, z: 6.8 }, fov: 36 },
  { t: 6.6, pos: { x: -1.55, y: 1.95, z: -7.8 }, target: { x: 0.52, y: 0.40, z: 7.2 }, fov: 35 },
  { t: 8.6, pos: { x: -1.10, y: 1.55, z: -6.0 }, target: { x: 0.46, y: 0.30, z: 8.2 }, fov: 34 },
  { t: 10.0, pos: { x: -0.88, y: 1.38, z: -5.2 }, target: { x: 0.42, y: 0.26, z: 8.6 }, fov: 34 },
];

/** The attention field, split at the depth-of-field boundary. The sink is
 *  generated here too, so it depth-sorts with the bars around it instead of
 *  floating on a separate layer. Every value is a pure function of (i, j, t). */
const build = (t: number, lift: number): { near: BarSpec[]; far: BarSpec[] } => {
  const near: BarSpec[] = [];
  const far: BarSpec[] = [];
  const put = (s: BarSpec) => (s.z >= DOF_Z ? far : near).push(s);

  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      if (i === SINK_I && j === SINK_J) continue;

      const x = cellX(i);
      const z = cellZ(j);
      const seed = i * 97 + j * 13 + 5;

      // A heavy tail: most tokens hold almost nothing, a few hold a lot. The
      // hierarchy has to be extreme, or the field reads as a city and the
      // dominant token stops being the subject.
      const base = 0.05 + 0.95 * Math.pow(rnd(seed), 9);

      const dist = Math.hypot(x - SINK_X, z - SINK_Z);
      const k = spring(t - (T_COLLAPSE + dist * WAVE), 0.9, 0.45);

      // Breathing before the collapse, then a shudder as the support goes.
      const tremor = clamp01((t - (T_LIFT + 0.55)) / 0.9) * (1 - clamp01(k));
      const alive = 1 - clamp01(k);
      const breathe = 0.014 * Math.sin(t * 1.6 + i * 0.8 + j * 1.4) * alive;
      const shake = 0.022 * tremor * Math.sin(t * 34 + i * 1.9 + j * 0.7);

      const h = Math.max(
        0.008,
        base + (FLOOR_H - base) * k + breathe + shake + 0.011 * Math.sin(t * 1.1 + i * 0.6 + j * 0.8) * clamp01(k)
      );
      const dim = 0.22 + 0.55 * clamp01(1 - z / 20);
      // A flatline, not an absence: after the collapse the field is still
      // there, just uniformly dead. That reads as a texture rather than as
      // an empty frame, which is the whole point of the beat.
      const opacity = dim * (1 - 0.28 * clamp01(k));

      put({ x, z, h, w: 0.24, d: 0.24, tone: k > 0.55 ? "dead" : "cool", opacity });
    }
  }

  put({
    x: SINK_X - lift * 0.45,
    y: lift * 4.2,
    z: SINK_Z - lift * 0.18,
    h: SINK_H,
    w: SINK_W,
    d: SINK_D,
    tone: "warm",
    bands: SINK_BANDS,
    reflect: false,
  });

  return { near, far };
};

export const SinkProof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const t = frame / fps;

  const cam = camPath(KEYS, t);
  const b = basis(cam, h);

  /* --- the sink ------------------------------------------------- */
  const lift = spring(t - T_LIFT, 1.1, 0.85);
  const sinkX = SINK_X - lift * 0.45;
  const sinkY = lift * 4.2;
  const sinkZ = SINK_Z - lift * 0.18;
  const sinkGone = lift >= 0.999;

  const { near, far } = build(t, lift);

  const basePt = projectB(b, { x: SINK_X, y: 0, z: SINK_Z }, w, h);
  const sinkTop = projectB(b, { x: sinkX, y: sinkY + SINK_H, z: sinkZ }, w, h);

  /* a light travelling down the corridor while the field is intact */
  const scanPt = projectB(b, { x: 0.8, y: 0, z: t * 5.2 - 1.5 }, w, h);
  const scanOp = 0.20 * (1 - smoothstep((t - 3.4) / 0.5));

  /* --- the readout ---------------------------------------------- */
  const readIn = smoothstep((t - 0.55) / 0.6);
  const readOut = 1 - smoothstep((t - 3.05) / 0.45);
  const readOpacity = readIn * readOut;

  /* --- the wave ring -------------------------------------------- */
  const ringR = spring(t - T_LIFT, 0.55, 0.9) * 1.9;
  const ringOp = (1 - clamp01(ringR / 1.9)) * 0.55 * (t > T_LIFT ? 1 : 0);

  /* the collapse as a shockwave travelling out across the field */
  const waveT = clamp01((t - T_COLLAPSE) / 1.35);
  const waveR = waveT * 20;
  const waveOp = 0.9 * (1 - waveT) * (t > T_COLLAPSE ? 1 : 0);
  const waveOp2 = 0.5 * (1 - clamp01((t - T_COLLAPSE - 0.16) / 1.35)) * (t > T_COLLAPSE + 0.16 ? 1 : 0);

  /* the impact flash, gone in a fifth of a second */
  const flash = t > T_COLLAPSE ? Math.exp(-(t - T_COLLAPSE) * 7) : 0;

  const textIn = smoothstep((t - T_TEXT) / 0.9);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Sky b={b} w={w} h={h} glow={C.cyan} glowStrength={0.24} />
      <Floor b={b} w={w} h={h} x0={-9} x1={9} z0={-1.5} z1={30} step={0.62} opacity={0.20} />
      <Beam b={b} w={w} h={h} x={0.84} z0={-2.5} z1={24} width={0.10} color={C.cyan} opacity={0.16} />
      <Beam b={b} w={w} h={h} x={0.84} z0={-2.5} z1={24} width={0.03} color={C.cyan} opacity={0.30} />
      <Light x={w * 0.5} y={h * 0.80} r={680} color={C.cyan} opacity={0.10} />
      <Light x={w * 0.5} y={h * 0.88} r={900} color={C.violet} opacity={0.09} />

      <Particles b={b} w={w} h={h} count={170} t={t} seed={4} span={{ x: 7, y: 4.4, z: 20 }} size={1.0} />

      {/* far bars, defocused, behind everything */}
      <Bars b={b} w={w} h={h} bars={far} id="f" blur={2.2} />
      <Bars b={b} w={w} h={h} bars={near} id="f" reflect />

      {/* the sink's reflection, fading as it lifts off the floor */}
      {lift < 0.98 ? (
        <Bars
          b={b}
          w={w}
          h={h}
          id="f"
          bars={[
            {
              x: SINK_X - lift * 0.45,
              z: SINK_Z - lift * 0.18,
              y: 0,
              h: SINK_H,
              w: SINK_W,
              d: SINK_D,
              tone: "warm",
              opacity: 0.11 * (1 - clamp01(lift)),
              mirrorOnly: true,
            },
          ]}
        />
      ) : null}

      {/* the trail so the exit reads as speed */}
      {!sinkGone
        ? [0.22, 0.14, 0.07].map((op, k) => {
            const back = t - (3 - k) * 0.055;
            const l2 = spring(back - T_LIFT, 1.1, 0.85);
            return (
              <Bars
                key={k}
                b={b}
                w={w}
                h={h}
                id="f"
                bars={[
                  {
                    x: SINK_X - l2 * 0.45,
                    y: l2 * 4.2,
                    z: SINK_Z - l2 * 0.18,
                    h: SINK_H,
                    w: SINK_W,
                    d: SINK_D,
                    tone: "warm",
                    opacity: op * (1 - clamp01(lift)),
                  },
                ]}
              />
            );
          })
        : null}

      {!sinkGone ? (
        <Bloom blur={30} opacity={0.32}>
          <Bars
            b={b}
            w={w}
            h={h}
            id="f"
            bars={[{ x: sinkX, y: sinkY, z: sinkZ, h: SINK_H, w: SINK_W, d: SINK_D, tone: "warm" }]}
          />
        </Bloom>
      ) : null}

      {/* the hole, and the wave leaving it */}
      {basePt ? (
        <Light x={basePt.x} y={basePt.y} r={320} color={C.amber} opacity={0.10 + 0.28 * clamp01(lift)} />
      ) : null}
      <GroundRing b={b} w={w} h={h} cx={SINK_X} cz={SINK_Z} r={ringR} color={C.amber} opacity={ringOp} width={2.5} />
      {t > T_LIFT ? (
        <GroundRing b={b} w={w} h={h} cx={SINK_X} cz={SINK_Z} r={SINK_W * 0.95} color={C.amber} opacity={0.5} width={2} />
      ) : null}
      {t > T_COLLAPSE ? (
        <GroundRing b={b} w={w} h={h} cx={SINK_X} cz={SINK_Z} r={SINK_W * 0.95} color={C.amber} opacity={0.18} width={2} />
      ) : null}
      <GroundRing b={b} w={w} h={h} cx={SINK_X} cz={SINK_Z} r={waveR} color={C.amber} opacity={waveOp} width={6} />
      <GroundRing b={b} w={w} h={h} cx={SINK_X} cz={SINK_Z} r={waveR * 0.86} color={C.amber} opacity={waveOp2} width={3} />
      {flash > 0.004 && basePt ? (
        <Light x={basePt.x} y={basePt.y - 120} r={900} color={C.amber} opacity={flash * 0.55} />
      ) : null}
      {/* aftermath: a slow sweep so the flattened field is never a still frame */}
      {t > T_COLLAPSE + 1.2 ? (
        <Light
          x={w * (0.18 + 0.64 * smoothstep((t - T_COLLAPSE - 1.2) / 3.2))}
          y={h * 0.74}
          r={520}
          color={C.cyan}
          opacity={0.15}
        />
      ) : null}
      {scanPt ? <Light x={scanPt.x} y={scanPt.y} r={260} color={C.cyan} opacity={scanOp} /> : null}

      {/* the number, attached to the object it describes */}
      {sinkTop && readOpacity > 0.01 ? (
        <Label3D
          b={b}
          w={w}
          h={h}
          at={{ x: sinkX - 0.85, y: sinkY + SINK_H * 0.78, z: sinkZ }}
          size={0.20}
          color={C.amber}
          opacity={readOpacity}
          letterSpacing={0.02}
          align="right"
        >
          41.2%
        </Label3D>
      ) : null}

      <Light x={w * 0.72} y={h * 0.30} r={620} color={C.violet} opacity={0.12} />
      <Vignette strength={0.78} />
      <Grain opacity={0.05} />

      {/* --- screen furniture -------------------------------------- */}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 78,
          fontFamily: F.mono,
          fontSize: 21,
          letterSpacing: "0.22em",
          color: C.dim,
          opacity: 0.9,
        }}
      >
        ATTENTION · ONE HEAD, ONE LAYER
      </div>
      <div
        style={{
          position: "absolute",
          right: 64,
          top: 78,
          fontFamily: F.mono,
          fontSize: 15,
          letterSpacing: "0.16em",
          color: C.faint,
          opacity: 0.55,
        }}
      >
        SYNTHETIC DISTRIBUTION · LOOKDEV
      </div>

      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          bottom: 150,
          opacity: textIn,
          transform: `translateY(${(1 - textIn) * 22}px)`,
        }}
      >
        <div style={{ height: 1, background: C.panelEdge, marginBottom: 30 }} />
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 27,
            lineHeight: 1.5,
            letterSpacing: "0.13em",
            color: C.text,
          }}
        >
          REMOVE THE SINK
          <br />
          <span style={{ color: C.dim }}>AND THE ATTENTION GOES WITH IT.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
