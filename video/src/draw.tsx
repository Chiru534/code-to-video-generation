/* These primitives moved to src/kit/draw.tsx, because they are shared, not
   episode 5's private helpers. This file re-exports them so the shipped
   episode renders exactly as before. */

export { DrawPath, DrawDot } from "./kit/draw";
