# 🌐 IUSJ Gateway Service - Documentation

## Vue d'ensemble

Le **IUSJ Gateway Service** est la passerelle API (API Gateway) de l'architecture microservices IUSJ. Il sert de point d'entrée unique pour tous les clients et route les requêtes vers les services appropriés.

## 🎯 Rôle et Responsabilités

### Fonctions principales :
- **Point d'entrée unique** : Centralisation de l'accès aux microservices
- **Routage intelligent** : Distribution des requêtes vers les bons services
- **Load balancing** : Répartition de charge automatique via Eureka
- **Gestion CORS** : Configuration des politiques de partage de ressources
- **Monitoring** : Surveillance et métriques des requêtes

### Avantages :
- **Simplification client** : Une seule URL à connaître
- **Découverte automatique** : Résolution des services via Eureka
- **Résilience** : Gestion des pannes de services
- **Sécurité centralisée** : Point de contrôle unique

## 🏗️ Architecture Technique

### Technologies utilisées :
- **Spring Boot 3.5.7** : Framework principal
- **Spring Cloud Gateway** : Passerelle réactive
- **Spring Cloud LoadBalancer** : Répartition de charge
- **Eureka Client** : Découverte de services
- **Netty** : Serveur web réactif
- **Actuator** : Monitoring et métriques

