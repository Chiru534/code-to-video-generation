import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../../theme";
import {
  AirtimeRail,
  CLAMP,
  CompareBar,
  FILM,
  Kicker,
  Label,
  Panel,
  Stage,
  Statement,
  ease,
  prog,
} from "./kit";

/* ACT 1 - the cold open and the thesis. 1920x1080. */

const Scene01: React.FC = () => {
  const frame = useCurrentFrame();
  const speed = interpolate(frame, [12, 96], [500, 9], { ...CLAMP, easing: ease });
  const shown = Math.round(speed);
  const hot = frame > 88;
  const bar = interpolate(speed, [9, 500], [26, 980]);
  const a = prog(frame, 130, 18);
  const b = prog(frame, 190, 18);
  const c = prog(frame, 250, 18);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Kicker text="THE LAYER BELOW · WI-FI" />
        <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 250,
              lineHeight: 0.9,
              letterSpacing: "-0.06em",
              color: hot ? C.red : C.text,
            }}
          >
            {shown}
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 44, color: C.dim }}>Mbps</div>
        </div>
        <div
          style={{
            width: 980,
            height: 14,
            borderRadius: 10,
            backgroundColor: "#151823",
            overflow: "hidden",
            marginTop: 26,
          }}
        >
          <div
            style={{
              width: bar,
              height: 14,
              borderRadius: 10,
              backgroundColor: hot ? C.red : C.cyan,
            }}
          />
        </div>

        <div style={{ marginTop: 86, textAlign: "center" }}>
          <div
            style={{
              fontFamily: F.sans,
              fontSize: 54,
              color: C.dim,
              opacity: a,
              transform: `translateY(${(1 - a) * 16}px)`,
            }}
          >
            You bought a faster router. Nothing changed.
          </div>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 76,
              letterSpacing: "-0.04em",
              color: C.text,
              marginTop: 22,
              opacity: b,
              transform: `translateY(${(1 - b) * 18}px)`,
            }}
          >
            The problem was never speed.
          </div>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 92,
              letterSpacing: "-0.045em",
              color: C.cyan,
              marginTop: 8,
              opacity: c,
              transform: `translateY(${(1 - c) * 18}px)`,
            }}
          >
            It was time.
          </div>
        </div>
      </div>
    </Stage>
  );
};

const Scene02: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const node = (x: number, y: number, label: string, color: string, at: number) => {
    const s = spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 120 } });
    return (
      <g transform={`translate(${x},${y}) scale(${Math.max(0, s)})`} opacity={Math.max(0, s)}>
        <circle r={44} fill={color} opacity={0.12} />
        <circle r={20} fill={color} />
        <text
          y={70}
          textAnchor="middle"
          fill={C.dim}
          style={{ fontFamily: F.mono, fontSize: 22, letterSpacing: "0.14em" }}
        >
          {label}
        </text>
      </g>
    );
  };
  return (
    <Stage>
      <div style={{ display: "flex", alignItems: "center", gap: 90, width: FILM.safeW }}>
        <svg width={820} height={660} viewBox="0 0 820 660">
          <rect
            x={10}
            y={10}
            width={800}
            height={640}
            rx={28}
            fill="rgba(18,20,28,0.55)"
            stroke={C.panelEdge}
            strokeWidth={2}
          />
          <rect x={330} y={52} width={160} height={56} rx={14} fill={C.violet} opacity={0.18} />
          <rect
            x={330}
            y={52}
            width={160}
            height={56}
            rx={14}
            fill="none"
            stroke={C.violet}
            strokeWidth={2.5}
          />
          <text
            x={410}
            y={88}
            textAnchor="middle"
            fill={C.violet}
            style={{ fontFamily: F.mono, fontSize: 21, letterSpacing: "0.18em" }}
          >
            ROUTER
          </text>
          {[
            [160, 250],
            [660, 250],
            [200, 500],
          ].map(([x, y], i) => (
            <line
              key={i}
              x1={410}
              y1={110}
              x2={x}
              y2={y}
              stroke={C.cyan}
              strokeWidth={2}
              strokeDasharray="8 11"
              opacity={0.28}
            />
          ))}
          <line
            x1={410}
            y1={110}
            x2={650}
            y2={540}
            stroke={C.amber}
            strokeWidth={3}
            strokeDasharray="8 11"
            opacity={0.55}
          />
          {node(160, 250, "PHONE", C.cyan, 10)}
          {node(660, 250, "LAPTOP", C.cyan, 20)}
          {node(200, 500, "TV", C.cyan, 30)}
          {node(650, 540, "PLUG", C.amber, 40)}
          <rect x={520} y={572} width={180} height={48} rx={10} fill="rgba(251,191,36,0.16)" />
          <text
            x={610}
            y={603}
            textAnchor="middle"
            fill={C.amber}
            style={{ fontFamily: F.mono, fontSize: 22, letterSpacing: "0.1em" }}
          >
            1 Mbps
          </text>
        </svg>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Label text="YOUR ACTUAL NETWORK" />
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 92,
              lineHeight: 1.02,
              letterSpacing: "-0.045em",
              color: C.text,
            }}
          >
            Four devices.
            <br />
            One channel.
            <br />
            <span style={{ color: C.amber }}>One $10 plug.</span>
          </div>
          <div style={{ fontFamily: F.sans, fontSize: 34, color: C.dim, lineHeight: 1.4, marginTop: 10 }}>
            It sits at the far end of the house, so it talks slowly.
            <br />
            Everybody else pays for it.
          </div>
        </div>
      </div>
    </Stage>
  );
};

