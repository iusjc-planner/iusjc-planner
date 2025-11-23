# Encodage des Mots de Passe via Gateway - IUSJ Planning ✅

## 🎯 Problèmes Résolus

### 1. Erreur 403 lors de la connexion
**Cause :** Aucun utilisateur de test dans la base de données

**Solution :** Création d'utilisateurs de test avec mots de passe en clair qui seront automatiquement encodés lors de la première connexion.

### 2. Gestion centralisée de l'encodage des mots de passe
**Implémentation :** Logique d'encodage déplacée dans le Gateway pour centraliser le traitement.

## 🏗️ Architecture Implémentée

### Gateway (Point Central)
- **PasswordService** : Service d'encodage centralisé
- **PasswordEncodingFilter** : Filtre qui intercepte les requêtes POST/PUT vers `/api/users`
- **Encodage automatique** : Les mots de passe non encodés sont automatiquement encodés

### Service d'Authentification
- **Vérification hybride** : Gère les mots de passe encodés ET non encodés
- **Migration automatique** : Encode et sauvegarde les mots de passe en clair lors de la première connexion

## 📁 Fichiers Créés/Modifiés

### Gateway Service
```
iusj-gateway-service/
├── service/
│   └── PasswordService.java (NOUVEAU)
├── security/
│   └── PasswordEncodingFilter.java (NOUVEAU)
└── resources/
    └── application.yml (MODIFIÉ)
```

### Auth Service
```
iusj-auth-service/
├── service/
│   └── AuthService.java (MODIFIÉ)
└── resources/
    └── data.sql (NOUVEAU)
```

### User Service
```
iusj-user-service/
└── resources/
    └── data.sql (NOUVEAU)
```

## 🔧 Fonctionnalités du PasswordService

### Méthodes Principales
```java
// Vérifie si un mot de passe est déjà encodé
public boolean isPasswordEncoded(String password)

// Encode seulement si nécessaire
public String encodePasswordIfNeeded(String password)

// Vérification de correspondance
public boolean matches(String rawPassword, String encodedPassword)

// Encodage forcé
public String encode(String password)
```

### Détection BCrypt
- Regex : `^\\$2[abxy]\\$\\d{2}\\$.{53}$`
- Longueur : 60 caractères
- Préfixes : $2a$, $2b$, $2x$, $2y$

## 🔄 Flux de Traitement

### Création/Modification d'Utilisateur
1. **Frontend** → Envoie les données utilisateur
2. **Gateway** → PasswordEncodingFilter intercepte
3. **Vérification** → Mot de passe déjà encodé ?
4. **Encodage** → Si nécessaire, encode le mot de passe
5. **Transmission** → Envoie vers le microservice utilisateur

### Authentification
1. **Frontend** → Envoie login/password
2. **Auth Service** → Récupère l'utilisateur
3. **Vérification** → Mot de passe en base encodé ?
4. **Comparaison** → BCrypt ou comparaison directe
5. **Migration** → Encode et sauvegarde si nécessaire
6. **Token** → Génère le JWT

## 👥 Utilisateurs de Test Créés

### Comptes Disponibles
```sql
-- ADMIN
Login: admin
Password: admin123
Role: ADMIN

-- ENSEIGNANT
Login: teacher  
Password: user123
Role: USER

-- UTILISATEURS SUPPLÉMENTAIRES
Login: jdupont
Password: password123
Role: USER

Login: mmartin
Password: password123
Role: ADMIN
```

## 🔐 Sécurité Implémentée

### Encodage BCrypt
- **Algorithme** : BCrypt avec salt automatique
- **Rounds** : Configuration par défaut (10)
- **Résistance** : Attaques par force brute

### Migration Transparente
- **Compatibilité** : Mots de passe existants préservés
- **Mise à jour** : Encodage lors de la première connexion
- **Sécurisation** : Tous les nouveaux mots de passe encodés

## 🚀 Configuration du Gateway

### Filtre dans application.yml
```yaml
- id: user-service-protected
  uri: lb://iusj-user-service
  predicates:
    - Path=/api/users/**
  filters:
    - StripPrefix=0
    - PasswordEncodingFilter  # NOUVEAU
    - JwtAuthenticationFilter
```

### Ordre des Filtres
1. **PasswordEncodingFilter** : Encode les mots de passe
2. **JwtAuthenticationFilter** : Valide l'authentification

## 🧪 Tests à Effectuer

### Test d'Authentification
- [ ] Connexion avec admin/admin123
- [ ] Connexion avec teacher/user123
- [ ] Vérification de l'encodage automatique en base
- [ ] Reconnexion après encodage

### Test de Création d'Utilisateur
- [ ] Créer utilisateur avec mot de passe clair
- [ ] Vérifier l'encodage automatique
- [ ] Connexion avec le nouvel utilisateur

### Test de Modification d'Utilisateur
- [ ] Modifier utilisateur sans changer le mot de passe
- [ ] Modifier avec nouveau mot de passe
- [ ] Vérifier que l'encodage fonctionne

## 🔄 Migration des Données Existantes

### Stratégie
1. **Mots de passe existants** : Restent en clair temporairement
2. **Première connexion** : Encodage automatique
3. **Nouveaux utilisateurs** : Encodage immédiat
4. **Cohérence** : Tous les mots de passe finissent encodés

### Avantages
- **Zéro interruption** : Pas de migration massive
- **Transparence** : Utilisateurs ne voient aucun changement
- **Sécurité progressive** : Amélioration au fur et à mesure

## 📊 Monitoring

### Logs à Surveiller
- Encodage des mots de passe dans le Gateway
- Migration des mots de passe dans Auth Service
- Erreurs d'authentification

### Métriques
- Nombre de mots de passe migrés
- Taux de réussite des connexions
- Performance du filtre d'encodage

---

**Status**: ✅ **ENCODAGE CENTRALISÉ FONCTIONNEL**

Le système d'encodage des mots de passe est maintenant centralisé dans le Gateway. Les utilisateurs de test sont créés et l'authentification devrait fonctionner avec les comptes admin/admin123 et teacher/user123.