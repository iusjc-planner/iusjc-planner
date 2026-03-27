# Plan d'Intégration Frontend-Microservices - IUSJ Planning

## 🏗️ Architecture des Microservices

### Services Disponibles

1. **iusj-gateway-service** (Port 8080)
   - Point d'entrée unique pour toutes les requêtes
   - Gestion CORS configurée pour localhost:4200
   - Routage vers les différents services
   - Filtres JWT pour l'authentification

2. **iusj-auth-service**
   - Authentification JWT
   - Endpoint: `POST /auth/login`
   - Retourne un token JWT

3. **iusj-user-service**
   - CRUD complet des utilisateurs
   - Endpoints: `/api/users/**`
   - Protection JWT via gateway

4. **iusj-eureka-service** (Port 8761)
   - Service de découverte
   - Enregistrement automatique des services

## 🔗 APIs Disponibles

### Authentification
```
POST http://localhost:8080/auth/login
Content-Type: application/json

{
  "login": "username",
  "password": "password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Gestion des Utilisateurs
```
GET    http://localhost:8080/api/users           # Liste tous les utilisateurs
GET    http://localhost:8080/api/users/{id}     # Utilisateur par ID
POST   http://localhost:8080/api/users          # Créer un utilisateur
PUT    http://localhost:8080/api/users/{id}     # Modifier un utilisateur
DELETE http://localhost:8080/api/users/{id}     # Supprimer un utilisateur
```

## 🎯 Plan d'Intégration Frontend

### 1. Services Angular à créer

#### AuthService
```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080';
  private tokenKey = 'iusj_token';

  login(credentials: LoginRequest): Observable<LoginResponse>
  logout(): void
  isAuthenticated(): boolean
  getToken(): string | null
  getCurrentUser(): Observable<User>
}
```

#### UserService
```typescript
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  getAllUsers(): Observable<User[]>
  getUserById(id: number): Observable<User>
  createUser(user: User): Observable<User>
  updateUser(id: number, user: User): Observable<User>
  deleteUser(id: number): Observable<void>
}
```

### 2. Intercepteurs HTTP

#### AuthInterceptor
- Ajouter automatiquement le token JWT aux requêtes
- Gérer l'expiration du token
- Rediriger vers login si non authentifié

#### ErrorInterceptor
- Gestion centralisée des erreurs HTTP
- Messages d'erreur utilisateur-friendly

### 3. Guards de Route

#### AuthGuard
- Protéger les routes nécessitant une authentification
- Redirection automatique vers /login

#### RoleGuard
- Vérifier les rôles utilisateur (ADMIN/USER)
- Accès conditionnel aux fonctionnalités

### 4. Modèles TypeScript

```typescript
export interface User {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  login: string;
  password?: string;
  telephone: number;
  status: 'ACTIVE' | 'INACTIVE';
  role: 'ADMIN' | 'USER';
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}
```

## 🚀 Étapes d'Implémentation

### Phase 1: Configuration de base
1. ✅ Corriger le bouton œil du mot de passe
2. Créer les services Angular (AuthService, UserService)
3. Configurer les intercepteurs HTTP
4. Créer les modèles TypeScript

### Phase 2: Authentification
1. Intégrer l'API de login dans le composant login
2. Gérer le stockage du token JWT
3. Implémenter la déconnexion
4. Créer les guards de route

### Phase 3: Gestion des utilisateurs
1. Connecter le formulaire utilisateur à l'API
2. Implémenter la liste des utilisateurs
3. Ajouter la validation côté client
4. Gérer les erreurs et messages de succès

### Phase 4: Sécurité et optimisation
1. Gestion de l'expiration des tokens
2. Refresh token (si implémenté côté backend)
3. Optimisation des performances
4. Tests d'intégration

## 🔧 Configuration Requise

### Variables d'environnement
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  authUrl: 'http://localhost:8080/auth',
  usersUrl: 'http://localhost:8080/api/users'
};
```

### Dépendances npm
- `@angular/common/http` (déjà installé)
- `jwt-decode` (pour décoder les tokens JWT)

## 📋 Checklist d'Intégration

- [ ] Services Angular créés
- [ ] Intercepteurs configurés
- [ ] Guards de route implémentés
- [ ] Modèles TypeScript définis
- [ ] Composant login connecté à l'API
- [ ] Gestion des erreurs implémentée
- [ ] Tests d'intégration effectués
- [ ] Documentation mise à jour

## 🎨 Interface Utilisateur

### Page de Login
- ✅ Design moderne implémenté
- ✅ Bouton œil pour mot de passe corrigé
- [ ] Intégration API d'authentification
- [ ] Gestion des erreurs de connexion
- [ ] Redirection après connexion réussie

### Dashboard Admin
- ✅ Graphiques circulaires ajoutés
- [ ] Données dynamiques depuis l'API
- [ ] Statistiques en temps réel

### Gestion des Utilisateurs
- [ ] Liste des utilisateurs depuis l'API
- [ ] Formulaire de création/modification
- [ ] Actions CRUD complètes
- [ ] Filtres et recherche

## 🔒 Sécurité

### Côté Frontend
- Stockage sécurisé du token (localStorage/sessionStorage)
- Validation des données avant envoi
- Nettoyage automatique des tokens expirés
- Protection contre les attaques XSS

### Côté Backend (déjà implémenté)
- JWT avec expiration
- Hachage des mots de passe (BCrypt)
- Validation des données d'entrée
- CORS configuré correctement

## 📊 Monitoring et Logs

- Logs des tentatives de connexion
- Suivi des erreurs d'API
- Métriques de performance
- Alertes en cas de problème

---

**Prochaine étape**: Commencer par l'implémentation des services Angular et l'intégration de l'authentification.