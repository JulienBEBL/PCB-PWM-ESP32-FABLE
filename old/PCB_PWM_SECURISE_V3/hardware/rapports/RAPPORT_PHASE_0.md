# Rapport — Phase 0 : mise en service d'EasyEDA Pro par l'API

**Date :** 2026-11-03 — **Session :** 13 (brief rédigé « session 12 ») — **Outil :** Claude Code
**Version :** EasyEDA Pro V3.2.209, Full Online ; skill easyeda-api v1.1.64 ; extension Run API Gateway v1.0.6
**Statut :** validé par Julien le 2026-11-03.

Les appels ont été envoyés au pont (port 49620) par un script Node.js placé hors du dépôt. Chaque lot d'écriture vérifiait d'abord l'uuid du projet actif (S1) et le document actif. Aucun `openProject`. Seules suppressions : le composant de test et la page ESSAI (autorisées par Julien).

## 1. Résultats des tests

| Test | Action | Résultat | Preuve (extrait de réponse) | Statut |
|---|---|---|---|---|
| T1 | `GET /health` (Julien, puis revérifié) | Pont joignable, EDA connecté | `"service":"easyeda-bridge","edaConnected":true,"edaWindowCount":1` | OK |
| T2 | `GET /eda-windows` (Julien, puis revérifié) | 1 fenêtre active, inchangée | `"windowId":"487f0313-8e2b-42db-94d6-78a7a24d0ead","connected":true,"active":true` | OK |
| T3 | `dmt_Project.getCurrentProjectInfo()` (Julien, puis revérifié) | Bon projet, identifié par uuid | `"uuid":"b4788f45338c4e59bfcfdff2832a8063","friendlyName":"PCB_PWM_SECURISE_V3"` | OK |
| T4 | Structure (Julien), relue en fin de session par `dmt_Board.getAllBoardsInfo()` | Board1 → Schematic1 (P1) + PCB1 ; inchangée après T5 | `"name":"Board1"`, schematic `ae5a2752b4ccbe86`, page `f8ce52c8d36cc38e`, pcb `9e5b12b9217a84a5` | OK |
| T5.1 | `dmt_Schematic.createSchematicPage`, `modifySchematicPageName`, `openDocument`, `sch_Document.save` | Page ESSAI créée, active, enregistrée | `"page":"25bb9c90547279fa","renamed":true,"saved":true` | OK |
| T5.2 | `lib_Device.getByLcscIds("C432212")` | Composant résolu dans la bibliothèque LCSC | `"supplierId":"C432212","manufacturerId":"STM32G071CBT6","footprintName":"LQFP-48_L7.0-W7.0-P0.50-LS9.0-BL"` | OK |
| T5.3 | `sch_PrimitiveComponent.create(..., 400, 400, "", 0, false, true, true)` puis `save` | Composant placé | `"id":"f6a73df3322a8455","designator":"U?","saved":true` | OK |
| T5.4 | `getAllPinsByPrimitiveId` | 48 broches ; noms identiques au CSV de brochage | `35;PA13;500;385`, `36;PA14-BOOT0;500;395`, `1;PC13;300;515` | OK |
| T5.5 | Relecture par `get` (objet relu, pas celui de `create`) | Attributs fournisseur tous présents | Voir §2 | OK |
| T5.6 | Modification partielle (`modify`, repère seul) puis S4 (`modify`, 5 attributs en un appel) | Aucun attribut perdu | Voir §2 | OK |
| T5.7 | `sch_PrimitiveComponent.delete`, `openDocument(P1)`, `deleteSchematicPage`, `save` | Composant et page supprimés | `"deleted":true`, `"pageDeleted":true`, pages : `[{"name":"P1"}]` | OK |
| T6 | `sch_Drc.check(strict, false, true)` et `check(strict, false, false)` | ERC disponible par l'API, totaux seulement | Avec composant : `[{"type":"warn","count":2}]`, strict = `false`. Schematic1 vide : `[]`, strict = `true`, non strict = `true` | OK (totaux) |

