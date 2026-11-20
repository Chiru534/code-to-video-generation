import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface DuckProps {
  pose?: "swiping" | "shocked" | "confused" | "relieved";
  scale?: number;
  eyeDirection?: "left" | "right" | "up" | "center";
}

/**
 * Procedurally rendered Naive Duck character.
 * High-precision vector SVG with cute round head, expressive wide eyes,
 * orange bill, frantic swiping kinematics, and shock reactions.
 */
export const DuckCharacter: React.FC<DuckProps> = ({
  pose = "swiping",
  scale = 1,
  eyeDirection = "center",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t = frame / fps;
  const breathY = Math.sin(t * 3.2) * 3;

  // Frantic swiping arm translation (repeating rapid upward swipe)
  const swipeProgress = (frame % 15) / 15;
  const swipeHandY = pose === "swiping" ? 80 - swipeProgress * 65 : 40;
  const swipeGlow = pose === "swiping" ? 0.3 + 0.7 * Math.sin(swipeProgress * Math.PI) : 0;

  // Blinking kinematics
  const blinkCycle = (frame + 30) % 95;
  const isBlinking = blinkCycle > 90 && blinkCycle < 94;
  const eyeScaleY = isBlinking ? 0.1 : 1;

  // Surprise / shock mouth drop
  const mouthDrop = pose === "shocked" ? 18 : pose === "confused" ? 8 : 0;

  // Head tilt based on pose
  const headRotate = pose === "confused" ? 8 : pose === "shocked" ? -5 : 0;

  // Eye gaze offsets
  const eyeOffsetX = eyeDirection === "left" ? -5 : eyeDirection === "right" ? 5 : 0;
  const eyeOffsetY = eyeDirection === "up" ? -6 : 0;

  return (
    <div
      style={{
        width: 300,
        height: 420,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transform: `scale(${scale}) translateY(${breathY}px)`,
        transformOrigin: "bottom center",
        position: "relative",
      }}
    >
      <svg
        viewBox="0 0 300 420"
        width="100%"
        height="100%"
        style={{ overflow: "visible", filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.5))" }}
      >
        <defs>
          <linearGradient id="duckYellow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>

          <linearGradient id="duckOrange" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          <linearGradient id="duckShirt" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* ================= BODY & SHIRT ================= */}
        <g id="duck-body">
          {/* Blue Polo Shirt */}
          <path
            d="M 80 270 Q 150 250 220 270 L 245 420 L 55 420 Z"
            fill="url(#duckShirt)"
            stroke="#0369a1"
            strokeWidth="2"
          />
          {/* Collar */}
          <polygon points="120,265 150,295 140,265" fill="#f8fafc" />
          <polygon points="180,265 150,295 160,265" fill="#f8fafc" />

          {/* Left Wing / Arm holding phone body */}
          <path
            d="M 75 285 Q 40 330 65 370 Q 90 380 95 340 Z"
            fill="url(#duckYellow)"
            stroke="#ca8a04"
            strokeWidth="2"
          />
        </g>

        {/* ================= SWIPING PHONE & HAND ================= */}
        <g id="duck-phone" transform={`translate(150, ${220 + swipeHandY})`}>
          {/* Smartphone device */}
          <rect
            x="-35"
            y="-60"
            width="70"
            height="120"
            rx="12"
            fill="#1e293b"
            stroke="#94a3b8"
            strokeWidth="2.5"
          />
          {/* Screen glow */}
          <rect
            x="-30"
            y="-52"
            width="60"
            height="104"
            rx="8"
            fill="#0ea5e9"
            opacity="0.9"
          />
          {/* Dynamic App Card Flying Up */}
          {pose === "swiping" && (
            <g transform={`translate(0, ${-swipeProgress * 70})`} opacity={1 - swipeProgress}>
              <rect x="-24" y="-30" width="48" height="42" rx="6" fill="#ffffff" />
              <line x1="-16" y1="-18" x2="16" y2="-18" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
              <line x1="-16" y1="-8" x2="6" y2="-8" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}
          {/* Home indicator bar */}
          <line x1="-14" y1="46" x2="14" y2="46" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

          {/* Yellow Feathery Duck Thumb Swiping */}
          <ellipse cx="18" cy="-5" rx="12" ry="16" fill="url(#duckYellow)" stroke="#ca8a04" strokeWidth="1.5" />
          {/* Swipe motion trail */}
          {pose === "swiping" && (
            <path
              d="M 5 20 Q 20 -15 5 -40"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity={swipeGlow}
            />
          )}
        </g>

        {/* ================= HEAD & EXPRESIONS ================= */}
        <g
          id="duck-head"
          transform={`rotate(${headRotate}, 150, 160)`}
        >
          {/* Round Head */}
          <circle cx="150" cy="160" r="85" fill="url(#duckYellow)" stroke="#ca8a04" strokeWidth="2.5" />

          {/* Top Feather Tufts */}
          <path
            d="M 145 76 Q 140 40 152 48 Q 158 40 162 55 Q 168 62 155 76 Z"
            fill="url(#duckYellow)"
            stroke="#ca8a04"
            strokeWidth="2"
          />

          {/* Cheerful / Surprised Round Eyes */}
          {/* Left Eye */}
          <g transform={`translate(${eyeOffsetX}, ${eyeOffsetY})`}>
            <ellipse cx="120" cy="140" rx="22" ry={26 * eyeScaleY} fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="123" cy="142" r={10 * eyeScaleY} fill="#0f172a" />
            <circle cx="127" cy="136" r={3.5 * eyeScaleY} fill="#ffffff" />
            {/* Cute worried/questioning eyebrow */}
            <path
              d={pose === "shocked" ? "M 102 110 Q 120 102 138 112" : "M 104 116 Q 120 110 136 118"}
              fill="none"
              stroke="#0f172a"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>

          {/* Right Eye */}
          <g transform={`translate(${eyeOffsetX}, ${eyeOffsetY})`}>
            <ellipse cx="180" cy="140" rx="22" ry={26 * eyeScaleY} fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="177" cy="142" r={10 * eyeScaleY} fill="#0f172a" />
            <circle cx="181" cy="136" r={3.5 * eyeScaleY} fill="#ffffff" />
            {/* Cute worried/questioning eyebrow */}
            <path
              d={pose === "shocked" ? "M 162 112 Q 180 102 198 110" : "M 164 118 Q 180 110 196 116"}
              fill="none"
              stroke="#0f172a"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>

          {/* Cute Rosy Cheeks */}
          <ellipse cx="88" cy="175" rx="14" ry="9" fill="#f43f5e" opacity="0.45" />
          <ellipse cx="212" cy="175" rx="14" ry="9" fill="#f43f5e" opacity="0.45" />

          {/* Big Orange Duck Bill */}
          <g id="duck-bill">
            {/* Top Beak */}
            <path
              d="M 105 178 Q 150 162 195 178 Q 210 205 190 216 Q 150 228 110 216 Q 90 205 105 178 Z"
              fill="url(#duckOrange)"
              stroke="#c2410c"
              strokeWidth="2.5"
            />
            {/* Nostril dots */}
            <ellipse cx="140" cy="184" rx="2" ry="3" fill="#9a3412" />
            <ellipse cx="160" cy="184" rx="2" ry="3" fill="#9a3412" />

            {/* Lower Beak / Open Mouth on Shock */}
            <path
              d={`M 118 214 Q 150 ${225 + mouthDrop} 182 214 Q 170 ${240 + mouthDrop * 1.3} 150 ${240 + mouthDrop * 1.3} Q 130 ${240 + mouthDrop * 1.3} 118 214 Z`}
              fill="#9a3412"
              stroke="#7c2d12"
              strokeWidth="2"
            />
            {mouthDrop > 5 && (
              /* Pink Tongue */
              <ellipse cx="150" cy={228 + mouthDrop} rx="12" ry="6" fill="#fb7185" />
            )}
          </g>
        </g>
      </svg>
    </div>
  );
};
