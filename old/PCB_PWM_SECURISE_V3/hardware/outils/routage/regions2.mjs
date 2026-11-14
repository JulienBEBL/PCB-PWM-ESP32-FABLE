import { run } from './eda.mjs';
const MIL = 0.0254, m = v => +(v / MIL).toFixed(2);
const rect = (x0, x1, y0, y1) => [m(x0), m(y0), 'L', m(x1), m(y0), m(x1), m(y1), m(x0), m(y1), m(x0), m(y0)];
const R = [];
for (const k of [37.8, 55.8]) {
  // pastille 8 : x k±1.05, y 24.99..25.99 ; pastille 7 : bord droit k-2.15
  R.push(['iso_b8', rect(k - 2.1, k - 1.1, 23.0, 28), [5, 6, 7]]);      // entre broches 7 et 8
  R.push(['iso_b8', rect(k + 1.1, k + 3.05, 23.0, 28), [5, 6, 7]]);     // à droite
  R.push(['iso_b8', rect(k - 1.1, k + 1.1, 22.9, 24.94), [5, 6, 7]]);   // sous la broche 8
  R.push(['iso_b8', rect(k - 1.1, k - 0.6, 26.04, 28), [5, 6, 7]]);     // au-dessus, de part et d'autre du couloir
  R.push(['iso_b8', rect(k + 0.6, k + 1.1, 26.04, 28), [5, 6, 7]]);
  R.push(['couloir_b8', rect(k - 0.6, k + 0.6, 26.04, 30), [6, 7]]);    // couloir de la piste de bobine
}
const r = await run(`await eda.dmt_EditorControl.activateDocument("9e5b12b9217a84a5@b4788f45338c4e59bfcfdff2832a8063"); await new Promise(q => setTimeout(q, 1500)); const d = await eda.dmt_SelectControl.getCurrentDocumentInfo(); if (d.uuid !== "9e5b12b9217a84a5") return "DOC_STOP"; const old = (await eda.pcb_PrimitiveRegion.getAll()).filter(g => /^ISO_(iso_b8|couloir_b8)/.test(g.getState_RegionName() || "")).map(g => g.getState_PrimitiveId()); if (old.length) await eda.pcb_PrimitiveRegion.delete(old); const out = []; for (const [n, pts, rules] of ${JSON.stringify(R)}) { const g = await eda.pcb_PrimitiveRegion.create(12, eda.pcb_MathPolygon.createPolygon(pts), rules, "ISO_" + n, 0.1, false); out.push(!!g); } await eda.pcb_Document.save(); const left = (await eda.pcb_PrimitiveRegion.getAll()).map(g => g.getState_RegionName()); return JSON.stringify({supprimées: old.length, créées: out.filter(Boolean).length, total: left.length});`);
console.log(JSON.stringify(r));
