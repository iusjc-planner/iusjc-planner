# FE-QUAL-001 - Campagne qualite frontend (tests)

Priorite: P2  
Statut: Termine  
Estimation: 3 jours  
Dependances: FE-CORE-001 a FE-PAGE-005

## Description

Construire la campagne de tests frontend /web: unitaires sur services/guards et E2E sur parcours critiques.

## Critères d'acceptation

- Couverture unitaire minimale definie et mesuree.
- Scenarios E2E critiques automatises:
  - login
  - navigation role
  - CRUD utilisateur
  - planning principal
- Rapport de tests partageable.

## Seuil minimal retenu

- Unitaires /web: 0 echec sur la suite cible (gate bloquant).
- E2E critiques /frontend: 0 echec sur les scenarios critiques (gate bloquant).
- Couverture /web mesuree et publiee a chaque run de reference.

## Taches

- Ecrire tests unitaires core.
- Ajouter tests E2E parcours critiques.
- Integrer execution CI.

## Avancement implementation

- Couverture unitaire core/frontend fortement etendue sur `/web` (services, guards, interceptors, layout, pages critiques).
- Baseline unitaire actuelle validee localement: `58 SUCCESS` (Karma headless via `CHROME_BIN` Edge).
- Couverture unitaire /web mesuree sur run de reference: Statements `59.14%`, Branches `41.13%`, Functions `52.07%`, Lines `59.52%`.
- Scenarios E2E critiques disponibles et executes sur la base Playwright `frontend/e2e`:
  - `auth-login.spec.ts`
  - `auth-session.spec.ts`
  - `navigation-role.spec.ts`
  - `users-crud.spec.ts`
  - `planning-main.spec.ts`
  - `notifications-center.spec.ts`
- Derniere execution E2E complete: `8 passed (14.2s)`.
- Execution CI integree dans `.github/workflows/ci-cd.yml` (unit tests + Playwright E2E + artifacts).
- Rapport partageable consolide dans `documentation/tickets/FE-QUAL-001-TEST-REPORT-2026-03-26.md`.

## Verification

- Run tests vert sur pipeline cible.
- Verification locale unitaire: `npm run test -- --watch=false --browsers=ChromeHeadless --code-coverage` dans `/web` => `58 SUCCESS`.
- Verification locale E2E: `npx playwright test --retries=0 --reporter=line` dans `/frontend` => `8 passed`.
