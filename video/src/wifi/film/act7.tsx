import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { AirtimeRail, CLAMP, FILM, Kicker, Stage, prog } from "./kit";
import { Note, Split, Stat, Timeline, Toggle } from "./bits";

/* ACT 7 - the checklist and the two measurements that tell you which problem
   you actually have. */

const S50: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    { n: 1, text: "Airtime fairness", detail: "wireless / QoS settings", color: C.cyan, on: true },
    { n: 2, text: "Separate the bands", detail: "5 / 6 GHz for people, 2.4 for things", color: C.violet },
    { n: 3, text: "Set channel width", detail: "20 on 2.4 · 40 on 5 · 80 only if alone", color: C.amber },
    { n: 4, text: "Move the access point", detail: "height and line of sight, not power", color: C.pink },
    { n: 5, text: "Wire what never moves", detail: "TV, console, desktop", color: C.green },
  ];
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", gap: 70 }}>
        <div style={{ width: 560, display: "flex", flexDirection: "column", gap: 22 }}>
          <Kicker text="THE CHECKLIST" at={0} />
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 96,
              letterSpacing: "-0.055em",
              color: C.text,
              lineHeight: 1,
            }}
          >
            Ten minutes.
            <br />
            <span style={{ color: C.green }}>Zero cost.</span>
          </div>
          <div style={{ fontFamily: F.sans, fontSize: 31, color: C.dim, lineHeight: 1.45, marginTop: 12 }}>
            Five changes, in the order that matters. None of them require a new router, and four of
            them are already somewhere in the settings.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 18 }}>
            <div style={{ fontFamily: F.mono, fontSize: 18, color: C.faint, letterSpacing: "0.16em" }}>START WITH</div>
            <div style={{ fontFamily: F.mono, fontSize: 19, color: C.cyan, border: `1px solid ${C.cyan}55`, borderRadius: 8, padding: "8px 12px", letterSpacing: "0.12em" }}>
              ONE SETTING
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {rows.map((r, i) => (
            <div
              key={r.n}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "20px 24px",
                borderRadius: 14,
                backgroundColor: i === 0 ? `${C.cyan}0E` : C.panel,
                border: `1px solid ${i === 0 ? `${C.cyan}55` : C.panelEdge}`,
                opacity: prog(frame, 20 + i * 12, 14),
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  backgroundColor: `${r.color}22`,
                  border: `1px solid ${r.color}55`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: F.mono,
                  fontSize: 20,
                  color: r.color,
                }}
              >
                {r.n}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F.sans, fontSize: 30, fontWeight: 600, color: C.text }}>{r.text}</div>
                <div style={{ fontFamily: F.mono, fontSize: 17, color: C.faint, marginTop: 5 }}>{r.detail}</div>
              </div>
              {r.on ? <Toggle on at={34} /> : null}
            </div>
          ))}
        </div>
      </div>
    </Stage>
  );
};

const S51: React.FC = () => {
  const frame = useCurrentFrame();
  const lane = (
    title: string,
    sub: string,
    devices: { name: string; color: string }[],
    color: string,
    delay: number
  ) => (
    <div
      style={{
        padding: "24px 28px",
        borderRadius: 16,
        backgroundColor: C.panel,
        border: `1px solid ${color}33`,
        opacity: prog(frame, delay, 16),
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontFamily: F.mono, fontSize: 21, color, letterSpacing: "0.14em" }}>{title}</div>
        <div style={{ fontFamily: F.mono, fontSize: 17, color: C.faint }}>{sub}</div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        {devices.map((d) => (
          <div
            key={d.name}
            style={{
              flex: 1,
              height: 56,
              borderRadius: 9,
              border: `1px solid ${d.color}44`,
              backgroundColor: `${d.color}0E`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: F.mono,
              fontSize: 17,
              color: d.color,
              letterSpacing: "0.12em",
            }}
          >
            {d.name}
          </div>
        ))}
      </div>
      <div style={{ position: "relative", height: 10, borderRadius: 5, backgroundColor: "#0B0D14", marginTop: 18, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: `${(frame * 1.4) % 100}%`,
            width: 90,
            height: 10,
            backgroundColor: color,
            opacity: 0.5,
          }}
        />
      </div>
    </div>
  );
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 26 }}>
        <Kicker text="CHECKLIST · TWO" at={0} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 78,
              letterSpacing: "-0.045em",
              color: C.text,
              lineHeight: 1.04,
            }}
          >
            Separate the bands.
          </div>
          <div style={{ fontFamily: F.sans, fontSize: 29, color: C.dim, maxWidth: 520, lineHeight: 1.4 }}>
            Fast devices up. Cheap devices down. One band each, where possible.
          </div>
        </div>
        {lane(
          "5 / 6 GHz",
          "people · video · work",
          [
            { name: "PHONE", color: C.cyan },
            { name: "LAPTOP", color: C.violet },
            { name: "TV", color: C.pink },
            { name: "CONSOLE", color: C.green },
          ],
          C.violet,
          20
        )}
        {lane(
          "2.4 GHz · 20 MHz",
          "things · sensors · plugs",
          [
            { name: "PLUG", color: C.amber },
            { name: "BULB", color: C.amber },
            { name: "SENSOR", color: C.amber },
            { name: "CAMERA", color: C.amber },
          ],
          C.amber,
          50
        )}
        <Note
          text="Not every router lets you name bands separately. If yours uses one SSID, band steering is the setting that does this for you — and if it is off, the cheap device may be the one choosing the band."
          at={90}
          width={1400}
        />
      </div>
    </Stage>
  );
};

