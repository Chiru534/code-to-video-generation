# Confidence check — AI-engineering slate (23 Nov 2026)

**Question asked by the owner:** before creating the videos, are these actually the
best ones to go for? Find the confidence first.

**Short answer:** the CAG vs RAG video is **high confidence on the claim** and
**medium confidence on demand**. It is the right first AI-engineering video as a
credibility build, not as a growth bet. Two other topics measured better demand,
but neither has a claim this well verified. Build CAG first, at long-form length,
and let the 13:30 IST measurement tomorrow decide video #9.

---

## 1. The claim — verified from primary source

Source: Chan, Chen, Cheng, Huang, *Don't Do RAG: When Cache-Augmented Generation
is All You Need for Knowledge Tasks*, arXiv 2412.15605, WWW '25 Companion.
Both arXiv source tarballs (`e-print/2412.15605v1`, `...v2`) were downloaded and
the LaTeX inspected directly — not a blog summary.

### 1.1 The paper never claims "40× faster than RAG"

The abstract says CAG "achieves comparable or superior results with reduced
complexity". It contains no speedup number at all. The 40× is arithmetic done by
readers from **Table 3**, and the row it compares against is mislabelled by the
v1 paper and correctly labelled in v2.

| version | baseline row in Table 3 | CAG | baseline | ratio |
|---|---|---:|---:|---:|
| **v1** (Dec 2024) | `w/o CAG` | 2.32667 s | 94.34917 s | 40.5× |
| **v2** (Feb 2025, published) | `In-Context Learning` | 2.2631 s | 92.0824 s | 40.7× |

The RAG baselines in the same table are a different set of rows:

| system (HotPotQA Large, 64 docs, 85K tokens) | retrieval | generation | total |
|---|---:|---:|---:|
| sparse RAG, top-3 | 0.0008 s | 0.6667 s | **0.6675 s** |
| dense RAG, top-3 | 0.4123 s | 0.9331 s | 1.3454 s |
| CAG | — | 2.2631 s | 2.2631 s |
| in-context learning, no cache | — | 92.0824 s | 92.0824 s |

**Sparse RAG was 3.4× faster than CAG** on the paper's own largest test set.

### 1.2 The v1/v2 discrepancy is real, and worse than "a different table"

The v2 LaTeX keeps the entire v1 table inside `\iffalse ... \fi` — commented out,
so it does not appear in the v2 PDF but is still in the source file. The active
v2 table changes both the baseline's **name** (`w/o CAG` → `In-Context Learning`)
and its numbers.

Accuracy, HotPotQA Large, BERTScore:

| version | CAG | best sparse RAG | winner |
|---|---:|---:|---|
| v1 | **0.7527** (bolded as best) | 0.7495 | CAG |
| v2 (published) | 0.7407 | 0.7535 (top-5) | sparse RAG |

So the internet did not merely misread the paper — much of it is still quoting
v1. Confirmed examples:

- "CAG is 40x faster than RAG, Retrieval-Free with higher precision" — LinkedIn, Jan 2025
- "CAG: A Cache Augmentation Generation Method 40x Faster than RAG" — kdjingpai.com, Jan 2025
- "94.35 seconds with RAG to just 2.33 seconds—40 times faster" — Empathy First Media, Apr 2025
- "Generation time reduced from 94.34s to 2.32s ... CAG scored 0.7759" — rohan-paul.com, Jan 2025
- "CAG was more accurate in every single configuration" — Towards AI, Mar 2026 (v1 table)

And at least one 2026 source gets it right and says so explicitly: SAP Community
(Dec 2025) notes the 40.5× is "compared to 94.35 seconds **without caching**".

**Verdict: the correction is not a invented angle. It is checkable, current, and
the primary source is stronger than the secondary claims.**

### 1.3 What the video must NOT say

- Do not claim "RAG is more accurate than CAG" as a general rule. v1 and v2
  disagree on the largest set, and CAG wins most other configurations.
- Do not use v1 numbers on screen unless the frame explicitly says
  `v1 (DEC 2024)` and shows v2 beside it.
- The authors' own limitation, verbatim: *"becomes impractical for significantly
  larger datasets."* That is the honest boundary, not our own extrapolation.

---

## 2. Demand — measured, with the limits stated

### 2.1 YouTube Data API, relevance-ordered (the channel's standard method)

