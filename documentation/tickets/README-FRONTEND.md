# Tickets frontend web - index et pilotage migration

Date de creation: 25 Mars 2026  
Perimetre: nouveau frontend cible /web

---

## 1. Vue d'ensemble

| Metrique | Valeur |
|---|---|
| Nombre total de tickets frontend | 12 |
| Strategie | Migration Big-bang |
| Objectif | Basculer /frontend vers /web avec parite metier minimale |

---

## 2. Index des tickets

### P0 - Critique

| ID | Titre | Estimation | Dependances |
|---|---|---|---|
|. [FE-CORE-001](./FE-CORE-001.md) | Auth JWT et session | 3j | - |
|. [FE-CORE-002](./FE-CORE-002.md) | Guards RBAC | 2j | FE-CORE-001 |
|. [FE-CORE-003](./FE-CORE-003.md) | Interceptors HTTP et gestion erreurs | 2j | FE-CORE-001 |
|. [FE-CORE-004](./FE-CORE-004.md) | Service layer API metier | 4j | FE-CORE-003 |
| [FE-REL-001](./FE-REL-001.md) | Cutover Big-bang vers /web | 2j | FE-QUAL-001 |

### P1 - Haute

| ID | Titre | Estimation | Dependances |
|---|---|---|---|
|. [FE-PAGE-001](./FE-PAGE-001.md) | Dashboard et navigation metier | 3j | FE-CORE-002, FE-CORE-004 |
|. [FE-PAGE-002](./FE-PAGE-002.md) | Module utilisateurs (liste, form, detail) | 4j | FE-CORE-004 |
|. [FE-PAGE-003](./FE-PAGE-003.md) | Planning + drag and drop metier | 5j | FE-CORE-004 |
|. [FE-PAGE-004](./FE-PAGE-004.md) | Centre de notifications | 2j | FE-CORE-004 |
|. [FE-PAGE-005](./FE-PAGE-005.md) | Rapports et exports UI | 3j | BE-REPORT-001, FE-CORE-004 |

### P2 - Moyenne

| ID | Titre | Estimation | Dependances |
|---|---|---|---|
| [FE-UX-001](./FE-UX-001.md) | Coherence UI/ergonomie et design system | 3j | FE-PAGE-001 |
| [FE-QUAL-001](./FE-QUAL-001.md) | Campagne qualite frontend (tests) | 3j | Core + Pages |

---

## 3. Ordonnancement recommande

Sprint F1 (socle):
1. FE-CORE-001
2. FE-CORE-002
3. FE-CORE-003
4. FE-CORE-004

Sprint F2 (parite metier):
1. FE-PAGE-001
2. FE-PAGE-002
3. FE-PAGE-003
4. FE-PAGE-004
5. FE-PAGE-005

Sprint F3 (stabilisation + bascule):
1. FE-UX-001
2. FE-QUAL-001
3. FE-REL-001

---

## 4. Conditions de bascule /web

1. Tous les tickets P0 termines.
2. Tickets P1 critiques valides (au minimum FE-PAGE-001 a FE-PAGE-004).
3. Tests E2E critiques au vert.
4. Validation metier admin + enseignant.

---

## 5. Liens de reference

- Audit frontend/web: ../AUDIT-FRONTEND-WEB.md
- Plan migration Big-bang: ../PLAN-MIGRATION-FRONTEND-WEB.md
- Audit backend: ../AUDIT-BACKEND.md
- Suivi backend: ../TICKETS-IMPLEMENTATION.md

---

## 6. Avancement FE-REL-001

Implementation demarree en mode conditionnel (sans cutover effectif).
Etat readiness courant: NO-GO (snapshot date du 2026-03-26).

Etat des prerequis P0:

- FE-CORE-001: termine
- FE-CORE-002: termine
- FE-CORE-003: termine
- FE-CORE-004: termine
- FE-REL-001: en cours (cutover non execute)

Cause principale du NO-GO actuel:

- FE-REL-001 non execute (cutover, smoke post-bascule et hypercare restent a faire)
- FE-UX-001 non pret (coherence UI transversale)

Livrables operationnels prepares:

- [FE-REL-001-GO-NO-GO-CHECKLIST.md](./FE-REL-001-GO-NO-GO-CHECKLIST.md)
- [FE-REL-001-CUTOVER-ROLLBACK-RUNBOOK.md](./FE-REL-001-CUTOVER-ROLLBACK-RUNBOOK.md)
- [FE-REL-001-SMOKE-TESTS.md](./FE-REL-001-SMOKE-TESTS.md)
- [FE-REL-001-HYPERCARE.md](./FE-REL-001-HYPERCARE.md)
- [FE-REL-001-READINESS-SNAPSHOT-2026-03-26.md](./FE-REL-001-READINESS-SNAPSHOT-2026-03-26.md)
- [FE-REL-001-UNBLOCKING-MATRIX.md](./FE-REL-001-UNBLOCKING-MATRIX.md)

Gate de bascule maintenu:

1. Prerequis tickets termines et valides.
2. Tests critiques au vert.
3. Validation Go/No-Go formelle.
