// Relève dans le DRC les paires d'objets à relier : [net, [x, y, type], [x, y, type]]
import { run } from './eda.mjs';
import fs from 'fs';
await run(`await eda.dmt_EditorControl.activateDocument("9e5b12b9217a84a5@b4788f45338c4e59bfcfdff2832a8063"); await new Promise(q => setTimeout(q, 1200)); return 1;`);
const r = await run(`const v = await eda.pcb_Drc.check(true, false, true); const out = []; const walk = n => { if (n && n.errorType === "Connection Error") out.push([n.net, n.obj1 && n.obj1.typeName, n.pos && [n.pos.x * 0.254, n.pos.y * 0.254]]); if (n && Array.isArray(n.list)) n.list.forEach(walk); }; (v || []).forEach(walk); return JSON.stringify(out);`);
const by = {}; for (const [net, t, p] of r) (by[net] ??= []).push([p[0], p[1], t]);
const P = []; for (const [net, L] of Object.entries(by)) for (let i = 0; i + 1 < L.length; i += 2) P.push([net, L[i], L[i + 1]]);
fs.writeFileSync('pairs.json', JSON.stringify(P)); console.log('paires', P.length, P.map(p => p[0]).join(' '));
