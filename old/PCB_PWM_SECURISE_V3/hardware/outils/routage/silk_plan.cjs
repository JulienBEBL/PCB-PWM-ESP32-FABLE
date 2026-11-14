// Sérigraphie : marquages fixes, étiquettes et repères placés sans recouvrir pastilles, corps de composants ni autres textes. Unités mm.
const fs = require('fs');
const G = require('./fine_geo.json'), TP = require('./tp.json'), SILK = require('./silk.json');
const W = 120, H = 80, CW = 0.66, PADCL = 0.2, BODYCL = 0.1, TXTCL = 0.15, SZ = 1.016; // 40 mil
const HOLES = [[4, 4], [116, 4], [4, 76], [116, 76]];
// Obstacles
const pads = Object.entries(G).flatMap(([r, o]) => o.P.map(p => [p[2] - p[4] / 2 - PADCL, p[2] + p[4] / 2 + PADCL, p[3] - p[5] / 2 - PADCL, p[3] + p[5] / 2 + PADCL, r]));
for (const t of TP) pads.push([t[2] - 0.75 - PADCL, t[2] + 0.75 + PADCL, t[3] - 0.75 - PADCL, t[3] + 0.75 + PADCL, t[0]]);
const bodies = Object.entries(G).map(([r, o]) => [o.B[0] - BODYCL, o.B[1] + BODYCL, o.B[2] - BODYCL, o.B[3] + BODYCL, r]);
const texts = [], lines = [];
const hit = (a, b) => a[0] < b[1] && b[0] < a[1] && a[2] < b[3] && b[2] < a[3];
const freeBox = bx => {
  if (bx[0] < 0.5 || bx[1] > W - 0.5 || bx[2] < 0.5 || bx[3] > H - 0.5) return false;
  for (const [hx, hy] of HOLES) { const dx = Math.max(bx[0] - hx, 0, hx - bx[1]), dy = Math.max(bx[2] - hy, 0, hy - bx[3]); if (dx * dx + dy * dy < 3.4 * 3.4) return false; }
  for (const p of pads) if (hit(bx, p)) return false;
  for (const b of bodies) if (hit(bx, b)) return false;
  for (const t of texts) if (hit(bx, [t.box[0] - TXTCL, t.box[1] + TXTCL, t.box[2] - TXTCL, t.box[3] + TXTCL])) return false;
  for (const l of lines) if (hit(bx, l.box)) return false;
  return true;
};
const tbox = (x, y, s, size, rot) => { const w = s.length * CW * size, h = size; return rot === 0 ? [x, x + w, y, y + h] : [x - h, x, y, y + w]; };
const errors = [];
const fixedText = (s, x, y, size = SZ, rot = 0, kind = 'texte') => { const box = tbox(x, y, s, size, rot); if (!freeBox(box)) errors.push('marquage refusé : ' + s); texts.push({ kind, s, x, y, size, rot, box }); };
const fixedLine = (pts, w = 0.2, tag = '') => { const segs = []; for (let i = 0; i + 1 < pts.length; i++) { const [a, b] = [pts[i], pts[i + 1]]; const box = [Math.min(a[0], b[0]) - w, Math.max(a[0], b[0]) + w, Math.min(a[1], b[1]) - w, Math.max(a[1], b[1]) + w]; if (Math.abs(a[0] - b[0]) > 0.01 && Math.abs(a[1] - b[1]) > 0.01) { for (let t = 0; t <= 1.0001; t += 0.1) { const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t; if (!freeBox([x - w, x + w, y - w, y + w])) errors.push('trait refusé ' + tag); } } else if (!freeBox(box)) errors.push('trait refusé ' + tag); segs.push(box); } lines.push({ pts, w, box: [0, 0, 0, 0] }); for (const b of segs) lines.push({ pts: null, w, box: b, ghost: true }); };
// Recherche d'une place près d'une boîte cible
function near(s, target, size = SZ, maxR = 8) {
  const [tx0, tx1, ty0, ty1] = target; const best = [];
  for (const rot of [0, 90]) {
    const w = s.length * CW * size, h = size; const bw = rot === 0 ? w : h, bh = rot === 0 ? h : w;
    for (let d = 0.1; d <= maxR; d += 0.25) {
      const cands = [];
      for (let k = -bw; k <= (tx1 - tx0); k += 0.25) { cands.push([tx0 + k, ty1 + d], [tx0 + k, ty0 - d - bh]); }
      for (let k = -bh; k <= (ty1 - ty0); k += 0.25) { cands.push([tx1 + d, ty0 + k], [tx0 - d - bw, ty0 + k]); }
      const ok = cands.map(([x0, y0]) => [x0, y0, Math.hypot(x0 + bw / 2 - (tx0 + tx1) / 2, y0 + bh / 2 - (ty0 + ty1) / 2)]).sort((a, b) => a[2] - b[2]).find(([x0, y0]) => freeBox([x0, x0 + bw, y0, y0 + bh]));
      if (ok) { best.push({ rot, d: d + (rot ? 0.6 : 0), x: rot === 0 ? ok[0] : ok[0] + bw, y: ok[1], box: [ok[0], ok[0] + bw, ok[1], ok[1] + bh] }); break; }
    }
  }
  best.sort((a, b) => a.d - b.d); return best[0] || null;
}
const label = (s, ref, kind = 'étiquette', size = SZ, maxR = 8) => { const t = ref.length === 4 && typeof ref[0] === 'number' ? ref : G[ref].B; const p = near(s, t, size, maxR); if (!p) { errors.push('sans place : ' + s); return null; } texts.push({ kind, s, x: p.x, y: p.y, size, rot: p.rot, box: p.box, ref: typeof ref === 'string' ? ref : null }); return p; };

