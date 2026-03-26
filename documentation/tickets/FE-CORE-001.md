# FE-CORE-001 - Auth JWT et session

Priorite: P0  
Statut: Termine  
Estimation: 3 jours  
Dependances: aucune

## Description

Implementer le socle authentification dans /web avec login/logout, stockage token, expiration et redirection par role.

## Critères d'acceptation

- Login fonctionnel via gateway auth.
- Token JWT stocke et relu au refresh.
- Deconnexion nettoie session.
- Token expire force retour login.
- Redirection role-based (admin/enseignant).

## Taches

- [x] Creer AuthService /web.
- [x] Gerer decode JWT (claims role, exp).
- [x] Ajouter mecanisme expiration.
- [x] Integrer page login avec appel auth.
- [x] Integrer logout dans UI globale.
- [x] Ajouter tests unitaires auth.

## Avancement implementation

Implementation finalisee dans /web:

- `web/src/app/core/services/auth.service.ts`
- `web/src/app/core/models/auth.model.ts`
- `web/src/app/pages/auth/login.ts`
- `web/src/app/layout/component/app.menu.ts`
- `web/src/app/layout/component/app.topbar.ts`
- Spec ajoutee: `web/src/app/core/services/auth.service.spec.ts`
- Spec ajoutee: `web/src/app/layout/component/app.menu.spec.ts`

## Verification

- Validation technique login/logout/session sur routes protegees.
- Verification expiration token via `AuthService.isAuthenticated()` + purge session.
- Verification redirection role-based via `AuthService.redirectByRole()`.
- Logout global branche (menu lateral + topbar) sur `AuthService.logout()`.
- Tests unitaires auth/layout valides dans la suite web (`35 SUCCESS`) avec `CHROME_BIN` pointe sur Edge local.
