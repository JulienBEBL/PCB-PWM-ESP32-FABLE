import { run, PROJ } from './eda.mjs';
import fs from 'fs';
const r = await run(`await eda.dmt_EditorControl.activateDocument("9e5b12b9217a84a5@${PROJ}"); await new Promise(q=>setTimeout(q,1000)); const d=await eda.dmt_SelectControl.getCurrentDocumentInfo(); if(d.uuid!=="9e5b12b9217a84a5") return "DOC_STOP"; const f=await eda.pcb_ManufactureData.getDsnFile(); if(!f) return "ERR nofile"; const t=await f.text(); return "DSN:"+t;`);
if (typeof r !== 'string' || !r.startsWith('DSN:')) { console.log(String(r).slice(0,300)); process.exit(1); }
fs.writeFileSync(process.argv[2], r.slice(4)); console.log('octets', r.length - 4);
