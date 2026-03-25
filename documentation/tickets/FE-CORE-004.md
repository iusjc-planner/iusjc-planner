# FE-CORE-004 - Service layer API metier

Priorite: P0  
Statut: A faire  
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

- Creer models metier Typescript.
- Creer service par domaine.
- Remplacer appels demo/static.
- Ajouter validations de payload.
- Tests unitaires service layer.

## Verification

- Smoke test API de chaque domaine.
