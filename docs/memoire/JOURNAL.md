# Journal

## Session 01 — 2026-11-14 (samedi)

**Fait**

- `git pull` sur les trois dépôts (à jour). Copie figée des deux anciens dépôts dans `old/` (DEC-002).
- Pont EasyEDA vérifié (port 49620). Projet actif `FABLE52_PCB_ESP32`, uuid `836928ac4399433ab9cd56636d997eda` (DEC-001).
- Lecture des anciens dépôts : mémoire, BOM, netlist, brochage v3, alimentation, consignes C1 à C10 et S1 à S15, STM32 PO-38, rapports de placement et de routage.
- Phase 1 : tests de l'API sur une page `ESSAI`, supprimée ensuite. Tout fonctionne ; l'export de netlist par `sch_ManufactureData.getNetlistFile()` fonctionne (DEC-004).

**Contradictions et écarts relevés entre les sources**

| N° | Constat | Traitement |
|---|---|---|
| E1 | Écart des rangées de la carte de dev : 25,40 mm (ESP32 PO-21, hypothèse) contre 22,86 mm (empreinte KiCad d'Espressif). | PO-01, question Q1 |
| E2 | La liste des blocs de sécurité du prompt ne cite pas la pompe de charge (K1), le watchdog externe (K2) ni le 5e contact d'arrêt matériel (J6, U7), présents sur la carte STM32 et validés (ESP32 DEC-004). | Question Q3 ; défaut : conservés |
| E3 | Connecteur d'extension J8 : 1×6 sur la carte STM32, 1×4 dans la netlist ESP32. | Question Q4 |
| E4 | Dimensions : 120 × 80 mm sur la carte STM32 (STM32 DEC-072), non décidées pour l'ESP32 (ESP32 PO-10). | Question Q2 |
| E5 | Dates des anciens dépôts (commande le 14 novembre, ESP32 PO-11) : périmées. | Prompt : commande le 16 novembre |
| E6 | Les anciennes consignes imposent un arrêt à chaque jalon G1 à G5. | Prompt : autonomie complète, relecture à la fin |
| E7 | Barrettes Dupont J13 à J15 (STM32 DEC-071) : non citées dans le prompt, contraires à « aucune fonction superflue ». | Question Q5 |

**Questions posées à Julien (PO-02)** — défaut entre parenthèses

- Q1. Carte de dev reçue ? Si oui : écart mesuré entre les rangées, version (v1.0 / v1.1). (Non reçue : empreinte à 3 rangées 22,86 + 25,40 mm.)
- Q2. Format : 120 × 80 mm, 4 trous M3 et connecteurs aux mêmes places que la carte STM32 ; USB de la carte de dev vers le petit côté gauche. (Oui ; carte allongée si nécessaire, signalé.)
- Q3. Blocs conservés bien que non cités : pompe de charge, watchdog externe, 5e contact (J6 + opto), sortie STATUS, mesure du 5 V, LED « 3,3 V présent », points de test. (Tous conservés.)
- Q4. J8 extension : 1×6 au brochage STM32, broches des voies 3 et 4 non connectées. (Oui.)
- Q5. Barrettes Dupont J13 à J15 en parallèle des borniers. (Supprimées.)
- Q6. Composants CMS bas autorisés sous la carte de dev. (Oui, passifs seulement.)
- Q7. Disponibilité de Julien pour le clic « Apply » de l'import PCB (samedi soir ou dimanche matin).

**Suite de la session (après les réponses de Julien, DEC-005)**

- Guide Espressif relu : brochage des rangées confirmé ; variante N8 en fin de vie → brochage v4 sans GPIO35 à 37 (DEC-007).
- Stock JLCPCB relevé pour les 46 références. TPS3430 et EL357N en rupture → STWD100YNX (DEC-008), LTV-357T-C (DEC-009).
- Netlist cible écrite en JSON (`docs/architecture/netlist_cible.json`) : 136 composants, 78 nets.
- Schéma saisi par script : 10 pages. Premier câblage : nets fusionnés par des fils en contact, détectés par le contrôle de netlist ; corrigé (contrôle géométrique, pages scindées). Résultat : 0 écart, ERC 0 erreur 0 avertissement.
- Import vers le PCB lancé : attend le clic « Apply » de Julien.
- Push toujours refusé (PO-06) : commits locaux.

**Fin de session (phases 5 à 9)**

- Plan Espressif fourni par Julien : entraxe officiel 22,86 mm (PO-01 mis à jour).
- Import PCB appliqué par Julien (clic « Apply »). Contour, trous, 4 couches, placement contrôlé hors ligne puis appliqué (DEC-016).
- Règles, bande d'isolement de 3 mm, pistes de bobine, points de test (DEC-017, DEC-018).
- Routage : autorouteur par lots, vias de masse par script, 6 liaisons reprises (DEC-019). DRC 0 erreur ; isolement 2,34 mm.
- Sérigraphie : contour de la carte de dev, légendes.
- Exports : Gerber, BOM, CPL ; contrôle de cohérence 0 écart.
- Revue finale : R303 passée à 1 kΩ (DEC-020), modifiée en place. Piège : la copie des attributs d'un autre composant a aussi copié son « Channel ID », d'où une « Netlist Error » au DRC ; corrigé en rétablissant l'identifiant.
- Stock relevé une seconde fois : 45 / 45 disponibles.
- Rapports : `REVUE_FINALE.md`, `LIVRAISON.md`.

**2026-11-15 — commande en cours chez JLCPCB**

- Droit d'écriture GitHub accordé : tous les commits poussés (PO-06 clos).
- Julien a chargé les fichiers sur JLCPCB : toutes les lignes reconnues sauf **LED1** (PO-16).
- Julien demande une assurance de fonctionnement sans relecture de sa part (PO-17). Il va lancer un /compact ; la réponse est due juste après.

- Capture de Julien : C114586 « removed from our assembly library ». LED1 remplacée par C2843785 (DEC-021), datasheet lue.
- Seconde revue du schéma et du routage, hors ligne (pont sans fenêtre EasyEDA) : aucune erreur bloquante ; PO-18 à PO-21 ouverts.

- EasyEDA reconnecté (uuid vérifié). LED1 mise à jour en place dans le schéma et le PCB. Netlist 0 écart, DRC 0, isolement 2,34 mm. ERC : 1 avertissement dû à la référence de LED1 (PO-22).
- Julien : vérin L12-30-50-12-S (PO-20 clos). PO-19 toujours sans réponse.

- Julien a remplacé LED1 par « Use Recommended Device » dans le PCB : écart de référence de bibliothèque avec le schéma, DRC 1 ligne « Netlist Error » (PO-23). Attributs du schéma alignés ; import lancé, attend « Apply ».
- Julien : source 12 V non choisie. Impact à 12,5 V et proposition R502 = 110 k consignés (PO-19).

- Julien a cliqué « Apply » : DRC 0 (PO-23 clos). Accord de Julien pour R502 = 110 kΩ (DEC-022) : modifiée en place. Piège retrouvé : la modification des propriétés côté PCB vide le code fournisseur ; il faut le réécrire dans un second appel.
- Contrôles finaux : netlist 0 écart, ERC 1 avertissement (PO-22), DRC 0, isolement 2,34 mm.

## Session 02 — 2026-11-15 (dimanche) : sérigraphie

- Uuid du projet actif vérifié : `836928ac4399433ab9cd56636d997eda` (FABLE52_PCB_ESP32). `git pull` en Git Bash bloqué (verrou), `git fetch` en PowerShell : à jour.
- Règles JLCPCB relevées (Legend) : 1,0 mm, 0,15 mm, 0,15 mm. Inventaire : 98 textes sur 148 en défaut.
- Questions à Julien : réponses par défaut, sauf texte de la carte de dev conservé (DEC-023).
- Corrections par l'API : 109 repères replacés, 24 regroupés, 3 masqués, 29 textes et 9 traits ajoutés. Contrôle : 0 défaut sauf PO-25. DRC 0, isolement 2,34 mm, composants et vias identiques.
- Nouveau Gerber du 15 (PO-26). Piège API : `pcb_PrimitiveLine.create` refuse la couche sérigraphie ; utiliser `pcb_PrimitivePolyline`.

- Révision 2 demandée par Julien (DEC-024) : broches numérotées et nommées dans le cadre des borniers, J21/J22, titre et S/N à 2,0 mm. Contrôle 0 défaut, DRC 0, Gerber du 15 régénéré.

**Prochaine session :** voir `ETAT_PROJET.md`.