Comparaison des broches : 48 / 48 noms conformes à `hardware/brochage_stm32g071cbt6.csv`. Six libellés du symbole sont plus longs que ceux du CSV, sans écart de fonction : 2 `PC14-OSC32_IN`, 3 `PC15-OSC32_OUT`, 6 `VDD/VDDA`, 7 `VSS/VSSA`, 33 `PA11[PA9]`, 34 `PA12[PA10]`. Broches à x = 300 (côté gauche, 1 à 24) et x = 500 (côté droit, 25 à 48), pas de 10 unités (0,1 inch).

Durée des appels : tous inférieurs à 3 s (S11 respectée). ERC : 11 à 101 ms.

## 2. Défaut S4 (attributs fournisseur)

| Attribut | Attendu (bibliothèque, T5.2) | Lu après placement | Lu après modification partielle | Lu après S4 |
|---|---|---|---|---|
| Nom | `={Manufacturer Part}` | `={Manufacturer Part}` | identique | identique |
| Fabricant | `ST(意法半导体)` | `ST(意法半导体)` | identique | identique |
| MPN | `STM32G071CBT6` | `STM32G071CBT6` | identique | identique |
| Fournisseur | `LCSC` | `LCSC` | identique | identique |
| Code LCSC | `C432212` | `C432212` | identique | identique |
| Empreinte | `LQFP-48_L7.0-W7.0-P0.50-LS9.0-BL` | identique | identique | identique |
| `JLCPCB Part Class` | `Extended Part` | `Extended Part` | identique | identique |
| Propriétés annexes | — | 18 | 18 | 18 |
| Repère | `U?` | `U?` | `U99` (modifié) | `U99` |

**Conclusion : défaut infirmé en V3.2.209**, pour un placement par `create` et une modification partielle par `modify`, avec relecture après enregistrement. La réécriture S4 en un appel fonctionne et ne dégrade rien.

Limites **[Hypothèse]** : un seul composant testé ; pas de test de rotation, de déplacement ni de modification par `toAsync()` / `setState_*` / `done()` ; pas de test de transfert vers le PCB.

Observation : le composant placé référence une copie locale au projet (`component.uuid` = `d2289c1c04cab79d`, footprint `09cdcafcaa05c09f`), distincte de l'entrée de bibliothèque (`d670a6f5425c477b9e8df4d1181534dc`). **[Hypothèse]** EasyEDA copie le composant dans la bibliothèque du projet au placement ; cette copie peut subsister après la suppression du composant. Sans conséquence sur la carte.

## 3. Incident Full Offline / Full Online

**[Exprimé]** Pendant l'installation, Julien est passé par erreur en Full Offline, puis revenu en Full Online (conforme à DEC-063).

Constats :

- En Full Offline, le menu API Gateway et l'espace Personal disparaissent. L'extension n'est pas chargée : le pont ne peut pas se connecter.
- Un projet local nommé `PCB_PWM_SECURISE_V3` a pu être créé pendant cette période. Il n'a été ni ouvert, ni utilisé, ni supprimé.

Conséquences :

- Deux projets peuvent porter le même nom. Le contrôle S1 se fait désormais par uuid (`b4788f45338c4e59bfcfdff2832a8063`). Appliqué à chaque lot d'écriture de cette session.
- **[Hypothèse]** Le « mode local » du retour d'expérience JLCPCB (V3.2.149) n'est pas le Full Offline, puisque l'extension n'y est pas accessible. Il s'agit vraisemblablement du Half Offline (non testé). Aucun repli vers un mode local n'est disponible en Full Offline.

## 4. Défauts connus (consignes §10)

| Défaut (V3.2.149) | V3.2.209 Full Online | Commentaire |
|---|---|---|
| Attributs fournisseur perdus après placement ou modification partielle | **Infirmé** | §2. S4 conservée par prudence, coût nul |
| « Wire has multiple net names » | Non testé | Aucun fil tracé. À qualifier en phase 3 |
| Export de netlist bloqué | Non testé | À qualifier en phase 3 (V1) |
| ERC / DRC : totaux seulement | **Confirmé** pour l'ERC | `includeVerboseError = true` renvoie `[{type, count}]` par catégorie, sans repère ni message. DRC PCB non testé |
| `importChanges()` attend un clic « Apply » | Non testé | Phase 4 |
| Pont arrêté par manque de mémoire en tâche de fond | Sans objet | Pont lancé par Julien dans une fenêtre séparée. Aucune coupure pendant la session |
| Extension : arrêt après 5 échecs de connexion | Non testé | Aucun incident de connexion |

