import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { CLAMP, ease, prog } from "./core";

/* The old film kit exported these too, and the shipped act files import them
   from it. Same values, now sourced from the shared core. */
export { CLAMP, ease, prog, wobble } from "./core";

/* The canonical landscape kit, for 1920x1080 video.
 *
 * It used to live at src/wifi/film/kit.tsx, which made it look like the Wi-Fi
 * film's private toolbox. It is not: it is the 16:9 kit, and every long-form
 * video uses it. The file was moved here verbatim — same values, same pixels —
 * and the old path now re-exports this one so no shipped video changed.
 *
 * The vertical short has its own kit (kit/scene.tsx) because 1080-wide geometry
 * does not transfer to 16:9. Both kits share the timing core in kit/core.tsx.
 */

export const FILM = {
  w: 1920,
  h: 1080,
  pad: 120,
  safeW: 1680,
  body: 38,
  lead: 50,
  statement: 84,
  hook: 132,
  mono: 22,
};

export const Ground: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 320) * 60;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.026) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(255,255,255,0.026) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          maskImage: "radial-gradient(ellipse 70% 80% at 50% 45%, black 10%, transparent 92%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 80% at 50% 45%, black 10%, transparent 92%)",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 620px at ${380 + drift}px 40px, rgba(34,211,238,0.14), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(820px 560px at ${1560 - drift}px 1040px, rgba(167,139,250,0.14), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: "radial-gradient(130% 120% at 50% 50%, transparent 42%, rgba(0,0,0,0.66) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const Stage: React.FC<{ children: React.ReactNode; pad?: number }> = ({
  children,
  pad = FILM.pad,
}) => (
  <AbsoluteFill
    style={{
      padding: pad,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    {children}
  </AbsoluteFill>
);

export const Kicker: React.FC<{ text: string; at?: number }> = ({ text, at = 0 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 14);
  return (
    <div
      style={{
        fontFamily: F.mono,
        fontSize: FILM.mono,
        letterSpacing: "0.34em",
        color: C.faint,
        opacity: p,
        marginBottom: 28,
      }}
    >
      {text}
    </div>
  );
};

/** The recurring airtime motif: a bar that only ever fills, never resets.
 *  Every act updates it, so the film has one continuous measurement running
 *  underneath it. */
export const AirtimeRail: React.FC<{ used: number; label?: string; at?: number }> = ({
  used,
  label,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const target = Math.max(0, Math.min(1, used));
  const fill = interpolate(frame - at, [0, 40], [0, target], { ...CLAMP, easing: ease });
  return (
    <div
      style={{
        position: "absolute",
        left: FILM.pad,
        right: FILM.pad,
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
        {label ?? "AIRTIME SPENT"}
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
            backgroundColor: C.amber,
            opacity: 0.85,
          }}
        />
      </div>
      <div style={{ fontFamily: F.mono, fontSize: 17, color: C.amber, width: 62, textAlign: "right" }}>
        {Math.round(fill * 100)}%
      </div>
    </div>
  );
};

/* ---------------- text ---------------- */

export const Statement: React.FC<{
  lines: string[];
  accent?: number;
  sub?: string;
  size?: number;
  align?: "left" | "center";
  at?: number;
}> = ({ lines, accent = -1, sub, size = FILM.statement, align = "center", at = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        textAlign: align,
        maxWidth: FILM.safeW,
      }}
    >
      {lines.map((line, i) => {
        const s = spring({
          frame: frame - at - i * 7,
          fps,
          config: { damping: 18, stiffness: 110 },
        });
        return (
          <div
            key={line}
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: size,
              lineHeight: 1.06,
              letterSpacing: "-0.045em",
              color: i === accent ? C.cyan : C.text,
              opacity: Math.max(0, Math.min(1, s)),
              transform: `translateY(${(1 - s) * 30}px)`,
            }}
          >
            {line}
          </div>
        );
      })}
      {sub ? (
        <div
          style={{
            fontFamily: F.sans,
            fontSize: FILM.lead,
            color: C.dim,
            marginTop: 34,
            opacity: prog(frame, at + 26, 16),
            lineHeight: 1.35,
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};

/* ---------------- bars ---------------- */

export const CompareBar: React.FC<{
  label: string;
  value: string;
  fraction: number;
  color: string;
  at?: number;
  dur?: number;
  width?: number;
  height?: number;
  note?: string;
}> = ({ label, value, fraction, color, at = 0, dur = 34, width = FILM.safeW, height = 64, note }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, dur);
  return (
    <div style={{ width }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontFamily: F.mono,
          fontSize: 24,
          marginBottom: 12,
          color,
        }}
      >
        <span style={{ letterSpacing: "0.16em" }}>{label}</span>
        <span style={{ fontSize: 30 }}>{value}</span>
      </div>
      <div
        style={{
          width,
          height,
          borderRadius: 10,
          backgroundColor: "#0B0D14",
          border: `1px solid ${C.panelEdge}`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: Math.max(3, width * fraction * p),
            height,
            backgroundColor: color,
            borderRadius: 9,
          }}
        />
      </div>
      {note ? (
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 19,
            color: C.faint,
            marginTop: 10,
            opacity: prog(frame, at + dur, 14),
          }}
        >
          {note}
        </div>
      ) : null}
    </div>
  );
};

/* ---------------- ledger ---------------- */

export type Slot = { who: string; ms: number; color: string };

export const Ledger: React.FC<{
  slots: Slot[];
  totalMs: number;
  at?: number;
  cursor?: boolean;
  highlight?: number;
}> = ({ slots, totalMs, at = 0, cursor, highlight = -1 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 30);
  return (
    <div style={{ width: FILM.safeW }}>
      <div
        style={{
          position: "relative",
          width: FILM.safeW,
          height: 96,
          borderRadius: 10,
          backgroundColor: "#0B0D14",
          border: `1px solid ${C.panelEdge}`,
          display: "flex",
          overflow: "hidden",
        }}
      >
        {slots.map((s, i) => (
          <div
            key={`${s.who}-${i}`}
            style={{
              width: (s.ms / totalMs) * FILM.safeW * p,
              height: 96,
              backgroundColor: s.color,
              opacity: highlight === -1 || highlight === i ? 1 : 0.28,
              borderRight: `1px solid rgba(0,0,0,0.35)`,
            }}
          />
        ))}
        {cursor ? (
          <div
            style={{
              position: "absolute",
              left: `${(frame % 60) / 60 * 100}%`,
              top: 0,
              bottom: 0,
              width: 3,
              backgroundColor: "#fff",
              opacity: 0.55,
            }}
          />
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: F.mono,
          fontSize: 18,
          color: C.faint,
          marginTop: 10,
        }}
      >
        <span>0 ms</span>
        <span>{totalMs} ms</span>
      </div>
    </div>
  );
};

/* ---------------- panel ---------------- */

export const Panel: React.FC<{
  children: React.ReactNode;
  at?: number;
  width?: number;
  accent?: string;
  style?: React.CSSProperties;
}> = ({ children, at = 0, width = FILM.safeW, accent, style }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 16);
  return (
    <div
      style={{
        width,
        padding: "34px 40px",
        borderRadius: 20,
        backgroundColor: C.panel,
        border: `1px solid ${accent ? accent : C.panelEdge}`,
        opacity: p,
        transform: `translateY(${(1 - p) * 22}px)`,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Label: React.FC<{ text: string; color?: string; size?: number }> = ({
  text,
  color = C.faint,
  size = 22,
}) => (
  <div
    style={{
      fontFamily: F.mono,
      fontSize: size,
      letterSpacing: "0.26em",
      color,
    }}
  >
    {text}
  </div>
);
