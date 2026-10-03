# Verification record

This record covers the infrastructure milestone, not a finished video.

| Review | Status | Evidence / requirement |
|---|---|---|
| Existing repository inspected | PASS | Original `main` contains README commit `4163237b87bd771b7752bf79e58ce92dcbe6a97b`; README inspected before editing. |
| Complete lecture review | BLOCKED | Earlier PDF attachment is absent and cannot be resolved in this environment. |
| Source coverage | PENDING | Every source page must be represented in the final visual story. |
| Narration medical accuracy | PENDING | Final narration requires the complete lecture. |
| Speech service / audio pipeline | PASS | Real diagnostic utterance produced 3.048 seconds of decoded 24 kHz mono PCM with three actual word boundaries. No final lesson narration is claimed. |
| Final narration | PENDING | Requires complete source review and approved narration beats. |
| Animation synchronization | PENDING | Scene implementations must consume measured speech cues. |
| TypeScript / render pipeline | PASS | TypeScript passed. Development output: H.264, 1920×1080, 30 fps, 90 frames, yuv420p, BT.709 TV range. Entire MP4 decoded without errors. |
| Development visual QA | PASS | Inspected encoded frames 0, 45 and 89. Corrected label anchors to follow zoom, eased camera motion, re-rendered and inspected all three states again. No clipping or unreadable labels. |
| Source gate | PASS | Rendering/generation rejects a missing lecture instead of inventing content or silently using a substitute. |
| GitHub publication | PASS | HTTPS Git push returned 401; Git Data API published exact blob, tree and commit SHAs with fast-forward-only main update. Original initial commit preserved. |
| Visual / medical / motion / learner QA | PENDING | Requires complete scenes and encoded final output. |
| Final audio/video playback | PENDING | Requires narrated final MP4 and FFprobe/FFmpeg verification. |

Source and audio integrity gates prevent this infrastructure from being mistaken
for a completed lecture video. No diagnostic clip is the final deliverable.

The earlier attachment path is absent in the current environment, and its supplied
attachment identifier could not be resolved. A targeted Drive filename search
also found no matching Cell Injury lecture. An accessible PDF is required before
medical, learner, full-lesson motion or synchronization review can be performed.

Machine-readable development evidence: `qa/pipeline.json`. Temporary encoded
frames, speech segments and development MP4s remain excluded from Git.
