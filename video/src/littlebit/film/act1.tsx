import React from "react";
import { useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { Kicker, Stage, Statement } from "../../kit/film";
import { CompareBar } from "../../kit/film";
import {
  Chapter,
  Code,
  Ladder,
  MatrixGrid,
  Predict,
  Stat,
  rise,
} from "../../kit/scenes";
import { ph, useScene } from "../../kit/core";

/* ACT 1 - THE WALL. The model, its size, and the ladder that runs out. */

const Scene01: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.55);
  return (
    <Stage>
      <div style={{ position: "absolute", inset: 0, opacity: 0.16 }}>
        <MatrixGrid rows={16} cols={16} cell={26} gap={4} mode="float" from={0.02} to={0.9} />
      </div>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <Kicker text="LITTLEBIT · THE LONG VERSION" />
        <div style={rise(p, 26)}>
          <Statement
            lines={["A thirteen-billion-parameter", "model."]}
            accent={1}
            size={96}
            at={4}
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene02: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.1, 0.6);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <Kicker text="WHAT IT WEIGHS" />
        <div style={rise(p)}>
          <Stat
            value="26"
            unit="GB"
            label="13B PARAMETERS x 16 BITS"
            note="OUR ARITHMETIC · NOT A PAPER FIGURE"
            color={C.amber}
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene03: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.7);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 44 }}>
        <Kicker text="THE PROBLEM" />
        <div style={{ ...rise(p), display: "flex", flexDirection: "column", gap: 30, width: 1180 }}>
          <CompareBar
            label="THE MODEL"
            value="26 GB"
            fraction={1}
            color={C.amber}
            note="needs this much RAM just to sit there"
          />
          <CompareBar
            label="YOUR PHONE"
            value="8 GB"
            fraction={0.31}
            color={C.cyan}
            note="so this does not fit"
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene04: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.1, 0.6);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <Kicker text="THE FIRST ANSWER" />
        <div style={rise(p)}>
          <Statement
            lines={["Quantization."]}
            accent={0}
            size={120}
            sub="Store the same numbers, more cheaply."
          />
        </div>
        <div style={{ ...rise(ph(frame, d, 0.35, 0.85), 18), width: 760 }}>
          <Code
            lines={[
              "weight = 0.8123…",
              "weight = 0.8125    ← 16 bits",
              "weight = 0.8125    ←  4 bits",
              "weight = 0.8125    ←  1 bit",
            ]}
            highlight={3}
            size={30}
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene05: React.FC = () => {
  const { frame, d } = useScene();
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <Kicker text="EVERY HALVING IS A FREE LUNCH" />
        <Ladder
          rungs={[
            { label: "16 BITS", value: "26 GB", color: C.faint },
            { label: "8 BITS", value: "13 GB", color: C.dim },
            { label: "4 BITS", value: "6.5 GB", color: C.violet },
            { label: "2 BITS", value: "3.2 GB", color: C.cyan },
          ]}
        />
      </div>
    </Stage>
  );
};

const Scene06: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.12, 0.7);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 38 }}>
        <Kicker text="AND THEN THE LADDER RUNS OUT" />
        <div style={rise(p)}>
          <Ladder
            rungs={[
              { label: "4 BITS", value: "6.5 GB", color: C.violet },
              { label: "2 BITS", value: "3.2 GB", color: C.cyan },
              { label: "1 BIT", value: "1.6 GB", color: C.amber, note: "THE FLOOR PEOPLE FIGHT OVER" },
            ]}
            from={0.05}
            to={0.6}
          />
        </div>
        <div
          style={{
            ...rise(ph(frame, d, 0.55, 0.92), 16),
            display: "flex",
            gap: 14,
            alignItems: "center",
          }}
        >
          {["+1", "-1", "+1", "-1", "+1"].map((s, i) => (
            <div
              key={i}
              style={{
                fontFamily: F.mono,
                fontSize: 40,
                color: s === "+1" ? C.cyan : C.violet,
                border: `1px solid ${C.panelEdge}`,
                borderRadius: 10,
                padding: "10px 22px",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              {s}
            </div>
          ))}
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 700,
              fontSize: 34,
              color: C.dim,
              marginLeft: 18,
            }}
          >
            a weight is a yes, or a no
          </div>
        </div>
      </div>
    </Stage>
  );
};

const Scene07: React.FC = () => {
  const { frame, d } = useScene();
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 46 }}>
        <Kicker text="SO THE QUESTION IS" />
        <Predict
          question="What happens if you try to go below one bit?"
          options={["Round even harder", "Store a fraction of a sign", "Find another trick"]}
          answer={2}
        />
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 21,
            letterSpacing: "0.22em",
            color: C.faint,
            opacity: ph(frame, d, 0.72, 0.95),
          }}
        >
          TAKE A MOMENT
        </div>
      </div>
    </Stage>
  );
};

export const ACT1: Record<string, React.ReactNode> = {
  s01: <Scene01 />,
  s02: <Scene02 />,
  s03: <Scene03 />,
  s04: <Scene04 />,
  s05: <Scene05 />,
  s06: <Scene06 />,
  s07: <Scene07 />,
};
