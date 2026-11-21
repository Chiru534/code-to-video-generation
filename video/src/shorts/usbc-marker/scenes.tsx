/* Seven-beat narrative for USB-C Cable E-Marker.
 * Verified sources: USB-IF Specification Rev 3.1, IEC 62680-1-2.
 * One-line self-closing nodes required by check_alignment.py.
 */
import React from "react";
import { ShortUsbcMarkerScene } from "./UsbcMarkerScene";

export const ORDER = ["s01", "s02", "s03", "s04", "s05", "s06", "s07"];

export const SCENE_NODES: Record<string, React.ReactNode> = {
  s01: <ShortUsbcMarkerScene beat={0} subtitle="ASSUMING A USB CABLE IS JUST COPPER STRANDS IN PLASTIC" sourceNote="BELIEF · PASSIVE COMMODITY WIRE CARRYING RAW CHARGE" />,
  s02: <ShortUsbcMarkerScene beat={1} subtitle="HIGH POWER USB CABLES CONTAIN AN ACTIVE COMPUTER IN PLUG" sourceNote="REALITY · ACTIVE SILICON CONTROLLER LIVING IN METAL CASING" />,
  s03: <ShortUsbcMarkerScene beat={2} subtitle="COPPER CARRIES THREE AMPS BUT FIVE AMPS MELTS INSULATION" sourceNote="JOULE HEATING · P EQUALS I SQUARED R SURGING 177 PERCENT" />,
  s04: <ShortUsbcMarkerScene beat={3} subtitle="EMARKER NEGOTIATES WITH CHARGER USING HIGH FREQUENCY BMC" sourceNote="CC PIN SIGNALING · BIPHASE MARK CODE BROADCAST AT 300 KHZ" />,
  s05: <ShortUsbcMarkerScene beat={4} subtitle="BROADCASTS WIRE GAUGE AUTHORIZING UP TO 240 WATTS EPR" sourceNote="VDM HANDSHAKE · AUTHORIZING USB PD 3.1 UP TO 48V AND 5A" />,
  s06: <ShortUsbcMarkerScene beat={5} subtitle="WITHOUT DIGITAL SIGNATURE CHARGER CAPS POWER TO 60 WATTS" sourceNote="FAIL SAFE · CHAINLESS CABLES CAPPED AT 3A TO PREVENT FIRE" />,
  s07: <ShortUsbcMarkerScene beat={6} subtitle="USB C TURNED DUMB COPPER WIRE INTO A COMMUNICATING COMPUTER" sourceNote="FINAL VERDICT · THE CHARGING CABLE IS NOW AN EMBEDDED SYSTEM" />,
};
