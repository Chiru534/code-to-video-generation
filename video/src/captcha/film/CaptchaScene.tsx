import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../../theme";
import { FILM, Ground, Label, Kicker, Statement } from "../../kit/film";
import { Caveat } from "../../kit/scenes";
import { lin, ph, prog } from "../../kit/core";

/* The visual system for "why are captchas so hard". One component, many
 * kinds, all driven by FRACTIONS of the scene (ph/lin) because narration
 * lengths drift between renders. */

type Kind = "title" | "quote" | "grid" | "pipeline" | "timeline" | "note";

export interface CaptchaSceneProps {
  kind: Kind;
  lines?: string[];
  note?: string;
  accent?: number;
  highlight?: number;
  timeline?: { t: string; what: string }[];
}

const Wrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const d = Math.max(1, durationInFrames);
  const p = frame / d;
  const zoom = 1.0 + p * 0.06;
  const driftY = (p - 0.5) * -32;
  const driftX = Math.sin(p * Math.PI * 2) * 18;
  const gridPos = (frame * 1.5) % 96;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Ground />
      {/* Moving technical grid, strictly in the safe area (masked). */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          backgroundPosition: `${gridPos}px ${gridPos}px`,
          maskImage: "radial-gradient(ellipse 100% 100% at 50% 50%, black 0%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 100% 100% at 50% 50%, black 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 30,
          padding: `0 ${FILM.pad}px 96px`, boxSizing: "border-box",
          transform: `scale(${zoom}) translate(${driftX}px, ${driftY}px)`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

export const CaptchaScene: React.FC<CaptchaSceneProps> = (p) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 24) * 3;

  const QuoteCard: React.FC<{ text: string; accent?: boolean; sub?: string }> = ({ text, accent = false, sub }) => (
    <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 42, lineHeight: 1.2,
      textAlign: "center", color: accent ? C.amber : C.text }}>
      {text}
      {sub ? <div style={{ marginTop: 12, fontSize: 30, color: C.dim }}>{sub}</div> : null}
    </div>
  );

  switch (p.kind) {
    case "title":
      return (
        <Wrap>
          <Kicker text="WHY ARE CAPTCHAS SO HARD?" />
          <div style={{ transform: `translateY(${drift}px)` }}>
            <Statement lines={p.lines ?? []} sub={p.note} />
          </div>
        </Wrap>
      );

    case "quote":
      return (
        <Wrap>
          <Kicker text="WHAT YOU ARE ACTUALLY DOING" />
          <div style={{ maxWidth: 1550, textAlign: "center", fontFamily: F.sans,
            fontSize: 48, lineHeight: 1.15, fontWeight: 700, color: C.text,
            opacity: prog(frame, 0.1, 14), transform: `translateY(${drift}px)` }}>
            {p.lines?.slice(0, 1)}
            {p.lines && p.lines[1] ? (
              <div style={{ marginTop: 20, fontSize: 30, color: C.dim }}>{p.lines[1]}</div>
            ) : null}
          </div>
          <div style={{ width: 900, height: 3, background: C.cyan,
            transform: `scaleX(${lin(frame, Math.max(1, useVideoConfig().durationInFrames), 0.25, 0.95)})`,
            transformOrigin: "left" }} />
        </Wrap>
      );

    case "grid":
      return (
        <Wrap>
          <Kicker text="THE PAIR YOU ANSWER" />
          <div style={{ display: "flex", gap: 30 }}>
            <QuoteCard text="KNOWN CONTROL" accent sub="already answered by the system" />
            <QuoteCard text="UNKNOWN WORD" accent />
          </div>
          <div style={{ marginTop: 36 }}>
            <p style={{ fontFamily: F.mono, fontSize: 22, color: C.dim }}>
              your human test rides on the first one
            </p>
            <p style={{ fontFamily: F.mono, fontSize: 22, color: C.dim, marginTop: 8 }}>
              your typed word becomes the training data
            </p>
          </div>
        </Wrap>
      );

    case "pipeline":
      return (
        <Wrap>
          <Kicker text="HOW THE WORDS WERE MADE — OCR + HUMAN INPUT" />
          <div style={{ display: "flex", alignItems: "center", gap: 26, width: 1500 }}>
            {["SCANNED PAGES", "OCR FAILS", "TWO WORDS PAIRED", "CONTROL + UNKNOWN", "HUMANS TYPE IT", "SYSTEM VOTES"].map((step, i) => (
              <React.Fragment key={i}>
                <div style={{ width: 170, height: 90, borderRadius: 14, display: "flex",
                  alignItems: "center", justifyContent: "center", background: C.panel,
                  border: `1px solid ${C.panelEdge}`,
                  opacity: ph(frame, 480, 0.05 + i * 0.12, 0.2 + i * 0.12),
                  transform: `translateY(${(1 - ph(frame, 480, 0.05 + i * 0.12, 0.2 + i * 0.12)) * 18}px)` }}>
                  <div style={{ fontFamily: F.mono, fontSize: 19, color: C.text, textAlign: "center", padding: 10 }}>{step}</div>
                </div>
                {i < 5 ? <div style={{ color: C.faint, fontSize: 28 }}>→</div> : null}
              </React.Fragment>
            ))}
          </div>
        </Wrap>
      );

    case "timeline":
      return (
        <Wrap>
          <Kicker text="DIGITIZATION, WHEN IT STARTED" />
          <div style={{ display: "flex", flexDirection: "column", gap: 26, width: 1420 }}>
            {p.timeline?.map((row, i) => {
              const q = ph(frame, 420, 0.1 + i * 0.15, 0.55 + i * 0.1);
              return (
                <div key={row.t} style={{ display: "flex", alignItems: "center", gap: 18,
                  opacity: q, transform: `translateX(${(1 - q) * 20}px)` }}>
                  <div style={{ fontFamily: F.mono, fontSize: 24, color: C.amber, minWidth: 110 }}>{row.t}</div>
                  <div style={{ height: 8, flex: 1, background: C.panelEdge, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${lin(frame, 420, 0.1 + i * 0.15, 0.85) * 100}%`, height: 8,
                      background: C.cyan }} />
                  </div>
                  <div style={{ fontFamily: F.mono, fontSize: 24, color: C.text }}>{row.what}</div>
                </div>
              );
            })}
          </div>
        </Wrap>
      );

    case "note":
      return (
        <Wrap>
          <Caveat claim={p.lines?.[0] ?? ""} reality={p.lines?.[1] ?? ""} />
          {p.note ? <Label text={p.note} color={C.amber} size={20} /> : null}
        </Wrap>
      );

    default:
      return <Wrap><Statement lines={p.lines ?? []} /></Wrap>;
  }
};

