# Registre des décisions

Numérotation propre à ce dépôt. Une décision remplacée est marquée « Remplacée par DEC-xxx », jamais supprimée.

**Origine :** `Julien` = exigence exprimée par Julien (prompt de lancement du 2026-11-14 ou réponse ultérieure). `Claude` = décision prise par Claude Code en autonomie, **à relire par Julien à la fin**.

| N° | Date | Décision | Origine | Justification, sources, options écartées | Statut |
|---|---|---|---|---|---|
| DEC-001 | 2026-11-14 | Projet EasyEDA de travail : `FABLE52_PCB_ESP32`, uuid `836928ac4399433ab9cd56636d997eda`. Toute écriture est précédée de la vérification de cet uuid. Uuid STM32 `b4788f45338c4e59bfcfdff2832a8063` = arrêt. | Julien | Règle absolue n° 1 du prompt. Uuid lu par l'API le 2026-11-14 | En vigueur |
| DEC-002 | 2026-11-14 | Structure du dépôt, mémoire dans `docs/memoire/`, `old/` figé (commits `b97db80` ESP32, `b74a0cc` STM32). | Julien | Prompt de lancement. Détail : `CLAUDE.md`, `old/README.md` | En vigueur |
| DEC-003 | 2026-11-14 | Exigences de base de la carte : celles du prompt de lancement, reprises dans `docs/exigences/EXIGENCES.md`. Elles priment sur tout ancien document. | Julien | Prompt de lancement | En vigueur |
| DEC-004 | 2026-11-14 | Usage de l'API : règles A1 à A12 de `hardware/rapports/RAPPORT_PHASE_1_API.md`. Netlist exportée par `sch_ManufactureData.getNetlistFile()`. | Claude | Tests de phase 1 sur page jetable. Reprise STM32 S1 à S15 et STM32 PO-38, revérifiées. Écarté : `sch_Netlist.getNetlist()` (sans réponse) | En vigueur |
