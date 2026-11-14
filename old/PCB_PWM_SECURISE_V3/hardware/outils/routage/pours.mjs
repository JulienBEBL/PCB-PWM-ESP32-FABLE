import { run } from './eda.mjs';
import { activatePcb } from './pcbact.mjs';
const MIL = 0.0254, m = v => +(v / MIL).toFixed(2);
const rect = (x0, x1, y0, y1) => [m(x0), m(y0), 'L', m(x1), m(y0), m(x1), m(y1), m(x0), m(y1), m(x0), m(y0)];
const P = [['GND', 15, rect(0.5, 119.5, 30.2, 79.5), 'PLAN_GND_L2'], ['GND_P', 15, rect(0.5, 119.5, 0.5, 27.8), 'PLAN_GNDP_L2'], ['+3V3', 16, rect(0.5, 119.5, 30.2, 79.5), 'PLAN_3V3_L3'], ['+12V_P', 16, rect(0.5, 119.5, 0.5, 27.8), 'PLAN_12VP_L3']];
console.log(await activatePcb());
const r = await run(`const ex = (await eda.pcb_PrimitivePour.getAll()).filter(p => /^PLAN_/.test(p.getState_PourName() || "")).length; if (ex) return "déjà " + ex; const out = []; for (const [net, layer, pts, name] of ${JSON.stringify(P)}) { const p = await eda.pcb_PrimitivePour.create(net, layer, eda.pcb_MathPolygon.createPolygon(pts), "solid", true, name, 1, 10, false); if (p) { try { await p.rebuildCopperRegion(); } catch (e) {} } out.push([name, !!p]); } await eda.pcb_Document.save(); return JSON.stringify(out);`);
console.log(JSON.stringify(r));
