// Lit un .ses Freerouting : éléments nouveaux (sans "type protect") par net. Unités : mil.
const fs = require('fs');
function tok(s) { const T = []; const re = /\(|\)|"[^"]*"|[^\s()]+/g; let m; while ((m = re.exec(s))) T.push(m[0]); return T; }
function tree(T) { let i = 0; const rd = () => { const t = T[i++]; if (t !== '(') return t; const L = []; while (T[i] !== ')') L.push(rd()); i++; return L; }; return rd(); }
function find(n, key) { if (!Array.isArray(n)) return null; if (n[0] === key) return n; for (const c of n) { const r = find(c, key); if (r) return r; } return null; }
module.exports = function parse(file) {
  const root = tree(tok(fs.readFileSync(file, 'utf8')));
  const res = find(find(root, 'routes'), 'resolution'); const div = res ? +res[2] : 1;
  const no = find(root, 'network_out'); const out = {};
  for (const net of no.slice(1)) {
    if (!Array.isArray(net) || net[0] !== 'net') continue;
    const name = net[1].replace(/"/g, ''); const W = [], V = [];
    for (const it of net.slice(2)) {
      if (!Array.isArray(it)) continue;
      const prot = it.some(x => Array.isArray(x) && x[0] === 'type' && x[1] === 'protect');
      if (prot) continue;
      if (it[0] === 'wire') { const p = it.find(x => Array.isArray(x) && x[0] === 'path'); const c = p.slice(3).map(Number).map(v => v / div); W.push({ layer: p[1], w: +p[2] / div, pts: c }); }
      if (it[0] === 'via') V.push({ x: +it[2] / div, y: +it[3] / div });
    }
    if (W.length || V.length) out[name] = { W, V };
  }
  return out;
};
if (require.main === module) { const o = module.exports(process.argv[2]); for (const [n, x] of Object.entries(o)) console.log(n, 'pistes', x.W.length, 'vias', x.V.length, 'couches', [...new Set(x.W.map(w => w.layer))].join('/')); }
