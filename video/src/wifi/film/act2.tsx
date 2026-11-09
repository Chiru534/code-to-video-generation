import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../../theme";
import {
  AirtimeRail,
  CLAMP,
  FILM,
  Kicker,
  Label,
  Panel,
  Stage,
  Statement,
  ease,
  prog,
} from "./kit";
import { Note, Rings, Split, Stat, Timeline } from "./bits";

/* ACT 2 - the protocol. Why a shared channel needs rules, and what those
   rules quietly optimise for. */

const S10: React.FC = () => {
  const frame = useCurrentFrame();
  const active = Math.floor(frame / 48) % 4;
  const nodes = [
    { x: 132, y: 168, name: "PHONE", color: C.cyan },
    { x: 606, y: 168, name: "LAPTOP", color: C.cyan },
    { x: 150, y: 468, name: "TV", color: C.violet },
    { x: 590, y: 468, name: "PLUG", color: C.amber },
  ];
  return (
    <Stage>
      <Split
        left={
          <svg width={740} height={600} viewBox="0 0 740 600">
            <circle cx={370} cy={318} r={262} fill="rgba(18,20,28,0.45)" stroke={C.panelEdge} strokeWidth={2} />
            {nodes.map((n, i) => (
              <line
                key={`l${i}`}
                x1={370}
                y1={318}
                x2={n.x}
                y2={n.y}
                stroke={i === active ? n.color : C.panelEdge}
                strokeWidth={i === active ? 3 : 2}
                strokeDasharray="8 12"
                opacity={i === active ? 0.7 : 0.5}
              />
            ))}
            <circle cx={370} cy={318} r={58} fill={`${C.violet}22`} stroke={C.violet} strokeWidth={2.5} />
            <text
              x={370}
              y={326}
              textAnchor="middle"
              fill={C.violet}
              style={{ fontFamily: F.mono, fontSize: 20, letterSpacing: "0.18em" }}
            >
              AP
            </text>
            {nodes.map((n, i) => (
              <g key={n.name}>
                {i === active ? <Rings cx={n.x} cy={n.y} color={n.color} frame={frame} max={74} /> : null}
                <circle cx={n.x} cy={n.y} r={26} fill={i === active ? n.color : "#2A2E3A"} />
                <text
                  x={n.x}
                  y={n.y + 66}
                  textAnchor="middle"
                  fill={i === active ? n.color : C.faint}
                  style={{ fontFamily: F.mono, fontSize: 19, letterSpacing: "0.14em" }}
                >
                  {n.name}
                </text>
              </g>
            ))}
            <text
              x={370}
              y={586}
              textAnchor="middle"
              fill={C.faint}
              style={{ fontFamily: F.mono, fontSize: 17, letterSpacing: "0.26em" }}
            >
              ONE CHANNEL · ONE SPEAKER AT A TIME
            </text>
          </svg>
        }
        right={
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <Kicker text="THE PROTOCOL" />
            <div
              style={{
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 104,
                lineHeight: 1,
                letterSpacing: "-0.05em",
                color: C.faint,
              }}
            >
              Listen.
            </div>
            <div
              style={{
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 118,
                lineHeight: 1,
                letterSpacing: "-0.055em",
                color: C.cyan,
                opacity: prog(frame, 26, 18),
                transform: `translateY(${(1 - prog(frame, 26, 18)) * 30}px)`,
              }}
            >
              Then talk.
            </div>
            <div style={{ fontFamily: F.sans, fontSize: 34, color: C.dim, lineHeight: 1.45, marginTop: 18 }}>
              Carrier sense multiple access with collision avoidance.
              <br />
              Four ideas, one rule: never transmit over someone else.
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 20, color: C.faint, letterSpacing: "0.16em" }}>
              CSMA/CA · 802.11 · SINCE 1997
            </div>
          </div>
        }
      />
    </Stage>
  );
};

