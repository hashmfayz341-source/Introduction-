import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Cell} from '../anatomy/Cell';
import {theme} from '../styles/theme';

/** Development-only render check. This is not a lesson or the final video. */
export const PipelineCheck: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 89], [0.84, 1.03], {
    extrapolateRight:'clamp', easing:Easing.inOut(Easing.cubic),
  });
  const membrane = {x:1040 + 273 * scale, y:605 - 34 * scale};
  const nucleus = {x:1040 - 117 * scale, y:605 - 15 * scale};
  const mitochondrion = {x:1040 + 99 * scale, y:605 + 148 * scale};
  return (
    <AbsoluteFill style={{background: theme.background, color: theme.ink, fontFamily: theme.font}}>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080">
        <text x="96" y="113" fill={theme.membrane} fontSize="24" letterSpacing="4">DEVELOPMENT • RENDER PIPELINE</text>
        <text x="96" y="204" fill={theme.ink} fontSize="62" fontWeight="700">Cell Injury</text>
        <text x="96" y="258" fill={theme.muted} fontSize="28">Reusable anatomy · deterministic motion · 1080p</text>
        <g transform="translate(1040 605)"><Cell scale={scale} /></g>
        <path d={`M${membrane.x},${membrane.y} L1380,525 H1458`} fill="none" stroke={theme.membrane} strokeWidth="3" />
        <circle cx={membrane.x} cy={membrane.y} r="5" fill={theme.membrane} />
        <text x="1480" y="536" fill={theme.ink} fontSize="30">Cell membrane</text>
        <path d={`M${nucleus.x},${nucleus.y} L747,590 L665,664 H494`} fill="none" stroke="#8F9AE1" strokeWidth="3" />
        <circle cx={nucleus.x} cy={nucleus.y} r="5" fill="#8F9AE1" />
        <text x="330" y="675" fill={theme.ink} fontSize="30">Nucleus</text>
        <path d={`M${mitochondrion.x},${mitochondrion.y} L1260,854 H1458`} fill="none" stroke={theme.mitochondrion} strokeWidth="3" />
        <circle cx={mitochondrion.x} cy={mitochondrion.y} r="5" fill={theme.mitochondrion} />
        <text x="1480" y="865" fill={theme.ink} fontSize="30">Mitochondrion</text>
        <text x="96" y="997" fill={theme.muted} fontSize="24">Source review and narration must be completed before the lesson can render.</text>
      </svg>
    </AbsoluteFill>
  );
};
