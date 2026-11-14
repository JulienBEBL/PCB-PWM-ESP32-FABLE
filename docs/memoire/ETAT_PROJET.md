# État du projet

**Dernière mise à jour :** 2026-11-14 (session 01, fin de la phase 4)

**Échéance :** exports prêts dimanche 15 novembre 2026 au soir. Commande JLCPCB lundi 16. Si le routage n'est pas engagé dimanche midi : prévenir Julien avec une estimation.

## Phases

| Phase | Contenu | Statut |
|---|---|---|
| 0 | Lecture des anciens dépôts, questions à Julien | **Terminée** (DEC-005) |
| 1 | Tests de l'API | **Terminée** : `hardware/rapports/RAPPORT_PHASE_1_API.md` |
| 2 | Exigences et architecture | **Terminée** : `docs/exigences/`, `docs/architecture/` |
| 3 | Composants | **Terminée** : `hardware/bom/BOM.md` (stock relevé le 2026-11-14) |
| 4 | Schéma, ERC, contrôle de netlist | **Terminée** : 0 écart, ERC 0 / 0 (`hardware/rapports/RAPPORT_PHASES_2_3_4.md`) |
| 5 | Import PCB, contour, placement | **En cours** : `importChanges` lancé, **attend le clic « Apply » de Julien** dans EasyEDA |
| 6 | Routage, plans, DRC | À faire |
| 7 | Exports Gerber, BOM, CPL | À faire |
| 8 | Revue finale | À faire (PO-08, PO-09, PO-10 à traiter) |
| 9 | Rapport de livraison | À faire |

## État d'EasyEDA

Projet `FABLE52_PCB_ESP32` (`836928ac4399433ab9cd56636d997eda`). Schematic1 : 10 pages, 136 composants. PCB1 (`5457367f86d6a6ce`) : vide tant que l'import n'est pas appliqué.

| Page | uuid |
|---|---|
| 01_ALIM_5V_3V3 | `23891438148d8911` |
| 02_ESP32_DEVKIT | `0b70001258193e30` |
| 03_ENTREE_PWM | `9e3e9cc2c1aa5c3e` |
| 04_FINS_DE_COURSE | `cf79095e8e4cc8c3` |
| 05_EXTENSION | `54a4ef5528ca2c5c` |
| 06_RELAIS_K1_POMPE | `d18f0af72a4cec22` |
| 07_RELAIS_K2_WATCHDOG | `8e6b3fefa807e9ce` |
| 08_IHM_STATUS | `f472b8bb88dc5069` |
| 09_PUISSANCE_12V_ENTREE | `f974eef09e9da1fa` |
| 10_VERIN_OPTOS | `8c889d2021e11d54` |

## Outils (hors dépôt, DEC-015)

Dossier `C:\Users\throj\Documents\BEBL\FABLE_DRONE\_outils_fable\`. Lancer avec `node <script>`.

| Script | Rôle |
|---|---|
| `lib.mjs` | Appel du pont avec garde d'uuid (projet, document actif) |
| `gen_netlist.mjs` | Écrit `docs/architecture/netlist_cible.json` (toute modification de netlist passe par lui) |
| `layout.mjs`, `sch_place.mjs`, `sch_wire.mjs`, `sch_unwire.mjs` | Placement et câblage du schéma par page (`DRY=1` : contrôle géométrique seul) |
| `sch_check.mjs` | Netlist exportée contre cible, barrière, ERC ; écrit `NETLIST_EXPORTEE.md` |
| `sch_png.mjs` | Image d'une page (ou du PCB) dans `state/` |
| `gen_bom.mjs` | BOM vérifiée |
| `pcb_import.mjs` | Import schéma → PCB (`COUNT=1` : compte seulement) |
| `state/` | Identifiants des composants et fils créés, images |

## Prochaine action

1. Julien clique « Apply » sur la fenêtre d'import du PCB (ou la session relance `node pcb_import.mjs`).
2. Phase 5 : contour 120 × 80 mm, 4 trous M3 à 4 mm des bords, 4 couches, placement (règles : `old/PCB_PWM_SECURISE_V3/hardware/PLACEMENT_CIBLE.md`, STM32 DEC-068 à DEC-077 ; carte de dev à gauche, USB au bord gauche).
3. Phase 6 : routage par l'API (`pcb_Document.autoRouting` par lots de nets, pièges : `old/PCB_PWM_SECURISE_V3/hardware/rapports/BRIEF_ROUTAGE.md` §8).
