# CLAUDE.md — Instructions de reprise du projet

Ce fichier est lu automatiquement par Claude Code. Toute session Claude (Claude Code ou chat claude.ai) qui reprend le projet doit le lire en premier.

## 1. Projet en une phrase

Carte électronique BEBL qui lit une consigne PWM (1000–2000 µs, ~50 Hz), exécute une machine d'états (FSM) avec temporisations et pilote un vérin électrique Actuonix série L12 (12 V, version à choisir, course utile 3 mm) en inversion de polarité, avec retour garanti en position sûre (tige rentrée) en cas de défaut.

## 2. Ordre de lecture pour reprendre

1. `docs/memoire/ETAT_PROJET.md` — où en est le projet, prochaine étape.
2. `docs/memoire/DECISIONS.md` — décisions validées par Julien (ne pas les remettre en cause sans le signaler).
3. `docs/memoire/POINTS_OUVERTS.md` — informations manquantes et questions en attente.
4. `docs/memoire/JOURNAL.md` — historique des échanges, session par session.
5. Selon le sujet : `docs/besoin/`, `docs/architecture/`, `docs/composants/`.

## 3. Rôles

- **Julien** (ingénieur BEBL) : décide, conçoit le PCB sous EasyEDA Pro, teste sur banc et fait les retours.
- **Claude** : analyse, propose des options argumentées, rédige la documentation, écrit le firmware, gère ce dépôt (commit, push).

## 4. Règles de travail

- Distinguer systématiquement : **[Exprimé]** (dit par Julien), **[Décidé]** (validé par Julien), **[Hypothèse]**, **[Reco]** (proposition de Claude).
- Ne jamais transformer une hypothèse en donnée validée. Ne jamais inventer une valeur sans source ou justification.
- Signaler explicitement toute incohérence ou contradiction.
- Présenter les options avec avantages, inconvénients et conséquences avant toute décision importante.
- Style : français technique, phrases courtes, voix active, pas de remplissage, pas de sous-sections inutiles.
- Avancer étape par étape : besoin → CdCF → architecture → schéma → PCB → firmware → essais.

## 5. Gestion du dépôt

- Branche unique `main` pour la documentation. Branches dédiées possibles pour le firmware.
- Après chaque session : mettre à jour `ETAT_PROJET.md`, `DECISIONS.md`, `POINTS_OUVERTS.md` et ajouter une entrée dans `JOURNAL.md`, puis commit et push.
- Messages de commit en français, préfixés : `docs:`, `hw:`, `fw:`, `test:`, `chore:`.
- Numérotation : décisions `DEC-xxx`, points ouverts `PO-xx`. Un numéro attribué n'est jamais réutilisé ; un élément clos est marqué clos, pas supprimé.
- Fins de ligne : gérées par `.gitattributes`. Clone local de Julien sous Windows : `C:\Users\Julien\Documents\6. Drone\V3_2026\PCB_PWM_SECURISE_V3`.

## 6. Arborescence

| Dossier | Contenu |
|---|---|
| `docs/memoire/` | Mémoire du projet : état, décisions, points ouverts, journal |
| `docs/besoin/` | Besoin exprimé, analyse du CdCF de référence |
| `docs/cdcf/` | Cahier des charges fonctionnel du projet (à rédiger) |
| `docs/architecture/` | Architecture matérielle, choix du microcontrôleur |
| `docs/composants/` | Fiches composants, synthèses de datasheets |
| `references/` | Documents de référence fournis (non applicables par défaut) |
| `datasheets/` | Datasheets et liens sources |
| `hardware/` | Méthode EasyEDA + Claude Code (`CONSIGNES_EASYEDA_CLAUDE_CODE.md`), BOM / netlist / placement cibles, projet EasyEDA Pro, exports, Gerber, BOM, CPL |
| `firmware/` | Code embarqué |
| `tests/` | Procédures et rapports d'essais |
| `raw/` | Données brutes : mesures, captures, notes |
