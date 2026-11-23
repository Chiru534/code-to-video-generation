# Confidence audit — every remaining video (23 Nov 2026)

Owner's question: *"what about the remaining — I want [confidence] about all the
remaining we are preparing to create."*

This covers all 17 items still in the pipeline, not just the next one. Two kinds
of confidence are tracked separately:

- **Claim confidence** — is the reversal actually true, from a primary source?
- **Demand confidence** — is there measured audience intent, and how strong are
  the incumbents?

A green build only proves the file is intact. Neither kind of confidence can be
replaced by rendering.

---

## 1. Summary table

| # | video | claim | demand | decision |
|---:|---|---|---|---|
| 1 | gps-relativity | previously verified | approved, md5 pinned | **upload after 13:30 IST** — no new work |
| 2 | ssd-trim | previously verified | measured | **re-render required** (33.4% dead band) |
| 3 | airplane-mode | previously verified | measured | **re-render required** (33.3% dead band) |
| 4 | **CAG vs RAG** | **HIGH** — v1+v2 LaTeX read | low (13.3K median) | **BUILD FIRST**, long-form |
| 5 | CAPTCHA | **HIGH with qualifier** | **1.60M median** | best growth bet; historically-scoped claim |
| 6 | Wi-Fi extender | **HIGH** — vendor docs | 287K median | build second; compounds on our breakout |
| 7 | 5G battery | **MEDIUM-HIGH** — papers | 437K median | build third; refine the claim first |
| 8 | QR codes | **HIGH with qualifier** | 267K median | build; strongest physical demo |
| 9 | Megapixels | **HIGH** — sensor vendor | 282K median | build later; crowded head |
| 10 | fine-tuning vs RAG | **HIGH** — OpenAI + 2 papers | unmeasured | measure 24 Nov, then build |
| 11–21 | remaining AI topics | **NOT VERIFIED** | unmeasured | no build until measured |

Honest headline: **seven of the nine concrete planned topics have verified
claims.** The two problem children are pipeline defects, not topic defects. The
AI topics beyond fine-tuning are candidates, not a slate — nobody should build
them on the strength of this document.

---

## 2. Verified reversals, with the exact qualifier each needs

### CAG vs RAG — HIGH
See `docs/AI_SLATE_CONFIDENCE_2026-11-23.md` for the full table-level audit.

The 40× is CAG vs **uncached re-reading** (92.08 s → 2.26 s), not vs RAG
(sparse top-3 was **0.67 s**, 3.4× faster than CAG). The v2 LaTeX keeps the v1
table inside `\iffalse ... \fi`: v1 called the baseline `w/o CAG` and scored CAG
0.7527; v2 calls it `In-Context Learning` and scores CAG 0.7407 while sparse RAG
top-5 scores 0.7535. Much of the web still quotes v1.

**On-screen qualifier:** `PAPER TABLE 3 · v2 (FEB 2025) · 64 DOCS / 85K TOKENS`.
**Never say** "RAG is more accurate" as a universal rule.

### CAPTCHA — HIGH, but historically scoped
CMU's own 2009 acquisition announcement: reCAPTCHA puzzles "serve the dual
purpose of protecting Web sites and digitizing printed text." The Register
(2012) and Google's own statement confirm Street View house numbers were fed
into Maps. The New York Times archive (from 1851) and Google Books were the
original customers.

**Critical qualifier:** text-era reCAPTCHA was retired **31 Mar 2018**. Modern
image-grids and risk-scoring v3 do not publish what any individual click trains.
The claim must be "the system was built to do this and Google confirmed it did",
not "your click today labelled this specific image". Without that qualifier the
video is wrong.

### Wi-Fi extender — HIGH
MikroTik documentation: "the throughput you get from it is reduced, at least, in
half... It doubles the overall air time." TP-Link's own RE210 manual states
extenders work in half-duplex and "the transmission time will be double-increased,
while the speed will be decreased." Hampshire Broadband's guide: "for every
packet it receives, the repeater must process it, and then forward it... cutting
the performance in half."

**Qualifier:** single-radio, same-channel repeaters. Dual-band/tri-band units
with a dedicated backhaul escape the halving. Say "single-radio extender", not
"all extenders".

### 5G battery — MEDIUM-HIGH, claim needs narrowing
SIGCOMM 2021 field measurements (Monsoon power monitor, two US carriers): 5G
tail power 249–1092 mW vs 178/66 mW on 4G; the 4G→5G switch itself costs
699–1494 mW. SIGCOMM 2022: a phone at 130 km/h sees ~553 NSA low-band handovers
/hour costing ~34.7 mAh, vs ~3.4 mAh for 4G — and 34.7 mAh would otherwise buy
~4.3 GB of download. An earlier event-based modem study shows PLMN search and
cell selection happen more often at low signal strength.

**Qualifier:** the measured mechanism is RRC state-machine tails, handovers and
4G↔5G switching, not simply "searching for a signal". Numbers are from specific
carriers/phones in 2020–22 studies — put the study and year on screen.

