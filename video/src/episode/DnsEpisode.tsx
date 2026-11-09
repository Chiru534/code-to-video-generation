import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, F } from "../theme";
import { Backdrop, Caption, Kicker, Stage, Watermark } from "../chrome";
import timings from "./timings.json";

const ease = Easing.bezier(0.22, 1, 0.36, 1);

/* ---------------- scenes ---------------- */

const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = ["Finding", "the", "Address"];
  const sub = spring({ frame: frame - 30, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="EPISODE 01 · STEP 1 OF 8" />
      <div style={{ display: "flex", marginTop: 30, gap: 22 }}>
        {words.map((w, i) => {
          const s = spring({
            frame: frame - 6 - i * 5,
            fps,
            config: { damping: 15, stiffness: 120 },
          });
          return (
            <span
              key={w}
              style={{
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 138,
                letterSpacing: "-0.045em",
                lineHeight: 1,
                color: i === 2 ? C.cyan : C.text,
                opacity: Math.max(0, Math.min(1, s)),
                transform: `translateY(${(1 - s) * 40}px)`,
                filter: `blur(${(1 - s) * 5}px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 34,
          fontFamily: F.mono,
          fontSize: 34,
          color: C.dim,
          opacity: sub,
        }}
      >
        example.com <span style={{ color: C.violet }}>→</span> 93.184.216.34
      </div>
    </Stage>
  );
};

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 200 } });
  const b = spring({ frame: frame - 40, fps, config: { damping: 18, stiffness: 110 } });
  const c = spring({ frame: frame - 100, fps, config: { damping: 200 } });
  return (
    <Stage>
      <div
        style={{
          fontFamily: F.sans,
          fontWeight: 800,
          fontSize: 106,
          letterSpacing: "-0.04em",
          color: C.text,
          opacity: a,
          transform: `translateY(${(1 - a) * 26}px)`,
        }}
      >
        11 characters. One key press.
      </div>
      <div
        style={{
          fontFamily: F.sans,
          fontWeight: 800,
          fontSize: 106,
          letterSpacing: "-0.04em",
          color: C.cyan,
          marginTop: 10,
          opacity: Math.max(0, Math.min(1, b)),
          transform: `translateY(${(1 - b) * 34}px)`,
        }}
      >
        200 milliseconds.
      </div>
      <div
        style={{
          fontFamily: F.sans,
          fontSize: 36,
          color: C.dim,
          marginTop: 30,
          opacity: c,
        }}
      >
        That is the entire budget your computer has to make the page appear.
      </div>
    </Stage>
  );
};

const NameVsNumber: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const left = spring({ frame, fps, config: { damping: 200 } });
  const arrow = spring({ frame: frame - 30, fps, config: { damping: 200 } });
  const right = spring({ frame: frame - 55, fps, config: { damping: 18, stiffness: 120 } });
  const cross = Math.max(0, Math.min(1, interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));

  const card = (
    label: string,
    value: string,
    color: string,
    opacity: number,
    offset: number,
  ) => (
    <div
      style={{
        width: 620,
        height: 260,
        borderRadius: 18,
        backgroundColor: C.panel,
        border: `1px solid ${opacity > 0.5 ? color : C.panelEdge}`,
        boxShadow: `0 30px 90px rgba(0,0,0,0.5)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 14,
        opacity,
        transform: `translateY(${offset}px)`,
        position: "relative",
      }}
    >
      <div style={{ fontFamily: F.mono, fontSize: 15, letterSpacing: "0.24em", color: C.faint }}>
        {label}
      </div>
      <div style={{ fontFamily: F.mono, fontSize: 46, color, letterSpacing: "-0.01em" }}>{value}</div>
      {label === "A NAME" ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: cross,
          }}
        >
          <div
            style={{
              width: 660,
              height: 2,
              backgroundColor: C.red,
              transform: `rotate(-14deg) scaleX(${cross})`,
              boxShadow: "0 0 24px rgba(251,113,133,0.6)",
            }}
          />
        </div>
      ) : null}
    </div>
  );

  return (
    <Stage caption="Your computer cannot use a name. It needs a number.">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 46 }}>
        {card("A NAME", "example.com", C.text, left, (1 - left) * 30)}
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 44,
            color: C.violet,
            opacity: arrow,
            transform: `translateX(${(1 - arrow) * -20}px)`,
          }}
        >
          →
        </div>
        {card("AN ADDRESS", "93.184.216.34", C.cyan, Math.max(0, Math.min(1, right)), (1 - right) * 30)}
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: 54,
          fontFamily: F.sans,
          fontSize: 34,
          color: C.dim,
          opacity: cross,
        }}
      >
        Translating one into the other is the first job of those 200 milliseconds.
      </div>
    </Stage>
  );
};

const ResolverScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const you = spring({ frame, fps, config: { damping: 200 } });
  const res = spring({ frame: frame - 30, fps, config: { damping: 200 } });
  const travel = interpolate(frame, [70, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  const node = (title: string, sub: string, opacity: number, color: string) => (
    <div
      style={{
        width: 420,
        height: 190,
        borderRadius: 16,
        backgroundColor: C.panel,
        border: `1px solid ${C.panelEdge}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        opacity,
      }}
    >
      <div style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: "0.12em", color }}>{title}</div>
      <div style={{ fontFamily: F.mono, fontSize: 15, color: C.faint }}>{sub}</div>
    </div>
  );

  return (
    <Stage caption="It asks one machine — a resolver. Usually your ISP runs it.">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 120 }}>
        {node("YOUR COMPUTER", "knows nothing yet", you, C.text)}
        <div style={{ position: "relative", width: 300, height: 80 }}>
          <div style={{ position: "absolute", top: 39, left: 0, right: 0, height: 1, backgroundColor: C.panelEdge }} />
          <div
            style={{
              position: "absolute",
              top: 20,
              left: travel * 250,
              width: 40,
              height: 40,
              borderRadius: 40,
              backgroundColor: C.cyan,
              boxShadow: "0 0 30px rgba(34,211,238,0.9)",
              opacity: travel > 0 ? 1 : 0,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -34,
              left: 40,
              fontFamily: F.mono,
              fontSize: 16,
              color: C.cyan,
              opacity: travel > 0.1 ? 0.9 : 0,
            }}
          >
            who is example.com?
          </div>
        </div>
        {node("DNS RESOLVER", "a phone book that isn't sure", res, C.violet)}
      </div>
    </Stage>
  );
};

const CHAIN = [
  { t: "YOUR COMPUTER", s: "asks" },
  { t: "RESOLVER", s: "doesn't know" },
  { t: "ROOT SERVER", s: "knows who runs .com" },
  { t: ".COM SERVER", s: "knows who runs example.com" },
  { t: "REGISTRAR", s: "actually knows" },
];

const ChainScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = interpolate(frame, [30, 330], [0, CHAIN.length - 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  return (
    <Stage caption="Three questions. Each one is a round trip across the network.">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        {CHAIN.map((n, i) => {
          const s = spring({ frame: frame - i * 10, fps, config: { damping: 200 } });
          const active = progress >= i - 0.05;
          return (
            <div key={n.t} style={{ width: 320, opacity: s }}>
              <div
                style={{
                  height: 170,
                  borderRadius: 16,
                  backgroundColor: C.panel,
                  border: `1px solid ${active ? "rgba(34,211,238,0.6)" : C.panelEdge}`,
                  boxShadow: active ? "0 0 50px rgba(34,211,238,0.16)" : "none",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: 21,
                    letterSpacing: "0.1em",
                    color: active ? C.cyan : C.text,
                    textAlign: "center",
                    padding: "0 14px",
                  }}
                >
                  {n.t}
                </div>
                <div style={{ fontFamily: F.mono, fontSize: 14, color: C.faint, textAlign: "center", padding: "0 14px" }}>
                  {n.s}
                </div>
              </div>
              <div
                style={{
                  marginTop: 14,
                  height: 3,
                  width: "100%",
                  backgroundColor: active ? C.cyan : "#1B1E28",
                  opacity: active ? 0.9 : 1,
                }}
              />
              <div
                style={{
                  marginTop: 14,
                  fontFamily: F.mono,
                  fontSize: 15,
                  letterSpacing: "0.18em",
                  color: progress >= i && progress < i + 1 ? C.violet : C.faint,
                  textAlign: "center",
                }}
              >
                {progress >= i && progress < i + 1 ? "▲ asking" : "round trip"}
              </div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

const AnswerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const parts = ["93", "184", "216", "34"];
  const label = spring({ frame: frame - 90, fps, config: { damping: 200 } });
  const head = spring({ frame, fps, config: { damping: 200 } });

  return (
    <Stage caption="Third question. This time, a real answer.">
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 18,
          letterSpacing: "0.26em",
          color: C.dim,
          textAlign: "center",
          opacity: head,
        }}
      >
        THE ADDRESS
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "baseline",
          gap: 10,
          marginTop: 22,
        }}
      >
        {parts.map((p, i) => {
          const s = spring({ frame: frame - 12 - i * 12, fps, config: { damping: 13, stiffness: 130 } });
          return (
            <React.Fragment key={i}>
              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: 132,
                  color: C.cyan,
                  opacity: Math.max(0, Math.min(1, s)),
                  transform: `translateY(${(1 - s) * 30}px)`,
                  display: "inline-block",
                  textShadow: "0 0 50px rgba(34,211,238,0.35)",
                }}
              >
                {p}
              </span>
              {i < 3 ? (
                <span style={{ fontFamily: F.mono, fontSize: 110, color: C.faint }}>.</span>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: 26,
          fontFamily: F.sans,
          fontSize: 32,
          color: C.dim,
          opacity: label,
        }}
      >
        Four numbers. That is all a computer ever needed.
      </div>
    </Stage>
  );
};

const CacheScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const first = interpolate(frame, [20, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const second = interpolate(frame, [120, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const note = spring({ frame: frame - 100, fps, config: { damping: 200 } });

  const row = (label: string, value: string, w: number, color: string, opacity: number) => (
    <div style={{ display: "flex", alignItems: "center", gap: 26, opacity }}>
      <div style={{ width: 260, fontFamily: F.mono, fontSize: 19, color: C.dim, textAlign: "right" }}>{label}</div>
      <div style={{ width: 900, height: 46, backgroundColor: "#14161F", borderRadius: 8, overflow: "hidden" }}>
        <div
          style={{
            width: `${w * 100}%`,
            height: "100%",
            background: color,
            borderRadius: 8,
          }}
        />
      </div>
      <div style={{ width: 150, fontFamily: F.mono, fontSize: 19, color, textAlign: "left" }}>{value}</div>
    </div>
  );

  return (
    <Stage caption="The answer gets remembered — so the next lookup is instant.">
      <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
        {row("first lookup", "40 ms", first * 0.95, C.amber, 1)}
        {row("second lookup", "0 ms", Math.max(0.012, second * 0.02), C.green, second > 0 ? 1 : 0.25)}
      </div>
      <div
        style={{
          marginTop: 52,
          fontFamily: F.sans,
          fontSize: 34,
          color: C.dim,
          opacity: note,
          textAlign: "center",
        }}
      >
        Your computer keeps it. Your resolver keeps it. Sometimes for hours.
      </div>
    </Stage>
  );
};

const BudgetScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fill = interpolate(frame, [20, 120], [0, 0.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const n = spring({ frame: frame - 110, fps, config: { damping: 200 } });

  return (
    <Stage caption="We are 20% through the budget, and nothing has connected yet.">
      <div style={{ fontFamily: F.mono, fontSize: 17, letterSpacing: "0.24em", color: C.dim }}>
        200 ms BUDGET
      </div>
      <div
        style={{
          marginTop: 18,
          height: 74,
          borderRadius: 10,
          backgroundColor: "#14161F",
          border: `1px solid ${C.panelEdge}`,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${fill * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${C.amber}, ${C.pink})`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${fill * 100}%`,
            width: 2,
            backgroundColor: C.text,
            boxShadow: "0 0 18px rgba(255,255,255,0.8)",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontFamily: F.mono, fontSize: 16, color: C.faint }}>
        <span>0 ms</span>
        <span>100 ms</span>
        <span>200 ms</span>
      </div>
      <div
        style={{
          marginTop: 44,
          fontFamily: F.sans,
          fontSize: 40,
          color: C.text,
          opacity: n,
        }}
      >
        40 ms spent. <span style={{ color: C.cyan }}>3 round trips.</span> Still no connection.
      </div>
    </Stage>
  );
};

const RecapScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const steps = ["Find the address", "Open a connection", "Prove it is safe", "Ask for the page", "Draw it on screen"];
  return (
    <Stage caption="We have only finished the first of five steps.">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {steps.map((s, i) => {
          const a = spring({ frame: frame - i * 14, fps, config: { damping: 200 } });
          const done = i === 0;
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 22, opacity: a }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 44,
                  border: `1px solid ${done ? C.cyan : C.panelEdge}`,
                  backgroundColor: done ? "rgba(34,211,238,0.14)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: F.mono,
                  fontSize: 18,
                  color: done ? C.cyan : C.faint,
                }}
              >
                {done ? "✓" : i + 1}
              </div>
              <div
                style={{
                  fontFamily: F.sans,
                  fontSize: 40,
                  color: done ? C.text : C.faint,
                  letterSpacing: "-0.02em",
                }}
              >
                {s}
              </div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 200 } });
  const b = spring({ frame: frame - 40, fps, config: { damping: 200 } });
  return (
    <Stage>
      <div
        style={{
          fontFamily: F.sans,
          fontWeight: 800,
          fontSize: 96,
          letterSpacing: "-0.04em",
          color: C.text,
          opacity: a,
        }}
      >
        Next: opening the connection.
      </div>
      <div
        style={{
          marginTop: 26,
          fontFamily: F.mono,
          fontSize: 24,
          letterSpacing: "0.2em",
          color: C.dim,
          opacity: b,
        }}
      >
        THREE PACKETS · ONE ROUND TRIP
      </div>
      <div
        style={{
          marginTop: 70,
          height: 2,
          width: 640,
          background: `linear-gradient(90deg, ${C.cyan}, ${C.violet} 60%, transparent)`,
          opacity: b,
        }}
      />
    </Stage>
  );
};

/* ---------------- timeline (driven by measured narration) ---------------- */

const TAIL_FRAMES = 12; // 0.4s of air after each line

const SCENE_NODES: Record<string, React.ReactNode> = {
  s01: <TitleScene />,
  s02: <HookScene />,
  s03: <NameVsNumber />,
  s04: <ResolverScene />,
  s05: <ChainScene />,
  s06: <AnswerScene />,
  s07: <CacheScene />,
  s08: <BudgetScene />,
  s09: <RecapScene />,
  s10: <EndCard />,
};

type Plan = { id: string; from: number; dur: number };

const buildPlan = (): Plan[] => {
  let cursor = 0;
  return Object.keys(SCENE_NODES).map((id) => {
    const measured = timings.scenes[id as keyof typeof timings.scenes];
    const dur = (measured?.frames ?? 240) + TAIL_FRAMES;
    const item = { id, from: cursor, dur };
    cursor += dur;
    return item;
  });
};

const PLAN = buildPlan();

export const DURATION = PLAN.reduce((n, p) => n + p.dur, 0);

export const DnsEpisode: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Backdrop />
      {PLAN.map((p) => (
        <Sequence key={p.id} from={p.from} durationInFrames={p.dur}>
          <Audio src={staticFile(`audio/ep01/${p.id}.wav`)} />
          {SCENE_NODES[p.id]}
        </Sequence>
      ))}
      <Watermark text="EP 01 · FINDING THE ADDRESS" />
    </AbsoluteFill>
  );
};
