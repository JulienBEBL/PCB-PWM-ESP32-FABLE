# Corrections après la revue à l'aveugle (session 03)

**Date :** 2026-11-15. **Projet EasyEDA :** `FABLE52_PCB_ESP32`, uuid `836928ac4399433ab9cd56636d997eda`, vérifié avant chaque écriture.
**Entrées :** revue `REVUE_AVEUGLE_OPUS.md` (S1 à S12, P1 à P7), tri de l'ingénieur (C1 à C6, A1 à A3, V1 à V3), décisions de Julien D1 et D2.
**Fichiers à envoyer :** `hardware/exports/Gerber_FABLE52_PCB_ESP32_2026-11-15_R3.zip`, `BOM_JLCPCB_2026-11-15_R3.csv`, `CPL_JLCPCB_2026-11-15_R3.csv`.

## 1. Tableau des corrections

| N° revue | Tri | Action | Résultat | Preuve |
|---|---|---|---|---|
| §8.1 (G6K) | C1 | Dessin Omron lu **en image** ; pastilles du PCB relues | **Conforme.** Bobine 1 + / 8 − ; communs 3, 6 ; NC 2, 7 ; NO 4, 5. Empreinte non miroir. Repos = rentrée | DEC-025. Omron `en-g6k.pdf` p. 6 « G6K-2F-Y, Terminal Arrangement (TOP VIEW) » ; Actuonix L12 : rouge = V+ → sortie |
| §8.4 (D1) | C2 | Image de l'empreinte | **Conforme.** Barre de cathode côté pastille 1 = `+5V_F` | DEC-026, `pcb_zoom.mjs d1` |
| S1 | C3 | Recherche d'un TVS VC < 6 V en stock JLCPCB | **Aucun ne convient** (VBR min 6,4 V, VC 9,2 V). D1 inchangée, risque accepté | DEC-026, PO-27 |
| S5 | C4 | R502 110 k → **97,6 k** (C23269) ; 2 notes de la page 09 | Coupure **13,45 V** typ. (12,5 à 14,4 V) | DEC-027. Relu par l'API, schéma et PCB |
| P1 | C5 | Texte de la bande corrigé | « BANDE 3 mm SANS CUIVRE - ISOLEMENT MIN 2,2 mm (RELAIS) » | DEC-028. Image de la bande ; `silk_check` 0 recouvrement |
| S2 | C6 | Note page 02 | « N8, N8R2, N16R8 uniquement ; R8V, R16V interdits » | DEC-028 |
| P3 | A1 | 5 vias ajoutés (VERIN_A ×2, VERIN_B ×2, +12V_P ×1) | Fait. +12V_F sans objet (branche C501 seule) | DEC-030. Écart mini 0,32 mm ; DRC 0 |
| P5 | A2 | Recherche de place près de U11, U12 | **Non fait** : gain quasi nul, import et re-routage en zone dense | DEC-031, PO-30 |
| S10 | A3 | R331 0 Ω → **33 Ω** (C23140) | Fait | DEC-029. Relu par l'API |
| S6 | V1 | Comportement de WDO | **Impulsionnel** (140 à 280 ms bas, puis haut). K2 peut recoller par intermittence si `K2_CMD` reste haut ; jamais d'action (K1 au repos) | PO-28. Lecture de Fable (ST DocID014134 Rev 8) ; datasheet non retéléchargeable (3 essais) |
| §8.8 | V2 | Corps des empreintes J1 à J7 contre bord | Ouverture vers l'extérieur, **probable** | PO-31 : vue 3D par Julien |
| — | V3 | Version -S | Ajoutée à EX-02 et à `LIVRAISON.md` §4 | `EXIGENCES.md` v1.1 |
| S3 | Faux positif | Rien | J6 n'arrête que la sortie : voulu (STM32 DEC-029) | `SYNOPTIQUE.md` §3 |
| S4 | Faux positif | Rien | Blocage du L12 12 V : 246 mA (datasheet Actuonix relue) < 1 A | `ALIMENTATION.md` §3 |
| S12, P2 | Faux positif | Rien | Radio jamais activée (EX-34) | — |
| P7 | Faux positif | Rien | J21 et J22 gardées (entraxe non mesuré, PO-01) | DEC-006 |
| S9, S11 | Risque accepté | Rien | — | — |
| S7, S8 | Firmware | Consignées | Boucle principale pour `CP_DRV`, `WDT_KICK` ; `BUZZER` jamais haut en continu | PO-29, `LIVRAISON.md` §8 |
| P4, P6 | Hors tri | Rien | — | — |

