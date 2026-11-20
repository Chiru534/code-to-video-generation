/* Six-beat narrative, one scene per narration line.
 * The wolf is a recognition mark only — the clone research proved it is not
 * the lever. The reversal in the title and the order of the beats are.
 * One-line self-closing nodes are required by tools/check_alignment.py.
 */
import React from "react";
import { ShortRitual } from "../../kit/ritual";

export const ORDER = ["s01", "s02", "s03", "s04", "s05", "s06", "s07"];

export const SCENE_NODES: Record<string, React.ReactNode> = {
  s01: <ShortRitual kicker="THE LINE YOU WERE TAUGHT" assertion="A DIAMOND" reversal="MEANS FOREVER" word="OR DOES IT?" pointing={0.15} />,
  s02: <ShortRitual kicker="BEFORE THE 1930s" assertion="MOST COUPLES" reversal="DIDN'T USE ONE" word="NO RING" pointing={0.4} prop="fact" factLabel="THE CLAIM" factValue="MOST DID NOT" factNote="NO NUMBER CLAIMED" seed={2} />,
  s03: <ShortRitual kicker="THE DOCUMENTED START" assertion="DE BEERS" reversal="HIRED AN AGENCY" pointing={0.7} prop="fact" factLabel="THE YEAR" factValue="1938" factNote="N.W. AYER · CAMPAIGN BEGINS" seed={3} />,
  s04: <ShortRitual kicker="1947 · FRANCES GERETY" assertion="FOUR WORDS" reversal="A DIAMOND IS FOREVER" pointing={1} prop="fact" factLabel="THE COPYWRITER" factValue="GERETY" factNote="PRESS REPORT · CAMPAIGN SLOGAN" seed={4} />,
  s05: <ShortRitual kicker="DECADES OF REPETITION" assertion="A CAMPAIGN" reversal="FELT ANCIENT" word="TRADITION?" pointing={0.5} />,
  s06: <ShortRitual kicker="THE HONEST VERSION" assertion="TWO MONTHS' SALARY" reversal="DISPUTED ORIGIN" pointing={0.2} prop="fact" factLabel="DO NOT CLAIM" factValue="DE BEERS INVENTED IT" factNote="HISTORIANS DISPUTE THIS" seed={6} />,
  s07: <ShortRitual kicker="WHAT TO KEEP" assertion="KEEP THE RING" reversal="DROP THE MYTH" word="YOUR CALL" pointing={0.9} />,
};
