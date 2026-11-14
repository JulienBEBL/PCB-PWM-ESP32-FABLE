import { run } from './eda.mjs';
import { activatePcb } from './pcbact.mjs';
import fs from 'fs';
const MIL = 0.0254, F = JSON.parse(fs.readFileSync('fanout_plan.json')), m = v => +(v / MIL).toFixed(2);
const st = fs.existsSync('fanout_done.json') ? JSON.parse(fs.readFileSync('fanout_done.json')) : { i: 0 };
await run(`await eda.dmt_EditorControl.activateDocument("9e5b12b9217a84a5@b4788f45338c4e59bfcfdff2832a8063"); await new Promise(q => setTimeout(q, 1200)); return 1;`);
for (let i = st.i; i < F.length; i += 20) {
  const L = F.slice(i, i + 20).map(o => [o.net, m(o.px), m(o.py), m(o.vx), m(o.vy), m(o.w)]);
  const r = await run(`let n = 0; const V = (await eda.pcb_PrimitiveVia.getAll()).map(v => [v.getState_X(), v.getState_Y()]); const Ls = (await eda.pcb_PrimitiveLine.getAll()).map(l => [l.getState_StartX(), l.getState_StartY(), l.getState_EndX(), l.getState_EndY()]); const near = (a, b) => Math.abs(a - b) < 0.05; for (const [net, px, py, vx, vy, w] of ${JSON.stringify(L)}) { if (!V.some(v => near(v[0], vx) && near(v[1], vy))) await eda.pcb_PrimitiveVia.create(net, vx, vy, 12.01, 24.02); if (!Ls.some(l => near(l[0], px) && near(l[1], py) && near(l[2], vx) && near(l[3], vy))) await eda.pcb_PrimitiveLine.create(net, 1, px, py, vx, vy, w, false); n++; } await eda.pcb_Document.save(); return n;`);
  st.i = i + 20; fs.writeFileSync('fanout_done.json', JSON.stringify(st)); console.log('lot', i / 20 + 1, r, '/', L.length);
}
