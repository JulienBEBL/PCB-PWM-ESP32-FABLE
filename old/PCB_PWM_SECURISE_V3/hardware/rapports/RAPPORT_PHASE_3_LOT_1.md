# Rapport — Phase 3, lot 1 : saisie des fondamentaux du schéma

**Date :** 2026-11-03 — **Session :** 13 (suite) — **Outil :** Claude Code, EasyEDA Pro V3.2.209 Full Online
**Statut :** à revoir par Julien dans l'éditeur. Pas de jalon G3 : le schéma est incomplet.
**Sources :** `hardware/BOM_CIBLE.md` v1 et `hardware/NETLIST_CIBLE.md` v1 (G1 et G2 validés par Julien), `hardware/brochage_stm32g071cbt6.csv`.

## 1. Périmètre

**[Exprimé]** Julien : « fais déjà les fondamentaux, genre usb c, les pin E/S, l'alim, l'arrivée PWM… les trucs qui vont pas trop bouger ».

| Page | uuid | Contenu saisi | Composants |
|---|---|---|---|
| P1 | `f8ce52c8d36cc38e` | Alimentation commande complète (B1, B2, X01) | J1, F1, D1, Q1, R101, C101 à C103, U2, C104, C105, R102, R103, C106 (14) |
| P2 | `82b24d124c8dee20` | MCU complet : 48 broches nommées selon le CSV, découplage, NRST, quartz, SWD, UART | U1, C201 à C205, Y1, C206, C207, J9, J10 (11) |
| P3 | `229d1a6643781fea` | Entrée PWM seule (B4) | D9, R301, R302, C301, U3, C302, R303 (7) |

Non saisis, car soumis à des points ouverts : fins de course (PO-23), extension (PO-07), maintenance et révision de carte, P4 (PO-12, PO-36), P5 (PO-03, PO-19, PO-27).

**USB-C :** absent de la BOM validée (G1). La liaison PC passe par J10 (UART) et la programmation par J9 (SWD), et PO-16 reste ouvert. Rien n'a été ajouté (question 1, §7).

## 2. Méthode de saisie

- Composants résolus par leur code LCSC (`lib_Device.getByLcscIds`), placés par `sch_PrimitiveComponent.create`, repère fixé par `modify`.
- Chaque broche reliée par un fil court (20 unités, 40 sur U1) créé avec son nom de net (`sch_PrimitiveWire.create(line, net)`). EasyEDA ajoute automatiquement au fil un attribut `Name` visible : c'est l'étiquette de net (S6).
- Broches libres : drapeau « non connecté » (`setState_NoConnected(true)`) sur U1.25, U1.39, U1.41 (CSV), U2.4 et U3.1.
- Passifs et D1, D9 en vertical (broche 1 en haut), pour éviter que les fils de deux composants voisins se touchent.
- Avant chaque lot : uuid du projet et document actif vérifiés (S1, S13). Enregistrement après chaque composant (S11).

## 3. Contrôles

| N° | Contrôle | Résultat |
|---|---|---|
| V1 | Netlist reconstruite par relecture géométrique (broches, fils, contacts parasites) | **0 problème.** 32 composants, 120 fils (33 + 71 + 16, conforme au calcul). Chaque broche est reliée par un seul fil, chaque fil touche une seule broche, aucun contact entre nets différents. Nets conformes à NETLIST_CIBLE pour P1, P2 et la chaîne PWM ; U1 conforme au CSV broche par broche |
| V2 | Attributs fournisseur | Présents sur les 32 composants (code LCSC, MPN, fabricant) |
| V3 | ERC (`sch_Drc.check`) | **0 erreur, 33 avertissements** (mode non strict : réussi ; mode strict : échec). 33 = nombre exact de nets à une seule broche, tous des signaux de U1 vers des pages non saisies |
| V7 | MCU | VBAT, VREF+, VDD reliés à `+3V3` avec 100 nF chacun et 4,7 µF ; NRST avec 100 nF (C205) et J9. Proximité des condensateurs : à traiter au placement |
| V8 | Valeurs ouvertes | Points de test, voir §5 |

Nets entre pages : `+3V3`, `+5V`, `GND`, `V5_MON`, `PWM_IN`. **[Hypothèse]** Les noms de net sont globaux entre pages. L'ERC le soutient : si ce n'était pas le cas, `V5_MON` (U1.19 seule sur P2) et `PWM_IN` (seul sur P2 et sur P3) ajouteraient au moins 2 avertissements. À confirmer dans l'éditeur (question 3).

## 4. Constats sur l'API (V3.2.209)

