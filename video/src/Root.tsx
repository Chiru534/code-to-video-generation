import React from "react";
import { Composition } from "remotion";
import { QualityProbe } from "./QualityProbe";
import { DnsEpisode, DURATION as DNS_DURATION } from "./episode/DnsEpisode";
import { HandshakeEpisode, DURATION as HANDSHAKE_DURATION } from "./episode02/HandshakeEpisode";
import { TlsEpisode, DURATION as TLS_DURATION } from "./episode03/TlsEpisode";
import { HttpEpisode, DURATION as HTTP_DURATION } from "./episode04/HttpEpisode";

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
        width={1080}
        height={1920}
      />
      <Composition
        id="FindingTheAddress"
        component={DnsEpisode}
        durationInFrames={DNS_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="TheHandshake"
        component={HandshakeEpisode}
        durationInFrames={HANDSHAKE_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ProvingItsSafe"
        component={TlsEpisode}
        durationInFrames={TLS_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="HttpEpisode"
        component={HttpEpisode}
        durationInFrames={HTTP_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
