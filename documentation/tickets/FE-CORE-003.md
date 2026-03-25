# FE-CORE-003 - Interceptors HTTP et gestion erreurs

Priorite: P0  
Statut: A faire  
Estimation: 2 jours  
Dependances: FE-CORE-001

## Description

Ajouter les interceptors necessaires pour injecter Authorization Bearer et traiter les erreurs globales (401/403/5xx).

## Critères d'acceptation

- Token ajoute automatiquement hors endpoints publics.
- 401 force logout + redirection login.
- 403 affiche message d'autorisation.
- 5xx affiche feedback utilisateur explicite.

## Taches

- Interceptor auth.
- Interceptor errors.
- Brancher notifications UI.
- Journaliser erreurs frontend utiles.
- Tests unitaires interceptors.

## Verification

- Tests manuels d'erreurs API simulees.
