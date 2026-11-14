# Passation — Phase 0 EasyEDA Pro + Claude Code

**Statut :** passation de la session d'installation (2026-11-03) vers la session 12.
**Lecteur :** Claude Code, ouvert dans le dépôt `PCB_PWM_SECURISE_V3`, sans aucun contexte préalable.
**Objet :** tout ce qu'il faut savoir pour terminer la phase 0 (tests T5, T6, rapport) sans refaire ce qui est déjà validé.

---

## 0. Ordre de lecture

1. `CLAUDE.md` et la mémoire projet (`docs/memoire/` : `DECISIONS.md`, `POINTS_OUVERTS.md`, `ETAT_PROJET.md`, `JOURNAL.md`).
2. `hardware/CONSIGNES_EASYEDA_CLAUDE_CODE.md` — **fait foi** (règles S1 à S11, vérifications V1 à V8, phase 0 §9, défauts connus §10).
3. `hardware/INSTALLATION_EASYEDA_API.md` — procédure d'installation et routine de session.
4. Ce document.
5. Le skill `easyeda-api` (`%USERPROFILE%\.claude\skills\easyeda-api\SKILL.md`) et ses références (`references/classes/`, `references/enums/`, `references/_quick-reference.md`).

En cas de contradiction entre ce document et les consignes : les consignes l'emportent, et tu signales l'écart à Julien.

## 1. Contexte en bref

