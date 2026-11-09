import React from "react";
import { useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { AirtimeRail, FILM, Kicker, Stage, prog } from "./kit";
import { Note, Split, Stat, Timeline } from "./bits";

/* ACT 6 - the second bill. Overhead, beacons, management frames, retries:
   the airtime that never shows up in a speed test. */

const S45: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 28 }}>
        <Kicker text="THE SECOND BILL" at={0} />
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
          Every frame buys an acknowledgement.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 8 }}>
          {[
            {
              label: "1 Mbps · 1,500 BYTES",
              data: 12000,
              total: 12150,
              color: C.amber,
              segs: [
                { ms: 12000, color: C.amber, label: "DATA · 12 ms" },
                { ms: 150, color: "#2A2E3A", label: "" },
              ],
              note: "98.8% data",
            },
            {
              label: "300 Mbps · 1,500 BYTES",
              data: 40,
              total: 190,
              color: C.cyan,
              segs: [
                { ms: 40, color: C.cyan, label: "" },
                { ms: 16, color: C.green, label: "" },
                { ms: 24, color: C.violet, label: "" },
                { ms: 34, color: "#3A3F4D", label: "" },
                { ms: 76, color: "#242833", label: "BACKOFF" },
              ],
              note: "21% data",
            },
          ].map((row, i) => (
            <div key={row.label} style={{ opacity: prog(frame, 24 + i * 40, 18) }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 19, marginBottom: 10 }}>
                <span style={{ color: row.color, letterSpacing: "0.14em" }}>{row.label}</span>
                <span style={{ color: row.color }}>{row.note}</span>
              </div>
              <Timeline segs={row.segs} totalMs={row.total} height={62} at={24 + i * 40} dur={26} />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 10 }}>
          <Note
            text="At one megabit the data dominates. At three hundred, the fixed cost of preamble, SIFS, ACK, DIFS and backoff is larger than the frame itself."
            at={120}
            width={1080}
          />
          <div style={{ display: "flex", gap: 14 }}>
            {[
              { t: "DATA", c: C.cyan },
              { t: "SIFS", c: C.green },
              { t: "ACK", c: C.violet },
              { t: "DIFS", c: "#3A3F4D" },
              { t: "BACKOFF", c: "#242833" },
            ].map((l) => (
              <div key={l.t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 11, height: 11, borderRadius: 3, backgroundColor: l.c }} />
                <span style={{ fontFamily: F.mono, fontSize: 16, color: C.faint }}>{l.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Stage>
  );
};

const S46: React.FC = () => {
  const frame = useCurrentFrame();
  const beacons = Array.from({ length: 10 }, (_, i) => i);
  const join = ["PROBE", "AUTH", "ASSOC"];
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 32 }}>
        <Kicker text="THE SECOND BILL · MANAGEMENT" at={0} />
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
            The network talks
            <br />
            <span style={{ color: C.amber }}>even when you do not.</span>
          </div>
          <Stat value="10" unit="/SEC" label="BEACONS PER ACCESS POINT" color={C.amber} size={108} at={30} />
        </div>

        <div style={{ padding: "24px 28px", borderRadius: 16, backgroundColor: C.panel, border: `1px solid ${C.panelEdge}` }}>
          <div style={{ fontFamily: F.mono, fontSize: 18, color: C.faint, letterSpacing: "0.16em", marginBottom: 16 }}>
            ONE SECOND · BEACON TIMELINE
          </div>
          <div style={{ position: "relative", height: 70 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 32, height: 2, backgroundColor: C.panelEdge }} />
            {beacons.map((b) => (
              <div
                key={b}
                style={{
                  position: "absolute",
                  left: `${b * 10}%`,
                  top: 6,
                  width: 4,
                  height: 54,
                  backgroundColor: C.amber,
                  opacity: prog(frame, 20 + b * 5, 10) * 0.85,
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 17, color: C.faint }}>
            <span>0 s</span>
            <span>1 s</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ fontFamily: F.mono, fontSize: 18, color: C.faint, letterSpacing: "0.14em", width: 230 }}>
            JOINING A NETWORK
          </div>
          {join.map((j, i) => (
            <React.Fragment key={j}>
              <div
                style={{
                  padding: "18px 26px",
                  borderRadius: 10,
                  backgroundColor: `${C.cyan}10`,
                  border: `1px solid ${C.cyan}44`,
                  fontFamily: F.mono,
                  fontSize: 19,
                  color: C.cyan,
                  letterSpacing: "0.14em",
                  opacity: prog(frame, 60 + i * 12, 12),
                }}
              >
                {j}
              </div>
              {i < join.length - 1 ? <div style={{ color: C.faint, fontFamily: F.mono }}>→</div> : null}
            </React.Fragment>
          ))}
          <div style={{ marginLeft: "auto", fontFamily: F.sans, fontSize: 28, color: C.dim, opacity: prog(frame, 100, 16) }}>
            only then does your traffic begin
          </div>
        </div>
      </div>
    </Stage>
  );
};