| query | top | median | >100K | when measured |
|---|---:|---:|---:|---|
| `rag vs cag` | 1,135,326 | 13,328 | 3/12 | 23 Nov |
| `rag chunking strategies` | 165,494 | 11,119 | 2/12 | 23 Nov |
| `why are captchas so hard` | 34,300,000 | 1,600,326 | 9/12 | 23 Nov |
| `does 5g drain battery` | 4,100,000 | 437,167 | 9/12 | 23 Nov |
| `do more antennas mean better wifi` | 4,600,000 | 287,391 | 9/12 | 23 Nov |

Two AI terms measured so far sit at ~11–13K median — an order of magnitude below
the everyday-tech winners. The head is two IBM Technology videos (1.14M and
650K); the fourth result drops to 28K. That is a small field with weak incumbents
below the top two, which is the only kind a 5-subscriber channel can rank in.

### 2.2 Free internet signal (no quota spent)

Bing result counts proved too coarse to use (repeated identical values across
unrelated queries) — discarded. Web search of YouTube results showed:

- **RAG chunking** — many recent tutorials (Cole Medin 165K, Mervin Praison
  154K, Redis 9.6K, KodeKloud 3.1K). Real but tutorial-shaped intent.
- **Lost in the middle / context windows** — the densest field: MIT lecture,
  multiple 2026 explainers, and a recent short "Why Bigger Context Windows Make
  AI Worse". High demand, strong incumbents, no clean reversal left to own.
- **Semantic caching** — dominated by AWS/Redis-sponsored material. Commercial
  content, so a neutral explainer could differentiate, but the topic is narrow.
- **CAG** — ~93,300 web results, heavy article coverage through 2026, but few
  YouTube videos and none that lead with the misquote.

### 2.3 Honest limit

These are demand proxies and incumbent-strength measures, **not** our expected
views. The channel has 5 subscribers and 552 total views. A 13K-median field
does not mean we capture any of it. It means the question has an audience and
the incumbents below the head are weak.

---

## 3. Confidence scorecard

| candidate | claim verified | demand | incumbents | reversal | buildability | verdict |
|---|---|---|---|---|---|---|
| **CAG vs RAG** | **HIGH** — primary source, v1+v2 LaTeX | low (13K) | weak below IBM | **excellent** | excellent — pipeline + table | **BUILD FIRST** |
| context window / lost in middle | medium — well established | high | strong | weak — already said everywhere | excellent | wait for measurement |
| fine-tuning vs RAG | medium — needs verification | unmeasured | unknown | good if "behaviour not knowledge" holds | good | measure tomorrow |
| RAG chunking | medium — needs verification | low (11K) | weak | needs a real checkable claim | excellent | measure tomorrow |
| semantic cache | medium | unmeasured | commercial | "returns an old answer" is checkable | good | measure tomorrow |
| CAPTCHA (everyday tech) | needs verification | **1.60M** | strong at top | excellent | excellent | best growth bet, off current direction |

---

## 4. Decision

1. **Build CAG vs RAG as video #8, long-form (6–8 min).** It is the only topic
   where the primary-source correction is fully verified. The v1/v2 discovery
   makes it a better video than originally planned: the story is not just
   "people misquote a number" but "the paper itself changed the label, and the
   internet kept the old one."
2. **Do not claim it is the biggest opportunity.** It is a credibility video.
   The measured everyday-tech fields are 30–120× larger.
3. **At 13:30 IST tomorrow**, run `scripts/measure_ai_slate.py` (22 queries,
   2,200 units) before committing to video #9. The internet-only proxies above
   are a filter, not a replacement for the channel's measured method.
4. **Nothing here authorises an upload.** Publication stays gated per file, per
   version, on the owner's explicit instruction.

---

## 5. Evidence trail

- arXiv source: `https://export.arxiv.org/e-print/2412.15605v1` (83,858 B) and
  `...v2` (649,526 B), downloaded to `%TEMP%\opencode\cag-v1.tar` / `cag-v2.tar`.
- v2 HTML: `https://ar5iv.labs.arxiv.org/html/2412.15605v2` — Tables 2 and 3.
- Misquote examples: LinkedIn, kdjingpai.com, Empathy First Media, rohan-paul.com,
  Towards AI (Mar 2026), SAP Community (Dec 2025, the correct reading).
- Raw YouTube measurements: `%LOCALAPPDATA%\c2v\topic_relevance.json`,
  `topic_relevance_2026-11-23.json`, and the single `rag chunking strategies`
  probe run 23 Nov via `quota_probe.py`.
