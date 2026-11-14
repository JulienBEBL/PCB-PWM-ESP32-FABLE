// Routeur sur grille (A*) pour quelques nets : couches 1 (dessus), 2 (dessous), 16 (L3). Unités mm, pas 0,1 mm.
const fs = require('fs');
const MIL = 0.0254, S = 0.05, W = 120, H = 80, NX = W / S + 1 | 0, NY = H / S + 1 | 0;
const CU = require('./cu2.json'), G = require('./fine_geo.json'), CUP = require('./cu.json'), TP = require('./tp.json');
const NETS = JSON.parse(process.argv[2]);
const TW = 0.2, CLR = 0.2, VR = 0.305;
const ZONES = [[49, 65, 36.5, 60], [6.5, 14.5, 65.5, 73], [31.5, 38.5, 60.5, 67.5]];
const clrAt = (x, y) => ZONES.some(z => x >= z[0] && x <= z[1] && y >= z[2] && y <= z[3]) ? 0.15 : CLR;
const LAY = [1, 2, 16], LI = { 1: 0, 2: 1, 16: 2 };
// pastilles : couche (CMS dessus ou traversante) depuis cu.json
const padLayer = {}; for (const p of CUP.P) padLayer[p[0] + '.' + p[1]] = p[6] ? 'all' : (p[5] === 1 ? 'top' : p[5] === 2 ? 'bot' : 'all');
const pads = []; for (const [ref, o] of Object.entries(G)) for (const p of o.P) pads.push({ ref, num: p[0], net: p[1] || '', x: p[2], y: p[3], w: p[4], h: p[5], lay: padLayer[ref + '.' + p[0]] || 'top' });
for (const t of TP) pads.push({ ref: t[0], num: '1', net: t[1], x: t[2], y: t[3], w: 1.5, h: 1.5, lay: 'top' });
const segs = CU.L.map(l => ({ net: l[0], layer: l[1], a: [l[2] * MIL, l[3] * MIL], b: [l[4] * MIL, l[5] * MIL], w: l[6] * MIL }));
const vias = CU.V.map(v => ({ net: v[0], x: v[1] * MIL, y: v[2] * MIL, r: v[3] * MIL / 2 }));
const KEEP = [[0.3, 37.2, 28, 30], [38.4, 55.2, 28, 30], [56.4, 119.7, 28, 30]];
const HOLES = [[4, 4], [116, 4], [4, 76], [116, 76]];
const idx = (i, j) => j * NX + i;
function buildBlock(net) {
  const B = [new Uint8Array(NX * NY), new Uint8Array(NX * NY), new Uint8Array(NX * NY)];
  const markBox = (l, x0, x1, y0, y1) => { const i0 = Math.max(0, Math.floor(x0 / S)), i1 = Math.min(NX - 1, Math.ceil(x1 / S)), j0 = Math.max(0, Math.floor(y0 / S)), j1 = Math.min(NY - 1, Math.ceil(y1 / S)); for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) B[l][idx(i, j)] = 1; };
  const markDisk = (l, x, y, r) => { const i0 = Math.max(0, Math.floor((x - r) / S)), i1 = Math.min(NX - 1, Math.ceil((x + r) / S)), j0 = Math.max(0, Math.floor((y - r) / S)), j1 = Math.min(NY - 1, Math.ceil((y + r) / S)); for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (Math.hypot(i * S - x, j * S - y) <= r) B[l][idx(i, j)] = 1; };
  const inf = TW / 2 + CLR;
  for (let l = 0; l < 3; l++) { markBox(l, 0, W, 0, 0.5 + inf); markBox(l, 0, W, H - 0.5 - inf, H); markBox(l, 0, 0.5 + inf, 0, H); markBox(l, W - 0.5 - inf, W, 0, H); for (const k of KEEP) markBox(l, k[0] - inf, k[1] + inf, k[2] - inf, k[3] + inf); for (const [hx, hy] of HOLES) markDisk(l, hx, hy, 1.6 + 0.5 + inf); }
  for (const p of pads) { if (p.net === net) continue; const f = TW / 2 + clrAt(p.x, p.y); const ls = p.lay === 'all' ? [0, 1, 2] : p.lay === 'top' ? [0] : [1]; for (const l of ls) markBox(l, p.x - p.w / 2 - f, p.x + p.w / 2 + f, p.y - p.h / 2 - f, p.y + p.h / 2 + f); }
  for (const s of segs) { if (s.net === net || LI[s.layer] === undefined) continue; const l = LI[s.layer]; const L = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]); const n = Math.max(1, Math.ceil(L / 0.05)); for (let k = 0; k <= n; k++) { const x = s.a[0] + (s.b[0] - s.a[0]) * k / n, y = s.a[1] + (s.b[1] - s.a[1]) * k / n; markDisk(l, x, y, s.w / 2 + TW / 2 + clrAt(x, y)); } }
  for (const v of vias) { if (v.net === net) continue; for (let l = 0; l < 3; l++) markDisk(l, v.x, v.y, v.r + TW / 2 + clrAt(v.x, v.y)); }
  // domaine commande seulement : rien sous y = 30,2
  for (let l = 0; l < 3; l++) markBox(l, 0, W, 0, 30.2 + inf);
  return B;
}
function layersOf(net, e) { if (e[2] === 'SMD Pad') return [0]; if (e[2] === 'TH Pad' || e[2] === 'Via') return [0, 1, 2]; let best = null; for (const sg of segs) if (sg.net === net && LI[sg.layer] !== undefined) { const d = Math.min(Math.hypot(sg.a[0] - e[0], sg.a[1] - e[1]), Math.hypot(sg.b[0] - e[0], sg.b[1] - e[1])); if (!best || d < best[0]) best = [d, LI[sg.layer]]; } return best ? [best[1]] : [0]; }
function route(net, ends) {
  const P = pads.filter(p => p.net === net); if (!ends && P.length < 2) return null;
  const B = buildBlock(net);
  if (ends) { const disk = (e, ls, r) => { const c = []; for (let j = Math.round((e[1] - r) / S); j <= Math.round((e[1] + r) / S); j++) for (let i = Math.round((e[0] - r) / S); i <= Math.round((e[0] + r) / S); i++) if (Math.hypot(i * S - e[0], j * S - e[1]) <= r) for (const l of ls) c.push([l, i, j]); return c; }; const sc = disk(ends[0], layersOf(net, ends[0]), 0.12), tc = disk(ends[1], layersOf(net, ends[1]), 0.12); for (const [l, i, j] of [...sc, ...tc]) B[l][idx(i, j)] = 0; return astar(net, B, sc, new Set(tc.map(([l, i, j]) => l * NX * NY + idx(i, j))), ends); }
  return routePads(net, B, P);
}
function routePads(net, B, P) {
  // libérer les pastilles du net (point de départ/arrivée)
  const tgt = new Set(); const src = [];
  const padCells = (p, l) => { const c = []; for (let j = Math.ceil((p.y - p.h / 2) / S); j <= Math.floor((p.y + p.h / 2) / S); j++) for (let i = Math.ceil((p.x - p.w / 2) / S); i <= Math.floor((p.x + p.w / 2) / S); i++) c.push([l, i, j]); return c; };
  const [a, ...rest] = P; const la = a.lay === 'bot' ? 1 : 0;
  for (const [l, i, j] of padCells(a, la)) { B[l][idx(i, j)] = 0; src.push([l, i, j]); }
  for (const p of rest) { const ls = p.lay === 'all' ? [0, 1] : p.lay === 'bot' ? [1] : [0]; for (const l of ls) for (const [, i, j] of padCells(p, l)) { B[l][idx(i, j)] = 0; tgt.add(l * NX * NY + idx(i, j)); } }
  return astar(net, B, src, tgt, null);
}
function astar(net, B, src, tgt, ends) {
  // A* 3D (8 directions + via)
  const N = NX * NY * 3, g = new Float32Array(N).fill(Infinity), prev = new Int32Array(N).fill(-1);
  const heap = []; const push = (k, f) => { heap.push([f, k]); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const t = heap[0], e = heap.pop(); if (heap.length) { heap[0] = e; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return t; };
  const T = [...tgt].map(k => [k % (NX * NY) % NX, Math.floor(k % (NX * NY) / NX)]); const tx = T.reduce((s, t) => s + t[0], 0) / T.length, ty = T.reduce((s, t) => s + t[1], 0) / T.length;
  const h = (i, j) => Math.hypot(i - tx, j - ty) * S;
  for (const [l, i, j] of src) { const k = l * NX * NY + idx(i, j); g[k] = 0; push(k, h(i, j)); }
  const D = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const viaR = Math.ceil((VR - TW / 2) / S);
  const viaOk = (i, j) => { for (let l = 0; l < 3; l++) for (let dj = -viaR; dj <= viaR; dj++) for (let di = -viaR; di <= viaR; di++) { if (di * di + dj * dj > viaR * viaR) continue; const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= NX || jj >= NY || B[l][idx(ii, jj)]) return false; } return true; };
  let found = -1, it = 0;
  while (heap.length && it++ < 3e7) {
    const [, k] = pop(); if (tgt.has(k)) { found = k; break; }
    const l = Math.floor(k / (NX * NY)), c = k % (NX * NY), i = c % NX, j = Math.floor(c / NX);
    for (const [di, dj] of D) { const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= NX || jj >= NY) continue; const c2 = idx(ii, jj); if (B[l][c2]) continue; const k2 = l * NX * NY + c2; const cost = g[k] + Math.hypot(di, dj) * S * (l === 2 ? 1.5 : 1); if (cost < g[k2]) { g[k2] = cost; prev[k2] = k; push(k2, cost + h(ii, jj)); } }
    for (const l2 of [0, 1, 2]) { if (l2 === l) continue; const k2 = l2 * NX * NY + c; if (B[l2][c]) continue; const cost = g[k] + 3; if (cost < g[k2] && viaOk(i, j)) { g[k2] = cost; prev[k2] = k; push(k2, cost + h(i, j)); } }
  }
  if (found < 0) return { net, ok: false };
  const path = []; for (let k = found; k >= 0; k = prev[k]) { const l = Math.floor(k / (NX * NY)), c = k % (NX * NY); path.push([LAY[l], (c % NX) * S, Math.floor(c / NX) * S]); }
  path.reverse();
  // segments simplifiés + vias
  const out = { net, ok: true, segs: [], vias: [] }; let start = path[0];
  for (let n = 1; n < path.length; n++) {
    const p = path[n], q = path[n - 1];
    if (p[0] !== q[0]) { if (start[1] !== q[1] || start[2] !== q[2]) out.segs.push([q[0], start[1], start[2], q[1], q[2]]); out.vias.push([q[1], q[2]]); start = p; continue; }
    const nx = path[n + 1]; const turn = !nx || nx[0] !== p[0] || Math.sign(nx[1] - p[1]) !== Math.sign(p[1] - q[1]) || Math.sign(nx[2] - p[2]) !== Math.sign(p[2] - q[2]);
    if (turn) { out.segs.push([p[0], start[1], start[2], p[1], p[2]]); start = p; }
  }
  // raccord exact aux centres des pastilles de départ et d'arrivée
  if (!out.segs.length) { const a = path[0], b = path[path.length - 1]; out.segs.push([a[0], a[1], a[2], b[1], b[2]]); }
  const f = out.segs[0], e = out.segs[out.segs.length - 1];
  if (ends) { out.segs.unshift([f[0], ends[0][0], ends[0][1], f[1], f[2]]); out.segs.push([e[0], e[3], e[4], ends[1][0], ends[1][1]]); }
  else { const pd = (x, y) => pads.filter(p => p.net === net).sort((u, v) => Math.hypot(u.x - x, u.y - y) - Math.hypot(v.x - x, v.y - y))[0]; const p0 = pd(f[1], f[2]), p1 = pd(e[3], e[4]); out.segs.unshift([f[0], p0.x, p0.y, f[1], f[2]]); out.segs.push([e[0], e[3], e[4], p1.x, p1.y]); }
  out.len = out.segs.reduce((s, z) => s + Math.hypot(z[3] - z[1], z[4] - z[2]), 0);
  // ajoute au cuivre pour le net suivant
  for (const z of out.segs) segs.push({ net, layer: z[0], a: [z[1], z[2]], b: [z[3], z[4]], w: TW }); for (const v of out.vias) vias.push({ net, x: v[0], y: v[1], r: VR });
  return out;
}
const res = process.env.PAIRS ? JSON.parse(fs.readFileSync('pairs.json')).map(([n, a, b]) => route(n, [a, b])) : NETS.map(n => route(n));
fs.writeFileSync('gridroute_out.json', JSON.stringify(res));
for (const r of res) console.log(r.net, r.ok ? `ok : ${r.segs.length} segments, ${r.vias.length} vias, ${r.len.toFixed(1)} mm` : 'ÉCHEC');
if (process.env.DBG) {
  const net = process.env.DBG; const B = buildBlock(net); const P = pads.filter(p => p.net === net);
  for (const p of P) { const l = p.lay === 'bot' ? 1 : 0; let free = 0, tot = 0; for (let j = Math.ceil((p.y - p.h / 2) / S); j <= Math.floor((p.y + p.h / 2) / S); j++) for (let i = Math.ceil((p.x - p.w / 2) / S); i <= Math.floor((p.x + p.w / 2) / S); i++) { tot++; if (!B[l][idx(i, j)]) free++; }
    // anneau à 0,4 mm autour de la pastille
    let ring = 0; for (let a = 0; a < 360; a += 10) { const x = p.x + (p.w / 2 + 0.4) * Math.cos(a * Math.PI / 180), y = p.y + (p.h / 2 + 0.4) * Math.sin(a * Math.PI / 180); const i = Math.round(x / S), j = Math.round(y / S); if (!B[l][idx(i, j)]) ring++; }
    console.log(net, p.ref + '.' + p.num, p.lay, 'cases pastille libres', free + '/' + tot, '; points libres autour', ring + '/36'); }
}
