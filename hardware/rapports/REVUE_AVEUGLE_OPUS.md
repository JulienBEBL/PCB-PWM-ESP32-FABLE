# Revue de conception à l'aveugle : FABLE52_PCB_ESP32

## 1. Projet relu et méthode

| Élément | Valeur |
|---|---|
| Projet | FABLE52_PCB_ESP32 (`JulienBEBL/FABLE52_PCB_ESP32`) |
| UUID projet | `836928ac4399433ab9cd56636d997eda` |
| Carte / schéma | Board1 / Schematic1 (`97d11f9e3f37cffe`), 10 pages, cartouche V1.0 |
| Date de la revue | 2026-11-15 |
| Outil | EasyEDA Pro V3.2.209, pont local port 49620, appels en lecture seule |

**Méthode d'extraction**
- `sch_Netlist.getNetlist()` ne répond pas (arrêté après 25 s). La netlist a donc été reconstruite.
- Pour chaque page : `sch_PrimitiveComponent.getAll` et `getAllPins` (repère, MPN, code LCSC, empreinte, coordonnées des broches), `sch_PrimitiveWire.getAll` (segments et nom de net), puis `sch_PrimitiveText.getAll`.
- Une broche appartient à un net si ses coordonnées tombent sur un segment de fil. Les nets de même nom sont fusionnés d'une page à l'autre.
- Résultat : 136 composants et 78 nets. Aucune broche flottante, aucun net à une seule broche, aucune broche reliée à deux nets.
- Scripts : `eda.js`, `extract_page.tpl`, `run_extract.js`, `build_netlist.js`. Données : `raw_sch.json`, `schema_extrait.json`.
- Le PCB a été lu après la rédaction des sections 2 à 5 (étape 1).

Conventions : **[C]** = constaté sur le schéma ou le PCB. **[D]** = datasheet (référence citée). **[H]** = hypothèse. Une valeur **[D\*]** vient de la datasheet citée mais n'a pas été relue en ligne pendant cette revue : elle est à reconfirmer.

## 2. Fonction retrouvée

Carte porteuse pour une ESP32-S3-DevKitC-1 enfichée (J20/J21/J22). Elle commande un vérin 12 V à courant continu par deux relais DPDT 5 V (K1, K2) montés en pont en H [C].
- **Entrées** : 5 V + PWM du contrôleur (J1) ; 4 fins de course inverseurs, NO et NC lus (J4, J5) ; 5e contact d'arrêt matériel (J6) ; 2 entrées d'extension (J8) ; 12 V puissance (J2).
- **Sorties** : vérin (J3), STATUS à drain ouvert (J1.4), LED RGB WS2812, buzzer passif, LED témoin 3,3 V.
- **Deux domaines** : logique (GND, +5V, +3V3) et puissance (GND_P, +12V_P). Seuls K1, K2, U6 et U7 franchissent la barrière [C, vérifié par script].
- **Table de vérité du vérin** [C pour les nets, H pour le brochage G6K : COM = 3/6, NC = 2/7, NO = 4/5] :

| K1 | K2 | VERIN_A (J3.1) | VERIN_B (J3.2) | Effet |
|---|---|---|---|---|
| repos | repos | GND_P | +12V_P | mouvement « B→A » : position sûre selon la note du schéma (rentrée [H]) |
| collé | repos | NO_FEED (12 V via J6) | +12V_P | arrêt, moteur freiné |
| repos | collé | GND_P | GND_P | arrêt, moteur freiné |
| collé | collé | NO_FEED (12 V via J6) | GND_P | mouvement inverse (sortie [H]), seulement si J6 est fermé |

- **Verrous** : K1 ne colle qu'avec K1_CMD haut ET CP_DRV qui oscille (pompe de charge vers Q3). K2 ne colle qu'avec le cavalier J7, K2_CMD haut ET le watchdog U4 entretenu.

