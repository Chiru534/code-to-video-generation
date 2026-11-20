import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, F } from "../theme";
import { clamp01, spring } from "./world";
import { lin, ph, rnd } from "./core";

/* The shared visual grammar of the "hidden story" videos.
 *
 * WHY: three winning channels use the same frame — a blurred full-bleed copy
 * of the image, a sharp vertical centre panel, a cream assertion with an
 * italic reversal, and one burned-in word. The character is a code-drawn wolf
 * so it stays deterministic: no AI video, no external asset, no drift.
 *
 * The wolf is NOT the lever. The clone channels copied it at 10,000x fewer
 * views. It is here as a recognition mark, nothing more. The reversal in the
 * title and the six-beat narration are the actual product.
 */

/* ------------------------------------------------------------------ */
/* the recurring character — pure geometry, no assets                    */
/* ------------------------------------------------------------------ */

export const Wolf: React.FC<{
  x?: number;
  y?: number;
  size?: number;
  pointing?: number;
  seed?: number;
}> = ({ x = 0, y = 0, size = 300, pointing = 0, seed = 3 }) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 26 + seed) * 5;
  const blink = f % 190 > 184 ? 0.12 : 1;
  const paw = clamp01(pointing);
  const s = size / 300;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + bob,
        width: 300 * s,
        height: 330 * s,
        transform: `scale(${s})`,
        transformOrigin: "top left",
      }}
    >
      <svg viewBox="0 0 300 330" width="300" height="330">
        <defs>
          <linearGradient id="wolfFur" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6B5B50" />
            <stop offset="100%" stopColor="#2A2422" />
          </linearGradient>
          <linearGradient id="wolfSuit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#23252D" />
            <stop offset="100%" stopColor="#0C0D12" />
          </linearGradient>
        </defs>
        {/* ears */}
        <path d="M52 126 L32 4 L134 86 Z" fill="url(#wolfFur)" stroke="#15120F" strokeWidth="5" />
        <path d="M248 126 L268 4 L166 86 Z" fill="url(#wolfFur)" stroke="#15120F" strokeWidth="5" />
        <path d="M60 112 L48 36 L110 90 Z" fill="#B07B63" opacity="0.75" />
        <path d="M240 112 L252 36 L190 90 Z" fill="#B07B63" opacity="0.75" />
        {/* head */}
        <ellipse cx="150" cy="150" rx="86" ry="80" fill="url(#wolfFur)" stroke="#15120F" strokeWidth="5" />
        <path d="M116 172 Q150 194 184 172 L172 218 Q150 232 128 218 Z" fill="#E8D8C6" opacity="0.95" />
        <path d="M96 180 Q150 246 204 180 Q190 230 150 238 Q110 230 96 180" fill="#E8D8C6" opacity="0.72" />
        {/* brow — the smirk lives here */}
        <path d="M92 124 Q116 108 142 126" stroke="#120F0D" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M158 126 Q184 108 208 124" stroke="#120F0D" strokeWidth="9" fill="none" strokeLinecap="round" />
        {/* half-lidded eyes */}
        <ellipse cx="118" cy="142" rx="17" ry={13 * blink} fill="#FBBF24" />
        <ellipse cx="182" cy="142" rx="17" ry={13 * blink} fill="#FBBF24" />
        <ellipse cx="122" cy="142" rx="6" ry={8 * blink} fill="#120F0D" />
        <ellipse cx="186" cy="142" rx="6" ry={8 * blink} fill="#120F0D" />
        {/* muzzle + nose */}
        <path d="M150 158 L136 184 Q150 194 164 184 Z" fill="#17130F" />
        <path d="M150 190 Q150 208 128 206 M150 190 Q150 208 172 206" stroke="#17130F" strokeWidth="5" fill="none" />
        {/* suit */}
        <path d="M34 330 Q42 242 108 222 L150 258 L192 222 Q258 242 266 330 Z" fill="url(#wolfSuit)" />
        <path d="M108 222 L150 258 L132 330 L88 246 Z" fill="#EDEFF5" />
        <path d="M192 222 L150 258 L168 330 L212 246 Z" fill="#EDEFF5" />
        <path d="M150 258 L142 276 L150 330 L158 276 Z" fill="#A4232C" />
        {/* pointing paw — animated by the beat */}
        <g transform={`translate(${paw * 26}, ${-paw * 16})`}>
          <path d="M196 288 Q238 274 252 244 L268 252 Q252 294 214 312 Z" fill="url(#wolfFur)" stroke="#15120F" strokeWidth="4" />
          <ellipse cx="266" cy="246" rx="15" ry="12" fill="#E8D8C6" stroke="#15120F" strokeWidth="3" />
          <path d="M258 240 L274 240" stroke="#15120F" strokeWidth="3" />
        </g>
      </svg>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* the frame template                                                    */
/* ------------------------------------------------------------------ */

