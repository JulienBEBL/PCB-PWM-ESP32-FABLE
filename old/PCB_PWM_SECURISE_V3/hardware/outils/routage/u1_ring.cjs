// Re-placement local autour de U1 (côté commande) par relaxation : couronne libre autour des broches de U1,
// les voisins sont poussés en cascade. Entrée : pcb_bbox.json (boîtes réelles, mil). Sortie : u1_ring_moves.json [{ref, dx, dy}] (mm).
const fs = require('fs');
const MIL = 0.0254;
const B = require('./pcb_bbox.json').map(b => ({ ref: b[0], x0: b[4] * MIL, x1: b[6] * MIL, y0: b[5] * MIL, y1: b[7] * MIL }));
const U = [50.5, 61.5, 46.5, 57.5];                 // boîte des broches de U1 (mm)
const UC = [(U[0] + U[1]) / 2, (U[2] + U[3]) / 2];
const GOAL = +(process.env.GOAL || 2.2), GOALD = +(process.env.GOALD || 1.5);
const CL = +(process.env.CL || 0.6), RAD = +(process.env.RAD || 20);
const DEC = new Set(['C201', 'C202', 'C203', 'C204', 'C205']);
const isFixed = r => /^(U1|U3|J|K|LED|LS|TP|MH)/.test(r) && r !== 'U1x';
const HOLES = [[4, 4], [116, 4], [4, 76], [116, 76]];
const P = Object.fromEntries(B.map(b => [b.ref, { ...b, dx: 0, dy: 0 }]));
const cen = b => [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2];
const mov = Object.values(P).filter(b => !isFixed(b.ref) && b.y0 > 31 && Math.hypot(cen(b)[0] - UC[0], cen(b)[1] - UC[1]) < RAD);
const shift = (b, dx, dy) => { b.x0 += dx; b.x1 += dx; b.y0 += dy; b.y1 += dy; b.dx += dx; b.dy += dy; };
const dU = b => Math.hypot(Math.max(0, U[0] - b.x1, b.x0 - U[1]), Math.max(0, U[2] - b.y1, b.y0 - U[3]));
const MOV = new Set(mov.map(b => b.ref));
let it, viol;
for (it = 0; it < 3000; it++) {
  viol = 0;
  for (const b of mov) {
    // couronne U1 : sortie selon la normale du côté le plus proche
    const g = DEC.has(b.ref) ? GOALD : GOAL, d = dU(b);
    if (d < g - 1e-3) { viol++; const gaps = [[U[0] - b.x1, -1, 0], [b.x0 - U[1], 1, 0], [U[2] - b.y1, 0, -1], [b.y0 - U[3], 0, 1]].sort((a, c) => c[0] - a[0])[0]; const s = Math.min(0.1, g - Math.max(gaps[0], 0)); shift(b, gaps[1] * s, gaps[2] * s); }
    // bords et domaine commande (y ≥ 31,2), trous
    if (b.x0 < 0.5) shift(b, 0.5 - b.x0, 0); if (b.x1 > 119.5) shift(b, 119.5 - b.x1, 0); if (b.y1 > 79.5) shift(b, 0, 79.5 - b.y1); if (b.y0 < 31.2) shift(b, 0, 31.2 - b.y0);
  }
  for (const a of mov) for (const o of Object.values(P)) {
    if (o === a) continue;
    const ox = Math.min(a.x1 + CL - o.x0, o.x1 + CL - a.x0), oy = Math.min(a.y1 + CL - o.y0, o.y1 + CL - a.y0);
    if (ox <= 1e-3 || oy <= 1e-3) continue;
    viol++;
    const both = MOV.has(o.ref), f = both ? 0.5 : 1, [ax, ay] = cen(a), [bx, by] = cen(o);
    if (ox < oy) { const s = Math.min(0.1, ox) * f * (ax < bx ? -1 : 1); shift(a, s, 0); if (both) shift(o, -s, 0); }
    else { const s = Math.min(0.1, oy) * f * (ay < by ? -1 : 1); shift(a, 0, s); if (both) shift(o, 0, -s); }
  }
  if (!viol) break;
}
const res = []; for (const a of mov) for (const o of Object.values(P)) { if (o === a || (MOV.has(o.ref) && o.ref < a.ref)) continue; const ox = Math.min(a.x1 + CL - o.x0, o.x1 + CL - a.x0), oy = Math.min(a.y1 + CL - o.y0, o.y1 + CL - a.y0); if (ox > 0.01 && oy > 0.01) res.push(a.ref + '/' + o.ref + ' ' + Math.min(ox, oy).toFixed(2)); } console.log('chevauchements résiduels :', res.join(', ') || 'aucun');
const moves = mov.filter(b => Math.hypot(b.dx, b.dy) > 0.05).map(b => ({ ref: b.ref, dx: +b.dx.toFixed(2), dy: +b.dy.toFixed(2) }));
const holeKo = mov.filter(b => HOLES.some(([hx, hy]) => Math.hypot(Math.max(b.x0 - hx, 0, hx - b.x1), Math.max(b.y0 - hy, 0, hy - b.y1)) < 3.5)).map(b => b.ref);
fs.writeFileSync('u1_ring_moves.json', JSON.stringify(moves));
console.log('itérations', it, '; violations restantes', viol, '; trous', holeKo.join(',') || 'aucun', '; composants déplacés', moves.length, '; déplacement max', Math.max(...moves.map(m => Math.hypot(m.dx, m.dy))).toFixed(2), 'mm');
console.log(moves.map(m => `${m.ref} (${m.dx}, ${m.dy})`).join(' '));
console.log('couronne U1 mini :', Math.min(...mov.filter(b => !DEC.has(b.ref)).map(dU)).toFixed(2), 'mm ; découplages :', [...DEC].map(r => r + ' ' + dU(P[r]).toFixed(2)).join(', '));