const S11: React.FC = () => {
  const frame = useCurrentFrame();
  const phase = frame < 40 ? 0 : frame < 84 ? 1 : 2;
  const steps = ["LISTEN", "WAIT DIFS", "TRANSMIT"];
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 40 }}>
        <Kicker text="ONE PREDICTABLE GAP" at={0} />
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 84,
            letterSpacing: "-0.045em",
            color: C.text,
            lineHeight: 1.05,
          }}
        >
          Silence is a schedule.
        </div>
        <Timeline
          segs={[
            { ms: 90, color: "#242833", label: "CHANNEL BUSY" },
            { ms: 34, color: C.cyan, label: "DIFS" },
            { ms: 76, color: C.violet, label: "YOUR FRAME" },
          ]}
          totalMs={200}
          height={104}
          at={16}
          cursor
          axis
          axisLabel="200 µs"
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: F.mono,
            fontSize: 21,
            color: C.faint,
            letterSpacing: "0.14em",
          }}
        >
          <span>busy</span>
          <span style={{ color: C.cyan }}>34 µs of enforced silence</span>
          <span style={{ color: C.violet }}>one frame may begin</span>
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
          {steps.map((s, i) => (
            <div
              key={s}
              style={{
                flex: 1,
                padding: "24px 28px",
                borderRadius: 14,
                border: `1px solid ${i === phase ? C.cyan : C.panelEdge}`,
                backgroundColor: i === phase ? `${C.cyan}14` : C.panel,
                fontFamily: F.mono,
                fontSize: 24,
                letterSpacing: "0.18em",
                color: i === phase ? C.cyan : C.faint,
                transition: "none",
              }}
            >
              {String(i + 1).padStart(2, "0")} · {s}
            </div>
          ))}
        </div>
      </div>
    </Stage>
  );
};

const S12: React.FC = () => {
  const frame = useCurrentFrame();
  const lanes = [
    { name: "ACK", gap: 16, color: C.green, delay: 0 },
    { name: "VOICE", gap: 34, color: C.violet, delay: 10 },
    { name: "DATA", gap: 68, color: C.cyan, delay: 22 },
  ];
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 30 }}>
        <Kicker text="WHY THE GAP EXISTS" at={0} />
        <div style={{ display: "flex", alignItems: "flex-end", gap: 40, marginBottom: 16 }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 88,
              letterSpacing: "-0.05em",
              color: C.text,
              lineHeight: 1,
            }}
          >
            Priority is a shorter wait.
          </div>
          <div style={{ fontFamily: F.sans, fontSize: 30, color: C.dim, paddingBottom: 10 }}>
            Everyone defers. Some defer less.
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {lanes.map((l, i) => {
            const p = prog(frame, 16 + l.delay, 18);
            const gapPx = l.gap * 5.2;
            return (
              <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <div
                  style={{
                    width: 150,
                    fontFamily: F.mono,
                    fontSize: 20,
                    letterSpacing: "0.16em",
                    color: l.color,
                  }}
                >
                  {l.name}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 62,
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#0B0D14",
                    border: `1px solid ${C.panelEdge}`,
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ width: 430 * p, height: 62, backgroundColor: "#242833" }} />
                  <div
                    style={{
                      width: gapPx,
                      height: 62,
                      backgroundColor: `${l.color}18`,
                      borderLeft: `1px dashed ${l.color}55`,
                      borderRight: `1px dashed ${l.color}55`,
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ width: 620 * p, height: 62, backgroundColor: l.color, opacity: 0.82 }} />
                  <div
                    style={{
                      marginLeft: 18,
                      fontFamily: F.mono,
                      fontSize: 18,
                      color: C.faint,
                      whiteSpace: "nowrap",
                      opacity: p,
                    }}
                  >
                    {l.gap} µs
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <Note
            text="SIFS · shortest, for acknowledgements.  AIFS · shorter than DIFS, for priority traffic.  DIFS · the normal gap."
            at={80}
            width={1180}
          />
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 20,
              color: C.cyan,
              letterSpacing: "0.2em",
              opacity: prog(frame, 96, 16),
            }}
          >
            VOICE JUMPS THE QUEUE
          </div>
        </div>
      </div>
    </Stage>
  );
};

