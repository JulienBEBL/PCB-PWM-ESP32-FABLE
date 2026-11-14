// Restaure le cuivre (pistes, vias) des nets de rip_nets.json depuis cu2_avant_rip.json, après suppression de l'existant de ces nets.
import { run } from './eda.mjs';
import fs from 'fs';
const N = JSON.parse(fs.readFileSync('rip_nets.json')), C = JSON.parse(fs.readFileSync('cu2_avant_rip.json'));
const L = C.L.filter(l => N.includes(l[0])), V = C.V.filter(v => N.includes(v[0]));
const hdr = `await eda.dmt_EditorControl.activateDocument("9e5b12b9217a84a5@b4788f45338c4e59bfcfdff2832a8063"); await new Promise(q => setTimeout(q, 600)); const d = await eda.dmt_SelectControl.getCurrentDocumentInfo(); if (d.uuid !== "9e5b12b9217a84a5") return "DOC_STOP";`;
console.log(await run(`${hdr} const N = new Set(${JSON.stringify(N)}); const a = (await eda.pcb_PrimitiveLine.getAll()).filter(l => N.has(l.getState_Net()) && [1, 2, 16].includes(l.getState_Layer())).map(l => l.getState_PrimitiveId()); const b = (await eda.pcb_PrimitiveVia.getAll()).filter(v => N.has(v.getState_Net())).map(v => v.getState_PrimitiveId()); for (let i = 0; i < a.length; i += 50) await eda.pcb_PrimitiveLine.delete(a.slice(i, i + 50)); for (let i = 0; i < b.length; i += 50) await eda.pcb_PrimitiveVia.delete(b.slice(i, i + 50)); await eda.pcb_Document.save(); return "suppr " + a.length + "/" + b.length;`));
let n = 0; for (let i = 0; i < L.length; i += 60) n += await run(`${hdr} let n = 0; for (const l of ${JSON.stringify(L.slice(i, i + 60))}) if (await eda.pcb_PrimitiveLine.create(l[0], l[1], l[2], l[3], l[4], l[5], l[6], false)) n++; await eda.pcb_Document.save(); return n;`);
const nv = await run(`${hdr} let n = 0; for (const v of ${JSON.stringify(V)}) if (await eda.pcb_PrimitiveVia.create(v[0], v[1], v[2], 12.01, v[3], undefined, undefined, undefined, false)) n++; await eda.pcb_Document.save(); return n;`);
console.log('restaurés : pistes', n, '/', L.length, ', vias', nv, '/', V.length);
