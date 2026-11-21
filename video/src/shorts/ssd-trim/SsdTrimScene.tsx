import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../../theme";
import { CLAMP } from "../../kit/core";
import {
  CinematicStage,
  DynamicGauge,
  InteractivePoll,
  NandBlockMatrix,
} from "../../kit/interactive";

export interface SsdTrimSceneProps {
  beat: number;
  subtitle: string;
  sourceNote?: string;
}

/**
 * ShortSsdTrimScene - Transformed from static presentation slides
 * into an interactive, cinematic technical documentary breakdown.
 */
export const ShortSsdTrimScene: React.FC<SsdTrimSceneProps> = ({
  beat,
  subtitle,
  sourceNote = "NVM EXPRESS & JEDEC SOLID STATE STORAGE STANDARDS",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Real-time speed & WAF ticker
  const cliffSpeed = Math.floor(450 + Math.sin(t * 4) * 40);
  const liveWaf = (7.8 + Math.sin(t * 3) * 0.6).toFixed(1);

  return (
    <CinematicStage
      subtitle={subtitle}
      sourceNote={sourceNote}
      totalBeats={7}
      currentBeat={beat}
      title="SOLID STATE DRIVES // TRIM & NAND"
    >
      {/* ==============================================================
          BEAT 0: THE INTERACTIVE HYPOTHESIS & OS TRASH BIN
          Desktop Trash dialog simulation + audience poll with precision-anchored cursor.
          ============================================================== */}
      {beat === 0 && (
        <InteractivePoll
          question="When you empty your trash bin, is the file erased from the SSD?"
          kicker="AUDIENCE HYPOTHESIS"
          options={[
            {
              text: "YES",
              subtext: "Assumed: Silicon cells are zeroed out immediately",
              isCorrect: false,
            },
            {
              text: "NO",
              subtext: "Reality: Only the file index entry is removed",
              isCorrect: true,
            },
          ]}
          selectedOptionIndex={0}
          clickFraction={0.30}
          revealFraction={0.55}
          revealVerdict="FALSE: Physical Silicon Cells Remain Untouched"
          revealDetail="The operating system only removes the pointer in the file table. The electrical trapped charges inside NAND flash cells remain completely unchanged."
        />
      )}

      {/* ==============================================================
          BEAT 1: THE FILE SYSTEM VS SILICON REALITY
          Split comparison: File system directory table vs floating gate electrons.
          ============================================================== */}
      {beat === 1 && (
        <div style={{ width: 920, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, fontFamily: F.mono }}>
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
            <div style={{ fontSize: 16, color: C.dim, fontWeight: 800, letterSpacing: 2, marginBottom: 20 }}>
              DELETION DECEPTION: FILE TABLE VS PHYSICAL SILICON
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* OS File System Layer */}
              <div
                style={{
                  background: "#080d1a",
                  border: `2px solid ${C.cyan}`,
                  borderRadius: 20,
                  padding: "22px",
                }}
              >
                <div style={{ fontSize: 13, color: C.cyan, fontWeight: 800, letterSpacing: 1.5, marginBottom: 12 }}>
                  1. OS FILE TABLE (APFS / NTFS)
                </div>
                <div style={{ background: "#0f172a", borderRadius: 12, padding: "12px 16px", fontSize: 14, lineHeight: 1.6 }}>
                  <div style={{ color: C.dim }}>// Inode Allocation Map</div>
                  <div style={{ textDecoration: "line-through", color: C.red, fontWeight: 700 }}>
                    PTR: 0x48F2A0 ➔ "video_render.mp4"
                  </div>
                  <div style={{ color: C.green, fontWeight: 800, marginTop: 4 }}>
                    ENTRY CLEARED ➔ MARKED FREE
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 12, lineHeight: 1.4 }}>
                  The OS marks the logical address as available for future writes.
                </div>
              </div>

              {/* Physical NAND Flash Silicon Layer */}
              <div
                style={{
                  background: "#080d1a",
                  border: `2px solid ${C.red}`,
                  borderRadius: 20,
                  padding: "22px",
                }}
              >
                <div style={{ fontSize: 13, color: C.red, fontWeight: 800, letterSpacing: 1.5, marginBottom: 12 }}>
                  2. PHYSICAL NAND FLASH TRANSISTORS
                </div>
                <div style={{ background: "#0f172a", borderRadius: 12, padding: "12px 16px", fontSize: 14, lineHeight: 1.6 }}>
                  <div style={{ color: C.dim }}>// Floating Gate Tunnel Traps</div>
                  <div style={{ color: C.amber, fontWeight: 800 }}>
                    VOLTAGE: -3.2V (TRAPPED CHARGES)
                  </div>
                  <div style={{ color: C.red, fontWeight: 800, marginTop: 4 }}>
                    SILICON BITS: 100% UNCHANGED
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 12, lineHeight: 1.4 }}>
                  Flash memory has no idea the file was deleted. The cells still hold data.
                </div>
              </div>
            </div>
          </div>

          {/* Core Reality Callout */}
          <div
            style={{
              width: "100%",
              background: "rgba(251,113,133,0.12)",
              border: `2px solid ${C.red}`,
              borderRadius: 20,
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span style={{ fontSize: 32 }}>⚠️</span>
            <span style={{ fontSize: 19, fontWeight: 900, color: "#FFFFFF" }}>
              DELETING A FILE ON AN SSD DOES NOT ZERO OUT A SINGLE BIT OF PHYSICAL FLASH.
            </span>
          </div>
        </div>
      )}

      {/* ==============================================================
          BEAT 2: THE PHYSICAL ASYMMETRY — 16KB PAGES VS 4MB BLOCKS
          Interactive 3D/Isometric NAND flash architecture matrix.
          ============================================================== */}
      {beat === 2 && (
        <div style={{ width: 920, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <NandBlockMatrix phase="deleted" />

          <div
            style={{
              width: "100%",
              background: "#0f172a",
              border: `2px solid ${C.amber}`,
              borderRadius: 20,
              padding: "20px 28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: F.mono,
            }}
          >
            <div>
              <div style={{ fontSize: 13, color: C.amber, fontWeight: 800 }}>THE HARDWARE ASYMMETRY</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#FFFFFF", marginTop: 2 }}>
                PAGES ARE FOR WRITING. BLOCKS ARE FOR ERASING.
              </div>
            </div>
            <div style={{ background: "rgba(251,191,36,0.15)", border: "1px solid #fbbf24", borderRadius: 12, padding: "8px 18px", fontSize: 16, fontWeight: 900, color: C.amber }}>
              RATIO: 256 : 1
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          BEAT 3: THE READ-MODIFY-WRITE CATASTROPHE
          Step-by-step technical animation of why saving 1 file moves 4MB.
          ============================================================== */}
      {beat === 3 && (
        <div style={{ width: 920, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, fontFamily: F.mono }}>
          <div
            style={{
              width: "100%",
              background: "#0f172a",
              border: `2px solid ${C.red}`,
              borderRadius: 28,
              padding: "28px 32px",
              boxShadow: "0 0 50px rgba(251,113,133,0.25)",
            }}
          >
            <div style={{ fontSize: 16, color: C.red, fontWeight: 800, letterSpacing: 2, marginBottom: 18 }}>
              THE READ-MODIFY-WRITE TRAP (CANNOT OVERWRITE FLASH CELLS)
            </div>

            {/* 3 Steps Flow */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {/* Step 1: Read */}
              <div style={{ background: "#080d1a", border: "2px solid #334155", borderRadius: 18, padding: "18px 16px" }}>
                <div style={{ fontSize: 12, color: C.cyan, fontWeight: 800 }}>STEP 01 // READ</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#FFFFFF", margin: "6px 0" }}>BUFFER TO RAM</div>
                <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.4 }}>
                  Controller reads entire 4 MB block into local DRAM cache to preserve neighboring valid pages.
                </div>
              </div>

              {/* Step 2: High Voltage Erase */}
              <div style={{ background: "#080d1a", border: `2px solid ${C.red}`, borderRadius: 18, padding: "18px 16px" }}>
                <div style={{ fontSize: 12, color: C.red, fontWeight: 800 }}>STEP 02 // 20V ERASE</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: C.red, margin: "6px 0" }}>ERASE WHOLE BLOCK</div>
                <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.4 }}>
                  A massive 20V tunnel-oxide voltage pulse resets all 256 pages in the physical block to 11111111.
                </div>
              </div>

              {/* Step 3: Write Back */}
              <div style={{ background: "#080d1a", border: `2px solid ${C.amber}`, borderRadius: 18, padding: "18px 16px" }}>
                <div style={{ fontSize: 12, color: C.amber, fontWeight: 800 }}>STEP 03 // WRITE</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: C.amber, margin: "6px 0" }}>REWRITE 4 MB</div>
                <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.4 }}>
                  Controller writes back all original valid pages plus the 1 new 16KB file.
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              width: "100%",
              background: "rgba(239,68,68,0.15)",
              border: `2px solid ${C.red}`,
              borderRadius: 20,
              padding: "16px 24px",
              textAlign: "center",
              fontSize: 19,
              fontWeight: 900,
              color: "#FFFFFF",
            }}
          >
            SAVING A 16 KB FILE FORCED 4,096 KB OF PHYSICAL SILICON DATA TRANSFERS!
          </div>
        </div>
      )}

      {/* ==============================================================
          BEAT 4: THE WRITE CLIFF & SPEEDOMETER PLUNGE
          Performance plunges by 80% with spiking Write Amplification Factor.
          ============================================================== */}
      {beat === 4 && (
        <div style={{ width: 920, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <DynamicGauge
            title="SSD WRITE PERFORMANCE WITHOUT TRIM (WRITE CLIFF)"
            value={cliffSpeed}
            minValue={200}
            maxValue={3500}
            unit="MB/s"
            verdictLabel={`WRITE SPEEDS SLASHED BY 80% — WAF SPIKED TO ${liveWaf}x`}
            isAlert={true}
          />

          <div
            style={{
              width: "100%",
              background: "#0f172a",
              border: "2px solid #334155",
              borderRadius: 22,
              padding: "20px 28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: F.mono,
            }}
          >
            <div>
              <div style={{ fontSize: 13, color: C.dim, fontWeight: 800 }}>WRITE AMPLIFICATION FACTOR (WAF)</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: C.red, marginTop: 2 }}>{liveWaf}x PHYSICAL OVERHEAD</div>
            </div>
            <div style={{ fontSize: 14, color: "#94a3b8", maxWidth: 450, textAlign: "right" }}>
              The drive controller burns out flash endurance prematurely rewriting unchanged blocks.
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          BEAT 5: THE SOLUTION — THE NVMe TRIM COMMAND
          Illustrating OS notifying the FTL in advance.
          ============================================================== */}
      {beat === 5 && (
        <div style={{ width: 920, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, fontFamily: F.mono }}>
          <div
            style={{
              width: "100%",
              background: "radial-gradient(ellipse at top, #064e3b 0%, #0f172a 100%)",
              border: `3px solid ${C.green}`,
              borderRadius: 28,
              padding: "32px",
              boxShadow: "0 0 50px rgba(52,211,153,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.green }}>
                THE SOLUTION: THE NVMe / SATA TRIM COMMAND
              </div>
              <div style={{ background: "rgba(52,211,153,0.2)", border: "1px solid #34d399", borderRadius: 10, padding: "4px 14px", color: C.green, fontSize: 13, fontWeight: 800 }}>
                NVMe_CMD_DATASET_MANAGEMENT
              </div>
            </div>

            {/* Protocol Flow Diagram */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#080d1a", borderRadius: 20, padding: "20px", border: "2px solid #1e293b" }}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 12, color: C.dim, fontWeight: 800 }}>1. OS KERNEL</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#FFFFFF", marginTop: 4 }}>FILE DELETED</div>
              </div>
              <div style={{ color: C.green, fontSize: 24, fontWeight: 900 }}>➔ [TRIM LBA] ➔</div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 12, color: C.dim, fontWeight: 800 }}>2. SSD CONTROLLER (FTL)</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: C.green, marginTop: 4 }}>PAGES TAGGED DEAD</div>
              </div>
              <div style={{ color: C.green, fontSize: 24, fontWeight: 900 }}>➔</div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 12, color: C.dim, fontWeight: 800 }}>3. BACKGROUND GC</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: C.cyan, marginTop: 4 }}>PRE-ERASED BLOCKS</div>
              </div>
            </div>
          </div>

          <div style={{ color: C.green, fontSize: 20, fontWeight: 800, textAlign: "center" }}>
            TRIM TELLS THE CONTROLLER WHICH FLASH PAGES ARE DEAD BEFORE NEW WRITES ARRIVE.
          </div>
        </div>
      )}

      {/* ==============================================================
          BEAT 6: BACKGROUND GARBAGE COLLECTION & SUSTAINED SPEED
          Final verdict and sustained speed demonstration.
          ============================================================== */}
      {beat === 6 && (
        <div style={{ width: 920, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, fontFamily: F.mono }}>
          <div style={{ width: "100%", display: "flex", gap: 20 }}>
            {/* Without TRIM */}
            <div
              style={{
                flex: 1,
                background: "#0f172a",
                border: "2px solid #ef4444",
                borderRadius: 24,
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 13, color: C.red, fontWeight: 800, letterSpacing: 2 }}>WITHOUT TRIM</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: C.red, margin: "10px 0" }}>450 MB/s</div>
              <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.4 }}>
                Drive must pause, read, erase, and rewrite 4MB blocks synchronously on every single write.
              </div>
              <div style={{ marginTop: 14, background: "rgba(239,68,68,0.2)", padding: "6px 14px", borderRadius: 10, fontSize: 13, color: C.red, fontWeight: 800 }}>
                SLUGGISH &amp; WAF = 8.0x
              </div>
            </div>

            {/* With TRIM Active */}
            <div
              style={{
                flex: 1,
                background: "radial-gradient(ellipse at top, #064e3b 0%, #0f172a 100%)",
                border: `3px solid ${C.green}`,
                borderRadius: 24,
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                boxShadow: "0 0 35px rgba(52,211,153,0.3)",
              }}
            >
              <div style={{ fontSize: 13, color: C.green, fontWeight: 800, letterSpacing: 2 }}>WITH TRIM ACTIVE</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: C.green, margin: "10px 0" }}>3,500 MB/s</div>
              <div style={{ fontSize: 14, color: "#E2E8F0", lineHeight: 1.4 }}>
                Controller pre-erases dead blocks during idle background cycles. Writes always land on clean pages!
              </div>
              <div style={{ marginTop: 14, background: "rgba(52,211,153,0.2)", padding: "6px 14px", borderRadius: 10, fontSize: 13, color: C.green, fontWeight: 800 }}>
                FULL SPEED &amp; WAF = 1.0x
              </div>
            </div>
          </div>

          {/* Grand Takeaway Verdict Badge */}
          <div
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              border: `2px solid ${C.cyan}`,
              borderRadius: 22,
              padding: "20px 28px",
              display: "flex",
              alignItems: "center",
              gap: 20,
              boxShadow: "0 0 30px rgba(34,211,238,0.25)",
            }}
          >
            <div style={{ fontSize: 36 }}>⚡</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: C.cyan }}>
                THE TAKEAWAY: TRIM CLEANS SILICON BEFORE YOU WRITE.
              </div>
              <div style={{ fontSize: 15, color: "#cbd5e1", marginTop: 2 }}>
                TRIM enables background garbage collection so your SSD never hits the brutal read-modify-write cliff.
              </div>
            </div>
          </div>
        </div>
      )}
    </CinematicStage>
  );
};
