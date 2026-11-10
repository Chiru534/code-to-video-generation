import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { C, F } from "../theme";
import { Backdrop, Stage, Watermark } from "../chrome";
import {
  Bar,
  Chip,
  Foot,
  Hero,
  Matrix,
  PW,
  Stat,
  Statement,
  Top,
  lin,
  ph,
  sign,
  useScene,
  weight,
} from "../kit/scene";
import { buildPlan, timelineFrames } from "../kit/timeline";
import timings from "./timings.json";

/* "Samsung stored an AI weight in a tenth of a bit."

   A ~77s vertical short. One idea: below one bit per weight you cannot store a
   number, so LittleBit stops storing numbers. The weights become two thin sign
   matrices and the big matrix is rebuilt on the fly.

   Sources: arXiv 2506.13771 (NeurIPS 2025) and 2603.00042 (LittleBit-2).
   Every number on screen is the paper's. The 11.6x speedup carries a POTENTIAL
   tag because the paper calls it a potential speedup, not a measured benchmark,
   and the quality claim is "matches leading 1-bit baselines", not "beats".

   Layout rule for every scene: the visual is a Hero (centred above the foot
   band) and the closing line sits in a fixed Foot. The line must never reflow
   the thing it comments on, and it must not leave the bottom third dead.

   TAIL_FRAMES stays in this file: tools/audit.py reads it out of the episode
   source by regex to compute the expected render duration. */

const TAIL_FRAMES = 12;

/* ------------------------------------------------------------- s01 hook --- */

const S01: React.FC = () => {
  const { frame, d } = useScene();
  const build = ph(frame, d, 0.02, 0.28);
  const crush = ph(frame, d, 0.3, 0.46);
  const raw = (1 - crush) * 26 * build + crush * 0.9;
  /* Gate the label on the crush actually FINISHING. Gating on 0.45 flipped it
     to "0.1 BITS PER WEIGHT" while the counter still read ~14 GB. */
  const tight = crush > 0.99;
  const shown = tight ? "0.9" : String(Math.round(raw));
  /* Lands with the crush, not after it: the line IS the payoff of the bar
     collapsing, so it must be on screen while that reads. */
  const line = ph(frame, d, 0.46, 0.58);

  return (
    <Stage>
      <Top text="MEMORY" />

      <Hero lift={210}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 360,
              lineHeight: 0.86,
              letterSpacing: "-0.06em",
              color: tight ? C.cyan : C.text,
            }}
          >
            {shown}
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 60, color: C.dim }}>GB</div>
        </div>

        <div style={{ marginTop: 46, width: PW }}>
          <Bar frac={raw / 26} color={tight ? C.cyan : C.red} height={40} />
        </div>

        <div
          style={{
            marginTop: 28,
            fontFamily: F.mono,
            fontSize: 28,
            letterSpacing: "0.16em",
            color: tight ? C.cyan : C.faint,
          }}
        >
          {tight ? "0.1 BITS PER WEIGHT" : "13B PARAMETERS · FP16"}
        </div>
      </Hero>

      <Foot>
        <Statement p={line} size={94}>
          And it still works.
        </Statement>
      </Foot>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 56,
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 20,
          letterSpacing: "0.34em",
          color: C.faint,
        }}
      >
        SAMSUNG LITTLEBIT
      </div>
    </Stage>
  );
};

/* -------------------------------------------------------------- s02 name --- */

