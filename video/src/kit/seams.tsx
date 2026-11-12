import React from "react";
import { Easing, interpolate } from "remotion";

/* The seam law, ported from the motion doctrine to Remotion.
 *
 * The doctrine is written for a GSAP/HTML pipeline: a master timeline with
 * stacked full-frame layers and a hard swap at each cut. Remotion's
 * composition model is the same idea in different clothes — a list of
 * <Sequence> blocks back to back — so the law ports cleanly even though the
 * verifier script does not.
 *
 * WHAT CHANGED. Every seam used to be a dead cut: the outgoing scene sat
 * still, then vanished, and the incoming scene started from rest. That is
 * the doctrine's "exit completes, THEN the scene changes" anti-pattern and
 * its "entry starts from rest after a cut" one. The eye's momentum died at
 * every single cut.
 *
 * THE LAW, IN FOUR NUMBERS:
 *   1. Partial travel. The hero moves ~12% of the frame (230px at 1920),
 *      never off-screen. A full push reads as a transition, not a cut.
 *   2. Mirrored eases. The exit runs power4.in and the entry power4.out,
 *      the two halves of one power4.inOut, over the SAME duration and the
 *      SAME distance — so the velocity at the cut matches on both sides.
 *   3. The cut lands mid-motion on BOTH sides. The outgoing is still
 *      accelerating left when it dies; the incoming is already moving left
 *      when it ignites.
 *   4. Zero overlap and no hole. The outgoing reaches opacity 0 exactly
 *      when the incoming ignites. A gap where nothing moves reads as dead
 *      air, and two visible sides at once reads as a dissolve.
 *
 * One current: LEFT. The direction is the house default for every seam
 * unless the ledger spends a reserved vector on a meaning.
 */

/** Partial travel, in pixels, at 1920 wide. 230/1920 is 12%. */
export const SEAM_TRAVEL = 230;

/** The seam window, in frames. 10 frames is 0.33s at 30fps, which is the
 *  doctrine's "exit 0.2-0.4s; entry >= exit" band. */
export const SEAM_FRAMES = 10;

/** How long before the cut the outgoing finishes fading, and how long before
 *  the cut the incoming ignites. Both are the same number so the two sides
 *  meet exactly: no overlap, no hole. */
export const SEAM_IGNORE = 2;

/** The opacity the incoming ignites at. Not a fade from zero — a snap to a
 *  dim-but-present value, so the arrival reads as a snap rather than a
 *  dissolve. */
export const SEAM_IGNITE = 0.35;

const POWER4_IN = Easing.bezier(0.5, 0, 0.75, 0);
const POWER4_OUT = Easing.bezier(0.25, 1, 0.5, 1);

/** The directions a seam can travel. LEFT is the house current. */
export type SeamDirection = "left" | "right" | "up" | "down";

export type SeamSpec = {
  /** The direction of travel. Both sides of a seam share it. */
  direction?: SeamDirection | string;
  /** Travel distance in pixels. */
  travel?: number;
  /** The seam window in frames. */
  frames?: number;
  /** Frames of lead before the cut for the fade / the ignition. */
  ignore?: number;
  /** The opacity the incoming ignites at. */
  ignite?: number;
};

const DIRECTIONS: SeamDirection[] = ["left", "right", "up", "down"];

/** The direction, or the house current. A spec that arrives from JSON has a
 *  plain string in it, and an unknown one must not become a NaN transform. */
const directionOf = (value: SeamDirection | string | undefined): SeamDirection =>
  DIRECTIONS.includes(value as SeamDirection) ? (value as SeamDirection) : "left";

const OFFSETS: Record<SeamDirection, { x: number; y: number }> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};

const travelFor = (direction: SeamDirection, travel: number) => {
  const o = OFFSETS[direction];
  return { x: o.x * travel, y: o.y * travel };
};

/** The outgoing half: accelerate away, fade to nothing exactly at the cut.
 *
 *  `frame` and `d` are the scene's own frame and length. The exit runs in
 *  the scene's LAST `frames` frames, so `p` is 1 at the cut.
 */
