import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { CLAMP, FILM, prog } from "./kit";

/* Small shared primitives for the 16:9 film. The heavy lifting lives in kit.tsx;
   these are the pieces that more than one act needs. */

export const Split: React.FC<{
  left: React.ReactNode;
  right: React.ReactNode;
  gap?: number;
  align?: "center" | "flex-start";
}> = ({ left, right, gap = 76, align = "center" }) => (
  <div
    style={{
      display: "flex",
      alignItems: align,
      gap,
      width: FILM.safeW,
      justifyContent: "center",
    }}
  >
    <div style={{ flex: "0 0 auto" }}>{left}</div>
    <div style={{ flex: 1, minWidth: 0 }}>{right}</div>
  </div>
);

export const Stat: React.FC<{
  value: string;
  unit?: string;
  label?: string;
  color?: string;
  size?: number;
  at?: number;
}> = ({ value, unit, label, color = C.text, size = 150, at = 0 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 18);
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 24}px)` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: size,
            lineHeight: 0.9,
            letterSpacing: "-0.055em",
            color,
          }}
        >
          {value}
        </div>
        {unit ? <div style={{ fontFamily: F.mono, fontSize: 34, color: C.dim }}>{unit}</div> : null}
      </div>
      {label ? (
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 20,
            letterSpacing: "0.2em",
            color: C.faint,
            marginTop: 16,
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

export type Seg = { ms: number; color: string; label?: string; dim?: boolean };

export const Timeline: React.FC<{
  segs: Seg[];
  totalMs: number;
  width?: number;
  height?: number;
  at?: number;
  dur?: number;
  cursor?: boolean;
  axis?: boolean;
  axisLabel?: string;
}> = ({ segs, totalMs, width = FILM.safeW, height = 84, at = 0, dur = 34, cursor, axis, axisLabel }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, dur);
  const pos = interpolate(frame % 110, [0, 110], [0, 1], CLAMP);
  return (
    <div style={{ width }}>
      <div
        style={{
          position: "relative",
          width,
          height,
          borderRadius: 10,
          backgroundColor: "#0B0D14",
          border: `1px solid ${C.panelEdge}`,
          display: "flex",
          overflow: "hidden",
        }}
      >
        {segs.map((s, i) => (
          <div
            key={i}
            style={{
              width: (s.ms / totalMs) * width * p,
              height,
              backgroundColor: s.color,
              opacity: s.dim ? 0.3 : 1,
              borderRight: "1px solid rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                fontFamily: F.mono,
                fontSize: 17,
                color: "rgba(0,0,0,0.72)",
                letterSpacing: "0.08em",
                whiteSpace: "nowrap",
              }}
            >
              {s.label ?? ""}
            </span>
          </div>
        ))}
        {cursor ? (
          <div
            style={{
              position: "absolute",
              left: pos * width,
              top: -6,
              bottom: -6,
              width: 3,
              backgroundColor: "#fff",
              opacity: 0.6,
            }}
          />
        ) : null}
      </div>
      {axis ? (
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
          <span>{axisLabel ?? `${totalMs} ms`}</span>
        </div>
      ) : null}
    </div>
  );
};

export const CheckRow: React.FC<{
  n: number;
  text: string;
  detail?: string;
  color?: string;
  at?: number;
  dim?: boolean;
  state?: string;
}> = ({ n, text, detail, color = C.cyan, at = 0, dim, state }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 16);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 26,
        width: "100%",
        padding: "22px 28px",
        borderRadius: 16,
        backgroundColor: C.panel,
        border: `1px solid ${color}44`,
        opacity: (dim ? 0.32 : 1) * p,
        transform: `translateX(${(1 - p) * -28}px)`,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 14,
          backgroundColor: `${color}22`,
          border: `1px solid ${color}66`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: F.mono,
          fontSize: 26,
          color,
          flex: "0 0 auto",
        }}
      >
        {n}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: F.sans, fontSize: 34, fontWeight: 600, color: C.text, lineHeight: 1.25 }}>
          {text}
        </div>
        {detail ? (
          <div style={{ fontFamily: F.mono, fontSize: 19, color: C.faint, marginTop: 8, letterSpacing: "0.06em" }}>
            {detail}
          </div>
        ) : null}
      </div>
      {state ? (
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 18,
            letterSpacing: "0.18em",
            color,
            border: `1px solid ${color}55`,
            borderRadius: 8,
            padding: "8px 12px",
            flex: "0 0 auto",
          }}
        >
          {state}
        </div>
      ) : null}
    </div>
  );
};

export const Toggle: React.FC<{ on: boolean; at?: number; label?: string }> = ({ on, at = 0, label }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 14);
  const knob = on ? 44 : 4;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div
        style={{
          width: 104,
          height: 54,
          borderRadius: 30,
          padding: 5,
          boxSizing: "border-box",
          backgroundColor: on ? `${C.green}33` : "rgba(255,255,255,0.06)",
          border: `1px solid ${on ? C.green : C.panelEdge}`,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 5,
            left: 4 + knob * p,
            width: 44,
            height: 44,
            borderRadius: 24,
            backgroundColor: on ? C.green : C.faint,
          }}
        />
      </div>
      {label ? (
        <div style={{ fontFamily: F.mono, fontSize: 20, color: on ? C.green : C.faint, letterSpacing: "0.18em" }}>
          {label}
        </div>
      ) : null}
    </div>
  );
};

export const Note: React.FC<{ text: string; at?: number; width?: number }> = ({ text, at = 0, width }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        width,
        fontFamily: F.mono,
        fontSize: 19,
        color: C.faint,
        letterSpacing: "0.05em",
        lineHeight: 1.5,
        opacity: prog(frame, at, 16),
      }}
    >
      {text}
    </div>
  );
};

export const Rings: React.FC<{
  cx: number;
  cy: number;
  color: string;
  frame: number;
  max?: number;
  count?: number;
}> = ({ cx, cy, color, frame, max = 86, count = 3 }) => (
  <>
    {Array.from({ length: count }, (_, i) => {
      const r = 30 + ((frame * 1.6 + i * 26) % max);
      return (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={2}
          opacity={Math.max(0, 0.45 * (1 - r / (max + 30)))}
        />
      );
    })}
  </>
);
