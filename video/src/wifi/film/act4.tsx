import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { AirtimeRail, CLAMP, FILM, Kicker, Stage, prog } from "./kit";
import { Note, Split, Stat, Timeline } from "./bits";

/* ACT 4 - why the slow device wins. The argument, not the fix. */

const S23: React.FC = () => {
  const frame = useCurrentFrame();
  const terms = [
    { text: "FAIR RULE", color: C.cyan },
    { text: "+", color: C.faint },
    { text: "UNEQUAL DEVICES", color: C.amber },
    { text: "=", color: C.faint },
    { text: "UNFAIR TIME", color: C.red },
  ];
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 46 }}>
        <Kicker text="NOT A BUG" at={0} />
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 78,
            letterSpacing: "-0.045em",
            color: C.text,
            textAlign: "center",
            lineHeight: 1.12,
            maxWidth: 1380,
          }}
        >
          It is the direct consequence of a fair rule
          <br />
          applied to unequal devices.
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 12 }}>
          {terms.map((t, i) => (
            <div
              key={t.text}
              style={{
                fontFamily: F.mono,
                fontSize: t.text.length === 1 ? 54 : 30,
                letterSpacing: t.text.length === 1 ? "0" : "0.14em",
                color: t.color,
                opacity: prog(frame, 40 + i * 12, 16),
                transform: `translateY(${(1 - prog(frame, 40 + i * 12, 16)) * 18}px)`,
                border: t.text.length === 1 ? "none" : `1px solid ${t.color}44`,
                borderRadius: 12,
                padding: t.text.length === 1 ? 0 : "18px 24px",
                backgroundColor: t.text.length === 1 ? "transparent" : `${t.color}0C`,
              }}
            >
              {t.text}
            </div>
          ))}
        </div>
        <div style={{ fontFamily: F.sans, fontSize: 32, color: C.dim, maxWidth: 1180, textAlign: "center", lineHeight: 1.5 }}>
          Nobody configured this. Nobody is cheating. The rule that keeps the room orderly is the
          same rule that hands the room to the slowest talker.
        </div>
      </div>
    </Stage>
  );
};

const S24: React.FC = () => {
  const frame = useCurrentFrame();
  const cols = [
    { name: "LAPTOP", color: C.cyan },
    { name: "PHONE", color: C.violet },
    { name: "TV", color: C.pink },
    { name: "PLUG", color: C.amber },
  ];
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 38 }}>
        <Kicker text="WHAT THE PROTOCOL PROMISES" at={0} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 88,
              letterSpacing: "-0.05em",
              color: C.text,
              lineHeight: 1.04,
            }}
          >
            One packet.
            <br />
            <span style={{ color: C.cyan }}>One chance.</span>
          </div>
          <div style={{ fontFamily: F.sans, fontSize: 31, color: C.dim, maxWidth: 600, lineHeight: 1.45 }}>
            Every device in the room gets the same shot at the next slot. No device is more equal
            than another.
          </div>
        </div>

        <div style={{ display: "flex", gap: 34 }}>
          {cols.map((c, ci) => (
            <div key={c.name} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: F.mono, fontSize: 20, letterSpacing: "0.16em", color: c.color }}>
                  {c.name}
                </span>
                <span style={{ fontFamily: F.mono, fontSize: 18, color: C.faint }}>6 pkts</span>
              </div>
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    height: 46,
                    borderRadius: 8,
                    backgroundColor: `${c.color}22`,
                    border: `1px solid ${c.color}55`,
                    opacity: prog(frame, 20 + ci * 8 + i * 4, 12),
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <Note
            text="Six packets each is not a quota. It is what equal access looks like when every device happens to have six packets to send."
            at={90}
            width={1200}
          />
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 20,
              color: C.cyan,
              letterSpacing: "0.18em",
              opacity: prog(frame, 100, 14),
            }}
          >
            EQUAL ATTEMPTS · EQUAL PACKETS
          </div>
        </div>
      </div>
    </Stage>
  );
};

