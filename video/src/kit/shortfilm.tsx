import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { C } from "../theme";
import { Backdrop } from "../chrome";
import { Mark } from "./scene";
import { buildPlan, timelineFrames } from "./timeline";
import type { Timings } from "./timeline";

/* The renderer every weekly short shares.
 *
 * Fourteen shorts each hand-writing their own composition is how this repo
 * grew to six private copies of buildPlan(). The scene content is data —
 * narration.json, timings.json and a scene registry — and this is the one
 * place that turns that data into frames.
 *
 * A short's own directory holds exactly three generated files:
 *   narration.json  the spoken lines
 *   timings.json    the measured lengths of those lines
 *   scenes.tsx      the scene registry: scene id -> a kit component
 * and one thin composition that wires them to this renderer.
 */

/** Total frames for a short, from its measured timings. The composition's
 *  durationInFrames comes from here, so it must be computed the same way the
 *  renderer lays the scenes out — or the file is longer than the timeline. */
export const shortDuration = (
  order: readonly string[],
  timings: Timings,
  tail: number
): number => timelineFrames(buildPlan(order, timings, tail));

export const ShortFilm: React.FC<{
  /** Scene ids in narration order. */
  order: readonly string[];
  timings: Timings;
  /** scene id -> the scene to render. */
  scenes: Record<string, React.ReactNode>;
  /** Audio path relative to public/, e.g. "audio/shorts/training-memory". */
  audioDir: string;
  /** The corner mark. */
  mark?: string;
  /** Frames of silence after each scene. */
  tail?: number;
}> = ({ order, timings, scenes, audioDir, mark, tail = 12 }) => {
  const plan = buildPlan(order, timings, tail);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Backdrop />
      {plan.map((p) => (
        <Sequence key={p.id} from={p.from} durationInFrames={p.dur}>
          <Audio src={staticFile(`${audioDir}/${p.id}.wav`)} />
          {scenes[p.id]}
        </Sequence>
      ))}
      {mark ? <Mark text={mark} /> : null}
    </AbsoluteFill>
  );
};
