# 🗺️ Roadmap Détaillée - IUSJ Planner
## État d'Avancement et Plan de Développement

**Projet** : IUSJ Planner - Système de Gestion Académique  
**Date de mise à jour** : 8 Janvier 2026  
**Groupe** : 3 - ISI 4 FR 6

---

## 📊 Vue d'Ensemble du Projet

### Statistiques Globales
- **Progrès Global** : ~48% ✅
- **Services Backend** : 6/10 implémentés (60%)
- **Modules Frontend** : 4/12 implémentés (33%)
- **Documentation** : 95% complète
- **Infrastructure** : 100% opérationnelle

### État par Domaine

| Domaine | Progression | État |
|---------|------------|------|
| 🏗️ Infrastructure | ████████████████████ 100% | ✅ Complet |
| 🔐 Authentification | ████████████████████ 100% | ✅ Complet |
| 👥 Gestion Utilisateurs | ████████████████████ 100% | ✅ Complet |
| 👨‍🏫 Gestion Enseignants | ░░░░░░░░░░░░░░░░░░░░ 0% | ❌ Non démarré |
| 🏢 Gestion Écoles | ████████████░░░░░░░░ 60% | 🟡 Backend livré |
| 🚪 Gestion Salles | ░░░░░░░░░░░░░░░░░░░░ 0% | ❌ Non démarré |
| 📚 Gestion Cours | ░░░░░░░░░░░░░░░░░░░░ 0% | ❌ Non démarré |
| 👨‍🎓 Gestion Groupes | ████████████░░░░░░░░ 60% | 🟡 Backend livré |
| 📅 Emplois du Temps | ██████████░░░░░░░░░░ 50% | 🟡 Backend en cours |
| 🎯 Événements | ░░░░░░░░░░░░░░░░░░░░ 0% | ❌ Non démarré |
| 🔧 Ressources | ░░░░░░░░░░░░░░░░░░░░ 0% | ❌ Non démarré |
| 📊 Rapports | ░░░░░░░░░░░░░░░░░░░░ 0% | ❌ Non démarré |

---

## ✅ PHASE 1 : Infrastructure et Base (COMPLÈTE - 100%)

### 1.1 Infrastructure DevOps ✅
**État** : Complet et opérationnel

#### Réalisations
- ✅ Configuration Docker et Docker Compose
- ✅ Scripts PowerShell de démarrage/arrêt
  - `start-services.ps1` : Démarrage automatique de tous les services
  - `stop-services.ps1` : Arrêt propre de tous les services
  - `create-test-users.ps1` : Création d'utilisateurs de test
- ✅ Configuration MySQL
  - Base de données `bd_tutore`
  - Port 3306 exposé
  - Volume Docker pour persistance
- ✅ Variables d'environnement
- ✅ Documentation complète

**Fichiers** :
- [docker-compose.ci.yml](docker-compose.ci.yml)
- [start-services.ps1](start-services.ps1)
- [stop-services.ps1](stop-services.ps1)
- [create-test-users.ps1](create-test-users.ps1)

---

### 1.2 Service Discovery (Eureka) ✅
**État** : Complet et fonctionnel

#### Réalisations
- ✅ Eureka Server configuré
- ✅ Port 8761 avec dashboard accessible
- ✅ Enregistrement automatique des services
- ✅ Health checking actif
- ✅ Load balancing côté client

**Technologies** :
- Spring Boot 3.3.4
- Spring Cloud 2023.0.6 (Netflix Eureka)

**Endpoints** :
- Dashboard : http://localhost:8761
- API : http://localhost:8761/eureka/apps

**Documentation** : [documentation/README.md](documentation/README.md)

---

### 1.3 API Gateway ✅
**État** : Complet et sécurisé

#### Réalisations
- ✅ Gateway configuré sur port 8080
- ✅ Routage dynamique vers les microservices
- ✅ Configuration CORS pour frontend (port 4200)
- ✅ Validation JWT intégrée
- ✅ Load balancing automatique
- ✅ Gestion des erreurs HTTP
- ✅ Endpoints actuator pour monitoring

**Routes Configurées** :
- `/auth/**` → Auth Service
- `/api/users/**` → User Service
- `/api/schools/**` → School Service (actif)
- `/api/groups/**` → Group Service (actif)
- `/api/schedule/**` → Schedule Service (actif)
- `/api/teachers/**` → Teachers Service (préparé)
- `/api/rooms/**` → Rooms Service (préparé)
- `/api/courses/**` → Courses Service (préparé)

**Documentation** : [iusj-gateway-service/documentation/README.md](iusj-gateway-service/documentation/README.md)

---

### 1.4 Base de Données MySQL ✅
**État** : Configurée et opérationnelle

#### Réalisations
- ✅ MySQL 8.0 en Docker
- ✅ Base de données `bd_tutore`
- ✅ Table `users` créée et peuplée
- ✅ Indexes pour performance
- ✅ Contraintes d'unicité (login, email)
- ✅ Champs created_at/updated_at automatiques

**Schéma Actuel** :
```sql
users (id, nom, prenom, email, telephone, login, password, role, status)
ecoles (id, name, address, phone, email, status, created_at, updated_at)
groupes (id, name, level, school_id, size, status, created_at, updated_at)
schedule_entries (id, course_id, teacher_id, room_id, group_id, start_time, end_time, status, created_at, updated_at)
```

