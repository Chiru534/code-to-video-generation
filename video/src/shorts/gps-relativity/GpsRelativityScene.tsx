import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../../theme";

export interface GpsRelativitySceneProps {
  beat: number;
  subtitle: string;
  sourceNote?: string;
}

export const ShortGpsRelativityScene: React.FC<GpsRelativitySceneProps> = ({
  beat,
  subtitle,
  sourceNote = "US NAVAL RESEARCH LABORATORY & EINSTEIN FIELD EQUATIONS",
}) => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const t = frame / fps;

  const enter = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
  const driftY = Math.sin(t * 1.5) * 4;
  const slowZoom = 1.0 + (t / 18) * 0.025;
  const scanY = (frame * 5.2) % (h - 96);

  // Dynamic relativistic drift ticker
  const liveDriftNs = (t * 444).toFixed(0);

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
        {/* Orbital Ephemeris telemetry stream */}
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
              {`SVN-${(40 + i)} : ALT=20180km V_ORB=3.874km/s Δt_SR=-7.2μs Δt_GR=+45.6μs NET=+38.4μs/day DRIFT=${liveDriftNs}ns`}
            </div>
          ))}
        </div>

        {/* Sweeping CRT beam */}
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
          {/* Header */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #1e293b", paddingBottom: 24 }}>
            <div style={{ fontSize: 17, color: C.cyan, letterSpacing: 4, fontWeight: 800 }}>
              SATELLITE ORBITAL MECHANICS &amp; GENERAL RELATIVITY
            </div>
            <div
              style={{
                fontFamily: "'Times New Roman', Times, Georgia, serif",
                fontSize: 58,
                fontWeight: 900,
                letterSpacing: 2,
                color: "#FFFFFF",
                marginTop: 8,
                textTransform: "uppercase",
                lineHeight: 1.1,
              }}
            >
              GPS RELATIVITY
            </div>
            <div style={{ fontSize: 30, color: C.amber, fontStyle: "italic", fontWeight: 800, marginTop: 8 }}>
              (why time ticks faster in orbit)
            </div>
          </div>

          {/* Central Technical Stage */}
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
            {/* Beat 0: The Myth */}
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
                  THE MYTH: "SIMPLE GEOMETRIC TRIANGULATION"
                </div>
                <div
                  style={{
                    width: 440,
                    height: 280,
                    background: "#1e293b",
                    borderRadius: 24,
                    border: "2px solid #334155",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                  }}
                >
                  <div style={{ fontSize: 72 }}>🛰️ 📡 📱</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#94a3b8", marginTop: 12 }}>
                    EUCLIDEAN SPHERES
                  </div>
                  <div style={{ fontSize: 16, color: "#38bdf8", marginTop: 6 }}>
                    Assumed: Static Clocks &amp; Classical Distance
                  </div>
                </div>
                <div style={{ color: C.cyan, fontSize: 18, marginTop: 20, fontWeight: 700 }}>
                  ASSUMES TIME FLOWS EQUALLY EVERYWHERE
                </div>
              </div>
            )}

            {/* Beat 1: The Reality */}
            {beat === 1 && (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    background: "rgba(34, 197, 94, 0.15)",
                    border: "2px solid #22c55e",
                    borderRadius: 14,
                    padding: "12px 24px",
                    color: "#22c55e",
                    fontSize: 20,
                    fontWeight: 800,
                    marginBottom: 26,
                  }}
                >
                  THE REALITY: NEWTON DRIFTS 10+ KM DAILY
                </div>
                <div
                  style={{
                    width: 480,
                    padding: "24px 32px",
                    background: "#1e293b",
                    borderRadius: 24,
                    border: "2px solid #334155",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                  }}
                >
                  <div style={{ fontSize: 18, color: "#94a3b8", fontWeight: 700 }}>
                    POSITION ERROR ACCUMULATION
                  </div>
                  <div style={{ fontSize: 64, fontWeight: 900, color: "#f87171", margin: "10px 0" }}>
                    +11.4 km
                  </div>
                  <div style={{ fontSize: 18, color: C.amber, fontWeight: 700 }}>
                    EVERY SINGLE 24 HOURS
                  </div>
                  <div style={{ fontSize: 15, color: "#cbd5e1", marginTop: 12, textAlign: "center" }}>
                    Without relativity, maps become unusable in under 2 hours.
                  </div>
                </div>
              </div>
            )}

            {/* Beat 2: Special Relativity (Speed slows clocks) */}
            {beat === 2 && (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    background: "rgba(56, 189, 248, 0.15)",
                    border: "2px solid #38bdf8",
                    borderRadius: 14,
                    padding: "12px 24px",
                    color: "#38bdf8",
                    fontSize: 20,
                    fontWeight: 800,
                    marginBottom: 26,
                  }}
                >
                  SPECIAL RELATIVITY: ORBITAL VELOCITY
                </div>
                <div
                  style={{
                    width: 500,
                    padding: "24px 30px",
                    background: "#0f172a",
                    borderRadius: 20,
                    border: "2px solid #1e293b",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 16, color: "#94a3b8" }}>ORBIT SPEED:</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#38bdf8" }}>3.874 km / s</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                    <span style={{ fontSize: 16, color: "#94a3b8" }}>TIME DILATION FACTOR:</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: C.amber }}>√(1 - v²/c²)</span>
                  </div>
                  <div style={{ height: 2, background: "#334155", margin: "16px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 18, color: "#f87171", fontWeight: 800 }}>CLOCK SLOWDOWN:</span>
                    <span style={{ fontSize: 28, fontWeight: 900, color: "#f87171" }}>-7.2 μs / day</span>
                  </div>
                </div>
                <div style={{ color: "#94a3b8", fontSize: 16, marginTop: 16, textAlign: "center" }}>
                  Satellites move faster than Earth ground, ticking slower.
                </div>
              </div>
            )}

            {/* Beat 3: General Relativity (Weaker gravity speeds clocks) */}
            {beat === 3 && (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    background: "rgba(168, 85, 247, 0.15)",
                    border: "2px solid #a855f7",
                    borderRadius: 14,
                    padding: "12px 24px",
                    color: "#a855f7",
                    fontSize: 20,
                    fontWeight: 800,
                    marginBottom: 26,
                  }}
                >
                  GENERAL RELATIVITY: GRAVITATIONAL DILATION
                </div>
                <div
                  style={{
                    width: 500,
                    padding: "24px 30px",
                    background: "#0f172a",
                    borderRadius: 20,
                    border: "2px solid #1e293b",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 16, color: "#94a3b8" }}>ORBIT ALTITUDE:</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#a855f7" }}>20,180 km</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                    <span style={{ fontSize: 16, color: "#94a3b8" }}>GRAVITATIONAL POTENTIAL:</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: C.cyan }}>~4× Weaker Gravity</span>
                  </div>
                  <div style={{ height: 2, background: "#334155", margin: "16px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 18, color: "#22c55e", fontWeight: 800 }}>CLOCK SPEEDUP:</span>
                    <span style={{ fontSize: 28, fontWeight: 900, color: "#22c55e" }}>+45.6 μs / day</span>
                  </div>
                </div>
                <div style={{ color: "#94a3b8", fontSize: 16, marginTop: 16, textAlign: "center" }}>
                  Clocks deep in gravitational wells run slower than high-altitude clocks.
                </div>
              </div>
            )}

            {/* Beat 4: Net Relativistic Balance */}
            {beat === 4 && (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    background: "rgba(245, 158, 11, 0.15)",
                    border: "2px solid #f59e0b",
                    borderRadius: 14,
                    padding: "12px 24px",
                    color: "#f59e0b",
                    fontSize: 20,
                    fontWeight: 800,
                    marginBottom: 26,
                  }}
                >
                  NET TIME ACCELERATION ARITHMETIC
                </div>
                <div
                  style={{
                    width: 500,
                    padding: "24px 30px",
                    background: "#0f172a",
                    borderRadius: 20,
                    border: "2px solid #1e293b",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 16, color: "#22c55e" }}>GRAVITATIONAL GAIN (GR):</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: "#22c55e" }}>+45.6 μs</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                    <span style={{ fontSize: 16, color: "#f87171" }}>VELOCITY LOSS (SR):</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: "#f87171" }}>-7.2 μs</span>
                  </div>
                  <div style={{ height: 2, background: "#334155", margin: "16px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 18, color: C.amber, fontWeight: 900 }}>NET DAILY GAIN:</span>
                    <span style={{ fontSize: 32, fontWeight: 900, color: C.amber }}>+38.4 μs / day</span>
                  </div>
                </div>
              </div>
            )}

            {/* Beat 5: Error Multiplication */}
            {beat === 5 && (
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
                  SPEED OF LIGHT MULTIPLIER: Δd = c × Δt
                </div>
                <div
                  style={{
                    width: 480,
                    padding: "24px 32px",
                    background: "#1e293b",
                    borderRadius: 24,
                    border: "2px solid #334155",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: 16, color: "#94a3b8" }}>300,000 km/s × 38.4 μs =</div>
                  <div style={{ fontSize: 56, fontWeight: 900, color: "#f87171", margin: "12px 0" }}>
                    11.4 KILOMETERS
                  </div>
                  <div style={{ fontSize: 16, color: C.amber, fontWeight: 700 }}>
                    FALSE DISTANCE MEASURED EVERY 24 HOURS
                  </div>
                </div>
              </div>
            )}

            {/* Beat 6: Factory Detuning Solution */}
            {beat === 6 && (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    background: "rgba(34, 197, 94, 0.15)",
                    border: "2px solid #22c55e",
                    borderRadius: 14,
                    padding: "12px 24px",
                    color: "#22c55e",
                    fontSize: 20,
                    fontWeight: 800,
                    marginBottom: 26,
                  }}
                >
                  THE FIX: FACTORY DETUNED ATOMIC CLOCKS
                </div>
                <div
                  style={{
                    width: 500,
                    padding: "24px 30px",
                    background: "#0f172a",
                    borderRadius: 20,
                    border: "2px solid #1e293b",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 15, color: "#94a3b8" }}>TARGET ON EARTH:</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#22c55e" }}>10.23000000000 MHz</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                    <span style={{ fontSize: 15, color: "#94a3b8" }}>PRE-LAUNCH TUNING:</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: C.cyan }}>10.22999999543 MHz</span>
                  </div>
                  <div style={{ height: 2, background: "#334155", margin: "16px 0" }} />
                  <div style={{ fontSize: 16, color: C.amber, textAlign: "center", fontWeight: 700 }}>
                    Relativity speeds it up to exactly 10.23 MHz once in orbit!
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Subtitle */}
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid #334155",
              borderRadius: 16,
              padding: "18px 24px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div style={{ fontSize: 18, color: "#F8FAFC", fontWeight: 700, lineHeight: 1.4 }}>
              {subtitle}
            </div>
            <div style={{ fontSize: 13, color: C.amber, marginTop: 8, letterSpacing: 1.5, fontWeight: 600 }}>
              {sourceNote}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