- Projet : carte `PCB_PWM_SECURISE_V3` (commande sécurisée de vérin par PWM, MCU STM32G071CBT6, domaine commande 5 V / 3,3 V isolé d'un domaine puissance 12 V).
- Méthode (DEC-061) : schéma → retouche et validation par Julien → routage → retouche et validation par Julien. Claude Code pilote EasyEDA Pro par l'API ; Julien valide à chaque jalon (G1 à G5).
- Outil (DEC-063) : EasyEDA Pro V3.2.209, client desktop, mode **Full Online**.
- Assemblage JLCPCB (DEC-062) : composants LCSC uniquement.
- Phase en cours : **phase 0, mise en service**. Elle doit conclure sur **PO-34** (compatibilité du skill et de l'extension avec la V3.2.209 en Full Online, et persistance du défaut « attributs fournisseur perdus »).

## 2. Installation — état au 2026-11-03

| Élément | État | Détail |
|---|---|---|
| Node.js | ✅ | v24.21.0 (npm 11.19.0) |
| Git for Windows | ✅ | 2.52.0 |
| Skill `easyeda-api` | ✅ | v1.1.64, cloné dans `%USERPROFILE%\.claude\skills\easyeda-api`, `SKILL.md` à la racine. `npm install` : 1 dépendance (`ws`), 0 vulnérabilité. Claude Code le reconnaît comme skill. |
| Extension Run API Gateway | ✅ | v1.0.6, `engines.eda ~3.2.0`, licence Apache-2.0, activée. Fichier source : `C:\Users\Julien\Downloads\run-api-gateway_v1.0.6.eext`. |
| Options de l'extension | ✅ | Cochées : **« Allow interactive with external »**, **« Show at header menu »**, « Auto update ». Les libellés réels de la V3.2.209 diffèrent de ceux de la doc (« Allow External Interaction », « Show in Top Menu ») : écart à signaler dans le rapport. |
| Menu API Gateway | ✅ | Visible dans la barre du haut, **uniquement en Full Online** (voir §4). |
| Projet EasyEDA | ✅ | `PCB_PWM_SECURISE_V3` créé dans l'espace **Personal** (en ligne), ouvert et actif. |
| Pont (bridge) | ✅ | Lancé par Julien dans une fenêtre PowerShell séparée, port **49620**. EasyEDA affiche « Bridge connected (port 49620) ». |
| Freerouting / Java | — | Non installés (phase 5 seulement, si retenu). |

## 3. Identifiants du projet (relevés par l'API)

| Élément | Valeur |
|---|---|
| Projet `friendlyName` | `PCB_PWM_SECURISE_V3` |
| Projet `name` | `JulienBEBL/PCB_PWM_SECURISE_V3` |
| Projet `uuid` | `b4788f45338c4e59bfcfdff2832a8063` |
| `teamUuid` (espace Personal) | `42c70553000c42ed8daf0c8ba5065088` |
| Board | `Board1` |
| Schéma | `Schematic1`, uuid `ae5a2752b4ccbe86` |
| Page de schéma | `P1`, uuid `f8ce52c8d36cc38e`, format A4, créée le 2026-11-03 à 15:54 |
| PCB | `PCB1`, uuid `9e5b12b9217a84a5` |
| Panel | `Panel1`, uuid `ddb0ba0de624e2b9` |
| Fenêtre EDA | `windowId` `487f0313-8e2b-42db-94d6-78a7a24d0ead` (change à chaque redémarrage d'EasyEDA) |

**Règle S1 :** avant chaque lot d'écriture, vérifier que le projet actif a bien l'uuid `b4788f45338c4e59bfcfdff2832a8063`. Sinon : arrêt.

## 4. Incident : Full Offline / Full Online

- Pendant l'installation, EasyEDA est passé en **« Full Offline »**. Dans ce mode : le menu **API Gateway** disparaît, de même que l'espace Personal, le compte et les notifications. L'extension n'est pas chargée, donc le pont ne peut pas se connecter.
- Un projet `PCB_PWM_SECURISE_V3` a probablement été créé **en local** pendant cette période. **Il ne doit pas être utilisé.** Seul le projet en ligne (uuid ci-dessus) est valide. Julien le supprimera ou l'ignorera.
- Julien est revenu en **Full Online**, ce qui est conforme à DEC-063. L'extension et le pont fonctionnent dans ce mode.
- À mentionner dans le rapport : l'extension n'est disponible qu'en Full Online (constat sur cette installation). C'est aussi une précision à proposer pour `INSTALLATION_EASYEDA_API.md` (dépannage).

## 5. Tests de phase 0 déjà réalisés (lecture seule)

Réalisés le 2026-11-03 vers 15:55, depuis une autre session Claude Code. **Aucune écriture dans le projet.**

| N° | Test | Résultat | Preuve |
|---|---|---|---|
| T1 | `GET /health` | ✅ | `{"service":"easyeda-bridge","status":"ok","edaConnected":true,"edaWindowCount":1,"pendingRequests":0}` |
| T2 | `GET /eda-windows` | ✅ | 1 fenêtre, `connected: true`, `active: true` |
| T3 | `eda.dmt_Project.getCurrentProjectInfo()` | ✅ | `friendlyName: PCB_PWM_SECURISE_V3`, owner `JulienBEBL`, uuid ci-dessus |
| T4 | Structure du projet | ✅ | Board1 → Schematic1 (page P1) + PCB1 ; Panel1. Conforme à ce que Julien a créé. |
| T5 | Placement C432212, broches, attributs, suppressions | ⏳ | **À faire** |
| T6 | ERC par l'API | ⏳ | **À faire** |

Premier résultat pour PO-34 : la **lecture** par l'API fonctionne en V3.2.209 Full Online. L'écriture et le défaut S4 restent à tester.

## 6. Comment appeler le pont depuis Windows

Le pont expose :
- `GET http://localhost:49620/health`
- `GET http://localhost:49620/eda-windows`
- `POST http://localhost:49620/execute`, corps `{"code": "..."}` : exécute du JavaScript dans EasyEDA. Le résultat est renvoyé par `return`, et la réponse vaut `{"success":true,"result":...,"windowId":...}`.

Si le port a changé (49620 à 49629), lis-le dans la fenêtre du pont ou essaie les ports un par un sur `/health`.

**Méthode éprouvée (PowerShell)** : écrire le JSON dans un fichier temporaire, puis l'envoyer avec `--data-binary`. Ça évite tous les problèmes d'échappement des guillemets.

```powershell
$body = '{"code":"const p = await eda.dmt_Project.getCurrentProjectInfo(); return JSON.stringify(p);"}'
$f = "$env:TEMP\eda_call.json"
Set-Content -Path $f -Value $body -Encoding ascii
curl.exe -s -X POST http://localhost:49620/execute -H "Content-Type: application/json" --data-binary "@$f"
```

Remarques :
- `Set-Content -Encoding ascii` convient tant que le code ne contient pas de caractères accentués. Sinon, utiliser un encodage UTF-8 **sans BOM**.
- Claude Code demandera l'autorisation pour `curl` vers `localhost` : Julien l'accepte pour la session.
- **Ne lance pas le pont toi-même et ne l'arrête pas**. Il tourne dans une fenêtre PowerShell séparée, car lancé en tâche de fond de Claude Code, il s'est arrêté par manque de mémoire dans le retour d'expérience JLCPCB.

## 7. Règles de code envoyé à EasyEDA (rappel S10, S11 et skill)

- Une seule ligne, sans commentaire, un `await` sur chaque promesse, résultat renvoyé par `return` (de préférence `JSON.stringify(...)`).
- **Lire la signature exacte** dans `references/classes/<Classe>.md` avant chaque méthode : types, ordre des paramètres, remarques (section « 备注 »).
- Valeurs d'énumération par leur **nom** (`references/enums/`), jamais par leur valeur numérique.
- **Unités** : en schéma, 1 unité = 0,01 inch = 10 mil = 0,254 mm ; en PCB, 1 unité = 1 mil. Erreur fréquente : un facteur 10 sur la position.
- `sch_PrimitiveComponent.create` attend un objet `{libraryUuid, uuid}`, pas une chaîne.
- Les modifications de primitives passent par `get` → `toAsync()` → `setState_*` → `done()` (voir le skill), ou par `modify` selon la signature.
- Vérifier le document actif (`eda.dmt_SelectControl.getCurrentDocumentInfo()`) : les API SCH exigent un schéma actif.
- Chaque appel doit finir en **moins de 30 s**. Enregistrer le document après chaque lot (`eda.sch_Document.save`, vérifier la signature).
- **Jamais d'`openProject`** (S2 : perte possible des modifications non enregistrées).

### Méthodes probablement utiles pour T5 et T6 (à vérifier dans `references/`)

| Besoin | Méthode |
|---|---|
| Pages du schéma | `eda.dmt_Schematic.getCurrentSchematicAllSchematicPagesInfo()`, `getAllSchematicPagesInfo()` |
| Créer, renommer, supprimer une page | `eda.dmt_Schematic.createSchematicPage`, `modifySchematicPageName`, `deleteSchematicPage` |
| Activer un document | `eda.dmt_EditorControl.openDocument` / `activateDocument` |
| Trouver C432212 | `eda.lib_Device.getByLcscIds(...)` ou `eda.lib_Device.search(...)` |
| Placer, lire, modifier, supprimer un composant | `eda.sch_PrimitiveComponent.create`, `get`, `getAll`, `getAllPropertyNames`, `modify`, `delete` |
| Broches | `eda.sch_PrimitiveComponent.getAllPinsByPrimitiveId(...)` |
| Enregistrer | `eda.sch_Document.save(...)` |
| ERC | `eda.sch_Drc.check(...)` |

## 8. Travail à faire

1. **Revérifier T1 et T3** : le pont ou la fenêtre ont pu changer depuis. Si le projet actif n'est pas l'uuid `b4788f45338c4e59bfcfdff2832a8063` : arrêt (S1).

2. **T5, sur une page de test `ESSAI`** créée dans `Schematic1`. **Ne pas toucher à P1.**
   1. Créer la page `ESSAI`, l'activer, vérifier le document actif.
   2. Résoudre C432212 dans la bibliothèque LCSC (`lib_Device`), relever son uuid, son `libraryUuid` et ses attributs de bibliothèque (code LCSC, MPN, fabricant, nom).
   3. Placer le composant à une position raisonnable (unités du schéma !), puis enregistrer.
   4. Relire les positions de ses broches (S5).
   5. Relire ses attributs fournisseur et les comparer à ceux de la bibliothèque.
   6. Si des attributs manquent ou diffèrent, appliquer le contournement **S4** : réécrire tous les attributs fournisseur en **un seul appel**, relire, comparer. Noter si le défaut connu en V3.2.149 est **confirmé** en V3.2.209.
   7. Supprimer le composant, enregistrer, puis supprimer la page `ESSAI`. **Julien autorise ces deux suppressions, et seulement celles-ci.**
   8. Relire la structure du projet : elle doit être identique au §3 (Board1, Schematic1/P1, PCB1, Panel1).

3. **T6 : ERC par l'API** sur `Schematic1` (`sch_Drc.check`). Relever ce qui est renvoyé (totaux seulement, d'après le §10 des consignes). Si le détail est nécessaire, demander à Julien de coller le journal ERC depuis l'onglet DRC/Log d'EasyEDA.

4. **Rapport** `hardware/rapports/RAPPORT_PHASE_0.md` (format du §6 des consignes, avec les marqueurs **[Exprimé] / [Décidé] / [Hypothèse] / [Reco]**) :
   - T1 à T6 : résultat et preuve (extrait de réponse de l'API) pour chacun ;
   - l'incident Full Offline / Full Online (§4 ci-dessus) et ses conséquences ;
   - les écarts entre les consignes et la réalité (libellés des options de l'extension, autres constats) ;
   - le tableau des défauts du §10 des consignes : confirmé / infirmé / non testé en V3.2.209 ;
   - une conclusion sur **PO-34** : compatible / partiellement / non, avec le statut du défaut S4 ;
   - les questions pour Julien.

5. **Mémoire projet** (`CLAUDE.md` §5) : `JOURNAL.md` (session 12), `ETAT_PROJET.md`, `POINTS_OUVERTS.md` (PO-34 : fermé ou mis à jour). Proposer des corrections aux consignes et au guide d'installation si les constats le justifient. **Ne pas modifier `DECISIONS.md` sans l'accord de Julien.**

6. **Commit** : montrer d'abord le rapport à Julien. Après son accord : commit `hw: phase 0 EasyEDA API, PO-34 (session 12)` et push. Ce fichier de passation peut être commité dans le même commit ou supprimé, au choix de Julien.

7. **Ne pas passer à la phase 1** (sélection des références, BOM_CIBLE, PO-29). On en discute après le rapport.

## 9. Interdits pour cette session

- Ouvrir ou modifier un projet client : Thales, Clean & Protech (`CLEAN_AND_PR…`, `PCB_PCB_CLEA…`, `SCH_CLEAN-PR…`, `CARTE_CONN…`), drone, Dustbuster (`PCB_PCB_DUSE…`), intercepteur, `led_safran`, `import_pcb_thales`, etc. Un projet modifié en V3 ne s'ouvre plus dans son dernier état en V2.2.
- `openProject`, ou toute suppression en dehors de la page `ESSAI` et de son composant de test.
- Inventer une valeur. Toute valeur non décidée se note `A_DEFINIR` avec le PO correspondant.
- Arbitrer en silence une contradiction entre sources : arrêt et signalement à Julien.
- Lancer ou arrêter le pont ; changer le mode Online / Offline d'EasyEDA.

## 10. Dépannage rapide

| Symptôme | Action |
|---|---|
| `edaConnected: false` | Demander à Julien : **API Gateway > Reconnect** (l'extension arrête ses tentatives après 5 échecs). Vérifier que l'option « Allow interactive with external » est toujours cochée. |
| Aucun port ne répond | Le pont est arrêté : demander à Julien de le relancer dans sa fenêtre PowerShell, puis Reconnect. |
| Menu API Gateway absent | EasyEDA est en Full Offline : demander à Julien de repasser en Full Online. |
| Plusieurs fenêtres EDA | Demander à Julien laquelle utiliser, ou de fermer les autres. |
| Appel bloqué au-delà de 30 s | Découper le lot. Si l'appel bloque encore, signaler à Julien. |
| `importChanges()` en attente | Attend un clic « Apply » de Julien (hors phase 0). |

## 11. Fin de session (rappel pour Julien)

1. Vérifier que le projet est enregistré, et que le rapport et la mémoire sont commités et poussés.
2. `Ctrl+C` dans la fenêtre du pont.
3. Dans EasyEDA : **API Gateway > Stop Connection**. Le pont n'a aucune authentification : tout programme local peut exécuter du code dans EasyEDA tant qu'il tourne.

## Sources

- Skill `easyeda-api` : https://github.com/easyeda/easyeda-api-skill
- Extension Run API Gateway : https://jlc-ext.com/item/oshwhub/run-api-gateway
- FAQ de l'extension : https://github.com/easyeda/eext-run-api-gateway/blob/main/FAQ.en.md
- Retour d'expérience JLCPCB (V3.2.149, mode local) : https://jlcpcb.com/blog/claude-code-pcb-design
