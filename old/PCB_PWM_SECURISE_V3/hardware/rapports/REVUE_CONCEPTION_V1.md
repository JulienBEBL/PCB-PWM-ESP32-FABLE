# Revue complète de conception — carte V1 (avant commande)

**Date :** 2026-11-04 — **Session :** 13 — **Auteur :** Claude Code
**Objet :** demande de Julien : « check complet, points durs, erreurs, warnings, risques », limites, besoins méca, estimation CEM.
**Périmètre :** schéma saisi (10 pages, 198 composants), PCB1 placé (G4), BOM v1.2, netlist cible v1.2.
**Avertissement :** cette revue est faite par l'auteur du schéma. Elle réduit le risque, elle ne remplace pas un regard extérieur. Un prototype passe toujours par une mise en service pas à pas (`hardware/GUIDE_MISE_EN_SERVICE.md`).

## 1. Verdict

| | Nombre | Détail |
|---|---|---|
| Erreurs bloquantes trouvées | **0** | Aucune erreur de connexion, de brochage ou de polarité détectée (§2) |
| Modifications recommandées avant commande | **5** | M1 à M5 (§4) : connecteurs à vis, cavalier robuste, ESD sur J6, LED d'alimentation, points de test |
| Risques résiduels acceptés ou à surveiller | **10** | R1 à R10 (§3) |
| Contraintes pour le firmware | 6 | F1 à F6 (§5) |

## 2. Vérifications faites

| Contrôle | Méthode | Résultat |
|---|---|---|
| Saisie = netlist cible | Relecture géométrique de chaque fil (V1) ; table broche → net du PCB comparée à `NETLIST_CIBLE.md` | Conforme, 115 nets, aucun net à une broche |
| Brochages | Symboles LCSC relus en image ; datasheets : Omron G6K (relais), XKB TS-1187A (boutons), TI LM66100, ST (MCU) | Conformes. Boutons : broches 1-2 et 3-4 = paires internes A–B / C–D (sinon `NRST` serait à la masse en permanence) |
| Polarités | D1, D2, D9 à D14 (cathode broche 1), D4 à D6, D7 (BAT54S), relais (bobine 1 +), buzzer | Conformes |
| Isolement | Composants reliant les deux domaines (V4) ; distances pastille à pastille | Seuls K1, K2, U6, U7, U9 ; 2,23 mm minimum entre composants ; relais 1,1 mm (exception DEC-069) |
| Plans de masse | Position de chaque pastille par rapport à la frontière (y = 29 mm) | Coupure propre : 80 pastilles de puissance toutes dessous ; côté commande seules K1.8 et K2.8 dessous (forme en L prévue) |
| Pont du vérin (V6) | Table des contacts au repos et excités | Repos : rentrée. K1 + K2 + 5e contact : sortie. Un seul relais : arrêt |
| ERC schéma | `sch_Drc.check` | 0 erreur, 0 avertissement |
| DRC PCB | `pcb_Drc.check` strict, détail | 546 « Connection Error » = liaisons non routées. Aucune autre erreur |
| Placement | Boîtes englobantes réelles (corps + sérigraphie) | Aucun chevauchement, rien hors carte, trous dégagés |

Calculs refaits :

