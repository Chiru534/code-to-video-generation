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
import { Backdrop, Caption, Stage, Watermark } from "../chrome";
import timings from "./timings.json";

/* "Your Wi-Fi isn't slow. It's waiting."
   A 55-second vertical short. One idea: Wi-Fi shares TIME, not speed.
   Every number is the one the narration says — no decorative motion. */

const ease = Easing.bezier(0.22, 1, 0.36, 1);
const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const prog = (frame: number, start: number, dur: number) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...CLAMP, easing: ease });

const Tag: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      position: "absolute",
      top: 74,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
    }}
  >
    <div style={{ fontFamily: F.mono, fontSize: 17, letterSpacing: "0.3em", color: C.faint }}>
      {text}
    </div>
  </div>
);

const Lock: React.FC<{ color: string }> = ({ color }) => (
  <svg width={34} height={38} viewBox="0 0 34 38">
    <path
      d="M9 17v-6a8 8 0 0 1 16 0v6"
      fill="none"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <rect x={3} y={17} width={28} height={19} rx={5} fill={color} />
  </svg>
);

/* ---------------- s01 · the collapse ---------------- */

const CollapseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const speed = interpolate(frame, [0, 12, 34], [512, 512, 9], { ...CLAMP, easing: ease });
  const shown = Math.round(speed);
  const bar = interpolate(speed, [9, 512], [16, 880]);
  const hot = frame >= 33;
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: "0.3em", color: C.faint }}>
          SPEED TEST
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 172,
              lineHeight: 1,
              letterSpacing: "-0.05em",
              color: hot ? C.red : C.text,
            }}
          >
            {shown}
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 30, color: C.dim }}>Mbps</div>
        </div>
        <div
          style={{
            width: 900,
            height: 10,
            borderRadius: 10,
            backgroundColor: "#151823",
            overflow: "hidden",
            marginTop: 10,
          }}
        >
          <div
            style={{
              width: bar,
              height: 10,
              borderRadius: 10,
              backgroundColor: hot ? C.red : C.cyan,
            }}
          />
        </div>
        <div
          style={{
            marginTop: 64,
            textAlign: "center",
            opacity: prog(frame, 40, 12),
            transform: `translateY(${(1 - prog(frame, 40, 12)) * 22}px)`,
          }}
        >
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 76,
              letterSpacing: "-0.04em",
              color: C.text,
              lineHeight: 1.05,
            }}
          >
            It&apos;s not slow.
          </div>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 76,
              letterSpacing: "-0.04em",
              color: C.cyan,
              lineHeight: 1.05,
              opacity: prog(frame, 52, 10),
            }}
          >
            It&apos;s waiting.
          </div>
        </div>
      </div>
    </Stage>
  );
};

/* ---------------- s02 · the house ---------------- */

const DeviceDot: React.FC<{
  x: number;
  y: number;
  label: string;
  color: string;
  at: number;
}> = ({ x, y, label, color, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 120 } });
  return (
    <g opacity={Math.max(0, Math.min(1, s))} transform={`translate(${x},${y}) scale(${s})`}>
      <circle r={34} fill={color} opacity={0.1} />
      <circle r={17} fill={color} />
      <text
        y={64}
        textAnchor="middle"
        fill={C.dim}
        style={{ fontFamily: F.mono, fontSize: 19, letterSpacing: "0.14em" }}
      >
        {label}
      </text>
    </g>
  );
};

const HouseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const wire = prog(frame, 24, 30);
  const slot = prog(frame, 60, 40);
  return (
    <Stage>
      <Tag text="ONE CHANNEL · FOUR DEVICES" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <svg width={900} height={640} viewBox="0 0 900 640">
          <rect
            x={40}
            y={20}
            width={820}
            height={600}
            rx={30}
            fill="rgba(18,20,28,0.55)"
            stroke={C.panelEdge}
            strokeWidth={2}
          />
          {/* router */}
          <rect x={386} y={66} width={128} height={46} rx={12} fill={C.violet} opacity={0.18} />
          <rect
            x={386}
            y={66}
            width={128}
            height={46}
            rx={12}
            fill="none"
            stroke={C.violet}
            strokeWidth={2.5}
          />
          <text
            x={450}
            y={96}
            textAnchor="middle"
            fill={C.violet}
            style={{ fontFamily: F.mono, fontSize: 17, letterSpacing: "0.2em" }}
          >
            ROUTER
          </text>

          {[
            [190, 250],
            [710, 250],
            [220, 470],
          ].map(([x, y], i) => (
            <line
              key={`l${i}`}
              x1={450}
              y1={112}
              x2={x}
              y2={y}
              stroke={C.cyan}
              strokeWidth={2}
              strokeDasharray="7 9"
              opacity={0.16 + wire * 0.34}
            />
          ))}
          <line
            x1={450}
            y1={112}
            x2={740}
            y2={520}
            stroke={C.amber}
            strokeWidth={2.5}
            strokeDasharray="7 9"
            opacity={0.2 + wire * 0.6}
          />

          <DeviceDot x={190} y={250} label="PHONE" color={C.cyan} at={10} />
          <DeviceDot x={710} y={250} label="LAPTOP" color={C.cyan} at={18} />
          <DeviceDot x={220} y={470} label="TV" color={C.cyan} at={26} />
          <DeviceDot x={740} y={520} label="PLUG" color={C.amber} at={34} />

          <text
            x={790}
            y={590}
            textAnchor="end"
            fill={C.amber}
            opacity={prog(frame, 50, 20)}
            style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: "0.14em" }}
          >
            1 Mbps
          </text>
        </svg>

        {/* one shared channel */}
        <div style={{ width: 900 }}>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 16,
              letterSpacing: "0.24em",
              color: C.faint,
              marginBottom: 10,
            }}
          >
            THE SHARED CHANNEL
          </div>
          <div
            style={{
              width: 900,
              height: 54,
              borderRadius: 10,
              border: `1px solid ${C.panelEdge}`,
              backgroundColor: "#0B0D14",
              overflow: "hidden",
              display: "flex",
            }}
          >
            <div style={{ width: 900 * slot, height: 54, backgroundColor: "rgba(34,211,238,0.22)" }} />
          </div>
        </div>
      </div>
    </Stage>
  );
};

/* ---------------- s03 · the slow client ---------------- */

const SlowClientScene: React.FC = () => {
  const frame = useCurrentFrame();
  const card = prog(frame, 4, 18);
  const rate = prog(frame, 20, 16);
  return (
    <Stage>
      <Tag text="THE CULPRIT" />
      <div
        style={{
          width: 880,
          padding: "46px 46px 40px",
          borderRadius: 26,
          backgroundColor: C.panel,
          border: `1px solid rgba(251,191,36,0.35)`,
          opacity: card,
          transform: `translateY(${(1 - card) * 30}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 54, height: 54, borderRadius: 14, backgroundColor: C.amber }} />
          <div>
            <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 34, color: C.text }}>
              Smart plug
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 16, color: C.faint, letterSpacing: "0.18em" }}>
              802.11n · 2.4 GHz · 12 m away
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 40 }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 132,
              lineHeight: 1,
              letterSpacing: "-0.05em",
              color: C.amber,
              opacity: rate,
            }}
          >
            1
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 28, color: C.dim, opacity: rate }}>Mbps</div>
        </div>

        <div style={{ display: "flex", gap: 14, marginTop: 34, opacity: rate }}>
          {["MCS 0", "-85 dBm", "20 MHz"].map((t) => (
            <div
              key={t}
              style={{
                fontFamily: F.mono,
                fontSize: 17,
                color: C.dim,
                border: `1px solid ${C.panelEdge}`,
                borderRadius: 8,
                padding: "8px 14px",
              }}
            >
              {t}
            </div>
          ))}
        </div>

        {/* one packet leaving, slowly */}
        <div style={{ marginTop: 44 }}>
          <div style={{ fontFamily: F.mono, fontSize: 15, letterSpacing: "0.22em", color: C.faint }}>
            ONE PACKET
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            {Array.from({ length: 9 }).map((_, i) => {
              const on = frame * 0.55 > i * 6;
              return (
                <div
                  key={i}
                  style={{
                    width: 76,
                    height: 26,
                    borderRadius: 6,
                    backgroundColor: on ? C.amber : "#1A1D27",
                    opacity: on ? 1 : 0.5,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
      <Caption text="Far from the router, it can only talk slowly. One megabit." />
    </Stage>
  );
};

/* ---------------- s04 · the hidden bill ---------------- */

const CostScene: React.FC = () => {
  const frame = useCurrentFrame();
  const shadow = interpolate(frame, [40, 92], [0.045, 0.8], { ...CLAMP, easing: ease });
  const callout = prog(frame, 84, 12);
  return (
    <Stage>
      <Tag text="THE HIDDEN BILL" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 54,
            letterSpacing: "-0.035em",
            color: C.text,
            textAlign: "center",
            lineHeight: 1.15,
          }}
        >
          One device.
          <br />
          How bad can it be?
        </div>

        <div style={{ width: 900, marginTop: 40 }}>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 16,
              letterSpacing: "0.24em",
              color: C.faint,
              marginBottom: 12,
            }}
          >
            CHANNEL TIME
          </div>
          <div
            style={{
              position: "relative",
              width: 900,
              height: 96,
              borderRadius: 12,
              backgroundColor: "#0B0D14",
              border: `1px solid ${C.panelEdge}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 900 * shadow,
                backgroundColor: "rgba(251,191,36,0.30)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 38,
                backgroundColor: C.amber,
              }}
            />
          </div>
          <div
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "space-between",
              fontFamily: F.mono,
              fontSize: 18,
              color: C.dim,
            }}
          >
            <span style={{ color: C.amber }}>1 plug · 1 Mbps</span>
            <span style={{ opacity: callout }}>its real cost</span>
          </div>
        </div>
      </div>
    </Stage>
  );
};

