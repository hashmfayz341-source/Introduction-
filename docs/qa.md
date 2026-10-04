# Cell Injury verification record

Primary source: all 28 pages of the supplied lecture, including image-only diagrams.
The initial repository README was inspected; its original commit remains in history.

## Content and timing

| Review | Result | Evidence |
|---|---|---|
| Complete source review | PASS | PDF fingerprint, complete text extraction, all page images, detailed image diagrams and page-by-page mapping in `source-coverage.md`. |
| Educational structure | PASS | 18 scenes, 72 spoken segments, 1,674 words; cause/effect story and all eight injury-cause categories, six interacting mechanisms and source morphology. |
| Medical script | PASS | Separate review against the lecture and authoritative clarification sources; decisions in `medical-review.md`. |
| Real narration | PASS | Actual Edge TTS Aria speech; 22,611,792 decoded samples, 24 kHz mono; master duration 942.158 s. |
| Audio integrity | PASS | Script/PDF/WAV SHA-256 gates, scene/beat order, contiguous frame coverage; no estimated speech durations. |
| Animation synchronization | PASS | Sample-based scene lengths, actual word-boundary cues; 50 literal substep anchors automatically verified plus dynamic anchors reviewed. |
| TypeScript | PASS | `npm run typecheck`. |
| Master render readiness | PASS | `npm run check:ready` verifies complete lecture coverage, narration fingerprints, timing and animation anchors. |

## Visual, motion and student review

The first implementation generated **90 representative 1920×1080 stills**: opening,
second, third and fourth narration beats, and ending for every scene. Scene artists
reviewed their full-resolution states. A separate medical reviewer and independent
motion/student reviewer inspected all 18 scenes, their code, and all 90 states.

Corrections were implemented, not deferred:

- Normal oxygen/ATP labels now remain normal until the spoken decline.
- Cell anatomy leaders target the intended structure; calcium and cytoskeleton
  overlays avoid the nucleus where cytosolic structures are intended.
- Calcium cause labels fade before the ATPase branch; zoomed ions have clear spacing.
- Swelling retains an enclosing membrane, and Na/K pumping is separated from calcium
  handling. The pump visibly slows rather than reversing its transport cycle.
- Depleted glycogen remains distinguishable; rough-ER translation labels disappear
  as ribosomes detach. Recovery and persistent-injury outcomes are labeled separately.
- Inner/outer mitochondrial membranes have distinct consequences and precise leaders.
- Three recap substeps were corrected from unavailable word tokens to actual words
  in the recorded speech. The cue validator now prevents that regression.
- Antioxidant columns wrap cleanly; particle and enzyme-leak paths avoid text bands.
- Apoptosis follows shrinkage, condensation, contained fragmentation and phagocytic
  removal at their respective spoken words. The final label changes after clearance.
- Recovery's irreversible branch begins at the spoken irreversibility statement;
  myelin figures, mitochondrial failure and membrane damage labels no longer overlap.

A corrected pass produced **97 states**, adding dynamic balance, response factors,
four injury-cause variants and the intermediate bounded apoptotic-body state.
Independent medical, motion and student reviews passed this corrected pass.
A further **22-frame focused pass** checked the latest calcium spacing, normal
rough-ER translation, anatomy leader and mitochondrial contour leader.

No blocking clipping, label overlap or misleading mechanism remains in those
reviewed states. Diagrams are deliberate abstractions, not quantitative models.

## Final encoded video

**PASS.** The complete lesson was rendered to `out/cell-injury.mp4` from commit
`c66d40f67d9139c063bcd0f8780fdfb3500cbd07`. Subsequent publication changes affect
documentation and QA/publication tools, not the rendered scenes or narration.

| Encoded check | Result |
|---|---|
| Video | 28,265 frames; 1920×1080; 30 fps; H.264; yuv420p; BT.709. |
| Video duration | 942.166667 seconds, or 15:42.167. |
| Audio | AAC, 48 kHz stereo; master WAV is 24 kHz mono. AAC duration 942.187 s differs from the measured master by 29 ms, within one video frame. |
| Integrity | 77,250,689 bytes; complete video and audio decoding passed with FFmpeg errors treated as failures. |
| Audio alignment | One waveform sample four seconds into each of the 18 scenes: zero measured lag; minimum correlation 0.999932 against the original narration. |
| Encoded visual QA | 98 states from the actual MP4, covering all 18 scene starts, narration cues, important intermediate states and ends. |
| Medical review | PASS after a separate encoded-frame review; mitochondrial contours and contained apoptotic bodies checked at full resolution. |
| Motion and student review | PASS after an independent review of all 98 states and eight critical full-resolution frames. |

Artifact SHA-256:
`37ded821224caf1a059ed7a53170cdaa9a61487c12e952632dd95704cd669d6b`.
Machine-readable media and audio evidence is in `qa/final.json`; review counts
are in `qa/review-states.json`. The exact frame selection is retained in
`qa/encoded-states.json` so encoded inspection can be repeated without rendering
the scene stills again.

Actual Chromium playback was checked with agent-browser. Accurate seeks to
345, 552, 817 and 930 seconds were followed by video-frame progression and audio
decoding, with no media errors. Screenshots confirm the pump, mitochondrial,
cell-death and recap states. `qa/playback.json` records the measured playback
samples. The local QA server supports HTTP byte ranges so seeking is tested
correctly; downloaded MP4 playback does not depend on that server.

No further scene, narration or timing changes were required after the encoded
review. The diagnostic pipeline render is separate from the complete lesson.

## Publication verification

The source history has been published without squashing or rewriting commits.
`scripts/publish-github.py` verifies the exact local tree and commit SHA before a
fast-forward update. The final MP4 is a release asset, with a separate temporary
Actions workflow that checks its size, digest, media metadata and unchanged
remote `main`, uploads it, downloads the uploaded asset, and verifies the bytes
again before making the release public. The published workflow run and release
metadata provide the final artifact-publication evidence.

## Reproduction

```sh
npm ci
npm run typecheck
npm run check:ready
npm run render
python3 scripts/verify-video.py
python3 scripts/extract-encoded-qa.py
```

For a preinstalled Chromium browser, prepend its path with
`REMOTION_BROWSER_EXECUTABLE=/usr/bin/chromium`. QA stills use
`npm run qa:frames`; generated images and temporary renders remain ignored.
