import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { AirtimeRail, CLAMP, FILM, Kicker, Stage, prog } from "./kit";
import { CheckRow, Note, Split, Stat, Timeline, Toggle } from "./bits";

/* ACT 5 - the fixes. Ordered by impact, with the two caveats that matter:
   mesh backhaul and 6 GHz. */

const S33: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 26 }}>
        <Kicker text="THE FIXES" at={0} />
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 86,
            letterSpacing: "-0.05em",
            color: C.text,
            lineHeight: 1.04,
          }}
        >
          Four things.
          <br />
          <span style={{ color: C.cyan }}>In order of impact.</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 10 }}>
          <CheckRow n={1} text="Airtime fairness" detail="schedule time, not packets" color={C.cyan} at={30} state="START HERE" />
          <CheckRow n={2} text="Band steering" detail="move capable devices to 5 or 6 GHz" color={C.violet} at={50} state="HIGH" />
          <CheckRow n={3} text="Channel width" detail="stop defaulting to 80 MHz" color={C.amber} at={70} state="MEDIUM" />
          <CheckRow n={4} text="Placement and 2.4 GHz" detail="put IoT where it belongs" color={C.pink} at={90} state="MEDIUM" />
        </div>
        <Note
          text="None of these cost money. Two of them are usually off by default, and one is usually set wrong out of the box."
          at={120}
          width={1200}
        />
      </div>
    </Stage>
  );
};

const S34: React.FC = () => {
  const frame = useCurrentFrame();
  const t = prog(frame, 56, 46);
  const plug = 79.2 - (79.2 - 25) * t;
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 34 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Kicker text="FIX ONE" at={0} />
          <Toggle on={t > 0.4} at={56} label={t > 0.4 ? "AIRTIME FAIRNESS ON" : "AIRTIME FAIRNESS OFF"} />
        </div>
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
            Schedule time.
            <br />
            <span style={{ color: C.green }}>Not packets.</span>
          </div>
          <div style={{ fontFamily: F.sans, fontSize: 30, color: C.dim, maxWidth: 560, lineHeight: 1.45 }}>
            The access point hands each client a slice of the second, and lets it spend that slice
            however it can.
          </div>
        </div>

        <div style={{ position: "relative", height: 150, borderRadius: 12, backgroundColor: "#0B0D14", border: `1px solid ${C.panelEdge}`, display: "flex", overflow: "hidden" }}>
          <div style={{ width: `${plug}%`, height: 150, backgroundColor: C.amber, opacity: 0.85 }} />
          <div style={{ flex: 1, height: 150, backgroundColor: `${C.cyan}55` }} />
          {[25, 50, 75].map((m) => (
            <div key={m} style={{ position: "absolute", left: `${m}%`, top: 0, bottom: 0, width: 2, backgroundColor: "rgba(255,255,255,0.35)" }} />
          ))}
          <div style={{ position: "absolute", left: 22, top: 20, fontFamily: F.mono, fontSize: 20, color: "rgba(0,0,0,0.7)", letterSpacing: "0.16em" }}>
            {t < 0.5 ? "PER PACKET" : "PER TIME SLICE"}
          </div>
          <div style={{ position: "absolute", right: 22, bottom: 18, fontFamily: F.mono, fontSize: 20, color: "rgba(0,0,0,0.65)", letterSpacing: "0.16em" }}>
            {Math.round(plug)}% TO THE PLUG
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ fontFamily: F.mono, fontSize: 19, color: C.amber }}>PLUG · FEWER, LONGER FRAMES</div>
            <div style={{ fontFamily: F.mono, fontSize: 19, color: C.cyan }}>OTHERS · MORE, SHORTER FRAMES</div>
          </div>
          <Note
            text="The plug is not cut off. It gets a quarter of the second, which is still far more than a smart plug needs."
            at={120}
            width={760}
          />
        </div>
      </div>
    </Stage>
  );
};

