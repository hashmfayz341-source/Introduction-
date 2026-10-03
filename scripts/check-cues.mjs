import fs from 'node:fs';
const timeline=JSON.parse(fs.readFileSync('src/data/timeline.json','utf8'));
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
let count=0;
for(const file of fs.readdirSync('src/scenes').filter(f=>f.endsWith('.tsx'))){
 const code=fs.readFileSync(`src/scenes/${file}`,'utf8');
 for(const m of code.matchAll(/word\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/g)){
  const [_,id,anchor]=m;
  const beat=timeline.scenes.flatMap(s=>s.beats).find(b=>b.id===id);
  if(!beat?.words.some(w=>norm(w.text)===norm(anchor)))throw Error(`${file}: missing real spoken word ${id}/${anchor}`);
  count++;
 }
}
console.log(`Verified ${count} literal animation word cues against recorded speech boundaries.`);
