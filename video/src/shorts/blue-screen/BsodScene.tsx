import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../../theme";

/* CRT Scanlines and curvature effect */
const CRTOverlay: React.FC<{ opacity?: number }> = ({ opacity = 0.12 }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <pattern id="scanlines" width="100" height="4" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="100" y2="0" stroke="#000" strokeWidth="1.5" opacity={opacity} />
        </pattern>
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="60%" stopColor="transparent" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#scanlines)" />
      <rect width="100%" height="100%" fill="url(#vignette)" />
    </svg>
  </AbsoluteFill>
);

/* Blinking terminal cursor */
const Cursor: React.FC<{ color?: string }> = ({ color = "#FFFFFF" }) => {
  const frame = useCurrentFrame();
  const visible = Math.floor(frame / 12) % 2 === 0;
  return (
    <span style={{ opacity: visible ? 1 : 0, color, fontWeight: 900, marginLeft: 4 }}>
      █
    </span>
  );
};

/* 16-Color Classic VGA Palette Strip with sweeping active highlight */
const VGAPaletteStrip: React.FC<{ activeIndex: number }> = ({ activeIndex }) => {
  const frame = useCurrentFrame();
  const vgaColors = [
    "#000000", "#0000AA", "#00AA00", "#00AAAA",
    "#AA0000", "#AA00AA", "#AA5500", "#AAAAAA",
    "#555555", "#5555FF", "#55FF55", "#55FFFF",
    "#FF5555", "#FF55FF", "#FFFF55", "#FFFFFF"
  ];

  const sweep = Math.floor(frame / 8) % vgaColors.length;

  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center", margin: "16px 0" }}>
      {vgaColors.map((col, idx) => {
        const isTarget = idx === activeIndex;
        const isSwept = idx === sweep;
        return (
          <div
            key={idx}
            style={{
              width: isTarget ? 46 : 26,
              height: isTarget ? 46 : 26,
              backgroundColor: col,
              border: isTarget ? "3px solid #FFFF55" : isSwept ? "2px solid #FFFFFF" : "1px solid #333344",
              borderRadius: 6,
              boxShadow: isTarget ? `0 0 20px ${col}` : isSwept ? "0 0 10px #FFFFFF" : "none",
              transform: isTarget ? "scale(1.1)" : isSwept ? "scale(1.05)" : "scale(1.0)",
              transition: "transform 0.1s ease",
            }}
          />
        );
      })}
    </div>
  );
};

