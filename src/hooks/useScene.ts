import {useCurrentFrame} from 'remotion';
import lessonData from '../data/lesson.json';
import timelineData from '../data/timeline.json';
import type {AudioTimeline, Lesson, LessonScene, TimedScene} from '../data/types';

export const lesson = lessonData as Lesson;
export const timeline = timelineData as AudioTimeline | null;

export const useScene = (sceneId:string) => {
  const frame = useCurrentFrame();
  const scene:LessonScene = lesson.scenes.find((s)=>s.id===sceneId) ?? {
    id:sceneId,title:sceneId,objective:'',sourcePages:[],provenance:'lecture',visual:sceneId,beats:[],
  };
  const timed:TimedScene = timeline?.scenes.find((s)=>s.id===sceneId) ?? {
    id:sceneId,startFrame:0,durationInFrames:Math.max(180,scene.beats.length*180),
    beats:scene.beats.map((b,i)=>({id:b.id,startFrame:i*180,speechStartFrame:i*180,
      cueFrame:i*180,endFrame:(i+1)*180,words:[]})),
  };
  const beat = (id:string,durationFrames=24) => {
    const b = timed.beats.find((v)=>v.id===id);
    if (!b) return 0;
    const start=b.cueFrame-timed.startFrame;
    const t=Math.max(0,Math.min(1,(frame-start)/Math.max(1,durationFrames)));
    return t*t*(3-2*t);
  };
  let activeBeatIndex=0;
  timed.beats.forEach((b,i)=>{if(frame>=b.cueFrame-timed.startFrame)activeBeatIndex=i;});
  return {scene,timed,frame,beat,activeBeatIndex};
};
