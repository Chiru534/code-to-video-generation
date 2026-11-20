import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import {
  Bars,
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

/* THE SECOND PROOF SHOT — the answer to "these are slides with a voiceover".
 *
 * WHY THIS EXISTS: SinkProof proved the 3D vocabulary could carry a technical
 * claim, and then every short was built on portrait.tsx anyway. portrait.tsx
 * animates by pushing a static composition ~4.5% larger for its whole length.
 * The difference between that and animation is CAUSALITY: something enters,
 * acts, and the world reacts to it. A zoom is not a reaction, and no amount of
 * easing makes it one.
 *
 * THE CLAIM: a tokenizer destroys place value before the model ever sees the
 * digits. "1234" does not arrive as four positioned digits. It arrives as two
 * opaque chunks, and the position that made it one thousand two hundred and
 * thirty-four is gone.
 *
 * THE SHOT, in five beats:
 *   1. four pillars stand in a staircase — the staircase IS the number
 *   2. a blade drops between the second and third
 *   3. the place-value rail on the floor snaps and the pairs slide apart
 *   4. each pair collapses into one block of arbitrary height, wearing an id
 *   5. the two blocks stand there, unrelated to each other
 *
 * MUTE TEST: with the sound off, an ordered staircase becomes two arbitrary
 * slabs. You do not need the narration to read the claim.
 */

const Z = 5.0;
const BASE_X = [-0.9, -0.3, 0.3, 0.9];
const BASE_H = [2.6, 2.0, 1.4, 0.8];
const DIGITS = ["1", "2", "3", "4"];
const PLACE = ["x1000", "x100", "x10", "x1"];
const PW = 0.4;
const PD = 0.4;

/* Beats in SECONDS, not frames: the shot is a fixed length today, but keeping
 * the clock in seconds means it survives a change of fps. */
const T_CUT = 2.0;
const T_SPLIT = 2.5;
const T_MERGE = 4.5;
const T_TEXT = 6.3;

const SPLIT = 0.3;
const RAIL_HALF = 1.35;

/* After the merge the heights are deliberately arbitrary: a token id carries
 * no value, so the block that replaces the digits cannot encode one. */
const MERGED_X = [-0.9, 0.9];
const MERGED_H = [1.3, 2.15];
const MERGED_W = 0.72;
const TOKEN_ID = ["#2468", "#9753"];

const KEYS: CamKey[] = [
  { t: 0.0, pos: { x: -0.5, y: 1.95, z: -5.2 }, target: { x: 0, y: 0.95, z: Z }, fov: 40 },
  { t: 2.4, pos: { x: -0.32, y: 1.78, z: -4.4 }, target: { x: 0, y: 0.92, z: Z }, fov: 39 },
  { t: 4.8, pos: { x: 0.0, y: 1.55, z: -3.4 }, target: { x: 0, y: 0.85, z: Z }, fov: 38 },
  { t: 8.0, pos: { x: 0.08, y: 1.42, z: -2.6 }, target: { x: 0, y: 0.8, z: Z }, fov: 37 },
];

export const NUMBER_PROOF_FRAMES = 240;

export const NumberProof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const t = frame / fps;

  const cam = camPath(KEYS, t);
  const b = basis(cam, h);

  /* --- the blade ------------------------------------------------- */
  /* ANTICIPATION: the blade does not fade in at the seam, it falls into it.
   * A drop that starts above the frame and lands reads as a blow; a fade reads
   * as a graphic appearing. Same geometry, different causality. */
  const bladeIn = clamp01((t - (T_CUT - 0.45)) / 0.3);
  const bladeOut = 1 - clamp01((t - T_CUT - 0.18) / 0.35);
  const bladeOp = 0.9 * bladeIn * bladeOut;
  const bladeY = 2.4 * (1 - bladeIn);

  /* --- the impact ------------------------------------------------ */
  const hit = t > T_CUT ? Math.exp(-(t - T_CUT) * 6.5) : 0;
  const ringR = spring(t - T_CUT, 0.6, 0.9) * 2.2;
  const ringOp = 0.55 * (1 - clamp01(ringR / 2.2)) * (t > T_CUT ? 1 : 0);

  /* --- the two structural moves ---------------------------------- */
  const split = spring(t - T_SPLIT, 0.85, 0.7);
  const merge = spring(t - T_MERGE, 0.8, 0.8);

  /* FOLLOW-THROUGH. A snap that stops dead reads as a cut rather than as a
   * force: the rail keeps ringing after the blade lands, and the blocks keep
   * settling after the merge. Both are decaying sines — one term each — and
   * they are the cheapest thing in the shot that makes it read as physical. */
  const ring = t > T_CUT ? Math.exp(-(t - T_CUT) * 3.1) * Math.sin((t - T_CUT) * 26) : 0;
  const settle = t > T_MERGE ? Math.exp(-(t - T_MERGE) * 2.4) * Math.sin((t - T_MERGE) * 22) : 0;

  /* --- geometry -------------------------------------------------- */
  const bars: BarSpec[] = [];

  /* the place-value rail. This is the thing that says "one number, in order".
   * It is the first casualty and it never comes back. */
  const gap = SPLIT * 1.6 * split;
  const railW = RAIL_HALF - gap;
  if (railW > 0.02) {
    for (const s of [-1, 1]) {
      bars.push({
        x: s * (RAIL_HALF + gap) / 2,
        z: Z,
        y: 0.006 + ring * 0.022,
        h: 0.014,
        w: railW,
        d: 0.055,
        tone: "warm",
        opacity: (0.6 + ring * 0.25) * (1 - merge),
      });
    }
  }

  /* the four digits */
  for (let i = 0; i < 4; i++) {
    const pair = i < 2 ? 0 : 1;
    const dir = pair === 0 ? -1 : 1;
    const breathe = 0.03 * Math.sin(t * 1.5 + i * 1.7);
    const shudder = 0.014 * hit * Math.sin(t * 40 + i);

    const xSplit = BASE_X[i] + dir * SPLIT * split;
    const x = xSplit + (MERGED_X[pair] - xSplit) * merge + shudder + settle * 0.02;
    const hgt = Math.max(
      0.02,
      BASE_H[i] + breathe + (MERGED_H[pair] - BASE_H[i]) * merge + settle * 0.05
    );
    const wid = PW + (MERGED_W / 2 - PW) * merge;

    const spec = {
      x,
      z: Z,
      y: 0,
      h: hgt,
      w: wid,
      d: PD,
    };

    /* Crossfade the tone instead of switching it: a hard tone change on a
     * spring is a visible pop, and a pop reads as a cut, not as a change. */
    bars.push({ ...spec, tone: "cool", opacity: 0.95 * (1 - merge) });
    if (merge > 0.001) {
      bars.push({ ...spec, tone: "warm", bands: 14, opacity: 0.95 * merge });
    }
  }

  /* the blade */
  if (bladeOp > 0.01) {
    bars.push({ x: 0, z: Z, y: bladeY, h: 3.6, w: 0.03, d: 1.4, tone: "warm", opacity: bladeOp });
  }

  /* --- screen-space pieces --------------------------------------- */
  const seamPt = projectB(b, { x: 0, y: 0, z: Z }, w, h);
  const textIn = smoothstep((t - T_TEXT) / 0.9);
  const textIn2 = smoothstep((t - T_TEXT - 0.24) / 0.8);
  const kickerIn = smoothstep((t - 0.3) / 0.6);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Sky b={b} w={w} h={h} glow={C.cyan} glowStrength={0.22} />
      <Floor b={b} w={w} h={h} x0={-8} x1={8} z0={-1.5} z1={28} step={0.6} opacity={0.18} />
      <Light x={w * 0.5} y={h * 0.82} r={700} color={C.cyan} opacity={0.1} />
      <Light x={w * 0.5} y={h * 0.9} r={900} color={C.violet} opacity={0.08} />

      <Particles b={b} w={w} h={h} count={150} t={t} seed={9} span={{ x: 7, y: 4.4, z: 20 }} size={1.0} />

      <Bars b={b} w={w} h={h} bars={bars} id="n" reflect />

      {/* the blade's own bloom, so the cut is the brightest thing on screen */}
      {bladeOp > 0.01 ? (
        <Bloom blur={30} opacity={0.45}>
          <Bars b={b} w={w} h={h} id="n" bars={[{ x: 0, z: Z, y: bladeY, h: 3.6, w: 0.03, d: 1.4, tone: "warm" }]} />
        </Bloom>
      ) : null}

      {/* the seam, before and after the cut */}
      <GroundRing b={b} w={w} h={h} cx={0} cz={Z} r={ringR} color={C.amber} opacity={ringOp} width={6} />
      {seamPt ? <Light x={seamPt.x} y={seamPt.y} r={360} color={C.amber} opacity={0.1 + 0.35 * hit} /> : null}
      {hit > 0.004 && seamPt ? (
        <Light x={seamPt.x} y={seamPt.y - 160} r={900} color={C.amber} opacity={hit * 0.5} />
      ) : null}

      {/* the digits, ON the pillars, and the place value under each.
          STAGGER: each digit leaves a beat after the one before it, so the
          dissolution reads as a sequence rather than as one fade. */}
      {DIGITS.map((d, i) => {
        const pair = i < 2 ? 0 : 1;
        const dir = pair === 0 ? -1 : 1;
        const xSplit = BASE_X[i] + dir * SPLIT * split;
        const x = xSplit + (MERGED_X[pair] - xSplit) * merge + settle * 0.02;
        const hgt = BASE_H[i] + (MERGED_H[pair] - BASE_H[i]) * merge + settle * 0.05;
        const face = Z - PD / 2;
        const gone = 1 - clamp01((t - (T_MERGE - 0.15) - i * 0.1) / 0.5);
        return (
          <React.Fragment key={d}>
            <Label3D
              b={b}
              w={w}
              h={h}
              at={{ x, y: hgt * 0.52, z: face }}
              size={0.3}
              color={C.text}
              opacity={gone}
              weight={800}
              plate
            >
              {d}
            </Label3D>
            <Label3D
              b={b}
              w={w}
              h={h}
              at={{ x, y: 0.2, z: face }}
              size={0.085}
              color={C.dim}
              opacity={gone * 0.95}
              weight={600}
              plate
            >
              {PLACE[i]}
            </Label3D>
          </React.Fragment>
        );
      })}

      {/* the opaque ids that replace them — staggered the other way, so the
          second block gets its id after the first. */}
      {MERGED_X.map((x, pair) => {
        const inK = clamp01((t - (T_MERGE + 0.1) - pair * 0.16) / 0.5);
        return (
          <Label3D
            key={TOKEN_ID[pair]}
            b={b}
            w={w}
            h={h}
            at={{ x, y: MERGED_H[pair] * 0.52, z: Z - PD / 2 }}
            size={0.19}
            color={C.amber}
            opacity={inK}
            weight={800}
            letterSpacing={0.02}
            plate
          >
            {TOKEN_ID[pair]}
          </Label3D>
        );
      })}

      <Light x={w * 0.7} y={h * 0.28} r={620} color={C.violet} opacity={0.11} />
      <Vignette strength={0.78} />
      <Grain opacity={0.05} />

      {/* --- screen furniture ------------------------------------- */}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 78,
          fontFamily: F.mono,
          fontSize: 21,
          letterSpacing: "0.22em",
          color: C.dim,
          opacity: 0.9 * kickerIn,
        }}
      >
        TOKENIZER · ONE NUMBER
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
          opacity: 0.55 * kickerIn,
          textAlign: "right",
        }}
      >
        ILLUSTRATIVE IDS
        <br />
        NOT A REAL TOKENIZER
      </div>

      {/* KINETIC TYPE: the second line lands after the first, so the caption is
          read in order instead of as one block. A plate keeps it legible over
          the reflections, which are bright enough to eat unbacked type. */}
      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          bottom: 150,
          opacity: textIn,
        }}
      >
        <div style={{ height: 1, background: C.panelEdge, marginBottom: 30 }} />
        <div
          style={{
            display: "inline-block",
            background: "rgba(5,7,11,0.72)",
            border: `1px solid ${C.panelEdge}`,
            borderRadius: 14,
            padding: "22px 30px",
            fontFamily: F.mono,
            fontSize: 27,
            lineHeight: 1.55,
            letterSpacing: "0.13em",
            color: C.text,
          }}
        >
          <div style={{ opacity: textIn, transform: `translateY(${(1 - textIn) * 18}px)` }}>
            A TOKENIZER DOES NOT SEE DIGITS.
          </div>
          <div
            style={{
              color: C.dim,
              opacity: textIn2,
              transform: `translateY(${(1 - textIn2) * 18}px)`,
            }}
          >
            IT SEES TWO OPAQUE CHUNKS.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
