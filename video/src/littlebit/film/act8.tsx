import React from "react";
import { C, F } from "../../theme";
import { Kicker, Stage, Statement } from "../../kit/film";
import { Code, EndCard, Equation, rise } from "../../kit/scenes";
import { ph, useScene } from "../../kit/core";

/* ACT 8 - THE LAYER BELOW. Recap, sources, the short version, and the close. */

const Scene54: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.65);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <Kicker text="SO THE LAYER BELOW THE LAYER" />
        <div style={rise(p)}>
          <Statement
            lines={["Not smaller numbers.", "Fewer numbers."]}
            accent={1}
            size={104}
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene55: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.75);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <Kicker text="THE WHOLE THING, ON ONE LINE" />
        <div style={rise(p)}>
          <Equation
            parts={[
              { text: "13B params", color: C.cyan },
              { text: "->" },
              { text: "two sign matrices" },
              { text: "->" },
              { text: "rebuilt on the fly" },
              { text: "->" },
              { text: "0.1 bpw", color: C.amber },
            ]}
            size={44}
          />
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 700,
            fontSize: 34,
            color: C.dim,
            opacity: ph(frame, d, 0.5, 0.92),
            textAlign: "center",
            maxWidth: 1300,
            lineHeight: 1.4,
          }}
        >
          A thirteen-billion-parameter model, factored into two sign matrices,
          rebuilt on the fly, at a tenth of a bit per weight.
        </div>
      </div>
    </Stage>
  );
};

const Scene56: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.8);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <Kicker text="SOURCES" />
        <div style={{ ...rise(p), width: 1180 }}>
          <Code
            lines={[
              "LittleBit: Ultra Low-Bit Quantization via Latent Factorization",
              "  Banseok Lee, Dongkyu Kim, Youngcheon You, Youngmin Kim · NeurIPS 2025",
              "  arxiv.org/abs/2506.13771",
              "",
              "LittleBit-2: Maximizing the Spectral Energy Gain in Sub-1-Bit LLMs",
              "  Banseok Lee, Youngmin Kim · 2026",
              "  arxiv.org/abs/2603.00042",
            ]}
            highlight={5}
            size={27}
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene57: React.FC = () => {
  const { frame, d } = useScene();
  const p = ph(frame, d, 0.08, 0.7);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <Kicker text="IF YOU WANT THE SHORT VERSION" />
        <div style={rise(p)}>
          <Statement
            lines={["We made a sixty-second version too."]}
            accent={0}
            size={78}
            sub="Same paper, one minute, no caveats."
          />
        </div>
      </div>
    </Stage>
  );
};

const Scene58: React.FC = () => {
  const { frame, d } = useScene();
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <EndCard
          title="The layer below."
          sub="Every frame in this video is rendered from code. No AI video models were used."
          cta="SUBSCRIBE FOR MORE"
          at={6}
        />
      </div>
    </Stage>
  );
};

export const ACT8: Record<string, React.ReactNode> = {
  s54: <Scene54 />,
  s55: <Scene55 />,
  s56: <Scene56 />,
  s57: <Scene57 />,
  s58: <Scene58 />,
};
