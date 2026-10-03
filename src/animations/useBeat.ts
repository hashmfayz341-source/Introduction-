import {interpolate, useCurrentFrame} from 'remotion';
import type {TimedScene} from '../data/types';

/** Inside the scene Sequence, reveal a process at its actual spoken cue. */
export const useBeat = (scene:TimedScene, beatId:string, animationFrames=24) => {
  const localFrame = useCurrentFrame();
  const beat = scene.beats.find((b) => b.id === beatId);
  if (!beat) throw new Error(`No measured speech cue for ${beatId}`);
  const cue = beat.cueFrame - scene.startFrame;
  return interpolate(localFrame, [cue, cue + animationFrames], [0,1], {
    extrapolateLeft:'clamp', extrapolateRight:'clamp',
  });
};