```
J2 12V ─F2─TVS─U5/Q8/Q9(inv.+OV)─ +12V_P ─┬─ K2(NC) ──► J3.2 VERIN_B
                                          └─ J6 (5e contact) ─ NO_FEED ─ K1(NO) ─► J3.1 VERIN_A
J1 5V ─F1─TVS─U15 ideal diode─ +5V ─┬─ bobines K1/K2, WS2812 (U17)
                                    └─ U16 ─ +5V_ESP ─► DevKit 5V ─► LDO DevKit ─► +3V3
J1.3 PWM ─ESD─RC─U3 Schmitt─► GPIO1           J4/J5 fins de course ─ESD─RC─► 8 GPIO
CP_DRV(GPIO42)─pompe─Q3 ┐                     K2_CMD(GPIO47)─Q6 ┐
K1_CMD(GPIO21)─────Q4 ┴► bobine K1            WDT(GPIO14)─U4─Q5 ┴► bobine K2 (via J7)
U6/U7 optos ─► V12_OK (GPIO39), STOP_HW_FB (GPIO7) ; relectures K1_FB, K2_FB, ARM_FB, V5_MON
```

## 3. Erreurs (schéma)

| N° | Gravité | Bloc | Repères / nets | Constat | Preuve | Correction proposée |
|---|---|---|---|---|---|---|
| S1 | MAJEUR | Alim 5 V | D1, U15, U16, +5V_F | [C] Le TVS SMAJ5.0A protège U15/U16 (LM66100). Sa tension d'écrêtage dépasse la tenue des LM66100. | [D\*] SMAJ5.0A (Littelfuse SMAJ) : VBR min 6,4 V, VC 9,2 V à IPP. [D] LM66100 (TI SLVSEZ8A) : VIN max absolu 6 V, utilisation 1,5 à 5,5 V. Toute surtension qui fait conduire D1 détruit U15. | Utiliser un TVS dont VC est inférieure à 6 V (ex. ESD/TVS 5 V à faible VC), ou ajouter un limiteur de surtension avant U15. |
| S2 | MAJEUR, ramené à MINEUR après lecture du PCB | Relais K2 | Q6, K2_CMD (GPIO47) | [C] K2_CMD est sur GPIO47. La note de la page 02 dit « toutes variantes de module acceptées ». La sérigraphie du PCB limite à N8, N8R2, N16R8. | [D] Datasheet ESP32-S3 : sur les modules à VDD_SPI 1,8 V (R8V, R16V), GPIO47/48 fonctionnent en 1,8 V. [D] AO3400A (AOS) : VGS(th) jusqu'à 1,45 V, RDS(on) garanti seulement à partir de 2,5 V. Avec VGS = 1,8 V, la commande de Q6 n'est pas garantie. Les variantes N8, N8R2 et N16R8 sont en 3,3 V. | Corriger la note du schéma, ou déplacer K2_CMD sur un GPIO 3,3 V libre (ex. GPIO38). |
| S3 | MAJEUR | Sûreté vérin | J6, NO_FEED, K1, K2 | [C] Le 5e contact (J6) n'alimente que NO_FEED, donc VERIN_A quand K1 est collé. Au repos, le vérin est alimenté (A = GND_P, B = +12V_P) sans passer par J6 ni par les fins de course. | Table de vérité §2 : l'arrêt matériel ne peut pas arrêter le mouvement vers la position sûre. Seule la coupure du 12 V l'arrête. | Si J6 doit être un vrai arrêt : le mettre en série avec +12V_P en amont des deux relais. Sinon, documenter qu'il ne coupe que le sens « sortie ». |
| S4 | MAJEUR [H] | Puissance | K1, K2 contacts, F2 | [C] Les contacts G6K commutent directement le moteur du vérin. | [D] G6K-2F : 1 A sous 30 V cc, charge résistive ; courant permanent 1 A. [D] BSMD1206-050-30V : Ihold 0,5 A, Itrip 1 A, déclenchement en 0,1 s à 8 A. Le courant d'appel ou de blocage d'un moteur peut dépasser 1 A pendant des dizaines de ms avant que F2 ne déclenche, d'où un risque de collage des contacts. | Vérifier le courant d'appel du vérin. S'il dépasse 1 A, prendre des relais de puissance ou un pont en H à MOSFET. |
| S5 | MINEUR | 12 V | R502, R503, U5 | [C] La note du schéma annonce une coupure à 13,2 V. Le calcul donne 15,0 V. | [D] LM74502 (SNOSDE5A) : VOVR = 1,25 V typ. (1,165 à 1,333 V). Coupure = 1,25 × (110 k + 10 k) / 10 k = 15,0 V (14,0 à 16,0 V). Réarmement = 1,143 × 12 = 13,7 V. | Mettre la note à jour. Pour 13,2 V : R502 = 95,3 kΩ (1,25 × 105,3 / 10 = 13,2 V). |
| S6 | MINEUR [H] | Watchdog K2 | U4 STWD100YNXWY3F | [C] La sortie WDO commande directement la grille de Q5, sans mémorisation. | [D] STWD100 (ST DocID14134) : version xX, tWD = 71 / 102 / 142 ms, donc l'entretien toutes les 50 ms convient. [H] Si WDO se relâche périodiquement après un défaut, K2 peut recoller par intermittence tant que K2_CMD reste haut. | Vérifier le chronogramme WDO dans la datasheet. Si WDO est impulsionnel, ajouter une bascule de mémorisation. |
| S7 | MINEUR [H] | Pompe de charge | CP_DRV GPIO42 | [C] La pompe prouve seulement que GPIO42 oscille. | [H] Si CP_DRV vient d'un périphérique matériel (LEDC/RMT), il continue d'osciller même quand le CPU est planté. Le verrou ne prouve alors pas que le firmware tourne. | Exiger dans le firmware que CP_DRV et WDT_KICK soient basculés par la boucle principale. |
| S8 | MINEUR | Buzzer | LS1, Q7, +3V3 | [C] Le buzzer magnétique est alimenté par le +3V3 de la DevKit (LDO), sans résistance série. | [D] Fiche JLCPCB C94599 (MLT-8530) : 3,6 V, 95 mA. Ces 95 mA, hachés à 2,7 kHz, passent sur le rail qui alimente l'ESP32. Si BUZZER reste haut, le courant continu n'est limité que par la bobine [H]. | Alimenter LS1 depuis le +5V avec une résistance série, ou ajouter une résistance série sur le +3V3. |
| S9 | MINEUR | Fins de course | U11, U12, R311 à R318 | [C] Les diodes de SRV05-4 vont au +3V3. J4/J5 sont au même pas (3,81 mm) que J3 et J6, mais avec un nombre de broches différent (6 et 7 contre 2 et 3). | [H] Si un fil de 12 V est raccordé par erreur sur J4 ou J5, le courant entre dans le +3V3 par les diodes de U11/U12 sans limitation. Le rail et l'ESP32 sont détruits. | Ajouter une résistance série en amont des TVS (ex. déplacer R321 à R328 côté connecteur), ou accepter le risque de câblage. |
| S10 | MINEUR | Extension | R331, J8.1 | [C] J8.1 (+3V3_EXT) est relié au +3V3 par un 0 Ω. | Un court-circuit sur J8.1 met le rail de l'ESP32 en court-circuit (brown-out). | Remplacer R331 par un PTC ou une résistance de 10 à 47 Ω. |
| S11 | MINEUR | Strapping | V5_MON, GPIO3 | [C] GPIO3 (broche de strapping JTAG) reçoit 2,5 V au démarrage. | [D] Datasheet ESP32-S3 : GPIO3 n'est lu que si l'eFuse STRAP_JTAG_SEL est programmé. | Aucun impact par défaut. À noter pour la programmation des eFuses. |
| S12 | MINEUR | 5 V | F1 | [C] Un PTC de 0,5 A (hold) alimente toute la logique. | [D] BSMD1206-050-30V : Ihold 0,5 A à 25 °C. Pointes estimées [H] : ESP32-S3 Wi-Fi ≈ 350 mA + relais 2 × 21,1 mA ([D] G6K 5 V : 237 Ω) + WS2812 ≈ 60 mA + buzzer 95 mA ≈ 550 mA. Le maintien du PTC baisse quand la température monte. | Passer F1 à 0,75 ou 1 A de maintien, ou vérifier la consommation réelle. |

