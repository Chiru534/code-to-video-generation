import React from "react";
import { QrScene } from "./QrScene";
import { C } from "../../theme";

export const SCENES: Record<string, React.ReactNode> = {
  s01: <QrScene kind="title" lines={["A QR code is built to survive destruction."]} accent={0} />,
  s02: <QrScene kind="quote" lines={["Every QR code is wrapped in error-correcting codes.", "There are four levels: L, M, Q, and H."]} note="ISO/IEC 18004" />,
  s03: <QrScene kind="levels" levels={[
    { label: "L — Low", pct: "~7% of codewords restorable", w: 140, color: C.green },
    { label: "M — Medium", pct: "~15% of codewords restorable", w: 230, color: C.cyan },
    { label: "Q — Quartile", pct: "~25% of codewords restorable", w: 360, color: C.amber },
    { label: "H — High", pct: "~30% of codewords restorable", w: 500, color: C.red },
  ]} />,
  s04: <QrScene kind="quote" lines={["Level L restores about 7% of the code. Level H restores about 30%.", "The higher the level, the more redundancy — and the larger the code."]} />,
  s05: <QrScene kind="destroy" />,
  s06: <QrScene kind="quote" lines={["So you can scratch a code, find a coffee ring on a label, and it still decodes.", "The mechanism is Reed-Solomon — the same family of math used on CDs and for deep-space communication."]} note="DENSO WAVE — primary source" />,
  s07: <QrScene kind="title" lines={["Higher levels mean denser codes. Longer content needs a bigger version."]} accent={0} />,
};

export const SCENE_IDS = Object.keys(SCENES);
