# Points ouverts

Un point clos reste listé avec sa résolution. **Criticité :** B = bloque la commande, C = à traiter à la commande, M = à traiter avant mise en service.

## Ouverts

| N° | Ouvert le | Point | Criticité | Défaut appliqué | Responsable |
|---|---|---|---|---|---|
| PO-01 | 2026-11-14 | **Écart entre les deux rangées de broches de la carte de dev.** Plan Espressif `DXF_ESP32-S3-DevKitC-1_V1.1_20220429.pdf` fourni par Julien et lu le 2026-11-14 : largeur de carte 25,40 mm, rangées à 1,27 mm de chaque bord, donc **entraxe officiel 22,86 mm** (J20 + J22). Longueur du circuit 62,74 mm hors antenne ; bord côté USB à 8,00 mm de l'axe des broches 22 ; deux ports micro-USB de ce côté. L'hypothèse de 25,40 mm (ESP32 PO-21) confondait largeur et entraxe. Reste ouvert pour une carte achetée chez un revendeur tiers (clones plus larges). | M | Les deux entraxes sont câblés (DEC-006) | Julien : mesurer la carte reçue |
| PO-03 | 2026-11-14 | Diode de la carte de dev entre l'USB et la broche 5V (ancien ESP32 PO-18) : test au multimètre à réception (`ALIMENTATION.md` §1). | M | U16 bloque le sens USB → carte | Julien |
| PO-04 | 2026-11-14 | Courant minimal des fins de course (STM32 PO-23, jamais clos). | M | Rappels 1 kΩ au +3V3 (3,3 mA) | Julien |
| PO-07 | 2026-11-14 | Sens du vérin : « fil rouge au + = sortie de tige » repris de la carte STM32, non revérifié sur la datasheet Actuonix. | M | J3.1 = rouge | Julien : essai à vide avant montage |
| PO-08 | 2026-11-14 | Datasheets non relues : SRV05-4, WS2812B, AO3400A, 74AHCT1G125, 74LVC1G17, BAT54S. Relues le 2026-11-14 : STWD100, MLT-8530, LTV-357T, G6K-2F-Y, LM74502, LM66100, ESP32-S3 (`REVUE_FINALE.md`). | M | Brochages conformes aux noms de broches des symboles LCSC | Claude ou Julien |
| PO-09 | 2026-11-14 | Polarité de D1 (SMAJ5.0A) : broche 1 = cathode par convention de la bibliothèque (DEC-014), non vue sur un dessin. ESD5Z5V0 et SMAJ15A : vues sur le dessin du symbole. | C | — | Julien : aperçu de placement JLCPCB (`LIVRAISON.md` §4) |
| PO-10 | 2026-11-14 | Stock du watchdog STWD100YNXWY3F (C1354132) : 179 pièces le 2026-11-14 (deux relevés). | C | En rupture : C46043 (même empreinte, délai 1,6 s) | Julien (commande) |
| PO-11 | 2026-11-14 | Brochage de J1, J4, J5, J8 absent de la sérigraphie (pas de place entre borniers et composants). | M | Tableau de câblage : `LIVRAISON.md` §3 | — |
| PO-12 | 2026-11-14 | Le firmware de l'ancien dépôt ESP32 vise le brochage v3 et un watchdog à fenêtre. À adapter : brochage v4 (`LIVRAISON.md` §8), front sur `WDT_KICK` au moins toutes les 50 ms. | M | — | Claude (hors périmètre de cette livraison) |
| PO-13 | 2026-11-14 | Repères de sérigraphie serrés dans la zone des fins de course ; non repositionnés. | M | — | Julien, s'il le souhaite |
| PO-14 | 2026-11-14 | Fiches à vis des borniers J1 à J7 : codes et compatibilité Kangnex à confirmer (repris de STM32 PO-41). | M | — | Julien |
| PO-15 | 2026-11-14 | Options de commande JLCPCB de `LIVRAISON.md` §5 non relues sur le site le jour même. | C | — | Julien, à la commande |

## Clos

| N° | Clos le | Point | Résolution |
|---|---|---|---|
| PO-02 | 2026-11-14 | Questions de phase 0 | Réponses de Julien : DEC-005 |
| PO-05 | 2026-11-14 | Pose des barrettes femelles par JLCPCB | C7499337 en stock (11 380), montage traversant manuel par JLCPCB (« manualWeld » sur la fiche). DEC-006 |
| PO-06 | 2026-11-14 | Push refusé (403) : compte `Jujuxw9` en lecture seule sur le dépôt | Droit d'écriture accordé par Julien en fin de session ; tous les commits sont poussés sur `origin/main` |
