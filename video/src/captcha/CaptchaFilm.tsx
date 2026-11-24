import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C } from "../../theme";
import { FILM, Ground } from "../../kit/film";
import { buildPlan, timelineFrames } from "../../kit/timeline";
import { SCENES } from "./scenes";
import timings from "./timings.json";

/* "Why are captchas so hard?" — the long-form cut.
 *
 * 1920x1080, narration-driven. Each scene owns its measured wav plus a tail so
 * the cut does not step on the next line. The tail is read by tools/audit.py,
 * which compares the rendered duration to the sum of measured frames + tail. */

const TAIL_FRAMES = 12;

const PLAN = buildPlan(Object.keys(SCENES), timings, TAIL_FRAMES);
export const DURATION = timelineFrames(PLAN);

export const CaptchaFilm: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    <Ground />
    {PLAN.map((p) => (
      <Sequence key={p.id} from={p.from} durationInFrames={p.dur}>
        <Audio src={staticFile(`audio/captcha-film/${p.id}.wav`)} />
        {SCENES[p.id]}
      </Sequence>
    ))}
    <FilmRail />
  </AbsoluteFill>
);

const FilmRail: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, Math.max(1, DURATION - 24)], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return (
    <div style={{ position: "absolute", left: FILM.pad, right: FILM.pad, bottom: 54,
      display: "flex", alignItems: "center", gap: 20 }}>
      <div style={{ fontFamily: "monospace", fontSize: 17, letterSpacing: "0.28em", color: C.faint, whiteSpace: "nowrap" }}>DIGITIZATION</div>
      <div style={{ flex: 1, height: 8, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
        <div style={{ width: `${p * 100}%`, height: 8, borderRadius: 6, backgroundColor: C.amber, opacity: 0.85 }} />
      </div>
      <div style={{ fontFamily: "monospace", fontSize: 17, color: C.amber, width: 62, textAlign: "right" }}>{Math.round(p * 100)}%</div>
    </div>
  );
};