**Prochaines Tables** :
- enseignants
- salles
- cours
- evenements
- ressources

---

## ✅ PHASE 2 : Authentification et Sécurité (COMPLÈTE - 100%)

### 2.1 Auth Service (Backend) ✅
**État** : Complet et sécurisé

#### Réalisations
- ✅ Service Spring Boot sur port 8082
- ✅ Endpoint `/auth/login` fonctionnel
- ✅ Génération de tokens JWT (HS256)
- ✅ Validation des identifiants
- ✅ Chiffrement BCrypt des mots de passe
- ✅ Gestion des rôles (ADMIN, USER)
- ✅ Expiration des tokens (24h)
- ✅ Gestion des erreurs d'authentification

**API Endpoints** :
- `POST /auth/login` : Authentification
- `GET /auth/validate` : Validation token (futur)

**JWT Payload** :
```json
{
  "sub": "username",
  "userId": 1,
  "role": "ADMIN",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Documentation** : 
- [iusj-auth-service/documentation/README.md](iusj-auth-service/documentation/README.md)
- [ENCODAGE-MOTS-DE-PASSE-GATEWAY.md](ENCODAGE-MOTS-DE-PASSE-GATEWAY.md)
- [CORRECTIONS-AUTHENTIFICATION.md](CORRECTIONS-AUTHENTIFICATION.md)

---

### 2.2 Sécurité Frontend ✅
**État** : Complet et fonctionnel

#### Réalisations
- ✅ AuthService Angular
  - Connexion/Déconnexion
  - Stockage JWT dans localStorage
  - Décodage automatique du token
  - Vérification de l'expiration
  - Observable pour l'état de connexion
- ✅ AuthGuard : Protection des routes authentifiées
- ✅ AdminGuard : Protection des routes admin
- ✅ AuthInterceptor : Ajout automatique du Bearer token
- ✅ ErrorInterceptor : Gestion des erreurs 401/403

**Fichiers** :
- [fontend/src/app/core/services/auth.service.ts](fontend/src/app/core/services/auth.service.ts)
- [fontend/src/app/core/guards/auth.guard.ts](fontend/src/app/core/guards/auth.guard.ts)
- [fontend/src/app/core/guards/admin.guard.ts](fontend/src/app/core/guards/admin.guard.ts)
- [fontend/src/app/core/interceptors/auth.interceptor.ts](fontend/src/app/core/interceptors/auth.interceptor.ts)

**Documentation** : [fontend/INTEGRATION-COMPLETE.md](fontend/INTEGRATION-COMPLETE.md)

---

### 2.3 Pages Login/Register ✅
**État** : Complet avec design moderne

#### Réalisations
- ✅ Page Login fonctionnelle
  - Formulaire avec validation
  - Indicateur de chargement
  - Messages d'erreur
  - Redirection après succès
  - Vérification si déjà connecté
- ✅ Page Register (interface prête)
- ✅ Design responsive
- ✅ Intégration avec AuthService

**Routes** :
- `/login` : Connexion
- `/register` : Inscription (futur)

**Documentation** : [fontend/PAGES-LOGIN-DASHBOARD.md](fontend/PAGES-LOGIN-DASHBOARD.md)

---

## ✅ PHASE 3 : Gestion des Utilisateurs (COMPLÈTE - 100%)

### 3.1 User Service (Backend) ✅
**État** : API CRUD complète

#### Réalisations
- ✅ Service Spring Boot sur port 8081
- ✅ API REST complète (CRUD)
- ✅ Validation des données
- ✅ Gestion des erreurs HTTP
- ✅ Repository JPA
- ✅ DTO pour transfert de données
- ✅ Chiffrement automatique des mots de passe

**API Endpoints** :
- `GET /api/users` : Liste tous les utilisateurs
- `GET /api/users/{id}` : Détail d'un utilisateur
- `POST /api/users` : Créer un utilisateur
- `PUT /api/users/{id}` : Modifier un utilisateur
- `DELETE /api/users/{id}` : Supprimer un utilisateur

**Modèle User** :
```java
{
  "id": Long,
  "nom": String,
  "prenom": String,
  "email": String (unique),
  "telephone": String,
  "login": String (unique),
  "password": String (BCrypt),
  "role": Enum (ADMIN, USER),
  "status": Enum (ACTIVE, INACTIVE)
}
```

**Documentation** : [iusj-user-service/documentation/README.md](iusj-user-service/documentation/README.md)

---

### 3.2 Module Users Frontend ✅
**État** : Interface complète et fonctionnelle

#### Réalisations
- ✅ UserService Angular intégré
- ✅ UserListComponent
  - Liste des utilisateurs avec données réelles
  - Filtrage par nom, email, login
  - Filtrage par rôle (ADMIN/USER)
  - Filtrage par statut (ACTIVE/INACTIVE)
  - Badges colorés pour rôles et statuts
  - Actions : Voir, Modifier, Supprimer
  - Confirmation de suppression
  - Gestion des erreurs
  - Indicateurs de chargement
- ✅ UserFormComponent
  - Création de nouveaux utilisateurs
  - Modification d'utilisateurs existants
  - Validation complète des champs
  - Messages d'erreur personnalisés
- ✅ UserDetailComponent (préparé)
- ✅ Routes protégées (AuthGuard + AdminGuard)
- ✅ Design responsive et moderne

**Routes** :
- `/users` : Liste (AuthGuard)
- `/users/new` : Création (AuthGuard + AdminGuard)
- `/users/:id` : Détail (AuthGuard)
- `/users/:id/edit` : Modification (AuthGuard + AdminGuard)

**Documentation** : [fontend/GESTION-UTILISATEURS-INTEGREE.md](fontend/GESTION-UTILISATEURS-INTEGREE.md)

---

### 3.3 Layout et Navigation ✅
**État** : Layout complet et responsive

#### Réalisations
- ✅ MainLayoutComponent
  - Structure globale (Header + Sidebar + Content + Footer)
  - Affichage conditionnel selon authentification
  - Lazy loading avec spinner
  - Scroll to top automatique
- ✅ HeaderComponent
  - Logo IUSJ Planner
  - Barre de recherche
  - Notifications dropdown
  - Profil utilisateur dropdown
  - Toggle sidebar (desktop/mobile)
- ✅ SidebarComponent
  - Menu de navigation complet
  - 12 items avec icônes MDI
  - Sous-menus avec collapse
  - Mode icon-only
  - Hover effects
  - Différenciation ADMIN/USER
- ✅ FooterComponent
  - Copyright dynamique
  - Version de l'application
- ✅ Services de navigation
  - NavigationService : Gestion du menu
  - LayoutService : Toggle sidebar

**Menu Principal** :
1. Dashboard
2. Utilisateurs
3. Enseignants (avec sous-menu)
4. Écoles
5. Salles (avec sous-menu)
6. Cours
7. Groupes
8. Emplois du temps (avec sous-menu)
9. Événements
10. Ressources
11. Rapports (avec sous-menu)
12. Paramètres

**Documentation** : 
- [fontend/IMPLEMENTATION-COMPLETE.md](fontend/IMPLEMENTATION-COMPLETE.md)
- [fontend/SIDEBAR-DIFFERENTIATION.md](fontend/SIDEBAR-DIFFERENTIATION.md)

---

### 3.4 Dashboard ✅
**État** : Dashboard de test fonctionnel

#### Réalisations
- ✅ Page dashboard accessible
- ✅ 4 cartes statistiques avec gradients
  - Utilisateurs actifs
  - Cours planifiés
  - Salles disponibles
  - Événements à venir
- ✅ Tableau des activités récentes
- ✅ Design moderne et responsive
- ✅ Palette de couleurs IUSJ (violet/bleu)

**Documentation** : 
- [fontend/test-dashboard.md](fontend/test-dashboard.md)
- [SUCCES-IMPLEMENTATION.md](SUCCES-IMPLEMENTATION.md)

---

## 🚧 PHASE 4 : Modules Métier Backend (EN COURS - 30%)

### 4.1 Teachers Service (Enseignants) ❌
**État** : Non démarré  
**Priorité** : HAUTE  
**Estimation** : 3-5 jours

#### À Réaliser
- [ ] Créer le microservice Spring Boot
- [ ] Configurer le port 8083
- [ ] Créer la table `enseignants` en BDD
- [ ] Implémenter l'entité Enseignant
- [ ] Créer le repository JPA
- [ ] Implémenter le service métier
- [ ] Créer le controller REST
- [ ] Enregistrer dans Eureka
- [ ] Configurer le routing dans Gateway
- [ ] Ajouter validation des données
- [ ] Créer les DTOs
- [ ] Tests unitaires
- [ ] Documentation API

**API Endpoints Prévus** :
```
GET    /api/teachers           # Liste tous
GET    /api/teachers/{id}      # Détail
POST   /api/teachers           # Créer
PUT    /api/teachers/{id}      # Modifier
DELETE /api/teachers/{id}      # Supprimer
GET    /api/teachers/{id}/availability    # Disponibilités
POST   /api/teachers/{id}/unavailability  # Signaler indisponibilité
```

**Modèle Enseignant** :
```java
{
  "id": Long,
  "nom": String,
  "prenom": String,
  "email": String (unique),
  "telephone": String,
  "specialite": String,
  "grade": String (ASSISTANT, CHEF_TRAVAUX, PROFESSEUR),
  "status": Enum (ACTIVE, INACTIVE, EN_CONGE)
}
```

---

### 4.2 Schools Service (Écoles) ✅
**État** : Backend livré (CRUD + stats), en attente d'intégration frontend  
**Priorité** : HAUTE  
**Estimation** : Livré (2-3 jours réalisés)

#### Réalisations
- [x] Microservice Spring Boot (port 8087) + table `ecoles`
- [x] Entité `School` + repository JPA avec `countByStatus`
- [x] Service métier + controller `/api/schools`
- [x] Endpoint `/api/schools/stats` (total/active/inactive)
- [x] Enregistrement Eureka + routage Gateway
- [x] Scripts start/stop mis à jour
- [x] Collection Postman mise à jour
- [x] Documentation API [documentation/API-Services.md](documentation/API-Services.md)

#### Prochaines étapes
- [ ] Endpoints `/api/schools/{id}/courses` et `/teachers` (optionnel)
- [ ] Tests unitaires + contrats API
- [ ] Intégration frontend (module Schools)

---

### 4.3 Rooms Service (Salles) ❌
**État** : Non démarré (branche `rooms` créée)  
**Priorité** : HAUTE  
**Estimation** : 3-4 jours

#### À Réaliser
- [ ] Créer le microservice Spring Boot
- [ ] Configurer le port 8084
- [ ] Créer la table `salles` en BDD
- [ ] Implémenter l'entité Salle
- [ ] Créer le repository JPA
- [ ] Implémenter le service métier
- [ ] Créer le controller REST
- [ ] Enregistrer dans Eureka
- [ ] Configurer le routing dans Gateway
- [ ] Logique de vérification de disponibilité
- [ ] Gestion des équipements
- [ ] Tests et documentation

**API Endpoints Prévus** :
```
GET    /api/rooms                      # Liste toutes
GET    /api/rooms/{id}                 # Détail
POST   /api/rooms                      # Créer
PUT    /api/rooms/{id}                 # Modifier
DELETE /api/rooms/{id}                 # Supprimer
GET    /api/rooms/available            # Salles disponibles
GET    /api/rooms/filter               # Filtrer par capacité/équipements
POST   /api/rooms/{id}/reserve         # Réserver
GET    /api/rooms/{id}/schedule        # Planning d'une salle
```

**Modèle Salle** :
```java
{
  "id": Long,
  "nom": String,
  "numero": String,
  "batiment": String,
  "capacite": Integer,
  "typeSalle": Enum (COURS, LABO, AMPHI, TD),
  "equipements": List<String>,
  "status": Enum (DISPONIBLE, MAINTENANCE, HORS_SERVICE)
}
```

---

### 4.4 Courses Service (Cours) ❌
**État** : Non démarré  
**Priorité** : MOYENNE  
**Estimation** : 3-4 jours

#### À Réaliser
- [ ] Créer le microservice Spring Boot
- [ ] Configurer le port 8085
- [ ] Créer la table `cours` en BDD
- [ ] Implémenter l'entité Cours
- [ ] Créer le repository JPA
- [ ] Implémenter le service métier
- [ ] Créer le controller REST
- [ ] Enregistrer dans Eureka
- [ ] Configurer le routing dans Gateway
- [ ] Gestion des prérequis
- [ ] Affectation aux écoles
- [ ] Tests et documentation

**API Endpoints Prévus** :
```
GET    /api/courses            # Liste tous
GET    /api/courses/{id}       # Détail
POST   /api/courses            # Créer
PUT    /api/courses/{id}       # Modifier
DELETE /api/courses/{id}       # Supprimer
GET    /api/courses/{id}/prerequisites    # Prérequis
GET    /api/courses/school/{schoolId}     # Cours par école
```

**Modèle Cours** :
```java
{
  "id": Long,
  "code": String (unique),
  "nom": String,
  "credits": Integer (1-10),
  "description": String,
  "ecoleId": Long,
  "enseignantId": Long,
  "status": Enum (ACTIVE, INACTIVE)
}
```

---

### 4.5 Groups Service (Groupes) ✅
**État** : Backend livré (CRUD + stats), en attente d'intégration frontend  
**Priorité** : MOYENNE  
**Estimation** : Livré (2-3 jours réalisés)

#### Réalisations
- [x] Microservice Spring Boot (port 8088) + table `groupes`
- [x] Entité `Group` + repository JPA avec `countByStatus`
- [x] Service métier + controller `/api/groups`
- [x] Endpoint `/api/groups/stats` (total/active/inactive)
- [x] Enregistrement Eureka + routage Gateway
- [x] Scripts start/stop mis à jour
- [x] Collection Postman mise à jour
- [x] Documentation API [documentation/API-Services.md](documentation/API-Services.md)

#### Prochaines étapes
- [ ] Endpoints `/api/groups/{id}/students` (optionnel)
- [ ] Tests unitaires + contrats API
- [ ] Intégration frontend (module Groups)

---

### 4.6 Schedule Service (Emplois du Temps) 🟡
**État** : Backend en cours (CRUD + stats + validation basique + exports/génération stub)  
**Priorité** : TRÈS HAUTE (Cœur métier)  
**Estimation** : 5-7 jours (backend initial livré)

#### Réalisations
- [x] Microservice Spring Boot (port 8086) + table `schedule_entries`
- [x] Entité/DTO + repository avec `countByStatus`
- [x] CRUD `/api/schedule`
- [x] Endpoint `/api/schedule/stats` (total/scheduled/completed/cancelled)
- [x] Vérification de conflits (salle, enseignant, groupe)
- [x] Gateway + Eureka + scripts de démarrage mis à jour
- [x] Collection Postman mise à jour
- [x] Documentation API [documentation/API-Services.md](documentation/API-Services.md)
 - [x] Endpoints d'export PDF/Excel (stub) + génération auto (stub)

#### Prochaines étapes
- [ ] Remplacer les stubs d'export par génération réelle (PDF/Excel)
- [ ] Génération automatique et validation avancée
- [ ] Notifications
- [ ] Tests de charge + unitaires

---

### 4.7 Events Service (Événements) ❌
**État** : Non démarré  
**Priorité** : BASSE  
**Estimation** : 2-3 jours

#### À Réaliser
- [ ] Créer le microservice Spring Boot
- [ ] Configurer le port 8089
- [ ] Créer la table `evenements` en BDD
- [ ] Implémenter l'entité Evenement
- [ ] API CRUD complète
- [ ] Notifications aux participants
- [ ] Tests et documentation

---

### 4.8 Resources Service (Ressources) ❌
**État** : Non démarré  
**Priorité** : BASSE  
**Estimation** : 2-3 jours

#### À Réaliser
- [ ] Créer le microservice Spring Boot
- [ ] Configurer le port 8090
- [ ] Créer la table `ressources` en BDD
- [ ] Implémenter l'entité Ressource
- [ ] API CRUD complète
- [ ] Gestion des réservations
- [ ] Tests et documentation

---

### 4.9 Reports Service (Rapports) ❌
**État** : Non démarré  
**Priorité** : BASSE  
**Estimation** : 4-5 jours

#### À Réaliser
- [ ] Créer le microservice Spring Boot
- [ ] Configurer le port 8091
- [ ] Génération de rapports
  - Utilisation des salles
  - Charge des enseignants
  - Statistiques par école
  - Événements
- [ ] Export PDF/Excel
- [ ] Graphiques avec Chart.js
- [ ] Tests et documentation

---

## 🚧 PHASE 5 : Modules Métier Frontend (EN COURS - 0%)

### 5.1 Module Teachers Frontend ❌
**État** : Non démarré  
**Priorité** : HAUTE  
**Estimation** : 3-4 jours

#### À Réaliser
- [ ] Créer TeacherService Angular
- [ ] Créer TeacherListComponent
  - Liste avec filtres
  - Recherche par nom/spécialité
  - Badges pour statuts
- [ ] Créer TeacherFormComponent
  - Création/Modification
  - Validation complète
- [ ] Créer TeacherDetailComponent
  - Informations détaillées
  - Liste des cours assignés
  - Emploi du temps personnel
- [ ] Routes et navigation
- [ ] Tests unitaires

**Routes Prévues** :
```
/teachers           # Liste
/teachers/new       # Création (ADMIN)
/teachers/:id       # Détail
/teachers/:id/edit  # Modification (ADMIN)
```

---

### 5.2 Module Schools Frontend ❌
**État** : Non démarré  
**Priorité** : HAUTE  
**Estimation** : 2-3 jours

#### À Réaliser
- [ ] Créer SchoolService Angular
- [ ] Créer SchoolListComponent
- [ ] Créer SchoolFormComponent
- [ ] Créer SchoolDetailComponent
  - Informations
  - Liste des cours
  - Liste des enseignants
  - Liste des groupes
- [ ] Routes et navigation

---

### 5.3 Module Rooms Frontend ❌
**État** : Non démarré  
**Priorité** : HAUTE  
**Estimation** : 3-4 jours

#### À Réaliser
- [ ] Créer RoomService Angular
- [ ] Créer RoomListComponent
  - Filtres par capacité
  - Filtres par équipements
  - Filtres par statut
- [ ] Créer RoomFormComponent
  - Gestion des équipements (multi-select)
- [ ] Créer RoomDetailComponent
  - Calendrier de disponibilité
  - Réservations en cours
- [ ] Créer RoomAvailabilityComponent
  - Visualisation disponibilités
- [ ] Routes et navigation

**Routes Prévues** :
```
/rooms              # Liste
/rooms/new          # Création (ADMIN)
/rooms/:id          # Détail
/rooms/:id/edit     # Modification (ADMIN)
/rooms/availability # Disponibilités
```

---

### 5.4 Module Courses Frontend ❌
**État** : Non démarré  
**Priorité** : MOYENNE  
**Estimation** : 2-3 jours

#### À Réaliser
- [ ] Créer CourseService Angular
- [ ] Créer CourseListComponent
- [ ] Créer CourseFormComponent
- [ ] Créer CourseDetailComponent
- [ ] Routes et navigation

---

### 5.5 Module Groups Frontend 🟡
**État** : En cours (liste + formulaire + service + routing)  
**Priorité** : MOYENNE  
**Estimation** : 2-3 jours (70% réalisé)

#### Réalisations
- [x] GroupService Angular (CRUD + stats)
- [x] GroupListComponent (recherche, filtres, suppression)
- [x] GroupFormComponent (création/modification)
- [x] Routes et navigation

#### À Faire
- [ ] GroupDetailComponent
- [ ] Sélecteur d'école (remplacer champ `schoolId` par dropdown alimenté)

---

### 5.6 Module Schedules Frontend 🟡
**État** : En cours (planning global + exports/génération)  
**Priorité** : TRÈS HAUTE  
**Estimation** : 5-7 jours (30% réalisé)

#### Réalisations
- [x] ScheduleService Angular (CRUD + stats + export/génération)
- [x] ScheduleGlobalComponent (liste + boutons Export PDF/Excel + Génération auto)
- [x] Routing de base `/schedules`

#### À Réaliser
- [ ] ScheduleFormComponent
  - Sélection cours/enseignant/salle/groupe
  - Sélection date/heure
  - Validation des conflits (consommation backend)
- [ ] ScheduleCalendarComponent
  - Vue calendrier (hebdomadaire/mensuelle)
  - Drag & drop pour déplacement
  - Code couleur par type
- [ ] GroupScheduleComponent / TeacherScheduleComponent / RoomScheduleComponent
- [ ] Intégration FullCalendar ou ng-calendar

**Routes Prévues** :
```
/schedules                      # Gestion
/schedules/new                  # Création (ADMIN)
/schedules/group/:groupId       # Emploi groupe
/schedules/teacher/:teacherId   # Emploi enseignant
/schedules/room/:roomId         # Occupation salle
/schedules/calendar             # Vue calendrier
```

---

### 5.7 Module Events Frontend ❌
**État** : Non démarré  
**Priorité** : BASSE  
**Estimation** : 2-3 jours

#### À Réaliser
- [ ] Créer EventService Angular
- [ ] Créer EventListComponent
- [ ] Créer EventFormComponent
- [ ] Créer EventDetailComponent
- [ ] Calendrier des événements
- [ ] Routes et navigation

---

### 5.8 Module Resources Frontend ❌
**État** : Non démarré  
**Priorité** : BASSE  
**Estimation** : 2-3 jours

#### À Réaliser
- [ ] Créer ResourceService Angular
- [ ] Créer ResourceListComponent
- [ ] Créer ResourceFormComponent
- [ ] Créer ResourceReservationComponent
- [ ] Routes et navigation

---

### 5.9 Module Reports Frontend ❌
**État** : Non démarré  
**Priorité** : BASSE  
**Estimation** : 3-4 jours

#### À Réaliser
- [ ] Créer ReportService Angular
- [ ] Créer ReportDashboardComponent
  - Sélection type de rapport
  - Paramètres (dates, filtres)
- [ ] Intégration Chart.js ou ng2-charts
- [ ] Graphiques interactifs
  - Utilisation salles (bar chart)
  - Charge enseignants (pie chart)
  - Évolution événements (line chart)
- [ ] Export PDF/Excel
- [ ] Routes et navigation

---

### 5.10 Dashboard Dynamique ❌
**État** : Dashboard statique actuel  
**Priorité** : MOYENNE  
**Estimation** : 2-3 jours

#### À Réaliser
- [ ] Connecter aux APIs backend
- [ ] Statistiques réelles
  - Nombre d'utilisateurs actifs
  - Nombre de cours planifiés
  - Nombre de salles disponibles
  - Événements à venir
- [ ] Graphiques dynamiques
  - Évolution des plannings
  - Utilisation des ressources
- [ ] Activités récentes réelles
- [ ] Notifications en temps réel

---

## 📚 PHASE 6 : Documentation (EN COURS - 90%)

### 6.1 Documentation Technique ✅
**État** : Complète

#### Réalisations
- ✅ README principal
- ✅ Quick Start Guide
- ✅ Documentation Eureka Service
- ✅ Documentation Gateway Service
- ✅ Documentation Auth Service
- ✅ Documentation User Service
- ✅ Documentation Frontend (multiples fichiers)
- ✅ Cahier d'analyse (Markdown) ✨ NOUVEAU
- ✅ Cahier de conception (Markdown) ✨ NOUVEAU
- ✅ Roadmap détaillée ✨ NOUVEAU

**Fichiers** :
- [README.md](README.md)
- [documentation/README.md](documentation/README.md)
- [documentation/Quick-Start-Guide.md](documentation/Quick-Start-Guide.md)
- [documentation/Cahier-analyse.md](documentation/Cahier-analyse.md) ✨
- [documentation/Cahier-conception.md](documentation/Cahier-conception.md) ✨

---

### 6.2 Documentation API ⚠️
**État** : Partielle  
**Priorité** : MOYENNE  
**Estimation** : 2-3 jours

#### À Réaliser
- [ ] Intégrer Swagger/OpenAPI
- [ ] Générer documentation API automatique
- [ ] Documenter tous les endpoints
- [ ] Exemples de requêtes/réponses
- [ ] Codes d'erreur
- [ ] Interface Swagger UI

---

### 6.3 Tests Postman ✅
**État** : Collections créées

#### Réalisations
- ✅ Collection sans JWT
- ✅ Collection avec JWT
- ✅ Environnements (Local)
- ✅ Documentation des tests

**Fichiers** :
- [postman-collections/IUSJ-Microservices-Tests.postman_collection.json](postman-collections/IUSJ-Microservices-Tests.postman_collection.json)
- [postman-collections/IUSJ-Microservices-Tests-With-JWT.postman_collection.json](postman-collections/IUSJ-Microservices-Tests-With-JWT.postman_collection.json)
- [postman-collections/Documentation-Tests.md](postman-collections/Documentation-Tests.md)

#### À Améliorer
- [ ] Tests automatisés pour chaque nouveau service
- [ ] Scripts de tests end-to-end
- [ ] Environnements Dev/Prod

---

### 6.4 Guide Utilisateur ❌
**État** : Non démarré  
**Priorité** : BASSE  
**Estimation** : 2-3 jours

#### À Réaliser
- [ ] Guide d'utilisation pour administrateurs
- [ ] Guide d'utilisation pour utilisateurs
- [ ] Captures d'écran
- [ ] Tutoriels vidéo (optionnel)
- [ ] FAQ

---

## 🧪 PHASE 7 : Tests et Qualité (EN COURS - 30%)

### 7.1 Tests Unitaires Backend ⚠️
**État** : Partiels

#### À Réaliser
- [ ] Tests User Service (80% couverture)
- [ ] Tests Auth Service (80% couverture)
- [ ] Tests Gateway (filtres, routes)
- [ ] Tests pour tous les futurs services
- [ ] Configuration JaCoCo pour couverture

---

### 7.2 Tests Unitaires Frontend ❌
**État** : Non démarrés

#### À Réaliser
- [ ] Tests des services (Jasmine/Karma)
- [ ] Tests des composants
- [ ] Tests des guards
- [ ] Tests des intercepteurs
- [ ] Couverture > 70%

---

### 7.3 Tests d'Intégration ⚠️
**État** : Via Postman uniquement

#### À Réaliser
- [ ] Tests end-to-end (Cypress ou Protractor)
- [ ] Tests de flux complets
  - Connexion → Navigation → CRUD
- [ ] Tests de performance
- [ ] Tests de charge

---

### 7.4 Qualité du Code ⚠️
**État** : Configuration SonarQube créée

#### À Réaliser
- [ ] Intégrer SonarQube dans le pipeline
- [ ] Analyser tous les services
- [ ] Corriger les code smells
- [ ] Atteindre note A minimum

**Fichier** : [sonar-project.properties](sonar-project.properties)

---

## 🚀 PHASE 8 : Déploiement et Production (NON DÉMARRÉ - 0%)

### 8.1 Conteneurisation ⚠️
**État** : Docker Compose local uniquement

#### À Réaliser
- [ ] Dockerfiles pour tous les services
- [ ] Docker Compose pour production
- [ ] Optimisation des images
- [ ] Multi-stage builds
- [ ] Health checks

---

### 8.2 CI/CD ❌
**État** : Non démarré

#### À Réaliser
- [ ] Configuration GitHub Actions ou GitLab CI
- [ ] Pipeline de build automatique
- [ ] Pipeline de tests automatiques
- [ ] Pipeline de déploiement
- [ ] Notifications (email, Slack)

---

### 8.3 Monitoring ❌
**État** : Non démarré

#### À Réaliser
- [ ] Intégrer Spring Boot Actuator (tous services)
- [ ] Intégrer Prometheus pour métriques
- [ ] Intégrer Grafana pour dashboards
- [ ] Logs centralisés (ELK Stack)
- [ ] Alertes automatiques

---

### 8.4 Sécurité Production ❌
**État** : Non démarré

#### À Réaliser
- [ ] HTTPS avec certificat SSL
- [ ] Secrets management (Vault)
- [ ] Rate limiting
- [ ] Protection DDoS
- [ ] Audit de sécurité

---

### 8.5 Backup et Reprise ❌
**État** : Non démarré

#### À Réaliser
- [ ] Stratégie de backup BDD (quotidien)
- [ ] Tests de restauration
- [ ] Plan de reprise d'activité
- [ ] Réplication BDD

---

## 📈 Plan de Développement Recommandé

### Sprint 1 (2 semaines) : Modules Métier Essentiels Backend
**Objectif** : Implémenter les 3 services backend prioritaires

1. **Semaine 1**
   - Teachers Service (3 jours)
   - Schools Service (2 jours)

2. **Semaine 2**
   - Rooms Service (5 jours)

**Livrables** :
- 3 microservices opérationnels
- APIs REST complètes
- Documentation

---

### Sprint 2 (2 semaines) : Modules Métier Essentiels Frontend
**Objectif** : Interfaces pour les services créés

1. **Semaine 1**
   - Module Teachers Frontend (3 jours)
   - Module Schools Frontend (2 jours)

2. **Semaine 2**
   - Module Rooms Frontend (4 jours)
   - Intégration et tests (1 jour)

**Livrables** :
- 3 modules frontend fonctionnels
- Interfaces CRUD complètes

---

### Sprint 3 (2 semaines) : Cours et Groupes
**Objectif** : Compléter les entités de base

1. **Semaine 1**
   - Courses Service Backend (3 jours)
   - Groups Service Backend (2 jours)

2. **Semaine 2**
   - Courses Frontend (3 jours)
   - Groups Frontend (2 jours)

**Livrables** :
- 2 microservices + interfaces
- Toutes les entités de base opérationnelles

---

### Sprint 4 (3 semaines) : Emplois du Temps (Cœur Métier)
**Objectif** : Module de planification complet

1. **Semaine 1-2**
   - Schedule Service Backend (7 jours)
   - Algorithme de détection conflits
   - Tests intensifs

2. **Semaine 3**
   - Schedule Frontend (5 jours)
   - Calendrier interactif
   - Export PDF/Excel

**Livrables** :
- Module de planification fonctionnel
- Détection automatique des conflits
- Exports

---

### Sprint 5 (1 semaine) : Événements et Ressources
**Objectif** : Modules complémentaires

1. Events Service + Frontend (3 jours)
2. Resources Service + Frontend (2 jours)
3. Intégration (2 jours)

**Livrables** :
- Gestion des événements
- Gestion des ressources

---

### Sprint 6 (1 semaine) : Rapports et Dashboard
**Objectif** : Visualisation et statistiques

1. Reports Service Backend (3 jours)
2. Reports Frontend + Dashboard (3 jours)
3. Tests et ajustements (1 jour)

**Livrables** :
- Module de rapports
- Dashboard dynamique
- Graphiques interactifs

---

### Sprint 7 (1 semaine) : Tests et Qualité
**Objectif** : Assurer la qualité globale

1. Tests unitaires (3 jours)
2. Tests d'intégration (2 jours)
3. Corrections et optimisations (2 jours)

**Livrables** :
- Couverture tests > 70%
- Application stable

---

### Sprint 8 (1 semaine) : Documentation et Déploiement
**Objectif** : Finalisation et mise en production

1. Documentation API Swagger (2 jours)
2. Guide utilisateur (2 jours)
3. CI/CD et déploiement (3 jours)

**Livrables** :
- Documentation complète
- Application déployée

---

## 📊 Métriques et Estimations

### Temps de Développement Estimé

| Phase | Estimation | Priorité |
|-------|-----------|----------|
| Infrastructure | ✅ Complet | - |
| Authentification | ✅ Complet | - |
| Gestion Utilisateurs | ✅ Complet | - |
| Teachers Service | 5 jours | HAUTE |
| Schools Service | 3 jours | HAUTE |
| Rooms Service | 5 jours | HAUTE |
| Courses Service | 5 jours | MOYENNE |
| Groups Service | 3 jours | MOYENNE |
| Schedule Service | 10 jours | TRÈS HAUTE |
| Events Service | 3 jours | BASSE |
| Resources Service | 3 jours | BASSE |
| Reports Service | 5 jours | BASSE |
| Tests et Qualité | 7 jours | HAUTE |
| Documentation | 3 jours | MOYENNE |
| Déploiement | 3 jours | MOYENNE |
| **TOTAL** | **~55 jours** | - |

### Répartition Backend vs Frontend
- **Backend** : ~30 jours (55%)
- **Frontend** : ~25 jours (45%)

### Complexité par Module

| Module | Complexité | Risques |
|--------|-----------|---------|
| Teachers | Moyenne | Faible |
| Schools | Faible | Faible |
| Rooms | Moyenne | Disponibilités |
| Courses | Moyenne | Prérequis |
| Groups | Faible | Faible |
| Schedules | **Très Haute** | Algorithme conflits |
| Events | Faible | Notifications |
| Resources | Moyenne | Réservations |
| Reports | Haute | Génération PDF/Excel |

---

## 🎯 Objectifs à Court Terme (1 mois)

1. ✅ Infrastructure complète
2. ✅ Authentification et sécurité
3. ✅ Gestion des utilisateurs
4. ⏳ Teachers Service (Backend + Frontend)
5. ⏳ Schools Service (Backend + Frontend)
6. ⏳ Rooms Service (Backend + Frontend)

**Objectif** : Avoir 50% du projet fonctionnel

---

## 🎯 Objectifs à Moyen Terme (2-3 mois)

1. ⏳ Tous les services métier backend
2. ⏳ Toutes les interfaces frontend
3. ⏳ Module emplois du temps complet
4. ⏳ Tests complets
5. ⏳ Documentation Swagger

**Objectif** : Application complète et testée

---

## 🎯 Objectifs à Long Terme (3-4 mois)

1. ⏳ Application en production
2. ⏳ CI/CD opérationnel
3. ⏳ Monitoring en place
4. ⏳ Formation utilisateurs
5. ⏳ Support et maintenance

**Objectif** : Système en production stable

---

## ⚠️ Risques Identifiés

### Risques Techniques
1. **Algorithme de planification** (Schedule Service)
   - Complexité : Très haute
   - Impact : Critique
   - Mitigation : Recherche d'algorithmes existants, POC avant implémentation

2. **Performance avec volume de données**
   - Complexité : Haute
   - Impact : Moyen
   - Mitigation : Pagination, indexation BDD, cache

3. **Gestion des conflits en temps réel**
   - Complexité : Haute
   - Impact : Moyen
   - Mitigation : Validation côté backend, tests intensifs

### Risques Organisationnels
1. **Disponibilité de l'équipe**
   - Impact : Moyen
   - Mitigation : Planning réaliste, priorisation claire

2. **Changements de requirements**
   - Impact : Moyen
   - Mitigation : Architecture modulaire, documentation

---

## 📝 Notes et Recommandations

### Bonnes Pratiques à Maintenir
- ✅ Architecture microservices découplée
- ✅ Documentation continue
- ✅ Tests au fur et à mesure
- ✅ Code reviews
- ✅ Commits atomiques et descriptifs

### Points d'Attention
- ⚠️ Ne pas négliger les tests
- ⚠️ Documenter les décisions techniques
- ⚠️ Sauvegardes régulières de la BDD
- ⚠️ Versionner la BDD (migrations)

### Améliorations Possibles
- 🔄 Intégrer Redis pour cache
- 🔄 Implémenter WebSockets pour notifications temps réel
- 🔄 Ajouter une API GraphQL en plus de REST
- 🔄 Implémenter le Circuit Breaker pattern
- 🔄 Ajouter un service de notifications (email, SMS)

---

## 📞 Support et Contact

**Équipe de Développement** : Groupe 3 - ISI 4 FR 6  
**Institution** : IUSJ-C  
**Date de création** : Janvier 2026

---

**Document mis à jour le** : 7 Janvier 2026  
**Version** : 1.0  
**Statut** : En développement actif
