# FE-QUAL-001 - Campagne qualite frontend

## Objectif

Mettre en place une campagne de tests frontend reproductible et partageable:
- Unit tests Angular avec couverture minimale.
- E2E automatises sur parcours critiques.
- Publication des rapports dans la CI.

## Commandes locales

Depuis `frontend/`:

```bash
npm run test:ci
npm run e2e:ci
```

## Couverture unitaire minimale

Seuils globaux definis dans `frontend/karma.conf.js`:
- Statements: 60%
- Branches: 45%
- Functions: 55%
- Lines: 60%

## Scenarios E2E automatises

- Login: `frontend/e2e/auth-login.spec.ts`
- Navigation role: `frontend/e2e/navigation-role.spec.ts`
- CRUD utilisateur: `frontend/e2e/users-crud.spec.ts`
- Planning principal: `frontend/e2e/planning-main.spec.ts`

## Rapports partageables (CI)

Workflow CI mis a jour:
- Artefact couverture unitaire: `frontend-unit-coverage`
- Artefact E2E Playwright: `frontend-e2e-report`

Fichier workflow:
- `.github/workflows/ci-cd.yml`
