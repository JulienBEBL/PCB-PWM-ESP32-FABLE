# Brief Claude Code — Session 12 : phase 0, mise en service d'EasyEDA Pro par l'API

**Date de rédaction :** 2026-11-03.
**Destinataire :** une nouvelle session Claude Code, lancée dans le clone du dépôt sur le PC de Julien.
**Statut :** brief de session. En cas d'écart, les documents du dépôt font foi (`CLAUDE.md`, `docs/memoire/`, `hardware/CONSIGNES_EASYEDA_CLAUDE_CODE.md`). Tout écart est signalé, jamais arbitré en silence.

> **Note d'archivage (session 13) :** brief collé dans la conversation et exécuté. Session renumérotée 13, car le numéro 12 a été pris en parallèle par la session « BOM et netlist cibles ». Le point des défauts non testés est PO-38 (PO-35 à PO-37 déjà attribués). Résultat : `hardware/rapports/RAPPORT_PHASE_0.md`.

---

## 0. Mode d'emploi (pour Julien)

1. Copier ce fichier à la racine du clone : `C:\Users\Julien\Documents\6. Drone\V3_2026\PCB_PWM_SECURISE_V3\BRIEF_SESSION_12.md`.
2. Vérifier que le pont tourne (fenêtre PowerShell, port 49620) et qu'EasyEDA Pro est ouvert sur le projet `PCB_PWM_SECURISE_V3` de l'espace Personal, en mode **Full Online**.
3. Dans PowerShell, à la racine du clone : `claude`.
4. Coller : `Lis BRIEF_SESSION_12.md à la racine du dépôt et exécute-le intégralement, dans l'ordre.`

---

## 1. Ta mission dans cette session

Exécuter la **phase 0** (mise en service et tests T1 à T6), rédiger le rapport de phase 0, mettre à jour la mémoire projet, puis commiter et pousser **après validation du rapport par Julien**.

**Hors périmètre :** la phase 1 (sélection des composants). Tu t'arrêtes après le push.

## 2. Contexte du projet

Carte électronique BEBL. Elle lit une consigne PWM (1000 à 2000 µs, ~50 Hz), exécute une machine d'états et pilote un vérin Actuonix L12 (12 V) par un pont de 2 relais DPDT. Le retour en position sûre (tige rentrée) est garanti en cas de défaut. MCU : STM32G071CBT6, LQFP48, LCSC **C432212**. CAO : EasyEDA Pro. Fabrication et assemblage complet : JLCPCB.

Rôles :

- **Julien** décide, valide chaque jalon, retouche le schéma et le PCB s'il le souhaite.
- **Claude** analyse, propose, saisit sous EasyEDA par l'API, rédige et gère le dépôt.

Méthode validée (DEC-061) : schéma → retouche et validation par Julien → routage → retouche et validation par Julien. Les phases et jalons G1 à G5 sont détaillés dans `hardware/CONSIGNES_EASYEDA_CLAUDE_CODE.md` §3.

## 3. Lecture obligatoire avant toute action

Commence par `git pull`. Le commit `553f10c` (session 11) a ajouté les consignes et le guide d'installation. Si `git pull` signale un conflit ou des modifications locales non commitées : arrêt et signalement.

Puis lis, dans cet ordre :

1. `CLAUDE.md` : règles de travail et de gestion du dépôt.
2. `docs/memoire/ETAT_PROJET.md`, `DECISIONS.md`, `POINTS_OUVERTS.md`, `JOURNAL.md` (session 11 en tête).
3. `hardware/CONSIGNES_EASYEDA_CLAUDE_CODE.md` : **il fait foi** pour tout travail sous EasyEDA (règles S1 à S11, contrôles V1 à V8, tests §9, défauts connus §10).
4. `hardware/INSTALLATION_EASYEDA_API.md`.
5. Le skill `easyeda-api` : `%USERPROFILE%\.claude\skills\easyeda-api\SKILL.md`, puis `references/_index.md` et `references/_quick-reference.md` pour toute signature de méthode. **N'invente aucun nom de méthode ni aucune valeur d'énumération** : cherche-les dans `references/`.

## 4. État de l'installation (réalisée par Julien le 2026-11-03)

