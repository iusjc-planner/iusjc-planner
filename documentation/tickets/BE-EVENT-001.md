# BE-EVENT-001 - Service Evenement Complet

## Priorite
P0 - Critique

## Delai Estime
3 jours

## Dependances
- BE-NOTIF-001 (pour les notifications aux participants)

## Exigences Remplies
- **BF-061** : Creer un evenement (examen, conference, ceremonie, etc.)
- **BF-062** : Modifier les informations d'un evenement
- **BF-063** : Annuler un evenement
- **BF-064** : Supprimer un evenement
- **BF-065** : Lister tous les evenements
- **BF-066** : Filtrer les evenements par date, type, salle
- **BF-067** : Notifier les participants d'un evenement
- **Diagramme UML** : Classe Evenement avec attributs et relation Evenement "1" -- "1" Salle

---

## Contexte (Audit)

Un dossier `iusj-event-service` existe dans le projet mais il est vide (skeleton uniquement). Le systeme ne peut actuellement pas gerer :
- Les examens et sessions d'evaluation
- Les conferences et seminaires
- Les reunions administratives
- Les soutenances de memoire
- Les ceremonies officielles

Cette fonctionnalite est critique car l'etablissement a besoin de planifier des evenements en dehors du cadre des cours reguliers.

**Etat actuel** : Service existant mais vide (aucune entite, aucun endpoint)
**Impact** : Eleve - Impossible de gerer les evenements academiques

---

## Taches

### 1. Configuration du microservice existant
- [ ] Completer `pom.xml` avec les dependances necessaires
- [ ] Configurer `application.yml` (port 8093, Eureka, MySQL)
- [ ] Verifier l'enregistrement Eureka
- [ ] Ajouter la route dans le Gateway

### 2. Entite Evenement
- [ ] Creer l'entite `Evenement.java` avec les attributs :
  - `id` (Long, auto-genere)
  - `nom` (String, obligatoire)
  - `description` (String, max 1000 caracteres)
  - `type` (Enum: EXAMEN, CONFERENCE, REUNION, SOUTENANCE, CEREMONIE, AUTRE)
  - `date` (LocalDate)
  - `heureDebut` (LocalTime)
  - `duree` (Integer, en minutes)
  - `salleId` (Long, optionnel)
  - `organisateurId` (Long, userId)
  - `status` (Enum: PLANIFIE, CONFIRME, ANNULE, TERMINE)
  - `participantIds` (List<Long>, optionnel)
  - `notes` (String)
- [ ] Ajouter les annotations JPA et validations

### 3. Repository
- [ ] Creer `EvenementRepository` extends JpaRepository, JpaSpecificationExecutor
- [ ] Ajouter methodes :
  - `findByDate(LocalDate date)`
  - `findByDateBetween(LocalDate start, LocalDate end)`
  - `findBySalleId(Long salleId)`
  - `findByType(EventType type)`
  - `existsBySalleIdAndDateAndHeureDebutBetween(...)` (conflits)

### 4. Service
- [ ] Creer `EvenementService` avec methodes :
  - `getAll(filtres)` - Liste avec filtres (date, type, salle, status)
  - `getById(Long id)` - Recupere un evenement
  - `create(Evenement event)` - Cree avec verification disponibilite salle
  - `update(Long id, Evenement event)` - Modifie
  - `cancel(Long id)` - Annule (change status)
  - `delete(Long id)` - Supprime
  - `getByDateRange(LocalDate from, LocalDate to)` - Liste par periode
  - `checkSalleAvailability(Long salleId, LocalDate date, LocalTime heure, Integer duree)` - Verifie salle libre
- [ ] Creer `EvenementSpecifications` pour les filtres dynamiques

### 5. Controller
- [ ] Creer `EvenementController` avec endpoints :
  - `GET /api/events` - Liste avec filtres (query params)
  - `GET /api/events/{id}` - Detail
  - `GET /api/events/date/{date}` - Par date
  - `GET /api/events/range?from=&to=` - Par periode
  - `GET /api/events/salle/{salleId}` - Par salle
  - `POST /api/events` - Cree
  - `PUT /api/events/{id}` - Modifie
  - `PUT /api/events/{id}/cancel` - Annule
  - `DELETE /api/events/{id}` - Supprime
  - `GET /api/events/check-availability` - Verification salle
  - `GET /api/events/stats` - Statistiques