const Scene03: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 10, 20);
  return (
    <Stage>
      <Kicker text="THE CULPRIT" />
      <div style={{ display: "flex", alignItems: "center", gap: 110 }}>
        <Panel width={640} accent="rgba(251,191,36,0.4)" at={0}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: C.amber }} />
            <div>
              <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 44, color: C.text }}>
                Smart plug
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 21, color: C.faint, letterSpacing: "0.12em" }}>
                802.11n · 2.4 GHz · 12 m · 2 walls
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 34 }}>
            <div
              style={{
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 190,
                lineHeight: 0.88,
                letterSpacing: "-0.055em",
                color: C.amber,
              }}
            >
              1
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 38, color: C.dim }}>Mbps</div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            {["MCS 0", "-85 dBm", "20 MHz"].map((t) => (
              <div
                key={t}
                style={{
                  fontFamily: F.mono,
                  fontSize: 19,
                  color: C.dim,
                  border: `1px solid ${C.panelEdge}`,
                  borderRadius: 8,
                  padding: "7px 12px",
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </Panel>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, opacity: p }}>
          <Label text="ITS SHARE OF YOUR TRAFFIC" />
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 210,
              lineHeight: 0.9,
              letterSpacing: "-0.06em",
              color: C.text,
            }}
          >
            4%
          </div>
          <div style={{ fontFamily: F.sans, fontSize: 36, color: C.dim, maxWidth: 420, lineHeight: 1.35 }}>
            of everything your network carries.
            <br />
            And it is the reason the other three are waiting.
          </div>
        </div>
      </div>
    </Stage>
  );
};

const Scene04: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const strike = prog(frame, 26, 18);
  const time = spring({ frame: frame - 54, fps, config: { damping: 15, stiffness: 110 } });
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: FILM.safeW }}>
        <div style={{ position: "relative", marginBottom: 6 }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 108,
              letterSpacing: "-0.05em",
              lineHeight: 1.05,
              color: C.faint,
            }}
          >
            Wi-Fi doesn&apos;t share speed.
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "52%",
              height: 10,
              width: 900 * strike,
              backgroundColor: C.red,
              borderRadius: 6,
              transform: "rotate(-1deg)",
            }}
          />
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 176,
            letterSpacing: "-0.055em",
            lineHeight: 1,
            color: C.cyan,
            opacity: Math.max(0, Math.min(1, time)),
            transform: `translateY(${(1 - time) * 50}px)`,
          }}
        >
          It shares time.
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontSize: 40,
            color: C.dim,
            marginTop: 40,
            opacity: prog(frame, 110, 20),
          }}
        >
          Everything strange about home Wi-Fi follows from that sentence.
        </div>
      </div>
    </Stage>
  );
};

