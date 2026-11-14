import { run, PROJ } from './eda.mjs';
import fs from 'fs';
const r = await run(`const p = await eda.dmt_Project.getCurrentProjectInfo(); if (p.uuid !== "${PROJ}") return "S1_STOP"; const out = []; for (const c of await eda.pcb_PrimitiveComponent.getAll()) { const id = c.getState_PrimitiveId(); const b = await eda.pcb_Primitive.getPrimitivesBBox([id]); out.push([c.getState_Designator(), c.getState_X(), c.getState_Y(), c.getState_Rotation(), b && b.minX, b && b.minY, b && b.maxX, b && b.maxY]); } return JSON.stringify(out);`);
fs.writeFileSync('pcb_bbox.json', JSON.stringify(r));
const by = Object.fromEntries(r.map(x => [x[0], x]));
for (const k of ['K1','U9','U6','J1','J12','LS1','R301','U1','J3']) { const x = by[k]; console.log(k, 'rot', x[3], 'bbox rel mm', [x[4]-x[1], x[6]-x[1], x[5]-x[2], x[7]-x[2]].map(v => (v*0.0254).toFixed(1)).join(' ')); }
