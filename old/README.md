# old/ — copies figées des anciens dépôts

**Ne jamais modifier ce dossier.** Sources de connaissance, pas des spécifications.

Copie faite le 2026-11-14 par `git archive HEAD` (fichiers suivis seulement, sans `.git`), après `git pull` (dépôts à jour).

| Dossier | Dépôt d'origine | Commit copié | Date du commit | Contenu utile |
|---|---|---|---|---|
| `PCB-PWM-ESP32-SECURIS2-V3/` | `JulienBEBL/PCB-PWM-ESP32-SECURIS2-V3` | `b97db80aef51dce903a07fe9eef1f8f648a1509e` | 2026-11-06 | Précédente carte ESP32 : BOM et netlist validées (ESP32 DEC-027), brochage v3, alimentation, consignes C1 à C10. Schéma jamais commencé |
| `PCB_PWM_SECURISE_V3/` | `JulienBEBL/PCB_PWM_SECURISE_V3` | `b74a0cc066aa374ed9525d7b06e31ba048b64a68` | 2026-11-12 | Carte STM32 : schéma complet, routage en cours, retours d'expérience API (STM32 PO-38, consignes S1 à S15), scripts de routage |

Attention : les scripts de `PCB_PWM_SECURISE_V3/hardware/outils/routage/` contiennent en dur l'uuid du projet EasyEDA STM32 (`b4788f45338c4e59bfcfdff2832a8063`). **Ne jamais les exécuter tels quels.**