const S02: React.FC = () => {
  const { frame, d } = useScene();
  const a = ph(frame, d, 0.02, 0.12);
  const b = ph(frame, d, 0.1, 0.24);
  const rule = ph(frame, d, 0.22, 0.32);
  const c1 = ph(frame, d, 0.26, 0.36);
  const c2 = ph(frame, d, 0.32, 0.42);
  const c3 = ph(frame, d, 0.44, 0.56);

  return (
    <Stage>
      <Top text="THE PAPER" />
      <Hero lift={0}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 26,
            letterSpacing: "0.34em",
            color: C.dim,
            opacity: a,
          }}
        >
          SAMSUNG LABS
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 160,
            letterSpacing: "-0.055em",
            lineHeight: 1,
            color: C.text,
            marginTop: 10,
            opacity: b,
            transform: `translateY(${(1 - b) * 30}px)`,
          }}
        >
          LittleBit
        </div>

        <div
          style={{
            width: 660 * rule,
            height: 2,
            backgroundColor: C.panelEdge,
            marginTop: 36,
          }}
        />

        <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
          <Chip label="13B PARAMETERS" p={c1} />
          <Chip label="0.1 BITS / WEIGHT" color={C.cyan} p={c2} />
        </div>

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 22,
            letterSpacing: "0.24em",
            color: C.faint,
            marginTop: 36,
            opacity: c3,
          }}
        >
          NEURIPS 2025 · CODE PUBLIC
        </div>
      </Hero>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 56,
          textAlign: "center",
          fontFamily: F.mono,
          fontSize: 19,
          letterSpacing: "0.22em",
          color: C.faint,
        }}
      >
        ARXIV · 2506.13771
      </div>
    </Stage>
  );
};

/* --------------------------------------------------------- s03 impossible --- */

const S03: React.FC = () => {
  const { frame, d } = useScene();
  const card = ph(frame, d, 0.02, 0.12);
  const row = ph(frame, d, 0.22, 0.32);
  const lit = ph(frame, d, 0.26, 0.38);
  const line = ph(frame, d, 0.64, 0.76);

  return (
    <Stage>
      <Top text="THE PROBLEM" />

      <Hero lift={240}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 40,
            padding: "24px 56px",
            border: `2px solid ${C.panelEdge}`,
            borderRadius: 30,
            backgroundColor: C.panel,
            opacity: card,
            transform: `scale(${0.94 + card * 0.06})`,
          }}
        >
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 150,
              lineHeight: 1,
              color: C.cyan,
            }}
          >
            1
          </div>
          <div style={{ width: 2, height: 118, backgroundColor: C.panelEdge }} />
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 150,
              lineHeight: 1,
              color: C.faint,
            }}
          >
            0
          </div>
        </div>

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 26,
            letterSpacing: "0.18em",
            color: C.dim,
            marginTop: 24,
            opacity: card,
          }}
        >
          ONE BIT = ONE YES OR NO
        </div>

        <div style={{ marginTop: 108, width: PW, opacity: row }}>
          <div style={{ display: "flex", height: 190 }}>
            <div
              style={{
                flex: 1,
                backgroundColor: C.amber,
                boxShadow: `0 0 ${30 + 50 * lit}px rgba(251,191,36,${0.15 + 0.35 * lit})`,
              }}
            />
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  borderLeft: `1px solid ${C.panelEdge}`,
                  backgroundColor: i % 2 ? "#141721" : "#11141B",
                }}
              />
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 24,
                letterSpacing: "0.16em",
                color: C.amber,
                opacity: 0.4 + 0.6 * lit,
              }}
            >
              0.1 BIT
            </div>
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 24,
                letterSpacing: "0.16em",
                color: C.faint,
              }}
            >
              1 BIT
            </div>
          </div>
        </div>
      </Hero>

      <Foot>
        <Statement p={line} size={96} color={C.amber}>
          A tenth of a bit.
        </Statement>
      </Foot>
    </Stage>
  );
};

/* ------------------------------------------------------------- s04 delete --- */

const S04: React.FC = () => {
  const { frame, d } = useScene();
  const appear = ph(frame, d, 0.02, 0.14);
  const wipe = lin(frame, d, 0.4, 0.66);
  const line = ph(frame, d, 0.7, 0.82);

  const gone = (i: number) => {
    const r = Math.floor(i / 5);
    const c = i % 5;
    const local = wipe - (c + r) * 0.035;
    return Math.max(0, Math.min(1, local / 0.2));
  };

  const remaining = Array.from({ length: 25 }).filter((_, i) => gone(i) < 0.98).length;

  return (
    <Stage>
      <Top text="THE TURN" />

      <Hero lift={240}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 150px)",
            gap: 10,
            opacity: appear,
          }}
        >
          {Array.from({ length: 25 }).map((_, i) => {
            const o = gone(i);
            return (
              <div
                key={i}
                style={{
                  height: 150,
                  borderRadius: 12,
                  border: `1px solid ${C.panelEdge}`,
                  backgroundColor: C.panel,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: 27,
                    color: C.text,
                    opacity: 1 - o,
                    transform: `translateY(${o * 70}px)`,
                  }}
                >
                  {weight(i)}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 38,
            fontFamily: F.mono,
            fontSize: 25,
            letterSpacing: "0.18em",
            color: remaining === 0 ? C.red : C.dim,
          }}
        >
          VALUES STORED · {String(remaining).padStart(2, "0")}
        </div>
      </Hero>

      <Foot>
        <Statement p={line} size={96} color={C.cyan}>
          They deleted
          <br />
          the numbers.
        </Statement>
      </Foot>
    </Stage>
  );
};

