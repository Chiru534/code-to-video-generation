import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../../theme";
import { FILM, Ground, Label, Kicker, Statement } from "../../kit/film";
import { Figure, Code, Equation, Caveat, EndCard } from "../../kit/scenes";
import { lin, ph, rnd } from "../../kit/core";

/* The CAG film's visual vocabulary. One component, many kinds: the film has
 * sixty narration lines, and hand-writing sixty scenes is how a repo grows a
 * second copy of every bug. Every kind animates across the WHOLE scene — a
 * scene that animates in and then freezes is the commonest way to break the
 * no-still-frame rule. */

type Kind =
  | "title" | "quote" | "flow" | "cache" | "spec" | "table" | "versus"
  | "label" | "calc" | "version" | "code" | "size" | "caveat" | "end";

export interface CagSceneProps {
  kind: Kind;
  head?: string;
  lines?: string[];
  note?: string;
  accent?: number;
  a?: string;
  b?: string;
  claim?: string;
  reality?: string;
  highlight?: number;
}

const Wrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    <Ground />
    <div
      style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 34,
        padding: `0 ${FILM.pad}px 96px`, boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

const Bar: React.FC<{ p: number; color: string; w: number; h?: number }> = ({
  p, color, w, h = 8,
}) => (
  <div style={{ width: w, height: h, borderRadius: h / 2, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
    <div style={{ width: `${Math.max(0.4, p * 100)}%`, height: h, background: color, borderRadius: h / 2 }} />
  </div>
);

export const CagScene: React.FC<CagSceneProps> = (p) => {
  const frame = useCurrentFrame();
  // Scene length is the only reliable clock: narration lengths drift between renders.
  const { durationInFrames: scene } = useVideoConfig();
  const d = Math.max(1, scene);
  const lines = p.lines ?? [];
  const a = p.a ?? "92.08 s";
  const b = p.b ?? "2.26 s";

  const drift = Math.sin(frame / 47) * 12;
  const pulse = 0.72 + 0.28 * (0.5 + 0.5 * Math.sin(frame / 13));

  switch (p.kind) {
    case "title":
      return (
        <Wrap>
          <Kicker text={p.head ?? "CACHE-AUGMENTED GENERATION"} />
          <div style={{ transform: `translateY(${drift}px)` }}>
            <Statement lines={lines} accent={p.accent ?? 0} sub={p.note} />
          </div>
          <div style={{ width: 900, opacity: 0.8 }}>
            <Bar p={lin(frame, d, 0.05, 0.95)} color={C.cyan} w={900} />
          </div>
        </Wrap>
      );

    case "quote":
      return (
        <Wrap>
          <Kicker text={p.head ?? "THE CLAIM"} />
          <div
            style={{
              position: "relative", width: 1420, padding: "46px 56px", borderRadius: 22,
              background: C.panel, border: `1px solid ${C.amber}`,
              transform: `translateY(${drift * 0.5}px)`,
            }}
          >
            {lines.map((ln, i) => {
              const q = ph(frame, d, 0.08 + i * 0.1, 0.42 + i * 0.1);
              return (
                <div key={i} style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 46,
                  color: i === p.highlight ? C.amber : C.text, lineHeight: 1.22,
                  opacity: q, transform: `translateY(${(1 - q) * 16}px)` }}>
                  {ln}
                </div>
              );
            })}
            <div style={{ position: "absolute", left: 0, right: 0, top: lin(frame, d, 0.05, 0.95) * 100 + "%",
              height: 2, background: `linear-gradient(90deg, transparent, ${C.amber}, transparent)`, opacity: 0.55 }} />
          </div>
          {p.note ? <Label text={p.note} color={C.amber} size={20} /> : null}
        </Wrap>
      );

    case "flow": {
      const boxes = lines.length;
      return (
        <Wrap>
          <Kicker text={p.head ?? "PIPELINE"} />
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {lines.map((ln, i) => {
              const q = ph(frame, d, 0.06 + i * 0.09, 0.32 + i * 0.09);
              const active = (frame / Math.max(1, d) * boxes) % boxes > i - 0.5
                && (frame / Math.max(1, d) * boxes) % boxes < i + 0.7;
              return (
                <React.Fragment key={ln}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
                    opacity: q, transform: `translateY(${(1 - q) * 22}px)` }}>
                    <div style={{ width: 200, height: 92, borderRadius: 14, display: "flex",
                      alignItems: "center", justifyContent: "center", textAlign: "center",
                      background: active ? "rgba(34,211,238,0.16)" : C.panel,
                      border: `1px solid ${active ? C.cyan : C.panelEdge}`,
                      fontFamily: F.mono, fontSize: 21, color: active ? C.cyan : C.text,
                      padding: 12, boxSizing: "border-box" }}>
                      {ln}
                    </div>
                    <div style={{ width: 120, height: 4, borderRadius: 4,
                      background: C.panelEdge, overflow: "hidden" }}>
                      <div style={{ width: `${ph(frame, d, 0.1 + i * 0.09, 0.7) * 100}%`,
                        height: 4, background: i === p.highlight ? C.amber : C.cyan }} />
                    </div>
                  </div>
                  {i < boxes - 1 ? <div style={{ color: C.faint, fontSize: 30 }}>→</div> : null}
                </React.Fragment>
              );
            })}
          </div>
          {p.note ? <Label text={p.note} color={C.faint} size={20} /> : null}
        </Wrap>
      );
    }

    case "cache": {
      const cols = 24, rows = 5, n = cols * rows;
      const shown = Math.floor(lin(frame, d, 0.08, 0.88) * n);
      return (
        <Wrap>
          <Kicker text={p.head ?? "KV CACHE"} />
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 26px)`, gap: 6 }}>
            {Array.from({ length: n }).map((_, i) => (
              <div key={i} style={{ width: 26, height: 26, borderRadius: 4,
                background: i < shown ? (i % 5 === 0 ? C.violet : C.cyan) : "rgba(255,255,255,0.05)",
                opacity: i < shown ? 0.35 + 0.55 * rnd(i) : 1 }} />
            ))}
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 24, color: C.dim,
            opacity: ph(frame, d, 0.3, 0.7) }}>
            {a} · {b}
          </div>
          {p.note ? <Label text={p.note} color={C.amber} size={20} /> : null}
        </Wrap>
      );
    }

    case "spec": {
      const items = lines;
      return (
        <Wrap>
          <Kicker text={p.head ?? "SETUP"} />
          <div style={{ display: "flex", gap: 22 }}>
            {items.map((ln, i) => {
              const q = ph(frame, d, 0.06 + i * 0.11, 0.4 + i * 0.11);
              return (
                <div key={ln} style={{ width: 360, padding: "28px 24px", borderRadius: 16,
                  background: C.panel, border: `1px solid ${C.panelEdge}`,
                  opacity: q, transform: `translateY(${(1 - q) * 26}px)` }}>
                  <div style={{ fontFamily: F.mono, fontSize: 15, color: C.faint,
                    letterSpacing: "0.24em", marginBottom: 14 }}>{String(i + 1).padStart(2, "0")}</div>
                  <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 34,
                    color: i === p.highlight ? C.cyan : C.text, lineHeight: 1.18 }}>{ln}</div>
                </div>
              );
            })}
          </div>
          {p.note ? <Label text={p.note} color={C.amber} size={20} /> : null}
        </Wrap>
      );
    }

    case "table": {
      const rows = lines;
      return (
        <Wrap>
          <Kicker text={p.head ?? "TABLE 3 · RESPONSE TIME"} />
          <div style={{ width: 1500, border: `1px solid ${C.panelEdge}`, borderRadius: 16,
            background: "#0B0D14", overflow: "hidden" }}>
            {rows.map((ln, i) => {
              const q = ph(frame, d, 0.05 + i * 0.11, 0.34 + i * 0.11);
              const hi = i === p.highlight;
              const glow = hi ? 0.65 + 0.35 * Math.sin(frame / 9) : 1;
              return (
                <div key={ln} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "19px 34px", borderBottom: i < rows.length - 1 ? `1px solid ${C.panelEdge}` : "none",
                  background: hi ? "rgba(34,211,238,0.12)" : "transparent",
                  opacity: q * glow, transform: `translateX(${(1 - q) * 26}px)` }}>
                  <span style={{ fontFamily: F.mono, fontSize: 27, color: hi ? C.cyan : C.text }}>{ln}</span>
                  <span style={{ fontFamily: F.mono, fontSize: 29, color: hi ? C.amber : C.dim }}>
                    {a.split("|")[i] ?? ""}
                  </span>
                </div>
              );
            })}
          </div>
          {p.note ? <Label text={p.note} color={C.amber} size={20} /> : null}
        </Wrap>
      );
    }

    case "versus":
      return (
        <Wrap>
          <Kicker text={p.head ?? "READ THE ROW LABELS"} />
          <div style={{ display: "flex", alignItems: "center", gap: 70 }}>
            <div style={{ opacity: ph(frame, d, 0.05, 0.45) }}>
              <Figure value={a} label={p.note ?? "ROW A"} color={C.red} size={140} />
            </div>
            <div style={{ fontFamily: F.sans, fontSize: 70, color: C.faint, opacity: ph(frame, d, 0.4, 0.7) }}>vs</div>
            <div style={{ opacity: ph(frame, d, 0.45, 0.9) }}>
              <Figure value={b} label={lines[0] ?? "ROW B"} color={C.cyan} size={140} />
            </div>
          </div>
          <Bar p={lin(frame, d, 0.1, 0.95)} color={C.amber} w={1200} />
        </Wrap>
      );

    case "label":
      return (
        <Wrap>
          <Kicker text={p.head ?? "THE BASELINE ROW"} />
          <div style={{ fontFamily: F.mono, fontSize: 56, letterSpacing: "0.02em", color: C.text,
            opacity: ph(frame, d, 0.1, 0.5), textAlign: "center" }}>
            {a}
          </div>
          <div style={{ width: 700, height: 3, background: C.cyan,
            transform: `scaleX(${lin(frame, d, 0.4, 0.95)})`, transformOrigin: "left" }} />
          <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 76, color: C.cyan,
            opacity: ph(frame, d, 0.55, 0.95), textAlign: "center" }}>
            {b}
          </div>
          {lines.map((ln, i) => (
            <div key={ln} style={{ fontFamily: F.mono, fontSize: 24, color: C.dim,
              opacity: ph(frame, d, 0.7 + i * 0.08, 0.9 + i * 0.06) }}>{ln}</div>
          ))}
        </Wrap>
      );

    case "calc":
      return (
        <Wrap>
          <Kicker text={p.head ?? "OUR ARITHMETIC"} />
          <div style={{ transform: `translateY(${drift * 0.6}px)` }}>
            <Equation parts={lines.map((t, i) => ({ text: t,
              color: i === p.highlight ? C.cyan : i === 0 ? C.dim : C.text }))} size={52} />
          </div>
          {p.note ? <Label text={p.note} color={C.amber} size={20} /> : null}
          <Bar p={lin(frame, d, 0.1, 0.95)} color={C.cyan} w={1100} />
        </Wrap>
      );

    case "version": {
      const cards = [a, b];
      return (
        <Wrap>
          <Kicker text={p.head ?? "TWO VERSIONS · ONE PAPER"} />
          <div style={{ display: "flex", gap: 40 }}>
            {cards.map((cd, i) => {
              const q = ph(frame, d, 0.08 + i * 0.3, 0.42 + i * 0.3);
              return (
                <div key={cd} style={{ width: 640, padding: "34px 36px", borderRadius: 18,
                  background: C.panel,
                  border: `1px solid ${i === 1 ? C.cyan : C.panelEdge}`,
                  opacity: q, transform: `translateY(${(1 - q) * 28}px)` }}>
                  <div style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: "0.26em",
                    color: i === 1 ? C.cyan : C.amber, marginBottom: 20 }}>
                    {i === 0 ? "v1 · DEC 2024" : "v2 · FEB 2025 · PUBLISHED"}
                  </div>
                  <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 40,
                    lineHeight: 1.2, color: C.text }}>{cd}</div>
                  <div style={{ marginTop: 22, fontFamily: F.mono, fontSize: 20, color: C.dim }}>
                    {lines[i] ?? ""}
                  </div>
                </div>
              );
            })}
          </div>
          {p.note ? <Label text={p.note} color={C.amber} size={20} /> : null}
        </Wrap>
      );
    }

    case "code":
      return (
        <Wrap>
          <Kicker text={p.head ?? "THE SOURCE"} />
          <div style={{ transform: `translateY(${drift * 0.4}px)` }}>
            <Code lines={lines} highlight={p.highlight ?? -1} size={30} />
          </div>
          {p.note ? <Label text={p.note} color={C.amber} size={20} /> : null}
        </Wrap>
      );

    case "size": {
      const items = lines;
      const max = 16;
      return (
        <Wrap>
          <Kicker text={p.head ?? "WHERE THE CACHE LIVES"} />
          <div style={{ display: "flex", flexDirection: "column", gap: 30, width: 1300 }}>
            {items.map((ln, i) => {
              const val = [11, 16][i] ?? 11;
              const q = lin(frame, d, 0.1 + i * 0.18, 0.72 + i * 0.12);
              return (
                <div key={ln} style={{ opacity: q }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    fontFamily: F.mono, fontSize: 26, color: i === 0 ? C.cyan : C.violet, marginBottom: 12 }}>
                    <span>{ln}</span><span>{val} GB</span>
                  </div>
                  <Bar p={(val / max) * q} color={i === 0 ? C.cyan : C.violet} w={1300} h={38} />
                </div>
              );
            })}
          </div>
          {p.note ? <Label text={p.note} color={C.amber} size={20} /> : null}
        </Wrap>
      );
    }

    case "caveat":
      return (
        <Wrap>
          <Kicker text={p.head ?? "CLAIM AND REALITY"} />
          <div style={{ transform: `translateY(${drift * 0.5}px)` }}>
            <Caveat claim={p.claim ?? a} reality={p.reality ?? b} />
          </div>
          {p.note ? <Label text={p.note} color={C.amber} size={20} /> : null}
        </Wrap>
      );

    case "end":
      return (
        <Wrap>
          <EndCard title={a} sub={b} cta={p.note ?? "READ THE TABLE"} />
          <div style={{ fontFamily: F.mono, fontSize: 18, color: C.faint,
            opacity: ph(frame, d, 0.6, 0.95) }}>
            {lines.join("  ·  ")}
          </div>
        </Wrap>
      );

    default:
      return <Wrap><Statement lines={lines} /></Wrap>;
  }
};
