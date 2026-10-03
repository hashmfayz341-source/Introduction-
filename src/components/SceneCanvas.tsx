import React from 'react';
import {AbsoluteFill,interpolate} from 'remotion';
import {useScene,lesson} from '../hooks/useScene';
import {theme} from '../styles/theme';

export const SceneCanvas:React.FC<{sceneId:string;children:React.ReactNode;footer?:string;kicker?:string}> =
({sceneId,children,footer,kicker}) => {
  const {scene,timed,frame}=useScene(sceneId);
  const index=Math.max(0,lesson.scenes.findIndex(s=>s.id===sceneId));
  const entrance=interpolate(frame,[0,10],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const exit=interpolate(frame,[Math.max(10,timed.durationInFrames-8),timed.durationInFrames-1],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return <AbsoluteFill style={{background:theme.background,fontFamily:theme.font}}>
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{opacity:Math.min(entrance,exit)}}>
      <text x="96" y="74" fill={theme.membrane} fontSize="24" fontWeight="600" letterSpacing="3">{kicker ?? 'CELL INJURY  ·  PART I'}</text>
      <text x="1824" y="74" textAnchor="end" fill={theme.muted} fontSize="24">{`${String(index+1).padStart(2,'0')} / ${lesson.scenes.length}`}</text>
      <text x="96" y="175" fill={theme.ink} fontSize={scene.title.length>42?54:64} fontWeight="700">{scene.title}</text>
      <path d="M96 214H300" stroke={theme.membrane} strokeWidth="5" />
      {children}
      {footer?<text x="96" y="1017" fill={theme.muted} fontSize="29">{footer}</text>:null}
      <path d="M96 1057H1824" stroke="#213944" strokeWidth="3" />
      <path d={`M96 1057H${96+1728*(index+Math.min(1,frame/timed.durationInFrames))/Math.max(1,lesson.scenes.length)}`} stroke={theme.membrane} strokeWidth="3" />
    </svg>
  </AbsoluteFill>;
};
