import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { C, F } from "../theme";
import { Backdrop, Stage, Watermark } from "../chrome";
import {
  Bar,
  Chip,
  Matrix,
  PW,
  Stat,
  Statement,
  Top,
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

   TAIL_FRAMES stays in this file: tools/audit.py reads it out of the episode
   source by regex to compute the expected render duration. */

const TAIL_FRAMES = 12;

/* ------------------------------------------------------------- s01 hook --- */

const S01: React.FC = () => {
  const { frame, d } = useScene();
  const build = ph(frame, d, 0.02, 0.32);
  const crush = ph(frame, d, 0.44, 0.6);
  const raw = (1 - crush) * 26 * build + crush * 0.9;
  const tight = crush > 0.45;
  const shown = tight ? raw.toFixed(1) : String(Math.round(raw));
  const line = ph(frame, d, 0.64, 0.74);
  const brand = ph(frame, d, 0.76, 0.86);

  return (
    <Stage>
      <Top text="MEMORY" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 330,
              lineHeight: 0.9,
              letterSpacing: "-0.06em",
              color: tight ? C.cyan : C.text,
            }}
          >
            {shown}
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 56, color: C.dim }}>GB</div>
        </div>

        <div style={{ marginTop: 26 }}>
          <Bar frac={raw / 26} color={tight ? C.cyan : C.red} height={28} />
        </div>

        <div
          style={{
            marginTop: 22,
            fontFamily: F.mono,
            fontSize: 26,
            letterSpacing: "0.16em",
            color: tight ? C.cyan : C.faint,
          }}
        >
          {tight ? "0.1 BITS PER WEIGHT" : "13B PARAMETERS · FP16"}
        </div>

        <div style={{ marginTop: 168 }}>
          <Statement p={line} size={92}>
            And it still works.
          </Statement>
        </div>

        <div
          style={{
            marginTop: 28,
            fontFamily: F.mono,
            fontSize: 26,
            letterSpacing: "0.3em",
            color: C.dim,
            opacity: brand,
          }}
        >
          SAMSUNG LITTLEBIT
        </div>
      </div>
    </Stage>
  );
};

/* -------------------------------------------------------------- s02 name --- */

const S02: React.FC = () => {
  const { frame, d } = useScene();
  const a = ph(frame, d, 0.02, 0.16);
  const b = ph(frame, d, 0.14, 0.32);
  const rule = ph(frame, d, 0.32, 0.46);
  const c1 = ph(frame, d, 0.44, 0.58);
  const c2 = ph(frame, d, 0.54, 0.68);
  const c3 = ph(frame, d, 0.66, 0.8);

  return (
    <Stage>
      <Top text="THE PAPER" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
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
            fontSize: 156,
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
            width: 640 * rule,
            height: 2,
            backgroundColor: C.panelEdge,
            marginTop: 34,
          }}
        />

        <div style={{ display: "flex", gap: 16, marginTop: 36 }}>
          <Chip label="13B PARAMETERS" p={c1} />
          <Chip label="0.1 BITS / WEIGHT" color={C.cyan} p={c2} />
        </div>

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 22,
            letterSpacing: "0.24em",
            color: C.faint,
            marginTop: 34,
            opacity: c3,
          }}
        >
          NEURIPS 2025 · CODE PUBLIC
        </div>
      </div>
    </Stage>
  );
};

/* --------------------------------------------------------- s03 impossible --- */

