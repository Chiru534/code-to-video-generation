import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../../theme";
import {
  Bars,
  Bloom,
  FieldLines,
  Floor,
  Grain,
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
} from "../../kit/world";

/* The persistent world for the touchscreen film. Every beat renders the SAME
 * electrode grid from a slightly different camera pose — this is not seven
 * cards with fades, it is one object filmed from seven positions while the
 * finger, the field and the glove change state.
 *
 * The claim: a projected-capacitive screen's electrodes sit behind glass. The
 * finger is insulated from them; it changes an electric field through the
 * glass, and the controller reads the change. Nothing is physically touched.
 */

const COLS = 5;
const ROWS = 5;
const SX = 0.36;
const SZ = 0.62;
const Z0 = 2.4;
const Y_GRID = 0;

const cx = (i: number) => (i - (COLS - 1) / 2) * SX;
const cz = (j: number) => Z0 + j * SZ;

/* One pose per beat. The cut lands on a new camera position, as in a film. */
const CAM: CamKey[] = [
  { t: 0, pos: { x: -0.8, y: 2.2, z: -3.9 }, target: { x: 0, y: 0, z: 3.8 }, fov: 42 },
  { t: 1, pos: { x: -0.5, y: 2.0, z: -3.5 }, target: { x: 0, y: 0, z: 3.8 }, fov: 41 },
  { t: 2, pos: { x: -0.25, y: 1.8, z: -3.1 }, target: { x: 0, y: 0, z: 3.9 }, fov: 40 },
  { t: 3, pos: { x: 0.0, y: 1.6, z: -2.7 }, target: { x: 0, y: 0.1, z: 4.0 }, fov: 39 },
  { t: 4, pos: { x: 0.08, y: 1.5, z: -2.4 }, target: { x: 0, y: 0.1, z: 4.0 }, fov: 38 },
  { t: 5, pos: { x: 0.0, y: 1.6, z: -2.8 }, target: { x: 0, y: 0.1, z: 4.0 }, fov: 39 },
  { t: 6, pos: { x: -0.18, y: 1.9, z: -3.3 }, target: { x: 0, y: 0, z: 3.8 }, fov: 41 },
  { t: 7, pos: { x: -0.25, y: 2.0, z: -3.5 }, target: { x: 0, y: 0, z: 3.8 }, fov: 42 },
];

const STATE = [
  { finger: 0.0, glove: 0, highlight: 0.12 },
  { finger: 0.1, glove: 0, highlight: 0.35 },
  { finger: 0.35, glove: 0, highlight: 0.55 },
  { finger: 1.0, glove: 0, highlight: 1.0 },
  { finger: 1.0, glove: 0, highlight: 1.0 },
  { finger: 0.8, glove: 1.0, highlight: 0.35 },
  { finger: 0.2, glove: 0, highlight: 0.2 },
];

