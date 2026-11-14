# Guide de mise en service, programmation et débogage

**Pour :** Julien, à la réception des cartes. **Version :** 1, session 13 (2026-11-04).
**Détail de la programmation :** `hardware/PROCEDURE_PROGRAMMATION.md`. **Revue :** `hardware/rapports/REVUE_CONCEPTION_V1.md`.

## 1. Les 4 façons d'utiliser la carte

| Mode | Branchements | Usage | Ce qui marche |
|---|---|---|---|
| **A. Banc PC seul** | USB-C seulement | Programmer, moniteur série, tester la logique | MCU, LED, buzzer, relais (cliquent), entrées. **Le vérin ne bouge pas** (pas de 12 V) |
| **B. Banc complet** | USB-C + 12 V (J2) + vérin, pont d'armement J7 | Tester le vérin en voyant les messages du firmware | Tout. La carte prend son 5 V sur l'USB ou J1, au plus haut des deux |
| **C. Autonome** | J1 (5 V + PWM du contrôleur) + 12 V + vérin | Usage réel, sans PC | Tout. L'USB peut être branché à tout moment pour observer, sans couper ni réinitialiser |
| **D. Récupération** | Sonde ST-LINK sur J9 (SWD) | Carte qui ne répond plus en USB | Programmation et débogage pas à pas, quel que soit l'état du firmware |

Sécurité : sans pont d'armement (J7, bornier 3 points : fil entre 1 et 3 dans la fiche), K2 ne peut pas coller : **le vérin ne peut pas sortir**, quel que soit le firmware. Pour les premiers essais, laisser J7 ouvert ou débrancher le 12 V.

## 2. Première mise sous tension (une carte neuve)

| Étape | Action | Attendu | Si ce n'est pas le cas |
|---|---|---|---|
| 1 | Contrôle visuel : composants présents, pas de pont de soudure sur U1, U13, U4 | — | Ne pas alimenter |
| 2 | Multimètre, carte hors tension : résistance entre `+5V` et `GND`, puis `+3V3` et `GND` (points de test) | > 100 Ω | Court-circuit : chercher avant d'alimenter |
| 3 | USB-C sur une alimentation de labo limitée à 200 mA (ou un PC) | LED d'alimentation allumée ; `+5V` ≈ 5,0 V ; `+3V3` = 3,3 V ± 2 % | Courant limité ou tension basse : couper, chercher la cause |
| 4 | Brancher au PC | Un port COM « USB-SERIAL CH340 » apparaît | Installer le pilote CH340 (procédure §1) |
| 5 | Premier flash par l'USB (procédure §3) : la puce neuve démarre d'elle-même sur son bootloader **[Hypothèse]** (« empty check » des STM32G0, manuel RM0444, à vérifier ; sinon BOOT + RESET) | STM32CubeProgrammer se connecte | Recours : sonde ST-LINK sur J9 |
| 6 | Régler `nBOOT_SEL = 0` (une seule fois, procédure §2) | BOOT + RESET entrent ensuite dans le bootloader | — |
| 7 | Firmware de test : LED, buzzer, lecture des entrées sur le moniteur série | Chaque entrée change d'état au moniteur | Vérifier le câblage du capteur |
| 8 | Relais **sans 12 V** : le firmware commande K1 puis K2 (pont J7 en place) | Clic des relais ; `K1_FB`, `K2_FB` passent à 0 | Pompe 10 kHz (K1) ou fenêtre du watchdog (K2) non respectée |
| 9 | 12 V seul, vérin branché, relais au repos | Le vérin **rentre** et s'arrête en butée ; `V12_OK` = 0 | Vérifier le sens du câble du vérin (J3 : 1 = rouge) |
| 10 | Sortie commandée, 5e contact fermé | Le vérin sort ; `I_MON` cohérent (≤ 200 mA) | — |
| 11 | Coupure du 12 V, du 5 V, de l'USB, retrait de la fiche J7, MCU arrêté (bouton RESET maintenu) | Dans chaque cas, le vérin rentre (ou reste rentré) | **Défaut de sûreté** : ne pas utiliser la carte |

## 3. Programmer

| Méthode | Outil | Geste |
|---|---|---|
| USB (normal) | Arduino IDE + STM32duino, méthode « STM32CubeProgrammer (Serial) » | Maintenir **BOOT**, appuyer et relâcher **RESET**, relâcher BOOT, puis « Téléverser ». RESET à la fin |
| SWD (recours) | Sonde ST-LINK V2 sur J9 + STM32CubeProgrammer ou Arduino « SWD » | Aucun bouton. Marche même si le firmware bloque l'USB |

## 4. Déboguer

| Besoin | Moyen |
|---|---|
| Messages du firmware | Moniteur série par l'USB (USART1). Ouvrir le moniteur **ne réinitialise pas** la carte |
| Deuxième liaison série | J10 (USART2, 3,3 V) : adaptateur USB-série 3,3 V, ou une autre carte |
| Pas à pas, points d'arrêt, variables | Sonde ST-LINK sur J9 (SWD) |
| État sans PC | 4 LED + buzzer (codes définis par le firmware) ; sortie `STATUS_EXT` vers le contrôleur |
| Mesures | Points de test (M5) : alimentations, PWM, courant du vérin ; `I_MON` : 1 V = 122 mA |
| Simuler un capteur | Barrettes Dupont J13 (= J1), J14 (= J4), J15 (= J5) : mêmes signaux, broche 1 du même côté |

## 5. À ne jamais faire

- Brancher plus de 6 V sur J1 ou l'USB.
- Brancher ou débrancher le vérin quand il bouge.
- Remplacer le pont d'armement J7 par un pont soudé sur la carte.
- Toucher le côté 12 V (bas de la carte) en fonctionnement : tension basse, mais courant du vérin.
