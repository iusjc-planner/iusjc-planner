# FE-PAGE-001 - Dashboard et navigation metier

Priorite: P1  
Statut: Termine  
Estimation: 3 jours  
Dependances: FE-CORE-002, FE-CORE-004

## Description

Livrer dashboard admin/enseignant dans /web avec navigation role-based et indicateurs metiers de base.

## Critères d'acceptation

- Menus differencies par role.
- Dashboard admin avec KPI globaux.
- Dashboard enseignant avec planning personnel.
- Navigation sans route morte.

## Taches

- Adapter layout /web a la structure IUSJ.
- [x] Brancher stats backend.
- [x] Ajouter widgets KPI.
- [x] Finaliser menu role-based.
- [x] Dashboard enseignant avec planning personnel.
- [x] Navigation sans route morte (menu non-admin).

## Avancement implementation

- Menu principal differencie par role (admin vs non-admin) dans `web/src/app/layout/component/app.menu.ts`.
- Sections admin (`Gestion`, `Planification`, `Rapports`) cachees pour les non-admin.
- Dashboard cible adapte selon role (admin -> `/dashboard`, non-admin -> `/`).
- Widget KPI admin branche aux services backend (`TeacherService`, `ScheduleService`, `SchoolService`, `RoomService`) dans `web/src/app/pages/dashboard/components/admin-stats-widget.ts`.
- Agrégations metier en place: enseignants actifs, reservations en attente, ecoles, ressources disponibles/maintenance, taux d occupation et conflits.
- Dashboard enseignant implemente dans `web/src/app/pages/dashboard/dashboard.ts` avec planning personnel (ScheduleService) et notifications recentes (NotificationApiService).
- Liens admin de la section parametres masques pour les non-admin afin d eviter les routes bloquees RBAC.
- Tests unitaires menu ajoutes/etendus dans `web/src/app/layout/component/app.menu.spec.ts`.
- Test unitaire widget KPI admin ajoute dans `web/src/app/pages/dashboard/components/admin-stats-widget.spec.ts`.

## Verification

- Validation navigation role-based couverte par E2E: `frontend/e2e/navigation-role.spec.ts`.
- Validation E2E complete: `npx playwright test --retries=0 --reporter=line` dans `/frontend` => `6 passed (20.5s)`.
- Validation technique /web: `npm run test -- --watch=false --browsers=ChromeHeadless --code-coverage` => `58 SUCCESS`.
- Couverture /web mesuree: Statements `59.14%`, Branches `41.13%`, Functions `52.07%`, Lines `59.52%`.
