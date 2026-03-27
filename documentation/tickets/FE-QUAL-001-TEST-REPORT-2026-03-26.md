# FE-QUAL-001 - Test Report (2026-03-26)

Ticket: FE-QUAL-001  
Statut: Termine  
Perimetre: validation qualite frontend (`/web` + `/frontend` E2E)

## 1) Runs de reference

### A. Unitaires `/web`

Commande executee:

```bash
npm run test -- --watch=false --browsers=ChromeHeadless --code-coverage
```

Resultat:

- `58 SUCCESS`

Couverture:

- Statements: `59.14%` (`472/798`)
- Branches: `41.13%` (`109/265`)
- Functions: `52.07%` (`138/265`)
- Lines: `59.52%` (`425/714`)

### B. E2E `/frontend`

Commande executee:

```bash
npx playwright test --retries=0 --reporter=line
```

Resultat:

- `8 passed (14.2s)`

Specs executees:

- `frontend/e2e/auth-login.spec.ts`
- `frontend/e2e/auth-session.spec.ts`
- `frontend/e2e/navigation-role.spec.ts`
- `frontend/e2e/users-crud.spec.ts`
- `frontend/e2e/planning-main.spec.ts`
- `frontend/e2e/notifications-center.spec.ts`

## 2) Gate qualite

- Gate unitaire: OK (`0 echec`).
- Gate E2E critique: OK (`0 echec`).
- Couverture mesuree et tracee: OK.

## 3) Conclusion

La campagne FE-QUAL-001 est consideree complete pour la baseline du 2026-03-26.
