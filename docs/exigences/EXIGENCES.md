# Exigences retenues

**Version :** v1, 2026-11-14. **Source :** `Julien` = prompt de lancement ou réponses du 2026-11-14 (DEC-005). Les autres sources sont citées.
**Vérification :** N = netlist (script `sch_check`), R = revue de schéma, P = contrôle PCB (script ou DRC), B = BOM, F = firmware / essai (hors périmètre de la carte nue).

## Fonction et sécurité

| N° | Exigence | Source | Critère de vérification |
|---|---|---|---|
| EX-01 | Lire une consigne PWM 1000–2000 µs, ~50 Hz, 3,3 V ou 5 V | Julien ; STM32 DEC-030 | R : entrée tolérante 5 V (ESD, 1 kΩ, trigger de Schmitt alimenté en 3,3 V) ; N : `PWM_IN` sur GPIO1 |
| EX-02 | Piloter un vérin Actuonix L12 12 V par inversion de polarité avec 2 relais DPDT | Julien ; STM32 DEC-022 | R : tableau du pont (K1, K2) conforme à `SYNOPTIQUE.md` §3 |
| EX-03 | Relais au repos = position sûre (tige rentrée) | Julien | R : au repos `VERIN_A` = `GND_P`, `VERIN_B` = `+12V_P` |
| EX-04 | Aucune défaillance simple ne provoque l'action | Julien ; STM32 DEC-020 | R : analyse de `SYNOPTIQUE.md` §4 ; l'action exige K1 et K2, tenus par deux principes indépendants |
| EX-05 | Cavalier d'armement physique sur la chaîne d'action | Julien ; STM32 DEC-025, DEC-073 | N : J7 en série avec la bobine de K2 ; relu par `ARM_FB` |
| EX-06 | Relecture de l'état des deux relais | Julien ; STM32 DEC-023 | N : pôle B de K1, K2 vers `K1_FB`, `K2_FB` |
| EX-07 | Présence 12 V lue par optocoupleur | Julien ; STM32 DEC-024 | N : U6 entre `+12V_P` et `V12_OK` |
| EX-08 | Isolation et masses séparées entre le domaine 12 V et le domaine 5 V / PWM | Julien ; STM32 DEC-021 | N : seuls K1, K2, U6, U7 touchent les deux domaines ; P : ≥ 2 mm entre cuivres des deux domaines, hors empreinte des relais |
| EX-09 | Protection du 12 V pour une source non maîtrisée : inversion, surtension, fusible | Julien ; STM32 DEC-034, DEC-065 | R : F2, D2, U5 + Q8 / Q9, seuil 13,16 V typique |
| EX-10 | Pompe de charge sur K1, watchdog externe sur K2, 5e contact d'arrêt matériel (J6) relu par optocoupleur | Julien (Q3 : « tu conserves tout ») ; STM32 architecture §5, §6 | N : Q3 commandé par `CP_OUT`, Q5 par `WD_OK`, `NO_FEED` entre J6 et le NO de K1, U7 |
| EX-11 | États des GPIO au démarrage : aucune action possible | Julien (revue finale) | R : rappels à la masse sur `K1_G`, `K2_G`, `WDT_KICK` ; `CP_DRV` couplé par condensateur ; aucune broche de démarrage sur une commande |

## Entrées, sorties, interfaces

| N° | Exigence | Source | Critère de vérification |
|---|---|---|---|
| EX-20 | 4 fins de course à contacts inverseurs, NO et NC lus (8 entrées) | Julien ; STM32 DEC-037 | N : 8 nets `FC_*` sur 8 GPIO |
| EX-21 | LED RGB adressable | Julien ; ESP32 DEC-019 | N : LED1 WS2812B, `RGB_DATA` |
| EX-22 | Buzzer | Julien | N : LS1, `BUZZER` |
| EX-23 | 2 entrées d'extension : 1 analogique, 1 numérique | Julien ; ESP32 DEC-021 | N : `EXT_IN1` sur une entrée ADC1, `EXT_IN2` |
| EX-24 | Sortie STATUS vers le contrôleur, mesure du 5 V, LED « 3,3 V présent », points de test | Julien (Q3) ; STM32 DEC-039, DEC-074 | N : Q2, `V5_MON`, LED5 ; P : 6 points de test |
| EX-25 | Câblage externe identique à la carte STM32 : mêmes borniers, même ordre | Julien | B : mêmes références J1 à J7 ; N : même brochage ; écart admis : J8 (1×4, Q4) |

## Carte de dev, alimentation

| N° | Exigence | Source | Critère de vérification |
|---|---|---|---|
| EX-30 | Carte de dev ESP32-S3-DevKitC-1 enfichée sur barrettes femelles, amovible, **aucune soudure par Julien** | Julien (Q1) | B : barrettes femelles posées par JLCPCB |
| EX-31 | Écart des rangées non confirmé : accepter 22,86 mm **et** 25,40 mm | Julien (Q1) | P : 3 rangées, entraxes mesurés sur le PCB |
| EX-32 | Port USB de la carte de dev accessible depuis un bord du PCB ; pas de port USB sur le PCB | Julien (Q2) | P : extrémité USB de la carte de dev au bord gauche |
| EX-33 | Alimentation 5 V externe | Julien | N : J1.1, F1, D1, U15 |
| EX-34 | Wi-Fi et Bluetooth jamais utilisés | Julien | F ; R : entrées analogiques sur ADC1 seulement |

## Fabrication

| N° | Exigence | Source | Critère de vérification |
|---|---|---|---|
| EX-40 | PCB 4 couches | Julien | P : empilement |
| EX-41 | Assemblage JLCPCB au maximum ; seuls les gros connecteurs peuvent être soudés à la main | Julien | B : toutes les références en stock JLCPCB |
| EX-42 | Composants sur la face supérieure uniquement ; composants autorisés sous la carte de dev | Julien (Q6) | P : aucun composant en face inférieure |
| EX-43 | Format 120 × 80 mm, 4 trous M3, borniers aux mêmes places que la carte STM32 ; agrandir ou réduire si nécessaire | Julien (Q2) ; STM32 DEC-072 | P : contour et trous |
| EX-44 | Simplicité : rien de superflu ; schéma, placement et routage lisibles | Julien | R |

## Conflits signalés entre ces exigences et les anciens documents

| Ancien document | Conflit | Arbitrage |
|---|---|---|
| ESP32 PO-21 : écart de 25,40 mm | Non confirmé, 22,86 mm possible | EX-31 |
| ESP32 brochage v3 : GPIO35, 36, 37 utilisés, « N8 uniquement » | La variante N8 est en fin de vie (guide Espressif, 2026-11-14) ; ces broches sont prises sur les variantes à mémoire octale | Brochage v4 sans ces broches (DEC-007) |
| ESP32 BOM : TPS3430, EL357N(C) | En rupture chez JLCPCB le 2026-11-14 | DEC-008, DEC-009 |
| STM32 DEC-071 : barrettes Dupont J13 à J15 | Non demandées ici | Supprimées (Q5) |
| Anciennes consignes : arrêt à chaque jalon | Autonomie demandée | Relecture à la fin |
