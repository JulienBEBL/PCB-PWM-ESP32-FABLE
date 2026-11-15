# BOM verifiee

Generee depuis `docs/architecture/netlist_cible.json`. 136 composants, 46 references (18 Basic, 28 Extended). Mise a jour manuelle du 2026-11-15 (session 03 : R331, R502) ; stock de toutes les lignes relu ce jour-la (`CORRECTIONS_REVUE.md` §3).
Stock : releve sur jlcpcb.com/partdetail/<code> le 2026-11-14. « Dispo » = quantite commandable.

| Reperes | Qte | Valeur | Reference | LCSC | Classe | Montage | Stock | Dispo | Alternative |
|---|---|---|---|---|---|---|---|---|---|
| J1 | 1 | Bornier 4 pts 3,81 | WJ15EDGRC-3.81-04P-14-00A | C7245 | Extended | Traversant | 100677 | 84387 |  |
| F1, F2 | 2 | PTC 0,5 A | BSMD1206-050-30V | C883126 | Extended | CMS | 82773 | 81544 |  |
| D1 | 1 | SMAJ5.0A | SMAJ5.0A | C113952 | Extended | CMS | 396664 | 391183 |  |
| C107, C109, C108 | 3 | 1uF | CL10A105KB8NNNC | C15849 | Basic | CMS | 13294217 | 9968142 |  |
| U15, U16 | 2 | LM66100 | LM66100DCKR | C2869734 | Extended | CMS | 39687 | 37783 |  |
| C101, C407, C503 | 3 | 10uF | CL21A106KAYNNNE | C15850 | Basic | CMS | 8883203 | 7019478 |  |
| C102, C106, C105, C302, C401, C402, C404, C420, C421, C502, C504, C505 | 12 | 100nF | CC0603KRX7R9BB104 | C14663 | Basic | CMS | 34549736 | 16240639 |  |
| R102, R103, R404, R409, R412, R414, R503, R506, R508 | 9 | 10k | 0603WAF1002T5E | C25804 | Basic | CMS | 43086748 | 32370638 |  |
| R426 | 1 | 680R | 0603WAF6800T5E | C23228 | Basic | CMS | 1407175 | 1198886 |  |
| LED5 | 1 | LED verte | NCD0603C1 | C84264 | Extended | CMS | 357886 | 349035 |  |
| J20, J21, J22 | 3 | Barrette F 1x22 | ZX-PM2.54-1-22PY | C7499337 | Extended | Traversant | 11380 | 10715 |  |
| D9, D11, D12, D10 | 4 | ESD5Z5V0 | ESD5Z5V0 | C85708 | Extended | CMS | 3227 | 2825 | — |
| R301, R403, R408, R417, R420, R425 | 6 | 100k | 0603WAF1003T5E | C25803 | Basic | CMS | 14794722 | 12406848 |  |
| R302, R303, R311, R321, R312, R322, R313, R323, R314, R324, R315, R325, R316, R326, R317, R327, R318, R328, R405, R415 | 20 | 1k | 0603WAF1001T5E | C21190 | Basic | CMS | 27171723 | 20459428 |  |
| C301 | 1 | 1nF | CL10B102KB8NNNC | C1588 | Basic | CMS | 5719676 | 4436954 |  |
| U3 | 1 | SN74LVC1G17 | SN74LVC1G17DBVR | C7836 | Extended | CMS | 6245 | 4046 | — |
| J4 | 1 | Bornier 6 pts 3,81 | WJ15EDGRC-3.81-06P-14-00A | C7246 | Extended | Traversant | 18147 | 17175 |  |
| J5 | 1 | Bornier 7 pts 3,81 | WJ15EDGRC-3.81-07P-14-00A | C24525 | Extended | Traversant | 2931 | 2780 | — |
| U11, U12 | 2 | SRV05-4 | SRV05-4-P-T7 | C85364 | Extended | CMS | 20281 | 14178 |  |
| C311, C312, C313, C314, C315, C316, C317, C318, C331, C332, C403, C405, C406, C506, C507 | 15 | 10nF | 0603B103K500NT | C57112 | Basic | CMS | 5221616 | 3622842 |  |
| J8 | 1 | Barrette M 1x4 | PZ254V-11-04P | C492403 | Extended | Traversant | 58716 | 57447 |  |
| R501 | 1 | 0R | 0603WAF0000T5E | C21189 | Basic | CMS | 17173688 | — |  |
| R331 | 1 | 33R | 0603WAF330JT5E | C23140 | Basic | CMS | 3181817 | — | DEC-029 : remplace 0 Ω, relevé du 2026-11-15 |
| R332, R333, R402, R407, R505, R507 | 6 | 4.7k | 0603WAF4701T5E | C23162 | Basic | CMS | 14936162 | 11661816 |  |
| K1, K2 | 2 | G6K-2F-Y DC5 | G6K-2F-Y-TR DC5 | C47190 | Extended | CMS | 56865 | 52737 |  |
| D4, D5, D6 | 3 | 1N4148W | 1N4148W | C81598 | Basic | CMS | 3240980 | 2844508 |  |
| Q3, Q4, Q5, Q6, Q2, Q7, Q8, Q9 | 8 | AO3400A | AO3400A | C20917 | Basic | CMS | 1009188 | 849904 |  |
| R401, R406, R416, R418, R424 | 5 | 100R | 0603WAF1000T5E | C22775 | Basic | CMS | 11246980 | 9021884 |  |
| D7 | 1 | BAT54S | BAT54S,215 | C47546 | Extended | CMS | 249555 | 248871 |  |
| J7 | 1 | Bornier 3 pts 5,08 | WJ2EDGRC-5.08-03P-14-00A | C8377 | Extended | Traversant | 22585 | 21536 |  |
| U4 | 1 | STWD100YNX | STWD100YNXWY3F | C1354132 | Extended | CMS | 179 | 172 | C46043 STWD100NYWY3F (meme boitier, delai 1,6 s, stock 30 577) |
| R413 | 1 | 15k | 0603WAF1502T5E | C22809 | Basic | CMS | 3075920 | 2680699 |  |
| U17 | 1 | SN74AHCT1G125 | SN74AHCT1G125DBVR | C7484 | Extended | CMS | 32879 | 14928 |  |
| R421 | 1 | 330R | 0603WAF3300T5E | C23138 | Basic | CMS | 2333311 | 1696861 |  |
| LED1 | 1 | WS2812B | XL-5050RGBC-2812B (XINGLIGHT) | C2843785 | Extended | CMS | 1200190 | 1139843 | DEC-021 : remplace C114586, retirée de l'assemblage JLCPCB (relevé du 2026-11-15) |
| LS1 | 1 | MLT-8530 | MLT-8530 | C94599 | Extended | CMS | 126749 | 121906 |  |
| J2 | 1 | Bornier 2 pts 5,08 | WJ2EDGRC-5.08-02P-14-00A | C3697 | Extended | Traversant | 69978 | 67400 |  |
| D2, D17 | 2 | SMAJ15A | SMAJ15A | C152121 | Extended | CMS | 11460 | 11155 |  |
| U5 | 1 | LM74502 | LM74502DDFR | C3236215 | Extended | CMS | 7557 | 7472 |  |
| C501 | 1 | 220nF | CL10B224KA8NNNC | C21120 | Basic | CMS | 1035555 | 864219 |  |
| D8 | 1 | BZT52C10 | BZT52C10 | C2103 | Extended | CMS | 57520 | 52394 |  |
| R502 | 1 | 97.6k | 0603WAF9762T5E | C23269 | Extended | CMS | 3280 | — | DEC-027 : remplace 110 k (C25805), relevé du 2026-11-15 |
| J6 | 1 | Bornier 3 pts 3,81 | WJ15EDGRC-3.81-03P-14-00A | C8406 | Extended | Traversant | 60194 | 55488 |  |
| J3 | 1 | Bornier 2 pts 3,81 | WJ15EDGRC-3.81-02P-14-00A | C8387 | Extended | Traversant | 174902 | 158212 |  |
| D3 | 1 | SMAJ15CA | SMAJ15CA | C151939 | Extended | CMS | 11556 | 11146 |  |
| U6, U7 | 2 | LTV-357T-C | LTV-357T-C | C119091 | Extended | CMS | 141134 | 138696 | C33068 LTV-357T-B (stock 62 108) |
