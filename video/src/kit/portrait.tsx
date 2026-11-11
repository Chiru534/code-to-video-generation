import React from "react";
import { C, F } from "../theme";
import { Stage } from "../chrome";
import { Bar, Hero, PW, Statement, Top } from "./scene";
import { lin, ph, prog, rnd, useScene } from "./core";

/* Portrait scene kinds for the weekly shorts.
 *
 * WHY A SECOND SCENE LIBRARY: the shared vocabulary in scenes.tsx is sized
 * for 16:9. Ladder, Caveat and Code all hard-code width 1180, and Chapter
 * and EndCard are typeset for a 1920 frame. Dropped into a 1080-wide short
 * they either overflow or read as furniture from another video. 1080-wide
 * geometry does not transfer, so the portrait family gets its own set.
 *
 * WHY "Short*" AND NOT "Stat": kit/scene.tsx already exports Stat, and the
 * shared family in scenes.tsx exports Figure. A third component with one of
 * those names is exactly how an agent picks the wrong one. Every export here
 * is prefixed so no name can collide, and tools/audit.py enforces it.
 *
 * Every component renders a WHOLE scene — Stage, kicker, and the centred
 * Hero block — so a short's scene registry is one line per scene.
 *
 * Like the rest of the kit, this file is NOT in render.yml's sharedPatterns:
 * editing it renders nothing. Dispatch the compositions you changed.
 */

/* ---------------------------------------------------------------- figure --- */

/** A number, its unit, what it means, and the honest label it carries.
 *  `note` is not decoration: "OUR ARITHMETIC · 7B / ADAM / BF16" belongs on
 *  screen next to the number, not in a caption the viewer may miss. */
export const ShortFigure: React.FC<{
  value: string;
  unit?: string;
  label: string;
  note?: string;
  color?: string;
  kicker?: string;
  size?: number;
  line?: string;
  lineColor?: string;
}> = ({
  value,
  unit,
  label,
  note,
  color = C.cyan,
  kicker,
  size = 230,
  line,
  lineColor = C.text,
}) => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.04, 0.3);
  const np = ph(frame, d, 0.26, 0.44);
  const lp = ph(frame, d, 0.44, 0.6);
  return (
    <Stage>
      {kicker ? <Top text={kicker} /> : null}
      <Hero lift={0}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18, opacity: p }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: size,
              lineHeight: 0.9,
              letterSpacing: "-0.055em",
              color,
              transform: `scale(${0.94 + 0.06 * p})`,
            }}
          >
            {value}
          </div>
          {unit ? (
            <div style={{ fontFamily: F.mono, fontSize: 46, color: C.dim }}>{unit}</div>
          ) : null}
        </div>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 25,
            letterSpacing: "0.26em",
            color: C.dim,
            marginTop: 18,
            textAlign: "center",
            opacity: np,
          }}
        >
          {label}
        </div>
        {note ? (
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 19,
              letterSpacing: "0.16em",
              color: C.amber,
              marginTop: 20,
              border: `1px solid rgba(251,191,36,0.4)`,
              borderRadius: 8,
              padding: "9px 16px",
              opacity: np,
            }}
          >
            {note}
          </div>
        ) : null}
        {line ? (
          <div style={{ marginTop: 74 }}>
            <Statement p={lp} size={82} color={lineColor}>
              {line}
            </Statement>
          </div>
        ) : null}
      </Hero>
    </Stage>
  );
};

/* ----------------------------------------------------------------- stack --- */

/** A ledger: labelled rows, each with a value and an optional bar. The memory
 *  accounting short is a stack, not a sentence, and it should look like one. */
