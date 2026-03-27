# 🔐 Guide de Sécurité JWT au Gateway

## 📋 Vue d'ensemble

Cette implémentation ajoute la validation JWT centralisée au niveau du Gateway, permettant de sécuriser tous les microservices sans dupliquer la logique d'authentification.

## 🏗️ Architecture de Sécurité

```
Client → Gateway (Validation JWT) → Services Protégés
   ↓
   ├─ /auth/** → Auth Service (SANS validation)
   ├─ /api/users/** → User Service (AVEC validation JWT)
   ├─ /admin/** → Services Admin (AVEC validation JWT + rôle ADMIN)
   └─ /public/** → APIs publiques (SANS validation)
```

## 🔧 Composants Implémentés

### 1. **JwtUtil** - Utilitaire de validation
- Validation des tokens JWT
- Extraction du username et du rôle
- Vérification de l'expiration
- **Secret partagé** avec Auth Service

### 2. **JwtAuthenticationFilter** - Filtre d'authentification
- Extraction du token depuis le header `Authorization`
- Validation du format `Bearer <token>`
- Validation de la signature et expiration
- Ajout des headers `X-User-Name` et `X-User-Role`

### 3. **AdminRoleFilter** - Filtre de rôle ADMIN
- Validation JWT + vérification du rôle ADMIN
- Protection des endpoints d'administration
- Réponse 403 si rôle insuffisant

## 🛣️ Configuration des Routes

### Routes Protégées par JWT :
```yaml
# Endpoints utilisateurs (JWT requis)
- id: user-service-protected
  uri: lb://iusj-user-service
  predicates:
    - Path=/api/users/**
  filters:
    - JwtAuthenticationFilter

# Endpoints admin (JWT + rôle ADMIN requis)
- id: admin-api
  uri: lb://iusj-user-service
  predicates:
    - Path=/admin/**
  filters:
    - AdminRoleFilter
```

### Routes Non Protégées :
```yaml
# Authentification (pas de validation JWT)
- id: auth-service
  uri: lb://iusj-auth-service
  predicates:
    - Path=/auth/**

# APIs publiques (pas de validation JWT)
- id: public-api
  uri: lb://iusj-user-service
  predicates:
    - Path=/public/**
```

## 🔑 Format des Tokens JWT

### Header Authorization :
```
Authorization: Bearer <jwt-token>
```

### Structure du Token :
```json
{
  "sub": "username",
  "role": "ADMIN|USER",
  "iat": 1640995200,
  "exp": 1641081600
}
```

### Headers Ajoutés aux Services :
```
X-User-Name: username
X-User-Role: ADMIN|USER
```

## 🧪 Tests d'Authentification

### 1. **Test sans token** :
```bash
curl http://localhost:8080/api/users
# Réponse : 401 Unauthorized
```

### 2. **Test avec token valide** :
```bash
curl -H "Authorization: Bearer <valid-jwt>" \
     http://localhost:8080/api/users
# Réponse : 200 OK + données
```

### 3. **Test avec token invalide** :
```bash
curl -H "Authorization: Bearer invalid.token" \
     http://localhost:8080/api/users
# Réponse : 401 Unauthorized
```

### 4. **Test endpoint admin avec rôle USER** :
```bash
curl -H "Authorization: Bearer <user-jwt>" \
     http://localhost:8080/admin/users
# Réponse : 403 Forbidden
```

## 📊 Codes de Réponse

| Code | Signification | Cause |
|------|---------------|-------|
| 200 | OK | Token valide, accès autorisé |
| 401 | Unauthorized | Token manquant, invalide ou expiré |
| 403 | Forbidden | Token valide mais rôle insuffisant |
| 500 | Server Error | Erreur interne du service |

## 🔒 Sécurité et Bonnes Pratiques

### Secret JWT :
- **Partagé** entre Auth Service et Gateway
- **Complexe** et suffisamment long
- **Stocké** de manière sécurisée (variables d'environnement)

### Gestion des Tokens :
- **Expiration** : 24 heures par défaut
- **Refresh** : À implémenter côté client
- **Révocation** : À implémenter avec blacklist

### Headers de Sécurité :
```yaml
# À ajouter dans application.yml
spring:
  cloud:
    gateway:
      default-filters:
        - AddResponseHeader=X-Content-Type-Options, nosniff
        - AddResponseHeader=X-Frame-Options, DENY
        - AddResponseHeader=X-XSS-Protection, 1; mode=block
```

## 🚀 Avantages de cette Approche

### ✅ **Centralisation** :
- Validation JWT en un seul point
- Pas de duplication de code
- Configuration centralisée

### ✅ **Performance** :
- Validation une seule fois au Gateway
- Services en aval reçoivent les infos utilisateur
- Pas de re-validation nécessaire

### ✅ **Sécurité** :
- Contrôle d'accès uniforme
- Gestion des rôles centralisée
- Logs de sécurité centralisés

### ✅ **Maintenance** :
- Mise à jour de la logique JWT en un seul endroit
- Tests de sécurité centralisés
- Monitoring unifié

## 🔄 Intégration avec les Services

### Services en Aval :
Les services reçoivent automatiquement :
```java
@RequestHeader("X-User-Name") String username
@RequestHeader("X-User-Role") String role
```

### Exemple dans UserController :
```java
@GetMapping
public List<User> getAllUsers(
    @RequestHeader("X-User-Name") String username,
    @RequestHeader("X-User-Role") String role) {
    
    // L'utilisateur est déjà authentifié par le Gateway
    // Utiliser username et role pour la logique métier
    
    return userService.getAllUsers();
}
```

## 🐛 Dépannage

### Token non reconnu :
- Vérifier le format `Bearer <token>`
- Vérifier que le secret JWT est identique
- Vérifier l'expiration du token

### Erreur 403 sur endpoints admin :
- Vérifier que l'utilisateur a le rôle ADMIN
- Vérifier la configuration du filtre AdminRoleFilter

### Services ne reçoivent pas les headers :
- Vérifier que les filtres JWT sont appliqués
- Vérifier les logs du Gateway
- Tester avec des outils de debug

## 🚀 Améliorations Futures

### Rate Limiting :
```java
// Ajouter un filtre de limitation de débit
@Component
public class RateLimitFilter extends AbstractGatewayFilterFactory<Config> {
    // Implémentation du rate limiting
}
```

### Cache des Tokens :
```java
// Cache Redis pour éviter la re-validation
@Cacheable("jwt-tokens")
public boolean validateToken(String token) {
    // Validation avec cache
}
```

### Audit et Logging :
```java
// Logs détaillés des accès
log.info("User {} accessed {} with role {}", username, path, role);
```

### Refresh Token :
- Implémentation du refresh automatique
- Gestion de la révocation des tokens
- Blacklist des tokens compromis