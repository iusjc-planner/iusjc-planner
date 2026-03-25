# IUSJ Planner - Postman

Ce dossier contient la collection Postman officielle backend pour BE-DOC-001.

## Fichiers

- `IUSJ-Planner-API.postman_collection.json`
- `Local.postman_environment.json`
- `Dev.postman_environment.json`
- `Prod.postman_environment.json`

## Variables d'environnement

Variables principales utilisees par la collection:

- `base_url` : URL du gateway
- `token` : JWT stocke automatiquement apres login
- `jwt_token` : alias du token
- `user_id`
- `school_id`
- `group_id`
- `teacher_id`
- `room_id`
- `course_id`
- `matiere_id`
- `student_id`
- `resource_id`
- `reservation_id`
- `schedule_id`
- `edt_id`

## Import Postman

1. Importer un environnement (`Local`, `Dev` ou `Prod`)
2. Importer la collection `IUSJ-Planner-API.postman_collection.json`
3. Selectionner l'environnement actif
4. Executer `Auth -> POST /auth/login` pour alimenter le token

## Organisation de la collection

- Auth
- Users
- Teachers
- Rooms
- Courses-Matieres
- Groups
- Schools-Filieres
- Schedule-EDT
- Students
- Resources

Chaque requete contient une description et la requete de login inclut des tests automatiques de base.
