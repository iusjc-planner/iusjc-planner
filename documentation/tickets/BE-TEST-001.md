# BE-TEST-001 - Tests Unitaires (>70% Couverture)

## Priorite
P3 - Basse

## Delai Estime
5 jours

## Dependances
Tous les autres tickets (a executer en dernier)

## Exigences Remplies
- **BNF-018** : Tests unitaires avec couverture > 70%
- Qualite et maintenabilite du code

---

## Contexte (Audit)

Actuellement, les tests unitaires sont absents ou insuffisants dans la plupart des microservices. Cela pose des problemes :
- Pas de verification automatique des regressions
- Difficulte a refactorer en confiance
- Pas de documentation executable
- Risque de bugs en production

**Etat actuel** : Couverture de tests inconnue, probablement < 30%
**Impact** : Faible a court terme, eleve a long terme

---

## Taches

### 1. Configuration Jacoco
- [ ] Ajouter plugin Jacoco a chaque pom.xml
- [ ] Configurer seuil de couverture 70%
- [ ] Configurer rapport HTML

### 2. Tests unitaires par service

#### auth-service
- [ ] AuthServiceTest : tests login, generation JWT
- [ ] Tests validation token

#### user-service
- [ ] UserServiceTest : CRUD utilisateurs
- [ ] UserControllerTest : endpoints REST
- [ ] Validation des donnees

#### teacher-service
- [ ] TeacherServiceTest : CRUD enseignants
- [ ] DisponibiliteServiceTest : gestion disponibilites
- [ ] IcsParserServiceTest : import ICS

#### room-service
- [ ] RoomServiceTest : CRUD salles
- [ ] RoomReservationTest : reservations
- [ ] Tests de disponibilite

#### course-service
- [ ] CourseServiceTest : CRUD cours
- [ ] MatiereServiceTest : CRUD matieres

#### group-service
- [ ] GroupServiceTest : CRUD groupes
- [ ] Tests division (si BE-GROUP-002 fait)

#### school-service
- [ ] SchoolServiceTest : CRUD ecoles
- [ ] FiliereServiceTest : CRUD filieres

#### schedule-service
- [ ] ScheduleServiceTest : CRUD seances
- [ ] Tests detection conflits
- [ ] Tests validation

#### student-service
- [ ] StudentServiceTest : CRUD etudiants
- [ ] Tests association groupes

#### resource-service
- [ ] ResourceServiceTest : CRUD ressources

### 3. Tests d'integration
- [ ] Tests communication inter-services (optionnel)
- [ ] Tests avec base de donnees H2

### 4. CI/CD Integration
- [ ] Ajouter etape tests dans pipeline
- [ ] Echouer le build si couverture < 70%
- [ ] Generer rapport de couverture

---

## Flow (Cas d'Utilisation Developpeur)

### Scenario 1 : Execution des tests locaux
1. Le developpeur modifie UserService
2. Il execute `mvn test`
3. Les tests s'executent
4. Rapport de couverture genere
5. Si couverture < 70% : warning
6. Si tests echouent : echec build

### Scenario 2 : CI/CD Pipeline
1. Developpeur pousse son code
2. Pipeline CI demarre
3. Etape : `mvn verify`
4. Tests executes + couverture calculee
5. Si couverture < 70% : pipeline echoue
6. Rapport publie dans artifacts

---

## Resultat Obtenu

Apres implementation :
- Couverture > 70% sur tous les services
- Tests automatiques dans CI/CD
- Documentation executable
- Confiance pour refactoring

---

## Criteres d'Acceptation

- [ ] Chaque service a des tests unitaires
- [ ] Couverture globale > 70%
- [ ] Tous les tests passent
- [ ] Jacoco configure et fonctionnel
- [ ] Rapport de couverture accessible

---

## Fichiers Impactes

### Nouveaux fichiers a creer (par service)
```
src/test/java/com/example/iusj_xxx_service/
├── services/
│   └── XxxServiceTest.java
├── controller/
│   └── XxxControllerTest.java
└── repositories/
    └── XxxRepositoryTest.java
```

### Configuration Jacoco (pom.xml)
```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.11</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
        <execution>
            <id>check</id>
            <goals>
                <goal>check</goal>
            </goals>
            <configuration>
                <rules>
                    <rule>
                        <element>BUNDLE</element>
                        <limits>
                            <limit>
                                <counter>LINE</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.70</minimum>
                            </limit>
                        </limits>
                    </rule>
                </rules>
            </configuration>
        </execution>
    </executions>
</plugin>
```

---

## Exemple de Test

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void shouldCreateUser() {
        // Given
        User user = new User();
        user.setLogin("test");
        user.setEmail("test@test.com");
        when(userRepository.save(any())).thenReturn(user);

        // When
        User created = userService.createUser(user);

        // Then
        assertNotNull(created);
        assertEquals("test", created.getLogin());
        verify(userRepository).save(user);
    }

    @Test
    void shouldThrowWhenLoginExists() {
        // Given
        when(userRepository.existsByLogin("existing")).thenReturn(true);
        User user = new User();
        user.setLogin("existing");

        // When/Then
        assertThrows(IllegalArgumentException.class,
            () -> userService.createUser(user));
    }
}
```

---

## Notes Techniques

- Framework : JUnit 5 + Mockito
- Base de test : H2 en memoire
- Coverage : Jacoco
- Annotations : @MockBean, @DataJpaTest, @WebMvcTest
