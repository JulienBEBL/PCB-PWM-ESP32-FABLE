# Seconde revue : schéma et routage (2026-11-15)

Demandée par Julien avant la commande. Faite par Claude, hors ligne : EasyEDA n'était pas connecté au pont.

**Bases de la revue**

| Objet | Source | Limite |
|---|---|---|
| Schéma | `docs/architecture/netlist_cible.json` (égale à la netlist exportée, 0 écart le 2026-11-14) | — |
| Noms de broches | Symboles LCSC relevés dans `_outils_fable/state/P*_pins.json` | — |
| Cuivre | `_outils_fable/state/pcb_cu.json` (relevé du 2026-11-14, 16:06, après le dernier routage) | Les plans (L2, L3, L4) n'y figurent pas |
| DRC | Résultat du 2026-11-14 : 0 erreur, 0 liaison ouverte | Non relancé le 15 |

**Résultat : aucune erreur bloquante trouvée.** Ce n'est pas une preuve de fonctionnement : aucune simulation, aucun prototype.

## 1. Schéma, bloc par bloc

| Bloc | Contrôles | Résultat |
|---|---|---|
| Entrée 5 V | PTC 0,5 A / 30 V ; TVS D1 cathode au `+5V_F` ; U15, U16 : VIN 1, GND 2, CE 3, ST 5, VOUT 6 ; CE relié à VOUT | Conforme |
| Chute de tension 5 V | 0,3 A × (PTC ≤ 0,9 Ω + 2 × 0,08 Ω) ≈ 0,3 V. Relais : seuil de collage 4,0 V (80 %) | Marge suffisante si la source donne ≥ 4,8 V |
| Carte de dev | Ordre des broches J1 et J3 du guide Espressif ; broches de démarrage GPIO0, 45, 46 non connectées ; GPIO3 sur pont 10 k / 10 k ; GPIO19, 20, 35 à 38, 48 non connectées | Conforme |
| Sens d'enfichage | Broche 1 côté antenne (x = 61,34), broche 22 côté USB (x = 8,00) ; rangée J1 en haut (y = 60,5), rangée J3 en bas (y = 37,64 et 35,10) ; vue de dessus, pas de miroir | Conforme |
| Entrée PWM | ESD, 100 k à la masse, 1 k + 1 nF (1 µs), trigger 74LVC1G17 (entrée tolérante 5 V), 1 k vers GPIO1 | Conforme |
| Fins de course | Rappel 1 k au `+3V3`, 1 k + 10 nF, SRV05-4 (2 = masse, 5 = `+3V3`) | Conforme |
| Extension | 4,7 k + 10 nF, ESD ; GPIO4 analogique (ADC1), GPIO18 numérique | Conforme |
| K1 et pompe de charge | Bobine 1 (+) / 8 (−) ; diode D4 cathode au `+5V` ; Q3, Q4 : G 1, S 2, D 3 ; BAT54S : masse → 3 → sortie. Tension de grille ≈ 3,3 − 2 × 0,3 = 2,7 V, seuil max de l'AO3400A 1,45 V. Extinction : 100 k × 100 nF = 10 ms | Conforme |
| K2 et watchdog | STWD100 : WDO# 1, GND 2, EN# 3 à la masse, WDI 4, VCC 5 ; rappel 10 k ; cavalier J7 en série avec la bobine ; `ARM_FB` = 5 V × 15 / 25 = 3,0 V | Conforme |
| Pont du vérin | Repos : `VERIN_A` = `GND_P`, `VERIN_B` = `+12V_P` (rentrée). K1 seul ou K2 seul : les deux bornes au même potentiel (arrêt). Sortie de tige : K1 **et** K2 **et** contact J6 | Conforme à EX-04 |
| Entrée 12 V | PTC, TVS D2, LM74502 (EN 1, GND 2, VCAP 4, VS 5, GATE 6, OV 7, SRC 8), Q8 / Q9 à sources communes, Zener 10 V grille-source (cathode à la grille) | Conforme |
| Optocoupleurs | 4,7 k : 2,3 mA dans la LED ; rappel 10 k ; LTV-357T rang C (CTR ≥ 200 %) : saturation assurée | Conforme |
| LED RGB | 74AHCT1G125 alimenté en 5 V (seuil haut 2,0 V) ; 330 Ω ; 100 nF | Conforme |
| Buzzer | MOSFET, diode de roue libre, cathode au `+3V3` | Conforme |

## 2. Points d'attention (non bloquants)

| N° | Constat | Conséquence | Suite |
|---|---|---|---|
| A1 | Seuil de coupure en surtension du 12 V : 13,16 V typique, **12,27 V au pire** (`ALIMENTATION.md`) | Une source au-dessus de 12,3 V (batterie 3S chargée : 12,6 V ; batterie au plomb : 13,8 V) peut être coupée : le vérin ne bouge plus | PO-19 : Julien confirme la tension maximale de sa source 12 V |
| A2 | Au repos, le vérin est alimenté en rentrée en permanence | Un vérin sans fin de course interne (L12-P) reste en butée sous tension | PO-20 : Julien confirme le modèle (L12-S ou L12-P). Repris de la carte STM32 |
| A3 | Protections ESD U11, U12, D17 à 8 ou 9 mm de leur bornier | Efficacité ESD réduite, sans effet sur le fonctionnement | Aucune |
| A4 | Condensateur C302 à 5,3 mm de U3 | Sans effet à 50 Hz | Aucune |
| A5 | Vis métalliques M3 sur les trous de fixation : deux trous en zone `GND_P`, deux en zone `GND` | Un châssis métallique peut relier les deux masses si le vernis est entamé | Rondelles isolantes ou entretoises en nylon |

