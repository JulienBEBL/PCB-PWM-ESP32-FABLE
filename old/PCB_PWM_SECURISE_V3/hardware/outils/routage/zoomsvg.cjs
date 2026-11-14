const fs=require('fs');const MIL=0.0254,CU=require('./cu2.json'),G=require('./fine_geo.json');
const [x0,x1,y0,y1]=JSON.parse(process.argv[2]);const K=40;const X=x=>(x-x0)*K,Y=y=>(y1-y)*K;
const col={1:'#d33',2:'#36c',16:'#2a2',15:'#aa0'};
let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${(x1-x0)*K} ${(y1-y0)*K}" font-family="Arial"><rect width="100%" height="100%" fill="#111"/>`;
for(const [r,o] of Object.entries(G))for(const p of o.P){if(p[2]<x0-2||p[2]>x1+2||p[3]<y0-2||p[3]>y1+2)continue;s+=`<rect x="${X(p[2]-p[4]/2)}" y="${Y(p[3]+p[5]/2)}" width="${p[4]*K}" height="${p[5]*K}" fill="#c90" opacity="0.8"/><text x="${X(p[2])}" y="${Y(p[3])}" font-size="9" fill="#fff" text-anchor="middle">${r}.${p[0]} ${(p[1]||'').slice(0,8)}</text>`;}
for(const l of CU.L){const a=[l[2]*MIL,l[3]*MIL],b=[l[4]*MIL,l[5]*MIL];if(Math.max(a[0],b[0])<x0||Math.min(a[0],b[0])>x1||Math.max(a[1],b[1])<y0||Math.min(a[1],b[1])>y1)continue;s+=`<line x1="${X(a[0])}" y1="${Y(a[1])}" x2="${X(b[0])}" y2="${Y(b[1])}" stroke="${col[l[1]]||'#888'}" stroke-width="${l[6]*MIL*K}" stroke-linecap="round" opacity="0.75"/>`;}
for(const v of CU.V){const x=v[1]*MIL,y=v[2]*MIL;if(x<x0||x>x1||y<y0||y>y1)continue;s+=`<circle cx="${X(x)}" cy="${Y(y)}" r="${v[3]*MIL/2*K}" fill="#eee"/><text x="${X(x)}" y="${Y(y)+3}" font-size="7" fill="#000" text-anchor="middle">${(v[0]||'').slice(0,5)}</text>`;}
s+='</svg>';fs.writeFileSync(process.argv[3],s);
