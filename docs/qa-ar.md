# Arabic upgrade verification

The Arabic version retains all 18 original SVG scene designs. Review concerns
spoken Arabic, native English terminology, measured retiming and the resulting
encoded lesson. English source/audio/timing remain byte-identical to `cell-injury-v1`.

## Real audio and pronunciation

Microsoft Edge neural speech was used under the user's explicit last-resort
exception after preferred-provider authentication and available voice checks failed.
Saudi Arabic uses `ar-SA-HamedNeural`; English terms use
`en-US-AndrewMultilingualNeural`, both at `-3%`.

The corrected master has 33,805,576 samples at 24 kHz, 1408.565666667 seconds;
the composition has 42,257 frames at 30 fps, 23:28.566667. All 72 beats and
75 mechanism event cues are measured from recorded words and actual PCM joins.
There are 167 native English term segments and 2,292 real spoken word boundaries.

The full first recording was analyzed with independent ASR and waveform checks.
The initial unbroken multilingual voices produced weak mixed-language recognition;
Saudi Arabic plus native English segments improved terminology clarity. ATPase
was changed to **A T P ace**, with ions expanded to sodium/potassium; plural
ATPases uses **A T P aces**. Other acronym controls are documented in
`src/data/pronunciation.ar.json`.

The first full master exposed repeated service-added trailing silence. Leading
and trailing padding was trimmed with acoustic guards, preserving every reported
word interval and internal sentence pauses. This removed 58.245 seconds without
time stretching. All scene and event times were recomputed, and QA was repeated.

The corrected full master was independently processed again: **72/72 beats**.
An English-language test of actual master clips recognized all eleven required
medical terms, including the corrected ATPase. The waveform has **zero clipped
samples**; longest measured silence above the -50 dB threshold is **1.18 seconds**.
Evidence: `qa/arabic/audio-review.json`; the raw ASR transcript is diagnostic and
is not the approved narration script.

Direct listening is unavailable in this execution interface. ASR and acoustic
review do not certify human-level naturalness, accent or imperceptible voice
changes. No direct human listening or independent clinician sign-off is claimed.

## Visual and medical review

146 representative states were rendered at actual Arabic timing: start, middle,
all four narration beats, end and important intermediate mechanism states.
All 18 contact sheets were visually inspected, with individual full-resolution
checks of pump swelling, mitochondrial membranes, lysosomal release and contained
apoptotic bodies. The complete set was re-rendered and visually inspected after
silence correction. **Corrected representative visual QA: PASS.**

The separate medical pass compared the complete 28-page lecture, Arabic script
and rendered mechanism states. It retains the established clarifications in
`docs/medical-review.md`, including:

- Na/K pumping and calcium regulation remain separate; water follows sodium gain.
- Glycolysis, lactate/pH, chromatin changes and reduced protein synthesis remain
  parallel energy-loss consequences rather than one obligatory cascade.
- Inner mitochondrial gradient/ATP failure differs from outer cytochrome-c release.
- Hydrogen peroxide is ROS without being a free radical; SOD produces peroxide,
  then catalase/GPx remove it.
- Plasma, mitochondrial and lysosomal membranes have distinct consequences.
- Necrotic leakage differs visibly from membrane-contained apoptotic fragments.
- Recovery depends on retained viability, severity, timing and cell type.

All eight cause categories, six mechanisms, supporting morphology and source
examples remain represented. **Source-grounded medical review: PASS.**

The motion-design and student review retain causal reveals, organelle zooms,
normal-to-swollen-to-recovered cell continuity and short English labels. Existing
visual event names select actual Arabic phrases through semantic cues, with a
hard failure if a cue is absent. No 18-scene redesign or global timeline stretching
was introduced. **Representative motion/student review: PASS.**

## Reproduction and encoded checks

```sh
npm run typecheck
npm run check:ready:ar
REMOTION_BROWSER_EXECUTABLE=/usr/bin/chromium npm run render:ar
python scripts/verify-video.py out/cell-injury-ar.mp4 --timeline src/data/timeline.ar.json --record qa/arabic/final.json
python scripts/extract-encoded-qa.py --video out/cell-injury-ar.mp4 --manifest qa/arabic/encoded-states.json --output qa/frames/encoded-arabic
```

Final encoded media, audio/AAC synchronization, transition inspection and actual
browser playback are the remaining checks before release publication. Those
results will be recorded here and in `qa/arabic/*.json`; the still review above
does not falsely certify an unrendered MP4.
