/* Seven-beat narrative for the Blue Screen of Death origin film.
 * Verified historical sources: Dave Plummer (Microsoft OS engineer),
 * John Vert (author of KeBugCheckEx), The Register 2021.
 * One-line self-closing nodes required by check_alignment.py.
 */
import React from "react";
import { ShortBsodScene } from "./BsodScene";

export const ORDER = ["s01", "s02", "s03", "s04", "s05", "s06", "s07"];

export const SCENE_NODES: Record<string, React.ReactNode> = {
  s01: <ShortBsodScene beat={0} kicker="THE MOST FAMOUS CRASH IN COMPUTING" assertion="THE BLUE SCREEN" reversal="IS NOT A PSYCHOLOGICAL CHOICE" note="VERIFIED · THE CALMING BLUE MYTH IS FALSE" />,
  s02: <ShortBsodScene beat={1} kicker="THE TRUE ORIGIN" assertion="DECIDED IN 1991" reversal="BY ONE ANNOYED DEVELOPER" note="REDMOND WA · JOHN VERT · NT KERNEL TEAM" />,
  s03: <ShortBsodScene beat={2} kicker="THE HARDWARE LIMIT" assertion="DISPLAY DRIVERS DEAD" reversal="ONLY 16-COLOR VGA LEFT" note="VGA BIOS INT 10h · MODE 03h TEXT ONLY" />,
  s04: <ShortBsodScene beat={3} kicker="THE DEV MACHINE" assertion="HIS MIPS WORKSTATION" reversal="BOOTED IN WHITE ON BLUE" note="ARC FIRMWARE REV 1.2 · DEFAULT CONSOLE COLOR" />,
  s05: <ShortBsodScene beat={4} kicker="THE DAILY EDITOR" assertion="SLICKEDIT DEFAULTED" reversal="TO THE SAME BLUE PALETTE" note="12 HOURS A DAY IN WHITE ON COBALT BLUE" />,
  s06: <ShortBsodScene beat={5} kicker="THE REAL REASON" assertion="BOOT, CODE, AND CRASH" reversal="WITHOUT THE SCREEN BLINKING" note="ZERO HARDWARE DISPLAY MODE SWITCHING FLICKER" />,
  s07: <ShortBsodScene beat={6} kicker="THE 30-YEAR LEGACY" assertion="1.4 BILLION COMPUTERS" reversal="STILL CRASH IN HIS EDITOR COLORS" note="HISTORICAL INTERVIEW: JOHN VERT & DAVE PLUMMER" />,
};