const S52: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    { band: "2.4 GHz", width: "20 MHz", why: "only three non-overlapping channels", color: C.amber, ok: true },
    { band: "5 GHz", width: "40 MHz", why: "sweet spot in a dense area", color: C.cyan, ok: true },
    { band: "6 GHz", width: "80 MHz", why: "quiet enough to spend it", color: C.violet, ok: true },
    { band: "any band", width: "160 MHz", why: "only if you live in a field", color: C.red, ok: false },
  ];
  return (
    <Stage>
      <Split
        left={
          <div
            style={{
              width: 720,
              borderRadius: 20,
              border: `1px solid ${C.panelEdge}`,
              backgroundColor: C.panel,
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "22px 26px", borderBottom: `1px solid ${C.panelEdge}`, display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontFamily: F.mono, fontSize: 18, color: C.dim, letterSpacing: "0.16em" }}>WIRELESS · CHANNEL WIDTH</div>
              <div style={{ fontFamily: F.mono, fontSize: 16, color: C.faint }}>ADVANCED</div>
            </div>
            {rows.map((r, i) => (
              <div
                key={r.band}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "20px 26px",
                  borderBottom: i < rows.length - 1 ? `1px solid ${C.panelEdge}` : "none",
                  opacity: prog(frame, 22 + i * 12, 14),
                }}
              >
                <div style={{ width: 150, fontFamily: F.mono, fontSize: 19, color: C.dim }}>{r.band}</div>
                <div
                  style={{
                    width: 150,
                    fontFamily: F.mono,
                    fontSize: 22,
                    color: r.color,
                    border: `1px solid ${r.color}55`,
                    borderRadius: 8,
                    padding: "10px 14px",
                  }}
                >
                  {r.width} ▾
                </div>
                <div style={{ flex: 1, fontFamily: F.mono, fontSize: 16, color: C.faint }}>{r.why}</div>
                <div style={{ fontFamily: F.mono, fontSize: 16, color: r.ok ? C.green : C.red }}>
                  {r.ok ? "OK" : "AVOID"}
                </div>
              </div>
            ))}
          </div>
        }
        right={
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <Kicker text="CHECKLIST · THREE" />
            <div
              style={{
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 78,
                lineHeight: 1.04,
                letterSpacing: "-0.05em",
                color: C.text,
              }}
            >
              Stop chasing
              <br />
              <span style={{ color: C.amber }}>channel width.</span>
            </div>
            <div style={{ fontFamily: F.sans, fontSize: 31, color: C.dim, lineHeight: 1.5 }}>
              The default is often the widest setting the router supports, because wider looks better
              on a box. In a building with neighbours, it usually is not.
            </div>
            <Note
              text="20 MHz on 2.4 is not a compromise. It is the only way to get three non-overlapping channels in a band that is 80 MHz wide."
              at={80}
              width={620}
            />
          </div>
        }
      />
    </Stage>
  );
};

