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

La racine du workspace contient uniquement les éléments globaux (infrastructure,
documentation, configuration, scripts DevOps, pilotage du projet).

iusjc-planner/
│
├── services/ # Contient les microservices (via Git Submodules)
│ ├── auth-service/
│ ├── user-service/
│ ├── schedule-service/
│ ├── room-service/
│ ├── ...
│
├── ui/ # Interface utilisateur (submodule séparé)
│ └── iusjc-ui/
│
├── infrastructure/ # Docker compose, scripts de déploiement, config
│ ├── docker/
│ ├── scripts/
│ └── config/
│
├── documentation/ # UML, cahiers, API, guides techniques
│ ├── cahier_charges/
│ ├── cahier_analyse/
│ ├── cahier_conception/
│ ├── UML/
│ └── API/
│
├── README.md # Documentation rapide du projet
└── WORKSPACE.md # Présentation complète du workspace (ce fichier)

## 2. Dépôts Git

Le workspace utilise une architecture à **dépôts séparés** :

- 1 dépôt principal : `iusjc-planner`
- 1 dépôt par microservice (gateway, eureka, auth-service, user-service…)
- 1 dépôt UI
- chaque microservice est ajouté au workspace via **Git Submodule**

Commande générale :

git submodule add <url-du-dépôt> services/<nom-service>

Cette approche garantit :
- indépendance technique,
- pipelines CI/CD par service,
- modularité complète,
- facilitation du déploiement et du scaling.

## 3. Objectifs de chaque dossier

### /services/
Contient uniquement les microservices. Chaque service est autonome :
- son propre git
- son propre CI/CD
- sa propre base de code
- son Dockerfile

### /ui/
Contient le front-end (Thymeleaf).

### /infrastructure/
Contient :
- docker-compose global
- scripts DevOps
- configuration partagée (env, SSL, monitoring)

### /documentation/
Contient tous les livrables académiques et techniques :
- cahier des charges
- cahier d’analyse
- cahier de conception
- UML
- API Docs

### /README.md
Vue d’ensemble simple pour les encadrants.

### /WORKSPACE.md
Ce fichier — guide détaillé du workspace pour les développeurs.

## 4. Bonnes pratiques de travail

### Branches
- `main` → stable, production-ready
- `develop` → intégration
- `feature/<nom>` → développement d’une fonctionnalité

### Exécution locale
- Lancer l’ensemble des services avec :
docker compose up

### Documentation
Toujours mettre à jour le dossier `/documentation/` à chaque Sprint.

---

FIN DU DOCUMENT