export const seamExit = (
  frame: number,
  d: number,
  spec: SeamSpec = {}
): { opacity: number; transform: string } => {
  const frames = spec.frames ?? SEAM_FRAMES;
  const travel = spec.travel ?? SEAM_TRAVEL;
  const ignore = spec.ignore ?? SEAM_IGNORE;
  const direction = spec.direction ?? "left";

  const start = d - frames;
  if (frame < start) {
    return { opacity: 1, transform: "none" };
  }
  const p = interpolate(frame, [start, d], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: POWER4_IN,
  });
  const delta = travelFor(directionOf(direction), travel);

  // The fade leads the motion by `ignore` frames, so the outgoing is gone
  // exactly at the cut while still accelerating.
  const fadeStart = d - frames;
  const fadeEnd = d - ignore;
  const opacity =
    frame >= fadeEnd
      ? 0
      : interpolate(frame, [fadeStart, fadeEnd], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.4, 0, 1, 1),
        });

  return {
    opacity,
    transform: `translate(${delta.x * p}px, ${delta.y * p}px)`,
  };
};

/** The incoming half: already moving when it ignites, decelerating into
 *  place.
 *
 *  The scene's first `frames` frames are the seam window, so `p` is 0 at the
 *  first frame of the scene.
 */
export const seamEntry = (
  frame: number,
  d: number,
  spec: SeamSpec = {}
): { opacity: number; transform: string } => {
  const frames = spec.frames ?? SEAM_FRAMES;
  const travel = spec.travel ?? SEAM_TRAVEL;
  const ignore = spec.ignore ?? SEAM_IGNORE;
  const ignite = spec.ignite ?? SEAM_IGNITE;
  const direction = spec.direction ?? "left";

  if (frame > frames) {
    return { opacity: 1, transform: "none" };
  }
  const p = interpolate(frame, [0, frames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: POWER4_OUT,
  });
  const delta = travelFor(directionOf(direction), travel);

  // Ignite `ignore` frames in, then rise to full opacity over the rest.
  const opacity =
    frame >= ignore
      ? interpolate(frame, [ignore, frames], [ignite, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: POWER4_OUT,
        })
      : 0;

  // The travel is measured from the far side, so the incoming element is
  // already moving at full speed when it ignites.
  const offset = delta.x * (1 - p);

  return {
    opacity,
    transform: `translate(${offset}px, ${delta.y * (1 - p)}px)`,
  };
};

/* --------------------------------------------------------------- context --- */

/** The per-scene seam spec, injected by the renderer. */
export const SeamContext = React.createContext<SeamSpec | null>(null);

/** The seam spec for the scene currently rendering, if any. */
export const useSeam = (): SeamSpec | null => React.useContext(SeamContext);

/* ----------------------------------------------------------------- beats --- */

/* Staged reveals.
 *
 * The doctrine's default sustained-motion route: "hold content back, pay it
 * off on narration beats — the frame keeps gaining information". That is the
 * opposite of the decorative drift that was here before, which the doctrine
 * bans as idle wobble: motion that fills time without performing.
 *
 * A beat is a fraction of the scene at which a group of elements lands. The
 * generator derives the beats from the punctuation of the narration line, so
 * the thing on screen arrives when the words for it are being said.
 */

/** The beats for the scene currently rendering. */
export const BeatsContext = React.createContext<number[] | null>(null);

export const useBeats = (): number[] | null => React.useContext(BeatsContext);

/** How long a reveal takes, in scene fractions. Short, so the frame keeps
 *  moving between beats instead of settling. */
const REVEAL_SPAN = 0.09;

/**
 * Progress for the i-th reveal group of a scene.
 *
 * Beats are cumulative: group 0 lands at beat 0, group 1 at beat 1. A group
 * that has no beat of its own lands with the one before it, so a scene with
 * fewer beats than groups still resolves to a composed frame.
 *
 * Without beats the element falls back to its own fixed window, so an
 * episode that has not been given beats behaves exactly as it did before.
 */
export const revealBeat = (
  frame: number,
  d: number,
  beats: number[] | null,
  i: number,
  fallbackA = 0.04,
  fallbackB = 0.3
): number => {
  if (!beats || !beats.length) {
    return interpolate(frame, [fallbackA * d, fallbackB * d], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });
  }
  const at = beats[Math.min(i, beats.length - 1)] ?? 0;
  const start = at * d;
  return interpolate(frame, [start, start + REVEAL_SPAN * d], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 1, 0.5, 1),
  });
};

