# 📦 Import Instructions - Collections Postman IUSJ

## 🚀 Étapes d'importation

### 1. Importer l'Environnement
1. **Ouvrir Postman**
2. **Cliquer sur "Environments"** (icône ⚙️ à gauche)
3. **Cliquer "Import"**
4. **Sélectionner le fichier :** `IUSJ-Local-Environment.postman_environment.json`
5. **Cliquer "Import"**
6. **Activer l'environnement** en le sélectionnant en haut à droite

### 2. Importer la Collection
1. **Cliquer sur "Collections"** (à gauche)
2. **Cliquer "Import"**
3. **Sélectionner le fichier :** `IUSJ-Microservices-Tests.postman_collection.json`
4. **Cliquer "Import"**

## ✅ Vérification après import

Vous devriez voir :
- **Environnement :** "IUSJ Local Environment" avec 8 variables
- **Collection :** "IUSJ Microservices Tests" avec 7 dossiers et 15 requêtes

## 🎯 Ordre d'exécution recommandé

### Phase 1 : Démarrage des services
```bash
# Terminal 1 - Eureka Server
cd eureka-server && mvn spring-boot:run

# Terminal 2 - Auth Service  
cd iusj-auth-service && mvn spring-boot:run

# Terminal 3 - User Service
cd iusj-user-service && mvn spring-boot:run

# Terminal 4 - Gateway
cd iusj-gateway-service && mvn spring-boot:run
```

### Phase 2 : Tests Postman (dans l'ordre)
1. **1. Health Checks** → Test 1, Test 2
2. **2. Direct Services Tests** → Test 3, Test 4, Test 5
3. **3. Gateway Routing Tests** → Test 6, Test 7, Test 8
4. **4. Service Discovery Tests** → Test 9, Test 10
5. **6. E2E Workflow** → E2E 1, E2E 2, E2E 3
6. **5. Resilience Tests** → Test 11 (arrêter/redémarrer un service)
7. **7. Performance Tests** → Load Tests avec Runner

## 🔧 Variables d'environnement incluses

| Variable | Valeur | Usage |
|----------|--------|-------|
| `auth_url` | http://localhost:8082 | Service d'authentification |
| `user_url` | http://localhost:8081 | Service utilisateur |
| `gateway_url` | http://localhost:8080 | API Gateway |
| `eureka_url` | http://localhost:8761 | Serveur Eureka |
| `jwt_token` | (auto) | Token JWT généré |
| `test_user_id` | (auto) | ID utilisateur créé |
| `gateway_user_id` | (auto) | ID utilisateur via gateway |
| `gateway_jwt_token` | (auto) | Token via gateway |

## 🧪 Tests automatiques inclus

Chaque requête contient des **scripts de test automatiques** qui vérifient :
- ✅ Codes de statut HTTP
- ✅ Structure des réponses JSON
- ✅ Présence des données attendues
- ✅ Temps de réponse (pour les tests de performance)
- ✅ Sauvegarde automatique des tokens et IDs

## 🚨 Résolution de problèmes

### Services non démarrés
- **Erreur :** Connection refused
- **Solution :** Vérifier que tous les services sont démarrés

### Variables non remplacées
- **Erreur :** `{{gateway_url}}` apparaît dans l'URL
- **Solution :** Activer l'environnement "IUSJ Local Environment"

### Tests échouent
- **Erreur :** Tests rouges dans Postman
- **Solution :** Vérifier l'ordre d'exécution et les prérequis

## 🎯 Tests de performance avec Runner

1. **Sélectionner la collection**
2. **Cliquer "Run collection"**
3. **Paramètres recommandés :**
   - Iterations: 10-20
   - Delay: 100ms
   - Data: None
4. **Analyser les résultats**

## 📊 Résultats attendus

- **Health Checks :** Tous verts si services démarrés
- **Direct Services :** Création d'utilisateurs et authentification
- **Gateway Routing :** Routage correct vers les services
- **Service Discovery :** Services visibles dans Eureka
- **E2E Workflow :** Scénario utilisateur complet
- **Resilience :** Gestion des pannes de service
- **Performance :** Temps de réponse < 2-3 secondes