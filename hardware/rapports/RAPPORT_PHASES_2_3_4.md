# Rapport — Phases 2, 3 et 4 : architecture, composants, schéma

**Date :** 2026-11-14 — **Outil :** Claude Code, EasyEDA Pro V3.2.209, projet `836928ac4399433ab9cd56636d997eda`.

## Phase 2 — Exigences et architecture

| Livrable | Fichier |
|---|---|
| Exigences numérotées | `docs/exigences/EXIGENCES.md` |
| Synoptique, pont du vérin, analyse des défaillances, états au démarrage | `docs/architecture/SYNOPTIQUE.md` |
| Brochage v4 | `docs/architecture/BROCHAGE.md` |
| Alimentation | `docs/architecture/ALIMENTATION.md` |
| Netlist cible (source unique, lisible par script) | `docs/architecture/netlist_cible.json` |

Base : netlist ESP32 validée par Julien (ESP32 DEC-027), modifiée par DEC-006 à DEC-011 et DEC-013.

## Phase 3 — Composants

| Point | Résultat |
|---|---|
| Références | 46 (18 Basic, 28 Extended), 136 composants : `hardware/bom/BOM.md`, `BOM.csv` |
| Stock JLCPCB | Relevé le 2026-11-14 sur la fiche de chaque référence. Tout est disponible |
| Remplacements | TPS3430 → STWD100YNX (DEC-008) ; EL357N(C) → LTV-357T-C (DEC-009) |
| Stock faible | STWD100YNX : 179 (PO-10) ; WJ15EDGRC-3.81-07P (J5) : 2 931 ; ESD5Z5V0 : 3 227 |
| Brochages | Noms de broches des symboles LCSC relus pour chaque circuit : conformes à la netlist cible. Polarité des diodes : DEC-014 ; buzzer : DEC-013 |
| Datasheets lues ce jour | STWD100 (ST), MLT-8530 (Huaneng). Les autres : relecture en phase 8 (PO-08) |
| Montage | Tout en CMS sauf J1 à J8 et J20 à J22 (traversants, posés par JLCPCB : assemblage « Standard ») |

## Phase 4 — Schéma

| Contrôle | Résultat |
|---|---|
| Pages | 10, une fonction par page, texte bleu d'en-tête sur chacune |
| Composants | 136 / 136, code LCSC relu sur chacun |
| Broches | 407 traitées : fil nommé ou drapeau « non connecté » |
| **Netlist exportée contre netlist cible** | **0 écart** : 136 composants, 78 nets (`docs/architecture/NETLIST_EXPORTEE.md`) |
| Barrière d'isolation | Seuls K1, K2, U6, U7 touchent les deux domaines |
| **ERC** | **0 erreur, 0 avertissement** (`sch_Drc.check` renvoie une liste vide) |

### Incident corrigé

Premier câblage : des fils courts de composants empilés se touchaient (relais, transistors, SRV05-4) et fusionnaient des nets (`GND_P` avec `+5V`, par exemple). Le contrôle de netlist l'a détecté. Corrections : contrôle géométrique avant toute création de fil, empilement calculé sur l'encombrement réel, pages relais et puissance scindées en deux. Après correction : 0 écart.

### Constats sur l'API

| Constat | Parade |
|---|---|
| `getNetlistFile` peut renvoyer un état en retard juste après une création de page | Relancer le contrôle |
| Suppression de fils par lots partielle | Boucle jusqu'à 0, puis relecture |
| `getPngFile` sans réponse | `dmt_EditorControl.getCurrentRenderedAreaImage()` |
| Drapeau « non connecté » | `pin.setState_NoConnected(true)` puis `done()` |
