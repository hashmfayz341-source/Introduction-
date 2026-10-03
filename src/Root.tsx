import React from 'react';
import {Composition} from 'remotion';
import {PipelineCheck} from './compositions/PipelineCheck';

export const Root: React.FC = () => (
  <Composition id="PipelineCheck" component={PipelineCheck} durationInFrames={90} width={1920} height={1080} fps={30} />
);
