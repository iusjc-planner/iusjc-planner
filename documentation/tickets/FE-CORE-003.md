# FE-CORE-003 - Interceptors HTTP et gestion erreurs

Priorite: P0  
Statut: Termine  
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

- [x] Interceptor auth.
- [x] Interceptor errors.
- [x] Brancher notifications UI.
- [x] Journaliser erreurs frontend utiles.
- [x] Tests unitaires interceptors.

## Avancement implementation

Implementation finalisee dans /web:

- `web/src/app/core/interceptors/auth.interceptor.ts`
- `web/src/app/core/interceptors/error.interceptor.ts`
- `web/src/app/core/services/notification.service.ts`
- `web/src/app.config.ts`
- `web/src/app.component.ts`
- Specs ajoutees: `web/src/app/core/interceptors/auth.interceptor.spec.ts`, `web/src/app/core/interceptors/error.interceptor.spec.ts`

## Verification

- Interceptors auth/error verifies sur scenarios 401/403/5xx (logout, redirections, notifications).
- Tests unitaires interceptors valides dans la suite web (`35 SUCCESS`) avec `CHROME_BIN` pointe sur Edge local.
