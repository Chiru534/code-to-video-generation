import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../../theme";
import { ShortTouchScene } from "../shorts/touchscreen-field/TouchScene";

/* Diagnostic only: scene 1 with no audio, so proof.yml can still-render the
 * first frames where the edge check found bright pixels. */
export const TouchProbe: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    <ShortTouchScene
      beat={0}
      kicker="THE THING YOU TOUCH MOST"
      assertion="YOUR FINGER"
      reversal="NEVER TOUCHES THE SCREEN"
      note="PROJECTED CAPACITIVE · THE ELECTRODES SIT BEHIND GLASS"
    />
  </AbsoluteFill>
);
