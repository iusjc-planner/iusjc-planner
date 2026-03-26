# FE-PAGE-004 - Centre de notifications

Priorite: P1  
Statut: Termine  
Estimation: 2 jours  
Dependances: FE-CORE-004

## Description

Integrer la lecture des notifications utilisateur, compteur non lu, marquage lu et suppression.

## Critères d'acceptation

- Liste notifications chargee depuis backend.
- Badge non-lu visible dans le header.
- Marquer lu / marquer tout lu operationnel.
- Suppression individuelle operationnelle.

## Taches

- [x] Ecran notifications /web.
- [x] Composant badge/header.
- [x] Service notifications complet.
- [x] Polling ou refresh intelligent.

## Avancement implementation

- Centre de notifications backend deja branche dans `web/src/app/pages/admin/notifications.ts` avec chargement, marquage unitaire, marquage global et suppression.
- Badge non lu ajoute au header dans `web/src/app/layout/component/app.topbar.ts` (compteur calcule sur `NotificationApiService`).
- Rafraichissement intelligent implemente via polling toutes les 30s dans le topbar.
- Navigation role-based header: admin vers `/pages/admin/notifications`, non-admin vers `/pages/notifications`.
- Routes non-admin ajoutees dans `web/src/app/pages/pages.routes.ts` (`notifications`, `profil`) pour supprimer les impasses fonctionnelles.
- Menu parametres non-admin mis a jour dans `web/src/app/layout/component/app.menu.ts`.
- Tests unitaires ajoutes pour le topbar dans `web/src/app/layout/component/app.topbar.spec.ts`.
- Tests unitaires ajoutes pour le centre de notifications dans `web/src/app/pages/admin/notifications.spec.ts`.

## Verification

- Test end-to-end notification utilisateur ajoute: `frontend/e2e/notifications-center.spec.ts`.
- Verification E2E ciblee: `npx playwright test e2e/notifications-center.spec.ts --retries=0 --reporter=line` dans `/frontend` => `1 passed`.
- Verification E2E complete: `npx playwright test --retries=0 --reporter=line` dans `/frontend` => `6 passed (13.8s)`.
- Validation technique complementaire: suite unitaire /web verte (`58 SUCCESS`) avec `CHROME_BIN` pointe sur Edge local.