/* ---------------- s05 · the thesis ---------------- */

const ThesisScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const strike = prog(frame, 14, 16);
  const time = spring({ frame: frame - 36, fps, config: { damping: 15, stiffness: 120 } });
  const sub = prog(frame, 58, 14);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 128,
              letterSpacing: "-0.05em",
              lineHeight: 1,
              color: C.faint,
            }}
          >
            SPEED
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "52%",
              height: 9,
              width: 900 * strike,
              maxWidth: "100%",
              backgroundColor: C.red,
              borderRadius: 6,
              transform: "rotate(-1.5deg)",
            }}
          />
        </div>

        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 150,
            letterSpacing: "-0.05em",
            lineHeight: 1,
            color: C.cyan,
            opacity: Math.max(0, Math.min(1, time)),
            transform: `translateY(${(1 - time) * 60}px)`,
            marginTop: 10,
          }}
        >
          TIME
        </div>

        <div
          style={{
            fontFamily: F.sans,
            fontSize: 34,
            color: C.dim,
            marginTop: 30,
            opacity: sub,
            textAlign: "center",
          }}
        >
          Wi-Fi shares time, not speed.
        </div>
      </div>
    </Stage>
  );
};

/* ---------------- s06 · one packet each ---------------- */

const PacketScene: React.FC = () => {
  const frame = useCurrentFrame();
  const fast = prog(frame, 8, 18);
  const slow = prog(frame, 34, 40);
  return (
    <Stage>
      <Tag text="ONE PACKET EACH" />
      <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: F.mono,
              fontSize: 18,
              color: C.dim,
              marginBottom: 10,
            }}
          >
            <span style={{ color: C.cyan }}>FAST DEVICE</span>
            <span style={{ color: C.cyan }}>0.5 ms</span>
          </div>
          <div style={{ width: 900, height: 54, backgroundColor: "#0B0D14", borderRadius: 10 }}>
            <div
              style={{
                width: Math.max(14, 12 * fast),
                height: 54,
                borderRadius: 10,
                backgroundColor: C.cyan,
              }}
            />
          </div>
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: F.mono,
              fontSize: 18,
              color: C.dim,
              marginBottom: 10,
            }}
          >
            <span style={{ color: C.amber }}>THE PLUG</span>
            <span style={{ color: C.amber }}>40 ms</span>
          </div>
          <div style={{ width: 900, height: 54, backgroundColor: "#0B0D14", borderRadius: 10 }}>
            <div
              style={{
                width: 780 * slow,
                height: 54,
                borderRadius: 10,
                backgroundColor: C.amber,
              }}
            />
          </div>
        </div>

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 17,
            color: C.faint,
            textAlign: "right",
            opacity: prog(frame, 70, 14),
          }}
        >
          80× longer on the air
        </div>
      </div>
      <Caption text="Same packet size. One takes 0.5 ms. The other takes 40." />
    </Stage>
  );
};

/* ---------------- s07 · everyone waits ---------------- */

