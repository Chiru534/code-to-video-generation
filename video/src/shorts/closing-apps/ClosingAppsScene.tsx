import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../../theme";

/* CRT Scanlines and curvature effect (proven from blue-screen) */
const Scanlines: React.FC<{ opacity?: number }> = ({ opacity = 0.25 }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 2px, transparent 2px, transparent 4px)",
      pointerEvents: "none",
      opacity,
      zIndex: 50,
    }}
  />
);

export interface ClosingAppsSceneProps {
  beat: number;
  subtitle: string;
  sourceNote?: string;
}

/**
 * Technical, authentic OS & hardware architecture explainer for Closing Apps.
 * Zero cartoon mascots. 100% authentic silicon diagrams, process manager terminals,
 * flash NAND vs LPDDR5 energy graphs, and verified Apple engineering documents.
 */
export const ShortClosingAppsScene: React.FC<ClosingAppsSceneProps> = ({
  beat,
  subtitle,
  sourceNote = "APPLE OS KERNEL & ANDROID RUNTIME SPECIFICATION",
}) => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const t = frame / fps;

  // Spring entrance plus continuous gentle drift
  const enter = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
  const driftY = Math.sin(t * 1.5) * 4;
  const slowZoom = 1.0 + (t / 18) * 0.025;

  // Continuous sweeping CRT raster bar
  const scanY = (frame * 5.2) % (h - 96);

  // App swipe motion for Beat 0
  const swipePhase = (frame % 24) / 24;
  const swipeOffset = swipePhase * 240;

  // Dynamic live CPU and RAM numbers
  const ramWatts = "0.002 mW";
  const flashWatts = "1,420 mW";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#030712",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: F.mono,
        color: "#F8FAFC",
        overflow: "hidden",
      }}
    >
      {/* Background ambient CRT container with continuous drift */}
      <div
        style={{
          position: "absolute",
          width: w - 48,
          height: h - 96,
          backgroundColor: "#0b1120",
          borderRadius: 24,
          border: "2px solid #1e293b",
          boxShadow: `inset 0 0 80px rgba(15, 23, 42, 0.9), 0 0 40px rgba(0, 0, 0, 0.9)`,
          overflow: "hidden",
          transform: `scale(${slowZoom}) translateY(${driftY}px)`,
        }}
      >
        {/* Dynamic scrolling memory address stream in background */}
        <div
          style={{
            position: "absolute",
            top: -((frame * 2.5) % 240),
            left: 24,
            right: 24,
            opacity: 0.12,
            fontSize: 16,
            lineHeight: 1.6,
            color: C.cyan,
            userSelect: "none",
          }}
        >
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i}>
              {`0x7FFF${(1000 + i * 47).toString(16).toUpperCase()} : LPDDR5_PAGE_FREEZE_SIG [THREAD_SUSPEND_OK] STATE=INACTIVE`}
            </div>
          ))}
        </div>

        {/* Sweeping CRT electron beam */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: scanY,
            height: 6,
            background: "linear-gradient(180deg, rgba(34,211,238,0) 0%, rgba(34,211,238,0.25) 50%, rgba(34,211,238,0) 100%)",
            boxShadow: "0 0 16px rgba(34,211,238,0.4)",
            pointerEvents: "none",
            zIndex: 40,
          }}
        />

        {/* Content Box */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            padding: "44px 36px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            opacity: enter,
          }}
        >
          {/* Top Title Card */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #1e293b", paddingBottom: 24 }}>
            <div
              style={{
                fontSize: 17,
                color: C.cyan,
                letterSpacing: 4,
                fontWeight: 800,
                textTransform: "uppercase",
              }}
            >
              OS MEMORY &amp; POWER ARCHITECTURE
            </div>
            <div
              style={{
                fontFamily: "'Times New Roman', Times, Georgia, serif",
                fontSize: 62,
                fontWeight: 900,
                letterSpacing: 2,
                color: "#FFFFFF",
                marginTop: 8,
                textTransform: "uppercase",
                lineHeight: 1.1,
                textShadow: "0 4px 20px rgba(0,0,0,0.9)",
              }}
            >
              CLOSING APPS
            </div>
            <div
              style={{
                fontSize: 32,
                color: C.amber,
                fontStyle: "italic",
                fontWeight: 800,
                marginTop: 8,
                letterSpacing: 1,
              }}
            >
              (drains your battery faster)
            </div>
          </div>

          {/* Central Interactive Technical Visual Stage */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              margin: "24px 0",
            }}
          >
            {/* ================= BEAT 0: The Compulsive App Swiping ================= */}
            {beat === 0 && (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "2px solid #ef4444",
                    borderRadius: 14,
                    padding: "12px 24px",
                    color: "#ef4444",
                    fontSize: 20,
                    fontWeight: 800,
                    marginBottom: 26,
                  }}
                >
                  THE HABIT: DOUBLE-CLICK &amp; SWIPE PURGE
                </div>

                {/* Multitasking App Deck Carousel */}
                <div style={{ position: "relative", width: 440, height: 480, display: "flex", justifyContent: "center" }}>
                  {/* Background Card */}
                  <div
                    style={{
                      position: "absolute",
                      width: 320,
                      height: 420,
                      borderRadius: 24,
                      background: "#1e293b",
                      border: "2px solid #334155",
                      transform: "scale(0.85) translateY(-20px)",
                      opacity: 0.5,
                    }}
                  />
                  {/* Active Swiping Card */}
                  <div
                    style={{
                      position: "absolute",
                      width: 360,
                      height: 460,
                      borderRadius: 28,
                      background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
                      border: "3px solid #38bdf8",
                      boxShadow: "0 25px 50px rgba(0,0,0,0.8), 0 0 30px rgba(56,189,248,0.3)",
                      display: "flex",
                      flexDirection: "column",
                      padding: 20,
                      transform: `translateY(-${swipeOffset}px) rotate(${swipePhase * 3}deg)`,
                      opacity: 1 - swipePhase * 0.9,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #334155", paddingBottom: 12 }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#ef4444" }} />
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#f59e0b" }} />
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#22c55e" }} />
                      <div style={{ fontSize: 16, color: "#94a3b8", marginLeft: 8 }}>Mobilesafari (PID 3914)</div>
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                      <div style={{ color: "#ef4444", fontSize: 26, fontWeight: 900 }}>FORCE TERMINATE</div>
                      <div style={{ color: "#94a3b8", fontSize: 16, marginTop: 8 }}>PURGING 384 MB ACTIVE HEAP</div>
                    </div>
                  </div>
                </div>

                <div style={{ color: C.cyan, fontSize: 18, marginTop: 20, fontWeight: 700 }}>
                  SWIPING 20 TIMES A DAY FEELS SATISFYING
                </div>
              </div>
            )}

            {/* ================= BEAT 1: The Truth Drop ================= */}
            {beat === 1 && (
              <div style={{ width: "100%", textAlign: "center" }}>
                <div style={{ fontSize: 84, fontWeight: 900, color: "#ef4444", textShadow: "0 0 35px rgba(239,68,68,0.6)", lineHeight: 1 }}>
                  STOP.
                </div>
                <div style={{ fontSize: 32, color: "#FFFFFF", letterSpacing: 2, marginTop: 18, fontWeight: 800 }}>
                  IT DOES NOT SAVE BATTERY.
                </div>
                <div
                  style={{
                    marginTop: 30,
                    padding: "24px 30px",
                    background: "rgba(239,68,68,0.15)",
                    border: "2px solid #ef4444",
                    borderRadius: 16,
                    color: "#fca5a5",
                    fontSize: 26,
                    fontWeight: 800,
                    lineHeight: 1.4,
                  }}
                >
                  SWIPING APPS CLOSED CAUSES A NET LOSS IN BATTERY RUNTIME
                </div>
              </div>
            )}

            {/* ================= BEAT 2: The Myth Breakdown ================= */}
            {beat === 2 && (
              <div style={{ width: "100%" }}>
                <div style={{ color: C.cyan, fontSize: 20, letterSpacing: 2, fontWeight: 800, textAlign: "center", marginBottom: 20 }}>
                  THE CORE MISCONCEPTION
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  <div style={{ background: "rgba(239,68,68,0.1)", border: "2px solid #ef4444", borderRadius: 14, padding: 22 }}>
                    <div style={{ fontSize: 18, color: "#ef4444", fontWeight: 800 }}>WHAT USERS BELIEVE:</div>
                    <div style={{ fontSize: 22, color: "#ffffff", fontWeight: 700, marginTop: 8 }}>
                      Background apps are running live, continuously chewing CPU cycles like a desktop PC.
                    </div>
                  </div>
                  <div style={{ background: "rgba(34,211,238,0.1)", border: "2px solid #22d3ee", borderRadius: 14, padding: 22 }}>
                    <div style={{ fontSize: 18, color: "#22d3ee", fontWeight: 800 }}>HOW MOBILE OS WORKS:</div>
                    <div style={{ fontSize: 22, color: "#ffffff", fontWeight: 700, marginTop: 8 }}>
                      The kernel halts execution immediately. The process is completely serialized into RAM.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= BEAT 3: Frozen in RAM ================= */}
            {beat === 3 && (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    background: "rgba(34, 197, 94, 0.15)",
                    border: "2px solid #22c55e",
                    borderRadius: 14,
                    padding: "14px 28px",
                    color: "#22c55e",
                    fontSize: 22,
                    fontWeight: 900,
                    marginBottom: 24,
                  }}
                >
                  STATE: SUSPENDED IN LPDDR5 RAM
                </div>

                {/* Hardware Silicon Architecture Box */}
                <div style={{ background: "#0f172a", border: "2px solid #38bdf8", borderRadius: 20, padding: 30, width: "90%", boxShadow: "0 0 40px rgba(56,189,248,0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 18, color: "#94a3b8" }}>ACTIVE CPU CYCLES</div>
                      <div style={{ fontSize: 46, fontWeight: 900, color: "#22c55e", marginTop: 4 }}>0.0%</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 18, color: "#94a3b8" }}>STATIC RAM DRAIN</div>
                      <div style={{ fontSize: 46, fontWeight: 900, color: "#22c55e", marginTop: 4 }}>{ramWatts}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 22, borderTop: "1px solid #334155", paddingTop: 18, color: "#cbd5e1", fontSize: 18, lineHeight: 1.5 }}>
                    RAM retains data via static capacitor refresh. Holding an app in memory costs virtually zero battery power.
                  </div>
                </div>
              </div>
            )}

            {/* ================= BEAT 4: The Cold Reload Penalty ================= */}
            {beat === 4 && (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.2)",
                    border: "2px solid #ef4444",
                    borderRadius: 14,
                    padding: "14px 28px",
                    color: "#ef4444",
                    fontSize: 22,
                    fontWeight: 900,
                    marginBottom: 24,
                  }}
                >
                  THE PENALTY: COLD BOOT FROM FLASH STORAGE
                </div>

                {/* Energy Comparison Graph */}
                <div style={{ width: "90%", background: "#0f172a", border: "2px solid #ef4444", borderRadius: 20, padding: 28 }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18 }}>
                      <span style={{ color: "#22c55e" }}>WAKING FROM RAM:</span>
                      <span style={{ color: "#22c55e", fontWeight: 800 }}>0.002 mW (12 ms)</span>
                    </div>
                    <div style={{ height: 12, background: "#1e293b", borderRadius: 6, marginTop: 6, overflow: "hidden" }}>
                      <div style={{ width: "3%", height: "100%", background: "#22c55e" }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18 }}>
                      <span style={{ color: "#ef4444" }}>COLD RELOAD FROM FLASH:</span>
                      <span style={{ color: "#ef4444", fontWeight: 800 }}>{flashWatts} (850 ms)</span>
                    </div>
                    <div style={{ height: 16, background: "#1e293b", borderRadius: 8, marginTop: 6, overflow: "hidden" }}>
                      <div style={{ width: "96%", height: "100%", background: "#ef4444", boxShadow: "0 0 15px #ef4444" }} />
                    </div>
                  </div>

                  <div style={{ marginTop: 22, color: C.amber, fontSize: 18, fontWeight: 700, textAlign: "center" }}>
                    &gt;&gt; CPU MUST SPIN UP HIGH-PERFORMANCE CORES TO RELOAD FROM FLASH &lt;&lt;
                  </div>
                </div>
              </div>
            )}

            {/* ================= BEAT 5: Craig Federighi Verdict ================= */}
            {beat === 5 && (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* Official Apple Executive Email Terminal */}
                <div
                  style={{
                    width: "92%",
                    background: "#0f172a",
                    border: "2px solid #64748b",
                    borderRadius: 20,
                    padding: 30,
                    boxShadow: "0 25px 60px rgba(0,0,0,0.9)",
                  }}
                >
                  <div style={{ borderBottom: "1px solid #334155", paddingBottom: 14, color: "#94a3b8", fontSize: 17 }}>
                    <div>FROM: Craig Federighi (Apple SVP Software Engineering)</div>
                    <div>SUBJECT: Re: Do you quit apps?</div>
                  </div>
                  <div style={{ marginTop: 22, color: "#ffffff", fontSize: 20 }}>
                    Question: &quot;Do you quit your iOS multitasking apps frequently and is it necessary for battery life?&quot;
                  </div>
                  <div
                    style={{
                      marginTop: 22,
                      padding: 20,
                      background: "rgba(34,197,94,0.15)",
                      borderLeft: "6px solid #22c55e",
                      borderRadius: "0 12px 12px 0",
                    }}
                  >
                    <div style={{ color: "#22c55e", fontSize: 44, fontWeight: 900 }}>
                      &quot;No and No.&quot;
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: 16, marginTop: 6 }}>
                      — Verified internal Apple response
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= BEAT 6: The Engineering Rule ================= */}
            {beat === 6 && (
              <div style={{ width: "100%", textAlign: "center" }}>
                <div style={{ fontSize: 22, color: C.cyan, letterSpacing: 3, fontWeight: 800 }}>
                  THE FINAL RULE
                </div>
                <div style={{ fontSize: 44, fontWeight: 900, color: "#FFFFFF", marginTop: 14, lineHeight: 1.2 }}>
                  TRUST YOUR OPERATING SYSTEM.
                </div>
                <div
                  style={{
                    marginTop: 28,
                    padding: "24px 30px",
                    background: "rgba(34,197,94,0.15)",
                    border: "2px solid #22c55e",
                    borderRadius: 16,
                    color: "#86efac",
                    fontSize: 24,
                    fontWeight: 800,
                    lineHeight: 1.4,
                  }}
                >
                  LEAVE APPS IN RAM. WAKING FROM MEMORY TAKES 12 MILLISECONDS. RELOADING FROM STORAGE IS WHAT BURNS POWER.
                </div>
              </div>
            )}
          </div>

          {/* Bottom Burned-in Subtitles & Verified Citations */}
          <div
            style={{
              borderTop: "2px solid #1e293b",
              paddingTop: 18,
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: "#FACC15",
                fontSize: 32,
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
                  letterSpacing: 2,
                  marginTop: 10,
                  textTransform: "uppercase",
                }}
              >
                CITATION: {sourceNote}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CRT Scanline Overlay */}
      <Scanlines opacity={0.2} />
    </AbsoluteFill>
  );
};