### QR codes — HIGH, with a precision qualifier
DENSO WAVE (the inventor, ISO/IEC 18004): L 7%, M 15%, Q 25%, H 30% of
**codewords** restorable. Reed–Solomon. Logos work because of that budget.

**Qualifier:** those percentages are codewords, not image area. Level H's 30%
does **not** mean a logo can cover 30% of the code; finder patterns are not
protected at all. State "up to ~30% of codewords (level H)" on screen.

### Megapixels — HIGH
Samsung's own ISOCELL Bright HM1 announcement: 108 MP at 0.8 µm, Nonacell merges
9 neighbouring pixels into a 2.4 µm super-pixel, default output **12 MP**. IEEE
IEDM 2020 paper confirms 12 MP output in binning mode. Apple's 48 MP → 12 MP
quad-binning is the 2×2 equivalent.

**Qualifier:** "by default" — full-resolution capture is available, and whether
it is sharper depends on the lens and diffraction, which is a separate claim
requiring its own calculation. Do not assert the diffraction conclusion without
doing it.

### Fine-tuning vs RAG — HIGH
OpenAI's optimizing guide draws the exact distinction: context optimization fixes
missing/outdated/proprietary knowledge; LLM optimization fixes inconsistent
format, tone and reasoning — "fine-tuning teaches behaviour, retrieved context
supplies facts". Their own example shows RAG *reducing* BLEU from 87 to 83 when
the problem was behavioural. Gekhman et al. found facts introduced by SFT are
learned slowly and increase hallucination; Ovadia et al. found RAG consistently
beats unsupervised fine-tuning for knowledge.

**Qualifier:** the hallucination finding is for closed-book QA with new facts —
it does not apply to fine-tuning for format or style.

### CAG video — caveat carried forward
The accuracy row is version-dependent. Lean on latency and the authors' stated
limitation; never present v1 accuracy as current.

---

## 3. Pipeline confidence (the three already-built files)

| video | state | next action | risk |
|---|---|---|---|
| gps-relativity | rendered, approved, md5 `a2ea0f6…`, scheduled 26 Nov 07:30 IST | upload after quota reset | none — approval is current for that exact file |
| ssd-trim | approved but **33.4% interior dead band** | re-render, then re-approve | re-render voids the md5 approval; do not upload the current file |
| airplane-mode | approved but **33.3% dead band** | re-render, then re-approve | same |

The dead-band check does not yet exist in `audit.py`. It should be added before
either re-render, or the same defect can ship again. Dark-pixel counting is
useless here — the theme is dark by design. The metric that worked was mean
largest interior inactive-row run per frame.

---

## 4. What is NOT confident

1. **Demand for 11 of the 21 AI candidates.** Only `rag vs cag` (13.3K median)
   and `rag chunking strategies` (11.1K) are measured against YouTube. Bing
   result counts were tested and **discarded** — they returned identical values
   for unrelated queries. Web search gives qualitative signal only.
2. **The `lost in the middle` / context-window angle.** Demand is high and the
   field is dense (MIT lecture, multiple 2026 explainers, recent shorts). No
   reversal is left to own — this is an incumbent's topic, not ours.
3. **Semantic caching.** AWS and Redis dominate the tutorials. A neutral
   explainer could differentiate, but it is unmeasured and the failure mode
   ("similar question → old wrong answer") still needs a source.
4. **Embeddings, temperature, vector search, chunking.** Reasoned candidates
   with no verification. No build until `scripts/measure_ai_slate.py` runs at
   13:30 IST tomorrow.
5. **Our expected views.** Median views of incumbent videos are demand
   proxies. This channel has 5 subscribers and 552 views. Nothing here predicts
   that we capture any share of them.

---

## 5. Decision, one video at a time

- **Now:** build only CAG vs RAG, long-form. Its claim is the most thoroughly
  verified of any topic in the pipeline, and the v1/v2 discovery makes it a
  better video than the original plan.
- **After it is genuinely finished** (lookdev reviewed, render audited, frame
  checked): run the 22-query AI measurement at 13:30 IST 24 Nov.
- **Then:** pick the next single video from measured demand × verified claim ×
  buildability. Current evidence puts CAPTCHA first on demand, Wi-Fi extender
  first on compounding with our existing audience, and fine-tuning vs RAG first
  among unmeasured AI topics.
- **Never** upload without the owner's explicit approval of that exact file.

---

## 6. Sources used

CMU News (2009 reCAPTCHA acquisition); The Register (2012 Street View); NYT
(2011); Ars Technica (2009); MikroTik RouterOS repeater docs; TP-Link RE210 and
TL-WA860RE manuals; Hampshire Broadband Wi-Fi guide; SIGCOMM 2020/2021/2022 5G
measurement papers; event-based modem power model (ACM); DENSO WAVE QR standard
and error-correction pages; ISO/IEC 18004 Table 8; Samsung Semiconductor HM1
announcement; IEEE IEDM 2020 Nonacell paper; OpenAI Optimizing LLM Accuracy;
Gekhman et al.; Ovadia et al.; arXiv 2412.15605 v1+v2 LaTeX source.
