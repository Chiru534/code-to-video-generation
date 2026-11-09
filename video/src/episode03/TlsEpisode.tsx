import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, F } from "../theme";
import { Backdrop, Caption, Kicker, Stage, Watermark } from "../chrome";
import timings from "./timings.json";

const ease = Easing.bezier(0.22, 1, 0.36, 1);
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const CENTER_X = 540;

/* ---------------- scenes ---------------- */

const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = ["Proving", "It's", "Safe"];
  return (
    <Stage>
      <Kicker text="EPISODE 03 · STEP 3 OF 5" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        {words.map((w, i) => {
          const s = spring({ frame: frame - 6 - i * 5, fps, config: { damping: 15, stiffness: 120 } });
          return (
            <span
              key={w}
              style={{
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 128,
                letterSpacing: "-0.045em",
                lineHeight: 1,
                color: i === 2 ? C.cyan : C.text,
                opacity: Math.max(0, Math.min(1, s)),
                transform: `translateY(${(1 - s) * 40}px)`,
                filter: `blur(${(1 - s) * 5}px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      <Caption text="Last time we opened a connection. But everything we send is still plain text." />
    </Stage>
  );
};

const PlaintextScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="THE PROBLEM" />
      <div style={{ width: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <div
          style={{
            width: 900,
            padding: "40px 50px",
            borderRadius: 20,
            backgroundColor: C.panel,
            border: `1px solid ${C.panelEdge}`,
            opacity: c,
            transform: `scale(${0.9 + 0.1 * c})`,
          }}
        >
          <div style={{ fontFamily: F.mono, fontSize: 20, color: C.amber, marginBottom: 16 }}>
            YOUR BROWSER
          </div>
          <div style={{ fontFamily: F.sans, fontSize: 28, color: C.text, textAlign: "center" }}>
            password = secret123
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 14, color: C.faint, marginTop: 12 }}>
            traveling as plain text
          </div>
        </div>
        <div
          style={{
            position: "relative",
            width: 900,
            height: 60,
            opacity: c,
          }}
        >
          <div style={{ position: "absolute", top: 29, left: 0, right: 0, height: 1, backgroundColor: C.panelEdge }} />
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 40,
              width: 40,
              height: 40,
              borderRadius: 40,
              backgroundColor: C.amber,
              boxShadow: "0 0 30px rgba(251,191,36,0.9)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -40,
              left: 40,
              fontFamily: F.mono,
              fontSize: 14,
              color: C.amber,
            }}
          >
            readable by every machine
          </div>
        </div>
        <div
          style={{
            width: 900,
            padding: "40px 50px",
            borderRadius: 20,
            backgroundColor: C.panel,
            border: `1px solid ${C.panelEdge}`,
            opacity: c,
            transform: `scale(${0.9 + 0.1 * c})`,
          }}
        >
          <div style={{ fontFamily: F.mono, fontSize: 20, color: C.violet, marginBottom: 16 }}>
            THE WEBSITE
          </div>
          <div style={{ fontFamily: F.sans, fontSize: 28, color: C.text, textAlign: "center" }}>
            receives secret123
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 14, color: C.faint, marginTop: 12 }}>
            anyone on the path could read it
          </div>
        </div>
      </div>
      <Caption text="Every router, every proxy, every coffee shop Wi-Fi in between can read it." />
    </Stage>
  );
};

const CertificateScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="CERTIFICATES" />
      <div
        style={{
          width: 860,
          padding: "40px 50px",
          borderRadius: 20,
          backgroundColor: C.panel,
          border: `2px solid ${C.cyan}`,
          opacity: c,
          transform: `scale(${0.9 + 0.1 * c})`,
        }}
      >
        <div style={{ fontFamily: F.mono, fontSize: 20, color: C.cyan, marginBottom: 16 }}>
          CERTIFICATE
        </div>
        <div style={{ fontFamily: F.sans, fontSize: 30, color: C.text, marginBottom: 8 }}>
          example.com
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 16, color: C.muted }}>
          Issued by: DigiCert
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 16, color: C.muted }}>
          Valid: 2024-01-01 to 2025-01-01
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 16, color: C.muted, marginTop: 12 }}>
          Public Key: 0x4a3f…
        </div>
      </div>
      <Caption text="A digital ID that says this server really is who it claims to be." />
    </Stage>
  );
};

const CAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="CERTIFICATE AUTHORITY" />
      <div style={{ width: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div style={{ width: 860, padding: "22px 30px", borderRadius: 14, border: `1px solid ${C.panelEdge}`, backgroundColor: C.panel, opacity: c }}>
          <div style={{ fontFamily: F.mono, fontSize: 20, letterSpacing: "0.14em", color: C.amber }}>
            CA · DigiCert
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 14, color: C.faint, marginTop: 6 }}>
            vouches for example.com
          </div>
        </div>
        <div style={{ position: "relative", width: 860, height: 60 }}>
          <div style={{ position: "absolute", top: 29, left: 0, right: 0, height: 1, backgroundColor: C.panelEdge }} />
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 400,
              fontFamily: F.mono,
              fontSize: 14,
              color: C.cyan,
            }}
          >
            → signs certificate
          </div>
        </div>
        <div style={{ width: 860, padding: "22px 30px", borderRadius: 14, border: `1px solid ${C.panelEdge}`, backgroundColor: C.panel, opacity: c }}>
          <div style={{ fontFamily: F.mono, fontSize: 20, letterSpacing: "0.14em", color: C.cyan }}>
            Browser · example.com
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 14, color: C.faint, marginTop: 6 }}>
            trusts DigiCert root
          </div>
        </div>
      </div>
      <Caption text="Someone your computer already trusts vouches for the identity." />
    </Stage>
  );
};

const KeyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="PUBLIC / PRIVATE KEYS" />
      <div style={{ width: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <div
          style={{
            width: 400,
            padding: "40px",
            borderRadius: 16,
            backgroundColor: C.panel,
            border: `1px solid ${C.cyan}`,
            opacity: c,
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: F.mono, fontSize: 20, color: C.cyan, marginBottom: 8 }}>
            PUBLIC KEY
          </div>
          <div style={{ fontFamily: F.sans, fontSize: 22, color: C.text }}>
            Share with anyone
          </div>
        </div>
        <div
          style={{
            width: 400,
            padding: "40px",
            borderRadius: 16,
            backgroundColor: C.panel,
            border: `1px solid ${C.violet}`,
            opacity: c,
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: F.mono, fontSize: 20, color: C.violet, marginBottom: 8 }}>
            PRIVATE KEY
          </div>
          <div style={{ fontFamily: F.sans, fontSize: 22, color: C.text }}>
            Never leaves server
          </div>
        </div>
      </div>
      <Caption text="The math that proves ownership without ever sending the secret." />
    </Stage>
  );
};

const HandshakeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="TLS HANDSHAKE" />
      <div style={{ width: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ width: 900, display: "flex", justifyContent: "space-between", opacity: c }}>
          <div style={{ width: 400, textAlign: "center" }}>
            <div style={{ fontFamily: F.mono, fontSize: 18, color: C.cyan }}>CLIENT</div>
            <div style={{ fontFamily: F.mono, fontSize: 14, color: C.faint, marginTop: 4 }}>says hello</div>
          </div>
          <div style={{ width: 400, textAlign: "center" }}>
            <div style={{ fontFamily: F.mono, fontSize: 18, color: C.violet }}>SERVER</div>
            <div style={{ fontFamily: F.mono, fontSize: 14, color: C.faint, marginTop: 4 }}>responds</div>
          </div>
        </div>
        <div
          style={{
            width: 900,
            position: "relative",
            height: 200,
            opacity: c,
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, backgroundColor: C.panelEdge }} />
          <div style={{ position: "absolute", top: 10, left: 40, fontFamily: F.mono, fontSize: 14, color: C.amber }}>
            Client Hello
          </div>
          <div style={{ position: "absolute", top: 40, left: 400, fontFamily: F.mono, fontSize: 14, color: C.amber }}>
            Server Hello + Cert
          </div>
          <div style={{ position: "absolute", top: 70, left: 40, fontFamily: F.mono, fontSize: 14, color: C.amber }}>
            Key Exchange
          </div>
          <div style={{ position: "absolute", top: 100, left: 800, fontFamily: F.mono, fontSize: 14, color: C.amber }}>
            Finished
          </div>
          <div style={{ position: "absolute", top: 50, left: 440, width: 20, height: 80, backgroundColor: C.amber, opacity: 0.4 }} />
        </div>
      </div>
      <Caption text="Four messages. One more round trip. Now both sides have agreed on a session key." />
    </Stage>
  );
};

const KeyExchangeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="KEY EXCHANGE" />
      <div style={{ width: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div style={{ width: 900, padding: "30px 0", backgroundColor: C.panel, borderRadius: 16, border: `1px solid ${C.panelEdge}`, opacity: c }}>
          <div style={{ fontFamily: F.mono, fontSize: 18, color: C.cyan, textAlign: "center" }}>
            Client sends: gᵃ mod p
          </div>
        </div>
        <div style={{ width: 900, position: "relative", height: 60, marginTop: 20 }}>
          <div style={{ position: "absolute", top: 29, left: 0, right: 0, height: 1, backgroundColor: C.panelEdge }} />
          <div style={{ position: "absolute", top: 40, left: 400, fontFamily: F.mono, fontSize: 14, color: C.cyan }}>
            → shared secret derivation
          </div>
        </div>
        <div style={{ width: 900, padding: "30px 0", backgroundColor: C.panel, borderRadius: 16, border: `1px solid ${C.panelEdge}`, opacity: c }}>
          <div style={{ fontFamily: F.mono, fontSize: 18, color: C.violet, textAlign: "center" }}>
            Server sends: gᵇ mod p
          </div>
        </div>
        <div style={{ marginTop: 24, opacity: c }}>
          <span style={{ fontFamily: F.mono, fontSize: 26, color: C.cyan }}>
            Shared secret: g^(ab) mod p
          </span>
        </div>
      </div>
      <Caption text="The session key never crossed the wire. Each side derived it from numbers they exchanged." />
    </Stage>
  );
};

const EncryptionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="ENCRYPTION" />
      <div style={{ width: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <div
          style={{
            width: 900,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            opacity: c,
          }}
        >
          <div
            style={{
              width: 400,
              padding: "40px",
              borderRadius: 16,
              backgroundColor: C.panel,
              border: `1px solid ${C.cyan}`,
              textAlign: "center",
            }}
          >
            <div style={{ fontFamily: F.mono, fontSize: 18, color: C.cyan }}>CLIENT</div>
            <div style={{ fontFamily: F.mono, fontSize: 14, color: C.faint, marginTop: 4 }}>encrypts</div>
          </div>
          <div
            style={{
              width: 80,
              height: 4,
              backgroundColor: C.cyan,
            }}
          />
          <div
            style={{
              width: 400,
              padding: "40px",
              borderRadius: 16,
              backgroundColor: C.panel,
              border: `1px solid ${C.violet}`,
              textAlign: "center",
            }}
          >
            <div style={{ fontFamily: F.mono, fontSize: 18, color: C.violet }}>SERVER</div>
            <div style={{ fontFamily: F.mono, fontSize: 14, color: C.faint, marginTop: 4 }}>decrypts</div>
          </div>
        </div>
      </div>
      <Caption text="From this point on, every byte is encrypted. Fast, efficient, readable only to both parties." />
    </Stage>
  );
};

const PadlockScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="THE PADLOCK" />
      <div
        style={{
          width: 200,
          height: 200,
          borderRadius: 20,
          backgroundColor: C.panel,
          border: `2px solid ${C.cyan}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: c,
          transform: `scale(${0.8 + 0.2 * c})`,
        }}
      >
        <span style={{ fontSize: 80 }}>🔒</span>
      </div>
      <Caption text="The padlock means the connection is encrypted. Not that the site is honest or safe to buy from." />
    </Stage>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 6, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="EPISODE 03 · STEP 3 OF 5" />
      <div
        style={{
          fontFamily: F.sans,
          fontWeight: 800,
          fontSize: 60,
          color: C.text,
          opacity: s,
          transform: `translateY(${(1 - s) * 20}px)`,
          textAlign: "center",
        }}
      >
        Next
      </div>
      <div
        style={{
          fontFamily: F.sans,
          fontWeight: 600,
          fontSize: 36,
          color: C.cyan,
          marginTop: 20,
          opacity: s,
          textAlign: "center",
        }}
      >
        Asking for the page. HTTP.
      </div>
      <Caption text="The request, the response, and the two hundred milliseconds you started with." />
    </Stage>
  );
};

/* ---------------- timeline (driven by measured narration) ---------------- */

const TAIL_FRAMES = 12; // 0.4s of air after each line

const SCENE_NODES: Record<string, React.ReactNode> = {
  s01: <TitleScene />,
  s02: <PlaintextScene />,
  s03: <CertificateScene />,
  s04: <CAScene />,
  s05: <KeyScene />,
  s06: <HandshakeScene />,
  s07: <KeyExchangeScene />,
  s08: <EncryptionScene />,
  s09: <PadlockScene />,
  s10: <EndCard />,
};

type Plan = { id: string; from: number; dur: number };

const buildPlan = (): Plan[] => {
  let cursor = 0;
  return Object.keys(SCENE_NODES).map((id) => {
    const measured = timings.scenes[id as keyof typeof timings.scenes];
    const dur = (measured?.frames ?? 240) + TAIL_FRAMES;
    const item = { id, from: cursor, dur };
    cursor += dur;
    return item;
  });
};

const PLAN = buildPlan();

export const DURATION = PLAN.reduce((n, p) => n + p.dur, 0);

export const TlsEpisode: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Backdrop />
      {PLAN.map((p) => (
        <Sequence key={p.id} from={p.from} durationInFrames={p.dur}>
          <Audio src={staticFile(`audio/ep03/${p.id}.wav`)} />
          {SCENE_NODES[p.id]}
        </Sequence>
      ))}
      <Watermark text="EP 03 · PROVING IT'S SAFE" />
    </AbsoluteFill>
  );
};
