import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { FILM, Ground } from "./kit";
import { SCENES } from "./scenes";
import timings from "./timings.json";

/* "Your Wi-Fi isn't slow. It's waiting." - the long-form cut.

   1920x1080, narration-driven. Each scene owns its measured wav, plus a small
   tail so the cut does not step on the next line. The tail is read out of this
   file by tools/audit.py, which compares the rendered duration to the sum of
   (measured frames + tail) across all scenes. */

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

export const WifiFilm: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Ground />
      {PLAN.map((p) => (
        <Sequence key={p.id} from={p.from} durationInFrames={p.dur}>
          <Audio src={staticFile(`audio/wifi-film/${p.id}.wav`)} />
          {SCENES[p.id]}
        </Sequence>
      ))}
      <FilmRail />
    </AbsoluteFill>
  );
};

/* One rail for the whole film. It is rendered above the scene sequences and
   driven by the absolute frame, so it can only ever fill: no cut resets it. */
const FilmRail: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, Math.max(1, DURATION - 24)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: FILM.pad,
        right: FILM.pad,
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
        AIRTIME SPENT
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
            backgroundColor: C.amber,
            opacity: 0.85,
          }}
        />
      </div>
      <div style={{ fontFamily: F.mono, fontSize: 17, color: C.amber, width: 62, textAlign: "right" }}>
        {Math.round(p * 100)}%
      </div>
    </div>
  );
};
