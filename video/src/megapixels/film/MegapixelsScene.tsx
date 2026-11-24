import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../../theme";
import { FILM, Ground, Kicker, Statement } from "../../kit/film";
import { lin, ph, prog } from "../../kit/core";

type Kind = "title" | "sensor" | "grid" | "diffraction";

export interface MegapixelsSceneProps {
  kind: Kind;
  lines?: string[];
  note?: string;
  sizes?: { s: string; px: number; w: number; h: number }[];
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

export const MegapixelsScene: React.FC<MegapixelsSceneProps> = (p) => {
  const frame = useCurrentFrame();
  const d = Math.max(1, useVideoConfig().durationInFrames);

  const TitleCard: React.FC = () => (
    <div style={{ textAlign: "center", fontFamily: F.sans, fontWeight: 700, fontSize: 44,
      lineHeight: 1.15, maxWidth: 1450, opacity: prog(frame, 0.1, 16), color: C.text }}>
      {(p.lines ?? []).map((l, i) => <div key={i}>{l}</div>)}
    </div>
  );

  switch (p.kind) {
    case "title":
      return <Wrap><Kicker text="WHY ARE PHONE CAMERAS SO MANY MEGAPIXELS?" /><TitleCard /></Wrap>;

    case "sensor":
      return (
        <Wrap>
          <Kicker text="THE SENSOR SITE" />
          <div style={{ fontFamily: F.mono, fontSize: 26, color: C.amber, letterSpacing: "0.14em" }}>
            {p.lines?.[0] ?? ""}
          </div>
          <div style={{ marginTop: 22, width: 400, height: 34, borderRadius: 8,
            background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center",
            justifyContent: "center", fontFamily: F.mono, fontSize: 26, color: C.text,
            opacity: ph(frame, d, 0.3, 0.7) }}>
            {p.note ?? ""}
          </div>
        </Wrap>
      );

    case "grid": {
      const sizes = p.sizes ?? [];
      return (
        <Wrap>
          <Kicker text="PIXEL BINNING — 4×4 SITES → 1 PIXEL" />
          <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1320 }}>
            {sizes.map((s, i) => {
              const q = ph(frame, d, 0.05 + i * 0.14, 0.45 + i * 0.12);
              return (
                <div key={s.s} style={{ opacity: q, transform: `translateY(${(1 - q) * 20}px)` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 20, justifyContent: "center" }}>
                    <div style={{ fontFamily: F.mono, fontSize: 26, color: C.text }}>{s.s}</div>
                    <div style={{ width: 320, height: 52, background: C.panel, border: `1px solid ${C.panelEdge}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: F.mono, fontSize: 22, color: C.cyan }}>
                      {s.px.toLocaleString() + " pixels"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Wrap>
      );
    }

    case "diffraction":
      return (
        <Wrap>
          <Kicker text="IF YOU PUSH TO FULL RES" />
          <div style={{ fontFamily: F.sans, fontSize: 44, fontWeight: 700, lineHeight: 1.3,
            textAlign: "center", maxWidth: 1300, color: C.text }}>
            <div>Diffraction through the tiny lens blur tends to Merge neighbouring sites — accuracy claims need testing.</div>
            <div style={{ color: C.amber, marginTop: 10 }}>That part is "possible, not proven here".</div>
          </div>
        </Wrap>
      );

    default:
      return <Wrap><TitleCard /></Wrap>;
  }
};
