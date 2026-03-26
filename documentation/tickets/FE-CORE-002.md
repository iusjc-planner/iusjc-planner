# FE-CORE-002 - Guards RBAC

Priorite: P0  
Statut: Termine  
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

- [x] Creer auth guard.
- [x] Creer role guard.
- [x] Annoter routes admin/enseignant.
- [x] Ajouter fallback route interdite.
- [x] Tests unitaires guards.

## Avancement implementation

Implementation finalisee dans /web:

- `web/src/app/core/guards/auth.guard.ts`
- `web/src/app/core/guards/role.guard.ts`
- `web/src/app.routes.ts`
- `web/src/app/pages/pages.routes.ts`
- Specs ajoutees: `web/src/app/core/guards/auth.guard.spec.ts`, `web/src/app/core/guards/role.guard.spec.ts`

## Verification

- Scenarios anonyme/admin/enseignant verifies par configuration de routes + guards.
- Tests unitaires guards valides dans la suite web (`35 SUCCESS`) avec `CHROME_BIN` pointe sur Edge local.