/* --------------------------------------------------------- s05 factorize --- */

const S05: React.FC = () => {
  const { frame, d } = useScene();
  const wIn = ph(frame, d, 0.02, 0.12);
  const abIn = ph(frame, d, 0.2, 0.32);
  const fill = lin(frame, d, 0.24, 0.54);
  const wOut = ph(frame, d, 0.58, 0.7);
  const line = ph(frame, d, 0.66, 0.78);

  const filled = Math.round(fill * 12);
  /* Ghost the big matrix instead of deleting it: the row keeps its width, so
     nothing slides, and the eye still has the "before" to compare against. */
  const wOp = wIn * (1 - 0.82 * wOut);

  return (
    <Stage>
      <Top text="THE TRICK" />

      <Hero lift={230}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 24,
            letterSpacing: "0.22em",
            color: C.faint,
            marginBottom: 28,
          }}
        >
          ONE WEIGHT MATRIX
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div style={{ opacity: wOp }}>
            <Matrix
              rows={6}
              cols={6}
              cell={44}
              gap={6}
              font={14}
              text={(r, c) => weight(r * 6 + c)}
              color={() => C.dim}
            />
          </div>

          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 700,
              fontSize: 54,
              color: C.faint,
              opacity: Math.min(wIn, abIn),
            }}
          >
            =
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: abIn }}>
            <Matrix
              rows={6}
              cols={2}
              cell={44}
              gap={6}
              font={14}
              text={(r, c) => (r * 2 + c < filled ? sign(r * 2 + c) : "")}
              color={() => C.cyan}
              bg={(r, c) => (r * 2 + c < filled ? "rgba(34,211,238,0.10)" : "transparent")}
              border={(r, c) => (r * 2 + c < filled ? "rgba(34,211,238,0.50)" : "transparent")}
            />
            <div style={{ fontFamily: F.mono, fontSize: 24, color: C.cyan, marginTop: 12 }}>A</div>
          </div>

          <div style={{ fontFamily: F.sans, fontSize: 40, color: C.faint, opacity: abIn }}>×</div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: abIn }}>
            <Matrix
              rows={2}
              cols={6}
              cell={44}
              gap={6}
              font={14}
              text={(r, c) => (r * 6 + c < filled ? sign(100 + r * 6 + c) : "")}
              color={() => C.violet}
              bg={(r, c) => (r * 6 + c < filled ? "rgba(167,139,250,0.10)" : "transparent")}
              border={(r, c) => (r * 6 + c < filled ? "rgba(167,139,250,0.50)" : "transparent")}
            />
            <div style={{ fontFamily: F.mono, fontSize: 24, color: C.violet, marginTop: 12 }}>B</div>
          </div>
        </div>
      </Hero>

      <Foot>
        <Statement p={line} size={94}>
          Only signs.
        </Statement>
      </Foot>
    </Stage>
  );
};

/* ----------------------------------------------------------- s06 rebuild --- */