### 6. Integration avec Room Service
- [ ] Appeler room-service pour verifier disponibilite salle
- [ ] Creer une reservation automatique lors de la creation d'evenement

### 7. Integration avec Notification Service
- [ ] Notifier les participants lors de :
  - Creation d'evenement (les concernant)
  - Modification
  - Annulation

### 8. Configuration securite
- [ ] Configurer Spring Security
- [ ] Admin peut tout faire
- [ ] Enseignant peut creer des evenements (REUNION, SOUTENANCE)

---

## Flow (Cas d'Utilisation Frontend)

### Scenario 1 : Creation d'un examen
1. L'administrateur accede a la page "Evenements"
2. Il clique sur "Nouvel evenement"
3. Il selectionne le type "EXAMEN"
4. Il remplit : nom, date, heure, duree, description
5. Il selectionne une salle dans la liste des salles disponibles
6. Il clique sur "Creer"
7. L'API verifie la disponibilite de la salle
8. L'evenement est cree et les notifications sont envoyees
9. L'evenement apparait dans le calendrier

### Scenario 2 : Annulation d'une conference
1. L'administrateur consulte la liste des evenements
2. Il trouve la conference a annuler
3. Il clique sur "Annuler"
4. Une confirmation est demandee
5. L'API `PUT /api/events/{id}/cancel` est appelee
6. Le status passe a "ANNULE"
7. Les participants recoivent une notification d'annulation
8. La salle est liberee (reservation annulee)

### Scenario 3 : Consultation du calendrier
1. L'utilisateur accede au calendrier
2. Il filtre par mois ou semaine
3. L'API `GET /api/events/range` est appelee
4. Les evenements sont affiches sur le calendrier
5. L'utilisateur clique sur un evenement pour voir les details

---

## Resultat Obtenu

Apres implementation :
- Le microservice `iusj-event-service` est fonctionnel sur le port 8093
- Les evenements peuvent etre crees, modifies, annules et supprimes
- La disponibilite des salles est verifiee automatiquement
- Les participants sont notifies des changements
- Les evenements sont visibles dans le calendrier
- Les statistiques sont disponibles

---

## Criteres d'Acceptation

- [ ] Le service demarre et s'enregistre aupres d'Eureka
- [ ] Les endpoints CRUD fonctionnent correctement
- [ ] La verification de disponibilite de salle fonctionne
- [ ] Un evenement ne peut pas etre cree si la salle est occupee
- [ ] L'annulation change le status sans supprimer
- [ ] Les filtres (date, type, salle) fonctionnent
- [ ] L'integration avec notification-service fonctionne (si disponible)
- [ ] Les tests Postman passent

---

## Fichiers Impactes

### Nouveaux fichiers a creer
```
iusj-event-service/
├── pom.xml (completer)
├── src/main/java/com/example/iusj_event_service/
│   ├── IusjEventServiceApplication.java
│   ├── entities/
│   │   └── Evenement.java
│   ├── repositories/
│   │   └── EvenementRepository.java
│   ├── services/
│   │   ├── EvenementService.java
│   │   └── EvenementSpecifications.java
│   ├── controller/
│   │   └── EvenementController.java
│   └── config/
│       └── SecurityConfig.java
└── src/main/resources/
    └── application.yml (completer)
```

### Fichiers existants a modifier
```
iusj-gateway-service/src/main/resources/application.yml
  → Ajouter route pour event-service
```

---

## Notes Techniques

- Types d'evenements : EXAMEN, CONFERENCE, REUNION, SOUTENANCE, CEREMONIE, AUTRE
- Statuts : PLANIFIE (initial), CONFIRME, ANNULE, TERMINE
- Verification salle : Appeler room-service via RestTemplate
- Notifications : Appeler notification-service pour alerter participants
- Calendrier : Les evenements et les cours partagent le meme calendrier cote frontend