const S03: React.FC = () => {
  const { frame, d } = useScene();
  const card = ph(frame, d, 0.02, 0.16);
  const strip = ph(frame, d, 0.42, 0.56);
  const lit = ph(frame, d, 0.56, 0.68);
  const line = ph(frame, d, 0.74, 0.86);

  return (
    <Stage>
      <Top text="THE PROBLEM" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 44,
            padding: "30px 56px",
            border: `2px solid ${C.panelEdge}`,
            borderRadius: 32,
            backgroundColor: C.panel,
            opacity: card,
            transform: `scale(${0.92 + card * 0.08})`,
          }}
        >
          <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 140, color: C.cyan }}>
            1
          </div>
          <div style={{ width: 2, height: 118, backgroundColor: C.panelEdge }} />
          <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 140, color: C.faint }}>
            0
          </div>
        </div>

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 26,
            letterSpacing: "0.18em",
            color: C.dim,
            marginTop: 26,
            opacity: card,
          }}
        >
          ONE BIT = ONE YES OR NO
        </div>

        <div style={{ marginTop: 116, width: PW, opacity: strip }}>
          <div style={{ display: "flex", gap: 5 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 122,
                  borderRadius: 10,
                  backgroundColor: i === 3 ? C.amber : "#151823",
                  border: `1px solid ${C.panelEdge}`,
                  opacity: i === 3 ? 0.22 + 0.78 * lit : 1,
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
            <div style={{ fontFamily: F.mono, fontSize: 24, color: C.faint }}>0 BITS</div>
            <div style={{ fontFamily: F.mono, fontSize: 24, color: C.faint }}>1 BIT</div>
          </div>
        </div>

        <div style={{ marginTop: 84 }}>
          <Statement p={line} size={92} color={C.amber}>
            A tenth of a bit.
          </Statement>
        </div>
      </div>
    </Stage>
  );
};

/* ------------------------------------------------------------- s04 delete --- */

const S04: React.FC = () => {
  const { frame, d } = useScene();
  const appear = ph(frame, d, 0.02, 0.16);
  const wipe = ph(frame, d, 0.42, 0.74);
  const line = ph(frame, d, 0.76, 0.88);
  const gone = (i: number) => Math.max(0, Math.min(1, (wipe - i * 0.022) / 0.3));

  return (
    <Stage>
      <Top text="THE TURN" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
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
                    transform: `translateY(${o * 64}px)`,
                  }}
                >
                  {weight(i)}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 104 }}>
          <Statement p={line} size={96} color={C.cyan}>
            They deleted
            <br />
            the numbers.
          </Statement>
        </div>
      </div>
    </Stage>
  );
};

/* --------------------------------------------------------- s05 factorize --- */

const S05: React.FC = () => {
  const { frame, d } = useScene();
  const wIn = ph(frame, d, 0.02, 0.16);
  const wOut = ph(frame, d, 0.3, 0.42);
  const abIn = ph(frame, d, 0.4, 0.54);
  const fill = ph(frame, d, 0.5, 0.82);
  const filled = Math.round(fill * 12);

  return (
    <Stage>
      <Top text="THE TRICK" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 24,
            letterSpacing: "0.2em",
            color: C.faint,
            marginBottom: 12,
            opacity: wIn,
          }}
        >
          W · WEIGHTS
        </div>

        <Matrix
          rows={6}
          cols={6}
          cell={44}
          font={13}
          text={(r, c) => weight(r * 6 + c)}
          color={() => C.dim}
          opacity={() => wIn * (1 - wOut)}
        />

        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 58,
            color: C.faint,
            marginTop: 22,
            marginBottom: 22,
            opacity: abIn,
          }}
        >
          =
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 46,
            opacity: abIn,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Matrix
              rows={6}
              cols={2}
              cell={44}
              font={15}
              text={(r, c) => (r * 2 + c < filled ? sign(r * 2 + c) : "")}
              color={() => C.cyan}
              border={(r, c) =>
                r * 2 + c < filled ? "rgba(34,211,238,0.45)" : C.panelEdge
              }
            />
            <div style={{ fontFamily: F.mono, fontSize: 22, color: C.dim, marginTop: 10 }}>A</div>
          </div>

          <div style={{ fontFamily: F.sans, fontSize: 40, color: C.faint }}>×</div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Matrix
              rows={2}
              cols={6}
              cell={44}
              font={15}
              text={(r, c) => (r * 6 + c < filled ? sign(100 + r * 6 + c) : "")}
              color={() => C.violet}
              border={(r, c) =>
                r * 6 + c < filled ? "rgba(167,139,250,0.45)" : C.panelEdge
              }
            />
            <div style={{ fontFamily: F.mono, fontSize: 22, color: C.dim, marginTop: 10 }}>B</div>
          </div>
        </div>

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 24,
            letterSpacing: "0.2em",
            color: C.faint,
            marginTop: 34,
            opacity: abIn,
          }}
        >
          ONLY SIGNS. NO NUMBERS.
        </div>
      </div>
    </Stage>
  );
};

