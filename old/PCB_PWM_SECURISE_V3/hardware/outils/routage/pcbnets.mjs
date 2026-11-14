import { run, PROJ } from './eda.mjs';
import fs from 'fs';
const r = await run(`const p = await eda.dmt_Project.getCurrentProjectInfo(); if (p.uuid !== "${PROJ}") return "S1_STOP"; const out = []; for (const c of await eda.pcb_PrimitiveComponent.getAll()) { const pads = await eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId(c.getState_PrimitiveId()) || []; for (const q of pads) { const o = JSON.parse(JSON.stringify(q)); out.push([c.getState_Designator(), o.padNumber, o.net, o.x, o.y]); } } return JSON.stringify(out);`);
fs.writeFileSync('pcb_pads.json', JSON.stringify(r));
const nets = {}; for (const [ref, n, net] of r) if (net) (nets[net] ??= []).push(ref + '.' + n);
const single = Object.entries(nets).filter(([k, v]) => v.length < 2).map(([k]) => k);
console.log('pastilles', r.length, '; sans net', r.filter(x => !x[2]).length, '; nets', Object.keys(nets).length, '; nets à une pastille :', single.join(',') || 'aucun');
