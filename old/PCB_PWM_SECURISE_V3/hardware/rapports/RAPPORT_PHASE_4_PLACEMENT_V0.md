# Rapport — Phase 4 : création du PCB et placement préliminaire v0

**Date :** 2026-11-04 — **Session :** 13 (suite) — **Outil :** Claude Code, EasyEDA Pro V3.2.209 Full Online
**Statut :** placement **préliminaire v0**. Ce n'est pas le jalon G4. PO-15, PO-33 et PO-32 tranchés (DEC-068, DEC-069, DEC-070 ; §8 à §10) : le placement fin peut commencer.
**Vue :** `hardware/pcb/PLACEMENT_V0.svg`

## 1. Demande

**[Exprimé]** « Pourrais-tu créer un PCB et placer les composants ? »

## 2. Import du schéma vers PCB1

- `pcb_Document.importChanges()` ouvre la fenêtre d'import, puis attend le clic « Apply » (paramètre `force` non pris en charge en V3.2.209). Julien a cliqué.
- **198 composants** importés, 574 pastilles, **115 nets**, comme dans le schéma. Aucun net à une seule pastille.
- 28 pastilles sans net, toutes marquées non connectées dans le schéma : J5.7, J6.2, J12.A8/B8 (SBU), K1.2, K2.2, LS1.3/4 (fixation), U1.25/39/41, U2.4, U3.1, U4.2/4/9, U5.3, U13.7 à U13.15, U15.4, U16.4.

## 3. Hypothèses du placement v0

| Point | Valeur retenue | Statut |
|---|---|---|
| Dimensions | 100 × 80 mm, rectangle, contour sur « Board Outline Layer » | **[Décidé]** DEC-068 |
| Bord haut | J12 (USB-C), J1 (contrôleur), J4, J5 (fins de course), J8 (extension) | **[Décidé]** DEC-068 (bords opposés) |
| Bord bas | J2 (12 V), J6 (5e contact), J3 (vérin) | **[Décidé]** DEC-068 |
| Barrière | K1, K2, U6, U7, U9 en une rangée entre les zones C et P | Conforme à `PLACEMENT_CIBLE.md` §1 ; largeur : PO-33 |
| Faces | Tous les composants sur la face supérieure, orientation d'origine | **[Hypothèse]** |
| Écart | 1,5 mm minimum entre pastilles de composants voisins | **[Hypothèse]** ; pas une distance d'isolement |

Méthode : chaque groupe fonctionnel (alimentation, USB, MCU, PWM, fins de course, extension, IHM, relais K1, relais K2 + chien de garde, mesure de courant, 12 V…) est compacté en un bloc, puis les blocs sont rangés dans leur zone. Les composants d'un groupe restent voisins ; leur ordre interne n'est pas optimisé pour le routage.

## 4. Contrôles

| Contrôle | Résultat |
|---|---|
| Composants placés | **198 / 198**, position relue identique au plan |
| Contour | 1 polyligne fermée 100 × 80 mm |
| Chevauchement (marge 0,5 mm), hors carte | Aucun |
| DRC PCB (`pcb_Drc.check`, mode strict) | **546 erreurs, toutes « Connection Error »** : liaisons non routées, attendu. Aucune erreur d'isolement ni de chevauchement |

## 5. Limites du placement v0

1. **Pas optimisé pour le routage.** Les règles de `PLACEMENT_CIBLE.md` §2 (découplage au plus près des broches, quartz, ESD au pied des connecteurs, boucles de roue libre) ne sont **pas** appliquées finement.
2. Frontière `GND` / `GND_P` sous les relais (forme en L autour de la broche 8) : à traiter au placement fin.
3. Ordre des connecteurs le long de chaque bord : non optimisé, à revoir avec le passage des câbles dans le boîtier.
4. Rangées de passifs : il reste de la place libre, notamment à droite et au centre de la carte.

## 6. Constats sur l'API (PO-38)

| N° | Constat |
|---|---|
| B1 | `importChanges()` attend le clic « Apply » ; le PCB reste vide tant que Julien n'a pas cliqué |
| B2 | Contour de carte : `pcb_PrimitiveLine.create` sur la couche 11 échoue (« 无法创建直线图元 »). Il faut `pcb_PrimitivePolyline.create` avec `pcb_MathPolygon.createPolygon` (documenté dans le skill) |
| B3 | Pastilles polygonales (J12, U4, U8) : `pad[1]` est une liste de points absolus, pas une largeur. Encombrement calculé à partir des points |
| B4 | `pcb_Drc.check(true,false,true)` renvoie **le détail** des erreurs (type, règle, net, objets), contrairement à `sch_Drc.check` |
| B5 | 198 `pcb_PrimitiveComponent.modify` en 14 lots de 15 : aucun échec, aucun blocage |

## 7. Prochaines étapes

1. Julien : revue visuelle de PCB1.
2. Claude Code : placement fin (phase 4, jalon G4) selon `PLACEMENT_CIBLE.md` §2.

## 8. Mise à jour après DEC-068 (PO-15)

- 4 trous de fixation créés : pastilles non métallisées MH1 à MH4, Ø 3,2 mm, couche multicouche, aux coins, centres à (4 ; 4) mm des bords, sans net.
- Connecteurs des bords limités à x = 8,4 à 91,6 mm pour dégager les coins. Placement refait : 198 / 198, positions relues identiques au plan, aucun composant dans un cercle de Ø 7 mm autour d'un trou.
- DRC : inchangé (546 liaisons non routées, aucune autre erreur).

## 9. Mise à jour après DEC-069 (PO-33)

Écart minimal entre pastilles commande et puissance, mesuré sur les empreintes :

| Composant | Écart | Paire la plus proche |
|---|---|---|
| K1, K2 (G6K-2F-Y) | **1,10 mm** | broche 8 (bobine −) ↔ broche 7 (contact de puissance) |
| U6, U7 (EL357N) | 4,90 mm | broche 3 (`GND`) ↔ broche 2 (`GND_P`) |
| U9 (AMC1301) | 9,10 mm | broche 5 (`GND`) ↔ broche 4 (`GND_P`) |

- Le relais fixe le maillon faible. Julien retient ≥ 2 mm ailleurs, sans fente.
- Placement v0 corrigé : les composants de barrière posés côte à côte (K1 / K2, U6 / U7) étaient à 1,5 mm. Écart élargi : **2,77 mm minimum** entre pastilles commande et puissance de composants différents.
- 198 / 198 composants relus à leur position, DRC inchangé (546 liaisons non routées).

## 10. Empilement 4 couches (DEC-070, PO-32)

**[Exprimé]** Julien : « C'est pas mieux de mettre GND en L1 et L4 et signaux et alim en interne ? Si oui fais ça, si non garde l'option recommandée. »

| Critère | GND / S / S / GND | S / GND / Alim / S (retenu) |
|---|---|---|
| Blindage des pistes | Pistes enfouies entre deux plans : rayonnement le plus faible, si les plans sont continus | Pistes en surface, chacune au-dessus du plan L2 |
| Continuité des plans extérieurs | L1 porte les 198 composants CMS : le plan est découpé par les pastilles et les pistes de sortie. Ott le signale comme l'inconvénient principal sur une carte dense | Plan L2 continu, seulement percé par les vias |
| Deux domaines isolés | Quatre plans à couper (L1 et L4, chacun en `GND` / `GND_P`), chacun avec sa bande de 2 mm | Un plan coupé (L2), une bande de 2 mm |
| Alimentations | En pistes sur L2 / L3, sans plan | Plans `+3V3` et `+12V_P` en L3, couplés à L2 |
| Mise au point, réparation | Pistes inaccessibles : pas de mesure à la sonde, pas de coupure ni de fil de reprise | Pistes en surface : mesure et reprise possibles |
| Diaphonie entre L2 et L3 | À surveiller (pistes croisées à angle droit) | Sans objet |

Conclusion : l'avantage CEM du GND / S / S / GND suppose des plans extérieurs continus. Sur cette carte (198 composants CMS en face supérieure, deux masses isolées), il disparaît en grande partie. Il coûte la possibilité de mesurer et de réparer, contraire à « une carte utilisable dès les premiers essais ». **[Reco]** retenue : S / GND / Alim / S, avec remplissage de masse de chaque domaine sur L1 et L4, cousu à L2 par des vias (récupère une partie du blindage). Signaux exposés aux décharges (USB, J1, fins de course) : routés au plus court, protections au pied du connecteur.

**[Hypothèse]** Empilement JLCPCB 1,6 mm courant (JLC04161H-7628) : diélectrique d'environ 0,21 mm entre L1 et L2, cœur d'environ 1,065 mm entre L2 et L3. Source tierce, à vérifier dans l'outil de JLCPCB au moment du routage.

Appliqué à PCB1 : 4 couches cuivre, couches internes renommées `L2_GND` et `L3_ALIM`, type signal (zones de cuivre positives : la coupure entre `GND` et `GND_P` est plus simple à tenir qu'avec des plans négatifs). DRC inchangé.

Sources :
- H. Ott, « PCB Stack-Up, Part 2: Four-Layer Boards » (copie : https://www.scribd.com/doc/283002193/PCBStackups-Ott)
- InCompliance, « Most Important PCB Layer Stack-up Considerations… » : https://incompliancemag.com/most-important-pcb-layer-stack-up-considerations-that-achieve-optimal-emc-performance/
- Sierra Circuits, webinaire EMC stack-ups : https://sierraconnect.protoexpress.com/t/webinar-how-to-strategically-plan-emc-compliant-pcb-stack-ups/4238
- Empilement JLC04161H-7628 (source tierce) : https://github.com/gsuberland/jlcpcb_autogenerated_stackups
