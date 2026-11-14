import { run } from './eda.mjs';
import { activatePcb } from './pcbact.mjs';
const MIL = 0.0254, m = v => +(v / MIL).toFixed(2);
const rect = (x0, x1, y0, y1) => [m(x0), m(y0), 'L', m(x1), m(y0), m(x1), m(y1), m(x0), m(y1), m(x0), m(y0)];
const K = [37.8, 55.8]; // x des broches 8 de K1, K2
const R = [];
// Bande d'isolement y 28-30, interrompue par un couloir de 1,2 mm à chaque broche 8
let x = 0.3; for (const k of K) { R.push(['bande', rect(x, k - 0.6, 28, 30), [5, 6, 7]]); x = k + 0.6; } R.push(['bande', rect(x, 119.7, 28, 30), [5, 6, 7]]);
// Autour de chaque broche 8 : pas de piste ni de plan de puissance (2 mm), sauf le couloir de la piste de bobine
for (const k of K) { R.push(['iso_b8', rect(k - 2.5, k - 0.6, 23.4, 28), [5, 6, 7]]); R.push(['iso_b8', rect(k + 0.6, k + 2.5, 23.4, 28), [5, 6, 7]]); R.push(['couloir_b8', rect(k - 0.6, k + 0.6, 23.4, 30), [6, 7]]); }
console.log(await activatePcb());
const r = await run(`const ex = (await eda.pcb_PrimitiveRegion.getAll()).filter(g => /^ISO_/.test(g.getState_RegionName() || "")).length; if (ex) return "déjà " + ex; const R = ${JSON.stringify(R)}; const out = []; for (const [n, pts, rules] of R) { const g = await eda.pcb_PrimitiveRegion.create(12, eda.pcb_MathPolygon.createPolygon(pts), rules, "ISO_" + n, 0.1, false); out.push(g ? g.getState_PrimitiveId() : null); } await eda.pcb_Document.save(); return JSON.stringify(out);`);
console.log(JSON.stringify(r));
