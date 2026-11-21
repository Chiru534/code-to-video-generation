/* Seven-beat narrative for Incognito Mode Doesn't Hide You.
 * Verified sources: Chromium Network Stack, W3C Privacy Working Group, Brown v. Google (2024).
 * One-line self-closing nodes required by check_alignment.py.
 */
import React from "react";
import { ShortIncognitoModeScene } from "./IncognitoModeScene";

export const ORDER = ["s01", "s02", "s03", "s04", "s05", "s06", "s07"];

export const SCENE_NODES: Record<string, React.ReactNode> = {
  s01: <ShortIncognitoModeScene beat={0} subtitle="OPENING PRIVATE WINDOWS BELIEVING TRAFFIC IS INVISIBLE" sourceNote="BELIEF · PRIVATE BROWSING CREATES AN INVISIBLE TUNNEL" />,
  s02: <ShortIncognitoModeScene beat={1} subtitle="INCOGNITO HIDES NOTHING IT ONLY CLEARS LOCAL HISTORY" sourceNote="REALITY · LOCAL SQLITE DISK WIPED NETWORK TRAFFIC UNCHANGED" />,
  s03: <ShortIncognitoModeScene beat={2} subtitle="EVERY URL FIRES UNENCRYPTED UDP PACKETS ON PORT 53" sourceNote="DNS PROTOCOL · RESOLVER REQUESTS FULLY LOGGED BY ROUTER & ISP" />,
  s04: <ShortIncognitoModeScene beat={3} subtitle="TLS HANDSHAKE BROADCASTS SERVER NAME INDICATION IN PLAIN TEXT" sourceNote="TLS 1.3 CLIENT HELLO · HOSTNAME BROADCAST BEFORE CIPHER AGREEMENT" />,
  s05: <ShortIncognitoModeScene beat={4} subtitle="CANVAS AND HARDWARE PROBES FINGERPRINT WITHOUT COOKIES" sourceNote="DEVICE ENTROPY · GPU ENGINE AND AUDIO CONTEXT UNIQUE IDENTIFIERS" />,
  s06: <ShortIncognitoModeScene beat={5} subtitle="GOOGLE SETTLED 5 BILLION OVER TRACKING INCOGNITO USERS" sourceNote="LEGAL REALITY · BROWN V GOOGLE COURT RECORDED CROSS SITE TRACKING" />,
  s07: <ShortIncognitoModeScene beat={6} subtitle="PROTECTS FROM YOUR ROOMMATE BUT NEVER FROM THE INTERNET" sourceNote="FINAL VERDICT · LOCAL DISK PRIVACY VERSUS WIRE SURVEILLANCE" />,
};
