import React from 'react';
import {Cell, Mitochondrion} from '../anatomy/Cell';
import {SceneCanvas} from '../components/SceneCanvas';
import {Arrow, Label} from '../components/Primitives';
import {useScene} from '../hooks/useScene';
import {resolveCueFrame} from '../utils/cues';
import type {TimedScene} from '../data/types';
import {theme} from '../styles/theme';

type SceneProps = {sceneId: string};
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Use measured speech words for internal actions within a longer narration beat. */
const atWord = (timed: TimedScene, frame: number, beatId: string, word: string, duration = 24, fallbackOffset = 0) => {
  const b = timed.beats.find(v => v.id === beatId);
  if (!b) return 0;
  const start = resolveCueFrame(timed,beatId,word) ?? b.cueFrame - timed.startFrame + fallbackOffset;
  const p = Math.max(0, Math.min(1, (frame - start) / duration));
  return p * p * (3 - 2 * p);
};

/** A bilayer has hydrophilic heads outside and hydrophobic tails inward. */
const Bilayer: React.FC<{x: number; y: number; width?: number; damage?: number}> = ({x, y, width = 370, damage = 0}) => {
  const count = Math.floor(width / 24);
  return <g transform={`translate(${x} ${y})`}>
    {Array.from({length: count}, (_, i) => {
      const lost = i > count * .4 && i < count * .62;
      const opacity = lost ? 1 - damage : 1;
      return <g key={i} opacity={opacity} transform={`translate(${i * 24} 0)`}>
        <path d="M-4,-22 L-7,-4 M4,-22 L8,-5 M-4,22 L-8,5 M4,22 L7,4" stroke={theme.mitochondrion} strokeWidth="4" />
        <circle cy="-31" r="10" fill={theme.membrane} />
        <circle cy="31" r="10" fill={theme.membrane} />
      </g>;
    })}
    {damage > 0 && <path d={`M${width * .37},-35 l18,14 -10,16 19,17 -12,24`} fill="none" stroke={theme.injury} strokeWidth="6" opacity={damage} />}
  </g>;
};