const S53: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 24, 50);
  const x = 240 + 620 * p;
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 26 }}>
        <Kicker text="CHECKLIST · FOUR" at={0} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 78,
              letterSpacing: "-0.045em",
              color: C.text,
              lineHeight: 1.04,
            }}
          >
            Put the access point
            <br />
            <span style={{ color: C.pink }}>where the people are.</span>
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 19, color: C.faint, letterSpacing: "0.14em" }}>
            HEIGHT · LINE OF SIGHT · CENTRE OF TRAFFIC
          </div>
        </div>

        <svg width={FILM.safeW} height={470} viewBox="0 0 1680 470">
          <rect x={40} y={200} width={1600} height={220} rx={10} fill="rgba(18,20,28,0.5)" stroke={C.panelEdge} strokeWidth={2} />
          <line x1={40} y1={200} x2={1640} y2={200} stroke={C.panelEdge} strokeWidth={2} />
          <text x={70} y={440} fill={C.faint} style={{ fontFamily: F.mono, fontSize: 16, letterSpacing: "0.16em" }}>
            CABLE ENTRY
          </text>
          <circle cx={150} cy={420} r={18} fill={`${C.violet}33`} stroke={C.violet} strokeWidth={2} />
          <text x={150} y={426} textAnchor="middle" fill={C.violet} style={{ fontFamily: F.mono, fontSize: 13 }}>AP</text>

          <g opacity={0.35}>
            <circle cx={150} cy={420} r={150} fill="none" stroke={C.violet} strokeDasharray="6 8" />
            <circle cx={150} cy={420} r={260} fill="none" stroke={C.violet} strokeDasharray="6 8" />
          </g>

          <g transform={`translate(${x},120)`}>
            <circle r={160} fill={`${C.cyan}0A`} stroke={C.cyan} strokeWidth={1.5} strokeDasharray="5 9" />
            <circle r={90} fill={`${C.cyan}0A`} stroke={C.cyan} strokeWidth={1.5} strokeDasharray="5 9" />
            <rect x={-26} y={-14} width={52} height={28} rx={8} fill={C.cyan} />
            <line x1={0} y1={14} x2={0} y2={90} stroke={C.cyan} strokeWidth={2} />
            <text x={0} y={-34} textAnchor="middle" fill={C.cyan} style={{ fontFamily: F.mono, fontSize: 16, letterSpacing: "0.12em" }}>
              AP
            </text>
          </g>

          {[
            { x: 470, name: "SOFA" },
            { x: 840, name: "DESK" },
            { x: 1200, name: "TV" },
          ].map((o) => (
            <g key={o.name}>
              <rect x={o.x} y={330} width={170} height={58} rx={8} fill="rgba(255,255,255,0.05)" stroke={C.panelEdge} />
              <text x={o.x + 85} y={365} textAnchor="middle" fill={C.faint} style={{ fontFamily: F.mono, fontSize: 16, letterSpacing: "0.12em" }}>
                {o.name}
              </text>
            </g>
          ))}
        </svg>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontFamily: F.sans, fontSize: 31, color: C.dim, maxWidth: 980, lineHeight: 1.45 }}>
            The cable enters at the corner of the house. The access point does not have to live there.
            Height beats transmit power, and line of sight beats both.
          </div>
          <Note
            text="Every wall costs roughly 3 to 10 dB, depending on what it is made of. A ceiling mount avoids furniture and usually clears the worst of it."
            at={90}
            width={560}
          />
        </div>
      </div>
    </Stage>
  );
};

