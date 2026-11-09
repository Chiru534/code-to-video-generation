import React from "react";
import { useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { AirtimeRail, CLAMP, FILM, Kicker, Stage, prog } from "./kit";
import { Note, Split, Stat } from "./bits";

/* ACT 3 - the four-client model. Sets up the numbers the rest of the film
   spends, and shows why 4% of the traffic can be 80% of the time. */

type Client = {
  name: string;
  color: string;
  detail: string;
  rate: number;
};

const CLIENTS: Client[] = [
  { name: "LAPTOP", color: C.cyan, detail: "3 m · no walls", rate: 1100 },
  { name: "PHONE", color: C.violet, detail: "7 m · one wall", rate: 600 },
  { name: "TV", color: C.pink, detail: "9 m · one wall", rate: 300 },
  { name: "PLUG", color: C.amber, detail: "12 m · two walls", rate: 1 },
];

const ClientRow: React.FC<{
  c: Client;
  at: number;
  active?: boolean;
  dim?: boolean;
}> = ({ c, at, active, dim }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 20);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "20px 26px",
        borderRadius: 14,
        backgroundColor: active ? `${c.color}0E` : C.panel,
        border: `1px solid ${active ? `${c.color}66` : C.panelEdge}`,
        opacity: (dim ? 0.3 : 1) * p,
        transform: `translateX(${(1 - p) * -24}px)`,
      }}
    >
      <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: c.color }} />
      <div style={{ width: 160, fontFamily: F.mono, fontSize: 22, letterSpacing: "0.16em", color: c.color }}>
        {c.name}
      </div>
      <div style={{ flex: 1, fontFamily: F.mono, fontSize: 19, color: C.faint, letterSpacing: "0.06em" }}>
        {c.detail}
      </div>
      <div style={{ width: 360, height: 16, borderRadius: 8, backgroundColor: "#0B0D14", overflow: "hidden" }}>
        <div
          style={{
            width: `${Math.max(0.7, (c.rate / 1100) * 100) * p}%`,
            height: 16,
            backgroundColor: c.color,
            opacity: 0.8,
          }}
        />
      </div>
      <div style={{ width: 200, textAlign: "right", display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: 8 }}>
        <span
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 44,
            letterSpacing: "-0.03em",
            color: c.color,
          }}
        >
          {c.rate}
        </span>
        <span style={{ fontFamily: F.mono, fontSize: 18, color: C.faint }}>Mbps</span>
      </div>
    </div>
  );
};

