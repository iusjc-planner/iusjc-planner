# Requirements Document

## Introduction

Ce document couvre l'implémentation des fonctionnalités restantes du projet IUSJ Planner. Après analyse complète du code existant, quatre domaines nécessitent une implémentation : (1) la page admin de gestion des enseignants (le backend et le service Angular existent déjà), (2) le microservice Resource Service backend (stub vide), (3) la page Ressources frontend connectée au vrai Resource Service, et (4) le Report Service backend (stub vide) avec un dashboard dynamique côté frontend.

## Glossaire

- **IUSJ Planner** : Système de gestion académique basé sur une architecture microservices Spring Boot + Angular
- **Resource Service** : Microservice Spring Boot gérant les ressources matérielles (projecteurs, ordinateurs, équipements) disponibles dans l'établissement
- **Report Service** : Microservice Spring Boot générant des rapports statistiques (utilisation salles, charge enseignants) en PDF/Excel
- **Teacher Page** : Page Angular CRUD pour la gestion administrative des enseignants (distincte de la page disponibilités enseignant)
- **Dashboard dynamique** : Tableau de bord Angular dont les statistiques sont chargées depuis les APIs backend en temps réel
- **Gateway** : API Gateway Spring Cloud sur port 8080 qui route les requêtes vers les microservices
- **Eureka** : Service Discovery Netflix sur port 8761
- **AdminStatsWidget** : Composant Angular du dashboard affichant les indicateurs clés
- **RecentActivitiesWidget** : Composant Angular du dashboard affichant les activités récentes

---

## Requirements

### Requirement 1 — Page Admin Gestion des Enseignants

**User Story:** As an administrator, I want a CRUD management page for teachers, so that I can create, view, edit, and delete teacher profiles linked to user accounts.

#### Acceptance Criteria

1. WHEN the administrator navigates to `/pages/admin/enseignants`, THE System SHALL display a paginated, searchable list of all teachers fetched from `GET /api/teachers`.
2. WHEN the administrator clicks "Ajouter enseignant", THE System SHALL display a dialog form allowing selection of an existing user (via dropdown from `/api/users`) and entry of specialities.
3. WHEN the administrator submits a valid teacher creation form, THE System SHALL call `POST /api/teachers` with `{ userId, specialities }` and refresh the list on success.
4. WHEN the administrator clicks the edit icon on a teacher row, THE System SHALL pre-fill the form with existing data and call `PUT /api/teachers/{id}` on submission.
5. WHEN the administrator clicks the delete icon on a teacher row, THE System SHALL display a confirmation dialog and call `DELETE /api/teachers/{id}` on confirmation.
6. THE System SHALL display teacher names by resolving `userId` against the users list, showing `nom prenom` from the User model.
7. THE System SHALL add a "Enseignants" menu item in the admin sidebar under the "Gestion" section, linking to `/pages/admin/enseignants`.

---

### Requirement 2 — Resource Service Backend

**User Story:** As an administrator, I want a resource management microservice, so that I can track and reserve physical resources (projectors, computers, equipment) across the institution.

#### Acceptance Criteria

1. THE Resource Service SHALL expose a REST API at `/api/resources` supporting CRUD operations: `GET /api/resources`, `GET /api/resources/{id}`, `POST /api/resources`, `PUT /api/resources/{id}`, `DELETE /api/resources/{id}`.
2. THE Resource Service SHALL persist resources with fields: `id`, `nom`, `type` (PROJECTEUR, ORDINATEUR, MATERIEL, AUTRE), `quantite`, `localisation`, `statut` (DISPONIBLE, RESERVE, MAINTENANCE).
3. WHEN a resource is created or updated, THE Resource Service SHALL validate that `nom` is not blank and `quantite` is greater than zero.
4. THE Resource Service SHALL register with Eureka and be routed by the Gateway at `/api/resources/**`.
5. THE Resource Service SHALL expose a `GET /api/resources/stats` endpoint returning `{ total, disponible, reserve, maintenance }`.

---

### Requirement 3 — Page Ressources Frontend

**User Story:** As an administrator, I want a resources management page connected to the real Resource Service, so that I can manage physical resources independently from rooms.

#### Acceptance Criteria

1. WHEN the administrator navigates to `/pages/admin/ressources`, THE System SHALL fetch and display resources from `GET /api/resources` (not from the room service).
2. WHEN the administrator clicks "Ajouter ressource", THE System SHALL display a dialog form with fields: nom, type (dropdown), quantite, localisation.
3. WHEN the administrator submits a valid resource form, THE System SHALL call `POST /api/resources` and refresh the list.
4. WHEN the administrator clicks the edit icon, THE System SHALL pre-fill the form and call `PUT /api/resources/{id}` on submission.
5. WHEN the administrator clicks the delete icon, THE System SHALL call `DELETE /api/resources/{id}` after confirmation.
6. THE System SHALL add a `ResourceService` Angular service in `web/src/app/core/services/resource.service.ts` calling `ApiEndpoints.resources`.

---

### Requirement 4 — Report Service Backend

**User Story:** As an administrator, I want a report generation microservice, so that I can generate and download statistical reports about room usage, teacher workload, and scheduling.

#### Acceptance Criteria

1. THE Report Service SHALL expose `POST /api/reports/generate` accepting `{ type, format, fromDate?, toDate? }` and returning report metadata `{ id, type, format, generatedAt, filePath }`.
2. THE Report Service SHALL expose `GET /api/reports/{id}/download` returning the generated file as a binary stream with appropriate `Content-Type` header.
3. THE Report Service SHALL expose `GET /api/reports` returning the list of previously generated reports.
4. WHEN `type` is `room-usage`, THE Report Service SHALL generate a report listing all rooms with their reservation counts.
5. WHEN `type` is `teacher-activity`, THE Report Service SHALL generate a report listing all teachers with their scheduled course counts.
6. THE Report Service SHALL register with Eureka and be routed by the Gateway at `/api/reports/**`.
7. IF the requested report type is unknown, THEN THE Report Service SHALL return HTTP 400 with an error message.

---

### Requirement 5 — Dashboard Dynamique Frontend

**User Story:** As an administrator, I want the dashboard to display real-time statistics from the backend APIs, so that I can monitor the current state of the system accurately.

#### Acceptance Criteria

1. THE AdminStatsWidget SHALL fetch teacher count from `GET /api/teachers` and display the real count (already partially implemented — needs verification of active status mapping).
2. THE AdminStatsWidget SHALL fetch group count from `GET /api/groups` and display total number of student groups.
3. THE RecentActivitiesWidget SHALL fetch recent schedule entries from `GET /api/schedule` and display the 5 most recent entries with course, teacher, and date information.
4. WHEN any API call fails, THE System SHALL display the last known value or zero without crashing the dashboard.
5. THE AdminStatsWidget SHALL fetch event count from `GET /api/events` and display upcoming events count.
