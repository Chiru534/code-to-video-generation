import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { CLAMP, ease, lin, ph, prog, rise, rnd, useScene } from "./core";

/* The scene vocabulary for long-form 16:9 video.
 *
 * Every scene in a new film is built from these instead of being hand-typed
 * per episode. The five episode series each defined their own TitleScene,
 * HookScene, BudgetScene and EndCard — five copies of the same idea, which is
 * how a repo grows faster than anyone can read it. These are the canonical
 * versions.
 *
 * A scene's length comes from its measured narration, so every animation here
 * is driven by FRACTIONS of the scene (ph / lin), never absolute frames. A
 * 3-second scene and a 20-second scene then look the same.
 *
 * NOTE: this file is not in render.yml's sharedPatterns, so editing it never
 * re-renders a finished video. Dispatch the composition you changed.
 */

/* ------------------------------------------------------------- chapter --- */

/** The act marker. Also the on-screen chapter list, which is what turns a
 *  10-minute video into something a viewer can navigate and a search engine
 *  can index. */
export const Chapter: React.FC<{ num: string; title: string; at?: number }> = ({
  num,
  title,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 18);
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 200 } });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 26,
        opacity: p,
        transform: `translateX(${(1 - s) * -40}px)`,
      }}
    >
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 30,
          letterSpacing: "0.2em",
          color: C.cyan,
        }}
      >
        {num}
      </div>
      <div
        style={{
          fontFamily: F.sans,
          fontWeight: 800,
          fontSize: 74,
          letterSpacing: "-0.04em",
          color: C.text,
        }}
      >
        {title}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- stat --- */

/** A big number with its unit, its meaning, and — when it matters — the
 *  caveat it carries. `note` is not decoration: the honest label ("POTENTIAL
 *  · PAPER ESTIMATE") lives here, on screen, where the claim is made.
 *
 *  Named Figure, not Stat: the portrait kit already exports a Stat, and two
 *  components with one name is how an agent picks the wrong one. */
export const Figure: React.FC<{
  value: string;
  unit?: string;
  label: string;
  note?: string;
  color?: string;
  at?: number;
  size?: number;
}> = ({ value, unit, label, note, color = C.cyan, at = 0, size = 190 }) => {
  const frame = useCurrentFrame();
  const { d } = useScene();
  const p = ph(frame, d, 0.12, 0.62);
  const np = ph(frame, d, 0.42, 0.78);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 16,
          opacity: p,
        }}
      >
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: size,
            lineHeight: 0.92,
            letterSpacing: "-0.055em",
            color,
            transform: `scale(${0.94 + 0.06 * p})`,
          }}
        >
          {value}
        </div>
        {unit ? (
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 46,
              color: C.dim,
            }}
          >
            {unit}
          </div>
        ) : null}
      </div>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 24,
          letterSpacing: "0.28em",
          color: C.dim,
          opacity: np,
        }}
      >
        {label}
      </div>
      {note ? (
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 18,
            letterSpacing: "0.2em",
            color: C.amber,
            opacity: ph(frame, d, 0.62, 0.9),
            border: `1px solid rgba(251,191,36,0.4)`,
            borderRadius: 8,
            padding: "9px 18px",
          }}
        >
          {note}
        </div>
      ) : null}
    </div>
  );
};

/* -------------------------------------------------------------- matrix --- */

/** A matrix of entries that fill in one by one. The film's central image: a
 *  dense float matrix, and the same matrix after binarisation. */
