// DSN EasyEDA -> DSN Freerouting : L2/L3 en plans, keepouts d'isolement et trous, inséré en fin de structure.
const fs = require('fs');
const [,, inp, out] = process.argv;
let t = fs.readFileSync(inp, 'utf8').replace(/\r/g, '');
const m = v => +(v / 0.0254).toFixed(2);
const rect = (L, x0, y0, x1, y1) => `(polygon ${L} 0 ${m(x0)} ${m(y0)} ${m(x1)} ${m(y0)} ${m(x1)} ${m(y1)} ${m(x0)} ${m(y1)} ${m(x0)} ${m(y0)})`;
const circ = (L, x, y, d) => `(circle ${L} ${m(d)} ${m(x)} ${m(y)})`;
t = t.replace(/\(layer Inner1\s*\(type signal\)/, '(layer Inner1\n      (type power)').replace(/\(layer Inner2\s*\(type signal\)/, '(layer Inner2\n      (type power)');
let add = '';
add += `    (plane GND ${rect('Inner1', 0.5, 30.2, 119.5, 79.5)})\n`;
add += `    (plane GND_P ${rect('Inner1', 0.5, 0.5, 119.5, 27.8)})\n`;
add += `    (plane +3V3 ${rect('Inner2', 0.5, 30.2, 119.5, 79.5)})\n`;
add += `    (plane +12V_P ${rect('Inner2', 0.5, 0.5, 119.5, 27.8)})\n`;
for (const L of ['TopLayer', 'BottomLayer']) {
  add += `    (keepout ${rect(L, 0, 0, 120, 30.2)})\n    (via_keepout ${rect(L, 0, 0, 120, 30.2)})\n`;
  for (const [x, y] of [[4, 4], [116, 4], [4, 76], [116, 76]]) add += `    (keepout ${circ(L, x, y, 7)})\n    (via_keepout ${circ(L, x, y, 7)})\n`;
}
const anchor = '\n  )\n\n  (placement';
const i = t.indexOf(anchor);
if (i < 0) throw new Error('ancre structure introuvable');
t = t.slice(0, i + 1) + add + t.slice(i + 1);
fs.writeFileSync(out, t);
console.log('ok', add.split('\n').length - 1, 'lignes ajoutées');