const S06: React.FC = () => {
  const { frame, d } = useScene();
  const top = ph(frame, d, 0.02, 0.12);
  const sweep = lin(frame, d, 0.06, 0.34);
  const active = Math.min(5, Math.floor(sweep * 6));
  const fillAll = lin(frame, d, 0.3, 0.7);
  const line = ph(frame, d, 0.66, 0.78);

  const cellOpacity = (r: number, c: number) => {
    const diag = r === c && r <= active ? 1 : 0;
    const wave = Math.max(0, Math.min(1, (fillAll - (r + c) * 0.04) / 0.16));
    return Math.max(diag, wave);
  };

  return (
    <Stage>
      <Top text="NEVER SAVED" />

      <Hero lift={240}>
        <div style={{ display: "flex", alignItems: "center", gap: 30, opacity: top }}>
          <Matrix
            rows={6}
            cols={2}
            cell={32}
            gap={5}
            font={11}
            text={(r, c) => sign(r * 2 + c)}
            color={() => C.cyan}
            bg={(r) => (r === active ? "rgba(34,211,238,0.18)" : "transparent")}
          />
          <div style={{ fontFamily: F.sans, fontSize: 30, color: C.faint }}>×</div>
          <Matrix
            rows={2}
            cols={6}
            cell={32}
            gap={5}
            font={11}
            text={(r, c) => sign(100 + r * 6 + c)}
            color={() => C.violet}
            bg={(_, c) => (c === active ? "rgba(167,139,250,0.18)" : "transparent")}
          />
        </div>

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 26,
            color: C.faint,
            margin: "30px 0 26px",
            opacity: top,
          }}
        >
          ↓
        </div>

        <Matrix
          rows={6}
          cols={6}
          cell={62}
          gap={7}
          font={15}
          text={(r, c) => weight(r * 6 + c)}
          color={(r, c) => (r === c ? C.cyan : C.text)}
          opacity={(r, c) => cellOpacity(r, c) * (r === c ? 1 : 0.82)}
        />

        <div
          style={{
            marginTop: 34,
            fontFamily: F.mono,
            fontSize: 24,
            letterSpacing: "0.2em",
            color: C.faint,
            opacity: top,
          }}
        >
          THE BIG MATRIX IS NOT IN THE FILE
        </div>
      </Hero>

      <Foot>
        <Statement p={line} size={84}>
          Rebuilt,
          <br />
          not stored.
        </Statement>
      </Foot>
    </Stage>
  );
};

/* --------------------------------------------------------- s07 accounting --- */

const LedgerRow: React.FC<{
  label: string;
  value: string;
  color: string;
  p: number;
  last?: boolean;
}> = ({ label, value, color, p, last }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "36px 38px",
      borderBottom: last ? "none" : `1px solid ${C.panelEdge}`,
      opacity: p,
    }}
  >
    <div style={{ fontFamily: F.mono, fontSize: 23, letterSpacing: "0.12em", color: C.dim }}>
      {label}
    </div>
    <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 48, color }}>{value}</div>
  </div>
);

const S07: React.FC = () => {
  const { frame, d } = useScene();
  const r1 = ph(frame, d, 0.04, 0.14);
  const r2 = ph(frame, d, 0.16, 0.26);
  const big = ph(frame, d, 0.3, 0.44);
  const line = ph(frame, d, 0.68, 0.8);

  return (
    <Stage>
      <Top text="THE ACCOUNTING" />

      <Hero lift={240}>
        <div
          style={{
            width: PW,
            border: `1px solid ${C.panelEdge}`,
            borderRadius: 22,
            backgroundColor: C.panel,
            overflow: "hidden",
          }}
        >
          <LedgerRow label="13B WEIGHTS × 16 BIT" value="26 GB" color={C.text} p={r1} />
          <LedgerRow label="LOW-RANK FACTORS" value="0.9 GB" color={C.cyan} p={r2} last />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 18,
            marginTop: 64,
            opacity: big,
            transform: `scale(${0.92 + big * 0.08})`,
          }}
        >
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 250,
              lineHeight: 0.9,
              letterSpacing: "-0.06em",
              color: C.cyan,
            }}
          >
            0.1
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 30, color: C.dim }}>BITS</div>
        </div>

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 24,
            letterSpacing: "0.2em",
            color: C.dim,
            marginTop: 10,
            opacity: big,
          }}
        >
          PER ORIGINAL WEIGHT
        </div>
      </Hero>

      <Foot>
        <Statement p={line} size={90}>
          Shared,
          <br />
          not stored.
        </Statement>
      </Foot>
    </Stage>
  );
};

/* ------------------------------------------------------- s08 compensation --- */