const S25: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 30, 30);
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 34 }}>
        <Kicker text="THE SWITCH" at={0} />
        <div style={{ display: "flex", gap: 44 }}>
          <div style={{ flex: 1, padding: "30px 34px", borderRadius: 18, backgroundColor: C.panel, border: `1px solid ${C.cyan}33` }}>
            <div style={{ fontFamily: F.mono, fontSize: 20, color: C.cyan, letterSpacing: "0.18em", marginBottom: 22 }}>
              FAIR IN PACKETS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[C.cyan, C.violet, C.pink, C.amber].map((col, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 90, fontFamily: F.mono, fontSize: 17, color: C.faint }}>
                    {["LAP", "PHN", "TV", "PLUG"][i]}
                  </div>
                  <div style={{ flex: 1, height: 26, borderRadius: 5, backgroundColor: `${col}33`, border: `1px solid ${col}55` }} />
                </div>
              ))}
            </div>
            <div style={{ fontFamily: F.sans, fontSize: 26, color: C.dim, marginTop: 22 }}>
              Same number of turns.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontFamily: F.mono,
              fontSize: 44,
              color: C.faint,
              transform: `rotate(${p * 90}deg)`,
            }}
          >
            →
          </div>

          <div
            style={{
              flex: 1,
              padding: "30px 34px",
              borderRadius: 18,
              backgroundColor: C.panel,
              border: `1px solid ${C.amber}33`,
              transform: `rotate(${-1.4 * p}deg)`,
            }}
          >
            <div style={{ fontFamily: F.mono, fontSize: 20, color: C.amber, letterSpacing: "0.18em", marginBottom: 22 }}>
              UNFAIR IN TIME
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { name: "LAP", frac: 0.03, color: C.cyan },
                { name: "PHN", frac: 0.08, color: C.violet },
                { name: "TV", frac: 0.18, color: C.pink },
                { name: "PLUG", frac: 1, color: C.amber },
              ].map((r) => (
                <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 90, fontFamily: F.mono, fontSize: 17, color: C.faint }}>{r.name}</div>
                  <div style={{ flex: 1, height: 26, borderRadius: 5, backgroundColor: "#0B0D14", overflow: "hidden" }}>
                    <div style={{ width: `${r.frac * 100 * p}%`, height: 26, backgroundColor: r.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: F.sans, fontSize: 26, color: C.dim, marginTop: 22 }}>
              Very different amounts of time.
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 40, color: C.text }}>
            The rule is fair. <span style={{ color: C.red }}>The outcome is not.</span>
          </div>
          <Note text="Equal chance per packet × unequal cost per packet = unequal time." at={90} width={560} />
        </div>
      </div>
    </Stage>
  );
};

const S26: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 30 }}>
        <Kicker text="THE ARITHMETIC" at={0} />
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 76,
            letterSpacing: "-0.045em",
            color: C.text,
          }}
        >
          Time is bytes divided by rate.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {[
            { rate: "1 Mbps", bits: "12,000 bits", result: "12 ms", color: C.amber, at: 30 },
            { rate: "1,100 Mbps", bits: "12,000 bits", result: "0.011 ms", color: C.cyan, at: 70 },
          ].map((r) => (
            <div
              key={r.rate}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "26px 32px",
                borderRadius: 16,
                backgroundColor: C.panel,
                border: `1px solid ${r.color}33`,
                opacity: prog(frame, r.at, 18),
              }}
            >
              <div style={{ width: 280, fontFamily: F.mono, fontSize: 26, color: C.dim }}>{r.bits}</div>
              <div style={{ fontFamily: F.mono, fontSize: 30, color: C.faint }}>÷</div>
              <div style={{ width: 300, fontFamily: F.mono, fontSize: 26, color: r.color }}>{r.rate}</div>
              <div style={{ fontFamily: F.mono, fontSize: 30, color: C.faint }}>=</div>
              <div
                style={{
                  fontFamily: F.sans,
                  fontWeight: 800,
                  fontSize: 64,
                  letterSpacing: "-0.03em",
                  color: r.color,
                }}
              >
                {r.result}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Note
            text="1,500 bytes = 12,000 bits. The fast figure ignores the fixed cost of preamble, acknowledgement and backoff, which is why the real ratio lands near 100× rather than 1,100×."
            at={100}
            width={1280}
          />
          <Stat value="≈100×" label="PER FRAME" color={C.red} size={92} at={120} />
        </div>
      </div>
    </Stage>
  );
};

