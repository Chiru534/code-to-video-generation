# The video pipeline — how to work in this repo

Read this before writing a video. It is the whole contract. You should not need
to read anything else in `video/` to write a correct video, and you should
never need to read the other videos.

---

## 1. The one map

`video/episodes.json` is the registry. Every video is one entry:

```json
"littlebit-film": {
  "title": "The Layer Below: How AI Got Under One Bit",
  "srcDir": "src/littlebit/film",
  "audioDir": "public/audio/littlebit-film",
  "composition": "LittleBitFilm",
  "output": "littlebit-film.mp4",
  "thumbSeconds": 12.0,
  "status": "draft",
  "shape": "film",
  "style": "film"
}
```

- `status` — `published` / `draft` / `deprecated`. Read it before you copy
  something: a draft may be half-baked.
- `shape` — `series` / `short` / `film`. This is the template to copy.
- `style` — the visual system, so two videos never drift apart by accident.

**Never copy a video by copying its files.** Copy its *shape*: one of
`src/episode*/`, `src/littlebit/`, `src/littlebit/film/`.

---

## 2. The kit

Everything reusable lives in `video/src/kit/`. If you need a new primitive,
put it there — not in the episode.

| File | What it is |
|---|---|
| `core.tsx` | Timing and determinism. `CLAMP`, `ease`, `prog`, `ph`, `lin`, `rnd`, `wobble`, `useScene` |
| `scene.tsx` | The **portrait** (1080×1920) kit: `Hero`, `Foot`, `Mark`, `Top`, `Sub`, `Statement`, `Bar`, `Chip`, `Stat`, `Matrix` |
| `portrait.tsx` | The **portrait scene kinds** for the weekly shorts: `ShortFigure`, `ShortStack`, `ShortCompare`, `ShortScale`, `ShortBits`, `ShortGrid`, `ShortTokens`, `ShortCaveat`, `ShortTitle`, `ShortEnd` |
| `film.tsx` | The **landscape** (1920×1080) kit: `FILM`, `Ground`, `Stage`, `Kicker`, `Statement`, `CompareBar`, `Ledger`, `Panel`, `Label` |
| `scenes.tsx` | The shared **scene vocabulary**: `Chapter`, `Stat`, `MatrixGrid`, `Ladder`, `Spectrum`, `Equation`, `Caveat`, `Code`, `Predict`, `EndCard` |
| `shortfilm.tsx` | The renderer every weekly short shares: `ShortFilm`, `shortDuration` |
| `draw.tsx` | `DrawPath`, `DrawDot` — stroke-by-stroke drawing |
| `timeline.ts` | `buildPlan`, `timelineFrames` — scene timing from measured narration |

Two kits because 1080-wide geometry does not transfer to 16:9. They share the
timing core, so motion behaves identically in both.

**Which kit:** portrait → `scene.tsx`. Landscape → `film.tsx`. Shared scenes →
`scenes.tsx`. If you want a new look, build a new module in `kit/`, not a new
private helper inside an episode.

---

## 3. The rules

These are hard-won. Each one exists because ignoring it produced a bad video.

**Durations come from measured audio.** Never estimate a scene length. The
narration is measured by `tools/tts.py`, which writes `timings.json`, and the
composition cuts each scene to its measured length plus `TAIL_FRAMES` (12).

**The TTS is NOT bit-reproducible.** Two renders of the same video produce
different audio, so the md5 of the MP4 changes every time and the total
duration can shift by a fraction of a second — which moves every cut point.
**Never use md5 as a regression check on a rendered video.** To prove a
refactor did not change the pixels, extract a frame from the old and the new
file at the SAME TIMESTAMP and compare them (PSNR). `inf` means pixel
identical; a low value usually means a scene boundary moved, not a bug.

**Animate by fraction, not by frame.** Scenes are cut to measured narration, so
absolute frame numbers drift between renders. Use `ph(frame, d, a, b)` and
`lin(frame, d, a, b)` where `d` is the scene's length. Use `lin` for sweeps,
wipes and counters: the eased version is ~90% done at its own midpoint, so a
staggered wipe finishes before the viewer sees it start.

**Never `Math.random`.** The same frame must produce the same pixels on every
render, or the render is not reproducible. Use `rnd(seed)` / `wobble(seed, t)`.

**One component per name.** `TitleScene`, `HookScene`, `BudgetScene` and
`EndCard` were hand-written five times across the episode series. Use the
shared ones. `tools/audit.py` fails the build if a component name is defined in
two places inside `src/kit/`.

**Every narration line needs a scene.** The composition walks the scene
registry, so a line with no scene is never spoken. The audit fails the build
for it.

**Keep the claim honest.** Say which number is a paper figure, which is
potential, and which is your own arithmetic. Put the qualifier ON SCREEN, next
to the number — not in a caption the viewer may miss. `Stat` takes a `note`
for exactly this: `POTENTIAL · PAPER ESTIMATE`, `PAPER FIGURE`,
`OUR ARITHMETIC`.

**Never `Math.random`, never a static frame for 8+ seconds.** Every scene has
motion. If a scene looks static at its midpoint, it is broken.

