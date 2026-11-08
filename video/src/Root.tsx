import React from "react";
import { Composition } from "remotion";
import { QualityProbe } from "./QualityProbe";
import { DnsEpisode, DURATION } from "./episode/DnsEpisode";

/* bundled fonts — no network at render time, byte-identical every build */
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/800.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="QualityProbe"
        component={QualityProbe}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FindingTheAddress"
        component={DnsEpisode}
        durationInFrames={DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
