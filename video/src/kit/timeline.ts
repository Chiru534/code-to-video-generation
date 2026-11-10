import React from "react";

/* One timeline builder for every short. The six shipped episodes each carry a
 * private copy of this function; new work does not get a seventh.
 *
 * The fallback (?? 240) is a silent failure mode that audit.py catches: a scene
 * id missing from timings.json renders at a plausible length with no error. */

export type PlanItem = { id: string; from: number; dur: number };

export type Timings = { scenes: Record<string, { frames: number }> };

export const buildPlan = (
  order: readonly string[],
  timings: Timings,
  tail: number
): PlanItem[] => {
  let cursor = 0;
  return order.map((id) => {
    const measured = timings.scenes[id];
    const dur = (measured?.frames ?? 240) + tail;
    const item: PlanItem = { id, from: cursor, dur };
    cursor += dur;
    return item;
  });
};

export const timelineFrames = (plan: PlanItem[]): number =>
  plan.reduce((n, p) => n + p.dur, 0);
