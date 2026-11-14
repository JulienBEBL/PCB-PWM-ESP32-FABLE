# Rapport de livraison — carte PWM sécurisée ESP32

**Date :** 2026-11-14. **Projet EasyEDA :** `FABLE52_PCB_ESP32` (`836928ac4399433ab9cd56636d997eda`). **Fichiers à envoyer :** `hardware/exports/`.

## 1. Ce qui est fait

| Élément | État | Preuve |
|---|---|---|
| Schéma, 10 pages, 136 composants | Terminé | Netlist exportée = netlist cible (0 écart) ; ERC 0 erreur, 0 avertissement |
| PCB 120 × 80 mm, 4 couches, composants en face supérieure | Terminé | DRC 0 erreur, 0 liaison ouverte |
| Isolement 12 V / 5 V | Terminé | 2,34 mm au minimum, bande sans cuivre de 3 mm |
| BOM | 45 références, toutes en stock JLCPCB le 2026-11-14 (relevé deux fois) | `hardware/bom/BOM.md` |
| Exports | Gerber, BOM, CPL | `hardware/exports/` |
| Revue finale | 0 bloquant restant | `REVUE_FINALE.md` |

Fichiers de `hardware/exports/` :

| Fichier | Usage |
|---|---|
| `Gerber_FABLE52_PCB_ESP32_2026-11-14.zip` | À déposer sur la page de commande du PCB |
| `BOM_JLCPCB_2026-11-14.csv` | BOM pour l'assemblage (colonnes Comment, Designator, Footprint, LCSC Part #) |
| `CPL_JLCPCB_2026-11-14.csv` | Positions pour l'assemblage |
| `BOM_EasyEDA_…`, `CPL_EasyEDA_…` (.csv, .xlsx) | Exports d'origine d'EasyEDA, acceptés aussi par JLCPCB |

Le plus simple reste de commander depuis EasyEDA (menu de commande du PCB) : les fichiers sont alors générés par l'outil lui-même.

## 2. Décisions prises (à relire)

Toutes dans `docs/memoire/DECISIONS.md`. Celles qui changent la carte par rapport à ce que vous aviez validé :

| N° | Décision | Pourquoi |
|---|---|---|
| DEC-006 | 3 barrettes femelles : J20, J22 (22,86 mm), J21 (25,40 mm) | Entraxe officiel 22,86 mm (plan Espressif) ; 25,40 mm gardé pour les clones |
| DEC-007 | Brochage v4, sans GPIO35 à 37 | Variante N8 en fin de vie ; N8, N8R2, N16R8 acceptées |
| DEC-008 | Watchdog STWD100YNX (délai simple, 102 ms) | TPS3430 en rupture |
| DEC-009 | Optocoupleurs LTV-357T-C | EL357N en rupture |
| DEC-010 | Rappels de `K1_G`, `K2_G` à 4,7 kΩ | Marge contre un rappel interne parasite |
| DEC-011 | Dupont J13 à J15, R411 et résistances optionnelles supprimés | Simplicité |
| DEC-020 | R303 = 1 kΩ | Impulsion basse de GPIO1 au démarrage |

## 3. Câblage externe (borniers, vus de face, fiche débranchée)

Identique à la carte STM32 pour J1 à J7. La broche 1 a une pastille carrée.

| Connecteur | Broche | Signal |
|---|---|---|
| J1 (4 pts, 3,81) | 1 / 2 / 3 / 4 | +5 V / GND / PWM / STATUS (drain ouvert, bas = prêt) |
| J4 (6 pts, 3,81) fins de course « rentré » | 1 / 2 / 3 | Commun contact R1 (GND) / R1 NO / R1 NC |
| | 4 / 5 / 6 | Commun contact R2 (GND) / R2 NO / R2 NC |
| J5 (7 pts, 3,81) fins de course « sorti » | 1 / 2 / 3 | Commun contact S1 (GND) / S1 NO / S1 NC |
| | 4 / 5 / 6 / 7 | Commun contact S2 (GND) / S2 NO / S2 NC / non câblé |
| J8 (barrette 1×4) extension | 1 / 2 / 3 / 4 | +3,3 V / EXT1 analogique / EXT2 numérique / GND. **3,3 V maximum** |
| J2 (2 pts, 5,08) | 1 / 2 | +12 V / 0 V du 12 V |
| J3 (2 pts, 3,81) vérin | 1 / 2 | Fil rouge / fil noir |
| J6 (3 pts, 3,81) 5e contact | 1 / 3 | Contact NC d'arrêt matériel. **À ponter si le contact n'existe pas**, sinon la tige ne sort jamais |
| J7 (3 pts, 5,08) armement | 1 / 3 | Pont de fil = armé |

