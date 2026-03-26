# FE-CORE-004 - Service layer API metier

Priorite: P0  
Statut: Termine  
Estimation: 4 jours  
Dependances: FE-CORE-003

## Description

Construire les services metier /web relies au backend via gateway: users, teachers, rooms, courses, schedule, groups, schools, notifications.

## Critères d'acceptation

- Tous les services CRUD de base operationnels.
- Configuration env centralisee.
- Gestion erreurs homogène.
- Typage modele coherent.

## Taches

- [x] Creer models metier Typescript.
- [x] Creer service par domaine.
- [x] Remplacer appels demo/static.
- [x] Ajouter validations de payload.
- [x] Tests unitaires service layer.

## Avancement implementation

Socle service layer finalise dans /web:

- Config API: `web/src/app/core/config/api-endpoints.ts`
- Models metier: `web/src/app/core/models/*.model.ts`
- Services metier: `web/src/app/core/services/user.service.ts`, `teacher.service.ts`, `room.service.ts`, `course.service.ts`, `schedule.service.ts`, `group.service.ts`, `school.service.ts`, `notification-api.service.ts`, `report.service.ts`
- Integration demarree sur page admin utilisateurs: `web/src/app/pages/admin/utilisateurs.ts` (chargement + CRUD via `UserService`)
- Integration demarree sur page admin rapports: `web/src/app/pages/admin/rapports.ts` (generation + telechargement via `ReportService`)
- Integration demarree sur page admin enseignants: `web/src/app/pages/admin/enseignants.ts` (chargement + CRUD via `TeacherService`)
- Integration demarree sur page admin notifications: `web/src/app/pages/admin/notifications.ts` (liste, marquage lu, suppression via `NotificationApiService`)
- Integration demarree sur page admin salles: `web/src/app/pages/admin/salles.ts` (chargement + suppression via `RoomService`)
- Integration demarree sur page admin cours: `web/src/app/pages/admin/cours.ts` (chargement + suppression via `CourseService`)
- Integration demarree sur page admin groupes: `web/src/app/pages/admin/groupes.ts` (chargement + suppression via `GroupService`)
- Integration demarree sur page admin emploi du temps: `web/src/app/pages/admin/emploi-du-temps.ts` (chargement + filtres + stats via `ScheduleService`)
- Integration demarree sur page admin evenements: `web/src/app/pages/admin/evenements.ts` (chargement + suppression via `NotificationApiService`)
- Integration demarree sur page admin examens: `web/src/app/pages/admin/examens.ts` (chargement + suppression via `ScheduleService`, enrichi via `CourseService` et `RoomService`)
- Integration demarree sur page admin ressources: `web/src/app/pages/admin/ressources.ts` (chargement + suppression via `RoomService`)
- Spec service layer ajoutee: `web/src/app/core/services/room.service.spec.ts`
- Specs service layer ajoutees: `web/src/app/core/services/course.service.spec.ts`, `web/src/app/core/services/group.service.spec.ts`, `web/src/app/core/services/schedule.service.spec.ts`
- Validations payload ajoutees dans `web/src/app/core/services/user.service.ts` et `web/src/app/core/services/teacher.service.ts` (champs requis + format email)
- UI admin alignee pour remonter les erreurs de validation: `web/src/app/pages/admin/utilisateurs.ts`, `web/src/app/pages/admin/enseignants.ts`
- Specs service layer ajoutees: `web/src/app/core/services/user.service.spec.ts`, `web/src/app/core/services/teacher.service.spec.ts`
- Spec service layer ajoutee: `web/src/app/core/services/school.service.spec.ts`
- Spec service layer ajoutee: `web/src/app/core/services/notification-api.service.spec.ts`
- Spec service layer ajoutee: `web/src/app/core/services/report.service.spec.ts`
- Validations payload ajoutees dans `web/src/app/core/services/school.service.ts` et `web/src/app/core/services/report.service.ts`

## Verification

- Smoke test API de chaque domaine.
- Tests unitaires service layer completes (User/Teacher/Room/Course/Group/Schedule/School/NotificationApi/Report) et valides dans la suite web (`35 SUCCESS`) avec `CHROME_BIN` pointe sur Edge local.
- Validation non regression apres migration pages admin (evenements/examens/ressources): suite web toujours `35 SUCCESS`.