## 5. Écarts par rapport aux consignes et au guide

| N° | Écart | Correction proposée |
|---|---|---|
| C1 | S1 et T3 identifient le projet par son nom ; un doublon de nom est possible (§3) | Consignes S1 et T3 : identifier le projet par son uuid `b4788f45338c4e59bfcfdff2832a8063` |
| C2 | Libellés des options de l'extension en V3.2.209 : « Allow interactive with external », « Show at header menu » | Guide §2 étape 6 et §5 ; consignes §1 : libellés réels, ancien libellé entre parenthèses |
| C3 | Le guide ne précise pas le mode | Guide §2 et §5 : Full Online obligatoire ; en Full Offline, menu API Gateway et espace Personal absents |
| C4 | Appels `POST /execute` depuis PowerShell : échappement des guillemets | Guide §3 : JSON dans un fichier, `curl.exe ... --data-binary "@fichier.json"` |
| C5 | PO-34 et défauts connus à mettre à jour | Consignes §1 : retirer l'hypothèse non testée ; §10 : ajouter une colonne « V3.2.209 » avec les statuts du §4 |
| C6 | Les attributs du fabricant contiennent des caractères non ASCII (`ST(意法半导体)`). `Set-Content -Encoding ascii` les corrompt | Guide §3 : fichier JSON en UTF-8 sans BOM. Côté Claude Code : script Node.js (`fetch`) hors dépôt, sans fichier intermédiaire |
| C7 | Casse des noms incohérente selon la méthode : `getSchematicPageInfo` et `getAllBoardsInfo` renvoient `essai`, `p1`, `schematic1` ; `getAllSchematicPagesInfo` renvoie `ESSAI`, `P1` | Consignes §4, nouvelle règle : identifier pages et documents par uuid ; comparer les noms sans tenir compte de la casse |
| C8 | `sch_Drc.check` en mode strict échoue dès qu'il y a un avertissement | Consignes V3 : critère « 0 erreur » lu sur le mode non strict ; avertissements justifiés par le journal collé par Julien |
| C9 | Le document actif conditionne les API SCH ; la suppression d'une page s'est faite après activation d'une autre page | Consignes §4 : vérifier le document actif (`getCurrentDocumentInfo`) avant chaque lot ; ne jamais supprimer la page active |

## 6. Conclusion sur PO-34

**Compatible** sur le périmètre de la phase 0. **[Reco]** Clore PO-34.

Fonctionnent en V3.2.209 Full Online : pont et extension, lecture du projet, création / renommage / suppression de page, résolution LCSC, placement, relecture des broches et des attributs, modification, enregistrement, ERC (totaux). Le défaut « attributs perdus » n'est pas reproduit.

Non testé à ce stade : fils et étiquettes de net, export de netlist, `importChanges()`, API PCB et DRC. **[Reco]** Ouvrir PO-38 pour les qualifier au premier usage (phases 3 à 5), sans bloquer la phase 1.

## 7. Questions pour Julien

**[Décidé]** Julien : « Oui, tout valider » : rapport, clôture de PO-34, ouverture du point des défauts non testés, corrections C1 à C9 (appliquées en session 13), recommandations des questions 3 et 5. Question 4 : à la main de Julien. Le point des défauts non testés est numéroté **PO-38** : PO-35 à PO-37 ont été attribués en parallèle par la session 12.

1. Validez-vous ce rapport et la clôture de PO-34, avec ouverture de PO-38 (défauts non testés) ?
2. Appliquer les corrections C1 à C9 aux consignes et au guide ?
3. ERC de contrôle : les 2 avertissements relevés avec le composant seul (non connecté) ne sont pas détaillés par l'API. Utile de les voir dans l'éditeur ? **[Reco]** Non : le composant est supprimé, et le cas se reproduira en phase 3 avec un journal réel.
4. Le projet local créé en Full Offline : vous le supprimez vous-même ou il reste ignoré ?
5. Versionnement de `hardware/PASSATION_PHASE_0.md` (non suivi) et du brief de session 12 (collé dans la conversation, absent du clone) : **[Reco]** versionner la passation sous `hardware/rapports/PASSATION_PHASE_0.md` et le brief sous `hardware/rapports/BRIEF_SESSION_12.md`.
