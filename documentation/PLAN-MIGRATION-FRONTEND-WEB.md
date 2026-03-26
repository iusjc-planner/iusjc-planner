# Plan de migration Big-bang: frontend vers web

Date: 25 Mars 2026  
Strategie validee: Big-bang (switch unique vers /web)

---

## 1. Principe

Le frontend cible devient /web a la date de bascule.  
Le frontend /frontend n'est plus le point d'entree principal apres cutover.

---

## 2. Phases de migration

### Phase 0 - Preparation

Objectif: reduire le risque de bascule.

Actions:
1. Stabiliser socle /web (auth, guards, interceptors, services API).
2. Definir parite fonctionnelle minimale obligatoire.
3. Mettre en place checklist Go/No-Go.
4. Aligner scripts de demarrage/arret pour la cible /web.

### Phase 1 - Parite core

Objectif: rendre /web exploitable sur les parcours essentiels.

Parite minimale:
1. Connexion/deconnexion + expiration JWT.
2. RBAC admin/enseignant.
3. Modules CRUD critiques:
   - utilisateurs
   - enseignants
   - salles
   - cours
   - groupes
   - planning
4. Gestion erreurs globale et feedback UX.

### Phase 2 - Parite metier avancee

Objectif: fermer ecarts metier majeurs.

1. Planning multi-vues stable.
2. Validation conflits et scenarios de reservation.
3. Notifications dans l'interface.
4. Reporting de base.
5. Drag and drop metier (planning).

### Phase 3 - Qualification pre-cutover

Objectif: valider readiness production.

1. Tests unitaires et integration.
2. Tests E2E parcours critiques.
3. UAT metier (admin + enseignant).
4. Verification perf et ergonomie.
5. Validation securite (RBAC, routes protegees, session).

### Phase 4 - Cutover Big-bang

1. Gel fonctionnel court de /frontend.
2. Deployment officiel de /web.
3. Verification smoke test immediate.
4. Communication equipe + support.

### Phase 5 - Hypercare post-bascule

1. Monitoring erreurs/requetes API.
2. Correction rapide incidents critiques.
3. Suivi journalier pendant la fenetre hypercare.

---

## 3. Criteres Go/No-Go

## Go

1. Tous les tickets Core P0 frontend termines.
2. Tests E2E critiques au vert.
3. Aucune regression bloquante auth/RBAC.
4. Taux d'erreur API acceptable.

## No-Go

1. Defaillance login/logout/expiration.
2. Defaut RBAC sur routes critiques.
3. Parcours planning inutilisable.
4. Incident severite haute non corrige.

---

## 4. Plan de rollback

En cas d'incident majeur apres bascule:

1. Repointage immediate vers /frontend.
2. Blocage des nouvelles evolutions /web.
3. Analyse RCA (root cause analysis).
4. Patch prioritaire puis nouvelle fenetre de bascule.

Condition d'activation rollback:
- Incident critique non corrige en moins de 60 minutes sur parcours coeur.

---

## 5. Dependances externes

1. SMTP operationnel pour reset password et notifications email.
2. Services backend critiques demarres (incluant notification-service).
3. Gateway stable et observable.

---

## 6. Pilotage

Rituels recommandes:

1. Standup migration quotidien.
2. Revue risque hebdomadaire.
3. Tracking KPI:
   - taux de succes login
   - taux erreurs API front
   - nombre bugs severes ouverts
   - progression parite modules

---

## 7. Lien avec tickets frontend

Le plan est execute via les tickets FE references dans:
- documentation/tickets/README-FRONTEND.md
