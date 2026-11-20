/* Seven-beat narrative for Closing Apps Drains Your Battery.
 * Character-driven explainer with Suited Wolf & Naive Duck.
 * Verified sources: Craig Federighi (Apple SVP), Android Developer Documentation.
 * One-line self-closing nodes required by check_alignment.py.
 */
import React from "react";
import { ShortClosingAppsScene } from "./ClosingAppsScene";

export const ORDER = ["s01", "s02", "s03", "s04", "s05", "s06", "s07"];

export const SCENE_NODES: Record<string, React.ReactNode> = {
  s01: <ShortClosingAppsScene beat={0} subtitle="SWIPING EVERY APP AWAY TO SAVE BATTERY" sourceNote="DOUBLE CLICKING HOME SCREEN TWENTY TIMES FURIOUSLY" />,
  s02: <ShortClosingAppsScene beat={1} subtitle="SWIPING YOUR APPS CLOSED DRAINS IT FASTER" sourceNote="STOP DOING IT ACTUALLY DRAINS BATTERY FASTER" />,
  s03: <ShortClosingAppsScene beat={2} subtitle="MYTH: BACKGROUND APPS ARE BURNING YOUR CPU" sourceNote="USERS BELIEVE APPS RUNNING LIVE SUCKING POWER" />,
  s04: <ShortClosingAppsScene beat={3} subtitle="FROZEN IN RAM: ZERO CPU CYCLES AND ZERO WATTAGE" sourceNote="MODERN OPERATING SYSTEMS FREEZE IN RAM PRACTICALLY" />,
  s05: <ShortClosingAppsScene beat={4} subtitle="FORCE QUIT PURGES MEMORY CAUSING A MASSIVE SPIKE" sourceNote="PROCESSOR RELOADS ALL CODE FROM FLASH STORAGE POWER SPIKE" />,
  s06: <ShortClosingAppsScene beat={5} subtitle="CRAIG FEDERIGHI ON QUITTING APPS: 'NO AND NO'" sourceNote="APPLE HEAD OF SOFTWARE CRAIG FEDERIGHI VERIFIED ANSWER" />,
  s07: <ShortClosingAppsScene beat={6} subtitle="LEAVE THE APPS IN RAM AND LET YOUR BATTERY BREATHE" sourceNote="PHONE ENGINEERED TO MANAGE OWN MEMORY LEAVE APPS IN RAM" />,
};
