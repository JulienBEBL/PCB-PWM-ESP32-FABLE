// Placement fin (G4) : ancres manuelles + passifs attirés vers leurs broches. Unités internes : mm, y vers le haut.
const fs = require('fs');
const MIL = 0.0254, W = 120, H = 80;
const pads = require('./pcb_pads_r0.json');          // [ref, num, net, xabs, yabs] (mil)
const comps = require('./pcb_comps_r0.json');        // pads relatifs + tailles (mil), même ordre
const bbx = Object.fromEntries(require('./pcb_bbox_r0.json').map(b => [b[0], b]));
const PSET = new Set(['+12V_IN','GND_P','+12V_F','LM_EN','LM_VCAP','LM_GATE','LM_SRC','+12V_P','LM_OV','NO_FEED','VERIN_A','VERIN_B','MOT_RET','U6_A','U7_A','+5V_ISO','AMC_INP','AMC_INN']);
const POW = new Set(['GND','GND_P','+3V3','+5V','+12V_P','+5V_ISO','+3V3_EXT']);
const BARRIER = ['U9','K1','K2','U6','U7'];
let curCLR = 0.25;
const TIGHT = new Set(['D1','F1','D9','R301','R302','C301','U11','U12','D11','D12','D13','D14','U14','U15','C107','F2','D2','U5','Q8','Q9','D8','C501','C502','C505','D3','D17','C201','C205','Y1']);
const YDIV = 29, CLR = +(process.env.CLR || 0.6), DOMGAP = 2.0;
const HOLES = [[4,4],[116,4],[4,76],[116,76]], HR = 3.5;

// Composants : pastilles relatives (mm), boîte englobante relative (mm), domaine
const C = {};
for (const c of comps) {
  const b = bbx[c.ref];
  const pp = pads.filter(p => p[0] === c.ref);
  C[c.ref] = {
    ref: c.ref, id: c.id,
    pads: pp.map((p, i) => ({ num: p[1], net: p[2], x: (p[3] - b[1]) * MIL, y: (p[4] - b[2]) * MIL, w: c.pads[i][2] * MIL, h: c.pads[i][3] * MIL })),
    bb: [(b[4] - b[1]) * MIL, (b[6] - b[1]) * MIL, (b[5] - b[2]) * MIL, (b[7] - b[2]) * MIL], // x0 x1 y0 y1
  };
  const nets = C[c.ref].pads.map(p => p.net).filter(Boolean);
  C[c.ref].dom = BARRIER.includes(c.ref) ? 'B' : nets.some(n => PSET.has(n)) ? 'P' : 'C';
}
const rot = (x, y, r) => r === 0 ? [x, y] : r === 90 ? [-y, x] : r === 180 ? [-x, -y] : [y, -x];
const geo = (c, x, y, r) => {
  const P = c.pads.map(p => { const [a, b] = rot(p.x, p.y, r); const sw = r % 180 ? [p.h, p.w] : [p.w, p.h]; return { ...p, X: x + a, Y: y + b, W: sw[0], H: sw[1] }; });
  const cs = [[c.bb[0], c.bb[2]], [c.bb[1], c.bb[2]], [c.bb[0], c.bb[3]], [c.bb[1], c.bb[3]]].map(([a, b]) => rot(a, b, r));
  return { P, B: [x + Math.min(...cs.map(v => v[0])), x + Math.max(...cs.map(v => v[0])), y + Math.min(...cs.map(v => v[1])), y + Math.max(...cs.map(v => v[1]))] };
};
const padDom = (c, p) => !p.net ? null : PSET.has(p.net) ? 'P' : 'C';
const placed = {}; // ref -> {x,y,r,P,B}
const allPads = () => Object.entries(placed).filter(([ref]) => !ref.startsWith('_')).flatMap(([ref, g]) => g.P.map(p => ({ ...p, ref, dom: padDom(C[ref], p) })));
let PADS = [];
function ok(c, g) {
  const cl = curCLR === 0.25 || TIGHT.has(c.ref) ? 0.25 : CLR;
  const [x0, x1, y0, y1] = g.B;
  if (x0 < 0.3 || x1 > W - 0.3 || y0 < 0.3 || y1 > H - 0.3) return false;
  for (const [hx, hy] of HOLES) { const dx = Math.max(x0 - hx, 0, hx - x1), dy = Math.max(y0 - hy, 0, hy - y1); if (dx * dx + dy * dy < HR * HR) return false; }
  if (c.dom === 'C' && y0 < YDIV + DOMGAP / 2) return false;
  if (c.dom === 'P' && y1 > YDIV - DOMGAP / 2) return false;
  for (const o of Object.values(placed)) { const b = o.B; if (x0 < b[1] + cl && b[0] < x1 + cl && y0 < b[3] + cl && b[2] < y1 + cl) return false; }
  for (const p of g.P) { const d = padDom(c, p); if (!d) continue; for (const q of PADS) { if (!q.dom || q.dom === d) continue; const dx = Math.max(0, Math.abs(p.X - q.X) - (p.W + q.W) / 2), dy = Math.max(0, Math.abs(p.Y - q.Y) - (p.H + q.H) / 2); if (dx * dx + dy * dy < DOMGAP * DOMGAP) return false; } }
  return true;
}
const put = (ref, x, y, r, force) => { const c = C[ref], g = geo(c, x, y, r); if (!force && !ok(c, g)) throw new Error('ancre refusée ' + ref + ' ' + JSON.stringify(g.B.map(v => +v.toFixed(1)))); placed[ref] = { x, y, r, ...g }; PADS = allPads(); };
// Rotation d'un composant de barrière : broches commande en haut
const upRot = ref => [0, 90, 180, 270].map(r => { const g = geo(C[ref], 0, 0, r); const m = d => { const v = g.P.filter(p => padDom(C[ref], p) === d && p.num !== '8'); return v.reduce((s, p) => s + p.Y, 0) / v.length; }; return [m('C') - m('P'), r]; }).sort((a, b) => b[0] - a[0])[0][1];

