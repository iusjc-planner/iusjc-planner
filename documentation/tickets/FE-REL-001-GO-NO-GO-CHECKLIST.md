# FE-REL-001 - Checklist Go/No-Go

Date: 26 Mars 2026  
Ticket: FE-REL-001  
Strategie: Big-bang vers /web

---

## Regle de gate

Le cutover est autorise seulement si tous les items obligatoires sont valides.

Snapshot courant: `FE-REL-001-READINESS-SNAPSHOT-2026-03-26.md`

---

## 1) Prerequis tickets

| Item | Source | Statut | Evidence |
|---|---|---|---|
| FE-CORE-001 termine | documentation/tickets/FE-CORE-001.md | PRET TECHNIQUEMENT | Statut ticket: Termine |
| FE-CORE-002 termine | documentation/tickets/FE-CORE-002.md | PRET TECHNIQUEMENT | Statut ticket: Termine |
| FE-CORE-003 termine | documentation/tickets/FE-CORE-003.md | PRET TECHNIQUEMENT | Statut ticket: Termine |
| FE-CORE-004 termine | documentation/tickets/FE-CORE-004.md | PRET TECHNIQUEMENT | Statut ticket: Termine |
| FE-PAGE-001 a FE-PAGE-004 valides | documentation/tickets/README-FRONTEND.md | PRET TECHNIQUEMENT | FE-PAGE-001..004 au statut Termine |
| FE-QUAL-001 termine | documentation/tickets/FE-QUAL-001.md | PRET TECHNIQUEMENT | Statut ticket: Termine + rapport FE-QUAL publie |

---

## 2) Qualite et tests

| Item | Seuil | Statut | Evidence |
|---|---|---|---|
| E2E critiques au vert | 100% scenarios critiques | PRET TECHNIQUEMENT | Playwright: 8 passed (14.2s) |
| Unitaires core au vert | Pipeline cible vert | PRET TECHNIQUEMENT | Web unitaires: 58 SUCCESS |
| Rapport de tests partageable | Produit et archive | PRET TECHNIQUEMENT | documentation/tickets/FE-QUAL-001-TEST-REPORT-2026-03-26.md |

---

## 3) Securite et parcours critiques

| Item | Critere | Statut | Evidence |
|---|---|---|---|
| Login/logout | Fonctionnel sans erreur bloquante | PRET TECHNIQUEMENT | E2E: auth-login.spec.ts + auth-session.spec.ts |
| Expiration session JWT | Redirection propre et controlee | PRET TECHNIQUEMENT | E2E: auth-session.spec.ts |
| RBAC routes critiques | Aucune elevation de privilege | PRET TECHNIQUEMENT | E2E: navigation-role.spec.ts |
| Parcours admin principal | Navigable sans blocage | PRET TECHNIQUEMENT | E2E: navigation-role.spec.ts + users-crud.spec.ts + planning-main.spec.ts |
| Parcours enseignant principal | Navigable sans blocage | PRET TECHNIQUEMENT | E2E: navigation-role.spec.ts |

---

## 4) Sante technique

| Item | Critere | Statut | Evidence |
|---|---|---|---|
| Taux erreurs API front | Acceptable selon seuil equipe | A CONFIRMER | Monitoring hypercare non lance |
| Incident severite haute | Aucun ouvert avant Go | A CONFIRMER | Fenetre cutover non ouverte |
| Monitoring actif | Logs et alertes verifies | NON PRET | Procedure hypercare non demarree |

---

## 5) Decision

- Decision Go/No-Go: NO-GO (etat du 2026-03-26)
- Date/heure decision: 2026-03-26 (readiness technique), revalidation operationnelle a planifier
- Approbateurs: Product Owner, Tech Lead Frontend, Tech Lead Backend

Motif du NO-GO residuel:

1. Cutover non execute.
2. Smoke tests en environnement post-cutover non executes.
3. Hypercare non demarre.

## 6) Regles de No-Go

No-Go immediat si un seul cas est vrai:

1. Login/logout ou expiration session en echec.
2. Defaut RBAC sur route critique.
3. E2E critique rouge.
4. Incident severite haute non corrige.
5. Monitoring non operationnel.
