import { run } from './eda.mjs';
import fs from 'fs';
const MIL = 0.0254, G = JSON.parse(fs.readFileSync('fine_geo.json')), TP = JSON.parse(fs.readFileSync('tp.json')), ST = JSON.parse(fs.readFileSync('silk_done.json'));
const r = await run(`const out = []; for (const c of await eda.pcb_PrimitiveComponent.getAll()) { for (const a of await eda.pcb_PrimitiveAttribute.getAll(c.getState_PrimitiveId())) { const o = JSON.parse(JSON.stringify(a)); if (!o.valueVisible && !o.keyVisible) continue; const b = await eda.pcb_Primitive.getPrimitivesBBox([o.primitiveId]); out.push(["D:" + c.getState_Designator(), o.layer, b.minX, b.minY, b.maxX, b.maxY]); } } for (const s of await eda.pcb_PrimitiveString.getAll()) { const b = await eda.pcb_Primitive.getPrimitivesBBox([s.getState_PrimitiveId()]); out.push(["T:" + s.getState_Text(), s.getState_Layer(), b.minX, b.minY, b.maxX, b.maxY]); } return JSON.stringify(out);`);
fs.writeFileSync('silk_real.json', JSON.stringify(r));
const T = r.filter(x => x[1] === 3).map(x => ({ n: x[0], b: [x[2] * MIL, x[4] * MIL, x[3] * MIL, x[5] * MIL] }));
const pads = Object.entries(G).flatMap(([ref, o]) => o.P.map(p => ({ n: ref + '.' + p[0], b: [p[2] - p[4] / 2, p[2] + p[4] / 2, p[3] - p[5] / 2, p[3] + p[5] / 2] }))).concat(TP.map(t => ({ n: t[0], b: [t[2] - 0.75, t[2] + 0.75, t[3] - 0.75, t[3] + 0.75] })));
const bodies = Object.entries(G).map(([ref, o]) => ({ n: ref, b: o.B }));
const gap = (a, b) => Math.hypot(Math.max(0, a[0] - b[1], b[0] - a[1]), Math.max(0, a[2] - b[3], b[2] - a[3]));
const over = (a, b) => a[0] < b[1] && b[0] < a[1] && a[2] < b[3] && b[2] < a[3];
const P1 = [], P2 = [], P3 = [], P4 = [];
for (const t of T) {
  for (const p of pads) { const g = gap(t.b, p.b); if (g < 0.15) P1.push(`${t.n} / pastille ${p.n} (${g.toFixed(2)} mm)`); }
  for (const c of bodies) if (over(t.b, c.b)) P2.push(`${t.n} / corps ${c.n}`);
  if (t.b[0] < 0.3 || t.b[1] > 119.7 || t.b[2] < 0.3 || t.b[3] > 79.7) P4.push(`${t.n} bord`);
  for (const [hx, hy] of [[4, 4], [116, 4], [4, 76], [116, 76]]) if (gap(t.b, [hx, hx, hy, hy]) < 3.2) P4.push(`${t.n} trou`);
}
for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) if (gap(T[i].b, T[j].b) < 0.1 || over(T[i].b, T[j].b)) P3.push(`${T[i].n} / ${T[j].n}`);
console.log('textes relus sur la sérigraphie du dessus :', T.length, '; autres couches :', r.filter(x => x[1] !== 3).length);
console.log('texte à moins de 0,15 mm d\'une pastille :', P1.length, P1.slice(0, 12).join(' | '));
console.log('texte sur un corps de composant :', P2.length, P2.slice(0, 12).join(' | '));
console.log('textes qui se touchent :', P3.length, P3.slice(0, 12).join(' | '));
console.log('bord / trous :', P4.length, P4.slice(0, 8).join(' | '));
fs.writeFileSync('silk_issues.json', JSON.stringify({ P1, P2, P3, P4 }));