// 1. Ancres
const edgeRow = (refs, yEdge, x0, gap, top, rots = {}) => { let x = x0; for (const ref of refs) { const r = rots[ref] ?? 0; const g = geo(C[ref], 0, 0, r); const w = g.B[1] - g.B[0]; const cx = x - g.B[0]; const cy = top ? yEdge - g.B[3] : yEdge - g.B[2]; put(ref, cx, cy, r); x += w + gap; } return x; };
const endTop = edgeRow(['J12', 'J1', 'J4', 'J5', 'J8'], H - 0.4, 8.0, 1.6, true, { J12: 180, J1: 180, J4: 180, J5: 180 });
// Barrettes Dupont juste derrière leur bornier
for (const [d, t] of [['J13', 'J1'], ['J14', 'J4'], ['J15', 'J5']]) { const g = geo(C[d], 0, 0, 180); put(d, placed[t].x, placed[t].B[2] - 6.0 - g.B[3], 180); }
put('J2', 14, 0, 0, true); delete placed.J2; // calcul de hauteur seulement
const bottom = (ref, cx) => { const g = geo(C[ref], 0, 0, 0); put(ref, cx, 0.4 - g.B[2], 0); };
for (const d of ['J13', 'J14', 'J15', 'J8']) { const b = placed[d].B; placed['_LBL_' + d] = { x: 0, y: 0, r: 0, P: [], B: [b[0], b[1], b[2] - 3.3, b[2] - 0.05] }; }
bottom('J2', 18); bottom('J3', 43); bottom('J6', 86);
for (const [ref, x] of [['U9', 13], ['K1', 34], ['K2', 52], ['U6', 72], ['U7', 88]]) put(ref, x, YDIV, upRot(ref));
put('U1', 56, 52, 0);
put('J9', 0, 0, 90, true); { const g = placed.J9.B; delete placed.J9; put('J9', 0.4 - g[0], 53.5, 90); }
put('J10', 0, 0, 90, true); { const g = placed.J10.B; delete placed.J10; put('J10', 0.4 - g[0], 41.5, 90); }
put('U13', 16, 62, 0);
put('LS1', 100, 52, 0);
{ const g = geo(C.J7, 0, 0, 90); put('J7', W - 0.4 - g.B[1], 43, 90); }
for (const [i, ref] of ['LED5','LED1','LED2','LED3','LED4'].entries()) { const g0 = geo(C[ref], 0, 0, 90); put(ref, W - 0.6 - g0.B[1], 70 - i * 3.9, 90); }

