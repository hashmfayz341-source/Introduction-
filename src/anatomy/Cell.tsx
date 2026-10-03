import React from 'react';
import {theme} from '../styles/theme';

export const Mitochondrion: React.FC<{
  x?: number;
  y?: number;
  rotation?: number;
  scale?: number;
  damage?: number;
}> = ({x = 0, y = 0, rotation = 0, scale = 1,damage=0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotation}) scale(${scale})`}>
    <path d="M-62,-24 C-33,-49 14,-46 46,-24 C78,-4 61,33 24,38 C-12,47 -57,31 -64,4 C-69,-7 -69,-15 -62,-24Z"
      fill={damage>.5?'#663E40':'#70472C'} stroke={damage>.5?theme.injury:theme.mitochondrion} strokeWidth="5" />
    <path d="M-48,-15 C-29,-30 -18,-30 -9,-22 L-22,-5 L-6,7 L7,-18 L23,-13 L14,10 L31,23 L43,2"
      fill="none" stroke={theme.mitochondrion} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity={1-.65*damage}/>
  </g>
);

export const Nucleus: React.FC<{state?:'normal'|'condensed'|'fragmented'|'dissolved'}> = ({state='normal'}) => (
  <g opacity={state==='dissolved'?0:1} transform={state==='condensed'?'translate(-22 -15) scale(.55) translate(22 15)':undefined}>
    {state==='fragmented'?<g>{[[-55,-25],[-14,-52],[32,-10],[-17,24],[-57,30]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={18+i*2} fill="#8F9AE1" />)}</g>:<g>
    <ellipse cx="-22" cy="-15" rx="95" ry="82" fill="#29395F" stroke="#8F9AE1" strokeWidth="5" />
    <path d="M-83,-30 C-50,-59 -2,-54 24,-28 M-89,5 C-60,38 -15,48 36,19 M-45,-73 C-62,-35 -27,-8 -39,54"
      fill="none" stroke={theme.nucleus} strokeWidth="7" strokeLinecap="round" />
    <circle cx="4" cy="-13" r="25" fill="#7683C0" />
    </g>}
  </g>
);

/** Educational abstraction; positions and organelle counts are illustrative. */
export const Cell: React.FC<{scale?: number;swelling?:number;membraneDamage?:number;
  nuclearState?:'normal'|'condensed'|'fragmented'|'dissolved';mitochondriaDamage?:number;mitochondrialSwelling?:number;erSwelling?:number;ribosomeLoss?:number}> =
({scale = 1,swelling=0,membraneDamage=0,nuclearState='normal',mitochondriaDamage=0,mitochondrialSwelling,erSwelling=0,ribosomeLoss=0}) => (
  <g transform={`scale(${scale})`}>
    <g transform={`scale(${1+swelling*.2})`}>
    <path d="M-242,-82 C-222,-215 -78,-260 48,-226 C164,-229 259,-136 273,-34 C284,67 236,204 105,229 C-36,265 -179,210 -234,92 C-272,27 -267,-31 -242,-82Z"
      fill={theme.cytoplasm} stroke={membraneDamage>.3?theme.injury:theme.membrane} strokeWidth="8" strokeDasharray={membraneDamage>.5?'320 85 220 60':undefined}/>
    <path d="M-228,-80 C-210,-197 -72,-244 46,-209 C160,-211 243,-131 258,-30 C269,67 224,186 101,213 C-34,247 -164,195 -218,87 C-254,20 -250,-27 -228,-80Z"
      fill="none" stroke={theme.membrane} strokeWidth="2" opacity={.4*(1-membraneDamage)} />
    {swelling>.1?<g opacity={swelling}><circle cx="-239" cy="-63" r="18" fill={theme.cytoplasm} stroke={theme.membrane} strokeWidth="5"/><circle cx="-173" cy="183" r="15" fill={theme.cytoplasm} stroke={theme.membrane} strokeWidth="5"/></g>:null}
    </g>
    <path d="M-105,-132 C-34,-169 63,-142 99,-87 M-107,-113 C-33,-145 45,-127 80,-78 M-108,-96 C-34,-123 34,-109 65,-72"
      fill="none" stroke="#539DAC" strokeWidth={9+erSwelling*10} strokeLinecap="round" />
    <Nucleus state={nuclearState}/>
    <Mitochondrion x={-144} y={102} rotation={-18} scale={0.88*(1+(mitochondrialSwelling ?? erSwelling)*.15)} damage={mitochondriaDamage}/>
    <Mitochondrion x={166} y={-29} rotation={60} scale={0.84*(1+(mitochondrialSwelling ?? erSwelling)*.15)} damage={mitochondriaDamage}/>
    <Mitochondrion x={99} y={148} rotation={12} scale={0.67*(1+(mitochondrialSwelling ?? erSwelling)*.15)} damage={mitochondriaDamage}/>
    <path d="M104,61 Q137,34 174,59 M108,76 Q140,50 169,74 M112,92 Q142,70 160,89"
      fill="none" stroke="#71B5B2" strokeWidth="8" strokeLinecap="round" />
    <circle cx="-152" cy="-78" r="20" fill="#705658" stroke="#CB9A95" strokeWidth="3" />
    <circle cx="173" cy="117" r="17" fill="#705658" stroke="#CB9A95" strokeWidth="3" />
    {[-156,-114,-71,-28,16,61].map((x,i) => <circle key={x} cx={x} cy={-155 + (i % 2)*8+ribosomeLoss*55} r="3" fill="#DCE3B5" opacity={1-ribosomeLoss*.6}/>)}
    {membraneDamage>.2?<g opacity={membraneDamage}>{[0,1,2,3,4].map(i=><circle key={i} cx={280+i*20} cy={-30+i*32} r={7} fill="#B7D9DB"/>)}</g>:null}
  </g>
);
