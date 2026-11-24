import React from "react";
import { CaptchaScene } from "./CaptchaScene";

/* Registry in narration order — the composition walks it, so order is the film. */
export const SCENES: Record<string, React.ReactNode> = {
  s01: <CaptchaScene kind="title" lines={["Your CAPTCHA is hard because you are not passing a test.", "You are working for something bigger."]} accent={0} />,
  s02: <CaptchaScene kind="quote" lines={["The original reCAPTCHA, built by Luis von Ahn at Carnegie Mellon and acquired by Google in September 2009, was explicitly dual purpose: block the bots and use the answers to digitize text OCR could not read."]} note="LOUDEST PUBLIC STAGE — at 09:34Z: Google confirmed — plonks reCAPTCHA on Street View" />,
  s03: <CaptchaScene kind="grid" />,
  s04: <CaptchaScene kind="pipeline" />,
  s05: <CaptchaScene kind="timeline" timeline={[
    { t: "MARCH 2007", what: "Luis von Ahn with Ben Maurer, Colin McMillen at Carnegie Mellon introduces CAPTCHA" },
    { t: "MARCH 2007", what: "New York Times experiments with reCAPTCHA — website correction files" },
    { t: "MARCH 2007", what: "NYTimes newsroom integration, NYC photographer version" },
  ]} />,
  s06: <CaptchaScene kind="timeline" timeline={[
    { t: "2007-2011", what: "New York Times digitizes ~300,000 scanned pages via reCAPTCHA (NYTimes 2011 piece)" },
    { t: "2012", what: "Street View integration begins: house numbers on Google maps land" },
  ]} />,
  s07: <CaptchaScene kind="quote" lines={["Google announced it was using the general public to read house numbers for its maps product."]} note="GOOGLE'S OWN WORD — their statement confirms human work" />,
  s08: <CaptchaScene kind="title" lines={["So what did you become?", "The labelling engine."]} accent={1} />,
  s09: <CaptchaScene kind="note" lines={["Claim: difficulty scales with how much labelling is still needed — Wikipedia, verified 2026"]} />,
  s10: <CaptchaScene kind="title" lines={["Why do captchas get harder over time?"]} accent={0} />,
  s11: <CaptchaScene kind="quote" lines={["The difficulty grows: more pages are scanned, more words fail OCR, so the gap between easy and hard words grows."]} note="MECHANISM — scaling with outstanding labelling" />,
  s12: <CaptchaScene kind="title" lines={["The modern version works the same way."]} />,
  s13: <CaptchaScene kind="quote" lines={["Image grids now return — and the pictures you categorize become training data for the next version of the system."]} />,
  s14: <CaptchaScene kind="note" lines={["MUST-BE-HONEST qualifiers: Google has never published what a specific challenge trains, and v2/v3 flows are undocumented"]} />,
  s15: <CaptchaScene kind="title" lines={["A final warning: difficulty is not suspicion."]} />,
  s16: <CaptchaScene kind="note" lines={["Sources: Wikipedia (reCAPTCHA), CMU News (2009), The New York Times (2011), The Register (2012-04-04)."]} />,
  s17: <CaptchaScene kind="title" lines={["Credits: Luis von Ahn, David Abraham, Manuel Blum, Colin McMillen, Ben Maurer, Edison Tan, Carnegie Mellon University."]} accent={0} />,
};

export const SCENE_IDS = Object.keys(SCENES);
