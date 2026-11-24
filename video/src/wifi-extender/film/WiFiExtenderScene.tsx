import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../../theme";
import { FILM, Ground, Kicker, Statement } from "../../kit/film";
import { lin, ph, prog } from "../../kit/core";

type Kind = "title" | "quote" | "mechanism" | "physics" | "airtime" | "intlinks";

export interface WiFiExtenderSceneProps {
  kind: Kind;
  lines?: string[];
  note?: string;
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

const TextHead: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ fontFamily: F.mono, fontSize: 26, letterSpacing: "0.2em", color: C.amber, marginBottom: 18 }}>
    {text}
  </div>
);

export const WiFiExtenderScene: React.FC<WiFiExtenderSceneProps> = (p) => {
  const frame = useCurrentFrame();

  const TitleCard: React.FC = () => (
    <div style={{ textAlign: "center", fontFamily: F.sans, fontWeight: 700, fontSize: 44,
      lineHeight: 1.15, maxWidth: 1450, opacity: prog(frame, 0.1, 16), color: C.text }}>
      {(p.lines ?? []).map((l, i) => (
        <div key={i} style={{ color: i === (p.lines ?? []).length - 1 ? C.amber : C.text }}>{l}</div>
      ))}
    </div>
  );

  switch (p.kind) {
    case "title":
      return <Wrap><Kicker text={p.note ?? "DOES A WI-FI EXTENDER MAKE WI-FI SLOWER?"} /><TitleCard /></Wrap>;

    case "quote":
      return (
        <Wrap>
          <Kicker text="THE BREAK" />
          <div style={{ maxWidth: 1500, fontFamily: F.sans, fontSize: 48, fontWeight: 700,
            lineHeight: 1.2, textAlign: "center", color: C.text, opacity: prog(frame, 0.1, 14) }}>
            {(p.lines ?? []).slice(0, 2)}
          </div>
        </Wrap>
      );

    case "mechanism":
      return (
        <Wrap>
          <Kicker text="THE MECHANISM — WI-FI IS HALF-DUPLEX" />
          <div style={{ fontFamily: F.sans, fontSize: 44, fontWeight: 700, lineHeight: 1.25,
            textAlign: "center", maxWidth: 1300, color: C.text }}>
            <div>One radio can't transmit and receive on the same channel at the same time.</div>
            <div style={{ color: C.amber }}>So every relayed frame crosses the air twice.</div>
          </div>
        </Wrap>
      );

    case "physics":
      return (
        <Wrap>
          <Kicker text="WHERE THE SLOWDOWN HAPPENS" />
          <div style={{ width: 1300, borderRadius: 14, background: C.panel, border: `1px solid ${C.panelEdge}`,
            padding: "32px 38px", fontFamily: F.mono, fontSize: 24, color: C.text,
            opacity: ph(frame, 420, 0.04, 0.6) }}>
            {(p.lines ?? []).map((l, i) => (
              <div key={i} style={{ color: i === 0 ? C.amber : C.text }}>{l}</div>
            ))}
          </div>
        </Wrap>
      );

    case "airtime": {
      const d = 600;
      const t = (frame * 0.5) % (d * 2);
      const x = t <= d ? t : 2 * d - t; // 0..d..0
      const fraction = x / d;
      return (
        <Wrap>
          <Kicker text="ONE FRAME, TWO JOURNEYS" />
          <div style={{ width: 1340, display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ height: 12, borderRadius: 6, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
              <div style={{ width: `${fraction * 50}%`, height: 12, background: C.cyan }} />
            </div>
            <div style={{ height: 12, borderRadius: 6, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
              <div style={{ width: `${fraction * 50}%`, height: 12, background: C.amber, marginLeft: `${50}%` }} />
            </div>
            <div style={{ marginTop: 24, fontFamily: F.mono, fontSize: 22, color: C.dim }}>
              {"~half the rate at best — the extender cannot talk and listen at the same time."}
            </div>
          </div>
        </Wrap>
      );
    }

    case "intlinks":
      return (
        <Wrap>
          <Kicker text="WHAT IT DOESN'T DO" />
          <div style={{ fontFamily: F.sans, fontSize: 40, fontWeight: 700, lineHeight: 1.3,
            textAlign: "center", maxWidth: 1280, color: C.text,
            opacity: prog(frame, 0.15, 14) }}>
            <div>It doesn't increase your internet speed.</div>
            <div style={{ color: C.amber }}>It is a spot-fix for a dead zone.</div>
          </div>
          {p.note ? <div style={{ fontFamily: F.mono, fontSize: 18, color: C.faint, marginTop: 10 }}>{p.note}</div> : null}
        </Wrap>
      );

    default:
      return <Wrap><TitleCard /></Wrap>;
  }
};

export { TextHead };
