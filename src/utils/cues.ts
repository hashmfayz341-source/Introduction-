import type {TimedScene} from '../data/types';

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Existing visual event names select real Arabic phrases, never fabricated words.
 * English remains compatible with its original word-boundary timeline. */
export const resolveCueFrame = (timed: TimedScene, beatId: string, name: string, fps = 30): number | undefined => {
  const beat = timed.beats.find((b) => b.id === beatId);
  if (!beat) return undefined;
  if (beat.cues) {
    const cue = beat.cues[normalize(name)];
    if (!cue) throw new Error(`Missing measured semantic cue: ${beatId}/${name}`);
    return cue.frame - timed.startFrame;
  }
  const word = beat.words.find((w) => normalize(w.text) === normalize(name));
  return word ? Math.round(word.startSeconds * fps) - timed.startFrame : undefined;
};