// 1. Cartouche (zone libre de la partie puissance)
fixedLine([[52.5, 4], [76.5, 4], [76.5, 21], [52.5, 21], [52.5, 4]], 0.2, 'cadre');
fixedText('PCB PWM SECURISE V3', 54, 17.6, 1.524);
fixedText('COMMANDE VERIN L12', 54, 14.8);
fixedText('BEBL  REV A  2026-11', 54, 12.4);
fixedText('4 COUCHES  1,6 MM', 54, 10.0);
fixedText('S/N', 54, 6.2);
fixedLine([[57.5, 6.1], [75, 6.1]], 0.15, 'ligne S/N');
// 2. Zone puissance (bas droite) : séparation des domaines, avertissement, légende
fixedText('COMMANDE GND', 96, 30.4);
fixedText('PUISSANCE GND_P', 96, 26.6);
fixedText('!', 98.3, 20.15, 1.524);
fixedLine([[96, 19.6], [101.4, 19.6], [98.7, 24.3], [96, 19.6]], 0.2, 'triangle');
fixedText('12 V', 103, 20.4, 2.032);
fixedText('J2 12V: 1 +12V 2 0V', 96, 16.4);
fixedText('J3 VERIN: 1 ROUGE 2 NOIR', 96, 14.0);
fixedText('J6 5e CONT: 1 +12V 3 RET', 96, 11.6);
// 3. Légende des borniers de commande (au-dessus de la barrière)
// Noms de signaux broche par broche (barrettes 2,54 mm)
const PINLBL = { J13: ['+5V', '0V', 'PWM', 'STS'], J14: ['0V', 'R1NO', 'R1NC', '0V', 'R2NO', 'R2NC'], J15: ['0V', 'S1NO', 'S1NC', '0V', 'S2NO', 'S2NC', ''], J8: ['3V3', 'E1', 'E2', 'E3', 'E4', '0V'], J9: ['3V3', 'DIO', 'CLK', 'RST', '0V'], J10: ['TX', 'RX', '0V'] };
for (const [ref, names] of Object.entries(PINLBL)) {
  const o = G[ref]; const vertical = Math.abs(o.P[0][2] - o.P[1][2]) < 0.01; // broches alignées verticalement (J9, J10)
  for (const side of [-1, 1]) {
    const items = names.map((t, i) => { if (!t) return null; const p = o.P.find(q => q[0] === String(i + 1)); const len = t.length * CW * 0.9; let x, y, rot, box;
      if (!vertical) { rot = 90; x = p[2] + 0.45; y = side < 0 ? o.B[2] - 0.25 - len : o.B[3] + 0.25; box = [x - 0.9, x, y, y + len]; }
      else { rot = 0; y = p[3] - 0.45; x = side > 0 ? o.B[1] + 0.25 : o.B[0] - 0.25 - len; box = [x, x + len, y, y + 0.9]; }
      return { t, x, y, rot, box }; }).filter(Boolean);
    if (items.every(i => freeBox(i.box))) { for (const i of items) texts.push({ kind: 'broche', s: i.t, x: i.x, y: i.y, size: 0.9, rot: i.rot, box: i.box }); break; }
    if (side === 1) errors.push('noms de broches sans place : ' + ref);
  }
}
// 4. Frontière commande / puissance : pointillés à y = 29 là où c'est libre
for (let x = 0.8; x < W - 1; x += 2) { const box = [x - 0.1, x + 1.1, 28.9, 29.1]; if (freeBox(box)) lines.push({ pts: [[x, 29], [x + 1, 29]], w: 0.15, box }); }
// 5. Étiquettes de fonction
const LBL = [['USB PC', 'J12'], ['CTRL 5V/PWM', 'J1'], ['FC RENTRE', 'J4'], ['FC SORTI', 'J5'], ['EXT', 'J8'], ['12V IN', 'J2'], ['VERIN', 'J3'], ['5e CONTACT', 'J6'], ['ARMEMENT', 'J7'], ['SWD', 'J9'], ['UART2', 'J10'], ['RESET', 'SW1'], ['BOOT', 'SW2'], ['MAINT', 'J11'], ['3V3', 'LED5'], ['L1', 'LED1'], ['L2', 'LED2'], ['L3', 'LED3'], ['L4', 'LED4']];
for (const [s, r] of LBL) label(s, r);
for (const t of TP) label(t[1].replace('_P', 'P'), [t[2] - 0.75, t[2] + 0.75, t[3] - 0.75, t[3] + 0.75]);
// 6. Repères : composants les plus serrés d'abord (petite boîte = moins de place)
const refs = Object.keys(G).sort((a, b) => { const A = G[a].B, B = G[b].B; return (A[1] - A[0]) * (A[3] - A[2]) - (B[1] - B[0]) * (B[3] - B[2]); });
const hidden = [];
for (const r of refs) { let size = SZ, p = near(r, G[r].B, SZ, 6); if (!p) { size = 0.9; p = near(r, G[r].B, 0.9, 8); } if (p) texts.push({ kind: 'repère', s: r, x: p.x, y: p.y, size, rot: p.rot, box: p.box, ref: r, attr: (SILK.find(a => a.ref === r) || {}).id }); else hidden.push(r); }
fs.writeFileSync('silk_plan.json', JSON.stringify({ texts, lines: lines.filter(l => !l.ghost).map(l => ({ pts: l.pts, w: l.w })), hidden }));
const dist = texts.filter(t => t.kind === 'repère').map(t => { const B = G[t.ref].B; return Math.hypot(Math.max(B[0] - t.box[1], 0, t.box[0] - B[1]), Math.max(B[2] - t.box[3], 0, t.box[2] - B[3])); });
console.log('textes', texts.length, '(repères', texts.filter(t => t.kind === 'repère').length, ') ; traits', lines.filter(l => !l.ghost).length, '; repères 0,9 mm', texts.filter(t => t.kind === 'repère' && t.size < 1).length, '; repères sans place :', hidden.join(',') || 'aucun');
console.log('distance repère → composant : moyenne', (dist.reduce((a, b) => a + b, 0) / dist.length).toFixed(2), 'mm, max', Math.max(...dist).toFixed(2), 'mm ; rotation 90° :', texts.filter(t => t.kind === 'repère' && t.rot).length);
console.log('erreurs :', errors.join(' | ') || 'aucune');
