# Brief — Session de routage (jalon G5)

**Pour :** une nouvelle session Claude Code dédiée **uniquement au routage** de PCB1.
**Rédigé le :** 2026-11-05, fin de la session 13.
**Lire d'abord :** `CLAUDE.md`, puis ce brief, puis `hardware/rapports/RAPPORT_PHASE_5_ROUTAGE.md`. La mémoire du projet (`docs/memoire/`) est à jour au 2026-11-05.

## 0. Reprise au 2026-11-12 (à lire en premier)

Session 14 interrompue (voir `JOURNAL.md`, `RAPPORT_PHASE_5_ROUTAGE.md` §9). Ce qui change par rapport aux §5 à §7 :

- PO-42 clos (DEC-079). Numéros libres : **DEC-080**, **PO-44**.
- **Freerouting abandonné** : incompatible avec le DSN d'EasyEDA (détail §9 du rapport). Ne pas le reproposer sans nouvel élément. Les fichiers téléchargés étaient dans le dossier temporaire de la session 14 : rien d'installé sur le poste.
- **Re-placement local autour de U1 appliqué** (autorisé par Julien) : 21 composants, `u1_ring_moves.json`. Les 49 nets de `rip_nets.json` sont arrachés.
- État inconnu (PO-43). À faire dans l'ordre :
  1. Julien relance EasyEDA et le pont. Vérifier le projet, activer PCB1.
  2. `node rebuild.mjs`, `node pcbdrc2.mjs`, `node isochk.mjs` (dossier `hardware/outils/routage/`).
  3. Si les 6 erreurs d'écart sont toujours là : supprimer un par un les segments `K2_ARM` / `+5V` en conflit avec Q6 et R411 (identifiants relus dans le DRC ; ceux du 2026-11-05 : e5159, e5267, e5268, e5271, e5276).
  4. Router : `node chunks.mjs`, puis `RETRY=1 node chunks.mjs`, puis `OPEN=1 node chunks.mjs`. Enregistrer, DRC et `isochk.mjs` après chaque lot.
  5. S'il reste des liaisons que l'autorouteur ne prend pas : proposer à Julien de les finir au routeur interactif d'EasyEDA (liste net par net), puis contrôle par script.
  6. Puis §10 (remplissages, sérigraphie, contrôles finaux).
- `fine_geo.json` et `fine_plan.json` sont à jour du re-placement et des nets de U1 (DEC-078, DEC-079).

## 1. Mission

Finir le routage de PCB1 sans casser ce qui est fait, puis : remplissage de masse L1 / L4 cousu, sérigraphie refaite et vérifiée, contrôles finaux, rapport, mémoire, commit et push. **Rien d'autre** : pas de modification du schéma, du placement de la partie puissance ou des règles validées, sauf accord explicite de Julien.

**Avant de router :** trancher **PO-42** avec Julien (§6). Julien ne vérifie pas le routage lui-même : chaque affirmation doit être contrôlée par script.

## 2. Règles de travail (rappel)

- Français technique, phrases courtes. Distinguer [Exprimé], [Décidé], [Hypothèse], [Reco]. Ne jamais inventer une valeur.
- `DECISIONS.md` : aucune modification sans accord explicite de Julien. Numéros suivants libres : **DEC-079**, **PO-43**.
- Commits en français, préfixe `hw:` ou `docs:`, avec la ligne d'attribution du système.
- API EasyEDA (`hardware/CONSIGNES_EASYEDA_CLAUDE_CODE.md`) : `POST http://localhost:49620/execute` avec `{code}` ; code en `await` / `return` ; **chaque appel < 30 s** ; jamais `openProject` ; vérifier le projet `b4788f45338c4e59bfcfdff2832a8063` avant toute écriture ; **ne pas lancer, arrêter ni relancer le pont** ; échec ou contradiction → arrêter et signaler, pas de boucle aveugle.
- Toute action sur un fichier téléchargé demande l'accord de Julien (nom, source, taille).

