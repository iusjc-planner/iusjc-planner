# 🧪 Documentation des Tests Postman - IUSJ Microservices

## 📋 Vue d'ensemble

Cette collection Postman contient **15 tests organisés en 7 dossiers** pour valider complètement l'architecture microservices IUSJ. Les tests couvrent la santé des services, le routage, la découverte de services, la résilience et les performances.

## 📁 Structure de la Collection

### 1. 🏥 Health Checks
**Objectif** : Vérifier que tous les services sont opérationnels

#### Test 1 - Eureka Status
- **URL** : `{{eureka_url}}/eureka/apps`
- **Méthode** : GET
- **Validation** :
  - Status 200
  - Présence des 3 services (AUTH, USER, GATEWAY)
- **Variables créées** : Aucune

#### Test 2 - Gateway Health
- **URL** : `{{gateway_url}}/actuator/health`
- **Méthode** : GET
- **Validation** :
  - Status 200
  - Status "UP" dans la réponse
- **Variables créées** : Aucune

### 2. 🔧 Direct Services Tests
**Objectif** : Tester les services directement (sans passer par le Gateway)

#### Test 3 - User Service Direct List
- **URL** : `{{user_url}}/api/users`
- **Méthode** : GET
- **Validation** :
  - Status 200
  - Réponse de type array
- **Variables créées** : Aucune

