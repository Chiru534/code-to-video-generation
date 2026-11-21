import React from "react";
import { ORDER, SCENE_NODES } from "./scenes";
import timings from "./timings.json";
import specs from "./scene-specs.json";
import { ShortFilm, shortDuration } from "../../kit/shortfilm";

const TAIL_FRAMES = 12;

export const DURATION = shortDuration(ORDER, timings, TAIL_FRAMES);

export const AirplaneMode: React.FC = () => (
  <ShortFilm
    order={ORDER}
    timings={timings}
    scenes={SCENE_NODES}
    specs={specs}
    audioDir="audio/airplane-mode"
    tail={TAIL_FRAMES}
  />
);
