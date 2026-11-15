# CLAUDE.md — Carte PWM sécurisée ESP32 (FABLE)

Lu en premier par toute session Claude Code. Une session qui reprend doit pouvoir continuer en lisant seulement ce fichier et `docs/memoire/`.

## 1. Projet en une phrase

Carte de sécurité BEBL, « jumelle » de la carte STM32 : elle lit une consigne PWM (1000–2000 µs, ~50 Hz), exécute une machine d'états et pilote un vérin Actuonix L12 12 V par 2 relais DPDT (inversion de polarité). Retour garanti en position sûre (tige rentrée, relais au repos). **Aucune défaillance simple ne doit provoquer l'action.** MCU : carte de dev **ESP32-S3-DevKitC-1-N8 enfichée**, amovible.

Livrable : projet EasyEDA Pro prêt à commander chez JLCPCB (PCB 4 couches + assemblage), exports Gerber / BOM / CPL **dimanche 15 novembre 2026 au soir**, commande lundi 16.

## 2. Ordre de lecture

1. `docs/memoire/ETAT_PROJET.md` — où on en est, prochaine action.
2. `docs/memoire/DECISIONS.md` — décisions (DEC-xxx).
3. `docs/memoire/POINTS_OUVERTS.md` — points ouverts (PO-xx).
4. `docs/memoire/JOURNAL.md` — historique par session.
   `docs/memoire/FONCTIONNEMENT_CARTE.md` — fonctionnement, GPIO, règles firmware (référence pour coder l'ESP32).
5. Selon la phase : `docs/exigences/`, `docs/architecture/`, `hardware/bom/`, `hardware/rapports/`.
6. `old/` : anciens dépôts, **sources de connaissance seulement** (jamais modifiés, jamais des spécifications).

## 3. Rôles

- **Julien** (ingénieur électronicien, BEBL) : exprime les exigences, relit les décisions à la fin, clique dans EasyEDA quand l'API l'exige (« Apply »), commande. Il n'utilise pas le terminal.
- **Claude Code** : travaille seul (sans sous-agents), prend les décisions, les consigne avec justification et sources, pilote EasyEDA par l'API, commite et pousse.

## 4. Règles absolues

1. **Projet EasyEDA** : `FABLE52_PCB_ESP32`, uuid **`836928ac4399433ab9cd56636d997eda`**. Au début de chaque session et avant chaque lot d'écriture : lire l'uuid du projet actif. Aucune écriture si l'uuid diffère. Si l'uuid `b4788f45338c4e59bfcfdff2832a8063` (projet STM32) apparaît : **arrêt immédiat**.
2. **Repartir de zéro.** Tout élément repris d'un ancien dépôt cite sa source (ex. « reprise ESP32 DEC-023 ») et est revérifié.
3. **Aucune valeur ni référence sans source** (datasheet, page LCSC / JLCPCB, décision). Une hypothèse est marquée **[Hypothèse]** et suivie par un PO.
4. **Simplicité** : uniquement ce que les exigences demandent. Schéma, placement et routage lisibles par Julien.
5. Les exigences de Julien (`docs/exigences/EXIGENCES.md`) priment sur tout ancien document. Tout conflit est signalé.
6. `old/` n'est jamais modifié.
7. Numéros `DEC-xxx` et `PO-xx` propres à ce dépôt, jamais réutilisés. Un élément clos est marqué clos, jamais supprimé. Une référence à un ancien dépôt s'écrit « ESP32 DEC-xxx » (old/PCB-PWM-ESP32-SECURIS2-V3) ou « STM32 DEC-xxx » (old/PCB_PWM_SECURISE_V3).
8. Fin de chaque phase : mémoire à jour, rapport de phase, commit, push.
9. Arrêt seulement sur blocage (décision irréversible, contradiction non tranchable, action manuelle de Julien). Pas plus de 3 essais sur un même échec d'API.

## 5. Environnement

| Élément | Valeur |
|---|---|
| EasyEDA Pro | V3.2.209, Full Online, compte personnel de Julien |
| Pont `easyeda-api` | `http://localhost:49620` (lancé par Julien dans une fenêtre séparée ; **ne jamais le relancer**) |
| Appels | `GET /health`, puis `POST /execute` avec `{code}` (JSON UTF-8 sans BOM) par un script Node **hors du dépôt** |
| Schéma | `Schematic1`, uuid `97d11f9e3f37cffe` (page d'origine `P1` : `23891438148d8911`) |
| PCB | `PCB1`, uuid `5457367f86d6a6ce` |
| Bibliothèque LCSC (système) | `0819f05c4eef4c71ace90d822a990e87` |
| Dépôt | `JulienBEBL/PCB-PWM-ESP32-FABLE`, branche `main` |

Consignes d'usage de l'API (pièges et contournements) : `hardware/rapports/RAPPORT_PHASE_1_API.md`.

## 6. Arborescence

| Dossier | Contenu |
|---|---|
| `docs/memoire/` | État, décisions, points ouverts, journal |
| `docs/exigences/` | Exigences numérotées, source, critère de vérification |
| `docs/architecture/` | Synoptique, brochage, alimentation, netlist cible |
| `hardware/bom/` | BOM vérifiée (codes LCSC, stock) |
| `hardware/rapports/` | Un rapport par phase, puis `LIVRAISON.md` |
| `hardware/exports/` | Gerber, BOM, CPL au format JLCPCB |
| `old/` | Copie figée des deux anciens dépôts (voir `old/README.md`) |

## 7. Style

Français technique, phrases courtes, voix active. Tableaux. Commits en français, préfixés `docs:`, `hw:`, `chore:`.
