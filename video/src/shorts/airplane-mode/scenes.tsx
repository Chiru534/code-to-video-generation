/* Seven-beat narrative for Airplane Mode Charges Faster.
 * Verified sources: Qualcomm Snapdragon RF Front-End, IEEE Consumer Electronics.
 * One-line self-closing nodes required by check_alignment.py.
 */
import React from "react";
import { ShortAirplaneModeScene } from "./AirplaneModeScene";

export const ORDER = ["s01", "s02", "s03", "s04", "s05", "s06", "s07"];

export const SCENE_NODES: Record<string, React.ReactNode> = {
  s01: <ShortAirplaneModeScene beat={0} subtitle="SWITCHING ON AIRPLANE MODE TO SOAK UP POWER FASTER" sourceNote="BELIEF · TOGGLE OPENS A WIDER ELECTRICAL CHARGING PIPE" />,
  s02: <ShortAirplaneModeScene beat={1} subtitle="CHARGING CIRCUIT DRAWS NO EXTRA WATTS AIRPLANE STOPS LEAK" sourceNote="REALITY · IDENTICAL CURRENT DRAW RADIO TRANSMITTERS STOPPED" />,
  s03: <ShortAirplaneModeScene beat={2} subtitle="POOR RECEPTION RAMPS MODEM POWER AMPLIFIERS TO 2000 MW" sourceNote="RF LABS · 20 MW STRONG SIGNAL TO 2200 MW CELL SEARCH PEAK" />,
  s04: <ShortAirplaneModeScene beat={3} subtitle="ON A FIVE WATT CHARGER RADIOS BURN 40 PERCENT OF POWER" sourceNote="5W ARITHMETIC · 2.8W TO BATTERY VERSUS 2.2W RADIO LEAKAGE" />,
  s05: <ShortAirplaneModeScene beat={4} subtitle="RADIO HEAT WARMS CHASSIS FORCING PMIC CHARGE THROTTLING" sourceNote="SAFETY CIRCUIT · OVER 38C CHARGE CURRENT CUT IN HALF" />,
  s06: <ShortAirplaneModeScene beat={5} subtitle="AIRPLANE MODE CUTS BASEBAND RF GIVING 100 PERCENT TO CELL" sourceNote="ZERO BASEBAND TRANSMISSION · FULL DIRECT CHEMICAL STORAGE" />,
  s07: <ShortAirplaneModeScene beat={6} subtitle="ON WEAK BRICKS AIRPLANE MODE IS PLUGGING A HUGE LEAK" sourceNote="NOT A TURBO SWITCH · STOPPING A 2 WATT PARASITIC DRAIN" />,
};
