# État du projet

**Dernière mise à jour :** 2026-11-12 (session 14, routage interrompu)

## Phase en cours

| Phase | Statut |
|---|---|
| 1. Analyse du CdCF de référence | Terminée |
| 2. Définition du besoin | **En cours** |
| 3. Choix du matériel principal (vérin, MCU, relais, protections) | Références sélectionnées : `hardware/BOM_CIBLE.md` v1, **G1 validé** (DEC-064). Lignes AV / AD soumises à leurs PO |
| 4. Rédaction du CdCF projet | À faire |
| 5. Spécification de la FSM | À faire (Julien la décrira) |
| 6. Schéma EasyEDA Pro | **Saisie complète** (10 pages, 198 composants). V1 sans écart, isolation conforme, ERC 0 erreur 0 avertissement. Jalon **G3** à valider par Julien (`hardware/rapports/RAPPORT_PHASE_3_LOT_3.md`). Câblage externe : `hardware/CABLAGE.drawio` |
| 7. PCB et commande JLCPCB | **PCB1 créé** (198 composants, 115 nets). Carte **120 × 80 mm** (DEC-072), 4 trous M3, borniers à vis enfichables + Dupont (DEC-071, DEC-073), 7 points de test, sérigraphie vérifiée (DEC-075). Isolement ≥ 2 mm, sans fente (DEC-069). 4 couches S / GND / Alim / S (DEC-070), appliqué à PCB1. **Routage G5 en cours** (`hardware/rapports/RAPPORT_PHASE_5_ROUTAGE.md`) : côté puissance routé ; côté commande partiellement arraché pour un **re-placement local autour de U1** (21 composants déplacés ≤ 1,72 mm, autorisé par Julien). Dernier DRC : 52 nets ouverts, 6 erreurs d'écart à reprendre (PO-43). Isolement composants 2,47 mm, 0 chevauchement. G4 à valider par Julien |
| 8. Firmware | À faire |
| 9. Essais et validation | À faire |

## Synthèse technique actuelle

- Entrée : PWM 1000–2000 µs, ~50 Hz, câble ≤ 20 cm, masse commune avec le 5 V.
- Alimentation carte : 5 V externe, budget 500 mA (hypothèse).
- Protection 12 V : conçue pour une source non maîtrisée (DEC-034).
- Actionneur : série Actuonix L12-S, 12 V fourni directement par le système. Course utile 3 ± 1 mm. Effort ≈ 30 N vers la sortie (estimation). Position sûre = tige rentrée.
- Version proposée : **L12-10-210-12-S** (seule réduction qui rentre contre 30 N et retient 30 N sans moteur). Non validée.
- Puissance : 2 relais DPDT. Relais au repos = retour sûr. Action = 2 relais excités. 12 V isolé du 5 V.
- Barrières : logiciel (FSM), cavalier physique sur la chaîne d'action, blocage mécanique, arrêt matériel en position d'action par 5e contact (DEC-029).
- Diagnostic : relecture des relais, présence 12 V par opto, 4 fins de course (2 par extrémité).
- CEM : EN 61000-6-2, ESD niveau 4. IEM : inspiré MIL-STD-461G, sans revendication.
- Fins de course : contacts inverseurs, lecture antivalente NO + NC, 8 entrées (DEC-037).
- MCU : **STM32G071CBT6 LQFP48** (DEC-036), soudé sur le PCB (DEC-035), assemblé par JLCPCB. Plan de brochage **v2** vérifié sur DS12232 Rev 5 : `docs/architecture/PLAN_BROCHAGE_MCU.md`. Liste des E/S validée avec X01 à X08 (DEC-039). Quartz HSE monté (DEC-060).
- Firmware : C++ / Arduino (STM32duino), débogage SWD par ST-LINK.
- Programmation : USB-C → CH340C → bootloader ROM (boutons BOOT + RESET), moniteur série USB ; SWD (J9) en recours. Procédure : `hardware/PROCEDURE_PROGRAMMATION.md` (DEC-066).
- Conception : Claude Code pilote EasyEDA Pro V3.2.209 par l'API, jalons G1 à G5 validés par Julien (`hardware/CONSIGNES_EASYEDA_CLAUDE_CODE.md`). Assemblage complet JLCPCB (DEC-062).
- Dépôt sous licence Apache 2.0.

## Points bloquants

| N° | Sujet |
|---|---|
| PO-18 | Valider la version du vérin (essais de Julien prévus mercredi) |
| PO-19 | Intégration de l'arrêt matériel (position, pouvoir de coupure) |
| PO-03 | Plage de tension du 12 V (vérin limité à 13,5 V) |
| PO-05 | Description de la FSM |

## Prochaine étape

1. Julien : valider G3 (schéma) ; supprimer la page vide `P5_VIDE_A_SUPPRIMER` ; revue visuelle de PCB1 ; revue du synoptique et du brochage (PO-30).
2. **Routage G5 : reprendre avec `hardware/rapports/BRIEF_ROUTAGE.md` §0.** Julien relance EasyEDA et le pont. Claude relit l'état (PO-43 : `rebuild.mjs`, `pcbdrc2.mjs`, `isochk.mjs`), supprime les 5 segments en conflit si besoin, puis autoroute les 52 nets par lots (`chunks.mjs`, puis `RETRY=1`, puis `OPEN=1`). Si le plafond revient : Julien finit à la main au routeur interactif. Ensuite remplissages L1 / L4, couture, sérigraphie, contrôles finaux.
3. Julien : retour des essais vérin (PO-18), PO-19, PO-22, PO-23, PO-27, PO-32, PO-33.
4. Julien décrit la FSM (PO-05). Claude la formalise.
5. Claude rédige le CdCF projet dans `docs/cdcf/`.
