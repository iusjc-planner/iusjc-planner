# BE-AUDIT-001 - Implementation Logs d'Audit

## Priorite
P3 - Basse

## Delai Estime
2 jours

## Dependances
Aucune

## Exigences Remplies
- **BNF-008** : Journalisation des actions sensibles pour audit
- Tracabilite et securite

---

## Contexte (Audit)

Actuellement, aucun systeme de logs d'audit n'est en place. Les actions sensibles ne sont pas tracees :
- Qui a cree/modifie/supprime un utilisateur ?
- Qui a modifie un emploi du temps ?
- Qui a reserve une salle ?

Pour des raisons de securite et de conformite, il est necessaire de tracer ces actions.

**Etat actuel** : Pas de logs d'audit
**Impact** : Faible a court terme, important pour conformite

---

## Taches

### 1. Creation de l'entite AuditLog
- [ ] Creer entite `AuditLog.java` :
  - `id` (Long)
  - `action` (Enum: CREATE, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT)
  - `entityType` (String, ex: "User", "Schedule", "Room")
  - `entityId` (Long)
  - `userId` (Long, qui a fait l'action)
  - `userLogin` (String, pour lisibilite)
  - `timestamp` (LocalDateTime)
  - `details` (String, JSON des changements)
  - `ipAddress` (String, optionnel)

### 2. Service d'audit
- [ ] Creer `AuditService` :
  - `log(AuditAction action, String entityType, Long entityId, String details)`
  - `getByEntity(String entityType, Long entityId)`
  - `getByUser(Long userId)`
  - `getByDateRange(LocalDateTime from, LocalDateTime to)`

### 3. Aspect AOP pour capture automatique
- [ ] Creer `AuditAspect` avec @Around
- [ ] Intercepter les methodes annotees @Audited
- [ ] Capturer : action, entite, utilisateur, resultat

### 4. Annotation @Audited
- [ ] Creer annotation `@Audited`
- [ ] Parametres : action, entityType
- [ ] Appliquer sur les methodes services sensibles

### 5. Endpoints consultation
- [ ] `GET /api/audit` - Liste des logs (admin only)
- [ ] `GET /api/audit/entity/{type}/{id}` - Logs d'une entite
- [ ] `GET /api/audit/user/{userId}` - Logs d'un utilisateur
- [ ] Pagination et filtrage

### 6. Application aux services existants
- [ ] Annoter UserService : create, update, delete
- [ ] Annoter ScheduleService : create, update, delete
- [ ] Annoter RoomService : reserve, cancel
- [ ] etc.

---

## Flow (Cas d'Utilisation Frontend)

### Scenario 1 : Consultation de l'historique d'un utilisateur
1. L'admin accede a "Audit & Logs"
2. Il recherche par utilisateur "jean.dupont"
3. L'API `GET /api/audit/user/5` est appelee
4. Liste des actions affichee :
   - 2026-03-24 10:00 : LOGIN
   - 2026-03-24 10:15 : UPDATE Schedule #45
   - 2026-03-24 10:30 : CREATE Reservation #12
5. L'admin peut voir les details de chaque action

### Scenario 2 : Audit d'une entite
1. L'admin consulte un emploi du temps
2. Il clique sur "Voir historique"
3. L'API `GET /api/audit/entity/Schedule/45` est appelee
4. Historique complet :
   - Cree par admin le 20/03
   - Modifie par prof1 le 22/03
   - Publie par admin le 24/03

---

## Resultat Obtenu

Apres implementation :
- Toutes les actions sensibles sont tracees
- Historique consultable par entite ou utilisateur
- Conformite aux exigences de securite
- Aide au debug et investigation

---

## Criteres d'Acceptation

- [ ] Les actions CRUD sont loguees
- [ ] L'utilisateur est identifie dans chaque log
- [ ] Le timestamp est precis
- [ ] Les logs sont consultables via API
- [ ] Seuls les admins peuvent consulter les logs
- [ ] Les tests passent

---

## Fichiers Impactes

### Nouveaux fichiers a creer
```
iusj-user-service/src/main/java/com/example/iusj_user_service/
├── entities/
│   └── AuditLog.java
├── repositories/
│   └── AuditLogRepository.java
├── services/
│   └── AuditService.java
├── aspect/
│   └── AuditAspect.java
├── annotation/
│   └── Audited.java
└── controller/
    └── AuditController.java
```

### Fichiers a modifier
```
iusj-user-service/src/main/java/.../services/UserService.java
  → Ajouter @Audited sur methodes
```

---

## Implementation AOP

```java
@Aspect
@Component
public class AuditAspect {

    @Autowired
    private AuditService auditService;

    @Around("@annotation(audited)")
    public Object audit(ProceedingJoinPoint joinPoint, Audited audited) throws Throwable {
        // Recuperer utilisateur connecte
        Long userId = getCurrentUserId();
        String userLogin = getCurrentUserLogin();

        // Executer la methode
        Object result = joinPoint.proceed();

        // Logger l'action
        auditService.log(
            audited.action(),
            audited.entityType(),
            extractEntityId(result),
            buildDetails(joinPoint, result),
            userId,
            userLogin
        );

        return result;
    }
}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Audited {
    AuditAction action();
    String entityType();
}
```

---

## Exemple d'Utilisation

```java
@Service
public class UserService {

    @Audited(action = AuditAction.CREATE, entityType = "User")
    public User createUser(User user) {
        // ... creation utilisateur
        return userRepository.save(user);
    }

    @Audited(action = AuditAction.UPDATE, entityType = "User")
    public User updateUser(Long id, User user) {
        // ... mise a jour
        return userRepository.save(user);
    }

    @Audited(action = AuditAction.DELETE, entityType = "User")
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
```

---

## Notes Techniques

- Stockage : Table audit_logs dans la meme BD ou BD separee
- Performance : Insertion asynchrone pour ne pas ralentir
- Retention : Politique de retention (ex: 1 an)
- RGPD : Anonymisation des logs anciens si necessaire