const WaitScene: React.FC = () => {
  const frame = useCurrentFrame();
  const busy = prog(frame, 6, 24);
  const lock = spring({ frame: frame - 30, fps: 30, config: { damping: 12, stiffness: 140 } });
  const waits = [prog(frame, 40, 30), prog(frame, 52, 30), prog(frame, 64, 30)];
  return (
    <Stage>
      <Tag text="THE CHANNEL IS BUSY" />
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        <div
          style={{
            position: "relative",
            width: 900,
            height: 110,
            borderRadius: 12,
            border: `1px solid ${C.panelEdge}`,
            backgroundColor: "#0B0D14",
            overflow: "hidden",
            display: "flex",
          }}
        >
          <div style={{ width: 900 * 0.66 * busy, height: 110, backgroundColor: C.amber }} />
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              opacity: lock,
              transform: `scale(${0.9 + lock * 0.1})`,
            }}
          >
            <Lock color={C.amber} />
            <span style={{ fontFamily: F.mono, fontSize: 20, color: C.amber }}>BUSY</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {["PHONE", "LAPTOP", "TV"].map((d, i) => (
            <div
              key={d}
              style={{
                flex: 1,
                padding: "22px 18px",
                borderRadius: 12,
                border: `1px dashed ${C.panelEdge}`,
                backgroundColor: C.panel,
                opacity: 0.35 + waits[i] * 0.65,
              }}
            >
              <div style={{ fontFamily: F.mono, fontSize: 16, letterSpacing: "0.16em", color: C.dim }}>
                {d}
              </div>
              <div
                style={{
                  fontFamily: F.sans,
                  fontWeight: 800,
                  fontSize: 34,
                  color: C.cyan,
                  marginTop: 6,
                }}
              >
                wait {Math.round(waits[i] * 46)} ms
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 46,
            letterSpacing: "-0.03em",
            color: C.text,
            textAlign: "center",
            marginTop: 18,
            opacity: prog(frame, 78, 16),
          }}
        >
          Everyone waits behind the slowest voice.
        </div>
      </div>
    </Stage>
  );
};

/* ---------------- s08 · the money shot ---------------- */

const MoneyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const data = interpolate(frame, [10, 48], [0, 4], CLAMP);
  const air = interpolate(frame, [18, 62], [0, 80], CLAMP);
  const growA = prog(frame, 10, 30);
  const growB = prog(frame, 18, 38);
  return (
    <Stage>
      <Tag text="THE SAME DEVICE" />
      <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
        <div>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 74,
              letterSpacing: "-0.04em",
              color: C.text,
              lineHeight: 1.1,
            }}
          >
            {Math.round(data)}%<span style={{ color: C.dim }}> of the data</span>
          </div>
          <div
            style={{
              width: 900,
              height: 62,
              marginTop: 14,
              borderRadius: 12,
              backgroundColor: "#0B0D14",
              border: `1px solid ${C.panelEdge}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: Math.max(10, 900 * 0.04 * growA),
                height: 62,
                backgroundColor: C.amber,
              }}
            />
          </div>
        </div>

        <div>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 74,
              letterSpacing: "-0.04em",
              color: C.amber,
              lineHeight: 1.1,
            }}
          >
            {Math.round(air)}%<span style={{ color: C.dim }}> of the airtime</span>
          </div>
          <div
            style={{
              width: 900,
              height: 62,
              marginTop: 14,
              borderRadius: 12,
              backgroundColor: "#0B0D14",
              border: `1px solid ${C.panelEdge}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: 900 * 0.8 * growB,
                height: 62,
                backgroundColor: C.amber,
                boxShadow: `0 0 40px rgba(251,191,36,0.45)`,
              }}
            />
          </div>
        </div>

        <div
          style={{
            fontFamily: F.sans,
            fontSize: 32,
            color: C.dim,
            opacity: prog(frame, 74, 16),
            lineHeight: 1.4,
          }}
        >
          The plug is only 4% of the traffic.
          <br />
          It owns 80% of the silence.
        </div>
      </div>
    </Stage>
  );
};

/* ---------------- s09 · walking closer ---------------- */

