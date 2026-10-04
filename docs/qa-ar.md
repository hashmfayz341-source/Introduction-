# Arabic upgrade verification

The Arabic version retains all 18 original SVG scene designs. Review concerns
spoken Arabic, native English terminology, measured retiming and the resulting
encoded lesson. English source/audio/timing remain byte-identical to `cell-injury-v1`.

## Real audio and pronunciation

Microsoft Edge neural speech was used under the user's explicit last-resort
exception after preferred-provider authentication and available voice checks failed.
Saudi Arabic uses `ar-SA-HamedNeural`; English terms use
`en-US-AndrewNeural`, both at `-3%`.

The corrected master has 33,347,090 samples at 24 kHz, 1389.462083333 seconds;
the composition has 41,684 frames at 30 fps, 23:09.466667. All 72 beats and
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

The final full master was independently processed again: **72/72 beats**.
An English-language test of actual final-master clips recognized all eleven required
medical terms, including the corrected ATPase. The waveform has **zero clipped
samples**; longest measured silence above the -50 dB threshold is **1.18 seconds**.
Evidence: `qa/arabic/audio-review.json`; the raw ASR transcript is diagnostic and
is not the approved narration script.

Direct listening is unavailable in this execution interface. ASR and acoustic
review do not certify human-level naturalness, accent or imperceptible voice
changes. No direct human listening or independent clinician sign-off is claimed.

## Visual and medical review

146 representative states were rendered at final Arabic timing: start, middle,
all four narration beats, end and important intermediate mechanism states.
All 18 contact sheets were visually inspected, with individual full-resolution
checks of pump swelling, mitochondrial membranes, lysosomal release and contained
apoptotic bodies. The complete set was re-rendered and visually inspected after
the final single-language English voice correction. The 18 final contact sheets
and critical full-resolution checks are recorded in `qa/arabic/visual-review.json`.
**Final representative visual QA: PASS.**

The completed MP4 was then decoded in full with FFmpeg's error-on-failure mode.
All **197 encoded states** were extracted and inspected: the same 146 mechanism
states plus three states around each of 17 transitions. All 18 encoded scene
contact sheets, five transition sheets, four critical full-resolution images and
four actual playback screenshots were viewed. Text, anatomy, cropping and causal
reveals remain clear. Brief dark transition states are the existing scene fades.
No additional scene redesign was required. **Encoded visual QA: PASS.**

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

The first full final-voice attempt completed all 41,684 rendered frames but failed
at audio preprocessing because the container's `/tmp` mount ran out of space.
No completed MP4 was certified. The render command now checks capacity and uses
ignored workspace temporary storage, with about 8 GiB reserved. Audio, timelines
and scene source were not changed by this infrastructure correction.

```sh
npm run typecheck
npm run check:ready:ar
REMOTION_BROWSER_EXECUTABLE=/usr/bin/chromium npm run render:ar
python scripts/verify-video.py out/cell-injury-ar.mp4 --timeline src/data/timeline.ar.json --record qa/arabic/final.json
python scripts/extract-encoded-qa.py --video out/cell-injury-ar.mp4 --manifest qa/arabic/encoded-states.json --output qa/frames/encoded-arabic
```

The successful final render used source commit
`88a2bd359e3e4a6975e215ba88609aaa634b96d0`. The final file is
`out/cell-injury-ar.mp4`, **106,903,521 bytes**, SHA-256
`3691118db31ee87cc1e558f42fc4c5501569be2f6556611194f47c4a77cdaaf5`.
It contains **41,684 frames**, **1389.466667 seconds**, 1920×1080 at 30 fps,
H.264/yuv420p/BT.709 and stereo 48 kHz AAC. The later QA/documentation commit
does not change render inputs.

Comparison of decoded AAC against the measured narration master found **zero
lag at all 18 scene anchors**, with minimum correlation **0.9998916**.
The full AAC waveform has **zero samples at or above full scale**, with peak
**−1.351 dBFS**. AAC padding explains its approximately 16 ms longer container
duration; no scene retiming is based on encoder padding.

Actual unmuted Chromium playback was checked after accurate seeks to swelling,
mitochondrial release, apoptotic bodies and the final recap. Each test advanced
53–54 frames with audio decoding, **zero dropped frames**, no media errors and
no captured console errors. All four screenshots were visually inspected.
This verifies playback and decoding, without claiming direct human listening.

Evidence: `qa/arabic/final.json`, `encoded-audio.json`, `playback.json` and
`visual-review.json`. The 197 extraction targets are recorded in
`qa/arabic/encoded-states.json`. A balanced FFmpeg selection expression avoids
the parser recursion limit encountered with a long linear sum; it selects the
same target frames. **Encoded media and audio/video synchronization: PASS.**

The English MP4's SHA-256 was checked again after the Arabic render and remains
`37ded821224caf1a059ed7a53170cdaa9a61487c12e952632dd95704cd669d6b`.

## Final English voice correction

The expanded 89-phrase review exposed unstable recognition of ER, Rough ER, SOD
and Permanent cells with the multilingual English voice. A single-language Andrew
pilot improved these while retaining all critical terms. The initial encoding was
stopped before completion; all English segments were re-recorded using
`en-US-AndrewNeural`, the Saudi Arabic body was retained, and all 18 scene timelines
were recomputed from the new PCM. Final-master ASR processed all 72 beats and
recognized all eleven required terms. The separate expanded test covers all
89 distinct English phrases, including ER, Rough ER, SOD and Permanent cells.
Diagnostic spelling variations in ASR do not by themselves establish a speech
error. Both review records now identify the final-master audio fingerprint.
The completed final MP4 passed the encoded and playback checks described above.
