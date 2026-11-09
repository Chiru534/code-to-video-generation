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
import { Backdrop, Kicker, Stage, Watermark, wobble } from "../chrome";
import timings from "./timings.json";

const ease = Easing.bezier(0.22, 1, 0.36, 1);
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const CENTER_X = 540;

/* ---------------- primitives ---------------- */

const Node: React.FC<{
  title: string;
  sub: string;
  accent?: string;
  opacity?: number;
}> = ({ title, sub, accent = C.text, opacity = 1 }) => (
  <div
    style={{
      width: 860,
      padding: "30px 0",
      borderRadius: 16,
      backgroundColor: C.panel,
      border: `1px solid ${C.panelEdge}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
      opacity,
    }}
  >
    <div style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: "0.12em", color: accent }}>
      {title}
    </div>
    <div style={{ fontFamily: F.mono, fontSize: 15, color: C.faint }}>{sub}</div>
  </div>
);

const Line: React.FC<{ width: number; color?: string; dashed?: boolean; opacity?: number }> = ({
  width,
  color = C.panelEdge,
  dashed = false,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  if (!dashed) {
    return <div style={{ width, height: 2, backgroundColor: color, opacity }} />;
  }
  return (
    <div
      style={{
        width,
        height: 2,
        opacity,
        backgroundImage: `repeating-linear-gradient(90deg, ${color} 0 16px, transparent 16px 30px)`,
        backgroundPositionX: -(frame * 1.4),
      }}
    />
  );
};

const Card: React.FC<{
  head: string;
  rows: { k: string; v: string }[];
  color: string;
  lit?: number;
}> = ({ head, rows, color, lit = 1 }) => {
  const frame = useCurrentFrame();
  const pulse = 0.5 + 0.5 * Math.sin(frame / 18);
  return (
    <div
      style={{
        width: 860,
        borderRadius: 14,
        backgroundColor: "rgba(18,20,28,0.96)",
        border: `1px solid ${color}`,
        boxShadow: `0 24px 70px rgba(0,0,0,0.55), 0 0 ${28 + pulse * 26}px ${color}33`,
        padding: "22px 26px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        opacity: lit,
      }}
    >
      <div style={{ fontFamily: F.mono, fontSize: 16, letterSpacing: "0.26em", color }}>{head}</div>
      {rows.map((r, i) => (
        <div key={r.k} style={{ display: "flex", justifyContent: "space-between", gap: 24 }}>
          <span style={{ fontFamily: F.mono, fontSize: 18, color: C.dim }}>{r.k}</span>
          <span style={{ fontFamily: F.mono, fontSize: 22, color: i === 0 ? C.text : color }}>
            {r.v}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ---------------- scenes ---------------- */

const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = ["The", "Handshake"];
  const chip = spring({ frame: frame - 46, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="EPISODE 02 · STEP 2 OF 5" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        {words.map((w, i) => {
          const s = spring({
            frame: frame - 6 - i * 6,
            fps,
            config: { damping: 15, stiffness: 120 },
          });
          return (
            <span
              key={w}
              style={{
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 128,
                letterSpacing: "-0.045em",
                lineHeight: 1,
                color: i === 1 ? C.cyan : C.text,
                opacity: clamp01(s),
                transform: `translateY(${(1 - s) * 40}px)`,
                filter: `blur(${(1 - s) * 5}px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 44, opacity: chip }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 18,
            color: C.green,
            border: `1px solid ${C.green}55`,
            backgroundColor: `${C.green}12`,
            borderRadius: 10,
            padding: "10px 18px",
            textAlign: "center",
          }}
        >
          address ✓ 93.184.216.34
        </div>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 18,
            color: C.red,
            border: `1px solid ${C.red}55`,
            backgroundColor: `${C.red}12`,
            borderRadius: 10,
            padding: "10px 18px",
            textAlign: "center",
          }}
        >
          connection ✗ none
        </div>
      </div>
    </Stage>
  );
};

const GapScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 200 } });
  const b = spring({ frame: frame - 14, fps, config: { damping: 200 } });
  const travel = interpolate(frame % 150, [20, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  return (
    <Stage caption="Two machines. Two addresses. Nothing agreed between them.">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <Node title="YOUR COMPUTER" sub="knows the address" opacity={a} />
        <div style={{ position: "relative", width: 900, height: 100 }}>
          <div style={{ position: "absolute", top: 49, left: 0, width: "100%" }}>
            <Line width={900} dashed color="#2A2E3B" />
          </div>
          <div
            style={{
              position: "absolute",
              top: 30,
              left: 10 + travel * 780,
              height: 34,
              padding: "0 16px",
              borderRadius: 34,
              border: `1px solid ${C.violet}80`,
              backgroundColor: "rgba(167,139,250,0.14)",
              display: "flex",
              alignItems: "center",
              fontFamily: F.mono,
              fontSize: 16,
              color: C.violet,
              opacity: travel > 0.02 && travel < 0.99 ? 1 : 0,
              transform: `translateY(${Math.sin(frame / 8) * 3}px)`,
            }}
          >
            ?
          </div>
          <div
            style={{
              position: "absolute",
              top: 84,
              left: 0,
              width: "100%",
              textAlign: "center",
              fontFamily: F.mono,
              fontSize: 14,
              letterSpacing: "0.2em",
              color: C.faint,
              opacity: 0.8,
            }}
          >
            NO CONNECTION
          </div>
        </div>
        <Node title="example.com" sub=":443 · listening" accent={C.cyan} opacity={b} />
      </div>
    </Stage>
  );
};

const UnreliableScene: React.FC = () => {
  const frame = useCurrentFrame();
  const W = 900;
  const packets = [
    { label: "1", kind: "ok" },
    { label: "2", kind: "lost" },
    { label: "3", kind: "ok" },
    { label: "3", kind: "dup" },
    { label: "4", kind: "ok" },
  ];
  const CYCLE = 150;
  return (
    <Stage caption="Packets get lost, arrive twice, or arrive out of order.">
      <div style={{ position: "relative", height: 420, width: W }}>
        <div style={{ position: "absolute", top: 150, left: 0, width: W }}>
          <Line width={W} dashed color="#2A2E3B" />
        </div>
        {packets.map((pkt, i) => {
          const phase = ((frame + i * 30) % CYCLE) / CYCLE;
          const x = phase * (W - 104);
          const lost = pkt.kind === "lost";
          const dup = pkt.kind === "dup";
          const dropped = lost ? clamp01((phase - 0.42) / 0.26) : 0;
          const top = 110 - (dup ? 60 : 0) + dropped * 64;
          const color = lost ? C.red : dup ? C.violet : C.cyan;
          return (
            <div
              key={`${pkt.label}-${i}`}
              style={{
                position: "absolute",
                top,
                left: x,
                width: 96,
                height: 64,
                borderRadius: 10,
                backgroundColor: `${color}1F`,
                border: `1px solid ${color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: F.mono,
                fontSize: 24,
                color,
                opacity: lost ? clamp01(1 - dropped * 1.1) : 1,
                transform: `rotate(${lost ? -dropped * 16 : 0}deg)`,
              }}
            >
              {pkt.label}
            </div>
          );
        })}
        <div
          style={{
            position: "absolute",
            bottom: 4,
            left: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            fontFamily: F.mono,
            fontSize: 16,
            letterSpacing: "0.16em",
          }}
        >
          <span style={{ color: C.red, border: `1px solid ${C.red}44`, borderRadius: 6, padding: "6px 12px" }}>
            LOST
          </span>
          <span style={{ color: C.amber, border: `1px solid ${C.amber}44`, borderRadius: 6, padding: "6px 12px" }}>
            REORDERED
          </span>
          <span style={{ color: C.violet, border: `1px solid ${C.violet}44`, borderRadius: 6, padding: "6px 12px" }}>
            DUPLICATED
          </span>
        </div>
      </div>
    </Stage>
  );
};

const SynScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 200 } });
  const b = spring({ frame: frame - 12, fps, config: { damping: 200 } });
  const p = interpolate(frame, [26, 96], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const settled = frame >= 78;
  const seq = settled
    ? "1000"
    : "1000"
        .split("")
        .map((_, i) => String(Math.floor(wobble(i + 1, frame) * 10)))
        .join("");

  return (
    <Stage caption="Syn. One packet, carrying a random starting number.">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <Node title="CLIENT" sub="chooses a number" opacity={a} />
        <div style={{ position: "relative", width: 900, height: 180 }}>
          <div style={{ position: "absolute", top: 89, left: 0, width: 900 }}>
            <Line width={900} color="#2A2E3B" />
          </div>
          <div
            style={{
              position: "absolute",
              top: 52,
              left: interpolate(p, [0, 1], [0, 300]),
            }}
          >
            <Card
              head="SYN"
              rows={[
                { k: "seq", v: seq },
                { k: "flags", v: "SYN = 1" },
              ]}
              color={C.cyan}
            />
          </div>
        </div>
        <Node title="SERVER" sub="not yet listening to you" opacity={b} />
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: 26,
          fontFamily: F.mono,
          fontSize: 16,
          color: C.dim,
          opacity: clamp01((frame - 90) / 20),
        }}
      >
        not a password — a place to start counting bytes
      </div>
    </Stage>
  );
};

const SynAckScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [20, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const row2 = clamp01((frame - 70) / 24);
  const echo = clamp01((frame - 100) / 22);

  return (
    <Stage caption="Syn, ack. I hear you — and here is my number.">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <Node title="CLIENT" sub="seq 1000 sent" />
        <div style={{ position: "relative", width: 900, height: 190 }}>
          <div style={{ position: "absolute", top: 94, left: 0, width: 900 }}>
            <Line width={900} color="#2A2E3B" />
          </div>
          <div
            style={{
              position: "absolute",
              top: 54,
              left: interpolate(p, [0, 1], [300, 0]),
            }}
          >
            <Card
              head="SYN · ACK"
              rows={[
                { k: "seq", v: "5000" },
                row2 > 0.5 ? { k: "ack", v: "1001" } : { k: "ack", v: "····" },
              ]}
              color={C.violet}
            />
          </div>
        </div>
        <Node title="SERVER" sub="picks its own number" opacity={1} />
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: 24,
          fontFamily: F.mono,
          fontSize: 18,
          color: C.dim,
          opacity: echo,
        }}
      >
        your 1000 <span style={{ color: C.violet }}>+ 1</span> = 1001
      </div>
    </Stage>
  );
};

const AckScene: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [10, 66], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const up = clamp01((frame - 74) / 24);
  const down = clamp01((frame - 96) / 24);
  const pulse = 0.6 + 0.4 * Math.sin(frame / 14);
  const accentA = up > 0.5 ? C.green : "#2A2E3B";
  const accentB = down > 0.5 ? C.green : "#2A2E3B";

  return (
    <Stage caption="Three packets. One round trip. Both directions proven.">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <Node title="CLIENT" sub="can send ✓" accent={up > 0.5 ? C.green : C.text} />
        <div style={{ position: "relative", width: 900, height: 300 }}>
          <div style={{ position: "absolute", top: 86, left: 0 }}>
            <Line width={900} color={accentA} />
          </div>
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 0,
              fontFamily: F.mono,
              fontSize: 14,
              letterSpacing: "0.18em",
              color: up > 0.5 ? C.green : C.dim,
            }}
          >
            CLIENT → SERVER
          </div>
          <div
            style={{
              position: "absolute",
              top: 72,
              right: 34,
              fontFamily: F.mono,
              fontSize: 22,
              color: accentA,
            }}
          >
            ▶
          </div>
          <div
            style={{
              position: "absolute",
              top: 72,
              right: 2,
              fontFamily: F.mono,
              fontSize: 24,
              color: C.green,
              opacity: up * pulse,
            }}
          >
            ✓
          </div>

          <div style={{ position: "absolute", top: 222, left: 0 }}>
            <Line width={900} color={accentB} />
          </div>
          <div
            style={{
              position: "absolute",
              top: 182,
              left: 0,
              fontFamily: F.mono,
              fontSize: 14,
              letterSpacing: "0.18em",
              color: down > 0.5 ? C.green : C.dim,
            }}
          >
            SERVER → CLIENT
          </div>
          <div style={{ position: "absolute", top: 208, left: 34, fontFamily: F.mono, fontSize: 22, color: accentB }}>
            ◀
          </div>
          <div
            style={{
              position: "absolute",
              top: 208,
              left: 2,
              fontFamily: F.mono,
              fontSize: 24,
              color: C.green,
              opacity: down * pulse,
            }}
          >
            ✓
          </div>

          <div
            style={{
              position: "absolute",
              top: 52,
              left: interpolate(p, [0, 1], [0, 560]),
              padding: "10px 20px",
              borderRadius: 10,
              border: `1px solid ${C.green}`,
              backgroundColor: "rgba(52,211,153,0.14)",
              fontFamily: F.mono,
              fontSize: 18,
              color: C.green,
            }}
          >
            ACK 5001
          </div>
        </div>
        <Node title="SERVER" sub="can send ✓" accent={down > 0.5 ? C.green : C.text} />
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 34 }}>
        {["1 SYN", "2 SYN-ACK", "3 ACK"].map((label, i) => {
          const on = clamp01((frame - 104 - i * 10) / 16);
          return (
            <div
              key={label}
              style={{
                fontFamily: F.mono,
                fontSize: 16,
                letterSpacing: "0.12em",
                color: on > 0.5 ? C.green : C.faint,
                border: `1px solid ${on > 0.5 ? C.green + "66" : C.panelEdge}`,
                borderRadius: 8,
                padding: "9px 16px",
                opacity: 0.35 + on * 0.65,
              }}
            >
              {label}
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

const WhyThreeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const two = spring({ frame, fps, config: { damping: 200 } });
  const three = spring({ frame: frame - 96, fps, config: { damping: 200 } });
  const cross = clamp01((frame - 46) / 22);

  const panel = (
    label: string,
    sub: string,
    opacity: number,
    right: string,
    left: string,
    rightColor: string,
    showCross: boolean,
    showTicks: boolean,
  ) => (
    <div
      style={{
        width: 900,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        opacity,
        padding: "22px 30px",
        borderRadius: 14,
        border: `1px solid ${C.panelEdge}`,
        backgroundColor: C.panel,
      }}
    >
      <div style={{ width: 260 }}>
        <div style={{ fontFamily: F.mono, fontSize: 20, letterSpacing: "0.14em", color: C.text }}>
          {label}
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 14, color: C.faint, marginTop: 6 }}>{sub}</div>
      </div>
      <div style={{ width: 900, position: "relative", height: 86 }}>
        <div style={{ position: "absolute", top: 24, left: 0, width: 900 }}>
          <Line width={900} color="#2A2E3B" />
        </div>
        <div style={{ position: "absolute", top: 60, left: 0, width: 900 }}>
          <Line width={900} dashed color="#2A2E3B" />
        </div>
        <div
          style={{
            position: "absolute",
            top: 4,
            left: 0,
            fontFamily: F.mono,
            fontSize: 14,
            color: C.cyan,
          }}
        >
          → {right}
        </div>
        <div
          style={{
            position: "absolute",
            top: 68,
            left: 0,
            fontFamily: F.mono,
            fontSize: 14,
            color: rightColor,
          }}
        >
          ← {left}
        </div>
        {showCross ? (
          <div
            style={{
              position: "absolute",
              top: 42,
              right: 10,
              fontFamily: F.mono,
              fontSize: 26,
              color: C.red,
              opacity: cross,
            }}
          >
            ✗
          </div>
        ) : null}
        {showTicks ? (
          <>
            <div style={{ position: "absolute", top: 2, right: 6, fontFamily: F.mono, fontSize: 22, color: C.green }}>
              ✓
            </div>
            <div style={{ position: "absolute", top: 66, right: 6, fontFamily: F.mono, fontSize: 22, color: C.green }}>
              ✓
            </div>
          </>
        ) : null}
      </div>
    </div>
  );

  return (
    <Stage caption="Two packets would leave one direction untested.">
      <div style={{ width: 900, display: "flex", flexDirection: "column", gap: 20 }}>
        {panel("TWO PACKETS", "reverse path never tested", two, "SYN", "no answer", C.red, true, false)}
        {panel("THREE PACKETS", "both paths confirmed", three, "SYN", "SYN-ACK · ACK", C.green, false, true)}
      </div>
    </Stage>
  );
};

const BudgetScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spent = interpolate(frame, [16, 96], [0, 0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const tcp = clamp01((spent - 0.2) / 0.15);
  const num = spring({ frame: frame - 86, fps, config: { damping: 200 } });
  const pct = Math.round(interpolate(frame, [16, 96], [0, 35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  }));

  return (
    <Stage caption="Seventy of two hundred milliseconds, spent on saying hello.">
      <div style={{ width: 900, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ fontFamily: F.mono, fontSize: 15, letterSpacing: "0.24em", color: C.dim }}>
          200 ms BUDGET
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 40, color: C.text, opacity: num }}>
          {pct}%
        </div>
      </div>
      <div
        style={{
          marginTop: 18,
          height: 74,
          borderRadius: 10,
          backgroundColor: "#14161F",
          border: `1px solid ${C.panelEdge}`,
          overflow: "hidden",
          display: "flex",
          position: "relative",
          width: 900,
        }}
      >
        <div
          style={{
            width: `${0.2 * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${C.cyan}, ${C.violet})`,
            opacity: spent > 0.02 ? 1 : 0.15,
          }}
        />
        <div
          style={{
            width: `${tcp * 0.15 * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${C.violet}, ${C.amber})`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${spent * 100}%`,
            width: 2,
            backgroundColor: C.text,
            boxShadow: "0 0 18px rgba(255,255,255,0.85)",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 12,
          fontFamily: F.mono,
          fontSize: 14,
          color: C.faint,
          width: 900,
        }}
      >
        <span>0 ms · start</span>
        <span style={{ color: C.cyan }}>40 ms · address</span>
        <span style={{ color: C.amber }}>70 ms · connection</span>
        <span>200 ms</span>
      </div>
      <div style={{ width: 900, display: "flex", gap: 30, marginTop: 40, opacity: num }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: F.mono, fontSize: 14, letterSpacing: "0.2em", color: C.cyan }}>
            DNS
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 28, color: C.text }}>40 ms</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: F.mono, fontSize: 14, letterSpacing: "0.2em", color: C.amber }}>
            TCP HANDSHAKE
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 28, color: C.text }}>30 ms</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: F.mono, fontSize: 14, letterSpacing: "0.2em", color: C.faint }}>
            REMAINING
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 28, color: C.faint }}>130 ms</div>
        </div>
      </div>
    </Stage>
  );
};

