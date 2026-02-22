# API Services - Schools, Groups, Schedule

## Schools Service (`/api/schools` via Gateway)
- **GET** `/api/schools` — list schools (filters: `name`, `status`)
- **GET** `/api/schools/{id}` — get one
- **POST** `/api/schools` — create
- **PUT** `/api/schools/{id}` — update
- **DELETE** `/api/schools/{id}` — delete
- **GET** `/api/schools/stats` — counts `{ total, active, inactive }`

Request body (create/update example):
```json
{
  "name": "Faculté Sciences",
  "address": "Rue 123",
  "phone": "+212600000000",
  "email": "sci@example.com",
  "status": "ACTIVE"
}
```

## Groups Service (`/api/groups` via Gateway)
- **GET** `/api/groups` — list (filters: `name`, `level`, `schoolId`, `status`)
- **GET** `/api/groups/{id}` — get one
- **POST** `/api/groups` — create
- **PUT** `/api/groups/{id}` — update
- **DELETE** `/api/groups/{id}` — delete
- **GET** `/api/groups/stats` — counts `{ total, active, inactive }`

Request body example:
```json
{
  "name": "L1-INFO-A",
  "level": "L1",
  "schoolId": 1,
  "size": 30,
  "status": "ACTIVE"
}
```

## Schedule Service (`/api/schedule` via Gateway)
- **GET** `/api/schedule` — list with filters: `courseId`, `teacherId`, `roomId`, `groupId`, `status`, `startFrom`, `endTo` (ISO date-time)
- **GET** `/api/schedule/{id}` — get one
- **POST** `/api/schedule` — create (conflict check room/teacher/group)
- **PUT** `/api/schedule/{id}` — update (conflict check)
- **DELETE** `/api/schedule/{id}` — delete
- **GET** `/api/schedule/stats` — counts `{ total, scheduled, completed, cancelled }`

Request body example:
```json
{
  "courseId": "1",
  "teacherId": "1",
  "roomId": "1",
  "groupId": "1",
  "startTime": "2026-01-08T10:00:00",
  "endTime": "2026-01-08T12:00:00",
  "status": "SCHEDULED"
}
```

### Notes
- Auth: routed through Gateway with `JwtAuthenticationFilter`; include `Authorization: Bearer <token>` when required.
- Validation: create/update expects valid fields; schedule enforces `endTime` after `startTime` and rejects overlaps on room/teacher/group.

## Students Service (`/api/students` via Gateway)
- **GET** `/api/students` — list (filters: `matricule`, `nom`, `prenom`, `email`, `status`, `groupId`)
- **GET** `/api/students/{id}` — get one
- **POST** `/api/students` — create
- **PUT** `/api/students/{id}` — update
- **DELETE** `/api/students/{id}` — delete
- **POST** `/api/students/{id}/groups/{groupId}` — add group to student
- **DELETE** `/api/students/{id}/groups/{groupId}` — remove group from student

Request body example:
```json
{
  "matricule": "ETU-2026-001",
  "nom": "Doe",
  "prenom": "Jane",
  "dateNaissance": "2004-05-21",
  "email": "jane.doe@example.com",
  "status": "ACTIVE",
  "groupIds": [1, 2]
}
```