const S27: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 32 }}>
        <Kicker text="WHILE THE PLUG TALKS" at={0} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 78,
              letterSpacing: "-0.045em",
              color: C.text,
              lineHeight: 1.05,
            }}
          >
            A transmission is a lock.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width={44} height={52} viewBox="0 0 34 42">
              <path d="M9 19v-7a8 8 0 0 1 16 0v7" fill="none" stroke={C.amber} strokeWidth={3.5} />
              <rect x={3} y={19} width={28} height={20} rx={5} fill={C.amber} />
            </svg>
            <div style={{ fontFamily: F.mono, fontSize: 20, color: C.amber, letterSpacing: "0.18em" }}>
              CHANNEL LOCKED
            </div>
          </div>
        </div>

        <Timeline
          segs={[
            { ms: 120, color: "#242833", label: "BACKOFF" },
            { ms: 12, color: C.amber, label: "PLUG" },
            { ms: 120, color: "#242833", label: "SILENCE" },
            { ms: 1, color: C.green, label: "" },
          ]}
          totalMs={253}
          height={92}
          at={20}
          cursor
          axis
          axisLabel="ms"
        />

        <div style={{ display: "flex", gap: 22 }}>
          {[
            { n: "LAPTOP", color: C.cyan, wait: "HAS DATA · WAITING" },
            { n: "PHONE", color: C.violet, wait: "HAS DATA · WAITING" },
            { n: "TV", color: C.pink, wait: "HAS DATA · WAITING" },
          ].map((d, i) => (
            <div
              key={d.n}
              style={{
                flex: 1,
                padding: "24px 26px",
                borderRadius: 14,
                backgroundColor: C.panel,
                border: `1px solid ${C.panelEdge}`,
                opacity: prog(frame, 90 + i * 10, 14),
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: F.mono, fontSize: 20, color: d.color, letterSpacing: "0.14em" }}>{d.n}</span>
                <span style={{ fontFamily: F.mono, fontSize: 17, color: C.faint }}>PAUSED</span>
              </div>
              <div style={{ fontFamily: F.sans, fontSize: 26, color: C.dim, marginTop: 14 }}>{d.wait}</div>
              <div style={{ height: 6, borderRadius: 3, backgroundColor: "#0B0D14", marginTop: 16, overflow: "hidden" }}>
                <div style={{ width: `${interpolate(frame % 90, [0, 90], [10, 88], CLAMP)}%`, height: 6, backgroundColor: d.color, opacity: 0.5 }} />
              </div>
            </div>
          ))}
        </div>
        <Note
          text="Not politeness. A frame in progress reserves the medium, and every other radio can hear it is busy. The queue grows while the channel is occupied."
          at={120}
          width={1300}
        />
      </div>
    </Stage>
  );
};

