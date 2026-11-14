# Rapport — Phase 5 : routage (jalon G5, en cours)

**Date :** 2026-11-04 — **Session :** 13 (suite) — **Outil :** Claude Code, EasyEDA Pro V3.2.209 Full Online
**Statut au 2026-11-12 :** re-placement local autour de U1 fait, côté commande à re-router (52 nets ouverts, 6 erreurs d'écart à reprendre, §9). Côté puissance routé, isolement conforme. Pas encore de remplissage L1 / L4 ni de couture.
**Décision :** DEC-076 (méthode hybride, règles).

## 1. Règles appliquées (configuration « PCB_PWM_V3_DEC076 »)

| Règle | Valeur |
|---|---|
| Piste par défaut | 0,25 mm |
| Écart minimal cuivre / cuivre | 0,2 mm (64 valeurs relevées depuis la configuration JLCPCB 2 couches) |
| Classe P05 (`GND`, `+5V`, `+3V3`, `+5V_F`, `+5V_IN`, `VBUS`, `+5V_ISO`, `+3V3_EXT`) | 0,5 mm par défaut, 0,2 mm minimum (sorties de broches fines) |
| Classe P10 (`+12V_IN`, `+12V_F`, `+12V_P`, `VERIN_A`, `VERIN_B`, `MOT_RET`, `NO_FEED`, `GND_P`) | 1,0 mm par défaut, 0,3 mm minimum |
| Vias | 0,61 / 0,305 mm |

## 2. Isolement (DEC-069)

| Élément | Réalisation |
|---|---|
| Bande d'isolement | Zones interdites (pistes, plans, remplissages) sur toutes les couches, y = 28 à 30 mm, interrompues par un couloir de 1,2 mm à l'aplomb des broches 8 de K1, K2 |
| Broche 8 des relais (bobine, côté commande, dans la rangée puissance) | Zones interdites au cuivre sur 2 mm autour, départs de la broche 7 décalés vers la gauche (pastille de 2,1 mm de large) |
| Plans | L2 : `GND` (y ≥ 30,2) / `GND_P` (y ≤ 27,8) ; L3 : `+3V3` / `+12V_P` ; îlots morts supprimés |
| Contrôle géométrique (script, tout le cuivre : pastilles, pistes, vias, 4 couches) | **0 violation**, isolement minimal **2,02 mm** (piste `K2_COIL_N` / broche 7 de K2) |

## 3. Routage réalisé

| Étape | Méthode | Résultat |
|---|---|---|
| Vias de liaison aux plans | Script : 1 via par pastille CMS de `GND`, `GND_P`, `+3V3`, `+12V_P`, raccord ≤ 2,8 mm, écarts contrôlés | 178 vias ; broches 4-5-6 du MCU (`+3V3`) reliées entre elles, 1 via |
| Quartz | Autorouteur, face dessus | 10 à 11 mm par net (C206 / C207 à rapprocher, R9) |
| Côté puissance (16 nets) | Autorouteur, faces dessus / dessous | 16 / 16 ; `MOT_RET` repris à la main autour de K1 (via et face dessous) |
| USB, CC, bobines des relais | Autorouteur | 7 / 7 ; bobines par le couloir de la broche 8 |
| Signaux commande (≈ 90 nets) | Autorouteur, puis arrachage et reprise ciblés autour du MCU | ≈ 95 % ; quelques pistes sur L3 (`LED3`, `LED4`) |

## 4. DRC (EasyEDA, mode strict)

| Catégorie | Nombre |
|---|---|
| Erreurs d'écartement | 1 (`+5V` près de la broche `GND` de U2) |
| Liaisons ouvertes | 16, sur 8 nets (§5) |

## 5. Restant

| Net | Où | Cause |
|---|---|---|
| `+5V`, `VBUS` | U16 (diode idéale USB), contre J12 | Boîtier SC-70-6 coincé entre la prise USB-C et ses vias |
| `NRST`, `FC_R1_NO`, `FC_S1_NC`, `I_MON`, `WDT_KICK` | Autour du MCU U1 et du chien de garde U4 | Broches au pas de 0,5 mm entourées de pistes et vias : avec 0,25 mm de piste et 0,2 mm d'écart, il ne reste qu'un couloir d'une case pour sortir |
| Écart `+5V` / U2.2 | U2 (régulateur) | Piste 0,5 mm trop près d'une broche voisine : à affiner à 0,3 mm |

Options : (a) écarts réduits **localement** autour de U1, U4, U16 (0,2 mm de piste, 0,15 mm d'écart : JLCPCB accepte 0,09 mm) ; (b) écarter quelques composants autour de U1 et U16, puis re-router la zone ; (c) finir à la main dans EasyEDA (8 liaisons, routeur interactif).

## 6. Reste à faire ensuite

Remplissage de masse L1 / L4 cousu (`GND` / `GND_P`), vias de couture le long des bords et de la barrière, rapprochement de C206 / C207, DRC complet, contrôle d'isolement final, vérification de la sérigraphie (les pistes ne changent pas la sérigraphie), rendu des 4 couches.

## 7. Constats sur l'API (PO-38)

| N° | Constat |
|---|---|
| C1 | `pcb_Document.autoRouting` fonctionne en V3.2.209 (documenté v4.1.66) ; il faut **lister les nets** (`RoutingNets`), sinon rien n'est routé. Durée : 1 s à 2 min ; appel lancé sans attente puis interrogé |
| C2 | Les plans doivent être recalculés (`rebuildCopperRegion`) après chaque ajout de cuivre, sinon le DRC signale des centaines d'écarts |
| C3 | Un via qui chevauche une piste sans coïncider avec son extrémité n'est pas considéré comme relié |
| C4 | `preserveSilos: true` garde des îlots morts, signalés comme liaisons ouvertes |
| C5 | Les noms des zones interdites ne sont pas conservés |
| C6 | L'onglet actif peut changer pendant le travail (Julien dans l'éditeur) : chaque appel réactive le PCB |

## 8. Suite : règles fines locales (DEC-077)

| Étape | Résultat |
|---|---|
| Classes d'écart par net (0,15 mm) | Écartées : le DRC applique l'écart le plus strict des deux nets en présence (52 erreurs). Routage des 7 nets supprimé, règles de nets rétablies |
| Zones à règle propre (`ZONE_FINE_U1`, `ZONE_FINE_U16`, `ZONE_FINE_U2`) : écart 0,15 mm, piste 0,2 mm | En place |
| Autorouteur sur les 7 nets | Résultats variables (6 / 7, puis 3 / 7). Les routages longs (1 à 3 min) provoquent des rechargements d'EasyEDA qui perdent le résultat |
| État | 16 liaisons ouvertes sur 7 nets : `+5V`, `VBUS` (U16), `NRST`, `WDT_KICK`, `FC_R1_NO`, `FC_S1_NC`, `I_MON`. Aucune erreur d'écartement, isolement 2,02 mm |

## 9. Session 14 (2026-11-05) : PO-42, Freerouting, re-placement autour de U1

| Étape | Résultat |
|---|---|
| PO-42 → DEC-079 | `K2_FB` PA1 (12), `ARM_FB` PB1 (20). Schéma et pastilles du PCB modifiés sans import ; « Netlist Error » disparue |
| Freerouting 2.5.0 (CLI native, puis JAR + JRE portable) | **Inutilisable avec le DSN d'EasyEDA.** CLI native : plantages (zones, passes multiples), couches interdites ignorées. JAR : cuivre existant non relié (carte exportée en une seule « image »), stagnation. Import filtré essayé puis annulé. Méthode abandonnée |
| Routeur maison + autorouteur EasyEDA, après arrachage des 39 nets de U1 | 17 nets ouverts (16 signaux + `GND`), 0 erreur d'écart, isolement 2,02 mm. Goulot : broches de U1 encerclées par les passifs à moins de 1 mm |
| Re-placement local (autorisé par Julien) | `u1_ring.cjs` : couronne libre de 2,2 mm autour des broches de U1 (1,5 mm pour C201 à C205). 21 composants déplacés, 1,72 mm au plus, côté commande seulement. `fullchk.cjs` : 0 chevauchement, isolement composants 2,47 mm |
| Avant déplacement | 49 nets arrachés (aucun du domaine puissance), 22 raccords et 20 vias de plans supprimés ; après : 19 vias de plans refaits |
| DRC après re-placement | 52 nets ouverts (attendu), **6 erreurs d'écart** : Q6, R411 contre 5 segments `K2_ARM` / `+5V` non arrachés. Suppression de ces segments lancée sans réponse : **état à relire (PO-43)** |

Les 49 nets sont à re-router d'un bloc. Pour revenir au placement d'avant : appliquer l'opposé de `u1_ring_moves.json`, puis restaurer le cuivre depuis `cu2_avant_rip.json` (`restore_nets.mjs`, 39 nets d'origine seulement).
