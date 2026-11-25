import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../../theme";
import { FILM, Ground, Kicker, Statement } from "../../kit/film";
import { lin, ph, prog } from "../../kit/core";

type Kind = "title" | "quote" | "levels" | "destroy";

export interface QrSceneProps {
  kind: Kind;
  lines?: string[];
  note?: string;
  accent?: number;
  levels?: { label: string; pct: string; w: number; color: string }[];
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

export const QrScene: React.FC<QrSceneProps> = (p) => {
  const frame = useCurrentFrame();

  switch (p.kind) {
    case "title":
      return (
        <Wrap>
          <Kicker text="A QR CODE IS DESIGNED TO BE PARTLY DESTROYED." />
          <Statement lines={p.lines ?? []} />
        </Wrap>
      );

    case "quote":
      return (
        <Wrap>
          <Kicker text="THE MECHANISM" />
          <div style={{ fontFamily: F.sans, fontSize: 48, fontWeight: 700, lineHeight: 1.2,
            textAlign: "center", maxWidth: 1300, color: C.text, opacity: prog(frame, 0.1, 14) }}>
            {(p.lines ?? []).slice(0, 2)}
          </div>
          <div style={{ width: 900, height: 3, background: C.cyan,
            transform: `scaleX(${lin(frame, 420, 0.25, 0.95)})`, transformOrigin: "left" }} />
        </Wrap>
      );

    case "levels":
      return (
        <Wrap>
          <Kicker text="THE FOUR LEVELS — L, M, Q, H (ISO/IEC 18004)" />
          <div style={{ display: "flex", flexDirection: "column", gap: 22, width: 1180, marginTop: 8 }}>
            {p.levels?.map((lvl, i) => {
              const q = ph(frame, 420, 0.04 + i * 0.12, 0.45 + i * 0.12);
              return (
                <div key={lvl.label} style={{ display: "flex", alignItems: "center", gap: 22,
                  opacity: q, transform: `translateX(${(1 - q) * 26}px)` }}>
                  <div style={{ fontFamily: F.mono, fontSize: 24, color: C.text, minWidth: 90 }}>{lvl.label}</div>
                  <div style={{ width: 880, height: 10, borderRadius: 5, background: C.panelEdge, overflow: "hidden" }}>
                    <div style={{ width: lvl.w, height: 10, background: lvl.color }} />
                  </div>
                  <div style={{ fontFamily: F.mono, fontSize: 24, color: C.amber }}>{lvl.pct}</div>
                </div>
              );
            })}
          </div>
        </Wrap>
      );

    case "destroy":
      return (
        <Wrap>
          <Kicker text="WHEN IT STILL DECODES — DESTRUCTION TOLERANCE" />
          <div style={{ fontFamily: F.sans, fontSize: 40, fontWeight: 700, lineHeight: 1.3,
            textAlign: "center", maxWidth: 1250, color: C.text, opacity: prog(frame, 0.15, 14) }}>
            Scratch a code, ring a coffee stain, splatter an ink blob — the scanner reconstructs it.
            That is the design: RS restores the lost data.
          </div>
        </Wrap>
      );

    default:
      return <Wrap><Statement lines={p.lines ?? []} /></Wrap>;
  }
};