const S28: React.FC = () => {
  const frame = useCurrentFrame();
  const nav = prog(frame, 40, 30);
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 34 }}>
        <Kicker text="THE NETWORK ALLOCATION VECTOR" at={0} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 84,
              letterSpacing: "-0.05em",
              color: C.text,
              lineHeight: 1.04,
            }}
          >
            Everyone waits.
            <br />
            <span style={{ color: C.amber }}>On a timer they cannot see.</span>
          </div>
          <Stat value="12.4" unit="ms" label="NAV · RESERVED" color={C.amber} size={110} at={50} />
        </div>

        <div style={{ position: "relative", width: FILM.safeW, paddingTop: 54 }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: `${28 + nav * 34}%`,
              height: 26,
              borderRadius: 6,
              border: `2px solid ${C.amber}`,
              backgroundColor: `${C.amber}18`,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 12,
                top: -34,
                fontFamily: F.mono,
                fontSize: 19,
                color: C.amber,
                letterSpacing: "0.16em",
                whiteSpace: "nowrap",
              }}
            >
              NAV · DO NOT TRANSMIT
            </div>
          </div>
          <Timeline
            segs={[
              { ms: 14, color: C.amber, label: "FRAME" },
              { ms: 1, color: C.green, label: "" },
              { ms: 180, color: "#1B1E27", label: "MEDIUM IDLE" },
            ]}
            totalMs={195}
            height={92}
            at={20}
            cursor
            axis
            axisLabel="ms"
          />
        </div>

        <div style={{ display: "flex", gap: 40 }}>
          <div style={{ flex: 1, fontFamily: F.sans, fontSize: 32, color: C.dim, lineHeight: 1.45 }}>
            The frame carries a duration field. Every device that hears it sets a countdown for that
            long, then waits one more gap. The wait is not congestion. It is the protocol doing its
            job.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 520 }}>
            {["LAPTOP · paused", "PHONE · paused", "TV · paused"].map((t, i) => (
              <div
                key={t}
                style={{
                  fontFamily: F.mono,
                  fontSize: 19,
                  color: C.faint,
                  letterSpacing: "0.1em",
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: `1px solid ${C.panelEdge}`,
                  paddingBottom: 10,
                  opacity: prog(frame, 80 + i * 8, 12),
                }}
              >
                <span>{t}</span>
                <span>NAV</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Stage>
  );
};

const S29: React.FC = () => {
  const frame = useCurrentFrame();
  const R = 168;
  const circ = 2 * Math.PI * R;
  const p = prog(frame, 20, 46);
  return (
    <Stage>
      <Split
        left={
          <svg width={520} height={520} viewBox="0 0 520 520">
            <circle cx={260} cy={260} r={R} fill="none" stroke="#1A1D26" strokeWidth={30} />
            <circle
              cx={260}
              cy={260}
              r={R}
              fill="none"
              stroke={C.amber}
              strokeWidth={30}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - 0.8 * p)}
              transform="rotate(-90 260 260)"
            />
            <text x={260} y={238} textAnchor="middle" fill={C.text} style={{ fontFamily: F.sans, fontSize: 58, fontWeight: 800 }}>
              1000 ms
            </text>
            <text x={260} y={282} textAnchor="middle" fill={C.amber} style={{ fontFamily: F.mono, fontSize: 22, letterSpacing: "0.18em" }}>
              800 ms SPENT
            </text>
            <text x={260} y={470} textAnchor="middle" fill={C.faint} style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: "0.22em" }}>
              ONE SECOND · NO REFUNDS
            </text>
          </svg>
        }
        right={
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <Kicker text="THE SCHEDULE" />
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
              That time
              <br />
              does not
              <br />
              <span style={{ color: C.amber }}>come back.</span>
            </div>
            <div style={{ fontFamily: F.sans, fontSize: 33, color: C.dim, lineHeight: 1.45 }}>
              There is no catch-up pass at the end of the second. The channel is a schedule, and the
              schedule was spent on the slowest client.
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontFamily: F.mono,
                fontSize: 19,
                color: C.red,
                letterSpacing: "0.14em",
                opacity: prog(frame, 110, 16),
              }}
            >
              <span style={{ textDecoration: "line-through" }}>NEXT SECOND WILL BE BETTER</span>
              <span>·</span>
              <span>IT WILL NOT</span>
            </div>
          </div>
        }
      />
    </Stage>
  );
};

