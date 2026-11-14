import { run } from './eda.mjs';
import fs from 'fs';
const R = JSON.parse(fs.readFileSync('rules2.json'));
const cfg = JSON.parse(JSON.stringify(R.c.config));
const base = cfg.Spacing['Safe Spacing'].copperThickness1oz;
const fin = JSON.parse(JSON.stringify(base)); fin.editName = 'FIN'; fin.isSetDefault = false;
for (const t of Object.values(fin.tables)) t.content = t.content.map(row => row.map(v => typeof v === 'number' && Math.abs(v - 0.2) < 0.001 ? 0.15 : v));
cfg.Spacing['Safe Spacing'].FIN = fin;
const tb = cfg.Physics.Track.copperThickness1oz;
for (const [name, w, mn] of [['S20', 0.2, 0.15], ['P03', 0.3, 0.2]]) { const r = JSON.parse(JSON.stringify(tb)); r.editName = name; r.isSetDefault = false; r.form.data['1'] = { minValue: mn, defaultValue: w, maxValue: 2.54 }; cfg.Physics.Track[name] = r; }
const SIG = ['NRST', 'FC_R1_NO', 'FC_S1_NC', 'I_MON', 'WDT_KICK'], PW = ['+5V', 'VBUS'];
const nr = R.nr.map(x => SIG.includes(x.name) ? { ...x, Track: 'S20', 'Safe Spacing': 'FIN' } : PW.includes(x.name) ? { ...x, Track: 'P03', 'Safe Spacing': 'FIN' } : x);
const r = await run(`await eda.dmt_EditorControl.activateDocument("9e5b12b9217a84a5@b4788f45338c4e59bfcfdff2832a8063"); await new Promise(q => setTimeout(q, 1200)); const a = await eda.pcb_Drc.saveRuleConfiguration(${JSON.stringify(cfg)}, "PCB_PWM_V3_DEC077", true); const b = await eda.pcb_Drc.overwriteCurrentRuleConfiguration(${JSON.stringify(cfg)}); const c = await eda.pcb_Drc.overwriteNetRules(${JSON.stringify(nr)}); await eda.pcb_Document.save(); const back = await eda.pcb_Drc.getNetRules(); return JSON.stringify({a, b, c, fin: back.filter(x => x["Safe Spacing"] === "FIN").map(x => x.name + ":" + x.Track)});`);
console.log(JSON.stringify(r));
