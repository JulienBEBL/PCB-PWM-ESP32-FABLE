// DSN EasyEDA -> DSN pour freerouting-cli natif (sans zones : la CLI 2.5.0 native plante sur ObstacleArea).
// - nets de plans retirés du réseau (pastilles et cuivre deviennent des obstacles sans net)
// - routage limité à L1 / L4 (use_layer)
// - keepouts remplacés par des pistes figées sans net : isolement y < 30,2 mm et trous Ø 7 mm
const fs = require('fs');
const [,, inp, out] = process.argv;
let t = fs.readFileSync(inp, 'utf8').replace(/\r/g, '');
const m = v => +(v / 0.0254).toFixed(2);
const PLANES = ['GND', 'GND_P', '+3V3', '+12V_P'];
const esc = s => s.replace(/[+]/g, '\\+');
for (const n of PLANES) {
  const e = esc(n);
  t = t.replace(new RegExp(`\\n    \\(net ${e}\\n      \\(pins [^)]*\\)\\n    \\)`, 'g'), '');
  t = t.replace(new RegExp(`\\n    \\(class ${e} '${e}'[\\s\\S]*?\\n    \\)\\n    \\)`, 'g'), '');
  t = t.replace(new RegExp(`\\n      \\(net ${e}\\)`, 'g'), '');
}
let c0 = 0;
t = t.replace(/\(circuit\s*\n\s*\(use_via via0\)\s*\n\s*\)/g, () => { c0++; return '(circuit\n        (use_via via0)\n        (use_layer TopLayer BottomLayer)\n      )'; });
const W = [];
for (const L of ['TopLayer', 'BottomLayer']) {
  // bande y 0..30,2 mm : piste de largeur 30,2 mm centrée sur y = 15,1 mm (bords arrondis hors carte)
  for (let y = 1; y <= 29.2001; y += (y + 1 > 29.2 && y < 29.2 ? 29.2 - y : 1)) W.push(`    (wire(path ${L} ${m(2)} ${m(0.6)} ${m(y)} ${m(119.4)} ${m(y)})
      (type protect)
    )`);
  for (const [x, y] of [[4, 4], [116, 4], [4, 76], [116, 76]]) W.push(`    (wire(path ${L} ${m(7)} ${m(x)} ${m(y)} ${m(x)} ${m(y)})\n      (type protect)\n    )`);
}
const k = t.indexOf('  (wiring\n');
if (k < 0) throw new Error('wiring introuvable');
t = t.slice(0, k + 10) + W.join('\n') + '\n' + t.slice(k + 10);
fs.writeFileSync(out, t);
const left = PLANES.filter(n => new RegExp(`\\(net ${esc(n)}[\\s)]`).test(t));
console.log('classes use_layer', c0, '; obstacles', W.length, '; nets de plans restants', left.join(',') || 'aucun');
