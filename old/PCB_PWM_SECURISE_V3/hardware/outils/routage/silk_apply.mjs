import { run, PROJ } from './eda.mjs';
import fs from 'fs';
const MIL = 0.0254, P = JSON.parse(fs.readFileSync('silk_plan.json')), SILK = JSON.parse(fs.readFileSync('silk.json'));
const attr = Object.fromEntries(SILK.map(a => [a.ref, a.id]));
const guard = `const __p = await eda.dmt_Project.getCurrentProjectInfo(); if (__p.uuid !== "${PROJ}") return "S1_STOP"; const __d = await eda.dmt_SelectControl.getCurrentDocumentInfo(); if (!__d || __d.uuid !== "9e5b12b9217a84a5") return "DOC_STOP";`;
const m = v => Math.round(v / MIL * 100) / 100;
const state = fs.existsSync('silk_done.json') ? JSON.parse(fs.readFileSync('silk_done.json')) : { des: false, hid: false, str: 0, lin: 0, ids: [] };
const save = () => fs.writeFileSync('silk_done.json', JSON.stringify(state));
if (!state.des) {
  const D = P.texts.filter(t => t.kind === 'repère').map(t => [attr[t.s], m(t.x), m(t.y), t.rot, m(t.size)]);
  for (let i = 0; i < D.length; i += 20) { const r = await run(`${guard} let n = 0; for (const [id, x, y, rot, fs] of ${JSON.stringify(D.slice(i, i + 20))}) { if (await eda.pcb_PrimitiveAttribute.modify(id, {x, y, rotation: rot, fontSize: fs, lineWidth: 6, alignMode: 3, valueVisible: true})) n++; } await eda.pcb_Document.save(); return n;`); console.log('repères', i, r); }
  state.des = true; save();
}
if (!state.hid) { const ids = P.hidden.map(r => attr[r]); console.log('masqués', await run(`${guard} for (const id of ${JSON.stringify(ids)}) await eda.pcb_PrimitiveAttribute.modify(id, {valueVisible: false}); await eda.pcb_Document.save(); return ${ids.length};`)); state.hid = true; save(); }
const S = P.texts.filter(t => t.kind !== 'repère');
for (let i = state.str; i < S.length; i += 15) {
  const L = S.slice(i, i + 15).map(t => [t.s, m(t.x), m(t.y), m(t.size), t.rot]);
  const r = await run(`${guard} const out = []; for (const [s, x, y, z, rot] of ${JSON.stringify(L)}) { const t = await eda.pcb_PrimitiveString.create(3, x, y, s, "default", z, 6, 3, rot, false, 0, false, false); out.push(t ? t.getState_PrimitiveId() : null); } await eda.pcb_Document.save(); return JSON.stringify(out);`);
  state.ids.push(...r); state.str = i + 15; save(); console.log('textes', i, r.filter(Boolean).length, '/', L.length);
}
for (let i = state.lin; i < P.lines.length; i += 15) {
  const L = P.lines.slice(i, i + 15).map(l => [l.pts.flatMap(p => [m(p[0]), m(p[1])]), m(l.w)]);
  const r = await run(`${guard} const out = []; for (const [pts, w] of ${JSON.stringify(L)}) { const src = [pts[0], pts[1], "L", ...pts.slice(2)]; const pl = await eda.pcb_PrimitivePolyline.create("", 3, eda.pcb_MathPolygon.createPolygon(src), w, false); out.push(pl ? pl.getState_PrimitiveId() : null); } await eda.pcb_Document.save(); return JSON.stringify(out);`);
  state.ids.push(...r); state.lin = i + 15; save(); console.log('traits', i, r.filter(Boolean).length, '/', L.length);
}
console.log('terminé ; objets créés', state.ids.filter(Boolean).length);