const S54: React.FC = () => {
  const frame = useCurrentFrame();
  const freed = prog(frame, 54, 28);
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 30 }}>
        <Kicker text="CHECKLIST · FIVE" at={0} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 78,
              letterSpacing: "-0.045em",
              color: C.text,
              lineHeight: 1.04,
            }}
          >
            Wire what never moves.
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 19, color: C.green, letterSpacing: "0.16em" }}>
            ONE LESS CLIENT · FOREVER
          </div>
        </div>

        <div style={{ display: "flex", gap: 40, alignItems: "stretch" }}>
          <div style={{ width: 760, padding: "28px", borderRadius: 16, backgroundColor: C.panel, border: `1px solid ${C.panelEdge}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontFamily: F.mono, fontSize: 20, color: C.violet, letterSpacing: "0.14em" }}>ROUTER</div>
              <div style={{ fontFamily: F.mono, fontSize: 16, color: C.faint }}>ETHERNET</div>
              <div style={{ fontFamily: F.mono, fontSize: 20, color: C.pink, letterSpacing: "0.14em" }}>TV</div>
            </div>
            <svg width={700} height={220} viewBox="0 0 700 220">
              <rect x={20} y={80} width={120} height={64} rx={10} fill={`${C.violet}18`} stroke={C.violet} />
              <rect x={560} y={60} width={120} height={100} rx={10} fill={`${C.pink}14`} stroke={C.pink} />
              <line x1={140} y1={112} x2={560} y2={112} stroke={C.green} strokeWidth={3} />
              <circle cx={220 + ((frame * 4) % 280)} cy={112} r={6} fill={C.green} />
              <text x={350} y={96} textAnchor="middle" fill={C.green} style={{ fontFamily: F.mono, fontSize: 17, letterSpacing: "0.12em" }}>
                WIRED · NO AIRTIME
              </text>
            </svg>
            <div style={{ fontFamily: F.sans, fontSize: 27, color: C.dim }}>
              A television on ethernet is one less conversation in the room, every second, permanently.
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontFamily: F.mono, fontSize: 18, color: C.faint, letterSpacing: "0.14em" }}>THE CHANNEL, AFTER</div>
            {[
              { name: "LAPTOP", w: 34, color: C.cyan },
              { name: "PHONE", w: 26, color: C.violet },
              { name: "TV", w: 20, color: C.pink, removed: true },
              { name: "PLUG", w: 20, color: C.amber },
            ].map((r) => (
              <div key={r.name} style={{ opacity: r.removed ? 1 - freed : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 17, marginBottom: 6 }}>
                  <span style={{ color: r.color }}>{r.name}</span>
                  <span style={{ color: C.faint }}>{r.removed ? (freed > 0.5 ? "GONE" : "20%") : `${r.w + (r.removed ? 0 : Math.round(freed * 5))}%`}</span>
                </div>
                <div style={{ height: 18, borderRadius: 5, backgroundColor: "#0B0D14", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${r.removed ? r.w * (1 - freed) : r.w + freed * 5}%`,
                      height: 18,
                      backgroundColor: r.color,
                      opacity: 0.8,
                    }}
                  />
                </div>
              </div>
            ))}
            <div style={{ fontFamily: F.mono, fontSize: 18, color: C.green, marginTop: 8, opacity: freed }}>
              +5% AIRTIME FOR EVERYONE ELSE
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
};

const Dial: React.FC<{ value: number; max: number; label: string; sub: string; color: string; at: number }> = ({
  value,
  max,
  label,
  sub,
  color,
  at,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 40);
  const angle = -90 + (value / max) * 180 * p;
  return (
    <div style={{ width: 700, padding: "26px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: prog(frame, at, 16) }}>
      <svg width={380} height={230} viewBox="0 0 240 150">
        <path d="M 30 120 A 90 90 0 0 1 210 120" fill="none" stroke="#1B1E27" strokeWidth={16} strokeLinecap="round" />
        <path
          d="M 30 120 A 90 90 0 0 1 210 120"
          fill="none"
          stroke={color}
          strokeWidth={16}
          strokeLinecap="round"
          strokeDasharray={283}
          strokeDashoffset={283 * (1 - (value / max) * p)}
        />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
          const a = (-180 + i * 22.5) * (Math.PI / 180);
          return (
            <line
              key={i}
              x1={120 + Math.cos(a) * 76}
              y1={120 + Math.sin(a) * 76}
              x2={120 + Math.cos(a) * 88}
              y2={120 + Math.sin(a) * 88}
              stroke={C.faint}
              strokeWidth={2}
            />
          );
        })}
        <g transform={`rotate(${angle} 120 120)`}>
          <line x1={120} y1={120} x2={120} y2={52} stroke={color} strokeWidth={4} strokeLinecap="round" />
          <circle cx={120} cy={120} r={7} fill={color} />
        </g>
        <text x={120} y={144} textAnchor="middle" fill={C.text} style={{ fontFamily: F.sans, fontSize: 26, fontWeight: 800 }}>
          {Math.round(value * p)}
        </text>
      </svg>
      <div style={{ fontFamily: F.mono, fontSize: 20, color, letterSpacing: "0.16em" }}>{label}</div>
      <div style={{ fontFamily: F.sans, fontSize: 20, color: C.faint }}>{sub}</div>
    </div>
  );
};