export const ShortBsodScene: React.FC<{
  beat: number;
  kicker: string;
  assertion: string;
  reversal: string;
  note?: string;
}> = ({ beat, kicker, assertion, reversal, note }) => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const t = frame / fps;

  // Spring entrance plus continuous gentle drift to prevent static stills
  const enter = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
  const driftY = Math.sin(t * 1.5) * 4;
  const slowZoom = 1.0 + (t / 20) * 0.025;

  // Continuous sweeping CRT raster bar travelling down the screen (guarantees pixel change every frame)
  const scanY = (frame * 5.2) % (h - 96);

  // Dynamic code typing progress for SlickEdit scene
  const fullCode = [
    'VOID KeBugCheckEx(ULONG BugCheckCode) {',
    '    HalDisplayString("\\x1b[37;44m"); // White on Blue',
    '    HalDisplayString("*** STOP: 0x0000001E");',
    '    KeSaveProcessorState(&Context);',
    '}'
  ].join('\n');
  const typedLength = Math.min(fullCode.length, Math.floor(frame * 1.4));
  const currentTypedCode = fullCode.slice(0, typedLength);

  // Authentic VGA BSOD background color: #0000AA
  const bsodBlue = "#0000AA";
  const darkNavy = "#040714";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: darkNavy,
        fontFamily: F.mono,
        color: "#EDEFF5",
        padding: 48,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Background ambient CRT container with continuous drift */}
      <div
        style={{
          position: "absolute",
          inset: 32,
          backgroundColor: beat === 0 || beat === 5 || beat === 6 ? "#000055" : "#080c1c",
          borderRadius: 24,
          border: "2px solid #1a2238",
          boxShadow: `inset 0 0 80px rgba(0, 0, 170, 0.3), 0 0 40px rgba(0, 0, 0, 0.8)`,
          overflow: "hidden",
          transform: `scale(${slowZoom}) translateY(${driftY}px)`,
        }}
      >
        {/* Dynamic scrolling hex memory columns */}
        <div
          style={{
            position: "absolute",
            top: -((frame * 2.8) % 240),
            left: 24,
            right: 24,
            opacity: 0.18,
            fontSize: 16,
            lineHeight: 1.6,
            color: C.cyan,
            userSelect: "none",
          }}
        >
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i}>
              0x8040{((i * 16 + frame) % 65536).toString(16).padStart(4, "0")}: 4D 5A 90 00 03 00 00 00 04 00 00 00 FF FF 00 00
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
            height: 3,
            backgroundColor: "rgba(34, 211, 238, 0.35)",
            boxShadow: "0 0 16px rgba(34, 211, 238, 0.6)",
            pointerEvents: "none",
          }}
        />

        {/* CONTENT CANVAS */}
        <div
          style={{
            position: "absolute",
            inset: 36,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transform: `translateY(${(1 - enter) * 18}px)`,
            opacity: enter,
          }}
        >
          {/* HEADER: Terminal Title Bar */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 12 }}>
              <div style={{ color: C.amber, fontSize: 22, letterSpacing: 4, fontWeight: 800 }}>
                {kicker}
              </div>
              <div style={{ color: C.cyan, fontSize: 18, letterSpacing: 2 }}>
                NT_KERNEL::BUGCHECK_VGA
              </div>
            </div>

            {/* PUNCHY REVERSAL HEADLINE */}
            <div style={{ marginTop: 24, background: "rgba(0,0,0,0.55)", padding: "20px 24px", borderRadius: 12, borderLeft: `6px solid ${C.amber}` }}>
              <div style={{ color: "#FFFFFF", fontSize: 44, fontWeight: 900, lineHeight: 1.1, letterSpacing: -0.5 }}>
                {assertion}
              </div>
              <div style={{ color: C.amber, fontSize: 40, fontWeight: 800, lineHeight: 1.15, marginTop: 8 }}>
                {reversal}
              </div>
            </div>
          </div>

          {/* CENTER STAGE: TECHNICAL COMPOSITION */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", margin: "24px 0" }}>
            {beat === 0 && (
              /* Beat 0: Windows Bugcheck Screen with Live Register Updates */
              <div style={{ width: "100%", background: bsodBlue, padding: 32, borderRadius: 16, border: "2px solid #5555FF", boxShadow: "0 0 30px rgba(0,0,170,0.5)" }}>
                <div style={{ color: "#FFFFFF", fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
                  *** STOP: 0x0000001E (0xC0000005, 0xFDE38AF9, 0x00000001, 0x00000000)
                </div>
                <div style={{ color: "#FFFFFF", fontSize: 20, opacity: 0.95, lineHeight: 1.4 }}>
                  KMODE_EXCEPTION_NOT_HANDLED in ntoskrnl.exe<br />
                  Address FDE38AF9 base at FDE00000, DateStamp 31dc898c<br />
                  EIP: 80132A4C &nbsp; ESP: FDE38B20 &nbsp; CR0: 8001003B
                </div>
                <div style={{ marginTop: 28, padding: "14px 20px", background: "rgba(251, 191, 36, 0.2)", border: `2px solid ${C.amber}`, borderRadius: 8, color: C.amber, fontSize: 22, fontWeight: 800, textAlign: "center" }}>
                  POPULAR MYTH: &quot;BLUE WAS CHOSEN TO CALM USERS&quot;
                </div>
              </div>
            )}

            {beat === 1 && (
              /* Beat 1: Debunked Claim & 1991 Timeline */
              <div style={{ width: "100%", textAlign: "center" }}>
                <div style={{ fontSize: 28, color: C.red, fontWeight: 900, letterSpacing: 4, marginBottom: 12 }}>
                  [ CLAIM DEBUNKED ]
                </div>
                <div style={{ fontSize: 76, fontWeight: 900, color: "#FFFFFF", textShadow: "0 0 25px rgba(255,255,255,0.5)" }}>
                  1991
                </div>
                <div style={{ fontSize: 24, color: C.cyan, letterSpacing: 2, marginTop: 8 }}>
                  MICROSOFT REDMOND · NT KERNEL TEAM
                </div>
                <div style={{ marginTop: 24, background: "#0a1128", padding: 22, borderRadius: 12, border: "1px solid #1e293b", textAlign: "left", fontSize: 21, color: C.text, lineHeight: 1.6 }}>
                  &gt; Lead Engineer: John Vert<br />
                  &gt; Component: KeBugCheckEx() crash routine<br />
                  &gt; Constraint: Zero dependency on GUI display drivers
                  <Cursor color={C.cyan} />
                </div>
              </div>
            )}

            {beat === 2 && (
              /* Beat 2: Hardware VGA Fallback & Palette Sweep */
              <div style={{ width: "100%", background: "#0a1024", padding: 24, borderRadius: 16, border: "1px solid #1e293b" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: C.dim, fontSize: 18, marginBottom: 12 }}>
                  <span>DRIVER SUBSYSTEM STATUS</span>
                  <span style={{ color: C.red, fontWeight: 800 }}>OFFLINE</span>
                </div>
                <div style={{ background: "#000000", padding: 16, borderRadius: 8, color: C.red, fontSize: 20, marginBottom: 20, borderLeft: "4px solid #FF1744" }}>
                  [X] GDI32.DLL TERMINATED<br />
                  [X] DISPLAY DRIVERS DEAD<br />
                  [&gt;] FALLBACK: VGA BIOS TEXT MODE 03h (80x25)
                </div>
                <div style={{ textAlign: "center", color: C.cyan, fontSize: 18, letterSpacing: 2, marginBottom: 8 }}>
                  16-COLOR HARDWARE PALETTE REGISTERS:
                </div>
                <VGAPaletteStrip activeIndex={1} />
                <div style={{ textAlign: "center", color: C.amber, fontSize: 22, fontWeight: 800, marginTop: 10 }}>
                  COLOR 1 SELECTED: 0x0000AA (COBALT BLUE)
                </div>
              </div>
            )}

            {beat === 3 && (
              /* Beat 3: MIPS Workstation Vector Console */
              <div style={{ width: "100%", background: "#060a18", padding: 24, borderRadius: 16, border: "1px solid #1e293b" }}>
                <div style={{ borderBottom: "1px solid #1e293b", paddingBottom: 8, color: C.cyan, fontSize: 18, display: "flex", justifyContent: "space-between" }}>
                  <span>DEV WORKSTATION: MIPS R4000 RISC</span>
                  <span style={{ color: C.amber }}>ARC FIRMWARE</span>
                </div>
                <div style={{ background: bsodBlue, padding: 22, borderRadius: 8, marginTop: 14, color: "#FFFFFF", fontSize: 20, lineHeight: 1.55 }}>
                  ARC Firmware Version 1.2<br />
                  CPU: MIPS R4000 64-bit @ 100MHz<br />
                  Console Device: /video/vga0 (Mode 03h)<br />
                  Default Console Palette: White on Cobalt Blue
                  <Cursor />
                </div>
                <div style={{ marginTop: 16, color: C.dim, fontSize: 18, textAlign: "center" }}>
                  The hardware console booted into blue by default.
                </div>
              </div>
            )}

            {beat === 4 && (
              /* Beat 4: Live Typing in SlickEdit Text Editor */
              <div style={{ width: "100%", background: "#070c1e", padding: 24, borderRadius: 16, border: "1px solid #1e293b" }}>
                <div style={{ background: "#111827", padding: "8px 16px", borderRadius: "8px 8px 0 0", color: C.amber, fontSize: 18, display: "flex", justifyContent: "space-between" }}>
                  <span>SLICKEDIT - BUGCHECK.C</span>
                  <span>1991</span>
                </div>
                <div style={{ background: bsodBlue, padding: 20, borderRadius: "0 0 8px 8px", color: "#FFFFFF", fontSize: 19, lineHeight: 1.5, minHeight: 160, whiteSpace: "pre-wrap" }}>
                  {currentTypedCode}
                  <Cursor />
                </div>
                <div style={{ color: C.cyan, fontSize: 18, marginTop: 14, textAlign: "center", fontWeight: 700 }}>
                  VERT SPENT 12+ HOURS A DAY CODING IN THIS BLUE WINDOW
                </div>
              </div>
            )}

            {beat === 5 && (
              /* Beat 5: Triple Synchrony — Zero Flicker */
              <div style={{ width: "100%" }}>
                <div style={{ textAlign: "center", color: C.amber, fontSize: 22, fontWeight: 900, marginBottom: 16 }}>
                  THE TRIPLE-BLUE SYNCHRONIZATION
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div style={{ background: bsodBlue, padding: 16, borderRadius: 8, textAlign: "center", border: "2px solid #5555FF" }}>
                    <div style={{ fontSize: 14, color: C.cyan }}>BOOT</div>
                    <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>MIPS ARC</div>
                  </div>
                  <div style={{ background: bsodBlue, padding: 16, borderRadius: 8, textAlign: "center", border: "2px solid #5555FF" }}>
                    <div style={{ fontSize: 14, color: C.cyan }}>CODE</div>
                    <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>SLICKEDIT</div>
                  </div>
                  <div style={{ background: bsodBlue, padding: 16, borderRadius: 8, textAlign: "center", border: "2px solid #5555FF" }}>
                    <div style={{ fontSize: 14, color: C.cyan }}>CRASH</div>
                    <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>BSOD</div>
                  </div>
                </div>
                <div style={{ marginTop: 22, padding: 16, background: "rgba(34, 211, 238, 0.15)", border: `2px solid ${C.cyan}`, borderRadius: 10, textAlign: "center", color: C.cyan, fontSize: 22, fontWeight: 800 }}>
                  &gt;&gt; RESULT: ZERO MONITOR FLICKER ON CRASH &lt;&lt;
                </div>
              </div>
            )}

            {beat === 6 && (
              /* Beat 6: Legacy & 1.4 Billion Devices */
              <div style={{ width: "100%", textAlign: "center" }}>
                <div style={{ fontSize: 88, fontWeight: 900, color: C.cyan, textShadow: "0 0 30px rgba(34,211,238,0.6)", lineHeight: 1 }}>
                  1.4B
                </div>
                <div style={{ fontSize: 24, color: "#FFFFFF", letterSpacing: 2, marginTop: 12, fontWeight: 800 }}>
                  ACTIVE WINDOWS DEVICES TODAY
                </div>
                <div style={{ marginTop: 26, padding: "18px 24px", background: "rgba(0,0,0,0.65)", border: `2px solid ${C.amber}`, borderRadius: 12, color: C.amber, fontSize: 22, fontWeight: 800, lineHeight: 1.4 }}>
                  STILL CRASHING IN JOHN VERT&apos;S TEXT EDITOR COLORS
                </div>
              </div>
            )}
          </div>

          {/* FOOTER: Verified Source Annotation */}
          {note && (
            <div
              style={{
                background: "rgba(0,0,0,0.75)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                padding: "12px 18px",
                color: C.dim,
                fontSize: 17,
                textAlign: "center",
                letterSpacing: 1,
              }}
            >
              {note}
            </div>
          )}
        </div>
      </div>

      {/* CRT Scanline & Phosphor Overlay */}
      <CRTOverlay opacity={0.16} />
    </AbsoluteFill>
  );
};