const S18: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 20, 30);
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 34 }}>
        <Kicker text="THE SIMULATION" at={0} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
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
            Four clients.
            <br />
            One second.
            <br />
            <span style={{ color: C.amber }}>Zero megabits.</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
            <div style={{ fontFamily: F.mono, fontSize: 20, color: C.faint, letterSpacing: "0.18em" }}>
              THE BUDGET
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <div
                style={{
                  fontFamily: F.sans,
                  fontWeight: 800,
                  fontSize: 132,
                  lineHeight: 0.9,
                  letterSpacing: "-0.05em",
                  color: C.amber,
                }}
              >
                1000
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 30, color: C.dim }}>ms</div>
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 18, color: C.faint }}>OF CHANNEL TIME, PER SECOND</div>
          </div>
        </div>

        <div style={{ position: "relative", height: 150, borderRadius: 12, border: `1px solid ${C.panelEdge}`, backgroundColor: "#0B0D14", overflow: "hidden" }}>
          {[0, 250, 500, 750, 1000].map((t) => (
            <div
              key={t}
              style={{
                position: "absolute",
                left: `${(t / 1000) * 100}%`,
                top: 0,
                bottom: 0,
                width: 1,
                backgroundColor: "rgba(255,255,255,0.09)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  bottom: 10,
                  left: 8,
                  fontFamily: F.mono,
                  fontSize: 17,
                  color: C.faint,
                }}
              >
                {t}
              </div>
            </div>
          ))}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${p * 100}%`,
              backgroundColor: `${C.amber}10`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 24,
              top: 26,
              fontFamily: F.mono,
              fontSize: 20,
              color: C.amber,
              letterSpacing: "0.2em",
              opacity: p,
            }}
          >
            UNALLOCATED
          </div>
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          {CLIENTS.map((c, i) => (
            <div
              key={c.name}
              style={{
                flex: 1,
                padding: "20px 22px",
                borderRadius: 12,
                backgroundColor: C.panel,
                border: `1px solid ${C.panelEdge}`,
                display: "flex",
                alignItems: "center",
                gap: 14,
                opacity: prog(frame, 40 + i * 10, 14),
              }}
            >
              <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: c.color }} />
              <div style={{ fontFamily: F.mono, fontSize: 19, color: C.dim, letterSpacing: "0.16em" }}>{c.name}</div>
              <div style={{ marginLeft: "auto", fontFamily: F.mono, fontSize: 19, color: C.faint }}>? Mbps</div>
            </div>
          ))}
        </div>
        <Note
          text="Every number from here is a share of one second. Not a share of the advertised speed. Not a share of the fibre. A share of the channel."
          at={70}
          width={1400}
        />
      </div>
    </Stage>
  );
};

const S19: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 26 }}>
        <Kicker text="CLIENT ONE AND TWO" at={0} />
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 76,
            letterSpacing: "-0.045em",
            color: C.text,
            marginBottom: 10,
          }}
        >
          Close devices talk fast.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <ClientRow c={CLIENTS[0]} at={20} active />
          <ClientRow c={CLIENTS[1]} at={42} active />
          <ClientRow c={CLIENTS[2]} at={999} dim />
          <ClientRow c={CLIENTS[3]} at={999} dim />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
          <Note
            text="Link rate is negotiated per client, from signal strength, modulation and spatial streams. One access point can hold four completely different rates at once."
            at={80}
            width={1120}
          />
          <div style={{ fontFamily: F.mono, fontSize: 19, color: C.faint, letterSpacing: "0.16em", opacity: prog(frame, 90, 14) }}>
            SAME CHANNEL · FOUR RATES
          </div>
        </div>
      </div>
    </Stage>
  );
};

const S20: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 26 }}>
        <Kicker text="CLIENT THREE AND FOUR" at={0} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 76,
              letterSpacing: "-0.045em",
              color: C.text,
            }}
          >
            Far devices talk slow.
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 20, color: C.amber, letterSpacing: "0.18em" }}>
            1/1100th OF THE LINK RATE
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <ClientRow c={CLIENTS[0]} at={10} dim />
          <ClientRow c={CLIENTS[1]} at={10} dim />
          <ClientRow c={CLIENTS[2]} at={30} active />
          <ClientRow c={CLIENTS[3]} at={54} active />
        </div>
        <div style={{ display: "flex", gap: 30, alignItems: "center", marginTop: 14 }}>
          <div
            style={{
              padding: "18px 26px",
              borderRadius: 12,
              border: `1px solid ${C.amber}55`,
              backgroundColor: `${C.amber}0E`,
              display: "flex",
              alignItems: "center",
              gap: 28,
              opacity: prog(frame, 90, 16),
            }}
          >
            <div style={{ fontFamily: F.mono, fontSize: 19, color: C.amber, letterSpacing: "0.16em" }}>
              THE PLUG
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 19, color: C.dim }}>
              802.11n · 2.4 GHz · 20 MHz · MCS 0
            </div>
          </div>
          <Note
            text="It is not broken. It is doing exactly what the standard allows at that distance, through those walls. The problem is what everyone else pays for it."
            at={100}
            width={860}
          />
        </div>
      </div>
    </Stage>
  );
};

const S21: React.FC = () => {
  const frame = useCurrentFrame();
  const blocks = Array.from({ length: 66 }, (_, i) => i);
  const p = prog(frame, 18, 44);
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 30 }}>
        <Kicker text="ONE SECOND OF AIRTIME" at={0} />
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
            Sixty six frames.
            <br />
            <span style={{ color: C.amber }}>Seven hundred and ninety two milliseconds.</span>
          </div>
          <Stat value="66" unit="FRAMES/S" label="FROM ONE PLUG" color={C.amber} size={120} at={30} />
        </div>

        <div style={{ display: "flex", width: FILM.safeW, height: 130, gap: 4 }}>
          <div
            style={{
              width: `${79.2 * p}%`,
              height: 130,
              borderRadius: 10,
              backgroundColor: `${C.amber}1A`,
              border: `1px solid ${C.amber}44`,
              padding: 8,
              boxSizing: "border-box",
              display: "flex",
              gap: 2,
              overflow: "hidden",
            }}
          >
            {blocks.map((i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: "100%",
                  backgroundColor: C.amber,
                  opacity: p > i / 66 ? 0.78 : 0.1,
                  borderRadius: 2,
                }}
              />
            ))}
          </div>
          <div
            style={{
              flex: 1,
              height: 130,
              borderRadius: 10,
              backgroundColor: `${C.cyan}12`,
              border: `1px solid ${C.cyan}44`,
              display: "flex",
              gap: 2,
              padding: 8,
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            {Array.from({ length: 18 }, (_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: "100%",
                  backgroundColor: C.cyan,
                  opacity: 0.5,
                  borderRadius: 2,
                }}
              />
            ))}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: F.mono,
            fontSize: 20,
            letterSpacing: "0.14em",
          }}
        >
          <span style={{ color: C.amber }}>PLUG · 792 ms</span>
          <span style={{ color: C.cyan }}>EVERYONE ELSE · 208 ms</span>
        </div>
        <div style={{ display: "flex", gap: 40 }}>
          <div style={{ flex: 1, fontFamily: F.sans, fontSize: 33, color: C.dim, lineHeight: 1.45 }}>
            One frame from the plug holds the channel for twelve milliseconds. That is not a long
            time, until you multiply it by the number of frames it needs.
          </div>
          <Note
            text="79.2% of the second is already spoken for. Four percent of the traffic. Ninety six percent of the devices waiting."
            at={70}
            width={700}
          />
        </div>
      </div>
    </Stage>
  );
};

const S22: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 26, 40);
  return (
    <Stage>
      <div style={{ width: FILM.safeW, display: "flex", flexDirection: "column", gap: 34 }}>
        <Kicker text="THE TWO NUMBERS" at={0} />
        <div style={{ display: "flex", gap: 80, alignItems: "baseline" }}>
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 20, color: C.faint, letterSpacing: "0.2em", marginBottom: 10 }}>
              SHARE OF TRAFFIC
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <div
                style={{
                  fontFamily: F.sans,
                  fontWeight: 800,
                  fontSize: 170,
                  lineHeight: 0.85,
                  letterSpacing: "-0.06em",
                  color: C.text,
                }}
              >
                4
              </div>
              <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 80, color: C.dim }}>%</div>
            </div>
          </div>
          <div style={{ width: 2, alignSelf: "stretch", backgroundColor: C.panelEdge }} />
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 20, color: C.amber, letterSpacing: "0.2em", marginBottom: 10 }}>
              SHARE OF AIRTIME
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <div
                style={{
                  fontFamily: F.sans,
                  fontWeight: 800,
                  fontSize: 170,
                  lineHeight: 0.85,
                  letterSpacing: "-0.06em",
                  color: C.amber,
                  opacity: prog(frame, 40, 18),
                }}
              >
                80
              </div>
              <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 80, color: C.amber, opacity: prog(frame, 40, 18) }}>
                %
              </div>
            </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              fontFamily: F.sans,
              fontSize: 32,
              color: C.dim,
              lineHeight: 1.4,
              maxWidth: 480,
              opacity: prog(frame, 60, 16),
            }}
          >
            The same device. The same second.
            <br />
            <span style={{ color: C.text }}>Two different questions.</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 8 }}>
          {[
            { label: "TRAFFIC", plug: 4, color: C.cyan, at: 60 },
            { label: "AIRTIME", plug: 80, color: C.amber, at: 90 },
          ].map((row) => {
            const q = prog(frame, row.at, 40);
            return (
              <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <div style={{ width: 130, fontFamily: F.mono, fontSize: 19, color: C.faint, letterSpacing: "0.18em" }}>
                  {row.label}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 58,
                    borderRadius: 8,
                    backgroundColor: "#0B0D14",
                    border: `1px solid ${C.panelEdge}`,
                    display: "flex",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ width: `${row.plug * q}%`, height: 58, backgroundColor: row.color }} />
                  <div style={{ flex: 1, height: 58, backgroundColor: "rgba(255,255,255,0.06)" }} />
                </div>
                <div style={{ width: 90, textAlign: "right", fontFamily: F.mono, fontSize: 22, color: row.color }}>
                  {row.plug}%
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          <Note
            text="MODELLED · 4 CLIENTS · 1,500-BYTE FRAMES · 1 Mbps VS 300–1100 Mbps · CONTENTION AND OVERHEAD INCLUDED"
            at={120}
            width={1200}
          />
          <div style={{ fontFamily: F.sans, fontSize: 28, color: C.dim, opacity: prog(frame, 120, 16) }}>
            Not the same number.
          </div>
        </div>
      </div>
    </Stage>
  );
};

export const ACT3: Record<string, React.ReactNode> = {
  s18: <S18 />,
  s19: <S19 />,
  s20: <S20 />,
  s21: <S21 />,
  s22: <S22 />,
};