const PlaintextScene: React.FC = () => {
  const frame = useCurrentFrame();
  const W = 900;
  const centers = [120, 270, 420, 570, 780];
  const CYCLE = 220;
  const p = (frame % CYCLE) / CYCLE;
  const travel = interpolate(p, [0.12, 0.92], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const cx = interpolate(travel, [0, 1], [centers[0], centers[4]]);
  const reading = clamp01((1 - Math.abs(cx - centers[2]) / 200) * 1.6);

  const hop = (label: string, i: number) => (
    <div
      key={label}
      style={{
        position: "absolute",
        left: centers[i] - 60,
        top: 240,
        width: 120,
        height: 80,
        borderRadius: 12,
        border: `1px solid ${i === 2 && reading > 0.3 ? C.red + "66" : C.panelEdge}`,
        backgroundColor: C.panel,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: F.mono,
        fontSize: 16,
        letterSpacing: "0.16em",
        color: i === 2 && reading > 0.3 ? C.red : C.dim,
      }}
    >
      {label}
    </div>
  );

  return (
    <Stage caption="Plain text. Every machine on the path can read it.">
      <div style={{ position: "relative", height: 420, width: W }}>
        <div
          style={{
            position: "absolute",
            top: 220,
            left: 40,
            width: W - 80,
          }}
        >
          <Line width={W - 80} color="#2A2E3B" />
        </div>
        {["YOU", "ROUTER", "ISP", "IXP", "SERVER"].map(hop)}
        <div
          style={{
            position: "absolute",
            top: 160,
            left: cx - 130,
            width: 260,
            borderRadius: 12,
            border: `1px solid ${reading > 0.35 ? C.red : C.cyan}`,
            backgroundColor: "rgba(14,16,23,0.97)",
            boxShadow: `0 0 ${26 + reading * 60}px rgba(251,113,133,${0.12 + reading * 0.55})`,
            padding: "14px 18px",
            fontFamily: F.mono,
            fontSize: 14,
            color: reading > 0.35 ? C.red : C.text,
            lineHeight: 1.6,
          }}
        >
          <div>GET / HTTP/1.1</div>
          <div>Host: example.com</div>
          <div>Cookie: session=8f3a…</div>
        </div>
        <div
          style={{
            position: "absolute",
            top: 120,
            left: centers[2] - 80,
            width: 160,
            textAlign: "center",
            fontFamily: F.mono,
            fontSize: 14,
            letterSpacing: "0.2em",
            color: C.red,
            opacity: reading,
          }}
        >
          READABLE
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(360px 170px at ${cx}px 240px, rgba(251,113,133,${reading * 0.2}), transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      </div>
    </Stage>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 200 } });
  const b = spring({ frame: frame - 34, fps, config: { damping: 200 } });
  const c = spring({ frame: frame - 60, fps, config: { damping: 200 } });
  return (
    <Stage>
      <div
        style={{
          fontFamily: F.sans,
          fontWeight: 800,
          fontSize: 88,
          letterSpacing: "-0.04em",
          color: C.text,
          opacity: a,
          textAlign: "center",
        }}
      >
        Next: proving it is safe.
      </div>
      <div
        style={{
          marginTop: 26,
          fontFamily: F.mono,
          fontSize: 20,
          letterSpacing: "0.2em",
          color: C.dim,
          opacity: b,
          textAlign: "center",
        }}
      >
        CERTIFICATES · KEYS · ONE ROUND TRIP
      </div>
      <div
        style={{
          marginTop: 46,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          opacity: c,
        }}
      >
        <div style={{ fontFamily: F.mono, fontSize: 18, color: C.green }}>70 ms spent</div>
        <div style={{ width: 2, height: 20, backgroundColor: C.panelEdge }} />
        <div style={{ fontFamily: F.mono, fontSize: 18, color: C.amber }}>130 ms left</div>
        <div style={{ width: 2, height: 20, backgroundColor: C.panelEdge }} />
        <div style={{ fontFamily: F.mono, fontSize: 18, color: C.dim }}>page not requested</div>
      </div>
      <div
        style={{
          marginTop: 54,
          height: 2,
          width: 600,
          background: `linear-gradient(90deg, ${C.cyan}, ${C.violet} 60%, transparent)`,
          opacity: c,
        }}
      />
    </Stage>
  );
};

/* ---------------- timeline (driven by measured narration) ---------------- */

const TAIL_FRAMES = 12; // 0.4s of air after each line

const SCENE_NODES: Record<string, React.ReactNode> = {
  s01: <TitleScene />,
  s02: <GapScene />,
  s03: <UnreliableScene />,
  s04: <SynScene />,
  s05: <SynAckScene />,
  s06: <AckScene />,
  s07: <WhyThreeScene />,
  s08: <BudgetScene />,
  s09: <PlaintextScene />,
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

export const HandshakeEpisode: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Backdrop />
      {PLAN.map((p) => (
        <Sequence key={p.id} from={p.from} durationInFrames={p.dur}>
          <Audio src={staticFile(`audio/ep02/${p.id}.wav`)} />
          {SCENE_NODES[p.id]}
        </Sequence>
      ))}
      <Watermark text="EP 02 · THE HANDSHAKE" />
    </AbsoluteFill>
  );
};
