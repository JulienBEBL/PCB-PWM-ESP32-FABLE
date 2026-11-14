# Rapport — Phase 4 : placement fin (jalon G4, à valider)

**Date :** 2026-11-04 — **Session :** 13 (suite) — **Outil :** Claude Code, EasyEDA Pro V3.2.209 Full Online
**Statut :** placement fin appliqué à PCB1, **G4 à valider par Julien** (revue visuelle et 3D dans l'éditeur). Non routé.
**Vue :** `hardware/pcb/PLACEMENT_G4.svg` (et `.png`). Remplace le placement v0 (`RAPPORT_PHASE_4_PLACEMENT_V0.md`).

## 1. Cadre

DEC-068 (100 × 80 mm, 4 trous M3, connecteurs sur bords opposés), DEC-069 (isolement ≥ 2 mm, sans fente), DEC-070 (4 couches), règles de `PLACEMENT_CIBLE.md`.

## 2. Méthode

1. **Encombrement réel** : boîte englobante de chaque composant lue par `pcb_Primitive.getPrimitivesBBox` (corps et sérigraphie compris, pas seulement les pastilles).
2. **Ancres placées à la main** :
   - bord haut, de gauche à droite : J12 (USB-C, ouverture vers le bord), J1, J4, J5, J8 ;
   - bord bas : J2 (12 V) à gauche, J3 (vérin) sous les relais, J6 à droite ;
   - barrière à y = 29 mm : U9, K1, K2, U6, U7. Rotation choisie pour mettre les broches de commande en haut (K1, K2 : 180° ; U6, U7 : 90° ; U9 : 0°) ;
   - U1 au centre de la zone commande (50 ; 57 mm) ; U13 à gauche, près de l'USB ;
   - J9 (SWD) et J10 (UART) sur le bord gauche, accessibles ; LS1 à droite ; LED1 à LED4 en colonne sur le bord droit (visibles, conduit de lumière possible).
3. **Placement des autres composants**, un par un :
   - **Cible** : la broche visée par une règle de `PLACEMENT_CIBLE.md` §2 (découplage de U1 sur les broches 4 à 6 et 10, chaînes de protection au pied de J1, J2, J3…) ; à défaut, le centre de gravité des broches déjà placées sur ses nets de signal. Les nets d'alimentation et de masse ne servent pas à l'attraction.
   - **Position** : la plus proche de la cible, dans les 4 orientations, qui respecte toutes les contraintes : 0,25 mm entre corps, domaine du bon côté de la barrière, 2 mm entre pastilles de domaines différents, zones libres des trous, bords de carte.

## 3. Contrôles (relus dans EasyEDA après application)

| Contrôle | Résultat |
|---|---|
| Composants | 198 / 198. Pastilles réelles identiques au plan à 0,002 mm près |
| Nets | 115, aucun net à une pastille (inchangé) |
| Chevauchement de corps (boîtes EasyEDA) | **Aucun** |
| Hors carte, zones libres des trous (Ø 7 mm) | Aucun |
| Isolement entre composants de domaines différents | **2,23 mm minimum** (K1 broche 8 ↔ R504). Exigence DEC-069 : ≥ 2 mm |
| Isolement dans les composants de barrière | Relais 1,1 mm (exception DEC-069), optos 4,9 mm, U9 9,1 mm |
| Orientation de barrière | Pastilles de commande en haut, de puissance en bas, sur les 5 composants. Broche 8 des relais (bobine −) sur la rangée basse, côté frontière : frontière en L à tracer au routage |
| DRC PCB | 546 « Connection Error » (liaisons non routées), aucune autre erreur |

## 4. Distances obtenues (pastille à pastille, même net)

| Règle (`PLACEMENT_CIBLE.md` §2) | Résultat | Appréciation |
|---|---|---|
| C201 à C204 près des broches 4 à 6 de U1 | 2,0 / 4,2 / 4,2 / 4,9 mm | Correct avec plan de masse à 0,2 mm sous L1 |
| C205 près de NRST (broche 10) | 6,2 mm | **À rapprocher** à la main si possible |
| Y1 près des broches 8 et 9, C206 / C207 | 2,5 mm ; 6,3 / 4,9 mm | Y1 correct ; condensateurs de charge **à rapprocher** |
| F1, D9 au pied de J1 | 4,2 / 4,0 mm | Correct |
| D1 au pied de J1 | 7,9 mm (derrière F1) | Acceptable |
| U14 au pied de J12 ; U16 près de J12 | 2,3 / 2,1 mm | Correct |
| U11, U12 au pied de J4, J5 ; D11 au pied de J8 | 5,6 / 5,6 / 2,3 mm | Correct |
| F2, D2, U5 au pied de J2 | 5,1 / 6,8 / 7,4 mm | Correct |
| C505, D3 au pied de J3 | 3,6 / 4,9 mm | Correct |
| D4, D5 près des bobines de K1, K2 | 6,1 / 3,3 mm | D4 **à rapprocher** |
| U10 et U8 près de U9 | 2,1 / 3,2 mm | Correct |
| R504 entre relais et `GND_P` | entre K1 et K2, 7,4 mm de K1 | Correct ; prises Kelvin au routage |
| Q5, Q6, U4 près de K2 | U4 à 12,9 mm de K2 | **Groupe K2 étiré** : à resserrer |
| U3 près de U1 | 8,6 mm | Acceptable (signal PWM 50 Hz) |
| U13 (CH340C) ↔ U1 | 34 mm | Acceptable : UART à 115 200 bauds |

## 5. Points à vérifier par Julien (revue G4)

1. **Sens de J12 (USB-C)** : rotation 180°, ouverture supposée vers le bord haut. **[Hypothèse]** déduite de la position des pastilles ; à confirmer en vue 3D.
2. **Corps des connecteurs XH** (J1, J4, J5, J2, J6) : connecteurs verticaux, alignés sur les bords. Vérifier le dégagement du boîtier et le passage des câbles.
3. **J7 (cavalier d'armement)**, SW1, SW2, J11 : au centre de la zone commande, accessibles boîtier ouvert. À déplacer si la mécanique l'impose.
4. Les retouches du §4 marquées « à rapprocher » : je peux les faire par script si tu valides le principe.

## 6. Constats sur l'API (PO-38)

| N° | Constat |
|---|---|
| B6 | `pcb_Primitive.getPrimitivesBBox([id])` donne l'encombrement réel (corps + sérigraphie) : base fiable pour l'anti-collision |
| B7 | Rotation PCB : sens trigonométrique, `modify(id, {x, y, rotation})` en un seul appel ; 198 appels sans échec |
| B8 | Rendu des vues : l'onglet du navigateur intégré ne capture plus les fichiers locaux ; rendu PNG par Edge en mode sans interface |

## 7. Mise à jour du 2026-11-04 (après la revue de conception)

| Point | Nouvel état |
|---|---|
| Carte | **120 × 80 mm** (DEC-072), trous M3 à (4 ; 4), (116 ; 4), (4 ; 76), (116 ; 76) mm |
| Connecteurs | Borniers à vis enfichables, ouverture vers le bord (DEC-071) ; barrettes Dupont J13 à J15 6 mm derrière J1, J4, J5, broche 1 du même côté ; J7 armement sur le bord droit (DEC-073) |
| Ajouts | D17 au pied de J6, LED5 en tête de la colonne de LED, 7 points de test (DEC-074) |
| Écarts | 0,25 mm entre corps pour les protections, le quartz, C201, C205 ; 0,6 mm ailleurs (place pour le routage et la sérigraphie). Bande libre de 3,3 mm sous chaque barrette pour les noms de broches |
| Protections → connecteur | F1 3,2 mm, D9 2,4 mm, U11 / U12 2,9 mm, U14 2,3 mm, D11 5,3 mm, C505 2,9 mm |
| Contrôles relus dans EasyEDA | 204 composants au plan (0,003 mm) ; isolement 2,47 mm minimum entre composants ; aucun chevauchement ; trous dégagés |
| DRC | 575 « Connection Error » (non routé), aucune autre erreur |
| Sérigraphie | Voir `REVUE_CONCEPTION_V1.md` §8 ; vues `hardware/pcb/SERIGRAPHIE_V1.png` et `PLACEMENT_G4.png` |
