import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../../theme";

export interface UsbcMarkerSceneProps {
  beat: number;
  subtitle: string;
  sourceNote?: string;
}

export const ShortUsbcMarkerScene: React.FC<UsbcMarkerSceneProps> = ({
  beat,
  subtitle,
  sourceNote = "USB-IF SPECIFICATION REV 3.1 & IEC 62680-1-2",
}) => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const t = frame / fps;

  const enter = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
  const driftY = Math.sin(t * 1.5) * 4;
  const slowZoom = 1.0 + (t / 18) * 0.025;
  const scanY = (frame * 5.2) % (h - 96);

  // Dynamic Joules heating values
  const jouleHeatWatts = (1.8 + (Math.sin(t * 2) + 1) * 1.6).toFixed(1);

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
        {/* Scrolling BMC Packets */}
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
              {`SOP'_PKT #${(300 + i)} : CC1_BMC_FREQ=300kHz [DISCOVER_IDENTITY_ACK] VENDOR=0x05AC EPR=240W VBUS_MAX=48V`}
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
              USB POWER DELIVERY &amp; SILICON SPECIFICATION
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
              USB-C E-MARKER
            </div>
            <div style={{ fontSize: 30, color: C.amber, fontStyle: "italic", fontWeight: 800, marginTop: 8 }}>
              (active computer inside copper)
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
                  THE MYTH: "JUST BUNDLED COPPER WIRES"
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
                  <div style={{ fontSize: 72 }}>🔌 ⚡</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#94a3b8", marginTop: 12 }}>
                    PASSIVE USB CABLE
                  </div>
                  <div style={{ fontSize: 16, color: "#38bdf8", marginTop: 6 }}>
                    Assumed: Simple Dumb Wire Conductor
                  </div>
                </div>
                <div style={{ color: C.cyan, fontSize: 18, marginTop: 20, fontWeight: 700 }}>
                  A COMMODITY PIECE OF METAL
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
                  THE REALITY: ACTIVE SILICON MICROCONTROLLER
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
                    gap: 14,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>CHIP PACKAGE:</span>
                    <span style={{ color: "#38bdf8", fontWeight: 800 }}>8-PIN DFN / WLCSP</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>CORE LOGIC:</span>
                    <span style={{ color: "#f59e0b", fontWeight: 800 }}>ARM CORTEX-M0+ / STATE MACHINE</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #1e293b", paddingTop: 10 }}>
                    <span style={{ color: "#22c55e", fontWeight: 800 }}>ROLE:</span>
                    <span style={{ color: "#22c55e", fontWeight: 900 }}>AUTHENTICATE &amp; GOVERN CURRENT</span>
                  </div>
                </div>
                <div style={{ color: "#22c55e", fontSize: 18, marginTop: 20, fontWeight: 800 }}>
                  THERE IS A COMPUTER LIVING IN YOUR PLUG
                </div>
              </div>
            )}

            {/* Beat 2: The Physical Danger */}
            {beat === 2 && (
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
                  JOULE HEATING DANGER: P = I²R
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
                  <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#22c55e" }}>3 AMPS (STANDARD):</span>
                    <span style={{ fontWeight: 800 }}>3² × 0.2Ω = 1.8 WATTS HEAT</span>
                  </div>
                  <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#ef4444" }}>5 AMPS (HIGH POWER):</span>
                    <span style={{ color: "#ef4444", fontWeight: 900 }}>5² × 0.2Ω = 5.0 WATTS HEAT (+177%)</span>
                  </div>
                  <div style={{ background: "rgba(239, 68, 68, 0.2)", padding: 12, borderRadius: 10, color: "#ef4444", textAlign: "center", fontWeight: 800 }}>
                    THIN WIRE REACHES 110 °C → PLASTIC MELTDOWN
                  </div>
                </div>
                <div style={{ color: "#ef4444", fontSize: 18, marginTop: 20, fontWeight: 800 }}>
                  SQUARE CURRENT MULTIPLIES THERMAL RUNAWAY
                </div>
              </div>
            )}

            {/* Beat 3: The Protocol */}
            {beat === 3 && (
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
                  CC PIN SIGNALING: BIPHASE MARK CODE (BMC)
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
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>CARRIER FREQUENCY:</span>
                    <span style={{ color: "#f59e0b", fontWeight: 800 }}>300 kHz (±10%)</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>PHYSICAL CHANNEL:</span>
                    <span style={{ color: "#38bdf8", fontWeight: 800 }}>CC1 / CC2 PIN</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>PACKET FRAMING:</span>
                    <span style={{ color: "#22c55e", fontWeight: 800 }}>SOP' (START OF PACKET PRIME)</span>
                  </div>
                </div>
                <div style={{ color: C.amber, fontSize: 18, marginTop: 20, fontWeight: 800 }}>
                  DIGITAL PACKETS TRAVEL DOWN THE CONTROL PIN
                </div>
              </div>
            )}

            {/* Beat 4: Handshake */}
            {beat === 4 && (
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
                  VENDOR DEFINED MESSAGE (VDM) HANDSHAKE
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
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>CABLE RATING:</span>
                    <span style={{ color: "#22c55e", fontWeight: 800 }}>5 AMPS / 48 VOLTS</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>POWER LIMIT:</span>
                    <span style={{ color: "#38bdf8", fontWeight: 900, fontSize: 20 }}>240 WATTS (EPR)</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>HIGH-SPEED PHY:</span>
                    <span style={{ color: "#f59e0b", fontWeight: 800 }}>USB4 40Gbps ACTIVE REDRIVER</span>
                  </div>
                </div>
                <div style={{ color: "#38bdf8", fontSize: 18, marginTop: 20, fontWeight: 800 }}>
                  AUTHORIZES THE HIGHEST SAFE CHARGING SPEED
                </div>
              </div>
            )}

            {/* Beat 5: Fallback */}
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
                  SAFETY FAIL-SAFE: NO CHIP DETECTED
                </div>
                <div
                  style={{
                    width: 480,
                    background: "#0f172a",
                    border: "2px solid #ef4444",
                    borderRadius: 20,
                    padding: 24,
                  }}
                >
                  <div style={{ fontSize: 16, color: "#FFFFFF", fontWeight: 800, marginBottom: 12 }}>
                    DISCOVER_IDENTITY: TIMEOUT (NO ACK)
                  </div>
                  <div style={{ color: "#cbd5e1", fontSize: 15, lineHeight: 1.6 }}>
                    Charger immediately hard-caps output to 20V @ 3A (60W). Refuses to deliver 100W or 240W to prevent unverified copper from incinerating.
                  </div>
                </div>
                <div style={{ color: "#ef4444", fontSize: 18, marginTop: 20, fontWeight: 800 }}>
                  THE CHIPLESS CABLE IS SAFELY THROTTLED
                </div>
              </div>
            )}

            {/* Beat 6: The Verdict */}
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
                  THE TRANSFORMATION OF THE CABLE
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
                    <span>OLD USB (Type-A):</span>
                    <span style={{ color: "#94a3b8", fontWeight: 800 }}>DUMB COPPER WIRE</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>NEW USB-C (PD 3.1):</span>
                    <span style={{ color: "#22c55e", fontWeight: 800 }}>SILICON NEGOTIATOR</span>
                  </div>
                </div>
                <div style={{ color: C.amber, fontSize: 18, marginTop: 20, fontWeight: 800, textAlign: "center" }}>
                  A COMMODITY WIRE IS NOW AN EMBEDDED SYSTEM
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