const S55: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 20 }}>
        <Kicker text="BEFORE YOU CHANGE ANYTHING" at={0} />
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 78,
            letterSpacing: "-0.045em",
            color: C.text,
            lineHeight: 1.04,
          }}
        >
          Measure. Then blame the right thing.
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 80 }}>
          <Dial value={940} max={1000} label="WIRED" sub="into the router" color={C.cyan} at={26} />
          <div style={{ display: "flex", alignItems: "center", fontFamily: F.mono, fontSize: 40, color: C.faint }}>vs</div>
          <Dial value={210} max={1000} label="WI-FI" sub="same room · same laptop" color={C.amber} at={54} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontFamily: F.sans, fontSize: 31, color: C.dim, maxWidth: 900, lineHeight: 1.45 }}>
            If the wired number is fine and the wireless number is not, the problem is the air, not
            your provider. That single test eliminates half the things you were about to buy.
          </div>
          <Note
            text="Run the wired test first. Then the wireless test in the same room. Same server, same time of day."
            at={90}
            width={520}
          />
        </div>
      </div>
    </Stage>
  );
};

const S56: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 24, 50);
  const points = Array.from({ length: 61 }, (_, i) => {
    const rate = 60;
    const base = i < 8 || i > 52 ? 2 : 2 + (i % 7 === 0 ? 180 : i % 3 === 0 ? 60 : 8);
    return { x: 80 + i * rate, y: 300 - base * 0.9 };
  });
  const path = points.map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x} ${pt.y}`).join(" ");
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 24 }}>
        <Kicker text="THE SECOND MEASUREMENT" at={0} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 78,
              letterSpacing: "-0.045em",
              color: C.text,
              lineHeight: 1.04,
            }}
          >
            Ping the router
            <br />
            <span style={{ color: C.amber }}>while the house is busy.</span>
          </div>
          <Stat value="200" unit="ms" label="REPLY TIME · UNDER LOAD" color={C.amber} size={100} at={40} />
        </div>

        <svg width={FILM.safeW} height={360} viewBox="0 0 1680 360">
          {[100, 200, 300].map((y) => (
            <line key={y} x1={80} y1={y} x2={1600} y2={y} stroke="rgba(255,255,255,0.06)" />
          ))}
          <line x1={80} y1={300} x2={1600} y2={300} stroke={C.panelEdge} />
          <line x1={80} y1={80} x2={1600} y2={80} stroke={`${C.red}66`} strokeDasharray="8 10" />
          <text x={1610} y={84} fill={C.red} style={{ fontFamily: F.mono, fontSize: 15 }}>CALL BREAKS</text>
          <path
            d={path}
            fill="none"
            stroke={C.amber}
            strokeWidth={3}
            strokeLinejoin="round"
            strokeDasharray={3000}
            strokeDashoffset={3000 * (1 - p)}
          />
          <text x={80} y={335} fill={C.faint} style={{ fontFamily: F.mono, fontSize: 17, letterSpacing: "0.12em" }}>
            IDLE
          </text>
          <text x={820} y={335} fill={C.faint} style={{ fontFamily: F.mono, fontSize: 17, letterSpacing: "0.12em" }}>
            HOUSE IS BUSY
          </text>
          <text x={1500} y={335} fill={C.faint} style={{ fontFamily: F.mono, fontSize: 17, letterSpacing: "0.12em" }}>
            IDLE
          </text>
        </svg>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontFamily: F.sans, fontSize: 31, color: C.dim, maxWidth: 980, lineHeight: 1.45 }}>
            Two milliseconds idle. Two hundred under load. That is not a bandwidth problem. That is a
            queue — and a queue is a thing you can fix.
          </div>
          <Note
            text="Ping the access point, not the internet, so the measurement is your Wi-Fi and nothing else. Repeat it while a video is playing."
            at={96}
            width={500}
          />
        </div>
      </div>
    </Stage>
  );
};

export const ACT7: Record<string, React.ReactNode> = {
  s50: <S50 />,
  s51: <S51 />,
  s52: <S52 />,
  s53: <S53 />,
  s54: <S54 />,
  s55: <S55 />,
  s56: <S56 />,
};
