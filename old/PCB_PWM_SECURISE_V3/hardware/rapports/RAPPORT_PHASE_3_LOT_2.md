# Rapport — Phase 3, lot 2 : USB, programmation, simplification de l'alimentation

**Date :** 2026-11-03 — **Session :** 13 (suite) — **Outil :** Claude Code, EasyEDA Pro V3.2.209 Full Online
**Statut :** à revoir par Julien dans l'éditeur. Pas de jalon G3 : le schéma est incomplet (P4, P5, fins de course, extension).

## 1. Besoin et consigne

**[Exprimé]** Julien : brancher la carte en USB au PC « comme une Arduino » (téléverser, tester en direct), garder l'UART si possible. Programmation fiable et sûre. « Fais au plus simple, au plus facile et au plus robuste. » Accord sur la conception proposée (USB-C + pont USB-série, alimentation par l'USB, J10 sur USART2, ESD). Travail en autonomie.

## 2. Choix de conception

| N° | Choix | Justification | Statut |
|---|---|---|---|
| 1 | USB-C J12 + pont **CH340C** U13 sur USART1 (PA9 / PA10) | Le STM32G071 n'a pas d'USB device. USART1 est déjà le port du bootloader ROM dans le brochage v2 : aucune broche déplacée. CH340C : horloge interne, sans quartz | **[Décidé]** (accord de Julien) |
| 2 | U13 alimenté par `+3V3` de la carte (V3 reliée à VCC) | Niveaux 3,3 V ; pas d'alimentation fantôme du MCU par les broches UART | [Reco] appliquée |
| 3 | Protection USBLC6-2SC6 (ST) ; CC1 / CC2 à 5,1 kΩ ; blindage à `GND` | ESD (DEC-040) ; puits USB-C standard, 5 V par défaut sur tout câble C-C ou A-C | [Reco] appliquée |
| 4 | **OU d'alimentation par 2 Schottky B5819W** : D15 (J1), D16 (USB) | Ni le PC ni le contrôleur ne peuvent alimenter l'autre en retour. **D15 remplace Q1 + R101** : la protection contre l'inversion passe de 2 composants à 1 | [Reco] appliquée (simplification) |
| 5 | **Boutons BOOT (SW2) et RESET (SW1)** au lieu du reset automatique et de son cavalier | Vérifié : le téléversement série de STM32duino ne pilote **aucune** séquence DTR / RTS (`stm32CubeProg.sh`). Un circuit automatique ne servirait donc pas. Les boutons marchent toujours, ne réinitialisent jamais la carte à l'ouverture du moniteur série, et coûtent 2 composants Basic | **Écart à la proposition validée**, justifié par la consigne « plus simple, plus robuste ». À confirmer (question 1) |
| 6 | BOOT0 : R202 10 kΩ vers `GND` sur PA14 ; SW2 vers `+3V3` par R201 1 kΩ | Démarrage normal garanti ; R201 limite le courant si la sonde SWD tire SWCLK au niveau bas pendant un appui | [Reco] appliquée |
| 7 | J10 sur USART2 (PA2 / PA3) avec 1 kΩ en série (R203, R204) | Liaisons USB et J10 utilisables en même temps, sans conflit sur RX ; résistances de protection côté connecteur | **[Décidé]** (accord de Julien) |
| 8 | SWD J9 conservé | Recours qui marche quel que soit l'état du firmware et des octets d'option | — |

**Octets d'option :** d'usine, `nBOOT_SEL = 1` et la broche BOOT0 est ignorée. Réglage unique `nBOOT_SEL = 0` au premier flash (`hardware/PROCEDURE_PROGRAMMATION.md` §3). Source : forums ST ; **[Hypothèse]** à confirmer dans RM0444.

## 3. Composants ajoutés (BOM v1.1)