const S35: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    { name: "LAPTOP", pkts: "2,500", rate: "120 Mbps", color: C.cyan },
    { name: "PHONE", pkts: "1,470", rate: "70 Mbps", color: C.violet },
    { name: "TV", pkts: "750", rate: "36 Mbps", color: C.pink },
    { name: "PLUG", pkts: "20", rate: "240 kbps", color: C.amber },
  ];
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 32 }}>
        <Kicker text="FIX ONE · WHAT IT LOOKS LIKE" at={0} />
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 80,
            letterSpacing: "-0.045em",
            color: C.text,
            lineHeight: 1.04,
          }}
        >
          Same time. <span style={{ color: C.green }}>Different packet counts.</span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {rows.map((r, i) => (
            <div
              key={r.name}
              style={{
                flex: 1,
                padding: "26px 28px",
                borderRadius: 16,
                backgroundColor: C.panel,
                border: `1px solid ${r.color}44`,
                opacity: prog(frame, 20 + i * 12, 16),
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: r.color }} />
                <div style={{ fontFamily: F.mono, fontSize: 20, color: r.color, letterSpacing: "0.14em" }}>{r.name}</div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 20 }}>
                <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 64, letterSpacing: "-0.04em", color: C.text }}>
                  {r.pkts}
                </div>
                <div style={{ fontFamily: F.mono, fontSize: 17, color: C.faint }}>PKTS</div>
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 18, color: C.dim, marginTop: 8 }}>{r.rate}</div>
              <div style={{ marginTop: 18, height: 8, borderRadius: 4, backgroundColor: "#0B0D14", overflow: "hidden" }}>
                <div style={{ width: `${25 * prog(frame, 30 + i * 12, 20)}%`, height: 8, backgroundColor: r.color }} />
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 16, color: C.faint, marginTop: 8, letterSpacing: "0.12em" }}>
                250 ms SLICE
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 40 }}>
          <div style={{ flex: 1, fontFamily: F.sans, fontSize: 33, color: C.dim, lineHeight: 1.45 }}>
            The plug still gets twenty frames a second. A smart plug needs about fifty kilobits a
            second. It now has two hundred and forty, and nobody is waiting behind it.
          </div>
          <Note
            text="This is what 'fair' should mean in a shared medium: equal access to time, not equal access to a queue that only counts packets."
            at={100}
            width={700}
          />
        </div>
      </div>
    </Stage>
  );
};

const S36: React.FC = () => {
  const frame = useCurrentFrame();
  const move = prog(frame, 46, 40);
  const migrators = [
    { name: "PHONE", color: C.cyan, y: 110 },
    { name: "LAPTOP", color: C.violet, y: 220 },
    { name: "TV", color: C.pink, y: 330 },
  ];
  const stay = [
    { name: "PLUG", color: C.amber, y: 120 },
    { name: "BULB", color: C.amber, y: 220 },
    { name: "SENSOR", color: C.amber, y: 320 },
  ];
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 30 }}>
        <Kicker text="FIX TWO" at={0} />
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
            Move what can move
            <br />
            <span style={{ color: C.violet }}>to the quiet band.</span>
          </div>
          <div style={{ fontFamily: F.sans, fontSize: 30, color: C.dim, maxWidth: 560, lineHeight: 1.45 }}>
            Five and six gigahertz have more spectrum and fewer neighbours. Old IoT gear cannot go.
          </div>
        </div>

        <div style={{ display: "flex", gap: 40 }}>
          {[
            { band: "2.4 GHz", sub: "crowded · long range", color: C.amber, x: 0 },
            { band: "5 / 6 GHz", sub: "wider · shorter range", color: C.violet, x: 1 },
          ].map((b) => (
            <div
              key={b.band}
              style={{
                flex: 1,
                height: 430,
                borderRadius: 18,
                border: `1px solid ${b.color}33`,
                backgroundColor: C.panel,
                padding: 28,
                boxSizing: "border-box",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ fontFamily: F.mono, fontSize: 24, color: b.color, letterSpacing: "0.16em" }}>{b.band}</div>
              <div style={{ fontFamily: F.mono, fontSize: 17, color: C.faint, marginTop: 6 }}>{b.sub}</div>

              {b.x === 0
                ? stay.map((d) => (
                    <div
                      key={d.name}
                      style={{
                        position: "absolute",
                        left: 40,
                        top: d.y,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: d.color }} />
                      <div style={{ fontFamily: F.mono, fontSize: 18, color: C.dim, letterSpacing: "0.12em" }}>{d.name}</div>
                    </div>
                  ))
                : migrators.map((d) => (
                    <div
                      key={d.name}
                      style={{
                        position: "absolute",
                        left: 40 + 260 * move,
                        top: d.y,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        opacity: 0.35 + 0.65 * move,
                      }}
                    >
                      <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: d.color }} />
                      <div style={{ fontFamily: F.mono, fontSize: 18, color: C.dim, letterSpacing: "0.12em" }}>{d.name}</div>
                    </div>
                  ))}

              {b.x === 0
                ? migrators.map((d) => (
                    <div
                      key={`g-${d.name}`}
                      style={{
                        position: "absolute",
                        left: 40,
                        top: d.y,
                        width: 260,
                        opacity: 1 - move,
                      }}
                    >
                      <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: d.color, marginBottom: 8 }} />
                    </div>
                  ))
                : null}

              <div style={{ position: "absolute", left: 28, right: 28, bottom: 26, height: 10, borderRadius: 5, backgroundColor: "#0B0D14", overflow: "hidden" }}>
                <div
                  style={{
                    width: b.x === 0 ? "92%" : `${20 + 64 * move}%`,
                    height: 10,
                    backgroundColor: b.color,
                    opacity: 0.6,
                  }}
                />
              </div>
              <div style={{ position: "absolute", right: 28, bottom: 46, fontFamily: F.mono, fontSize: 16, color: C.faint }}>
                {b.x === 0 ? "9 CLIENTS + 4 NEIGHBOURS" : "3 CLIENTS · CLEAN"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Stage>
  );
};

