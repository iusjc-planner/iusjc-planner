# FE-CORE-002 - Guards RBAC

Priorite: P0  
Statut: A faire  
Estimation: 2 jours  
Dependances: FE-CORE-001

## Description

Securiser la navigation /web via guards auth et role, avec blocage des routes non autorisees.

## Critères d'acceptation

- Guard auth bloque utilisateur non connecte.
- Guard role bloque acces hors role.
- Routes critiques protegees.
- UX de redirection coherente.

## Taches

- Creer auth guard.
- Creer role guard.
- Annoter routes admin/enseignant.
- Ajouter fallback route interdite.
- Tests unitaires guards.

## Verification

- Scenarios anonyme/admin/enseignant valides.
