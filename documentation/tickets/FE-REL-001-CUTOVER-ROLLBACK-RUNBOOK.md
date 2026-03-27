# FE-REL-001 - Runbook Cutover et Rollback

Date: 26 Mars 2026  
Ticket: FE-REL-001

---

## 1) Objectif

Executer la bascule /frontend vers /web avec une procedure reproductible, puis revenir rapidement en arriere si un incident critique survient.

---

## 2) Prerequis d execution

1. Checklist Go/No-Go validee a 100%.
2. Equipe de garde disponible (frontend, backend, ops).
3. Canaux de communication actifs (war room + canal incidents).
4. Fenetre de bascule confirmee.
5. Checklist operateur minute par minute prete: `FE-REL-001-CHECKLIST-OPERATEUR-MINUTE-PAR-MINUTE.md`.

---

## 3) Procedure cutover

1. Annoncer le debut de fenetre de bascule.
2. Geler les changements fonctionnels sur /frontend.
3. Basculer le point d entree officiel vers /web.
4. Executer immediatement le pack smoke tests.
5. Surveiller erreurs frontend/API pendant 60 minutes minimales.
6. Si aucun incident critique: confirmer Go et ouvrir hypercare.

---

## 4) Procedure rollback

Condition d activation:
- Incident critique non corrige en moins de 60 minutes sur un parcours coeur.

Etapes:
1. Declarer rollback et notifier toutes les equipes.
2. Repointer immediatement vers /frontend.
3. Verifier le retablissement des parcours critiques.
4. Geler les changements /web en attendant RCA.
5. Ouvrir RCA et plan de patch prioritaire.

---

## 5) Journal d execution

| Horodatage | Action | Responsable | Resultat |
|---|---|---|---|
| A renseigner | Debut fenetre | A renseigner | A renseigner |
| A renseigner | Bascule /web | A renseigner | A renseigner |
| A renseigner | Smoke tests | A renseigner | A renseigner |
| A renseigner | Decision Go/No-Go | A renseigner | A renseigner |
| A renseigner | Fin fenetre | A renseigner | A renseigner |
