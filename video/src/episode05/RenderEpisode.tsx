import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, F } from "../theme";
import { Backdrop, Caption, Kicker, Stage, Watermark } from "../chrome";
import timings from "./timings.json";

const ease = Easing.bezier(0.22, 1, 0.36, 1);
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/* ---------------- scenes ---------------- */

const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = ["From", "Bytes", "to", "Pixels"];
  return (
    <Stage>
      <Kicker text="EPISODE 05 · STEP 5 OF 5" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        {words.map((w, i) => {
          const s = spring({ frame: frame - 6 - i * 5, fps, config: { damping: 15, stiffness: 120 } });
          return (
            <span
              key={w}
              style={{
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 64,
                letterSpacing: "-0.045em",
                lineHeight: 1,
                color: i === 3 ? C.cyan : C.text,
                opacity: Math.max(0, Math.min(1, s)),
                transform: `translateY(${(1 - s) * 40}px)`,
                filter: `blur(${(1 - s) * 5}px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      <Caption text="Everything so far has been about moving bytes. Now what can they do? They become pictures." />
    </Stage>
  );
};

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 200 } });
  const b = spring({ frame: frame - 40, fps, config: { damping: 18, stiffness: 110 } });
  return (
    <Stage>
      <div
        style={{
          fontFamily: F.sans,
          fontWeight: 800,
          fontSize: 64,
          letterSpacing: "-0.04em",
          color: C.text,
          opacity: a,
          transform: `translateY(${(1 - a) * 26}px)`,
          textAlign: "center",
        }}
      >
        Your screen is a window.
      </div>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 42,
          color: C.cyan,
          marginTop: 14,
          opacity: Math.max(0, Math.min(1, b)),
          transform: `translateY(${(1 - b) * 34}px)`,
          textAlign: "center",
        }}
      >
        pixels · every frame
      </div>
      <div
        style={{
          fontFamily: F.sans,
          fontSize: 30,
          color: C.dim,
          marginTop: 30,
          opacity: spring({ frame: frame - 90, fps, config: { damping: 200 } }),
          textAlign: "center",
        }}
      >
        a window is just pixels. painted fresh, every frame.
      </div>
    </Stage>
  );
};

const InstructionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="THE INSTRUCTION" />
      <div style={{ width: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: c }}>
        <div
          style={{
            width: 900,
            padding: "30px 40px",
            borderRadius: 18,
            backgroundColor: C.panel,
            border: `1px solid ${C.panelEdge}`,
          }}
        >
          <div style={{ fontFamily: F.mono, fontSize: 16, letterSpacing: "0.2em", color: C.faint, marginBottom: 10 }}>
            INSTRUCTION → PIXELS
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 20, color: C.text, lineHeight: 1.6 }}>
            {"draw call"}
            {"\r\n"}
            {"\r\n"}
            {"vertices: 3"}
            {"\r\n"}
            {"triangles: 2"}
            {"\r\n"}
            {"\r\n"}
          </div>
        </div>
        <div style={{ width: 900, height: 56, opacity: c }}>
          <div style={{ position: "absolute", top: 27, left: 0, right: 0, height: 1, backgroundColor: C.panelEdge }} />
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 40,
              width: 40,
              height: 40,
              borderRadius: 40,
              backgroundColor: C.cyan,
              boxShadow: "0 0 30px rgba(34,211,238,0.9)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -36,
              left: 40,
              fontFamily: F.mono,
              fontSize: 14,
              color: C.cyan,
            }}
          >
            millions of triangles
          </div>
        </div>
      </div>
      <Caption text="The GPU takes those instructions and turns them into geometry. Millions of triangles, rendered in real time." />
    </Stage>
  );
};

const GpuScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="THE GPU" />
      <div style={{ width: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: c }}>
        <div
          style={{
            width: 900,
            height: 120,
            borderRadius: 16,
            backgroundColor: C.panel,
            border: `1px solid ${C.panelEdge}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              background: `linear-gradient(90deg, rgba(34,211,238,0.15), transparent)`,
              maskImage: "linear-gradient(to right, black 20%, transparent 80%)",
              WebkitMaskImage: "linear-gradient(to right, black 20%, transparent 80%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ fontFamily: F.mono, fontSize: 24, color: C.text }}>(the GPU draws)</div>
        </div>
        <div
          style={{
            width: 900,
            height: 4,
            backgroundColor: "#14161F",
            borderRadius: 2,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "0%",
              width: "20%",
              backgroundColor: C.cyan,
              boxShadow: "0 0 20px rgba(34,211,238,0.8)",
              animation: `pulse 2s ease-in-out infinite`,
            }}
          />
        </div>
      </div>
      <Caption text="The CPU prepares the scene. The GPU executes it. Together they translate bytes into motion." />
    </Stage>
  );
};

const ShaderScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="THE SHADER" />
      <div style={{ width: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: c }}>
        <div
          style={{
            width: 900,
            height: 120,
            borderRadius: 16,
            backgroundColor: C.panel,
            border: `1px solid ${C.panelEdge}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <div style={{ fontFamily: F.mono, fontSize: 20, color: C.amber }}>decides color</div>
          <div style={{ fontFamily: F.mono, fontSize: 20, color: C.violet }}>decides light</div>
          <div style={{ fontFamily: F.mono, fontSize: 20, color: C.cyan }}>decides texture</div>
        </div>
      </div>
      <Caption text="Shaders run on the GPU. They decide color. Light. Texture. What the eye will see." />
    </Stage>
  );
};

const FrameScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="THE FRAME" />
      <div style={{ width: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: c }}>
        <div
          style={{
            width: 900,
            height: 140,
            borderRadius: 16,
            backgroundColor: C.panel,
            border: `1px solid ${C.panelEdge}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div style={{ fontFamily: F.mono, fontSize: 20, color: C.green }}>vertices → pixels</div>
          <div style={{ fontFamily: F.mono, fontSize: 20, color: C.cyan }}>triangles → images</div>
        </div>
      </div>
      <Caption text="The frame buffer fills. Vertices become pixels. Triangles become images." />
    </Stage>
  );
};

const LoopScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="THE LOOP" />
      <div style={{ width: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: c }}>
        <div
          style={{
            width: 900,
            height: 140,
            borderRadius: 16,
            backgroundColor: C.panel,
            border: `1px solid ${C.panelEdge}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontFamily: F.mono, fontSize: 22, color: C.text }}>repeat: 60 fps · 60 fps · 60 fps</div>
        </div>
      </div>
      <Caption text="And the loop repeats — billions of times per second — turning code into motion." />
    </Stage>
  );
};

const CodeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="THE CODE" />
      <div style={{ width: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: c }}>
        <div
          style={{
            width: 900,
            height: 140,
            borderRadius: 16,
            backgroundColor: C.panel,
            border: `1px solid ${C.panelEdge}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontFamily: F.mono, fontSize: 20, color: C.amber }}>instructions: push · draw · present</div>
        </div>
      </div>
      <Caption text="Every pixel on your screen is the result of instructions. Code became light." />
    </Stage>
  );
};

const StackScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Kicker text="THE STACK" />
      <div style={{ width: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: c }}>
        <div
          style={{
            width: 900,
            height: 140,
            borderRadius: 16,
            backgroundColor: C.panel,
            border: `1px solid ${C.panelEdge}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontFamily: F.mono, fontSize: 22, color: C.cyan }}>bytes → geometry → pixels → light</div>
        </div>
      </div>
      <Caption text="From bytes to pixels. That is the whole stack." />
    </Stage>
  );
};

const BudgetScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  const e = spring({ frame: frame - 150, fps, config: { damping: 200 } });
  const steps = [
    { label: "CPU", time: "4 ms", color: C.cyan, done: true },
    { label: "GPU", time: "1 ms", color: C.amber, done: true },
    { label: "SHADER", time: "0.5 ms", color: C.violet, done: true },
  ];
  return (
    <Stage>
      <Kicker text="THE BUDGET" />
      <div style={{ width: 900, display: "flex", flexDirection: "column", gap: 16, opacity: c }}>
        {steps.map((s, i) => {
          const a = spring({ frame: frame - i * 10, fps, config: { damping: 200 } });
          return (
            <div
              key={s.label}
              style={{
                width: 900,
                display: "flex",
                alignItems: "center",
                gap: 20,
                opacity: a,
                padding: "16px 40px",
                borderRadius: 14,
                backgroundColor: s.done ? "rgba(34,211,238,0.10)" : C.panel,
                border: `1px solid ${s.done ? C.cyan : C.panelEdge}`,
              }}
            >
              <div style={{ fontFamily: F.mono, fontSize: 20, color: s.done ? C.cyan : C.dim }}>{s.label}</div>
              <div style={{ flex: 1, height: 8, backgroundColor: "#14161F", borderRadius: 4, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: s.done ? "100%" : "0%",
                    backgroundColor: s.color,
                  }}
                />
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 20, color: s.done ? C.text : C.faint }}>{s.time}</div>
            </div>
          );
        })}
      </div>
      {/* End-card teaser for the next episode. Fades in over the final frames of the last scene. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: e,
          pointerEvents: "none",
        }}
      >
        <Kicker text="EPISODE 05 · STEP 5 OF 5" />
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 60,
            color: C.text,
            opacity: e,
            transform: `translateY(${(1 - e) * 20}px)`,
            textAlign: "center",
          }}
        >
          Next
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 600,
            fontSize: 36,
            color: C.cyan,
            marginTop: 20,
            opacity: e,
            textAlign: "center",
          }}
        >
          Reaching millions at once. CDN.
        </div>
        <Caption text="Next: how those bytes reach millions of users at once. CDNs and the edge." />
      </div>
      <Caption text="From bytes to pixels. That is the whole stack." />
    </Stage>
  );
};

/* ---------------- timeline ---------------- */

const TAIL_FRAMES = 12;

const SCENE_NODES: Record<string, React.ReactNode> = {
  s01: <TitleScene />,
  s02: <HookScene />,
  s03: <InstructionScene />,
  s04: <GpuScene />,
  s05: <ShaderScene />,
  s06: <FrameScene />,
  s07: <LoopScene />,
  s08: <CodeScene />,
  s09: <StackScene />,
  s10: <BudgetScene />,
};

type Plan = { id: string; from: number; dur: number };

const buildPlan = (): Plan[] => {
  let cursor = 0;
  return Object.keys(SCENE_NODES).map((id) => {
    const measured = timings.scenes[id as keyof typeof timings.scenes];
    const dur = (measured?.frames ?? 240) + TAIL_FRAMES;
    const item = { id, from: cursor, dur };
    cursor += dur;
    return item;
  });
};

const PLAN = buildPlan();

export const DURATION = PLAN.reduce((n, p) => n + p.dur, 0);

export const RenderEpisode: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Backdrop />
      {PLAN.map((p) => (
        <Sequence key={p.id} from={p.from} durationInFrames={p.dur}>
          <Audio src={staticFile(`audio/ep05/${p.id}.wav`)} />
          {SCENE_NODES[p.id]}
        </Sequence>
      ))}
      <Watermark text="EP 05 · RENDER" />
    </AbsoluteFill>
  );
};
