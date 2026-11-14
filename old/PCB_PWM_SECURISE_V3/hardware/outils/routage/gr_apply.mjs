import { run } from './eda.mjs';
import fs from 'fs';
const MIL = 0.0254, R = JSON.parse(fs.readFileSync('gridroute_out.json')).filter(r => r && r.ok), m = v => +(v / MIL).toFixed(3);
const W = { GND: 0.25, VBUS: 0.25 };
const r = await run(`await eda.dmt_EditorControl.activateDocument("9e5b12b9217a84a5@b4788f45338c4e59bfcfdff2832a8063"); await new Promise(q => setTimeout(q, 1200)); const d = await eda.dmt_SelectControl.getCurrentDocumentInfo(); if (d.uuid !== "9e5b12b9217a84a5") return "DOC_STOP"; let n = 0; for (const o of ${JSON.stringify(R.map(o => ({ net: o.net, segs: o.segs.map(z => [z[0], m(z[1]), m(z[2]), m(z[3]), m(z[4])]).filter(z => z[1] !== z[3] || z[2] !== z[4]), vias: o.vias.map(v => [m(v[0]), m(v[1])]) })))}) { for (const [l, x1, y1, x2, y2] of o.segs) { await eda.pcb_PrimitiveLine.create(o.net, l, x1, y1, x2, y2, ${m(0.2)}, false); n++; } for (const [x, y] of o.vias) await eda.pcb_PrimitiveVia.create(o.net, x, y, 12.01, 24.02); } await eda.pcb_Document.save(); return n;`);
console.log('segments posés', r);
