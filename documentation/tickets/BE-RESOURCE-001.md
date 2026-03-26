# BE-RESOURCE-001 - Reservation d'Equipements

## Priorite
P2 - Moyenne

## Delai Estime
2 jours

## Dependances
- BE-ROOM-001 (Relation Salle-Equipement)

## Exigences Remplies
- **BF-073** : Reserver une ressource/equipement
- **BF-074** : Verifier la disponibilite d'une ressource
- **Diagramme UML** : Methode Equipement.Reserver()

---

## Contexte (Audit)

L'entite Resource existe mais ne permet pas la reservation :

```java
// Implementation actuelle
public class Resource {
    private Long id;
    private String name;
    private String type;
    private Integer quantityTotal;
    private Integer quantityAvailable;
    private String location;
    private Status status;
}
```

Les equipements peuvent etre reserves independamment des salles (ex: emprunter un videoprojecteur portable). Actuellement, cette fonctionnalite n'existe pas.

**Etat actuel** : Pas de systeme de reservation pour les equipements
**Impact** : Moyen - Equipements non reservables individuellement

---

## Taches

### 1. Creation de l'entite ResourceReservation
- [ ] Creer `ResourceReservation.java` :
  - `id` (Long)
  - `resourceId` (Long)
  - `date` (LocalDate)
  - `heureDebut` (LocalTime)
  - `duree` (Integer, en minutes)
  - `reservePar` (Long, userId)
  - `quantite` (Integer, nombre reserve)
  - `status` (Enum: PENDING, CONFIRMED, CANCELLED, RETURNED)
  - `motif` (String)
  - `dateRetourPrevue` (LocalDateTime)
  - `dateRetourEffective` (LocalDateTime, nullable)

### 2. Repository
- [ ] Creer `ResourceReservationRepository`
- [ ] Ajouter methodes :
  - `findByResourceId(Long resourceId)`
  - `findByReservePar(Long userId)`
  - `findByDateAndStatusIn(LocalDate date, List<Status> statuses)`
  - Detection conflits pour calcul disponibilite

### 3. Service
- [ ] Creer `ResourceReservationService` :
  - `reserve(Long resourceId, ReservationRequest request)` - Reserve
  - `cancel(Long reservationId)` - Annule
  - `markReturned(Long reservationId)` - Marque comme retourne
  - `getAvailability(Long resourceId, LocalDate date, LocalTime heure)` - Disponibilite
  - `getAvailableQuantity(Long resourceId, LocalDateTime moment)` - Quantite dispo

### 4. Controller
- [ ] Ajouter endpoints :
  - `POST /api/resources/{id}/reserve` - Reserve
  - `GET /api/resources/{id}/reservations` - Liste reservations
  - `GET /api/resources/{id}/availability?date=&time=` - Disponibilite
  - `PUT /api/resources/reservations/{id}/cancel` - Annule
  - `PUT /api/resources/reservations/{id}/return` - Marque retourne
  - `GET /api/resources/reservations/user/{userId}` - Mes reservations

### 5. Calcul de disponibilite
- [ ] Implementer logique : quantityTotal - somme(reservations actives)
- [ ] Gerer les chevauchements horaires

---

## Flow (Cas d'Utilisation Frontend)

### Scenario 1 : Reservation d'un videoprojecteur
1. L'enseignant accede a "Ressources"
2. Il voit la liste des equipements disponibles
3. Il clique sur "Videoprojecteur portable" (3 dispo sur 5)
4. Il clique sur "Reserver"
5. Il remplit :
   - Date : 25/03/2026
   - Heure : 14h00
   - Duree : 2h
   - Quantite : 1
   - Motif : "Cours amphi B"
6. Il valide
7. La reservation est creee, quantite disponible passe a 2

### Scenario 2 : Verification disponibilite
1. L'utilisateur consulte un equipement
2. Il voit le calendrier des reservations
3. Il selectionne une date/heure
4. Le systeme indique : "2 disponibles sur 5"
5. Il peut reserver si quantite suffisante

### Scenario 3 : Retour d'equipement
1. L'utilisateur va a "Mes reservations"
2. Il trouve sa reservation
3. Il clique sur "Marquer comme retourne"
4. La date de retour effective est enregistree
5. La quantite disponible augmente

---

## Resultat Obtenu

Apres implementation :
- Les equipements sont reservables individuellement
- Gestion des quantites en temps reel
- Suivi des emprunts et retours
- Historique des reservations

---

## Criteres d'Acceptation

- [ ] La reservation fonctionne avec les contraintes de quantite
- [ ] La disponibilite est calculee correctement
- [ ] L'annulation libere la quantite
- [ ] Le retour met a jour les quantites
- [ ] Les tests Postman passent

---

## Fichiers Impactes

### Nouveaux fichiers a creer
```
iusj-resource-service/src/main/java/com/example/iusj_resource_service/
├── entities/
│   └── ResourceReservation.java
├── dto/
│   └── ReservationRequest.java
├── repositories/
│   └── ResourceReservationRepository.java
└── services/
    └── ResourceReservationService.java
```

### Fichiers a modifier
```
iusj-resource-service/src/main/java/com/example/iusj_resource_service/
├── services/ResourceService.java
│   → Ajouter methodes de disponibilite
└── controller/ResourceController.java
    → Ajouter endpoints reservation
```

---

## Notes Techniques

- Quantite disponible : `quantityTotal - SUM(reservations actives à ce moment)`
- Status reservation : PENDING → CONFIRMED → RETURNED (ou CANCELLED)
- Notification : Alerter si retour en retard (futur)