export const MatrixGrid: React.FC<{
  rows: number;
  cols: number;
  cell?: number;
  gap?: number;
  /** "float" shows soft magnitudes, "binary" shows +/-1 signs. */
  mode?: "float" | "binary";
  /** How much of the grid has been revealed, as a scene fraction. */
  from?: number;
  to?: number;
  color?: string;
  at?: number;
  label?: string;
}> = ({
  rows,
  cols,
  cell = 34,
  gap = 5,
  mode = "binary",
  from = 0.1,
  to = 0.75,
  color = C.cyan,
  at = 0,
  label,
}) => {
  const frame = useCurrentFrame();
  const { d } = useScene();
  const p = ph(frame, d, from, to);
  const count = rows * cols;
  const shown = Math.floor(p * count);
  const total = rows * (cell + gap) - gap;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
          gridAutoRows: `${cell}px`,
          gap,
          width: total,
        }}
      >
        {Array.from({ length: count }).map((_, i) => {
          const on = i < shown;
          const r = rnd(i);
          const c2 = mode === "binary" ? (r > 0.5 ? C.cyan : C.violet) : color;
          const alpha = mode === "binary" ? 0.85 : 0.18 + r * 0.5;
          return (
            <div
              key={i}
              style={{
                borderRadius: 4,
                backgroundColor: on ? c2 : "rgba(255,255,255,0.05)",
                opacity: on ? alpha : 1,
                transition: "none",
              }}
            />
          );
        })}
      </div>
      {label ? (
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 20,
            letterSpacing: "0.24em",
            color: C.faint,
            opacity: ph(frame, d, 0.2, 0.5),
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

/* --------------------------------------------------------------- ladder --- */

/** The bits-per-weight ladder. Each rung is a way of storing a weight, and
 *  the point of the film is the rung below the last one. */
export const Ladder: React.FC<{
  rungs: { label: string; value: string; color: string; note?: string }[];
  from?: number;
  to?: number;
}> = ({ rungs, from = 0.08, to = 0.8 }) => {
  const frame = useCurrentFrame();
  const { d } = useScene();
  const p = ph(frame, d, from, to);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, width: 1180 }}>
      {rungs.map((r, i) => {
        const rp = Math.max(0, Math.min(1, p * rungs.length - i));
        return (
          <div key={r.label} style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                opacity: rp,
                transform: `translateX(${(1 - rp) * -30}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 26,
                  letterSpacing: "0.14em",
                  color: C.dim,
                  width: 250,
                }}
              >
                {r.label}
              </div>
              <div
                style={{
                  height: 30,
                  borderRadius: 8,
                  width: 620 * rp,
                  backgroundColor: r.color,
                  opacity: 0.9,
                }}
              />
              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 28,
                  color: r.color,
                  whiteSpace: "nowrap",
                }}
              >
                {r.value}
              </div>
            </div>
            {/* The note sits on its own line. Inline, it crowded the value and
                wrapped to two lines beside it — tight enough to read as
                overlapping text at a glance. */}
            {r.note ? (
              <div
                style={{
                  marginLeft: 272,
                  marginTop: 6,
                  fontFamily: F.mono,
                  fontSize: 18,
                  letterSpacing: "0.18em",
                  color: C.amber,
                  whiteSpace: "nowrap",
                  opacity: rp,
                }}
              >
                {r.note}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------- spectrum --- */

/** A spectrum of singular values, drawn as bars. `spiky` puts the energy in a
 *  few components; `flat` spreads it. This is the visual the whole second half
 *  of the film turns on. */
export const Spectrum: React.FC<{
  count?: number;
  spiky?: boolean;
  color?: string;
  from?: number;
  to?: number;
  height?: number;
  label?: string;
}> = ({ count = 48, spiky = true, color = C.cyan, from = 0.12, to = 0.8, height = 380, label }) => {
  const frame = useCurrentFrame();
  const { d } = useScene();
  const p = ph(frame, d, from, to);
  const values = Array.from({ length: count }, (_, i) => {
    if (spiky) {
      // Heavy tail: a few large values, a long thin tail.
      return Math.exp(-i / 2.6) * (0.85 + 0.15 * rnd(i));
    }
    // Flat-ish: energy spread almost evenly, slightly decaying.
    return (0.42 + 0.2 * rnd(i)) * (1 - i / (count * 2.2));
  });
  const max = Math.max(...values);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 6,
          height,
          width: count * 22,
        }}
      >
        {values.map((v, i) => {
          const h = (v / max) * height;
          const shown = ph(frame, d, from + (i / count) * (to - from) * 0.6, to);
          return (
            <div
              key={i}
              style={{
                width: 16,
                height: h * shown,
                backgroundColor: color,
                opacity: 0.88,
                borderRadius: "3px 3px 0 0",
              }}
            />
          );
        })}
      </div>
      {label ? (
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 20,
            letterSpacing: "0.24em",
            color: C.faint,
            opacity: ph(frame, d, 0.3, 0.6),
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

/* ------------------------------------------------------------- equation --- */

/** A typeset line of maths. Kept as text, not LaTeX: it must be legible on a
 *  phone, and it must not depend on a font that CI does not have. */
export const Equation: React.FC<{
  parts: { text: string; color?: string; dim?: boolean }[];
  size?: number;
  at?: number;
  from?: number;
  to?: number;
}> = ({ parts, size = 58, at = 0, from = 0.1, to = 0.6 }) => {
  const frame = useCurrentFrame();
  const { d } = useScene();
  const p = ph(frame, d, from, to);
  return (
    <div
      style={{
        fontFamily: F.mono,
        fontSize: size,
        letterSpacing: "-0.01em",
        opacity: p,
        transform: `translateY(${(1 - p) * 18}px)`,
        display: "flex",
        gap: 16,
        alignItems: "baseline",
      }}
    >
      {parts.map((part, i) => (
        <span
          key={i}
          style={{
            color: part.color ?? (part.dim ? C.faint : C.text),
            opacity: part.dim ? 0.75 : 1,
          }}
        >
          {part.text}
        </span>
      ))}
    </div>
  );
};

/* --------------------------------------------------------------- caveat --- */

/** The honest caveat. This card is why the film is worth 10 minutes instead of
 *  70 seconds: the claim, and exactly how far it can be trusted. */
export const Caveat: React.FC<{
  claim: string;
  reality: string;
  at?: number;
}> = ({ claim, reality, at = 0 }) => {
  const frame = useCurrentFrame();
  const { d } = useScene();
  const p = ph(frame, d, 0.1, 0.5);
  const q = ph(frame, d, 0.45, 0.85);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26, width: 1180 }}>
      <div
        style={{
          opacity: p,
          borderLeft: `4px solid ${C.cyan}`,
          paddingLeft: 26,
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 17,
            letterSpacing: "0.26em",
            color: C.faint,
            marginBottom: 10,
          }}
        >
          THE CLAIM
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 700,
            fontSize: 40,
            letterSpacing: "-0.03em",
            color: C.text,
            lineHeight: 1.2,
          }}
        >
          {claim}
        </div>
      </div>
      <div
        style={{
          opacity: q,
          borderLeft: `4px solid ${C.amber}`,
          paddingLeft: 26,
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 17,
            letterSpacing: "0.26em",
            color: C.faint,
            marginBottom: 10,
          }}
        >
          THE REALITY
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 700,
            fontSize: 40,
            letterSpacing: "-0.03em",
            color: C.text,
            lineHeight: 1.2,
          }}
        >
          {reality}
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- code --- */

/** A monospace code panel with a caret that moves. Typewriter motion is the
 *  cheapest way to make a static frame feel alive. */
export const Code: React.FC<{
  lines: string[];
  highlight?: number;
  from?: number;
  to?: number;
  size?: number;
  at?: number;
}> = ({ lines, highlight = -1, from = 0.08, to = 0.75, size = 30, at = 0 }) => {
  const frame = useCurrentFrame();
  const { d } = useScene();
  const p = ph(frame, d, from, to);
  const shown = Math.ceil(p * lines.length);
  const caret = Math.floor((frame - at) / 4) % Math.max(1, shown);
  return (
    <div
      style={{
        width: 1180,
        padding: "30px 34px",
        borderRadius: 18,
        backgroundColor: "#0B0D14",
        border: `1px solid ${C.panelEdge}`,
        fontFamily: F.mono,
        fontSize: size,
        lineHeight: 1.5,
        opacity: at ? prog(frame, at, 12) : 1,
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            color: i === highlight ? C.cyan : C.dim,
            opacity: i < shown ? 1 : 0,
            whiteSpace: "pre",
          }}
        >
          {i === caret ? `${line}▌` : line}
        </div>
      ))}
    </div>
  );
};

/* ----------------------------------------------------------------- rail --- */

/** The film's continuous motif: a bar that counts DOWN from full precision to
 *  sub-one-bit. It never resets, so the viewer always knows how deep the film
 *  has gone. Every act moves it. */
export const BpwRail: React.FC<{
  /** Bits per weight on a log scale, 16 -> 0.1. */
  bpw: number;
  label?: string;
  at?: number;
}> = ({ bpw, label = "BITS PER WEIGHT", at = 0 }) => {
  const frame = useCurrentFrame();
  const target = Math.max(0, Math.min(1, Math.log2(16 / bpw) / Math.log2(160)));
  const fill = interpolate(frame - at, [0, 50], [0, target], { ...CLAMP, easing: ease });
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
        {label}
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
            width: `${fill * 100}%`,
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
        {bpw.toFixed(bpw < 1 ? 2 : 0)} bpw
      </div>
    </div>
  );
};

/* ------------------------------------------------------------- predict --- */

/** The interactive beat. Ask the viewer a question they can answer, hold the
 *  silence for a beat, then reveal. This is the cheapest watch-time there is:
 *  it turns a viewer into a participant, and participation is retention. */
export const Predict: React.FC<{
  question: string;
  options?: string[];
  answer?: number;
  from?: number;
  to?: number;
  hold?: number;
}> = ({ question, options = [], answer = -1, from = 0.06, to = 0.5 }) => {
  const frame = useCurrentFrame();
  const { d } = useScene();
  const q = ph(frame, d, from, to);
  const a = ph(frame, d, 0.62, 0.92);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
      <div
        style={{
          fontFamily: F.sans,
          fontWeight: 800,
          fontSize: 62,
          letterSpacing: "-0.04em",
          color: C.text,
          opacity: q,
          transform: `translateY(${(1 - q) * 16}px)`,
          textAlign: "center",
          maxWidth: 1400,
        }}
      >
        {question}
      </div>
      {options.length ? (
        <div style={{ display: "flex", gap: 20 }}>
          {options.map((o, i) => {
            const chosen = i === answer;
            const op = chosen ? a : q * 0.9;
            const oc = chosen ? C.cyan : C.dim;
            return (
              <div
                key={o}
                style={{
                  fontFamily: F.mono,
                  fontSize: 30,
                  padding: "16px 30px",
                  borderRadius: 12,
                  border: `1px solid ${chosen ? C.cyan : C.panelEdge}`,
                  backgroundColor: chosen ? "rgba(34,211,238,0.1)" : "rgba(255,255,255,0.03)",
                  color: oc,
                  opacity: op,
                  transform: `scale(${chosen ? 1 + 0.04 * a : 1})`,
                }}
              >
                {o}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

/* --------------------------------------------------------------- endcard --- */

/** The close. Subscribe prompt plus the short-form version, because the short
 *  is the funnel and the film is the destination. */
export const EndCard: React.FC<{
  title: string;
  sub?: string;
  cta?: string;
  at?: number;
}> = ({ title, sub, cta = "SUBSCRIBE FOR MORE", at = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 200 } });
  const p = prog(frame, at + 20, 18);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
      <div
        style={{
          fontFamily: F.sans,
          fontWeight: 800,
          fontSize: 96,
          letterSpacing: "-0.05em",
          color: C.text,
          opacity: Math.max(0, Math.min(1, s)),
          transform: `translateY(${(1 - s) * 24}px)`,
          textAlign: "center",
        }}
      >
        {title}
      </div>
      {sub ? (
        <div
          style={{
            fontFamily: F.sans,
            fontSize: 40,
            color: C.dim,
            opacity: p,
            textAlign: "center",
            maxWidth: 1200,
          }}
        >
          {sub}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 24,
          letterSpacing: "0.3em",
          color: C.cyan,
          opacity: prog(frame, at + 40, 16),
          border: `1px solid rgba(34,211,238,0.45)`,
          borderRadius: 10,
          padding: "16px 34px",
        }}
      >
        {cta}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------- helpers --- */

export { rise };

/** A horizontal sweep that finishes when the viewer sees it start. Linear, not
 *  eased: the eased version is ~90% done at its own midpoint. */
export const wipe = (frame: number, d: number, a: number, b: number, width = 100) => ({
  width: `${lin(frame, d, a, b) * width}%`,
});

export { C, F, Easing, interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill };
