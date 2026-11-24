import React from "react";
import { WiFiExtenderScene } from "./WiFiExtenderScene";

export const SCENES: Record<string, React.ReactNode> = {
  s01: <WiFiExtenderScene kind="title" lines={["You bought a Wi-Fi extender for the dead zone.", "It works. But what you bought is a relay, and it works by making Wi-Fi slower."]} />,
  s02: <WiFiExtenderScene kind="quote" lines={["Wi-Fi is half-duplex. One radio cannot transmit and receive at once."]} />,
  s03: <WiFiExtenderScene kind="mechanism" />,
  s04: <WiFiExtenderScene kind="physics" lines={["The frame travels router → extender, then extender → device — two uses of one channel.", "Two turns of the airtime. At best, half the rate."]} />,
  s05: <WiFiExtenderScene kind="airtime" />,
  s06: <WiFiExtenderScene kind="intlinks" note="Omada, 2026 — 'It doesn't increase your internet speed.'" />,
  s07: <WiFiExtenderScene kind="quote" lines={["The bars on your phone show the extender, not the extender's link to the router."]} />,
  s08: <WiFiExtenderScene kind="title" lines={["Dual-band and tri-band units avoid the halving with a second radio on the backhaul link."]} />,
  s09: <WiFiExtenderScene kind="physics" lines={["But the halving doesn't disappear — the link from the router remains the rate limiter.", "Some units repeat the same band on itself (2.4 in, 2.4 out) and pay it again. NIFITEXT, 2026."]} />,
  s10: <WiFiExtenderScene kind="title" lines={["The fix is a mesh, an AP on wired, or a powerline — each escapes by changing the physics of the link."]} />,
};

export const SCENE_IDS = Object.keys(SCENES);
