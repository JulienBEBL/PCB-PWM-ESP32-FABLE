# Points ouverts

Un point clos reste listé avec sa résolution. **Criticité :** B = bloque la commande, C = conditionne le schéma ou le PCB, M = à traiter avant mise en service.

## Ouverts

| N° | Ouvert le | Point | Criticité | Défaut appliqué | Responsable |
|---|---|---|---|---|---|
| PO-01 | 2026-11-14 | **Écart entre les deux rangées de broches de la carte de dev.** Plan Espressif `DXF_ESP32-S3-DevKitC-1_V1.1_20220429.pdf` fourni par Julien et lu le 2026-11-14 : largeur de carte 25,40 mm, rangées à 1,27 mm de chaque bord, donc **entraxe officiel 22,86 mm** (J20 + J22). Longueur du circuit 62,74 mm hors antenne ; bord côté USB à 8,00 mm de l'axe des broches 22 ; deux ports micro-USB de ce côté. L'hypothèse de 25,40 mm (ESP32 PO-21) confondait largeur et entraxe. Reste ouvert pour une carte achetée chez un revendeur tiers (clones plus larges). | M | Les deux entraxes sont câblés (DEC-006) | Julien : mesurer la carte reçue |
| PO-03 | 2026-11-14 | Diode de la carte de dev entre l'USB et la broche 5V (ancien ESP32 PO-18) : test au multimètre à réception (`ALIMENTATION.md` §1). | M | U16 bloque le sens USB → carte | Julien |
| PO-04 | 2026-11-14 | Courant minimal des fins de course (STM32 PO-23, jamais clos). | M | Rappels 1 kΩ au +3V3 (3,3 mA) | Julien |
| PO-06 | 2026-11-14 | **Push refusé (403).** Le poste est connecté à GitHub avec le compte `Jujuxw9`, en lecture seule sur `JulienBEBL/PCB-PWM-ESP32-FABLE`. Les commits restent locaux. | C | Commits locaux à chaque phase | Julien (droit d'écriture pour `Jujuxw9`, ou connexion de `gh` au compte `JulienBEBL`) |
| PO-07 | 2026-11-14 | Sens du vérin : « fil rouge au + = sortie de tige » repris de la carte STM32, non revérifié sur la datasheet Actuonix. | M | J3.1 = rouge | Julien : essai à vide avant montage |
| PO-08 | 2026-11-14 | Datasheets à relire en phase 8 : LTV-357T (brochage, isolement, CTR), LM74502, LM66100, G6K-2F-Y, SRV05-4, WS2812B, ESP32-S3 (états au reset). Les brochages sont déjà conformes aux noms de broches des symboles LCSC. | C | — | Claude |
| PO-09 | 2026-11-14 | Polarité de D1 (SMAJ5.0A) et des ESD5Z5V0 : broche 1 = cathode supposé (DEC-014). À confirmer sur le marquage des empreintes. | C | — | Claude (phase 8) |
| PO-10 | 2026-11-14 | Stock du watchdog STWD100YNXWY3F : 179 pièces. À revérifier avant commande ; sinon C46043 (même empreinte). | C | — | Claude (phase 8), Julien (commande) |

## Clos

| N° | Clos le | Point | Résolution |
|---|---|---|---|
| PO-02 | 2026-11-14 | Questions de phase 0 | Réponses de Julien : DEC-005 |
| PO-05 | 2026-11-14 | Pose des barrettes femelles par JLCPCB | C7499337 en stock (11 380), montage traversant manuel par JLCPCB (« manualWeld » sur la fiche). DEC-006 |
