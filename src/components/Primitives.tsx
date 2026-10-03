import React from 'react';
import {theme} from '../styles/theme';

export const Label:React.FC<{x:number;y:number;text:string|string[];size?:number;color?:string;anchor?:'start'|'middle'|'end';weight?:number;opacity?:number}> =
({x,y,text,size=32,color=theme.ink,anchor='start',weight=400,opacity=1}) => <text x={x} y={y} fill={color} fontSize={size} fontWeight={weight} textAnchor={anchor} opacity={opacity}>
  {(Array.isArray(text)?text:[text]).map((line,i)=><tspan key={i} x={x} dy={i===0?0:size*1.35}>{line}</tspan>)}
</text>;

export const Arrow:React.FC<{x1:number;y1:number;x2:number;y2:number;color?:string;progress?:number;width?:number}> =
({x1,y1,x2,y2,color=theme.muted,progress=1,width=4}) => {
  const p=Math.max(0,Math.min(1,progress));const x=x1+(x2-x1)*p,y=y1+(y2-y1)*p;
  const angle=Math.atan2(y2-y1,x2-x1),len=13;
  return <g opacity={p>0?1:0}>
    <path d={`M${x1} ${y1}L${x} ${y}`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
    <path d={`M${x} ${y}L${x-len*Math.cos(angle-.45)} ${y-len*Math.sin(angle-.45)}L${x-len*Math.cos(angle+.45)} ${y-len*Math.sin(angle+.45)}Z`} fill={color} />
  </g>;
};

export const EnergyGauge:React.FC<{x:number;y:number;level:number;label?:string}> = ({x,y,level,label='ATP'}) => {
  const p=Math.max(0,Math.min(1,level));
  return <g transform={`translate(${x} ${y})`}>
    <Label x={0} y={0} text={label} size={34} color={theme.mitochondrion} weight={600} />
    {[0,1,2,3,4,5,6,7].map(i=><rect key={i} x={i*33} y={24} width="24" height="52" rx="3"
      fill={i/8<p?theme.mitochondrion:'#2B3B43'} />)}
  </g>;
};

const ionColors={Na:'#75C9E8',K:'#C7A2E7',Ca:'#EBC76A',O2:'#76D8C4',H2O:'#A9DCEC'};
const ionLabels={Na:'Na⁺',K:'K⁺',Ca:'Ca²⁺',O2:'O₂',H2O:'H₂O'};
export const Ion:React.FC<{x:number;y:number;type:keyof typeof ionColors;opacity?:number;scale?:number}> =
({x,y,type,opacity=1,scale=1}) => <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
  <circle r={type==='H2O'?24:29} fill={ionColors[type]} opacity="0.14" />
  <circle r={type==='H2O'?24:29} fill="none" stroke={ionColors[type]} strokeWidth="2" />
  <text y="9" textAnchor="middle" fontSize="23" fontWeight="600" fill={ionColors[type]}>{ionLabels[type]}</text>
</g>;
