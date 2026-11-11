import React from "react";
import { Composition } from "remotion";
import { QualityProbe } from "./QualityProbe";
import { DnsEpisode, DURATION as DNS_DURATION } from "./episode/DnsEpisode";
import { HandshakeEpisode, DURATION as HANDSHAKE_DURATION } from "./episode02/HandshakeEpisode";
import { TlsEpisode, DURATION as TLS_DURATION } from "./episode03/TlsEpisode";
import { HttpEpisode, DURATION as HTTP_DURATION } from "./episode04/HttpEpisode";
import { RenderEpisode, DURATION as RENDER_DURATION } from "./episode05/RenderEpisode";
import { WifiAirtime, DURATION as WIFI_DURATION } from "./wifi/WifiAirtime";
import { WifiFilm, DURATION as WIFI_FILM_DURATION } from "./wifi/film/WifiFilm";
import { LittleBit, DURATION as LITTLEBIT_DURATION } from "./littlebit/LittleBit";
import { LittleBitFilm, DURATION as LITTLEBIT_FILM_DURATION } from "./littlebit/film/LittleBitFilm";

/* BEGIN GENERATED SHORT IMPORTS */
import {
  TrainingMemoryShort,
  DURATION as T_R_A_I_N_I_N_G___M_E_M_O_R_Y___S_H_O_R_T_DURATION,
} from "./shorts/training-memory/TrainingMemoryShort";
import {
  Fp4FormatShort,
  DURATION as F_P_4___F_O_R_M_A_T___S_H_O_R_T_DURATION,
} from "./shorts/fp4-format/Fp4FormatShort";
import {
  DiffusionLlmShort,
  DURATION as D_I_F_F_U_S_I_O_N___L_L_M___S_H_O_R_T_DURATION,
} from "./shorts/diffusion-llm/DiffusionLlmShort";
import {
  KvCacheShort,
  DURATION as K_V___C_A_C_H_E___S_H_O_R_T_DURATION,
} from "./shorts/kv-cache/KvCacheShort";
import {
  ActivationCheckpointingShort,
  DURATION as A_C_T_I_V_A_T_I_O_N___C_H_E_C_K_P_O_I_N_T_I_N_G___S_H_O_R_T_DURATION,
} from "./shorts/activation-checkpointing/ActivationCheckpointingShort";
import {
  GqaShort,
  DURATION as G_Q_A___S_H_O_R_T_DURATION,
} from "./shorts/gqa/GqaShort";
import {
  MoeActiveShort,
  DURATION as M_O_E___A_C_T_I_V_E___S_H_O_R_T_DURATION,
} from "./shorts/moe-active/MoeActiveShort";
import {
  FlashAttentionShort,
  DURATION as F_L_A_S_H___A_T_T_E_N_T_I_O_N___S_H_O_R_T_DURATION,
} from "./shorts/flash-attention/FlashAttentionShort";
import {
  TokenizerTaxShort,
  DURATION as T_O_K_E_N_I_Z_E_R___T_A_X___S_H_O_R_T_DURATION,
} from "./shorts/tokenizer-tax/TokenizerTaxShort";
import {
  SpeculativeAcceptanceShort,
  DURATION as S_P_E_C_U_L_A_T_I_V_E___A_C_C_E_P_T_A_N_C_E___S_H_O_R_T_DURATION,
} from "./shorts/speculative-acceptance/SpeculativeAcceptanceShort";
import {
  Bf16Short,
  DURATION as B_F_1_6___S_H_O_R_T_DURATION,
} from "./shorts/bf16/Bf16Short";
import {
  AttentionSinkShort,
  DURATION as A_T_T_E_N_T_I_O_N___S_I_N_K___S_H_O_R_T_DURATION,
} from "./shorts/attention-sink/AttentionSinkShort";
import {
  QuantAwareTrainingShort,
  DURATION as Q_U_A_N_T___A_W_A_R_E___T_R_A_I_N_I_N_G___S_H_O_R_T_DURATION,
} from "./shorts/quant-aware-training/QuantAwareTrainingShort";
import {
  MoeRouterShort,
  DURATION as M_O_E___R_O_U_T_E_R___S_H_O_R_T_DURATION,
} from "./shorts/moe-router/MoeRouterShort";/* END GENERATED SHORT IMPORTS */

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
      <Composition
        id="RenderEpisode"
        component={RenderEpisode}
        durationInFrames={RENDER_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="WifiAirtime"
        component={WifiAirtime}
        durationInFrames={WIFI_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="WifiFilm"
        component={WifiFilm}
        durationInFrames={WIFI_FILM_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LittleBit"
        component={LittleBit}
        durationInFrames={LITTLEBIT_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="LittleBitFilm"
        component={LittleBitFilm}
        durationInFrames={LITTLEBIT_FILM_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* BEGIN GENERATED SHORT COMPOSITIONS */}
      <Composition
        id="TrainingMemoryShort"
        component={TrainingMemoryShort}
        durationInFrames={T_R_A_I_N_I_N_G___M_E_M_O_R_Y___S_H_O_R_T_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Fp4FormatShort"
        component={Fp4FormatShort}
        durationInFrames={F_P_4___F_O_R_M_A_T___S_H_O_R_T_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DiffusionLlmShort"
        component={DiffusionLlmShort}
        durationInFrames={D_I_F_F_U_S_I_O_N___L_L_M___S_H_O_R_T_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="KvCacheShort"
        component={KvCacheShort}
        durationInFrames={K_V___C_A_C_H_E___S_H_O_R_T_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ActivationCheckpointingShort"
        component={ActivationCheckpointingShort}
        durationInFrames={A_C_T_I_V_A_T_I_O_N___C_H_E_C_K_P_O_I_N_T_I_N_G___S_H_O_R_T_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="GqaShort"
        component={GqaShort}
        durationInFrames={G_Q_A___S_H_O_R_T_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="MoeActiveShort"
        component={MoeActiveShort}
        durationInFrames={M_O_E___A_C_T_I_V_E___S_H_O_R_T_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="FlashAttentionShort"
        component={FlashAttentionShort}
        durationInFrames={F_L_A_S_H___A_T_T_E_N_T_I_O_N___S_H_O_R_T_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="TokenizerTaxShort"
        component={TokenizerTaxShort}
        durationInFrames={T_O_K_E_N_I_Z_E_R___T_A_X___S_H_O_R_T_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="SpeculativeAcceptanceShort"
        component={SpeculativeAcceptanceShort}
        durationInFrames={S_P_E_C_U_L_A_T_I_V_E___A_C_C_E_P_T_A_N_C_E___S_H_O_R_T_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Bf16Short"
        component={Bf16Short}
        durationInFrames={B_F_1_6___S_H_O_R_T_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="AttentionSinkShort"
        component={AttentionSinkShort}
        durationInFrames={A_T_T_E_N_T_I_O_N___S_I_N_K___S_H_O_R_T_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="QuantAwareTrainingShort"
        component={QuantAwareTrainingShort}
        durationInFrames={Q_U_A_N_T___A_W_A_R_E___T_R_A_I_N_I_N_G___S_H_O_R_T_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="MoeRouterShort"
        component={MoeRouterShort}
        durationInFrames={M_O_E___R_O_U_T_E_R___S_H_O_R_T_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />{/* END GENERATED SHORT COMPOSITIONS */}
    </>
  );
};
