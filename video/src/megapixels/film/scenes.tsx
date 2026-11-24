import React from "react";
import { MegapixelsScene } from "./MegapixelsScene";

export const SCENES: Record<string, React.ReactNode> = {
  s01: <MegapixelsScene kind="title" lines={["Your phone has a 108 megapixel camera. You are told this gives better photos.", "But most days you get 12."]} />,
  s02: <MegapixelsScene kind="sensor" lines={["A sensor site is smaller than a pixel we can see. Around 0.8 micrometres."]} />,
  s03: <MegapixelsScene kind="title" lines={["The sensor has lots of tiny pixels — too many for storage."]} />,
  s04: <MegapixelsScene kind="grid" sizes={[
    { s: "SENSOR SITES (8 MP)", px: 8000000, w: 200, h: 120 },
    { s: "BINNED OUTPUT (0.5 MP)", px: 500000, w: 130, h: 60 },
  ]} />,
  s05: <MegapixelsScene kind="diffraction" />,
  s06: <MegapixelsScene kind="title" lines={["Notes for the next person: keep claims minimal and test the rest."]} />,
};

export const SCENE_IDS = Object.keys(SCENES);
