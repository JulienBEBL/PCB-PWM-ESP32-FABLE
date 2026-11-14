// Applique u1_ring_moves.json : 1) supprime les raccords GND / +3V3 des pastilles des composants déplacés
// (via supprimé seulement s'il ne sert plus à aucune autre piste), 2) déplace les composants, 3) relit.
// Prérequis : cu.json à jour (node cu_read.mjs). Usage : node ring_apply.mjs [dry]
import { run, PROJ } from './eda.mjs';
import fs from 'fs';
const MIL = 0.0254, M = JSON.parse(fs.readFileSync('u1_ring_moves.json')), CU = JSON.parse(fs.readFileSync('cu.json')), G = JSON.parse(fs.readFileSync('fine_geo.json'));
const REF = new Set(M.map(m => m.ref)), PL = new Set(['GND', '+3V3']);
const size = {}; for (const [r, o] of Object.entries(G)) for (const p of o.P) size[r + '.' + p[0]] = [p[4] / MIL, p[5] / MIL];
const pads = CU.P.filter(p => REF.has(p[0]) && PL.has(p[2])).map(p => ({ net: p[2], x: p[3], y: p[4], s: size[p[0] + '.' + p[1]] || [40, 40] }));
const inPad = (x, y, net) => pads.some(p => p.net === net && Math.abs(x - p.x) <= p.s[0] / 2 + 0.5 && Math.abs(y - p.y) <= p.s[1] / 2 + 0.5);
const hdr = `await eda.dmt_EditorControl.activateDocument("9e5b12b9217a84a5@${PROJ}"); await new Promise(q => setTimeout(q, 600)); const __p = await eda.dmt_Project.getCurrentProjectInfo(); if (__p.uuid !== "${PROJ}") return "S1_STOP"; const d = await eda.dmt_SelectControl.getCurrentDocumentInfo(); if (d.uuid !== "9e5b12b9217a84a5") return "DOC_STOP";`;
const live = await run(`${hdr} const L = (await eda.pcb_PrimitiveLine.getAll()).filter(l => ["GND", "+3V3"].includes(l.getState_Net()) && l.getState_Layer() === 1).map(l => [l.getState_PrimitiveId(), l.getState_Net(), l.getState_StartX(), l.getState_StartY(), l.getState_EndX(), l.getState_EndY()]); const V = (await eda.pcb_PrimitiveVia.getAll()).filter(v => ["GND", "+3V3"].includes(v.getState_Net())).map(v => [v.getState_PrimitiveId(), v.getState_Net(), v.getState_X(), v.getState_Y()]); const AL = (await eda.pcb_PrimitiveLine.getAll()).filter(l => ["GND", "+3V3"].includes(l.getState_Net())).map(l => [l.getState_PrimitiveId(), l.getState_StartX(), l.getState_StartY(), l.getState_EndX(), l.getState_EndY()]); return JSON.stringify({ L, V, AL });`);
const delL = live.L.filter(l => inPad(l[2], l[3], l[1]) || inPad(l[4], l[5], l[1]));
const dset = new Set(delL.map(l => l[0])), near = (a, b) => Math.abs(a - b) < 0.05;
const delV = live.V.filter(v => delL.some(l => (near(l[2], v[2]) && near(l[3], v[3])) || (near(l[4], v[2]) && near(l[5], v[3]))) && !live.AL.some(l => !dset.has(l[0]) && ((near(l[1], v[2]) && near(l[2], v[3])) || (near(l[3], v[2]) && near(l[4], v[3])))));
console.log('raccords à supprimer : pistes', delL.length, ', vias', delV.length, '; composants à déplacer', M.length);
if (process.argv[2] === 'dry') process.exit(0);
let nl = 0, nv = 0;
for (const l of delL) { nl += await run(`${hdr} await eda.pcb_PrimitiveLine.delete("${l[0]}"); return (await eda.pcb_PrimitiveLine.get("${l[0]}")) ? 0 : 1;`); }
for (const v of delV) { nv += await run(`${hdr} await eda.pcb_PrimitiveVia.delete("${v[0]}"); return (await eda.pcb_PrimitiveVia.get("${v[0]}")) ? 0 : 1;`); }
await run(`${hdr} await eda.pcb_Document.save(); return 1;`);
console.log('supprimés : pistes', nl, '/', delL.length, ', vias', nv, '/', delV.length);
const r = await run(`${hdr} const M = ${JSON.stringify(M)}; const C = await eda.pcb_PrimitiveComponent.getAll(); const out = []; for (const m of M) { const c = C.find(c => c.getState_Designator() === m.ref); if (!c) { out.push([m.ref, "absent"]); continue; } const x0 = c.getState_X(), y0 = c.getState_Y(); await eda.pcb_PrimitiveComponent.modify(c.getState_PrimitiveId(), { x: x0 + m.dx / ${MIL}, y: y0 + m.dy / ${MIL} }); const c2 = await eda.pcb_PrimitiveComponent.get(c.getState_PrimitiveId()); out.push([m.ref, +((c2.getState_X() - x0) * ${MIL}).toFixed(2), +((c2.getState_Y() - y0) * ${MIL}).toFixed(2)]); } await eda.pcb_Document.save(); return JSON.stringify(out);`);
const bad = r.filter((o, i) => o[1] === 'absent' || Math.abs(o[1] - M[i].dx) > 0.02 || Math.abs(o[2] - M[i].dy) > 0.02);
console.log('déplacés', r.length - bad.length, '/', M.length, bad.length ? 'ÉCARTS ' + JSON.stringify(bad) : '');
