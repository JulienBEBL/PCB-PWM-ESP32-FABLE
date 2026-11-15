# Rapport — Sérigraphie du PCB

**Session :** 2026-11-15. **Projet EasyEDA :** `FABLE52_PCB_ESP32`, uuid `836928ac4399433ab9cd56636d997eda` (lu par l'API avant tout relevé). **PCB :** `PCB1` (`5457367f86d6a6ce`).

Périmètre : couches de sérigraphie seulement. Aucun composant, pastille, piste, via, zone de cuivre, contour ou schéma modifié.

## 1. Règles de fabrication JLCPCB

Source : <https://jlcpcb.com/capabilities/pcb-capabilities>, section « Legend », lue le 2026-11-15.

| Règle | Valeur JLCPCB | Seuil appliqué |
|---|---|---|
| Hauteur minimale des caractères | 1,0 mm (40 mil) | ≥ 1,0 mm |
| Largeur de trait minimale | 0,15 mm | ≥ 0,15 mm |
| Rapport largeur / hauteur conseillé | 1:6 | trait 0,15 mm pour 1,0 mm de haut |
| Écart pastille / sérigraphie | 0,15 mm | ≥ 0,15 mm du cuivre de la pastille |
| Écart sérigraphie / bord de carte | Non indiqué sur la page | **[Hypothèse]** 0,3 mm (PO-24) |
| Sérigraphie sur ouverture de vernis | Non indiqué sur la page | Traitée comme interdite (texte coupé à la fabrication) |

## 2. Méthode

Scripts hors dépôt (DEC-015) : `silk_dump.mjs` (relevé par l'API), `silk_check.mjs` (contrôle hors ligne), `silk_table.mjs` (tableau de l'annexe).

| Contrôle | Méthode |
|---|---|
| Boîte englobante | `pcb_Primitive.getPrimitivesBBox` sur chaque texte (valeur rendue par EasyEDA) |
| Pastille | Rectangle de la pastille (forme, taille, rotation) ; écart < 0,15 mm = défaut |
| Via | Disque du via ; écart < 0,15 mm = défaut |
| Sous un corps | Intersection avec la boîte de l'empreinte d'un composant (y compris le sien) |
| Bord | Écart au contour 120 × 80 mm < 0,3 mm |
| Orientation | 180° et 270° = à l'envers ou lecture par la gauche |
| Éloigné | Écart texte / empreinte propre > 1 mm |
| Ambigu | Une autre empreinte plus proche que la sienne |
| Trop gros | Texte plus long que 1,5 fois l'empreinte et de plus de 1 mm |

Limite : l'API ne donne pas le dessin de sérigraphie interne des empreintes (contours, barres de cathode, repère de broche 1). Ces dessins font partie de l'empreinte : ils ne sont ni relevés ni modifiés. Ils sont relus sur l'image du PCB.

## 3. Inventaire (avant correction)

| Élément | Nombre |
|---|---|
| Repères de composants visibles (face top) | 136 (tous visibles, aucun autre attribut affiché) |
| Textes libres (face top) | 12 |
| Textes face bottom | 0 |
| Traits de sérigraphie libres | 1 (contour de la carte de dev) |
| Pastilles / vias contrôlés | 417 / 170 |

Tous les repères : hauteur 1,14 mm (45 mil), trait 0,152 mm (6 mil). Rotations : 0° (62), 90° (31), 180° (9), 270° (34).

## 4. Défauts (avant correction)

| Catégorie | Occurrences | Textes touchés | Exemples |
|---|---|---|---|
| Recouvrement texte / texte | 13 paires | 26 | R311/R321 … R318/R328 (8 paires, zone des fins de course), C313/U11, C317/U12, D5/R506, J6 et J7 sur leur légende |
| Texte sur une pastille ou à < 0,15 mm | 83 | 46 | R311 à R328 sur les pastilles du voisin ; C102 sur C101 ; C108 sur U16 ; R412 sur U4 ; K1, K2, U5, U15, U16 à 0,13 mm de leur propre pastille |
| Texte sur un via ou à < 0,15 mm | 60 | 50 | R420 (3 vias), C317 (3 vias), C313, R312, R322 |
| Texte sous une empreinte | 60 | 55 | C102 sous C101, F1 sous C107, LS1 sous LED1, LED5 sous LS1, D11 / D12 / C332 / R333 sous leur propre empreinte |
| Repère sous la carte de dev enfichée | 14 | 14 | C105, C106, C108, C109, C301, C302, Q2, R102, R103, R303, R416, R417, U3, U16 : invisibles une fois la carte en place |
| Hors carte ou à < 0,3 mm du bord | 0 | 0 | — |
| Hauteur < 1,0 mm | 1 | 1 | « J21 : ENTRAXE 25,40 … » : 0,90 mm |
| Trait < 0,15 mm | 0 | 0 | — |
| Trop gros pour le composant | 0 | 0 | — |
| Orientation 180° ou 270° | 43 | 43 | J1, J4, J5, J20, J21, J22, K1, K2, D1 (180°) ; C311 à C318, R321 à R328, D2, D4, D5, D9 à D12 (270°) |
| Éloigné (> 1 mm) | 0 | 0 | — |
| Ambigu | 1 | 1 | C421 : plus proche de LED1 (0,4 mm) que de C421 (0,9 mm) |

**Total : 98 textes sur 148 ont au moins un défaut** (hors repères cachés par la carte de dev).

Zone la plus dense : fins de course (R311–R328, C311–C318, U11, U12), déjà notée PO-13.

## 5. Informations présentes ou absentes

| Information | État | Constat |
|---|---|---|
| Nom de la carte, version, date | Présent | « BEBL  CARTE PWM SECURISEE ESP32  V1.0  11/2026 » |
| Nom des connecteurs (repère) | Présent | J1 à J8, J20 à J22 (J1, J4, J5, J20 à J22 à 180°) |
| Fonction des connecteurs | Partiel | J2, J3, J6, J7 : oui. **J1 (PWM), J4 (FDC rentré), J5 (FDC sorti), J8 (extension) : non** |
| Fonction de chaque broche | Partiel | J2 (1:+ 2:-), J3 (rouge / noir) : oui. J6, J7 : « 1-3 ». **J1, J4, J5, J8 : non** (PO-11) |
| Repère de broche 1 | Partiel | Pastille carrée sur les borniers et barrettes (cuivre). Aucun « 1 » imprimé sauf pour la carte de dev |
| Polarité des diodes et LED | Dans les empreintes | Barre de cathode visible sur D1 et « + » sur LS1 (image). Non vérifiable par l'API pour les autres. Aucun condensateur polarisé dans la BOM |
| Cavalier d'armement | Présent | « J7 ARMEMENT 1-3 » ; le sens « pont = armé » n'est pas écrit |
| Points de test | Sans libellé | 6 pastilles libres TP1 à TP6 (`pcb_prep.mjs`), sans texte de sérigraphie. **Correction du premier relevé**, qui les avait déclarés absents (ce ne sont pas des composants) |
| Domaine 12 V isolé | Partiel | Textes « DOMAINE PUISSANCE 12 V ISOLE (GND_P) » et « ISOLATION 3 mm : AUCUN CUIVRE ». Aucun trait de sérigraphie le long de la bande d'isolement |
| Contour de la carte de dev | Présent | Rectangle 62,4 × 25,4 mm. Texte « ESP32-S3-DevKitC-1 (N8, N8R2, N16R8) » : **diffère de « ESP32-S3-DevKitC-1-N8 uniquement » demandé** |
| Broche 1, broche 22, côté USB de la carte de dev | Présent | « 1 », « 22 », « USB » |
| Face bottom | Vide | Aucun texte |

## 6. Propositions

| N° | Proposition |
|---|---|
| P1 | Repères CMS à 1,0 mm, trait 0,15 mm ; connecteurs à 1,5 mm |
| P2 | Rotations 0° et 90° seulement : 43 repères à tourner |
| P3 | Repositionner chaque repère hors pastille, via, empreinte et autre texte, au plus près de son composant, par recherche automatique de place autour de l'empreinte |
| P4 | Zones trop denses (R311–R328) : repère groupé « R311–R318 » / « R321–R328 » à côté du bloc |
| P5 | Repères sous la carte de dev : laissés en place (lisibles carte retirée), hors pastilles et vias |
| P6 | Ajouter la fonction de J1, J4, J5, J8 et le nom de chaque broche quand la place le permet ; un « 1 » près de la broche 1 des borniers |
| P7 | « J7 ARMEMENT : PONT 1-3 = ARME » ; « J6 : PONTER 1-3 SI ABSENT » |
| P8 | Trait de sérigraphie de part et d'autre de la bande d'isolement 12 V |
| P9 | Texte de la carte de dev : « ESP32-S3-DevKitC-1-N8 UNIQUEMENT » ; note d'entraxe passée à 1,0 mm |

## 7. Réponses de Julien (2026-11-15)

Toutes les réponses par défaut, sauf la carte de dev : texte « (N8, N8R2, N16R8) » **conservé** (Julien prévoit une N16R8 ; garder la souplesse). Décision : DEC-023.

| Question | Réponse retenue |
|---|---|
| Taille des repères | 1,0 mm (trait 0,165 mm) pour les CMS ; 1,5 mm (trait 0,23 mm) pour les connecteurs J |
| Zones trop denses | Regrouper ; masquer en dernier recours |
| Orientations | 0° et 90° |
| Connecteurs | Fonction et signal par broche quand la place le permet, sinon légende |
| Face bottom | Vide |
| Ajouts | Liste complète ; case « S/N : » à remplir à la main ; pas de logo |
| Carte de dev | Texte inchangé |

## 8. Corrections faites

Scripts : `silk_place.mjs` (placement hors ligne : recherche de place autour de chaque empreinte, le repère le plus contraint d'abord), `silk_apply.mjs` (application, idempotente), `silk_nudge.mjs` (petits décalages sur les boîtes réelles), `silk_fix_r331.mjs`. Toutes les écritures portent sur la couche sérigraphie top.

| Action | Nombre |
|---|---|
| Repères repositionnés (taille, rotation, position) | 109 |
| Repères masqués et remplacés par un libellé de groupe | 24 : R311–R318, R321–R328, C311–C318 (2 blocs « R311-R314 / R321-R324 / C311-C314 / 1 A DROITE » et « … 5 A DROITE ») |
| Repères masqués sans remplacement (aucune place) | 3 : D11, R416, R420 |
| Textes libres modifiés | J6 « J6 5e CONTACT NC : PONTER 1-3 SI ABSENT » ; J7 « J7 ARMEMENT : PONT 1-3 = ARME » ; note d'entraxe à 1,0 mm |
| Textes ajoutés | 29 : nom des broches de J8 ; légendes J1, J4/J5, J8 ; « 1 » près de la broche 1 de J2, J3, J6, J7 ; TP1 à TP6 avec leur net ; « S/N : » |
| Traits ajoutés | 8 segments le long des deux bords de la bande d'isolement (y = 27,5 et 30,5 mm, trait 0,2 mm), coupés autour des pastilles, vias et corps ; 1 cadre S/N 12,4 × 3,2 mm |

Légendes de broches :

| Connecteur | Sérigraphie | Emplacement |
|---|---|---|
| J1 | « J1 ENTREE PWM / 1 +5V  2 GND / 3 PWM  4 STAT » | Entre J1 et J4 |
| J4, J5 | « J4 FDC RENTRE  J5 FDC SORTI / 1/4 COM  2/5 NO  3/6 NC  J5.7 X » | Une légende commune, à 16,6 mm sous J4/J5 (aucune place plus près) |
| J8 | « 3V3 EX1 EX2 GND » au-dessus de chaque broche ; « J8 EXTENSION 3V3 MAX » | Rangée au-dessus de J8 ; légende verticale à gauche |

## 9. Contrôle final

| Contrôle | Avant | Après |
|---|---|---|
| Recouvrement texte / texte | 13 paires | **0** |
| Texte sur une pastille ou à < 0,15 mm | 46 textes | **0** (marge appliquée 0,2 mm ; 0,15 mm pour D9) |
| Texte sur un via ou à < 0,15 mm | 50 | **0** |
| Texte sous une empreinte | 55 | **0** |
| Trait de sérigraphie sur pastille, via ou texte | — | **0** |
| Hauteur < 1,0 mm | 1 | **0** |
| Trait < 0,15 mm | 0 | 0 |
| Hors carte ou à < 0,3 mm du bord | 0 | 0 |
| Orientation 180° ou 270° | 43 | **0** |
| Éloigné (> 1 mm) | 0 | 1 (R103 : 1,0 mm) |
| Ambigu (critère strict) | 1 | 2 (C420, R103 ; voir §10) |
| Repères sous la carte de dev enfichée | 14 | 13 (laissés, lisibles carte retirée) |
| Textes visibles | 148 | 150 (109 repères, 41 textes libres) |

| Contrôle cuivre | Résultat |
|---|---|
| DRC (`pcb_Drc.check`) | **0 ligne**, 0 liaison ouverte |
| Isolement | 2,34 mm (inchangé) |
| Composants (position, rotation, couche, pastilles), vias, pastilles libres, contour | Identiques avant / après (comparaison des relevés de l'API) |
| Gerber | Nouveau fichier `Gerber_FABLE52_PCB_ESP32_2026-11-15.zip`. Perçages identiques au 14 (170 vias, 267 trous ; écarts de 0,01 µm d'arrondi). Couches cuivre non comparées ligne à ligne (numérotation des ouvertures différente) |

Image : `hardware/rapports/pcb_serigraphie.png`. Projet enregistré.

## 10. Restes et limites

| Point | Cause | Suite |
|---|---|---|
| D11, R416, R420 sans repère | Aucune place à 0,15 mm des pastilles et vias, même regroupés avec le voisin. Il faudrait déplacer un composant | PO-25 |
| C420 et R103 « ambigus » au critère strict | Repère plus près du corps d'un voisin (0,2 mm / 0,3 mm) que du sien (0,4 mm / 1,0 mm). À l'image, chaque repère se lit sous son composant | PO-25 |
| Légende J4/J5 à 16,6 mm des borniers | Aucune place entre les borniers et la zone dense | Légende préfixée « J4 … J5 », sans ambiguïté |
| 13 repères sous la carte de dev | Composants placés sous la carte enfichée | Lisibles carte retirée |
| Écart au bord | Non publié par JLCPCB : 0,3 mm appliqué | PO-24 |
| Dessins des empreintes (contours, barres de cathode) | Hors de portée de l'API, non modifiés (règle 2) | Aperçu JLCPCB à la commande |
| Gerber du 14 | Ne contient pas la nouvelle sérigraphie | Déposer celui du 15 (PO-26) |

## 11. Révision 2 (demande de Julien du 2026-11-15, DEC-024)

Demande : numéro et fonction en face de chaque trou des borniers, textes dans le cadre des connecteurs (des PCB nus serviront de notice), textes J21/J22 au-dessus et au-dessous de leur rangée, titre et S/N agrandis, nouveau contrôle des tailles. Script : `silk_v2.mjs` (puis `silk_v2b.mjs`, `silk_v2c.mjs` pour trois textes trop longs et le titre de J7).

| Connecteur | Dans le cadre (numéro au-dessus de la fonction, face à chaque trou) | Titre dans le cadre |
|---|---|---|
| J1 | 1 +5V, 2 GND, 3 PWM, 4 STAT | J1 ENTREE PWM |
| J2 | 1 +12V, 2 0V | J2 ENTREE 12V |
| J3 | 1 ROUGE, 2 NOIR | J3 VERIN |
| J4 | 1 COM, 2 NO, 3 NC, 4 COM, 5 NO, 6 NC | J4 FDC RENTRE  R1:1-3  R2:4-6 |
| J5 | 1 COM, 2 NO, 3 NC, 4 COM, 5 NO, 6 NC, 7 LIBRE | J5 FDC SORTI  S1:1-3  S2:4-6 |
| J6 | 1 12V, 2 LIBRE, 3 RET | J6 CONTACT NC / SINON PONT 1-3 |
| J7 | 1 +5V, 2 -, 3 ARM (à droite de chaque trou) | J7 ARMEMENT / PONT 1-3 = ARME (vertical) |
| J8 | 3V3, EX1, EX2, GND au-dessus des broches (inchangé) | Légende verticale « J8 EXTENSION 3V3 MAX » (inchangée) |
| J21 / J22 | — | « J22 ENTRAXE 22.86 (ESPRESSIF) » au-dessus de la rangée J22 ; « J21 ENTRAXE 25.40 (CARTES PLUS LARGES) » au-dessous de la rangée J21 |

Remarques :
- J8 : pas de numéro de broche. Il n'y a pas de place dans son cadre (barrette de 2,8 mm) ni au-dessus (bord de carte). La pastille 1 est carrée.
- J7 : le titre vertical est placé à gauche du trait intérieur dessiné par l'empreinte (x = 118,36 mm, mesuré à l'image).
- Les anciennes légendes extérieures (J1, J4/J5, J2, J3, J6, J7, « 1 » de broche 1, note d'entraxe) sont supprimées : 15 textes.
- Le titre passe de 1,2 à 2,0 mm : « BEBL CARTE PWM SECURISEE ESP32 V1.0 11/2026 ». « S/N : » passe à 2,0 mm, et le cadre passe à 18 × 4 mm, juste au-dessus du titre.

### Tailles et lisibilité

Règle JLCPCB (Legend) : hauteur ≥ 1,0 mm, trait ≥ 0,15 mm, rapport 1:6.

| Hauteur | Trait | Nombre | Usage |
|---|---|---|---|
| 1,0 mm | 0,165 mm | 121 | Repères CMS, libellés TP, groupes, J8, textes de domaine |
| 1,2 mm | 0,203 mm | 62 | Numéros et fonctions des broches, titres des borniers, entraxes J21/J22 |
| 1,2 mm | 0,165 mm | 2 | Texte de la carte de dev, « USB » |
| 1,5 mm | 0,229 mm | 11 | Repères des connecteurs J1 à J8, J20 à J22 |
| 2,0 mm | 0,305 mm | 2 | Titre, « S/N : » |

Aucun texte sous 1,0 mm ni sous 0,15 mm de trait : tout est fabricable. Les 121 textes à 1,0 mm sont au minimum de JLCPCB. Ils restent lisibles à l'œil nu, mais ce sont les plus fins de la carte. Les instructions de câblage sont à 1,2 mm ou plus.

### Contrôle après révision 2

| Contrôle | Résultat |
|---|---|
| Recouvrement, texte sur pastille, sur via, sous une empreinte, hors carte, à l'envers, < 1,0 mm, trait < 0,15 mm | **0** |
| Textes dans le cadre d'un bornier (voulu) | 67, à ≥ 0,2 mm des pastilles |
| Ambigus / éloignés (critère strict) | C420, R103 (inchangés, PO-25) |
| DRC | 0 ligne |
| Isolement | 2,34 mm |
| Composants, pastilles, vias | Identiques au relevé du début de session |
| Gerber | `Gerber_FABLE52_PCB_ESP32_2026-11-15.zip` régénéré (298 437 octets) |

## Annexe A — Textes de sérigraphie avant correction

Colonnes X et Y : coin inférieur gauche de la boîte englobante. Repère du PCB : origine en bas à gauche, Y vers le haut.

| Texte | Couche | X (mm) | Y (mm) | Hauteur (mm) | Rotation | Boîte englobante x0 y0 x1 y1 (mm) | Défauts |
|---|---|---|---|---|---|---|---|
| C101 | Top | 29.56 | 69.11 | 1.14 | 0° | 29.56 69.11 31.82 70.25 |  |
| C102 | Top | 29.88 | 66.36 | 1.14 | 0° | 29.88 66.36 32.42 67.51 | pad, body |
| C105 | Top | 56.68 | 58.36 | 1.14 | 0° | 56.68 58.36 59.22 59.51 | via, body, devkit |
| C106 | Top | 29.38 | 56.16 | 1.14 | 0° | 29.38 56.16 31.89 57.31 | pad, via, body, devkit |
| C107 | Top | 23.29 | 65.08 | 1.14 | 90° | 23.29 65.08 24.44 67.62 | pad, body |
| C108 | Top | 11.08 | 53.96 | 1.14 | 0° | 11.08 53.96 13.62 55.11 | pad, body, devkit |
| C109 | Top | 13.89 | 54.88 | 1.14 | 90° | 13.89 54.88 15.04 57.39 | via, devkit |
| C301 | Top | 46.89 | 41.98 | 1.14 | 90° | 46.89 41.98 48.04 44.52 | devkit |
| C302 | Top | 54.89 | 41.98 | 1.14 | 90° | 54.89 41.98 56.04 44.80 | pad, via, devkit |
| C311 | Top | 52.16 | 63.66 | 1.14 | 270° | 52.16 63.66 53.31 65.92 | via, rot |
| C312 | Top | 48.36 | 63.38 | 1.14 | 270° | 48.36 63.38 49.51 65.92 | via, rot |
| C313 | Top | 40.76 | 63.38 | 1.14 | 270° | 40.76 63.38 41.91 65.92 | overlap, via, rot |
| C314 | Top | 36.96 | 63.35 | 1.14 | 270° | 36.96 63.35 38.11 65.92 | via, rot |
| C315 | Top | 82.96 | 63.38 | 1.14 | 270° | 82.96 63.38 84.11 65.92 | via, rot |
| C316 | Top | 79.16 | 63.41 | 1.14 | 270° | 79.16 63.41 80.31 65.92 | via, rot |
| C317 | Top | 71.56 | 63.38 | 1.14 | 270° | 71.56 63.38 72.71 65.92 | overlap, via, rot |
| C318 | Top | 67.76 | 63.38 | 1.14 | 270° | 67.76 63.38 68.91 65.92 | rot |
| C331 | Top | 93.85 | 65.66 | 1.14 | 270° | 93.85 65.66 95.00 68.20 | via, rot |
| C332 | Top | 96.77 | 65.63 | 1.14 | 270° | 96.77 65.63 97.92 68.45 | body, rot |
| C401 | Top | 72.78 | 48.46 | 1.14 | 0° | 72.78 48.46 75.35 49.61 |  |
| C402 | Top | 74.08 | 44.56 | 1.14 | 0° | 74.08 44.56 76.93 45.71 |  |
| C403 | Top | 72.78 | 41.36 | 1.14 | 0° | 72.78 41.36 75.63 42.51 | pad, via, body |
| C404 | Top | 89.08 | 54.16 | 1.14 | 0° | 89.08 54.16 91.96 55.31 |  |
| C405 | Top | 92.28 | 50.56 | 1.14 | 0° | 92.28 50.56 95.13 51.71 |  |
| C406 | Top | 92.28 | 47.36 | 1.14 | 0° | 92.28 47.36 95.10 48.51 | via |
| C407 | Top | 109.96 | 61.21 | 1.14 | 0° | 109.96 61.21 112.81 62.35 | pad, body |
| C420 | Top | 102.11 | 66.29 | 1.14 | 0° | 102.11 66.29 104.96 67.44 | via, body |
| C421 | Top | 109.98 | 78.10 | 1.14 | 0° | 109.98 78.10 112.55 79.25 | ambig |
| C501 | Top | 37.48 | 10.96 | 1.14 | 0° | 37.48 10.96 40.02 12.11 | via, body |
| C502 | Top | 34.96 | 12.70 | 1.14 | 270° | 34.96 12.70 36.11 15.52 | rot |
| C503 | Top | 58.11 | 14.22 | 1.14 | 270° | 58.11 14.22 59.25 17.04 | via, body, rot |
| C504 | Top | 60.96 | 13.67 | 1.14 | 270° | 60.96 13.67 62.11 16.52 | via, rot |
| C505 | Top | 76.48 | 13.96 | 1.14 | 0° | 76.48 13.96 79.30 15.11 |  |
| C506 | Top | 100.39 | 33.98 | 1.14 | 90° | 100.39 33.98 101.54 36.77 | pad, via, body |
| C507 | Top | 106.39 | 33.98 | 1.14 | 90° | 106.39 33.98 107.54 36.80 | pad, body |
| D1 | Top | 19.37 | 62.15 | 1.14 | 180° | 19.37 62.15 20.41 63.29 | rot |
| D2 | Top | 32.13 | 15.88 | 1.14 | 270° | 32.13 15.88 33.27 17.20 | rot |
| D3 | Top | 81.50 | 15.15 | 1.14 | 0° | 81.50 15.15 82.82 16.30 |  |
| D4 | Top | 82.73 | 34.53 | 1.14 | 270° | 82.73 34.53 83.87 35.88 | rot |
| D5 | Top | 97.73 | 34.56 | 1.14 | 270° | 97.73 34.56 98.87 35.88 | overlap, rot |
| D6 | Top | 98.13 | 58.92 | 1.14 | 90° | 98.13 58.92 99.27 60.21 |  |
| D7 | Top | 76.38 | 49.23 | 1.14 | 0° | 76.38 49.23 77.70 50.37 |  |
| D8 | Top | 47.53 | 19.07 | 1.14 | 0° | 47.53 19.07 48.85 20.21 |  |
| D9 | Top | 15.98 | 68.60 | 1.14 | 270° | 15.98 68.60 17.12 69.89 | pad, via, body, rot |
| D10 | Top | 12.18 | 68.11 | 1.14 | 270° | 12.18 68.11 13.32 69.89 | pad, via, body, rot |
| D11 | Top | 96.65 | 72.54 | 1.14 | 270° | 96.65 72.54 97.79 74.04 | via, body, rot |
| D12 | Top | 99.19 | 72.39 | 1.14 | 270° | 99.19 72.39 100.33 74.17 | body, rot |
| D17 | Top | 108.63 | 15.92 | 1.14 | 270° | 108.63 15.92 109.77 17.70 | rot |
| F1 | Top | 24.30 | 67.94 | 1.14 | 270° | 24.30 67.94 25.44 68.94 | body, rot |
| F2 | Top | 21.66 | 15.30 | 1.14 | 0° | 21.66 15.30 22.94 16.44 |  |
| J1 | Top | 24.47 | 69.00 | 1.14 | 180° | 24.47 69.00 25.39 70.14 | rot |
| J2 | Top | 7.81 | 13.21 | 1.14 | 0° | 7.81 13.21 9.01 14.35 |  |
| J3 | Top | 76.82 | 9.86 | 1.14 | 0° | 76.82 9.86 78.02 11.00 |  |
| J4 | Top | 57.17 | 69.00 | 1.14 | 180° | 57.17 69.00 58.40 70.14 | rot |
| J5 | Top | 88.01 | 69.00 | 1.14 | 180° | 88.01 69.00 89.20 70.14 | rot |
| J6 | Top | 94.22 | 9.86 | 1.14 | 0° | 94.22 9.86 95.38 11.00 | overlap |
| J7 | Top | 105.82 | 41.23 | 1.14 | 90° | 105.82 41.23 106.97 42.43 | overlap |
| J8 | Top | 90.80 | 75.82 | 1.14 | 0° | 90.80 75.82 92.00 76.96 |  |
| J20 | Top | 60.93 | 57.85 | 1.14 | 180° | 60.93 57.85 62.86 59.00 | rot |
| J21 | Top | 61.21 | 32.45 | 1.14 | 180° | 61.21 32.45 62.86 33.60 | rot |
| J22 | Top | 60.93 | 34.99 | 1.14 | 180° | 60.93 34.99 62.86 36.14 | pad, body, rot |
| K1 | Top | 78.11 | 23.17 | 1.14 | 180° | 78.11 23.17 79.15 24.31 | pad, rot |
| K2 | Top | 93.83 | 23.17 | 1.14 | 180° | 93.83 23.17 95.15 24.31 | pad, rot |
| LED1 | Top | 111.51 | 73.91 | 1.14 | 90° | 111.51 73.91 112.65 76.33 |  |
| LED5 | Top | 114.30 | 64.44 | 1.14 | 90° | 114.30 64.44 115.44 67.13 | via, body |
| LS1 | Top | 105.70 | 71.23 | 1.14 | 0° | 105.70 71.23 107.41 72.37 | pad, body |
| Q2 | Top | 38.00 | 58.13 | 1.14 | 0° | 38.00 58.13 39.38 59.27 | body, devkit |
| Q3 | Top | 70.50 | 45.33 | 1.14 | 0° | 70.50 45.33 71.88 46.47 |  |
| Q4 | Top | 66.50 | 45.33 | 1.14 | 0° | 66.50 45.33 67.91 46.47 |  |
| Q5 | Top | 96.70 | 58.73 | 1.14 | 0° | 96.70 58.73 98.08 59.87 |  |
| Q6 | Top | 92.70 | 58.73 | 1.14 | 0° | 92.70 58.73 94.05 59.87 |  |
| Q7 | Top | 102.10 | 62.33 | 1.14 | 0° | 102.10 62.33 103.48 63.47 | pad, body |
| Q8 | Top | 46.00 | 15.73 | 1.14 | 0° | 46.00 15.73 47.38 16.87 |  |
| Q9 | Top | 50.50 | 15.73 | 1.14 | 0° | 50.50 15.73 51.85 16.87 |  |
| R102 | Top | 27.54 | 58.26 | 1.14 | 0° | 27.54 58.26 30.05 59.41 | via, body, devkit |
| R103 | Top | 30.94 | 58.26 | 1.14 | 0° | 30.94 58.26 33.45 59.41 | via, body, devkit |
| R301 | Top | 18.06 | 67.25 | 1.14 | 270° | 18.06 67.25 19.21 69.76 | via, rot |
| R302 | Top | 14.26 | 66.97 | 1.14 | 270° | 14.26 66.97 15.41 69.76 | pad, body, rot |
| R303 | Top | 52.04 | 41.46 | 1.14 | 0° | 52.04 41.46 54.83 42.61 | pad, via, body, devkit |
| R311 | Top | 51.09 | 66.14 | 1.14 | 90° | 51.09 66.14 52.24 68.37 | overlap, pad, body |
| R312 | Top | 47.29 | 66.14 | 1.14 | 90° | 47.29 66.14 48.44 68.65 | overlap, pad, via, body |
| R313 | Top | 39.69 | 66.14 | 1.14 | 90° | 39.69 66.14 40.84 68.65 | overlap, pad, via, body |
| R314 | Top | 35.89 | 66.14 | 1.14 | 90° | 35.89 66.14 37.04 68.68 | overlap, pad, body |
| R315 | Top | 81.89 | 66.14 | 1.14 | 90° | 81.89 66.14 83.04 68.65 | overlap, pad, body |
| R316 | Top | 78.09 | 66.14 | 1.14 | 90° | 78.09 66.14 79.24 68.62 | overlap, pad, body |
| R317 | Top | 70.49 | 66.14 | 1.14 | 90° | 70.49 66.14 71.64 68.65 | overlap, pad, via, body |
| R318 | Top | 66.69 | 66.14 | 1.14 | 90° | 66.69 66.14 67.84 68.65 | overlap, pad, body |
| R321 | Top | 52.06 | 66.55 | 1.14 | 270° | 52.06 66.55 53.21 69.06 | pad, via, body, rot |
| R322 | Top | 48.26 | 66.27 | 1.14 | 270° | 48.26 66.27 49.41 69.06 | pad, via, body, rot |
| R323 | Top | 40.66 | 66.27 | 1.14 | 270° | 40.66 66.27 41.81 69.06 | pad, via, body, rot |
| R324 | Top | 36.86 | 66.24 | 1.14 | 270° | 36.86 66.24 38.01 69.06 | pad, body, rot |
| R325 | Top | 82.86 | 66.27 | 1.14 | 270° | 82.86 66.27 84.01 69.06 | pad, body, rot |
| R326 | Top | 79.06 | 66.30 | 1.14 | 270° | 79.06 66.30 80.21 69.06 | pad, body, rot |
| R327 | Top | 71.46 | 66.27 | 1.14 | 270° | 71.46 66.27 72.61 69.06 | pad, via, body, rot |
| R328 | Top | 67.66 | 66.27 | 1.14 | 270° | 67.66 66.27 68.81 69.06 | pad, body, rot |
| R331 | Top | 91.69 | 71.50 | 1.14 | 90° | 91.69 71.50 92.84 74.01 |  |
| R332 | Top | 94.23 | 68.84 | 1.14 | 270° | 94.23 68.84 95.38 71.63 | body, rot |
| R333 | Top | 96.90 | 68.84 | 1.14 | 270° | 96.90 68.84 98.04 71.63 | body, rot |
| R401 | Top | 66.04 | 48.36 | 1.14 | 0° | 66.04 48.36 68.58 49.51 |  |
| R402 | Top | 69.44 | 48.36 | 1.14 | 0° | 69.44 48.36 72.26 49.51 |  |
| R403 | Top | 77.54 | 44.46 | 1.14 | 0° | 77.54 44.46 80.36 45.61 |  |
| R404 | Top | 66.04 | 41.26 | 1.14 | 0° | 66.04 41.26 68.89 42.41 | pad, via, body |
| R405 | Top | 69.44 | 41.26 | 1.14 | 0° | 69.44 41.26 72.26 42.41 | pad, via, body |
| R406 | Top | 85.54 | 57.86 | 1.14 | 0° | 85.54 57.86 88.33 59.01 |  |
| R407 | Top | 88.94 | 57.86 | 1.14 | 0° | 88.94 57.86 91.76 59.01 |  |
| R408 | Top | 92.34 | 54.06 | 1.14 | 0° | 92.34 54.06 95.16 55.21 | via |
| R409 | Top | 95.74 | 54.06 | 1.14 | 0° | 95.74 54.06 98.53 55.21 | via |
| R412 | Top | 85.54 | 50.46 | 1.14 | 0° | 85.54 50.46 88.08 51.61 | pad, body |
| R413 | Top | 88.94 | 50.46 | 1.14 | 0° | 88.94 50.46 91.48 51.61 | via |
| R414 | Top | 85.54 | 47.26 | 1.14 | 0° | 85.54 47.26 88.11 48.41 |  |
| R415 | Top | 88.94 | 47.26 | 1.14 | 0° | 88.94 47.26 91.48 48.41 | via |
| R416 | Top | 34.54 | 58.26 | 1.14 | 0° | 34.54 58.26 37.05 59.41 | body, devkit |
| R417 | Top | 34.54 | 56.16 | 1.14 | 0° | 34.54 56.16 37.08 57.31 | pad, body, devkit |
| R418 | Top | 7.59 | 66.84 | 1.14 | 90° | 7.59 66.84 8.74 69.38 |  |
| R420 | Top | 101.94 | 64.26 | 1.14 | 0° | 101.94 64.26 104.76 65.41 | pad, via, body |
| R421 | Top | 100.71 | 71.12 | 1.14 | 90° | 100.71 71.12 101.85 73.66 |  |
| R424 | Top | 102.14 | 58.36 | 1.14 | 0° | 102.14 58.36 104.99 59.51 | pad, via, body |
| R425 | Top | 102.14 | 56.46 | 1.14 | 0° | 102.14 56.46 104.96 57.61 | pad, via, body |
| R426 | Top | 114.39 | 60.94 | 1.14 | 90° | 114.39 60.94 115.54 63.73 | pad, body |
| R501 | Top | 37.54 | 19.06 | 1.14 | 0° | 37.54 19.06 40.05 20.21 |  |
| R502 | Top | 42.04 | 19.06 | 1.14 | 0° | 42.04 19.06 44.83 20.21 |  |
| R503 | Top | 42.04 | 10.86 | 1.14 | 0° | 42.04 10.86 44.83 12.01 | via |
| R505 | Top | 98.22 | 20.04 | 1.14 | 90° | 98.22 20.04 99.37 22.83 |  |
| R506 | Top | 98.49 | 34.04 | 1.14 | 90° | 98.49 34.04 99.64 36.80 |  |
| R507 | Top | 104.22 | 20.04 | 1.14 | 90° | 104.22 20.04 105.37 22.83 |  |
| R508 | Top | 104.49 | 34.04 | 1.14 | 90° | 104.49 34.04 105.64 36.83 |  |
| U3 | Top | 51.15 | 45.23 | 1.14 | 0° | 51.15 45.23 52.47 46.37 | via, devkit |
| U4 | Top | 85.55 | 54.93 | 1.14 | 0° | 85.55 54.93 86.90 56.07 | pad, via |
| U5 | Top | 37.28 | 15.84 | 1.14 | 0° | 37.28 15.84 38.60 16.98 | pad |
| U6 | Top | 98.00 | 25.03 | 1.14 | 90° | 98.00 25.03 99.14 26.32 |  |
| U7 | Top | 104.00 | 25.03 | 1.14 | 90° | 104.00 25.03 105.14 26.35 | via |
| U11 | Top | 41.45 | 64.10 | 1.14 | 90° | 41.45 64.10 42.60 65.60 | via |
| U12 | Top | 72.25 | 64.10 | 1.14 | 90° | 72.25 64.10 73.40 65.88 | via |
| U15 | Top | 26.83 | 67.95 | 1.14 | 0° | 26.83 67.95 28.61 69.10 | pad, via |
| U16 | Top | 11.43 | 58.05 | 1.14 | 0° | 11.43 58.05 13.17 59.20 | pad, body, devkit |
| U17 | Top | 100.46 | 68.83 | 1.14 | 90° | 100.46 68.83 101.60 70.61 |  |
| «1» | Top | 63.40 | 59.90 | 1.00 | 0° | 63.40 59.90 63.68 60.90 |  |
| «22» | Top | 4.40 | 59.90 | 1.00 | 0° | 4.40 59.90 5.57 60.90 |  |
| «BEBL  CARTE PWM SECURISEE ESP32  V1.0  11/2026» | Top | 22.00 | 1.60 | 1.20 | 0° | 22.00 1.60 55.40 2.80 |  |
| «DOMAINE PUISSANCE 12 V ISOLE (GND_P)» | Top | 22.00 | 23.60 | 1.00 | 0° | 22.00 23.60 43.63 24.60 |  |
| «ESP32-S3-DevKitC-1  (N8, N8R2, N16R8)» | Top | 12.00 | 47.60 | 1.20 | 0° | 12.00 47.60 37.91 48.80 |  |
| «ISOLATION 3 mm : AUCUN CUIVRE» | Top | 3.00 | 28.50 | 1.00 | 0° | 3.00 28.50 20.68 29.50 |  |
| «J2 12V  1:+  2:-» | Top | 8.00 | 16.30 | 1.00 | 0° | 8.00 16.30 17.04 17.30 |  |
| «J3 VERIN 1:ROUGE 2:NOIR» | Top | 69.50 | 17.20 | 1.00 | 0° | 69.50 17.20 82.57 18.20 |  |
| «J6 5e CONTACT 1-3» | Top | 89.00 | 10.60 | 1.00 | 0° | 89.00 10.60 99.60 11.60 |  |
| «J7 ARMEMENT 1-3» | Top | 105.40 | 41.50 | 1.00 | 90° | 105.40 41.50 106.40 50.88 |  |
| «J21 : ENTRAXE 25,40   J22 : ENTRAXE 22,86 (ESPRESSIF)» | Top | 8.00 | 31.60 | 0.90 | 0° | 8.00 31.60 36.33 32.50 |  |
| «USB» | Top | 1.00 | 44.00 | 1.20 | 90° | 1.00 44.00 2.20 46.14 |  |

## Annexe B — Textes de sérigraphie après la révision 2

Même convention que l'annexe A. « cadre » = texte voulu dans le cadre d'un bornier.

| Texte | Couche | X (mm) | Y (mm) | Hauteur (mm) | Rotation | Boîte englobante x0 y0 x1 y1 (mm) | Défauts |
|---|---|---|---|---|---|---|---|
| C101 | Top | 33.79 | 65.04 | 1.00 | 90° | 33.79 65.04 34.79 67.10 |  |
| C102 | Top | 30.16 | 63.41 | 1.00 | 0° | 30.16 63.41 32.45 64.41 |  |
| C105 | Top | 59.87 | 56.90 | 1.00 | 0° | 59.87 56.90 62.16 57.90 | devkit |
| C106 | Top | 28.15 | 53.21 | 1.00 | 0° | 28.15 53.21 30.42 54.21 | devkit |
| C107 | Top | 24.90 | 62.45 | 1.00 | 90° | 24.90 62.45 25.90 64.74 |  |
| C108 | Top | 11.36 | 51.01 | 1.00 | 0° | 11.36 51.01 13.65 52.01 | devkit |
| C109 | Top | 14.01 | 54.40 | 1.00 | 90° | 14.01 54.40 15.01 56.67 | devkit |
| C301 | Top | 47.01 | 41.25 | 1.00 | 90° | 47.01 41.25 48.01 43.54 | devkit |
| C302 | Top | 57.99 | 41.15 | 1.00 | 90° | 57.99 41.15 58.99 43.68 | devkit |
| C331 | Top | 94.11 | 63.75 | 1.00 | 90° | 94.11 63.75 95.11 66.04 |  |
| C332 | Top | 97.86 | 62.85 | 1.00 | 90° | 97.86 62.85 98.86 65.38 |  |
| C401 | Top | 73.06 | 48.49 | 1.00 | 0° | 73.06 48.49 75.38 49.49 |  |
| C402 | Top | 74.36 | 44.59 | 1.00 | 0° | 74.36 44.59 76.91 45.59 |  |
| C403 | Top | 73.06 | 38.41 | 1.00 | 0° | 73.06 38.41 75.61 39.41 |  |
| C404 | Top | 89.36 | 54.19 | 1.00 | 0° | 89.36 54.19 91.93 55.19 |  |
| C405 | Top | 93.55 | 47.61 | 1.00 | 0° | 93.55 47.61 96.10 48.61 |  |
| C406 | Top | 92.56 | 44.41 | 1.00 | 0° | 92.56 44.41 95.08 45.41 |  |
| C407 | Top | 107.33 | 59.60 | 1.00 | 0° | 107.33 59.60 109.88 60.60 |  |
| C420 | Top | 99.10 | 64.26 | 1.00 | 0° | 99.10 64.26 101.65 65.26 | ambig |
| C421 | Top | 103.45 | 78.35 | 1.00 | 0° | 103.45 78.35 105.77 79.35 |  |
| C501 | Top | 36.50 | 8.01 | 1.00 | 0° | 36.50 8.01 38.79 9.01 |  |
| C502 | Top | 34.99 | 12.76 | 1.00 | 90° | 34.99 12.76 35.99 15.28 |  |
| C503 | Top | 54.87 | 13.76 | 1.00 | 90° | 54.87 13.76 55.87 16.28 |  |
| C504 | Top | 60.99 | 15.00 | 1.00 | 90° | 60.99 15.00 61.99 17.55 |  |
| C505 | Top | 76.76 | 13.99 | 1.00 | 0° | 76.76 13.99 79.28 14.99 |  |
| C506 | Top | 102.00 | 37.17 | 1.00 | 90° | 102.00 37.17 103.00 39.67 |  |
| C507 | Top | 110.09 | 33.75 | 1.00 | 90° | 110.09 33.75 111.09 36.28 |  |
| D1 | Top | 16.69 | 62.27 | 1.00 | 0° | 16.69 62.27 17.64 63.27 |  |
| D2 | Top | 27.84 | 13.38 | 1.00 | 90° | 27.84 13.38 28.84 14.56 |  |
| D3 | Top | 83.88 | 10.82 | 1.00 | 0° | 83.88 10.82 85.06 11.82 |  |
| D4 | Top | 82.75 | 32.98 | 1.00 | 90° | 82.75 32.98 83.75 34.19 |  |
| D5 | Top | 97.75 | 32.58 | 1.00 | 90° | 97.75 32.58 98.75 33.76 |  |
| D6 | Top | 98.25 | 60.58 | 1.00 | 90° | 98.25 60.58 99.25 61.74 |  |
| D7 | Top | 77.49 | 49.25 | 1.00 | 0° | 77.49 49.25 78.68 50.25 |  |
| D8 | Top | 49.08 | 19.09 | 1.00 | 0° | 49.08 19.09 50.26 20.09 |  |
| D9 | Top | 14.26 | 66.80 | 1.00 | 0° | 14.26 66.80 15.41 67.80 |  |
| D10 | Top | 11.00 | 65.79 | 1.00 | 90° | 11.00 65.79 12.00 67.40 |  |
| D12 | Top | 99.40 | 72.29 | 1.00 | 90° | 99.40 72.29 100.40 73.90 |  |
| D17 | Top | 108.65 | 13.57 | 1.00 | 90° | 108.65 13.57 109.65 15.18 |  |
| F1 | Top | 20.68 | 65.98 | 1.00 | 90° | 20.68 65.98 21.68 66.91 |  |
| F2 | Top | 23.38 | 15.32 | 1.00 | 0° | 23.38 15.32 24.54 16.32 |  |
| J1 | Top | 9.61 | 77.83 | 1.50 | 0° | 9.61 77.83 10.85 79.33 |  |
| J2 | Top | 8.41 | 0.84 | 1.50 | 0° | 8.41 0.84 10.01 2.34 |  |
| J3 | Top | 77.42 | 0.62 | 1.50 | 0° | 77.42 0.62 79.02 2.12 |  |
| J4 | Top | 35.00 | 77.83 | 1.50 | 0° | 35.00 77.83 36.64 79.33 |  |
| J5 | Top | 62.00 | 77.83 | 1.50 | 0° | 62.00 77.83 63.60 79.33 |  |
| J6 | Top | 94.82 | 2.12 | 1.50 | 0° | 94.82 2.12 96.38 3.62 |  |
| J7 | Top | 116.55 | 41.83 | 1.50 | 90° | 116.55 41.83 118.05 43.43 |  |
| J8 | Top | 90.18 | 75.45 | 1.50 | 0° | 90.18 75.45 91.78 76.95 |  |
| J20 | Top | 33.23 | 62.03 | 1.50 | 90° | 33.23 62.03 34.73 64.60 |  |
| J21 | Top | 7.08 | 31.92 | 1.50 | 0° | 7.08 31.92 9.30 33.42 |  |
| J22 | Top | 7.08 | 39.32 | 1.50 | 0° | 7.08 39.32 9.66 40.82 |  |
| K1 | Top | 73.39 | 34.15 | 1.00 | 0° | 73.39 34.15 74.34 35.15 |  |
| K2 | Top | 89.39 | 34.15 | 1.00 | 0° | 89.39 34.15 90.58 35.15 |  |
| LED1 | Top | 109.77 | 77.88 | 1.00 | 0° | 109.77 77.88 111.96 78.88 |  |
| LED5 | Top | 117.37 | 64.71 | 1.00 | 90° | 117.37 64.71 118.37 67.13 |  |
| LS1 | Top | 111.84 | 71.40 | 1.00 | 0° | 111.84 71.40 113.40 72.40 |  |
| Q2 | Top | 39.51 | 53.65 | 1.00 | 0° | 39.51 53.65 40.75 54.65 | devkit |
| Q3 | Top | 71.46 | 45.35 | 1.00 | 0° | 71.46 45.35 72.70 46.35 |  |
| Q4 | Top | 67.46 | 45.35 | 1.00 | 0° | 67.46 45.35 68.72 46.35 |  |
| Q5 | Top | 97.66 | 58.75 | 1.00 | 0° | 97.66 58.75 98.90 59.75 |  |
| Q6 | Top | 93.66 | 58.75 | 1.00 | 0° | 93.66 58.75 94.87 59.75 |  |
| Q7 | Top | 105.41 | 60.10 | 1.00 | 0° | 105.41 60.10 106.65 61.10 |  |
| Q8 | Top | 46.96 | 11.25 | 1.00 | 0° | 46.96 11.25 48.20 12.25 |  |
| Q9 | Top | 51.46 | 11.25 | 1.00 | 0° | 51.46 11.25 52.67 12.25 |  |
| R102 | Top | 26.31 | 55.51 | 1.00 | 0° | 26.31 55.51 28.57 56.51 | devkit |
| R103 | Top | 32.69 | 53.38 | 1.00 | 90° | 32.69 53.38 33.69 55.65 | devkit, far, ambig |
| R301 | Top | 18.09 | 68.09 | 1.00 | 0° | 18.09 68.09 20.35 69.09 |  |
| R302 | Top | 12.90 | 64.21 | 1.00 | 90° | 12.90 64.21 13.90 66.70 |  |
| R303 | Top | 49.41 | 39.61 | 1.00 | 0° | 49.41 39.61 51.90 40.61 | devkit |
| R331 | Top | 91.69 | 71.66 | 1.00 | 90° | 91.69 71.66 92.69 73.92 |  |
| R332 | Top | 92.73 | 69.80 | 1.00 | 0° | 92.73 69.80 95.23 70.80 |  |
| R333 | Top | 99.74 | 68.61 | 1.00 | 90° | 99.74 68.61 100.74 71.10 |  |
| R401 | Top | 66.26 | 48.39 | 1.00 | 0° | 66.26 48.39 68.55 49.39 |  |
| R402 | Top | 69.66 | 48.39 | 1.00 | 0° | 69.66 48.39 72.18 49.39 |  |
| R403 | Top | 77.76 | 44.49 | 1.00 | 0° | 77.76 44.49 80.28 45.49 |  |
| R404 | Top | 66.26 | 38.51 | 1.00 | 0° | 66.26 38.51 68.81 39.51 |  |
| R405 | Top | 70.69 | 37.03 | 1.00 | 90° | 70.69 37.03 71.69 39.55 |  |
| R406 | Top | 83.74 | 55.28 | 1.00 | 90° | 83.74 55.28 84.74 57.78 |  |
| R407 | Top | 89.46 | 57.89 | 1.00 | 0° | 89.46 57.89 91.98 58.89 |  |
| R408 | Top | 92.56 | 51.31 | 1.00 | 0° | 92.56 51.31 95.08 52.31 |  |
| R409 | Top | 97.76 | 51.31 | 1.00 | 0° | 97.76 51.31 100.25 52.31 |  |
| R412 | Top | 84.31 | 47.71 | 1.00 | 0° | 84.31 47.71 86.60 48.71 |  |
| R413 | Top | 87.21 | 47.71 | 1.00 | 0° | 87.21 47.71 89.50 48.71 |  |
| R414 | Top | 83.31 | 44.51 | 1.00 | 0° | 83.31 44.51 85.62 45.51 |  |
| R415 | Top | 89.16 | 44.51 | 1.00 | 0° | 89.16 44.51 91.45 45.51 |  |
| R417 | Top | 34.06 | 53.41 | 1.00 | 0° | 34.06 53.41 36.35 54.41 | devkit |
| R418 | Top | 7.71 | 67.06 | 1.00 | 90° | 7.71 67.06 8.71 69.35 |  |
| R421 | Top | 100.71 | 71.36 | 1.00 | 90° | 100.71 71.36 101.71 73.65 |  |
| R424 | Top | 100.99 | 54.43 | 1.00 | 90° | 100.99 54.43 101.99 56.98 |  |
| R425 | Top | 102.36 | 53.71 | 1.00 | 0° | 102.36 53.71 104.88 54.71 |  |
| R426 | Top | 117.29 | 61.16 | 1.00 | 90° | 117.29 61.16 118.29 63.66 |  |
| R501 | Top | 37.76 | 19.09 | 1.00 | 0° | 37.76 19.09 40.02 20.09 |  |
| R502 | Top | 42.26 | 19.09 | 1.00 | 0° | 42.26 19.09 44.76 20.09 |  |
| R503 | Top | 42.26 | 8.11 | 1.00 | 0° | 42.26 8.11 44.76 9.11 |  |
| R505 | Top | 98.34 | 20.26 | 1.00 | 90° | 98.34 20.26 99.34 22.76 |  |
| R506 | Top | 98.61 | 34.26 | 1.00 | 90° | 98.61 34.26 99.61 36.73 |  |
| R507 | Top | 107.12 | 20.26 | 1.00 | 90° | 107.12 20.26 108.12 22.76 |  |
| R508 | Top | 104.61 | 34.26 | 1.00 | 90° | 104.61 34.26 105.61 36.76 |  |
| U3 | Top | 52.38 | 45.25 | 1.00 | 0° | 52.38 45.25 53.56 46.25 | devkit |
| U4 | Top | 84.16 | 52.46 | 1.00 | 0° | 84.16 52.46 85.37 53.46 |  |
| U5 | Top | 40.66 | 12.97 | 1.00 | 0° | 40.66 12.97 41.84 13.97 |  |
| U6 | Top | 98.12 | 28.38 | 1.00 | 90° | 98.12 28.38 99.12 29.54 |  |
| U7 | Top | 109.75 | 28.38 | 1.00 | 90° | 109.75 28.38 110.75 29.56 |  |
| U11 | Top | 41.57 | 62.74 | 1.00 | 90° | 41.57 62.74 42.57 64.11 |  |
| U12 | Top | 72.37 | 62.74 | 1.00 | 90° | 72.37 62.74 73.37 64.35 |  |
| U15 | Top | 26.33 | 62.63 | 1.00 | 90° | 26.33 62.63 27.33 64.24 |  |
| U16 | Top | 9.42 | 55.83 | 1.00 | 0° | 9.42 55.83 11.00 56.83 | devkit |
| U17 | Top | 100.60 | 65.54 | 1.00 | 90° | 100.60 65.54 101.60 67.15 |  |
| «+5V» | Top | 21.71 | 74.95 | 1.20 | 0° | 21.71 74.95 24.12 76.15 |  |
| «+12V» | Top | 10.00 | 6.70 | 1.20 | 0° | 10.00 6.70 12.92 7.90 |  |
| «0V» | Top | 15.79 | 6.70 | 1.20 | 0° | 15.79 6.70 17.29 7.90 |  |
| «1 +5V» | Top | 110.75 | 44.32 | 1.20 | 0° | 110.75 44.32 114.36 45.52 |  |
| «1 A DROITE» | Top | 54.00 | 63.75 | 1.00 | 0° | 54.00 63.75 59.77 64.75 |  |
| «1» | Top | 63.40 | 59.90 | 1.00 | 0° | 63.40 59.90 63.70 60.90 |  |
| «1» | Top | 22.74 | 73.40 | 1.20 | 0° | 22.74 73.40 23.09 74.60 |  |
| «1» | Top | 55.75 | 73.40 | 1.20 | 0° | 55.75 73.40 56.10 74.60 |  |
| «1» | Top | 86.55 | 73.40 | 1.20 | 0° | 86.55 73.40 86.91 74.60 |  |
| «1» | Top | 11.28 | 8.20 | 1.20 | 0° | 11.28 8.20 11.64 9.40 |  |
| «1» | Top | 79.12 | 5.40 | 1.20 | 0° | 79.12 5.40 79.48 6.60 |  |
| «1» | Top | 96.51 | 5.40 | 1.20 | 0° | 96.51 5.40 96.87 6.60 |  |
| «2 -» | Top | 110.75 | 49.40 | 1.20 | 0° | 110.75 49.40 113.00 50.60 |  |
| «2» | Top | 18.79 | 73.40 | 1.20 | 0° | 18.79 73.40 19.43 74.60 |  |
| «2» | Top | 51.80 | 73.40 | 1.20 | 0° | 51.80 73.40 52.44 74.60 |  |
| «2» | Top | 82.60 | 73.40 | 1.20 | 0° | 82.60 73.40 83.24 74.60 |  |
| «2» | Top | 16.22 | 8.20 | 1.20 | 0° | 16.22 8.20 16.86 9.40 |  |
| «2» | Top | 82.79 | 5.40 | 1.20 | 0° | 82.79 5.40 83.43 6.60 |  |
| «2» | Top | 100.18 | 5.40 | 1.20 | 0° | 100.18 5.40 100.82 6.60 |  |
| «3 ARM» | Top | 110.75 | 54.48 | 1.20 | 0° | 110.75 54.48 114.58 55.68 |  |
| «3» | Top | 14.98 | 73.40 | 1.20 | 0° | 14.98 73.40 15.62 74.60 |  |
| «3» | Top | 47.99 | 73.40 | 1.20 | 0° | 47.99 73.40 48.63 74.60 |  |
| «3» | Top | 78.79 | 73.40 | 1.20 | 0° | 78.79 73.40 79.43 74.60 |  |
| «3» | Top | 103.99 | 5.40 | 1.20 | 0° | 103.99 5.40 104.63 6.60 |  |
| «3V3» | Top | 92.66 | 77.75 | 1.00 | 0° | 92.66 77.75 94.55 78.75 |  |
| «4» | Top | 11.15 | 73.40 | 1.20 | 0° | 11.15 73.40 11.82 74.60 |  |
| «4» | Top | 44.16 | 73.40 | 1.20 | 0° | 44.16 73.40 44.83 74.60 |  |
| «4» | Top | 74.97 | 73.40 | 1.20 | 0° | 74.97 73.40 75.64 74.60 |  |
| «5 A DROITE» | Top | 83.00 | 58.00 | 1.00 | 0° | 83.00 58.00 89.00 59.00 |  |
| «5» | Top | 40.37 | 73.40 | 1.20 | 0° | 40.37 73.40 41.01 74.60 |  |
| «5» | Top | 71.17 | 73.40 | 1.20 | 0° | 71.17 73.40 71.81 74.60 |  |
| «6» | Top | 36.57 | 73.40 | 1.20 | 0° | 36.57 73.40 37.18 74.60 |  |
| «6» | Top | 67.38 | 73.40 | 1.20 | 0° | 67.38 73.40 67.98 74.60 |  |
| «7» | Top | 63.55 | 73.40 | 1.20 | 0° | 63.55 73.40 64.19 74.60 |  |
| «12V» | Top | 95.69 | 3.90 | 1.20 | 0° | 95.69 3.90 97.69 5.10 |  |
| «22» | Top | 4.40 | 59.90 | 1.00 | 0° | 4.40 59.90 5.58 60.90 |  |
| «ARMEMENT» | Top | 116.75 | 44.49 | 1.20 | 90° | 116.75 44.49 117.95 50.78 |  |
| «BEBL CARTE PWM SECURISEE ESP32 V1.0 11/2026» | Top | 21.00 | 1.00 | 2.00 | 0° | 21.00 1.00 73.65 3.00 |  |
| «C311-C314» | Top | 54.00 | 65.05 | 1.00 | 0° | 54.00 65.05 59.25 66.05 |  |
| «C315-C318» | Top | 83.00 | 59.30 | 1.00 | 0° | 83.00 59.30 88.46 60.30 |  |
| «COM» | Top | 54.74 | 74.95 | 1.20 | 0° | 54.74 74.95 57.11 76.15 |  |
| «COM» | Top | 43.31 | 74.95 | 1.20 | 0° | 43.31 74.95 45.68 76.15 |  |
| «COM» | Top | 85.54 | 74.95 | 1.20 | 0° | 85.54 74.95 87.92 76.15 |  |
| «COM» | Top | 74.11 | 74.95 | 1.20 | 0° | 74.11 74.95 76.49 76.15 |  |
| «CONTACT NC» | Top | 97.48 | 2.27 | 1.20 | 0° | 97.48 2.27 105.34 3.47 |  |
| «DOMAINE PUISSANCE 12 V ISOLE (GND_P)» | Top | 22.00 | 23.60 | 1.00 | 0° | 22.00 23.60 43.76 24.60 |  |
| «ENTRAXE 22,86 (ESPRESSIF)» | Top | 10.67 | 39.47 | 1.20 | 0° | 10.67 39.47 28.70 40.67 |  |
| «ENTRAXE 25,40 (CARTES PLUS LARGES)» | Top | 10.67 | 32.07 | 1.20 | 0° | 10.67 32.07 36.21 33.27 |  |
| «ENTREE 12V» | Top | 11.07 | 0.99 | 1.20 | 0° | 11.07 0.99 18.41 2.19 |  |
| «ENTREE PWM» | Top | 12.27 | 77.98 | 1.20 | 0° | 12.27 77.98 20.07 79.18 |  |
| «ESP32-S3-DevKitC-1  (N8, N8R2, N16R8)» | Top | 12.00 | 47.60 | 1.20 | 0° | 12.00 47.60 38.08 48.80 |  |
| «EX1» | Top | 95.20 | 77.75 | 1.00 | 0° | 95.20 77.75 96.78 78.75 |  |
| «EX2» | Top | 97.74 | 77.75 | 1.00 | 0° | 97.74 77.75 99.55 78.75 |  |
| «FDC RENTRE  R1:1-3  R2:4-6» | Top | 37.66 | 77.98 | 1.20 | 0° | 37.66 77.98 56.45 79.18 |  |
| «FDC SORTI  S1:1-3  S2:4-6» | Top | 64.66 | 77.98 | 1.20 | 0° | 64.66 77.98 82.34 79.18 |  |
| «GND» | Top | 100.28 | 77.75 | 1.00 | 0° | 100.28 77.75 102.15 78.75 |  |
| «GND» | Top | 17.98 | 74.95 | 1.20 | 0° | 17.98 74.95 20.23 76.15 |  |
| «ISOLATION 3 mm : AUCUN CUIVRE» | Top | 3.00 | 28.50 | 1.00 | 0° | 3.00 28.50 20.77 29.50 |  |
| «J8 EXTENSION 3V3 MAX» | Top | 90.40 | 62.25 | 1.00 | 90° | 90.40 62.25 91.40 74.71 |  |
| «LIBRE» | Top | 62.24 | 74.95 | 1.20 | 0° | 62.24 74.95 65.50 76.15 |  |
| «LIBRE» | Top | 98.87 | 3.90 | 1.20 | 0° | 98.87 3.90 102.13 5.10 |  |
| «NC» | Top | 47.58 | 74.95 | 1.20 | 0° | 47.58 74.95 49.04 76.15 |  |
| «NC» | Top | 36.15 | 74.95 | 1.20 | 0° | 36.15 74.95 37.61 76.15 |  |
| «NC» | Top | 78.38 | 74.95 | 1.20 | 0° | 78.38 74.95 79.84 76.15 |  |
| «NC» | Top | 66.95 | 74.95 | 1.20 | 0° | 66.95 74.95 68.41 76.15 |  |
| «NO» | Top | 51.37 | 74.95 | 1.20 | 0° | 51.37 74.95 52.86 76.15 |  |
| «NO» | Top | 39.94 | 74.95 | 1.20 | 0° | 39.94 74.95 41.43 76.15 |  |
| «NO» | Top | 82.18 | 74.95 | 1.20 | 0° | 82.18 74.95 83.67 76.15 |  |
| «NO» | Top | 70.75 | 74.95 | 1.20 | 0° | 70.75 74.95 72.24 76.15 |  |
| «NOIR» | Top | 81.79 | 3.90 | 1.20 | 0° | 81.79 3.90 84.42 5.10 |  |
| «PONT 1-3 = ARME» | Top | 114.90 | 44.23 | 1.20 | 90° | 114.90 44.23 116.10 55.77 |  |
| «PWM» | Top | 14.06 | 74.95 | 1.20 | 0° | 14.06 74.95 16.53 76.15 |  |
| «R311-R314» | Top | 54.00 | 67.65 | 1.00 | 0° | 54.00 67.65 59.20 68.65 |  |
| «R315-R318» | Top | 83.00 | 61.90 | 1.00 | 0° | 83.00 61.90 88.41 62.90 |  |
| «R321-R324» | Top | 54.00 | 66.35 | 1.00 | 0° | 54.00 66.35 59.67 67.35 |  |
| «R325-R328» | Top | 83.00 | 60.60 | 1.00 | 0° | 83.00 60.60 88.88 61.60 |  |
| «RET» | Top | 103.22 | 3.90 | 1.20 | 0° | 103.22 3.90 105.40 5.10 |  |
| «ROUGE» | Top | 77.37 | 3.90 | 1.20 | 0° | 77.37 3.90 81.23 5.10 |  |
| «S/N :» | Top | 20.50 | 4.40 | 2.00 | 0° | 20.50 4.40 26.21 6.40 |  |
| «SINON PONT 1-3» | Top | 95.37 | 0.62 | 1.20 | 0° | 95.37 0.62 105.63 1.82 |  |
| «STAT» | Top | 9.95 | 74.95 | 1.20 | 0° | 9.95 74.95 13.02 76.15 |  |
| «TP1 5V» | Top | 18.14 | 56.55 | 1.00 | 0° | 18.14 56.55 21.69 57.55 |  |
| «TP2 3V3» | Top | 52.63 | 54.55 | 1.00 | 0° | 52.63 54.55 57.07 55.55 |  |
| «TP3 GND» | Top | 41.83 | 51.05 | 1.00 | 0° | 41.83 51.05 46.25 52.05 |  |
| «TP4 PWM» | Top | 42.83 | 44.05 | 1.00 | 0° | 42.83 44.05 47.46 45.05 |  |
| «TP5 12V» | Top | 62.33 | 21.05 | 1.00 | 0° | 62.33 21.05 66.54 22.05 |  |
| «TP6 GND_P» | Top | 65.21 | 7.05 | 1.00 | 0° | 65.21 7.05 71.02 8.05 |  |
| «USB» | Top | 1.00 | 44.00 | 1.20 | 90° | 1.00 44.00 2.20 46.16 |  |
| «VERIN» | Top | 80.08 | 0.77 | 1.20 | 0° | 80.08 0.77 83.47 1.97 |  |
