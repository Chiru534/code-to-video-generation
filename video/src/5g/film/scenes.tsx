import React from "react";
import { FiveGScene } from "./FiveGScene";
import { C } from "../../theme";

/* Registry in narration order — the composition walks it. */
export const SCENES: Record<string, React.ReactNode> = {
  s01: <FiveGScene kind="title" lines={["5G looks like the power question:", "it drains your battery, and that is true."]} />,
  s02: <FiveGScene kind="quote" lines={["The measurement says the story is backwards.", "5G costs more than 4G during the quiet parts — during tails, handovers, and the switch."]} note="QUALIFIER" />,
  s03: <FiveGScene kind="statechart" states={[
    { label: "RRC_IDLE", cost: "tail ≈ 20 s", color: C.cyan },
    { label: "RE-ACQUIRE (PLMN, cell, DRX)", cost: "higher tail power", color: C.violet },
    { label: "RRC_CONNECTED", cost: "data path", color: C.amber },
    { label: "RRC_INACTIVE (5G SA, Release 17)", cost: "cuts switch cost", color: C.green },
  ]} />,
  s04: <FiveGScene kind="table" />,
  s05: <FiveGScene kind="statechart" states={[
    { label: "NR switch starts", cost: "~1092 mW (mmWave)", color: C.red },
    { label: "NR-to-LTE reconfiguration", cost: "on-transition cost", color: C.amber },
    { label: "NR RRC_CONNECTED", cost: "≈ 1092 mW", color: C.violet },
    { label: "NR RRC_IDLE", cost: "returns low power", color: C.cyan },
  ]} />,
  s06: <FiveGScene kind="title" lines={["The tail on the data path"]} />,
  s07: <FiveGScene kind="note" lines={["The path itself: T-Mobile 4G ≈ 66 mW, T-Mobile 5G low-band ≈ 260 mW. The upcharge is the state machine, not the bits you send."]} />,
  s08: <FiveGScene kind="note" lines={["Fringe phone, 5G NSA mmWave: the switch costs ≈ 1494 mW — the edge of coverage is where the modem re-measures most."]} />,
  s09: <FiveGScene kind="quote" lines={["RRC_INACTIVE cuts the 4G→5G switch cost by up to 30% — Ericsson, 2021"]} note="CITATION-FIRST" />,
  s10: <FiveGScene kind="title" lines={["Caveats: measurements vary by carrier and device"]} />,
  s11: <FiveGScene kind="note" lines={["Sources: SIGCOMM 2021 (A Variegated Look at 5G), 3GPP Release 17 (RRC_INACTIVE), Ericsson Press Release, 2021."]} />,
};

export const SCENE_IDS = Object.keys(SCENES);
