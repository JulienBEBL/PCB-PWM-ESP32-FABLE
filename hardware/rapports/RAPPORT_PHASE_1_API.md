# Rapport — Phase 1 : tests de l'API EasyEDA

**Date :** 2026-11-14 — **Outil :** Claude Code, EasyEDA Pro V3.2.209 Full Online, pont `easyeda-api` port 49620.
**Projet :** `FABLE52_PCB_ESP32`, uuid `836928ac4399433ab9cd56636d997eda` (vérifié avant chaque écriture).

## 1. Résultats

| N° | Test | Résultat |
|---|---|---|
| T1 | `GET /health` | OK : `service = easyeda-bridge`, `edaConnected = true`, 1 fenêtre |
| T2 | Lecture du projet actif | OK : Board1, Schematic1 (page P1), PCB1, Panel1 |
| T3 | Création d'une page (`dmt_Schematic.createSchematicPage`) et renommage `ESSAI` | OK. Le nom relu juste après est encore `P2` ; correct à l'appel suivant |
| T4 | Recherche LCSC (`lib_Device.getByLcscIds('C25804')`) | OK : uuid, empreinte, classe « Basic Part », attributs complets |
| T5 | Placement (`sch_PrimitiveComponent.create` avec le nom du sous-ensemble) | OK : code LCSC, fabricant, référence, empreinte présents sur le composant posé |
| T6 | Relecture des broches (`getAllPinsByPrimitiveId`) | OK : numéro, nom, position |
| T7 | Modification (`modify` : position, rotation, repère) | OK ; attributs fournisseur conservés |
| T8 | Fil nommé (`sch_PrimitiveWire.create(line, net)`) | OK. `getAll()` appelé dans le même script ne voit pas encore le fil ; visible à l'appel suivant |
| T9 | ERC (`sch_Drc.check(false, false, true)`) | Totaux seulement (`[{type:'warn', count:2}]`) |
| T10 | Netlist par `sch_Netlist.getNetlist()` | **Sans réponse** (défaut connu, STM32 PO-38) |
| T11 | Netlist par `sch_ManufactureData.getNetlistFile()` | **OK** : JSON complet (composants, attributs, broches → nets). **Nouveau** par rapport aux anciens dépôts |
| T12 | Suppression du fil, du composant, enregistrement, suppression de la page | OK ; il reste la page `P1` seule |

## 2. Règles d'usage retenues

Reprises des consignes STM32 S1 à S15 (old/PCB_PWM_SECURISE_V3/hardware/CONSIGNES_EASYEDA_CLAUDE_CODE.md) et de STM32 PO-38, revérifiées ici quand c'était possible.

| N° | Règle | Statut |
|---|---|---|
| A1 | Chaque script commence par la vérification de l'uuid du projet et du document actif | Vérifié |
| A2 | Code en `await` / `return`, un appel < 30 s ; toute méthode à risque est enveloppée dans un `Promise.race` avec délai | Vérifié |
| A3 | Composant : `getByLcscIds`, puis `lib_Device.get(...).subPartNames[0]` passé à `create` | Vérifié |
| A4 | Unités schéma : 0,01 pouce. Les broches d'une résistance 0603 sont à ±20 unités du centre | Vérifié |
| A5 | Relire dans un **appel séparé** après une création (état pas toujours à jour dans le même script) | Constaté (T3, T8) |
| A6 | Étiquette de net = nom du fil (`create(line, net)`). Ne pas utiliser `createNetLabel` | Repris STM32 S6 |
| A7 | Netlist : `sch_ManufactureData.getNetlistFile()` ; jamais `sch_Netlist.getNetlist()` | Vérifié |
| A8 | ERC : totaux par l'API ; le détail se lit dans l'éditeur (Julien) ou se déduit de la netlist | Vérifié |
| A9 | Ne jamais supprimer la page active ; activer une autre page d'abord | Repris STM32 S13, appliqué |
| A10 | Erreur passagère (`cmdKey`, `create failed!`) : relire l'état, une seule nouvelle tentative ; 3 échecs = contournement ou arrêt | Repris STM32 S15 |
| A11 | PCB : `importChanges` attend le clic « Apply » de Julien ; recalculer les plans (`rebuildCopperRegion`) avant tout DRC ; supprimer un identifiant à la fois ; extrémités de pistes exactes | Repris STM32 PO-38, à revérifier en phase 5 |
| A12 | `autoRouting` : lister les nets, vérifier par le DRC ; `getDsnFile` + Freerouting inutilisable | Repris STM32 PO-38 |
