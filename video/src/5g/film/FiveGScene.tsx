import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../../theme";
import { FILM, Ground, Kicker, Statement } from "../../kit/film";
import { Caveat } from "../../kit/scenes";
import { lin, ph, prog } from "../../kit/core";

type Kind = "title" | "quote" | "statechart" | "table" | "note";

export interface FiveGSceneProps {
  kind: Kind;
  lines?: string[];
  note?: string;
  states?: { label: string; cost: string; color?: string }[];
  metric?: string;
  sub?: string;
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
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 30,
        padding: `0 ${FILM.pad}px 96px`, boxSizing: "border-box",
        transform: `scale(${zoom}) translate(${driftX}px, ${driftY}px)`, transformOrigin: "center center" }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};

export const FiveGScene: React.FC<FiveGSceneProps> = (p) => {
  const frame = useCurrentFrame();

  const TitleCard: React.FC<{ head?: string; lines: string[] }> = ({ head, lines }) => (
    <div style={{ textAlign: "center", fontFamily: F.sans, fontWeight: 700, fontSize: 44,
      lineHeight: 1.15, maxWidth: 1450, opacity: prog(frame, 0.1, 16), color: C.text }}>
      {head ? <div style={{ color: C.dim, marginBottom: 16 }}>{head}</div> : null}
      {lines.map((l, i) => <div key={i} style={{ color: i === lines.length - 1 ? C.amber : C.text }}>{l}</div>)}
    </div>
  );

  switch (p.kind) {
    case "title":
      return (
        <Wrap>
          <Kicker text="DOES 5G DRAIN BATTERY?" />
          <div style={{ transform: `translateY(${Math.sin(frame / 24) * 3}px)` }}>
            <TitleCard lines={p.lines ?? []} />
          </div>
        </Wrap>
      );

    case "quote":
      return (
        <Wrap>
          <Kicker text="THE BREAK" />
          <div style={{ maxWidth: 1500, fontFamily: F.sans, fontSize: 48, fontWeight: 700,
            lineHeight: 1.2, textAlign: "center", color: C.text,
            opacity: prog(frame, 0.1, 14) }}>
            {(p.lines ?? []).slice(0, 2)}
          </div>
          <div style={{ width: 900, height: 3, background: C.cyan,
            transform: `scaleX(${lin(frame, 420, 0.25, 0.95)})`, transformOrigin: "left" }} />
        </Wrap>
      );

    case "statechart": {
      const states = p.states ?? [];
      return (
        <Wrap>
          <Kicker text="WHERE THE DRAIN IS — THE RRC STATE MACHINE" />
          <div style={{ display: "flex", flexDirection: "column", gap: 22, width: 1180 }}>
            {states.map((s, i) => {
              const q = ph(frame, 420, 0.05 + i * 0.14, 0.5 + i * 0.1);
              return (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 22,
                  opacity: q, transform: `translateX(${(1 - q) * 24}px)` }}>
                  <div style={{ width: 280, height: 34, borderRadius: 8,
                    background: "rgba(255,255,255,0.08)", fontFamily: F.mono, fontSize: 26,
                    color: C.text, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {s.label}
                  </div>
                  <div style={{ flex: 1, height: 10, borderRadius: 5, background: C.panelEdge, overflow: "hidden" }}>
                    <div style={{ width: `${lin(frame, 420, 0.06 + i * 0.14, 0.8) * 100}%`,
                      height: 10, background: s.color ?? C.cyan }} />
                  </div>
                  <div style={{ fontFamily: F.mono, fontSize: 26, color: s.color ?? C.amber, width: 110 }}>
                    {s.cost}
                  </div>
                </div>
              );
            })}
          </div>
        </Wrap>
      );
    }

    case "table":
      return (
        <Wrap>
          <Kicker text="MEASURED POWER DURING RRC TRANSITIONS — SIGCOMM 2021, Table 2" />
          <div style={{ display: "flex", flexDirection: "column", gap: 26, width: 1180, marginTop: 24 }}>
            {["T-Mobile 4G — 66 mW", "T-Mobile 5G low-band — 260 mW", "Verizon 5G mmWave — 1092 mW", "4G→5G switch — 1494 mW"].map((label, i) => {
              const q = ph(frame, 480, 0.05 + i * 0.12, 0.4 + i * 0.12);
              return (
                <div key={label} style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "center", gap: 26, opacity: q,
                  transform: `translateX(${(1 - q) * 26}px)` }}>
                  <div style={{ fontFamily: F.mono, fontSize: 24, color: C.text }}>{label}</div>
                  <div style={{ width: 900, height: 10, borderRadius: 5, background: C.panelEdge, overflow: "hidden" }}>
                    <div style={{ width: `${lin(frame, 420, 0.1 + i * 0.12, 0.75) * 100}%`,
                      height: 10, background: C.cyan }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Wrap>
      );

    case "note":
      return (
        <Wrap>
          <Caveat claim={(p.lines ?? [""])[0] ?? ""} reality={(p.lines ?? ["", ""])[1] ?? ""} />
          {p.note ? <Kicker text={p.note} /> : null}
        </Wrap>
      );

    default:
      return <Wrap><TitleCard lines={p.lines ?? []} /></Wrap>;
  }
};