| N° | Constat | Effet | Statut |
|---|---|---|---|
| A1 | `sch_PrimitiveAttribute.createNetLabel` : documenté « ADD since EDA v4 ». En V3.2.209, la promesse ne se résout jamais (délai de 30 s dépassé) | Inutile : un fil créé avec un nom de net porte déjà son étiquette visible | Contourné (§2) |
| A2 | **Export de netlist** `sch_Netlist.getNetlist()` : délai de 30 s dépassé | Défaut connu (V3.2.149) **confirmé en V3.2.209**. V1 par relecture, comme prévu | PO-38 |
| A3 | Erreur interne passagère `Cannot destructure property 'cmdKey'` lors d'une rotation par `modify` (C202, C302) | Aucune écriture partielle. Une seule nouvelle tentative a suffi chaque fois | À surveiller |
| A4 | Rotation : 270 passé à `create` place la broche 1 en bas (relu 90) ; 270 passé à `modify` la place en haut | Conventions de signe opposées | Règle : rotation par `modify`, puis relecture des broches |
| A5 | Après rotation, les coordonnées des broches sont flottantes (ex. 579,999…) | Fils tracés exactement sur ces valeurs : connexion vérifiée par V1 | Sans effet constaté |
| A6 | `ESYS_NetlistType` non défini dans le contexte d'exécution | Énumération non exposée ; appel sans argument | Note pour S10 |
| A7 | « Wire has multiple net names » | Non observé (un nom par fil, aucun fil partagé) | Sans objet à ce stade |

## 5. Écarts avec la BOM et la netlist cibles

| Sujet | Constat | Traitement |
|---|---|---|
| J10 (UART) | Code LCSC « à vérifier » dans la BOM. Retenu **C492402** PZ254V-11-03P (bibliothèque EasyEDA, Extended, même empreinte `HDR-TH_3P-P2.54-V-M` que J9 C492404) | **[Reco]** Stock et prix à confirmer à la commande |
| Y1 (C9002) | Brochage « à vérifier » : relu sur le symbole, 1 OSC1, 3 OSC2, 2 et 4 GND | Conforme à la netlist cible. Point levé |
| D1, D9 | Broches du symbole nommées « 1 » et « 2 », sans K / A. **[Hypothèse]** 1 = cathode (convention LCSC). Câblage : D1.1 = `+5V_F`, D9.1 = `PWM_EXT` | **À vérifier visuellement** (question 2). Une TVS inversée court-circuite le 5 V |
| TP101 à TP103, TP201, TP202 | Absents de la BOM (aucune référence) | Non placés. Nets `RSV_U2_TX` / `RSV_U2_RX` étiquetés sur U1. `A_DEFINIR` : PO-39 |
| Q1, U2, U3 | Brochage relu : conforme à la netlist cible (Q1 1 G, 2 S, 3 D ; U2 1 VIN … 5 VOUT ; U3 1 N.C … 5 VCC) | — |

## 6. Corrections proposées des consignes (à valider)

| N° | Correction |
|---|---|
| C10 | §4, S6 : créer les étiquettes de net par le nom du fil (`sch_PrimitiveWire.create(line, net)`) ; ne pas utiliser `createNetLabel` (EDA v4) |
| C11 | §10 : export de netlist **confirmé bloquant** en V3.2.209 ; erreur passagère `cmdKey` (une seule nouvelle tentative, après vérification de l'état) ; conventions de rotation opposées entre `create` et `modify` |
| C12 | §4, S10 : les énumérations `ESYS_*` ne sont pas toutes exposées ; omettre le paramètre optionnel plutôt que passer sa valeur |

## 7. Questions pour Julien

1. **USB-C :** il n'est pas dans la BOM validée. Faut-il en ajouter un ? Si oui, pour quel usage : alimentation 5 V, liaison PC (pont USB-UART), DFU par l'USB du STM32G0 ? Le G071 n'a pas d'USB device, seulement l'UCPD, donc il faudrait un pont USB-UART (PO-16).
2. **Polarité des TVS :** dans l'éditeur, la barre de cathode de D1 est-elle du côté `+5V_F`, et celle de D9 du côté `PWM_EXT` ?
3. **Nets entre pages :** en cliquant sur `PWM_IN` ou `V5_MON`, la mise en évidence couvre-t-elle P2 et P3 (ou P1 et P2) ?
4. **Mise en page :** les pages sont lisibles ? Une contrainte de présentation (titres de blocs, cadres, symboles d'alimentation à la place des étiquettes) ? L'orientation Y de la feuille est supposée vers le haut, la feuille couvrant 0 à 1170 × 0 à 825 : les composants sont-ils bien dans le cadre ?
5. Valider C10 à C12 ?
6. Suite : fins de course dès que PO-23 est tranché, ou P4 (relais, IHM) avec PO-12 et PO-36 ?
