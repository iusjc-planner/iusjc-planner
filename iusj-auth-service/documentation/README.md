# 🔐 IUSJ Auth Service - Documentation

## Vue d'ensemble

Le **IUSJ Auth Service** est le service d'authentification de l'architecture microservices IUSJ. Il gère l'authentification des utilisateurs et la génération de tokens JWT (JSON Web Tokens).

## 🎯 Rôle et Responsabilités

### Fonctions principales :
- **Authentification utilisateur** : Vérification des identifiants (login/password)
- **Génération de tokens JWT** : Création de tokens sécurisés pour l'autorisation
- **Validation des mots de passe** : Vérification avec encodage sécurisé
- **Gestion des rôles** : Attribution des rôles (ADMIN, USER)

### Intégrations :
- **Base de données MySQL** : Stockage des utilisateurs
- **Eureka Server** : Enregistrement pour découverte de services
- **API Gateway** : Accessible via le gateway sur `/auth/**`

## 🏗️ Architecture Technique

### Technologies utilisées :
- **Spring Boot 3.5.7** : Framework principal
- **Spring Security** : Sécurité et encodage des mots de passe
- **Spring Data JPA** : Accès aux données
- **JWT (jjwt 0.11.5)** : Génération et validation des tokens
- **MySQL** : Base de données
- **Eureka Client** : Service discovery

### Configuration :
- **Port** : 8082
- **Base de données** : `bd_tutore` sur localhost:3306
- **Eureka** : Enregistré sous le nom `IUSJ-AUTH-SERVICE`

## 📋 API Endpoints

### POST `/auth/login`
**Description** : Authentifie un utilisateur et retourne un token JWT

**Request Body** :
```json
{
  "login": "string",
  "password": "string"
}
```

**Response Success (200)** :
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Error (401)** :
```json
{
  "error": "Utilisateur non trouvé"
}
```

**Response Error (401)** :
```json
{
  "error": "Mot de passe incorrect"
}
```

## 🗂️ Structure du Code

```
src/main/java/com/example/iusj_auth_service/
├── controller/
│   └── AuthController.java          # Endpoints REST
├── service/
│   └── AuthService.java             # Logique métier
├── security/
│   ├── JwtUtil.java                 # Utilitaires JWT
│   ├── JwtFilter.java               # Filtre JWT
│   ├── SecurityConfig.java          # Configuration sécurité
│   └── StartupPasswordEncoder.java  # Encodeur mots de passe
├── entities/
│   └── User.java                    # Entité utilisateur
├── repository/
│   └── UserRepository.java          # Accès données
├── DTO/
│   ├── LoginRequest.java            # DTO requête login
│   └── LoginResponse.java           # DTO réponse login
└── IusjAuthServiceApplication.java  # Classe principale
```

## 🔧 Configuration

### application.properties
```properties
# Application
spring.application.name=iusj-auth-service
server.port=8082

# Base de données
spring.datasource.url=jdbc:mysql://localhost:3306/bd_tutore
spring.datasource.username=root
spring.datasource.password=tenzo

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true

# Eureka Client
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
eureka.instance.prefer-ip-address=true
```

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
- Service accessible sur : http://localhost:8082
- Enregistrement Eureka : http://localhost:8761
- Health check : http://localhost:8082/actuator/health

## 🧪 Tests

### Test manuel avec curl :
```bash
# Test d'authentification
curl -X POST http://localhost:8082/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "admin",
    "password": "password123"
  }'
```

### Via API Gateway :
```bash
# Test via Gateway (port 8080)
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "admin", 
    "password": "password123"
  }'
```

## 🔒 Sécurité

### JWT Configuration :
- **Algorithme** : HS256
- **Durée de vie** : 24 heures (86400000 ms)
- **Secret** : Configuré dans JwtUtil.java
- **Claims** : username, role, iat, exp

### Encodage des mots de passe :
- **Algorithme** : BCrypt
- **Rounds** : Par défaut Spring Security

## 📊 Monitoring

### Endpoints Actuator disponibles :
- `/actuator/health` : État de santé du service
- `/actuator/info` : Informations sur l'application

### Logs importants :
- Tentatives de connexion
- Génération de tokens
- Erreurs d'authentification
- Enregistrement Eureka

## 🐛 Dépannage

### Problèmes courants :

**Port déjà utilisé** :
```bash
# Vérifier les processus sur le port 8082
netstat -ano | findstr 8082
# Arrêter le processus si nécessaire
taskkill /PID <PID> /F
```

**Erreur de base de données** :
- Vérifier que MySQL est démarré
- Vérifier les credentials dans application.properties
- Vérifier que la base `bd_tutore` existe

**Erreur Eureka** :
- Vérifier qu'Eureka Server est démarré sur 8761
- Vérifier la configuration eureka.client.service-url.defaultZone

## 🔄 Intégration avec les autres services

### Avec User Service :
- Partage la même base de données
- Utilise les mêmes entités User
- Complémentaire pour la gestion complète des utilisateurs

### Avec API Gateway :
- Accessible via `/auth/**`
- Load balancing automatique
- Découverte via Eureka

### Avec Eureka Server :
- Enregistrement automatique au démarrage
- Heartbeat toutes les 10 secondes
- Désenregistrement à l'arrêt