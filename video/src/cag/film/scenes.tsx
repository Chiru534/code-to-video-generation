import React from "react";
import { CagScene } from "./CagScene";

/* One registry, in narration order. The composition walks these keys, so the
 * order here IS the film's order. Every key has a narration line and a timing.
 * Every visual shows what its own line says, not the line before it. */

export const SCENES: Record<string, React.ReactNode> = {
  s01: <CagScene kind="title" head="WWW '25 · arXiv 2412.15605" lines={["40× faster than RAG.", "The number is real.", "The comparison is not."]} accent={0} />,
  s02: <CagScene kind="quote" head="THE HEADLINE" lines={["CAG is 40× faster than RAG", "retrieval-free, and more accurate too"]} highlight={0} note="REPEATED EVERYWHERE" />,
  s03: <CagScene kind="quote" head="WHERE THE CLAIM LIVES" lines={["LinkedIn", "Engineering blogs", "Conference slides", "Almost nobody opens the paper"]} highlight={3} />,
  s04: <CagScene kind="flow" head="PRIMARY SOURCE" lines={["v1 SOURCE", "v2 SOURCE", "TABLE 2", "TABLE 3"]} note="BOTH VERSIONS · OPENED AND READ" />,
  s05: <CagScene kind="label" head="THE FINDING" a="THE PAPER CHANGED THE LABEL" b="THE INTERNET KEPT THE OLD ONE" />,
  s06: <CagScene kind="title" lines={["A number that survived", "because it was repeated,", "not because it was read."]} accent={2} />,
  s07: <CagScene kind="title" head="FIRST PRINCIPLES" lines={["What the two systems actually do."]} accent={0} />,

  s08: <CagScene kind="flow" head="RAG · RETRIEVAL-AUGMENTED GENERATION" lines={["CHUNKS", "EMBED", "INDEX", "FETCH TOP-K"]} note="FETCH ONLY WHAT THE QUESTION NEEDS" />,
  s09: <CagScene kind="flow" head="WHAT THE MODEL SEES" lines={["TOP-K CHUNKS", "QUESTION", "MODEL", "ANSWER"]} highlight={0} note="IT NEVER SEES THE WHOLE CORPUS" />,
  s10: <CagScene kind="flow" head="CAG · CACHE-AUGMENTED GENERATION" lines={["WHOLE CORPUS", "CONTEXT WINDOW", "PREFILL ONCE", "KV CACHE"]} highlight={3} />,
  s11: <CagScene kind="cache" head="THE KV CACHE" a="32 LAYERS" b="8 KV HEADS × 128 DIM" note="KEY / VALUE TENSORS · SAVED STATE" />,
  s12: <CagScene kind="flow" head="AT QUERY TIME" lines={["QUESTION", "CACHED CORPUS", "GENERATE", "NO RETRIEVAL"]} highlight={3} note="ONLY THE QUESTION IS PROCESSED" />,
  s13: <CagScene kind="flow" head="CACHE RESET" lines={["ANSWER", "TRIM QUESTION", "RESET CACHE", "READY"]} note="APPEND-ONLY · TRUNCATE THE NEW TOKENS" />,
  s14: <CagScene kind="caveat" head="WHAT CAG FIXES" a="A whole class of failures disappears" reality="If the right document is never retrieved, CAG cannot lose it." />,
  s15: <CagScene kind="cache" head="WHAT THE CACHE DOES NOT REMOVE" a="EVERY CORPUS TOKEN" b="EVERY GENERATED TOKEN" note="ATTENTION STILL RUNS OVER THE FULL CONTEXT" />,
  s16: <CagScene kind="title" lines={["The cache saves the reading.", "It does not save the thinking."]} accent={1} />,

  s17: <CagScene kind="spec" head="EXPERIMENTAL SETUP" lines={["Llama 3.1 8B", "SQuAD + HotPotQA", "V100 × 8"]} highlight={2} note="PAPER §3.1" />,
  s18: <CagScene kind="spec" head="TWO BENCHMARKS" lines={["SQuAD", "single passage", "HotPotQA", "multi-hop"]} highlight={2} />,
  s19: <CagScene kind="spec" head="CORPUS SIZES" lines={["SMALL · 16 docs / 21K", "MEDIUM · 32 docs / 43K", "LARGE · 64 docs / 85K"]} highlight={2} note="HOTPOTQA" />,
  s20: <CagScene kind="spec" head="THE HEADLINE SET" lines={["64 DOCUMENTS", "85,000 TOKENS", "1,344 QUESTIONS"]} note="HOTPOTQA LARGE" />,
  s21: <CagScene kind="flow" head="FOUR SYSTEMS · SAME MODEL" lines={["BM25 SPARSE", "DENSE VECTOR", "NO CACHE", "CAG"]} highlight={2} />,
  s22: <CagScene kind="spec" head="HARDWARE" lines={["Llama 3.1 8B", "8 × Tesla V100 32G", "one model, all systems"]} note="PAPER §3.1" />,
  s23: <CagScene kind="label" head="TABLE 3" a="RESPONSE TIME (SECONDS)" b="READ THE ROW LABELS" />,

  s24: <CagScene kind="table" head="TABLE 3 · HOTPOTQA LARGE" lines={["Sparse RAG top-3", "Dense RAG top-3", "CAG (cached)", "In-Context Learning"]} a="0.67|1.35|2.26|92.08" highlight={3} note="THE ROW EVERYONE QUOTES" />,
  s25: <CagScene kind="versus" head="SAME QUESTIONS · SAME CORPUS" a="92.08 s" b="2.26 s" lines={["WITH CACHE"]} />,
  s26: <CagScene kind="calc" head="OUR ARITHMETIC" lines={["92.08", "÷", "2.26", "=", "40.7×"]} highlight={4} note="WHERE THE 40× HEADLINE COMES FROM" />,
  s27: <CagScene kind="version" head="THE BASELINE ROW WAS RENAMED" a="w/o CAG" b="In-Context Learning" lines={["v1 · DEC 2024", "v2 · FEB 2025 · PUBLISHED"]} />,
  s28: <CagScene kind="label" a="NOT RAG" b="READING THE CORPUS AGAIN" lines={["from scratch, on every question"]} />,
  s29: <CagScene kind="table" head="TABLE 3 · THE ACTUAL RAG ROWS" lines={["Sparse RAG top-3 · retrieval", "Sparse RAG top-3 · generation", "CAG · generation"]} a="0.0008|0.6667|2.2631" highlight={1} note="SECONDS · HOTPOTQA LARGE" />,
  s30: <CagScene kind="versus" head="TOTAL RESPONSE TIME" a="0.67 s" b="2.26 s" lines={["SPARSE RAG TOP-3"]} />,
  s31: <CagScene kind="calc" head="OUR ARITHMETIC" lines={["2.2631", "÷", "0.6675", "=", "3.4×"]} highlight={4} note="RAG WAS FASTER · TABLE 3 v2" />,
  s32: <CagScene kind="caveat" head="THE CORRECTION" claim="40× faster than RAG" reality="40× vs re-reading the corpus. Sparse RAG was 3.4× faster than CAG." note="TABLE 3 · v2 (FEB 2025) · 64 DOCS / 85K TOKENS" />,

  s33: <CagScene kind="title" lines={["What about accuracy?", "This is where the story gets stranger."]} accent={1} />,
  s34: <CagScene kind="table" head="TABLE 2 · BERTSCORE · HOTPOTQA LARGE" lines={["CAG (v2)", "Sparse RAG top-5", "Sparse RAG top-3"]} a="0.7407|0.7535|0.7463" highlight={1} note="PUBLISHED VERSION · HIGHER IS BETTER" />,
  s35: <CagScene kind="versus" head="RAG WINS THIS ROW" a="0.7535" b="0.7407" lines={["SPARSE RAG TOP-5"]} note="BERTScore · HOTPOTQA LARGE" />,
  s36: <CagScene kind="version" head="SAME SET · TWO VERSIONS" a="CAG · 0.7527" b="CAG · 0.7407" lines={["BOLDED AS BEST", "NO LONGER BEST"]} />,
  s37: <CagScene kind="label" a="SAME AUTHORS · SAME EXPERIMENT" b="TWO DIFFERENT TABLES" lines={["we checked the source files"]} />,
  s38: <CagScene kind="code" head="THE v2 LATEX SOURCE" lines={["\\iffalse", "  % the entire v1 table", "  CAG (Ours)  ...  0.7527", "\\fi", "% active v2 table below"]} highlight={3} note="THE OLD TABLE IS STILL IN THE FILE" />,
  s39: <CagScene kind="version" head="v1 → v2" a="w/o CAG  →  In-Context Learning" b="94.35 s  →  92.08 s" lines={["the label changed", "the number changed"]} />,
  s40: <CagScene kind="quote" head="STILL QUOTING v1" lines={["CAG was more accurate", "in every configuration"]} highlight={0} note="PUBLISHED AFTER THE REVISION" />,
  s41: <CagScene kind="caveat" head="THE HONEST CONCLUSION" claim="CAG wins on accuracy" reality="CAG led small and medium sets. On the largest set, the answer depends on the version." note="READ BOTH TABLES" />,

  s42: <CagScene kind="title" lines={["There is a second cost", "nobody puts in the headline."]} accent={1} />,
  s43: <CagScene kind="spec" head="LLAMA 3.1 8B · PUBLISHED SHAPE" lines={["32 LAYERS", "8 KV HEADS", "128 DIM / HEAD", "2 BYTES / VALUE"]} note="bf16 PRECISION" />,
  s44: <CagScene kind="calc" head="OUR ARITHMETIC" lines={["2 × 32 × 8 × 128 × 2", "=", "131,072 B", "≈ 128 KiB / token"]} highlight={3} note="K AND V · bf16" />,
  s45: <CagScene kind="calc" head="OUR ARITHMETIC" lines={["128 KiB", "×", "85,000", "≈ 11 GB"]} highlight={3} note="BEFORE FRAMEWORK OVERHEAD" />,
  s46: <CagScene kind="label" a="OUR ARITHMETIC" b="NOT A PAPER FIGURE" lines={["derived from the model's published shape"]} />,
  s47: <CagScene kind="size" head="WHERE THE CACHE LIVES" lines={["KV CACHE · 85K TOKENS", "MODEL WEIGHTS · bf16"]} note="OUR ARITHMETIC · ROUGHLY" />,

  s48: <CagScene kind="title" lines={["So is CAG useless?", "No. It solves a real problem.", "In a narrow setting."]} accent={1} />,
  s49: <CagScene kind="flow" head="WHEN CAG IS A CLEAN DESIGN" lines={["SMALL", "STABLE", "HEAVILY QUERIED", "NO PER-USER PERMISSIONS"]} />,
  s50: <CagScene kind="spec" head="THE PAPER'S OWN USE CASES" lines={["Internal handbooks", "FAQs", "Support playbooks"]} />,
  s51: <CagScene kind="caveat" head="THE AUTHORS' LIMITATION" claim="CAG replaces RAG everywhere" reality="It becomes impractical for significantly larger datasets." note="PAPER LIMITATIONS · VERBATIM" />,
  s52: <CagScene kind="flow" head="THE AUTHORS' OWN SUGGESTION" lines={["FOUNDATION CONTEXT", "PRELOAD ONCE", "RETRIEVE EDGE CASES", "HYBRID"]} highlight={3} />,
  s53: <CagScene kind="version" head="INDEPENDENT TEST · 2026" a="620K tokens · CAG 15.0 s" b="620K tokens · retrieval 1.13 s" lines={["time to first token, p50", "different model, different setup"]} note="DIFFERENT MODEL · DIFFERENT SETUP" />,
  s54: <CagScene kind="title" lines={["The rule is not which technique wins.", "It is how much text you hold", "in memory for every answer."]} accent={1} />,
  s55: <CagScene kind="quote" head="THE PAPER'S OWN WORDS" lines={["Don't do RAG.", "And in the limitations:", "when not to do CAG."]} highlight={0} />,

  s56: <CagScene kind="label" a="40× FASTER?" b="WHAT IS THE OTHER ROW CALLED?" lines={["ask the question"]} />,
  s57: <CagScene kind="title" lines={["The number was never the lie.", "The label next to it was."]} accent={1} />,
  s58: <CagScene kind="code" head="PRIMARY SOURCE" lines={["Chan, Chen, Cheng, Huang", "Don't Do RAG", "WWW '25 Companion, pp. 893–897", "arXiv:2412.15605 v1 + v2"]} note="WE READ BOTH VERSIONS" />,
  s59: <CagScene kind="title" lines={["We read both versions", "so you do not have to."]} accent={1} />,
  s60: <CagScene kind="end" a="READ THE TABLE." b="Both versions. Both tables. Every row label." lines={["CAG vs RAG · WWW '25"]} note="SUBSCRIBE FOR MORE" />,
};

export const SCENE_IDS = Object.keys(SCENES);
