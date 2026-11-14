# Synoptique et principes

**Version :** v1, 2026-11-14. Netlist de référence : `netlist_cible.json` (source unique) ; export relu : `NETLIST_EXPORTEE.md`.

## 1. Blocs

```
 DOMAINE COMMANDE (GND)                                  ║  DOMAINE PUISSANCE (GND_P, isolé)
                                                         ║
 J1 5V ─ F1 ─ D1 ─ U15 ─ +5V ─┬─ bobines K1, K2          ║   J2 12V ─ F2 ─ D2 ─ U5 + Q8/Q9 ─ +12V_P
                              ├─ LED RGB (U17, LED1)     ║
                              └─ U16 ─ +5V_ESP ─ carte   ║
                                                de dev   ║
 carte de dev ── +3V3 ── logique, rappels, buzzer        ║
                                                         ║
 J1 PWM ─ D9 ─ RC ─ U3 ─────────► GPIO1                  ║
 J4, J5 (8 voies) ─ ESD ─ RC ───► 8 GPIO                 ║
 J8 (2 voies) ─ ESD ─ RC ───────► GPIO4, GPIO18          ║
                                                         ║
 GPIO21 K1_CMD ─ Q4 ┐                                    ║
 GPIO42 CP_DRV ─ pompe ─ Q3 ┴─ bobine K1 ═══════════════ K1 contacts ─┐
 J7 cavalier ─┐                                          ║            ├─ J3 vérin
 GPIO47 K2_CMD ─ Q6 ┤                                    ║            │
 GPIO14 WDT_KICK ─ U4 ─ Q5 ┴─ bobine K2 ════════════════ K2 contacts ─┘
                                                         ║
 K1_FB, K2_FB ◄── pôle B des relais                      ║   J6 5e contact (entre +12V_P et NO de K1)
 V12_OK ◄──────────────── U6 (opto) ════════════════════ +12V_P
 STOP_HW_FB ◄──────────── U7 (opto) ════════════════════ NO_FEED
 GPIO8 STATUS ─ Q2 ─► J1.4        GPIO13 ─ Q7 ─ buzzer   ║
```

Franchissent la barrière : K1, K2 (bobine / contacts : 1 500 V eff. ; entre pôles : 1 000 V eff., datasheet Omron K106 citée par STM32 BOM) et U6, U7 (LTV-357T : 3 750 V eff., fiche JLCPCB C119091, à relire sur datasheet en phase 8). Rien d'autre.

## 2. Pages du schéma

| Page EasyEDA | Fonction |
|---|---|
| 01_ALIM_5V_3V3 | Entrée 5 V, diodes idéales, mesure du 5 V, LED « 3,3 V présent » |
| 02_ESP32_DEVKIT | Barrettes J20, J21, J22 |
| 03_ENTREE_PWM | Protection et mise en forme du PWM |
| 04_FINS_DE_COURSE | 8 voies |
| 05_EXTENSION | 2 voies |
| 06_RELAIS_K1_POMPE | Bobine de K1, pompe de charge, relecture |
| 07_RELAIS_K2_WATCHDOG | Bobine de K2, cavalier, watchdog, relectures |
| 08_IHM_STATUS | Sortie STATUS, LED RGB, buzzer |
| 09_PUISSANCE_12V_ENTREE | Fusible, TVS, protection inversion / surtension |
| 10_VERIN_OPTOS | Vérin, 5e contact, optocoupleurs |

Liaisons : chaque broche porte un fil court au nom de son net (DEC-012). Aucun fil ne traverse une page.

## 3. Pont du vérin (reprise STM32 `ARCHITECTURE_COMMANDE_VERIN.md` §2, revérifiée sur la netlist)

J3.1 = `VERIN_A` (fil rouge), J3.2 = `VERIN_B` (fil noir). Rouge au + : sortie de tige (source : STM32 `ACTIONNEUR_L12.md`, non revérifiée ici → PO-07).