/* ----------------------------------------------------------- s06 rebuild --- */

const S06: React.FC = () => {
  const { frame, d } = useScene();
  const top = ph(frame, d, 0.02, 0.16);
  const sweep = ph(frame, d, 0.06, 0.5);
  const active = Math.min(5, Math.floor(sweep * 6));
  const fillAll = ph(frame, d, 0.5, 0.95);
  const note = ph(frame, d, 0.9, 1);

  const cellOpacity = (r: number, c: number) => {
    const diag = r === c && r <= active ? 1 : 0;
    const wave = Math.max(0, Math.min(1, (fillAll - (r + c) * 0.05) / 0.15));
    return Math.max(diag, wave);
  };

  return (
    <Stage>
      <Top text="NEVER SAVED" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 34, opacity: top }}>
          <Matrix
            rows={6}
            cols={2}
            cell={30}
            font={11}
            text={(r, c) => sign(r * 2 + c)}
            color={() => C.cyan}
            bg={(r, c) => (r === active ? "rgba(34,211,238,0.18)" : "transparent")}
          />
          <div style={{ fontFamily: F.sans, fontSize: 28, color: C.faint }}>×</div>
          <Matrix
            rows={2}
            cols={6}
            cell={30}
            font={11}
            text={(r, c) => sign(100 + r * 6 + c)}
            color={() => C.violet}
            bg={(r, c) => (c === active ? "rgba(167,139,250,0.18)" : "transparent")}
          />
        </div>

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 24,
            color: C.faint,
            margin: "34px 0 30px",
            opacity: top,
          }}
        >
          ↓
        </div>

        <Matrix
          rows={6}
          cols={6}
          cell={58}
          font={15}
          text={(r, c) => weight(r * 6 + c)}
          color={(r, c) => (r === c ? C.cyan : C.text)}
          opacity={(r, c) => cellOpacity(r, c) * (r === c ? 1 : 0.82)}
        />

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 24,
            letterSpacing: "0.2em",
            color: C.cyan,
            marginTop: 40,
            opacity: note,
          }}
        >
          REBUILT ON THE FLY
        </div>
      </div>
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
      padding: "34px 36px",
      borderBottom: last ? "none" : `1px solid ${C.panelEdge}`,
      opacity: p,
    }}
  >
    <div style={{ fontFamily: F.mono, fontSize: 23, letterSpacing: "0.12em", color: C.dim }}>
      {label}
    </div>
    <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 46, color }}>{value}</div>
  </div>
);

const S07: React.FC = () => {
  const { frame, d } = useScene();
  const r1 = ph(frame, d, 0.04, 0.18);
  const r2 = ph(frame, d, 0.2, 0.34);
  const big = ph(frame, d, 0.42, 0.58);
  const line = ph(frame, d, 0.72, 0.86);

  return (
    <Stage>
      <Top text="THE ACCOUNTING" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
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
            marginTop: 70,
            opacity: big,
            transform: `scale(${0.9 + big * 0.1})`,
          }}
        >
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 236,
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
            marginTop: 12,
            opacity: big,
          }}
        >
          PER ORIGINAL WEIGHT
        </div>

        <div style={{ marginTop: 62 }}>
          <Statement p={line} size={88}>
            Shared,
            <br />
            not stored.
          </Statement>
        </div>
      </div>
    </Stage>
  );
};

/* ------------------------------------------------------- s08 compensation --- */