export const ShortRitual: React.FC<{
  assertion: string;
  reversal: string;
  word?: string;
  kicker?: string;
  pointing?: number;
  wolf?: boolean;
  /* Scene props are data, not children: check_alignment.py requires every
   * scene node to be one self-closing <Short... /> line. */
  prop?: "ring" | "fact";
  factLabel?: string;
  factValue?: string;
  factNote?: string;
  seed?: number;
}> = ({
  assertion, reversal, word, kicker, pointing = 0, wolf = true,
  prop = "ring", factLabel, factValue, factNote, seed = 1,
}) => {
  const f = useCurrentFrame();
  const push = 1 + clamp01(f / 190) * 0.045;
  const sweep = ((f * 7) % 900) - 200;
  const panelOpacity = clamp01(f / 9);
  const content = (
    <AbsoluteFill style={{ transform: `scale(${push})` }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, #1C1A18 0%, #08090D 68%)" }} />
      {prop === "ring" ? <Ring /> : null}
      {prop === "fact" ? (
        <Fact label={factLabel ?? "THE FACT"} value={factValue ?? "—"} note={factNote} seed={seed} />
      ) : null}
      {wolf ? <Wolf x={520} y={1010} size={300} pointing={pointing} /> : null}
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: F.sans }}>
      {/* blurred full-bleed copy of the same frame */}
      <AbsoluteFill style={{ opacity: 0.4, filter: "blur(26px)", transform: "scale(1.25)" }}>
        {content}
      </AbsoluteFill>
      {/* sharp centre panel */}
      <AbsoluteFill style={{ opacity: panelOpacity }}>
        <div
          style={{
            position: "absolute",
            left: "10%",
            top: 0,
            width: "80%",
            height: "100%",
            overflow: "hidden",
            borderLeft: `2px solid ${C.panelEdge}`,
            borderRight: `2px solid ${C.panelEdge}`,
            background: "rgba(8,9,13,0.55)",
          }}
        >
          {content}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: sweep,
              width: 180,
              height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.06), transparent)",
            }}
          />
        </div>
      </AbsoluteFill>
      {/* the headline: assertion + reversal, like the winners */}
      <div
        style={{
          position: "absolute",
          top: 128,
          left: "12%",
          width: "76%",
          textAlign: "center",
          opacity: clamp01((f - 3) / 12),
          transform: `translateY(${(1 - clamp01((f - 3) / 12)) * 22}px)`,
        }}
      >
        {kicker ? (
          <div style={{ color: C.amber, fontSize: 30, letterSpacing: 6, fontWeight: 800, marginBottom: 18 }}>
            {kicker}
          </div>
        ) : null}
        <div style={{ color: C.text, fontSize: 80, lineHeight: 0.98, fontWeight: 900, letterSpacing: -2 }}>
          {assertion}
        </div>
        <div
          style={{
            color: C.amber,
            fontSize: 78,
            lineHeight: 1.02,
            fontStyle: "italic",
            fontWeight: 800,
            marginTop: 10,
          }}
        >
          {reversal}
        </div>
      </div>
      {word ? (
        <div
          style={{
            position: "absolute",
            bottom: 210,
            left: "12%",
            width: "76%",
            textAlign: "center",
            color: C.text,
            fontSize: 96,
            fontWeight: 900,
            textShadow: "0 4px 18px #000",
            opacity: clamp01((f - 8) / 10),
          }}
        >
          {word}
        </div>
      ) : null}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.72) 100%)" }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* the evidence cards — qualifier is always ON SCREEN next to the number */
/* ------------------------------------------------------------------ */

export const Fact: React.FC<{
  label: string;
  value: string;
  note?: string;
  seed?: number;
}> = ({ label, value, note, seed = 1 }) => {
  const f = useCurrentFrame();
  const t = clamp01(f / 14);
  const drift = (rnd(seed) - 0.5) * 18;
  return (
    <div
      style={{
        position: "absolute",
        left: "16%",
        top: 720,
        width: "68%",
        padding: "26px 30px",
        border: `2px solid ${C.panelEdge}`,
        background: "rgba(10,11,16,0.86)",
        opacity: t,
        transform: `translate(${drift * (1 - t)}px, ${(1 - t) * 28}px)`,
      }}
    >
      <div style={{ color: C.dim, fontSize: 26, letterSpacing: 4, fontWeight: 700 }}>{label}</div>
      <div style={{ color: C.text, fontSize: 72, fontWeight: 900, marginTop: 8 }}>{value}</div>
      {note ? (
        <div style={{ color: C.amber, fontSize: 24, letterSpacing: 2, marginTop: 10, fontWeight: 700 }}>
          {note}
        </div>
      ) : null}
    </div>
  );
};

/** A ring assembled from ellipse arcs — the object of the claim, in motion. */
export const Ring: React.FC<{ spin?: number }> = ({ spin = 0 }) => {
  const f = useCurrentFrame();
  const a = (f / 90 + spin) * Math.PI * 2;
  const w = 210 + Math.cos(a) * 34;
  return (
    <div style={{ position: "absolute", left: 430, top: 640, width: 320, height: 320 }}>
      <svg viewBox="0 0 320 320" width="320" height="320">
        <ellipse cx="160" cy="210" rx={w / 2} ry="62" fill="none" stroke="#EDEFF5" strokeWidth="16" />
        <path d="M138 132 L182 132 L172 96 L148 96 Z" fill="#D8DEEA" />
        <path
          d={`M148 96 L160 ${44 + Math.cos(a) * 8} L172 96 L160 112 Z`}
          fill="#22D3EE"
          opacity={0.75 + Math.sin(a) * 0.2}
        />
        <ellipse cx="160" cy="210" rx={w / 2} ry="62" fill="none" stroke="#FBBF24" strokeWidth="3" opacity="0.5" />
      </svg>
    </div>
  );
};

export const beatIn = (f: number, d: number, at = 0.08): number =>
  spring(ph(f, d, at, Math.min(1, at + 0.22)));
