export type Provenance = 'lecture' | 'established-clarification' | 'visual-simplification';

export type NarrationBeat = {
  id: string;
  text: string;
  anchor?: string;
  holdAfterSeconds?: number;
  cueSpans?: Record<string, string>;
};

export type LessonScene = {
  id: string;
  title: string;
  objective: string;
  sourcePages: number[];
  provenance: Provenance;
  visual: string;
  beats: NarrationBeat[];
};

export type Lesson = {
  source: {
    path: string;
    sha256: string | null;
    pageCount: number | null;
    reviewedPages: number[];
    completeReview: boolean;
  };
  scenes: LessonScene[];
};

export type TimedBeat = {
  id: string;
  startFrame: number;
  speechStartFrame: number;
  cueFrame: number;
  endFrame: number;
  speechEndFrame?: number;
  anchorSpan?: string;
  cues?: Record<string, {
    frame: number;
    startSeconds: number;
    endSeconds: number;
    sourceSpan: string;
    spokenForm: string;
    alignment: 'measured-service-word-boundaries';
  }>;
  words: {text: string; startSeconds: number; durationSeconds: number; voice?: string}[];
};

export type TimedScene = {
  id: string;
  startFrame: number;
  durationInFrames: number;
  beats: TimedBeat[];
};

export type AudioTimeline = {
  language?: string;
  lessonSha256: string;
  lectureSha256: string;
  audioPath: string;
  audioSha256: string;
  sampleRate: number;
  sampleCount: number;
  fps: number;
  durationInFrames: number;
  durationSeconds: number;
  source: string;
  scenes: TimedScene[];
};
