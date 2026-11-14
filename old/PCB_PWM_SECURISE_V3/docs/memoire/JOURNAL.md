# Journal du projet

Une entrée par session de travail, la plus récente en haut. Chaque entrée résume les échanges, les décisions prises et les points laissés ouverts.

---

## Session 14 — 2026-11-05 — Routage PCB1 (G5), PO-42, Freerouting, re-placement autour de U1 (interrompue)

### Échanges

1. PO-42 tranché avec Julien : échange `K2_FB` ↔ `ARM_FB` (DEC-079). `K2_FB` sur PA1 (12), `ARM_FB` sur PB1 (20). Schéma (page 02_MCU) modifié par renommage des deux fils ; PCB modifié directement par le net des pastilles U1.12 / U1.20 (`setState_Net` + `done`), **sans import** : la « Netlist Error » du DRC disparaît. Cuivre `ARM_FB` de la broche 12 arraché. `fine_geo.json` resynchronisé (5 broches de U1, DEC-078 + DEC-079). Plan de brochage et CSV à jour.
2. Freerouting autorisé par Julien (CLI native 2.5.0, puis JAR 2.5.0 + JRE Temurin 25.0.5 portable, sommes SHA-256 vérifiées, dans le dossier temporaire de la session, rien d'installé). **Échec, méthode abandonnée** : la CLI native plante sur toute zone (keepout, plan) et entre deux passes ; la version Java ne relie pas le cuivre existant du DSN d'EasyEDA (toute la carte en une seule « image », ≈ 2 000 conflits d'éléments figés, liaisons comptées en trop) et stagne ; l'import filtré d'un résultat n'a fermé aucun net et créé des erreurs : annulé (`ses_undo.mjs`), état vérifié identique.
3. Routeur maison (paires) : 19 paires sur 20 en échec, broches de U1 encerclées (broche 37 : 1 point libre sur 36). Arrachage des 39 nets de signaux de U1, re-routage maison (3 tours, pire), ré-arrachage, autorouteur EasyEDA par lots : 17 nets ouverts (16 signaux + `GND`), 0 erreur d'écart, isolement 2,02 mm. Plafond atteint.
4. Julien choisit d'autoriser un **re-placement local autour de U1** (côté commande, puissance figée). Solveur `u1_ring.cjs` : couronne de 2,2 mm libre autour des broches de U1 (1,5 mm pour C201 à C205), écart entre corps ≥ 0,55 mm. **21 composants déplacés** de 1,72 mm au plus (C201, C202, C203, C205, C206, C207, C311, C315, C316, C317, C318, C332, C405, R321, R322, R324, R326, R327, R411, Q6, Y1).
5. Séquence appliquée : arrachage de 49 nets (39 de U1 + nets des composants déplacés, aucun du domaine puissance), suppression de 22 raccords et 20 vias de plans des pastilles déplacées, déplacement (21 / 21 exacts), `fine_geo.json` et `fine_plan.json` mis à jour, `fullchk.cjs` : plan = réel à 0,003 mm, 0 chevauchement, isolement composants 2,47 mm ; 19 vias de plans refaits (`fanout.cjs` option `ONLY`).
6. DRC après re-placement : 52 nets ouverts (attendu, nets arrachés), **6 erreurs d'écart** : Q6 et R411 déplacés touchent 5 segments non arrachés (`K2_ARM` e5159, `+5V` e5267, e5268, e5271, e5276). Suppression de ces 5 segments lancée : l'appel n'a jamais répondu, **état inconnu**. Session interrompue ; au 2026-11-12, pont EasyEDA arrêté.

### Décisions

DEC-079. PO-42 clos. PO-43 ouvert.

### Production

- Outils : `dsn_export.mjs`, `dsn_mod.cjs`, `dsn_mod2.cjs`, `ses_parse.cjs`, `ses_apply.mjs`, `ses_undo.mjs` (Freerouting, conservés pour mémoire), `u1_ring.cjs`, `ring_apply.mjs`, `restore_nets.mjs`, `rr_round.sh`, `fanout.cjs` (option `ONLY`)
- Données : `u1_ring_moves.json` (déplacements, pour annuler : appliquer l'opposé), `rip_nets.json` (49 nets), `cu2_avant_rip.json` (cuivre avant arrachage), `drc_2026-11-05_apres_replacement.json`, `liaisons_ouvertes_avant_replacement.md`
- Rapport : `hardware/rapports/RAPPORT_PHASE_5_ROUTAGE.md` §9

---

## Session 13 (suite) — 2026-11-04 — Schéma complet, création du PCB et placement v0

### Échanges

1. Julien fournit la datasheet Omron G6K et relance EasyEDA. Brochage des relais confirmé (PO-36).
2. Saisie terminée : 10 pages, 198 composants, 546 fils, 115 nets. V1 sans écart, aucun net à une broche, barrière conforme (K1, K2, U6, U7, U9 seuls à cheval), pont du vérin au repos = rentrée, ERC 0 / 0. Polarité de D1, D9 et brochages des autres composants lus sur les symboles.
3. Julien clique « Apply » dans la fenêtre d'import : 198 composants, 115 nets dans PCB1.
4. Placement préliminaire v0 sur 100 × 80 mm (hypothèse) : commande en haut, barrière au milieu, puissance en bas. 198 / 198 placés, aucun chevauchement. DRC : seulement les liaisons non routées.
5. PO-15 : Julien retient 100 × 80 mm, 4 trous M3 aux coins, connecteurs sur deux bords opposés. Connecteurs de bord écartés des coins, 4 trous ajoutés, placement refait : aucun composant dans les zones libres des trous.
6. PO-33 : lecture des empreintes de la barrière. Écart commande / puissance : relais K1, K2 1,1 mm (broche 8 de bobine voisine de la broche 7 de contact), optos U6, U7 4,9 mm, U9 9,1 mm. Julien retient ≥ 2 mm entre cuivres, sans fente. Écart entre composants de barrière élargi : 2,77 mm minimum entre composants différents.
7. PO-32 : Julien retient 4 couches et demande si GND en L1 et L4 avec signaux internes serait meilleur. Analyse (Ott, sources fabricants) : avantage CEM réel sur une carte peu dense, mais ici L1 porte 198 composants CMS (plan découpé), signaux enfouis non accessibles pour la mise au point, deux domaines à séparer sur deux plans au lieu d'un. Empilement S / GND / Alim / S conservé, avec remplissage de masse cousu sur L1 et L4. PCB1 passé à 4 couches (L2_GND, L3_ALIM).
8. Placement fin : encombrement réel lu par `getPrimitivesBBox`, ancres à la main (connecteurs, barrière à 29 mm orientée commande en haut, U1 au centre, LED en colonne au bord droit), autres composants attirés vers les broches visées par les règles. 198 / 198, isolement 2,23 mm min., aucun chevauchement, DRC sans autre erreur que le non-routé. Points à rapprocher : C205, C206, D4, groupe U4 / K2.
9. Revue complète demandée par Julien (« je vais commander cette carte direct ») : 0 erreur bloquante, 10 risques, 5 modifications. Guide de mise en service rédigé.
10. Borniers à vis enfichables + Dupont, armement J7 en bornier 5,08 mm, D17, LED5, carte portée à 120 × 80 mm. Schéma : 204 composants, 116 nets, V1 / V4 sans défaut, ERC 1 avertissement (PO-40). Import PCB (clic de Julien), placement refait, 7 points de test.
11. Sérigraphie : 202 repères replacés, 68 textes et 40 traits ajoutés (cartouche, avertissement 12 V, frontière, noms de broches). Contrôle sur les boîtes réelles : 0 texte sur pastille ou corps, 0 chevauchement. Incidents corrigés : géométrie de placement réécrite par un contrôle (rotations appliquées deux fois), 14 points de test en double supprimés (suppression sans effet signalée par l'API).
12. Avertissement ERC identifié par Julien (captures) : J7. Remplacé par C8377, ERC propre. Pages renommées 01 à 10 avec un texte explicatif sur chacune (demande de Julien). L'API rétablit parfois, au rechargement d'EasyEDA, des objets supprimés : 2 textes d'essai sur la page 01 restent à supprimer à la main.
13. Import PCB après le changement de J7 (clic de Julien) : EasyEDA a sorti de la carte J7 et les 64 composants des pages 02, 06 et 07 (pages modifiées). Placement et repères réappliqués depuis le plan. Contrôles refaits : isolement 2,47 mm, 0 chevauchement, sérigraphie 0 défaut, DRC non-routé seulement.
14. Routage (DEC-076, méthode hybride validée) : règles du projet, zones d'isolement, plans L2 / L3, 178 vias de liaison aux plans, côté puissance routé (`MOT_RET` repris à la main), USB et bobines, ≈ 95 % des signaux de commande par l'autorouteur. Isolement 2,02 mm minimum, 0 violation. Restent 8 nets autour de U1, U4 et U16 : choix demandé à Julien. `hardware/rapports/RAPPORT_PHASE_5_ROUTAGE.md`.
15. Règles fines locales (DEC-077) : classes par net écartées (DRC), 3 zones à règle propre. 7 nets restent ouverts : autorouteur instable sur ces longs calculs (rechargements d'EasyEDA).
16. Placement côté commande aéré (1,1 mm entre composants, côté puissance figé), vias de plans refaits (155), routage par lots enregistrés, arrachages ciblés autour du MCU. Session interrompue (limite d'usage) : une vingtaine de nets de commande restent à router (l'autorouteur rend la main sans bilan sur certains lots), puis remplissages L1 / L4, couture, sérigraphie à refaire (composants déplacés), contrôles finaux.
17. (2026-11-05) Reprise : vias orphelins écartés comme cause, routeur maison en mode « paires » (4 liaisons posées), échange de broches du MCU (DEC-078, validé) ; effet non vu à la proposition : `K2_FB` sur le même port que `K1_FB` (PO-42). Freerouting proposé, téléchargement non autorisé. Julien demande d'arrêter et de confier le routage à une nouvelle session : `hardware/rapports/BRIEF_ROUTAGE.md`, outils copiés dans `hardware/outils/routage/`.

### Décisions

DEC-068 à DEC-078. PO-15, PO-32 et PO-33 clos, PO-38 mis à jour.

### Production

- `hardware/rapports/RAPPORT_PHASE_4_PLACEMENT_V0.md`, `hardware/pcb/PLACEMENT_V0.svg`
- `hardware/rapports/RAPPORT_PHASE_4_PLACEMENT_G4.md`, `hardware/pcb/PLACEMENT_G4.svg` et `.png`
- Rapport lot 3 complété (§7 bis, §7 ter)

---

## Session 13 (suite) — 2026-11-03 — Schéma, lot 3 : diodes idéales, relais, câblage (en cours)

### Échanges

1. Julien : pas de sonde ST-LINK ; veut un 5 V franc (« mets une diode idéale ») ; demande le reste du schéma, le PCB avec placement, et un schéma de câblage `.drawio`.
2. Claude : LM66100 en blocage permanent du courant inverse (le montage « OU » de TI se coupe si les deux entrées sont égales). Brochage des relais lu sur l'image du symbole LCSC (bobine polarisée selon Omron). Shunt corrigé : C17928 (1 Ω) et non C25334 (100 mΩ).
3. Saisie : U15, U16 câblés ; P4 et P3B placés. Puis l'éditeur refuse toute modification (`cmdKey`) : saisie interrompue, intervention de Julien demandée.

### Décisions

DEC-067. PO-36, PO-38 mis à jour.

### Production

- `hardware/CABLAGE.drawio`, `hardware/rapports/RAPPORT_PHASE_3_LOT_3.md`
- BOM et netlist v1.2

---

## Session 13 (suite) — 2026-11-03 — Schéma, lot 2 : USB et programmation

### Échanges

1. Julien veut brancher la carte en USB « comme une Arduino » (téléverser, tester en direct), garder l'UART, et une carte fiable du premier coup : « au plus simple, au plus facile et au plus robuste ». Il valide la conception proposée et demande un travail en autonomie.
2. Vérifications : le téléversement série de STM32duino ne pilote aucune séquence DTR / RTS ; d'usine, le STM32G0 ignore la broche BOOT0 (`nBOOT_SEL = 1`). D'où des boutons BOOT / RESET, au lieu du reset automatique, et un réglage unique des octets d'option.
3. Simplification : un OU d'alimentation par 2 Schottky remplace Q1 + R101.
4. Saisie : P1 modifiée, P2 complétée (J10 sur USART2, boutons), P6 USB créée. 44 composants, 168 fils ; V1 sans écart ; ERC 0 erreur. Brochage des boutons lu sur la datasheet XKB.

### Décisions

DEC-066. Clos : PO-16. PO-38 mis à jour. Consignes v1.2 (C10 à C12, S14, S15).

### Production

- `hardware/BOM_CIBLE.md` et `bom/BOM_CIBLE.csv` v1.1, `hardware/NETLIST_CIBLE.md` v1.1, `brochage_stm32g071cbt6.csv` et `PLAN_BROCHAGE_MCU.md` v2.1 (PA2 / PA3)
- `hardware/PROCEDURE_PROGRAMMATION.md`, `hardware/rapports/RAPPORT_PHASE_3_LOT_2.md`
- Projet EasyEDA : pages P1, P2, P3, P6

---

## Session 13 (suite) — 2026-11-03 — Saisie du schéma, lot 1

### Échanges

1. Julien valide G1 et G2 et accepte la précision du seuil OV du LM74502 (PO-35). Il demande les « fondamentaux » : USB-C, broches d'E/S, alimentation, arrivée PWM.
2. Claude Code saisit P1 (alimentation commande), P2 (MCU, 48 broches nommées selon le CSV, découplage, quartz, SWD, UART) et l'entrée PWM sur P3 : 32 composants, 120 fils nommés. USB-C non ajouté : absent de la BOM validée (question posée).
3. Contrôles : V1 par relecture géométrique sans écart, attributs fournisseur présents, ERC 0 erreur et 33 avertissements (nets à une broche vers les pages non saisies).
4. API : `createNetLabel` réservé à EDA v4 (inutile : le fil nommé porte son étiquette) ; export de netlist bloquant confirmé ; erreur passagère `cmdKey` ; conventions de rotation opposées entre `create` et `modify`.

### Décisions

DEC-064 (G1, G2), DEC-065 (seuil OV accepté). Clos : PO-35, PO-37. Ouvert : PO-39. PO-38 mis à jour.

### Production

- Projet EasyEDA `PCB_PWM_SECURISE_V3` : pages P1, P2, P3 (lot 1)
- `hardware/rapports/RAPPORT_PHASE_3_LOT_1.md`

---

## Session 13 — 2026-11-03 — Phase 0 EasyEDA API

**Outil :** Claude Code, sur le PC de Julien, pont sur le port 49620. Brief rédigé sous le nom « session 12 » ; renuméroté 13 car la session 12 (BOM et netlist cibles) a été commitée en parallèle.

### Échanges

1. Julien installe la chaîne d'outils (EasyEDA Pro V3.2.209, skill v1.1.64, extension v1.0.6) et réalise T1 à T4 en lecture seule. Incident : passage par erreur en Full Offline, où l'extension et l'espace Personal disparaissent ; retour en Full Online. Un projet local homonyme a pu être créé : le projet est désormais identifié par son uuid.
2. Claude Code revérifie T1 à T3, puis réalise T5 sur une page ESSAI : C432212 résolu et placé, 48 broches conformes au CSV de brochage, attributs fournisseur intacts après placement, modification partielle et réécriture S4. Composant et page supprimés ; Schematic1 ne contient plus que P1.
3. T6 : l'ERC est accessible par l'API, mais ne renvoie que des totaux par catégorie. Le mode strict échoue dès un avertissement.
4. Écarts relevés : libellés des options de l'extension, casse des noms incohérente selon la méthode, encodage des appels manuels. Julien valide le rapport et les corrections C1 à C9, appliquées.

### Points

Clos : PO-34. Ouvert : PO-38 (le PO-35 du rapport, renuméroté : PO-35 à PO-37 pris par la session 12). Aucune décision nouvelle.

### Production

- `hardware/rapports/RAPPORT_PHASE_0.md`, validé par Julien
- `hardware/rapports/PASSATION_PHASE_0.md`, `hardware/rapports/BRIEF_SESSION_12.md` : passation et brief de la session
- `hardware/CONSIGNES_EASYEDA_CLAUDE_CODE.md` v1.1 (S1 par uuid, S12, S13, V3, §10) ; `hardware/INSTALLATION_EASYEDA_API.md` v1.1

---

## Session 12 — 2026-11-03 — Sélection des références, BOM et netlist cibles

### Échanges

1. Julien : « sélectionne les références réelles, fais tous les documents pour le Claude Code qui fera le schéma et le placement ». En parallèle, la session 11 (autre conversation) a défini la méthode EasyEDA Pro + Claude Code (DEC-061 à DEC-063, `hardware/CONSIGNES_EASYEDA_CLAUDE_CODE.md`).
2. Claude : livrables des phases 1 et 2 du cadre défini en session 11, dans ses conventions (`GND_P`, `A_DEFINIR`, jalons G1 / G2).
   - Codes LCSC vérifiés en ligne pour tous les composants actifs, la connectique et les passifs courants.
   - Choix principaux : relais Omron G6K-2F-Y DC5 (C47190), watchdog TPS3430 (fenêtre 25,9 / 46,8 ms), LM74502 + 2 × AO3400A + Zener 10 V, quartz 12 MHz C9002, ME6211, AMC1301 + TLV9001 + HT7550 (option A de PO-27), connectique JST XH / PH avec détrompage par nombre de points et série.
   - Constats : précision insuffisante du seuil OV du LM74502 pour garantir 13,5 V (PO-35) ; brochage du relais à lire sur le symbole (PO-36) ; risque d'inversion de connecteurs identiques traité par une règle de détrompage.

### Points

PO-29 traité (attente G1). Ouverts : PO-35, PO-36, PO-37.

### Production

- `hardware/BOM_CIBLE.md`, `hardware/bom/BOM_CIBLE.csv`
- `hardware/NETLIST_CIBLE.md`
- `hardware/PLACEMENT_CIBLE.md`
- `hardware/CONSIGNES_EASYEDA_CLAUDE_CODE.md` §2 : nouvelles sources référencées

---

## Session 11 — 2026-11-03 — Méthode de conception sous EasyEDA Pro avec Claude Code

**Outil :** Claude (claude.ai, projet « PCB PWM »), session parallèle.

### Échanges

1. Julien demande jusqu'où Claude peut piloter EasyEDA Pro (composants, schéma, routage). Claude : pilotage réel possible par Claude Code, via le skill officiel `easyeda-api` et l'extension Run API Gateway. Limites : pas de vue du canevas, pas d'autorouteur dans l'API, ERC / DRC en totaux seulement, attributs fournisseur perdus après placement (constaté en V3.2.149).
2. Julien : EasyEDA Pro V2.2.47, Full Online ; Claude Code sur le même PC ; schéma vierge ; PCBA JLCPCB complet sauf gros connecteurs ; « sûrement 4 couches, mais sûrement plus » ; séquence schéma → validation → routage → validation, avec retouche possible avant chaque validation.
3. Claude : l'extension cible EasyEDA ~3.2.0, la V2.2.47 est incompatible. Avertissement : un projet modifié en V3 ne s'ouvre plus à jour en V2.2 (projets clients). Julien met à jour en V3.2.209.

### Décisions

DEC-061 à DEC-063. Clos : PO-31. Ouverts : PO-32, PO-33, PO-34.

### Production

- `hardware/CONSIGNES_EASYEDA_CLAUDE_CODE.md` : cadre de travail de Claude Code (phases, jalons, règles de saisie, contrôles)
- `hardware/INSTALLATION_EASYEDA_API.md` : installation et routine de session sous Windows
- `.gitattributes` : formats EasyEDA V3 (`.epro2`, `.eprj2`) en binaire

---

## Session 10 — 2026-11-03 — Datasheet Rev 5, brochage v2, synoptique matériel

### Échanges

1. Julien fournit la DS12232 Rev 5, valide la rédaction du synoptique, et se renseigne en parallèle sur l'usage d'EasyEDA Pro avec Claude.
2. Claude : revérification sur la Rev 5. Nouveauté bloquante pour le brochage : le bootloader ROM configure certaines GPIO (§3.5). Règle R9 ajoutée, 7 signaux déplacés (brochage v2). Errata ES0418 Rev 6 analysée : aucune sur IWDG, WWDG ni capture d'entrée ; 2.3.1 (PA4 / PA5 jamais en sortie) et 2.8.6 (TIM16 / TIM17, silicium B) à prendre en compte.
3. Synoptique matériel v1 : 13 blocs, candidats de composants, bilan de courant ≈ 130 à 160 mA hors rappels.

### Points

Clos : PO-28. Ouverts : PO-29, PO-30, PO-31. PO-27 précisé.

### Production

- `docs/architecture/PLAN_BROCHAGE_MCU.md` v2, `hardware/brochage_stm32g071cbt6.csv`
- `docs/architecture/SYNOPTIQUE_MATERIEL.md`
- `docs/composants/STM32G071_ERRATA.md`
- `datasheets/ST_STM32G071x8-xB_DS12232_Rev5.pdf`

---

## Session 09 — 2026-11-03 — Quartz, révision de la datasheet

### Échanges

1. Julien valide le montage du quartz HSE. Il n'a pas de datasheet plus récente que la Rev 2.
2. Claude : la page ST fournit la DS12232 **Rev 5 (juin 2025)**. Les vérifications faites sur la Rev 2 sont à confirmer sur la Rev 5 (PO-28).

### Décisions

DEC-060 (nouvelle section « Matériel »). Clos : PO-26. Ouvert : PO-28.

---

## Session 08 — 2026-11-03 — Validation de la liste des E/S, vérifications datasheet

### Échanges

1. Julien : pas d'ajout à la liste des E/S pour le moment ; X01 à X08 retenus ; symbole et empreinte C432212 présents dans EasyEDA Pro (capture, 934 en stock) ; datasheet DS12232 Rev 2 fournie.
2. Claude : vérification des points du plan de brochage sur DS12232 et sur le code du cœur STM32duino. Tout est confirmé. Nouvelle contrainte : PA4 et PA5 sont tolérantes 3,6 V seulement (TT_a). Précision HSI16 chiffrée : jusqu'à −2,85 % / +2,05 % sur la plage du projet, quartz recommandé.

### Décisions

DEC-039. Clos : PO-14, PO-24, PO-25. Ouverts : PO-26, PO-27.

### Production

- `datasheets/ST_STM32G071x8-xB_DS12232_Rev2.pdf`
- `raw/2026-11-03_easyeda_C432212_bibliotheque.png`, `raw/2026-11-03_lcsc_C432212_stock.png`
- `PLAN_BROCHAGE_MCU.md` §4 vérifié ; `CHOIX_MCU.md` §12 complété, §13 ajouté

---

## Session 07 — 2026-11-03 — Plan de brochage du STM32G071

### Échanges

1. Julien : « continue », sans ajout à la liste des E/S. Interprétation retenue : plan de brochage sur les 33 signaux retenus, X01 à X05 placés en réserve.
2. Claude : affectation des 48 broches à partir de la base officielle ST (STM32_open_pin_data). Huit règles d'affectation. Contraintes relevées : broches UCPD (USB-C) avec fonction « dead battery », remappage PA11 / PA12, broches du domaine de sauvegarde. Réserve corrigée de 11 à 10 broches.

### Points

Ouvert : PO-25.

### Production

- `docs/architecture/PLAN_BROCHAGE_MCU.md`
- `hardware/brochage_stm32g071cbt6.csv`

---

## Session 06 — 2026-11-02 — Liste des éléments autour du MCU

### Échanges

1. Julien demande la liste des éléments raccordés au MCU avant le plan de brochage, et annonce des ajouts. Fins de course : microrupteurs classiques RS, 12 V / 500 mA sans problème.
2. Claude : liste de 33 GPIO (18 entrées, 9 sorties, 4 communication, 2 quartz), réserve de 11. Huit propositions complémentaires à valider (X01 à X08). Point relevé : courant minimal des contacts lus à sec.

### Correction

`CHOIX_MCU.md` §11 citait PC14 / PC15 pour le quartz. Ce sont les broches du quartz 32 kHz (LSE). Le quartz principal (HSE) est sur PF0 / PF1.

### Décisions

DEC-038. Ouverts : PO-23, PO-24.

### Production

- `docs/architecture/LISTE_ES_MCU.md`

---

## Session 05 — 2026-11-02 — Validation du MCU et des fins de course

### Échanges

1. Julien valide le STM32G071CBT6 LQFP48 sous condition (physique, assemblage, appro JLCPCB / LCSC, débogage, fabrication) et la lecture NO + NC des fins de course (8 entrées).
2. Claude vérifie : LCSC C432212, 988 en stock, 2,48 $ l'unité, catégorie Extended, SMT Economic et Standard, MSL 3. Aucun point bloquant. Reste à vérifier : symbole et empreinte dans EasyEDA Pro.

### Décisions

DEC-036, DEC-037. PO-06 et PO-08 clos.

---

## Session 04 — 2026-11-02 — Intégration du STM32G071

**Outil :** Claude Code.

### Échanges

1. Julien : veut le MCU directement sur le PCB, sans composant lourd à intégrer. Demande comment Claude voit l'intégration du STM32G071. Valide la protection 12 V pour source non maîtrisée.
2. Claude : schéma minimal (≈ 10 à 14 composants autour du MCU), une seule paire d'alimentation, quartz facultatif, BOOT0 par octets d'option, broches réservées, routage 2 couches possible / 4 couches recommandé pour la CEM. Variante LQFP32 (pas 0,8 mm) non compatible avec ≈ 31 E/S sans réduire le besoin.

### Décisions

DEC-034, DEC-035.

### Production

- `docs/architecture/CHOIX_MCU.md` : section 11, intégration concrète du STM32G071

---

## Session 03 — 2026-11-02 — Fins de course, arrêt matériel, comparatif MCU

**Outil :** Claude Code.

### Échanges

1. Julien : essais du vérin avec une mécanique sommaire prévus mercredi, retour sur PO-18 ensuite. Arrêt matériel jugé bonne proposition, intégration à définir. Contacts de fin de course avec NO et NC : les deux modes de lecture sont possibles. Tension 12 V inconnue (alimentation externe non définie). Les 3 mm partent de la butée rentrée. Pour le MCU, Julien veut comprendre l'intégration PCB, le fonctionnement et la complexité, et confronter toutes les solutions existantes.
2. Claude : comparatif complet des familles (16 solutions examinées, 4 retenues), fonctionnement du MCU sur la carte, intégration PCB détaillée, option module. Recommandation maintenue : STM32G071CBT6 ; alternative AVR128DB48. Lecture antivalente NO + NC proposée pour les fins de course (8 entrées). Arrêt matériel : 5e contact dédié obligatoire pour respecter l'isolation.

### Décisions

DEC-016 précisée (origine des 3 mm). DEC-028 validée (contacts inverseurs). DEC-029 (arrêt matériel, principe).

### Points

Clos : PO-21. Ouvert : PO-22. Mis à jour : PO-03, PO-06, PO-08, PO-18, PO-19.

### Production

- `docs/architecture/CHOIX_MCU.md` réécrit (comparatif complet)

---

## Session 02 — 2026-11-02 — Course, effort et choix du vérin

**Outil :** Claude Code (session liée au projet claude.ai « PCB PWM »).

### Échanges

1. Julien précise : course physique visée ≈ 3 mm ± 1 mm ; effort ≈ 30 N vers la sortie (estimation) ; vérin remplaçable par une autre version si besoin ; 12 V fourni directement ; « oui » à la question sur les fins de course ; MCU encore en réflexion ; licence open source acceptée ; FSM décrite plus tard.
2. Analyse Claude : la position sûre exige que le vérin rentre contre 30 N **et** reste rentré sans moteur (la fin de course interne coupe le moteur en butée, même avec 12 V). Seule la réduction 210:1 satisfait les deux conditions (80 N max, 45 N de réversibilité). Proposition : L12-10-210-12-S. Durée estimée pour 3 mm : < 0,7 s.
3. Risque nouveau : course utile 3 mm sur un vérin de 10 mm ou plus. Une erreur de logique du firmware peut prolonger la sortie. Option : contact de fin de course « sortie » câblé en série dans l'alimentation de sortie (PO-19).

### Décisions

DEC-016 à DEC-019, DEC-053. DEC-010 remplacée par DEC-018. DEC-011 validée.

### Points

Clos : PO-02, PO-13. Ouverts : PO-18 à PO-21. PO-01 et PO-03 mis à jour. PO-06 : réponse « oui » ambiguë, à confirmer.

### Production

- `docs/composants/ACTIONNEUR_L12.md` (remplace la fiche L12-30-50-12-S, analyse de la série complète)
- `docs/architecture/ARCHITECTURE_COMMANDE_VERIN.md` : section 6, arrêt matériel en position d'action

---

## Session 01 — 2026-11-02 — Cadrage du besoin

**Outil :** Claude (claude.ai, projet « PCB PWM »), puis Claude Code pour la création du dépôt.

### Échanges

1. **Analyse du CdCF de référence** (`references/cdc_carte_electronique_generique.md`). Synthèse dans `docs/besoin/ANALYSE_CDC_REFERENCE.md`. Note de Julien : cette première analyse avait d'abord été produite par ChatGPT.
2. **Premier besoin** : lire un PWM et piloter un relais COM/NO/NC, LED, buzzer, capteurs. Danger élevé si fermeture intempestive. Extérieur −10/+50 °C. 5 V externe. 1–2 cartes, JLCPCB, EasyEDA Pro. Claude propose le critère « aucune défaillance simple ne ferme le relais » et un double interrupteur avec pompe de charge.
3. **Précision du besoin** : l'actionneur est un vérin 2 fils, 12 ou 24 V, ~1 A, commandé par inversion de polarité. 4 fins de course. FSM avec temporisations. Masse 12 V non commune. Claude compare pont de relais, relais DPDT + marche/arrêt, pont en H.
4. **Vérin identifié** : Actuonix L12-30-50-12-S, imposé. Position sûre à définir, 200 cycles, 500 mA sur le 5 V, CEM + IEM au plus haut niveau, Arduino / Python. Claude propose le câblage de 2 relais où le repos commande le retour sûr, explique l'armement, propose un référentiel CEM et un objectif IEM inspiré de MIL-STD-461G.
5. **Validations de Julien** : 12 V, position sûre = rentrée, relais DPDT avec relecture, opto de présence 12 V, cavalier d'armement + blocage mécanique (3 niveaux), objectif IEM, pas de position intermédiaire, mouvement à la mise sous tension accepté, charge ~30 N, câbles de fin de course 15–30 cm, pas de laboratoire CEM. Demande des options MCU et création de ce dépôt.

### Décisions

DEC-001 à DEC-005, DEC-010 à DEC-015, DEC-020 à DEC-028, DEC-030 à DEC-033, DEC-040 à DEC-043, DEC-050 à DEC-052.

### Erratum

Le 4e échange citait, depuis une fiche revendeur, une réversibilité de 43 N et un point de puissance de 12 N. La datasheet constructeur donne 12 N de réversibilité, 22 N d'effort max et 17 N au point de puissance. Conséquence : la charge de 30 N dépasse les capacités du vérin (PO-01, PO-02).

### Production

- Création de l'arborescence du dépôt, de `CLAUDE.md` et de la mémoire projet.
- `docs/composants/ACTIONNEUR_L12-30-50-12-S.md` (renommé `ACTIONNEUR_L12.md` en session 02)
- `docs/architecture/ARCHITECTURE_COMMANDE_VERIN.md`
- `docs/architecture/CHOIX_MCU.md`

### Laissé ouvert

PO-01 à PO-17. Bloquants : PO-01, PO-02, PO-03, PO-05.