## 3. Identifiants

| Objet | Valeur |
|---|---|
| Projet | `b4788f45338c4e59bfcfdff2832a8063` |
| PCB1 (document) | `9e5b12b9217a84a5` ; onglet : `9e5b12b9217a84a5@b4788f45338c4e59bfcfdff2832a8063` |
| Schéma | `ae5a2752b4ccbe86` ; pages : `hardware/outils/routage/page_*.txt` (P1 = 01_ALIM… voir `NETLIST_CIBLE.md`) |
| Bibliothèque LCSC | `0819f05c4eef4c71ace90d822a990e87` |

## 4. Carte et règles (toutes validées)

| Point | Valeur | Réf. |
|---|---|---|
| Carte | 120 × 80 mm, 4 trous M3 (Ø 3,2 mm) à (4 ; 4), (116 ; 4), (4 ; 76), (116 ; 76) mm, zone libre Ø 7 mm | DEC-072, DEC-068 |
| Couches | L1 signaux + composants ; **L2 (id 15)** plans `GND` (y ≥ 30,2 mm) / `GND_P` (y ≤ 27,8) ; **L3 (id 16)** plans `+3V3` / `+12V_P` ; L4 (id 2) signaux | DEC-070 |
| Pistes | 0,25 mm ; classe P05 (`GND`, `+5V`, `+3V3`, `+5V_F`, `+5V_IN`, `VBUS`, `+5V_ISO`, `+3V3_EXT`) 0,5 mm (min 0,2) ; classe P10 (`+12V_IN`, `+12V_F`, `+12V_P`, `VERIN_A`, `VERIN_B`, `MOT_RET`, `NO_FEED`, `GND_P`) 1,0 mm (min 0,3) | DEC-076 |
| Écart | 0,2 mm ; **zones fines** `ZONE_FINE_U1` (x 49–65, y 36,5–60), `ZONE_FINE_U16` (x 6,5–14,5, y 65,5–73), `ZONE_FINE_U2` (x 31,5–38,5, y 60,5–67,5) : piste 0,2 / écart 0,15 | DEC-077 |
| Vias | 0,61 / 0,305 mm | DEC-076 |
| **Isolement** | ≥ 2 mm entre cuivres commande et puissance, toutes couches, sauf l'empreinte des relais (1,1 mm broches 7 / 8). Bande interdite y = 28–30 mm ; zones interdites autour des broches 8 de K1 (x 37,8) et K2 (x 55,8) ; couloir de 1,2 mm pour les pistes de bobine | DEC-069 |
| Nets du domaine puissance | `+12V_IN`, `GND_P`, `+12V_F`, `LM_EN`, `LM_VCAP`, `LM_GATE`, `LM_SRC`, `+12V_P`, `LM_OV`, `NO_FEED`, `VERIN_A`, `VERIN_B`, `MOT_RET`, `U6_A`, `U7_A`, `+5V_ISO`, `AMC_INP`, `AMC_INN` ; tout le reste = commande | — |
| Composants de barrière | K1, K2, U6, U7, U9 (seuls autorisés à relier les deux domaines) | V4 |

## 5. État au 2026-11-05

| Élément | État |
|---|---|
| Composants | 204, placés (côté commande ré-espacé à 1,1 mm, côté puissance figé). Plan : `fine_plan.json` (positions en mil, rotation) |
| Côté puissance | **Entièrement routé**, `MOT_RET` repris à la main autour de K1 (via face dessous). Ne pas toucher |
| Vias de plans | 1 par pastille CMS de `GND`, `+3V3`, `GND_P`, `+12V_P` (≈ 180) |
| Côté commande | ≈ 85 % routé |
| DRC | **18 nets ouverts** (≈ 36 liaisons), **0 erreur d'écartement** |
| Isolement (script, tout le cuivre) | **0 violation, 2,02 mm minimum** |
| Nets ouverts | `GND` (1 liaison), `V5_MON`, `+5V_F`, `FC_R1_NO`, `FC_R2_NO`, `FC_R2_NC`, `FC_S1_NO`, `FC_S1_NC`, `FC_S2_NC`, `ARM_FB`, `K2_FB`, `I_MON`, `WD_OK`, `PWM_BUF`, `MAINT_IN`, `K1_CMD`, `K2_CMD`, `LED2` |
| Échange de broches (DEC-078) | `K1_CMD` PA15 (37), `K2_CMD` PB2 (21), `I_MON` PA0 (11), `K2_FB` PB1 (20) : schéma, PCB, CSV, plan de brochage à jour |
| Non fait | Remplissage L1 / L4 + couture ; sérigraphie à refaire (composants déplacés) ; C206 / C207 désormais près de Y1 |

