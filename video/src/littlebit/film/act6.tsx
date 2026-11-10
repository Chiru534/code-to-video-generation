import React from "react";
import { C, F } from "../../theme";
import { Kicker, Stage, Statement } from "../../kit/film";
import { Caveat, Equation, Figure, rise } from "../../kit/scenes";
import { ph, useScene } from "../../kit/core";

/* ACT 6 - THE NUMBERS. Every figure in this act says what it is: paper
   figure, potential, or our own arithmetic. The claim discipline is the point
   of the act, not a footnote to it. */

const Scene40: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.1, 0.65);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <Kicker text="MEMORY" />
        <div style={rise(p)}>
          <Figure
            value="31"
            unit="x"
            label="LESS MEMORY THAN FULL PRECISION"
            note="PAPER FIGURE"
            color={C.cyan}
            size={200}
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene41: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.1, 0.65);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <Kicker text="SIZE" />
        <div style={rise(p)}>
          <Figure
            value="0.9"
            unit="GB"
            label="LLAMA 2 · 13B PARAMETERS"
            note="PAPER FIGURE"
            color={C.cyan}
            size={200}
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene42: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.7);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <Kicker text="QUALITY" />
        <div style={rise(p)}>
          <Statement
            lines={["It matches the fidelity of", "leading one-bit baselines."]}
            accent={1}
            size={78}
            sub="At a tenth of their bits."
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene43: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.1, 0.65);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <Kicker text="SPEED" />
        <div style={rise(p)}>
          <Figure
            value="11.6"
            unit="x"
            label="INFERENCE SPEEDUP VS 16-BIT"
            note="POTENTIAL · PAPER ESTIMATE"
            color={C.amber}
            size={190}
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene44: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.7);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <Kicker text="POTENTIAL IS THE LOAD-BEARING WORD" />
        <div style={rise(p)}>
          <Caveat
            claim="Eleven point six times faster than sixteen-bit inference."
            reality="No hardware multiplies one-bit matrices that fast yet. This is a projection, not a measurement."
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene45: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.1, 0.65);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <Kicker text="AND ONE NUMBER IN THIS FILM IS OURS" />
        <div style={rise(p)}>
          <Figure
            value="29"
            unit="x"
            label="26 GB -> 0.9 GB, IN THE MODEL ITSELF"
            note="OUR ARITHMETIC"
            color={C.amber}
            size={190}
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene46: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.7);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <Kicker text="WHICH IS JUST" />
        <div style={rise(p)}>
          <Equation
            parts={[
              { text: "13,000,000,000" },
              { text: "x" },
              { text: "16" },
              { text: "/ 8" },
              { text: "= 26,000,000,000 bytes", color: C.cyan },
            ]}
            size={48}
          />
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 700,
            fontSize: 34,
            color: C.dim,
            opacity: ph(frame, d, 0.45, 0.9),
          }}
        >
          thirteen billion parameters, times sixteen bits
        </div>
      </div>
    </Stage>
  );
};

export const ACT6: Record<string, React.ReactNode> = {
  s40: <Scene40 />,
  s41: <Scene41 />,
  s42: <Scene42 />,
  s43: <Scene43 />,
  s44: <Scene44 />,
  s45: <Scene45 />,
  s46: <Scene46 />,
};
