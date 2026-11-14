import { run } from './eda.mjs';
import { activatePcb } from './pcbact.mjs';
import fs from 'fs';
const R = JSON.parse(fs.readFileSync('rules.json'));
const cfg = JSON.parse(JSON.stringify(R.c.config));
// Écarts : minimum 0,2 mm partout (cuivre)
const ss = cfg.Spacing['Safe Spacing'].copperThickness1oz; let n = 0;
for (const t of Object.values(ss.tables)) t.content = t.content.map(row => row.map(v => { if (typeof v === 'number' && v < 0.2) { n++; return 0.2; } return v; }));
// Classes de largeur de piste
const base = cfg.Physics.Track.copperThickness1oz;
for (const [name, w, mn] of [['P05', 0.5, 0.2], ['P10', 1.0, 0.3]]) { const r = JSON.parse(JSON.stringify(base)); r.editName = name; r.isSetDefault = false; r.form.data['1'] = { minValue: mn, defaultValue: w, maxValue: 2.54 }; cfg.Physics.Track[name] = r; }
const NAME = 'PCB_PWM_V3_DEC076';
console.log('écarts relevés à 0,2 mm :', n);
console.log(await activatePcb());
const r1 = await run(`const ok1 = await eda.pcb_Drc.saveRuleConfiguration(${JSON.stringify(cfg)}, "${NAME}", true); const ok2 = await eda.pcb_Drc.overwriteCurrentRuleConfiguration(${JSON.stringify(cfg)}); return JSON.stringify({ok1, ok2, cur: await eda.pcb_Drc.getCurrentRuleConfigurationName()});`);
console.log(JSON.stringify(r1));
const P05 = ['+5V', '+3V3', '+5V_F', '+5V_IN', 'VBUS', '+5V_ISO', 'GND', '+3V3_EXT'], P10 = ['+12V_IN', '+12V_F', '+12V_P', 'VERIN_A', 'VERIN_B', 'MOT_RET', 'NO_FEED', 'GND_P'];
const nr = R.nr.map(x => ({ ...x, Track: P10.includes(x.name) ? 'P10' : P05.includes(x.name) ? 'P05' : x.Track }));
const r2 = await run(`const ok = await eda.pcb_Drc.overwriteNetRules(${JSON.stringify(nr)}); const back = await eda.pcb_Drc.getNetRules(); await eda.pcb_Document.save(); return JSON.stringify({ok, p10: back.filter(x => x.Track === "P10").map(x => x.name), p05: back.filter(x => x.Track === "P05").map(x => x.name)});`);
console.log(JSON.stringify(r2));
