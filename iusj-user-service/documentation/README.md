# 👥 IUSJ User Service - Documentation

## Vue d'ensemble

Le **IUSJ User Service** est le service de gestion des utilisateurs de l'architecture microservices IUSJ. Il fournit un CRUD complet pour la gestion des utilisateurs et leurs informations.

## 🎯 Rôle et Responsabilités

### Fonctions principales :
- **Gestion CRUD des utilisateurs** : Création, lecture, mise à jour, suppression
- **Gestion des profils utilisateur** : Informations personnelles et professionnelles
- **Gestion des rôles** : Attribution et modification des rôles utilisateur
- **Validation des données** : Contrôle de la cohérence des informations

### Intégrations :
- **Base de données MySQL** : Stockage des utilisateurs
- **Eureka Server** : Enregistrement pour découverte de services
- **API Gateway** : Accessible via le gateway sur `/api/users/**`
- **Auth Service** : Complémentaire pour l'authentification

## 🏗️ Architecture Technique

### Technologies utilisées :
- **Spring Boot 3.5.7** : Framework principal
- **Spring Data JPA** : Accès aux données et ORM
- **Spring Validation** : Validation des données d'entrée
- **MySQL** : Base de données relationnelle
- **Lombok** : Réduction du code boilerplate
- **Eureka Client** : Service discovery

### Configuration :
- **Port** : 8081
- **Base de données** : `bd_tutore` sur localhost:3306
- **Eureka** : Enregistré sous le nom `IUSJ-USER-SERVICE`

## 📋 API Endpoints

### GET `/api/users`
**Description** : Récupère la liste de tous les utilisateurs

**Response Success (200)** :
```json
[
  {
    "id": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "login": "jdupont",
    "role": "USER"
  }
]
```

### GET `/api/users/{id}`
**Description** : Récupère un utilisateur par son ID

**Response Success (200)** :
```json
{
  "id": 1,
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@example.com",
  "login": "jdupont",
  "role": "USER"
}
```

**Response Error (404)** :
```json
{
  "error": "User not found"
}
```

### POST `/api/users`
**Description** : Crée un nouvel utilisateur

**Request Body** :
```json
{
  "nom": "Martin",
  "prenom": "Marie",
  "email": "marie.martin@example.com",
  "login": "mmartin",
  "password": "password123",
  "role": "USER"
}
```

**Response Success (200)** :
```json
{
  "id": 2,
  "nom": "Martin",
  "prenom": "Marie",
  "email": "marie.martin@example.com",
  "login": "mmartin",
  "role": "USER"
}
```

### PUT `/api/users/{id}`
**Description** : Met à jour un utilisateur existant

**Request Body** :
```json
{
  "nom": "Martin",
  "prenom": "Marie-Claire",
  "email": "marie.martin@newdomain.com",
  "login": "mmartin",
  "password": "newpassword123",
  "role": "ADMIN"
}
```

**Response Success (200)** : Utilisateur mis à jour
**Response Error (404)** : Utilisateur non trouvé

### DELETE `/api/users/{id}`
**Description** : Supprime un utilisateur

**Response Success (204)** : Suppression réussie
**Response Error (404)** : Utilisateur non trouvé

## 🗂️ Structure du Code

```
src/main/java/com/example/iusj_user_service/
├── controller/
│   └── UserController.java          # Endpoints REST
├── services/
│   └── UserService.java             # Logique métier
├── entities/
│   └── User.java                    # Entité utilisateur JPA
├── repository/
│   └── UserRepository.java          # Interface d'accès aux données
└── IusjUserServiceApplication.java  # Classe principale Spring Boot
```

## 🔧 Configuration

### application.properties
```properties
# Application
spring.application.name=iusj-user-service
server.port=8081

# Base de données
spring.datasource.url=jdbc:mysql://localhost:3306/bd_tutore
spring.datasource.username=root
spring.datasource.password=tenzo

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Eureka Client
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
eureka.instance.prefer-ip-address=true
```

## 🗄️ Modèle de Données

