import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../../theme";

export interface AirplaneModeSceneProps {
  beat: number;
  subtitle: string;
  sourceNote?: string;
}

export const ShortAirplaneModeScene: React.FC<AirplaneModeSceneProps> = ({
  beat,
  subtitle,
  sourceNote = "QUALCOMM RF POWER LABS & IEEE CONSUMER ELECTRONICS",
}) => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const t = frame / fps;

  const enter = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
  const driftY = Math.sin(t * 1.5) * 4;
  const slowZoom = 1.0 + (t / 18) * 0.025;
  const scanY = (frame * 5.2) % (h - 96);

  // Dynamic values
  const rfPowerWatts = (1.8 + Math.sin(t * 3) * 0.3).toFixed(2);
  const batteryPct = Math.min(100, Math.floor(42 + t * 0.8));

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
        {/* Dynamic scrolling RF baseband registers */}
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
              {`0x${(0x4000 + i * 0x38).toString(16).toUpperCase()} : REG_RF_PA_STAGE_${i % 4} [TX_PWR=${(20 + (i % 4) * 3).toFixed(1)}dBm] PMIC_VBUS=5.02V`}
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
              POWER MANAGEMENT &amp; RF ARCHITECTURE
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
              AIRPLANE MODE
            </div>
            <div style={{ fontSize: 30, color: C.amber, fontStyle: "italic", fontWeight: 800, marginTop: 8 }}>
              (stops the radio leak)
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
                  THE MYTH: "2X TURBO CHARGING SWITCH"
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
                  <div style={{ fontSize: 72 }}>✈️ ⚡</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#38bdf8", marginTop: 12 }}>
                    AIRPLANE MODE: ON
                  </div>
                  <div style={{ fontSize: 16, color: "#94a3b8", marginTop: 6 }}>
                    Assumed: Wider Electrical Pipeline
                  </div>
                </div>
                <div style={{ color: C.cyan, fontSize: 18, marginTop: 20, fontWeight: 700 }}>
                  FEELS LIKE OPENING A WIDER TAP
                </div>
              </div>
            )}

            {/* Beat 1: The Reversal */}
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
                  THE REALITY: ZERO EXTRA WATTS DRAWN
                </div>
                <div
                  style={{
                    width: 480,
                    background: "#0f172a",
                    border: "2px solid #334155",
                    borderRadius: 20,
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1e293b", paddingBottom: 10 }}>
                    <span style={{ color: "#94a3b8" }}>CHARGER INPUT:</span>
                    <span style={{ color: "#38bdf8", fontWeight: 800 }}>5.00V @ 1.00A (5.0W)</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1e293b", paddingBottom: 10 }}>
                    <span style={{ color: "#94a3b8" }}>PMIC CHARGE DRAW:</span>
                    <span style={{ color: "#f59e0b", fontWeight: 800 }}>IDENTICAL CURRENT</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>SAVINGS MECHANISM:</span>
                    <span style={{ color: "#22c55e", fontWeight: 800 }}>STOPPED RADIO DISSIPATION</span>
                  </div>
                </div>
                <div style={{ color: "#ef4444", fontSize: 18, marginTop: 20, fontWeight: 800 }}>
                  THE CHARGER GIVES THE SAME. RADIOS TAKE LESS.
                </div>
              </div>
            )}

            {/* Beat 2: RF Power Amplification */}
            {beat === 2 && (
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
                  CELLULAR MODEM TRANSMIT POWER (PA)
                </div>
                <div
                  style={{
                    width: 480,
                    background: "#0f172a",
                    border: "2px solid #334155",
                    borderRadius: 20,
                    padding: 24,
                  }}
                >
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16 }}>
                      <span style={{ color: "#22c55e" }}>STRONG SIGNAL (-65 dBm):</span>
                      <span style={{ fontWeight: 800 }}>20 mW</span>
                    </div>
                    <div style={{ height: 12, background: "#1e293b", borderRadius: 6, marginTop: 6, overflow: "hidden" }}>
                      <div style={{ width: "3%", height: "100%", background: "#22c55e" }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16 }}>
                      <span style={{ color: "#ef4444" }}>SEARCHING FOR TOWER (-115 dBm):</span>
                      <span style={{ fontWeight: 800, color: "#ef4444" }}>{rfPowerWatts} Watts</span>
                    </div>
                    <div style={{ height: 16, background: "#1e293b", borderRadius: 8, marginTop: 6, overflow: "hidden" }}>
                      <div style={{ width: "95%", height: "100%", background: "#ef4444", boxShadow: "0 0 12px #ef4444" }} />
                    </div>
                  </div>
                </div>
                <div style={{ color: C.amber, fontSize: 18, marginTop: 20, fontWeight: 800 }}>
                  A 100x SURGE IN RF EMISSION IN POOR RECEPTION
                </div>
              </div>
            )}

            {/* Beat 3: The 5W Charger Breakdown */}
            {beat === 3 && (
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
                  STANDARD 5-WATT CHARGER ARITHMETIC
                </div>
                <div style={{ width: 480, display: "flex", height: 160, borderRadius: 16, overflow: "hidden", border: "2px solid #475569" }}>
                  <div
                    style={{
                      width: "56%",
                      background: "linear-gradient(135deg, #15803d 0%, #16a34a 100%)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 12,
                    }}
                  >
                    <div style={{ fontSize: 26, fontWeight: 900 }}>2.8 W</div>
                    <div style={{ fontSize: 14, textAlign: "center", marginTop: 4 }}>BATTERY CHARGE (56%)</div>
                  </div>
                  <div
                    style={{
                      width: "44%",
                      background: "linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 12,
                    }}
                  >
                    <div style={{ fontSize: 26, fontWeight: 900 }}>2.2 W</div>
                    <div style={{ fontSize: 14, textAlign: "center", marginTop: 4 }}>RADIO LEAK (44%)</div>
                  </div>
                </div>
                <div style={{ color: "#ef4444", fontSize: 18, marginTop: 22, fontWeight: 800 }}>
                  NEARLY HALF YOUR POWER IS RADIATED AS HEAT
                </div>
              </div>
            )}

            {/* Beat 4: Thermal Throttling */}
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
                  PMIC THERMAL SAFETY THROTTLING
                </div>
                <div
                  style={{
                    width: 480,
                    background: "#0f172a",
                    border: "2px solid #334155",
                    borderRadius: 20,
                    padding: 24,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <span style={{ color: "#94a3b8" }}>CHASSIS TEMPERATURE:</span>
                    <span style={{ color: "#ef4444", fontSize: 24, fontWeight: 900 }}>41.8 °C</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <span style={{ color: "#94a3b8" }}>SAFE THRESHOLD:</span>
                    <span style={{ color: "#38bdf8", fontSize: 20, fontWeight: 700 }}>38.0 °C</span>
                  </div>
                  <div style={{ background: "rgba(239, 68, 68, 0.2)", padding: 12, borderRadius: 10, color: "#ef4444", fontWeight: 800, textAlign: "center" }}>
                    CHARGING CURRENT THROTTLED: 1,000 mA → 520 mA (-48%)
                  </div>
                </div>
                <div style={{ color: C.amber, fontSize: 18, marginTop: 20, fontWeight: 800 }}>
                  RADIO HEAT TRIGGERS CHARGE DEFENSE MECHANISMS
                </div>
              </div>
            )}

            {/* Beat 5: Airplane Mode Active */}
            {beat === 5 && (
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
                  AIRPLANE MODE: ALL LEAKS PLUGGED
                </div>
                <div
                  style={{
                    width: 480,
                    background: "#0f172a",
                    border: "2px solid #22c55e",
                    borderRadius: 20,
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>BASEBAND RF POWER:</span>
                    <span style={{ color: "#22c55e", fontWeight: 800 }}>0.00 mW [DISABLED]</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>WI-FI BEACON PROBING:</span>
                    <span style={{ color: "#22c55e", fontWeight: 800 }}>0.00 mW [DISABLED]</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>BLUETOOTH ADV SCAN:</span>
                    <span style={{ color: "#22c55e", fontWeight: 800 }}>0.00 mW [DISABLED]</span>
                  </div>
                  <div style={{ borderTop: "1px solid #1e293b", paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#38bdf8", fontWeight: 800 }}>BATTERY ALLOCATION:</span>
                    <span style={{ color: "#38bdf8", fontWeight: 900 }}>100% (5.00 WATTS)</span>
                  </div>
                </div>
                <div style={{ color: "#22c55e", fontSize: 18, marginTop: 20, fontWeight: 800 }}>
                  FULL DIRECT CHEMICAL STORAGE WITHOUT THERMAL LOSS
                </div>
              </div>
            )}

            {/* Beat 6: The Verdict */}
            {beat === 6 && (
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
                  THE FINAL ENGINEERING VERDICT
                </div>
                <div
                  style={{
                    width: 480,
                    background: "#0f172a",
                    border: "2px solid #334155",
                    borderRadius: 20,
                    padding: 24,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span>5W BASIC CHARGER:</span>
                    <span style={{ color: "#22c55e", fontWeight: 800 }}>+35% TO +45% FASTER</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>65W FAST CHARGER:</span>
                    <span style={{ color: "#94a3b8", fontWeight: 800 }}>+2% (NEGLIGIBLE)</span>
                  </div>
                </div>
                <div style={{ color: C.amber, fontSize: 18, marginTop: 20, fontWeight: 800, textAlign: "center" }}>
                  NOT A TURBO SWITCH. IT'S PLUGGING A 2-WATT HOLE.
                </div>
              </div>
            )}
          </div>

          {/* Subtitle / Source Note */}
          <div
            style={{
              borderTop: "2px solid #1e293b",
              paddingTop: 18,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              textAlign: "center",
            }}
          >
            <div style={{ color: "#F1F5F9", fontSize: 20, fontWeight: 700 }}>
              {subtitle}
            </div>
            <div style={{ color: "#64748B", fontSize: 14, letterSpacing: 2 }}>
              {sourceNote}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
