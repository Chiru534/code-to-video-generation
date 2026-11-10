import React from "react";
import { C, F } from "../../theme";
import { Kicker, Stage, Statement } from "../../kit/film";
import { Code, Equation, Spectrum, rise } from "../../kit/scenes";
import { ph, useScene } from "../../kit/core";

/* ACT 4 - WHAT DELETING COSTS. Magnitude is gone; a spectrum explains why
   that is survivable, and a compensation term recovers the rest. */

const Scene23: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.6);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <Kicker text="DELETING THE NUMBERS HAS TO COST SOMETHING" />
        <div style={rise(p)}>
          <Statement lines={["It does."]} accent={0} size={118} />
        </div>
      </div>
    </Stage>
  );
};

const Scene24: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.75);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 42 }}>
        <Kicker text="A SIGN THROWS AWAY MAGNITUDE" />
        <div style={{ ...rise(p), display: "flex", alignItems: "center", gap: 44 }}>
          {["+0.0001", "+10.0"].map((v, i) => (
            <div
              key={v}
              style={{
                fontFamily: F.mono,
                fontSize: 52,
                color: C.text,
                border: `1px solid ${C.panelEdge}`,
                borderRadius: 14,
                padding: "22px 34px",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              {v}
            </div>
          ))}
          <div style={{ fontFamily: F.mono, fontSize: 62, color: C.dim }}>becomes</div>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 72,
              fontWeight: 700,
              color: C.cyan,
              border: `2px solid ${C.cyan}`,
              borderRadius: 16,
              padding: "18px 40px",
              backgroundColor: "rgba(34,211,238,0.1)",
            }}
          >
            +1
          </div>
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 700,
            fontSize: 38,
            color: C.dim,
            opacity: ph(frame, d, 0.55, 0.92),
          }}
        >
          and +1 is not the same information as +10
        </div>
      </div>
    </Stage>
  );
};

const Scene25: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.7);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <Kicker text="BUT REAL WEIGHT MATRICES ARE NOT RANDOM" />
        <div style={rise(p)}>
          <Spectrum spiky color={C.violet} label="SINGULAR VALUES · A FEW DIRECTIONS CARRY THE ENERGY" />
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 700,
            fontSize: 38,
            color: C.text,
            opacity: ph(frame, d, 0.5, 0.9),
            textAlign: "center",
            maxWidth: 1300,
          }}
        >
          Their singular values fall off fast. A few directions carry most of the energy.
        </div>
      </div>
    </Stage>
  );
};

const Scene26: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.7);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <Kicker text="THE INTUITION FROM LITTLEBIT TWO" />
        <div style={rise(p)}>
          <Statement
            lines={["For a spectrum like that,", "a low-rank binary approximation", "can beat a tiny-rank float one."]}
            accent={2}
            size={64}
          />
        </div>
        <div style={{ ...rise(ph(frame, d, 0.5, 0.9), 16) }}>
          <Equation
            parts={[
              { text: "binary, rank r", color: C.cyan },
              { text: ">" },
              { text: "float, rank r'" },
              { text: "    for heavy-tailed spectra", dim: true },
            ]}
            size={40}
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene27: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.1, 0.7);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <Kicker text="SO THE QUESTION IS NOT HOW MUCH YOU KEEP" />
        <div style={rise(p)}>
          <Statement lines={["It is which directions you keep."]} accent={0} size={92} />
        </div>
      </div>
    </Stage>
  );
};

const Scene28: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.8);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <Kicker text="SO LITTLEBIT ADDS A COMPENSATION TERM" />
        <div style={{ ...rise(p), width: 1180 }}>
          <Code
            lines={[
              "compensation = row_scale[r]      # per output row",
              "              + col_scale[c]      # per input column",
              "              + latent_gain[k]    # per latent direction",
              "",
              "W_hat = sign(A) @ sign(B) + compensation",
            ]}
            highlight={4}
            size={28}
          />
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 700,
            fontSize: 36,
            color: C.dim,
            opacity: ph(frame, d, 0.55, 0.92),
          }}
        >
          it learns the error across rows, columns, and the latent dimension
        </div>
      </div>
    </Stage>
  );
};

const Scene29: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.7);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <Kicker text="AND THAT IS THE PART THAT WORKS" />
        <div style={rise(p)}>
          <Statement
            lines={["It recovers what the signs threw away."]}
            accent={0}
            size={82}
          />
        </div>
      </div>
    </Stage>
  );
};

export const ACT4: Record<string, React.ReactNode> = {
  s23: <Scene23 />,
  s24: <Scene24 />,
  s25: <Scene25 />,
  s26: <Scene26 />,
  s27: <Scene27 />,
  s28: <Scene28 />,
  s29: <Scene29 />,
};
