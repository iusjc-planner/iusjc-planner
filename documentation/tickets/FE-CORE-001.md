# FE-CORE-001 - Auth JWT et session

Priorite: P0  
Statut: A faire  
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

- Creer AuthService /web.
- Gerer decode JWT (claims role, exp).
- Ajouter mecanisme expiration.
- Integrer pages login/logout.
- Ajouter tests unitaires auth.

## Verification

- Test manuel login/logout.
- Test expiration token.
- Test role redirection.
