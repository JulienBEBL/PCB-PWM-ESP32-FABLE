# Fonctionnement de la carte : référence pour le firmware

**Créé :** 2026-11-15 (session 03), à la demande de Julien, pour coder l'ESP32. **Sources :** `netlist_cible.json`, DEC-025 à DEC-032, `LIVRAISON.md` §8, `SYNOPTIQUE.md`, datasheets citées. Toute modification de la carte doit mettre ce fichier à jour.

## 1. Connecteurs

| Rep. | Type | Broches | Rôle |
|---|---|---|---|
| J1 | Bornier 4 pts 3,81 | 1 +5 V · 2 GND · 3 PWM · 4 STATUS | Contrôleur : alimentation 5 V, consigne, retour d'état |
| J2 | Bornier 2 pts 5,08 | 1 +12 V · 2 0 V (GND_P) | Puissance du vérin |
| J3 | Bornier 2 pts 3,81 | 1 rouge (VERIN_A) · 2 noir (VERIN_B) | Vérin Actuonix L12-…-12-**S** (fins de course internes, obligatoire) |
| J4 | Bornier 6 pts 3,81 | 1 COM · 2 NO · 3 NC (R1) ; 4 COM · 5 NO · 6 NC (R2) | Fins de course « rentré » |
| J5 | Bornier 7 pts 3,81 | 1 COM · 2 NO · 3 NC (S1) ; 4 COM · 5 NO · 6 NC (S2) ; 7 libre | Fins de course « sorti » |
| J6 | Bornier 3 pts 3,81 | 1 +12 V · 3 retour · 2 libre | 5e contact NC d'arrêt matériel. Ponter 1-3 s'il n'existe pas |
| J7 | Bornier 3 pts 5,08 | Pont 1-3 = armé | Cavalier d'armement (alimente la bobine de K2) |
| J8 | Barrette 1×4 | 1 +3,3 V (via 33 Ω) · 2 EXT1 · 3 EXT2 · 4 GND | Extension, 3,3 V au maximum |
| J20, J21/J22 | Barrettes 1×22 | DevKit ESP32-S3-DevKitC-1 N8, N8R2 ou N16R8 | J22 : entraxe 22,86 mm (Espressif) ; J21 : 25,40 mm |
| TP1 à TP6 | Pastilles | 5V, 3V3, GND, PWM, 12V, GND_P | Mesures |

Fins de course : contacts secs vers COM (GND). Aucune tension sur J4, J5, J8.

## 2. Alimentations

- **Commande (GND)** : J1 5 V → F1 0,5 A → D1 → U15 (diode idéale) → `+5V` (bobines, LED RGB) → U16 → broche 5V de la DevKit → régulateur de la DevKit → `+3V3`.
- **USB seul** : U16 bloque l'USB vers `+5V`. La DevKit tourne, **aucun relais ne peut coller**, LED RGB éteinte. Pratique pour programmer et déboguer sans risque.
- **Puissance (GND_P)** : J2 12 V → F2 0,5 A → D2 → U5 LM74502 + Q8/Q9 → `+12V_P`. Inversion bloquée, coupure au-delà de 13,45 V typique (12,5 à 14,4 V).
- Isolement : seuls K1, K2, U6, U7 relient les domaines. Bande de 3 mm sans cuivre, 2,2 mm minimum dans les relais.

## 3. Table des GPIO (brochage v4, DEC-007)

| GPIO | Signal | Sens | Logique / contrainte |
|---|---|---|---|
| 1 | `PWM_IN` | Entrée | Image de J1.3 après trigger de Schmitt (non inversé). 1000–2000 µs, ~50 Hz |
| 2, 9 | `FC_R1_NO`, `FC_R1_NC` | Entrée | Bas = contact fermé |
| 10, 11 | `FC_R2_NO`, `FC_R2_NC` | Entrée | Idem |
| 15, 16 | `FC_S1_NO`, `FC_S1_NC` | Entrée | Idem |
| 17, 5 | `FC_S2_NO`, `FC_S2_NC` | Entrée | Idem |
| 4 | `EXT_IN1` | Entrée analogique | ADC1_CH3, 0 à 3,3 V |
| 18 | `EXT_IN2` | Entrée | Pas de rappel sur la carte : activer le rappel interne si contact |
| 3 | `V5_MON` | Entrée analogique | ADC1_CH2 = +5V / 2 (2,5 V pour 5,0 V) |
| 21 | `K1_CMD` | Sortie | Haut = demande K1 |
| 42 | `CP_DRV` | Sortie | Carré ≈ 10 kHz, 50 %, permanent pour autoriser K1. **Basculé par la boucle principale** (pas LEDC/RMT/timer) |
| 47 | `K2_CMD` | Sortie | Haut = demande K2. Exige un module à GPIO47 en 3,3 V (N8, N8R2, N16R8) |
| 14 | `WDT_KICK` | Sortie | Un front au moins toutes les 50 ms (watchdog : 71 à 142 ms). **Boucle principale** |
| 40 | `K1_FB` | Entrée | Bas = K1 collé |
| 12 | `K2_FB` | Entrée | Bas = K2 collé |
| 41 | `ARM_FB` | Entrée | Haut = cavalier J7 posé (3,0 V) |
| 39 | `V12_OK` | Entrée | Bas = +12V_P présent |
| 7 | `STOP_HW_FB` | Entrée | Bas = 5e contact fermé ET 12 V présent |
| 8 | `STATUS_OUT` | Sortie | Haut = J1.4 tirée à 0 V (voir §6) |
| 6 | `RGB_DATA` | Sortie | LED adressable type WS2812 (XL-5050RGBC-2812B), via U17 en 5 V |
| 13 | `BUZZER` | Sortie | Buzzer passif : signal carré (≈ 2,7 kHz). **Jamais maintenu haut** |