const S37: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    { w: "20 MHz", rate: "286", noise: "1×", color: C.green, frac: 0.12 },
    { w: "40 MHz", rate: "573", noise: "2×", color: C.cyan, frac: 0.24 },
    { w: "80 MHz", rate: "1201", noise: "4×", color: C.amber, frac: 0.5 },
    { w: "160 MHz", rate: "2402", noise: "8×", color: C.red, frac: 1 },
  ];
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 26 }}>
        <Kicker text="FIX THREE" at={0} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 80,
              letterSpacing: "-0.045em",
              color: C.text,
              lineHeight: 1.04,
            }}
          >
            Width is not free.
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 19, color: C.faint, letterSpacing: "0.16em" }}>WI-FI 5 · ONE SPATIAL STREAM</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {rows.map((r, i) => (
            <div key={r.w} style={{ display: "flex", alignItems: "center", gap: 22, opacity: prog(frame, 20 + i * 14, 16) }}>
              <div style={{ width: 140, fontFamily: F.mono, fontSize: 22, color: r.color }}>{r.w}</div>
              <div style={{ flex: 1, height: 44, borderRadius: 6, backgroundColor: "#0B0D14", overflow: "hidden" }}>
                <div style={{ width: `${r.frac * 100}%`, height: 44, backgroundColor: r.color, opacity: 0.8 }} />
              </div>
              <div style={{ width: 170, textAlign: "right", fontFamily: F.sans, fontWeight: 700, fontSize: 34, color: C.text }}>
                {r.rate} <span style={{ fontFamily: F.mono, fontSize: 16, color: C.faint }}>Mbps</span>
              </div>
              <div style={{ width: 110, textAlign: "right", fontFamily: F.mono, fontSize: 20, color: r.color }}>{r.noise} noise</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          <div style={{ fontFamily: F.sans, fontSize: 33, color: C.dim, maxWidth: 900, lineHeight: 1.45 }}>
            Every doubling buys peak rate with an equal doubling of the noise floor. On paper it is a
            straight trade. In a block of flats it is usually a loss.
          </div>
          <Stat value="2×" label="WIDTH · 2× NOISE" color={C.amber} size={82} at={90} />
        </div>
      </div>
    </Stage>
  );
};

const S38: React.FC = () => {
  const frame = useCurrentFrame();
  const cell = (x: number, y: number, r: number, color: string, i: number) => (
    <g key={i}>
      <rect x={x} y={y} width={210} height={160} rx={12} fill="rgba(18,20,28,0.6)" stroke={C.panelEdge} strokeWidth={1.5} />
      <circle cx={x + 105} cy={y + 80} r={r} fill={`${color}14`} stroke={`${color}66`} strokeWidth={2} strokeDasharray="6 8" />
      <circle cx={x + 105} cy={y + 80} r={12} fill={color} />
    </g>
  );
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 28 }}>
        <Kicker text="FIX THREE · IN A DENSE BUILDING" at={0} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 80,
              letterSpacing: "-0.045em",
              color: C.text,
              lineHeight: 1.04,
            }}
          >
            Wider is louder.
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 19, color: C.faint, letterSpacing: "0.14em" }}>
            ILLUSTRATIVE · 9 NEIGHBOURING NETWORKS
          </div>
        </div>
        <div style={{ display: "flex", gap: 34 }}>
          {[
            { label: "40 MHz", r: 78, color: C.cyan, overlap: "1 overlap", note: "mostly clear" },
            { label: "80 MHz", r: 128, color: C.red, overlap: "5 overlaps", note: "everyone hears everyone" },
          ].map((cfg, ci) => (
            <div key={cfg.label} style={{ flex: 1, opacity: prog(frame, 20 + ci * 18, 18) }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontFamily: F.mono, fontSize: 22, color: cfg.color, letterSpacing: "0.14em" }}>{cfg.label}</div>
                <div style={{ fontFamily: F.mono, fontSize: 19, color: cfg.color }}>{cfg.overlap}</div>
              </div>
              <svg width={820} height={520} viewBox="0 0 660 500">
                {[0, 1, 2].map((row) =>
                  [0, 1, 2].map((col) => cell(col * 220 + 10, row * 165 + 10, cfg.r, cfg.color, row * 3 + col))
                )}
              </svg>
              <div style={{ fontFamily: F.mono, fontSize: 18, color: C.faint }}>{cfg.note}</div>
            </div>
          ))}
        </div>
        <Note
          text="A wider channel overlaps more of your neighbours' channels, and every overlapping network is another reason to defer. The extra peak rate is paid for in collisions and silence."
          at={100}
          width={1400}
        />
      </div>
    </Stage>
  );
};

