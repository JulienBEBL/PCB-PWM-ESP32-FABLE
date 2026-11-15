# Alimentation

**Version :** v1, 2026-11-14. Reprise ESP32 DEC-026 (`old/PCB-PWM-ESP32-SECURIS2-V3/docs/architecture/ALIMENTATION_ESP32.md`), revérifiée sur la netlist.

## 1. Domaine commande

```
J1.1 +5V_IN ─ F1 (PTC 0,5 A) ─ +5V_F ─ D1 (TVS 5 V) ─ U15 (LM66100) ─ +5V ─┬─ K1, K2, U17, LED1, R102
                                                                            └─ U16 (LM66100) ─ +5V_ESP ─ J20.21 (broche 5V)
carte de dev : régulateur interne ─ J20.1, J20.2 ─ +3V3 ─ U3, U4, rappels, LED5, buzzer, J8
```
D1 écrête à 9,2 V : elle ne protège pas U15, U16 (6 V au maximum absolu). Risque accepté, le 5 V vient de l'alimentation régulée du contrôleur (DEC-026, PO-27).

| Choix | Raison | Source |
|---|---|---|
| U15, U16 montées en « blocage du courant inverse » (CE# relié à VOUT) | U15 : rien ne remonte vers le contrôleur. U16 : l'USB de la carte de dev n'alimente pas le `+5V` de la carte, donc **aucun relais ne peut coller sur USB seul** | Reprise STM32 DEC-067, ESP32 DEC-026 ; brochage relu sur le symbole LCSC C2869734 (1 VIN, 2 GND, 3 CE#, 4 NC, 5 ST, 6 VOUT) |
| Pas de régulateur 3,3 V sur la carte | Un seul domaine 3,3 V, celui de la carte de dev | Reprise ESP32 DEC-026 |
| `V5_MON` = `+5V` / 2 (R102, R103 10 kΩ) | 2,5 V pour 5,0 V ; 2,75 V pour 5,5 V : sous 3,3 V | Calcul |
| `ARM_FB` = `K2_ARM` × 15 / 25 | 3,0 V pour 5,0 V ; 3,3 V pour 5,5 V | Reprise ESP32 netlist (R413 = 15 kΩ) |

Le guide Espressif déclare les alimentations USB et broche 5V « mutuellement exclusives ». U16 empêche le courant d'aller de l'USB vers la carte ; le sens inverse (5 V externe vers le PC) dépend d'une diode de la carte de dev, à contrôler au multimètre à réception (PO-03).

## 2. Bilan de courant (ordre de grandeur)

| Consommateur | Courant | Base |
|---|---|---|
| K1 + K2 | 42 mA | 2 × 21,1 mA (Omron, reprise STM32 BOM) |
| LED RGB | ≤ 36 mA à pleine puissance, à limiter par le firmware | 3 × 12 mA [Hypothèse], datasheet WS2812B à relire |
| Carte de dev (radio coupée) + logique 3,3 V | ≈ 100 mA [Hypothèse] | À mesurer |
| Rappels des fins de course | 13 mA | 4 contacts fermés × 3,3 mA |
| Buzzer | ≈ 100 mA moyen en fonctionnement | 3,3 V / 16 Ω à 50 % (datasheet Huaneng MLT-8530 : bobine 16 Ω) |
| **Total** | **≈ 300 mA** en pointe | Fusible F1 : 0,5 A de maintien |

## 3. Domaine puissance

```
J2.1 +12V_IN ─ F2 (PTC 0,5 A) ─ +12V_F ─ D2 (TVS 15 V) ─ Q8 ═ Q9 (dos à dos, pilotés par U5 LM74502) ─ +12V_P
```

| Élément | Valeur | Source |
|---|---|---|
| Seuil de coupure en surtension | 1,25 V × (97,6 + 10) / 10 = 13,45 V typique (12,5 à 14,4 V avec VOVR 1,165 à 1,333 V) | DEC-027 (2026-11-15). Avant : 15,0 V (DEC-022), 13,16 V (STM32 DEC-065). Vérin L12 12 V : 13,5 V maximum (Actuonix) |
| Zener D8 10 V entre grille et source | VGS max de l'AO3400A : ±12 V | Reprise STM32 BOM §4 point 5 |
| Inversion de polarité | D2 conduit en direct, F2 déclenche ; Q9 bloque le retour | Analyse de la netlist |
| Courant du vérin | 246 mA en blocage (L12 12 V) | Datasheet Actuonix L12 (relue le 2026-11-15) ; contacts G6K : 1 A |