const Scene05: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <Kicker text="THE NUMBER ON THE BOX" />
      <div style={{ display: "flex", gap: 70, alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontFamily: F.sans, fontSize: 30, color: C.dim }}>Link rate</div>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 150,
              lineHeight: 0.92,
              letterSpacing: "-0.055em",
              color: C.text,
            }}
          >
            1200
            <span style={{ fontFamily: F.mono, fontSize: 30, color: C.dim, marginLeft: 12 }}>Mbps</span>
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 21, color: C.faint, letterSpacing: "0.18em" }}>
            PERFECT SIGNAL · ONE CLIENT
          </div>
        </div>

        <div style={{ width: 120, display: "flex", justifyContent: "center", paddingTop: 60 }}>
          <div style={{ fontFamily: F.mono, fontSize: 48, color: C.faint }}>→</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontFamily: F.sans, fontSize: 30, color: C.dim }}>What you actually get</div>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 150,
              lineHeight: 0.92,
              letterSpacing: "-0.055em",
              color: C.cyan,
              opacity: prog(frame, 40, 20),
            }}
          >
            300
            <span style={{ fontFamily: F.mono, fontSize: 30, color: C.dim, marginLeft: 12 }}>Mbps</span>
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 21, color: C.faint, letterSpacing: "0.18em" }}>
            FOUR CLIENTS · TWO WALLS · NEIGHBOURS
          </div>
        </div>
      </div>

      <div style={{ width: FILM.safeW, marginTop: 66 }}>
        <CompareBar
          label="LINK RATE"
          value="1200 Mbps"
          fraction={1}
          color={C.violet}
          at={10}
          width={FILM.safeW}
          height={26}
        />
        <div style={{ height: 16 }} />
        <CompareBar
          label="THROUGHPUT"
          value="300 Mbps"
          fraction={0.25}
          color={C.cyan}
          at={44}
          width={FILM.safeW}
          height={26}
        />
      </div>
    </Stage>
  );
};