const S08: React.FC = () => {
  const { frame, d } = useScene();
  const stamp = ph(frame, d, 0.02, 0.12);
  const e1 = ph(frame, d, 0.16, 0.28);
  const e2 = ph(frame, d, 0.32, 0.44);
  const line = ph(frame, d, 0.7, 0.82);

  /* Schematic, not a measurement: the paper does not publish a single
     reconstruction-error percentage, so the bar carries direction only. */
  const err = 100 - 55 * e1 - 37 * e2;
  const color = err > 60 ? C.red : err > 25 ? C.amber : C.green;

  return (
    <Stage>
      <Top text="THE FIX" />

      <Hero lift={240}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 28,
            letterSpacing: "0.26em",
            color: C.text,
            opacity: stamp,
          }}
        >
          LATENT FACTORIZATION
        </div>

        <div style={{ width: PW, marginTop: 96, opacity: stamp }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ fontFamily: F.mono, fontSize: 24, color: C.dim, letterSpacing: "0.16em" }}>
              RECONSTRUCTION ERROR
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 24, color: C.faint, letterSpacing: "0.12em" }}>
              SCHEMATIC
            </div>
          </div>

          <Bar frac={err / 100} color={color} height={30} />

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <div style={{ fontFamily: F.mono, fontSize: 21, color: C.faint, letterSpacing: "0.14em" }}>
              SIGNS ONLY
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 21, color: C.faint, letterSpacing: "0.14em" }}>
              AFTER COMPENSATION
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 72 }}>
          <Chip
            label="SIGN FACTORS"
            color={e1 > 0.7 ? C.cyan : C.faint}
            p={0.45 + 0.55 * e1}
          />
          <Chip
            label="COMPENSATION"
            color={e2 > 0.7 ? C.green : C.faint}
            p={0.45 + 0.55 * e2}
          />
        </div>
      </Hero>

      <Foot>
        <Statement p={line} size={82}>
          Recover what
          <br />
          the signs
          <br />
          throw away.
        </Statement>
      </Foot>
    </Stage>
  );
};

/* --------------------------------------------------------------- s09 stats --- */

const S09: React.FC = () => {
  const { frame, d } = useScene();
  const c1 = ph(frame, d, 0.06, 0.3);
  const c2 = ph(frame, d, 0.28, 0.52);
  const note = ph(frame, d, 0.54, 0.66);
  const n1 = Math.round(1 + c1 * 30);
  const n2 = (1 + c2 * 10.6).toFixed(1);

  return (
    <Stage>
      <Top text="THE NUMBERS" />

      <Hero lift={0}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 62 }}>
          <Stat value={`${n1}×`} label="LESS MEMORY" p={0.3 + 0.7 * c1} size={230} />

          <div style={{ width: 280, height: 1, backgroundColor: C.panelEdge }} />

          <Stat
            value={`${n2}×`}
            label="FASTER THAN FP16"
            p={0.3 + 0.7 * c2}
            size={230}
            color={C.cyan}
            note="POTENTIAL · PAPER ESTIMATE"
            noteP={note}
          />

          <div
            style={{
              fontFamily: F.mono,
              fontSize: 20,
              letterSpacing: "0.16em",
              color: C.faint,
              opacity: note,
            }}
          >
            NOT A MEASURED BENCHMARK
          </div>
        </div>
      </Hero>
    </Stage>
  );
};

/* ------------------------------------------------------------- s10 quality --- */

const QCard: React.FC<{
  label: string;
  bits: string;
  bitFrac: number;
  qualityLabel: string;
  quality: number;
  bitsP: number;
  p: number;
  accent: string;
}> = ({ label, bits, bitFrac, qualityLabel, quality, bitsP, p, accent }) => (
  <div
    style={{
      width: PW,
      border: `1px solid ${C.panelEdge}`,
      borderRadius: 20,
      backgroundColor: C.panel,
      padding: "28px 34px",
      boxSizing: "border-box",
      opacity: p,
    }}
  >
    <div
      style={{
        fontFamily: F.mono,
        fontSize: 25,
        letterSpacing: "0.22em",
        color: accent,
        marginBottom: 22,
      }}
    >
      {label}
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ fontFamily: F.mono, fontSize: 22, color: C.dim, width: 104 }}>QUALITY</div>
      <Bar frac={quality} color={C.green} height={18} width={500} />
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 21,
          color: C.green,
          width: 110,
          textAlign: "right",
        }}
      >
        {qualityLabel}
      </div>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 20 }}>
      <div style={{ fontFamily: F.mono, fontSize: 22, color: C.dim, width: 104 }}>BITS</div>
      <Bar frac={bitFrac * bitsP} color={C.amber} height={18} width={500} />
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 21,
          color: C.amber,
          width: 110,
          textAlign: "right",
        }}
      >
        {bits}
      </div>
    </div>
  </div>
);

