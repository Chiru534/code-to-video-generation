import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../../theme";
import { CLAMP } from "../../kit/core";
import {
  CinematicStage,
  DeviceToggle,
  DynamicGauge,
  InteractivePoll,
} from "../../kit/interactive";

export interface AirplaneModeSceneProps {
  beat: number;
  subtitle: string;
  sourceNote?: string;
}

/* Continual motion for the no-still-frame audit. */
const MotionWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const d = Math.max(1, durationInFrames);
  const p = frame / d;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ transform: `scale(${1.02 + p * 0.04})`, transformOrigin: "center center",
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px)," +
          "linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "96px 96px",
        backgroundPosition: `${(frame * 1.2) % 96}px ${(frame * 1.2) % 96}px`,
        opacity: 0.5 }} />
      <div style={{ position: "absolute", inset: 0,
        transform: `translate(${Math.sin(p * Math.PI * 2) * 10}px, ${Math.cos(p * Math.PI * 2) * 6}px)` }}>
        {children}
      </div>
    </div>
  );
};

/**
 * ShortAirplaneModeScene - Transformed from static presentation slides
 * into an interactive, cinematic technical documentary breakdown.
 */
export const ShortAirplaneModeScene: React.FC<AirplaneModeSceneProps> = ({
  beat,
  subtitle,
  sourceNote = "QUALCOMM RF POWER LABS & IEEE CONSUMER ELECTRONICS",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Real-time fluctuating RF & current values
  const liveWatts = (1.9 + Math.sin(t * 3.5) * 0.3).toFixed(2);
  const liveMilliwatts = Math.floor(2100 + Math.sin(t * 4) * 150);

  return (
    <MotionWrap>
    <CinematicStage
      subtitle={subtitle}
      sourceNote={sourceNote}
      totalBeats={7}
      currentBeat={beat}
      title="AIRPLANE MODE // POWER & RF"
    >
      {/* ==============================================================
          BEAT 0: THE INTERACTIVE HYPOTHESIS & AUDIENCE POLL
          Interactive question with animated YES/NO buttons, countdown ring,
          cursor precision-anchored to the YES button, and dramatic reveal!
          ============================================================== */}
      {beat === 0 && (
        <InteractivePoll
          question="Does Airplane Mode make your battery charge faster?"
          kicker="AUDIENCE HYPOTHESIS"
          options={[
            {
              text: "YES",
              subtext: "Assumed: Opens a wider electrical pipe into battery",
              isCorrect: false,
            },
            {
              text: "NO",
              subtext: "Reality: Pulls same watts, stops parasitic leak",
              isCorrect: true,
            },
          ]}
          selectedOptionIndex={0}
          clickFraction={0.30}
          revealFraction={0.55}
          revealVerdict="BUSTED: Zero Extra Watts Are Drawn From Charger"
          revealDetail="The charging circuit pulls the exact same current. Airplane Mode charges faster only because transmitters stop burning power."
        />
      )}

      {/* ==============================================================
          BEAT 1: SIMULATED DEVICE TOGGLE & POWER FLOW BREAKDOWN
          Tactile smartphone switch flipping with live PMIC telemetry and
          power allocation visualization.
          ============================================================== */}
      {beat === 1 && (
        <div style={{ width: 920, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <DeviceToggle
            title="AIRPLANE MODE"
            subtitle="Qualcomm Snapdragon X75 5G RF Transceiver"
            icon="✈️"
            toggleFraction={0.32}
            readouts={[
              { label: "CHARGER INPUT", value: "5.00", unit: "WATTS", activeColor: C.cyan, inactiveColor: C.cyan },
              { label: "RADIO TRANSCEIVERS", value: frame >= 0.32 * 30 * (frame / fps) ? "0.00" : liveWatts, unit: "WATTS", activeColor: C.green, inactiveColor: C.red },
              { label: "BATTERY CHARGE", value: frame >= 0.32 * 30 * (frame / fps) ? "100%" : "56%", unit: "ALLOCATED", activeColor: C.green, inactiveColor: C.amber },
            ]}
          />

          {/* Visual Energy Bus Split */}
          <div
            style={{
              width: "100%",
              background: "#0b1120",
              border: "2px solid #1e293b",
              borderRadius: 24,
              padding: "20px 28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: F.mono,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 24 }}>🔌</span>
              <div>
                <div style={{ fontSize: 13, color: C.dim, fontWeight: 800 }}>WALL BRICK</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#FFFFFF" }}>5.0W INCOMING</div>
              </div>
            </div>

            <div style={{ fontSize: 28, color: C.cyan }}>➔</div>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 24 }}>⚡</span>
              <div>
                <div style={{ fontSize: 13, color: C.dim, fontWeight: 800 }}>PMIC DRAW</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: C.amber }}>IDENTICAL 1.0A</div>
              </div>
            </div>

            <div style={{ fontSize: 28, color: C.cyan }}>➔</div>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 24 }}>🔋</span>
              <div>
                <div style={{ fontSize: 13, color: C.dim, fontWeight: 800 }}>BATTERY CELL</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: C.green }}>RADIO LEAK STOPPED</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          BEAT 2: RF POWER AMPLIFIER (PA) SURGE & TOWER HUNTING
          Dynamic RF signal wave visualization & power surge gauge.
          ============================================================== */}
      {beat === 2 && (
        <div style={{ width: 920, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          {/* Cellular Base Station & Tower Hunting Radar */}
          <div
            style={{
              width: "100%",
              height: 280,
              background: "radial-gradient(ellipse at center, #0f172a 0%, #030712 100%)",
              border: `2px solid ${C.amber}`,
              borderRadius: 28,
              padding: "24px 32px",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 0 40px rgba(245,158,11,0.2)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: F.mono,
            }}
          >
            {/* Phone Baseband RF Transmitter */}
            <div style={{ zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: 90,
                  height: 120,
                  borderRadius: 16,
                  border: `3px solid ${C.red}`,
                  background: "#1e293b",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 25px ${C.red}88`,
                }}
              >
                <div style={{ fontSize: 32 }}>📱</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.red, marginTop: 4 }}>PA 2200mW</div>
              </div>
              <div style={{ fontSize: 13, color: C.red, fontWeight: 800, marginTop: 8 }}>
                POOR SIGNAL (-115 dBm)
              </div>
            </div>

            {/* Radiating High-Power Electromagnetic Waves */}
            <div style={{ position: "relative", flex: 1, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {Array.from({ length: 4 }).map((_, i) => {
                const waveProg = ((frame * 2 + i * 25) % 100) / 100;
                const waveRadius = waveProg * 180;
                const waveOpacity = (1 - waveProg) * 0.9;
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: "30%",
                      width: waveRadius * 2,
                      height: waveRadius * 2,
                      transform: "translate(-50%, -50%)",
                      borderRadius: "50%",
                      border: `3px solid ${C.red}`,
                      opacity: waveOpacity,
                      boxShadow: `0 0 12px ${C.red}`,
                    }}
                  />
                );
              })}
              <div
                style={{
                  background: "rgba(239,68,68,0.2)",
                  border: "1.5px solid #ef4444",
                  borderRadius: 12,
                  padding: "6px 16px",
                  color: "#ef4444",
                  fontSize: 14,
                  fontWeight: 900,
                  zIndex: 20,
                }}
              >
                100x POWER AMPLIFIER SURGE
              </div>
            </div>

            {/* Distant Cell Tower */}
            <div style={{ zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: 90,
                  height: 120,
                  borderRadius: 16,
                  border: "2px solid #475569",
                  background: "#0f172a",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ fontSize: 36 }}>📡</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", marginTop: 4 }}>TOWER 4.2KM</div>
              </div>
              <div style={{ fontSize: 13, color: "#64748b", fontWeight: 800, marginTop: 8 }}>
                SEARCHING...
              </div>
            </div>
          </div>

          {/* Dynamic Power Gauge */}
          <DynamicGauge
            title="CELLULAR TRANSMIT POWER DISSIPATION"
            value={liveMilliwatts}
            minValue={20}
            maxValue={2400}
            unit="mW"
            verdictLabel="NORMAL SIGNAL: 20 mW  ⟶  POOR CELL RECEPTION: 2,200 mW (110x SURGE)"
            isAlert={true}
          />
        </div>
      )}

      {/* ==============================================================
          BEAT 3: 5W BASIC CHARGER ARITHMETICAL BREAKDOWN
          Interactive segmented power bar comparing standard vs airplane mode.
          ============================================================== */}
      {beat === 3 && (
        <div style={{ width: 920, display: "flex", flexDirection: "column", alignItems: "center", gap: 26, fontFamily: F.mono }}>
          <div
            style={{
              width: "100%",
              background: "#0f172a",
              border: "3px solid #334155",
              borderRadius: 28,
              padding: "32px",
              boxShadow: "0 25px 50px rgba(0,0,0,0.8)",
            }}
          >
            <div style={{ fontSize: 16, color: C.dim, fontWeight: 800, letterSpacing: 2, marginBottom: 16 }}>
              5.0-WATT CHARGER ELECTRICAL BUDGET BREAKDOWN
            </div>

            {/* Proportional Split Bar (Large & Prominent) */}
            <div style={{ width: "100%", height: 110, borderRadius: 20, overflow: "hidden", display: "flex", border: "3px solid #1e293b" }}>
              <div
                style={{
                  width: "58%",
                  background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "inset 0 0 20px rgba(0,0,0,0.4)",
                }}
              >
                <div style={{ fontSize: 36, fontWeight: 900, color: "#FFFFFF" }}>2.9 WATTS</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#d1fae5" }}>BATTERY CHARGE (58%)</div>
              </div>
              <div
                style={{
                  width: "42%",
                  background: "linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "inset 0 0 20px rgba(0,0,0,0.4)",
                }}
              >
                <div style={{ fontSize: 36, fontWeight: 900, color: "#FFFFFF" }}>2.1 WATTS</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fee2e2" }}>RADIO LEAK (42%)</div>
              </div>
            </div>

            {/* Explanatory Radio Parasitic Sources */}
            <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              <div style={{ background: "#080d1a", border: "1.5px solid #1e293b", borderRadius: 16, padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>CELLULAR PINGS</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: C.red, marginTop: 4 }}>~1,800 mW</div>
              </div>
              <div style={{ background: "#080d1a", border: "1.5px solid #1e293b", borderRadius: 16, padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>WI-FI BEACONS</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: C.amber, marginTop: 4 }}>~250 mW</div>
              </div>
              <div style={{ background: "#080d1a", border: "1.5px solid #1e293b", borderRadius: 16, padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>BLUETOOTH BLE</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: C.cyan, marginTop: 4 }}>~50 mW</div>
              </div>
            </div>
          </div>

          <div
            style={{
              width: "100%",
              background: "rgba(239,68,68,0.12)",
              border: `2px solid ${C.red}`,
              borderRadius: 20,
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span style={{ fontSize: 32 }}>⚠️</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: "#FFFFFF" }}>
              ON A 5W BRICK, OVER 40% OF INCOMING POWER IS DISCHARGED BEFORE IT REACHES THE BATTERY.
            </span>
          </div>
        </div>
      )}

      {/* ==============================================================
          BEAT 4: THERMAL THROTTLING & CHASSIS HEATMAP
          Demonstrating that radio heat warms phone, cutting charging in half.
          ============================================================== */}
      {beat === 4 && (
        <div style={{ width: 920, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, fontFamily: F.mono }}>
          <div
            style={{
              width: "100%",
              background: "#0f172a",
              border: `2px solid ${C.red}`,
              borderRadius: 28,
              padding: "32px",
              boxShadow: "0 0 50px rgba(239,68,68,0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 16, color: C.red, fontWeight: 800, letterSpacing: 2 }}>
                FLIR INFRARED THERMAL SURVEILLANCE
              </div>
              <div style={{ background: "rgba(239,68,68,0.2)", border: "1px solid #ef4444", borderRadius: 10, padding: "4px 14px", color: "#ef4444", fontSize: 13, fontWeight: 800 }}>
                CRITICAL TEMPERATURE EXCEEDED
              </div>
            </div>

            {/* Thermal Sensor Readouts */}
            <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
              <div style={{ flex: 1, background: "linear-gradient(180deg, #7f1d1d 0%, #450a0a 100%)", borderRadius: 20, padding: "20px", border: "2px solid #ef4444" }}>
                <div style={{ fontSize: 13, color: "#fca5a5", fontWeight: 800 }}>CHASSIS HOTSPOT (RF PA)</div>
                <div style={{ fontSize: 44, fontWeight: 900, color: "#FFFFFF", marginTop: 4 }}>41.8 °C</div>
                <div style={{ fontSize: 13, color: "#f87171", marginTop: 2 }}>Above 38°C Safety Cap</div>
              </div>
              <div style={{ flex: 1, background: "#0b1120", borderRadius: 20, padding: "20px", border: "2px solid #334155" }}>
                <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 800 }}>PMIC SAFETY GOAL</div>
                <div style={{ fontSize: 44, fontWeight: 900, color: C.cyan, marginTop: 4 }}>35.0 °C</div>
                <div style={{ fontSize: 13, color: C.dim, marginTop: 2 }}>Optimal Li-Ion Chemistry</div>
              </div>
            </div>

            {/* PMIC Throttle Valve Animation */}
            <div style={{ background: "#080d1a", border: "2px solid #1e293b", borderRadius: 20, padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 14, color: "#94a3b8", fontWeight: 800 }}>PMIC CHARGING CURRENT:</span>
                <span style={{ fontSize: 16, color: C.red, fontWeight: 900 }}>THROTTLED: 1,000 mA ➔ 520 mA (-48%)</span>
              </div>
              <div style={{ height: 16, background: "#1e293b", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ width: "52%", height: "100%", background: "linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)", borderRadius: 8 }} />
              </div>
            </div>
          </div>

          <div style={{ color: C.amber, fontSize: 20, fontWeight: 800, textAlign: "center" }}>
            RADIO HEAT WARMS THE CHASSIS, FORCING SAFETY CHIPS TO SLOW DOWN CHARGING.
          </div>
        </div>
      )}

      {/* ==============================================================
          BEAT 5: AIRPLANE MODE ACTIVE — THE CLEAN PIPELINE
          Antennas disabled, zero leakage, 100% current to battery.
          ============================================================== */}
      {beat === 5 && (
        <div style={{ width: 920, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, fontFamily: F.mono }}>
          <div
            style={{
              width: "100%",
              background: "radial-gradient(ellipse at top, #064e3b 0%, #022c22 100%)",
              border: `3px solid ${C.green}`,
              borderRadius: 28,
              padding: "32px 36px",
              boxShadow: "0 0 60px rgba(52,211,153,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.green }}>
                AIRPLANE MODE ACTIVE: 100% ELECTRICAL CONVERSION
              </div>
              <div style={{ background: "rgba(52,211,153,0.2)", border: "1px solid #34d399", borderRadius: 12, padding: "4px 14px", color: C.green, fontSize: 13, fontWeight: 800 }}>
                ✓ MAXIMUM EFFICIENCY
              </div>
            </div>

            {/* Clean Pipeline Indicators */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
              <div style={{ background: "#0b1120", border: "2px solid #1e293b", borderRadius: 18, padding: "18px", textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>RADIO TRANSMISSION</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: C.green, marginTop: 4 }}>0.00 mW</div>
                <div style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>Transceivers Cut</div>
              </div>
              <div style={{ background: "#0b1120", border: "2px solid #1e293b", borderRadius: 18, padding: "18px", textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>CHASSIS TEMP</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: C.cyan, marginTop: 4 }}>26.4 °C</div>
                <div style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>Cool Silicon</div>
              </div>
              <div style={{ background: "#0b1120", border: "2px solid #1e293b", borderRadius: 18, padding: "18px", textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>BATTERY INPUT</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: C.green, marginTop: 4 }}>5.00 WATTS</div>
                <div style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>100% Chemical Storage</div>
              </div>
            </div>

            {/* Glowing Flow Visualization */}
            <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid #1e293b", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 16, color: "#FFFFFF", fontWeight: 700 }}>DIRECT ENERGY BUS:</span>
              <span style={{ fontSize: 18, color: C.green, fontWeight: 900 }}>NO HEAT · NO LEAKAGE · FULL CURRENT</span>
            </div>
          </div>

          <div style={{ color: C.green, fontSize: 20, fontWeight: 800 }}>
            EVERY MILLIWATT FROM THE OUTLET FLOWS UNINTERRUPTED INTO BATTERY CHEMISTRY.
          </div>
        </div>
      )}

      {/* ==============================================================
          BEAT 6: THE FINAL TAKEAWAY & SPLIT COMPARISON
          65W Fast Charger vs 5W Slow Brick.
          ============================================================== */}
      {beat === 6 && (
        <div style={{ width: 920, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, fontFamily: F.mono }}>
          <div style={{ width: "100%", display: "flex", gap: 20 }}>
            {/* 65W High-Power Charger */}
            <div
              style={{
                flex: 1,
                background: "#0f172a",
                border: "2px solid #334155",
                borderRadius: 24,
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 13, color: C.dim, fontWeight: 800, letterSpacing: 2 }}>65W GaN FAST CHARGER</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#FFFFFF", margin: "10px 0" }}>+2% SPEEDUP</div>
              <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.4 }}>
                A 2-Watt radio loss is only 3% of a 65W torrent. The difference is barely measurable.
              </div>
              <div style={{ marginTop: 14, background: "#1e293b", padding: "6px 14px", borderRadius: 10, fontSize: 13, color: C.dim }}>
                NEGLIGIBLE DIFFERENCE
              </div>
            </div>

            {/* 5W Low-Power Charger */}
            <div
              style={{
                flex: 1,
                background: "radial-gradient(ellipse at top, #1e3a5f 0%, #0f172a 100%)",
                border: `3px solid ${C.cyan}`,
                borderRadius: 24,
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                boxShadow: `0 0 35px ${C.cyan}44`,
              }}
            >
              <div style={{ fontSize: 13, color: C.cyan, fontWeight: 800, letterSpacing: 2 }}>5W STANDARD BRICK</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: C.cyan, margin: "10px 0" }}>+40% FASTER</div>
              <div style={{ fontSize: 14, color: "#E2E8F0", lineHeight: 1.4 }}>
                On a weak 5W charger, plugging that 2-Watt radio hole saves nearly half your incoming power!
              </div>
              <div style={{ marginTop: 14, background: "rgba(34,211,238,0.2)", padding: "6px 14px", borderRadius: 10, fontSize: 13, color: C.cyan, fontWeight: 800 }}>
                MASSIVE DIFFERENCE
              </div>
            </div>
          </div>

          {/* Grand Takeaway Verdict Badge */}
          <div
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              border: `2px solid ${C.amber}`,
              borderRadius: 22,
              padding: "20px 28px",
              display: "flex",
              alignItems: "center",
              gap: 20,
              boxShadow: "0 0 30px rgba(245,158,11,0.25)",
            }}
          >
            <div style={{ fontSize: 36 }}>⚡</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: C.amber }}>
                THE TAKEAWAY: NOT A TURBO SWITCH.
              </div>
              <div style={{ fontSize: 15, color: "#cbd5e1", marginTop: 2 }}>
                Airplane Mode doesn't widen the incoming electrical pipe — it plugs a massive 2-Watt parasitic leak.
              </div>
            </div>
          </div>
        </div>
      )}
    </CinematicStage>
    </MotionWrap>
  );
};