const S30: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 26, 46);
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 30 }}>
        <Kicker text="THE OBVIOUS FIX" at={0} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 82,
              letterSpacing: "-0.045em",
              color: C.text,
              lineHeight: 1.04,
            }}
          >
            Move closer.
            <br />
            <span style={{ color: C.red }}>Watch it not help.</span>
          </div>
          <div style={{ fontFamily: F.sans, fontSize: 30, color: C.dim, maxWidth: 560, lineHeight: 1.45 }}>
            Your link improves. Your share of the room does not.
          </div>
        </div>

        <svg width={FILM.safeW} height={330} viewBox="0 0 1680 330">
          {[80, 140, 200, 260].map((y) => (
            <line key={y} x1={100} y1={y} x2={1600} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
          ))}
          <line x1={100} y1={40} x2={100} y2={280} stroke={C.panelEdge} strokeWidth={2} />
          <line x1={100} y1={280} x2={1600} y2={280} stroke={C.panelEdge} strokeWidth={2} />
          <path
            d="M100 270 C 420 268, 700 210, 900 120 S 1300 70, 1600 58"
            fill="none"
            stroke={C.cyan}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={1700}
            strokeDashoffset={1700 * (1 - p)}
          />
          <path
            d="M100 200 L 1600 200"
            fill="none"
            stroke={C.amber}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={1500}
            strokeDashoffset={1500 * (1 - prog(frame, 60, 40))}
          />
          <text x={118} y={168} fill={C.cyan} style={{ fontFamily: F.mono, fontSize: 20, letterSpacing: "0.12em" }}>
            YOUR LINK RATE
          </text>
          <text x={118} y={236} fill={C.amber} style={{ fontFamily: F.mono, fontSize: 20, letterSpacing: "0.12em" }}>
            YOUR SHARE OF AIRTIME
          </text>
          <text x={1520} y={300} fill={C.faint} style={{ fontFamily: F.mono, fontSize: 17 }}>
            CLOSER TO THE ROUTER →
          </text>
        </svg>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 16 }}>
            {["2 BARS", "3 BARS", "4 BARS"].map((b, i) => (
              <div
                key={b}
                style={{
                  fontFamily: F.mono,
                  fontSize: 18,
                  color: i === 2 ? C.cyan : C.faint,
                  border: `1px solid ${i === 2 ? C.cyan : C.panelEdge}`,
                  borderRadius: 8,
                  padding: "8px 12px",
                }}
              >
                {b}
              </div>
            ))}
          </div>
          <Note
            text="The plug is still twelve milliseconds per frame. Your faster link changes your half of the conversation, not its length."
            at={90}
            width={900}
          />
        </div>
      </div>
    </Stage>
  );
};

const S31: React.FC = () => {
  const frame = useCurrentFrame();
  const bars = prog(frame, 20, 30);
  return (
    <Stage>
      <Split
        left={
          <div style={{ display: "flex", gap: 50, alignItems: "center" }}>
            <div
              style={{
                width: 300,
                height: 560,
                borderRadius: 40,
                border: `3px solid ${C.panelEdge}`,
                backgroundColor: "#0B0D14",
                padding: 26,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 18, color: C.dim }}>
                <span>9:41</span>
                <span>5G</span>
              </div>
              <div style={{ marginTop: 90, display: "flex", alignItems: "flex-end", gap: 8, height: 90 }}>
                {[24, 38, 52, 66].map((h, i) => (
                  <div
                    key={h}
                    style={{
                      flex: 1,
                      height: h * bars,
                      borderRadius: 4,
                      backgroundColor: i < 4 ? C.cyan : C.faint,
                      opacity: bars > (i + 1) / 5 ? 1 : 0.25,
                    }}
                  />
                ))}
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 18, color: C.cyan, letterSpacing: "0.18em", textAlign: "center" }}>
                FULL BARS
              </div>
              <div style={{ marginTop: 40, fontFamily: F.sans, fontSize: 30, color: C.text, textAlign: "center", lineHeight: 1.3 }}>
                Your Wi-Fi
                <br />
                looks perfect.
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 430 }}>
              <div style={{ fontFamily: F.mono, fontSize: 18, color: C.faint, letterSpacing: "0.18em", marginBottom: 4 }}>
                CHANNEL QUEUE
              </div>
              {["LAPTOP", "TV", "PHONE", "YOU"].map((n, i) => (
                <div
                  key={n}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    padding: "16px 20px",
                    borderRadius: 10,
                    backgroundColor: n === "YOU" ? `${C.red}12` : C.panel,
                    border: `1px solid ${n === "YOU" ? `${C.red}66` : C.panelEdge}`,
                  }}
                >
                  <div style={{ fontFamily: F.mono, fontSize: 18, color: C.faint, width: 28 }}>{i + 1}</div>
                  <div style={{ fontFamily: F.mono, fontSize: 20, color: n === "YOU" ? C.red : C.dim, letterSpacing: "0.14em" }}>{n}</div>
                  <div style={{ marginLeft: "auto", fontFamily: F.mono, fontSize: 17, color: C.faint }}>
                    {n === "YOU" ? "LAST" : "AHEAD"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
        right={
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <Kicker text="THE SIGNAL BARS TRAP" />
            <div
              style={{
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 80,
                lineHeight: 1.04,
                letterSpacing: "-0.05em",
                color: C.text,
              }}
            >
              Bars measure
              <br />
              the wrong thing.
            </div>
            <div style={{ fontFamily: F.sans, fontSize: 32, color: C.dim, lineHeight: 1.5 }}>
              They describe how well your radio hears the access point. They say nothing about how
              much of the channel is left for you.
            </div>
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 20,
                color: C.amber,
                letterSpacing: "0.16em",
                borderTop: `1px solid ${C.panelEdge}`,
                paddingTop: 20,
                opacity: prog(frame, 90, 16),
              }}
            >
              SIGNAL STRENGTH ≠ QUEUE POSITION
            </div>
          </div>
        }
      />
    </Stage>
  );
};

