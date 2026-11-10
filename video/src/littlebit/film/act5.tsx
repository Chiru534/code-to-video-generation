import React from "react";
import { useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { Kicker, Stage, Statement } from "../../kit/film";
import { Code, Equation, Spectrum, rise } from "../../kit/scenes";
import { ph, useScene } from "../../kit/core";

/* ACT 5 - THE GEOMETRY PROBLEM. Why binary quantization fails on the wrong
   shape, and the rotation that fixes it. This is the hinge of the film. */

/** A rotating arc with an arrowhead: the operation, drawn. */
const SpinArrow: React.FC<{ size?: number; color?: string; turns?: number }> = ({
  size = 300,
  color = C.cyan,
  turns = 1,
}) => {
  const frame = useCurrentFrame();
  const angle = (frame / 42) * 360 * turns;
  const r = size / 2 - 18;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(${angle} ${size / 2} ${size / 2})`}>
        <path
          d={`M ${size / 2 - r} ${size / 2} A ${r} ${r} 0 0 1 ${size / 2 + r} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          opacity={0.85}
        />
        <path
          d={`M ${size / 2 + r - 26} ${size / 2 - 12} L ${size / 2 + r + 4} ${size / 2} L ${size / 2 + r - 26} ${size / 2 + 12} Z`}
          fill={color}
          opacity={0.85}
        />
      </g>
    </svg>
  );
};

const Scene30: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.6);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <Kicker text="EVEN SO, SOMETHING WAS STILL WRONG" />
        <div style={rise(p)}>
          <Statement lines={["The reason was geometric."]} accent={0} size={96} />
        </div>
      </div>
    </Stage>
  );
};

const Scene31: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.1, 0.75);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <Kicker text="TO MULTIPLY TWO MATRICES CHEAPLY" />
        <div style={rise(p)}>
          <Equation
            parts={[
              { text: "W", color: C.cyan },
              { text: "=" },
              { text: "A", color: C.violet },
              { text: "·" },
              { text: "B", color: C.violet },
              { text: "     needs the", dim: true },
              { text: "directions", color: C.amber },
            ]}
            size={52}
          />
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 700,
            fontSize: 38,
            color: C.text,
            opacity: ph(frame, d, 0.45, 0.9),
            textAlign: "center",
          }}
        >
          the singular vectors of the latent space
        </div>
      </div>
    </Stage>
  );
};

const Scene32: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.7);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <Kicker text="AND THOSE VECTORS ARE SPIKY" />
        <div style={rise(p)}>
          <Spectrum spiky color={C.amber} label="ONE SINGULAR VECTOR · MOST ENERGY IN A FEW COORDINATES" />
        </div>
      </div>
    </Stage>
  );
};

const Scene33: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.5);
  const ask = ph(frame, d, 0.35, 0.62);
  const answer = ph(frame, d, 0.66, 0.92);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 44 }}>
        <Kicker text="HERE IS WHY THAT IS THE WORST POSSIBLE SHAPE" />
        <div style={rise(p)}>
          <Statement lines={["A sign can only be", "plus one, or minus one."]} accent={1} size={72} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 700,
              fontSize: 34,
              color: C.dim,
              opacity: ask,
            }}
          >
            so which shape of vector suits a binary sign better?
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {["SPIKY", "FLAT"].map((o, i) => {
              const chosen = i === 1;
              const op = chosen ? answer : ask;
              return (
                <div
                  key={o}
                  style={{
                    fontFamily: F.mono,
                    fontSize: 28,
                    letterSpacing: "0.18em",
                    padding: "14px 30px",
                    borderRadius: 12,
                    border: `1px solid ${chosen ? C.cyan : C.panelEdge}`,
                    backgroundColor: chosen ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.03)",
                    color: chosen ? C.cyan : C.dim,
                    opacity: op,
                    transform: `scale(${chosen ? 1 + 0.05 * answer : 1})`,
                  }}
                >
                  {o}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Stage>
  );
};

const Scene34: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.7);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <Kicker text="AND A SPIKY VECTOR HAS ALMOST ALL ITS MASS IN A FEW COORDINATES" />
        <div style={rise(p)}>
          <Spectrum spiky color={C.red} label="QUANTIZE THAT, AND THOSE COORDINATES SATURATE" />
        </div>
      </div>
    </Stage>
  );
};