| Point | Calcul | Résultat |
|---|---|---|
| Commande de Q3 par la pompe | 3,3 V − 2 × 0,3 V (BAT54S) ≈ 2,7 V > VGS(th) max 1,45 V (AO3400A) | OK. Signal figé → décharge τ = 100 kΩ × 100 nF = 10 ms → K1 retombe |
| Bobines | 5,0 V (diodes idéales, ≈ 16 mV de chute) ; enclenchement ≤ 4,0 V | Marge ≈ 1 V |
| Optocoupleurs | (12 − 1,2) / 4,7 kΩ ≈ 2,3 mA ; CTR ≥ 100 % à ce courant **[Hypothèse]** → ≥ 2 mA ; besoin 0,33 mA (rappel 10 kΩ) | Saturation assurée, même à 9 V |
| Mesure de courant | 200 mA × 1 Ω × 8,2 = 1,64 V ; shunt 40 mW (250 mW admis) | OK ; écrêtage au-delà de ≈ 300 mA (normal) |
| Quartz 12 MHz | gm critique = 4 × ESR × (2πf)² × (C0 + CL)² ; avec ESR 100 Ω, C0 2 pF **[Hypothèse]** : ≈ 1,1 mA/V | Sous la limite du STM32G0 (1,5 mA/V, AN2867) : démarre, marge faible (R7) |
| Régulateur 3,3 V (U2) | (5 − 3,3) × ≈ 140 mA crête ≈ 0,24 W ; SOT-23-5 ≈ 250 °C/W **[Hypothèse]** | +60 °C : ≈ 110 °C à 50 °C ambiant, sous 125 °C. Marge faible (R8) |
| Bilan 5 V | ≈ 130 mA moyen, ≈ 180 mA crête | PTC F1 500 mA ; USB 500 mA suffit |
| Bilan 12 V | Vérin ≤ 200 mA (blocage) + U8 / U9 ≈ 10 mA + optos 5 mA | PTC F2 500 mA |
| Entrée 12 V hors limites | > 13,2 V (typ.) : LM74502 coupe ; > 16,7 V : D2 conduit, F2 déclenche ; inversion : LM74502 bloque | Carte protégée jusqu'à la tenue de F2 (30 V) |

## 3. Risques et limites (warnings)

| N° | Gravité | Constat | Conséquence | Traitement |
|---|---|---|---|---|
| R1 | **Moyenne** | U15, U16 (LM66100) et U2 : 6 V max absolu. D1 (SMAJ5.0A) ne commence à conduire qu'à 6,4 V | Une alimentation 5 V défaillante (6 à 12 V **continus**) sur J1 détruit U15 avant que F1 déclenche. Les ESD sont absorbées par C107 + C101 (1,2 V de hausse pour 8 kV) | Accepté : source 5 V régulée. Ne jamais brancher le 12 V sur J1 : détrompage par connecteurs différents (M1) |
| R2 | **Moyenne** | J6 (5e contact) sans protection ESD sur `NO_FEED` | Une décharge sur le câble du 5e contact atteint U7 et le contact de K1 | **M3** : ajouter une TVS |
| R3 | **Moyenne** | Recours SWD sans sonde : Julien a refusé le ST-LINK | Si le bootloader USB ne répond pas sur la 1re carte (option bytes, soudure de U13), aucun moyen de la récupérer | **[Reco]** forte : acheter une sonde ST-LINK V2 (quelques euros) avant la mise en service |
| R4 | Moyenne | Un seul relais collé ou excité seul : le vérin **s'arrête** mais ne rentre pas | Pas de retour en position sûre sur cette défaillance | Limite de l'architecture à 2 relais (DEC). Détectée par relecture `K1_FB` / `K2_FB` et `I_MON` ; le firmware signale le défaut |
| R5 | Faible | Au repos, avec 12 V présent, le vérin est **toujours alimenté en rentrée** | Normal : la fin de course interne du L12-S coupe le moteur en butée | Vérifier que la version commandée a bien les fins de course internes (« -S ») |
| R6 | Faible | Buzzer (95 mA crête) sur le 3,3 V, qui est aussi la référence de l'ADC | Mesures `I_MON` et `V5_MON` bruitées pendant le bip | Firmware : ne pas mesurer pendant un bip (F5) |
| R7 | Faible | Marge d'oscillation du quartz modeste | Démarrage lent ou absent sur une carte | Firmware : repli sur l'oscillateur interne si le quartz ne démarre pas (F4) |
| R8 | Faible | U2 chauffe jusqu'à ≈ +60 °C au pire | Durée de vie réduite à 50 °C ambiant | Plan de cuivre sous U2 au routage ; buzzer pas en continu |
| R9 | Faible | Placement : C205 (6,2 mm), C206 (6,3 mm), D4 (6,1 mm), groupe U4 / K2 étiré | Pas de défaut fonctionnel attendu à ces fréquences | Rapprochés au prochain placement |
| R10 | Info | Trous de fixation non métallisés, pas de liaison masse / châssis | En boîtier métallique, le blindage n'est pas relié à la carte | Si boîtier métallique : liaison châssis à décider (option au routage) |