## 6. Point à trancher en premier : PO-42

DEC-078 a mis `K2_FB` (PB1) sur le **même port que `K1_FB` (PB7)**, alors que le plan de brochage les séparait (un défaut sur un registre de port ne doit pas fausser les deux relectures). Piste : échanger `K2_FB` et `ARM_FB` (PA1, broche 12, voisine sur le boîtier). Toute modification du schéma demande ensuite un **clic « Apply » de Julien** (import vers le PCB, voir §8).

## 7. Méthode recommandée pour finir

1. **Freerouting** (prévu par les consignes) : l'autorouteur d'EasyEDA ne sait pas pousser les pistes existantes et plafonne à 18 nets. Version sans installation : `freerouting-cli-2.5.0-windows-x64.zip` (20,2 Mo, GitHub freerouting/freerouting, v2.5.0 du 2026-10-05, fichier de sommes de contrôle publié). **Téléchargement non encore autorisé par Julien : demander.** Java n'est pas installé.
   - Export : `eda.pcb_ManufactureData.getDsnFile()` (renvoie un `File`, à lire dans l'appel et à renvoyer en texte).
   - Import : `eda.pcb_Document.importAutoRouteSesFile(new File([texte], "x.ses"))`.
   - Point à vérifier : comment Freerouting traite les pistes et vias existants (les figer : côté puissance, vias de plans) et les zones interdites d'isolement (elles doivent apparaître comme « keepout » dans le DSN, sinon ajouter des contrôles).
2. Sinon : routage manuel par Julien dans EasyEDA (routeur interactif), guidé net par net, puis contrôles par script.
3. Dernier recours : outils maison (§9), arrachages ciblés.

## 8. Pièges de l'API rencontrés (à respecter)

| Piège | Parade |
|---|---|
| L'onglet actif change (Julien travaille dans l'éditeur) | Chaque appel commence par `eda.dmt_EditorControl.activateDocument("<onglet PCB>")` et vérifie `getCurrentDocumentInfo().uuid` |
| EasyEDA recharge sa fenêtre tout seul (calculs longs, rafales d'appels) | Attendre (`waitok.mjs`), reprendre ; **enregistrer immédiatement** après un autoroutage (`.then(save)`) |
| `autoRouting` : il faut **lister les nets** (`RoutingNets`) ; le bilan est parfois absent ou faux | Toujours vérifier par le DRC (liste des « Connection Error ») |
| Plans non recalculés après ajout de cuivre → centaines d'erreurs | `rebuild.mjs` (`rebuildCopperRegion` sur chaque plan) avant tout DRC |
| Suppressions parfois sans effet ou annulées au rechargement (textes, pastilles, composants) | Supprimer **un identifiant à la fois** (chaîne, pas tableau), attendre, relire |
| Import schéma → PCB : `importChanges(undefined, true)` attend le **clic « Apply » de Julien** ; peut sortir de la carte les composants des pages modifiées (nouveaux identifiants) | Remettre les identifiants à jour par repère, réappliquer `fine_plan.json` (`fine_apply.mjs`), refaire `fullchk.cjs` |
| Un via qui chevauche une piste sans coïncider avec son extrémité n'est pas relié | Extrémités exactes |
| Règle d'écart par net : le DRC applique la plus stricte des deux | Utiliser des zones à règle propre (`getRegionRules` / `overwriteRegionRules`) |
| `preserveSilos: true` laisse des îlots morts | Déjà mis à `false` |
| Positions du DRC (`pos`) | En unités de 10 mil : × 0,254 = mm |

## 9. Outils (copiés dans `hardware/outils/routage/`)

Lancer depuis ce dossier avec `node`. Unités internes : mil dans EasyEDA, mm dans les scripts de plan.

| Script | Rôle |
|---|---|
| `eda.mjs`, `lib2.mjs`, `pcbact.mjs`, `waitok.mjs` | Appel du pont, gardes, activation du PCB, attente de reconnexion |
| `pcbdrc2.mjs` | DRC détaillé, résumé par catégorie |
| `isochk.mjs` | **Contrôle d'isolement 2 mm** sur pastilles, pistes, vias, 4 couches (à lancer après chaque étape) |
| `rebuild.mjs` | Recalcul des plans |
| `loop.mjs` (`SIZE=n`), `chunks.mjs` (`RETRY=1`, `OPEN=1`) | Autoroutage par lots, vérifié par DRC |
| `pairs.mjs` + `gridroute.cjs` (`PAIRS=1`) + `gr_apply.mjs` | Paires ouvertes depuis le DRC, routeur sur grille maison (0,05 mm, L1 / L4 / L3, règles de zone), application |
| `rip.mjs` (`rip_nets.json`), `ripS.mjs` | Arrachage par net / de tous les signaux de commande (garde puissance et vias de plans) |
| `fanout.cjs` (`CONLY=1`), `fanout_apply.mjs` | Vias de liaison aux plans |
| `fine_plan.cjs` (`FREEZE=1 CLR=1.1`), `fine_apply.mjs`, `fullchk.cjs` | Placement (ne pas relancer sans raison), application, contrôle positions / chevauchements / isolement composants |
| `cu_read.mjs`, `cu_read2.mjs`, `pcbnets.mjs`, `bbox.mjs` | Relevés du cuivre, des pastilles, des boîtes englobantes |
| `silk_plan.cjs`, `silk_read.mjs`, `silk_apply.mjs`, `silk_check.mjs`, `silksvg.cjs` | Sérigraphie : plan, application, contrôle sur boîtes réelles, rendu |
| `fsvg.cjs`, `zoomsvg.cjs` | Rendus SVG (PNG par Edge sans interface, voir session 13) |
| `tp.mjs` | Points de test TP1 à TP7 (vérifier qu'il en reste 7 exactement) |
| Données | `fine_geo.json` (géométrie placée), `fine_plan.json`, `pcb_*_r0.json` (géométrie à rotation 0 : **ne pas écraser**), `tp.json`, `silk_plan.json` |

Attention : `pcbnets.mjs` et `bbox.mjs` écrivent `pcb_pads.json` / `pcb_bbox.json` (positions réelles tournées) : ne jamais les utiliser comme géométrie de référence.

## 10. Après le routage

1. Remplissage `GND` (commande) et `GND_P` (puissance) sur L1 et L4, coupé à la bande d'isolement, cousu à L2 par des vias (bords, barrière, autour du MCU et de l'USB).
2. Sérigraphie : relire les attributs (`silk_read.mjs`), refaire le plan (`silk_plan.cjs`) en supprimant d'abord les textes et traits créés en session 13 (cartouche, légendes, frontière, noms de broches), appliquer, puis `silk_check.mjs` : **0 texte sur pastille, corps, texte, bord ou trou**.
3. Contrôles finaux : DRC 0 erreur, `isochk.mjs` 0 violation, `fullchk.cjs`, 7 points de test, rendu des 4 couches.
4. Mettre à jour `RAPPORT_PHASE_5_ROUTAGE.md` (G5 à valider par Julien), `ETAT_PROJET.md`, `JOURNAL.md`, `POINTS_OUVERTS.md` ; commit et push.
