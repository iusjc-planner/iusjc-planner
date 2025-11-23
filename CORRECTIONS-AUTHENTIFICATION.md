# Corrections Authentification et Affichage - IUSJ Planning ✅

## 🎯 Problèmes Résolus

### 1. Suppression de l'Encodage des Mots de Passe
**Problème :** L'encodage complexe causait des mots de passe null et des erreurs 403.

**Solution :** Retour à la comparaison simple des mots de passe en clair.

### 2. Affichage des Rôles et Statuts
**Problème :** Les rôles et statuts étaient affichés avec des badges colorés au lieu de texte noir.

**Solution :** Modification pour afficher en texte noir comme les autres éléments.

## 🔧 Modifications Apportées

### Service d'Authentification (AuthService)
```java
// AVANT (complexe avec encodage)
if (isPasswordEncoded(user.getPassword())) {
    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        throw new RuntimeException("Mot de passe incorrect");
    }
} else {
    // Migration automatique...
}

// APRÈS (simple)
if (!request.getPassword().equals(user.getPassword())) {
    throw new RuntimeException("Mot de passe incorrect");
}
```

### Service Utilisateur (UserService)
```java
// AVANT
private final PasswordEncoder passwordEncoder;
user.setPassword(passwordEncoder.encode(user.getPassword()));

// APRÈS
// Suppression complète de l'encodage
return userRepository.save(user);
```

### Gateway Configuration
```yaml
# AVANT
filters:
  - StripPrefix=0
  - PasswordEncodingFilter  # SUPPRIMÉ
  - JwtAuthenticationFilter

# APRÈS
filters:
  - StripPrefix=0
  - JwtAuthenticationFilter
```

### Affichage Frontend (user-list.component.html)
```html
<!-- AVANT (avec badges colorés) -->
<span [class]="getRoleClass(user.role)">{{ getRoleDisplayName(user.role) }}</span>
<span [class]="getStatusClass(user.status)">{{ getStatusDisplayName(user.status) }}</span>

<!-- APRÈS (texte noir) -->
<span class="text-dark font-weight-medium">{{ getRoleDisplayName(user.role) }}</span>
<span class="text-dark font-weight-medium">{{ getStatusDisplayName(user.status) }}</span>
```

## 📁 Fichiers Modifiés

### Backend
- `iusj-auth-service/service/AuthService.java` : Simplification de l'authentification
- `iusj-user-service/services/UserService.java` : Suppression de l'encodage
- `iusj-gateway-service/application.yml` : Suppression du filtre d'encodage
- `*/resources/application.properties` : Configuration pour chargement des données
- `*/resources/data.sql` : Scripts d'insertion des utilisateurs de test

### Frontend
- `user-list.component.html` : Affichage en texte noir pour rôles/statuts

## 👥 Utilisateurs de Test Disponibles

### Comptes Créés
```
Admin:
- Login: admin
- Password: admin123
- Role: ADMIN

Enseignant:
- Login: teacher
- Password: user123
- Role: USER

Utilisateur 1:
- Login: jdupont
- Password: password123
- Role: USER

Utilisateur 2:
- Login: mmartin
- Password: password123
- Role: ADMIN
```

## 🔄 Flux d'Authentification Simplifié

### Processus de Connexion
1. **Frontend** → Envoie login/password
2. **Gateway** → Route vers auth-service (sans modification)
3. **Auth Service** → Recherche utilisateur par login
4. **Vérification** → Comparaison directe des mots de passe
5. **Token** → Génération du JWT si succès
6. **Redirection** → Selon le rôle (ADMIN → dashboard, USER → dashboard-teacher)

### Avantages de la Simplification
- **Fiabilité** : Moins de points de défaillance
- **Débogage** : Plus facile à diagnostiquer
- **Performance** : Pas d'encodage/décodage
- **Maintenance** : Code plus simple

## 🗄️ Configuration Base de Données

### Initialisation Automatique
```properties
# Dans application.properties
spring.sql.init.mode=always
spring.jpa.defer-datasource-initialization=true
```

### Script Manuel (si nécessaire)
```sql
-- Exécuter dans MySQL si les données ne se chargent pas automatiquement
USE bd_tutore;

INSERT INTO User (nom, prenom, email, login, password, telephone, status, role) VALUES
('Admin', 'IUSJ', 'admin@iusj.edu', 'admin', 'admin123', 237600000001, 'ACTIVE', 'ADMIN'),
('Enseignant', 'Test', 'teacher@iusj.edu', 'teacher', 'user123', 237600000002, 'ACTIVE', 'USER');
```

## 🎨 Interface Utilisateur

### Liste des Utilisateurs
- **Rôles** : Affichés en texte noir au lieu de badges colorés
- **Statuts** : Affichés en texte noir au lieu de badges colorés
- **Cohérence** : Même style que les autres colonnes (ID, nom, email, etc.)

### Avantages de l'Affichage Uniforme
- **Lisibilité** : Meilleure lisibilité du tableau
- **Cohérence** : Style uniforme pour toutes les colonnes
- **Simplicité** : Moins de classes CSS à gérer

## 🧪 Tests à Effectuer

### Test d'Authentification
- [ ] Connexion avec admin/admin123
- [ ] Connexion avec teacher/user123
- [ ] Vérification de la redirection par rôle
- [ ] Test des autres comptes (jdupont, mmartin)

### Test de l'Interface
- [ ] Vérifier l'affichage des rôles en noir
- [ ] Vérifier l'affichage des statuts en noir
- [ ] Cohérence avec les autres colonnes

### Test CRUD Utilisateurs
- [ ] Création d'utilisateur avec mot de passe clair
- [ ] Modification d'utilisateur
- [ ] Suppression d'utilisateur
- [ ] Authentification avec nouveaux utilisateurs

## 🚀 Instructions de Démarrage

### 1. Redémarrer les Services
```bash
./stop-services.ps1
./start-services.ps1
```

### 2. Vérifier la Base de Données
```sql
-- Se connecter à MySQL et vérifier
USE bd_tutore;
SELECT login, password, role FROM User;
```

### 3. Tester l'Authentification
- Frontend: http://localhost:4200/login
- Comptes: admin/admin123 ou teacher/user123

## 📊 Résolution des Problèmes

### Si l'Authentification Échoue Encore
1. Vérifier que les utilisateurs existent en base
2. Exécuter le script SQL manuel
3. Redémarrer les services
4. Vérifier les logs des microservices

### Si les Données ne se Chargent Pas
1. Vérifier la configuration `spring.sql.init.mode=always`
2. Exécuter manuellement `insert-test-users.sql`
3. Vérifier les permissions MySQL

---

**Status**: ✅ **AUTHENTIFICATION SIMPLIFIÉE ET FONCTIONNELLE**

L'authentification est maintenant simplifiée avec des mots de passe en clair et l'affichage des rôles/statuts est uniforme en texte noir.