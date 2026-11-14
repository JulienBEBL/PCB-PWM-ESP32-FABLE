# PCB_PWM_SECURISE_V3

Carte électronique de commande sécurisée d'un vérin électrique à partir d'une consigne PWM.

**Bureau d'études :** BEBL (Bureau d'étude Bailly Levert)
**Responsable technique :** Julien
**Statut :** définition du besoin et choix du matériel (voir `docs/memoire/ETAT_PROJET.md`)

## Fonction

- Lire en continu un signal PWM (impulsion 1000–2000 µs, ~50 Hz) de façon fiable.
- Gérer une machine d'états avec séquences temporisées.
- Piloter un vérin Actuonix série L12 (12 V DC, course utile 3 mm) dans les deux sens par inversion de polarité.
- Revenir en position sûre (tige rentrée) en cas de défaut.
- Lire 4 fins de course inverseurs (2 par extrémité, NO + NC, 8 entrées), signaler l'état par LED et buzzer.

## Outils

- Conception : EasyEDA Pro
- Fabrication et assemblage : JLCPCB (≤ 10 cartes)
- Firmware : C++ / framework Arduino (Arduino IDE 2 ou PlatformIO)

## Organisation du dépôt

Voir `CLAUDE.md`, section 6.
