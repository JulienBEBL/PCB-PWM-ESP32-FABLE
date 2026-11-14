import { run, PROJ } from './eda.mjs';
import fs from 'fs';
const MIL = 0.0254, G = JSON.parse(fs.readFileSync('fine_geo.json'));
const TP = [['TP1', '+5V', 'C'], ['TP2', '+3V3', 'C'], ['TP3', 'GND', 'C'], ['TP4', 'PWM_IN', 'C'], ['TP5', 'I_MON', 'C'], ['TP6', '+12V_P', 'P'], ['TP7', 'GND_P', 'P']];
const near = { '+5V': 'U2', '+3V3': 'U2', GND: 'U2', PWM_IN: 'U3', I_MON: 'U10', '+12V_P': 'U8', GND_P: 'U8' };
const boxes = [...Object.values(G).map(o => o.B), ...['J13', 'J14', 'J15', 'J8'].map(d => [G[d].B[0], G[d].B[1], G[d].B[2] - 3.3, G[d].B[2]])], R = 0.9, CL = 0.6;
const placedTP = [];
const free = (x, y, dom) => { if (dom === 'C' && y - R < 30) return false; if (dom === 'P' && y + R > 28) return false; if (x < 2 || x > 118 || y < 2 || y > 78) return false; for (const [hx, hy] of [[4,4],[116,4],[4,76],[116,76]]) if (Math.hypot(x - hx, y - hy) < 3.5 + R) return false; for (const b of boxes) if (x + R + CL > b[0] && x - R - CL < b[1] && y + R + CL > b[2] && y - R - CL < b[3]) return false; for (const t of placedTP) if (Math.hypot(x - t[2], y - t[3]) < 2 * R + 1.5) return false; return true; };
for (const [tp, net, dom] of TP) {
  const ic = G[near[net]]; const p = ic.P.find(q => q[1] === net) || ic.P[0]; let best = null;
  for (let r = 0; r < 25 && !best; r += 0.25) for (let a = 0; a < 360; a += 10) { const x = p[2] + r * Math.cos(a * Math.PI / 180), y = p[3] + r * Math.sin(a * Math.PI / 180); if (free(x, y, dom)) { best = [x, y]; break; } }
  placedTP.push([tp, net, +best[0].toFixed(2), +best[1].toFixed(2)]);
}
console.log(JSON.stringify(placedTP));
await run(`await eda.dmt_EditorControl.activateDocument("9e5b12b9217a84a5@b4788f45338c4e59bfcfdff2832a8063"); await new Promise(q => setTimeout(q, 1200)); return 1;`); const r = await run(`const p = await eda.dmt_Project.getCurrentProjectInfo(); if (p.uuid !== "${PROJ}") return "S1_STOP"; const d = await eda.dmt_SelectControl.getCurrentDocumentInfo(); if (d.uuid !== "9e5b12b9217a84a5") return "DOC_STOP"; const __old = (await eda.pcb_PrimitivePad.getAll()).filter(q => /^TPd/.test(q.getState_PadNumber())).map(q => q.getState_PrimitiveId()); if (__old.length) await eda.pcb_PrimitivePad.delete(__old); const T = ${JSON.stringify(placedTP)}; const out = []; for (const [n, net, x, y] of T) { const q = await eda.pcb_PrimitivePad.create(1, n, x / ${MIL}, y / ${MIL}, 0, ["ELLIPSE", 59, 59], net, null, 0, 0, 0, false, 0); out.push(q ? [q.getState_PadNumber(), q.getState_Net()] : null); } await eda.pcb_Document.save(); return JSON.stringify(out);`);
console.log(JSON.stringify(r));
fs.writeFileSync('tp.json', JSON.stringify(placedTP));
