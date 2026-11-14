# État du projet

**Dernière mise à jour :** 2026-11-14 (session 01, fin des phases 0 lecture et 1)

**Échéance :** exports prêts dimanche 15 novembre 2026 au soir. Commande JLCPCB lundi 16. Si le routage n'est pas engagé dimanche midi : prévenir Julien avec une estimation.

## Phases

| Phase | Contenu | Statut |
|---|---|---|
| 0 | Lecture des anciens dépôts, questions à Julien | Lecture faite. **Questions posées, réponse attendue** (PO-02) |
| 1 | Tests de l'API sur page jetable | **Terminée** : `hardware/rapports/RAPPORT_PHASE_1_API.md` |
| 2 | Exigences et architecture | À faire |
| 3 | Composants (codes LCSC, stock, datasheets) | À faire |
| 4 | Schéma, ERC, contrôle de netlist | À faire |
| 5 | Import PCB, contour, placement | À faire (clic « Apply » de Julien) |
| 6 | Routage, plans, DRC | À faire |
| 7 | Exports Gerber, BOM, CPL | À faire |
| 8 | Revue finale | À faire |
| 9 | Rapport de livraison | À faire |

## État d'EasyEDA

Projet `FABLE52_PCB_ESP32` (`836928ac4399433ab9cd56636d997eda`) : vierge. Schematic1 avec la page `P1` vide, PCB1 vide. La page d'essai a été supprimée.

## Prochaine action

1. Réponse de Julien aux questions Q1 à Q7 (ou application des défauts).
2. Phase 2 : `docs/exigences/EXIGENCES.md`, `docs/architecture/` (synoptique, brochage, alimentation, netlist cible). Lire le plan et le schéma Espressif de la carte de dev (PO-01, PO-03).
3. Phase 3 : BOM vérifiée, en partant de `old/PCB-PWM-ESP32-SECURIS2-V3/hardware/bom/BOM_CIBLE.csv` (validée par Julien, ESP32 DEC-027), stock revérifié.

## Sources de connaissance principales (dans `old/`)

| Sujet | Fichier |
|---|---|
| Netlist cible ESP32 validée | `PCB-PWM-ESP32-SECURIS2-V3/hardware/NETLIST_CIBLE.md` |
| Brochage v3, alimentation | `PCB-PWM-ESP32-SECURIS2-V3/docs/architecture/` |
| Règles de clarté C1 à C10 | `PCB-PWM-ESP32-SECURIS2-V3/hardware/CONSIGNES_EASYEDA_CLAUDE_CODE.md` §0.2 |
| Pièges de l'API PCB, méthode de routage | `PCB_PWM_SECURISE_V3/hardware/rapports/BRIEF_ROUTAGE.md`, `RAPPORT_PHASE_5_ROUTAGE.md` |
| Placement et isolement | `PCB_PWM_SECURISE_V3/hardware/PLACEMENT_CIBLE.md`, STM32 DEC-068 à DEC-077 |
