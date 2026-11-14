import { run } from './eda.mjs';
for (let i = 0; i < 25; i++) { const r = await run(`await new Promise(q => setTimeout(q, 15000)); return JSON.stringify(globalThis.__ar || null);`); if (r && r.done) { console.log(JSON.stringify(r)); process.exit(0); } }
console.log('toujours en cours');