### Configuration :
- **Port** : 8080 (Point d'entrée principal)
- **Eureka** : Enregistré sous le nom `IUSJ-GATEWAY-SERVICE`
- **Mode** : Réactif (WebFlux)

## 🛣️ Routes Configurées

### Route Auth Service
- **Pattern** : `/auth/**`
- **Destination** : `lb://iusj-auth-service` (Port 8082)
- **Exemple** : `POST /auth/login` → `POST http://iusj-auth-service:8082/auth/login`

### Route User Service
- **Pattern** : `/api/users/**`
- **Destination** : `lb://iusj-user-service` (Port 8081)
- **Exemple** : `GET /api/users` → `GET http://iusj-user-service:8081/api/users`

### Route Public API
- **Pattern** : `/public/**`
- **Destination** : `lb://iusj-user-service` (Port 8081)
- **Exemple** : `GET /public/health` → `GET http://iusj-user-service:8081/public/health`

## 📋 Endpoints Disponibles

### Via Gateway (Port 8080)

**Authentification** :
```bash
POST http://localhost:8080/auth/login
```

**Gestion des utilisateurs** :
```bash
GET    http://localhost:8080/api/users
POST   http://localhost:8080/api/users
GET    http://localhost:8080/api/users/{id}
PUT    http://localhost:8080/api/users/{id}
DELETE http://localhost:8080/api/users/{id}
```

**APIs publiques** :
```bash
GET http://localhost:8080/public/*
```

### Endpoints de monitoring :
```bash
GET http://localhost:8080/actuator/health
GET http://localhost:8080/actuator/gateway/routes
```

## 🗂️ Structure du Code

```
src/main/java/com/example/iusj_gateway_service/
├── controller/
│   └── FallbackController.java      # Gestion des erreurs
└── IusjGatewayServiceApplication.java # Classe principale
```

```
src/main/resources/
└── application.yml                  # Configuration principale
```

## 🔧 Configuration

### application.yml
```yaml
server:
  port: 8080

spring:
  application:
    name: iusj-gateway-service
  
  cloud:
    gateway:
      routes:
        # Route Auth Service
        - id: auth-service
          uri: lb://iusj-auth-service
          predicates:
            - Path=/auth/**
          filters:
            - StripPrefix=0
        
        # Route User Service
        - id: user-service
          uri: lb://iusj-user-service
          predicates:
            - Path=/api/users/**
          filters:
            - StripPrefix=0
      
      # Configuration CORS
      globalcors:
        cors-configurations:
          '[/**]':
            allowedOrigins: 
              - "http://localhost:3000"
              - "http://localhost:4200"
            allowedMethods:
              - GET
              - POST
              - PUT
              - DELETE
              - OPTIONS
            allowedHeaders: "*"
            allowCredentials: true

# Configuration Eureka
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
    register-with-eureka: true
    fetch-registry: true
  instance:
    prefer-ip-address: true
```

## 🚀 Démarrage

### Prérequis :
1. **Java 17+** installé
2. **Maven 3.6+** installé
3. **Eureka Server** démarré sur le port 8761
4. **Services cibles** démarrés (Auth Service, User Service)

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
- Gateway accessible sur : http://localhost:8080
- Enregistrement Eureka : http://localhost:8761
- Routes configurées : http://localhost:8080/actuator/gateway/routes
- Health check : http://localhost:8080/actuator/health

## 🧪 Tests

### Test de routage :

**Via Gateway** :
```bash
# Test Auth Service via Gateway
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login": "admin", "password": "password123"}'

# Test User Service via Gateway
curl -X GET http://localhost:8080/api/users

# Test création utilisateur via Gateway
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "prenom": "Gateway",
    "email": "test@gateway.com",
    "login": "testgw",
    "password": "test123",
    "role": "USER"
  }'
```

### Test de découverte de services :
```bash
# Vérifier les routes configurées
curl http://localhost:8080/actuator/gateway/routes

# Vérifier la santé du Gateway
curl http://localhost:8080/actuator/health
```

## 🔄 Load Balancing

### Fonctionnement :
- **Découverte automatique** : Via Eureka Server
- **Algorithme** : Round-robin par défaut
- **Health checks** : Exclusion automatique des instances défaillantes
- **Failover** : Basculement automatique en cas de panne

### Configuration :
```yaml
# Load balancer configuré automatiquement via lb://service-name
uri: lb://iusj-auth-service  # Load balancing vers toutes les instances
```

## 🌍 Configuration CORS

### Origines autorisées :
- `http://localhost:3000` (React)
- `http://localhost:4200` (Angular)

### Méthodes autorisées :
- GET, POST, PUT, DELETE, OPTIONS

### Headers :
- Tous les headers autorisés (`*`)
- Credentials autorisés

## 📊 Monitoring et Métriques

### Endpoints Actuator :
- `/actuator/health` : État de santé du Gateway
- `/actuator/gateway/routes` : Liste des routes configurées
- `/actuator/gateway/filters` : Filtres disponibles

### Métriques disponibles :
- Nombre de requêtes par route
- Temps de réponse par service
- Taux d'erreur par endpoint
- État des services découverts

### Logs importants :
```
# Démarrage et configuration des routes
RouteDefinition matched: auth-service
RouteDefinition matched: user-service

# Enregistrement Eureka
Registering application IUSJ-GATEWAY-SERVICE with eureka

# Requêtes routées
[route_id: auth-service] Mapped to lb://iusj-auth-service
```

## 🐛 Dépannage

### Problèmes courants :

**Port déjà utilisé** :
```bash
# Vérifier le port 8080
netstat -ano | findstr 8080
# Arrêter le processus si nécessaire
taskkill /PID <PID> /F
```

**Service non découvert** :
- Vérifier qu'Eureka Server est accessible
- Vérifier que les services cibles sont enregistrés dans Eureka
- Attendre 30 secondes pour la synchronisation Eureka

**Erreur de routage** :
- Vérifier la configuration des routes dans application.yml
- Vérifier les patterns de path
- Consulter les logs du Gateway

**Erreur CORS** :
- Vérifier la configuration globalcors
- Ajouter l'origine du client dans allowedOrigins
- Vérifier les headers de la requête

## 🔒 Sécurité

### Points d'attention :
- **Pas d'authentification** : Le Gateway ne valide pas les tokens JWT
- **CORS ouvert** : Configuration permissive pour le développement
- **Exposition des endpoints** : Actuator accessible sans authentification

### Améliorations recommandées :
- Implémentation d'un filtre JWT global
- Restriction des endpoints Actuator
- Configuration CORS plus stricte pour la production
- Rate limiting pour éviter les abus

## 🔄 Intégration avec les autres services

### Avec Eureka Server :
- **Enregistrement** : Automatique au démarrage
- **Découverte** : Résolution des services cibles
- **Health checks** : Monitoring des services

### Avec Auth Service :
- **Routage** : `/auth/**` → Port 8082
- **Load balancing** : Distribution automatique
- **Failover** : Gestion des pannes

### Avec User Service :
- **Routage** : `/api/users/**` → Port 8081
- **Load balancing** : Distribution automatique
- **Failover** : Gestion des pannes

## 🚀 Améliorations possibles

### Sécurité :
- Filtre JWT global pour l'authentification
- Rate limiting par IP/utilisateur
- Validation des tokens en amont

### Fonctionnalités :
- Circuit breaker pour la résilience
- Retry automatique en cas d'échec
- Transformation des requêtes/réponses
- Cache des réponses

### Monitoring :
- Métriques personnalisées
- Tracing distribué
- Alertes sur les erreurs
- Dashboard de monitoring

### Performance :
- Configuration du cache
- Optimisation des timeouts
- Pool de connexions configuré