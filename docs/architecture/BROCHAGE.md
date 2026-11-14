# Brochage de la carte de dev — v4

**Version :** v4, 2026-11-14 (DEC-007). Remplace le brochage v3 de l'ancien dépôt ESP32 (ESP32 DEC-023).
**Source des broches :** Espressif, *ESP32-S3-DevKitC-1 v1.1 User Guide*, tableaux J1 et J3, lus le 2026-11-14 (docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s3/esp32-s3-devkitc-1/user_guide_v1.1.html).

## 1. Pourquoi une v4

Le guide Espressif indique que la variante **N8 est en fin de vie** et que, sur les variantes à mémoire octale (N16R8, N32R16V), **GPIO35, 36 et 37 ne sont pas disponibles**. Le brochage v3 les utilisait (`STATUS`, `FC_S2_NC`, `CP_DRV`). La v4 ne les utilise plus : la carte accepte N8, N8R2 et N16R8. La variante N32R16V reste exclue (GPIO47 en 1,8 V, guide Espressif repris par ESP32 brochage A2).

## 2. Règles

| N° | Règle | Source |
|---|---|---|
| R1 | Commandes de sécurité actives à l'état haut, rappel externe à la masse | Reprise ESP32 R1 |
| R2 | Aucune sortie sur une broche de démarrage (GPIO0, 3, 45, 46) ni à impulsion haute au démarrage (GPIO18, 19, 20) | Reprise ESP32 R2 |
| R3 | GPIO3 et GPIO18 admis **en entrée**, pour des signaux sans rôle de sécurité (`V5_MON`, `EXT_IN2`) | Nouveau. GPIO3 n'est lu au démarrage que si un eFuse est programmé (reprise ESP32 PO-04) |
| R4 | `K1_CMD` / `K2_CMD` sur deux registres (GPIO0–31, GPIO32–48) ; idem `K1_FB` / `K2_FB` ; chaque commande séparée de son signal de validation | Reprise ESP32 R4 |
| R5 | GPIO43, 44 (UART0), 19, 20 (USB), 38, 48 (LED de la carte de dev), 35, 36, 37 : non utilisés | Guide Espressif |
| R6 | Entrées analogiques sur ADC1 (GPIO1 à 10) | Reprise ESP32 R6 |

## 3. J20 — rangée J1 de la carte de dev

| Broche | Carte de dev | Net | Rôle |
|---|---|---|---|
| 1, 2 | 3V3 | `+3V3` | 3,3 V fourni par la carte de dev |
| 3 | RST | — | Non connecté |
| 4 | GPIO4 | `EXT_IN1` | Extension analogique (ADC1_CH3) |
| 5 | GPIO5 | `FC_S2_NC` | Fin de course (v3 : GPIO36) |
| 6 | GPIO6 | `RGB_DATA` | LED RGB |
| 7 | GPIO7 | `STOP_HW_FB` | Relecture de l'arrêt matériel (v3 : GPIO42) |
| 8 | GPIO15 | `FC_S1_NO` | |
| 9 | GPIO16 | `FC_S1_NC` | |
| 10 | GPIO17 | `FC_S2_NO` | |
| 11 | GPIO18 | `EXT_IN2` | Extension numérique (v3 : GPIO5) |
| 12 | GPIO8 | `STATUS_OUT` | Sortie STATUS (v3 : GPIO35) |
| 13 | GPIO3 | `V5_MON` | Mesure du 5 V, ADC1_CH2 (v3 : GPIO8) |
| 14 | GPIO46 | — | Non connecté |
| 15 | GPIO9 | `FC_R1_NC` | |
| 16 | GPIO10 | `FC_R2_NO` | |
| 17 | GPIO11 | `FC_R2_NC` | |
| 18 | GPIO12 | `K2_FB` | Relecture K2 |
| 19 | GPIO13 | `BUZZER` | |
| 20 | GPIO14 | `WDT_KICK` | Watchdog |
| 21 | 5V | `+5V_ESP` | Alimentation de la carte de dev |
| 22 | G | `GND` | |

## 4. J21 et J22 — rangée J3 de la carte de dev (reliées broche à broche)

| Broche | Carte de dev | Net | Rôle |
|---|---|---|---|
| 1 | G | `GND` | |
| 2, 3 | TX, RX | — | Non connectés (moniteur série) |
| 4 | GPIO1 | `PWM_IN` | Consigne PWM |
| 5 | GPIO2 | `FC_R1_NO` | |
| 6 | GPIO42 | `CP_DRV` | Pompe de charge (v3 : GPIO37) |
| 7 | GPIO41 | `ARM_FB` | Relecture du cavalier |
| 8 | GPIO40 | `K1_FB` | Relecture K1 |
| 9 | GPIO39 | `V12_OK` | Présence 12 V |
| 10 à 16 | GPIO38, 37, 36, 35, 0, 45, 48 | — | Non connectés |
| 17 | GPIO47 | `K2_CMD` | Commande K2 |
| 18 | GPIO21 | `K1_CMD` | Commande K1 |
| 19, 20 | GPIO20, 19 | — | Non connectés (USB) |
| 21, 22 | G | `GND` | |

## 5. Contrôle de la règle R4

| Paire | GPIO | Registres |
|---|---|---|
| `K1_CMD` / `K2_CMD` | 21 / 47 | 0–31 / 32–48 |
| `K1_CMD` / `CP_DRV` | 21 / 42 | 0–31 / 32–48 |
| `K2_CMD` / `WDT_KICK` | 47 / 14 | 32–48 / 0–31 |
| `K1_FB` / `K2_FB` | 40 / 12 | 32–48 / 0–31 |
| `K1_CMD` / `K1_FB` | 21 / 40 | 0–31 / 32–48 |
| `K2_CMD` / `K2_FB` | 47 / 12 | 32–48 / 0–31 |

## 6. Mécanique des barrettes (DEC-006)

Trois barrettes femelles 1×22 au pas de 2,54 mm, posées par JLCPCB : J20 (commune), J21 à 25,40 mm de J20, J22 à 22,86 mm de J20. La carte de dev s'enfiche sur J20 + J21 ou sur J20 + J22 selon son entraxe réel (PO-01). Broche 1 du côté de l'antenne, broche 22 du côté des ports USB.