Limites de la carte (à respecter en usage) :

| Grandeur | Limite |
|---|---|
| Entrée 5 V (J1 ou USB) | 4,5 à 5,5 V ; **jamais au-delà de 6 V** |
| Entrée 12 V (J2) | 9 à 13 V utiles ; coupure à 13,2 V typique (12,3 à 14,0 V) ; inversion tolérée |
| Courant vérin | ≤ 1 A par contact de relais (Omron), PTC 500 mA ; prévu pour ≤ 200 mA |
| Manœuvres | 100 000 manœuvres électriques des relais ; besoin 200 cycles |
| Température | Relais −40 à +70 °C ; buzzer −20 à +70 °C ; boutons −30 à +85 °C. **Carte : −20 à +70 °C** |
| Fins de course | Contacts secs vers la masse uniquement, 3,3 mA de mouillage |
| Extension J8 | Entrées 0 à 5 V via 4,7 kΩ ; `+3V3_EXT` sans limitation de courant : un court-circuit sur J8 coupe le 3,3 V (la carte redémarre, relais au repos) |
| `STATUS_EXT` | Drain ouvert, rappel externe ≤ 5,5 V, ≤ 50 mA |

## 4. Modifications recommandées avant commande (toutes faites le 2026-11-04 : DEC-071 à DEC-074)

| N° | Modification | Raison | Effet |
|---|---|---|---|
| M1 | **Borniers à vis enfichables** pour J1 à J6 (et J8), **plus une barrette 2,54 mm en parallèle** pour chaque connecteur externe | Demande de Julien. Câblage sûr, débrochable sans outil spécial ; Dupont pour le banc | Détrompage par pas et nombre de points. Plus de place sur les bords (§7) |
| M2 | **Cavalier d'armement J7** remplacé par un bornier enfichable 2 points (pont de fil dans la fiche, ou interrupteur à clé déporté) | J7 est aujourd'hui une barrette 2,54 mm + capuchon : peut tomber sous vibrations | Armement solide, verrouillable, câblable vers l'extérieur |
| M3 | TVS sur `NO_FEED` (J6) côté puissance | R2 | 1 diode SMAJ15A |
| M4 | **LED « 3,3 V présent »** câblée en dur (sans le MCU) | Premier diagnostic : la carte est-elle alimentée ? | 1 LED + 1 résistance |
| M5 | Points de test : `+5V`, `+3V3`, `GND`, `+12V_P`, `GND_P`, `PWM_IN`, `I_MON` | PO-39 ; mesures au multimètre et à l'oscilloscope sans démonter | Pastilles sur le PCB |

## 5. Contraintes pour le firmware

| N° | Contrainte |
|---|---|
| F1 | `CP_DRV` : signal carré 10 kHz permanent (TIM17) tant que K1 doit être excité. Arrêt → K1 retombe en ≈ 10 ms |
| F2 | `WDT_KICK` : un front descendant toutes les **36 ± 5 ms**. Hors fenêtre → K2 retombe pendant 200 ms |
| F3 | Toutes les sorties de commande au niveau bas au démarrage (rappels 100 kΩ déjà présents) |
| F4 | Repli sur l'oscillateur interne si le quartz ne démarre pas, et signalement |
| F5 | Pas de mesure analogique pendant un bip |
| F6 | Octet d'option `nBOOT_SEL` = 0 au premier flash (`PROCEDURE_PROGRAMMATION.md`) |

## 6. Estimation CEM (non mesurée)

Référentiel : EN 61000-6-2 (immunité industrielle), ESD niveau 4 (DEC). Niveaux cités de mémoire : **[Hypothèse]**, à vérifier dans les normes. Câbles courts (≤ 30 cm, DEC) : plusieurs essais ne s'appliquent qu'aux câbles de plus de 3 m.

