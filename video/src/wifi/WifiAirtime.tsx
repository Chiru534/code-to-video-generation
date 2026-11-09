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
import { Backdrop, Stage, Watermark } from "../chrome";
import timings from "./timings.json";

/* "Your Wi-Fi isn't slow. It's waiting."
   A 47-second vertical short. One idea: Wi-Fi shares TIME, not speed.

   SIZED FOR A PHONE, NOT A SLIDE: at 1080×1920 a 34px label is ~12px on a
   400px-wide screen. Nothing here is allowed below 30px except decoration;
   body copy is 44–58, hooks are 110–300. Content fills the frame. */

const ease = Easing.bezier(0.22, 1, 0.36, 1);
const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const prog = (frame: number, start: number, dur: number) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...CLAMP, easing: ease });

const W = 920;

const Tag: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      position: "absolute",
      top: 96,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
    }}
  >
    <div style={{ fontFamily: F.mono, fontSize: 27, letterSpacing: "0.3em", color: C.faint }}>
      {text}
    </div>
  </div>
);

const Sub: React.FC<{ text: string; at?: number }> = ({ text, at = 20 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 14);
  return (
    <div
      style={{
        fontFamily: F.sans,
        fontSize: 46,
        lineHeight: 1.34,
        color: C.dim,
        textAlign: "center",
        maxWidth: W,
        marginTop: 52,
        opacity: p,
        transform: `translateY(${(1 - p) * 16}px)`,
      }}
    >
      {text}
    </div>
  );
};

const Lock: React.FC<{ color: string }> = ({ color }) => (
  <svg width={44} height={50} viewBox="0 0 34 38">
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
  const bar = interpolate(speed, [9, 512], [20, W]);
  const hot = frame >= 33;
  const a = prog(frame, 38, 10);
  const b = prog(frame, 48, 10);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: F.mono, fontSize: 30, letterSpacing: "0.34em", color: C.faint }}>
          SPEED TEST
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 6 }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 300,
              lineHeight: 0.92,
              letterSpacing: "-0.055em",
              color: hot ? C.red : C.text,
            }}
          >
            {shown}
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 52, color: C.dim }}>Mbps</div>
        </div>
        <div
          style={{
            width: W,
            height: 18,
            borderRadius: 12,
            backgroundColor: "#151823",
            overflow: "hidden",
            marginTop: 24,
          }}
        >
          <div
            style={{
              width: bar,
              height: 18,
              borderRadius: 12,
              backgroundColor: hot ? C.red : C.cyan,
            }}
          />
        </div>

        <div style={{ marginTop: 150, textAlign: "center" }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 112,
              letterSpacing: "-0.045em",
              lineHeight: 1.04,
              color: C.text,
              opacity: a,
              transform: `translateY(${(1 - a) * 26}px)`,
            }}
          >
            It&apos;s not slow.
          </div>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 112,
              letterSpacing: "-0.045em",
              lineHeight: 1.04,
              color: C.cyan,
              opacity: b,
              transform: `translateY(${(1 - b) * 26}px)`,
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
      <circle r={52} fill={color} opacity={0.1} />
      <circle r={26} fill={color} />
      <text
        y={92}
        textAnchor="middle"
        fill={C.dim}
        style={{ fontFamily: F.mono, fontSize: 28, letterSpacing: "0.12em" }}
      >
        {label}
      </text>
    </g>
  );
};

const HouseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const wire = prog(frame, 24, 30);
  const slot = prog(frame, 56, 40);
  return (
    <Stage>
      <Tag text="ONE CHANNEL · FOUR DEVICES" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <svg width={920} height={880} viewBox="0 0 920 880">
          <rect
            x={20}
            y={10}
            width={880}
            height={820}
            rx={34}
            fill="rgba(18,20,28,0.55)"
            stroke={C.panelEdge}
            strokeWidth={2.5}
          />
          {/* router */}
          <rect x={373} y={70} width={174} height={64} rx={16} fill={C.violet} opacity={0.18} />
          <rect
            x={373}
            y={70}
            width={174}
            height={64}
            rx={16}
            fill="none"
            stroke={C.violet}
            strokeWidth={3}
          />
          <text
            x={460}
            y={110}
            textAnchor="middle"
            fill={C.violet}
            style={{ fontFamily: F.mono, fontSize: 25, letterSpacing: "0.2em" }}
          >
            ROUTER
          </text>

          {[
            [190, 330],
            [730, 330],
            [230, 640],
          ].map(([x, y], i) => (
            <line
              key={`l${i}`}
              x1={460}
              y1={140}
              x2={x}
              y2={y}
              stroke={C.cyan}
              strokeWidth={2.5}
              strokeDasharray="9 12"
              opacity={0.16 + wire * 0.36}
            />
          ))}
          <line
            x1={460}
            y1={140}
            x2={750}
            y2={690}
            stroke={C.amber}
            strokeWidth={3.5}
            strokeDasharray="9 12"
            opacity={0.22 + wire * 0.62}
          />

          <DeviceDot x={190} y={330} label="PHONE" color={C.cyan} at={10} />
          <DeviceDot x={730} y={330} label="LAPTOP" color={C.cyan} at={18} />
          <DeviceDot x={230} y={640} label="TV" color={C.cyan} at={26} />
          <DeviceDot x={750} y={690} label="PLUG" color={C.amber} at={34} />

          <rect x={510} y={663} width={196} height={54} rx={12} fill="rgba(251,191,36,0.16)" />
          <text
            x={608}
            y={699}
            textAnchor="middle"
            fill={C.amber}
            opacity={prog(frame, 46, 18)}
            style={{ fontFamily: F.mono, fontSize: 27, letterSpacing: "0.12em" }}
          >
            1 Mbps
          </text>
        </svg>

        <div style={{ width: W }}>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 27,
              letterSpacing: "0.26em",
              color: C.faint,
              marginBottom: 14,
            }}
          >
            THE SHARED CHANNEL
          </div>
          <div
            style={{
              width: W,
              height: 84,
              borderRadius: 14,
              border: `1.5px solid ${C.panelEdge}`,
              backgroundColor: "#0B0D14",
              overflow: "hidden",
            }}
          >
            <div style={{ width: W * slot, height: 84, backgroundColor: "rgba(34,211,238,0.24)" }} />
          </div>
        </div>
      </div>
    </Stage>
  );
};

/* ---------------- s03 · the slow client ---------------- */

const SlowClientScene: React.FC = () => {
  const frame = useCurrentFrame();
  const card = prog(frame, 4, 16);
  const rate = prog(frame, 18, 14);
  return (
    <Stage>
      <Tag text="THE CULPRIT" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: W,
            padding: "54px 52px 48px",
            borderRadius: 32,
            backgroundColor: C.panel,
            border: `1.5px solid rgba(251,191,36,0.35)`,
            opacity: card,
            transform: `translateY(${(1 - card) * 30}px)`,
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ width: 76, height: 76, borderRadius: 20, backgroundColor: C.amber }} />
            <div>
              <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 54, color: C.text }}>
                Smart plug
              </div>
              <div
                style={{ fontFamily: F.mono, fontSize: 26, color: C.faint, letterSpacing: "0.12em" }}
              >
                802.11n · 2.4 GHz · 12 m
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 44 }}>
            <div
              style={{
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 230,
                lineHeight: 0.9,
                letterSpacing: "-0.055em",
                color: C.amber,
                opacity: rate,
              }}
            >
              1
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 48, color: C.dim, opacity: rate }}>
              Mbps
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 34, opacity: rate }}>
            {["MCS 0", "-85 dBm", "20 MHz"].map((t) => (
              <div
                key={t}
                style={{
                  fontFamily: F.mono,
                  fontSize: 27,
                  color: C.dim,
                  border: `1.5px solid ${C.panelEdge}`,
                  borderRadius: 10,
                  padding: "10px 16px",
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>

        <div style={{ width: W, marginTop: 40 }}>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 26,
              letterSpacing: "0.24em",
              color: C.faint,
              marginBottom: 14,
            }}
          >
            ONE PACKET
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {Array.from({ length: 9 }).map((_, i) => {
              const on = frame * 0.55 > i * 6;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 38,
                    borderRadius: 7,
                    backgroundColor: on ? C.amber : "#1A1D27",
                    opacity: on ? 1 : 0.5,
                  }}
                />
              );
            })}
          </div>
        </div>

        <Sub text="Far from the router, it can only talk slowly." at={60} />
      </div>
    </Stage>
  );
};

