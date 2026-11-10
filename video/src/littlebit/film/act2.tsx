import React from "react";
import { C, F } from "../../theme";
import { Kicker, Stage, Statement } from "../../kit/film";
import { Code, Equation, MatrixGrid, rise } from "../../kit/scenes";
import { ph, rnd, useScene } from "../../kit/core";

/* ACT 2 - DELETE THE NUMBERS. The mechanism: factor, binarize, rebuild. */

/** A rectangle of matrix cells. Tall and thin, or short and wide. */
const Rect: React.FC<{
  cols: number;
  rows: number;
  w: number;
  h: number;
  mode: "float" | "binary";
  label?: string;
  color?: string;
  at?: number;
}> = ({ cols, rows, w, h, mode, label, color = C.cyan, at = 0 }) => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.7);
  const cw = w / cols;
  const ch = h / rows;
  const shown = Math.floor(p * cols * rows);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div
        style={{
          width: w,
          height: h,
          position: "relative",
          border: `1px solid ${C.panelEdge}`,
          borderRadius: 10,
          backgroundColor: "#0B0D14",
          overflow: "hidden",
        }}
      >
        {Array.from({ length: cols * rows }).map((_, i) => {
          const on = i < shown;
          const r = rnd(i + 7);
          const col = mode === "binary" ? (r > 0.5 ? C.cyan : C.violet) : color;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: (i % cols) * cw,
                top: Math.floor(i / cols) * ch,
                width: cw,
                height: ch,
                backgroundColor: on ? col : "rgba(255,255,255,0.04)",
                opacity: on ? (mode === "binary" ? 0.9 : 0.16 + r * 0.5) : 1,
              }}
            />
          );
        })}
      </div>
      {label ? (
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 19,
            letterSpacing: "0.22em",
            color: C.faint,
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

const Scene08: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.6);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <Kicker text="SAMSUNG'S LITTLEBIT" />
        <div style={rise(p)}>
          <Statement
            lines={["It does not store smaller numbers.", "It deletes them."]}
            accent={1}
            size={88}
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene09: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.6);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <Kicker text="A MODEL'S WEIGHTS ARE MATRICES" />
        <div style={rise(p)}>
          <Statement lines={["Take one."]} accent={0} size={92} />
        </div>
      </div>
    </Stage>
  );
};

const Scene10: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.06, 0.8);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <Kicker text="FOUR THOUSAND BY FOUR THOUSAND" />
        <div style={{ ...rise(p), position: "absolute", opacity: 0.92 }}>
          <MatrixGrid rows={22} cols={22} cell={30} gap={5} mode="float" from={0.03} to={0.97} />
        </div>
        <div
          style={{
            position: "relative",
            marginTop: 560,
            fontFamily: F.mono,
            fontSize: 22,
            letterSpacing: "0.22em",
            color: C.faint,
            opacity: ph(frame, d, 0.5, 0.85),
          }}
        >
          4096 x 4096 = 16.7 MILLION ENTRIES
        </div>
      </div>
    </Stage>
  );
};

const Scene11: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.7);
  const cols = 26;
  const rows = 14;
  const live = [3, 4, 9, 10, 11, 17, 18];
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <Kicker text="AND THAT MATRIX IS ENORMOUSLY REDUNDANT" />
        <div
          style={{
            ...rise(p),
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 30px)`,
            gridAutoRows: "30px",
            gap: 5,
          }}
        >
          {Array.from({ length: cols * rows }).map((_, i) => {
            const c = i % cols;
            const isLive = live.includes(c);
            const r = rnd(i);
            return (
              <div
                key={i}
                style={{
                  borderRadius: 4,
                  backgroundColor: isLive ? C.cyan : "rgba(255,255,255,0.045)",
                  opacity: isLive ? 0.55 + 0.45 * rnd(i + 3) : 1,
                }}
              />
            );
          })}
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 700,
            fontSize: 40,
            color: C.text,
            opacity: ph(frame, d, 0.5, 0.9),
          }}
        >
          It is not 16.7 million independent directions. It is a few.
        </div>
      </div>
    </Stage>
  );
};

const Scene12: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.7);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <Kicker text="SO FACTOR IT" />
        <div style={{ ...rise(p), display: "flex", alignItems: "center", gap: 34 }}>
          <Rect cols={7} rows={22} w={210} h={440} mode="float" label="A · TALL AND THIN" color={C.violet} />
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 74,
              color: C.text,
              fontWeight: 300,
            }}
          >
            x
          </div>
          <Rect cols={22} rows={7} w={660} h={210} mode="float" label="B · SHORT AND WIDE" color={C.violet} />
        </div>
        <div style={{ ...rise(ph(frame, d, 0.45, 0.85), 16) }}>
          <Equation
            parts={[
              { text: "W", color: C.cyan },
              { text: "=" },
              { text: "A", color: C.violet },
              { text: "·" },
              { text: "B", color: C.violet },
              { text: "    (rank is small)" , dim: true },
            ]}
            size={54}
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene13: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.75);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <Kicker text="NOW THE TRICK" />
        <div style={{ ...rise(p), display: "flex", alignItems: "center", gap: 34 }}>
          <Rect cols={7} rows={22} w={210} h={440} mode="binary" label="A · SIGNS ONLY" />
          <div style={{ fontFamily: F.mono, fontSize: 74, color: C.text, fontWeight: 300 }}>x</div>
          <Rect cols={22} rows={7} w={660} h={210} mode="binary" label="B · SIGNS ONLY" />
        </div>
      </div>
    </Stage>
  );
};

const Scene14: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.1, 0.7);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <Kicker text="WHAT IS LEFT" />
        <div style={rise(p)}>
          <Statement
            lines={["Not small numbers.", "No decimals. No rounding.", "A sign."]}
            accent={2}
            size={88}
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene15: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.1, 0.75);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <Kicker text="THE ORIGINAL MATRIX WAS NEVER STORED" />
        <div style={{ ...rise(p), display: "flex", alignItems: "center", gap: 30 }}>
          <Rect cols={6} rows={16} w={190} h={360} mode="binary" label="A" />
          <div style={{ fontFamily: F.mono, fontSize: 66, color: C.text, fontWeight: 300 }}>x</div>
          <Rect cols={16} rows={6} w={520} h={200} mode="binary" label="B" />
          <div style={{ fontFamily: F.mono, fontSize: 66, color: C.dim, fontWeight: 300 }}>=</div>
          <div
            style={{
              width: 420,
              height: 420,
              border: `1px solid ${C.cyan}`,
              borderRadius: 12,
              backgroundColor: "rgba(34,211,238,0.07)",
              opacity: ph(frame, d, 0.45, 0.85),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: F.mono,
              fontSize: 30,
              color: C.cyan,
            }}
          >
            rebuilt
          </div>
        </div>
      </div>
    </Stage>
  );
};

const Scene16: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.7);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <Kicker text="SO WHERE WAS THE INFORMATION" />
        <div style={rise(p)}>
          <Statement
            lines={["It was never in the weights.", "It was in the relationship", "between two sign matrices."]}
            accent={0}
            size={74}
            align="center"
          />
        </div>
      </div>
    </Stage>
  );
};

export const ACT2: Record<string, React.ReactNode> = {
  s08: <Scene08 />,
  s09: <Scene09 />,
  s10: <Scene10 />,
  s11: <Scene11 />,
  s12: <Scene12 />,
  s13: <Scene13 />,
  s14: <Scene14 />,
  s15: <Scene15 />,
  s16: <Scene16 />,
};
