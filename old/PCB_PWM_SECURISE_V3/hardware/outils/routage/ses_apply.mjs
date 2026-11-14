// Import contrôlé d'un .ses Freerouting : seuls les éléments nouveaux des nets listés, couches L1 / L4 seulement.
// Usage : node ses_apply.mjs <fichier.ses> <nets séparés par des virgules> [dry]
import { run, PROJ } from './eda.mjs';
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const parse = require('./ses_parse.cjs');
const [file, nets, dry] = process.argv.slice(2);
const KEEP = new Set(nets.split(','));
const LAY = { TopLayer: 1, BottomLayer: 2 };
const all = parse(file);
const segs = [], vias = [], refus = [];
for (const [n, o] of Object.entries(all)) {
  if (!KEEP.has(n)) { refus.push(`${n} (hors liste)`); continue; }
  for (const w of o.W) {
    if (!LAY[w.layer]) { refus.push(`${n} couche ${w.layer}`); continue; }
    for (let i = 0; i + 3 < w.pts.length; i += 2) if (w.pts[i] !== w.pts[i + 2] || w.pts[i + 1] !== w.pts[i + 3]) segs.push([n, LAY[w.layer], w.pts[i], w.pts[i + 1], w.pts[i + 2], w.pts[i + 3], w.w]);
  }
  for (const v of o.V) vias.push([n, v.x, v.y]);
}
console.log('segments', segs.length, 'vias', vias.length, '; ignorés :', refus.join(', ') || 'aucun');
if (dry) process.exit(0);
const hdr = `await eda.dmt_EditorControl.activateDocument("9e5b12b9217a84a5@${PROJ}"); await new Promise(q => setTimeout(q, 800)); const __p = await eda.dmt_Project.getCurrentProjectInfo(); if (__p.uuid !== "${PROJ}") return "S1_STOP"; const d = await eda.dmt_SelectControl.getCurrentDocumentInfo(); if (d.uuid !== "9e5b12b9217a84a5") return "DOC_STOP";`;
let n = 0; const created = { L: [], V: [] };
for (let i = 0; i < segs.length; i += 40) {
  const r = await run(`${hdr} const ids = []; for (const [net, l, x1, y1, x2, y2, w] of ${JSON.stringify(segs.slice(i, i + 40))}) { const o = await eda.pcb_PrimitiveLine.create(net, l, x1, y1, x2, y2, w, false); if (o) ids.push(o.getState_PrimitiveId()); } await eda.pcb_Document.save(); return JSON.stringify(ids);`);
  n += r.length; created.L.push(...r);
}
const rv = vias.length ? await run(`${hdr} const ids = []; for (const [net, x, y] of ${JSON.stringify(vias)}) { const o = await eda.pcb_PrimitiveVia.create(net, x, y, 12.01, 24.02); if (o) ids.push(o.getState_PrimitiveId()); } await eda.pcb_Document.save(); return JSON.stringify(ids);`) : [];
created.V.push(...rv); fs.writeFileSync('ses_created.json', JSON.stringify(created));
console.log('posés : segments', n, '/', segs.length, ', vias', rv.length, '/', vias.length);