const S13: React.FC = () => {
  const frame = useCurrentFrame();
  const hit = frame >= 42;
  const flash = hit ? Math.max(0, 1 - (frame - 42) / 18) : 0;
  return (
    <Stage>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: C.red,
          opacity: flash * 0.12,
        }}
      />
      <Split
        left={
          <svg width={760} height={620} viewBox="0 0 760 620">
            <circle cx={380} cy={120} r={52} fill={`${C.violet}22`} stroke={C.violet} strokeWidth={2.5} />
            <text
              x={380}
              y={128}
              textAnchor="middle"
              fill={C.violet}
              style={{ fontFamily: F.mono, fontSize: 19, letterSpacing: "0.16em" }}
            >
              AP
            </text>
            {[
              { x: 150, y: 470, name: "LAPTOP", color: C.cyan },
              { x: 610, y: 470, name: "PLUG", color: C.amber },
            ].map((n) => (
              <g key={n.name}>
                <line
                  x1={380}
                  y1={172}
                  x2={n.x}
                  y2={n.y}
                  stroke={hit ? C.red : C.panelEdge}
                  strokeWidth={2}
                  strokeDasharray="8 12"
                />
                <Rings cx={n.x} cy={n.y} color={hit ? C.red : n.color} frame={frame} max={150} count={4} />
                <circle cx={n.x} cy={n.y} r={30} fill={hit ? C.red : n.color} />
                <text
                  x={n.x}
                  y={n.y + 72}
                  textAnchor="middle"
                  fill={C.dim}
                  style={{ fontFamily: F.mono, fontSize: 19, letterSpacing: "0.14em" }}
                >
                  {n.name}
                </text>
              </g>
            ))}
            {hit ? (
              <g>
                <circle cx={380} cy={300} r={54} fill={C.red} opacity={0.18} />
                <path
                  d="M352 272 L408 328 M408 272 L352 328"
                  stroke={C.red}
                  strokeWidth={7}
                  strokeLinecap="round"
                />
                <text
                  x={380}
                  y={392}
                  textAnchor="middle"
                  fill={C.red}
                  style={{ fontFamily: F.mono, fontSize: 22, letterSpacing: "0.2em" }}
                >
                  BOTH FRAMES LOST
                </text>
              </g>
            ) : null}
            <text
              x={380}
              y={590}
              textAnchor="middle"
              fill={C.faint}
              style={{ fontFamily: F.mono, fontSize: 17, letterSpacing: "0.22em" }}
            >
              SAME SLOT · OVERLAPPING SIGNAL
            </text>
          </svg>
        }
        right={
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <Kicker text="COLLISION" />
            <div
              style={{
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 92,
                lineHeight: 1.02,
                letterSpacing: "-0.05em",
                color: C.text,
              }}
            >
              Two devices.
              <br />
              <span style={{ color: C.red }}>Zero frames.</span>
            </div>
            <div style={{ fontFamily: F.sans, fontSize: 34, color: C.dim, lineHeight: 1.45 }}>
              The signals add, the receiver cannot decode either one, and no acknowledgement comes
              back. Both devices just spent airtime on nothing.
            </div>
            <div
              style={{
                marginTop: 12,
                display: "inline-flex",
                alignSelf: "flex-start",
                border: `1px solid ${C.red}66`,
                borderRadius: 10,
                padding: "12px 18px",
                fontFamily: F.mono,
                fontSize: 20,
                letterSpacing: "0.18em",
                color: C.red,
                opacity: hit ? 1 : 0,
              }}
            >
              NO ACK · RETRY REQUIRED
            </div>
          </div>
        }
      />
    </Stage>
  );
};

