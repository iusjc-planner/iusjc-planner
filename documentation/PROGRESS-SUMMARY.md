# Resume de progression - IUSJ Planner

Date de mise a jour: 25 Mars 2026

---

## 1. Vue globale

Ce resume consolide la progression backend + frontend avec alignement sur les audits transversaux.

Strategie frontend validee: migration Big-bang vers `/web`.

---

## 2. Backend - etat actuel

Statut global estime: 30-35% sur le plan tickets de conformite projet.

- Tickets backend totaux: 17
- En cours: 6
- A faire: 11
- Termines: 0

Points avances:

- Architecture microservices operationnelle (gateway + eureka + services coeur).
- CRUD principal disponible sur plusieurs domaines.
- Service notification present techniquement.

Points non clos:

- forgot/reset password.
- SMTP et notifications email.
- reporting/export complet.
- completion evenements et certains volets EDT.

Reference detaillee:

- `AUDIT-BACKEND.md`
- `TICKETS-IMPLEMENTATION.md`
- `tickets/README.md`

---

## 3. Frontend - etat actuel

### 3.1 Frontend historique `/frontend`

- Plus mature sur l'integration backend actuelle.
- Contient des bases auth/RBAC/services deja exploitees.
- Sert de reference fonctionnelle pendant la migration.

### 3.2 Frontend cible `/web`

- Base technique moderne (Angular 20, standalone, PrimeNG).
- Potentiel UX superieur.
- Parite metier complete pas encore atteinte.

Reference detaillee:

- `AUDIT-FRONTEND-WEB.md`
- `PLAN-MIGRATION-FRONTEND-WEB.md`
- `tickets/README-FRONTEND.md`

---

## 4. Migration frontend (Big-bang)

Etat: planifiee, en phase d'implementation documentaire et ticketing.

Priorites immediates:

1. Core web: auth, guards RBAC, interceptors, service layer.
2. Pages metier critiques: dashboard, users, planning, notifications.
3. Qualite: tests unitaires + E2E parcours critiques.
4. Cutover: checklist Go/No-Go puis bascule officielle vers `/web`.

---

## 5. Exploitation et scripts

Scripts alignes avec la cible `/web`:

- `start-services.ps1` lance `/web` par defaut et inclut `iusj-notification-service`.
- `stop-services.ps1` arrete les processus IUSJ de maniere ciblee.

Option de transition:

- `start-services.ps1 -UseLegacyFrontend` pour lancer `/frontend` temporairement.

---

## 6. Risques et dependances

Principaux risques:

1. Perte de parite fonctionnelle au cutover si tickets P0/P1 incomplets.
2. Regressions auth/RBAC si migration partielle.
3. Incompletude backend sur flux critiques (password reset, reporting).

Dependances externes:

1. SMTP (reset + notifications email).
2. Moteur export PDF/Excel.
3. Stockage supports.
4. Messaging async recommande pour notification event-driven.

---

## 7. Prochain jalon recommande

Atteindre un jalon de pre-cutover avec:

1. Tickets FE-CORE-001 a FE-CORE-004 termines.
2. Tickets FE-PAGE-001 a FE-PAGE-004 termines.
3. Validation E2E critique au vert.
4. Revue Go/No-Go formelle.
