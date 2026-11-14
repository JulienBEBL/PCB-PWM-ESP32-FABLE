# Un tour : paires du DRC (U1 d'abord, courtes d'abord), routeur sur grille, application, recalcul des plans.
set -e
node pairs.mjs > /dev/null
node -e 'const fs=require("fs");const P=JSON.parse(fs.readFileSync("pairs.json"));const inU1=e=>e[0]>50&&e[0]<61.5&&e[1]>46.5&&e[1]<55.5;const L=p=>Math.hypot(p[1][0]-p[2][0],p[1][1]-p[2][1]);P.sort((a,b)=>((inU1(b[1])||inU1(b[2]))-(inU1(a[1])||inU1(a[2])))||L(a)-L(b));fs.writeFileSync("pairs.json",JSON.stringify(P));console.log("paires",P.length)'
PAIRS=1 node --max-old-space-size=8000 gridroute.cjs '[]' | grep -c "ok :" || true
node gr_apply.mjs
node rebuild.mjs > /dev/null
node cu_read2.mjs > /dev/null
