import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../../theme";

export interface SsdTrimSceneProps {
  beat: number;
  subtitle: string;
  sourceNote?: string;
}

export const ShortSsdTrimScene: React.FC<SsdTrimSceneProps> = ({
  beat,
  subtitle,
  sourceNote = "NVM EXPRESS & JEDEC SOLID STATE STORAGE STANDARDS",
}) => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const t = frame / fps;

  const enter = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
  const driftY = Math.sin(t * 1.5) * 4;
  const slowZoom = 1.0 + (t / 18) * 0.025;
  const scanY = (frame * 5.2) % (h - 96);

  // Dynamic WAF ticker
  const liveWaf = (1.0 + (Math.sin(t * 2.2) + 1) * 1.7).toFixed(2);

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
        {/* Flash Translation Layer LBA stream */}
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
              {`FTL_LOG #${(5000 + i * 8)} : NVMe_DSM_DEALLOC LBA_RANGE=[0x${(100000 + i * 512).toString(16)}..+512] TRIM_ACK WAF=${liveWaf} BLK_GC_PENDING`}
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
              NAND FLASH MEMORY &amp; SOLID STATE CONTROLLERS
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
              SSD TRIM
            </div>
            <div style={{ fontSize: 30, color: C.amber, fontStyle: "italic", fontWeight: 800, marginTop: 8 }}>
              (why deleting never deletes flash)
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
                  THE MYTH: "TRASH EMPTY ERASES THE FLASH CELL"
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
                  <div style={{ fontSize: 72 }}>🗑️ 💾 ⚡</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#94a3b8", marginTop: 12 }}>
                    RECYCLE BIN PURGE
                  </div>
                  <div style={{ fontSize: 16, color: "#38bdf8", marginTop: 6 }}>
                    Assumed: Instant High-Voltage Data Erase
                  </div>
                </div>
                <div style={{ color: C.cyan, fontSize: 18, marginTop: 20, fontWeight: 700 }}>
                  ASSUMES FLASH ERASES LIKE MAGNETIC TAPE
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
                  THE REALITY: FILE SYSTEMS ONLY DELETE POINTERS
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
                    FILE SYSTEM METADATA ONLY
                  </div>
                  <div style={{ fontSize: 44, fontWeight: 900, color: C.amber, margin: "14px 0", textAlign: "center" }}>
                    NTFS / APFS / EXT4
                  </div>
                  <div style={{ fontSize: 16, color: "#cbd5e1", textAlign: "center", lineHeight: 1.5 }}>
                    The OS removes the file name from directory index. All raw trapped electrons remain in physical NAND silicon.
                  </div>
                </div>
              </div>
            )}

            {/* Beat 2: Page vs Block Physical Law */}
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
                  THE ASYMMETRY: PAGE WRITE VS BLOCK ERASE
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
                    <span style={{ fontSize: 16, color: "#94a3b8" }}>PROGRAM (WRITE) UNIT:</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#38bdf8" }}>16 KB (1 Page)</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                    <span style={{ fontSize: 16, color: "#94a3b8" }}>ERASE (CLEAR) UNIT:</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#f87171" }}>4 MB (256 Pages)</span>
                  </div>
                  <div style={{ height: 2, background: "#334155", margin: "16px 0" }} />
                  <div style={{ fontSize: 16, color: C.amber, textAlign: "center", fontWeight: 700 }}>
                    NAND flash cannot overwrite a single page without erasing the entire 4 megabyte block!
                  </div>
                </div>
              </div>
            )}

            {/* Beat 3: Read-Modify-Erase Penalty */}
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
                  THE COST: READ - MODIFY - ERASE - WRITE
                </div>
                <div
                  style={{
                    width: 500,
                    padding: "20px 26px",
                    background: "#0f172a",
                    borderRadius: 20,
                    border: "2px solid #1e293b",
                  }}
                >
                  <div style={{ fontSize: 16, color: "#38bdf8", marginBottom: 8 }}>1. Read 4 MB block into RAM cache</div>
                  <div style={{ fontSize: 16, color: C.amber, marginBottom: 8 }}>2. Modify 16 KB target page in buffer</div>
                  <div style={{ fontSize: 16, color: "#f87171", marginBottom: 8 }}>3. High-voltage 20V erase whole 4 MB block</div>
                  <div style={{ fontSize: 16, color: "#22c55e" }}>4. Write back all 256 pages to flash</div>
                  <div style={{ height: 2, background: "#334155", margin: "14px 0" }} />
                  <div style={{ fontSize: 16, color: "#f87171", textAlign: "center", fontWeight: 800 }}>
                    250× More Data Moved Than Requested!
                  </div>
                </div>
              </div>
            )}

            {/* Beat 4: Write Amplification */}
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
                  WRITE AMPLIFICATION COLLAPSE
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
                  <div style={{ fontSize: 16, color: "#94a3b8" }}>SSD WRITE PERFORMANCE IMPACT</div>
                  <div style={{ fontSize: 60, fontWeight: 900, color: "#f87171", margin: "10px 0" }}>
                    -80%
                  </div>
                  <div style={{ fontSize: 18, color: C.amber, fontWeight: 700 }}>
                    WRITE SPEEDS SLASHED
                  </div>
                  <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}>
                    Flash wear-out accelerates 4× faster without TRIM.
                  </div>
                </div>
              </div>
            )}

            {/* Beat 5: The TRIM Command */}
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
                  THE SOLUTION: THE TRIM COMMAND
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
                    <span style={{ fontSize: 15, color: "#94a3b8" }}>SATA SPEC:</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: C.cyan }}>DATA SET MANAGEMENT</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                    <span style={{ fontSize: 15, color: "#94a3b8" }}>NVMe SPEC:</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "#22c55e" }}>DATASET DEALLOCATE</span>
                  </div>
                  <div style={{ height: 2, background: "#334155", margin: "16px 0" }} />
                  <div style={{ fontSize: 16, color: C.amber, textAlign: "center", fontWeight: 700 }}>
                    Informs the SSD controller which LBAs are dead immediately!
                  </div>
                </div>
              </div>
            )}

            {/* Beat 6: Background Garbage Collection */}
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
                  BACKGROUND FLASH RECYCLING
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
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#22c55e", textAlign: "center" }}>
                    IDLE GARBAGE COLLECTION
                  </div>
                  <div style={{ fontSize: 15, color: "#cbd5e1", marginTop: 12, textAlign: "center", lineHeight: 1.5 }}>
                    The SSD controller cleans stale blocks during idle time. When you write a new file, it lands instantly in fresh erased blocks at full PCIe speed.
                  </div>
                  <div style={{ height: 2, background: "#334155", margin: "16px 0" }} />
                  <div style={{ fontSize: 16, color: C.amber, textAlign: "center", fontWeight: 700 }}>
                    Full speed sustained · Flash lifespan preserved!
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
