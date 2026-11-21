import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { CLAMP, ease } from "./core";

/* =========================================================================
 * INTERACTIVE CINEMATIC KIT FOR TECHNICAL SHORTS
 *
 * Transforms static slides into interactive technology documentaries:
 * - Interactive questions with cursor clicks, polls, and answer reveals
 * - Simulated real-world switches, buttons, and tactile toggles
 * - Dynamic process & signal flow visualizations
 * - NAND Flash 2.5D memory block matrices
 * - Consistent documentary top progress bar
 * ========================================================================= */

/** 1. ANIMATED POINTER CURSOR
 *  Simulates a user moving a cursor or tapping on an interactive UI control.
 */
export const AnimatedPointer: React.FC<{
  targetX: number;
  targetY: number;
  clickProgress?: number; // 0 to 1 fraction of scene when click occurs
  startX?: number;
  startY?: number;
  type?: "mouse" | "touch";
}> = ({
  targetX,
  targetY,
  clickProgress = 0.4,
  startX = 820,
  startY = 1400,
  type = "mouse",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const clickFrame = clickProgress * durationInFrames;

  // Flight phase: moves from start to target over 24 frames before click
  const travelStart = Math.max(0, clickFrame - 26);
  const travelProgress = interpolate(
    frame,
    [travelStart, clickFrame],
    [0, 1],
    { ...CLAMP, easing: ease }
  );

  const curX = interpolate(travelProgress, [0, 1], [startX, targetX]);
  const curY = interpolate(travelProgress, [0, 1], [startY, targetY]);

  // Click squash: squashes briefly around clickFrame
  const isPostClick = frame >= clickFrame;
  const clickAnim = spring({
    frame: frame - clickFrame,
    fps,
    config: { damping: 12, mass: 0.5 },
  });
  const scale = isPostClick
    ? interpolate(clickAnim, [0, 0.5, 1], [0.82, 1.08, 1])
    : 1;

  // Expanding shockwave ripple on click
  const rippleProgress = isPostClick
    ? interpolate(frame - clickFrame, [0, 24], [0, 1], CLAMP)
    : 0;
  const rippleRadius = rippleProgress * 70;
  const rippleOpacity = (1 - rippleProgress) * 0.75;

  return (
    <div
      style={{
        position: "absolute",
        left: curX,
        top: curY,
        pointerEvents: "none",
        zIndex: 100,
        transform: `translate(-12px, -8px) scale(${scale})`,
        transformOrigin: "center center",
      }}
    >
      {/* Click ripple shockwave */}
      {isPostClick && rippleProgress < 1 && (
        <div
          style={{
            position: "absolute",
            left: 12,
            top: 12,
            width: rippleRadius * 2,
            height: rippleRadius * 2,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: `3px solid ${C.cyan}`,
            boxShadow: `0 0 20px ${C.cyan}`,
            opacity: rippleOpacity,
          }}
        />
      )}

      {/* Cursor Body */}
      {type === "mouse" ? (
        <svg width="42" height="48" viewBox="0 0 32 36" fill="none">
          <filter id="cursorShadow" x="-20%" y="-20%" width="160%" height="160%">
            <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.8" />
          </filter>
          <path
            d="M2 2L13 32L17.5 20.5L30 18.5L2 2Z"
            fill="#0F172A"
            stroke={C.cyan}
            strokeWidth="2.5"
            strokeLinejoin="round"
            filter="url(#cursorShadow)"
          />
          <path
            d="M6 8L13 25L16 18L24 16.5L6 8Z"
            fill={C.cyan}
            opacity="0.85"
          />
        </svg>
      ) : (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34,211,238,0.6) 0%, rgba(34,211,238,0.1) 70%)",
            border: `2px solid ${C.cyan}`,
            boxShadow: `0 0 16px ${C.cyan}`,
          }}
        />
      )}
    </div>
  );
};

