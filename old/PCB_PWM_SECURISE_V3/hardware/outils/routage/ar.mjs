import { run } from './eda.mjs';
import { activatePcb } from './pcbact.mjs';
const nets = JSON.parse(process.argv[2]), layers = JSON.parse(process.argv[3] || '[1,2]');
await run(`await eda.dmt_EditorControl.activateDocument("9e5b12b9217a84a5@b4788f45338c4e59bfcfdff2832a8063"); await new Promise(q => setTimeout(q, 1500)); return 1;`);
const r = await run(`globalThis.__ar = { done: false }; const t0 = Date.now(); eda.pcb_Document.autoRouting({ RoutingNets: ${JSON.stringify(nets)}, layers: ${JSON.stringify(layers)}, cornerStyle: 0, existingPrimitiveMode: "keep", optimization: 1 }).then(async x => { try { await eda.pcb_Document.save(); } catch (e) {} globalThis.__ar = { done: true, ms: Date.now() - t0, r: x, saved: true }; }).catch(e => { globalThis.__ar = { done: true, err: e.message }; }); await new Promise(q => setTimeout(q, 20000)); return JSON.stringify(globalThis.__ar);`);
console.log(JSON.stringify(r));
