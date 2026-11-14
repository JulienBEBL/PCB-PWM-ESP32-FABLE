import { run } from './eda.mjs';
for (let i = 0; i < 20; i++) { try { const r = await run('const p = await eda.dmt_Project.getCurrentProjectInfo(); return p.uuid;'); console.log('ok', r); process.exit(0); } catch (e) { await new Promise(r => setTimeout(r, 6000)); } }
console.log('toujours déconnecté'); process.exit(1);
