# BE-DOC-001 - Generation Collection Postman

## Priorite
P3 - Basse

## Delai Estime
1 jour

## Dependances
Aucune (peut etre fait a tout moment)

## Exigences Remplies
- Documentation API complete
- Facilitation des tests manuels et integration

---

## Contexte (Audit)

Actuellement, il n'existe pas de collection Postman officielle pour tester l'API du backend. Les developpeurs et testeurs doivent :
- Creer leurs propres requetes manuellement
- Deviner les parametres et formats
- Ne pas avoir de documentation executable

Une collection Postman permettrait :
- Tests rapides des endpoints
- Documentation vivante de l'API
- Partage facile entre l'equipe
- Automation des tests

**Etat actuel** : Pas de collection Postman
**Impact** : Faible - Confort de developpement

---

## Taches

### 1. Structure de la collection
- [ ] Creer collection principale "IUSJ Planner API"
- [ ] Organiser par dossiers (un par service)
- [ ] Creer environnements (local, dev, prod)

### 2. Variables d'environnement
- [ ] `base_url` : URL du gateway (ex: http://localhost:8080)
- [ ] `token` : JWT d'authentification
- [ ] `user_id` : ID utilisateur pour tests
- [ ] `school_id`, `group_id`, etc.

### 3. Requetes par service

#### Auth Service
- [ ] POST /auth/login
- [ ] Tests pre-request pour stocker token

#### User Service
- [ ] GET /api/users
- [ ] GET /api/users/{id}
- [ ] POST /api/users
- [ ] PUT /api/users/{id}
- [ ] DELETE /api/users/{id}

#### Teacher Service
- [ ] CRUD enseignants
- [ ] CRUD disponibilites
- [ ] Import ICS

#### Room Service
- [ ] CRUD salles
- [ ] CRUD reservations
- [ ] Check disponibilite

#### Course Service
- [ ] CRUD cours
- [ ] CRUD matieres

#### Group Service
- [ ] CRUD groupes
- [ ] Division (si implemente)

#### School Service
- [ ] CRUD ecoles
- [ ] CRUD filieres

#### Schedule Service
- [ ] CRUD seances
- [ ] Validation conflits
- [ ] Export (si implemente)

#### Student Service
- [ ] CRUD etudiants

#### Resource Service
- [ ] CRUD ressources

### 4. Tests automatises
- [ ] Ajouter tests dans chaque requete
- [ ] Verifier status code
- [ ] Verifier structure reponse
- [ ] Sauvegarder variables

### 5. Documentation
- [ ] Description pour chaque requete
- [ ] Exemples de body
- [ ] Examples de reponses

---

## Flow (Cas d'Utilisation)

### Scenario 1 : Test rapide d'un endpoint
1. Le developpeur ouvre Postman
2. Il importe la collection IUSJ Planner
3. Il selectionne l'environnement "Local"
4. Il execute "Login" pour obtenir un token
5. Le token est automatiquement stocke
6. Il peut tester n'importe quel endpoint

### Scenario 2 : Test complet d'un flux
1. Le testeur ouvre le dossier "User Service"
2. Il execute le Runner sur tous les endpoints
3. Les tests s'executent en sequence
4. Rapport genere avec resultats

---

## Resultat Obtenu

Apres implementation :
- Collection Postman complete et documentee
- Environnements preconfigures
- Tests automatises
- Documentation executable

---

## Criteres d'Acceptation

- [ ] Collection importable dans Postman
- [ ] Tous les endpoints sont presents
- [ ] Les variables d'environnement fonctionnent
- [ ] Le login stocke automatiquement le token
- [ ] Chaque requete a une description
- [ ] Les tests de base passent

---

## Fichiers a Creer

```
documentation/postman/
├── IUSJ-Planner-API.postman_collection.json
├── Local.postman_environment.json
├── Dev.postman_environment.json
└── README.md
```

---

## Structure de la Collection

```
IUSJ Planner API/
├── Auth/
│   └── Login
├── Users/
│   ├── List Users
│   ├── Get User
│   ├── Create User
│   ├── Update User
│   └── Delete User
├── Teachers/
│   ├── List Teachers
│   ├── Get Teacher
│   ├── Create Teacher
│   ├── Update Teacher
│   ├── Delete Teacher
│   └── Disponibilites/
│       ├── List
│       ├── Create
│       └── Delete
├── Rooms/
│   ├── List Rooms
│   ├── Get Room
│   ├── Create Room
│   ├── Check Availability
│   └── Reservations/
│       ├── List
│       ├── Reserve
│       └── Cancel
├── Courses/
│   ├── List Courses
│   ├── Get Course
│   └── ...
├── Matieres/
│   └── ...
├── Groups/
│   └── ...
├── Schools/
│   ├── Schools/
│   └── Filieres/
├── Schedule/
│   ├── List Entries
│   ├── Create Entry
│   ├── Validate
│   └── Export
├── Students/
│   └── ...
└── Resources/
    └── ...
```

---

## Exemple de Test dans Postman

```javascript
// Test pour GET /api/users
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is an array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
});

pm.test("Users have required fields", function () {
    var jsonData = pm.response.json();
    if (jsonData.length > 0) {
        pm.expect(jsonData[0]).to.have.property('id');
        pm.expect(jsonData[0]).to.have.property('login');
        pm.expect(jsonData[0]).to.have.property('email');
    }
});
```

---

## Notes Techniques

- Format : Collection Postman v2.1
- Authentification : Bearer Token avec variable {{token}}
- Pre-request : Script pour refresh token si expire
- Export : JSON pour versioning dans Git