export const ShortTouchScene: React.FC<{
  beat: number;
  kicker: string;
  assertion: string;
  reversal: string;
  note?: string;
}> = ({ beat, kicker, assertion, reversal, note }) => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const t = frame / fps;
  const st = STATE[Math.min(beat, STATE.length - 1)];

  const cam = camPath(CAM, beat + smoothstep(t / 24) * 0.85);
  const b = basis(cam, h);

  /* entrance — the finger arrives over the first second of every beat, then
   * the controller scan carries the motion for the rest of the beat. */
  const enter = spring(t - 0.08, 1.4, 0.75);
  const arrive = smoothstep(t / 1.15);
  const breath = Math.sin(t * 1.3 + beat) * 0.014;
  const finger = clamp01(st.finger * arrive + breath * 0.4);
  const glove = st.glove;
  const fieldOn = finger * (1 - glove) * st.highlight;

  /* the electrode grid. All 25 nodes are always there; the ones near the
   * finger light up as the field changes. The grid never disappears. */
  const bars: BarSpec[] = [];
  const targets: { x: number; y: number; z: number }[] = [];
  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      const x = cx(i);
      const z = cz(j);
      const dist = Math.hypot(x, z - 3.8);
      const near = clamp01(1 - dist / 2.4);
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.2 - dist * 3.1);
      const lit = st.highlight * near * pulse;
      bars.push({
        x,
        z,
        y: Y_GRID,
        h: 0.018,
        w: 0.15,
        d: 0.15,
        tone: lit > 0.35 ? "warm" : "cool",
        opacity: (0.10 + 0.85 * lit) * (1 - glove * 0.7),
      });
      if (near > 0.35) targets.push({ x, y: Y_GRID + 0.02, z });
    }
  }

  /* the glass slab: a real translucent solid above the electrodes */
  bars.push({
    x: 0, z: 3.8, y: 0.20, h: 0.025, w: 1.6, d: 2.7,
    tone: "cool", opacity: 0.10 + 0.06 * st.highlight,
  });

  /* the finger */
  const fingerY = 0.26 + finger * 0.85;
  const fingerOp = clamp01(finger * 1.6) * (1 - glove * 0.8);
  if (fingerOp > 0.01) {
    bars.push({ x: 0, z: 3.8, y: fingerY, h: 0.62, w: 0.34, d: 0.34, tone: "warm", opacity: fingerOp });
    bars.push({ x: 0, z: 3.8, y: fingerY + 0.62, h: 0.12, w: 0.30, d: 0.30, tone: "warm", opacity: fingerOp * 0.8 });
  }

  /* the glove — a cool slab that slides over the finger and kills the field */
  if (glove > 0.01) {
    bars.push({
      x: 0, z: 3.8, y: fingerY + 0.02, h: 0.75, w: 0.48, d: 0.48,
      tone: "dead", opacity: 0.92 * glove,
    });
  }

  const fieldPt = projectB(b, { x: 0, y: fingerY, z: 3.8 }, w, h);
  /* The controller reads the grid row by row. A light travelling down the
   * panel is the real mechanism AND the motion that keeps the frame alive
   * between narration beats — unlike an idle sine wobble. */
  const scanZ = Z0 - 0.7 + ((t * 2.4) % (ROWS * SZ + 1.4));
  const scanPt = projectB(b, { x: 0, y: 0.04, z: scanZ }, w, h);
  const textIn = clamp01((frame - 3) / 16);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: F.sans }}>
      <Sky b={b} w={w} h={h} glow={C.cyan} glowStrength={0.18} />
      <Floor b={b} w={w} h={h} x0={-7} x1={7} z0={-1} z1={22} step={0.55} opacity={0.13} />
      <Light x={w * 0.5} y={h * 0.78} r={720} color={C.cyan} opacity={0.1} />
      <Particles b={b} w={w} h={h} count={120} t={t + beat * 3} seed={13} span={{ x: 6, y: 4, z: 18 }} size={1.0} />

      <Bars b={b} w={w} h={h} bars={bars} id="t" reflect />

      <FieldLines
        b={b} w={w} h={h}
        from={{ x: 0, y: fingerY, z: 3.8 }}
        targets={targets}
        strength={fieldOn}
        color={glove > 0.5 ? C.faint : C.cyan}
        opacity={0.85}
        lift={110}
      />

      {fieldOn > 0.2 ? (
        <Bloom blur={26} opacity={0.28}>
          <Bars b={b} w={w} h={h} id="t" bars={[{
            x: 0, z: 3.8, y: Y_GRID, h: 0.018, w: 0.15, d: 0.15, tone: "warm",
          }]} />
        </Bloom>
      ) : null}

      {fieldPt ? <Light x={fieldPt.x} y={fieldPt.y} r={300} color={C.cyan} opacity={0.13 * fieldOn} /> : null}
      {scanPt ? <Light x={scanPt.x} y={scanPt.y} r={440} color={C.cyan} opacity={0.3} /> : null}
      <Vignette strength={0.75} />
      <Grain opacity={0.05} />

      {/* the headline is a LAYER, on plates, never painted onto the image */}
      <div
        style={{
          position: "absolute", left: 64, right: 64, top: 112,
          textAlign: "center", opacity: textIn,
          transform: `translateY(${(1 - enter) * 22}px)`,
        }}
      >
        <div style={{ color: C.amber, fontSize: 26, letterSpacing: 6, fontWeight: 800, marginBottom: 22 }}>
          {kicker}
        </div>
        <div style={{ display: "inline-block", maxWidth: 860, background: "rgba(5,7,11,0.78)", border: `1px solid ${C.panelEdge}`, borderRadius: 16, padding: "18px 28px" }}>
          <div style={{ color: C.text, fontSize: 58, lineHeight: 1.05, fontWeight: 900, letterSpacing: -1 }}>
            {assertion}
          </div>
          <div style={{ color: C.amber, fontSize: 50, lineHeight: 1.1, fontStyle: "italic", fontWeight: 800, marginTop: 8 }}>
            {reversal}
          </div>
        </div>
      </div>

      {note ? (
        <div
          style={{
            position: "absolute", left: 64, right: 64, bottom: 150,
            textAlign: "center", opacity: textIn,
          }}
        >
          <div style={{ display: "inline-block", background: "rgba(5,7,11,0.78)", border: `1px solid ${C.panelEdge}`, borderRadius: 14, padding: "18px 28px", color: C.dim, fontFamily: F.mono, fontSize: 24, letterSpacing: "0.1em", lineHeight: 1.5 }}>
            {note}
          </div>
        </div>
      ) : null}

      <div style={{ position: "absolute", right: 64, top: 78, fontFamily: F.mono, fontSize: 15, letterSpacing: "0.16em", color: C.faint, opacity: 0.55 * textIn, textAlign: "right" }}>
        ILLUSTRATIVE GEOMETRY
        <br />
        NOT A PHYSICS SIMULATION
      </div>
    </AbsoluteFill>
  );
};