const S47: React.FC = () => {
  const frame = useCurrentFrame();
  const attempts = [0, 1, 2, 3, 4];
  return (
    <Stage>
      <Split
        left={
          <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 820 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 18, color: C.faint }}>
              <span>FRAME · 1,500 BYTES</span>
              <span>CHANNEL TIME →</span>
            </div>
            {attempts.map((a) => {
              const bad = a === 1 || a === 3;
              const p = prog(frame, 18 + a * 16, 12);
              return (
                <div key={a} style={{ display: "flex", alignItems: "center", gap: 18, opacity: p }}>
                  <div style={{ width: 90, fontFamily: F.mono, fontSize: 17, color: C.faint }}>TRY {a + 1}</div>
                  <div
                    style={{
                      flex: 1,
                      height: 58,
                      borderRadius: 8,
                      backgroundColor: bad ? `${C.red}18` : `${C.green}14`,
                      border: `1px solid ${bad ? C.red : C.green}55`,
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: 20,
                      fontFamily: F.mono,
                      fontSize: 18,
                      color: bad ? C.red : C.green,
                      letterSpacing: "0.1em",
                    }}
                  >
                    {bad ? "CORRUPTED · NO ACK" : a === 4 ? "ACK · DELIVERED" : "FRAME + ACK"}
                  </div>
                </div>
              );
            })}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6 }}>
              <div style={{ width: `${40 * prog(frame, 100, 20)}%`, height: 12, borderRadius: 6, backgroundColor: C.red }} />
              <div style={{ fontFamily: F.mono, fontSize: 18, color: C.red }}>40% OF ATTEMPTS WASTED</div>
            </div>
          </div>
        }
        right={
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <Kicker text="RETRIES" />
            <div
              style={{
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 84,
                lineHeight: 1.03,
                letterSpacing: "-0.05em",
                color: C.text,
              }}
            >
              A retry is
              <br />
              a frame
              <br />
              <span style={{ color: C.red }}>sent twice.</span>
            </div>
            <div style={{ fontFamily: F.sans, fontSize: 31, color: C.dim, lineHeight: 1.5 }}>
              In a noisy home, retries can quietly eat a fifth of your airtime before a single byte of
              your data has been counted.
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 18, color: C.faint, letterSpacing: "0.12em", borderTop: `1px solid ${C.panelEdge}`, paddingTop: 18 }}>
              NOISE · INTERFERENCE · WEAK SIGNAL
            </div>
          </div>
        }
      />
    </Stage>
  );
};

