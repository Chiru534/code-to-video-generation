import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "./theme";

/* ------------------------------------------------------------------ */
/* deterministic tokenizer (no deps, no highlight engine, no randomness) */
/* ------------------------------------------------------------------ */

type Tok = { t: string; c: string };

const KEYWORDS = new Set([
  "export", "function", "const", "let", "var", "return", "if", "else", "for",
  "of", "in", "new", "await", "async", "import", "from", "type", "interface",
]);

function tokenizeLine(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  const push = (t: string, c: string) => {
    if (!t) return;
    const last = out[out.length - 1];
    if (last && last.c === c) last.t += t;
    else out.push({ t, c });
  };
  while (i < src.length) {
    const rest = src.slice(i);
    if (rest.startsWith("//")) {
      push(rest, C.faint);
      break;
    }
    const ch = rest[0];
    if (ch === '"' || ch === "'" || ch === "`") {
      const end = rest.indexOf(ch, 1);
      const lit = end === -1 ? rest : rest.slice(0, end + 1);
      push(lit, C.green);
      i += lit.length;
      continue;
    }
    const num = /^\d+(?:\.\d+)?/.exec(rest);
    if (num) {
      push(num[0], C.amber);
      i += num[0].length;
      continue;
    }
    const word = /^[A-Za-z_$][\w$]*/.exec(rest);
    if (word) {
      const isKw = KEYWORDS.has(word[0]);
      const after = src.slice(i + word[0].length);
      const isCall = /^\s*\(/.test(after);
      push(word[0], isKw ? C.violet : isCall ? C.cyan : C.text);
      i += word[0].length;
      continue;
    }
    const ws = /^\s+/.exec(rest);
    if (ws) {
      push(ws[0], C.text);
      i += ws[0].length;
      continue;
    }
    push(ch, C.dim);
    i += 1;
  }
  return out;
}

const SOURCE = [
  "// a frame is a pure function of time",
  "export function frame(i: number) {",
  "  const t = i / FPS;",
  "",
  "  // no sampling, no seed, no GPU",
  "  return scene({",
  "    t,",
  "    beats: beat(t),",
  "    seed: \"fixed\"",
  "  });",
  "}",
];

const LINES: Tok[][] = SOURCE.map(tokenizeLine);
const TOTAL_CHARS = SOURCE.reduce((n, l) => n + l.length, 0) + SOURCE.length;

/* ------------------------------------------------------------------ */
/* background                                                          */
/* ------------------------------------------------------------------ */

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 40;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.030) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(255,255,255,0.030) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 45%, black 20%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 45%, black 20%, transparent 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(760px 520px at ${520 + drift}px 220px, rgba(34,211,238,0.16), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(720px 520px at ${1400 - drift}px 820px, rgba(167,139,250,0.16), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: "radial-gradient(120% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* scene 1 — title                                                     */
/* ------------------------------------------------------------------ */

const TITLE = "Code → Video";

const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const kicker = spring({ frame: frame - 4, fps, config: { damping: 200 } });
  const rule = spring({ frame: frame - 26, fps, config: { damping: 200 } });
  const sub = spring({ frame: frame - 34, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ padding: 96, justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: kicker,
          transform: `translateY(${(1 - kicker) * 18}px)`,
        }}
      >
        <div style={{ width: 9, height: 9, borderRadius: 9, backgroundColor: C.cyan }} />
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 21,
            letterSpacing: "0.26em",
            color: C.dim,
          }}
        >
          DETERMINISTIC RENDER · NO GPU
        </div>
      </div>

      <div style={{ display: "flex", marginTop: 26 }}>
        {TITLE.split("").map((ch, i) => {
          const s = spring({
            frame: frame - 6 - i * 2.2,
            fps,
            config: { damping: 14, stiffness: 130, mass: 0.7 },
          });
          const isArrow = ch === "→";
          return (
            <span
              key={i}
              style={{
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 168,
                lineHeight: 1,
                letterSpacing: "-0.045em",
                display: "inline-block",
                whiteSpace: "pre",
                color: isArrow ? C.violet : C.text,
                opacity: Math.max(0, Math.min(1, s)),
                transform: `translateY(${(1 - s) * 46}px) scale(${0.94 + s * 0.06})`,
                filter: `blur(${(1 - s) * 6}px)`,
                textShadow: isArrow ? "0 0 46px rgba(167,139,250,0.55)" : "none",
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>

      <div
        style={{
          height: 2,
          marginTop: 18,
          width: 700 * rule,
          background: `linear-gradient(90deg, ${C.cyan}, ${C.violet} 60%, transparent)`,
        }}
      />

      <div
        style={{
          marginTop: 26,
          fontFamily: F.sans,
          fontSize: 34,
          color: C.dim,
          opacity: sub,
          transform: `translateY(${(1 - sub) * 14}px)`,
          maxWidth: 900,
          lineHeight: 1.4,
        }}
      >
        Every pixel computed. Every frame reproducible.
      </div>

      <div
        style={{
          position: "absolute",
          left: 96,
          bottom: 72,
          fontFamily: F.mono,
          fontSize: 17,
          letterSpacing: "0.2em",
          color: C.faint,
          opacity: sub,
        }}
      >
        PROBE 001 · 15s · 1920×1080 · 30fps
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* scene 2 — code + live stats                                         */
/* ------------------------------------------------------------------ */

const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <div
    style={{
      backgroundColor: C.panel,
      border: `1px solid ${C.panelEdge}`,
      borderRadius: 18,
      boxShadow: "0 40px 120px rgba(0,0,0,0.55)",
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

const TypedCode: React.FC<{ reveal: number }> = ({ reveal }) => {
  let budget = reveal;
  const rows: React.ReactNode[] = [];

  for (let li = 0; li < LINES.length; li++) {
    const toks = LINES[li];
    const parts: React.ReactNode[] = [];
    let used = 0;
    let done = false;

    for (let ti = 0; ti < toks.length; ti++) {
      const tok = toks[ti];
      if (budget - used <= 0) {
        done = true;
        break;
      }
      const take = Math.min(tok.t.length, budget - used);
      parts.push(
        <span key={ti} style={{ color: tok.c }}>
          {tok.t.slice(0, take)}
        </span>,
      );
      used += take;
      if (take < tok.t.length) {
        done = true;
        break;
      }
    }

    rows.push(
      <div key={li} style={{ display: "flex", height: 40 }}>
        <div
          style={{
            width: 54,
            textAlign: "right",
            paddingRight: 22,
            color: C.faint,
            userSelect: "none",
            flexShrink: 0,
          }}
        >
          {li + 1}
        </div>
        <div style={{ whiteSpace: "pre" }}>
          {parts}
          {!done && budget > used ? null : null}
        </div>
      </div>,
    );

    used += 1; // newline
    budget -= used;
    if (budget <= 0) break;
  }

  return (
    <div
      style={{
        fontFamily: F.mono,
        fontSize: 23,
        lineHeight: "40px",
        padding: "18px 0 22px",
      }}
    >
      {rows}
    </div>
  );
};

const StatsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const local = frame - 120;
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({ frame: local, fps, config: { damping: 200 } });
  const reveal = Math.round(
    interpolate(local, [18, 150], [0, TOTAL_CHARS], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  const p = Math.min(1, Math.max(0, frame / durationInFrames));

  const pts = Array.from({ length: 60 }, (_, i) => {
    const x = (i / 59) * 100;
    const v =
      0.55 +
      0.28 * Math.sin(i / 4.2) * Math.exp(-i / 55) +
      0.14 * Math.sin(i / 1.7) * Math.exp(-i / 90);
    return `${x.toFixed(2)},${(100 - v * 100).toFixed(2)}`;
  }).join(" ");

  return (
    <AbsoluteFill style={{ padding: 72, opacity: enter }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 22,
          transform: `translateY(${(1 - enter) * 16}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 15,
              letterSpacing: "0.22em",
              color: C.cyan,
            }}
          >
            01
          </div>
          <div style={{ width: 34, height: 1, backgroundColor: C.panelEdge }} />
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 15,
              letterSpacing: "0.22em",
              color: C.dim,
            }}
          >
            THE LOOK
          </div>
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 15, letterSpacing: "0.18em", color: C.faint }}>
          FRAME {String(frame).padStart(3, "0")} / {durationInFrames}
        </div>
      </div>

      <div style={{ display: "flex", gap: 26, height: 720 }}>
        {/* code panel */}
        <Panel style={{ flex: 1.15, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              height: 58,
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "0 22px",
              borderBottom: `1px solid ${C.panelEdge}`,
              backgroundColor: C.bgLift,
            }}
          >
            {[C.red, C.amber, C.green].map((col, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: 12, backgroundColor: col, opacity: 0.85 }} />
            ))}
            <div
              style={{
                marginLeft: 14,
                fontFamily: F.mono,
                fontSize: 16,
                color: C.dim,
              }}
            >
              scene.ts
            </div>
          </div>
          <div style={{ padding: "14px 26px", flex: 1, overflow: "hidden" }}>
            <TypedCode reveal={reveal} />
          </div>
        </Panel>

        {/* stats panel */}
        <Panel
          style={{
            flex: 1,
            padding: 34,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "rgba(18,20,28,0.92)",
          }}
        >
          <div style={{ fontFamily: F.mono, fontSize: 15, letterSpacing: "0.22em", color: C.dim }}>
            FRAMES THIS CLIP
          </div>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 700,
              fontSize: 96,
              letterSpacing: "-0.03em",
              color: C.text,
              marginTop: 6,
            }}
          >
            {String(frame).padStart(3, "0")}
            <span style={{ color: C.faint, fontSize: 44 }}> / {durationInFrames}</span>
          </div>

          <div
            style={{
              height: 10,
              borderRadius: 10,
              backgroundColor: "#1B1E28",
              marginTop: 18,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${p * 100}%`,
                background: `linear-gradient(90deg, ${C.cyan}, ${C.violet})`,
              }}
            />
          </div>

          <div style={{ marginTop: 34, height: 170, position: "relative" }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
              <defs>
                <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.cyan} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={C.cyan} stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={`0,100 ${pts} 100,100`} fill="url(#fill)" />
              <polyline
                points={pts}
                fill="none"
                stroke={C.cyan}
                strokeWidth={0.9}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: "auto" }}>
            {[
              { k: "RES", v: "1920×1080" },
              { k: "FPS", v: "30" },
              { k: "GPU", v: "0%" },
            ].map((s) => (
              <div
                key={s.k}
                style={{
                  flex: 1,
                  backgroundColor: C.bgLift,
                  border: `1px solid ${C.panelEdge}`,
                  borderRadius: 12,
                  padding: "14px 16px",
                }}
              >
                <div style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: "0.2em", color: C.faint }}>
                  {s.k}
                </div>
                <div style={{ fontFamily: F.mono, fontSize: 21, color: C.text, marginTop: 6 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* scene 3 — pipeline                                                  */
/* ------------------------------------------------------------------ */

const NODES = [
  { label: "SCRIPT", sub: "timecoded" },
  { label: "SCENES", sub: "React / Manim" },
  { label: "FFMPEG", sub: "concat + -14 LUFS" },
  { label: "MP4", sub: "delivered" },
];

const PipelineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const local = frame - 300;
  const { fps } = useVideoConfig();

  const p = interpolate(local, [10, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const W = 1920 - 144;
  const nodeW = 300;
  const gap = (W - nodeW * NODES.length) / (NODES.length - 1);
  const centers = NODES.map((_, i) => 72 + i * (nodeW + gap) + nodeW / 2);
  const dotX = interpolate(p, [0, 1], [centers[0], centers[centers.length - 1]]);

  return (
    <AbsoluteFill style={{ padding: 72, justifyContent: "center" }}>
      <div
        style={{
          fontFamily: F.sans,
          fontWeight: 800,
          fontSize: 78,
          letterSpacing: "-0.035em",
          color: C.text,
          marginBottom: 14,
        }}
      >
        Time in, pixels out.
      </div>
      <div style={{ fontFamily: F.sans, fontSize: 30, color: C.dim, marginBottom: 74 }}>
        Four deterministic stages. No model weights anywhere.
      </div>

      <div style={{ position: "relative", height: 220, width: W }}>
        <div
          style={{
            position: "absolute",
            top: 72,
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(90deg, ${C.panelEdge}, ${C.panelEdge})`,
          }}
        />

        {NODES.map((n, i) => {
          const s = spring({ frame: local - 8 - i * 9, fps, config: { damping: 16, stiffness: 120 } });
          const active = dotX >= centers[i];
          return (
            <div
              key={n.label}
              style={{
                position: "absolute",
                left: i * (nodeW + gap),
                top: 0,
                width: nodeW,
                opacity: Math.max(0, Math.min(1, s)),
                transform: `translateY(${(1 - s) * 26}px)`,
              }}
            >
              <div
                style={{
                  height: 144,
                  borderRadius: 16,
                  backgroundColor: C.panel,
                  border: `1px solid ${active ? "rgba(34,211,238,0.55)" : C.panelEdge}`,
                  boxShadow: active ? "0 0 44px rgba(34,211,238,0.14)" : "none",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: "0.14em", color: active ? C.cyan : C.text }}>
                  {n.label}
                </div>
                <div style={{ fontFamily: F.mono, fontSize: 14, color: C.faint }}>{n.sub}</div>
              </div>
            </div>
          );
        })}

        <div
          style={{
            position: "absolute",
            top: 63,
            left: dotX - 9,
            width: 18,
            height: 18,
            borderRadius: 18,
            backgroundColor: C.cyan,
            boxShadow: "0 0 26px rgba(34,211,238,0.85)",
          }}
        />

        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 63 + 9 - 7,
              left: centers[i],
              width: centers[i + 1] - centers[i],
              height: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: F.mono,
              fontSize: 15,
              color: C.faint,
            }}
          />
        ))}
      </div>

      <div
        style={{
          marginTop: 76,
          display: "flex",
          gap: 34,
          fontFamily: F.mono,
          fontSize: 17,
          letterSpacing: "0.16em",
          color: C.faint,
          opacity: interpolate(local, [70, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        <span>NO DIFFUSION</span>
        <span style={{ color: C.panelEdge }}>|</span>
        <span>NO SAMPLING</span>
        <span style={{ color: C.panelEdge }}>|</span>
        <span>NO WEIGHTS</span>
        <span style={{ color: C.panelEdge }}>|</span>
        <span style={{ color: C.cyan }}>REPRODUCIBLE</span>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* root composition                                                    */
/* ------------------------------------------------------------------ */

export const QualityProbe: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Backdrop />
      {frame < 120 && <TitleScene />}
      {frame >= 120 && frame < 300 && <StatsScene />}
      {frame >= 300 && <PipelineScene />}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          border: "1px solid rgba(255,255,255,0.05)",
          margin: 0,
        }}
      />
    </AbsoluteFill>
  );
};