| Essai | Niveau visé | Estimation | Points forts | Points faibles |
|---|---|---|---|---|
| ESD (61000-4-2) | ±8 kV contact, ±15 kV air | **Probable** sur J1, J4, J5, J8, USB ; **incertain** sur J6 sans M3 | TVS au pied de chaque connecteur, plans de masse, boîtier | J6 (corrigé par M3) |
| Champ rayonné (61000-4-3) | 10 V/m, 80 MHz à 1 GHz | **Probable** | 4 couches avec plans ; entrées filtrées (RC + trigger de Schmitt) ; pompe de charge et watchdog : une perturbation ne peut pas exciter un relais | Câble du vérin non blindé ; entrée PWM à haute impédance (100 kΩ) |
| Transitoires rapides (61000-4-4) | ±1 kV signaux, ±2 kV alimentations, si câbles > 3 m | Probablement non applicable ; sinon probable | Filtres RC, TVS | — |
| Ondes de choc (61000-4-5) | ±0,5 à 1 kV, si câbles > 30 m | Non applicable (câbles courts) | TVS 400 W | U15 / U16 limités à 6 V (R1) |
| RF conduite (61000-4-6) | 10 V, si câbles > 3 m | Non applicable | — | — |
| Émissions (61000-6-4) | Classe industrielle | **Probable** | Horloges basses (12 / 64 MHz), plans, signaux lents | Balais du moteur (traités par C505 + D3 au connecteur) |
| Inspiré MIL-STD-461G (RS103, CS114) | Champs forts | **Non évaluable** sans essai | Isolement galvanique, relais repos = sûr | Nécessite le boîtier blindé (DEC-043) |

Résistance aux ondes : en cas de perturbation forte, la conception tend vers la position sûre. Une impulsion parasite ne maintient pas la pompe de charge (il faut 10 kHz continus) ni la fenêtre du watchdog. Un MCU planté laisse retomber les deux relais. Ce comportement est le principal argument de sûreté face aux ondes.

## 7. Besoins mécaniques

| Besoin | Valeur |
|---|---|
| Carte | 100 × 80 mm (DEC-068, à revoir avec M1), 1,6 mm, 4 trous M3 aux coins (Ø 3,2 mm, centres à 4 mm des bords) |
| Entretoises | M3, hauteur ≥ 5 mm (soudures traversantes dessous) |
| Hauteur max. composants dessus | ≈ 9 à 12 mm (borniers enfichables avec fiche, à confirmer M1) ; relais 5,2 mm ; buzzer ≈ 3 mm **[Hypothèse]** |
| Accès boîtier ouvert | USB-C (bord haut), boutons RESET et BOOT, J9 SWD et J10 UART (bord gauche), cavalier d'armement |
| Visible boîtier fermé | 4 LED (bord droit) + LED d'alimentation (M4) : conduits de lumière ou fenêtre |
| Passe-câbles | Bord haut : contrôleur, fins de course, extension, USB. Bord bas : 12 V, vérin, 5e contact |
| Buzzer | Ouverture ou paroi mince en face de LS1 |
| Environnement | Boîtier étanche (DEC-004) ; vernis de tropicalisation possible **sans silicone** sur les relais (Omron) |

## 8. Sérigraphie (DEC-075)

| Contrôle (boîtes réelles relues dans EasyEDA) | Résultat |
|---|---|
| Textes sur la sérigraphie du dessus | 270 (202 repères, 68 marquages) + 40 traits |
| Texte à moins de 0,15 mm d'une pastille | **0** |
| Texte sur un corps de composant | **0** |
| Textes qui se touchent | **0** |
| Texte sur un bord ou un trou | **0** |
| Repères non imprimés (pas de place) | C205, D1 : voir `hardware/pcb/PLACEMENT_G4.png` (plan de repérage) |
| Taille | 1,0 mm (0,9 mm pour 8 repères en zone dense), trait 0,15 mm : au minimum JLCPCB |

Limite : la sérigraphie propre aux empreintes (contours, repère de broche 1) vient des bibliothèques LCSC. Elle ne déborde pas sur les autres composants (corps sans chevauchement). JLCPCB rogne d'office la sérigraphie sur les pastilles. Vue : `hardware/pcb/SERIGRAPHIE_V1.png`.
