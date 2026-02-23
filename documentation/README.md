# 📚 Documentation IUSJ Microservices

## 🎯 Vue d'ensemble

Cette documentation complète couvre l'architecture microservices IUSJ, incluant tous les services, leur configuration, leur utilisation et leur maintenance.

## 📁 Structure de la Documentation

### 🏗️ Architecture Générale
- **[Cahier de conception](Cahier-conception.md)** - Vue d'ensemble complète de l'architecture
- **[Quick Start Guide](Quick-Start-Guide.md)** - Guide de démarrage rapide

### 🔧 Services Individuels

#### 🔐 Service d'Authentification
- **[Auth Service Documentation](../iusj-auth-service/documentation/README.md)**
  - Configuration JWT
  - Endpoints d'authentification
  - Sécurité et encodage
  - Intégration avec les autres services

#### 👥 Service Utilisateur
- **[User Service Documentation](../iusj-user-service/documentation/README.md)**
  - API CRUD complète
  - Gestion des profils utilisateur
  - Validation des données
  - Modèle de données

#### 🌐 API Gateway
- **[Gateway Service Documentation](../iusj-gateway-service/documentation/README.md)**
  - Configuration du routage
  - Load balancing
  - Gestion CORS
  - Monitoring et métriques

### 🧪 Tests et Validation
- **[Tests Postman Documentation](../postman-collections/Documentation-Tests.md)**
  - Collection complète de tests
  - Guide d'utilisation
  - Interprétation des résultats
- **[Import Instructions](../postman-collections/README-Import-Instructions.md)**
  - Instructions d'import Postman
  - Configuration des environnements

## 🚀 Démarrage Rapide

### Pour commencer immédiatement :
1. **Lire** le [Quick Start Guide](Quick-Start-Guide.md)
2. **Configurer** la base de données MySQL
3. **Démarrer** les services dans l'ordre
4. **Tester** avec les collections Postman

### Pour comprendre l'architecture :
1. **Consulter** le [Cahier de conception](Cahier-conception.md)
2. **Explorer** la documentation de chaque service
3. **Analyser** les flux de données et intégrations

## 🎯 Cas d'Usage Principaux

### 👤 Gestion des Utilisateurs
- **Création** : `POST /api/users`
- **Consultation** : `GET /api/users`
- **Modification** : `PUT /api/users/{id}`
- **Suppression** : `DELETE /api/users/{id}`

### 🔐 Authentification
- **Login** : `POST /auth/login`
- **Validation JWT** : Automatique via les services
- **Gestion des rôles** : ADMIN / USER

### 🌐 Routage API
- **Point d'entrée unique** : Gateway sur port 8080
- **Découverte automatique** : Via Eureka Server
- **Load balancing** : Répartition intelligente

## 🏗️ Architecture Technique

```
Client → Gateway (8080) → [Auth Service (8082) | User Service (8081)]
                     ↓
                Eureka Server (8761)
                     ↓
                MySQL Database (3306)
```

### Technologies Utilisées
- **Spring Boot 3.5.7** - Framework principal
- **Spring Cloud Gateway** - API Gateway
- **Netflix Eureka** - Service Discovery
- **Spring Security + JWT** - Authentification
- **Spring Data JPA** - Accès aux données
- **MySQL** - Base de données

## 📊 Monitoring et Observabilité

### Endpoints de Monitoring
- **Eureka Dashboard** : http://localhost:8761
- **Gateway Health** : http://localhost:8080/actuator/health
- **Gateway Routes** : http://localhost:8080/actuator/gateway/routes

### Métriques Importantes
- État des services dans Eureka
- Temps de réponse des APIs
- Taux d'erreur par endpoint
- Charge des services

## 🔒 Sécurité

### Authentification
- **JWT Tokens** avec expiration 24h
- **Encodage BCrypt** des mots de passe
- **Rôles utilisateur** (ADMIN/USER)

### Réseau
- **CORS configuré** pour les clients web
- **HTTPS recommandé** en production
- **Rate limiting** à implémenter

## 🐛 Dépannage

### Problèmes Courants
- **Services non découverts** → Vérifier Eureka
- **Erreurs de routage** → Consulter Gateway logs
- **Erreurs DB** → Vérifier MySQL et credentials
- **Ports occupés** → Identifier et arrêter les processus

### Logs Importants
- Enregistrement Eureka : "Registering application"
- Démarrage services : "Started Application in X seconds"
- Erreurs réseau : "Connection refused"

## 🚀 Évolution et Maintenance

### Ajout de Nouveaux Services
1. Créer le service Spring Boot
2. Ajouter Eureka Client
3. Configurer les routes Gateway
4. Mettre à jour la documentation

### Mise à Jour des Services
1. Modifier le code source
2. Recompiler avec Maven
3. Redémarrer le service
4. Vérifier l'enregistrement Eureka

### Monitoring Continu
- Surveiller Eureka Dashboard
- Analyser les logs applicatifs
- Tester régulièrement les APIs
- Maintenir la documentation à jour

## 📞 Support et Contribution

### Pour Contribuer
1. Fork le projet
2. Créer une branche feature
3. Développer et tester
4. Mettre à jour la documentation
5. Soumettre une Pull Request

### Ressources Utiles
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Cloud Gateway](https://spring.io/projects/spring-cloud-gateway)
- [Netflix Eureka](https://github.com/Netflix/eureka)
- [JWT.io](https://jwt.io/) pour comprendre les tokens JWT

## 📝 Changelog

### Version Actuelle
- ✅ Architecture microservices complète
- ✅ Service Discovery avec Eureka
- ✅ API Gateway avec routage intelligent
- ✅ Authentification JWT
- ✅ CRUD utilisateurs complet
- ✅ Tests Postman automatisés
- ✅ Documentation complète

### Améliorations Futures
- 🔄 Circuit Breaker pour la résilience
- 🔄 Cache distribué (Redis)
- 🔄 Tracing distribué (Zipkin)
- 🔄 Containerisation (Docker)
- 🔄 Orchestration (Kubernetes)