const S39: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    { name: "PHONE", band: 1, color: C.cyan },
    { name: "LAPTOP", band: 1, color: C.violet },
    { name: "TV", band: 0, color: C.pink },
    { name: "PLUG", band: 0, color: C.amber },
    { name: "BULB", band: 0, color: C.amber },
    { name: "SENSOR", band: 0, color: C.amber },
  ];
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 26 }}>
        <Kicker text="FIX FOUR" at={0} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 80,
              letterSpacing: "-0.045em",
              color: C.text,
              lineHeight: 1.04,
            }}
          >
            Give IoT its own lane.
          </div>
          <div style={{ fontFamily: F.sans, fontSize: 29, color: C.dim, maxWidth: 540, lineHeight: 1.4 }}>
            A smart plug does not need five gigahertz. It needs to be left alone.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ display: "flex", gap: 2, paddingLeft: 220 }}>
            {["2.4 GHz", "5 GHz", "6 GHz"].map((b, i) => (
              <div
                key={b}
                style={{
                  flex: 1,
                  fontFamily: F.mono,
                  fontSize: 20,
                  letterSpacing: "0.14em",
                  color: i === 0 ? C.amber : C.violet,
                  textAlign: "center",
                  paddingBottom: 12,
                }}
              >
                {b}
              </div>
            ))}
          </div>
          {rows.map((r, i) => (
            <div
              key={r.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                height: 58,
                opacity: prog(frame, 20 + i * 8, 14),
              }}
            >
              <div style={{ width: 220, fontFamily: F.mono, fontSize: 20, color: r.color, letterSpacing: "0.14em" }}>{r.name}</div>
              {[0, 1, 2].map((band) => {
                const recommended = band === r.band || (r.band === 1 && band === 2);
                return (
                  <div
                    key={band}
                    style={{
                      flex: 1,
                      height: 58,
                      borderRadius: 8,
                      backgroundColor: recommended ? `${r.color}14` : "rgba(255,255,255,0.02)",
                      border: `1px solid ${recommended ? `${r.color}55` : "rgba(255,255,255,0.04)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {recommended ? (
                      <div style={{ fontFamily: F.mono, fontSize: 18, color: r.color, letterSpacing: "0.14em" }}>
                        {band === r.band ? "DEFAULT" : "OK"}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
          <Note
            text="Keep 2.4 GHz on 20 MHz and let the cheap devices live there. They were designed for it, and they will not miss what they never used."
            at={90}
            width={1120}
          />
          <div style={{ fontFamily: F.mono, fontSize: 19, color: C.amber, letterSpacing: "0.16em", opacity: prog(frame, 90, 14) }}>
            NARROW · SLOW · RELIABLE
          </div>
        </div>
      </div>
    </Stage>
  );
};

const S40: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 24, 40);
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 26 }}>
        <Kicker text="MESH · THE CAVEAT" at={0} />
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
          A mesh node without a wire
          <br />
          <span style={{ color: C.red }}>is a repeater.</span>
        </div>

        <div style={{ display: "flex", gap: 30 }}>
          {[
            {
              label: "WIRELESS BACKHAUL",
              color: C.red,
              note: "The same radio carries your data twice.",
              bars: 2,
            },
            {
              label: "WIRED BACKHAUL",
              color: C.green,
              note: "The node forwards over ethernet, not air.",
              bars: 1,
            },
          ].map((cfg, ci) => (
            <div
              key={cfg.label}
              style={{
                flex: 1,
                padding: "26px 30px",
                borderRadius: 16,
                backgroundColor: C.panel,
                border: `1px solid ${cfg.color}44`,
                opacity: prog(frame, 30 + ci * 12, 16),
              }}
            >
              <div style={{ fontFamily: F.mono, fontSize: 20, color: cfg.color, letterSpacing: "0.16em" }}>{cfg.label}</div>
              <svg width={740} height={190} viewBox="0 0 740 190">
                <rect x={40} y={70} width={110} height={56} rx={10} fill={`${C.violet}22`} stroke={C.violet} />
                <text x={95} y={102} textAnchor="middle" fill={C.violet} style={{ fontFamily: F.mono, fontSize: 16 }}>BASE</text>
                <rect x={330} y={70} width={110} height={56} rx={10} fill={`${C.cyan}18`} stroke={C.cyan} />
                <text x={385} y={102} textAnchor="middle" fill={C.cyan} style={{ fontFamily: F.mono, fontSize: 16 }}>NODE</text>
                <rect x={610} y={70} width={110} height={56} rx={10} fill="rgba(255,255,255,0.05)" stroke={C.panelEdge} />
                <text x={665} y={102} textAnchor="middle" fill={C.dim} style={{ fontFamily: F.mono, fontSize: 16 }}>DEVICE</text>
                {[0, 1].map((i) => (
                  <circle
                    key={i}
                    cx={150 + ((frame * 3 + i * 90) % 180)}
                    cy={98}
                    r={7}
                    fill={cfg.color}
                    opacity={0.9}
                  />
                ))}
                <line x1={150} y1={98} x2={330} y2={98} stroke={cfg.color} strokeWidth={2} strokeDasharray="6 8" />
                <line x1={440} y1={98} x2={610} y2={98} stroke={cfg.color} strokeWidth={2} strokeDasharray="6 8" />
                {ci === 0 ? (
                  <text x={240} y={66} textAnchor="middle" fill={cfg.color} style={{ fontFamily: F.mono, fontSize: 17, letterSpacing: "0.12em" }}>
                    AIR × 1
                  </text>
                ) : (
                  <line x1={330} y1={150} x2={710} y2={150} stroke={C.green} strokeWidth={3} strokeDasharray="5 6" />
                )}
                {ci === 0 ? (
                  <text x={690} y={66} textAnchor="middle" fill={cfg.color} style={{ fontFamily: F.mono, fontSize: 17, letterSpacing: "0.12em" }}>
                    AIR × 2
                  </text>
                ) : null}
              </svg>
              <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                {Array.from({ length: cfg.bars }, (_, i) => (
                  <div key={i} style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: cfg.color, opacity: 0.7 }} />
                ))}
                {ci === 0 ? <div style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.06)" }} /> : null}
              </div>
              <div style={{ fontFamily: F.sans, fontSize: 27, color: C.dim, marginTop: 14 }}>{cfg.note}</div>
            </div>
          ))}
        </div>
        <Note
          text="A three-node mesh with no ethernet backhaul can spend more than half of its airtime forwarding other nodes' traffic. Wire the nodes you can."
          at={100}
          width={1380}
        />
      </div>
    </Stage>
  );
};

const S41: React.FC = () => {
  const frame = useCurrentFrame();
  const bands = [
    { name: "2.4 GHz", range: 1, spectrum: 0.06, color: C.amber, note: "long range · 80 MHz of spectrum" },
    { name: "5 GHz", range: 0.62, spectrum: 0.42, color: C.cyan, note: "medium range · ~500 MHz" },
    { name: "6 GHz", range: 0.34, spectrum: 1, color: C.violet, note: "short range · ~1,200 MHz" },
  ];
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 30 }}>
        <Kicker text="MESH · THE OTHER CAVEAT · 6 GHz" at={0} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 80,
              letterSpacing: "-0.045em",
              color: C.text,
              lineHeight: 1.04,
            }}
          >
            A fast lane,
            <br />
            <span style={{ color: C.violet }}>not a replacement.</span>
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 19, color: C.faint, letterSpacing: "0.16em" }}>
            WI-FI 6E · 6 GHz
          </div>
        </div>

        <div style={{ display: "flex", gap: 26 }}>
          {bands.map((b, i) => (
            <div
              key={b.name}
              style={{
                flex: 1,
                padding: "28px 30px",
                borderRadius: 16,
                backgroundColor: C.panel,
                border: `1px solid ${b.color}33`,
                opacity: prog(frame, 20 + i * 14, 16),
              }}
            >
              <div style={{ fontFamily: F.mono, fontSize: 24, color: b.color, letterSpacing: "0.14em" }}>{b.name}</div>
              <div style={{ fontFamily: F.mono, fontSize: 16, color: C.faint, marginTop: 6, letterSpacing: "0.1em" }}>{b.note}</div>
              <div style={{ marginTop: 24, fontFamily: F.mono, fontSize: 16, color: C.faint, letterSpacing: "0.14em" }}>REACH</div>
              <div style={{ height: 14, borderRadius: 7, backgroundColor: "#0B0D14", marginTop: 8, overflow: "hidden" }}>
                <div style={{ width: `${b.range * 100 * prog(frame, 30 + i * 14, 20)}%`, height: 14, backgroundColor: b.color, opacity: 0.75 }} />
              </div>
              <div style={{ marginTop: 22, fontFamily: F.mono, fontSize: 16, color: C.faint, letterSpacing: "0.14em" }}>SPECTRUM</div>
              <div style={{ height: 14, borderRadius: 7, backgroundColor: "#0B0D14", marginTop: 8, overflow: "hidden" }}>
                <div style={{ width: `${b.spectrum * 100 * prog(frame, 40 + i * 14, 20)}%`, height: 14, backgroundColor: b.color, opacity: 0.55 }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 40 }}>
          <div style={{ flex: 1, fontFamily: F.sans, fontSize: 32, color: C.dim, lineHeight: 1.45 }}>
            Six gigahertz is quiet because almost nothing old can reach it. That is also its limit:
            walls cost more, and a two point four only plug will never see it.
          </div>
          <Note
            text="Put the devices that support it on 6 GHz. Leave the ones that do not on 2.4. Do not force an old plug onto a band it cannot hear."
            at={110}
            width={760}
          />
        </div>
      </div>
    </Stage>
  );
};

const S42: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 30 }}>
        <Kicker text="WHAT NEWER STANDARDS ADD" at={0} />
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
          Small frames should share a transmission.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {[
            { label: "BEFORE · ONE FRAME PER TURN", parts: 4, color: C.amber, at: 20 },
            { label: "OFDMA · FOUR FRAMES PER TURN", parts: 1, color: C.green, at: 70 },
          ].map((cfg) => (
            <div key={cfg.label} style={{ opacity: prog(frame, cfg.at, 18) }}>
              <div style={{ fontFamily: F.mono, fontSize: 19, color: cfg.color, letterSpacing: "0.16em", marginBottom: 10 }}>
                {cfg.label}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {Array.from({ length: cfg.parts }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 78,
                      borderRadius: 8,
                      border: `1px solid ${cfg.color}55`,
                      backgroundColor: `${cfg.color}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      fontFamily: F.mono,
                      fontSize: 17,
                      color: cfg.color,
                    }}
                  >
                    {cfg.parts === 1
                      ? ["RU 1", "RU 2", "RU 3", "RU 4"].map((ru) => (
                          <span key={ru} style={{ flex: 1, textAlign: "center" }}>
                            {ru}
                          </span>
                        ))
                      : `FRAME ${i + 1} · FULL CHANNEL`}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Note
            text="Orthogonal frequency division multiple access splits one channel into resource units. Four small frames ride one transmission instead of queuing for four."
            at={110}
            width={1180}
          />
          <Stat value="4×" label="LESS QUEUING FOR SMALL FRAMES" color={C.green} size={84} at={120} />
        </div>
      </div>
    </Stage>
  );
};

const S43: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 30 }}>
        <Kicker text="WHAT NEWER STANDARDS ADD" at={0} />
        <div style={{ display: "flex", gap: 34 }}>
          <div style={{ flex: 1, padding: "26px 30px", borderRadius: 16, backgroundColor: C.panel, border: `1px solid ${C.cyan}33` }}>
            <div style={{ fontFamily: F.mono, fontSize: 20, color: C.cyan, letterSpacing: "0.14em" }}>MULTI-USER MIMO</div>
            <svg width={740} height={250} viewBox="0 0 740 250">
              <circle cx={110} cy={125} r={34} fill={`${C.violet}22`} stroke={C.violet} strokeWidth={2} />
              <text x={110} y={132} textAnchor="middle" fill={C.violet} style={{ fontFamily: F.mono, fontSize: 14 }}>AP</text>
              {[
                { x: 560, y: 50 },
                { x: 620, y: 125 },
                { x: 560, y: 200 },
              ].map((c, i) => (
                <g key={i}>
                  <path
                    d={`M148 125 Q 340 ${c.y}, ${c.x - 26} ${c.y}`}
                    fill="none"
                    stroke={C.cyan}
                    strokeWidth={3}
                    opacity={0.35 + 0.18 * i}
                  />
                  <circle cx={c.x} cy={c.y} r={18} fill={`${C.cyan}22`} stroke={C.cyan} />
                </g>
              ))}
              <text x={370} y={238} textAnchor="middle" fill={C.faint} style={{ fontFamily: F.mono, fontSize: 17, letterSpacing: "0.12em" }}>
                THREE CLIENTS · ONE TRANSMISSION
              </text>
            </svg>
          </div>
          <div style={{ flex: 1, padding: "26px 30px", borderRadius: 16, backgroundColor: C.panel, border: `1px solid ${C.amber}33` }}>
            <div style={{ fontFamily: F.mono, fontSize: 20, color: C.amber, letterSpacing: "0.14em" }}>BSS COLOURING</div>
            <svg width={740} height={250} viewBox="0 0 740 250">
              <circle cx={230} cy={125} r={100} fill={`${C.cyan}10`} stroke={`${C.cyan}66`} strokeDasharray="6 8" />
              <circle cx={510} cy={125} r={100} fill={`${C.amber}10`} stroke={`${C.amber}66`} strokeDasharray="6 8" />
              <circle cx={230} cy={125} r={16} fill={C.cyan} />
              <circle cx={510} cy={125} r={16} fill={C.amber} />
              <text x={230} y={60} textAnchor="middle" fill={C.cyan} style={{ fontFamily: F.mono, fontSize: 15 }}>
                BSS COLOUR 1
              </text>
              <text x={510} y={60} textAnchor="middle" fill={C.amber} style={{ fontFamily: F.mono, fontSize: 15 }}>
                BSS COLOUR 2
              </text>
              <text x={370} y={238} textAnchor="middle" fill={C.faint} style={{ fontFamily: F.mono, fontSize: 17, letterSpacing: "0.12em" }}>
                NEIGHBOURS CAN SHARE THE CHANNEL
              </text>
            </svg>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Note
            text="Multi-user M I M O lets one access point serve several clients at once. Colouring lets overlapping networks stop deferring to every frame they hear."
            at={80}
            width={1280}
          />
          <div style={{ fontFamily: F.mono, fontSize: 19, color: C.faint, letterSpacing: "0.16em", opacity: prog(frame, 90, 14) }}>
            WI-FI 6 · 6E
          </div>
        </div>
      </div>
    </Stage>
  );
};