/** 2. INTERACTIVE POLL / QUESTION SCENE
 *  Renders an engaging hypothesis/question with clickable options, countdown timer,
 *  animated cursor, and dramatic reveal of the technical reality.
 */
export const InteractivePoll: React.FC<{
  question: string;
  kicker?: string;
  options: [
    { text: string; subtext: string; isCorrect: boolean },
    { text: string; subtext: string; isCorrect: boolean }
  ];
  selectedOptionIndex?: number; // default 0 (the popular myth)
  clickFraction?: number;       // default 0.35
  revealFraction?: number;      // default 0.60
  revealVerdict: string;
  revealDetail: string;
}> = ({
  question,
  kicker = "AUDIENCE HYPOTHESIS",
  options,
  selectedOptionIndex = 0,
  clickFraction = 0.32,
  revealFraction = 0.58,
  revealVerdict,
  revealDetail,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const clickFrame = clickFraction * durationInFrames;
  const revealFrame = revealFraction * durationInFrames;

  const isClicked = frame >= clickFrame;
  const isRevealed = frame >= revealFrame;

  // Countdown timer (ticks down from 3 to 1 before reveal)
  const timerProgress = interpolate(
    frame,
    [clickFrame, revealFrame],
    [3, 0],
    CLAMP
  );
  const countdownSec = Math.max(0, Math.ceil(timerProgress));

  return (
    <div
      style={{
        width: 920,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: F.mono,
      }}
    >
      {/* Question Kicker */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(34,211,238,0.12)",
          border: `1.5px solid ${C.cyan}`,
          borderRadius: 30,
          padding: "8px 24px",
          color: C.cyan,
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: 3,
          marginBottom: 20,
          boxShadow: `0 0 20px rgba(34,211,238,0.2)`,
        }}
      >
        <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: C.cyan }} />
        {kicker}
      </div>

      {/* Main Question Display */}
      <div
        style={{
          fontSize: 38,
          fontWeight: 900,
          color: "#FFFFFF",
          textAlign: "center",
          lineHeight: 1.25,
          marginBottom: 32,
          padding: "0 20px",
          textShadow: "0 4px 20px rgba(0,0,0,0.8)",
        }}
      >
        "{question}"
      </div>

      {/* Countdown Ring Indicator (Active before reveal) */}
      {!isRevealed && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 28,
            padding: "8px 20px",
            background: "rgba(15,23,42,0.8)",
            borderRadius: 20,
            border: "1px solid #334155",
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: `2px solid ${C.amber}`,
              borderTopColor: "transparent",
              animation: "spin 1s linear infinite",
              transform: `rotate(${frame * 12}deg)`,
            }}
          />
          <span style={{ fontSize: 18, color: C.amber, fontWeight: 800 }}>
            {isClicked ? `REVEALING IN ${countdownSec}S...` : "SELECT YOUR ANSWER"}
          </span>
        </div>
      )}

      {/* Options Grid */}
      <div style={{ width: "100%", display: "flex", gap: 20, justifyContent: "center" }}>
        {options.map((opt, idx) => {
          const isSelected = isClicked && selectedOptionIndex === idx;
          const showAnswer = isRevealed;

          let borderColor = "#334155";
          let bgColor = "#0f172a";
          let badgeText = "";
          let badgeColor = "";

          if (showAnswer) {
            if (opt.isCorrect) {
              borderColor = C.green;
              bgColor = "rgba(52,211,153,0.15)";
              badgeText = "✓ TRUE REALITY";
              badgeColor = C.green;
            } else {
              borderColor = C.red;
              bgColor = "rgba(251,113,133,0.12)";
              badgeText = "✕ POPULAR MYTH";
              badgeColor = C.red;
            }
          } else if (isSelected) {
            borderColor = C.cyan;
            bgColor = "rgba(34,211,238,0.18)";
            badgeText = "SELECTED";
            badgeColor = C.cyan;
          }

          return (
            <div
              key={idx}
              id={`poll-option-${idx}`}
              style={{
                flex: 1,
                minHeight: 180,
                background: bgColor,
                border: `3px solid ${borderColor}`,
                borderRadius: 24,
                padding: "24px 20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                textAlign: "center",
                boxShadow: isSelected
                  ? `0 0 35px ${borderColor}55, inset 0 0 20px ${borderColor}33`
                  : "0 10px 30px rgba(0,0,0,0.6)",
                transform: isSelected && !showAnswer ? "scale(1.03)" : "scale(1)",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <span
                  style={{
                    fontSize: 14,
                    color: C.dim,
                    letterSpacing: 2,
                    fontWeight: 800,
                  }}
                >
                  OPTION 0{idx + 1}
                </span>
                {badgeText && (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: badgeColor,
                      background: `${badgeColor}22`,
                      padding: "4px 10px",
                      borderRadius: 12,
                      border: `1px solid ${badgeColor}66`,
                    }}
                  >
                    {badgeText}
                  </span>
                )}
              </div>

              <div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#FFFFFF", marginBottom: 6 }}>
                  {opt.text}
                </div>
                <div style={{ fontSize: 16, color: C.dim, lineHeight: 1.3 }}>
                  {opt.subtext}
                </div>
              </div>

              {/* Progress Vote bar simulation */}
              <div
                style={{
                  width: "100%",
                  height: 6,
                  background: "#1e293b",
                  borderRadius: 4,
                  overflow: "hidden",
                  marginTop: 12,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: isRevealed
                      ? opt.isCorrect ? "18%" : "82%"
                      : isSelected ? "100%" : "0%",
                    background: borderColor,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dramatic Reveal Card */}
      {isRevealed && (
        <div
          style={{
            marginTop: 28,
            width: "100%",
            background: "linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)",
            border: `2px solid ${C.cyan}`,
            borderRadius: 20,
            padding: "20px 24px",
            boxShadow: `0 15px 40px rgba(0,0,0,0.8), 0 0 30px rgba(34,211,238,0.25)`,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(34,211,238,0.15)",
              border: `2px solid ${C.cyan}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              flexShrink: 0,
            }}
          >
            ⚡
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.cyan, marginBottom: 4 }}>
              {revealVerdict}
            </div>
            <div style={{ fontSize: 15, color: "#E2E8F0", lineHeight: 1.4 }}>
              {revealDetail}
            </div>
          </div>
        </div>
      )}

      {/* Pointer Cursor Animation pointing to option 0 */}
      <AnimatedPointer
        targetX={selectedOptionIndex === 0 ? 320 : 680}
        targetY={490}
        clickProgress={clickFraction}
        startX={850}
        startY={1100}
        type="mouse"
      />
    </div>
  );
};

/** 3. DEVICE HARDWARE SWITCH / TACTILE TOGGLE
 *  Simulates a real-world smartphone or hardware toggle being clicked by a user,
 *  with interactive haptic feedback and synchronized live telemetry readouts.
 */
export const DeviceToggle: React.FC<{
  title: string;
  subtitle: string;
  icon?: string;
  toggleFraction?: number; // 0 to 1 fraction of scene when switch flips
  readouts: Array<{ label: string; value: string; unit?: string; activeColor?: string; inactiveColor?: string }>;
}> = ({
  title,
  subtitle,
  icon = "✈️",
  toggleFraction = 0.35,
  readouts,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const toggleFrame = toggleFraction * durationInFrames;

  const isToggled = frame >= toggleFrame;
  const toggleSpring = spring({
    frame: frame - toggleFrame,
    fps,
    config: { damping: 14, mass: 0.6 },
  });

  // Toggle knob position: 0 (OFF, left) to 1 (ON, right)
  const knobX = isToggled
    ? interpolate(toggleSpring, [0, 1], [0, 68], CLAMP)
    : 0;

  return (
    <div
      style={{
        width: 900,
        background: "radial-gradient(ellipse at top, #1e293b 0%, #0f172a 100%)",
        border: "3px solid #334155",
        borderRadius: 32,
        padding: "36px 40px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.1)",
        fontFamily: F.mono,
        position: "relative",
      }}
    >
      {/* Device Header & Hardware Toggle Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #1e293b",
          paddingBottom: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              background: isToggled ? "rgba(34,211,238,0.2)" : "#1e293b",
              border: `2px solid ${isToggled ? C.cyan : "#475569"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              boxShadow: isToggled ? `0 0 25px ${C.cyan}66` : "none",
              transition: "all 0.3s ease",
            }}
          >
            {icon}
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#FFFFFF", letterSpacing: 1 }}>
              {title}
            </div>
            <div style={{ fontSize: 16, color: C.dim, marginTop: 4 }}>
              {subtitle}
            </div>
          </div>
        </div>

        {/* Physical Toggle Mechanism */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div
            id="device-toggle-switch"
            style={{
              width: 136,
              height: 68,
              borderRadius: 34,
              background: isToggled
                ? "linear-gradient(90deg, #0284c7 0%, #22d3ee 100%)"
                : "#1e293b",
              border: `3px solid ${isToggled ? C.cyan : "#475569"}`,
              padding: 4,
              position: "relative",
              cursor: "pointer",
              boxShadow: isToggled
                ? `0 0 30px ${C.cyan}88, inset 0 2px 8px rgba(0,0,0,0.5)`
                : "inset 0 4px 10px rgba(0,0,0,0.6)",
              transition: "background 0.3s ease",
            }}
          >
            {/* The sliding knob */}
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                background: "linear-gradient(180deg, #FFFFFF 0%, #cbd5e1 100%)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.6)",
                transform: `translateX(${knobX}px)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: isToggled ? C.cyan : "#94a3b8",
                  boxShadow: isToggled ? `0 0 8px ${C.cyan}` : "none",
                }}
              />
            </div>
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: isToggled ? C.cyan : C.dim }}>
            {isToggled ? "STATE: ACTIVE" : "STATE: OFF"}
          </span>
        </div>
      </div>

      {/* Live Telemetry Readout Grid */}
      <div
        style={{
          marginTop: 28,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
      >
        {readouts.map((r, i) => {
          const color = isToggled
            ? (r.activeColor ?? C.cyan)
            : (r.inactiveColor ?? C.dim);
          return (
            <div
              key={i}
              style={{
                background: "#0b1120",
                border: "2px solid #1e293b",
                borderRadius: 20,
                padding: "20px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 13, color: "#64748b", fontWeight: 800, letterSpacing: 1.5, marginBottom: 8 }}>
                {r.label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: color, letterSpacing: 0.5 }}>
                {r.value} <span style={{ fontSize: 16, fontWeight: 600 }}>{r.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Touch Pointer that taps the toggle switch */}
      <AnimatedPointer
        targetX={810}
        targetY={130}
        clickProgress={toggleFraction}
        startX={650}
        startY={700}
        type="touch"
      />
    </div>
  );
};

/** 4. DYNAMIC SPEEDOMETER / POWER GAUGE
 *  Visualizes performance cliffs, IOPS plunges, or power amplifier surges
 *  with an animated needle and glowing segmented arc.
 */
export const DynamicGauge: React.FC<{
  title: string;
  value: number; // e.g. 450 or 3500
  minValue: number;
  maxValue: number;
  unit: string;
  verdictLabel: string;
  isAlert?: boolean;
}> = ({
  title,
  value,
  minValue,
  maxValue,
  unit,
  verdictLabel,
  isAlert = false,
}) => {
  const normVal = Math.min(1, Math.max(0, (value - minValue) / (maxValue - minValue)));
  const angle = interpolate(normVal, [0, 1], [-110, 110]); // degrees

  const themeColor = isAlert ? C.red : C.cyan;

  return (
    <div
      style={{
        width: 880,
        background: "#0b1120",
        border: `2px solid ${isAlert ? "#ef4444" : "#1e293b"}`,
        borderRadius: 28,
        padding: "32px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: isAlert
          ? "0 0 50px rgba(239,68,68,0.25)"
          : "0 20px 50px rgba(0,0,0,0.8)",
        fontFamily: F.mono,
      }}
    >
      <div style={{ fontSize: 18, color: C.dim, fontWeight: 800, letterSpacing: 2, marginBottom: 20 }}>
        {title}
      </div>

      {/* Gauge SVG Arc & Needle */}
      <div style={{ position: "relative", width: 340, height: 180, display: "flex", justifyContent: "center" }}>
        <svg width="340" height="200" viewBox="0 0 340 200">
          {/* Background Arc */}
          <path
            d="M 50 170 A 120 120 0 0 1 290 170"
            fill="none"
            stroke="#1e293b"
            strokeWidth="24"
            strokeLinecap="round"
          />
          {/* Active Colored Arc */}
          <path
            d="M 50 170 A 120 120 0 0 1 290 170"
            fill="none"
            stroke={themeColor}
            strokeWidth="24"
            strokeLinecap="round"
            strokeDasharray="450"
            strokeDashoffset={450 * (1 - normVal)}
            style={{
              filter: `drop-shadow(0 0 10px ${themeColor})`,
              transition: "stroke-dashoffset 0.3s ease",
            }}
          />
          {/* Center Hub */}
          <circle cx="170" cy="170" r="14" fill="#0F172A" stroke={themeColor} strokeWidth="4" />
          {/* Needle */}
          <line
            x1="170"
            y1="170"
            x2="170"
            y2="70"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            transform={`rotate(${angle} 170 170)`}
            style={{
              filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.9))",
              transition: "transform 0.2s cubic-bezier(0.2, 1, 0.3, 1)",
            }}
          />
        </svg>

        {/* Digital Readout in center of gauge */}
        <div
          style={{
            position: "absolute",
            bottom: -10,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 900, color: "#FFFFFF", letterSpacing: 1 }}>
            {value.toLocaleString()} <span style={{ fontSize: 20, color: themeColor }}>{unit}</span>
          </div>
        </div>
      </div>

      {/* Verdict Label */}
      <div
        style={{
          marginTop: 40,
          background: `${themeColor}22`,
          border: `1.5px solid ${themeColor}`,
          borderRadius: 16,
          padding: "10px 28px",
          color: themeColor,
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: 1.5,
          boxShadow: `0 0 20px ${themeColor}33`,
        }}
      >
        {verdictLabel}
      </div>
    </div>
  );
};

/** 5. NAND FLASH ISOMETRIC BLOCK MATRIX (For SSD TRIM & Storage Architecture)
 *  Visually renders NAND flash pages inside an erase block, clearly illustrating
 *  page-level writes vs block-level erasures and write amplification.
 */
export const NandBlockMatrix: React.FC<{
  phase: "initial" | "deleted" | "overwrite_attempt" | "read_modify_write" | "trim_active";
}> = ({ phase }) => {
  const frame = useCurrentFrame();

  // 16 pages simulated inside a block
  const pages = [
    { id: 0, status: "valid", label: "IMG_01" },
    { id: 1, status: "valid", label: "DOC_02" },
    { id: 2, status: phase === "initial" ? "valid" : "dirty", label: "DEL_FILE" },
    { id: 3, status: phase === "initial" ? "valid" : "dirty", label: "DEL_DATA" },
    { id: 4, status: "valid", label: "SYS_CFG" },
    { id: 5, status: "valid", label: "BOOT_01" },
    { id: 6, status: "empty", label: "FREE" },
    { id: 7, status: "empty", label: "FREE" },
    { id: 8, status: "valid", label: "CODE_01" },
    { id: 9, status: "valid", label: "CODE_02" },
    { id: 10, status: phase === "read_modify_write" ? "writing" : "empty", label: "NEW_SAVE" },
    { id: 11, status: "empty", label: "FREE" },
    { id: 12, status: "empty", label: "FREE" },
    { id: 13, status: "empty", label: "FREE" },
    { id: 14, status: "empty", label: "FREE" },
    { id: 15, status: "empty", label: "FREE" },
  ];

  const isErasing = phase === "read_modify_write" && Math.sin(frame * 0.4) > 0.2;

  return (
    <div
      style={{
        width: 900,
        background: "#080d1a",
        border: `3px solid ${isErasing ? C.red : "#1e293b"}`,
        borderRadius: 28,
        padding: "30px",
        boxShadow: isErasing
          ? "0 0 60px rgba(251,113,133,0.4)"
          : "0 25px 60px rgba(0,0,0,0.8)",
        fontFamily: F.mono,
        position: "relative",
      }}
    >
      {/* Silicon Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <span style={{ fontSize: 14, color: C.cyan, fontWeight: 800, letterSpacing: 2 }}>
            NAND FLASH SILICON ARCHITECTURE
          </span>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#FFFFFF", marginTop: 4 }}>
            PHYSICAL 4 MB ERASE BLOCK (256 PAGES)
          </div>
        </div>
        <div
          style={{
            background: isErasing ? "rgba(251,113,133,0.2)" : "rgba(34,211,238,0.1)",
            border: `1.5px solid ${isErasing ? C.red : C.cyan}`,
            borderRadius: 12,
            padding: "6px 16px",
            fontSize: 14,
            fontWeight: 800,
            color: isErasing ? C.red : C.cyan,
          }}
        >
          {isErasing ? "⚡ 20V HIGH VOLTAGE ERASE" : "HARDWARE GRID"}
        </div>
      </div>

      {/* 4x4 Grid of Silicon 16KB Pages */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          perspective: 800,
        }}
      >
        {pages.map((p) => {
          let bg = "#0f172a";
          let border = "#334155";
          let textColor = "#64748b";

          if (p.status === "valid") {
            bg = "rgba(34,211,238,0.18)";
            border = C.cyan;
            textColor = "#FFFFFF";
          } else if (p.status === "dirty") {
            if (phase === "trim_active") {
              bg = "rgba(52,211,153,0.2)";
              border = C.green;
              textColor = C.green;
            } else {
              bg = "rgba(251,113,133,0.22)";
              border = C.red;
              textColor = C.red;
            }
          } else if (p.status === "writing") {
            bg = "rgba(251,191,36,0.25)";
            border = C.amber;
            textColor = C.amber;
          }

          return (
            <div
              key={p.id}
              style={{
                height: 72,
                background: bg,
                border: `2px solid ${border}`,
                borderRadius: 14,
                padding: "8px 12px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: p.status === "valid" ? `0 0 14px ${border}44` : "none",
                transform: p.status === "dirty" && phase === "deleted" ? "scale(0.97)" : "scale(1)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.dim }}>
                <span>PAGE #{p.id}</span>
                <span>16 KB</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: textColor }}>
                {phase === "trim_active" && p.status === "dirty" ? "TRIM: DEAD" : p.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend & Physical Rule Callout */}
      <div
        style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: "1px solid #1e293b",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 13,
        }}
      >
        <div style={{ display: "flex", gap: 18 }}>
          <span style={{ color: C.cyan, fontWeight: 700 }}>■ ACTIVE (VALID)</span>
          <span style={{ color: C.red, fontWeight: 700 }}>■ DIRTY (DELETED IN OS)</span>
          <span style={{ color: "#64748b", fontWeight: 700 }}>□ FREE (CLEAN)</span>
        </div>
        <div style={{ color: C.amber, fontWeight: 800 }}>
          RULE: PAGES WRITE (16KB) · BLOCKS ERASE (4MB)
        </div>
      </div>
    </div>
  );
};

/** 6. DOCUMENTARY TOP PROGRESS BAR
 *  Consistent, cinematic top progress bar that indicates the current technical
 *  chapter/beat across all shorts without visual noise.
 */
export const DocumentaryProgressBar: React.FC<{
  totalBeats: number;
  currentBeat: number;
  title: string;
  topicKicker?: string;
}> = ({
  totalBeats,
  currentBeat,
  title,
  topicKicker = "TECHNICAL DEMONSTRATION",
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 32,
        left: 48,
        right: 48,
        zIndex: 90,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        fontFamily: F.mono,
      }}
    >
      {/* Title & Metadata Top Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: C.cyan, fontWeight: 800, letterSpacing: 2 }}>
            {topicKicker}
          </span>
          <span style={{ color: "#334155" }}>//</span>
          <span style={{ fontSize: 13, color: "#FFFFFF", fontWeight: 900, letterSpacing: 1 }}>
            {title}
          </span>
        </div>
        <div style={{ fontSize: 13, color: C.dim, fontWeight: 800 }}>
          STAGE {currentBeat + 1} / {totalBeats}
        </div>
      </div>

      {/* Segmented Micro-Bars */}
      <div style={{ display: "flex", gap: 6, width: "100%", height: 5 }}>
        {Array.from({ length: totalBeats }).map((_, i) => {
          const isDone = i < currentBeat;
          const isCurrent = i === currentBeat;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                borderRadius: 3,
                background: isDone
                  ? C.cyan
                  : isCurrent
                  ? `linear-gradient(90deg, ${C.cyan} 0%, ${C.amber} 100%)`
                  : "#1e293b",
                boxShadow: isCurrent ? `0 0 10px ${C.cyan}` : isDone ? `0 0 4px ${C.cyan}66` : "none",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

/** 7. CINEMATIC STAGE CONTAINER
 *  Provides smooth continuous camera breathing, CRT scanline, and safe area margins
 *  so all visual elements fill the 1080x1920 mobile portrait frame properly.
 */
export const CinematicStage: React.FC<{
  children: React.ReactNode;
  subtitle: string;
  sourceNote?: string;
  totalBeats?: number;
  currentBeat?: number;
  title?: string;
}> = ({
  children,
  subtitle,
  sourceNote = "HARDWARE TEST LABS & SILICON BENCHMARKS",
  totalBeats = 7,
  currentBeat = 0,
  title = "TECHNICAL BREAKDOWN",
}) => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const t = frame / fps;

  const driftY = Math.sin(t * 1.2) * 5;
  const slowZoom = 1.0 + (t / 20) * 0.03;
  const scanY = (frame * 5.5) % (h - 80);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#030712",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: F.mono,
        color: "#F8FAFC",
        overflow: "hidden",
      }}
    >
      {/* Top Documentary Progress Bar */}
      <DocumentaryProgressBar
        totalBeats={totalBeats}
        currentBeat={currentBeat}
        title={title}
      />

      {/* Sweeping CRT Scanline Beam */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: scanY,
          height: 6,
          background: "linear-gradient(180deg, rgba(34,211,238,0) 0%, rgba(34,211,238,0.25) 50%, rgba(34,211,238,0) 100%)",
          boxShadow: "0 0 18px rgba(34,211,238,0.4)",
          pointerEvents: "none",
          zIndex: 80,
        }}
      />

      {/* Central Technical Demonstration Stage with Smooth Cinematic Camera */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: w,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "90px 48px 120px 48px",
          transform: `scale(${slowZoom}) translateY(${driftY}px)`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>

      {/* Bottom Subtitle & Source Banner */}
      <div
        style={{
          position: "absolute",
          bottom: 36,
          left: 48,
          right: 48,
          zIndex: 85,
          background: "rgba(11,17,32,0.92)",
          border: "1.5px solid #1e293b",
          borderRadius: 18,
          padding: "16px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
        }}
      >
        <div style={{ fontSize: 12, color: C.cyan, fontWeight: 800, letterSpacing: 2 }}>
          {sourceNote}
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#FFFFFF",
            letterSpacing: 0.5,
            lineHeight: 1.3,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
};
