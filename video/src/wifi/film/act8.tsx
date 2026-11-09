import React from "react";
import { useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { FILM, Kicker, Stage, prog } from "./kit";
import { Note, Rings, Split } from "./bits";

/* ACT 8 - the close. One idea, restated in the terms the film earned. */

const S57: React.FC = () => {
  const frame = useCurrentFrame();
  const streams = [C.cyan, C.violet, C.pink, C.green, C.amber];
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 24 }}>
        <Kicker text="THE MISUNDERSTANDING" at={0} />
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 76,
            letterSpacing: "-0.045em",
            color: C.text,
            textAlign: "center",
          }}
        >
          The internet is not a pipe.
        </div>

        <div style={{ display: "flex", gap: 34 }}>
          <div style={{ flex: 1, padding: "24px 28px", borderRadius: 16, backgroundColor: C.panel, border: `1px solid ${C.panelEdge}` }}>
            <div style={{ fontFamily: F.mono, fontSize: 19, color: C.cyan, letterSpacing: "0.16em" }}>A PIPE</div>
            <svg width={740} height={280} viewBox="0 0 740 280">
              <rect x={30} y={60} width={680} height={160} rx={20} fill="rgba(255,255,255,0.03)" stroke={C.panelEdge} strokeWidth={2} />
              {streams.map((c, i) => (
                <g key={i}>
                  <line x1={30} y1={86 + i * 32} x2={710} y2={86 + i * 32} stroke={`${c}33`} strokeWidth={10} />
                  <circle cx={30 + ((frame * (2 + i) + i * 120) % 680)} cy={86 + i * 32} r={7} fill={c} />
                </g>
              ))}
            </svg>
            <div style={{ fontFamily: F.sans, fontSize: 25, color: C.dim }}>
              Everything flows at once, without negotiation.
            </div>
          </div>

          <div style={{ flex: 1, padding: "24px 28px", borderRadius: 16, backgroundColor: C.panel, border: `1px solid ${C.amber}44` }}>
            <div style={{ fontFamily: F.mono, fontSize: 19, color: C.amber, letterSpacing: "0.16em" }}>A CHANNEL</div>
            <svg width={740} height={280} viewBox="0 0 740 280">
              <rect x={30} y={40} width={680} height={200} rx={20} fill="rgba(255,255,255,0.02)" stroke={C.panelEdge} strokeWidth={2} />
              <circle cx={370} cy={130} r={26} fill={`${C.violet}33`} stroke={C.violet} />
              <text x={370} y={136} textAnchor="middle" fill={C.violet} style={{ fontFamily: F.mono, fontSize: 13 }}>AP</text>
              {[
                { x: 140, y: 180, c: C.cyan, on: false },
                { x: 300, y: 210, c: C.violet, on: false },
                { x: 470, y: 210, c: C.pink, on: false },
                { x: 620, y: 180, c: C.amber, on: true },
              ].map((d, i) => (
                <g key={i}>
                  <circle cx={d.x} cy={d.y} r={13} fill={d.c} opacity={d.on ? 1 : 0.35} />
                  {d.on ? <Rings cx={d.x} cy={d.y} color={d.c} frame={frame} max={90} /> : null}
                </g>
              ))}
              <text x={370} y={262} textAnchor="middle" fill={C.faint} style={{ fontFamily: F.mono, fontSize: 17, letterSpacing: "0.16em" }}>
                ONE MICROPHONE
              </text>
            </svg>
            <div style={{ fontFamily: F.sans, fontSize: 25, color: C.dim }}>
              One voice at a time, by permission.
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
};

