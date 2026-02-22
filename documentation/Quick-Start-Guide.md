# 🚀 Guide de Démarrage Rapide - IUSJ Microservices

## 📋 Prérequis

### Logiciels requis :
- ✅ **Java 17+** (JDK installé et configuré)
- ✅ **Maven 3.6+** (pour la compilation et le packaging)
- ✅ **MySQL 8.0+** (base de données)
- ✅ **Git** (pour cloner le projet)
- ✅ **Postman** (optionnel, pour les tests API)

### Vérification des prérequis :
```bash
# Vérifier Java
java -version

# Vérifier Maven
mvn -version

# Vérifier MySQL
mysql --version
```

## 🗄️ Configuration de la Base de Données

### 1. Créer la base de données :
```sql
-- Se connecter à MySQL
mysql -u root -p

-- Créer la base de données
CREATE DATABASE bd_tutore;

-- Vérifier la création
SHOW DATABASES;

-- Quitter MySQL
EXIT;
```

### 2. Configuration des credentials :
Les services utilisent ces paramètres par défaut :
- **Host** : localhost:3306
- **Database** : bd_tutore
- **Username** : root
- **Password** : tenzo

Tu peux surcharger ces valeurs avec des variables d'environnement communes :
- `DB_HOST`, `DB_PORT`, `DB_NAME`
- `DB_USER` ou `DB_USERNAME`
- `DB_PASS` ou `DB_PASSWORD`

Si vos credentials sont différents, modifiez les fichiers `application.properties` de chaque service.

## 🚀 Démarrage des Services

### Ordre de démarrage obligatoire :

#### 1. 📋 Eureka Server (Port 8761)
```bash
cd iusj-eureka-service
mvn spring-boot:run
```
**Vérification** : http://localhost:8761

#### 2. 🔐 Auth Service (Port 8082)
```bash
# Nouveau terminal
cd iusj-auth-service
mvn spring-boot:run
```
**Vérification** : Service visible dans Eureka

#### 3. 👥 User Service (Port 8081)
```bash
# Nouveau terminal
cd iusj-user-service
mvn spring-boot:run
```
**Vérification** : Service visible dans Eureka

#### 4. 🌐 API Gateway (Port 8080)
```bash
# Nouveau terminal
cd iusj-gateway-service
mvn spring-boot:run
```
**Vérification** : http://localhost:8080/actuator/health

### ⏱️ Temps d'attente :
- Attendre **30 secondes** entre chaque démarrage pour l'enregistrement Eureka
- Vérifier dans Eureka Dashboard que tous les services sont "UP"

## ✅ Vérification du Déploiement

### 1. Vérifier Eureka Dashboard :
- URL : http://localhost:8761
- **Attendu** : 3 services enregistrés
  - IUSJ-AUTH-SERVICE
  - IUSJ-USER-SERVICE  
  - IUSJ-GATEWAY-SERVICE

### 2. Vérifier les ports :
```bash
# Windows
netstat -ano | findstr "8080\|8081\|8082\|8761"

# Linux/Mac
netstat -tulpn | grep -E "8080|8081|8082|8761"
```

### 3. Test de santé des services :
```bash
# Gateway
curl http://localhost:8080/actuator/health

# User Service direct
curl http://localhost:8081/api/users

# User Service via Gateway
curl http://localhost:8080/api/users
```

## 🧪 Tests Rapides

### Test 1 : Créer un utilisateur
```bash
curl -X POST http://localhost:8080/api/users \
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

### Test 2 : Authentification
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "testuser",
    "password": "test123"
  }'
```

### Test 3 : Lister les utilisateurs
```bash
curl http://localhost:8080/api/users
```

## 📁 Tests avec Postman

### 1. Importer les collections :
- Fichier environnement : `postman-collections/IUSJ-Local-Environment.postman_environment.json`
- Fichier collection : `postman-collections/IUSJ-Microservices-Tests-With-JWT.postman_collection.json`

### 2. Activer l'environnement :
- Sélectionner "IUSJ Local Environment" en haut à droite

### 3. Exécuter les tests :
- Dossier "1. Health Checks" → Test 1 et 2
- Dossier "2. Direct Services Tests" → Test 3, 4, 5
- Dossier "3. Gateway Routing Tests" → Test 6, 7, 8

## 🐛 Résolution de Problèmes

### Problème : Port déjà utilisé
```bash
# Identifier le processus
netstat -ano | findstr 8080

# Arrêter le processus (Windows)
taskkill /PID <PID> /F

# Arrêter le processus (Linux/Mac)
kill -9 <PID>
```

### Problème : Service non enregistré dans Eureka
- Attendre 30 secondes supplémentaires
- Vérifier les logs du service
- Redémarrer le service si nécessaire

### Problème : Erreur de base de données
```bash
# Vérifier que MySQL est démarré
# Windows
net start mysql

# Linux
sudo systemctl start mysql

# Mac
brew services start mysql
```

### Problème : Erreur de compilation Maven
```bash
# Nettoyer et recompiler
mvn clean compile

# Vérifier les dépendances
mvn dependency:tree
```

## 📊 Monitoring

### URLs de monitoring :
- **Eureka Dashboard** : http://localhost:8761
- **Gateway Health** : http://localhost:8080/actuator/health
- **Gateway Routes** : http://localhost:8080/actuator/gateway/routes

### Logs importants à surveiller :
- Enregistrement Eureka : "Registering application"
- Démarrage des services : "Started Application in X seconds"
- Erreurs de connexion : "Connection refused"

## 🔄 Arrêt des Services

### Ordre d'arrêt recommandé :
1. **Gateway** (Ctrl+C)
2. **User Service** (Ctrl+C)
3. **Auth Service** (Ctrl+C)
4. **Eureka Server** (Ctrl+C)

### Arrêt forcé si nécessaire :
```bash
# Identifier tous les processus Java
jps

# Arrêter un processus spécifique
kill <PID>
```

## 📚 Documentation Complète

Pour plus de détails, consultez :
- `iusj-auth-service/documentation/README.md`
- `iusj-user-service/documentation/README.md`
- `iusj-gateway-service/documentation/README.md`
- `documentation/Cahier-conception.md`

## 🎯 Prochaines Étapes

Une fois l'architecture démarrée :
1. **Explorer les APIs** avec Postman
2. **Tester la résilience** en arrêtant/redémarrant des services
3. **Monitorer** via Eureka Dashboard
4. **Développer** de nouvelles fonctionnalités
5. **Ajouter** de nouveaux microservices

## 🆘 Support

En cas de problème :
1. Vérifier les logs des services
2. Consulter la documentation spécifique de chaque service
3. Vérifier la configuration des ports et de la base de données
4. S'assurer que tous les prérequis sont installés