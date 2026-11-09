import React from "react";
import { AbsoluteFill, spring, useCurrentFrame } from "remotion";
import { C, F } from "./theme";

/* Shared episode chrome. Every episode imports these so the visual language
   stays identical across the series — only the scenes differ. */

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 140) * 50;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.028) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(255,255,255,0.028) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse 85% 75% at 50% 45%, black 15%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 75% at 50% 45%, black 15%, transparent 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(820px 560px at ${560 + drift}px 200px, rgba(34,211,238,0.15), transparent 72%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(760px 540px at ${1360 - drift}px 860px, rgba(167,139,250,0.15), transparent 72%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: "radial-gradient(120% 105% at 50% 50%, transparent 38%, rgba(0,0,0,0.62) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const Kicker: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const s = spring({ frame, fps: 30, config: { damping: 200 } });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity: s,
        transform: `translateY(${(1 - s) * 14}px)`,
      }}
    >
      <div style={{ width: 8, height: 8, borderRadius: 8, backgroundColor: C.cyan }} />
      <div style={{ fontFamily: F.mono, fontSize: 19, letterSpacing: "0.26em", color: C.dim }}>
        {text}
      </div>
    </div>
  );
};

export const Caption: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const s = spring({ frame: frame - 6, fps: 30, config: { damping: 200 } });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 64,
        display: "flex",
        justifyContent: "center",
        opacity: s,
        transform: `translateY(${(1 - s) * 12}px)`,
      }}
    >
      <div
        style={{
          fontFamily: F.sans,
          fontSize: 30,
          color: C.text,
          backgroundColor: "rgba(8,9,13,0.72)",
          border: `1px solid ${C.panelEdge}`,
          borderRadius: 12,
          padding: "14px 26px",
          maxWidth: 1320,
          textAlign: "center",
          lineHeight: 1.35,
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const Stage: React.FC<{ children: React.ReactNode; caption?: string }> = ({
  children,
  caption,
}) => (
  <AbsoluteFill style={{ padding: 96, justifyContent: "center" }}>
    {children}
    {caption ? <Caption text={caption} /> : null}
  </AbsoluteFill>
);

export const Watermark: React.FC<{ text: string }> = ({ text }) => (
  <AbsoluteFill
    style={{
      position: "absolute",
      top: 48,
      right: 72,
      justifyContent: "flex-start",
      alignItems: "flex-end",
    }}
  >
    <div style={{ fontFamily: F.mono, fontSize: 14, letterSpacing: "0.24em", color: C.faint }}>
      {text}
    </div>
  </AbsoluteFill>
);

/* Deterministic pseudo-random in [0,1). No Math.random: every render of the
   same frame must produce identical pixels. */
export const wobble = (seed: number, t: number): number => {
  const x = Math.sin(seed * 12.9898 + Math.floor(t) * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