const DNA: React.FC<{x: number; y: number; scale?: number; damage?: number}> = ({x, y, scale = 1, damage = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {Array.from({length: 9}, (_, i) => {
      const a = i * Math.PI / 4;
      const x0 = i * 30 - 120;
      const y0 = Math.sin(a) * 37;
      const y1 = -y0;
      const next = Math.sin(a + Math.PI / 4) * 37;
      const broken = i === 4;
      return <g key={i} opacity={broken ? 1 - damage : 1}>
        <path d={`M${x0},${y0} Q${x0 + 15},${(y0 + next) / 2} ${x0 + 30},${next}`} stroke={theme.membrane} strokeWidth="9" fill="none" />
        <path d={`M${x0},${y1} Q${x0 + 15},${-(y0 + next) / 2} ${x0 + 30},${-next}`} stroke="#8F9AE1" strokeWidth="9" fill="none" />
        <path d={`M${x0},${y0} L${x0},${y1}`} stroke={theme.mitochondrion} strokeWidth="5" />
      </g>;
    })}
    <path d="M-4,-55 l16,17 -12,16 18,19 -10,24" stroke={theme.injury} strokeWidth="7" fill="none" opacity={damage} />
  </g>
);

const Protein: React.FC<{x: number; y: number; damage?: number; scale?: number}> = ({x, y, damage = 0, scale = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d={`M-110,20 C-150,-25 -110,-68 -69,-43 C-23,-10 -88,54 -31,58 C20,63 66,10 27,-30 C-5,-69 -36,-13 14,5 C56,26 100,-61 122,-18 C149,25 105,67 ${lerp(68, 132, damage)},${lerp(31, 83, damage)}`}
      fill="none" stroke={damage > .3 ? theme.injury : '#A69BD5'} strokeWidth="14" strokeLinecap="round" />
    <path d="M-110,20 C-150,-25 -110,-68 -69,-43 C-23,-10 -88,54 -31,58" fill="none" stroke="#E5D8F6" strokeWidth="4" opacity=".7" />
    <path d="M-8,-70 l12,27 -22,13 27,20 -7,33" fill="none" stroke={theme.injury} strokeWidth="7" opacity={damage} />
  </g>
);

const Radical: React.FC<{x: number; y: number; scale?: number; opacity?: number}> = ({x, y, scale = 1, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    <path d="M0,-18 L5,-7 L16,-12 L10,-1 L20,6 L8,8 L7,20 L0,11 L-10,19 L-8,7 L-20,3 L-9,-3 L-12,-15 L-3,-9Z" fill={theme.injury} />
    <circle r="5" fill="#FFF0CE" />
  </g>
);

const Chemistry: React.FC<{x: number; y: number; text: string; color?: string; sub?: string; opacity?: number}> = ({x, y, text, color = theme.ink, sub, opacity = 1}) => (
  <g opacity={opacity}>
    <Label x={x} y={y} text={text} size={58} color={color} anchor="middle" />
    {sub && <Label x={x} y={y + 49} text={sub} size={30} color={theme.muted} anchor="middle" />}
  </g>
);

export const ROS: React.FC<SceneProps> = ({sceneId}) => {
  const {beat, frame, timed} = useScene(sceneId);
  const definitions = beat('ros-species');
  const sources = atWord(timed, frame, 'ros-sources', 'Radiation');
  const lipids = beat('ros-lipids');
  const proteins = atWord(timed, frame, 'ros-lipids', 'Protein', 24, 65);
  const dna = atWord(timed, frame, 'ros-lipids', 'DNA', 24, 115);
  const balance = beat('ros-balance');
  return <SceneCanvas sceneId={sceneId} footer="Oxidative stress: ROS production exceeds cellular defenses.">
    <Label x={325} y={304} text="ROS production" size={36} anchor="middle" />
    <g transform="translate(340 530)"><Mitochondrion scale={2.7} damage={sources} /></g>
    <g opacity={sources * (1 - balance)}>
      <path d="M111,402 l35,-22 6,32 30,-26 8,35" fill="none" stroke={theme.injury} strokeWidth="7" />
      <Arrow x1={180} y1={420} x2={257} y2={465} color={theme.injury} progress={sources} />
      <Label x={130} y={731} text={['Radiation', 'Toxins', 'Reperfusion']} size={34} />
    </g>
    <g opacity={balance}>
      <Label x={343} y={743} text="ROS outpace removal" size={32} color={theme.injury} anchor="middle" />
      <Label x={132} y={806} text="Production" size={30} />
      <rect x="313" y="779" width={269 * balance} height="31" fill={theme.injury} />
      <Label x={132} y={869} text="Removal" size={30} />
      <rect x="313" y="841" width="106" height="31" fill={theme.recovery} />
    </g>
    <Arrow x1={525} y1={530} x2={631} y2={530} color={theme.injury} progress={definitions} />
    <g opacity={definitions}>
      <Label x={815} y={293} text="Radical = unpaired electron" size={30} color={theme.muted} anchor="middle" />
      <Chemistry x={815} y={368} text="O₂•−" color={theme.injury} sub="Superoxide radical" />
      <Chemistry x={815} y={552} text="H₂O₂" color={theme.mitochondrion} sub="Hydrogen peroxide" />
      <Label x={815} y={643} text="ROS, but not a radical" size={30} color={theme.mitochondrion} anchor="middle" />
      <Chemistry x={815} y={786} text="•OH" color={theme.injury} sub="Hydroxyl radical" />
    </g>
    <path d="M1048,395 L1048,833" stroke={theme.injury} strokeWidth="5" opacity={definitions} />
    {[{y:410, p:lipids},{y:616,p:proteins},{y:826,p:dna}].map(({y,p}, i) => <g key={y}>
      <Arrow x1={1048} y1={y} x2={1220} y2={y} color={theme.injury} progress={p} />
      {Array.from({length: 3}, (_, j) => {
        const phase = ((frame + j * 39 + i * 11) % 112) / 112;
        return <Radical key={j} x={lerp(1064, 1270, phase)} y={y + Math.sin(phase * Math.PI * 2) * 12} scale={.65} opacity={p} />;
      })}
    </g>)}
    <g opacity={lipids}>
      <Bilayer x={1320} y={390} width={330} damage={lipids} />
      <Label x={1490} y={484} text="Lipid peroxidation" size={32} anchor="middle" />
    </g>
    <g opacity={proteins}>
      <Protein x={1470} y={615} damage={proteins} scale={.95} />
      <Label x={1490} y={718} text="Protein modification" size={32} anchor="middle" />
    </g>
    <g opacity={dna}>
      <DNA x={1455} y={825} damage={dna} />
      <Label x={1490} y={925} text="DNA damage · mutations" size={32} anchor="middle" />
    </g>
  </SceneCanvas>;
};

export const Antioxidants: React.FC<SceneProps> = ({sceneId}) => {
  const {beat, frame, timed} = useScene(sceneId);
  const spontaneous = atWord(timed, frame, 'antioxidants-sod', 'Some');
  const sod = beat('antioxidants-sod');
  const enzymes = beat('antioxidants-peroxide');
  const nonenzymatic = beat('antioxidants-nutrition');
  const limit = beat('antioxidants-limit');
  return <SceneCanvas sceneId={sceneId} footer="Antioxidant defenses limit damage; they do not erase established cell death.">
    <Chemistry x={258} y={455} text="O₂•−" color={theme.injury} sub="Superoxide" />
    <g opacity={spontaneous}>
      {Array.from({length: 5}, (_, i) => {
        const phase = ((frame + i * 14) % 88) / 88;
        return <Radical key={i} x={165 + i * 45} y={374 - phase * 22} scale={.55 * (1 - phase)} opacity={1 - phase} />;
      })}
      <Label x={270} y={319} text="Spontaneous decay" size={30} color={theme.muted} anchor="middle" />
    </g>
    <Arrow x1={407} y1={430} x2={701} y2={430} color={theme.recovery} progress={sod} />
    <path d="M427,430 H676" stroke={theme.recovery} strokeWidth="7" strokeDasharray="3 43" strokeLinecap="round" strokeDashoffset={-frame * 1.3} opacity={sod * .7} />
    <Label x={555} y={380} text="SOD" size={40} color={theme.recovery} anchor="middle" opacity={sod} />
    <Chemistry x={845} y={455} text="H₂O₂" color={theme.mitochondrion} sub="Hydrogen peroxide" opacity={sod} />
    <g opacity={enzymes}>
      <path d="M985,430 H1030 V335 H1215 M1030,430 V570 H1215" stroke={theme.recovery} strokeWidth="5" fill="none" />
      <Arrow x1={1215} y1={335} x2={1380} y2={335} color={theme.recovery} progress={enzymes} />
      <Arrow x1={1215} y1={570} x2={1380} y2={570} color={theme.recovery} progress={enzymes} />
      <path d="M1060,335 H1357 M1060,570 H1357" stroke={theme.recovery} strokeWidth="7" strokeDasharray="3 43" strokeLinecap="round" strokeDashoffset={-frame * 1.3} opacity=".65" />
      <Label x={1205} y={287} text="Catalase" size={33} color={theme.recovery} anchor="middle" />
      <Label x={1250} y={519} text="Glutathione peroxidase" size={30} color={theme.recovery} anchor="middle" />
      <Chemistry x={1580} y={365} text="H₂O + O₂" color={theme.recovery} />
      <Chemistry x={1580} y={600} text="H₂O" color={theme.recovery} />
      <Label x={1150} y={649} text="Uses reduced glutathione" size={30} color={theme.muted} anchor="middle" />
    </g>
    <g opacity={limit}>
      <Label x={457} y={651} text="Capacity can be exceeded" size={30} color={theme.injury} anchor="middle" />
      {[0, 1, 2, 3, 4].map(i => <Radical key={i} x={347 + i * 61} y={698 + Math.sin(frame * .04 + i) * 6} scale={.65} />)}
    </g>
    <g opacity={nonenzymatic}>
      <path d="M125,731 H1795" stroke={theme.muted} strokeWidth="2" opacity=".4" />
      <Label x={140} y={786} text="Additional defenses" size={35} color={theme.recovery} />
      <Label x={450} y={858} text={['Vitamins A · E · C', 'Carotenes · tocopherols', 'Ascorbate']} size={30} anchor="middle" />
      <Label x={1120} y={858} text={['Glutathione', 'Flavonoids']} size={32} anchor="middle" />
      <Label x={1625} y={858} text={['Selenium · zinc', 'Support antioxidant systems']} size={30} anchor="middle" />
    </g>
  </SceneCanvas>;
};

export const MembraneInjury: React.FC<SceneProps> = ({sceneId}) => {
  const {beat, frame, timed} = useScene(sceneId);
  const causes = atWord(timed, frame, 'membrane-causes', 'Energy');
  const plasma = beat('membrane-plasma');
  const mitochondria = beat('membrane-organelles');
  const lysosomes = atWord(timed, frame, 'membrane-organelles', 'Lysosomal', 30, 75);
  const feedback = beat('membrane-feedback');
  return <SceneCanvas sceneId={sceneId} footer="Loss of membrane integrity destroys compartmentalization and cellular homeostasis.">
    <g opacity={causes}>
      <Label x={327} y={327} text={['ATP ↓', 'Phospholipid synthesis ↓']} size={34} anchor="middle" color={theme.mitochondrion} />
      <Label x={961} y={327} text={['ROS', 'Lipid peroxidation']} size={34} anchor="middle" color={theme.injury} />
      <Label x={1569} y={327} text={['Ca²⁺ ↑', 'Phospholipases · proteases']} size={34} anchor="middle" color={theme.injury} />
      <Arrow x1={327} y1={421} x2={540} y2={494} color={theme.injury} progress={causes} />
      <Arrow x1={961} y1={421} x2={961} y2={494} color={theme.injury} progress={causes} />
      <Arrow x1={1569} y1={421} x2={1380} y2={494} color={theme.injury} progress={causes} />
    </g>
    <Bilayer x={269} y={541} width={1392} damage={causes} />
    <g opacity={causes}>
      <path d="M1398,590 L1478,615 L1570,586 L1663,613 M1425,619 L1507,583 L1586,618 L1651,586" stroke="#83A1C3" strokeWidth="5" fill="none" />
      <path d="M1515,584 L1531,598 L1520,609 L1536,624" stroke={theme.injury} strokeWidth="7" fill="none" />
      <Label x={1530} y={668} text="Cytoskeletal injury" size={30} color={theme.injury} anchor="middle" />
    </g>
    <Label x={963} y={627} text="Membrane injury" size={38} color={theme.injury} anchor="middle" opacity={causes} />
    <g opacity={feedback}>
      <path d="M1740,862 C1840,813 1840,380 1810,290 H1690" fill="none" stroke={theme.injury} strokeWidth="4" strokeDasharray="11 13" strokeDashoffset={-frame * .7} />
      <Arrow x1={1690} y1={290} x2={1655} y2={287} color={theme.injury} progress={feedback} />
    </g>
    <g opacity={plasma}>
      <Arrow x1={704} y1={640} x2={440} y2={713} color={theme.injury} progress={plasma} />
      <path d="M387,766 A65,65 0 1 1 431,844" stroke={theme.membrane} strokeWidth="7" fill={theme.cytoplasm} />
      {Array.from({length: 7}, (_, i) => {
        const phase = ((frame + i * 13) % 98) / 98;
        return <circle key={i} cx={lerp(411, 319, phase)} cy={lerp(810, 850 + i * 4, phase)} r="7" fill={theme.mitochondrion} />;
      })}
      <Label x={430} y={923} text={['Plasma membrane', 'Leakage · ion imbalance']} size={30} anchor="middle" />
    </g>
    <g opacity={mitochondria}>
      <Arrow x1={963} y1={648} x2={963} y2={713} color={theme.injury} progress={mitochondria} />
      <g transform="translate(963 801)"><Mitochondrion scale={1.6} damage={mitochondria} /></g>
      <Label x={963} y={923} text={['Mitochondrial membranes', 'ATP failure · death signals']} size={30} anchor="middle" />
    </g>
    <g opacity={lysosomes}>
      <Arrow x1={1208} y1={640} x2={1474} y2={713} color={theme.injury} progress={lysosomes} />
      <path d="M1477,744 A64,64 0 1 1 1444,855" stroke="#CB9A95" strokeWidth="7" fill="#705658" />
      {Array.from({length: 8}, (_, i) => {
        const phase = ((frame + i * 17) % 106) / 106;
        const angle = i * 1.75;
        return <circle key={i} cx={lerp(1484 + Math.cos(angle) * 28, 1440 + Math.cos(angle) * 75, phase)} cy={lerp(804 + Math.sin(angle) * 25, 808 + Math.sin(angle) * 48, phase)} r="7" fill={theme.injury} />;
      })}
      <Label x={1495} y={923} text={['Lysosomal membrane', 'Hydrolases digest cell contents']} size={30} anchor="middle" />
    </g>
  </SceneCanvas>;
};

export const DNAProtein: React.FC<SceneProps> = ({sceneId}) => {
  const {beat, frame, timed} = useScene(sceneId);
  const insults = beat('dna-insults');
  const repair = beat('dna-repair');
  const apoptosis = atWord(timed, frame, 'dna-repair', 'apoptosis', 60, 90);
  const proteins = beat('dna-proteins');
  const caspases = beat('dna-caspases');
  return <SceneCanvas sceneId={sceneId} footer="Apoptosis removes cells with severe, irreparable damage; minor DNA damage can be repaired.">
    <Label x={441} y={318} text="Radiation · chemicals · ROS" size={33} anchor="middle" color={theme.injury} />
    <Arrow x1={441} y1={351} x2={441} y2={439} color={theme.injury} progress={insults} />
    <DNA x={435} y={522} damage={insults} scale={1.45} />
    <Label x={441} y={633} text="DNA damage" size={35} anchor="middle" />
    <g opacity={proteins}>
      <Protein x={438} y={779} damage={proteins} scale={1.12} />
      <Label x={441} y={907} text="Damaged proteins" size={35} anchor="middle" />
      <Arrow x1={635} y1={779} x2={923} y2={760} color={theme.injury} progress={proteins} />
    </g>
    <path d="M687,617 H925" stroke={theme.muted} strokeWidth="5" opacity={insults} />
    <path d="M925,617 V429 H1175" stroke={theme.recovery} strokeWidth="5" fill="none" opacity={repair} />
    <path d="M925,617 V760 H1175" stroke={theme.injury} strokeWidth="5" fill="none" opacity={apoptosis} />
    <g opacity={repair}>
      <Label x={1170} y={326} text="Limited damage" size={34} color={theme.recovery} anchor="middle" />
      <Arrow x1={1175} y1={429} x2={1288} y2={429} color={theme.recovery} progress={repair} />
      <DNA x={1510} y={429} damage={1 - repair} scale={1.18} />
      <Label x={1510} y={554} text="Repair → survival" size={37} color={theme.recovery} anchor="middle" />
    </g>
    <g opacity={apoptosis}>
      <Label x={1220} y={679} text="Severe, irreparable damage" size={33} color={theme.injury} anchor="middle" />
      <Arrow x1={1175} y1={760} x2={1302} y2={760} color={theme.injury} progress={apoptosis} />
      <g transform="translate(1511 777)" opacity={1 - caspases}><Cell scale={lerp(.4, .32, apoptosis)} nuclearState="condensed" /></g>
      {[0, 1, 2, 3].map(i => {
        const angle = i * Math.PI / 2 + .4;
        const x = 1511 + Math.cos(angle) * 94 * caspases;
        const y = 777 + Math.sin(angle) * 80 * caspases;
        return <g key={i} opacity={caspases}>
          <circle cx={x} cy={y} r="23" fill={theme.cytoplasm} stroke={theme.membrane} strokeWidth="4" />
          <circle cx={x - 3} cy={y + 2} r="9" fill="#8F9AE1" />
        </g>;
      })}
      <Label x={1510} y={923} text="Apoptosis" size={39} color={theme.injury} anchor="middle" />
      <Label x={1196} y={857} text="Caspases" size={33} color={theme.mitochondrion} anchor="middle" opacity={caspases} />
    </g>
  </SceneCanvas>;
};

export const DeathPatterns: React.FC<SceneProps> = ({sceneId}) => {
  const {beat, frame, timed} = useScene(sceneId);
  const necrosis = beat('death-necrosis', 65);
  const nucleus = beat('death-nucleus', 100);
  const shrink = atWord(timed, frame, 'death-apoptosis', 'shrinks', 32, 20);
  const condenses = atWord(timed, frame, 'death-apoptosis', 'condenses', 28, 50);
  const apoptoticFragments = atWord(timed, frame, 'death-apoptosis', 'breaks', 40, 85);
  const clearance = atWord(timed, frame, 'death-apoptosis', 'removed', 85, 130);
  const fragmented = atWord(timed, frame, 'death-nucleus', 'fragmentation', 32, 50);
  const ruptured = atWord(timed, frame, 'death-nucleus', 'rupture', 24, 80);
  const densities = atWord(timed, frame, 'death-nucleus', 'amorphous', 24, 120);
  const nuclearState = fragmented < .5 ? 'condensed' : 'fragmented';
  return <SceneCanvas sceneId={sceneId} footer="These are patterns of cell death; shared injuries can engage more than one pathway.">
    <path d="M960,287 V952" stroke={theme.muted} strokeWidth="2" opacity=".3" />
    <Label x={478} y={324} text="NECROSIS" size={42} color={theme.injury} anchor="middle" />
    <Label x={1440} y={324} text="APOPTOSIS" size={42} color={theme.membrane} anchor="middle" />
    <g transform="translate(472 610)">
      <Cell scale={.73} swelling={necrosis * .7} membraneDamage={necrosis} mitochondriaDamage={necrosis} erSwelling={necrosis} ribosomeLoss={necrosis} nuclearState={nucleus > 0 ? nuclearState : 'normal'} />
      {Array.from({length: 7}, (_, i) => {
        const angle = i * .85;
        const phase = ((frame + i * 17) % 100) / 100;
        return <circle key={i} cx={Math.cos(angle) * lerp(170, 285, phase)} cy={Math.max(-185, Math.min(230, Math.sin(angle) * lerp(175, 274, phase)))} r={i % 2 === 0 ? 8 : 5} fill={theme.injury} opacity={necrosis * (1 - phase)} />;
      })}
      <g opacity={densities}>
        <circle cx="-115" cy="82" r="8" fill="#1B1621" />
        <circle cx="-96" cy="71" r="7" fill="#1B1621" />
        <circle cx="-104" cy="91" r="6" fill="#1B1621" />
      </g>
      <g opacity={ruptured}>
        <path d="M-125,-57 A17,17 0 1 1 -108,-44" fill="none" stroke={theme.injury} strokeWidth="5" />
        {[0, 1, 2, 3].map(i => <circle key={i} cx={-141 - i * 9} cy={-56 + i * 10} r="4" fill={theme.injury} />)}
      </g>
    </g>
    <g opacity={necrosis}>
      <g transform="translate(761 754)">
        <circle r="50" fill="#203E53" stroke="#92B8D2" strokeWidth="5" />
        <path d="M-22,-14 C-32,-38 1,-40 9,-16 C25,-32 40,-7 17,12 C25,36 -4,40 -14,14 C-36,21 -38,-6 -22,-14Z" fill="#92A0D1" />
      </g>
      <Label x={765} y={845} text="Inflammation" size={30} color={theme.injury} anchor="middle" />
      <Label x={459} y={939} text="Swelling · leakage" size={35} color={theme.injury} anchor="middle" />
      <Label x={440} y={881} text="Lysosome rupture · mitochondrial densities" size={30} color={theme.muted} anchor="middle" opacity={nucleus} />
    </g>
    <g transform="translate(1404 599)" opacity={1 - apoptoticFragments}>
      <Cell scale={lerp(.73, .46, shrink)} nuclearState={condenses > .25 ? 'condensed' : 'normal'} />
    </g>
    <g opacity={apoptoticFragments}>
      {Array.from({length: 5}, (_, i) => {
        const angle = i * 1.1 + .3;
        const x = lerp(1404 + Math.cos(angle) * lerp(70, 118, apoptoticFragments), 1670 + (i % 2) * 21, clearance);
        const y = lerp(599 + Math.sin(angle) * lerp(75, 148, apoptoticFragments), 600 + (i - 2) * 13, clearance);
        const radius = 23 + (i % 2) * 6;
        return <g key={i} opacity={1 - clearance}>
          <circle cx={x} cy={y} r={radius} fill={theme.cytoplasm} stroke={theme.membrane} strokeWidth="5" />
          <circle cx={x - 4} cy={y + 1} r={radius * .42} fill="#8F9AE1" />
        </g>;
      })}
      <Label x={1418} y={846} text={clearance > .8 ? 'Bodies cleared by phagocytes' : 'Contained apoptotic bodies'} size={31} color={theme.membrane} anchor="middle" />
      <Label x={1438} y={939} text="Shrinkage · controlled clearance" size={32} color={theme.membrane} anchor="middle" />
    </g>
    <g opacity={clearance} transform="translate(1697 601)">
      <path d="M-44,-72 C-96,-70 -92,-24 -68,-11 C-127,18 -93,80 -41,72 C-25,109 42,103 53,67 C108,70 111,9 79,-9 C100,-64 49,-90 13,-71 C-4,-104 -36,-99 -44,-72Z" fill="#285766" stroke={theme.recovery} strokeWidth="6" />
      {[[-47, -35], [48, -28], [-52, 33], [36, 51]].map(([x, y], i) => <g key={i} opacity={clearance}>
        <circle cx={x} cy={y} r="12" fill={theme.cytoplasm} stroke={theme.membrane} strokeWidth="2" />
        <circle cx={x - 2} cy={y + 1} r="5" fill="#8F9AE1" />
      </g>)}
      <ellipse cx="11" cy="7" rx="29" ry="34" fill="#6879AA" />
      <Label x={0} y={161} text="Phagocyte" size={30} color={theme.recovery} anchor="middle" />
    </g>
    <Label x={460} y={389} text="Condensation → fragmentation" size={30} anchor="middle" opacity={nucleus} />
  </SceneCanvas>;
};