const S48: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    { label: "LINK RATE", value: 800, note: "the box", color: C.violet, at: 18 },
    { label: "AFTER OVERHEAD", value: 560, note: "−30%", color: C.cyan, at: 50 },
    { label: "AFTER CONTENTION", value: 340, note: "−39%", color: C.amber, at: 82 },
    { label: "AFTER RETRIES", value: 200, note: "−41%", color: C.red, at: 114 },
  ];
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 30 }}>
        <Kicker text="THE WATERFALL" at={0} />
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
            Eight hundred in.
            <br />
            <span style={{ color: C.red }}>Two hundred out.</span>
          </div>
          <Note
            text="Illustrative but typical: overhead, contention and retries each take a bite, and the bites compound."
            at={30}
            width={620}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 6 }}>
          {rows.map((r, i) => (
            <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 22, opacity: prog(frame, r.at, 18) }}>
              <div style={{ width: 250, fontFamily: F.mono, fontSize: 20, color: r.color, letterSpacing: "0.12em" }}>{r.label}</div>
              <div style={{ flex: 1, height: 52, borderRadius: 8, backgroundColor: "#0B0D14", overflow: "hidden", position: "relative" }}>
                <div
                  style={{
                    width: `${(r.value / 800) * 100}%`,
                    height: 52,
                    backgroundColor: r.color,
                    opacity: 0.8,
                  }}
                />
                {i > 0 ? (
                  <div
                    style={{
                      position: "absolute",
                      left: `${(rows[i - 1].value / 800) * 100}%`,
                      width: `${((rows[i - 1].value - r.value) / 800) * 100}%`,
                      top: 0,
                      bottom: 0,
                      borderLeft: `2px dashed ${C.bg}`,
                    }}
                  />
                ) : null}
              </div>
              <div style={{ width: 140, textAlign: "right", fontFamily: F.sans, fontWeight: 800, fontSize: 40, color: r.color }}>
                {r.value}
              </div>
              <div style={{ width: 100, textAlign: "right", fontFamily: F.mono, fontSize: 18, color: C.faint }}>{r.note}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: F.sans, fontSize: 32, color: C.dim }}>
            The last bar is the one you feel.
          </div>
          <Stat value="25%" label="OF THE ADVERTISED RATE" color={C.red} size={70} at={130} />
        </div>
      </div>
    </Stage>
  );
};

const S49: React.FC = () => {
  const frame = useCurrentFrame();
  const burst = Array.from({ length: 10 }, (_, i) => i);
  const real = Array.from({ length: 60 }, (_, i) => (i % 7 === 0 ? "stall" : i % 3 === 0 ? "plug" : "data"));
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 30 }}>
        <Kicker text="WHY THE SPEED TEST LIES" at={0} />
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
          It measures the best ten seconds.
          <br />
          <span style={{ color: C.amber }}>You live in the other fifty.</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 18, marginBottom: 10 }}>
              <span style={{ color: C.cyan, letterSpacing: "0.14em" }}>SPEED TEST · 10 s BURST · ONE DEVICE</span>
              <span style={{ color: C.cyan }}>600 Mbps</span>
            </div>
            <div style={{ display: "flex", gap: 2, height: 54 }}>
              {burst.map((i) => (
                <div key={i} style={{ flex: 1, backgroundColor: C.cyan, opacity: 0.75, borderRadius: 3 }} />
              ))}
              <div style={{ flex: 5, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 3 }} />
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 18, marginBottom: 10 }}>
              <span style={{ color: C.amber, letterSpacing: "0.14em" }}>REAL USE · 60 s · FOUR DEVICES</span>
              <span style={{ color: C.amber }}>180 Mbps · stalls</span>
            </div>
            <div style={{ display: "flex", gap: 2, height: 54 }}>
              {real.map((k, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    borderRadius: 2,
                    backgroundColor: k === "stall" ? C.red : k === "plug" ? C.amber : C.cyan,
                    opacity: 0.75,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Note
            text="A speed test is a short, best-case burst. A video call is long, continuous, and arrives while the rest of the house is using the channel."
            at={90}
            width={1160}
          />
          <div style={{ fontFamily: F.mono, fontSize: 19, color: C.faint, letterSpacing: "0.14em" }}>
            BEST CASE ≠ YOUR CASE
          </div>
        </div>
      </div>
    </Stage>
  );
};

export const ACT6: Record<string, React.ReactNode> = {
  s45: <S45 />,
  s46: <S46 />,
  s47: <S47 />,
  s48: <S48 />,
  s49: <S49 />,
};
