import { run, PROJ } from './eda.mjs';
import fs from 'fs';
const PCB = '9e5b12b9217a84a5';
const plan = JSON.parse(fs.readFileSync('fine_plan.json'));
const guard = `const __p = await eda.dmt_Project.getCurrentProjectInfo(); if (__p.uuid !== "${PROJ}") return "S1_STOP"; const __d = await eda.dmt_SelectControl.getCurrentDocumentInfo(); if (!__d || __d.uuid !== "${PCB}") return "DOC_STOP";`;
let n = 0;
for (let i = 0; i < plan.length; i += 15) {
  const lot = plan.slice(i, i + 15).map(p => [p.id, p.x, p.y, p.r]);
  const res = await run(`${guard} const L = ${JSON.stringify(lot)}; let n = 0; for (const [id, x, y, r] of L) { let ok; try { ok = await eda.pcb_PrimitiveComponent.modify(id, {x, y, rotation: r}); } catch (e) { await new Promise(q => setTimeout(q, 700)); ok = await eda.pcb_PrimitiveComponent.modify(id, {x, y, rotation: r}); } if (ok) n++; } await eda.pcb_Document.save(); return n;`);
  n += res; console.log('lot', i / 15 + 1, res, '/', lot.length);
}
console.log('appliqués', n);