const Scene35: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.75);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <Kicker text="SO YOU WIN NOTHING, AND LOSE EVERYTHING" />
        <div style={rise(p)}>
          <Statement
            lines={[
              "You gain nothing by being accurate",
              "where the vector barely points,",
              "and you lose everything by being wrong",
              "where it strongly points.",
            ]}
            accent={3}
            size={58}
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene36: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.7);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 38 }}>
        <Kicker text="LITTLEBIT TWO NAMES IT" />
        <div style={rise(p)}>
          <Statement
            lines={["Latent geometry misalignment."]}
            accent={0}
            size={92}
            sub="A real bug, not a tuning problem."
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene37: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.8);
  // The distribution flattens: the energy that was in a few coordinates
  // spreads across all of them. This is the EFFECT of the rotation, which is
  // what the paper's preconditioner is for.
  const count = 26;
  const spiky = Array.from({ length: count }, (_, i) => Math.exp(-i / 3.4) + 0.05);
  const flat = Array.from({ length: count }, () => 1);
  const max = Math.max(...spiky);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <Kicker text="THE FIX" />
        <div style={{ ...rise(p), display: "flex", alignItems: "center", gap: 70 }}>
          <SpinArrow size={300} color={C.cyan} />
          <div style={{ display: "flex", alignItems: "flex-end", gap: 9, height: 340 }}>
            {spiky.map((v, i) => {
              const flatV = flat[i] / max;
              const value = v / max + (flatV - v / max) * p;
              return (
                <div
                  key={i}
                  style={{
                    width: 26,
                    height: Math.max(3, value * 320),
                    backgroundColor: i < 4 ? C.amber : C.cyan,
                    opacity: 0.9,
                    borderRadius: "4px 4px 0 0",
                  }}
                />
              );
            })}
          </div>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 22,
              letterSpacing: "0.22em",
              color: C.faint,
              width: 260,
              lineHeight: 1.7,
            }}
          >
            ROTATE THE
            <br />
            LATENT SPACE
            <br />
            FIRST
          </div>
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 700,
            fontSize: 36,
            color: C.text,
            opacity: ph(frame, d, 0.55, 0.92),
          }}
        >
          so the distribution is flat, and only then quantize it
        </div>
      </div>
    </Stage>
  );
};

const Scene38: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.8);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <Kicker text="THE MECHANISM" />
        <div style={{ ...rise(p), width: 1180 }}>
          <Code
            lines={[
              "for step in range(n_iter):",
              "    A, B  = rotate_latent(A, B)      # internal latent rotation",
              "    A     = quantize(A)             # joint iterative quantization",
              "    B     = quantize(B)",
              "",
              "# zero inference overhead: the rotation lives in the factors",
            ]}
            highlight={5}
            size={28}
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene39: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.7);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <Kicker text="AND THE CRUCIAL PART" />
        <div style={rise(p)}>
          <Statement
            lines={["The rotation folds into the factors.", "It costs nothing at inference time."]}
            accent={1}
            size={74}
          />
        </div>
      </div>
    </Stage>
  );
};

export const ACT5: Record<string, React.ReactNode> = {
  s30: <Scene30 />,
  s31: <Scene31 />,
  s32: <Scene32 />,
  s33: <Scene33 />,
  s34: <Scene34 />,
  s35: <Scene35 />,
  s36: <Scene36 />,
  s37: <Scene37 />,
  s38: <Scene38 />,
  s39: <Scene39 />,
};