## 2. Erreurs de fait signalées

| Source | Constat |
|---|---|
| Mémoire de Fable (DEC-017, `REVUE_FINALE.md` n° 14) | « 1,10 mm entre broches 7 et 8 des relais » : faux. Pastilles de 1,0 mm de large au pas de 3,2 mm → **2,2 mm**. La revue (P1) avait raison |
| Note du schéma page 09 | 13,2 V jamais mise à jour après DEC-022 (la revue S5 avait raison) |
| Tri, D2 | Calcul exact. À noter : le seuil bas (12,5 V) est sous la tension d'une batterie 3S chargée (12,6 V). PO-33 |

## 3. Contrôles finaux

| Contrôle | Résultat |
|---|---|
| Uuid du projet | `836928ac4399433ab9cd56636d997eda` avant chaque lot |
| Netlist exportée contre cible (codes LCSC compris) | 136 composants, 78 nets, **0 écart** |
| ERC | **0 erreur**, 1 avertissement connu (PO-22, empreinte de LED1) |
| Schéma / PCB broche par broche | 136 composants, 407 broches, **0 écart** |
| DRC (plans recalculés) | **0 erreur**, 0 net ouvert |
| Isolement | 2,34 mm hors relais, 2,2 mm dans les relais, 0 violation |
| Sérigraphie | 0 recouvrement, 0 texte sur pastille ou via, 0 au bord |
| BOM / CPL | 46 lignes, 136 repères, 136 positions, 0 écart avec la netlist |
| Stock JLCPCB (2026-11-15, 46 lignes) | Toutes en stock. Plus faibles : STWD100 C1354132 = 179 (PO-10), ESD5Z5V0 = 3 207, 97,6 k C23269 = 3 280, borniers 7 pts = 2 931 |
| Gerber | 4 couches cuivre, masques, pâte, sérigraphie, contour, perçages |

## 4. Points ouverts restants

| N° | Point | Criticité |
|---|---|---|
| PO-32 | Déposer les exports `_R3` | B |
| PO-10 | Stock du watchdog (179) | C |
| PO-31 | Vue 3D des borniers | C |
| PO-33 | Source 12 V ≤ 12,5 V | C |
| PO-27 | 5 V seulement depuis une alimentation régulée | M |
| PO-28 | Watchdog impulsionnel | M |
| PO-29 | Contraintes firmware S7, S8 | M |
| PO-30 | Découplage de U11, U12 (version suivante) | M |
| Autres | PO-01, 03, 04, 08, 12, 14, 15, 16, 17, 21, 22, 24, 25 : inchangés | — |

## 5. Ce que Julien vérifie avant de payer

1. Charger **`Gerber_…_2026-11-15_R3.zip`**, **`BOM_JLCPCB_2026-11-15_R3.csv`**, **`CPL_JLCPCB_2026-11-15_R3.csv`**. Rien d'autre.
2. Page BOM de JLCPCB : toutes les lignes confirmées, en particulier C23269 (R502, nouvelle) et C1354132 (watchdog).
3. Aperçu de placement : barre de cathode de D1 côté `+5V_F` ; repère des relais côté broches 1 / 8.
4. Vue 3D dans EasyEDA : borniers J1 à J7 ouverts vers l'extérieur.
5. Vérin en version **-S** ; source 12 V ≤ 12,5 V ; 5 V depuis une alimentation régulée.

## 6. Outils ajoutés (hors dépôt, `_outils_fable`)

| Script | Rôle |
|---|---|
| `swap_val.mjs` | Échange en place d'une résistance 0603 (schéma et PCB, Channel ID conservé) |
| `fix_notes.mjs` | Notes du schéma et texte de la bande |
| `pcb_via2.mjs` | Second via sur les nets de puissance, avec contrôle d'écart hors ligne |
| `pcb_export.mjs` | Date paramétrable : `DAY=2026-11-15_R3` |