| Élément | État |
|---|---|
| EasyEDA Pro | V3.2.209 (2026-10-21), client desktop, **Full Online** (DEC-063) |
| Node.js / Git | v24.21.0 / 2.52 |
| Skill `easyeda-api` | v1.1.64, `%USERPROFILE%\.claude\skills\easyeda-api`, `npm install` OK (dépendance unique `ws`, 0 vulnérabilité) |
| Extension Run API Gateway | v1.0.6, importée et activée |
| Options de l'extension | Cochées. Libellés réels en V3.2.209 : **« Allow interactive with external »** et **« Show at header menu »** (les consignes et le guide citent « Allow External Interaction » et « Show in Top Menu ») |
| Pont | Lancé par Julien dans une fenêtre PowerShell séparée, **port 49620**. **Tu ne le lances pas et tu ne l'arrêtes pas.** |

**Astuce PowerShell (constatée par Julien) :** pour `POST /execute`, écris le JSON dans un fichier temporaire, puis envoie-le avec `curl.exe -X POST http://localhost:49620/execute -H "Content-Type: application/json" --data-binary "@fichier.json"`. Cela évite les problèmes d'échappement des guillemets. Place ces fichiers temporaires hors du dépôt, ou supprime-les avant le commit.

## 5. Identifiants du projet EasyEDA

| Objet | Nom | uuid |
|---|---|---|
| Projet | `PCB_PWM_SECURISE_V3` (name `JulienBEBL/PCB_PWM_SECURISE_V3`) | `b4788f45338c4e59bfcfdff2832a8063` |
| Carte | Board1 | — |
| Schéma | Schematic1 | `ae5a2752b4ccbe86` |
| Page de schéma | P1 (A4) | `f8ce52c8d36cc38e` |
| PCB | PCB1 | `9e5b12b9217a84a5` |
| Panneau | Panel1 | `ddb0ba0de624e2b9` |
| Fenêtre EDA (relevée lors de T2) | — | `487f0313-8e2b-42db-94d6-78a7a24d0ead` (peut changer) |

**Règle S1 renforcée pour cette session :** le projet actif est identifié **par son uuid**, pas par son nom. Avant chaque lot d'écriture, vérifie que l'uuid est `b4788f45338c4e59bfcfdff2832a8063`. Sinon : arrêt. Motif : voir §6.

## 6. Incident de mode (à consigner dans le rapport)

- Julien est passé par erreur en **Full Offline**. Dans ce mode, le menu API Gateway **et** l'espace Personal disparaissent. Il est revenu en Full Online, conformément à DEC-063.
- Un projet local nommé `PCB_PWM_SECURISE_V3` a pu être créé pendant la période hors ligne. **Il ne doit pas être utilisé, ni ouvert, ni supprimé.** Deux projets peuvent donc porter le même nom : d'où le contrôle par uuid (§5).
- Conséquence pour PO-34 : le mode « local » du retour d'expérience JLCPCB (V3.2.149) n'est vraisemblablement pas le Full Offline, puisque l'extension n'y est pas accessible. **[Hypothèse]** Le repli vers un mode local n'est pas disponible en Full Offline. Le Half Offline n'est pas testé.

## 7. Tests déjà réalisés (lecture seule, aucune écriture)

| Test | Résultat |
|---|---|
| T1 `GET /health` | `service = easyeda-bridge`, `edaConnected = true`, `edaWindowCount = 1`. OK |
| T2 `GET /eda-windows` | 1 fenêtre, active, windowId `487f0313-…`. OK |
| T3 `eda.dmt_Project.getCurrentProjectInfo()` | friendlyName `PCB_PWM_SECURISE_V3`, uuid `b4788f45338c4e59bfcfdff2832a8063`. OK |
| T4 Structure | Board1 → Schematic1 (page P1, A4) + PCB1 ; Panel1. Conforme à la création par Julien. OK |

## 8. Tâches de la session, dans l'ordre

### Étape 1 — Revérifier T1 et T3

Le pont ou la fenêtre ont pu changer depuis. Refais `GET /health`, `GET /eda-windows` et `getCurrentProjectInfo()`.

- Si `edaConnected` est faux, ou si plusieurs fenêtres sont détectées : arrêt et question à Julien.
- Si l'uuid du projet actif n'est pas `b4788f45338c4e59bfcfdff2832a8063` : **arrêt (S1)**.

### Étape 2 — T5 : test d'écriture sur une page ESSAI

