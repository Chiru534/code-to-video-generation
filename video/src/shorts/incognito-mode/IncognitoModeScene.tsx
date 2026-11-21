import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../../theme";

export interface IncognitoModeSceneProps {
  beat: number;
  subtitle: string;
  sourceNote?: string;
}

export const ShortIncognitoModeScene: React.FC<IncognitoModeSceneProps> = ({
  beat,
  subtitle,
  sourceNote = "CHROMIUM NETWORK STACK & W3C PRIVACY WORKING GROUP",
}) => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const t = frame / fps;

  const enter = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
  const driftY = Math.sin(t * 1.5) * 4;
  const slowZoom = 1.0 + (t / 18) * 0.025;
  const scanY = (frame * 5.2) % (h - 96);

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
        {/* Scrolling Network Trace */}
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
              {`PKT #${(1024 + i * 17)} : UDP 192.168.1.104:54321 -> 1.1.1.1:53 [DNS_A_QUERY q=search-target-${i}.com] PLAIN_TEXT_LEAK`}
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
              BROWSER ARCHITECTURE &amp; PACKET VISIBILITY
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
              INCOGNITO MODE
            </div>
            <div style={{ fontSize: 30, color: C.amber, fontStyle: "italic", fontWeight: 800, marginTop: 8 }}>
              (only forgets your cookies)
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
                  THE MYTH: "TOTAL ANONYMITY CLOAK"
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
                  <div style={{ fontSize: 72 }}>🕶️ 🕵️</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#94a3b8", marginTop: 12 }}>
                    PRIVATE BROWSING WINDOW
                  </div>
                  <div style={{ fontSize: 16, color: "#ef4444", marginTop: 6, fontWeight: 700 }}>
                    Assumed: Invisible to ISP &amp; Trackers
                  </div>
                </div>
                <div style={{ color: C.cyan, fontSize: 18, marginTop: 20, fontWeight: 700 }}>
                  A PSYCHOLOGICAL COMFORT BLANKET
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
                  THE REALITY: LOCAL DISK HYGIENE ONLY
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
                    <span style={{ color: "#94a3b8" }}>LOCAL HISTORY SQLITE:</span>
                    <span style={{ color: "#22c55e", fontWeight: 800 }}>WIPED ON EXIT</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>SESSION COOKIE JAR:</span>
                    <span style={{ color: "#22c55e", fontWeight: 800 }}>DISCARDED ON EXIT</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #1e293b", paddingTop: 10 }}>
                    <span style={{ color: "#ef4444", fontWeight: 800 }}>OUTBOUND NETWORK TRAFFIC:</span>
                    <span style={{ color: "#ef4444", fontWeight: 900 }}>100% UNCHANGED</span>
                  </div>
                </div>
                <div style={{ color: C.amber, fontSize: 18, marginTop: 20, fontWeight: 800 }}>
                  YOUR DISK FORGETS. THE WIRE BROADCASTS.
                </div>
              </div>
            )}

            {/* Beat 2: DNS Leaks */}
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
                  PLAIN TEXT DNS LEAK (UDP PORT 53)
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
                  <div style={{ fontSize: 16, color: "#94a3b8", marginBottom: 12 }}>OUTBOUND SOCKET TRACE:</div>
                  <div style={{ background: "#020617", padding: 16, borderRadius: 12, border: "1px solid #334155", fontSize: 15, color: "#38bdf8", lineHeight: 1.6 }}>
                    <div>SOCKET: UDP 192.168.1.104:54321 → 1.1.1.1:53</div>
                    <div style={{ color: "#ef4444", fontWeight: 800, marginTop: 6 }}>QUERY: "example-confidential.com"</div>
                    <div style={{ color: "#64748b", marginTop: 4 }}>Visible to: Wi-Fi Admin, Gateway, ISP, Upstream Tier 1</div>
                  </div>
                </div>
                <div style={{ color: "#ef4444", fontSize: 18, marginTop: 20, fontWeight: 800 }}>
                  EVERY DOMAIN VISITED IS LOGGED AT THE ROUTER
                </div>
              </div>
            )}

            {/* Beat 3: TLS SNI Leak */}
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
                  TLS CLIENT HELLO: SERVER NAME INDICATION
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
                  <div style={{ fontSize: 15, color: "#94a3b8", marginBottom: 10 }}>TLS 1.3 HANDSHAKE PACKET:</div>
                  <div style={{ borderLeft: "4px solid #f59e0b", paddingLeft: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ color: "#94a3b8" }}>ContentType: Handshake (22)</div>
                    <div style={{ color: "#94a3b8" }}>HandshakeType: ClientHello (1)</div>
                    <div style={{ color: "#ef4444", fontWeight: 800 }}>Extension: server_name (SNI)</div>
                    <div style={{ color: "#f59e0b", background: "rgba(245, 158, 11, 0.1)", padding: 6, borderRadius: 6 }}>
                      Server Name: "private-health-portal.org" [UNENCRYPTED]
                    </div>
                  </div>
                </div>
                <div style={{ color: C.amber, fontSize: 18, marginTop: 20, fontWeight: 800 }}>
                  ENCRYPTION STARTS ONLY AFTER HOSTNAME IS ANNOUNCED
                </div>
              </div>
            )}

            {/* Beat 4: Device Fingerprinting */}
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
                  COOKIE-LESS CANVAS &amp; AUDIO FINGERPRINTING
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
                    <span style={{ color: "#94a3b8" }}>CANVAS 2D HASH:</span>
                    <span style={{ color: "#38bdf8", fontWeight: 800 }}>0x9E3779B9</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>WEBGL GPU RENDERER:</span>
                    <span style={{ color: "#38bdf8", fontWeight: 800 }}>APPLE M-SERIES</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>AUDIOCONTEXT LATENCY:</span>
                    <span style={{ color: "#38bdf8", fontWeight: 800 }}>44,100 Hz / 128 SPL</span>
                  </div>
                  <div style={{ borderTop: "1px solid #1e293b", paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#ef4444", fontWeight: 800 }}>ENTROPY IDENTIFIER:</span>
                    <span style={{ color: "#ef4444", fontWeight: 900 }}>1 IN 2.8 MILLION</span>
                  </div>
                </div>
                <div style={{ color: "#38bdf8", fontSize: 18, marginTop: 20, fontWeight: 800 }}>
                  YOUR HARDWARE FINGERPRINTS YOU WITHOUT COOKIES
                </div>
              </div>
            )}

            {/* Beat 5: Google $5B Lawsuit */}
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
                  BROWN V. GOOGLE: $5 BILLION SETTLEMENT
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
                  <div style={{ fontSize: 18, color: "#FFFFFF", fontWeight: 800, marginBottom: 12 }}>
                    FEDERAL COURT FINDINGS (2024):
                  </div>
                  <div style={{ color: "#cbd5e1", fontSize: 15, lineHeight: 1.6 }}>
                    Third-party analytics scripts logged user browsing sessions regardless of Incognito status. Google agreed to delete billions of records and update disclosures.
                  </div>
                </div>
                <div style={{ color: "#ef4444", fontSize: 18, marginTop: 20, fontWeight: 800 }}>
                  AD NETWORKS NEVER HONORED INCOGNITO STATUS
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
                  WHO INCOGNITO ACTUALLY PROTECTS
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
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                    <span style={{ color: "#22c55e" }}>PROTECTS AGAINST:</span>
                    <span style={{ fontWeight: 800, color: "#22c55e" }}>ROOMMATE / SPOUSE</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#ef4444" }}>DOES NOT PROTECT:</span>
                    <span style={{ fontWeight: 800, color: "#ef4444" }}>ISP, GOOGLE, WORKPLACE</span>
                  </div>
                </div>
                <div style={{ color: C.amber, fontSize: 18, marginTop: 20, fontWeight: 800, textAlign: "center" }}>
                  CONCEALS YOUR GIFT SHOPPING. NOT YOUR IDENTITY.
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
