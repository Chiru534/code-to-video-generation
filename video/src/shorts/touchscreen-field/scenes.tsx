/* Six-beat narrative. One persistent world, seven camera positions.
 * Every claim was checked against MIT / Dush / UC Berkeley sources — see
 * docs/TOPIC_RESEARCH_2026-11-20.md. One-line self-closing nodes are required
 * by tools/check_alignment.py, so all content is passed as props.
 */
import React from "react";
import { ShortTouchScene } from "./TouchScene";

export const ORDER = ["s01", "s02", "s03", "s04", "s05", "s06", "s07"];

export const SCENE_NODES: Record<string, React.ReactNode> = {
  s01: <ShortTouchScene beat={0} kicker="THE THING YOU TOUCH MOST" assertion="YOUR FINGER" reversal="NEVER TOUCHES THE SCREEN" note="PROJECTED CAPACITIVE · THE ELECTRODES SIT BEHIND GLASS" />,
  s02: <ShortTouchScene beat={1} kicker="UNDER THE GLASS" assertion="A GRID OF" reversal="TRANSPARENT ELECTRODES" note="ETCHED INTO THE PANEL · INVISIBLE TO YOU" />,
  s03: <ShortTouchScene beat={2} kicker="THE INSULATOR" assertion="THE GLASS IS" reversal="AN INSULATOR" note="NO CURRENT CROSSES THE GAP · MIT SCHOOL OF ENGINEERING" />,
  s04: <ShortTouchScene beat={3} kicker="THE MECHANISM" assertion="YOUR FINGER" reversal="BENDS A FIELD" note="CONDUCTIVE FINGER · CONTROLLER READS EACH NODE" />,
  s05: <ShortTouchScene beat={4} kicker="BETWEEN THE NODES" assertion="THE PHONE FINDS" reversal="A POINT WITH NO SENSOR" note="INTERPOLATED FROM NEIGHBOURING READINGS" />,
  s06: <ShortTouchScene beat={5} kicker="WHY GLOVES FAIL" assertion="INSULATE THE FIELD" reversal="AND IT SEES NOTHING" note="THE SAME REASON THE GLASS CAN SIT ON TOP" />,
  s07: <ShortTouchScene beat={6} kicker="THE HONEST VERSION" assertion="THE WHOLE INTERFACE" reversal="RUNS ON A FIELD YOU CAN'T FEEL" note="ILLUSTRATIVE GEOMETRY · NOT A PHYSICS SIMULATION" />,
};
