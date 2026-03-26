# Audit frontend et migration vers web

Date: 25 Mars 2026  
Portee: comparaison frontend actuel (/frontend) vs nouveau frontend cible (/web)

---

## 1. Objectif de l'audit

Cet audit evalue:

1. La qualite d'integration backend du frontend actuel (/frontend).
2. La qualite UI/UX et la maturite applicative du nouveau frontend (/web).
3. La coherence avec:
   - la logique metier backend,
   - la documentation projet,
   - les exigences de l'UE_Projet Transversal ISI (ergonomie, elements graphiques, drag and drop, fonctionnalites attendues).
4. La faisabilite d'une migration Big-bang vers /web.

---

## 2. Constats sur /frontend (actuel)

### 2.1 Integration backend

Niveau: Bon

Points positifs:
- Services API multiples deja en place (users, teachers, rooms, courses, schedule, groups, schools, matieres).
- Auth JWT active (service auth, guards, interceptors).
- Redirection selon role et controle d'acces deja implementes.
- BaseURL gateway en place dans les environnements.

Risques/dette:
- Quelques couplages encore heterogenes (URLs hardcodees selon modules).
- Qualite et homogeneite des patterns pas toujours uniformes.
- Couverture fonctionnelle inegale selon pages.

### 2.2 UX/UI

Niveau: Intermediaire

- Structure de navigation admin/enseignant correcte.
- Design coherent avec la charte existante du projet.
- Plusieurs pages restent partiellement implementees.
- Drag and drop metier non finalise pour la planification.

---

## 3. Constats sur /web (nouveau frontend cible)

### 3.1 Maturite technique

Niveau: Base template + architecture moderne

Points positifs:
- Angular 20 moderne, architecture standalone.
- PrimeNG + Tailwind disponibles pour UI plus robuste.
- Socle propre pour construire une UX plus professionnelle.

Ecarts critiques:
- Integration backend metier tres partielle a ce stade.
- Auth/RBAC de production non au niveau de /frontend actuel.
- Services metier du domaine IUSJ a consolider.

### 3.2 UX/UI

Niveau: Potentiel eleve, parite fonctionnelle insuffisante

- Potentiel visuel et ergonomique superieur a /frontend (components PrimeNG).
- Mais coherence metier encore incompletement materialisee (parcours, ecrans metiers, etats, erreurs, validations).
- Le drag and drop possible techniquement, mais non livre en experience metier complete.

---

## 4. Coherence avec exigences documentaires et UE

### 4.1 Elements graphiques et ergonomie

Statut: Partiellement conforme

- /frontend respecte partiellement la logique des ecrans metiers, mais reste heterogene.
- /web offre une base UI plus solide, mais doit etre alignee avec les usages metier reels (planning, restrictions role, feedback utilisateur).

### 4.2 Drag and drop

Statut: Non conforme (fonction metier finale)

- Les prerequis techniques existent (notamment cote /web avec PrimeNG),
- mais les scenarios metier de planning et controle conflits ne sont pas finalises de bout en bout.

### 4.3 Fonctionnalites attendues du systeme

Statut global: Partiellement conforme

- Auth/gestion utilisateurs: partiellement couvert.
- Gestion planning complete avec publication/export: incomplet.
- Notifications et interactions metier transverse: incomplet.
- Rapport/analytics exploitation: incomplet.

---

## 5. Comparatif synthese

| Axe | /frontend (actuel) | /web (cible) | Verdict |
|---|---|---|---|
| Integration backend | Bon niveau actuel | Partiel | Avantage frontend |
| Auth/RBAC | Plus mature | A renforcer | Avantage frontend |
| Architecture Angular | Plus ancienne | Moderne | Avantage web |
| Potentiel UI/UX | Correct | Eleve | Avantage web |
| Parite metier immediate | Plus avance | En retard | Avantage frontend |
| Cap a long terme | Moyen | Eleve | Avantage web |

Conclusion:
- /web est la bonne cible strategique,
- mais la bascule Big-bang exige un chantier de parite fonctionnelle strictement pilote.

---

## 6. Risques de migration Big-bang

1. Perte de fonctions metier deja disponibles dans /frontend si parite non atteinte.
2. Regressions sur auth/RBAC si reprise incomplète.
3. Defauts UX dans les parcours critiques (planning, operations admin).
4. Manque d'observabilite frontend et de tests E2E avant cutover.

---

## 7. Conditions Go/No-Go pour la bascule

Go uniquement si les points suivants sont valides:

1. Auth JWT + RBAC completement operationnels dans /web.
2. Parite minimale des modules critiques (users, teachers, rooms, courses, schedules, groups).
3. Parcours planning usable avec gestion des conflits.
4. Monitoring erreurs frontend actif.
5. Campagne tests E2E de non-regression validee.

---

## 8. Recommandations

### Priorite immediate

1. Construire les tickets frontend web par lots fonctionnels (core + metier + UX avancee).
2. Prioriser auth/RBAC/API avant enrichissement UI.
3. Verrouiller la parite des parcours critiques admin/enseignant.

### Priorite court terme

1. Implémenter drag and drop planning avec validation metier.
2. Integrer notifications et reporting dans les parcours UI.
3. Industrialiser tests et readiness release.

---

## 9. Livrables relies

- Plan migration Big-bang: PLAN-MIGRATION-FRONTEND-WEB.md
- Tickets frontend web: tickets/README-FRONTEND.md + FE-*.md
- Mise a jour scripts: start-services.ps1 et stop-services.ps1
