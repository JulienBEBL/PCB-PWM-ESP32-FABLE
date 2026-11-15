# État du projet

**Dernière mise à jour :** 2026-11-15 (session 03 : corrections de la revue à l'aveugle)

**Échéance :** commande JLCPCB lundi 16 novembre 2026. **Exports à envoyer : suffixe `2026-11-15_R3`** (DEC-032, PO-32).

## Phases

| Phase | Contenu | Statut |
|---|---|---|
| 0 | Lecture des anciens dépôts, questions à Julien | Terminée (DEC-005) |
| 1 | Tests de l'API | Terminée : `hardware/rapports/RAPPORT_PHASE_1_API.md` |
| 2, 3, 4 | Exigences, architecture, composants, schéma | Terminées : `hardware/rapports/RAPPORT_PHASES_2_3_4.md` |
| 5, 6 | Import, placement, routage | Terminées : `hardware/rapports/RAPPORT_PHASES_5_6_PCB.md` |
| 7 | Exports Gerber, BOM, CPL | Terminée : `hardware/exports/` |
| 8 | Revue finale | Terminée : `hardware/rapports/REVUE_FINALE.md` (0 bloquant) |
| 9 | Rapport de livraison | Terminée : `hardware/rapports/LIVRAISON.md` |
| 10 | Corrections de la revue à l'aveugle (session 03) | Terminée : `hardware/rapports/CORRECTIONS_REVUE.md` |

## État d'EasyEDA

Projet `FABLE52_PCB_ESP32` (`836928ac4399433ab9cd56636d997eda`), enregistré.

| Élément | État |
|---|---|
| Schematic1 | 10 pages, 136 composants. Netlist = cible (0 écart, 2026-11-15 session 03). ERC 0 erreur, 1 avertissement (PO-22) |
| PCB1 (`5457367f86d6a6ce`) | 120 × 80 mm, 4 couches, 136 composants en face supérieure, 175 vias. DRC 0 erreur. Isolement 2,34 mm hors relais, 2,2 mm dans les relais |
| Dernière modification | Session 03 : R502 97,6 k, R331 33 Ω (en place), 5 vias, notes et texte de la bande. Aucun import |

Pages du schéma : 01_ALIM_5V_3V3 `23891438148d8911`, 02_ESP32_DEVKIT `0b70001258193e30`, 03_ENTREE_PWM `9e3e9cc2c1aa5c3e`, 04_FINS_DE_COURSE `cf79095e8e4cc8c3`, 05_EXTENSION `54a4ef5528ca2c5c`, 06_RELAIS_K1_POMPE `d18f0af72a4cec22`, 07_RELAIS_K2_WATCHDOG `8e6b3fefa807e9ce`, 08_IHM_STATUS `f472b8bb88dc5069`, 09_PUISSANCE_12V_ENTREE `f974eef09e9da1fa`, 10_VERIN_OPTOS `8c889d2021e11d54`.

## Session 03 (2026-11-15 soir) : corrections de la revue à l'aveugle — terminéeRapport : `hardware/rapports/CORRECTIONS_REVUE.md`. Décisions DEC-025 à DEC-032, points PO-27 à PO-33. Brochage G6K confirmé sur le dessin Omron (DEC-025). Tout le tableau « En cours » ci-dessous est antérieur : là où il diverge, la session 03 prime (R502 = 97,6 k ; Gerber à déposer : `_R3`).**Prochaine action : Julien** suit `CORRECTIONS_REVUE.md` §5, puis commande.
## En cours au 2026-11-15 (à reprendre en premier)

Julien est sur la page de commande JLCPCB.

| Sujet | État |
|---|---|
| LED1 | C2843785 (DEC-021) partout : netlist cible, BOM, `BOM_JLCPCB_2026-11-14.csv`, schéma et PCB EasyEDA. Julien doit confirmer qu'elle est sélectionnable chez JLCPCB (PO-16) |
| LED1 dans EasyEDA | Remplacée par Julien dans le PCB, import appliqué (PO-23 clos) |
| Seconde revue | `hardware/rapports/REVUE_2_SCHEMA_ROUTAGE.md`. Aucune erreur bloquante |
| Vérin | L12-30-50-12-S, fins de course internes (PO-20 clos) |
| R502 | 110 kΩ (DEC-022), seuil de surtension 15,0 V. En place dans le schéma, le PCB, la netlist cible, la BOM et `BOM_JLCPCB_2026-11-14.csv` |
| Derniers contrôles (15, après R502) | Netlist 0 écart ; ERC 0 erreur, 1 avertissement (PO-22) ; DRC 0 ; isolement 2,34 mm |
| Sérigraphie (session 02) | Revue complète (DEC-023), puis révision 2 (DEC-024 : broches dans le cadre des borniers, titre et S/N 2,0 mm) : 0 recouvrement, 0 texte sur pastille ou via, 0 texte sous 1,0 mm, 0 à l'envers. Légendes de broches, TP, isolement, case S/N ajoutés. Restes : PO-24, PO-25. Rapport : `hardware/rapports/RAPPORT_SERIGRAPHIE.md`. DRC 0, isolement 2,34 mm, projet enregistré (uuid vérifié `836928ac4399433ab9cd56636d997eda`) |
| **En attente de Julien** | Déposer **`Gerber_FABLE52_PCB_ESP32_2026-11-15.zip`** (PO-26) et recharger `BOM_JLCPCB_2026-11-14.csv` (LED1 et R502 ont changé). CPL inchangé. Fichiers bruts `BOM_EasyEDA_*` non régénérés |
| Simulation | Julien a demandé ce qui est simulable. Réponse : table d'états et pannes simples par script ; pas de SPICE installé |

Préférence de Julien : réponses très simples, sans phrases longues.

## Ce qui reste à Julien

1. Relire `hardware/rapports/LIVRAISON.md` §4 (vérifications avant de payer) et `docs/memoire/DECISIONS.md`.
2. Commander (options : `LIVRAISON.md` §5).

## Outils (hors dépôt, DEC-015)

Dossier `C:\Users\throj\Documents\BEBL\FABLE_DRONE\_outils_fable\`. Lancer avec `node <script>`. Chaque appel vérifie l'uuid du projet et le document actif.

| Script | Rôle |
|---|---|
| `lib.mjs` | Appel du pont avec gardes |
| `gen_netlist.mjs` | Écrit `docs/architecture/netlist_cible.json` : **toute modification de netlist passe par lui** |
| `layout.mjs`, `sch_place.mjs`, `sch_wire.mjs`, `sch_unwire.mjs` | Schéma par page (`DRY=1` : contrôle géométrique seul) |
| `sch_check.mjs` | Netlist exportée contre cible, barrière, ERC |
| `gen_bom.mjs` | `hardware/bom/BOM.md`, `BOM.csv` |
| `placement.mjs`, `pcb_plan.mjs` | Plan de placement, contrôle hors ligne, application (`APPLY=1`) |
| `pcb_setup.mjs`, `pcb_rules.mjs`, `pcb_prep.mjs`, `pcb_pours.mjs`, `pcb_silk.mjs` | Contour, règles, zones d'isolement, plans, sérigraphie |
| `pcb_route.mjs`, `pcb_rip.mjs`, `pcb_fanout.mjs`, `pcb_line.mjs`, `pcb_link.mjs`, `pcb_block.mjs`, `pcb_width.mjs` | Routage et reprises contrôlées |
| `silk_dump.mjs`, `silk_check.mjs`, `silk_place.mjs`, `silk_apply.mjs`, `silk_nudge.mjs`, `silk_table.mjs`, `pcb_zoom.mjs`, `pcb_gerber.mjs` | Sérigraphie : relevé, contrôle, placement, application ; image d'une zone ; Gerber seul |
| `pcb_drc.mjs`, `pcb_iso.mjs`, `pcb_cu.mjs` | DRC détaillé, isolement indépendant, relevé du cuivre |
| `pcb_export.mjs`, `gen_jlc.mjs` | Exports (refuse si le DRC n'est pas vide), CSV JLCPCB et contrôle de cohérence |
| `sch_png.mjs` | Image de la vue affichée |
| `swap_val.mjs`, `fix_notes.mjs`, `pcb_via2.mjs` | Session 03 : échange de résistance en place, textes, second via (`pcb_export.mjs` : `DAY=…`) |

## Si une modification est demandée

1. Modifier `gen_netlist.mjs`, régénérer, modifier le schéma, relancer `sch_check.mjs` (0 écart attendu).
2. Un changement de composant ou de net demande un import vers le PCB : `pcb_import.mjs`, puis **clic « Apply » de Julien**. Les composants touchés peuvent sortir de la carte : réappliquer `pcb_plan.mjs`.
3. Re-router les nets touchés (`pcb_rip.mjs`, `pcb_route.mjs`), puis `pcb_drc.mjs`, `pcb_iso.mjs`, `pcb_export.mjs`, `gen_jlc.mjs`.