const S58: React.FC = () => {
  const frame = useCurrentFrame();
  const phase = frame > 100;
  const clients = [
    { name: "LAPTOP", color: C.cyan, wave: 18 },
    { name: "PHONE", color: C.violet, wave: 26 },
    { name: "TV", color: C.pink, wave: 14 },
    { name: "PLUG", color: C.amber, wave: 8 },
  ];
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <Kicker text="THE ROOM" at={0} />
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 92,
            letterSpacing: "-0.05em",
            color: C.text,
            lineHeight: 1.05,
            textAlign: "center",
          }}
        >
          Everyone can speak.
          <br />
          <span style={{ color: phase ? C.amber : C.dim }}>Only one can be heard.</span>
        </div>

        <div style={{ display: "flex", gap: 34, alignItems: "flex-end", marginTop: 8 }}>
          {clients.map((c, i) => {
            const speaking = phase ? i === 3 : true;
            const level = speaking ? 0.5 + Math.abs(Math.sin((frame + i * 20) / 12)) * 0.5 : 0.12;
            return (
              <div key={c.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: 150 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 90 }}>
                  {[0, 1, 2, 3, 4].map((b) => (
                    <div
                      key={b}
                      style={{
                        width: 10,
                        height: 18 + (b % 3) * 16,
                        borderRadius: 4,
                        backgroundColor: c.color,
                        opacity: speaking ? level * 0.9 : 0.15,
                        transform: `scaleY(${speaking ? level : 0.3})`,
                        transformOrigin: "bottom",
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: `${c.color}22`,
                    border: `1px solid ${c.color}66`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: F.mono,
                    fontSize: 16,
                    color: c.color,
                  }}
                >
                  {c.name.slice(0, 2)}
                </div>
                <div style={{ fontFamily: F.mono, fontSize: 16, color: c.color, letterSpacing: "0.12em" }}>{c.name}</div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            width: FILM.safeW,
            padding: "20px 28px",
            borderRadius: 14,
            backgroundColor: C.panel,
            border: `1px solid ${C.amber}33`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            opacity: prog(frame, 120, 20),
          }}
        >
          <div style={{ fontFamily: F.sans, fontSize: 30, color: C.dim }}>
            It is not doing nothing. It is holding the channel, one slow frame at a time.
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: 30 }, (_, i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 34,
                  backgroundColor: C.amber,
                  opacity: i < ((frame - 120) / 3) % 30 ? 0.8 : 0.15,
                  borderRadius: 2,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </Stage>
  );
};

const S59: React.FC = () => {
  const frame = useCurrentFrame();
  const strike = prog(frame, 40, 20);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div style={{ position: "relative" }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 96,
              letterSpacing: "-0.05em",
              color: C.faint,
              lineHeight: 1.1,
            }}
          >
            Not bandwidth.
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              height: 10,
              width: 700 * strike,
              backgroundColor: C.red,
              borderRadius: 6,
            }}
          />
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 170,
            letterSpacing: "-0.06em",
            color: C.cyan,
            lineHeight: 0.95,
            opacity: prog(frame, 60, 24),
            transform: `translateY(${(1 - prog(frame, 60, 24)) * 30}px)`,
          }}
        >
          Time.
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 700,
            fontSize: 64,
            letterSpacing: "-0.04em",
            color: C.amber,
            opacity: prog(frame, 96, 22),
          }}
        >
          And permission to use it.
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 30 }}>
          {[
            { k: "4% traffic", v: "80% airtime", c: C.amber },
            { k: "12 ms / frame", v: "≈100× cost", c: C.red },
            { k: "packet fair", v: "time unfair", c: C.cyan },
          ].map((chip, i) => (
            <div
              key={chip.k}
              style={{
                padding: "14px 20px",
                borderRadius: 10,
                border: `1px solid ${chip.c}44`,
                backgroundColor: `${chip.c}0C`,
                opacity: prog(frame, 130 + i * 12, 14),
              }}
            >
              <div style={{ fontFamily: F.mono, fontSize: 17, color: C.faint, letterSpacing: "0.12em" }}>{chip.k}</div>
              <div style={{ fontFamily: F.mono, fontSize: 19, color: chip.c, marginTop: 6, letterSpacing: "0.12em" }}>{chip.v}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            fontFamily: F.sans,
            fontSize: 34,
            color: C.dim,
            marginTop: 28,
            opacity: prog(frame, 170, 18),
          }}
        >
          Once you can see the queue, you can stop buying routers and start fixing the room.
        </div>
      </div>
    </Stage>
  );
};

const S60: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 22,
            letterSpacing: "0.44em",
            color: C.cyan,
            opacity: prog(frame, 0, 18),
          }}
        >
          THE LAYER BELOW
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 104,
            letterSpacing: "-0.055em",
            color: C.text,
            textAlign: "center",
            lineHeight: 1.02,
            opacity: prog(frame, 10, 20),
          }}
        >
          That is the layer below.
        </div>
        <div
          style={{
            display: "flex",
            gap: 26,
            fontFamily: F.mono,
            fontSize: 19,
            color: C.faint,
            letterSpacing: "0.16em",
            opacity: prog(frame, 30, 18),
          }}
        >
          <span>SOURCES IN THE DESCRIPTION</span>
          <span>·</span>
          <span>SUBSCRIBE FOR THE NEXT LAYER</span>
        </div>
      </div>
    </Stage>
  );
};

export const ACT8: Record<string, React.ReactNode> = {
  s57: <S57 />,
  s58: <S58 />,
  s59: <S59 />,
  s60: <S60 />,
};
