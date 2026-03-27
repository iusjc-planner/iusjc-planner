# Cahier de Conception - IUSJ Planner
## Projet Tutoré ISI 4 FR 6 - Groupe 3

---

## 📋 Table des Matières

1. [Introduction](#introduction)
2. [Architecture Globale](#architecture-globale)
3. [Conception des Microservices](#conception-des-microservices)
4. [Modèle de Données](#modèle-de-données)
5. [Conception des APIs](#conception-des-apis)
6. [Sécurité et Authentification](#sécurité-et-authentification)
7. [Frontend Angular](#frontend-angular)
8. [Déploiement et Infrastructure](#déploiement-et-infrastructure)
9. [Tests et Qualité](#tests-et-qualité)
10. [Conclusion](#conclusion)

---

## 1. Introduction

### 1.1 Objectif du Document
Ce document présente la conception détaillée du système IUSJ Planner, incluant l'architecture technique, les choix de conception, les modèles de données et les spécifications d'implémentation.

### 1.2 Architecture Retenue
**Architecture Microservices** avec les composants suivants :
- **Frontend** : Application Angular 17 SPA
- **API Gateway** : Spring Cloud Gateway
- **Service Discovery** : Netflix Eureka
- **Microservices** : Auth Service, User Service, + services métier futurs
- **Base de données** : MySQL 8.0

### 1.3 Principes de Conception
- **Séparation des responsabilités** : Chaque service a un domaine métier précis
- **Découplage** : Communication via REST API
- **Résilience** : Gestion des erreurs et timeout
- **Sécurité** : Authentification JWT centralisée
- **Scalabilité** : Services indépendants et déployables séparément

---

## 2. Architecture Globale

### 2.1 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Angular 17 Frontend (Port 4200)            │    │
│  │  - Components  - Services  - Guards  - Interceptors│    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                      GATEWAY LAYER                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │     Spring Cloud Gateway (Port 8080)               │    │
│  │  - JWT Validation  - Routing  - CORS  - Load Bal. │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   SERVICE DISCOVERY LAYER                    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │       Netflix Eureka Server (Port 8761)            │    │
│  │          Service Registry & Discovery               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   MICROSERVICES LAYER                        │
│                                                              │
│ ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐│
│ │  Auth Service    │  │  User Service    │  │  Teachers  ││
│ │   (Port 8082)    │  │   (Port 8081)    │  │  Service   ││
│ │  - JWT Gen       │  │  - CRUD Users    │  │ (Port 8083)││
│ │  - Login/Logout  │  │  - Validation    │  │ - CRUD     ││
│ └──────────────────┘  └──────────────────┘  └────────────┘│
│                                                              │
│ ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐│
│ │  Rooms Service   │  │  Courses Service │  │  Schedule  ││
│ │   (Port 8084)    │  │   (Port 8085)    │  │  Service   ││
│ │  - CRUD Rooms    │  │  - CRUD Courses  │  │ (Port 8086)││
│ │  - Availability  │  │  - Assignments   │  │ - Planning ││
│ └──────────────────┘  └──────────────────┘  └────────────┘│
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         MySQL Database (Port 3306)                 │    │
│  │              Database: bd_tutore                    │    │
│  │  Tables: users, enseignants, salles, cours, etc.   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Flux de Données

#### 2.2.1 Flux d'Authentification
```
1. User → Frontend : Saisit login/password
2. Frontend → Gateway : POST /auth/login
3. Gateway → Auth Service : Forward request
4. Auth Service → Database : Vérification credentials
5. Auth Service → Gateway : JWT Token
6. Gateway → Frontend : JWT Token
7. Frontend : Stockage localStorage + décodage
```

#### 2.2.2 Flux de Requête Authentifiée
```
1. Frontend : Récupère JWT du localStorage
2. Frontend → Gateway : Request + Header Authorization: Bearer <JWT>
3. Gateway : Validation JWT
4. Gateway → Microservice : Forward request
5. Microservice → Database : Opération CRUD
6. Microservice → Gateway : Response
7. Gateway → Frontend : Response
```

### 2.3 Patterns de Conception Utilisés

#### 2.3.1 API Gateway Pattern
- **Point d'entrée unique** pour tous les clients
- **Routage dynamique** vers les microservices
- **Cross-cutting concerns** : authentification, logging, CORS

#### 2.3.2 Service Discovery Pattern
- **Enregistrement automatique** des services
- **Load balancing** côté client
- **Health checking** des services

#### 2.3.3 Circuit Breaker Pattern (Futur)
- **Protection contre les cascades de pannes**
- **Timeouts configurables**
- **Fallback responses**

---

## 3. Conception des Microservices

### 3.1 Eureka Service (Service Registry)

#### 3.1.1 Responsabilités
- Enregistrer tous les microservices
- Fournir l'inventaire des services disponibles
- Health checking des instances

#### 3.1.2 Configuration
```yaml
server:
  port: 8761

eureka:
  client:
    register-with-eureka: false
    fetch-registry: false
  server:
    enable-self-preservation: false
```

#### 3.1.3 Endpoints
- **Dashboard** : `http://localhost:8761`
- **Registry** : `http://localhost:8761/eureka/apps`

---

### 3.2 Gateway Service

#### 3.2.1 Responsabilités
- **Routage** : Redirection vers les microservices appropriés
- **Authentification** : Validation JWT pour les routes protégées
- **CORS** : Gestion des origines autorisées
- **Load Balancing** : Répartition des requêtes

#### 3.2.2 Configuration des Routes
```yaml
spring:
  cloud:
    gateway:
      routes:
        # Auth Service
        - id: auth-service
          uri: lb://IUSJ-AUTH-SERVICE
          predicates:
            - Path=/auth/**
          filters:
            - StripPrefix=0

        # User Service
        - id: user-service
          uri: lb://IUSJ-USER-SERVICE
          predicates:
            - Path=/api/users/**
          filters:
            - StripPrefix=0

        # Teachers Service
        - id: teachers-service
          uri: lb://IUSJ-TEACHERS-SERVICE
          predicates:
            - Path=/api/teachers/**
          filters:
            - StripPrefix=0

        # Rooms Service
        - id: rooms-service
          uri: lb://IUSJ-ROOMS-SERVICE
          predicates:
            - Path=/api/rooms/**
          filters:
            - StripPrefix=0
```

#### 3.2.3 Sécurité
```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(
        ServerHttpSecurity http) {
        
        http
            .csrf().disable()
            .authorizeExchange()
                .pathMatchers("/auth/**").permitAll()
                .pathMatchers("/eureka/**").permitAll()
                .anyExchange().authenticated()
            .and()
            .addFilterAt(jwtAuthenticationFilter(), 
                        SecurityWebFiltersOrder.AUTHENTICATION);
        
        return http.build();
    }
}
```

---

### 3.3 Auth Service

#### 3.3.1 Responsabilités
- **Authentification** : Validation login/password
- **Génération JWT** : Création de tokens sécurisés
- **Validation JWT** : Vérification de l'authenticité et validité

#### 3.3.2 Structure du Projet
```
iusj-auth-service/
├── controller/
│   └── AuthController.java
├── service/
│   └── AuthService.java
├── security/
│   ├── JwtUtil.java
│   ├── JwtFilter.java
│   └── SecurityConfig.java
├── entities/
│   └── User.java
├── repository/
│   └── UserRepository.java
├── DTO/
│   ├── LoginRequest.java
│   └── LoginResponse.java
└── IusjAuthServiceApplication.java
```

#### 3.3.3 Endpoints
```java
@RestController
@RequestMapping("/auth")
public class AuthController {
    
    // Connexion
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
        @RequestBody LoginRequest request) {
        // Validation + génération JWT
    }
    
    // Validation token
    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateToken(
        @RequestHeader("Authorization") String token) {
        // Validation JWT
    }
}
```

#### 3.3.4 JWT Structure
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "username",
    "userId": 1,
    "role": "ADMIN",
    "iat": 1234567890,
    "exp": 1234654290
  },
  "signature": "..."
}
```

---

### 3.4 User Service

#### 3.4.1 Responsabilités
- **CRUD Utilisateurs** : Création, lecture, mise à jour, suppression
- **Gestion des profils** : Informations personnelles
- **Gestion des rôles** : ADMIN, USER
- **Validation des données** : Contraintes métier

#### 3.4.2 Structure du Projet
```
iusj-user-service/
├── controller/
│   └── UserController.java
├── service/
│   ├── UserService.java
│   └── UserServiceImpl.java
├── entities/
│   └── User.java
├── repository/
│   └── UserRepository.java
├── DTO/
│   ├── UserDTO.java
│   └── UserCreateDTO.java
├── mapper/
│   └── UserMapper.java
└── IusjUserServiceApplication.java
```

#### 3.4.3 API REST Complète
```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    // Liste tous les utilisateurs
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
    // Récupère un utilisateur par ID
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(
        @PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
    
    // Crée un utilisateur
    @PostMapping
    public ResponseEntity<UserDTO> createUser(
        @Valid @RequestBody UserCreateDTO dto) {
        return ResponseEntity.ok(userService.createUser(dto));
    }
    
    // Met à jour un utilisateur
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(
        @PathVariable Long id,
        @Valid @RequestBody UserDTO dto) {
        return ResponseEntity.ok(userService.updateUser(id, dto));
    }
    
    // Supprime un utilisateur
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
        @PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
```

---

### 3.5 Services Métier Futurs

#### 3.5.1 Teachers Service
**Responsabilités** :
- CRUD des enseignants
- Gestion des spécialités
- Gestion des disponibilités
- Affectation aux cours

**Endpoints prévus** :
- `GET /api/teachers` : Liste
- `GET /api/teachers/{id}` : Détail
- `POST /api/teachers` : Création
- `PUT /api/teachers/{id}` : Mise à jour
- `DELETE /api/teachers/{id}` : Suppression
- `GET /api/teachers/{id}/availability` : Disponibilités

#### 3.5.2 Rooms Service
**Responsabilités** :
- CRUD des salles
- Gestion des capacités et équipements
- Vérification de disponibilité
- Réservations

**Endpoints prévus** :
- `GET /api/rooms` : Liste avec filtres
- `GET /api/rooms/{id}` : Détail
- `POST /api/rooms` : Création
- `PUT /api/rooms/{id}` : Mise à jour
- `DELETE /api/rooms/{id}` : Suppression
- `GET /api/rooms/available` : Salles disponibles
- `POST /api/rooms/{id}/reserve` : Réservation

#### 3.5.3 Courses Service
**Responsabilités** :
- CRUD des cours
- Gestion des crédits et prérequis
- Affectation aux écoles
- Planification

**Endpoints prévus** :
- `GET /api/courses` : Liste
- `GET /api/courses/{id}` : Détail
- `POST /api/courses` : Création
- `PUT /api/courses/{id}` : Mise à jour
- `DELETE /api/courses/{id}` : Suppression

#### 3.5.4 Schedule Service
**Responsabilités** :
- Création des emplois du temps
- Détection des conflits
- Génération automatique
- Export PDF/Excel

**Endpoints prévus** :
- `GET /api/schedules` : Liste
- `GET /api/schedules/group/{groupId}` : Emploi d'un groupe
- `GET /api/schedules/teacher/{teacherId}` : Emploi d'un enseignant
- `GET /api/schedules/room/{roomId}` : Occupation d'une salle
- `POST /api/schedules` : Création
- `POST /api/schedules/validate` : Validation des conflits
- `GET /api/schedules/{id}/export` : Export PDF

---

## 4. Modèle de Données

### 4.1 Schéma de Base de Données

#### 4.1.1 Table Users
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    login VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'USER') DEFAULT 'USER',
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 4.1.2 Table Enseignants
```sql
CREATE TABLE enseignants (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    specialite VARCHAR(100),
    grade VARCHAR(50),
    status ENUM('ACTIVE', 'INACTIVE', 'EN_CONGE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 4.1.3 Table Salles
```sql
CREATE TABLE salles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    batiment VARCHAR(50),
    capacite INT NOT NULL,
    type_salle ENUM('COURS', 'LABO', 'AMPHI', 'TD') NOT NULL,
    equipements TEXT,
    status ENUM('DISPONIBLE', 'MAINTENANCE', 'HORS_SERVICE') 
           DEFAULT 'DISPONIBLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_room (batiment, numero)
);
```

#### 4.1.4 Table Ecoles
```sql
CREATE TABLE ecoles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(150) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    doyen_id BIGINT,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (doyen_id) REFERENCES enseignants(id)
);
```

#### 4.1.5 Table Cours
```sql
CREATE TABLE cours (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(150) NOT NULL,
    credits INT NOT NULL CHECK (credits BETWEEN 1 AND 10),
    description TEXT,
    ecole_id BIGINT NOT NULL,
    enseignant_id BIGINT,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ecole_id) REFERENCES ecoles(id),
    FOREIGN KEY (enseignant_id) REFERENCES enseignants(id)
);
```

#### 4.1.6 Table Groupes
```sql
CREATE TABLE groupes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    niveau VARCHAR(20) NOT NULL,
    ecole_id BIGINT NOT NULL,
    effectif INT DEFAULT 0,
    capacite_max INT NOT NULL,
    annee_academique VARCHAR(20) NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ecole_id) REFERENCES ecoles(id),
    UNIQUE KEY unique_group (nom, niveau, ecole_id, annee_academique)
);
```

#### 4.1.7 Table Emplois_du_temps
```sql
CREATE TABLE emplois_du_temps (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cours_id BIGINT NOT NULL,
    enseignant_id BIGINT NOT NULL,
    salle_id BIGINT NOT NULL,
    groupe_id BIGINT NOT NULL,
    jour_semaine ENUM('LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 
                      'VENDREDI', 'SAMEDI') NOT NULL,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    type_seance ENUM('COURS', 'TD', 'TP', 'EXAMEN') DEFAULT 'COURS',
    status ENUM('PLANIFIE', 'CONFIRME', 'ANNULE') DEFAULT 'PLANIFIE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cours_id) REFERENCES cours(id),
    FOREIGN KEY (enseignant_id) REFERENCES enseignants(id),
    FOREIGN KEY (salle_id) REFERENCES salles(id),
    FOREIGN KEY (groupe_id) REFERENCES groupes(id)
);
```

#### 4.1.8 Table Evenements
```sql
CREATE TABLE evenements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    type_evenement ENUM('EXAMEN', 'CONFERENCE', 'REUNION', 
                       'CEREMONIE', 'AUTRE') NOT NULL,
    date_debut DATETIME NOT NULL,
    date_fin DATETIME NOT NULL,
    lieu VARCHAR(200),
    salle_id BIGINT,
    organisateur_id BIGINT,
    status ENUM('PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE') 
           DEFAULT 'PLANIFIE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (salle_id) REFERENCES salles(id),
    FOREIGN KEY (organisateur_id) REFERENCES users(id)
);
```

### 4.2 Relations et Cardinalités

```
User (1) ──────────── (*) Evenement (organisateur)

Ecole (1) ──────────── (*) Cours
Ecole (1) ──────────── (*) Groupe
Ecole (1) ──────────── (0,1) Enseignant (doyen)

Enseignant (1) ──────────── (*) Cours
Enseignant (1) ──────────── (*) EmploiDuTemps

Salle (1) ──────────── (*) EmploiDuTemps
Salle (1) ──────────── (*) Evenement

Cours (1) ──────────── (*) EmploiDuTemps

Groupe (1) ──────────── (*) EmploiDuTemps
```

---

## 5. Conception des APIs

### 5.1 Conventions REST

#### 5.1.1 Structure des URLs
```
GET    /api/resource          # Liste tous
GET    /api/resource/{id}     # Récupère un
POST   /api/resource          # Crée un
PUT    /api/resource/{id}     # Met à jour complet
PATCH  /api/resource/{id}     # Met à jour partiel
DELETE /api/resource/{id}     # Supprime un
```

#### 5.1.2 Codes de Statut HTTP
```
200 OK                  # Succès GET, PUT, PATCH
201 Created             # Succès POST
204 No Content          # Succès DELETE
400 Bad Request         # Erreur validation
401 Unauthorized        # Non authentifié
403 Forbidden           # Non autorisé
404 Not Found           # Ressource introuvable
409 Conflict            # Conflit (ex: email existe déjà)
500 Internal Error      # Erreur serveur
```

#### 5.1.3 Format des Réponses

**Succès** :
```json
{
  "id": 1,
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@example.com",
  "role": "USER",
  "status": "ACTIVE"
}
```

**Erreur** :
```json
{
  "timestamp": "2026-01-07T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Email déjà existant",
  "path": "/api/users"
}
```

### 5.2 Pagination

```
GET /api/users?page=0&size=20&sort=nom,asc
```

**Réponse** :
```json
{
  "content": [...],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 150,
  "totalPages": 8,
  "last": false
}
```

### 5.3 Filtrage et Recherche

```
GET /api/users?role=ADMIN&status=ACTIVE
GET /api/rooms?capacite_min=50&type=AMPHI
GET /api/courses?ecole_id=1&credits=3
```

---

## 6. Sécurité et Authentification

### 6.1 JWT (JSON Web Token)

#### 6.1.1 Configuration
```java
@Component
public class JwtUtil {
    private String secret = "mySecretKey";
    private long expiration = 86400000; // 24h
    
    public String generateToken(User user) {
        return Jwts.builder()
            .setSubject(user.getLogin())
            .claim("userId", user.getId())
            .claim("role", user.getRole())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() 
                                   + expiration))
            .signWith(SignatureAlgorithm.HS256, secret)
            .compact();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(secret)
                        .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
```

#### 6.1.2 Filtre JWT
```java
@Component
public class JwtFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain) {
        
        String header = request.getHeader("Authorization");
        
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            
            if (jwtUtil.validateToken(token)) {
                // Authentification réussie
                // Set SecurityContext
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
```

### 6.2 Chiffrement des Mots de Passe

```java
@Configuration
public class SecurityConfig {
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

// Utilisation
String hashedPassword = passwordEncoder.encode("password123");
boolean matches = passwordEncoder.matches("password123", hashedPassword);
```

### 6.3 Configuration CORS

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

---

## 7. Frontend Angular

### 7.1 Architecture Frontend

```
fontend/src/app/
├── core/                    # Services singleton
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   └── api.service.ts
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── admin.guard.ts
│   └── interceptors/
│       ├── auth.interceptor.ts
│       └── error.interceptor.ts
│
├── shared/                  # Composants réutilisables
│   ├── components/
│   │   ├── header/
│   │   ├── sidebar/
│   │   ├── footer/
│   │   └── toast/
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── teacher.model.ts
│   │   └── room.model.ts
│   ├── layouts/
│   │   └── main-layout/
│   └── services/
│       ├── layout.service.ts
│       └── navigation.service.ts
│
├── features/                # Modules métier
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   ├── users/
│   │   ├── user-list/
│   │   ├── user-form/
│   │   └── user-detail/
│   ├── teachers/
│   ├── rooms/
│   ├── courses/
│   └── schedules/
│
├── app.component.ts
├── app.module.ts
└── app-routing.module.ts
```

### 7.2 Services Angular

#### 7.2.1 AuthService
```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.authUrl;
  private currentUserSubject: BehaviorSubject<AuthUser | null>;
  public currentUser: Observable<AuthUser | null>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<AuthUser | null>(
      this.getUserFromToken()
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  login(login: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, 
      { login, password })
      .pipe(
        tap(response => {
          localStorage.setItem('jwt_token', response.token);
          this.currentUserSubject.next(this.getUserFromToken());
        })
      );
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('jwt_token');
    return token != null && !this.isTokenExpired(token);
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === role;
  }
}
```

#### 7.2.2 UserService
```typescript
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.usersUrl;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### 7.3 Guards

#### 7.3.1 AuthGuard
```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}
```

#### 7.3.2 AdminGuard
```typescript
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.hasRole('ADMIN')) {
      return true;
    }

    this.router.navigate(['/dashboard']);
    return false;
  }
}
```

### 7.4 Intercepteurs

#### 7.4.1 AuthInterceptor
```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('jwt_token');
    
    if (token && !request.url.includes('/auth/login')) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}
```

#### 7.4.2 ErrorInterceptor
```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
```

### 7.5 Routing

```typescript
const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'users',
        canActivate: [AdminGuard],
        children: [
          { path: '', component: UserListComponent },
          { path: 'new', component: UserFormComponent },
          { path: ':id', component: UserDetailComponent },
          { path: ':id/edit', component: UserFormComponent }
        ]
      },
      // Autres routes...
    ]
  }
];
```

---

## 8. Déploiement et Infrastructure

### 8.1 Docker Compose

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: iusj-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: bd_tutore
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  eureka-server:
    build: ./iusj-eureka-service
    container_name: iusj-eureka
    ports:
      - "8761:8761"
    environment:
      - SPRING_PROFILES_ACTIVE=docker

  gateway:
    build: ./iusj-gateway-service
    container_name: iusj-gateway
    ports:
      - "8080:8080"
    depends_on:
      - eureka-server
    environment:
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka

  auth-service:
    build: ./iusj-auth-service
    container_name: iusj-auth
    depends_on:
      - mysql
      - eureka-server
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/bd_tutore
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka

  user-service:
    build: ./iusj-user-service
    container_name: iusj-user
    depends_on:
      - mysql
      - eureka-server
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/bd_tutore
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka

  frontend:
    build: ./fontend
    container_name: iusj-frontend
    ports:
      - "4200:80"
    depends_on:
      - gateway

volumes:
  mysql_data:
```

### 8.2 Scripts de Démarrage

#### start-services.ps1
```powershell
# Démarrage de tous les services
Write-Host "Démarrage des services IUSJ..." -ForegroundColor Green

# 1. Eureka
Set-Location iusj-eureka-service
Start-Process -NoNewWindow mvn "spring-boot:run"

# 2. Gateway
Set-Location ..\iusj-gateway-service
Start-Process -NoNewWindow mvn "spring-boot:run"

# 3. Auth Service
Set-Location ..\iusj-auth-service
Start-Process -NoNewWindow mvn "spring-boot:run"

# 4. User Service
Set-Location ..\iusj-user-service
Start-Process -NoNewWindow mvn "spring-boot:run"

# 5. Frontend
Set-Location ..\fontend
npm start
```

---

## 9. Tests et Qualité

### 9.1 Tests Unitaires

#### Backend (JUnit 5)
```java
@SpringBootTest
class UserServiceTest {
    @Autowired
    private UserService userService;
    
    @MockBean
    private UserRepository userRepository;
    
    @Test
    void testGetAllUsers() {
        List<User> users = Arrays.asList(
            new User(1L, "Dupont", "Jean", "ADMIN"),
            new User(2L, "Martin", "Marie", "USER")
        );
        
        when(userRepository.findAll()).thenReturn(users);
        
        List<UserDTO> result = userService.getAllUsers();
        
        assertEquals(2, result.size());
        verify(userRepository, times(1)).findAll();
    }
}
```

#### Frontend (Jasmine/Karma)
```typescript
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should login successfully', () => {
    const mockResponse = { token: 'fake-jwt-token' };

    service.login('admin', 'password').subscribe(response => {
      expect(response.token).toBe('fake-jwt-token');
    });

    const req = httpMock.expectOne(`${environment.authUrl}/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
```

### 9.2 Tests d'Intégration

#### Postman Collections
- **Collection 1** : Tests sans JWT (basic)
- **Collection 2** : Tests avec JWT (authentifié)
- **Environnements** : Local, Dev, Prod

### 9.3 Qualité du Code

#### SonarQube
```properties
# sonar-project.properties
sonar.projectKey=iusj-planner
sonar.projectName=IUSJ Planner
sonar.sources=.
sonar.exclusions=**/node_modules/**,**/target/**
sonar.java.binaries=**/target/classes
sonar.coverage.jacoco.xmlReportPaths=**/target/site/jacoco/jacoco.xml
```

---

## 10. Conclusion

### 10.1 Points Forts de la Conception
- **Architecture modulaire** : Chaque service est indépendant
- **Sécurité robuste** : JWT + BCrypt + CORS
- **Scalabilité** : Microservices déployables séparément
- **Maintenabilité** : Code structuré et documenté
- **Testabilité** : Tests unitaires et d'intégration

### 10.2 Technologies Clés
- **Backend** : Spring Boot 3.5.7, Spring Cloud, MySQL
- **Frontend** : Angular 17, TypeScript, Bootstrap
- **DevOps** : Docker, Docker Compose
- **Sécurité** : JWT, BCrypt
- **API** : REST, JSON

### 10.3 Prochaines Étapes
1. Implémentation des services métier restants
2. Développement des interfaces frontend
3. Tests de charge et performance
4. Documentation API (Swagger)
5. Mise en production

---

**Document préparé par** : Groupe 3 - ISI 4 FR 6  
**Date** : Janvier 2026  
**Version** : 1.0  
**Statut** : Validé