const S44: React.FC = () => {
  const frame = useCurrentFrame();
  const t = prog(frame, 60, 40);
  const series = [
    { color: C.cyan, before: 0.08, after: 0.25 },
    { color: C.violet, before: 0.06, after: 0.25 },
    { color: C.pink, before: 0.06, after: 0.25 },
    { color: C.amber, before: 0.8, after: 0.25 },
  ];
  const chart = (after: boolean) => (
    <svg width={700} height={300} viewBox="0 0 700 300">
      {[60, 130, 200, 270].map((y) => (
        <line key={y} x1={50} y1={y} x2={670} y2={y} stroke="rgba(255,255,255,0.07)" />
      ))}
      <line x1={50} y1={40} x2={50} y2={270} stroke={C.panelEdge} />
      <line x1={50} y1={270} x2={670} y2={270} stroke={C.panelEdge} />
      {series.map((s, i) => {
        const y = 270 - (after ? s.after : s.before) * 260;
        return (
          <rect
            key={i}
            x={110 + i * 140}
            y={y}
            width={80}
            height={270 - y}
            rx={5}
            fill={s.color}
            opacity={0.8}
          />
        );
      })}
      <text x={55} y={30} fill={C.faint} style={{ fontFamily: F.mono, fontSize: 17, letterSpacing: "0.12em" }}>
        {after ? "AFTER · EQUAL TIME" : "BEFORE · PACKET FAIR"}
      </text>
    </svg>
  );
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 26 }}>
        <Kicker text="FIX ONE · THE ONE THAT MATTERS" at={0} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 76,
              letterSpacing: "-0.045em",
              color: C.text,
              lineHeight: 1.05,
            }}
          >
            It changes the shape
            <br />
            <span style={{ color: C.green }}>of the graph.</span>
          </div>
          <Toggle on={t > 0.5} at={60} label="AIRTIME FAIRNESS ON" />
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ flex: 1, padding: "18px 22px", borderRadius: 14, backgroundColor: C.panel, border: `1px solid ${C.panelEdge}`, opacity: 0.45 + 0.55 * (1 - t) }}>
            {chart(false)}
          </div>
          <div
            style={{
              flex: 1,
              padding: "18px 22px",
              borderRadius: 14,
              backgroundColor: C.panel,
              border: `1px solid ${C.green}44`,
              opacity: t,
            }}
          >
            {chart(true)}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Note
            text="The plug still gets a quarter of the time. It simply stops getting four fifths of it. No device is starved; one device stops monopolising."
            at={110}
            width={1180}
          />
          <div style={{ fontFamily: F.mono, fontSize: 19, color: C.faint, letterSpacing: "0.16em" }}>
            ENABLE IT IN QOS OR WIRELESS ADVANCED
          </div>
        </div>
      </div>
    </Stage>
  );
};

export const ACT5: Record<string, React.ReactNode> = {
  s33: <S33 />,
  s34: <S34 />,
  s35: <S35 />,
  s36: <S36 />,
  s37: <S37 />,
  s38: <S38 />,
  s39: <S39 />,
  s40: <S40 />,
  s41: <S41 />,
  s42: <S42 />,
  s43: <S43 />,
  s44: <S44 />,
};
