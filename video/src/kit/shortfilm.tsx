import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../theme";
import { Backdrop } from "../chrome";
import { Mark } from "./scene";
import { buildPlan, timelineFrames } from "./timeline";
import type { Timings } from "./timeline";
import {
  BeatsContext,
  SeamContext,
  seamEntry,
  seamExit,
  type SeamSpec,
} from "./seams";

/* The renderer every weekly short shares.
 *
 * Fourteen shorts each hand-writing their own composition is how this repo
 * grew to six private copies of buildPlan(). The scene content is data —
 * narration.json, timings.json and a scene registry — and this is the one
 * place that turns that data into frames.
 *
 * A short's own directory holds exactly four generated files:
 *   narration.json  the spoken lines
 *   timings.json    the measured lengths of those lines
 *   scenes.tsx      the scene registry: scene id -> a kit component
 *   <Name>.tsx      the thin composition that wires them to the renderer
 */

/** One scene's data: the beats it reveals on, and its seam. */
export type SceneSpec = {
  /** Fractions of the scene at which the reveal groups land. */
  beats?: number[];
  /** The seam that hands off to the next scene. */
  seam?: SeamSpec;
};

export type SceneMap = Record<string, SceneSpec>;

/** Total frames for a short, from its measured timings. The composition's
 *  durationInFrames comes from here, so it must be computed the same way the
 *  renderer lays the scenes out — or the file is longer than the timeline. */
export const shortDuration = (
  order: readonly string[],
  timings: Timings,
  tail: number
): number => timelineFrames(buildPlan(order, timings, tail));

/** The wrapper that carries the seam. */
const SeamFrame: React.FC<{
  spec: SeamSpec | null;
  children: React.ReactNode;
}> = ({ spec, children }) => {
  const frame = useCurrentFrame();
  const durationInFrames = useVideoConfig().durationInFrames;
  // A scene with no seam spec keeps the plain cut. The seam is opt-in, so
  // adding one to one episode never changes the others by accident.
  if (!spec) {
    return <>{children}</>;
  }
  const exit = seamExit(frame, durationInFrames, spec);
  const entry = seamEntry(frame, durationInFrames, spec);
  // The exit and the entry share an axis, so the two translations add.
  const dx =
    (parseFloat(/translate\((-?[\d.]+)px/.exec(exit.transform)?.[1] ?? "0") || 0) +
    (parseFloat(/translate\((-?[\d.]+)px/.exec(entry.transform)?.[1] ?? "0") || 0);
  const dy =
    (parseFloat(/, (-?[\d.]+)px\)/.exec(exit.transform)?.[1] ?? "0") || 0) +
    (parseFloat(/, (-?[\d.]+)px\)/.exec(entry.transform)?.[1] ?? "0") || 0);
  const opacity = Math.min(exit.opacity, entry.opacity);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        transform: `translate(${dx}px, ${dy}px)`,
        willChange: "transform,opacity",
      }}
    >
      {children}
    </div>
  );
};

export const ShortFilm: React.FC<{
  /** Scene ids in narration order. */
  order: readonly string[];
  timings: Timings;
  /** scene id -> the scene to render. */
  scenes: Record<string, React.ReactNode>;
  /** scene id -> beats and seam. */
  specs?: SceneMap;
  /** Audio path relative to public/, e.g. "audio/shorts/training-memory". */
  audioDir: string;
  /** The corner mark. */
  mark?: string;
  /** Frames of silence after each scene. */
  tail?: number;
}> = ({ order, timings, scenes, specs = {}, audioDir, mark, tail = 12 }) => {
  const plan = buildPlan(order, timings, tail);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Backdrop />
      {plan.map((p) => {
        const spec = specs[p.id] ?? {};
        return (
          <Sequence key={p.id} from={p.from} durationInFrames={p.dur}>
            <Audio src={staticFile(`${audioDir}/${p.id}.wav`)} />
            <SeamContext.Provider value={spec.seam ?? null}>
              <BeatsContext.Provider value={spec.beats ?? null}>
                <SeamFrame spec={spec.seam ?? null}>{scenes[p.id]}</SeamFrame>
              </BeatsContext.Provider>
            </SeamContext.Provider>
          </Sequence>
        );
      })}
      {mark ? <Mark text={mark} /> : null}
    </AbsoluteFill>
  );
};