const Scene06: React.FC = () => {
  const frame = useCurrentFrame();
  const conditions = ["perfect signal", "one client", "no interference", "an empty channel"];
  return (
    <Stage>
      <Statement
        lines={["It is not a lie.", "It is a measurement of a situation", "that never happens."]}
        accent={2}
        size={78}
      />
      <div style={{ display: "flex", gap: 18, marginTop: 60 }}>
        {conditions.map((c, i) => {
          const strike = prog(frame, 70 + i * 16, 14);
          return (
            <div
              key={c}
              style={{
                position: "relative",
                fontFamily: F.mono,
                fontSize: 24,
                color: C.dim,
                border: `1px solid ${C.panelEdge}`,
                borderRadius: 10,
                padding: "14px 20px",
                backgroundColor: C.panel,
              }}
            >
              {c}
              <div
                style={{
                  position: "absolute",
                  left: 8,
                  right: 8 - (1 - strike) * 8,
                  top: "52%",
                  height: 3,
                  backgroundColor: C.red,
                  borderRadius: 2,
                  opacity: strike,
                }}
              />
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

const Scene07: React.FC = () => {
  const frame = useCurrentFrame();
  const waves = [0, 1, 2, 3];
  return (
    <Stage>
      <div style={{ display: "flex", alignItems: "center", gap: 100, width: FILM.safeW }}>
        <svg width={620} height={620} viewBox="0 0 620 620">
          <circle cx={310} cy={310} r={270} fill="rgba(18,20,28,0.5)" stroke={C.panelEdge} strokeWidth={2} />
          <circle cx={310} cy={310} r={62} fill={C.violet} opacity={0.16} />
          <circle cx={310} cy={310} r={62} fill="none" stroke={C.violet} strokeWidth={2.5} />
          <text
            x={310}
            y={318}
            textAnchor="middle"
            fill={C.violet}
            style={{ fontFamily: F.mono, fontSize: 17, letterSpacing: "0.14em" }}
          >
            AP
          </text>
          {[
            [310, 90],
            [530, 310],
            [310, 530],
            [90, 310],
          ].map(([x, y], i) => {
            const talking = i === 3;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={30} fill={talking ? C.amber : C.cyan} opacity={0.9} />
                {talking
                  ? waves.map((w) => (
                      <circle
                        key={w}
                        cx={x}
                        cy={y}
                        r={38 + ((frame + w * 18) % 72)}
                        fill="none"
                        stroke={C.amber}
                        strokeWidth={2}
                        opacity={Math.max(0, 0.5 - ((frame + w * 18) % 72) / 144)}
                      />
                    ))
                  : null}
              </g>
            );
          })}
          <text
            x={310}
            y={600}
            textAnchor="middle"
            fill={C.faint}
            style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: "0.24em" }}
          >
            ONE CHANNEL
          </text>
        </svg>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Label text="WHAT ACTUALLY HAPPENS" />
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 84,
              lineHeight: 1.04,
              letterSpacing: "-0.045em",
              color: C.text,
            }}
          >
            The channel stops
            <br />
            being yours.
          </div>
          <div style={{ fontFamily: F.sans, fontSize: 32, color: C.dim, lineHeight: 1.4, maxWidth: 620 }}>
            It becomes a shared room. A room does not have bandwidth.
            <br />
            It has airtime.
          </div>
        </div>
      </div>
    </Stage>
  );
};

const Scene08: React.FC = () => {
  const frame = useCurrentFrame();
  const slots: { who: string; ms: number; color: string }[] = [
    { who: "laptop", ms: 210, color: C.cyan },
    { who: "plug", ms: 480, color: C.amber },
    { who: "phone", ms: 120, color: "rgba(34,211,238,0.55)" },
    { who: "tv", ms: 90, color: "rgba(34,211,238,0.3)" },
    { who: "overhead", ms: 100, color: "rgba(167,139,250,0.5)" },
  ];
  return (
    <Stage>
      <Kicker text="AIRtime IS THE CURRENCY" />
      <div style={{ width: FILM.safeW }}>
        <div
          style={{
            display: "flex",
            width: `${prog(frame, 10, 30) * 100}%`,
            height: 130,
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: "#0B0D14",
          }}
        >
          {slots.map((s) => (
            <div
              key={s.who}
              style={{ width: `${(s.ms / 1000) * 100}%`, backgroundColor: s.color, height: 130 }}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: F.mono,
            fontSize: 21,
            color: C.faint,
            marginTop: 14,
          }}
        >
          <span>one second of channel time</span>
          <span>1000 ms</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 60, marginTop: 54, width: FILM.safeW }}>
        <div style={{ fontFamily: F.sans, fontSize: 34, color: C.dim, lineHeight: 1.45, flex: 1 }}>
          Every frame, every acknowledgement, every retry is paid for in milliseconds. The budget
          is not capacity. It is time.
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 74,
            letterSpacing: "-0.04em",
            color: C.amber,
            whiteSpace: "nowrap",
          }}
        >
          480 ms
          <div style={{ fontFamily: F.mono, fontSize: 21, color: C.faint, letterSpacing: "0.2em" }}>
            SPENT BY ONE PLUG
          </div>
        </div>
      </div>
    </Stage>
  );
};

const Scene09: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <Statement
        lines={["Your router does not", "run out of speed."]}
        size={86}
        at={0}
      />
      <div
        style={{
          fontFamily: F.sans,
          fontWeight: 800,
          fontSize: 96,
          letterSpacing: "-0.05em",
          color: C.cyan,
          marginTop: 24,
          opacity: prog(frame, 60, 18),
          transform: `translateY(${(1 - prog(frame, 60, 18)) * 24}px)`,
        }}
      >
        It runs out of milliseconds.
      </div>
      <div
        style={{
          fontFamily: F.sans,
          fontSize: 38,
          color: C.dim,
          marginTop: 48,
          textAlign: "center",
          maxWidth: 1200,
          opacity: prog(frame, 120, 20),
        }}
      >
        Once you see the medium as time, the behaviour of home Wi-Fi stops being strange.
      </div>
    </Stage>
  );
};

export const ACT1: Record<string, React.ReactNode> = {
  s01: <Scene01 />,
  s02: <Scene02 />,
  s03: <Scene03 />,
  s04: <Scene04 />,
  s05: <Scene05 />,
  s06: <Scene06 />,
  s07: <Scene07 />,
  s08: <Scene08 />,
  s09: <Scene09 />,
};