const S08: React.FC = () => {
  const { frame, d } = useScene();
  const stamp = ph(frame, d, 0.02, 0.16);
  const e1 = ph(frame, d, 0.22, 0.34);
  const e2 = ph(frame, d, 0.4, 0.52);
  const e3 = ph(frame, d, 0.58, 0.7);
  const line = ph(frame, d, 0.76, 0.9);
  const err = 100 - 46 * e1 - 30 * e2 - 16 * e3;

  return (
    <Stage>
      <Top text="THE FIX" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
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
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontFamily: F.mono, fontSize: 24, color: C.dim, letterSpacing: "0.16em" }}>
              RECONSTRUCTION ERROR
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 26, color: C.red }}>
              {Math.max(0, err).toFixed(0)}%
            </div>
          </div>
          <Bar frac={err / 100} color={err > 40 ? C.red : err > 15 ? C.amber : C.green} height={22} />
        </div>

        <div style={{ display: "flex", gap: 14, marginTop: 76 }}>
          <Chip label="ROW" color={e1 > 0.6 ? C.green : C.faint} p={0.4 + 0.6 * e1} />
          <Chip label="COLUMN" color={e2 > 0.6 ? C.green : C.faint} p={0.4 + 0.6 * e2} />
          <Chip label="LATENT" color={e3 > 0.6 ? C.green : C.faint} p={0.4 + 0.6 * e3} />
        </div>

        <div style={{ marginTop: 96 }}>
          <Statement p={line} size={86}>
            Recover what
            <br />
            the signs
            <br />
            throw away.
          </Statement>
        </div>
      </div>
    </Stage>
  );
};

/* --------------------------------------------------------------- s09 stats --- */

const S09: React.FC = () => {
  const { frame, d } = useScene();
  const c1 = ph(frame, d, 0.04, 0.34);
  const c2 = ph(frame, d, 0.38, 0.68);
  const n1 = Math.round(1 + c1 * 30);
  const n2 = (1 + c2 * 10.6).toFixed(1);
  const note = ph(frame, d, 0.68, 0.8);

  return (
    <Stage>
      <Top text="THE NUMBERS" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 66 }}>
        <Stat value={`${n1}×`} label="LESS MEMORY" p={0.3 + 0.7 * c1} size={220} />
        <div style={{ width: 260, height: 1, backgroundColor: C.panelEdge }} />
        <Stat
          value={`${n2}×`}
          label="FASTER THAN FP16"
          p={0.3 + 0.7 * c2}
          size={220}
          color={C.cyan}
        />
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 20,
            letterSpacing: "0.14em",
            color: C.amber,
            border: "1px solid rgba(251,191,36,0.35)",
            borderRadius: 8,
            padding: "8px 14px",
            opacity: note,
          }}
        >
          POTENTIAL · PAPER ESTIMATE
        </div>
      </div>
    </Stage>
  );
};

/* ------------------------------------------------------------- s10 quality --- */

const QCard: React.FC<{
  label: string;
  bits: string;
  bitFrac: number;
  quality: number;
  bitsP: number;
  p: number;
  accent: string;
}> = ({ label, bits, bitFrac, quality, bitsP, p, accent }) => (
  <div
    style={{
      width: PW,
      border: `1px solid ${C.panelEdge}`,
      borderRadius: 20,
      backgroundColor: C.panel,
      padding: "30px 34px",
      boxSizing: "border-box",
      opacity: p,
    }}
  >
    <div
      style={{
        fontFamily: F.mono,
        fontSize: 26,
        letterSpacing: "0.22em",
        color: accent,
        marginBottom: 24,
      }}
    >
      {label}
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <div style={{ fontFamily: F.mono, fontSize: 22, color: C.dim, width: 108 }}>QUALITY</div>
      <div style={{ flex: 1 }}>
        <Bar frac={quality} color={C.green} height={18} width={520} />
      </div>
      <div style={{ fontFamily: F.mono, fontSize: 22, color: C.green, width: 78, textAlign: "right" }}>
        100%
      </div>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 20 }}>
      <div style={{ fontFamily: F.mono, fontSize: 22, color: C.dim, width: 108 }}>BITS</div>
      <div style={{ flex: 1 }}>
        <Bar frac={bitFrac * bitsP} color={C.amber} height={18} width={520} />
      </div>
      <div style={{ fontFamily: F.mono, fontSize: 22, color: C.amber, width: 78, textAlign: "right" }}>
        {bits}
      </div>
    </div>
  </div>
);

