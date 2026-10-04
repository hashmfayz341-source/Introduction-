# Cell Injury — a narrated medical motion lesson

A complete React/TypeScript/Remotion lesson based on the supplied **28-page Cell
Injury and Cell Death, Part I** lecture (AMS-HIS Pathology Team). Eighteen scenes
show adaptation, energy failure, swelling, calcium/oxidative damage, membrane and
genome injury, recovery and cell death using a consistent SVG cell and organelles.

Permanent repository: https://github.com/hashmfayz341-source/Introduction-

English backup: [Download the narrated 1080p MP4](https://github.com/hashmfayz341-source/Introduction-/releases/download/cell-injury-v1/cell-injury.mp4).

## Arabic narration

The Arabic upgrade preserves all 18 existing scene designs and the English backup.
It uses Saudi Arabic narration (`ar-SA-HamedNeural`) with native English medical
terms (`en-US-AndrewNeural`), recorded through Microsoft Edge neural
speech under the requested last-resort exception. The preferred OpenAI connection
was unavailable. No human recording or direct listening review is claimed.

```sh
npm ci
npm run browser
npm run preview
npm run render:ar
```

Select **CellInjuryArabic**, or **LabAr-*** for individual mechanisms.
Output: **out/cell-injury-ar.mp4**, 1920×1080, 30 fps, H.264/AAC, BT.709.
The real master is **1389.462083 seconds**, **41,684 frames**
(23.158 minutes). All 18 scene lengths, 72 beat anchors and
75 internal mechanism events follow measured audio rather than the English duration.

Arabic script: `src/data/lesson.ar.json`, `docs/narration-ar.md`.
Included audio: `public/audio/narration-ar.wav`.
Measured timeline: `src/data/timeline.ar.json`, mirrored in `public/audio/timing.ar.json`.
Pronunciation controls and edit recipe: `src/data/pronunciation.ar.json`,
`public/audio/recordings.ar.json`. The generator is `scripts/generate-arabic-narration.py`.
See `docs/arabic-upgrade.md` for provider choice, backup and review limitations.

## Install and preview

Node 22+ and a Chromium-compatible browser are required. The recorded narration is
included, so Python and FFmpeg are needed only to regenerate it or run media QA.

```sh
npm ci
npm run browser
npm run preview
```

Select **CellInjury** in Remotion Studio. The `Lab-*` compositions isolate each
mechanism at its actual narration timing; `PipelineCheck` is a development diagnostic.
Fonts are bundled locally. No API keys or external image dependencies are needed.
For an installed browser, set `REMOTION_BROWSER_EXECUTABLE` to its absolute path.

## Render

```sh
npm run render
```

Output: **out/cell-injury.mp4**, H.264, AAC narration, 1920×1080, 30 fps, BT.709.
The measured master audio is **942.158 seconds**; the video is **28,265 frames**
(15:42.167 after rounding to the next complete frame). Validation blocks rendering
if the lecture, script, audio or timing fingerprints no longer agree.

The final MP4 is distributed as a GitHub release asset, rather than a large Git
source blob. Temporary renders, QA frames, caches and dependencies are ignored.

## Narration and timing

- Medical script: `src/data/lesson.json` — 18 scenes, 72 narration beats.
- Real recorded speech: `public/audio/narration.wav` — Microsoft Edge TTS,
  `en-US-AriaNeural`, rate `-5%`, normalized 24 kHz mono PCM.
- Sample-count master timeline: `src/data/timeline.json`.
- Spoken word boundaries and audio fingerprint: `public/audio/timing.json`.

Animations use recorded word boundaries, including substeps within a sentence;
scene lengths follow decoded samples plus deliberate short breathing pauses.
Regenerating speech requires network access and may produce different timing:

```sh
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python scripts/generate-narration.py
npm run typecheck
npm run check:ready
```

Re-review the visuals after changing narration. The included WAV gives deterministic
reproduction of the approved timing without depending on the speech service.

## Source and review

- `public/source/cell-injury-lecture.pdf`: complete supplied source.
- `docs/lecture-text.txt`: extracted text; image diagrams were reviewed separately.
- `docs/source-coverage.md`: every page mapped to the lesson; provenance decisions.
- `docs/medical-review.md`: source-grounded medical review and clarifications.
- `docs/qa.md`: render, visual, motion and playback verification record.

Diagram scale, particle counts and organelle numbers are illustrative. The lesson
separates inner mitochondrial permeability transition from outer membrane
permeabilization, distinguishes ROS from free radicals, and preserves the distinction
between reversible changes and loss of viability. The review is educational and
source-grounded; no independent clinician sign-off is claimed.

## Code layout and QA

`src/anatomy/` contains reusable cell structures; `src/components/` supplies labels,
arrows and scene layout; `src/scenes/` implements the four scene families;
`src/compositions/CellInjury.tsx` places them against the one master audio track.

```sh
npm run typecheck
npm run check:ready
node scripts/render-qa.mjs corrected
```

The QA script renders representative states, including intermediate mechanisms,
into ignored `qa/frames/`. To verify the encoded result, install
`requirements-qa.txt` (Python 3.11+), then run `python3 scripts/verify-video.py`. It measures
audio alignment against the original WAV in every scene. The extraction script
`python3 scripts/extract-encoded-qa.py` checks full video decoding and generates
the 98 reviewed encoded states recorded in `qa/encoded-states.json`. Media,
audio-alignment and browser-playback measurements are retained in `qa/*.json`.
Set the browser environment
variable as needed. Publication normally
uses `git push origin main`. If the environment's injected credential rejects Git
HTTPS but permits GitHub API writes, `python3 scripts/publish-github.py` publishes
and verifies the **exact existing Git objects**, with fast-forward updates only.

The environment's Git HTTPS and raw release uploads rejected their injected
credentials/headers. The completed source was transferred by a checksum-verified
Git bundle through a temporary GitHub Actions branch, retaining exact commit SHAs.
For the reviewed MP4, `scripts/publish-reviewed-artifact.py` transfers small binary
parts through Git Data API and lets a temporary Actions runner verify, upload,
download and publish the release. These helper branches are removed after success;
no temporary binary parts are added to `main`. Normal local Git/release commands
remain appropriate when their authenticated transports work.
