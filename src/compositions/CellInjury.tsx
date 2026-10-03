import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import type {AudioTimeline, Lesson} from '../data/types';
import {theme} from '../styles/theme';

export type SceneRenderer = React.ComponentType<{sceneId:string}>;

export const CellInjury: React.FC<{
  lesson: Lesson;
  timeline: AudioTimeline;
  scenes: Record<string, SceneRenderer>;
}> = ({lesson, timeline, scenes}) => (
  <AbsoluteFill style={{background:theme.background}}>
    <Audio src={staticFile(timeline.audioPath)} />
    {timeline.scenes.map((timed) => {
      const source = lesson.scenes.find((s) => s.id === timed.id);
      if (!source) throw new Error(`Missing lesson scene: ${timed.id}`);
      const Scene = scenes[source.visual];
      if (!Scene) throw new Error(`Missing visual implementation: ${source.visual}`);
      return <Sequence key={timed.id} from={timed.startFrame} durationInFrames={timed.durationInFrames} name={source.title}>
        <Scene sceneId={source.id} />
      </Sequence>;
    })}
  </AbsoluteFill>
);
