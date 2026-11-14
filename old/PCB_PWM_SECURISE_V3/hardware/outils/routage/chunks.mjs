import { run } from './eda.mjs';
import fs from 'fs';
const act = () => run(`await eda.dmt_EditorControl.activateDocument("9e5b12b9217a84a5@b4788f45338c4e59bfcfdff2832a8063"); await new Promise(q => setTimeout(q, 1200)); return 1;`);
const wait = async () => { for (let i = 0; i < 40; i++) { try { await run('return 1;'); return; } catch (e) { await new Promise(q => setTimeout(q, 6000)); } } };
await act();
const open = await run(`const v = await eda.pcb_Drc.check(true, false, true); const c = {}; const walk = n => { if (n && n.errorType === "Connection Error") c[n.net] = 1; if (n && Array.isArray(n.list)) n.list.forEach(walk); }; (v || []).forEach(walk); return JSON.stringify(Object.keys(c));`);
const PLAN = ['GND', '+3V3', 'GND_P', '+12V_P'];
const FIRST = ['OSC_IN', 'OSC_OUT', 'USB_DP', 'USB_DN', 'CC1', 'CC2', 'VBUS', '+5V', '+5V_F', '+5V_IN', 'K1_COIL_N', 'K2_COIL_N'];
const G = JSON.parse(fs.readFileSync('fine_geo.json')); const span = {}; for (const o of Object.values(G)) for (const p of o.P) if (p[1]) { const s = span[p[1]] ??= [1e9, -1e9, 1e9, -1e9]; s[0] = Math.min(s[0], p[2]); s[1] = Math.max(s[1], p[2]); s[2] = Math.min(s[2], p[3]); s[3] = Math.max(s[3], p[3]); } const len = n => span[n] ? (span[n][1] - span[n][0]) + (span[n][3] - span[n][2]) : 0;
const rest = open.filter(n => !PLAN.includes(n) && !FIRST.includes(n)).sort((a, b) => len(b) - len(a));
const order = process.env.OPEN ? [open.filter(n => !PLAN.includes(n))] : process.env.RETRY ? [JSON.parse(fs.readFileSync("chunks_failed.json"))] : [FIRST.filter(n => open.includes(n)), ...Array.from({ length: Math.ceil(rest.length / 12) }, (_, i) => rest.slice(i * 12, i * 12 + 12))].filter(c => c.length);
console.log('nets ouverts', open.length, '; lots', order.length);
const failed = [];
for (const [i, nets] of order.entries()) {
  await wait(); await act();
  await run(`globalThis.__ar = { done: false }; const t0 = Date.now(); eda.pcb_Document.autoRouting({ RoutingNets: ${JSON.stringify(nets)}, layers: ${JSON.stringify(process.env.RETRY ? [1, 2, 16] : [1, 2])}, cornerStyle: 0, existingPrimitiveMode: "keep", optimization: 1 }).then(async x => { try { await eda.pcb_Document.save(); } catch (e) {} globalThis.__ar = { done: true, ms: Date.now() - t0, r: x }; }).catch(e => { globalThis.__ar = { done: true, err: e.message }; }); return 1;`);
  let res = null; for (let k = 0; k < 30 && !res; k++) { try { const r = await run(`await new Promise(q => setTimeout(q, 10000)); return JSON.stringify(globalThis.__ar || null);`); if (r && r.done) res = r; } catch (e) { await wait(); res = { lost: true }; } }
  const f = res && res.r ? res.r.failedNets : nets; failed.push(...(f || []));
  console.log('lot', i + 1, JSON.stringify(nets.length), res && res.r ? `${res.r.successNetsCount}/${res.r.totalNetsCount} en ${Math.round(res.ms / 1000)} s` : JSON.stringify(res));
}
fs.writeFileSync('chunks_failed.json', JSON.stringify(failed)); console.log('échecs', failed.length, failed.join(' '));