const S10: React.FC = () => {
  const { frame, d } = useScene();
  const p1 = ph(frame, d, 0.02, 0.16);
  const p2 = ph(frame, d, 0.16, 0.3);
  const q = ph(frame, d, 0.3, 0.5);
  const b1 = ph(frame, d, 0.5, 0.66);
  const b2 = ph(frame, d, 0.6, 0.78);
  const line = ph(frame, d, 0.8, 0.94);

  return (
    <Stage>
      <Top text="THE RESULT" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <QCard label="1-BIT" bits="1.0" bitFrac={1} quality={q} bitsP={b1} p={p1} accent={C.dim} />
        <QCard
          label="0.1-BIT · LITTLEBIT"
          bits="0.1"
          bitFrac={0.1}
          quality={q}
          bitsP={b2}
          p={p2}
          accent={C.cyan}
        />
        <div style={{ marginTop: 54 }}>
          <Statement p={line} size={76} color={C.text}>
            Same quality.
            <br />
            A tenth of the bits.
          </Statement>
        </div>
      </div>
    </Stage>
  );
};

/* ------------------------------------------------------------- s11 devices --- */

const Phone: React.FC<{ p: number }> = ({ p }) => (
  <div
    style={{
      width: 132,
      height: 268,
      borderRadius: 24,
      border: `3px solid ${C.panelEdge}`,
      backgroundColor: C.panel,
      padding: 12,
      boxSizing: "border-box",
      display: "flex",
      alignItems: "flex-end",
      opacity: p,
    }}
  >
    <div style={{ width: "100%", height: 86, borderRadius: 10, backgroundColor: C.cyan, opacity: 0.85 }} />
  </div>
);

const Laptop: React.FC<{ p: number }> = ({ p }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: p }}>
    <div
      style={{
        width: 240,
        height: 158,
        borderRadius: 12,
        border: `3px solid ${C.panelEdge}`,
        backgroundColor: C.panel,
        padding: 12,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <div style={{ width: "100%", height: 62, borderRadius: 8, backgroundColor: C.cyan, opacity: 0.85 }} />
    </div>
    <div style={{ width: 264, height: 10, borderRadius: 4, backgroundColor: C.panelEdge, marginTop: 6 }} />
  </div>
);

const Watch: React.FC<{ p: number }> = ({ p }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: p }}>
    <div style={{ width: 46, height: 24, backgroundColor: C.panelEdge, borderRadius: 6 }} />
    <div
      style={{
        width: 118,
        height: 130,
        borderRadius: 34,
        border: `3px solid ${C.panelEdge}`,
        backgroundColor: C.panel,
        padding: 10,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <div style={{ width: "100%", height: 40, borderRadius: 8, backgroundColor: C.cyan, opacity: 0.85 }} />
    </div>
    <div style={{ width: 46, height: 24, backgroundColor: C.panelEdge, borderRadius: 6 }} />
  </div>
);

const S11: React.FC = () => {
  const { frame, d } = useScene();
  const a = ph(frame, d, 0.02, 0.16);
  const b = ph(frame, d, 0.12, 0.28);
  const c = ph(frame, d, 0.22, 0.38);
  const line = ph(frame, d, 0.46, 0.62);
  const note = ph(frame, d, 0.66, 0.8);

  return (
    <Stage>
      <Top text="ON DEVICE" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <Phone p={a} />
          <Laptop p={b} />
          <Watch p={c} />
        </div>

        <div style={{ marginTop: 92 }}>
          <Statement p={line} size={100} color={C.cyan}>
            On device.
          </Statement>
        </div>

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 24,
            letterSpacing: "0.18em",
            color: C.dim,
            marginTop: 26,
            opacity: note,
          }}
        >
          13B · UNDER 0.9 GB
        </div>
      </div>
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
  const a = ph(frame, d, 0.04, 0.2);
  const b = ph(frame, d, 0.4, 0.58);

  return (
    <Stage>
      <Top text="THE POINT" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 46 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30, ...{ opacity: a } }}>
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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
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
      </div>
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