const S14: React.FC = () => {
  const frame = useCurrentFrame();
  const clock = Math.max(0, Math.floor((frame - 18) / 5));
  const won = clock >= 3;
  const slots = Array.from({ length: 16 }, (_, i) => i);
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 40 }}>
        <Kicker text="AFTER A COLLISION" at={0} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 82,
              letterSpacing: "-0.045em",
              color: C.text,
            }}
          >
            Back off by a random number.
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 21, color: C.faint, letterSpacing: "0.16em" }}>
            SLOT TIME · 9 µs
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {slots.map((i) => {
            const isWin = i === 3;
            const isOther = i === 11;
            const lit = clock === i && !won;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 100,
                  borderRadius: 8,
                  border: `1px solid ${lit ? "#fff" : isWin && won ? C.cyan : C.panelEdge}`,
                  backgroundColor: lit
                    ? "rgba(255,255,255,0.1)"
                    : isWin && won
                    ? `${C.cyan}2A`
                    : isOther
                    ? `${C.amber}12`
                    : "#0B0D14",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: F.mono,
                  fontSize: 17,
                  color: C.faint,
                  opacity: won && !isWin && !isOther ? 0.4 : 1,
                }}
              >
                {i}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 34 }}>
          {[
            { name: "LAPTOP", pick: 3, color: C.cyan },
            { name: "PLUG", pick: 11, color: C.amber },
          ].map((d) => {
            const remaining = won ? Math.max(0, d.pick - 3) : Math.max(0, d.pick - Math.max(0, clock - 1));
            return (
              <div
                key={d.name}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "22px 26px",
                  borderRadius: 14,
                  backgroundColor: C.panel,
                  border: `1px solid ${won && d.pick === 3 ? d.color : C.panelEdge}`,
                }}
              >
                <div style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: d.color }} />
                <div style={{ fontFamily: F.mono, fontSize: 20, letterSpacing: "0.16em", color: d.color, width: 110 }}>
                  {d.name}
                </div>
                <div style={{ fontFamily: F.sans, fontSize: 30, color: C.dim }}>
                  picked <span style={{ color: d.color, fontWeight: 700 }}>{d.pick}</span>
                </div>
                <div style={{ marginLeft: "auto", fontFamily: F.mono, fontSize: 22, color: C.dim }}>
                  counters left: {remaining}
                </div>
              </div>
            );
          })}
        </div>
        <Note
          text="The device that reaches zero first wins. The other one hears a transmission start and freezes its counter, without wasting a frame."
          at={70}
          width={1320}
        />
      </div>
    </Stage>
  );
};