const S10: React.FC = () => {
  const { frame, d } = useScene();
  const p1 = ph(frame, d, 0.02, 0.1);
  const p2 = ph(frame, d, 0.08, 0.16);
  const q = ph(frame, d, 0.14, 0.3);
  const b1 = ph(frame, d, 0.2, 0.32);
  const b2 = ph(frame, d, 0.26, 0.38);
  const line = ph(frame, d, 0.66, 0.78);

  return (
    <Stage>
      <Top text="THE RESULT" />

      <Hero lift={250}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 21,
            letterSpacing: "0.18em",
            color: C.faint,
            marginBottom: 24,
          }}
        >
          QUALITY RELATIVE TO A 1-BIT BASELINE
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <QCard
            label="1-BIT"
            bits="1.0"
            bitFrac={1}
            qualityLabel="BASELINE"
            quality={q}
            bitsP={b1}
            p={p1}
            accent={C.dim}
          />
          <QCard
            label="0.1-BIT · LITTLEBIT"
            bits="0.1"
            bitFrac={0.1}
            qualityLabel="MATCH"
            quality={q}
            bitsP={b2}
            p={p2}
            accent={C.cyan}
          />
        </div>
      </Hero>

      <Foot>
        <Statement p={line} size={78}>
          Same quality.
          <br />
          A tenth of the bits.
        </Statement>
      </Foot>
    </Stage>
  );
};

/* ------------------------------------------------------------- s11 devices --- */

const Phone: React.FC<{ p: number }> = ({ p }) => (
  <div
    style={{
      width: 170,
      height: 344,
      borderRadius: 30,
      border: `3px solid ${C.panelEdge}`,
      backgroundColor: C.panel,
      padding: 14,
      boxSizing: "border-box",
      display: "flex",
      alignItems: "flex-end",
      opacity: p,
    }}
  >
    <div style={{ width: "100%", height: 116, borderRadius: 12, backgroundColor: C.cyan, opacity: 0.9 }} />
  </div>
);

const Laptop: React.FC<{ p: number }> = ({ p }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: p }}>
    <div
      style={{
        width: 320,
        height: 208,
        borderRadius: 14,
        border: `3px solid ${C.panelEdge}`,
        backgroundColor: C.panel,
        padding: 14,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <div style={{ width: "100%", height: 92, borderRadius: 10, backgroundColor: C.cyan, opacity: 0.9 }} />
    </div>
    <div style={{ width: 348, height: 12, borderRadius: 5, backgroundColor: C.panelEdge, marginTop: 8 }} />
  </div>
);

const Watch: React.FC<{ p: number }> = ({ p }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: p }}>
    <div style={{ width: 56, height: 28, backgroundColor: C.panelEdge, borderRadius: 7 }} />
    <div
      style={{
        width: 148,
        height: 162,
        borderRadius: 42,
        border: `3px solid ${C.panelEdge}`,
        backgroundColor: C.panel,
        padding: 12,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <div style={{ width: "100%", height: 52, borderRadius: 9, backgroundColor: C.cyan, opacity: 0.9 }} />
    </div>
    <div style={{ width: 56, height: 28, backgroundColor: C.panelEdge, borderRadius: 7 }} />
  </div>
);

const S11: React.FC = () => {
  const { frame, d } = useScene();
  const a = ph(frame, d, 0.02, 0.14);
  const b = ph(frame, d, 0.1, 0.24);
  const c = ph(frame, d, 0.18, 0.32);
  const line = ph(frame, d, 0.42, 0.54);
  const note = ph(frame, d, 0.56, 0.68);

  return (
    <Stage>
      <Top text="ON DEVICE" />

      <Hero lift={250}>
        <div style={{ display: "flex", alignItems: "center", gap: 38 }}>
          <Phone p={a} />
          <Laptop p={b} />
          <Watch p={c} />
        </div>
      </Hero>

      <Foot>
        <Statement p={line} size={104} color={C.cyan}>
          On device.
        </Statement>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 24,
            letterSpacing: "0.18em",
            color: C.dim,
            marginTop: 24,
            opacity: note,
          }}
        >
          13B · UNDER 0.9 GB
        </div>
      </Foot>
    </Stage>
  );
};

