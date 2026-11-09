import React from "react";
import { ACT1 } from "./act1";
import { ACT2 } from "./act2";
import { ACT3 } from "./act3";
import { ACT4 } from "./act4";
import { ACT5 } from "./act5";
import { ACT6 } from "./act6";
import { ACT7 } from "./act7";
import { ACT8 } from "./act8";

/* One registry, in narration order. The composition walks these keys, so the
   scene order here is the film's order. Every key must have a narration line
   and a measured timing; tools/audit.py fails the build otherwise. */

export const SCENES: Record<string, React.ReactNode> = {
  ...ACT1,
  ...ACT2,
  ...ACT3,
  ...ACT4,
  ...ACT5,
  ...ACT6,
  ...ACT7,
  ...ACT8,
};

export const SCENE_IDS = Object.keys(SCENES);