const S32: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 20, 40);
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 34 }}>
        <Kicker text="THE OTHER OBVIOUS FIX" at={0} />
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 80,
            letterSpacing: "-0.045em",
            color: C.text,
            lineHeight: 1.05,
          }}
        >
          A faster plan cannot widen the air.
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 30 }}>
          <div style={{ width: 150, fontFamily: F.mono, fontSize: 19, color: C.faint, letterSpacing: "0.12em" }}>
            FIBRE
            <div style={{ fontSize: 30, color: C.cyan, marginTop: 8 }}>1 Gbps</div>
          </div>
          <div style={{ flex: 1, height: 120, borderRadius: 12, backgroundColor: `${C.cyan}18`, border: `1px solid ${C.cyan}44`, position: "relative", overflow: "hidden" }}>
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: 50,
                  left: `${((frame * 2 + i * 120) % 900) / 9}%`,
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: C.cyan,
                  opacity: 0.8,
                }}
              />
            ))}
          </div>
          <div style={{ width: 190, textAlign: "center", fontFamily: F.mono, fontSize: 34, color: C.violet }}>ROUTER</div>
          <div style={{ flex: 1, height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                width: "100%",
                height: 26 + 20 * (1 - p),
                borderRadius: 8,
                backgroundColor: `${C.amber}22`,
                border: `1px solid ${C.amber}55`,
                position: "relative",
              }}
            >
              <div style={{ position: "absolute", top: -42, left: 0, right: 0, textAlign: "center", fontFamily: F.mono, fontSize: 18, color: C.amber, letterSpacing: "0.14em", whiteSpace: "nowrap" }}>
                THE AIR · SHARED
              </div>
            </div>
          </div>
          <div style={{ width: 200, fontFamily: F.mono, fontSize: 19, color: C.faint, textAlign: "right" }}>
            DEVICES
            <div style={{ fontSize: 30, color: C.amber, marginTop: 8 }}>≈200 Mbps</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 44, marginTop: 24 }}>
          <div style={{ flex: 1, fontFamily: F.sans, fontSize: 33, color: C.dim, lineHeight: 1.45 }}>
            Upgrading the plan makes the pipe wider on the far side of the router. Every device still
            leaves through the same narrow, shared, half-duplex radio.
          </div>
          <Note
            text="The bottleneck is not the fibre coming into the house. It is the air between your devices and the access point."
            at={80}
            width={760}
          />
        </div>
      </div>
    </Stage>
  );
};

export const ACT4: Record<string, React.ReactNode> = {
  s23: <S23 />,
  s24: <S24 />,
  s25: <S25 />,
  s26: <S26 />,
  s27: <S27 />,
  s28: <S28 />,
  s29: <S29 />,
  s30: <S30 />,
  s31: <S31 />,
  s32: <S32 />,
};
