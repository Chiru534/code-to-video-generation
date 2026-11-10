import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/* The timing and determinism core. Everything every kit needs, in one place.
 *
 * WHY THIS IS NOT IN src/chrome: render.yml treats video/src/chrome,
 * video/src/theme and video/tools/tts.py as shared, so touching them
 * re-renders EVERY episode in episodes.json. A helper used by one video must
 * not cost seven renders per tweak. Same rule applies here.
 *
 * CONSEQUENCE, ON PURPOSE: a change here resolves to no episode in the plan
 * job (owner() matches srcDir prefixes only), so it never auto-selects its
 * consumers. After editing this file, dispatch the affected composition
 * manually. That is the zero-waste policy, applied literally.
 *
 * The values in this file are the ORIGINAL ones, moved verbatim from
 * src/kit/scene.tsx and src/wifi/film/kit.tsx, which had two identical copies.
 * Motion must not change because the code moved.
 */

export const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
export const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** Eased progress across an absolute frame window. */
export const prog = (frame: number, start: number, dur: number) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...CLAMP, easing: ease });

/** Progress between two FRACTIONS of a scene's measured length.
 *  Scenes are cut to measured narration, so absolute frame numbers drift;
 *  fractions do not. */
export const ph = (frame: number, d: number, a: number, b: number) =>
  interpolate(frame, [a * d, b * d], [0, 1], { ...CLAMP, easing: ease });

/** Progress between two scene fractions, LINEAR in time.
 *  Use this for sweeps, wipes and counters. The eased version is already ~90%
 *  complete at its own midpoint, which makes a staggered wipe finish before the
 *  viewer sees it start — the bug that emptied the LittleBit grid scenes. */
export const lin = (frame: number, d: number, a: number, b: number) =>
  interpolate(frame, [a * d, b * d], [0, 1], CLAMP);

/** Deterministic pseudo-random in [0,1). Never Math.random: the same frame must
 *  produce the same pixels on every render. */
export const wobble = (seed: number, t: number): number => {
  const x = Math.sin(seed * 12.9898 + Math.floor(t) * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** The current frame and the length of the current scene, together.
 *  Scenes are cut to measured narration, so a scene's length is the only
 *  reliable clock: absolute frame numbers drift between renders. */
export const useScene = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return { frame, d: durationInFrames };
};

/** Seeded pseudo-random in [0,1). No Math.random: the same frame must render
 *  the same pixels on every machine, or the render is not reproducible.
 *  The constants are the ORIGINAL ones from src/kit/scene.tsx — a different
 *  formula would change every pixel that uses it. */
export const rnd = (seed: number): number => {
  const x = Math.sin(seed * 12.9898 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
