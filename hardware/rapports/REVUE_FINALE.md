# Revue finale (phase 8)

**Date :** 2026-11-14. Relecture du projet « comme si un autre l'avait fait », point par point. **B** = bloquant, **NB** = non bloquant.

## 1. Résultat

| Catégorie | Constats | État |
|---|---|---|
| Bloquants | 0 restant (1 trouvé pendant la saisie, corrigé : nets fusionnés par des fils en contact) | Clos |
| Non bloquants corrigés | 1 (R303 : 33 Ω → 1 kΩ) | Clos |
| Non bloquants laissés | 7 (voir §3) | Suivis par PO |

## 2. Points contrôlés

| N° | Point | Méthode | Résultat |
|---|---|---|---|
| 1 | Alimentations | Relecture de la netlist exportée | `+5V` : U15 → K1, J7 (K2), U17, LED1, U16, R102. `+3V3` : carte de dev → U3, U4, rappels, LED5, buzzer, J8. `+12V_P` : U5 → K2 (NC), J6, R505. Conforme à `ALIMENTATION.md` |
| 2 | Découplages | Netlist + placement | U3 : C302 à 4 mm. U4 : C404 à 3,4 mm. U17 : C420 à 3,4 mm. LED1 : C421 à 4 mm. U15 : C107 (entrée), C101 + C102 (sortie). U16 : C109, C108. U5 : C502 sur VS, C501 entre VCAP et VS (datasheet TI : ≥ 0,1 µF). `+3V3` : C105 près de J20, C407 près du buzzer |
| 3 | Polarités des diodes | Noms de broches des symboles, images du schéma | Broche 1 = cathode sur toutes les diodes à deux broches. Vu sur le dessin du symbole pour SMAJ15A et ESD5Z5V0 ; nommé « K » ou « C » pour 1N4148W, BZT52C10, SMAJ15A ; « − » pour la LED. SMAJ5.0A (D1) : même famille d'empreinte, **non vu sur un dessin** → NB-1 |
| 4 | Polarité des relais | Datasheet Omron G6K (page 6, « Terminal Arrangement », vue de dessus) | Bobine : 1 = +, 8 = −. Pôles : 3 commun, 2 repos, 4 travail ; 6 commun, 7 repos, 5 travail. Conforme au schéma. Empreinte : pas 3,2 / 5,4 / 7,6 mm et 7 mm entre rangées, conformes |
| 5 | Optocoupleurs | Datasheet Lite-On LTV-357T (page 2) | 1 anode, 2 cathode, 3 émetteur, 4 collecteur. Isolement 3 750 V eff. Rang C : CTR 200 à 400 % à 5 mA. Courant de LED 2,3 mA à 12 V ; besoin côté collecteur 0,33 mA : marge large même au CTR minimal de la série (50 %) |
| 6 | Watchdog | Datasheet ST STWD100 (tableaux 2, 5, 8) | 1 WDO, 2 GND, 3 EN (actif bas, relié à la masse), 4 WDI, 5 VCC. Version YNX : drain ouvert, 71 à 142 ms. VIH = 0,7 × VCC = 2,31 V : compatible avec une sortie 3,3 V |
| 7 | Protection 12 V | Datasheet TI LM74502 (pages 3 à 5, 15, 18) | Brochage conforme. EN relié à VS : toujours actif. Pompe de charge jusqu'à 13,9 V au-dessus de la source : la Zener D8 (10 V) est nécessaire pour l'AO3400A (± 12 V) et présente |
| 8 | Diodes idéales | Datasheet TI LM66100 (pages 3, 5, 9 §8.3.2) | CE reliée à VOUT = blocage du courant inverse, montage décrit par TI. Brochage conforme |
| 9 | Buzzer | Datasheet Huaneng MLT-8530 (page 2) | Une borne +, une borne −, deux pastilles factices. Broche 1 = + ; les trois autres reliées à `BUZ_N` (DEC-013) |
| 10 | Broche par broche, carte de dev | Guide Espressif (tableaux J1, J3) contre `netlist_cible.json`, puis pastilles relues sur le PCB | 44 broches conformes. Sur le PCB : J20.1 (`+3V3`) à x = 61,34 ; J20.22 (`GND`) à x = 8,00 ; J22.4 et J21.4 (`PWM_IN`) à x = 53,72 |
| 11 | Orientation de la carte de dev | Plan Espressif fourni par Julien | USB à gauche : rangée J1 en haut (J20), rangée J3 en bas (J22 à 22,86 mm, J21 à 25,40 mm), broche 1 à droite. Bord USB de la carte de dev au ras du bord gauche du PCB |
| 12 | États des GPIO au démarrage | Datasheet ESP32-S3 (tableaux 2-1 et 2-2) | GPIO21 (`K1_CMD`) : ni entrée ni rappel au reset, aucune impulsion. GPIO47 (`K2_CMD`) : entrée sans rappel, aucune impulsion. GPIO42 (`CP_DRV`) : entrée sans rappel. GPIO14, 13, 8, 6 : impulsion basse de 60 µs, sans effet. GPIO18 (`EXT_IN2`) : impulsions basse et haute, vers une résistance de 4,7 kΩ, sans effet. **Aucune action possible** |
| 13 | Impulsion basse sur les entrées | Idem | GPIO1 (`PWM_IN`) force un niveau bas 60 µs face à la sortie de U3 à travers R303. Avec 33 Ω : 100 mA possibles. **Corrigé : R303 = 1 kΩ** (DEC-020). Les autres entrées ont déjà 1 kΩ à 10 kΩ en série |
| 14 | Isolement | Script indépendant sur tout le cuivre | 2,34 mm au minimum entre domaines ; 1,10 mm dans les relais (empreinte) ; bande sans cuivre de 3 mm |
| 15 | Broche 1 et sérigraphie | Image du PCB | Pastille 1 carrée sur les borniers et barrettes. Contour et sens de la carte de dev imprimés. Légendes des borniers de puissance et du cavalier. Pas de légende de broches pour J1, J4, J5, J8 (place) → NB-4 |
| 16 | ERC | `sch_Drc.check` | 0 erreur, 0 avertissement |
| 17 | Netlist | Export contre cible | 0 écart, 136 composants, 78 nets |
| 18 | DRC | `pcb_Drc.check`, mode strict | 0 erreur, 0 liaison ouverte (relancé avant chaque export) |
| 19 | BOM / CPL / rotations | Script `gen_jlc` | 45 lignes de BOM, 136 repères, codes LCSC identiques à la netlist ; CPL : 136 lignes, toutes en face supérieure, rotations égales au plan de placement |
| 20 | Stock JLCPCB | Fiches relues une seconde fois | 45 / 45 disponibles. Le plus faible : STWD100YNX, 179 (disponible 172) |
| 21 | Gerber | Contenu de l'archive | 4 couches cuivre (GTL, G1, G2, GBL), masques, pâte, sérigraphie, contour, perçages métallisés et non métallisés |