| K1 | K2 | `VERIN_A` | `VERIN_B` | Effet |
|---|---|---|---|---|
| repos | repos | `GND_P` (K1.7 NC) | `+12V_P` (K2.7 NC) | **Rentrée : position sûre** |
| travail | repos | `NO_FEED` = +12 V | +12 V | Arrêt |
| repos | travail | 0 V | `GND_P` (K2.5 NO) | Arrêt |
| travail | travail | +12 V par le 5e contact | 0 V | **Sortie : action** |

Le 5e contact (NC externe entre J6.1 et J6.3) ouvert coupe la sortie seule ; la rentrée ne passe pas par lui.

## 4. Défaillance simple → pas d'action

| Défaillance | Effet | Pourquoi |
|---|---|---|
| ESP32 en reset, absent, non alimenté | Relais au repos | `K1_G`, `K2_G` tirées à la masse par 4,7 kΩ ; `CP_DRV` sans oscillation ; sans +3V3, `WD_OK` et `CP_OUT` à 0 |
| Sortie `K1_CMD` figée haute | K1 seul possible, et seulement si `CP_DRV` oscille ; K2 au repos → arrêt | L'action exige les deux relais |
| Sortie `K2_CMD` figée haute | K2 seul → arrêt | Idem |
| Sortie `CP_DRV` figée (haute ou basse) | `CP_OUT` retombe en ~10 ms (C402 × R403), Q3 bloqué, K1 au repos | Couplage par C401 : seul un signal alternatif charge C402 |
| Firmware figé | K1 retombe (pompe) ; U4 fait retomber K2 au plus tard 142 ms après le dernier front de `WDT_KICK` | Deux principes indépendants |
| Q4 ou Q3 en court-circuit | L'autre transistor de la chaîne K1 coupe | Deux interrupteurs en série par bobine |
| Q6 ou Q5 en court-circuit | L'autre transistor et le cavalier coupent | Idem |
| Contact de relais soudé | Arrêt ou perte du retour sûr, jamais d'action ; détecté par `K1_FB` / `K2_FB` | Reprise STM32 architecture §4 |
| Cavalier J7 absent | K2 ne peut pas coller | Bobine non alimentée |
| Perte du 5 V | Relais au repos | — |

Limite reprise de la carte STM32 : une erreur de logique du firmware actif qui commande l'action n'est arrêtée que par le cavalier, le 5e contact et le blocage mécanique.

Comportement du watchdog U4 (STWD100, datasheet ST DocID014134 Rev 8, §2 et tableau 5) : sans front sur WDI pendant tWD (71 à 142 ms), WDO passe bas 140 à 280 ms, remonte, et recommence. Avec un ESP32 figé, `WD_OK` est donc haut environ un tiers du temps : K2 ne colle pas pour autant si `K2_CMD` est bas, et K1 reste au repos (pompe).

## 5. États au démarrage (EX-11)

| Signal | GPIO | Protection |
|---|---|---|
| `K1_CMD` | 21 | R402 4,7 kΩ à la masse sur la grille de Q4. Aucun rappel interne ni impulsion au démarrage (reprise ESP32 PO-04, datasheet ESP32-S3 v2.2 tab. 2-1, 2-2, à relire en phase 8) |
| `K2_CMD` | 47 | R407 4,7 kΩ à la masse sur la grille de Q6. Idem |
| `CP_DRV` | 42 | Couplage par C401 : un niveau continu, quel qu'il soit, ne valide pas K1 |
| `WDT_KICK` | 14 | R408 100 kΩ à la masse ; un niveau continu ne satisfait pas le watchdog |
| `RGB_DATA`, `BUZZER`, `STATUS_OUT` | 6, 13, 8 | Rappels 100 kΩ à la masse ; sans effet sur la sécurité |

Avec un rappel interne parasite de 45 kΩ au 3,3 V sur GPIO21 ou GPIO47, la grille resterait à 3,3 × 4,7 / (45 + 4,7) = 0,31 V, sous le seuil minimal de l'AO3400A (0,65 V, fiche reprise STM32 BOM). C'est la raison du passage de 100 kΩ à 4,7 kΩ (DEC-010).
