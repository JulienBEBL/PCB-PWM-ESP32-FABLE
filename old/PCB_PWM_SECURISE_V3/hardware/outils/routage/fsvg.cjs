const fs=require('fs');const g=require('./fine_geo.json');const S=10,W=120,H=80;
const X=x=>x*S,Y=y=>(H-y)*S;const col=d=>d==='B'?'#c77d00':d==='P'?'#c0392b':'#2e6fb7';
let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -40 ${W*S+40} ${H*S+90}" font-family="Arial"><rect x="-20" y="-40" width="${W*S+40}" height="${H*S+90}" fill="#fff"/>
<text x="0" y="-15" font-size="18" font-weight="bold">${process.argv[3]||'PCB1 — placement fin (G4), vue de dessus'}</text>
<rect x="0" y="0" width="${W*S}" height="${H*S}" fill="#f4f7ef" stroke="#222" stroke-width="2"/>
<line x1="0" x2="${W*S}" y1="${Y(29)}" y2="${Y(29)}" stroke="#c77d00" stroke-dasharray="8 5"/>`;
for(const [hx,hy] of [[4,4],[116,4],[4,76],[116,76]]) s+=`<circle cx="${X(hx)}" cy="${Y(hy)}" r="${3.5*S}" fill="none" stroke="#888" stroke-dasharray="4 3"/><circle cx="${X(hx)}" cy="${Y(hy)}" r="${1.6*S}" fill="#fff" stroke="#222"/>`;
for(const [ref,o] of Object.entries(g)){const k=col(o.dom);const [x0,x1,y0,y1]=o.B;
 s+=`<rect x="${X(x0)}" y="${Y(y1)}" width="${(x1-x0)*S}" height="${(y1-y0)*S}" fill="none" stroke="${k}" stroke-width="0.8"/>`;
 for(const p of o.P){const pc=!p[1]?'#999':/^(\+12V_IN|GND_P|\+12V_F|LM_|\+12V_P|NO_FEED|VERIN|MOT_RET|U6_A|U7_A|\+5V_ISO|AMC_IN)/.test(p[1])?'#c0392b':'#2e6fb7';s+=`<rect x="${X(p[2]-p[4]/2)}" y="${Y(p[3]+p[5]/2)}" width="${p[4]*S}" height="${p[5]*S}" fill="${pc}" opacity="0.6"/>`;}
 const fz=Math.max(5,Math.min(13,(x1-x0)*S/3.2));s+=`<text x="${X((x0+x1)/2)}" y="${Y((y0+y1)/2)+fz/3}" font-size="${fz.toFixed(1)}" text-anchor="middle" fill="#111">${ref}</text>`;}
s+=`<text x="0" y="${H*S+22}" font-size="13"><tspan fill="#2e6fb7">■ commande (GND)</tspan>   <tspan fill="#c77d00">■ barrière K1, K2, U6, U7, U9 (pointillés : frontière)</tspan>   <tspan fill="#c0392b">■ puissance (GND_P)</tspan></text>
<text x="0" y="${H*S+42}" font-size="12" fill="#555">120 × 80 mm, 4 couches, 4 trous M3. Cadres = corps et sérigraphie. Non routé.</text></svg>`;
fs.writeFileSync(process.argv[2],s);console.log('ok');