#### Test 4 - User Service Direct Create
- **URL** : `{{user_url}}/api/users`
- **Méthode** : POST
- **Body** :
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@example.com",
  "login": "jdupont",
  "password": "password123",
  "role": "USER"
}
```
- **Validation** :
  - Status 200
  - Présence de l'ID utilisateur
- **Variables créées** : `test_user_id`

#### Test 5 - Auth Service Direct Login
- **URL** : `{{auth_url}}/auth/login`
- **Méthode** : POST
- **Body** :
```json
{
  "login": "jdupont",
  "password": "password123"
}
```
- **Validation** :
  - Status 200 (si utilisateur existe) ou 400/401 (si n'existe pas)
  - Présence du token si succès
- **Variables créées** : `jwt_token` (si succès)

### 3. 🌐 Gateway Routing Tests
**Objectif** : Valider le routage via l'API Gateway

#### Test 6 - Gateway to User Service
- **URL** : `{{gateway_url}}/api/users`
- **Méthode** : GET
- **Validation** :
  - Status 200
  - Réponse de type array
- **Variables créées** : Aucune

#### Test 7 - Gateway Create User
- **URL** : `{{gateway_url}}/api/users`
- **Méthode** : POST
- **Body** :
```json
{
  "nom": "Martin",
  "prenom": "Marie",
  "email": "marie.martin@example.com",
  "login": "mmartin",
  "password": "password456",
  "role": "USER"
}
```
- **Validation** :
  - Status 200
  - Présence de l'ID utilisateur
- **Variables créées** : `gateway_user_id`

#### Test 8 - Gateway to Auth Service
- **URL** : `{{gateway_url}}/auth/login`
- **Méthode** : POST
- **Body** :
```json
{
  "login": "mmartin",
  "password": "password456"
}
```
- **Validation** :
  - Status 200 (si utilisateur existe) ou 400/401
  - Présence du token si succès
- **Variables créées** : `gateway_jwt_token` (si succès)

### 4. 🔍 Service Discovery Tests
**Objectif** : Valider la découverte de services et la configuration

#### Test 9 - Gateway Routes Config
- **URL** : `{{gateway_url}}/actuator/gateway/routes`
- **Méthode** : GET
- **Validation** :
  - Status 200
  - Présence des routes auth-service et user-service
- **Variables créées** : Aucune

#### Test 10 - User Service Details in Eureka
- **URL** : `{{eureka_url}}/eureka/apps/IUSJ-USER-SERVICE`
- **Méthode** : GET
- **Validation** :
  - Status 200
  - Status "UP" de l'instance
- **Variables créées** : Aucune

### 5. 🔄 Resilience Tests
**Objectif** : Tester la résilience en cas de panne de service

#### Test 11 - Service Unavailable (Manual)
- **URL** : `{{gateway_url}}/api/users`
- **Méthode** : GET
- **Instructions** : Arrêter le User Service avant d'exécuter
- **Validation** :
  - Status 200 (si service fonctionne) ou 500/502/503 (si arrêté)
- **Variables créées** : Aucune

### 6. 🎯 E2E Workflow
**Objectif** : Tester un workflow utilisateur complet

#### E2E 1 - Create Test User
- **URL** : `{{gateway_url}}/api/users`
- **Méthode** : POST
- **Body** :
```json
{
  "nom": "TestUser",
  "prenom": "E2E",
  "email": "e2e@test.com",
  "login": "e2euser",
  "password": "test123",
  "role": "USER"
}
```
- **Variables créées** : `e2e_user_id`

#### E2E 2 - Login Test User
- **URL** : `{{gateway_url}}/auth/login`
- **Méthode** : POST
- **Body** :
```json
{
  "login": "e2euser",
  "password": "test123"
}
```
- **Variables créées** : `e2e_jwt_token`

#### E2E 3 - Get User by ID
- **URL** : `{{gateway_url}}/api/users/{{e2e_user_id}}`
- **Méthode** : GET
- **Validation** :
  - Status 200 (si endpoint implémenté) ou 404/405
  - Login "e2euser" si succès

### 7. ⚡ Performance Tests
**Objectif** : Tester les performances et temps de réponse

#### Load Test - Get Users
- **URL** : `{{gateway_url}}/api/users`
- **Méthode** : GET
- **Validation** :
  - Temps de réponse < 2000ms
  - Status 200

#### Load Test - Create User
- **URL** : `{{gateway_url}}/api/users`
- **Méthode** : POST
- **Body** : Utilisateur avec données aléatoires
- **Validation** :
  - Temps de réponse < 3000ms
  - Status 200

## 🔧 Variables d'Environnement

### Variables de base :
| Variable | Valeur | Usage |
|----------|--------|-------|
| `auth_url` | http://localhost:8082 | Service d'authentification |
| `user_url` | http://localhost:8081 | Service utilisateur |
| `gateway_url` | http://localhost:8080 | API Gateway |
| `eureka_url` | http://localhost:8761 | Serveur Eureka |

### Variables automatiques :
| Variable | Créée par | Usage |
|----------|-----------|-------|
| `jwt_token` | Test 5 | Token d'authentification direct |
| `test_user_id` | Test 4 | ID utilisateur créé directement |
| `gateway_user_id` | Test 7 | ID utilisateur créé via Gateway |
| `gateway_jwt_token` | Test 8 | Token d'authentification via Gateway |
| `e2e_user_id` | E2E 1 | ID utilisateur pour workflow E2E |
| `e2e_jwt_token` | E2E 2 | Token pour workflow E2E |

## 🎯 Ordre d'Exécution Recommandé

### Phase 1 : Validation de base
1. **Test 1** : Vérifier Eureka
2. **Test 2** : Vérifier Gateway

### Phase 2 : Services directs
3. **Test 3** : Lister utilisateurs (direct)
4. **Test 4** : Créer utilisateur (direct)
5. **Test 5** : Authentification (direct)

### Phase 3 : Routage Gateway
6. **Test 6** : Lister utilisateurs (Gateway)
7. **Test 7** : Créer utilisateur (Gateway)
8. **Test 8** : Authentification (Gateway)

### Phase 4 : Configuration
9. **Test 9** : Routes Gateway
10. **Test 10** : Détails Eureka

### Phase 5 : Workflow complet
11. **E2E 1** : Créer utilisateur test
12. **E2E 2** : Authentifier utilisateur test
13. **E2E 3** : Récupérer utilisateur test

### Phase 6 : Résilience (optionnel)
14. **Test 11** : Test service indisponible

### Phase 7 : Performance (optionnel)
15. **Load Tests** : Tests de charge

## 🧪 Utilisation avec Collection Runner

### Configuration Runner :
- **Iterations** : 1 (tests fonctionnels) ou 10-20 (tests de performance)
- **Delay** : 100ms entre les requêtes
- **Data** : Aucun fichier de données nécessaire
- **Environment** : IUSJ Local Environment

### Métriques à surveiller :
- **Taux de succès** : Doit être proche de 100%
- **Temps de réponse moyen** : < 1000ms pour la plupart des tests
- **Erreurs** : Analyser les échecs pour identifier les problèmes

## 🐛 Dépannage des Tests

### Variables non remplacées :
- **Problème** : `{{gateway_url}}` apparaît dans l'URL
- **Solution** : Activer l'environnement "IUSJ Local Environment"

### Erreurs de connexion :
- **Problème** : ECONNREFUSED
- **Solution** : Vérifier que tous les services sont démarrés

### Tests d'authentification échouent :
- **Problème** : Utilisateur n'existe pas
- **Solution** : Exécuter d'abord les tests de création d'utilisateur

### Erreurs Eureka :
- **Problème** : Services non visibles
- **Solution** : Attendre 30 secondes pour l'enregistrement

## 📊 Interprétation des Résultats

### Tests verts (✅) :
- Architecture fonctionnelle
- Services communicants
- Routage opérationnel

### Tests oranges (⚠️) :
- Services partiellement fonctionnels
- Problèmes de configuration mineurs
- À investiguer mais non bloquant

### Tests rouges (❌) :
- Problèmes critiques
- Services non démarrés
- Erreurs de configuration majeures

## 🚀 Extensions Possibles

### Tests supplémentaires :
- Tests de sécurité (injection, XSS)
- Tests de validation des données
- Tests de pagination
- Tests de recherche et filtrage

### Automatisation :
- Intégration CI/CD
- Tests de régression automatiques
- Monitoring continu
- Alertes sur échecs

### Données de test :
- Jeux de données plus complexes
- Tests avec utilisateurs multiples
- Scénarios métier avancés