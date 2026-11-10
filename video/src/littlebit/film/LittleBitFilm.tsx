import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { Ground } from "../../kit/film";
import { SCENES } from "./scenes";
import timings from "./timings.json";

/* "The layer below" - the long-form cut of Samsung's LittleBit.
 *
 * 1920x1080, narration-driven. Each scene owns its measured wav, plus a small
 * tail so the cut does not step on the next line. The tail is read out of this
 * file by tools/audit.py, which compares the rendered duration to the sum of
 * (measured frames + tail) across all scenes.
 *
 * This is the deep version of the 72-second short. The short stands alone and
 * does not reference this film; this film may point back at the short.
 */

const TAIL_FRAMES = 12;

type Plan = { id: string; from: number; dur: number };

const buildPlan = (): Plan[] => {
  let cursor = 0;
  return Object.keys(SCENES).map((id) => {
    const measured = timings.scenes[id as keyof typeof timings.scenes];
    const dur = (measured?.frames ?? 240) + TAIL_FRAMES;
    const item = { id, from: cursor, dur };
    cursor += dur;
    return item;
  });
};

const PLAN = buildPlan();

export const DURATION = PLAN.reduce((n, p) => n + p.dur, 0);

export const LittleBitFilm: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Ground />
      {PLAN.map((p) => (
        <Sequence key={p.id} from={p.from} durationInFrames={p.dur}>
          <Audio src={staticFile(`audio/littlebit-film/${p.id}.wav`)} />
          {SCENES[p.id]}
        </Sequence>
      ))}
      <DepthRail />
    </AbsoluteFill>
  );
};

/* The film's continuous motif, rendered above the scene sequences and driven
 * by the ABSOLUTE frame, so no cut can reset it. It fills as the film gets
 * deeper into sub-one-bit territory: sixteen bits per weight at the start,
 * a tenth of a bit at the end. */
const DepthRail: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, Math.max(1, DURATION - 24)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        right: 120,
        bottom: 54,
        display: "flex",
        alignItems: "center",
        gap: 20,
      }}
    >
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 17,
          letterSpacing: "0.28em",
          color: C.faint,
          whiteSpace: "nowrap",
        }}
      >
        16 BPW
      </div>
      <div
        style={{
          flex: 1,
          height: 8,
          borderRadius: 6,
          backgroundColor: "rgba(255,255,255,0.07)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${p * 100}%`,
            height: 8,
            borderRadius: 6,
            backgroundColor: C.cyan,
            opacity: 0.85,
          }}
        />
      </div>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 17,
          color: C.cyan,
          width: 78,
          textAlign: "right",
        }}
      >
        0.1 BPW
      </div>
    </div>
  );
};
