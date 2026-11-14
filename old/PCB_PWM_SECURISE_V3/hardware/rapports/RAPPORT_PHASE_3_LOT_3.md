# Rapport — Phase 3, lot 3 : diodes idéales, relais, reste du schéma (en cours)

**Date :** 2026-11-03 — **Session :** 13 (suite) — **Outil :** Claude Code, EasyEDA Pro V3.2.209 Full Online
**Statut :** **terminé** (2026-11-04). Schéma complet, contrôles en §7 ter. Les §1 à §7 bis retracent l'interruption et la reprise. Suite : `RAPPORT_PHASE_4_PLACEMENT_V0.md`.

## 1. Demandes de Julien

**[Exprimé]** Pas de sonde ST-LINK. « Je veux du 5 V, si plus simple et moins de bug, mets une diode idéale. » Ajouter les relais et le reste au schéma, créer le PCB et placer les composants, faire un schéma `.drawio` pour comprendre le câblage. Travail en autonomie.

## 2. Diodes idéales (DEC-067)

| Point | Constat (datasheet TI LM66100, SLVSEZ8A) | Choix |
|---|---|---|
| Brochage SC-70-6 | 1 VIN, 2 GND, 3 CE (actif bas), 4 N/C, 5 ST (drain ouvert, « Connect to GND if not required »), 6 VOUT | Conforme au symbole LCSC C2869734 (CE#, NC) |
| Montage « OU » de TI (§9.2.1, CE croisés) | TI : si les deux entrées restent égales, **les deux puces se coupent et la sortie tombe** | **Écarté** : J1 et l'USB valent tous deux 5 V |
| Blocage permanent du courant inverse (§8.3.2) | CE relié à VOUT : la puce se coupe dès que la sortie dépasse l'entrée | **Retenu** pour U15 (J1) et U16 (USB) |
| Inversion de polarité sur J1 | VIN jusqu'à −6 V supporté ; CE ≥ VIN → puce coupée | Protection conservée |
| Chute | 79 mΩ à 5 V : ≈ 16 mV à 200 mA | `+5V` ≈ 5,0 V ; marge des relais ≈ 1 V |
| Limite | VIN, VOUT ≤ 6 V absolu | **[Hypothèse]** Acceptable : TVS D1 en amont, PTC F1. Même ordre de grandeur que U2 (ME6211) |

Saisie faite et câblée : U15 + C107 (P1), U16 + C602 (P6). D15, D16 supprimés.

## 3. Relais G6K-2F-Y (PO-36)

- Symbole LCSC C47190 : broches numérotées 1 à 8 sans nom. Image du symbole obtenue par `lib_Symbol.getRenderImage` et relue agrandie : **bobine 1 (+) – 8 (−)** ; pôle bas **COM 3, NC 2, NO 4** ; pôle haut **COM 6, NC 7, NO 5**.
- Datasheet Omron (K106) : « Check carefully the coil polarity of the Relay » → bobine polarisée. Le dessin « Terminal Arrangement » est vectoriel et n'a pas pu être lu automatiquement.
- Affectation : pôle bas (rangée 1-2-3-4) côté commande, pôle haut (5-6-7-8) côté puissance.
- **[Hypothèse]** À confirmer par Julien sur la datasheet (question 2). Une bobine polarisée câblée à l'envers ne colle pas : la carte ne pourrait jamais commander le vérin.

## 4. Composants résolus

| Repère | LCSC | Remarque |
|---|---|---|
| J7, J11 | C492401 PZ254V-11-02P | Même famille que J9, J10 |
| J8 | C492405 PZ254V-11-06P | — |
| R502 | C23267 95,3 kΩ ±1 % | Extended |
| R504 | **C17928** 1 Ω ±1 %, 250 mW, Basic | **C25334, de la même série, vaut 100 mΩ** : piège évité par relecture des attributs |

## 5. Avancement de la saisie

| Page | Contenu | État |
|---|---|---|
| P4 (`499a8d86c392ed3f`) | K1, K2, U4, J7, D7, Q3 à Q6, D4, D5, R401 à R415, C401 à C406 | Placée (31), non câblée |
| P3B (`f8530cdc3a4be23f`) | Fins de course : J4, J5, U11, U12, R311 à R328, C311 à C317 | Placée (27 / 28 : C318 manquant), non câblée |
| P3C, P4B, P5, P5B | Extension, IHM, puissance 12 V, mesure de courant | Non créées |
| PCB | — | Non commencé (après le schéma) |

Brochages relus, conformes à la netlist : U4 TPS3430 (1 VDD1 … 8 WDO#, 10 VDD2, 11 EP → GND) ; D7 BAT54S (1 A, 3 AK, 2 K) ; AO3400A (1 G, 2 S, 3 D) ; 1N4148W (1 K, 2 A).

## 6. Incident en cours

1. Création de C318 : sans réponse après 30 s (deux fois).
2. Puis `openDocument` sur la page déjà active : sans réponse.
3. Depuis, toute `modify` échoue (`Cannot destructure property 'cmdKey'`) ; lecture et enregistrement fonctionnent.

**[Hypothèse]** Pile de commandes de l'éditeur bloquée par la création restée en suspens, ou boîte de dialogue ouverte dans EasyEDA. Aucune donnée perdue : tout est enregistré après chaque composant.

## 7. Production hors EasyEDA

- `hardware/CABLAGE.drawio` : câblage externe, connecteur par connecteur, avec les domaines commande / puissance, le détrompage et les règles de sécurité.
- BOM et netlist v1.2.

## 7 bis. Reprise après déblocage (même session)

- **Relais confirmés** sur la datasheet fournie par Julien. Le PDF Omron est chiffré : tracé vectoriel de la copie LCSC (même document K106) rendu en image par un script. Bobine 1 (+) / 8 (−), COM 3 et 6, NC 2 et 7, NO 4 et 5.
- C318 avait été créé **deux fois** en retard par les appels restés sans réponse : doublon supprimé.
- **Auto-récupération** trouvée : enregistrer, fermer puis rouvrir l'onglet débloque l'éditeur après un `cmdKey`. Intégrée au script (3 essais maximum par page, suppression des doublons).
- Pages placées : P3B (28), P3C (28), P4 (31), P4B (19), P5B (19). P5 : deux pages créées en retard sont impossibles à ouvrir (`26d8e3b0…`, `86a5777f…`, nom par défaut P7). À supprimer par Julien.
- Puis `openDocument` ne répond plus sur aucune page : **relance d'EasyEDA nécessaire**.
- Passe B (câblage) écrite et vérifiée à blanc pour P3B, P3C, P4, P5B. Restent à lire sur les images de symboles : buzzer LS1, ESD5Z5V0, SRV05-4, LM74502, EL357N.

## 7 ter. Schéma complet (2026-11-04)

| Contrôle | Résultat |
|---|---|
| Saisie | 10 pages : P1, P2, P3, P3B, P3C, P4, P4B, P5, P5B, P6. **198 composants, 546 fils, 115 nets** |
| V1 relecture géométrique | **0 problème** : chaque broche reliée par un seul fil, aucun contact parasite, aucune broche libre non marquée |
| Nets à une broche | **Aucun** : toutes les liaisons entre pages se referment |
| V4 barrière d'isolation | Seuls K1, K2, U6, U7, U9 touchent les deux domaines. Conforme |
| V6 pont du vérin | Repos : `VERIN_A` = `MOT_RET` (K1 7-6), `VERIN_B` = `+12V_P` (K2 7-6) → rentrée. Conforme |
| ERC (`sch_Drc.check`) | **0 erreur, 0 avertissement** |
| Non montés | R336 à R343, R411 (`addIntoBom = false`) |

Brochages lus sur les images de symboles LCSC : ESD5Z5V0 et SMAJ5.0A (cathode = broche 1 : **polarité de D1 et D9 confirmée**), SRV05-4 (5 VCC, 2 GND), LM74502 (broches nommées), EL357N (1 anode, 2 cathode, 3 émetteur, 4 collecteur), SMAJ15A (C / A), BZT52C10 (K / A), buzzer MLT-8530 (1 +, 2 −, 3 et 4 pattes de fixation non connectées).

Stabilité de l'API : après environ 60 à 90 opérations, `openDocument` et `create` cessent de répondre. EasyEDA recharge alors sa vue (nouvel identifiant de fenêtre) au bout d'environ 30 s. Contre-mesures : un seul onglet de schéma ouvert à la fois, activation de l'onglet existant, récupération par fermeture et réouverture de l'onglet, reprise sans doublon. La page vide `P5_VIDE_A_SUPPRIMER` reste à supprimer par Julien.

## 8. Questions pour Julien

1. **EasyEDA** : une boîte de dialogue est-elle ouverte ? Sinon : fermer l'onglet de la page P3B et la rouvrir ; si ça ne suffit pas, relancer EasyEDA puis **API Gateway > Reconnect**.
2. **Relais** : sur la datasheet Omron G6K, dessin « G6K-2F-Y Terminal Arrangement/Internal Connections (TOP VIEW) », confirmer bobine 1 (+) / 8 (−), COM 3 et 6, NC 2 et 7, NO 4 et 5.
3. **Sonde ST-LINK** : non indispensable, mais c'est le seul moyen de récupérer une carte si le bootloader USB ne répond pas (octets d'option mal réglés). **[Reco]** En prévoir une (ST-LINK V2 ou V3MINIE).
4. **PCB** : la création du PCB passe par `importChanges()` (schéma → PCB), qui attend un clic « Apply » (défaut connu). Je te préviendrai au moment voulu.
