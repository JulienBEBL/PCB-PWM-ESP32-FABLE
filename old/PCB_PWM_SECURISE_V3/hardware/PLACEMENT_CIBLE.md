# Placement cible — PCB_PWM_SECURISE_V3

**Phase :** 4 (`CONSIGNES_EASYEDA_CLAUDE_CODE.md` §3 et §7). **Jalon :** G4.
**Version :** v1, session 12 (2026-11-03). Complète les règles générales de `CONSIGNES_EASYEDA_CLAUDE_CODE.md` §7 par des règles composant par composant.
**Prérequis :** G1, G2, G3 validés ; distances d'isolement fixées (DEC-069) ; nombre de couches fixé (DEC-070) ; dimensions et position des connecteurs fixées (DEC-068).

## 1. Zones

```
 ┌──────────────────────────── BORD « COMMANDE » ────────────────────────────┐
 │ J1 (contrôleur)  J4 (FC rentré)  J5 (FC sorti)  J8 (extension)             │
 │  ESD / filtres au pied de chaque connecteur                                │
 │                                                                            │
 │   Zone C : MCU U1 + Y1 + découplage    U2 (3,3 V)    U3 (PWM)    U4 (WD)   │
 │   J9 SWD, J10 UART, J11, J7 (cavalier) : accessibles boîtier ouvert       │
 │   LED1–4, LS1 : selon la mécanique (PO-15)                                 │
 │                                                                            │
 │ ═══════════════ BARRIÈRE D'ISOLATION (≥ 2 mm, DEC-069) ═════════════════ │
 │        K1          K2          U6          U7          U9                  │
 │   (chevauchent la barrière : bobine / pôle B côté C, pôle A côté P)        │
 │ ══════════════════════════════════════════════════════════════════════════ │
 │   Zone P : U5 + Q8 / Q9 + D2 + F2    R504 (shunt)   U8   C505 / D3          │
 │ J2 (12 V)     J6 (5e contact)     J3 (vérin)                               │
 └──────────────────────────── BORD « PUISSANCE » ───────────────────────────┘
```

Disposition indicative : les deux bords opposés séparent les domaines. L'orientation réelle dépend de la mécanique (PO-15).

## 2. Règles par composant

| Composant | Règle | Raison |
|---|---|---|
| C201, C202, C203, C204 | Au plus près des broches 6, 5 et 4 de U1, via directe vers le plan de masse | DS12232 Rev 5, fig. 13 |
| C205 | Au plus près de la broche 10 (NRST) | DS12232 Rev 5, fig. 23, note 3 |
| Y1, C206, C207 | Au plus près des broches 8 et 9 de U1 ; pistes courtes et symétriques ; aucune piste de signal sous le quartz ; anneau de masse | Stabilité de l'oscillateur (AN2867) |
| D1, F1, Q1 | Au pied de J1 | Protection avant toute distribution |
| D9, D10, U11, U12, D11 à D14 | Au pied du connecteur concerné, avant la résistance série | Évacuation de l'ESD avant qu'elle n'entre sur la carte |
| R302, C301, U3 | Entre J1 et U1, U3 au plus près de U1 | Mise en forme près du récepteur |
| D4, D5 | Au plus près des bornes de bobine de K1, K2 | Boucle de roue libre courte |
| Q3, Q4, D7, C401, C402, R403 | Groupés près de K1 | Chaîne K1 compacte |
| Q5, Q6, U4 | Groupés près de K2 | Chaîne K2 compacte |
| J7 (cavalier) | Accessible, repéré en sérigraphie « ARMEMENT » | DEC-025 |
| D2, F2, U5, Q8, Q9 | Au pied de J2 | Protection 12 V avant distribution |
| C505, D3 | Au pied de J3 | Parasites du moteur traités au connecteur |
| R504 | Entre les contacts des relais et le retour `GND_P` ; prises Kelvin séparées vers U9 | Précision de la mesure |
| U9 | À cheval sur la barrière ; aucune piste ni plan sous le boîtier entre les deux rangées de broches | Isolement de l'AMC1301 |
| U6, U7 | À cheval sur la barrière, même règle | Isolement |
| K1, K2 | Pôle A (contacts de puissance) côté zone P, bobine et pôle B côté zone C | Le relais assure l'isolement bobine-contacts (1 500 Veff) et entre pôles (1 000 Veff) |

## 3. Plans et masses

| Règle | Détail |
|---|---|
| Deux plans de masse distincts | `GND` sous la zone C, `GND_P` sous la zone P. Aucun recouvrement, aucune liaison |
| Barrière | Aucun cuivre dans la largeur de la barrière, sur aucune couche, hors broches des composants d'isolement |
| Fente de fraisage | Aucune (DEC-069) |
| Frontière sous les relais | Sur K1 et K2, la broche 8 (bobine −, commande) est dans la rangée des contacts de puissance 5, 6, 7. La frontière `GND` / `GND_P` contourne donc la broche 8 : forme en L sous chaque relais. Écart imposé par l'empreinte : 1,1 mm entre les broches 8 et 7 (exception de DEC-069) |
| Sérigraphie | Repérage des connecteurs : fonction et brochage (exemple : « J3 VÉRIN 1 = ROUGE ») |

## 4. Points d'arrêt

| N° | Sujet | Effet |
|---|---|---|
| PO-33 | Distances d'isolement | **Clos** : ≥ 2 mm, sans fente (DEC-069). Correction de la [Reco] initiale : l'empreinte des relais n'offre que 1,1 mm entre broches 8 et 7, pas 2 mm |
| PO-32 | Nombre de couches | **Clos** : 4 couches, L1 S / L2 GND / L3 Alim / L4 S (DEC-070) |
| PO-15 | Mécanique | **Clos** : 100 × 80 mm, 4 trous M3, connecteurs sur bords opposés (DEC-068). Position des LED et du buzzer : selon le boîtier |