/* ------------------------------------------------------------- s12 thesis --- */

const Glyph: React.FC<{ on: boolean }> = ({ on }) => (
  <div
    style={{
      width: 84,
      height: 84,
      borderRadius: 16,
      border: `2px solid ${on ? "rgba(34,211,238,0.55)" : C.panelEdge}`,
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 6,
      padding: 12,
      boxSizing: "border-box",
      flexShrink: 0,
    }}
  >
    {Array.from({ length: 9 }).map((_, i) => (
      <div
        key={i}
        style={{
          borderRadius: 3,
          backgroundColor: on ? C.cyan : C.faint,
          opacity: on ? 0.9 : 0.35,
        }}
      />
    ))}
  </div>
);

const S12: React.FC = () => {
  const { frame, d } = useScene();
  const a = ph(frame, d, 0.04, 0.18);
  const b = ph(frame, d, 0.3, 0.48);

  return (
    <Stage>
      <Top text="THE POINT" />

      <Hero lift={0}>
        <div style={{ display: "flex", flexDirection: "column", gap: 54 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 30, opacity: a }}>
            <Glyph on={false} />
            <div
              style={{
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 84,
                letterSpacing: "-0.045em",
                color: C.faint,
              }}
            >
              Not smaller chips.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 30,
              opacity: b,
              transform: `translateY(${(1 - b) * 26}px)`,
            }}
          >
            <Glyph on />
            <div
              style={{
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 84,
                letterSpacing: "-0.045em",
                color: C.cyan,
              }}
            >
              Smaller numbers.
            </div>
          </div>
        </div>
      </Hero>
    </Stage>
  );
};

/* ---------------------------------------------------------------- s13 end --- */

const S13: React.FC = () => {
  const { frame, d } = useScene();
  const a = ph(frame, d, 0.06, 0.3);
  const b = ph(frame, d, 0.24, 0.46);
  const c = ph(frame, d, 0.4, 0.62);

  return (
    <Stage>
      <Hero lift={0}>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 76,
            letterSpacing: "-0.04em",
            color: C.text,
            opacity: a,
            transform: `translateY(${(1 - a) * 24}px)`,
          }}
        >
          The Layer Below
        </div>

        <div style={{ width: 220 * b, height: 2, backgroundColor: C.panelEdge, marginTop: 34 }} />

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 22,
            letterSpacing: "0.24em",
            color: C.faint,
            marginTop: 30,
            opacity: c,
          }}
        >
          SAMSUNG LITTLEBIT · NEURIPS 2025
        </div>
      </Hero>
    </Stage>
  );
};

/* ------------------------------------------------------------- timeline --- */

const ORDER = [
  "s01",
  "s02",
  "s03",
  "s04",
  "s05",
  "s06",
  "s07",
  "s08",
  "s09",
  "s10",
  "s11",
  "s12",
  "s13",
];

const SCENE_NODES: Record<string, React.ReactNode> = {
  s01: <S01 />,
  s02: <S02 />,
  s03: <S03 />,
  s04: <S04 />,
  s05: <S05 />,
  s06: <S06 />,
  s07: <S07 />,
  s08: <S08 />,
  s09: <S09 />,
  s10: <S10 />,
  s11: <S11 />,
  s12: <S12 />,
  s13: <S13 />,
};

const PLAN = buildPlan(ORDER, timings, TAIL_FRAMES);

export const DURATION = timelineFrames(PLAN);

export const LittleBit: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    <Backdrop />
    {PLAN.map((p) => (
      <Sequence key={p.id} from={p.from} durationInFrames={p.dur}>
        <Audio src={staticFile(`audio/littlebit/${p.id}.wav`)} />
        {SCENE_NODES[p.id]}
      </Sequence>
    ))}
    <Watermark text="THE LAYER BELOW" />
  </AbsoluteFill>
);