Fiches à vis à commander à part (non fournies par l'assemblage) : Kangnex série 15EDGK-3,81 (2, 3, 4, 6, 7 points) et 2EDGK-5,08 (2, 3 points). Compatibilité à vérifier sur la fiche produit (PO-14).

## 4. À vérifier avant de payer

| N° | Vérification | Où |
|---|---|---|
| 1 | Vue 3D du PCB : rien d'aberrant, carte de dev à gauche, USB au bord | EasyEDA, PCB1, vue 3D |
| 2 | Aperçu de placement de JLCPCB : point de la broche 1 des circuits, **sens de D1, D2, D17, D9 à D12, LED5, D4 à D6, D8** (cathode sur la pastille 1), sens des relais (repère côté broches 1 / 8) | Page de commande, étape « Component Placements » |
| 3 | Toutes les lignes de la BOM « confirmées », aucune en rupture ; en particulier **C1354132** (watchdog). En rupture : remplacer par **C46043** | Page de commande, étape BOM |
| 4 | Borniers et barrettes reconnus comme composants traversants (assemblage « Standard ») | Idem |
| 5 | Relire `DECISIONS.md` (DEC-006 à DEC-020) | Dépôt |
| 6 | Donner le droit d'écriture GitHub au compte `Jujuxw9` ou reconnecter `gh` : les commits sont locaux (PO-06) | — |

## 5. Options de commande JLCPCB recommandées

| Option | Valeur | Remarque |
|---|---|---|
| Couches | 4 | |
| Dimensions | 120 × 80 mm | Lues dans le Gerber |
| Épaisseur | 1,6 mm | |
| Matériau | FR-4 TG 135–140 | |
| Cuivre | 1 oz extérieur, 0,5 oz intérieur | Les règles sont faites pour 1 oz |
| Finition | ENIG | Usage extérieur ; HASL sans plomb possible, moins cher |
| Empilement | Standard JLCPCB (JLC04161H-7628) | Pas d'impédance contrôlée |
| Vias | Recouverts de vernis (« tented ») | Vias 0,61 / 0,305 mm |
| Numéro de commande | « Specify location » ou « Remove mark » | Sinon imprimé n'importe où |
| Assemblage | **Standard PCBA**, face supérieure seule | Obligatoire : composants traversants |
| « Confirm Parts Placement » | **Oui** | Contrôle du sens des composants par JLCPCB |
| « Confirm Production File » | Oui | |
| Quantité | 5 PCB, 2 ou 5 assemblés | Au choix |

Valeurs d'options à confirmer sur la page de commande : je ne les ai pas relues sur le site de JLCPCB aujourd'hui [Hypothèse].

## 6. Points ouverts restants

Voir `docs/memoire/POINTS_OUVERTS.md`. Les principaux :

| N° | Point | Quand |
|---|---|---|
| PO-01 | Mesurer l'entraxe de la carte de dev reçue (22,86 attendu) | À réception |
| PO-03 | Test au multimètre de la diode USB de la carte de dev | À réception |
| PO-06 | Push GitHub refusé | Maintenant |
| PO-07 | Sens du vérin (rouge = sortie) à confirmer à vide | Mise en service |
| PO-09 | Sens de D1 à confirmer dans l'aperçu JLCPCB | Commande |
| PO-10 | Stock du watchdog | Commande |
| PO-12 | Firmware à adapter au brochage v4 et au watchdog STWD100 | Avant essais |

## 7. Risques

| Risque | Gravité | Parade |
|---|---|---|
| Composant polarisé posé à l'envers | Carte à reprendre | « Confirm Parts Placement », vérification n° 2 |
| Carte de dev d'un clone au format différent (longueur, entraxe) | Enfichage impossible | Deux entraxes câblés ; préférer une carte Espressif d'origine |
| Carte routée par autorouteur, non relue visuellement par un humain | Trajets peu élégants ; pas d'erreur électrique connue | DRC, contrôle d'isolement et netlist à 0 écart ; revue 3D par Julien |
| Watchdog à délai simple au lieu d'un watchdog à fenêtre | Un firmware qui bascule `WDT_KICK` trop vite n'est plus détecté | K1 reste protégé par la pompe de charge ; l'action exige toujours K1 et K2 |
| Buzzer alimenté par le 3,3 V de la carte de dev (≈ 100 mA) | Chute de tension sur le 3,3 V | C407 10 µF ; à observer aux essais ; limiter le rapport cyclique |
| Carte de dev en extérieur (vibrations, oxydation) | Faux contacts | Maintien mécanique à prévoir (repris de ESP32 PO-03) |

## 8. Contraintes pour le firmware (brochage v4)

| Signal | GPIO | Contrainte |
|---|---|---|
| `K1_CMD` / `K2_CMD` | 21 / 47 | Actifs à l'état haut |
| `CP_DRV` | 42 | Signal carré ≈ 10 kHz, 50 %, en permanence pour autoriser K1 |
| `WDT_KICK` | 14 | Un front au moins toutes les 50 ms (délai minimal du watchdog : 71 ms) |
| `K1_FB` / `K2_FB` | 40 / 12 | Bas = relais excité |
| `ARM_FB` | 41 | Haut = cavalier présent |
| `V12_OK` / `STOP_HW_FB` | 39 / 7 | Bas = 12 V présent / 5e contact fermé |
| `PWM_IN` | 1 | |
| `FC_R1_NO`, `FC_R1_NC`, `FC_R2_NO`, `FC_R2_NC` | 2, 9, 10, 11 | Bas = contact fermé |
| `FC_S1_NO`, `FC_S1_NC`, `FC_S2_NO`, `FC_S2_NC` | 15, 16, 17, 5 | Idem |
| `EXT_IN1` / `EXT_IN2` | 4 (ADC1_CH3) / 18 | |
| `V5_MON` | 3 (ADC1_CH2) | Tension = 5 V / 2 |
| `STATUS_OUT`, `RGB_DATA`, `BUZZER` | 8, 6, 13 | STATUS : haut = ligne tirée à la masse |
