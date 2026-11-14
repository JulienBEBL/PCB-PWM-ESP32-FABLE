// Annule un import ses_apply.mjs (identifiants de ses_created.json), un identifiant à la fois. Option : liste de nets à retirer seulement.
import { run, PROJ } from './eda.mjs';
import fs from 'fs';
const C = JSON.parse(fs.readFileSync('ses_created.json'));
const hdr = `await eda.dmt_EditorControl.activateDocument("9e5b12b9217a84a5@${PROJ}"); await new Promise(q => setTimeout(q, 300)); const d = await eda.dmt_SelectControl.getCurrentDocumentInfo(); if (d.uuid !== "9e5b12b9217a84a5") return "DOC_STOP";`;
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null;
let n = 0;
for (const [kind, ids] of [['pcb_PrimitiveLine', C.L], ['pcb_PrimitiveVia', C.V]]) for (let i = 0; i < ids.length; i += 20) {
  n += await run(`${hdr} let n = 0; for (const id of ${JSON.stringify(ids.slice(i, i + 20))}) { const o = await eda.${kind}.get(id); if (!o) continue; ${only ? `if (!${JSON.stringify([...only])}.includes(o.getState_Net())) continue;` : ''} await eda.${kind}.delete(id); n++; } await eda.pcb_Document.save(); return n;`);
}
console.log('supprimés', n);
