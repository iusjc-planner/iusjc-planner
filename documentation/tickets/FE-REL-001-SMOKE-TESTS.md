# FE-REL-001 - Pack Smoke Tests Post-Cutover

Date: 26 Mars 2026  
Ticket: FE-REL-001

---

## Objectif

Verifier en quelques minutes que les parcours critiques restent exploitables juste apres la bascule vers /web.

---

## Cas critiques

| ID | Cas smoke | Attendu |
|---|---|---|
| ST-01 | Login utilisateur valide | Session ouverte, redirection dashboard |
| ST-02 | Logout | Session fermee, retour page login |
| ST-03 | Expiration session JWT | Redirection controlee vers login |
| ST-04 | Navigation role admin | Acces routes admin autorise |
| ST-05 | Navigation role enseignant | Acces routes enseignant autorise |
| ST-06 | Protection RBAC | Route interdite refusee correctement |
| ST-07 | CRUD utilisateur principal | Liste chargee et action simple reussie |
| ST-08 | Planning principal | Vue chargee sans erreur bloquante |

---

## Criteres de succes

1. Tous les cas ST-01 a ST-08 sont PASS.
2. Aucun blocage severite haute pendant l execution.
3. Temps total du pack compatible fenetre de bascule.

## Criteres d echec

1. Un seul cas critique en FAIL.
2. Erreur bloquante auth/RBAC.
3. Erreur repetee API sur parcours coeur.

---

## Trace execution

| ID | Resultat | Evidence | Commentaire |
|---|---|---|---|
| ST-01 | PASS (pre-cutover) | frontend/e2e/auth-login.spec.ts | Login valide couvert en E2E automatise. |
| ST-02 | PASS (pre-cutover) | frontend/e2e/auth-session.spec.ts | Logout route et purge session verifies en E2E automatise. |
| ST-03 | PASS (pre-cutover) | frontend/e2e/auth-session.spec.ts | Redirection login avec token expire verifiee en E2E automatise. |
| ST-04 | PASS (pre-cutover) | frontend/e2e/navigation-role.spec.ts | Acces admin controle sur route critique. |
| ST-05 | PASS (pre-cutover) | frontend/e2e/navigation-role.spec.ts | Parcours enseignant et protection d acces verifies. |
| ST-06 | PASS (pre-cutover) | frontend/e2e/navigation-role.spec.ts | Refus d acces enseignant sur route admin verifie. |
| ST-07 | PASS (pre-cutover) | frontend/e2e/users-crud.spec.ts | Chargement liste + suppression utilisateur verifies. |
| ST-08 | PASS (pre-cutover) | frontend/e2e/planning-main.spec.ts | Chargement planning principal verifie. |

Etat du pack (pre-cutover): PASS

1. Cas pre-couverts par automatisation: ST-01 a ST-08.
2. Cas restants a valider en fenetre cutover: re-execution rapide ST-01 a ST-08 en contexte reel de bascule.