export const ShortStack: React.FC<{
  rows: { label: string; value: string; color?: string; frac?: number; note?: string }[];
  kicker?: string;
  foot?: string;
  footColor?: string;
}> = ({ rows, kicker, foot, footColor = C.text }) => {
  const { frame, d } = useScene();
  return (
    <Stage>
      {kicker ? <Top text={kicker} /> : null}
      <Hero lift={0}>
        <div
          style={{
            width: PW,
            border: `1px solid ${C.panelEdge}`,
            borderRadius: 22,
            backgroundColor: C.panel,
            overflow: "hidden",
          }}
        >
          {rows.map((r, i) => {
            const rp = ph(frame, d, 0.04 + i * 0.07, 0.22 + i * 0.07);
            return (
              <div
                key={r.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "34px 40px",
                  borderBottom: i === rows.length - 1 ? "none" : `1px solid ${C.panelEdge}`,
                  opacity: rp,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 18,
                  }}
                >
                  <div
                    style={{
                      fontFamily: F.mono,
                      fontSize: 24,
                      letterSpacing: "0.14em",
                      color: C.dim,
                    }}
                  >
                    {r.label}
                  </div>
                  <div
                    style={{
                      fontFamily: F.sans,
                      fontWeight: 800,
                      fontSize: 58,
                      color: r.color ?? C.text,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.value}
                  </div>
                </div>
                {typeof r.frac === "number" ? (
                  <div style={{ marginTop: 14 }}>
                    <Bar frac={r.frac} color={r.color ?? C.cyan} height={12} width={PW - 80} />
                  </div>
                ) : null}
                {r.note ? (
                  <div
                    style={{
                      fontFamily: F.mono,
                      fontSize: 18,
                      letterSpacing: "0.16em",
                      color: C.amber,
                      marginTop: 10,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.note}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        {foot ? (
          <div
            style={{
              marginTop: 58,
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 74,
              letterSpacing: "-0.04em",
              color: footColor,
              textAlign: "center",
              opacity: ph(frame, d, 0.5, 0.68),
              lineHeight: 1.08,
            }}
          >
            {foot}
          </div>
        ) : null}
      </Hero>
    </Stage>
  );
};

/* --------------------------------------------------------------- compare --- */

/** Two numbers, side by side, with the honest note under the one that needs
 *  one. The shape of most "you think X, actually Y" shorts. */
export const ShortCompare: React.FC<{
  left: { value: string; label: string; color?: string; note?: string };
  right: { value: string; label: string; color?: string; note?: string };
  kicker?: string;
  line?: string;
}> = ({ left, right, kicker, line }) => {
  const { frame, d } = useScene();
  const a = ph(frame, d, 0.04, 0.24);
  const b = ph(frame, d, 0.16, 0.36);
  const lp = ph(frame, d, 0.44, 0.6);
  const card = (
    value: string,
    label: string,
    color: string,
    note: string | undefined,
    op: number
  ) => (
    <div
      style={{
        flex: 1,
        border: `1px solid ${C.panelEdge}`,
        borderRadius: 22,
        backgroundColor: C.panel,
        padding: "40px 28px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: op,
      }}
    >
      <div
        style={{
          fontFamily: F.sans,
          fontWeight: 800,
          fontSize: 100,
          letterSpacing: "-0.05em",
          lineHeight: 1,
          color,
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 20,
          letterSpacing: "0.18em",
          color: C.dim,
          marginTop: 18,
          textAlign: "center",
        }}
      >
        {label}
      </div>
      {note ? (
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 17,
            letterSpacing: "0.12em",
            color: C.amber,
            marginTop: 14,
            textAlign: "center",
          }}
        >
          {note}
        </div>
      ) : null}
    </div>
  );
  return (
    <Stage>
      {kicker ? <Top text={kicker} /> : null}
      <Hero lift={0}>
        <div style={{ display: "flex", gap: 26, width: PW, alignItems: "stretch" }}>
          {card(left.value, left.label, left.color ?? C.text, left.note, a)}
          {card(right.value, right.label, right.color ?? C.cyan, right.note, b)}
        </div>
        {line ? (
          <div style={{ marginTop: 76 }}>
            <Statement p={lp} size={80}>
              {line}
            </Statement>
          </div>
        ) : null}
      </Hero>
    </Stage>
  );
};

/* ----------------------------------------------------------------- scale --- */

/** An axis with points on it and a marker that walks to one of them. For the
 *  claims that are a function of something else — context length, batch size,
 *  sequence length. */
export const ShortScale: React.FC<{
  points: { x: number; label: string }[];
  marker: number;
  markerLabel?: string;
  kicker?: string;
  axisLabel?: string;
}> = ({ points, marker, markerLabel, kicker, axisLabel }) => {
  const { frame, d } = useScene();
  const walk = lin(frame, d, 0.1, 0.62);
  const target = points[marker]?.x ?? 0.5;
  const at = walk * target;
  return (
    <Stage>
      {kicker ? <Top text={kicker} /> : null}
      <Hero lift={0}>
        <div style={{ width: PW }}>
          <div
            style={{
              position: "relative",
              height: 8,
              borderRadius: 6,
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${at * 100}%`,
                borderRadius: 6,
                backgroundColor: C.cyan,
                opacity: 0.85,
              }}
            />
            {points.map((p, i) => (
              <div
                key={p.label}
                style={{
                  position: "absolute",
                  left: `${p.x * 100}%`,
                  top: -7,
                  width: 3,
                  height: 22,
                  marginLeft: -1.5,
                  backgroundColor: i === marker ? C.cyan : C.faint,
                }}
              />
            ))}
            <div
              style={{
                position: "absolute",
                left: `${at * 100}%`,
                top: -22,
                width: 26,
                height: 26,
                marginLeft: -13,
                borderRadius: 13,
                backgroundColor: C.cyan,
                boxShadow: `0 0 ${24 + 30 * walk}px rgba(34,211,238,0.55)`,
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 34,
            }}
          >
            {points.map((p, i) => (
              <div
                key={p.label}
                style={{
                  fontFamily: F.mono,
                  fontSize: 19,
                  letterSpacing: "0.1em",
                  color: i === marker ? C.cyan : C.faint,
                  opacity: ph(frame, d, 0.06 + i * 0.06, 0.24 + i * 0.06),
                  whiteSpace: "nowrap",
                }}
              >
                {p.label}
              </div>
            ))}
          </div>

          {markerLabel ? (
            <div
              style={{
                marginTop: 72,
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 70,
                letterSpacing: "-0.04em",
                color: C.text,
                textAlign: "center",
                opacity: ph(frame, d, 0.56, 0.72),
                lineHeight: 1.1,
              }}
            >
              {markerLabel}
            </div>
          ) : null}

          {axisLabel ? (
            <div
              style={{
                marginTop: 20,
                fontFamily: F.mono,
                fontSize: 19,
                letterSpacing: "0.2em",
                color: C.faint,
                textAlign: "center",
              }}
            >
              {axisLabel}
            </div>
          ) : null}
        </div>
      </Hero>
    </Stage>
  );
};

/* ---------------------------------------------------------------- caveat --- */

/** The honest caveat, in portrait. The claim, and exactly how far it can be
 *  trusted. This is the card that makes a short worth more than a caption. */
export const ShortCaveat: React.FC<{
  claim: string;
  reality: string;
  kicker?: string;
}> = ({ claim, reality, kicker }) => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.06, 0.34);
  const q = ph(frame, d, 0.34, 0.62);
  const block = (
    tag: string,
    body: string,
    accent: string,
    op: number
  ) => (
    <div style={{ opacity: op, borderLeft: `4px solid ${accent}`, paddingLeft: 24 }}>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 17,
          letterSpacing: "0.24em",
          color: C.faint,
          marginBottom: 12,
        }}
      >
        {tag}
      </div>
      <div
        style={{
          fontFamily: F.sans,
          fontWeight: 700,
          fontSize: 38,
          letterSpacing: "-0.03em",
          color: C.text,
          lineHeight: 1.24,
        }}
      >
        {body}
      </div>
    </div>
  );
  return (
    <Stage>
      {kicker ? <Top text={kicker} /> : null}
      <Hero lift={0}>
        <div style={{ display: "flex", flexDirection: "column", gap: 40, width: PW }}>
          {block("THE CLAIM", claim, C.cyan, p)}
          {block("THE REALITY", reality, C.amber, q)}
        </div>
      </Hero>
    </Stage>
  );
};

/* ------------------------------------------------------------------ bits --- */

/** A row of bit cells. Sign bit, exponent, mantissa — the layouts that make
 *  a number format a number format. */
export const ShortBits: React.FC<{
  cells: { text: string; color?: string; filled?: boolean; width?: number }[];
  kicker?: string;
  label?: string;
  sub?: string;
}> = ({ cells, kicker, label, sub }) => {
  const { frame, d } = useScene();
  return (
    <Stage>
      {kicker ? <Top text={kicker} /> : null}
      <Hero lift={0}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {cells.map((c, i) => {
              const op = ph(frame, d, 0.05 + i * 0.06, 0.25 + i * 0.06);
              return (
                <div
                  key={`${c.text}-${i}`}
                  style={{
                    width: c.width ?? 76,
                    height: 132,
                    borderRadius: 14,
                    border: `2px solid ${c.color ?? C.panelEdge}`,
                    backgroundColor: c.filled ? `${c.color ?? C.cyan}22` : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: F.mono,
                    fontSize: 36,
                    color: c.color ?? C.faint,
                    opacity: op,
                    transform: `translateY(${(1 - op) * 14}px)`,
                  }}
                >
                  {c.text}
                </div>
              );
            })}
          </div>
          {label ? (
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 25,
                letterSpacing: "0.22em",
                color: C.dim,
                opacity: ph(frame, d, 0.4, 0.56),
              }}
            >
              {label}
            </div>
          ) : null}
          {sub ? (
            <div
              style={{
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 76,
                letterSpacing: "-0.04em",
                color: C.text,
                textAlign: "center",
                opacity: ph(frame, d, 0.46, 0.62),
                lineHeight: 1.1,
                maxWidth: PW,
              }}
            >
              {sub}
            </div>
          ) : null}
        </div>
      </Hero>
    </Stage>
  );
};

/* ------------------------------------------------------------------ grid --- */

/** A grid of values. Weights, activations, tokens — anything that is a lot of
 *  small numbers. */
export const ShortGrid: React.FC<{
  rows: number;
  cols: number;
  values?: string[];
  color?: string;
  kicker?: string;
  label?: string;
  cell?: number;
  font?: number;
}> = ({ rows, cols, values = [], color = C.cyan, kicker, label, cell = 62, font = 15 }) => {
  const { frame, d } = useScene();
  return (
    <Stage>
      {kicker ? <Top text={kicker} /> : null}
      <Hero lift={0}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
              gap: 7,
            }}
          >
            {Array.from({ length: rows * cols }).map((_, i) => {
              const op = ph(frame, d, 0.04 + (i % 9) * 0.04, 0.24 + (i % 9) * 0.04);
              const hot = rnd(i) > 0.7;
              return (
                <div
                  key={i}
                  style={{
                    width: cell,
                    height: cell,
                    borderRadius: 9,
                    border: `1px solid ${hot ? color : C.panelEdge}`,
                    backgroundColor: hot ? `${color}18` : C.panel,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: F.mono,
                    fontSize: font,
                    color: hot ? color : C.dim,
                    opacity: op,
                  }}
                >
                  {values[i] ?? (rnd(i) * 2 - 1).toFixed(2)}
                </div>
              );
            })}
          </div>
          {label ? (
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 20,
                letterSpacing: "0.22em",
                color: C.faint,
                opacity: ph(frame, d, 0.4, 0.56),
              }}
            >
              {label}
            </div>
          ) : null}
        </div>
      </Hero>
    </Stage>
  );
};

/* ---------------------------------------------------------------- tokens --- */

/** A row of tokens, each masked, decided, or in focus. Diffusion decoding and
 *  speculative decoding are both "which slot is being decided right now".
 *
 *  `filled` is how many slots have been decided, counted from the left, and
 *  `focus` is the slot currently being worked on. Numbers rather than a
 *  callback, so a whole short can be written as data. */
export const ShortTokens: React.FC<{
  tokens: string[];
  filled: number;
  focus?: number;
  kicker?: string;
  label?: string;
  sub?: string;
}> = ({ tokens, filled, focus = -1, kicker, label, sub }) => {
  const { frame, d } = useScene();
  const state = (index: number): "masked" | "done" | "focus" => {
    if (index === focus) return "focus";
    return index < filled ? "done" : "masked";
  };
  return (
    <Stage>
      {kicker ? <Top text={kicker} /> : null}
      <Hero lift={0}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {tokens.map((t, i) => {
              const st = state(i);
              const op = ph(frame, d, 0.04 + i * 0.05, 0.22 + i * 0.05);
              const accent = st === "focus" ? C.amber : st === "done" ? C.cyan : C.faint;
              return (
                <div
                  key={`${t}-${i}`}
                  style={{
                    minWidth: 92,
                    padding: "16px 14px",
                    borderRadius: 12,
                    border: `2px solid ${st === "masked" ? C.panelEdge : accent}`,
                    backgroundColor: st === "focus" ? "rgba(251,191,36,0.12)" : C.panel,
                    fontFamily: F.mono,
                    fontSize: 24,
                    color: st === "masked" ? C.faint : accent,
                    textAlign: "center",
                    opacity: op,
                    transform: `translateY(${(1 - op) * 12}px)`,
                  }}
                >
                  {st === "masked" ? "·" : t}
                </div>
              );
            })}
          </div>
          {label ? (
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 20,
                letterSpacing: "0.2em",
                color: C.dim,
                opacity: ph(frame, d, 0.42, 0.56),
              }}
            >
              {label}
            </div>
          ) : null}
          {sub ? (
            <div
              style={{
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 62,
                letterSpacing: "-0.04em",
                color: C.text,
                textAlign: "center",
                opacity: ph(frame, d, 0.48, 0.64),
                lineHeight: 1.12,
                maxWidth: PW,
              }}
            >
              {sub}
            </div>
          ) : null}
        </div>
      </Hero>
    </Stage>
  );
};

/* ----------------------------------------------------------------- title --- */

/** A title card: the paper, the method, the year. */
export const ShortTitle: React.FC<{
  title: string;
  sub?: string;
  kicker?: string;
  meta?: string;
  color?: string;
}> = ({ title, sub, kicker, meta, color = C.text }) => {
  const { frame, d } = useScene();
  const a = ph(frame, d, 0.04, 0.2);
  const b = ph(frame, d, 0.16, 0.32);
  const c = ph(frame, d, 0.34, 0.5);
  return (
    <Stage>
      {kicker ? <Top text={kicker} /> : null}
      <Hero lift={0}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 24,
              letterSpacing: "0.3em",
              color: C.dim,
              opacity: a,
            }}
          >
            {sub}
          </div>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 104,
              letterSpacing: "-0.05em",
              lineHeight: 1.02,
              color,
              marginTop: 14,
              textAlign: "center",
              opacity: b,
              transform: `translateY(${(1 - b) * 26}px)`,
              maxWidth: PW,
            }}
          >
            {title}
          </div>
          {meta ? (
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 20,
                letterSpacing: "0.22em",
                color: C.faint,
                marginTop: 40,
                opacity: c,
              }}
            >
              {meta}
            </div>
          ) : null}
        </div>
      </Hero>
    </Stage>
  );
};

/* ------------------------------------------------------------------- end --- */

/** The close. A short ends on the one idea it was about. */
export const ShortEnd: React.FC<{
  title: string;
  sub?: string;
  cta?: string;
}> = ({ title, sub, cta = "FOLLOW FOR MORE" }) => {
  const { frame, d } = useScene();
  const a = ph(frame, d, 0.06, 0.32);
  const b = ph(frame, d, 0.22, 0.44);
  const c = ph(frame, d, 0.4, 0.6);
  return (
    <Stage>
      <Hero lift={0}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 74,
              letterSpacing: "-0.045em",
              color: C.text,
              textAlign: "center",
              lineHeight: 1.08,
              maxWidth: PW,
              opacity: a,
              transform: `translateY(${(1 - a) * 24}px)`,
            }}
          >
            {title}
          </div>
          <div
            style={{ width: 220 * b, height: 2, backgroundColor: C.panelEdge, marginTop: 36 }}
          />
          {sub ? (
            <div
              style={{
                fontFamily: F.sans,
                fontSize: 34,
                color: C.dim,
                marginTop: 32,
                textAlign: "center",
                opacity: c,
                lineHeight: 1.3,
                maxWidth: PW,
              }}
            >
              {sub}
            </div>
          ) : null}
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 21,
              letterSpacing: "0.28em",
              color: C.cyan,
              marginTop: 46,
              opacity: prog(frame, 18, 16),
              border: `1px solid rgba(34,211,238,0.4)`,
              borderRadius: 10,
              padding: "15px 30px",
            }}
          >
            {cta}
          </div>
        </div>
      </Hero>
    </Stage>
  );
};