**Points vérifiés et conformes** [C + D]
- **LM66100** : CE# relié à VOUT, donc mode diode idéale avec blocage du courant inverse ([D] TI SLVSEZ8A).
- **LM74502 + Q8/Q9** : MOSFET dos à dos en source commune, donc blocage dans les deux sens. D8 (BZT52C10, cathode sur la grille) limite VGS : la pompe donne 12,4 V typ., au-delà du ±12 V max de l'AO3400A. VCAP est relié à VS.
- **Bobines** : 21,1 mA. Diodes de roue libre D4/D5 dans le bon sens (cathode côté +5V). Q3/Q4 et Q5/Q6 en série, avec rappels 4,7 kΩ.
- **Pompe de charge** : CP_OUT ≈ 3,3 − 2 × 0,25 ≈ 2,8 V, au-dessus du VGS(th) max de 1,45 V. Décharge : τ = 100 kΩ × 100 nF = 10 ms, soit VGS < 0,65 V en ≈ 15 ms [calcul : 10 ms × ln(2,8 / 0,65)].
- **Optocoupleurs** : IF = (12 − 1,2) / 4,7 k = 2,3 mA. Il faut IC = 3,3 / 10 k = 0,33 mA, donc un CTR ≥ 14 %. [D] LTV-357T-C : CTR 200 à 400 % à 5 mA ; isolement 3 750 Vrms.
- **PWM** : entrée de U3 tolérante au 5 V ([D] SN74LVC1G17 : VI jusqu'à 5,5 V). Filtre τ = 1 kΩ × 1 nF = 1 µs. Rappel à la masse de 100 kΩ.
- **ARM_FB** = 5 × 15 / 25 = 3,0 V. **V5_MON** = 2,5 V. Fins de course : 3,3 mA par contact fermé, filtre τ = 1 kΩ × 10 nF = 10 µs.
- **WS2812** : WS2812 alimentée en 5 V, attaquée par l'AHCT1G125 (VIH = 2 V). Brochage 1 VDD, 2 DOUT, 3 VSS, 4 DIN.
- **Broches de la DevKit** (d'après le guide utilisateur Espressif) : les broches de strapping GPIO0/45/46 et GPIO19/20 (USB), 35 à 37 et 43/44 ne sont pas utilisées.
- **Défaillances simples** : aucun relais seul et aucun transistor seul en court-circuit ne fait sortir le vérin, car il faut K1 ET K2. Il n'existe aucun état où le 12 V est court-circuité à GND_P.

## 4. Optimisations (sans nouvelle fonction)

- **J21/J22** : deux barrettes femelles de 22 broches en double. N'en monter qu'une, selon la DevKit utilisée (marquage DNP ou deux variantes de BOM). Gain : 1 connecteur et 22 soudures.
- **R501 0 Ω** (EN de U5) peut être remplacé par une piste. **R331 0 Ω** doit plutôt devenir une protection (S10).
- **Valeurs** : réduire le nombre de références. Exemple : R426 680 Ω → 1 kΩ (1,4 mA, assez pour un témoin) ; R413 15 kΩ → une valeur déjà présente, en recalculant ARM_FB (avec 10 k / 10 k : 2,5 V).
- **Fiabilité** : doubler les vias de puissance (P3) et ajouter un 100 nF près de U11 et U12 (P5).

## 5. Limites de la carte

| Grandeur | Limite | Origine |
|---|---|---|
| Entrée 5 V (J1) | 4,0 à 5,5 V | Bas : collage relais à 80 % de 5 V = 4,0 V ([D] G6K), plus la chute dans F1/U15. Haut : LM66100, 5,5 V en utilisation et 6 V en absolu ([D] SLVSEZ8A). D1 ne protège pas au-delà (S1). |
| Courant 5 V | ≤ 0,5 A à 25 °C, moins à chaud | [D] F1 Ihold 0,5 A |
| Entrée 12 V (J2) | Coupure au-delà de 15,0 V (14,0 à 16,0 V), réarmement à 13,7 V. Inversion de polarité bloquée par Q8/Q9. | [D] LM74502, calcul S5 |
| Courant vérin | ≤ 0,5 A permanent (F2), ≤ 1 A commuté par contact | [D] F2 et G6K |
| Surtension 12 V | Écrêtage SMAJ15A (VC ≈ 24 V [D\*]), en dessous des 30 V de l'AO3400A ([D] AOS) | |
| Entrée PWM | 0 à 5,5 V, logique 3,3 ou 5 V | [D] SN74LVC1G17 |
| Fins de course | Contacts secs vers COM (GND) uniquement, 3,3 mA par contact fermé | [C] |
| J8 | 0 à 3,3 V | Note du schéma et sérigraphie |
| STATUS (J1.4) | Drain ouvert, tirage ≤ 5 V (D10 ESD5Z5V0, 5 V de tension de service) | [C] |
| Température | Limitée par les PTC (le maintien baisse à chaud) et par le relais | [D\*] G6K −40 à +85 °C |

Conditions qui mettent la carte en défaut :
- 12 V au-delà de 14 à 16 V, par exemple une batterie en charge : le vérin est coupé.
- Vérin dont l'appel de courant dépasse 1 A.
- 5 V au-delà de 6 V.
- Courant 5 V au-delà de 0,5 A en permanence.
- Alimentation par l'USB seul : relais et WS2812 non alimentés, car U16 bloque le retour (comportement voulu).

## 6. Constats sur le PCB

Données lues [C] :
- 4 couches : Top (signaux), Inner1 (GND / GND_P), Inner2 (+3V3 / +12V_P), Bottom (GND / GND_P).
- Carte de 120 × 80 mm, 4 trous de 3,2 mm non reliés.
- 868 segments de piste, 170 vias de 0,6/0,3 mm, tous les composants sur la face Top.
- Zone puissance : y = 0 à 27,5 mm. Zone logique : y = 30,5 à 80 mm. Écart de 3 mm entre les deux.
- **DRC** (`pcb_Drc.check` strict, sans interface, règle « 自定义配置1 ») : **0 erreur**.
- **Cohérence schéma / PCB** : 136/136 composants, aucune différence de net broche par broche (script `pcb_an.js`).

| N° | Gravité | Bloc | Repères / nets | Constat | Preuve | Correction proposée |
|---|---|---|---|---|---|---|
| P1 | MINEUR | Isolation | K1.8, K2.8, K1_COIL_N, K2_COIL_N | [C] La sérigraphie indique « ISOLATION 3 mm : AUCUN CUIVRE ». Les pistes de bobine (domaine logique) traversent la bande de 3 mm et longent la zone puissance (y = 25,49 mm). | Écart mini mesuré piste-piste : 2,64 mm (K2_COIL_N / +12V_P). Écart entre pastilles K2.7 et K2.8 : 3,2 − 1,0 = 2,2 mm, imposé par le relais. Cela suffit pour du 12 V fonctionnel, mais c'est moins que les 3 mm annoncés. | Corriger la sérigraphie (« isolation fonctionnelle ≥ 2,2 mm »). |
| P2 | MINEUR [H] | Radio ESP32 | Contour DevKit x = 0,3 à 62,7 mm | [C] L'antenne du module (côté broche 1 de J20, x ≈ 55 à 63 mm) est au-dessus des plans GND et +3V3 pleine largeur, avec C105, U3, C302 et TP2 dessous. | Le guide matériel Espressif ESP32-S3 demande de ne pas placer de cuivre sous l'antenne. Portée Wi-Fi/BLE dégradée si la radio est utilisée. | Zone sans cuivre sur toutes les couches sous l'antenne, ou DevKit qui dépasse du bord. |
| P3 | MINEUR | Puissance | Vias +12V_P (1), VERIN_A (2), VERIN_B (2), +12V_F (2) | [C] Vias de 0,3 mm de perçage sur le trajet moteur, un seul via sur +12V_P. | [H] Environ 0,7 A par via à 10 °C (IPC-2221, cuivre de via estimé à 18 µm). Insuffisant pour 1 A. | ≥ 3 vias par changement de couche sur les nets de puissance. |
| P4 | MINEUR | Pistes | LM_SRC, +12V_F (0,41 mm) | [C] Piste la plus étroite du trajet 12 V : 15,95 mil. Les autres : 23 à 31,5 mil. | IPC-2221 externe, 1 oz [H], ΔT = 10 °C : I = 0,048 × 10^0,44 × (15,95 × 1,378)^0,725 = 1,25 A, supérieur au déclenchement de F2 (1 A). +5V à 12,4 mil : 1,04 A, supérieur à 0,5 A. | Aucune obligatoire. Élargir à ≥ 0,6 mm si F2 est augmenté. |
| P5 | MINEUR | Découplage | U11, U12 (VDD) | [C] Pas de condensateur local sur VDD des SRV05-4. Le plus proche (C105) est à environ 15 mm. Les autres découplages sont à 3 à 5 mm (U3/C302, U4/C404, U17/C420, U5/C502). | Pratique usuelle : ≤ 2 à 3 mm. | 100 nF au plus près de U11 et U12. |
| P6 | MINEUR | Cohérence | TP1 à TP6 | [C] Six pastilles de test (5V, 3V3, GND, PWM_IN, 12V, GND_P) existent sur le PCB sans symbole au schéma. TP1 à TP4 sont sous la DevKit (y = 36,4 à 61,8 mm). | Pastilles libres avec net (`pcb_PrimitivePad`). Inaccessibles quand la DevKit est en place. | Ajouter les TP au schéma et déplacer TP1 à TP4 hors du contour de la DevKit. |
| P7 | MINEUR | Mécanique | J21, J22 | [C] Deux barrettes femelles à 2,54 mm d'entraxe. | Les corps de 2,5 mm se touchent : montage possible mais serré. | N'en monter qu'une (§4). |

Points vérifiés et conformes [C] :
- Les relais et les optos chevauchent la bande isolante. Aucune piste ni aucun via de puissance n'est en zone logique. Les seules pistes logiques en zone puissance sont celles des bobines (P1).
- Connecteurs de puissance (J2, J3, J6) au bord y = 0 ; connecteurs logiques (J1, J4, J5, J8) au bord y = 80. Le brochage est sérigraphié.
- USB de la DevKit au bord x = 0.
- Empreintes cohérentes avec le schéma :
  - J20 broche 1 = 3V3 et J21 broche 1 = GND, du même côté (conforme au guide DevKitC-1).
  - LED1 : 1 VDD, 4 DIN. LED5 : 1 = cathode.
  - D2, D17, D4, D5, D6 : pastille 1 = cathode.
  - U5 : broche 1 au coin attendu.
  - Relais : pas de 2,2 et 3,2 mm, rangées à 7,02 mm (cohérent avec l'entraxe bobine-contact de 3,2 mm de la G6K-2F).
- Plans : retour logique continu sur Inner1 GND ; retour moteur sur GND_P (Inner1 + Bottom) et +12V_P (Inner2). Pas de coupure de plan sous les signaux logiques relevée.
- Boucle de bobine : D4 et D5 à moins de 4 mm des relais.
- Thermique négligeable : Q8/Q9 à 1 A : 1² × 0,024 Ω = 24 mW (RDS(on) typ. à 2,5 V, [D] AOS).

## 7. Utilisation de la carte (déduite de la conception)

**Connecteurs** (sérigraphie [C])

| Repère | Broches |
|---|---|
| J1 (3,81 mm) | 1 +5V, 2 GND, 3 PWM, 4 STATUS (drain ouvert) |
| J2 (5,08 mm) | 1 +12V, 2 0V (GND_P) |
| J3 (3,81 mm) | 1 vérin fil ROUGE (VERIN_A), 2 NOIR (VERIN_B) |
| J4 (3,81 mm) | Fin de course RENTRÉ. R1 : 1 COM, 2 NO, 3 NC. R2 : 4 COM, 5 NO, 6 NC |
| J5 (3,81 mm) | Fin de course SORTI. S1 : 1 à 3, S2 : 4 à 6, 7 libre |
| J6 (3,81 mm) | 5e contact NC entre 1 (12V) et 3 (RET), 2 libre. Ponter 1-3 en l'absence de contact |
| J7 (5,08 mm) | Armement : pont 1-3 = armé |
| J8 (2,54 mm) | 3V3, EX1 (analogique, GPIO4), EX2 (GPIO18), GND. 3,3 V au maximum |
| DevKit | ESP32-S3-DevKitC-1 N8, N8R2 ou N16R8. Sur J20 + J22 (entraxe Espressif 22,86 mm) ou J20 + J21 (25,40 mm). Broche 1 côté antenne, USB vers le bord |

**Mise en service**
1. Sans DevKit ni 12 V : appliquer 5 V sur J1. Contrôler TP1 = 5 V.
2. Enficher la DevKit. Vérifier que LED5 (rouge, +3V3) s'allume.
3. Charger le firmware. Il doit :
   - générer CP_DRV à 10 kHz (GPIO42) ;
   - entretenir WDT_KICK (GPIO14) à moins de 50 ms ;
   - commander K1_CMD (GPIO21) et K2_CMD (GPIO47) ;
   - lire K1_FB (GPIO40), K2_FB (GPIO12), ARM_FB (GPIO41), V12_OK (GPIO39), STOP_HW_FB (GPIO7), V5_MON (GPIO3), PWM_IN (GPIO1) et les 8 fins de course.
4. Raccorder les fins de course, puis J6 (ou un pont), puis le vérin.
5. Appliquer le 12 V : **le vérin part tout de suite vers sa position de repos (rentrée [H])**, même sans firmware et sans armement.
6. Poser le pont J7 pour autoriser l'autre sens.

**Voyants**
- LED5 rouge = +3V3 présent.
- LED RGB et buzzer : signification fixée par le firmware, non déductible du matériel.

**Ce qu'il ne faut pas faire**
- Mettre le 12 V avec le vérin dans une zone de pincement : il bouge sans commande.
- Dépasser 5,5 V sur J1 ou 15 V sur J2.
- Câbler une tension sur J4, J5 ou J8.
- Tirer STATUS au-delà de 5 V.
- Compter sur J6 pour arrêter la rentrée.
- Utiliser une DevKit à VDD_SPI 1,8 V (R8V, R16V).

## 8. Points non vérifiables / informations manquantes

1. **Brochage interne G6K-2F (critique)** : COM / NC / NO et polarité de bobine. Le dessin Omron « Terminal Arrangement / Internal Connections » n'a pas pu être lu sous forme de texte. Toute l'analyse de l'état sûr suppose COM = 3/6, NC = 2/7, NO = 4/5, bobine + sur la broche 1. Si NC et NO sont inversés, le vérin sort au repos.
2. Caractéristiques du vérin : courant nominal, courant d'appel et de blocage, fins de course internes, sens réellement sûr.
3. STWD100 : comportement de WDO après expiration (maintien ou impulsion), voir S6.
4. Polarité de l'empreinte de D1 (symbole aux broches « 1/2 », sans C/A).
5. Empilement : épaisseur de cuivre et de diélectrique, non lisibles par l'API. 1 oz externe est supposé.
6. Firmware : génération logicielle ou matérielle de CP_DRV et WDT_KICK (S7), usage de la radio (P2).
7. Valeurs [D\*] à reconfirmer : SMAJ5.0A, SMAJ15A, BAT54S, BZT52C10, ESD5Z5V0, SRV05-4, XL-5050RGBC-2812B, plage de température G6K.
8. Sens d'ouverture des borniers coudés : déduit de la rotation et du bord, à contrôler en vue 3D.

## 9. Conclusion

Aucun défaut BLOQUANT confirmé. La netlist est complète et identique au PCB, et le DRC est à 0 erreur.
La logique de sûreté (pont en H à deux relais, double verrou par relais) est saine **si le brochage G6K supposé est exact**.
**À ne pas commander en l'état.** Corrections obligatoires avant commande :
1. Confirmer COM/NC/NO et la polarité de bobine du G6K-2F sur la datasheet Omron. 2. S1 : protection 5 V qui écrête en dessous de 6 V.
3. S4 : comparer le courant d'appel du vérin à 1 A. 4. S3 : décider si J6 doit aussi couper la rentrée, sinon le documenter.

## Sources

- Omron G6K : [datasheet Omron](https://omronfs.omron.com/en_US/ecb/products/pdf/en-g6k.pdf), [copie Conrad (bobine 5 V : 21,1 mA / 237 Ω ; 1 A 30 V cc)](https://asset.conrad.com/media10/add/160267/c1/-/en/000503884DS01/tehnicni-podatki-503884-omron-g6k-2f-y-5dc-smd-rele-5-vdc-1-a-2-menjalo-1-kos.pdf)
- [TI LM74502 SNOSDE5A](https://ti.com/lit/gpn/lm74502), [TI LM66100 SLVSEZ8A](https://ti.com/lit/gpn/LM66100), [TI SN74LVC1G17](https://www.ti.com/document-viewer/SN74LVC1G17/datasheet/GUID-D616BF7C-F609-4ECB-987C-5D3BF64DD774)
- [ST STWD100 DocID14134](https://www.st.com/resource/en/datasheet/stwd100.pdf)
- [AOS AO3400A](https://www.aosmd.com/res/datasheets/AO3400A.pdf)
- [Lite-On LTV-357T (LCSC C119091)](https://atta.szlcsc.com/upload/public/pdf/source/20170810/C119091_1502335191876879721.pdf)
- [BSMD1206-050-30V (JLCPCB C883126)](https://jlcpcb.com/partdetail/BSMD1206-050-30V/C883126), [MLT-8530 (JLCPCB C94599)](https://jlcpcb.com/partdetail/Jiangsu_HuanengElec-MLT8530/C94599)
- [Guide ESP32-S3-DevKitC-1](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s3/esp32-s3-devkitc-1/user_guide.html), [Guide matériel ESP32-S3](https://www.espressif.com/sites/default/files/documentation/esp32-s3_hardware_design_guidelines_en.pdf), [Datasheet ESP32-S3 (GPIO47/48 sur VDD_SPI)](https://www.scribd.com/document/733136280/Esp32-s3-Datasheet-En)
