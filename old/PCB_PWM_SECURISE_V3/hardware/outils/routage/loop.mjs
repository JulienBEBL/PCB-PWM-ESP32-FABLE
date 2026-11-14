import fs from 'fs';
import { run } from './eda.mjs';
const PLAN = ['GND', '+3V3', 'GND_P', '+12V_P'];
const wait = async () => { for (let i = 0; i < 40; i++) { try { await run('return 1;'); return; } catch (e) { await new Promise(q => setTimeout(q, 6000)); } } };
const act = () => run(`await eda.dmt_EditorControl.activateDocument("9e5b12b9217a84a5@b4788f45338c4e59bfcfdff2832a8063"); await new Promise(q => setTimeout(q, 1200)); return 1;`);
const openNets = async () => { await wait(); await act(); return run(`const v = await eda.pcb_Drc.check(true, false, true); const c = {}; const walk = n => { if (n && n.errorType === "Connection Error") c[n.net] = (c[n.net] || 0) + 1; if (n && Array.isArray(n.list)) n.list.forEach(walk); }; (v || []).forEach(walk); return JSON.stringify(c);`); };
const tried = {}; const SIZE = +(process.env.SIZE || 4);
for (let round = 0; round < 40; round++) {
  const o = await openNets(); const sig = Object.keys(o).filter(n => !PLAN.includes(n) && (tried[n] || 0) < 3);
  console.log('tour', round + 1, ': ouverts', Object.keys(o).length, JSON.stringify(Object.keys(o)));
  if (!sig.length) break;
  const G = JSON.parse(fs.readFileSync('fine_geo.json')); const span = {}; for (const ob of Object.values(G)) for (const p of ob.P) if (p[1]) { const z = span[p[1]] ??= [1e9, -1e9, 1e9, -1e9]; z[0] = Math.min(z[0], p[2]); z[1] = Math.max(z[1], p[2]); z[2] = Math.min(z[2], p[3]); z[3] = Math.max(z[3], p[3]); } const len = n => span[n] ? (span[n][1] - span[n][0]) + (span[n][3] - span[n][2]) : 0; const FIRST = ['OSC_IN', 'OSC_OUT', 'USB_DP', 'USB_DN', 'CC1', 'CC2']; sig.sort((a, b) => (FIRST.includes(b) - FIRST.includes(a)) || len(b) - len(a));
  const nets = sig.slice(0, SIZE); for (const n of nets) tried[n] = (tried[n] || 0) + 1;
  await act();
  await run(`globalThis.__ar = { done: false }; eda.pcb_Document.autoRouting({ RoutingNets: ${JSON.stringify(nets)}, layers: [1, 2, 16], cornerStyle: 0, existingPrimitiveMode: "keep", optimization: 1 }).then(async x => { try { await eda.pcb_Document.save(); } catch (e) {} globalThis.__ar = { done: true }; }).catch(e => { globalThis.__ar = { done: true, err: e.message }; }); return 1;`);
  for (let k = 0; k < 25; k++) { try { const r = await run(`await new Promise(q => setTimeout(q, 8000)); return JSON.stringify(globalThis.__ar || null);`); if (r && r.done) break; } catch (e) { await wait(); break; } }
}
const o = await openNets(); console.log('final', JSON.stringify(o));
