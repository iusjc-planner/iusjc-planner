# FE-PAGE-002 - Module utilisateurs (liste, form, detail)

Priorite: P1  
Statut: Termine  
Estimation: 4 jours  
Dependances: FE-CORE-004

## Description

Migrer et stabiliser le module utilisateurs de /frontend vers /web en UX moderne, avec filtres, pagination, edition et detail.

## Critères d'acceptation

- Liste utilisateurs paginee et filtrable.
- Creation/modification/suppression fonctionnelles.
- Ecran detail utilisateur exploitable.
- Validation formulaire claire.

## Taches

- [x] Table utilisateurs PrimeNG.
- [x] Formulaire reactive forms.
- [x] Validation role/status/ecoles.
- [x] Liaison API users/schools.

## Avancement implementation

- Module utilisateurs branche sur API dans `web/src/app/pages/admin/utilisateurs.ts` (chargement + CRUD via `UserService`).
- Liste filtrable implementee (texte, role, statut) avec pagination table PrimeNG.
- Ecran detail utilisateur exploitable via dialogue de visualisation.
- Formulaire utilisateur migre en reactive forms (`FormBuilder`, validateurs requis + email).
- Liaison schools activee via `SchoolService` avec selection multiple d ecoles dans le formulaire.
- Validation formulaire explicite avant appel API (messages de validation utilisateur).
- Test unitaire ajoute pour le module utilisateurs dans `web/src/app/pages/admin/utilisateurs.spec.ts`.

## Verification

- Validation CRUD utilisateur couverte par E2E: `frontend/e2e/users-crud.spec.ts`.
- Validation E2E complete: `npx playwright test --retries=0 --reporter=line` dans `/frontend` => `6 passed (20.5s)`.
- Validation technique /web: `npm run test -- --watch=false --browsers=ChromeHeadless --code-coverage` => `58 SUCCESS`.
- Couverture /web mesuree: Statements `59.14%`, Branches `41.13%`, Functions `52.07%`, Lines `59.52%`.
