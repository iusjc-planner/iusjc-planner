# FE-REL-001 - Matrice de Deblocage (pre-cutover)

Date: 26 Mars 2026  
Objectif: lever les blocages FE-REL-001 en fermant les tickets prerequis dans l ordre minimum de risque.

---

## 1) Ordre d execution recommande

1. FE-CORE-001
2. FE-CORE-002
3. FE-CORE-003
4. FE-CORE-004
5. FE-PAGE-001
6. FE-PAGE-002
7. FE-PAGE-003
8. FE-PAGE-004
9. FE-UX-001
10. FE-QUAL-001
11. Revalidation Go/No-Go FE-REL-001

---

## 2) Matrice ticket par ticket

| Ticket | Etat actuel | Blocage principal | Actions minimales a executer | Fichiers cibles /web | Critere de fermeture |
|---|---|---|---|---|---|
| FE-CORE-001 | TERMINE | Aucun blocage P0 residuel | Maintenir la surveillance en regression sur auth/session | web/src/app/core/services/auth.service.ts; web/src/app/core/models/auth.model.ts; web/src/app/pages/auth/login.ts; web/src/app/layout/** | Login/logout fonctionnel + expiration force retour login + redirection role validee |
| FE-CORE-002 | TERMINE | Aucun blocage P0 residuel | Maintenir la surveillance en regression sur guards/routes | web/src/app/core/guards/auth.guard.ts; web/src/app/core/guards/role.guard.ts; web/src/app.routes.ts; web/src/app/pages/pages.routes.ts | Scenarios anonyme/admin/enseignant valides |
| FE-CORE-003 | TERMINE | Aucun blocage P0 residuel | Maintenir la surveillance en regression sur interceptors/erreurs | web/src/app/core/interceptors/auth.interceptor.ts; web/src/app/core/interceptors/error.interceptor.ts; web/src/app/core/services/notification.service.ts; web/src/app.config.ts; web/src/app.component.ts | Bearer injecte hors public, 401 logout, 403 message, 5xx feedback |
| FE-CORE-004 | TERMINE | Aucun blocage P0 residuel | Maintenir la surveillance en regression sur services et pages admin migrees | web/src/app/core/config/api-endpoints.ts; web/src/app/core/services/*.service.ts; web/src/app/core/models/*.model.ts; web/src/app/pages/admin/*.ts | CRUD de base operationnel sur domaines critiques |
| FE-PAGE-001 | TERMINE | Aucun blocage majeur residuel | Maintenir tests de non-regression navigation et dashboards | web/src/app/pages/dashboard/**; web/src/app/layout/** | Menus differencies + routes sans impasse |
| FE-PAGE-002 | TERMINE | Aucun blocage majeur residuel | Maintenir tests de non-regression CRUD utilisateurs | web/src/app/pages/crud/**; web/src/app/pages/admin/** | CRUD utilisateur complet valide |
| FE-PAGE-003 | TERMINE | Aucun blocage majeur residuel | Maintenir regression tests sur planning + conflits | web/src/app/pages/emploi-du-temps/** | Scenarios conflits/non-conflits valides |
| FE-PAGE-004 | TERMINE | Aucun blocage majeur residuel | Maintenir regression tests notifications + topbar badge | web/src/app/pages/notifications/**; web/src/app/layout/component/** | E2E notification utilisateur passe |
| FE-UX-001 | NON PRET | Coherence UI transversale non finalisee | Uniformiser etats UI, accessibilite de base, conventions composants | web/src/app/layout/**; web/src/app/pages/** | Checklist ergonomie validee |
| FE-QUAL-001 | TERMINE | Aucun blocage majeur residuel | Maintenir executions de reference et publication du rapport qualite | frontend/e2e/**; web/src/**/*.spec.ts; .github/workflows/ci-cd.yml | Pipeline cible verte avec rapport partageable |

---

## 3) Verification de readiness FE-REL-001

FE-REL-001 peut passer de NO-GO a GO uniquement si:

1. Tous les tickets P0 sont termines.
2. FE-PAGE-001 a FE-PAGE-004 sont valides.
3. FE-QUAL-001 est termine avec tests critiques au vert.
4. Checklist Go/No-Go est 100% complete.

---

## 4) Evidence minimale attendue par ticket

1. Mise a jour du `Statut` dans le markdown du ticket.
2. Trace de verification (test run, capture, ou log) associee au ticket.
3. Validation fonctionnelle explicite (admin + enseignant pour parcours critiques).
4. Absence de regression critique sur auth/RBAC/navigation.

---

## 5) Point de controle quotidien

Template de suivi court:

| Date | Ticket en cours | Avancement | Blocage | Decision |
|---|---|---|---|---|
| A renseigner | A renseigner | A renseigner | A renseigner | A renseigner |
