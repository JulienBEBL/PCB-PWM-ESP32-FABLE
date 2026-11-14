# Rapport — Phases 5 et 6 : import, placement, routage

**Date :** 2026-11-14 — **Outil :** Claude Code, EasyEDA Pro V3.2.209, PCB1 `5457367f86d6a6ce`.
**Image :** `hardware/rapports/pcb_routage.png` (face supérieure en rouge, face inférieure en bleu).

## Phase 5 — Import, contour, placement

| Point | Résultat |
|---|---|
| Import schéma → PCB | 136 composants, après le clic « Apply » de Julien |
| Carte | 120 × 80 mm, origine en bas à gauche (DEC-016) |
| Trous | 4 × Ø 3,2 mm non métallisés à (4 ; 4), (116 ; 4), (4 ; 76), (116 ; 76) mm |
| Couches | 4 couches cuivre (DEC-017) |
| Carte de dev | À gauche, ports USB au bord gauche (x = 0). Broche 22 à x = 8,00 mm, broche 1 à x = 61,34 mm. J20 à y = 60,50 ; J22 à y = 37,64 (22,86 mm) ; J21 à y = 35,10 (25,40 mm) |
| Borniers | Bord haut : J1, J4, J5, J8 (ordre de la carte STM32). Bord bas : J2, J3, J6. Bord droit : J7 |
| Barrière | K1, K2, U6, U7 à cheval sur y = 29 mm, broches de commande en haut |
| Face | Tous les composants en face supérieure (EX-42) |
| Contrôle hors ligne avant application | 0 chevauchement (marge 0,2 mm), 0 composant hors carte ou sur un trou, isolement entre pastilles de domaines différents ≥ 4,6 mm |
| Relecture après application | 136 / 136 positions et rotations conformes au plan |

## Phase 6 — Routage

| Point | Résultat |
|---|---|
| Règles (DEC-018) | Piste 0,25 mm ; écart 0,2 mm ; classe P05 0,5 mm (min 0,25) ; classe P10 0,8 mm (min 0,3) ; vias 0,61 / 0,305 mm |
| Isolement (DEC-017) | Bande sans cuivre de y = 27,5 à 30,5 mm sur toutes les couches (zones « sans piste, sans plan »). Deux couloirs de 1,4 mm pour les pistes de bobine `K1_COIL_N`, `K2_COIL_N`, tracées à la main. Zones interdites autour des broches 8 des relais |
| Méthode (DEC-019) | Autorouteur d'EasyEDA par lots de nets (faces 1 et 4), contrôle DRC après chaque lot. Masses : un via par pastille CMS vers le plan interne, calculé hors ligne. 6 liaisons reprises à la main avec contrôle d'écart |
| Plans | L2 : `GND` (y ≥ 30,5) et `GND_P` (y ≤ 27,5). L3 : `+3V3` et `+12V_P`. L4 : `GND` et `GND_P` |
| **DRC EasyEDA (mode strict)** | **0 erreur, 0 liaison ouverte** |
| **Isolement, contrôle indépendant** (`pcb_iso.mjs` : pastilles, pistes, vias) | **Minimum 2,34 mm** (`+12V_P` / K2 broche 8). 0 violation de la règle des 2 mm. Dans les relais : 1,10 mm entre broches 7 et 8 (imposé par l'empreinte, exception reprise de STM32 DEC-069) |
| Cuivre puissance | y ≤ 27,18 mm. Cuivre commande (hors pistes de bobine) : y ≥ 31,42 mm |

## Incidents et parades

| Incident | Parade |
|---|---|
| Plans de la face supérieure : `rebuildCopperRegion` ne renvoie rien | Plans L1 supprimés ; masses reliées par vias au plan L2 |
| `autoRouting` : « RPC Call autoRouting Timed Out » sur certains lots | Relance en lots plus petits ; le DRC fait foi |
| 5 signaux et 5 pastilles de masse bloqués par des pistes voisines | Arrachage des nets gênants, liaison prioritaire, puis re-routage |
| Bilan d'autoroutage parfois optimiste | Vérification systématique par la liste des liaisons ouvertes du DRC |

## Reste à faire

Sérigraphie (noms des connecteurs et des broches, contour de la carte de dev), exports, revue finale.
