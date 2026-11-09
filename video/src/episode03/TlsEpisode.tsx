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

/* ---------------- primitives ---------------- */

const Node: React.FC<{
  title: string;
  sub: string;
  accent?: string;
  opacity?: number;
  width?: number;
}> = ({ title, sub, accent = C.text, opacity = 1, width = 420 }) => (
  <div
    style={{
      width,
      padding: "30px 0",
      borderRadius: 16,
      backgroundColor: C.panel,
      border: `1px solid ${C.panelEdge}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
      opacity,
    }}
  >
    <span style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 34, color: accent }}>
      {title}
    </span>
    <span style={{ fontFamily: F.mono, fontSize: 22, color: C.muted }}>{sub}</span>
  </div>
);

const Row: React.FC<{ children: React.ReactNode; gap?: number }> = ({
  children,
  gap = 40,
}) => (
  <div style={{ display: "flex", gap, alignItems: "center", justifyContent: "center" }}>
    {children}
  </div>
);

const Arrow: React.FC<{ opacity?: number; vertical?: boolean }> = ({
  opacity = 1,
  vertical = false,
}) => (
  <div
    style={{
      opacity,
      width: vertical ? 2 : 120,
      height: vertical ? 60 : 2,
      backgroundColor: C.cyan,
      position: "relative",
    }}
  />
);

/* ---------------- scenes ---------------- */

const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = ["Proving", "It's", "Safe"];
  return (
    <Stage>
      <Kicker text="EPISODE 03 · STEP 3 OF 5" />
      <div style={{ display: "flex", marginTop: 30, gap: 22 }}>
        {words.map((w, i) => {
          const s = spring({ frame: frame - 6 - i * 5, fps, config: { damping: 15, stiffness: 120 } });
          return (
            <span
              key={w}
              style={{
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 138,
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
      <Row>
        <Node title="Client" sub="your browser" accent={C.cyan} />
        <div style={{ width: 200, height: 2, backgroundColor: C.muted, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: -20,
              left: 60,
              fontFamily: F.mono,
              fontSize: 20,
              color: C.amber,
              opacity: c,
            }}
          >
            password=secret
          </div>
        </div>
        <Node title="Server" sub="the website" accent={C.violet} />
      </Row>
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
          width: 600,
          padding: "40px 50px",
          borderRadius: 20,
          backgroundColor: C.panel,
          border: `2px solid ${C.cyan}`,
          opacity: c,
          transform: `scale(${0.9 + 0.1 * c})`,
        }}
      >
        <div style={{ fontFamily: F.mono, fontSize: 22, color: C.cyan, marginBottom: 16 }}>
          CERTIFICATE
        </div>
        <div style={{ fontFamily: F.sans, fontSize: 30, color: C.text, marginBottom: 8 }}>
          example.com
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 18, color: C.muted }}>
          Issued by: DigiCert
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 18, color: C.muted }}>
          Valid: 2024-01-01 to 2025-01-01
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 18, color: C.muted, marginTop: 12 }}>
          Public Key: 0x4a3f...
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
      <Row gap={60}>
        <Node title="CA" sub="DigiCert" accent={C.amber} />
        <Arrow opacity={c} />
        <Node title="Cert" sub="example.com" accent={C.cyan} />
        <Arrow opacity={c} />
        <Node title="Browser" sub="trusts CA" accent={C.violet} />
      </Row>
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
      <Row gap={80}>
        <div
          style={{
            width: 300,
            padding: "30px",
            borderRadius: 16,
            backgroundColor: C.panel,
            border: `1px solid ${C.cyan}`,
            opacity: c,
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: F.mono, fontSize: 22, color: C.cyan, marginBottom: 8 }}>
            PUBLIC KEY
          </div>
          <div style={{ fontFamily: F.sans, fontSize: 24, color: C.text }}>
            Share with anyone
          </div>
        </div>
        <div
          style={{
            width: 300,
            padding: "30px",
            borderRadius: 16,
            backgroundColor: C.panel,
            border: `1px solid ${C.violet}`,
            opacity: c,
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: F.mono, fontSize: 22, color: C.violet, marginBottom: 8 }}>
            PRIVATE KEY
          </div>
          <div style={{ fontFamily: F.sans, fontSize: 24, color: C.text }}>
            Never leaves server
          </div>
        </div>
      </Row>
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
      <Row gap={40}>
        <Node title="Client" sub="hello" accent={C.cyan} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, opacity: c }}>
          <span style={{ fontFamily: F.mono, fontSize: 20, color: C.amber }}>Client Hello</span>
          <span style={{ fontFamily: F.mono, fontSize: 20, color: C.amber }}>Server Hello + Cert</span>
          <span style={{ fontFamily: F.mono, fontSize: 20, color: C.amber }}>Key Exchange</span>
          <span style={{ fontFamily: F.mono, fontSize: 20, color: C.amber }}>Finished</span>
        </div>
        <Node title="Server" sub="hello + cert" accent={C.violet} />
      </Row>
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
      <Row gap={60}>
        <Node title="Client" sub="g^a mod p" accent={C.cyan} />
        <Arrow opacity={c} />
        <Node title="Server" sub="g^b mod p" accent={C.violet} />
      </Row>
      <div style={{ marginTop: 30, opacity: c }}>
        <span style={{ fontFamily: F.mono, fontSize: 28, color: C.cyan }}>
          Shared secret: g^(ab) mod p
        </span>
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
      <Row gap={40}>
        <Node title="Client" sub="encrypt" accent={C.cyan} />
        <div
          style={{
            width: 240,
            height: 4,
            backgroundColor: C.cyan,
            opacity: c,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -18,
              left: 70,
              fontFamily: F.mono,
              fontSize: 18,
              color: C.cyan,
              opacity: c,
            }}
          >
            AES-256-GCM
          </div>
        </div>
        <Node title="Server" sub="decrypt" accent={C.violet} />
      </Row>
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
          fontSize: 64,
          color: C.text,
          opacity: s,
          transform: `translateY(${(1 - s) * 20}px)`,
        }}
      >
        Next
      </div>
      <div
        style={{
          fontFamily: F.sans,
          fontWeight: 600,
          fontSize: 40,
          color: C.cyan,
          marginTop: 20,
          opacity: s,
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