const CloserScene: React.FC = () => {
  const frame = useCurrentFrame();
  const move = prog(frame, 10, 50);
  const x = 170 + move * 470;
  const dist = 12 - move * 10;
  const tag = prog(frame, 70, 12);
  return (
    <Stage>
      <Tag text="MOVE CLOSER" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <svg width={900} height={300} viewBox="0 0 900 300">
          <line x1={70} y1={160} x2={830} y2={160} stroke={C.panelEdge} strokeWidth={2} />
          <rect x={760} y={112} width={110} height={54} rx={12} fill={C.violet} opacity={0.2} />
          <rect
            x={760}
            y={112}
            width={110}
            height={54}
            rx={12}
            fill="none"
            stroke={C.violet}
            strokeWidth={2.5}
          />
          <text
            x={815}
            y={146}
            textAnchor="middle"
            fill={C.violet}
            style={{ fontFamily: F.mono, fontSize: 16, letterSpacing: "0.16em" }}
          >
            ROUTER
          </text>
          <circle cx={x} cy={160} r={22} fill={C.cyan} />
          <circle cx={x} cy={160} r={40} fill={C.cyan} opacity={0.14} />
          <text
            x={x}
            y={110}
            textAnchor="middle"
            fill={C.text}
            style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 30 }}
          >
            you
          </text>
        </svg>

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 26,
            color: C.dim,
            letterSpacing: "0.08em",
          }}
        >
          distance {dist.toFixed(1)} m
        </div>

        <div style={{ width: 900, marginTop: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: F.mono,
              fontSize: 16,
              letterSpacing: "0.2em",
              color: C.faint,
              marginBottom: 10,
            }}
          >
            <span>AIRTIME USED BY THE PLUG</span>
            <span style={{ color: C.red, opacity: tag }}>NO CHANGE</span>
          </div>
          <div
            style={{
              width: 900,
              height: 58,
              borderRadius: 10,
              backgroundColor: "#0B0D14",
              border: `1px solid ${C.panelEdge}`,
              overflow: "hidden",
            }}
          >
            <div style={{ width: 720, height: 58, backgroundColor: C.amber }} />
          </div>
        </div>
      </div>
    </Stage>
  );
};

/* ---------------- s10 · out of silence ---------------- */

const SilenceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const blink = Math.floor(frame / 15) % 2 === 0;
  const fill = prog(frame, 4, 26);
  return (
    <Stage>
      <Tag text="THE REAL LIMIT" />
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 16,
              letterSpacing: "0.24em",
              color: C.faint,
              marginBottom: 10,
            }}
          >
            BANDWIDTH
          </div>
          <div style={{ width: 900, height: 44, borderRadius: 10, backgroundColor: "#0B0D14" }}>
            <div style={{ width: 900 * fill, height: 44, borderRadius: 10, backgroundColor: C.cyan }} />
          </div>
        </div>

        <div>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 16,
              letterSpacing: "0.24em",
              color: C.faint,
              marginBottom: 10,
            }}
          >
            AIRTIME
          </div>
          <div
            style={{
              position: "relative",
              width: 900,
              height: 110,
              borderRadius: 10,
              backgroundColor: "#0B0D14",
              border: `1px solid ${C.panelEdge}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 560,
                backgroundColor: "rgba(251,191,36,0.85)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 574,
                top: 0,
                bottom: 0,
                width: 900,
                backgroundColor: "rgba(0,0,0,0.35)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 590,
                top: 26,
                width: 6,
                height: 58,
                backgroundColor: C.cyan,
                opacity: blink ? 1 : 0.15,
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 30,
                top: 38,
                fontFamily: F.mono,
                fontSize: 20,
                letterSpacing: "0.18em",
                color: C.dim,
              }}
            >
              IDLE
            </div>
          </div>
        </div>

        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 62,
            letterSpacing: "-0.04em",
            color: C.text,
            lineHeight: 1.15,
            marginTop: 16,
            opacity: prog(frame, 46, 16),
          }}
        >
          Not out of bandwidth.
          <br />
          <span style={{ color: C.cyan }}>Out of silence.</span>
        </div>
      </div>
    </Stage>
  );
};

/* ---------------- s11 · the fix ---------------- */

const FixScene: React.FC = () => {
  const frame = useCurrentFrame();
  const c1 = prog(frame, 6, 16);
  const flip = prog(frame, 40, 18);
  const c2 = prog(frame, 96, 16);
  const hi = prog(frame, 110, 18);
  return (
    <Stage>
      <Tag text="WHAT ACTUALLY HELPS" />
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        <div
          style={{
            width: 900,
            padding: "30px 34px",
            borderRadius: 18,
            backgroundColor: C.panel,
            border: `1px solid ${C.panelEdge}`,
            opacity: c1,
            transform: `translateY(${(1 - c1) * 24}px)`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 32, color: C.text }}>
                Airtime fairness
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 16, color: C.faint, marginTop: 6 }}>
                the router schedules time, not packets
              </div>
            </div>
            <div
              style={{
                width: 96,
                height: 52,
                borderRadius: 26,
                backgroundColor: flip > 0.5 ? "rgba(52,211,153,0.25)" : "#1A1D27",
                border: `1.5px solid ${flip > 0.5 ? C.green : C.panelEdge}`,
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 5,
                  left: 5 + flip * 44,
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: flip > 0.5 ? C.green : C.dim,
                }}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            width: 900,
            padding: "30px 34px",
            borderRadius: 18,
            backgroundColor: C.panel,
            border: `1px solid ${C.panelEdge}`,
            opacity: c2,
            transform: `translateY(${(1 - c2) * 24}px)`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 32, color: C.text }}>
                Move it to 2.4 GHz
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 16, color: C.faint, marginTop: 6 }}>
                short range, cheap radio — its natural home
              </div>
            </div>
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 22,
                padding: "10px 18px",
                borderRadius: 10,
                color: hi > 0.5 ? C.bg : C.dim,
                backgroundColor: hi > 0.5 ? C.cyan : "transparent",
                border: `1.5px solid ${hi > 0.5 ? C.cyan : C.panelEdge}`,
              }}
            >
              2.4G
            </div>
          </div>
        </div>

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 17,
            color: C.faint,
            textAlign: "center",
            marginTop: 8,
            opacity: prog(frame, 126, 16),
          }}
        >
          the plug loses nothing it needs
        </div>
      </div>
    </Stage>
  );
};

/* ---------------- s12 · end card ---------------- */

const EndScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const line = spring({ frame: frame - 4, fps, config: { damping: 16, stiffness: 110 } });
  const sub = prog(frame, 24, 16);
  const pill = spring({ frame: frame - 50, fps, config: { damping: 12, stiffness: 130 } });
  const pulse = 1 + Math.sin(frame / 9) * 0.014;
  return (
    <Stage>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 18,
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 17,
            letterSpacing: "0.34em",
            color: C.faint,
            opacity: sub,
          }}
        >
          THE LAYER BELOW
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 88,
            lineHeight: 1.02,
            letterSpacing: "-0.05em",
            color: C.text,
            opacity: Math.max(0, Math.min(1, line)),
            transform: `translateY(${(1 - line) * 44}px)`,
          }}
        >
          Why your Wi-Fi
          <br />
          is slow
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontSize: 30,
            color: C.dim,
            opacity: sub,
            marginTop: 6,
          }}
        >
          The full breakdown is 11 minutes.
        </div>
        <div
          style={{
            marginTop: 40,
            padding: "20px 44px",
            borderRadius: 46,
            backgroundColor: C.cyan,
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 32,
            color: C.bg,
            opacity: Math.max(0, Math.min(1, pill)),
            transform: `scale(${(0.8 + pill * 0.2) * pulse})`,
          }}
        >
          Subscribe for the rest
        </div>
      </div>
    </Stage>
  );
};

/* ---------------- timeline ---------------- */

const TAIL_FRAMES = 12;

const SCENE_NODES: Record<string, React.ReactNode> = {
  s01: <CollapseScene />,
  s02: <HouseScene />,
  s03: <SlowClientScene />,
  s04: <CostScene />,
  s05: <ThesisScene />,
  s06: <PacketScene />,
  s07: <WaitScene />,
  s08: <MoneyScene />,
  s09: <CloserScene />,
  s10: <SilenceScene />,
  s11: <FixScene />,
  s12: <EndScene />,
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

export const WifiAirtime: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Backdrop />
      {PLAN.map((p) => (
        <Sequence key={p.id} from={p.from} durationInFrames={p.dur}>
          <Audio src={staticFile(`audio/wifi/${p.id}.wav`)} />
          {SCENE_NODES[p.id]}
        </Sequence>
      ))}
      <Watermark text="THE LAYER BELOW" />
    </AbsoluteFill>
  );
};