### Entité User
```java
@Entity
@Table(name="User")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nom;
    private String prenom;
    private String email;
    private String login;
    private String password;
    
    @Enumerated(EnumType.STRING)
    private Role role;
    
    public enum Role {
        ADMIN, USER
    }
}
```

### Base de données
- **Table** : `User`
- **Champs** : id, nom, prenom, email, login, password, role
- **Contraintes** : ID auto-incrémenté, login unique recommandé

## 🚀 Démarrage

### Prérequis :
1. **Java 17+** installé
2. **Maven 3.6+** installé
3. **MySQL** démarré avec la base `bd_tutore`
4. **Eureka Server** démarré sur le port 8761

### Commandes :
```bash
# Compilation
mvn clean compile

# Démarrage
mvn spring-boot:run

# Tests
mvn test
```

### Vérification :
- Service accessible sur : http://localhost:8081
- Enregistrement Eureka : http://localhost:8761
- Test API : http://localhost:8081/api/users

## 🧪 Tests

### Test manuel avec curl :

**Lister les utilisateurs** :
```bash
curl -X GET http://localhost:8081/api/users
```

**Créer un utilisateur** :
```bash
curl -X POST http://localhost:8081/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "prenom": "User",
    "email": "test@example.com",
    "login": "testuser",
    "password": "test123",
    "role": "USER"
  }'
```

**Récupérer un utilisateur** :
```bash
curl -X GET http://localhost:8081/api/users/1
```

### Via API Gateway :
```bash
# Tous les endpoints sont accessibles via le Gateway sur le port 8080
curl -X GET http://localhost:8080/api/users
curl -X POST http://localhost:8080/api/users -H "Content-Type: application/json" -d '{...}'
```

## 🔒 Sécurité

### Validation des données :
- **@Valid** : Validation automatique des DTOs
- **Contraintes JPA** : Validation au niveau base de données
- **Gestion des erreurs** : Réponses HTTP appropriées

### Points d'attention :
- **Mots de passe** : Stockés en clair (à améliorer avec encodage)
- **Authentification** : Pas de sécurité implémentée (délégué à Auth Service)
- **Autorisation** : Pas de contrôle d'accès par rôle

## 📊 Monitoring

### Endpoints disponibles :
- Tous les endpoints CRUD sont exposés
- Pas d'endpoints Actuator configurés par défaut

### Logs importants :
- Requêtes SQL (show-sql=true)
- Opérations CRUD
- Erreurs de validation
- Enregistrement Eureka

## 🐛 Dépannage

### Problèmes courants :

**Port déjà utilisé** :
```bash
# Vérifier les processus sur le port 8081
netstat -ano | findstr 8081
# Arrêter le processus si nécessaire
taskkill /PID <PID> /F
```

**Erreur de base de données** :
- Vérifier que MySQL est démarré
- Vérifier les credentials dans application.properties
- Vérifier que la base `bd_tutore` existe
- Vérifier les permissions de création de tables (ddl-auto=update)

**Erreur de validation** :
- Vérifier le format des données JSON
- Vérifier les contraintes de validation
- Consulter les logs pour les détails

## 🔄 Intégration avec les autres services

### Avec Auth Service :
- **Base de données partagée** : Même table User
- **Complémentarité** : User Service pour CRUD, Auth Service pour authentification
- **Cohérence des données** : Même modèle d'entité

### Avec API Gateway :
- **Routage** : Accessible via `/api/users/**`
- **Load balancing** : Distribution automatique des requêtes
- **Découverte** : Via Eureka Server

### Avec Eureka Server :
- **Enregistrement** : Automatique au démarrage
- **Health checks** : Monitoring de l'état du service
- **Découverte** : Permet aux autres services de le trouver

## 🚀 Améliorations possibles

### Sécurité :
- Implémentation de l'authentification JWT
- Encodage des mots de passe
- Contrôle d'accès par rôles

### Fonctionnalités :
- Pagination pour la liste des utilisateurs
- Recherche et filtrage
- Validation avancée des emails
- Gestion des profils utilisateur étendus

### Monitoring :
- Ajout d'Actuator pour le monitoring
- Métriques personnalisées
- Logs structurés