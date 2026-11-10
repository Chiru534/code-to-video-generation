import React from "react";
import { C, F } from "../../theme";
import { Kicker, Stage, Statement } from "../../kit/film";
import { Caveat, Equation, Stat, rise } from "../../kit/scenes";
import { ph, useScene } from "../../kit/core";

/* ACT 3 - COUNTING DIFFERENTLY. Where 0.1 bits per weight comes from, and
   what that number is and is not. */

const Scene17: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.6);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <Kicker text="SO HOW DO YOU GET TO A TENTH OF A BIT" />
        <div style={rise(p)}>
          <Statement lines={["You count differently."]} accent={0} size={104} />
        </div>
      </div>
    </Stage>
  );
};

const Scene18: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.1, 0.8);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 38 }}>
        <Kicker text="WHAT YOU ARE ACTUALLY STORING" />
        <div style={{ ...rise(p), display: "flex", flexDirection: "column", gap: 26, width: 1120 }}>
          {[
            { t: "INSTEAD OF", v: "16 bits per weight, one float each", c: C.faint },
            { t: "YOU STORE", v: "two sign matrices, and a small rank", c: C.cyan },
          ].map((row, i) => (
            <div
              key={row.t}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 26,
                opacity: ph(frame, d, 0.2 + i * 0.2, 0.6 + i * 0.2),
              }}
            >
              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 20,
                  letterSpacing: "0.26em",
                  color: C.faint,
                  width: 200,
                }}
              >
                {row.t}
              </div>
              <div
                style={{
                  fontFamily: F.sans,
                  fontWeight: 700,
                  fontSize: 40,
                  letterSpacing: "-0.03em",
                  color: row.c,
                }}
              >
                {row.v}
              </div>
            </div>
          ))}
          <div
            style={{
              marginTop: 12,
              opacity: ph(frame, d, 0.55, 0.95),
            }}
          >
            <Equation
              parts={[
                { text: "bits per weight", dim: true },
                { text: "=" },
                { text: "(bits in A + bits in B)", color: C.cyan },
                { text: "/" },
                { text: "13,000,000,000", dim: true },
              ]}
              size={44}
            />
          </div>
        </div>
      </div>
    </Stage>
  );
};

const Scene19: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.1, 0.65);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <Kicker text="FOR A 13B MODEL AT A SMALL RANK" />
        <div style={rise(p)}>
          <Stat
            value="0.1"
            unit="BITS / WEIGHT"
            label="THE HEADLINE NUMBER"
            note="AN ACCOUNTING MEASURE"
            color={C.cyan}
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene20: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.6);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <Kicker text="WAIT. WHAT DOES THAT MEAN" />
        <div style={rise(p)}>
          <Caveat
            claim="The model is stored at a tenth of a bit per weight."
            reality="That is a way of counting the storage. It is not a physical cell holding a tenth of a bit."
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene21: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.1, 0.7);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <Kicker text="NOTHING IN HARDWARE STORES A TENTH OF A BIT" />
        <div style={rise(p)}>
          <Statement
            lines={["It is a way of counting", "what the model costs."]}
            accent={1}
            size={84}
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene22: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.75);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <Kicker text="HOLD ON TO THIS" />
        <div style={rise(p)}>
          <Statement
            lines={[
              "The model is not smaller because",
              "the numbers got smaller.",
              "",
              "It is smaller because most of the model",
              "was never numbers at all.",
            ]}
            accent={4}
            size={62}
          />
        </div>
      </div>
    </Stage>
  );
};

export const ACT3: Record<string, React.ReactNode> = {
  s17: <Scene17 />,
  s18: <Scene18 />,
  s19: <Scene19 />,
  s20: <Scene20 />,
  s21: <Scene21 />,
  s22: <Scene22 />,
};
