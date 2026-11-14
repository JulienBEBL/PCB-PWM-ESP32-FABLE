import { run, PROJ } from './eda.mjs';
import fs from 'fs';
await run(`await eda.dmt_EditorControl.activateDocument("9e5b12b9217a84a5@b4788f45338c4e59bfcfdff2832a8063"); await new Promise(r => setTimeout(r, 1500)); return 1;`); const r = await run(`const p = await eda.dmt_Project.getCurrentProjectInfo(); if (p.uuid !== "${PROJ}") return "S1_STOP"; const v = await eda.pcb_Drc.check(true, false, true); const walk = (n, acc) => { if (n && n.errorType) acc.push([n.errorType, n.ruleName, n.net || "", (n.obj1 && n.obj1.suffix) || "", (n.obj2 && n.obj2.suffix) || ""]); if (n && Array.isArray(n.list)) n.list.forEach(m => walk(m, acc)); return acc; }; const acc = []; (v || []).forEach(n => walk(n, acc)); return JSON.stringify(acc);`);
fs.writeFileSync('pcb_drc.json', JSON.stringify(r));
const cnt = {}; for (const e of r) cnt[e[0] + ' / ' + e[1]] = (cnt[e[0] + ' / ' + e[1]] || 0) + 1;
console.log(r.length, JSON.stringify(cnt, null, 1));
console.log(r.filter(e => e[0] !== 'Connection Error').slice(0, 25).map(e => e.join(' | ')).join('\n'));
