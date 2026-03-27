# API Services - Etat transversal

Date de mise a jour: 25 Mars 2026  
Portee: APIs backend via Gateway

---

## 1. Convention d'acces

- Point d'entree unique: `http://localhost:8080`
- Auth: `Authorization: Bearer <token>` sur routes protegees
- Discovery: Eureka (`http://localhost:8761`)

---

## 2. Services exposes et statut

| Domaine | Base path (Gateway) | Statut API | Notes |
|---|---|---|---|
| Auth | `/auth/*` | Partiel | Login OK, reset password manquant |
| Users | `/api/users/*` | Operationnel | CRUD + checks login/email |
| Teachers | `/api/teachers/*` | Operationnel | CRUD + disponibilites + import ICS |
| Schools | `/api/schools/*` | Operationnel | CRUD + stats + filieres |
| Groups | `/api/groups/*` | Partiel | CRUD OK, relation filiere a completer |
| Rooms | `/api/rooms/*` | Operationnel | CRUD + reservations |
| Courses | `/api/courses/*` | Operationnel | CRUD + filtres |
| Schedule | `/api/schedule/*` | Partiel | CRUD + conflits OK, publication/export a completer |
| Students | `/api/students/*` | Operationnel | CRUD + lien groupes |
| Resources | `/api/resources/*` | Partiel | CRUD OK, reservation equipements a completer |
| Notifications | `/api/notifications/*` | Partiel | Service existe, integration metier transverse a finaliser |
| Events | `/api/events/*` | A completer | Couverture metier non finalisee |
| Reports | `/api/reports/*` | A completer | Reporting/export metier non finalise |

---

## 3. Endpoints principaux (resume)

## 3.1 Auth

- `POST /auth/login`
- `POST /auth/logout` (cote client/session)
- `POST /auth/forgot-password` (attendu, non confirme)
- `POST /auth/reset-password` (attendu, non confirme)

## 3.2 Users

- `GET /api/users`
- `GET /api/users/{id}`
- `POST /api/users`
- `PUT /api/users/{id}`
- `DELETE /api/users/{id}`
- `GET /api/users/check-email?email=...`
- `GET /api/users/check-login?login=...`

## 3.3 Teachers

- `GET /api/teachers`
- `GET /api/teachers/{id}`
- `POST /api/teachers`
- `PUT /api/teachers/{id}`
- `DELETE /api/teachers/{id}`
- `GET /api/teachers/{id}/availability`
- `POST /api/teachers/{id}/availability/import-ics`

## 3.4 Schools

- `GET /api/schools`
- `GET /api/schools/{id}`
- `POST /api/schools`
- `PUT /api/schools/{id}`
- `DELETE /api/schools/{id}`
- `GET /api/schools/stats`

## 3.5 Groups

- `GET /api/groups`
- `GET /api/groups/{id}`
- `POST /api/groups`
- `PUT /api/groups/{id}`
- `DELETE /api/groups/{id}`
- `GET /api/groups/stats`

## 3.6 Rooms

- `GET /api/rooms`
- `GET /api/rooms/{id}`
- `POST /api/rooms`
- `PUT /api/rooms/{id}`
- `DELETE /api/rooms/{id}`
- `GET /api/rooms/available`
- `POST /api/rooms/{id}/reserve`
- `GET /api/rooms/{id}/reservations`
- `DELETE /api/rooms/{id}/reservations/{reservationId}`

## 3.7 Courses

- `GET /api/courses`
- `GET /api/courses/{id}`
- `POST /api/courses`
- `PUT /api/courses/{id}`
- `DELETE /api/courses/{id}`
- `GET /api/courses/stats`

## 3.8 Schedule

- `GET /api/schedule`
- `GET /api/schedule/{id}`
- `POST /api/schedule`
- `PUT /api/schedule/{id}`
- `DELETE /api/schedule/{id}`
- `GET /api/schedule/stats`
- `POST /api/schedule/generate` (selon implementation)

## 3.9 Students

- `GET /api/students`
- `GET /api/students/{id}`
- `POST /api/students`
- `PUT /api/students/{id}`
- `DELETE /api/students/{id}`
- `POST /api/students/{id}/groups/{groupId}`
- `DELETE /api/students/{id}/groups/{groupId}`

## 3.10 Resources

- `GET /api/resources`
- `GET /api/resources/{id}`
- `POST /api/resources`
- `PUT /api/resources/{id}`
- `DELETE /api/resources/{id}`
- `GET /api/resources/stats`

## 3.11 Notifications

- `GET /api/notifications`
- `GET /api/notifications/unread`
- `GET /api/notifications/unread-count`
- `POST /api/notifications`
- `POST /api/notifications/broadcast`
- `PUT /api/notifications/{id}/read`
- `PUT /api/notifications/read-all`
- `DELETE /api/notifications/{id}`

## 3.12 Events (cible)

- `GET /api/events`
- `GET /api/events/{id}`
- `POST /api/events`
- `PUT /api/events/{id}`
- `DELETE /api/events/{id}`

## 3.13 Reports (cible)

- `POST /api/reports/generate`
- `GET /api/reports`
- `GET /api/reports/{id}`
- `GET /api/reports/{id}/export?format=pdf|excel`
- `DELETE /api/reports/{id}`

---

## 4. Dependances externes associees APIs

| Besoin | Usage API |
|---|---|
| SMTP | forgot/reset password, notifications email |
| Stockage fichiers | supports de cours et assets export |
| Moteur export PDF/Excel | endpoints reports et exports planning |
| Messaging async (recommande) | propagation evenements metier -> notifications |

---

## 5. References de coherence

- Audit backend: `AUDIT-BACKEND.md`
- Suivi tickets backend: `TICKETS-IMPLEMENTATION.md`
- Tickets backend/frontend: `tickets/README.md`, `tickets/README-FRONTEND.md`
