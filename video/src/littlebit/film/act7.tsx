import React from "react";
import { C, F } from "../../theme";
import { Kicker, Stage, Statement } from "../../kit/film";
import { Caveat, rise } from "../../kit/scenes";
import { ph, rnd, useScene } from "../../kit/core";

/* ACT 7 - WHAT IT ACTUALLY MEANS. The part a 70-second video cannot carry:
   what is true today, what is not, and why the direction matters anyway. */

const Scene47: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.65);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <Kicker text="LET US BE HONEST ABOUT WHERE THIS IS" />
        <div style={rise(p)}>
          <Statement
            lines={["None of this is on your phone yet."]}
            accent={0}
            size={88}
            sub="And it would be dishonest to pretend otherwise."
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene48: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.7);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <Kicker text="WHAT IS MISSING" />
        <div style={rise(p)}>
          <Caveat
            claim="A 13B model runs on your device in under a gigabyte."
            reality="There are no sub-one-bit multiply kernels. The storage format does not exist. The bandwidth saving is theoretical until hardware catches up."
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene49: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.1, 0.7);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <Kicker text="WHAT DOES EXIST" />
        <div style={rise(p)}>
          <Statement
            lines={["A direction, and a result strong enough", "that people are now building toward."]}
            accent={0}
            size={68}
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene50: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.8);
  const symbols = ["+1", "0", "-1", "+1", "0", "0", "-1", "+1", "0", "-1", "0", "+1"];
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 38 }}>
        <Kicker text="THERE IS A PARALLEL ROAD" />
        <div style={{ ...rise(p), display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", width: 1100 }}>
          {symbols.map((s, i) => {
            const on = ph(frame, d, 0.12 + i * 0.02, 0.5 + i * 0.02);
            const color = s === "+1" ? C.cyan : s === "-1" ? C.violet : C.faint;
            return (
              <div
                key={i}
                style={{
                  fontFamily: F.mono,
                  fontSize: 46,
                  color,
                  border: `1px solid ${C.panelEdge}`,
                  borderRadius: 12,
                  padding: "12px 26px",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  opacity: on,
                }}
              >
                {s}
              </div>
            );
          })}
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 700,
            fontSize: 38,
            color: C.text,
            opacity: ph(frame, d, 0.55, 0.92),
          }}
        >
          BitNet went the other way, to ternary weights
        </div>
      </div>
    </Stage>
  );
};

const Scene51: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.7);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <Kicker text="BOTH ARE ASKING THE SAME QUESTION" />
        <div style={rise(p)}>
          <Statement
            lines={["What is the smallest amount of information", "a language model actually needs?"]}
            accent={1}
            size={72}
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene52: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.65);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <Kicker text="BECAUSE THAT NUMBER IS THE WHOLE BUDGET" />
        <div style={rise(p)}>
          <Statement
            lines={["A model you cannot fit", "is a model you cannot run."]}
            accent={1}
            size={88}
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene53: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.7);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <Kicker text="SO THE DIFFERENCE IS" />
        <div style={rise(p)}>
          <Statement
            lines={["A model you can run on the device", "is the difference between a service,", "and a feature."]}
            accent={2}
            size={68}
          />
        </div>
      </div>
    </Stage>
  );
};

export const ACT7: Record<string, React.ReactNode> = {
  s47: <Scene47 />,
  s48: <Scene48 />,
  s49: <Scene49 />,
  s50: <Scene50 />,
  s51: <Scene51 />,
  s52: <Scene52 />,
  s53: <Scene53 />,
};