**Content is data.** Narration in `narration.json`, scenes wired to it. If you
find yourself copying 200 lines of scene code to start a new video, the shared
kit is missing something — add it to `kit/` instead.

---

## 4. Adding a video

1. `video/src/<name>/narration.json` — one line per scene:
   `{"voice": "af_heart", "speed": 0.95, "lines": [{"id": "s01", "text": "..."}]}`
2. `video/src/<name>/timings.json` — a PLACEHOLDER. CI overwrites it with
   measured values. It must exist so the first bundle resolves the import.
   Generate both with `python tools/make_film_script.py` if you want the
   placeholder to be accurate.
3. `video/src/<name>/<Name>.tsx` — the composition. Copy the shape of an
   episode with the same `shape` and delete what you do not need.
4. `video/src/<name>/scenes.tsx` — the scene registry, in narration order.
5. Register the composition in `video/src/Root.tsx` with its canvas.
6. Register the episode in `video/episodes.json`.
7. `cd video && npx tsc --noEmit && python tools/audit.py --static`

Then: **lookdev before you render.** One still per scene at its midpoint,
reviewed by eye. A green build means the file is intact and self-consistent —
it does not mean the video is good.

---

## 5. The gates

| Gate | Where | What it stops |
|---|---|---|
| `audit.py --static` | CI, before any spend | Contradictions across files: slate vs narration, stale timings, a narration line with no scene, a duplicate component |
| `audit.py --video` | CI, after the render | Wrong resolution, wrong codec, duration vs timeline, loudness out of band, silent audio |
| `lookdev.yml` | CI, on demand | Wasteful renders of a video that does not look right |
| Drive upload verification | CI | A file that did not actually land |

**`audit.py` is an integrity gate, not a quality gate.** It proves the file is
valid. It cannot tell you the video is good. Only looking at frames can.

---

## 6. Zero-waste

The plan job in `render.yml` maps changed files to episodes and renders
nothing when no relevant file changed. Two consequences:

- `src/chrome`, `src/theme` and `tools/tts.py` are shared: touching them
  re-renders every episode.
- `src/kit/` belongs to no episode: touching it renders nothing. Dispatch the
  composition you changed, deliberately.

Never re-render a finished video because you touched something unrelated. When
you must change a shipped video, say so out loud and dispatch it on purpose.

---

## 7. The pipeline

```
narration.json  ->  tools/tts.py (Kokoro, CPU)  ->  public/audio/<ep>/*.wav
                                               ->  src/<ep>/timings.json
             ->  Remotion render (scene length = measured line + 12f)
             ->  ffmpeg loudnorm I=-14  ->  thumbnail at thumbSeconds
             ->  tools/audit.py --video
             ->  tools/gdrive_upload.py  ->  Drive, dated folder, with thumbnails
```

Nothing renders on the laptop. The runner's disk is destroyed afterwards, so
the Drive file is the only permanent copy. A local `out/*.mp4` is a debugging
artifact.

---

## 8. The weekly shorts

Fourteen Shorts, two a day, one dated folder each. They are **not**
hand-written. The content is one table; everything else is generated.

```
video/tools/make_shorts_week.py    THE TABLE + the generator
video/src/kit/portrait.tsx         the portrait scene kinds
video/src/kit/shortfilm.tsx        the renderer every short shares
```

A short is four generated files in `src/shorts/<slug>/`:

```
narration.json   the spoken lines
timings.json     PLACEHOLDER; CI overwrites it with the measured lengths
scenes.tsx       scene id -> a kit component
<Name>.tsx       the thin composition that wires them to the renderer
```

**To add a short:** add an entry to `SHORTS` and one to `UPLOAD` in
`tools/make_shorts_week.py`, then run it. It writes the four files, the
`episodes.json` entry, the `Root.tsx` registrations and `SHORTS_WEEK1.md`
(the paste-from sheet). Never hand-edit the generated files.

Rules that are not obvious:

- **The scene registry is TSX, not JSON.** `tools/audit.py` finds a scene by
  looking for `sNN:` lines in the `.tsx` files of the episode directory, so a
  JSON registry fails the "every narration line has a scene" gate.
- **Colours in the table are theme tokens, not CSS keywords.** `amber`,
  `green` and `text` are not CSS colours. The generator maps them to the
  theme; a raw colour string renders an invisible element, and an invisible
  element is how a scene ships empty.
- **`publishDate` in `episodes.json` is the dated Drive folder.** It is the
  PUBLISH date, not the render date — a whole week renders in one run, so
  every folder would otherwise land on the same day.
- **Every number that needs a qualifier gets a `note`.** The note renders ON
  SCREEN next to the number. `OUR ARITHMETIC` is not optional.
- **A big value is fitted to its box.** `ShortCompare` and `ShortFigure`
  scale the font to the longest value; "ARITHMETIC" at 100px is wider than
  the card and a clipped word is the kind of defect the eye catches
  instantly.

Lookdev every short before it renders. `lookdev.yml` takes one composition
per dispatch, so a week of shorts is a week of dispatches.