| Sous-étape | Action | Preuve à conserver |
|---|---|---|
| 2.1 | Créer une page de schéma nommée **ESSAI** dans Schematic1. **Ne pas toucher à P1.** Enregistrer. | uuid de la page ESSAI |
| 2.2 | Vérifier l'uuid du projet (S1). Résoudre C432212 dans la bibliothèque LCSC (`lib_Device`, méthode exacte à prendre dans `references/`). Relever les attributs fournisseur **renvoyés par la bibliothèque** : code LCSC, MPN, fabricant, nom, empreinte. | Extrait de réponse |
| 2.3 | Placer le composant sur la page ESSAI. Enregistrer. | Identifiant de primitive |
| 2.4 | Relire les broches : numéro, nom, position. | Nombre de broches (48 attendues pour un LQFP48), extrait de 3 broches dont PA13 / PA14 |
| 2.5 | Relire les attributs fournisseur du composant placé et les comparer à 2.2. | Tableau attendu / lu |
| 2.6 | Si un attribut manque ou diffère : appliquer **S4** (réécriture de tous les attributs fournisseur en **un seul appel**), relire, comparer de nouveau. Enregistrer. | Résultat avant / après S4 |
| 2.7 | Supprimer le composant de test, puis la page ESSAI. Enregistrer. Vérifier que Schematic1 ne contient plus que P1. | Liste finale des pages |

Conclusion attendue sur le défaut S4 : **confirmé**, **infirmé** en V3.2.209, ou **non concluant** (avec la raison).

Autorisation de suppression accordée par Julien : **uniquement** le composant de test et la page ESSAI.

### Étape 3 — T6 : ERC

- Cherche dans `references/` la méthode de contrôle (ERC / DRC) du schéma. Lance-la sur Schematic1 et relève les totaux.
- Si l'API n'expose pas d'ERC du schéma : le noter « non disponible par l'API » et demander à Julien de lancer l'ERC dans l'éditeur.
- L'API ne renvoie que des totaux. Si le détail est utile, demande à Julien de coller le journal ERC.

### Étape 4 — Rapport de phase 0

Rédige `hardware/rapports/RAPPORT_PHASE_0.md`. Distingue **[Exprimé]**, **[Décidé]**, **[Hypothèse]** et **[Reco]**. Le contenu attendu est au §10.

**Montre le rapport à Julien et attends sa validation avant tout commit.**

### Étape 5 — Mémoire projet (après validation du rapport)

| Fichier | Mise à jour |
|---|---|
| `docs/memoire/JOURNAL.md` | Entrée « Session 12 — 2026-11-03 — Phase 0 EasyEDA API » **en tête**, au même format que la session 11 |
| `docs/memoire/ETAT_PROJET.md` | Date et session ; ligne de la phase 6 ; prochaine étape |
| `docs/memoire/POINTS_OUVERTS.md` | PO-34 : clos si compatible, mis à jour sinon. Un PO clos est déplacé dans la table « Clos » avec sa résolution, jamais supprimé. Tout nouveau point prend le numéro libre suivant (PO-35 et au-delà) |
| `docs/memoire/DECISIONS.md` | **Aucune modification sans l'accord explicite de Julien** |

### Étape 6 — Corrections proposées des consignes et du guide

Propose-les dans le rapport. **Applique-les seulement après l'accord de Julien.** Corrections déjà identifiées :

| N° | Fichier | Correction | Motif |
|---|---|---|---|
| C1 | `hardware/CONSIGNES_EASYEDA_CLAUDE_CODE.md`, règle S1 et test T3 | Identifier le projet par son **uuid** `b4788f45338c4e59bfcfdff2832a8063`, pas par son nom | Doublon de nom possible (§6) |
| C2 | `hardware/INSTALLATION_EASYEDA_API.md` §2 et §5 ; consignes §1 | Libellés réels : « Allow interactive with external », « Show at header menu » | Écart constaté en V3.2.209 |
| C3 | `hardware/INSTALLATION_EASYEDA_API.md` | Ajouter : mode **Full Online** obligatoire ; en Full Offline, le menu API Gateway et l'espace Personal disparaissent | Incident §6 |
| C4 | `hardware/INSTALLATION_EASYEDA_API.md` §3 | Ajouter l'astuce `curl.exe --data-binary "@fichier.json"` | Constat de Julien |
| C5 | Consignes §1 et §10 | Statut de PO-34 et des défauts connus, selon les résultats | Résultats de la phase 0 |

