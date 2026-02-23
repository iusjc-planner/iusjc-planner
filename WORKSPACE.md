# iusjc-planner : Dépôt global de l'application microservices
# Workspace Architecture

Ce document présente la structure complète du workspace local du projet
**IUSJC Planner**, développé selon une architecture microservices et organisé
pour optimiser le travail collaboratif, la maintenance et le déploiement.

L’objectif est de garantir :

- une séparation claire entre les microservices,
- une architecture professionnelle compatible CI/CD,
- une organisation simple à comprendre pour les nouveaux membres,
- une compatibilité totale avec Docker, GitHub Actions et le VPS de production.


## 1. Structure générale du workspace

La racine du workspace contient les éléments globaux (documentation, scripts
DevOps, configuration CI, frontend) et les microservices.

iusjc-planner/
│
├── frontend/ # Application Angular (SPA)
├── infrastructure/ # Scripts et assets d'infrastructure
├── documentation/ # Cahiers, guides techniques, API
├── postman-collections/ # Collections et environnements Postman
│
├── iusj-auth-service/
├── iusj-user-service/
├── iusj-gateway-service/
├── iusj-eureka-service/
├── iusj-teacher-service/
├── iusj-school-service/
├── iusj-course-service/
├── iusj-room-service/
├── iusj-group-service/
├── iusj-schedule-service/
├── iusj-student-service/
├── iusj-resource-service/
│
├── docker-compose.ci.yml
├── start-services.ps1
├── stop-services.ps1
├── README.md
└── WORKSPACE.md

## 2. Dépôts Git

Le workspace est un **mono-repo** qui regroupe :

- un frontend Angular (dossier `frontend/`)
- plusieurs microservices Spring Boot (dossiers `iusj-*-service/`)
- scripts et fichiers de configuration CI/infra

Cette approche facilite :
- une vision globale de l'architecture,
- la synchronisation des versions,
- l'execution locale multi-services.

## 3. Objectifs de chaque dossier

### /iusj-*-service/
Chaque microservice Spring Boot est autonome :
- configuration propre (`application.properties`)
- dependencies Maven (`pom.xml`)
- logique metier et API REST

### /frontend/
Contient l'application Angular (SPA).

### /infrastructure/
Contient :
- scripts et assets d'infrastructure
- fichiers utilitaires pour l'environnement local/CI

### /documentation/
Contient tous les livrables académiques et techniques :
- cahier d'analyse
- cahier de conception
- guides techniques
- documentation API

### /README.md
Vue d’ensemble simple pour les encadrants.

### /WORKSPACE.md
Ce fichier — guide détaillé du workspace pour les développeurs.

## 4. Bonnes pratiques de travail

### Branches
- `main` → stable, production-ready
- `develop` → intégration
- `feature/<nom>` → développement d’une fonctionnalité

### Execution locale
- Utiliser `start-services.ps1` et `stop-services.ps1`.
- Pour l'integration CI, voir `docker-compose.ci.yml`.

### Documentation
Toujours mettre à jour le dossier `/documentation/` à chaque Sprint.

---

FIN DU DOCUMENT

