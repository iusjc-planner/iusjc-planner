# Cahier d'Analyse - IUSJ Planner
## Projet Tutoré ISI 4 FR 6 - Groupe 3

---

## 📋 Table des Matières

1. [Introduction](#introduction)
2. [Contexte du Projet](#contexte-du-projet)
3. [Analyse des Besoins](#analyse-des-besoins)
4. [Analyse Fonctionnelle](#analyse-fonctionnelle)
5. [Analyse des Acteurs](#analyse-des-acteurs)
6. [Diagrammes UML](#diagrammes-uml)
7. [Règles de Gestion](#règles-de-gestion)
8. [Contraintes Techniques](#contraintes-techniques)
9. [Conclusion](#conclusion)

---

## 1. Introduction

### 1.1 Objectif du Document
Ce document présente l'analyse complète du système IUSJ Planner, une application web de gestion et de planification pour l'Institut Universitaire Saint-Jérôme du Congo (IUSJ-C).

### 1.2 Portée du Projet
IUSJ Planner est une solution de gestion académique permettant de :
- Gérer les utilisateurs et leurs rôles
- Organiser les enseignants et leurs affectations
- Planifier les cours et emplois du temps
- Gérer les salles et ressources
- Administrer les écoles et groupes d'étudiants
- Générer des rapports et statistiques

### 1.3 Public Cible
- **Administrateurs** : Gestion globale du système
- **Enseignants** : Consultation des emplois du temps
- **Personnel administratif** : Gestion des plannings et ressources

---

## 2. Contexte du Projet

### 2.1 Présentation de l'IUSJ-C
L'Institut Universitaire Saint-Jérôme du Congo est une institution d'enseignement supérieur nécessitant une solution moderne pour gérer ses activités académiques et administratives.

### 2.2 Problématique
L'IUSJ-C fait face à plusieurs défis :
- **Gestion manuelle** : Les plannings sont gérés manuellement, source d'erreurs
- **Manque de coordination** : Difficultés de communication entre services
- **Absence de traçabilité** : Pas d'historique des modifications
- **Conflits de ressources** : Chevauchements de salles et enseignants
- **Reporting limité** : Difficulté à extraire des statistiques

### 2.3 Solution Proposée
Une application web moderne basée sur une architecture microservices permettant :
- **Centralisation** : Données unifiées et accessibles
- **Automatisation** : Génération automatique des plannings
- **Collaboration** : Accès multi-utilisateurs avec gestion des droits
- **Traçabilité** : Historique complet des actions
- **Évolutivité** : Architecture scalable et modulaire

---

## 3. Analyse des Besoins

### 3.1 Besoins Fonctionnels

#### 3.1.1 Gestion des Utilisateurs
- **BF-001** : Créer un compte utilisateur avec login, mot de passe, rôle
- **BF-002** : Modifier les informations d'un utilisateur
- **BF-003** : Désactiver/Activer un compte utilisateur
- **BF-004** : Supprimer un utilisateur
- **BF-005** : Lister tous les utilisateurs avec filtrage
- **BF-006** : Rechercher un utilisateur par critères multiples
- **BF-007** : Gérer les rôles (ADMIN, USER)
- **BF-008** : Visualiser le profil utilisateur

#### 3.1.2 Authentification et Sécurité
- **BF-009** : Se connecter avec login/mot de passe
- **BF-010** : Se déconnecter du système
- **BF-011** : Vérifier les autorisations selon le rôle
- **BF-012** : Chiffrer les mots de passe
- **BF-013** : Gérer les sessions avec JWT
- **BF-014** : Expirer les tokens après délai
- **BF-015** : Protéger les routes sensibles

#### 3.1.3 Gestion des Enseignants
- **BF-016** : Ajouter un enseignant avec informations complètes
- **BF-017** : Modifier les informations d'un enseignant
- **BF-018** : Désactiver/Activer un enseignant
- **BF-019** : Supprimer un enseignant
- **BF-020** : Lister tous les enseignants
- **BF-021** : Rechercher un enseignant
- **BF-022** : Affecter un enseignant à des cours
- **BF-023** : Visualiser les disponibilités d'un enseignant

#### 3.1.4 Gestion des Écoles
- **BF-024** : Créer une école (faculté/département)
- **BF-025** : Modifier les informations d'une école
- **BF-026** : Désactiver/Activer une école
- **BF-027** : Supprimer une école
- **BF-028** : Lister toutes les écoles
- **BF-029** : Visualiser la hiérarchie des écoles

#### 3.1.5 Gestion des Salles
- **BF-030** : Ajouter une salle avec capacité et équipements
- **BF-031** : Modifier les informations d'une salle
- **BF-032** : Désactiver/Activer une salle
- **BF-033** : Supprimer une salle
- **BF-034** : Lister toutes les salles
- **BF-035** : Vérifier la disponibilité d'une salle
- **BF-036** : Filtrer les salles par capacité et équipements
- **BF-037** : Gérer les maintenances et indisponibilités

#### 3.1.6 Gestion des Cours
- **BF-038** : Créer un cours avec code, nom, crédits
- **BF-039** : Modifier les informations d'un cours
- **BF-040** : Désactiver/Activer un cours
- **BF-041** : Supprimer un cours
- **BF-042** : Lister tous les cours
- **BF-043** : Affecter un cours à une école
- **BF-044** : Définir les prérequis d'un cours

#### 3.1.7 Gestion des Groupes
- **BF-045** : Créer un groupe d'étudiants
- **BF-046** : Modifier un groupe
- **BF-047** : Désactiver/Activer un groupe
- **BF-048** : Supprimer un groupe
- **BF-049** : Lister tous les groupes
- **BF-050** : Affecter des étudiants à un groupe
- **BF-051** : Gérer la capacité maximale d'un groupe

#### 3.1.8 Gestion des Emplois du Temps
- **BF-052** : Créer un emploi du temps
- **BF-053** : Modifier un emploi du temps
- **BF-054** : Supprimer un emploi du temps
- **BF-055** : Visualiser l'emploi du temps d'un groupe
- **BF-056** : Visualiser l'emploi du temps d'un enseignant
- **BF-057** : Visualiser l'occupation des salles
- **BF-058** : Détecter les conflits de planification
- **BF-059** : Publier un emploi du temps
- **BF-060** : Exporter un emploi du temps (PDF, Excel)

#### 3.1.9 Gestion des Événements
- **BF-061** : Créer un événement (examen, conférence, etc.)
- **BF-062** : Modifier un événement
- **BF-063** : Annuler un événement
- **BF-064** : Supprimer un événement
- **BF-065** : Lister tous les événements
- **BF-066** : Filtrer les événements par date/type
- **BF-067** : Notifier les participants d'un événement

#### 3.1.10 Gestion des Ressources
- **BF-068** : Ajouter une ressource (projecteur, matériel, etc.)
- **BF-069** : Modifier une ressource
- **BF-070** : Désactiver/Activer une ressource
- **BF-071** : Supprimer une ressource
- **BF-072** : Lister toutes les ressources
- **BF-073** : Réserver une ressource
- **BF-074** : Vérifier la disponibilité d'une ressource

#### 3.1.11 Rapports et Statistiques
- **BF-075** : Générer un rapport d'utilisation des salles
- **BF-076** : Générer un rapport de charge des enseignants
- **BF-077** : Générer des statistiques par école
- **BF-078** : Générer un rapport des événements
- **BF-079** : Exporter les rapports en PDF/Excel
- **BF-080** : Visualiser des graphiques de synthèse

#### 3.1.12 Paramètres et Configuration
- **BF-081** : Configurer les paramètres généraux
- **BF-082** : Gérer les périodes académiques (semestres)
- **BF-083** : Définir les plages horaires
- **BF-084** : Configurer les jours ouvrables
- **BF-085** : Personnaliser l'interface (logo, couleurs)

### 3.2 Besoins Non Fonctionnels

#### 3.2.1 Performance
- **BNF-001** : Temps de réponse < 2 secondes pour les opérations courantes
- **BNF-002** : Support de 100 utilisateurs simultanés minimum
- **BNF-003** : Chargement des listes en pagination (20 éléments/page)

#### 3.2.2 Sécurité
- **BNF-004** : Authentification par JWT avec expiration
- **BNF-005** : Chiffrement des mots de passe (BCrypt)
- **BNF-006** : Protection CSRF
- **BNF-007** : Validation des entrées (XSS prevention)
- **BNF-008** : Logs des actions sensibles

#### 3.2.3 Disponibilité
- **BNF-009** : Disponibilité 99% du temps
- **BNF-010** : Sauvegarde quotidienne des données
- **BNF-011** : Plan de reprise après sinistre

#### 3.2.4 Utilisabilité
- **BNF-012** : Interface responsive (mobile, tablette, desktop)
- **BNF-013** : Navigation intuitive
- **BNF-014** : Messages d'erreur explicites
- **BNF-015** : Temps d'apprentissage < 2 heures

#### 3.2.5 Maintenabilité
- **BNF-016** : Architecture microservices modulaire
- **BNF-017** : Code commenté et documenté
- **BNF-018** : Tests unitaires (couverture > 70%)
- **BNF-019** : API REST standardisée

#### 3.2.6 Évolutivité
- **BNF-020** : Scalabilité horizontale des services
- **BNF-021** : Base de données normalisée
- **BNF-022** : Architecture découplée

---

## 4. Analyse Fonctionnelle

### 4.1 Processus Métier Principaux

#### 4.1.1 Processus d'Authentification
```
1. L'utilisateur saisit login/password
2. Le système valide les identifiants
3. Le système génère un token JWT
4. L'utilisateur accède au dashboard selon son rôle
5. Le token expire après 24h
```

#### 4.1.2 Processus de Création d'Emploi du Temps
```
1. L'administrateur sélectionne un groupe
2. L'administrateur choisit un cours
3. L'administrateur affecte un enseignant
4. L'administrateur choisit une salle
5. L'administrateur définit le créneau horaire
6. Le système vérifie les conflits
7. L'emploi du temps est enregistré
8. Notification aux parties prenantes
```

#### 4.1.3 Processus de Gestion des Conflits
```
1. L'administrateur tente une affectation
2. Le système détecte un conflit :
   - Enseignant déjà occupé
   - Salle déjà réservée
   - Groupe ayant déjà cours
3. Le système affiche les alternatives disponibles
4. L'administrateur choisit une alternative
5. L'affectation est confirmée
```

### 4.2 Flux de Données

#### 4.2.1 Flux d'Authentification
```
Frontend → Gateway → Auth Service → Database
                ↓
           JWT Token
                ↓
           Frontend (Storage)
                ↓
        Requêtes Authentifiées
```

#### 4.2.2 Flux de Gestion CRUD
```
Frontend → Gateway (JWT Validation) → Microservice → Database
                                          ↓
                                      Response
                                          ↓
                                      Frontend
```

---

## 5. Analyse des Acteurs

### 5.1 Acteurs du Système

#### 5.1.1 Administrateur
**Rôle** : Gestion complète du système

**Responsabilités** :
- Gérer les utilisateurs et leurs droits
- Configurer les paramètres du système
- Créer et modifier les emplois du temps
- Gérer toutes les entités (écoles, salles, cours, etc.)
- Générer les rapports
- Superviser le bon fonctionnement

**Droits d'accès** : Accès complet à toutes les fonctionnalités

#### 5.1.2 Utilisateur Standard
**Rôle** : Consultation et actions limitées

**Responsabilités** :
- Consulter les emplois du temps
- Consulter les informations publiques
- Consulter son profil
- Modifier son mot de passe

**Droits d'accès** : Lecture seule, pas de modification

#### 5.1.3 Enseignant (Futur)
**Rôle** : Consultation personnalisée

**Responsabilités** :
- Consulter son emploi du temps personnel
- Consulter ses affectations de cours
- Signaler ses indisponibilités
- Consulter les salles et ressources

**Droits d'accès** : Lecture + gestion de ses disponibilités

---

## 6. Diagrammes UML

### 6.1 Diagramme de Cas d'Utilisation Global

```
                    IUSJ Planner System
    ┌──────────────────────────────────────────┐
    │                                          │
    │  ┌────────────────────────────────┐     │
    │  │    Gérer Utilisateurs          │     │
    │  └────────────────────────────────┘     │
    │           ↑                              │
    │           │                              │
Administrateur  │                              │
    │           ↓                              │
    │  ┌────────────────────────────────┐     │
    │  │    Gérer Emplois du Temps      │     │
    │  └────────────────────────────────┘     │
    │           ↑                              │
    │           │                              │
    │           ↓                              │
    │  ┌────────────────────────────────┐     │
    │  │    Gérer Salles/Ressources     │     │
    │  └────────────────────────────────┘     │
    │                                          │
    │  ┌────────────────────────────────┐     │
    │  │    Consulter Emploi du Temps   │     │
    │  └────────────────────────────────┘     │
    │           ↑                              │
    │           │                              │
Utilisateur     │                              │
    │           │                              │
    └───────────┴──────────────────────────────┘
```

### 6.2 Diagramme de Classes Principal

```
┌─────────────────┐         ┌─────────────────┐
│      User       │         │    Enseignant   │
├─────────────────┤         ├─────────────────┤
│ - id            │         │ - id            │
│ - login         │         │ - nom           │
│ - password      │         │ - prenom        │
│ - email         │         │ - email         │
│ - role          │         │ - telephone     │
│ - status        │         │ - specialite    │
└─────────────────┘         └─────────────────┘
        │                           │
        │                           │
        │                           ↓
        │                   ┌─────────────────┐
        │                   │    EmploiDuTemps│
        │                   ├─────────────────┤
        │                   │ - id            │
        │                   │ - date          │
        │                   │ - heureDebut    │
        │                   │ - heureFin      │
        │                   │ - cours         │
        │                   │ - salle         │
        │                   │ - groupe        │
        │                   └─────────────────┘
        │                           ↑
        │                           │
        ↓                           │
┌─────────────────┐         ┌─────────────────┐
│      Salle      │         │      Cours      │
├─────────────────┤         ├─────────────────┤
│ - id            │         │ - id            │
│ - nom           │         │ - code          │
│ - numero        │         │ - nom           │
│ - capacite      │         │ - credits       │
│ - batiment      │         │ - description   │
│ - equipements   │         │ - ecole         │
└─────────────────┘         └─────────────────┘
        │                           │
        │                           │
        ↓                           ↓
┌─────────────────┐         ┌─────────────────┐
│      Ecole      │         │     Groupe      │
├─────────────────┤         ├─────────────────┤
│ - id            │         │ - id            │
│ - nom           │         │ - nom           │
│ - code          │         │ - niveau        │
│ - description   │         │ - ecole         │
└─────────────────┘         │ - effectif      │
                            └─────────────────┘
```

### 6.3 Diagramme de Séquence : Authentification

```
Utilisateur    Frontend    Gateway    Auth-Service    Database
    │             │           │            │             │
    │  Login      │           │            │             │
    ├────────────→│           │            │             │
    │             │  POST     │            │             │
    │             │  /auth/login           │             │
    │             ├──────────→│            │             │
    │             │           │  Forward   │             │
    │             │           ├───────────→│             │
    │             │           │            │  SELECT     │
    │             │           │            ├────────────→│
    │             │           │            │  User       │
    │             │           │            │←────────────┤
    │             │           │            │  Validate   │
    │             │           │            │  Password   │
    │             │           │            │  Generate   │
    │             │           │            │  JWT        │
    │             │           │  JWT Token │             │
    │             │           │←───────────┤             │
    │             │  Response │            │             │
    │             │←──────────┤            │             │
    │  Dashboard  │           │            │             │
    │←────────────┤           │            │             │
```

---

## 7. Règles de Gestion

### 7.1 Règles de Gestion des Utilisateurs
- **RG-001** : Un login doit être unique dans le système
- **RG-002** : Un email doit être unique dans le système
- **RG-003** : Un mot de passe doit contenir minimum 6 caractères
- **RG-004** : Un utilisateur désactivé ne peut plus se connecter
- **RG-005** : Seul un ADMIN peut créer/modifier/supprimer des utilisateurs

### 7.2 Règles de Gestion des Emplois du Temps
- **RG-006** : Un enseignant ne peut pas avoir 2 cours au même moment
- **RG-007** : Une salle ne peut pas être occupée par 2 cours au même moment
- **RG-008** : Un groupe ne peut pas avoir 2 cours au même moment
- **RG-009** : Un cours ne peut dépasser la capacité de la salle
- **RG-010** : Un emploi du temps doit être validé avant publication

### 7.3 Règles de Gestion des Salles
- **RG-011** : Une salle doit avoir une capacité minimale de 10 personnes
- **RG-012** : Une salle désactivée ne peut plus être réservée
- **RG-013** : Les salles doivent être numérotées de manière unique par bâtiment

### 7.4 Règles de Gestion des Cours
- **RG-014** : Un code de cours doit être unique
- **RG-015** : Un cours doit avoir entre 1 et 10 crédits
- **RG-016** : Un cours doit être rattaché à une école

### 7.5 Règles de Gestion des Groupes
- **RG-017** : Un groupe ne peut dépasser sa capacité maximale
- **RG-018** : Un nom de groupe doit être unique par école et niveau

---

## 8. Contraintes Techniques

### 8.1 Contraintes d'Architecture
- **CT-001** : Architecture microservices obligatoire
- **CT-002** : Communication via REST API
- **CT-003** : Service Discovery avec Eureka
- **CT-004** : API Gateway comme point d'entrée unique

### 8.2 Contraintes Technologiques
- **CT-005** : Backend en Spring Boot 3.x
- **CT-006** : Frontend en Angular 17+
- **CT-007** : Base de données MySQL 8.0+
- **CT-008** : Authentification par JWT

### 8.3 Contraintes de Déploiement
- **CT-009** : Déploiement via Docker
- **CT-010** : Support de Docker Compose
- **CT-011** : Variables d'environnement pour la configuration

### 8.4 Contraintes de Sécurité
- **CT-012** : HTTPS obligatoire en production
- **CT-013** : Mots de passe chiffrés (BCrypt)
- **CT-014** : Protection CORS configurée
- **CT-015** : Validation des entrées côté backend

---

## 9. Conclusion

### 9.1 Synthèse de l'Analyse
L'analyse du système IUSJ Planner révèle un besoin clair pour une solution de gestion académique moderne et évolutive. Le projet répond à des problématiques concrètes de l'institution en proposant une architecture robuste et sécurisée.

### 9.2 Points Clés
- **85 besoins fonctionnels** identifiés et spécifiés
- **22 besoins non fonctionnels** pour assurer qualité et performance
- **Architecture microservices** pour évolutivité et maintenabilité
- **Sécurité renforcée** avec JWT et chiffrement
- **Interface moderne** responsive et intuitive

### 9.3 Prochaines Étapes
1. Validation de l'analyse avec les parties prenantes
2. Conception détaillée de l'architecture
3. Définition des sprints de développement
4. Implémentation progressive des modules
5. Tests et validation continue

---

**Document préparé par** : Groupe 3 - ISI 4 FR 6  
**Date** : Janvier 2026  
**Version** : 1.0  
**Statut** : Validé