Ajoute toute autre correction justifiée par un écart constaté.

### Étape 7 — Commit et push (après validation)

1. `git status` : aucun fichier temporaire ni JSON de test dans le commit.
2. `git pull --rebase` avant le push (une autre session a pu pousser).
3. Commit : `hw: phase 0 EasyEDA API, PO-34 (session 12)`.
4. `git push`.
5. Ce brief (`BRIEF_SESSION_12.md`) : demande à Julien s'il faut le versionner (proposition : `hardware/rapports/BRIEF_SESSION_12.md`) ou le supprimer du clone.

Puis arrête-toi. **Ne commence pas la phase 1.**

## 9. Règles impératives de la session

| N° | Règle |
|---|---|
| R1 | Code envoyé à EasyEDA : une seule ligne, sans commentaire, `await` sur chaque promesse, résultat par `return`, valeurs d'énumération par leur nom (S10). |
| R2 | Chaque appel doit finir en moins de 30 s. Découper en lots, enregistrer après chaque lot (S11). |
| R3 | **Jamais d'`openProject`.** Jamais de changement de projet actif. |
| R4 | **Aucune suppression** hors du composant de test et de la page ESSAI. |
| R5 | N'ouvrir et ne modifier **aucun projet client** (Thales, Clean & Protech, intercepteur, Dustbuster, etc.) ni le projet local créé par erreur. Un projet modifié en V3 ne s'ouvre plus à jour en V2.2. |
| R6 | Ne pas lancer, arrêter ni relancer le pont. S'il ne répond plus : arrêt et question à Julien. |
| R7 | Contradiction entre sources, réponse inattendue, appel en échec : arrêt et signalement. Pas de nouvel essai en boucle, pas de contournement improvisé. |
| R8 | Aucune valeur, aucun nom de méthode inventé. Une information non vérifiée est marquée **[Hypothèse]**. |
| R9 | Style : français technique, phrases courtes, voix active, pas de remplissage. |

## 10. Contenu attendu du rapport de phase 0

```markdown
# Rapport — Phase 0 : mise en service d'EasyEDA Pro par l'API

**Date :** 2026-11-03 — **Session :** 12 — **Outil :** Claude Code
**Version :** EasyEDA Pro V3.2.209, Full Online ; skill easyeda-api v1.1.64 ; extension Run API Gateway v1.0.6

## 1. Résultats des tests
| Test | Action | Résultat | Preuve (extrait de réponse) | Statut |
(T1 à T6, y compris T1 à T4 réalisés par Julien avant la session et revérifiés)

## 2. Défaut S4 (attributs fournisseur)
Attendu / lu avant S4 / lu après S4. Conclusion : confirmé, infirmé ou non concluant en V3.2.209.

## 3. Incident Full Offline / Full Online
Faits, conséquences (menu API Gateway uniquement en Full Online, doublon de nom possible), mesures prises.

## 4. Défauts connus (consignes §10)
| Défaut | Confirmé / infirmé / non testé | Commentaire |

## 5. Écarts par rapport aux consignes et au guide
| N° | Écart | Correction proposée |

## 6. Conclusion sur PO-34
Compatible / partiellement / non, avec justification.

## 7. Questions pour Julien
```

## 11. Défauts connus à qualifier (constatés en V3.2.149 par JLCPCB)

| Défaut | Testé dans cette session ? |
|---|---|
| Attributs fournisseur perdus après placement API ou modification partielle | Oui (T5) |
| « Wire has multiple net names » | Non (pas de fil tracé) |
| Export de netlist qui ne rend pas la main | Non |
| ERC / DRC : totaux seulement | Oui (T6) |
| `importChanges()` (schéma → PCB) attend un clic « Apply » | Non |
| Pont arrêté par manque de mémoire en tâche de fond | Sans objet : pont lancé dans une fenêtre séparée |
| Extension : arrêt des tentatives de connexion après 5 échecs | Non, sauf incident |

## 12. Points ouverts liés

| N° | Sujet | Effet sur cette session |
|---|---|---|
| PO-34 | Compatibilité V3.2.209 Full Online | Objet de la phase 0 |
| PO-29 | Sélection des références | Phase 1, **hors périmètre** |
| PO-32 | Nombre de couches | Aucun |
| PO-33 | Distances d'isolement | Aucun |
