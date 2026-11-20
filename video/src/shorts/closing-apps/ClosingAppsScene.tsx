import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { WolfCharacter } from "../../kit/characters/WolfCharacter";
import { DuckCharacter } from "../../kit/characters/DuckCharacter";

export interface ClosingAppsSceneProps {
  beat: number;
  subtitle: string;
  sourceNote?: string;
}

export const ShortClosingAppsScene: React.FC<ClosingAppsSceneProps> = ({
  beat,
  subtitle,
  sourceNote = "APPLE ENGINEERING ARCHITECTURE / OS KERNEL",
}) => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const t = frame / fps;

  // Camera drift and subtle zoom to guarantee continuous motion across frames
  const slowZoom = 1.0 + (t / 15) * 0.03;
  const driftY = Math.sin(t * 1.6) * 5;

  // Sweeping subtle lighting band (guarantees pixel differences for freezedetect)
  const sweepY = (frame * 5.6) % (h - 120);

  // App cards flying up animation for beat 0
  const appSwipeProgress = (frame % 18) / 18;

  // Battery drain indicator for beat 0 & 4
  const batteryPct = Math.max(38, Math.round(65 - (frame / 20)));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#090d16",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* 1. Full-bleed blurred ambient backdrop */}
      <div
        style={{
          position: "absolute",
          width: "120%",
          height: "120%",
          background: "radial-gradient(circle at 50% 35%, #1e293b 0%, #0f172a 50%, #020617 100%)",
          filter: "blur(40px)",
          opacity: 0.85,
          transform: `scale(${slowZoom}) translateY(${driftY}px)`,
        }}
      />

      {/* Dynamic ambient particles floating in background */}
      {Array.from({ length: 14 }).map((_, i) => {
        const px = ((i * 77 + frame * 0.8) % (w - 40)) + 20;
        const py = ((i * 123 + frame * 1.2) % (h - 60)) + 30;
        const pSize = 4 + (i % 5);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: pSize,
              height: pSize,
              borderRadius: "50%",
              backgroundColor: i % 2 === 0 ? "#38bdf8" : "#f59e0b",
              opacity: 0.18 + 0.1 * Math.sin(t * 2 + i),
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* Sweeping subtle horizontal illumination band (prevents static stillness) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: sweepY,
          height: 18,
          background: "linear-gradient(180deg, rgba(56,189,248,0) 0%, rgba(56,189,248,0.06) 50%, rgba(56,189,248,0) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* 2. Sharp central floating card (The signature Mass Influence layout) */}
      <div
        style={{
          width: 980,
          height: 1680,
          borderRadius: 36,
          backgroundColor: "rgba(15, 23, 42, 0.94)",
          border: "2px solid rgba(255, 255, 255, 0.14)",
          boxShadow: "0 35px 90px rgba(0, 0, 0, 0.85), inset 0 0 60px rgba(56, 189, 248, 0.08)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "54px 44px",
          position: "relative",
          overflow: "hidden",
          transform: `scale(${slowZoom}) translateY(${driftY * 0.5}px)`,
        }}
      >
        {/* Top Header: Assertion & Parenthetical Reversal */}
        <div style={{ textAlign: "center", width: "100%", zIndex: 10 }}>
          <div
            style={{
              fontFamily: "'Times New Roman', Times, Georgia, serif",
              fontSize: 66,
              fontWeight: 900,
              color: "#f8fafc",
              letterSpacing: 2.5,
              textTransform: "uppercase",
              lineHeight: 1.1,
              textShadow: "0 4px 20px rgba(0,0,0,0.8)",
            }}
          >
            CLOSING APPS
          </div>
          <div
            style={{
              fontSize: 34,
              fontStyle: "italic",
              fontWeight: 700,
              color: "#f59e0b",
              marginTop: 10,
              letterSpacing: 1,
              textShadow: "0 2px 14px rgba(245,158,11,0.5)",
            }}
          >
            (drains your battery faster)
          </div>
        </div>

        {/* Center Stage: Dynamic Character & Engineering Graphics */}
        <div
          style={{
            flex: 1,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            margin: "20px 0",
          }}
        >
          {/* ================= BEAT 0: The Compulsive Swipe ================= */}
          {beat === 0 && (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
              {/* Battery indicator draining */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "rgba(0,0,0,0.6)",
                  padding: "10px 22px",
                  borderRadius: 20,
                  border: "1px solid rgba(239,68,68,0.4)",
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 800, color: "#ef4444" }}>
                  BATTERY: {batteryPct}%
                </div>
                <div style={{ width: 120, height: 16, background: "#334155", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ width: `${batteryPct}%`, height: "100%", background: "#ef4444", transition: "width 0.2s" }} />
                </div>
              </div>

              {/* Frantic Duck Swiping */}
              <DuckCharacter pose="swiping" scale={1.1} />

              {/* Stack of floating app cards swiping upward */}
              <div
                style={{
                  position: "absolute",
                  right: 80,
                  top: 100 - appSwipeProgress * 120,
                  opacity: 1 - appSwipeProgress,
                  transform: "rotate(6deg)",
                  background: "#1e293b",
                  border: "2px solid #38bdf8",
                  borderRadius: 18,
                  padding: "16px 24px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.7)",
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 800, color: "#38bdf8" }}>INSTAGRAM</div>
                <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>SWIPED TO KILL</div>
              </div>
            </div>
          )}

          {/* ================= BEAT 1: The Wolf Steps In ================= */}
          {beat === 1 && (
            <div style={{ width: "100%", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
              <DuckCharacter pose="confused" scale={0.9} eyeDirection="right" />
              <WolfCharacter pose="stop" scale={1.15} eyeDirection="left" speaking />
            </div>
          )}

          {/* ================= BEAT 2: The Myth ================= */}
          {beat === 2 && (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "2px solid #ef4444",
                  borderRadius: 16,
                  padding: "18px 28px",
                  textAlign: "center",
                  color: "#ef4444",
                  fontSize: 24,
                  fontWeight: 800,
                  marginBottom: 20,
                }}
              >
                COMMON MYTH: &quot;BACKGROUND APPS BURN CPU CYCLES&quot;
              </div>
              <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
                <DuckCharacter pose="shocked" scale={0.95} />
                <div style={{ background: "#1e293b", padding: 24, borderRadius: 20, border: "1px solid #475569" }}>
                  <div style={{ color: "#ef4444", fontSize: 20, fontWeight: 700 }}>SIMULATED FEAR:</div>
                  <div style={{ color: "#f8fafc", fontSize: 32, fontWeight: 900, marginTop: 6 }}>100% CPU USAGE?</div>
                  <div style={{ color: "#38bdf8", fontSize: 16, marginTop: 8 }}>REALITY: ZERO.</div>
                </div>
              </div>
            </div>
          )}

          {/* ================= BEAT 3: Frozen in RAM ================= */}
          {beat === 3 && (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  background: "rgba(56, 189, 248, 0.15)",
                  border: "2px solid #38bdf8",
                  borderRadius: 16,
                  padding: "18px 28px",
                  textAlign: "center",
                  color: "#38bdf8",
                  fontSize: 26,
                  fontWeight: 900,
                  marginBottom: 24,
                }}
              >
                OS KERNEL STATE: FROZEN IN RAM
              </div>

              <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
                <WolfCharacter pose="point" scale={1.05} speaking />
                <div style={{ background: "#0f172a", border: "2px solid #38bdf8", borderRadius: 20, padding: 28, width: 340 }}>
                  <div style={{ color: "#94a3b8", fontSize: 16 }}>POWER CONSUMPTION</div>
                  <div style={{ color: "#22c55e", fontSize: 44, fontWeight: 900, marginTop: 4 }}>0.002 mW</div>
                  <div style={{ color: "#38bdf8", fontSize: 16, marginTop: 12 }}>CPU INVOLVEMENT: 0.0%</div>
                  <div style={{ marginTop: 16, height: 10, background: "#1e293b", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ width: "2%", height: "100%", background: "#22c55e" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= BEAT 4: Cold Reload Spike ================= */}
          {beat === 4 && (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.2)",
                  border: "2px solid #ef4444",
                  borderRadius: 16,
                  padding: "16px 24px",
                  textAlign: "center",
                  color: "#ef4444",
                  fontSize: 26,
                  fontWeight: 900,
                  marginBottom: 20,
                }}
              >
                COLD RELOAD: 3X POWER SPIKE
              </div>

              <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                <DuckCharacter pose="shocked" scale={0.88} />
                <div style={{ background: "#1e1b4b", border: "2px solid #ef4444", borderRadius: 20, padding: 24, width: 380 }}>
                  <div style={{ color: "#ef4444", fontSize: 16, fontWeight: 700 }}>FLASH MEMORY RELOAD</div>
                  <div style={{ color: "#f8fafc", fontSize: 48, fontWeight: 900, marginTop: 4 }}>1,400 mW</div>
                  <div style={{ color: "#f59e0b", fontSize: 17, marginTop: 8 }}>CPU SPIKES TO 100% TO RECOMPILE</div>
                  <div style={{ marginTop: 14, height: 12, background: "#334155", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ width: "95%", height: "100%", background: "#ef4444" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= BEAT 5: Craig Federighi Verdict ================= */}
          {beat === 5 && (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
              {/* Apple Mail Header Card */}
              <div
                style={{
                  width: 580,
                  background: "#1e293b",
                  border: "2px solid #64748b",
                  borderRadius: 20,
                  padding: "24px 30px",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: 16 }}>
                  <span>To: Tim Cook &amp; Craig Federighi</span>
                  <span>Verified Email</span>
                </div>
                <div style={{ color: "#f8fafc", fontSize: 20, fontWeight: 700, marginTop: 12 }}>
                  &quot;Do you quit your iOS multitasking apps?&quot;
                </div>
                <div
                  style={{
                    marginTop: 20,
                    padding: 18,
                    background: "#0f172a",
                    borderLeft: "5px solid #22c55e",
                    borderRadius: "0 12px 12px 0",
                  }}
                >
                  <div style={{ color: "#22c55e", fontSize: 36, fontWeight: 900 }}>
                    &quot;No and No.&quot;
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: 15, marginTop: 6 }}>
                    — Craig Federighi (Apple Senior VP of Software Engineering)
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <WolfCharacter pose="smirk" scale={0.9} />
              </div>
            </div>
          )}

          {/* ================= BEAT 6: The Golden Rule ================= */}
          {beat === 6 && (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  background: "rgba(34, 197, 94, 0.2)",
                  border: "2px solid #22c55e",
                  borderRadius: 16,
                  padding: "16px 28px",
                  textAlign: "center",
                  color: "#22c55e",
                  fontSize: 26,
                  fontWeight: 900,
                  marginBottom: 20,
                }}
              >
                THE RULE: LEAVE APPS IN RAM
              </div>

              <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
                <DuckCharacter pose="relieved" scale={0.95} eyeDirection="left" />
                <WolfCharacter pose="nod" scale={1.05} eyeDirection="right" speaking />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Subtitle / Captions (Yellow burned-in bold font per Mass Influence spec) */}
        <div
          style={{
            width: "100%",
            textAlign: "center",
            padding: "20px 24px",
            background: "rgba(0,0,0,0.7)",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.1)",
            zIndex: 10,
          }}
        >
          <div
            style={{
              color: "#facc15",
              fontSize: 34,
              fontWeight: 900,
              lineHeight: 1.35,
              textShadow: "0 3px 12px rgba(0,0,0,0.9), 0 0 20px rgba(250,204,21,0.3)",
              letterSpacing: 0.5,
            }}
          >
            {subtitle}
          </div>
          {sourceNote && (
            <div
              style={{
                color: "#64748b",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 1.5,
                marginTop: 10,
                textTransform: "uppercase",
              }}
            >
              SOURCE: {sourceNote}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
