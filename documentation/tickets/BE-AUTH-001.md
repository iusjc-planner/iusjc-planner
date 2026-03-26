# BE-AUTH-001 - Harmonisation Roles Auth/User Services

## Priorite
P2 - Moyenne

## Delai Estime
1 jour

## Dependances
Aucune

## Exigences Remplies
- **BF-007** : Gerer les roles des utilisateurs
- Coherence du systeme d'authentification

---

## Contexte (Audit)

Deux services geren les utilisateurs avec des roles differents :

**auth-service** :
```java
public enum Role {
    ADMIN,
    USER
}
```

**user-service** :
```java
public enum Role {
    ADMIN,
    ENSEIGNANT
}
```

Cette incoherence cause des problemes :
- Un utilisateur peut avoir "USER" dans auth mais "ENSEIGNANT" dans user
- Les verifications de roles peuvent echouer
- Confusion dans le code et les JWT

**Etat actuel** : Roles differents entre services
**Impact** : Moyen - Risque d'incoherence et bugs d'autorisation

---

## Taches

### 1. Definition des roles unifies
- [x] Definir l'enum Role commun :
  - `ADMIN` : Administrateur systeme
  - `ENSEIGNANT` : Enseignant
  - `ETUDIANT` : Etudiant (futur)

### 2. Modification auth-service
- [x] Modifier l'enum Role pour correspondre
- [x] Adapter le JWT pour inclure le bon role
- [x] Tester l'authentification

### 3. Modification user-service
- [x] Verifier coherence de l'enum (deja correct)
- [x] Adapter les verifications si necessaire

### 4. Synchronisation des donnees
- [x] Script pour harmoniser les roles existants
- [x] Migrer USER → ENSEIGNANT si necessaire

### 5. Gateway et securite
- [x] Verifier que le gateway utilise les bons roles
- [x] Adapter les regles de securite si necessaire

---

## Flow (Cas d'Utilisation Frontend)

### Scenario 1 : Connexion d'un enseignant
1. L'enseignant entre login/password
2. auth-service verifie et genere JWT
3. Le JWT contient : `"role": "ENSEIGNANT"`
4. Le frontend stocke le token
5. Les appels API incluent le token
6. Les services verifient le role dans le token

### Scenario 2 : Verification des permissions
1. Un endpoint necessite le role ADMIN
2. Le gateway extrait le role du JWT
3. Si role != ADMIN, retourne 403 Forbidden
4. Si role == ADMIN, la requete passe

---

## Resultat Obtenu

Apres implementation :
- Un seul enum Role utilise partout
- JWT contient le role correct
- Verifications de permissions coherentes
- Pas de confusion entre services

---

## Criteres d'Acceptation

- [x] L'enum Role est identique dans auth et user services
- [x] Le JWT contient le bon role
- [x] L'authentification fonctionne pour tous les roles
- [x] Les endpoints proteges verifient correctement les roles
- [ ] Les tests Postman passent

---

## Fichiers Impactes

### Fichiers a modifier
```
iusj-auth-service/src/main/java/com/example/iusj_auth_service/
├── entities/User.java
│   → Modifier enum Role
└── service/AuthService.java
    → Verifier generation JWT

iusj-user-service/src/main/java/com/example/iusj_user_service/
└── entities/User.java
    → Verifier coherence enum
```

---

## Enum Unifie

```java
public enum Role {
    ADMIN,      // Peut tout faire
    ENSEIGNANT, // Gere ses cours, disponibilites
    ETUDIANT    // Consulte EDT (futur)
}
```

---

## Notes Techniques

- Migration : Convertir tous les "USER" en "ENSEIGNANT"
- Retrocompatibilite : Les JWT existants restent valides
- Tests : Verifier tous les scenarios d'authentification
