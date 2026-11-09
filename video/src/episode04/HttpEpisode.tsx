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
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/* ---------------- scenes ---------------- */

const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = ["Asking", "for", "the", "Page"];
  return (
    <Stage>
      <Kicker text="EPISODE 04 · STEP 4 OF 25" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        {words.map((w, i) => {
          const s = spring({ frame: frame - 6 - i * 5, fps, config: { damping: 15, stiffness: 120 } });
          return (
            <span
              key={w}
              style={{
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 64,
                letterSpacing: "-0.045em",
                lineHeight: 1,
                color: i === 3 ? C.cyan : C.text,
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
      <Caption text="You opened a connection. You proved it is safe. Now what? You ask for the page." />
    </Stage>
  );
};

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 200 } });
  const b = spring({ frame: frame - 40, fps, config: { damping: 18, stiffness: 110 } });
  return (
    <Stage>
      <div
        style={{
          fontFamily: F.sans,
          fontWeight: 800,
          fontSize: 64,
          letterSpacing: "-0.04em",
          color: C.text,
          opacity: a,
          transform: `translateY(${(1 - a) * 26}px)`,
          textAlign: "center",
        }}
      >
        Your browser writes a letter.
      </div>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 42,
          color: C.cyan,
          marginTop: 14,
          opacity: Math.max(0, Math.min(1, b)),
          transform: `translateY(${(1 - b) * 34}px)`,
          textAlign: "center",
        }}
      >
        GET / HTTP/1.1
      </div>
      <div
        style={{
          fontFamily: F.sans,
          fontSize: 30,
          color: C.dim,
          marginTop: 30,
          opacity: spring({ frame: frame - 90, fps, config: { damping: 200 } }),
          textAlign: "center",
        }}
      >
        Host: example.com · Accept: text/html · User-Agent: browser
      </div>
    </Stage>
  );
};

const RequestScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="THE REQUEST" />
      <div style={{ width: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: c }}>
        <div
          style={{
            width: 900,
            padding: "30px 40px",
            borderRadius: 18,
            backgroundColor: C.panel,
            border: `1px solid ${C.panelEdge}`,
          }}
        >
          <div style={{ fontFamily: F.mono, fontSize: 16, letterSpacing: "0.2em", color: C.faint, marginBottom: 10 }}>
            CLIENT → SERVER
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 20, color: C.text, lineHeight: 1.6 }}>
            GET / HTTP/1.1\r\n
            Host: example.com\r\n
            Accept: text/html\r\n
            User-Agent: Mozilla/5.0\r\n
            \r\n
          </div>
        </div>
        <div
          style={{
            position: "relative",
            width: 900,
            height: 56,
            opacity: c,
          }}
        >
          <div style={{ position: "absolute", top: 27, left: 0, right: 0, height: 1, backgroundColor: C.panelEdge }} />
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 40,
              width: 40,
              height: 40,
              borderRadius: 40,
              backgroundColor: C.cyan,
              boxShadow: "0 0 30px rgba(34,211,238,0.9)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -36,
              left: 40,
              fontFamily: F.mono,
              fontSize: 14,
              color: C.cyan,
            }}
          >
            one packet at a time
          </div>
        </div>
      </div>
      <Caption text="A plain-text letter to the server, sent over your encrypted tunnel." />
    </Stage>
  );
};

const TunnelScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="THE TUNNEL" />
      <div style={{ width: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, opacity: c }}>
        <div
          style={{
            width: 900,
            height: 120,
            borderRadius: 16,
            backgroundColor: C.panel,
            border: `1px solid ${C.panelEdge}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              background: `linear-gradient(90deg, rgba(34,211,238,0.15), transparent)`,
              maskImage: "linear-gradient(to right, black 20%, transparent 80%)",
              WebkitMaskImage: "linear-gradient(to right, black 20%, transparent 80%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ fontFamily: F.mono, fontSize: 24, color: C.text }}>(encrypted TLS tunnel)</div>
        </div>
        <div
          style={{
            width: 900,
            height: 4,
            backgroundColor: "#14161F",
            borderRadius: 2,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "0%",
              width: "20%",
              backgroundColor: C.cyan,
              boxShadow: "0 0 20px rgba(34,211,238,0.8)",
              animation: `pulse 2s ease-in-out infinite`,
            }}
          />
        </div>
      </div>
      <Caption text="It travels over your encrypted TLS tunnel. One packet at a time, across the internet." />
    </Stage>
  );
};

const ServerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="THE SERVER" />
      <div style={{ width: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: c }}>
        <div
          style={{
            width: 900,
            padding: "30px 40px",
            borderRadius: 18,
            backgroundColor: C.panel,
            border: `1px solid ${C.panelEdge}`,
          }}
        >
          <div style={{ fontFamily: F.mono, fontSize: 16, letterSpacing: "0.2em", color: C.faint, marginBottom: 10 }}>
            SERVER RECEIVES
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 20, color: C.text, lineHeight: 1.6 }}>
            route: /\r\n
            method: GET\r\n
            handler: homePage\r\n
          </div>
        </div>
        <div style={{ width: 860, display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 14, color: C.faint }}>
          <span>reads the route</span>
          <span>finds the handler</span>
          <span>starts working</span>
        </div>
      </div>
      <Caption text="The server receives it. Reads the route. Finds the handler. Starts working." />
    </Stage>
  );
};

const ProcessingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="PROCESSING" />
      <div style={{ width: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: c }}>
        <div
          style={{
            width: 900,
            height: 140,
            borderRadius: 16,
            backgroundColor: C.panel,
            border: `1px solid ${C.panelEdge}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <div style={{ fontFamily: F.mono, fontSize: 20, color: C.amber }}>queries database</div>
          <div style={{ fontFamily: F.mono, fontSize: 20, color: C.violet }}>computes response</div>
          <div style={{ fontFamily: F.mono, fontSize: 20, color: C.cyan }}>builds HTML or JSON</div>
        </div>
      </div>
      <Caption text="The application runs. Queries a database. Computes a response. Builds HTML or JSON." />
    </Stage>
  );
};

const ResponseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="THE RESPONSE" />
      <div style={{ width: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: c }}>
        <div
          style={{
            width: 900,
            padding: "30px 40px",
            borderRadius: 18,
            backgroundColor: C.panel,
            border: `1px solid ${C.panelEdge}`,
          }}
        >
          <div style={{ fontFamily: F.mono, fontSize: 16, letterSpacing: "0.2em", color: C.faint, marginBottom: 10 }}>
            SERVER → CLIENT
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 20, color: C.text, lineHeight: 1.6 }}>
            HTTP/1.1 200 OK\r\n
            Content-Type: text/html\r\n
            Content-Length: 1248\r\n
            \r\n
            <span>{"<!DOCTYPE html>…"}</span></div>
        </div>
        <div
          style={{
            position: "relative",
            width: 900,
            height: 56,
            opacity: c,
          }}
        >
          <div style={{ position: "absolute", top: 27, left: 0, right: 0, height: 1, backgroundColor: C.panelEdge }} />
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 820,
              width: 40,
              height: 40,
              borderRadius: 40,
              backgroundColor: C.green,
              boxShadow: "0 0 30px rgba(52,211,153,0.9)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -36,
              right: 40,
              fontFamily: F.mono,
              fontSize: 14,
              color: C.green,
              textAlign: "right",
            }}
          >
            encrypted, sent back
          </div>
        </div>
      </div>
      <Caption text="Status line. 200 OK. Headers. Body. Encrypted, sent back." />
    </Stage>
  );
};

const ReturnScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="THE RETURN TRIP" />
      <div style={{ width: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, opacity: c }}>
        <div
          style={{
            width: 900,
            position: "relative",
            height: 120,
          }}
        >
          <div style={{ position: "absolute", top: 59, left: 0, right: 0, height: 1, backgroundColor: C.panelEdge }} />
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 820,
              fontFamily: F.mono,
              fontSize: 14,
              color: C.cyan,
            }}
          >
            SERVER → CLIENT
          </div>
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 40,
              fontFamily: F.mono,
              fontSize: 14,
              color: C.violet,
            }}
          >
            TCP keeps order
          </div>
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 40,
              width: 32,
              height: 32,
              borderRadius: 32,
              backgroundColor: C.cyan,
              boxShadow: "0 0 20px rgba(34,211,238,0.8)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 780,
              width: 32,
              height: 32,
              borderRadius: 32,
              backgroundColor: C.violet,
              boxShadow: "0 0 20px rgba(167,139,250,0.8)",
            }}
          />
        </div>
        <div
          style={{
            width: 860,
            fontFamily: F.mono,
            fontSize: 14,
            color: C.faint,
            textAlign: "center",
          }}
        >
          packets flow back across the same path
        </div>
      </div>
      <Caption text="Packets flow back across the same path. Your browser receives them, in order, thanks to TCP." />
    </Stage>
  );
};

const RenderScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="THE BROWSER" />
      <div style={{ width: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: c }}>
        <div
          style={{
            width: 900,
            height: 140,
            borderRadius: 16,
            backgroundColor: C.panel,
            border: `1px solid ${C.panelEdge}`,
            display: "flex",
            alignItems: "center",
            gap: 30,
            padding: "0 40px",
          }}
        >
          <div style={{ fontFamily: F.mono, fontSize: 18, color: C.cyan, textAlign: "center", flex: 1 }}>
            parse HTML
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 18, color: C.violet, textAlign: "center", flex: 1 }}>
            build DOM
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 18, color: C.amber, textAlign: "center", flex: 1 }}>
            fetch CSS · JS · images
          </div>
        </div>
      </div>
      <Caption text="Your browser parses the HTML. Builds the DOM. Fetches CSS, images, JavaScript." />
    </Stage>
  );
};

const BudgetScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  const e = spring({ frame: frame - 150, fps, config: { damping: 200 } });
  const steps = [
    { label: "DNS", time: "40 ms", color: C.cyan, done: true },
    { label: "TCP", time: "30 ms", color: C.amber, done: true },
    { label: "TLS", time: "50 ms", color: C.violet, done: true },
    { label: "HTTP", time: "80 ms", color: C.text, done: false },
  ];
  return (
    <Stage>
      <Kicker text="THE BUDGET" />
      <div style={{ width: 900, display: "flex", flexDirection: "column", gap: 16, opacity: c }}>
        {steps.map((s, i) => {
          const a = spring({ frame: frame - i * 10, fps, config: { damping: 200 } });
          return (
            <div
              key={s.label}
              style={{
                width: 900,
                display: "flex",
                alignItems: "center",
                gap: 20,
                opacity: a,
                padding: "16px 40px",
                borderRadius: 14,
                backgroundColor: s.done ? "rgba(34,211,238,0.10)" : C.panel,
                border: `1px solid ${s.done ? C.cyan : C.panelEdge}`,
              }}
            >
              <div style={{ fontFamily: F.mono, fontSize: 20, color: s.done ? C.cyan : C.dim }}>{s.label}</div>
              <div style={{ flex: 1, height: 8, backgroundColor: "#14161F", borderRadius: 4, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: s.done ? "100%" : "0%",
                    backgroundColor: s.color,
                  }}
                />
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 20, color: s.done ? C.text : C.faint }}>{s.time}</div>
            </div>
          );
        })}
      </div>
      <Caption text="DNS, TCP, TLS, HTTP. They all fit inside the two hundred milliseconds you started with." />
      {/* End-card teaser for the next episode. Fades in over the final frames of the last scene. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: e,
          pointerEvents: "none",
        }}
      >
        <Kicker text="EPISODE 04 · STEP 4 OF 25" />
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 60,
            color: C.text,
            opacity: e,
            transform: `translateY(${(1 - e) * 20}px)`,
            textAlign: "center",
          }}
        >
          Next
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 600,
            fontSize: 36,
            color: C.cyan,
            marginTop: 20,
            opacity: e,
            textAlign: "center",
          }}
        >
          Reaching millions at once. CDN.
        </div>
        <Caption text="Next: how those bytes reach millions of users at once. CDNs and the edge." />
      </div>
    </Stage>
  );
};

/* ---------------- timeline ---------------- */

const TAIL_FRAMES = 12;

const SCENE_NODES: Record<string, React.ReactNode> = {
  s01: <TitleScene />,
  s02: <HookScene />,
  s03: <RequestScene />,
  s04: <TunnelScene />,
  s05: <ServerScene />,
  s06: <ProcessingScene />,
  s07: <ResponseScene />,
  s08: <ReturnScene />,
  s09: <RenderScene />,
  s10: <BudgetScene />,
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

export const HttpEpisode: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Backdrop />
      {PLAN.map((p) => (
        <Sequence key={p.id} from={p.from} durationInFrames={p.dur}>
          <Audio src={staticFile(`audio/ep04/${p.id}.wav`)} />
          {SCENE_NODES[p.id]}
        </Sequence>
      ))}
      <Watermark text="EP 04 · HTTP" />
    </AbsoluteFill>
  );
};