// Côté puissance et barrière figés à leur position routée
if (process.env.FREEZE) { const OLD = require('./fine_plan_routed.json'); for (const o of OLD) { if (placed[o.ref] || C[o.ref].dom === 'C') continue; put(o.ref, o.x * MIL, o.y * MIL, o.r, true); } }
curCLR = CLR;
// 2. Attraction : centre de gravité des broches déjà placées sur les mêmes nets, poids 1 / (taille du net)
const netSize = {}; for (const p of pads) if (p[2]) netSize[p[2]] = (netSize[p[2]] || 0) + 1;
const ICs = ['U1','U2','U3','U4','U5','U8','U9','U10','U11','U12','U13','U14','U15','U16','K1','K2','U6','U7','LS1'];
const usedPin = {};
const TGT = { U11: ['J4','3'], U12: ['J5','3'], D9: ['J1','3'], D10: ['J1','4'], C201: ['U1','6'], C202: ['U1','5'], C203: ['U1','4'], C204: ['U1','5'], C205: ['U1','10'], F1: ['J1','1'], D1: ['J1','1'], U15: ['J1','1'], C107: ['J1','1'], U2: ['J1','1'], U16: ['J12','B4A9'], F2: ['J2','1'], D2: ['J2','1'], U5: ['J2','1'], Q8: ['J2','1'], Q9: ['J2','1'], D8: ['J2','1'], C505: ['J3','1'], D3: ['J3','2'], D17: ['J6','3'], D4: ['K1','8'], D5: ['K2','8'], Q3: ['K1','8'], Q4: ['K1','8'], Q5: ['K2','8'], Q6: ['K2','8'], U4: ['K2','1'], C206: ['Y1','1'], C207: ['Y1','3'], R426: ['LED5','2'], U8: ['U9','1'], U10: ['U9','7'], R509: ['U9','2'], R510: ['U9','3'], C514: ['U9','2'] };
function target(ref) {
  const c = C[ref];
  if (TGT[ref]) { const [a, n] = TGT[ref]; const q = placed[a].P.find(p => p.num === n); return [q.X, q.Y]; } const sig = c.pads.filter(p => p.net && !POW.has(p.net));
  if (sig.length === 0) { // découplage : broche d'alimentation d'un CI déjà placé, la plus proche des autres découplages libres
    let best = null;
    for (const p of c.pads.filter(p => p.net && !/GND/.test(p.net))) for (const ic of ICs) { const g = placed[ic]; if (!g) continue; for (const q of g.P) if (q.net === p.net) { const k = ic + '.' + q.num; const u = usedPin[k] || 0; const s = pref(ref, ic) * 1000 + u * 100; if (!best || s < best.s || (s === best.s && pref(ref, ic) < pref(ref, best.ic))) best = { s, X: q.X, Y: q.Y, k, ic }; } }
    if (best) { usedPin[best.k] = (usedPin[best.k] || 0) + 1; return [best.X, best.Y]; }
  }
  let sx = 0, sy = 0, sw = 0;
  for (const p of sig) { const q = PADS.filter(q => q.net === p.net); if (!q.length) continue; sx += q.reduce((t, v) => t + v.X, 0) / q.length; sy += q.reduce((t, v) => t + v.Y, 0) / q.length; sw += 1; }
  return sw ? [sx / sw, sy / sw] : null;
}
// Préférence de CI pour un découplage : même page du schéma (préfixe numérique du repère)
const pref = (ref, ic) => { const n = +ref.replace(/\D/g, ''); const pg = Math.floor(n / 100); const icPg = { U1: 2, U2: 1, U15: 1, U3: 3, U11: 3, U12: 3, U4: 4, LS1: 4, U9: 5, U10: 5, U8: 5, U5: 5, U13: 6, U14: 6, U16: 6 }[ic] ?? 9; return icPg === pg ? 0 : 1; };
const wl = (c, g) => { let s = 0; for (const p of g.P) { if (!p.net || POW.has(p.net)) continue; let m = Infinity; for (const q of PADS) if (q.net === p.net && q.ref !== c.ref) m = Math.min(m, Math.hypot(p.X - q.X, p.Y - q.Y)); if (m < Infinity) s += m; } return s; };
function place(ref) {
  const c = C[ref]; const t = target(ref) || [50, c.dom === 'P' ? 18 : 55];
  let best = null;
  for (const r of [0, 90, 180, 270]) {
    let found = null;
    for (let R = 0; R <= 70 && !found; R += 0.5) {
      const n = Math.max(1, Math.round(2 * Math.PI * R / 0.5));
      for (let i = 0; i < n; i++) { const a = 2 * Math.PI * i / n, x = t[0] + R * Math.cos(a), y = t[1] + R * Math.sin(a); const g = geo(c, x, y, r); if (ok(c, g)) { found = { x, y, r, g, R }; break; } }
    }
    if (!found) continue;
    const cost = found.R * 1.0 + wl(c, found.g) * 0.5;
    if (!best || cost < best.cost) best = { ...found, cost };
  }
  if (!best) throw new Error('aucune place pour ' + ref);
  placed[ref] = { x: best.x, y: best.y, r: best.r, ...best.g }; PADS = allPads();
}
// Ordre : règles de PLACEMENT_CIBLE §2 d'abord, puis affinité décroissante avec ce qui est déjà placé
const FIRST = ['U14','U11','U12','D9','D10','F1','D1','D11','D12','D13','D14','C201','C205','Y1','C206','C207','C202','C203','C204','D17','R426','F1','D1','U15','C107','U14','U16','U15','F1','D1','U2','U3','D9','R301','R302','C301','U11','U12','D11','D12','D13','D14','D4','D5','Q3','Q4','D7','C401','C402','R403','Q5','Q6','U4','U5','F2','D2','Q8','Q9','D8','C505','D3','R504','U8','U10','R509','R510','C514'];
for (const ref of FIRST) if (!placed[ref]) place(ref);
const left = () => Object.keys(C).filter(r => !placed[r]);
while (left().length) {
  const L = left().map(ref => { const c = C[ref]; let a = 0; for (const p of c.pads) if (p.net && !POW.has(p.net)) for (const q of PADS) if (q.net === p.net) a += 1; return [a, ref]; }).sort((x, y) => y[0] - x[0] || x[1].localeCompare(y[1]));
  place(L[0][1]);
}
// Sortie : position du composant en mil (origine du composant), rotation
const out = Object.entries(placed).filter(([ref]) => !ref.startsWith('_')).map(([ref, g]) => ({ ref, id: C[ref].id, x: Math.round(g.x / MIL * 10) / 10, y: Math.round(g.y / MIL * 10) / 10, r: g.r }));
fs.writeFileSync('fine_plan.json', JSON.stringify(out));
fs.writeFileSync('fine_geo.json', JSON.stringify(Object.fromEntries(Object.entries(placed).filter(([k]) => !k.startsWith('_')).map(([k, g]) => [k, { B: g.B, P: g.P.map(p => [p.num, p.net, +p.X.toFixed(3), +p.Y.toFixed(3), +p.W.toFixed(3), +p.H.toFixed(3)]), r: g.r, dom: C[k].dom }]))));
// Bilan : distances clés
const d = (a, an, b, bn) => { const p = placed[a].P.find(x => x.num === an), q = placed[b].P.find(x => x.num === bn); return Math.hypot(p.X - q.X, p.Y - q.Y).toFixed(1); };
const near = (ref, ic) => { const g = placed[ref]; let m = Infinity; for (const p of g.P) for (const q of placed[ic].P) if (p.net && p.net === q.net) m = Math.min(m, Math.hypot(p.X - q.X, p.Y - q.Y)); return m.toFixed(1); };
console.log('placés', out.length, '; fin rangée haute x =', endTop.toFixed(1));
console.log('distances (mm) découplage→U1 :', ['C201','C202','C203','C204','C205','C206','C207','Y1'].map(r => r + ' ' + near(r, 'U1')).join(', '));
console.log('protections→connecteur :', [['D1','J1'],['F1','J1'],['D9','J1'],['U11','J4'],['U12','J5'],['D11','J8'],['U14','J12'],['F2','J2'],['D2','J2'],['C505','J3'],['D3','J3'],['D4','K1'],['D5','K2']].map(([a, b]) => a + '→' + b + ' ' + near(a, b)).join(', '));
for (const r of BARRIER) console.log(r, 'rot', placed[r].r);