/* ---------------- s04 · the hidden bill ---------------- */

const CostScene: React.FC = () => {
  const frame = useCurrentFrame();
  const shadow = interpolate(frame, [34, 84], [0.045, 0.8], { ...CLAMP, easing: ease });
  const callout = prog(frame, 76, 12);
  return (
    <Stage>
      <Tag text="THE HIDDEN BILL" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 88,
            letterSpacing: "-0.04em",
            color: C.text,
            textAlign: "center",
            lineHeight: 1.12,
          }}
        >
          One device.
          <br />
          How bad can it be?
        </div>

        <div style={{ width: W, marginTop: 76 }}>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 26,
              letterSpacing: "0.26em",
              color: C.faint,
              marginBottom: 16,
            }}
          >
            CHANNEL TIME
          </div>
          <div
            style={{
              position: "relative",
              width: W,
              height: 170,
              borderRadius: 16,
              backgroundColor: "#0B0D14",
              border: `1.5px solid ${C.panelEdge}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: W * shadow,
                backgroundColor: "rgba(251,191,36,0.30)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 46,
                backgroundColor: C.amber,
              }}
            />
          </div>
          <div
            style={{
              marginTop: 22,
              display: "flex",
              justifyContent: "space-between",
              fontFamily: F.mono,
              fontSize: 32,
            }}
          >
            <span style={{ color: C.amber }}>1 plug · 1 Mbps</span>
            <span style={{ color: C.text, opacity: callout }}>its real cost</span>
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
  const strike = prog(frame, 12, 16);
  const time = spring({ frame: frame - 32, fps, config: { damping: 15, stiffness: 120 } });
  const sub = prog(frame, 54, 14);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 196,
              letterSpacing: "-0.055em",
              lineHeight: 1,
              color: C.faint,
            }}
          >
            SPEED
          </div>
          <div
            style={{
              position: "absolute",
              left: -6,
              top: "53%",
              height: 14,
              width: 660 * strike,
              backgroundColor: C.red,
              borderRadius: 8,
              transform: "rotate(-1.5deg)",
            }}
          />
        </div>

        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 232,
            letterSpacing: "-0.055em",
            lineHeight: 1,
            color: C.cyan,
            opacity: Math.max(0, Math.min(1, time)),
            transform: `translateY(${(1 - time) * 70}px)`,
            marginTop: 8,
          }}
        >
          TIME
        </div>

        <div
          style={{
            fontFamily: F.sans,
            fontSize: 52,
            color: C.dim,
            marginTop: 56,
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
  const slow = prog(frame, 32, 40);
  return (
    <Stage>
      <Tag text="ONE PACKET EACH" />
      <div style={{ display: "flex", flexDirection: "column", gap: 46, width: W }}>
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: F.mono,
              fontSize: 32,
              marginBottom: 16,
            }}
          >
            <span style={{ color: C.cyan }}>FAST DEVICE</span>
            <span style={{ color: C.cyan }}>0.5 ms</span>
          </div>
          <div style={{ width: W, height: 96, backgroundColor: "#0B0D14", borderRadius: 12 }}>
            <div
              style={{
                width: Math.max(18, 16 * fast),
                height: 96,
                borderRadius: 12,
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
              fontSize: 32,
              marginBottom: 16,
            }}
          >
            <span style={{ color: C.amber }}>THE PLUG</span>
            <span style={{ color: C.amber }}>40 ms</span>
          </div>
          <div style={{ width: W, height: 96, backgroundColor: "#0B0D14", borderRadius: 12 }}>
            <div
              style={{
                width: W * 0.87 * slow,
                height: 96,
                borderRadius: 12,
                backgroundColor: C.amber,
              }}
            />
          </div>
        </div>

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 30,
            color: C.faint,
            textAlign: "right",
            opacity: prog(frame, 66, 14),
          }}
        >
          80× longer on the air
        </div>
      </div>
      <Sub text="Same packet. One takes half a millisecond. The other takes forty." at={64} />
    </Stage>
  );
};

/* ---------------- s07 · everyone waits ---------------- */

const WaitScene: React.FC = () => {
  const frame = useCurrentFrame();
  const busy = prog(frame, 6, 22);
  const lock = spring({ frame: frame - 28, fps: 30, config: { damping: 12, stiffness: 140 } });
  const waits = [prog(frame, 36, 28), prog(frame, 46, 28), prog(frame, 56, 28)];
  const line = prog(frame, 72, 14);
  return (
    <Stage>
      <Tag text="THE CHANNEL IS BUSY" />
      <div style={{ display: "flex", flexDirection: "column", gap: 30, width: W }}>
        <div
          style={{
            position: "relative",
            width: W,
            height: 180,
            borderRadius: 16,
            border: `1.5px solid ${C.panelEdge}`,
            backgroundColor: "#0B0D14",
            overflow: "hidden",
            display: "flex",
          }}
        >
          <div style={{ width: W * 0.66 * busy, height: 180, backgroundColor: C.amber }} />
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              opacity: lock,
              transform: `scale(${0.9 + lock * 0.1})`,
            }}
          >
            <Lock color={C.amber} />
            <span style={{ fontFamily: F.mono, fontSize: 30, color: C.amber }}>BUSY</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {["PHONE", "LAPTOP", "TV"].map((d, i) => (
            <div
              key={d}
              style={{
                padding: "24px 30px",
                borderRadius: 14,
                border: `1.5px dashed ${C.panelEdge}`,
                backgroundColor: C.panel,
                opacity: 0.35 + waits[i] * 0.65,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span
                style={{ fontFamily: F.mono, fontSize: 30, letterSpacing: "0.16em", color: C.dim }}
              >
                {d}
              </span>
              <span
                style={{
                  fontFamily: F.sans,
                  fontWeight: 800,
                  fontSize: 52,
                  color: C.cyan,
                }}
              >
                wait {Math.round(waits[i] * (14 + i * 16))} ms
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 62,
            letterSpacing: "-0.035em",
            lineHeight: 1.18,
            color: C.text,
            textAlign: "center",
            marginTop: 26,
            opacity: line,
          }}
        >
          Everyone waits behind
          <br />
          the slowest voice.
        </div>
      </div>
    </Stage>
  );
};

/* ---------------- s08 · the money shot ---------------- */

const MoneyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const data = interpolate(frame, [8, 44], [0, 4], CLAMP);
  const air = interpolate(frame, [16, 56], [0, 80], CLAMP);
  const growA = prog(frame, 8, 28);
  const growB = prog(frame, 16, 34);
  const sub = prog(frame, 66, 14);
  return (
    <Stage>
      <Tag text="THE SAME DEVICE" />
      <div style={{ display: "flex", flexDirection: "column", gap: 52, width: W }}>
        <div>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 104,
              letterSpacing: "-0.045em",
              color: C.text,
              lineHeight: 1.05,
            }}
          >
            {Math.round(data)}%<span style={{ color: C.dim }}> of the data</span>
          </div>
          <div
            style={{
              width: W,
              height: 120,
              marginTop: 18,
              borderRadius: 14,
              backgroundColor: "#0B0D14",
              border: `1.5px solid ${C.panelEdge}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: Math.max(14, W * 0.04 * growA),
                height: 120,
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
              fontSize: 104,
              letterSpacing: "-0.045em",
              color: C.amber,
              lineHeight: 1.05,
            }}
          >
            {Math.round(air)}%<span style={{ color: C.dim }}> of the airtime</span>
          </div>
          <div
            style={{
              width: W,
              height: 120,
              marginTop: 18,
              borderRadius: 14,
              backgroundColor: "#0B0D14",
              border: `1.5px solid ${C.panelEdge}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: W * 0.8 * growB,
                height: 120,
                backgroundColor: C.amber,
                boxShadow: `0 0 56px rgba(251,191,36,0.5)`,
              }}
            />
          </div>
        </div>

        <div
          style={{
            fontFamily: F.sans,
            fontSize: 46,
            color: C.dim,
            opacity: sub,
            lineHeight: 1.42,
            marginTop: 20,
          }}
        >
          4% of the traffic.
          <br />
          80% of the silence.
        </div>
      </div>
    </Stage>
  );
};

/* ---------------- s09 · walking closer ---------------- */

const CloserScene: React.FC = () => {
  const frame = useCurrentFrame();
  const move = prog(frame, 10, 46);
  const x = 150 + move * 470;
  const dist = 12 - move * 10;
  const tag = prog(frame, 64, 12);
  return (
    <Stage>
      <Tag text="MOVE CLOSER" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: W }}>
        <svg width={920} height={430} viewBox="0 0 920 430">
          <line x1={40} y1={250} x2={880} y2={250} stroke={C.panelEdge} strokeWidth={3} />
          <rect x={768} y={196} width={142} height={86} rx={16} fill={C.violet} opacity={0.2} />
          <rect
            x={768}
            y={196}
            width={142}
            height={86}
            rx={16}
            fill="none"
            stroke={C.violet}
            strokeWidth={3}
          />
          <text
            x={839}
            y={248}
            textAnchor="middle"
            fill={C.violet}
            style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: "0.14em" }}
          >
            ROUTER
          </text>
          <circle cx={x} cy={250} r={34} fill={C.cyan} />
          <circle cx={x} cy={250} r={64} fill={C.cyan} opacity={0.14} />
          <text
            x={x}
            y={162}
            textAnchor="middle"
            fill={C.text}
            style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 46 }}
          >
            you
          </text>
        </svg>

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 44,
            color: C.dim,
            letterSpacing: "0.06em",
            marginTop: 4,
          }}
        >
          distance {dist.toFixed(1)} m
        </div>

        <div style={{ width: W, marginTop: 56 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: F.mono,
              fontSize: 26,
              letterSpacing: "0.18em",
              color: C.faint,
              marginBottom: 14,
            }}
          >
            <span>AIRTIME USED BY THE PLUG</span>
            <span style={{ color: C.red, opacity: tag }}>NO CHANGE</span>
          </div>
          <div
            style={{
              width: W,
              height: 96,
              borderRadius: 12,
              backgroundColor: "#0B0D14",
              border: `1.5px solid ${C.panelEdge}`,
              overflow: "hidden",
            }}
          >
            <div style={{ width: W * 0.8, height: 96, backgroundColor: C.amber }} />
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
  const fill = prog(frame, 4, 24);
  const line = prog(frame, 40, 14);
  return (
    <Stage>
      <Tag text="THE REAL LIMIT" />
      <div style={{ display: "flex", flexDirection: "column", gap: 40, width: W }}>
        <div>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 27,
              letterSpacing: "0.26em",
              color: C.faint,
              marginBottom: 14,
            }}
          >
            BANDWIDTH
          </div>
          <div style={{ width: W, height: 76, borderRadius: 12, backgroundColor: "#0B0D14" }}>
            <div
              style={{ width: W * fill, height: 76, borderRadius: 12, backgroundColor: C.cyan }}
            />
          </div>
        </div>

        <div>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 27,
              letterSpacing: "0.26em",
              color: C.faint,
              marginBottom: 14,
            }}
          >
            AIRTIME
          </div>
          <div
            style={{
              position: "relative",
              width: W,
              height: 190,
              borderRadius: 12,
              backgroundColor: "#0B0D14",
              border: `1.5px solid ${C.panelEdge}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: W * 0.6,
                backgroundColor: "rgba(251,191,36,0.85)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: W * 0.6,
                top: 0,
                bottom: 0,
                width: 12,
                backgroundColor: C.cyan,
                opacity: blink ? 1 : 0.15,
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 30,
                top: 76,
                fontFamily: F.mono,
                fontSize: 30,
                letterSpacing: "0.2em",
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
            fontSize: 86,
            letterSpacing: "-0.045em",
            color: C.text,
            lineHeight: 1.14,
            marginTop: 26,
            opacity: line,
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
  const flip = prog(frame, 38, 18);
  const c2 = prog(frame, 84, 16);
  const hi = prog(frame, 98, 18);
  const foot = prog(frame, 116, 14);
  return (
    <Stage>
      <Tag text="WHAT ACTUALLY HELPS" />
      <div style={{ display: "flex", flexDirection: "column", gap: 28, width: W }}>
        <div
          style={{
            padding: "40px 40px",
            borderRadius: 24,
            backgroundColor: C.panel,
            border: `1.5px solid ${C.panelEdge}`,
            opacity: c1,
            transform: `translateY(${(1 - c1) * 24}px)`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ maxWidth: 600 }}>
              <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 50, color: C.text }}>
                Airtime fairness
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 25, color: C.faint, marginTop: 8 }}>
                it schedules time, not packets
              </div>
            </div>
            <div
              style={{
                width: 122,
                height: 66,
                borderRadius: 33,
                backgroundColor: flip > 0.5 ? "rgba(52,211,153,0.25)" : "#1A1D27",
                border: `2px solid ${flip > 0.5 ? C.green : C.panelEdge}`,
                position: "relative",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 7,
                  left: 7 + flip * 56,
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: flip > 0.5 ? C.green : C.dim,
                }}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "40px 40px",
            borderRadius: 24,
            backgroundColor: C.panel,
            border: `1.5px solid ${C.panelEdge}`,
            opacity: c2,
            transform: `translateY(${(1 - c2) * 24}px)`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ maxWidth: 600 }}>
              <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 50, color: C.text }}>
                Move it to 2.4 GHz
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 25, color: C.faint, marginTop: 8 }}>
                short range, cheap radio
              </div>
            </div>
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 34,
                padding: "14px 22px",
                borderRadius: 12,
                color: hi > 0.5 ? C.bg : C.dim,
                backgroundColor: hi > 0.5 ? C.cyan : "transparent",
                border: `2px solid ${hi > 0.5 ? C.cyan : C.panelEdge}`,
                flexShrink: 0,
              }}
            >
              2.4G
            </div>
          </div>
        </div>

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 28,
            color: C.faint,
            textAlign: "center",
            marginTop: 14,
            opacity: foot,
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
  const sub = prog(frame, 22, 14);
  const pill = spring({ frame: frame - 40, fps, config: { damping: 12, stiffness: 130 } });
  const pulse = 1 + Math.sin(frame / 9) * 0.016;
  return (
    <Stage>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 28,
            letterSpacing: "0.36em",
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
            fontSize: 132,
            lineHeight: 1.0,
            letterSpacing: "-0.055em",
            color: C.text,
            opacity: Math.max(0, Math.min(1, line)),
            transform: `translateY(${(1 - line) * 50}px)`,
            marginTop: 26,
          }}
        >
          Why your Wi-Fi
          <br />
          is slow
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontSize: 46,
            color: C.dim,
            opacity: sub,
            marginTop: 40,
          }}
        >
          The full breakdown is 11 minutes.
        </div>
        <div
          style={{
            marginTop: 64,
            padding: "28px 56px",
            borderRadius: 60,
            backgroundColor: C.cyan,
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 48,
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
