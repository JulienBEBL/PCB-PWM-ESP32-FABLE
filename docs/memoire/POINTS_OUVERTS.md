# Points ouverts

Un point clos reste listé avec sa résolution. **Criticité :** B = bloque la commande, C = conditionne le schéma ou le PCB, M = à traiter avant mise en service.

## Ouverts

| N° | Ouvert le | Point | Criticité | Défaut appliqué sans réponse | Responsable |
|---|---|---|---|---|---|
| PO-01 | 2026-11-14 | **Écart entre les deux rangées de broches de la carte de dev.** 25,40 mm supposé (ESP32 PO-21). Sources contradictoires relevées le 2026-11-14 : l'empreinte KiCad d'Espressif donne 22,86 mm, des mesures d'utilisateurs donnent 25,4 mm (forum.kicad.info, sujet 71001). Plan Espressif (PDF / DXF) à lire en phase 2. | **B** | Empreinte à 3 rangées : 1 commune + 1 à 22,86 mm + 1 à 25,40 mm, reliées en parallèle. La carte convient dans les deux cas | Julien (mesure), Claude |
| PO-02 | 2026-11-14 | Questions de phase 0 posées à Julien (Q1 à Q7, voir `JOURNAL.md` session 01). | C | Défauts proposés | Julien |
| PO-03 | 2026-11-14 | Diodes de la carte de dev entre l'USB et la broche 5V (ESP32 PO-18) : à lire sur le schéma Espressif en phase 2 ; test au multimètre par Julien à réception. | C | Diode idéale entre le +5V de la carte et la broche 5V de la carte de dev (reprise ESP32 DEC-026) | Claude, Julien |
| PO-04 | 2026-11-14 | Courant minimal des fins de course (STM32 PO-23, jamais clos) : fixe la valeur des rappels. | M | 1 kΩ au +3V3, soit 3,3 mA (reprise ESP32 netlist) | Julien |
| PO-05 | 2026-11-14 | Barrettes femelles 1×22 : pose par JLCPCB (traversant) à confirmer en phase 3. | C | Sinon soudées à la main, signalé | Claude |
| PO-06 | 2026-11-14 | **Push refusé (403).** Le poste est connecté à GitHub avec le compte `Jujuxw9`, qui n'a que le droit de lecture sur `JulienBEBL/PCB-PWM-ESP32-FABLE` (`gh api` : `push: false`). Les commits restent locaux. | C | Commits locaux à chaque phase ; push dès que le droit est donné | Julien (ajouter `Jujuxw9` comme collaborateur en écriture, ou connecter `gh` au compte `JulienBEBL`) |

## Clos

| N° | Clos le | Point | Résolution |
|---|---|---|---|