const S15: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [15, 31, 63, 127, 255];
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 26 }}>
        <Kicker text="EXPONENTIAL BACKOFF" at={0} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 80,
              letterSpacing: "-0.045em",
              color: C.text,
            }}
          >
            Every failure doubles the window.
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 20, color: C.faint, letterSpacing: "0.16em" }}>
            CONTENTION WINDOW · SLOTS
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {rows.map((n, i) => {
            const p = prog(frame, 18 + i * 22, 18);
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 22, opacity: p * (i === 4 ? 0.85 : 1) }}>
                <div style={{ width: 230, fontFamily: F.mono, fontSize: 20, color: i === 4 ? C.red : C.dim }}>
                  TRY {i + 1} · {n} SLOTS
                </div>
                <div style={{ flex: 1, height: 34, backgroundColor: "#0B0D14", borderRadius: 6, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${(n / 255) * 100}%`,
                      height: 34,
                      backgroundColor: i === 4 ? C.red : i === 3 ? C.amber : C.cyan,
                      opacity: 0.55 + i * 0.09,
                    }}
                  />
                </div>
                <div style={{ width: 120, textAlign: "right", fontFamily: F.mono, fontSize: 20, color: C.faint }}>
                  {i === 0 ? "×1" : `×${Math.pow(2, i)}`}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 34, marginTop: 6 }}>
          <div style={{ flex: 1, fontFamily: F.sans, fontSize: 32, color: C.dim, lineHeight: 1.4 }}>
            Wider windows mean fewer collisions, and more silence. The network survives a busy room
            by making everyone wait longer.
          </div>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 20,
              color: C.amber,
              letterSpacing: "0.18em",
              alignSelf: "flex-end",
              opacity: prog(frame, 120, 16),
            }}
          >
            WORKS · BUT NOBODY COUNTS TIME
          </div>
        </div>
      </div>
    </Stage>
  );
};

const S16: React.FC = () => {
  const frame = useCurrentFrame();
  const colors = [C.cyan, C.violet, C.pink, C.amber];
  const segs = Array.from({ length: 24 }, (_, i) => ({ ms: 1, color: colors[i % 4] }));
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 34 }}>
        <Kicker text="WHAT THE RULE OPTIMISES FOR" at={0} />
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 96,
            letterSpacing: "-0.05em",
            color: C.text,
            lineHeight: 1.02,
          }}
        >
          Equal turns.
          <br />
          <span style={{ color: C.cyan }}>Measured in packets.</span>
        </div>
        <Timeline segs={segs} totalMs={24} height={108} at={20} dur={48} />
        <div style={{ display: "flex", gap: 26 }}>
          {["LAPTOP", "PHONE", "TV", "PLUG"].map((n, i) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors[i] }} />
              <span style={{ fontFamily: F.mono, fontSize: 19, color: C.dim, letterSpacing: "0.14em" }}>{n}</span>
            </div>
          ))}
          <div style={{ marginLeft: "auto", fontFamily: F.mono, fontSize: 19, color: C.faint }}>
            6 PACKETS EACH · ONE SECOND
          </div>
        </div>
        <div style={{ display: "flex", gap: 60 }}>
          <div style={{ flex: 1, fontFamily: F.sans, fontSize: 33, color: C.dim, lineHeight: 1.45 }}>
            No queue. No scheduler. No notion of who has been waiting longer. Four devices, each
            with the same chance to win the next slot.
          </div>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 700,
              fontSize: 38,
              color: C.amber,
              textAlign: "right",
              lineHeight: 1.3,
              opacity: prog(frame, 90, 16),
            }}
          >
            Fair to devices.
            <br />
            Blind to time.
          </div>
        </div>
      </div>
    </Stage>
  );
};

const S17: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 20, 24);
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 36 }}>
        <Kicker text="THE DETAIL THAT COSTS YOU THE NETWORK" at={0} />
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 84,
            letterSpacing: "-0.045em",
            color: C.text,
            lineHeight: 1.05,
          }}
        >
          Same packet. <span style={{ color: C.cyan }}>A hundred times the channel.</span>
        </div>

        {[
          { name: "LAPTOP · 1100 Mbps", ms: "0.1 ms", frac: 0.1 / 12, color: C.cyan },
          { name: "PLUG · 1 Mbps", ms: "12 ms", frac: 1, color: C.amber },
        ].map((r, i) => (
          <div key={r.name} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 21 }}>
              <span style={{ color: r.color, letterSpacing: "0.14em" }}>{r.name}</span>
              <span style={{ color: r.color, fontSize: 28 }}>{r.ms}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
              <div
                style={{
                  width: 220,
                  height: 64,
                  borderRadius: 8,
                  border: `1px solid ${r.color}66`,
                  backgroundColor: `${r.color}12`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: F.mono,
                  fontSize: 18,
                  color: r.color,
                }}
              >
                1,500 BYTES
              </div>
              <div
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 6,
                  backgroundColor: "#0B0D14",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.max(0.7, r.frac * 100 * p)}%`,
                    height: 46,
                    borderRadius: 6,
                    backgroundColor: r.color,
                    opacity: 0.85,
                  }}
                />
              </div>
            </div>
            {i === 0 ? (
              <div
                style={{
                  marginLeft: 246,
                  fontFamily: F.mono,
                  fontSize: 18,
                  color: C.faint,
                  opacity: prog(frame, 70, 14),
                }}
              >
                ← to scale, you can barely see it
              </div>
            ) : null}
          </div>
        ))}
        <div style={{ display: "flex", gap: 34, alignItems: "center", marginTop: 8 }}>
          <Note
            text="Channel time per 1,500-byte frame, including preamble, acknowledgement and average backoff. The radio that talks slow holds the room the longest."
            at={80}
            width={1180}
          />
          <div
            style={{
              marginLeft: "auto",
              fontFamily: F.mono,
              fontSize: 22,
              color: C.amber,
              letterSpacing: "0.2em",
              border: `1px solid ${C.amber}55`,
              borderRadius: 10,
              padding: "10px 16px",
              opacity: prog(frame, 92, 16),
            }}
          >
            ≈100× PER PACKET
          </div>
        </div>
      </div>
    </Stage>
  );
};

export const ACT2: Record<string, React.ReactNode> = {
  s10: <S10 />,
  s11: <S11 />,
  s12: <S12 />,
  s13: <S13 />,
  s14: <S14 />,
  s15: <S15 />,
  s16: <S16 />,
  s17: <S17 />,
};
