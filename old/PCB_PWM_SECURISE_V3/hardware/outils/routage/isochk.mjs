// Isolement commande / puissance sur tout le cuivre (pastilles, pistes, vias). Exception : pastilles d'un même composant de barrière.
import { run } from './eda.mjs';
import fs from 'fs';
const MIL = 0.0254, G = JSON.parse(fs.readFileSync('fine_geo.json'));
const PSET = new Set(['+12V_IN','GND_P','+12V_F','LM_EN','LM_VCAP','LM_GATE','LM_SRC','+12V_P','LM_OV','NO_FEED','VERIN_A','VERIN_B','MOT_RET','U6_A','U7_A','+5V_ISO','AMC_INP','AMC_INN']);
const dom = n => !n ? null : PSET.has(n) ? 'P' : 'C';
const r = await run(`await eda.dmt_EditorControl.activateDocument("9e5b12b9217a84a5@b4788f45338c4e59bfcfdff2832a8063"); await new Promise(q => setTimeout(q, 1200)); const L = (await eda.pcb_PrimitiveLine.getAll()).filter(l => [1, 2, 15, 16].includes(l.getState_Layer())).map(l => [l.getState_Net(), l.getState_Layer(), l.getState_StartX(), l.getState_StartY(), l.getState_EndX(), l.getState_EndY(), l.getState_LineWidth()]); const V = (await eda.pcb_PrimitiveVia.getAll()).map(v => [v.getState_Net(), v.getState_X(), v.getState_Y(), v.getState_Diameter()]); return JSON.stringify({L, V});`);
const items = [];
for (const [ref, o] of Object.entries(G)) for (const p of o.P) if (p[1]) items.push({ k: 'pad', ref, n: p[1], d: dom(p[1]), box: [p[2] - p[4] / 2, p[2] + p[4] / 2, p[3] - p[5] / 2, p[3] + p[5] / 2] });
const TP = JSON.parse(fs.readFileSync('tp.json')); for (const t of TP) items.push({ k: 'pad', ref: t[0], n: t[1], d: dom(t[1]), box: [t[2] - 0.75, t[2] + 0.75, t[3] - 0.75, t[3] + 0.75] });
for (const v of r.V) { const x = v[1] * MIL, y = v[2] * MIL, rr = v[3] * MIL / 2; items.push({ k: 'via', n: v[0], d: dom(v[0]), c: [x, y], r: rr, box: [x - rr, x + rr, y - rr, y + rr] }); }
for (const l of r.L) { const a = [l[2] * MIL, l[3] * MIL], b = [l[4] * MIL, l[5] * MIL], w = l[6] * MIL / 2; items.push({ k: 'piste', n: l[0], d: dom(l[0]), a, b, r: w, box: [Math.min(a[0], b[0]) - w, Math.max(a[0], b[0]) + w, Math.min(a[1], b[1]) - w, Math.max(a[1], b[1]) + w] }); }
// distance entre deux objets : échantillonnage des pistes, boîtes pour les pastilles
const pts = o => { if (o.k === 'piste') { const P = []; const L = Math.hypot(o.b[0] - o.a[0], o.b[1] - o.a[1]); const n = Math.max(1, Math.ceil(L / 0.1)); for (let i = 0; i <= n; i++) P.push([o.a[0] + (o.b[0] - o.a[0]) * i / n, o.a[1] + (o.b[1] - o.a[1]) * i / n]); return P; } return null; };
const dPtBox = (x, y, b) => Math.hypot(Math.max(0, b[0] - x, x - b[1]), Math.max(0, b[2] - y, y - b[3]));
function dist(a, b) {
  const pa = pts(a), pb = pts(b);
  if (!pa && !pb) { if (a.k === 'via' && b.k === 'via') return Math.hypot(a.c[0] - b.c[0], a.c[1] - b.c[1]) - a.r - b.r; if (a.k === 'via') return dPtBox(a.c[0], a.c[1], b.box) - a.r; if (b.k === 'via') return dPtBox(b.c[0], b.c[1], a.box) - b.r; return Math.hypot(Math.max(0, a.box[0] - b.box[1], b.box[0] - a.box[1]), Math.max(0, a.box[2] - b.box[3], b.box[2] - a.box[3])); }
  let m = 1e9; const A = pa || [[...(a.c || [])]], rA = pa ? a.r : 0;
  if (pa && pb) { for (const p of pa) for (const q of pb) m = Math.min(m, Math.hypot(p[0] - q[0], p[1] - q[1]) - a.r - b.r); return m; }
  const [s, o] = pa ? [a, b] : [b, a]; for (const p of pts(s)) { const d = o.k === 'via' ? Math.hypot(p[0] - o.c[0], p[1] - o.c[1]) - o.r : dPtBox(p[0], p[1], o.box); m = Math.min(m, d - s.r); } return m;
}
const C = items.filter(i => i.d === 'C'), P = items.filter(i => i.d === 'P');
const bad = []; let min = [1e9];
for (const a of C) for (const b of P) {
  if (a.k === 'pad' && b.k === 'pad' && a.ref === b.ref) continue; // dans un composant de barrière
  if (a.box[0] > b.box[1] + 2.5 || b.box[0] > a.box[1] + 2.5 || a.box[2] > b.box[3] + 2.5 || b.box[2] > a.box[3] + 2.5) continue;
  const d = dist(a, b); const lab = x => x.k + ' ' + (x.ref ? x.ref + ' ' : '') + x.n; if (d < min[0]) min = [d, lab(a), lab(b)]; if (d < 2) bad.push(`${lab(a)} / ${lab(b)} : ${d.toFixed(2)} mm`);
}
console.log('objets commande', C.length, 'puissance', P.length, '; isolement mini', min[0].toFixed(2), 'mm', min[1], '/', min[2]);
console.log('violations < 2 mm :', bad.length, bad.slice(0, 15).join(' | '));
