const MIL=0.0254;const pads=require('./pcb_pads.json'),geo=require('./fine_geo.json'),bb=require('./pcb_bbox.json');const W=120,H=80;
let dmax=0,miss=0;for(const p of pads){const g=geo[p[0]];const q=g&&g.P.find(x=>x[0]===p[1]);if(!q){miss++;continue}dmax=Math.max(dmax,Math.hypot(p[3]*MIL-q[2],p[4]*MIL-q[3]))}
console.log('écart max pastille réelle / plan :',dmax.toFixed(3),'mm ; non trouvées',miss);
const P=new Set(['+12V_IN','GND_P','+12V_F','LM_EN','LM_VCAP','LM_GATE','LM_SRC','+12V_P','LM_OV','NO_FEED','VERIN_A','VERIN_B','MOT_RET','U6_A','U7_A','+5V_ISO','AMC_INP','AMC_INN']);
const sz={};for(const r in geo)for(const q of geo[r].P)sz[r+'.'+q[0]]=[q[4],q[5]];
const R=pads.filter(p=>p[2]).map(p=>({ref:p[0],n:p[1],dom:P.has(p[2])?'P':'C',x:p[3]*MIL,y:p[4]*MIL,w:sz[p[0]+'.'+p[1]][0],h:sz[p[0]+'.'+p[1]][1]}));
let m=[1e9];for(const a of R)if(a.dom==='C')for(const b of R)if(b.dom==='P'&&a.ref!==b.ref){const d=Math.hypot(Math.max(0,Math.abs(a.x-b.x)-(a.w+b.w)/2),Math.max(0,Math.abs(a.y-b.y)-(a.h+b.h)/2));if(d<m[0])m=[d,a.ref+'.'+a.n,b.ref+'.'+b.n]}
console.log('isolement mini entre composants différents :',m[0].toFixed(2),'mm',m[1],m[2]);
const B=bb.map(b=>[b[0],b[4]*MIL,b[6]*MIL,b[5]*MIL,b[7]*MIL]);let ov=[];for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++){const a=B[i],b=B[j];if(a[1]<b[2]&&b[1]<a[2]&&a[3]<b[4]&&b[3]<a[4])ov.push(a[0]+'/'+b[0])}
const out=B.filter(b=>b[1]<0||b[2]>W||b[3]<0||b[4]>H).map(b=>b[0]);
const holes=[];for(const b of B)for(const [hx,hy] of [[4,4],[116,4],[4,76],[116,76]]){const dx=Math.max(b[1]-hx,0,hx-b[2]),dy=Math.max(b[3]-hy,0,hy-b[4]);if(dx*dx+dy*dy<3.5*3.5)holes.push(b[0])}
console.log('composants',B.length,'; chevauchements de corps :',ov.length,ov.join(' '),'; hors carte :',out.join(',')||'aucun','; zone des trous :',holes.join(',')||'aucun');
