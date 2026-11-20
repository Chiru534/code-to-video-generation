import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface WolfProps {
  pose?: "smirk" | "point" | "stop" | "nod";
  scale?: number;
  speaking?: boolean;
  eyeDirection?: "left" | "right" | "center";
}

/**
 * Procedurally rendered Suited Wolf character.
 * High-precision vector SVG with pinstripe suit, expressive facial features,
 * blinking, breathing, and posing kinematics.
 */
export const WolfCharacter: React.FC<WolfProps> = ({
  pose = "smirk",
  scale = 1,
  speaking = false,
  eyeDirection = "center",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Natural breathing cycle
  const t = frame / fps;
  const breathY = Math.sin(t * 2.5) * 3;
  const breathScale = 1 + Math.sin(t * 2.5) * 0.015;

  // Blinking kinematics (blinks every ~80 frames)
  const blinkCycle = frame % 90;
  const isBlinking = blinkCycle > 84 && blinkCycle < 88;
  const eyeScaleY = isBlinking ? 0.1 : 1;

  // Dynamic speaking / jaw movement
  const mouthMove = speaking ? Math.abs(Math.sin(frame * 0.45)) * 8 : 0;

  // Pose-driven spring translations
  const enterSpring = spring({ frame, fps, config: { damping: 14, mass: 0.9 } });

  // Eyeball gaze offset
  const eyeOffset = eyeDirection === "left" ? -4 : eyeDirection === "right" ? 4 : 0;

  // Smirk dynamic curl
  const smirkWidth = 24 + (pose === "smirk" ? Math.sin(t * 3) * 2 : 0);

  return (
    <div
      style={{
        width: 320,
        height: 440,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transform: `scale(${scale * enterSpring}) translateY(${breathY}px)`,
        transformOrigin: "bottom center",
        position: "relative",
      }}
    >
      <svg
        viewBox="0 0 320 440"
        width="100%"
        height="100%"
        style={{ overflow: "visible", filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.6))" }}
      >
        <defs>
          {/* Suit Pinstripe Pattern */}
          <pattern id="wolfPinstripe" width="12" height="12" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="12" stroke="#38bdf8" strokeWidth="0.8" opacity="0.35" />
          </pattern>

          {/* Gradients */}
          <linearGradient id="wolfFur" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <linearGradient id="wolfSuit" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="wolfTie" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>

          <linearGradient id="wolfEye" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* ================= SUIT & BODY ================= */}
        <g id="suit-body" transform={`scale(${breathScale})`} style={{ transformOrigin: "160px 340px" }}>
          {/* Main Suit Torso */}
          <path
            d="M 60 270 Q 160 250 260 270 L 285 440 L 35 440 Z"
            fill="url(#wolfSuit)"
            stroke="#0f172a"
            strokeWidth="2"
          />
          {/* Pinstripe overlay */}
          <path
            d="M 60 270 Q 160 250 260 270 L 285 440 L 35 440 Z"
            fill="url(#wolfPinstripe)"
          />

          {/* White Dress Shirt V */}
          <polygon points="120,260 200,260 160,370" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />

          {/* Crimson Red Tie */}
          <polygon points="152,268 168,268 174,360 160,390 146,360" fill="url(#wolfTie)" />
          {/* Tie Knot */}
          <polygon points="150,260 170,260 165,274 155,274" fill="#b91c1c" />
          {/* Gold Tie Clip */}
          <line x1="150" y1="320" x2="170" y2="320" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />

          {/* Suit Lapels (Left & Right) */}
          <path
            d="M 80 266 L 132 350 L 115 354 L 64 280 Z"
            fill="#1e293b"
            stroke="#0f172a"
            strokeWidth="2"
          />
          <path
            d="M 240 266 L 188 350 L 205 354 L 256 280 Z"
            fill="#1e293b"
            stroke="#0f172a"
            strokeWidth="2"
          />

          {/* White Pocket Square */}
          <polygon points="215,310 235,310 228,300 222,304" fill="#ffffff" />
        </g>

        {/* ================= ARMS & GESTURES ================= */}
        {pose === "stop" && (
          /* Raised hand stopping the duck */
          <g id="raised-hand" transform="translate(20, 20)">
            <path
              d="M 40 320 Q 20 270 24 230 Q 30 220 42 224 L 54 260 Q 64 300 50 330 Z"
              fill="url(#wolfFur)"
              stroke="#0f172a"
              strokeWidth="2"
            />
            {/* Claws / Pads */}
            <circle cx="28" cy="225" r="5" fill="#1e293b" />
            <circle cx="38" cy="220" r="5" fill="#1e293b" />
          </g>
        )}

        {pose === "point" && (
          /* Pointing hand indicating RAM / CPU chart */
          <g id="pointing-hand" transform="translate(190, 160)">
            <path
              d="M 40 160 L 95 130 Q 105 125 100 135 L 55 175 Z"
              fill="url(#wolfFur)"
              stroke="#0f172a"
              strokeWidth="2"
            />
            {/* Pointing claw finger */}
            <line x1="90" y1="130" x2="115" y2="120" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
          </g>
        )}

        {/* ================= HEAD & FACE ================= */}
        <g id="wolf-head">
          {/* Wolf Ears */}
          {/* Left Ear */}
          <polygon points="90,140 60,30 130,95" fill="url(#wolfFur)" stroke="#0f172a" strokeWidth="2" />
          <polygon points="85,130 70,50 120,95" fill="#fda4af" opacity="0.85" />

          {/* Right Ear */}
          <polygon points="230,140 260,30 190,95" fill="url(#wolfFur)" stroke="#0f172a" strokeWidth="2" />
          <polygon points="235,130 250,50 200,95" fill="#fda4af" opacity="0.85" />

          {/* Main Skull Silhouette */}
          <path
            d="M 90 140 Q 60 190 75 230 Q 120 260 160 265 Q 200 260 245 230 Q 260 190 230 140 Q 160 110 90 140 Z"
            fill="url(#wolfFur)"
            stroke="#0f172a"
            strokeWidth="2"
          />

          {/* Cheek Fur Tufts (Left & Right) */}
          <polygon points="75,210 50,225 78,235" fill="url(#wolfFur)" />
          <polygon points="245,210 270,225 242,235" fill="url(#wolfFur)" />

          {/* Muzzle / Snout Base */}
          <path
            d="M 125 190 L 160 215 L 195 190 L 180 250 L 140 250 Z"
            fill="#334155"
            stroke="#1e293b"
            strokeWidth="1.5"
          />

          {/* Black Wolf Nose */}
          <polygon points="150,210 170,210 160,222" fill="#0f172a" />

          {/* Smirk Mouth with Fang */}
          <path
            d={`M 140,240 Q 160,${244 + mouthMove} ${160 + smirkWidth},${234 - mouthMove}`}
            fill="none"
            stroke="#0f172a"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Subtle White Canine Fang */}
          <polygon points="172,238 178,248 181,236" fill="#ffffff" />

          {/* Expressive Amber Eyes */}
          {/* Left Eye */}
          <g transform={`translate(${eyeOffset}, 0)`}>
            <ellipse cx="120" cy="165" rx="18" ry={14 * eyeScaleY} fill="url(#wolfEye)" stroke="#0f172a" strokeWidth="2" />
            <circle cx="122" cy="165" r={7 * eyeScaleY} fill="#0f172a" />
            <circle cx="124" cy="162" r={2.5 * eyeScaleY} fill="#ffffff" />
            {/* Confident slanted eyebrow */}
            <line x1="102" y1="150" x2="138" y2="158" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* Right Eye (Slight squint for smirk) */}
          <g transform={`translate(${eyeOffset}, 0)`}>
            <ellipse cx="200" cy="165" rx="18" ry={12 * eyeScaleY} fill="url(#wolfEye)" stroke="#0f172a" strokeWidth="2" />
            <circle cx="198" cy="165" r={7 * eyeScaleY} fill="#0f172a" />
            <circle cx="200" cy="162" r={2.5 * eyeScaleY} fill="#ffffff" />
            {/* Confident slanted eyebrow */}
            <line x1="218" y1="150" x2="182" y2="158" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </div>
  );
};