Non utilisés : 0, 45, 46 (démarrage), 19, 20 (USB), 35 à 38, 48, 43, 44 (UART0 de programmation).

## 4. Commande du vérin

| K1 | K2 | Rouge | Noir | Vérin |
|---|---|---|---|---|
| repos | repos | 0 V | +12 V | **Rentre** (défaut, sans commande) |
| collé | repos | +12 V | +12 V | Arrêt (freiné) |
| repos | collé | 0 V | 0 V | Arrêt (freiné) |
| collé | collé | +12 V si J6 fermé | 0 V | **Sort** |

- K1 colle si `K1_CMD` haut **et** `CP_DRV` oscille. Sans oscillation, K1 retombe en ≈ 10 ms.
- K2 colle si J7 posé **et** `K2_CMD` haut **et** watchdog entretenu.
- Dès que le 12 V est présent, le vérin rentre, même sans firmware. Il s'arrête seul en butée (version -S).
- Ordre conseillé pour sortir : vérifier `ARM_FB`, `V12_OK`, `STOP_HW_FB`, puis K2 et K1 ensemble ; contrôler `K1_FB` et `K2_FB`. Pour rentrer : relâcher les deux.
- Watchdog impulsionnel (PO-28) : sur défaut, mettre `K2_CMD` bas sans attendre le watchdog.

## 5. Réponses aux questions de Julien (2026-11-15)

**Une seule fin de course par extrémité (R1 et S1) ?** Oui, électriquement sans problème. Une voie non câblée lit **haut** sur NO et sur NC (rappel 1 kΩ au 3,3 V). Pour une voie câblée, NO et NC sont toujours opposés ; une voie absente donne « NO haut + NC haut », un état incohérent. **Le firmware doit savoir quelles voies sont câblées** (constante de configuration) et ignorer les autres, sinon il détecte un défaut. Câbler de préférence R1 (J4.1–3) et S1 (J5.1–3).

**PWM sur GPIO1 avec toutes les cartes ?** Oui pour toute ESP32-S3-DevKitC-1 (N8, N8R2, N16R8, v1.0 et v1.1). GPIO1 n'est pas une broche de démarrage et n'est pas prise par la flash ou la PSRAM (GPIO26 à 37). Seule particularité : impulsion basse de 60 µs au démarrage (datasheet ESP32-S3, tab. 2-2), sans effet grâce à R303 = 1 kΩ (DEC-020). Mesure : interruption sur fronts, RMT ou capture MCPWM (le multiplexeur de GPIO accepte GPIO1). Réserve : un clone au brochage différent n'est pas couvert.

**À quoi correspond STATUS ?** Une sortie à drain ouvert vers le contrôleur. `STATUS_OUT` (GPIO8) haut → transistor Q2 passant → J1.4 à 0 V. GPIO8 bas, carte éteinte ou ESP32 en reset → Q2 bloqué → J1.4 tirée haute par le contrôleur (rappel côté contrôleur ≤ 5 V obligatoire). Le sens est fixé par le firmware. Convention de l'ancien firmware (`old/PCB-PWM-ESP32-SECURIS2-V3/firmware/README.md`) : **bas = carte prête (sûre), haut = non prête ou défaut**. C'est sûr par conception : carte morte ou non alimentée = « non prête ».

## 6. États au démarrage

| Signal | Au reset | Effet |
|---|---|---|
| `K1_CMD`, `K2_CMD` | Rappel 4,7 kΩ à 0 V | Relais au repos |
| `CP_DRV` | Couplage capacitif | Aucun niveau fixe n'autorise K1 |
| `WDT_KICK` | Rappel 100 kΩ à 0 V | Watchdog non satisfait |
| `STATUS_OUT`, `RGB_DATA`, `BUZZER` | Rappels 100 kΩ à 0 V | STATUS haut (non prête), LED et buzzer éteints |

## 7. Limites

| Grandeur | Limite |
|---|---|
| 5 V (J1) | 4,8 à 5,5 V, alimentation régulée ; > 6 V détruit U15/U16 (PO-27) |
| 12 V (J2) | ≤ 12,5 V pour ne jamais être coupé (PO-33) |
| Courants | 0,5 A par fusible ; vérin bloqué 246 mA ; contacts G6K 1 A |
| Consommation 5 V | ≈ 300 mA en pointe, radio coupée (la radio n'est jamais activée, EX-34) |

## 8. Repères pour coder

- Ancien firmware ESP32 (brochage v3, watchdog à fenêtre) : `old/PCB-PWM-ESP32-SECURIS2-V3/firmware/`. Machine d'états v1 : `old/PCB-PWM-ESP32-SECURIS2-V3/docs/architecture/FSM_V1.md`. À adapter au brochage v4 et au STWD100 (PO-12).
- Points firmware ouverts : PO-12, PO-28, PO-29.