| Repère | Référence | LCSC | Cat. | Vérification |
|---|---|---|---|---|
| J12 | HRO TYPE-C-31-M-12 | C165948 | Ext. | Bibliothèque ; LCSC : 16 broches, CMS. Stock non affiché : à relever à la commande |
| U13 | WCH CH340C | C84681 | Ext. | LCSC : horloge interne, 3,3 V ou 5 V |
| U14 | ST USBLC6-2SC6 | C7519 | Ext. | Bibliothèque |
| D15, D16 | CJ B5819W SL | C8598 | Basic | Symbole : broche 1 = « − » (cathode), broche 2 = « + » |
| SW1, SW2 | XKB TS-1187A-B-A-B | C318884 | Basic | Datasheet XKB : **A–B et C–D reliés en interne**, le bouton relie (A, B) à (C, D). 50 mA / 12 V. Stock relevé : plus de 500 000 |
| R601, R602 | 5,1 kΩ 0603 | C23186 | Basic | — |
| R201, R203, R204 / R202 / C601 | 1 kΩ / 10 kΩ / 100 nF | C21190 / C25804 / C14663 | Basic | — |
| ~~Q1, R101~~ | Supprimés | — | — | Remplacés par D15 |

## 4. Saisie

| Page | Modification |
|---|---|
| P1 | Q1, R101 et leurs 5 fils supprimés ; D15 placé et câblé (`+5V_F` → `+5V`) |
| P2 | Fils renommés : U1.13 / U1.14 → `UART2_TX` / `UART2_RX` ; J10.1 / J10.2 → `UART2X_TX` / `UART2X_RX`. Ajout de R203, R204, SW1, SW2, R201, R202 |
| P6 (nouvelle, `895bddc3222f7908`) | J12, R601, R602, U14, D16, U13, C601. SBU1 / SBU2 et 9 broches de U13 en « non connecté » |

## 5. Contrôles

| N° | Contrôle | Résultat |
|---|---|---|
| V1 | Relecture géométrique des 4 pages | **0 problème.** 44 composants, 168 fils. Nets conformes à la netlist v1.1 : `UART_TX` = U1.29 ↔ U13.3 (RXD), `UART_RX` = U1.32 ↔ U13.2 (TXD) ; D+ / D− des deux faces de J12 réunies ; `+5V` alimenté par D15.1 et D16.1 (cathodes) ; `Q1_G` supprimé |
| V2 | Attributs fournisseur | Présents sur les 44 composants |
| V3 | ERC | **0 erreur, 31 avertissements** = 31 nets à une broche (signaux de U1 vers P3 à P5 non saisis). Aucun avertissement sur les nets entre P2 et P6 |

## 6. Constats sur l'API (V3.2.209)

| N° | Constat | Traitement |
|---|---|---|
| A8 | Placement du bouton SW1 : `create` sans réponse après 30 s, aucune écriture | Réussi en passant le nom du sous-ensemble (`TS-1187A-B-A-B.1`). Désormais toujours passé (`lib_Device.get(...).subPartNames`) |
| A9 | `lib_Symbol.getDocumentSource` : sans réponse après 30 s | Abandonné |
| A10 | `sch_PrimitiveWire.create` : erreur passagère `create failed!` (U14.1) | Une seule nouvelle tentative, réussie |
| A11 | Fenêtre EasyEDA changée en cours de session (`487f0313` → `5c3871c4`) | T1 à T3 refaits ; travail du lot 1 intact |

## 7. Questions pour Julien

1. **Boutons BOOT / RESET** au lieu du reset automatique avec cavalier : d'accord (§2, choix 5) ?
2. **Polarité des TVS D1 et D9** (toujours ouverte depuis le lot 1) : barre de cathode côté `+5V_F` pour D1, côté `PWM_EXT` pour D9 ? Le symbole de D15 / D16 confirme la convention LCSC « broche 1 = cathode », mais ceux de D1 et D9 ne nomment pas leurs broches.
3. **Chute de tension** : `+5V` ≈ 4,6 V sur J1 (au lieu de ≈ 5,0 V avec Q1). Enclenchement des relais ≤ 4,0 V : marge ≈ 0,6 V. Acceptable ? Sinon, une diode idéale intégrée reste possible, au prix de la simplicité.
4. Sonde ST-LINK : en as-tu une ? C'est le recours en cas de problème de programmation (`PROCEDURE_PROGRAMMATION.md`).