## 3. Constats non bloquants laissés

| N° | Constat | Risque | Suivi |
|---|---|---|---|
| NB-1 | Polarité de D1 (SMAJ5.0A) déduite de la convention de la bibliothèque, non vue sur un dessin | Faible. Une TVS inversée conduirait en direct : le fusible F1 déclencherait dès la mise sous tension, sans dégât | PO-09 : à regarder dans l'aperçu de placement de JLCPCB |
| NB-2 | Stock du watchdog : 179 pièces | Rupture avant commande | PO-10 : remplacer le code par C46043 (même empreinte) si besoin |
| NB-3 | Repères de sérigraphie serrés dans la zone des fins de course | Esthétique ; JLCPCB retire l'encre sur les pastilles | PO-13 |
| NB-4 | Brochage de J1, J4, J5, J8 absent de la sérigraphie | Erreur de câblage | PO-11 : tableau de câblage dans `LIVRAISON.md` |
| NB-5 | Datasheets non relues : SRV05-4, WS2812B, AO3400A, 74AHCT1G125, 74LVC1G17, BAT54S | Faible : brochages conformes aux noms de broches des symboles LCSC ; valeurs reprises des anciens dépôts | PO-08 |
| NB-6 | Carte de dev non reçue : ni l'entraxe ni la diode USB n'ont été mesurés | Les deux entraxes sont câblés | PO-01, PO-03 |
| NB-7 | L'ancien firmware vise le brochage v3 et un watchdog à fenêtre | À adapter avant tout essai | PO-12 |
