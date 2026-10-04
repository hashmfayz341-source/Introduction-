# Arabic narration upgrade

The existing 18-scene lesson is being upgraded with spoken Arabic narration.
No scene designs, anatomy, labels or transitions have been replaced.

## English backup

The complete English version remains available at the immutable source tag
`cell-injury-v1`, commit `8777ef17494e38a86dd4fb6e4a60f8eb5b7230c6`, and its
[published MP4](https://github.com/hashmfayz341-source/Introduction-/releases/download/cell-injury-v1/cell-injury.mp4).
The current local English MP4 is `out/cell-injury.mp4`, SHA-256
`37ded821224caf1a059ed7a53170cdaa9a61487c12e952632dd95704cd669d6b`.
The English script, audio and measured timeline remain unchanged.

## Arabic script review

`src/data/lesson.ar.json` and `docs/narration-ar.md` contain 72 rewritten narration
beats across the same 18 scenes, preserving all 28 source-page mappings.
The delivery uses clear Arabic with restrained Saudi-friendly spoken phrasing,
and English medical vocabulary explained when first introduced.

Review against the source and approved English lesson confirms:

- All eight injury-cause categories and six interacting mechanisms remain present.
- Permanent cells' limited division is distinguished from size changes.
- Reversible membrane changes preserve viability; severe irreversible injury
  cannot be rescued simply by removing the original cause.
- Hypoxia and ischemia remain distinct. Na/K pumping is separate from calcium entry.
- ATP loss branches through swelling, glycolysis/acidosis and reduced protein synthesis.
- Calcium activates the correct four enzyme classes and mitochondrial/caspase pathways.
- Inner mitochondrial gradient failure is distinct from outer cytochrome-c release.
- Nonradical hydrogen peroxide, the three ROS target classes and sequential peroxide
  detoxification retain the corrections made during the English medical review.
- Lysosomal enzymes move into cytoplasm after membrane injury, and apoptotic
  fragments remain contained during formation and clearance.
- The nonspecific source example “Mediterranean disease” is preserved without
  assigning it an invented diagnosis.

There are 75 named mechanism cue spans, including all 64 literal event calls and
11 dynamically selected events. These are actual words or phrases in the Arabic
script. Their eventual timing must be measured from the real recording; no audio
duration or fabricated word timestamps have been added.

Validate this preparation with `node scripts/check-arabic-script.mjs`.

## Recording and pronunciation

The preferred OpenAI Platform connection rejected account/project target access.
There was no usable higher-quality speech provider or credential in the environment.
The user's explicit last-resort exception therefore permits Microsoft Edge neural
speech; this is not represented as OpenAI or a human recording.

- Arabic voice: `ar-SA-HamedNeural`, adult Saudi male, rate `-3%`.
- English terminology: `en-US-AndrewNeural`, rate `-3%`.
- 72 complete Saudi Arabic beats retain sentence prosody. Their Latin medical
  phrases are replaced with 167 independently recorded native English segments.
- Language joins use measured words, short acoustic guards, volume matching and
  5 ms fades. No time stretching is applied.
- Excess utterance padding identified in the first full audio review was removed;
  internal pauses and all word intervals are preserved. All scenes were retimed again.
- `Na+/K+ ATPase` is spoken as sodium potassium A T P ace; ATPases uses
  A T P aces. ATP, DNA, ER, ROS, SOD and pH use explicit English letters.

The corrected master has **33,347,090 samples at 24,000 Hz**,
**1389.462083 seconds**, with **41,684 video frames**
after rounding up. `public/audio/narration-ar.wav` is the included real audio;
`src/data/timeline.ar.json` and `public/audio/timing.ar.json` contain the same
measured timeline. `public/audio/recordings.ar.json` records the recording and edit
recipe. All 75 semantic events resolve to real recorded words; missing events fail.

## Composition and reproduction

`CellInjuryArabic` uses the same 18 visual implementations through a language-specific
lesson/timeline context. `LabAr-*` isolates the corrected Arabic mechanism timing.
`CellInjury` and `Lab-*` retain the original English timeline and master audio.
The anatomy, scene SVGs, labels and scene transitions have not been redesigned.

```sh
npm ci
npm run typecheck
npm run check:ready:ar
npm run render:ar
```

Arabic output: `out/cell-injury-ar.mp4` (1920×1080, 30 fps, H.264/AAC).
Preview with `npm run preview` and select `CellInjuryArabic`.
For regeneration, install `requirements.txt` in a virtual environment, then run
`python scripts/generate-arabic-narration.py`. Regeneration can change timing;
the included master makes a local render reproducible without contacting TTS.

## Review limits

Independent ASR of the first full master recognized all eleven required English
medical terms; ATPase was separately checked after its spelling control was fixed.
The complete second automated audio review processed 72/72 beats, and corrected
visual QA inspected 146 representative frames across all 18 scenes before encoding. Audio recognition, waveform checks and playback validation are evidence
of audibility and synchronization, not a claim of human listening or clinician sign-off.
Direct listening is not available in this execution interface, and the fallback
speech engine cannot accept the proposed natural-delivery instruction text.
