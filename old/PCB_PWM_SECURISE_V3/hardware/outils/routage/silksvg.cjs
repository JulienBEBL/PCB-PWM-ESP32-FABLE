const fs=require('fs');const g=require('./fine_geo.json'),S=require('./silk_plan.json'),tp=require('./tp.json');const K=10,W=120,H=80;
const X=x=>x*K,Y=y=>(H-y)*K;
let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -40 ${W*K+40} ${H*K+80}" font-family="Arial"><rect x="-20" y="-40" width="${W*K+40}" height="${H*K+80}" fill="#fff"/>
<text x="0" y="-14" font-size="18" font-weight="bold">${process.argv[3]||'PCB1 — sérigraphie (jaune), vue de dessus'}</text>
<rect x="0" y="0" width="${W*K}" height="${H*K}" fill="#1f5f3a" stroke="#000" stroke-width="2"/>`;
for(const [hx,hy] of [[4,4],[116,4],[4,76],[116,76]]) s+=`<circle cx="${X(hx)}" cy="${Y(hy)}" r="${1.6*K}" fill="#fff"/>`;
for(const [r,o] of Object.entries(g)){const [x0,x1,y0,y1]=o.B;s+=`<rect x="${X(x0)}" y="${Y(y1)}" width="${(x1-x0)*K}" height="${(y1-y0)*K}" fill="#2a2a2a" opacity="0.35"/>`;for(const p of o.P)s+=`<rect x="${X(p[2]-p[4]/2)}" y="${Y(p[3]+p[5]/2)}" width="${p[4]*K}" height="${p[5]*K}" fill="#d9a441"/>`;}
for(const t of tp)s+=`<circle cx="${X(t[2])}" cy="${Y(t[3])}" r="${0.75*K}" fill="#d9a441"/>`;
for(const l of S.lines)s+=`<polyline points="${l.pts.map(p=>X(p[0])+','+Y(p[1])).join(' ')}" fill="none" stroke="#f2f2f2" stroke-width="${l.w*K}"/>`;
for(const t of S.texts){const fz=t.size*K*1.25;const tr=t.rot?`transform="rotate(-90 ${X(t.x)} ${Y(t.y)})"`:'';s+=`<text x="${X(t.x)}" y="${Y(t.y)}" font-size="${fz.toFixed(1)}" fill="#f2f2f2" textLength="${(t.s.length*0.66*t.size*K).toFixed(1)}" lengthAdjust="spacingAndGlyphs" ${tr}>${t.s.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text>`;}
s+=`<text x="0" y="${H*K+24}" font-size="13">Blanc : sérigraphie prévue. Doré : pastilles. Gris : corps des composants. Repères masqués : ${S.hidden.join(', ')||'aucun'}</text></svg>`;
fs.writeFileSync(process.argv[2],s);console.log('ok');
