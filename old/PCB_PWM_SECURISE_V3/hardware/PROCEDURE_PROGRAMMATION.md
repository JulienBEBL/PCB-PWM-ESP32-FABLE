# Procédure — programmer la carte depuis le PC

**Statut :** v1 (session 13), à valider sur la première carte.
**Matériel :** câble USB-C ↔ PC. Recours : sonde ST-LINK V2 ou V3 sur J9 (SWD).
**Schéma :** page P6 (USB, U13 CH340C sur USART1) ; P2 (SW1 RESET, SW2 BOOT, J9 SWD, J10 UART2).

## 1. Principe

| Voie | Usage | Fiabilité |
|---|---|---|
| USB-C → CH340C → USART1 (PA9 / PA10) | Moniteur série ; téléversement par le bootloader ROM du STM32 | Normale, après le réglage unique du §3 |
| J9 SWD + sonde ST-LINK | Téléversement, débogage pas à pas, **récupération** quand rien d'autre ne marche | Maximale : indépendante du firmware et des octets d'option |
| J10 (USART2, atelier) | Seconde liaison série | — |

Pas de reset automatique : ouvrir le moniteur série **ne réinitialise pas** la carte. Le téléversement série de STM32duino ne pilote aucune séquence DTR / RTS (script `stm32CubeProg.sh`).

## 2. Installation du PC (une fois)

1. Arduino IDE 2.
2. Cœur STM32duino : *Préférences* → URL de gestionnaire de cartes `https://github.com/stm32duino/BoardManagerFiles/raw/main/package_stmicroelectronics_index.json`, puis installer « STM32 MCU based boards ».
3. STM32CubeProgrammer (ST, gratuit) : l'IDE l'utilise pour téléverser.
4. Pilote CH340 : en général installé par Windows Update au premier branchement. Sinon : pilote CH341SER de WCH.
5. Contrôle : carte branchée, un port `COMx` « USB-SERIAL CH340 » apparaît dans le Gestionnaire de périphériques.

## 3. Première mise en service (une fois par carte)

**Motif :** d'usine, le STM32G0 ignore la broche BOOT0 (`nBOOT_SEL = 1`). Il faut la rendre active une fois pour que le bouton BOOT fonctionne.

1. 12 V débranché, cavalier J7 retiré (sécurité, §6).
2. Brancher l'USB-C. **[Hypothèse]** Une puce vierge démarre seule sur le bootloader (flash vide). Si ce n'est pas le cas, passer par J9 (étape 5).
3. STM32CubeProgrammer : mode **UART**, port `COMx`, 115 200 bauds, parité **Even** → *Connect*.
4. Onglet *Option bytes* → *User Configuration* : décocher **nBOOT_SEL** (= 0). Laisser nBOOT0 et nBOOT1 cochés (= 1). Ne pas toucher à la protection en lecture (RDP reste au niveau 0 : errata ES0418 2.2.3). *Apply*.
5. Recours : même réglage par la sonde ST-LINK sur J9 (mode **SWD** dans STM32CubeProgrammer).

Résultat : BOOT0 = niveau de PA14 au reset. R202 (10 kΩ) le tient à 0 : la carte démarre normalement sur son programme.

## 4. Téléverser un programme (usage courant)

1. Arduino IDE : *Carte* = « Generic STM32G0 series », *Board part number* = « Generic G071CBTx », *Upload method* = « STM32CubeProgrammer (Serial) », *Port* = `COMx`.
2. Sur la carte : **maintenir BOOT (SW2), appuyer puis relâcher RESET (SW1), relâcher BOOT.** La carte est en mode programmation.
3. *Téléverser*. À la fin, le programme démarre seul (option `--start` du script).

En cas d'échec : refaire l'étape 2, puis téléverser. Si l'échec persiste : méthode « STM32CubeProgrammer (SWD) » avec la sonde sur J9.

## 5. Moniteur série

- Le CH340C est relié à **USART1 (PA9 TX, PA10 RX)**. **[Hypothèse]** Le `Serial` par défaut de la variante « Generic G071CBTx » peut être affecté à une autre USART : le firmware déclarera explicitement le port (exemple : `HardwareSerial SerialUSB1(PA10, PA9);`). À vérifier au premier firmware.
- Vitesse : celle choisie dans le firmware (115 200 bauds recommandés).

## 6. Sécurité pendant la programmation

- En bootloader ou en reset, le MCU ne pilote plus K1 ni K2 : les relais retombent au repos (rappels à la masse sur `K1_CMD`, `K2_CMD`). Les broches que le bootloader configure ne portent aucune commande de relais (règle R9, `PLAN_BROCHAGE_MCU.md`).
- Relais au repos = commande de retour en position sûre : **avec le 12 V présent, le vérin rentre**. Programmer de préférence avec le 12 V débranché ou J7 retiré.
- Carte alimentée par l'USB seul : relais commandables, mais `+5V` ≈ 4,4 à 4,6 V. Essais de bureau uniquement.
