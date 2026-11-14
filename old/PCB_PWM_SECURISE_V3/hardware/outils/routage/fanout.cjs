// Vias de liaison aux plans (fanout) pour les pastilles CMS de GND, GND_P, +3V3, +12V_P. Unités mm.
const fs = require('fs');
const MIL = 0.0254, CU = require('./cu.json'), G = require('./fine_geo.json');
const PLANE = process.env.CONLY ? { GND: 'C', '+3V3': 'C' } : { GND: 'C', '+3V3': 'C', GND_P: 'P', '+12V_P': 'P' };
const WID = { GND: 0.5, '+3V3': 0.5, GND_P: 1.0, '+12V_P': 1.0 };
const VR = 0.305, CLR = 0.2;
// Taille des pastilles : depuis le plan (même ordre de numéros)
const size = {}; for (const [r, o] of Object.entries(G)) for (const p of o.P) size[r + '.' + p[0]] = [p[4], p[5]];
const pads = CU.P.map(p => ({ ref: p[0], num: p[1], net: p[2] || '', x: p[3] * MIL, y: p[4] * MIL, top: p[5] === 1, tht: !!p[6], w: (size[p[0] + '.' + p[1]] || [1, 1])[0], h: (size[p[0] + '.' + p[1]] || [1, 1])[1] }));
for (const f of CU.F) if (/^TP/.test(f[0])) pads.push({ ref: f[0], num: '1', net: f[1], x: f[2] * MIL, y: f[3] * MIL, top: true, w: 1.5, h: 1.5 });
const segs = CU.L.map(l => ({ net: l[0], layer: l[1], a: [l[2] * MIL, l[3] * MIL], b: [l[4] * MIL, l[5] * MIL], w: l[6] * MIL }));
const vias = [];
// ONLY=R1,C2 : seulement les pastilles de ces composants ; les vias existants sont alors des obstacles
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;
if (ONLY) for (const v of CU.V) vias.push({ net: v[0], x: v[1] * MIL, y: v[2] * MIL });
const HOLES = [[4, 4], [116, 4], [4, 76], [116, 76]];
const KEEP = [[0.3, 37.2, 28, 30], [38.4, 55.2, 28, 30], [56.4, 119.7, 28, 30], [35.3, 37.2, 23.4, 28], [38.4, 40.3, 23.4, 28], [53.3, 55.2, 23.4, 28], [56.4, 58.3, 23.4, 28], [37.2, 38.4, 23.4, 30], [55.2, 56.4, 23.4, 30]];
const dRect = (x, y, p) => Math.hypot(Math.max(0, Math.abs(x - p.x) - p.w / 2), Math.max(0, Math.abs(y - p.y) - p.h / 2));
const dSeg = (x, y, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy; let t = L ? ((x - a[0]) * dx + (y - a[1]) * dy) / L : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy); };
// distance d'un segment épais à une pastille (échantillonnage)
const segToPad = (a, b, p) => { let m = 1e9; for (let t = 0; t <= 1.0001; t += 0.05) m = Math.min(m, dRect(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, p)); return m; };
function viaOk(x, y, net, dom) {
  if (x < 0.8 || x > 119.2 || y < 0.8 || y > 79.2) return false;
  if (dom === 'C' && y < 30.2 + VR) return false; if (dom === 'P' && y > 27.8 - VR) return false;
  for (const k of KEEP) if (x + VR > k[0] && x - VR < k[1] && y + VR > k[2] && y - VR < k[3]) return false;
  for (const [hx, hy] of HOLES) if (Math.hypot(x - hx, y - hy) < 1.6 + 0.5 + VR) return false;
  for (const p of pads) { const need = p.net === net ? (p.tht ? CLR : 0.15) : CLR; if (dRect(x, y, p) < VR + need) return false; }
  for (const s of segs) if (s.net !== net && dSeg(x, y, s.a, s.b) < VR + s.w / 2 + CLR) return false;
  for (const v of vias) if (Math.hypot(x - v.x, y - v.y) < 2 * VR + CLR) return false;
  return true;
}
function stubOk(p, x, y, w) {
  for (const q of pads) { if (q === p || q.net === p.net) continue; if (!q.top && !q.tht) continue; if (segToPad([p.x, p.y], [x, y], q) < w / 2 + CLR) return false; }
  for (const s of segs) if (s.net !== p.net && s.layer === 1) { for (let t = 0; t <= 1.0001; t += 0.05) if (dSeg(p.x + (x - p.x) * t, p.y + (y - p.y) * t, s.a, s.b) < w / 2 + s.w / 2 + CLR) return false; }
  for (const v of vias) if (v.net !== p.net) { for (let t = 0; t <= 1.0001; t += 0.05) if (Math.hypot(p.x + (x - p.x) * t - v.x, p.y + (y - p.y) * t - v.y) < w / 2 + VR + CLR) return false; }
  // le nouveau via ne doit pas toucher les raccords déjà posés des autres nets
  return true;
}
const todo = pads.filter(p => PLANE[p.net] && p.top && !p.tht && (!ONLY || ONLY.has(p.ref))).sort((a, b) => (Math.min(a.w, a.h) < 0.45 ? 0 : 1) - (Math.min(b.w, b.h) < 0.45 ? 0 : 1));
const out = [], fail = [];
for (const p of todo) {
  const fine = Math.min(p.w, p.h) < 0.45; const w = fine ? 0.2 : Math.min(WID[p.net], Math.max(0.3, Math.min(p.w, p.h))); let best = null;
  for (let d = VR + 0.15; d <= (fine ? 6 : 3.5) && !best; d += 0.1) for (let a = 0; a < 360 && !best; a += 15) {
    const ex = Math.max(p.w, p.h) / 2; const r = d + (Math.abs(Math.cos(a * Math.PI / 180)) > 0.7 ? p.w / 2 : p.h / 2) * 0 + 0;
    const x = p.x + (d + (Math.abs(Math.cos(a * Math.PI / 180)) * p.w / 2 + Math.abs(Math.sin(a * Math.PI / 180)) * p.h / 2)) * Math.cos(a * Math.PI / 180);
    const y = p.y + (d + (Math.abs(Math.cos(a * Math.PI / 180)) * p.w / 2 + Math.abs(Math.sin(a * Math.PI / 180)) * p.h / 2)) * Math.sin(a * Math.PI / 180);
    if (viaOk(x, y, p.net, PLANE[p.net]) && stubOk(p, x, y, w)) best = { x, y, w };
  }
  if (!best) { fail.push(p.ref + '.' + p.num + '(' + p.net + ')'); continue; }
  vias.push({ x: best.x, y: best.y, net: p.net }); segs.push({ net: p.net, layer: 1, a: [p.x, p.y], b: [best.x, best.y], w: best.w });
  out.push({ ref: p.ref, num: p.num, net: p.net, px: p.x, py: p.y, vx: +best.x.toFixed(3), vy: +best.y.toFixed(3), w: best.w });
}
fs.writeFileSync('fanout_plan.json', JSON.stringify(out));
console.log('pastilles CMS sur plan :', todo.length, '; vias placés :', out.length, '; sans place :', fail.length, fail.join(' '));
const L = out.map(o => Math.hypot(o.vx - o.px, o.vy - o.py)); console.log('longueur du raccord : moyenne', (L.reduce((a, b) => a + b, 0) / L.length).toFixed(2), 'mm, max', Math.max(...L).toFixed(2), 'mm');