## 3. Routage

| Contrôle | Mesure | Résultat |
|---|---|---|
| Vias | 170, tous 0,61 / 0,305 mm | Standard JLCPCB |
| Pistes 12 V et vérin (`+12V_*`, `VERIN_*`, `NO_FEED`) | 0,41 à 0,80 mm, pour 0,5 A au plus (fusible) | Conforme |
| `GND_P` | 0,30 à 0,72 mm, 11 vias vers les plans | Conforme |
| `+5V` | 0,32 à 0,50 mm, pour 0,3 A | Conforme |
| `+3V3` | 0,50 mm | Conforme |
| Bobines (`K1_COIL_N`, `K2_COIL_N`) | 0,40 à 0,50 mm, pour 21 mA | Conforme |
| Signaux | 0,25 mm | Conforme |
| Masse `GND` | 61 vias pour 80 pastilles | Conforme |
| Cuivre le plus proche du bord | 1,1 mm | Conforme |
| Cuivre le plus proche d'un trou de fixation | 4,5 mm du centre (LED1) | Conforme (tête de vis M3 : rayon 3 mm) |
| Découplage | 2 à 5 mm des broches d'alimentation | Conforme |
| Isolement commande / puissance | 2,34 mm (contrôle du 2026-11-14) | Conforme |
| Barrettes de la carte de dev | Pas 2,54 mm ; 21 × 2,54 = 53,34 mm ; entraxes 22,86 et 25,40 mm | Conforme au plan Espressif |

**Non vérifié dans cette revue** : forme des plans (îlots, étranglements), sérigraphie, aspect visuel. Le DRC du 14 novembre garantit la continuité électrique, pas la qualité visuelle.

## 4. LED1 (DEC-021)

| Élément | WS2812B-B/W (C114586) | XL-5050RGBC-2812B (C2843785) |
|---|---|---|
| État JLCPCB le 2026-11-15 | Retirée de l'assemblage | Stock 1 200 190, Extended |
| Brochage (vue de dessus) | 1 VDD, 2 DOUT, 3 VSS, 4 DIN | 1 VDD, 2 DO, 3 GND, 4 DI : identique, repère au même angle |
| Boîtier | 5050, 4 broches | 5,0 × 5,0 × 1,6 mm, 4 broches |
| Alimentation | 3,7 à 5,3 V | 3,5 à 5,5 V |
| Seuil haut de l'entrée | 0,7 × VDD | 0,7 × VDD (fourni par U17 en 5 V) |
| Courant | — | 12 mA par couleur |

Source : datasheet XINGLIGHT lue sur LCSC le 2026-11-15 (pages 4, 5, 11). Empreinte et routage inchangés. Reste à faire : mettre à jour l'attribut de LED1 dans EasyEDA (PO-18).

## 5. Contrôles refaits dans EasyEDA (2026-11-15, après reconnexion)

| Contrôle | Résultat |
|---|---|
| Uuid du projet | `836928ac4399433ab9cd56636d997eda` |
| LED1 dans le schéma et le PCB | C2843785, position inchangée |
| Netlist exportée contre cible | 136 composants, 78 nets, 0 écart |
| ERC | 0 erreur, 1 avertissement : apparaît avec la nouvelle référence de LED1, disparaît avec l'ancienne (PO-22) |
| DRC | 0 erreur, 0 liaison ouverte |
| Isolement | 2,34 mm, 0 violation |
| Plans | 6 présents : `GND` et `GND_P` (L2, L4), `+3V3` et `+12V_P` (L3) |
| Vue d'ensemble | Relue sur image : bande d'isolement nette, pas d'anomalie visible |

## 6. États du vérin (L12-30-50-12-S)

| K1 | K2 | Contact J6 | `VERIN_A` | `VERIN_B` | Vérin |
|---|---|---|---|---|---|
| repos | repos | indifférent | `GND_P` | `+12V_P` | Rentre, puis s'arrête seul en butée |
| collé | repos | fermé | `+12V_P` | `+12V_P` | Arrêt |
| collé | repos | ouvert | en l'air | `+12V_P` | Arrêt |
| repos | collé | indifférent | `GND_P` | `GND_P` | Arrêt |
| collé | collé | fermé | `+12V_P` | `GND_P` | Sort, puis s'arrête seul en butée |
| collé | collé | ouvert | en l'air | `GND_P` | Arrêt |
| — | — | 12 V absent | — | — | Immobile |

Sens « rouge au + = sortie » : PO-07, à vérifier à vide.