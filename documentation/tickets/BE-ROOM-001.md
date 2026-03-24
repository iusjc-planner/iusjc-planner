# BE-ROOM-001 - Relation ManyToMany Salle-Equipement

## Priorite
P2 - Moyenne

## Delai Estime
2 jours

## Dependances
Aucune

## Exigences Remplies
- **Diagramme UML** : Relation Salle "1.." -- "1.." Equipement : concerner
- Gestion coherente des equipements et salles

---

## Contexte (Audit)

L'entite Room stocke actuellement les equipements comme une simple liste de chaines :

```java
// Implementation actuelle
@ElementCollection
@CollectionTable(name = "room_equipments", joinColumns = @JoinColumn(name = "room_id"))
@Column(name = "equipment")
private List<String> equipments = new ArrayList<>();
```

Cette implementation ne permet pas de :
- Lier les equipements aux entites Resource existantes
- Gerer les quantites d'equipements par salle
- Filtrer les salles par equipements disponibles en base
- Maintenir la coherence entre Room et Resource

**Etat actuel** : List<String> au lieu de relation ManyToMany
**Impact** : Moyen - Fonctionnel mais non optimal et non conforme

---

## Taches

### 1. Creation table de jointure
- [ ] Creer entite `RoomEquipment` (table de jointure) :
  - `id` (Long)
  - `roomId` (Long, FK vers Room)
  - `resourceId` (Long, FK vers Resource)
  - `quantite` (Integer, nombre d'equipements dans la salle)

### 2. Modification de l'entite Room
- [ ] Supprimer `List<String> equipments`
- [ ] Ajouter relation `@OneToMany` vers RoomEquipment
- [ ] Ou utiliser `@ManyToMany` directe avec Resource

### 3. Repository
- [ ] Creer `RoomEquipmentRepository`
- [ ] Ajouter methodes :
  - `findByRoomId(Long roomId)`
  - `findByResourceId(Long resourceId)`
  - `existsByRoomIdAndResourceId(Long roomId, Long resourceId)`

### 4. Service
- [ ] Modifier `RoomService` pour gerer les equipements :
  - `addEquipment(Long roomId, Long resourceId, Integer quantite)`
  - `removeEquipment(Long roomId, Long resourceId)`
  - `updateEquipmentQuantity(Long roomId, Long resourceId, Integer quantite)`
  - `getRoomsByEquipment(Long resourceId)`

### 5. Controller
- [ ] Ajouter endpoints :
  - `GET /api/rooms/{id}/equipments` - Liste equipements de la salle
  - `POST /api/rooms/{id}/equipments` - Ajoute un equipement
  - `PUT /api/rooms/{id}/equipments/{resourceId}` - Met a jour quantite
  - `DELETE /api/rooms/{id}/equipments/{resourceId}` - Retire un equipement
  - `GET /api/rooms/with-equipment/{resourceId}` - Salles avec cet equipement

### 6. Migration des donnees
- [ ] Script pour convertir les strings existants en relations
- [ ] Creer les resources manquantes si necessaire
- [ ] Associer les equipements aux salles

---

## Flow (Cas d'Utilisation Frontend)

### Scenario 1 : Configuration des equipements d'une salle
1. L'administrateur edite une salle
2. Il accede a l'onglet "Equipements"
3. Il voit la liste des equipements actuels avec quantites
4. Il clique sur "Ajouter equipement"
5. Il selectionne dans la liste des resources disponibles
6. Il indique la quantite (ex: 2 videoprojecteurs)
7. Il valide
8. L'equipement est associe a la salle

### Scenario 2 : Recherche de salle par equipement
1. L'utilisateur cherche une salle pour un cours
2. Il filtre : "Avec videoprojecteur"
3. L'API `GET /api/rooms?equipmentId=5` est appelee
4. Seules les salles avec videoprojecteur sont affichees
5. La quantite disponible est indiquee

---

## Resultat Obtenu

Apres implementation :
- Relation ManyToMany conforme au diagramme UML
- Gestion des quantites par salle
- Filtrage avance par equipements
- Coherence entre Room et Resource

---

## Criteres d'Acceptation

- [ ] La relation ManyToMany fonctionne
- [ ] Les quantites sont gerees
- [ ] Le filtrage par equipement fonctionne
- [ ] Migration des donnees existantes reussie
- [ ] Les tests Postman passent

---

## Fichiers Impactes

### Nouveaux fichiers a creer
```
iusj-room-service/src/main/java/com/example/iusj_room_service/
├── entities/
│   └── RoomEquipment.java
└── repositories/
    └── RoomEquipmentRepository.java
```

### Fichiers a modifier
```
iusj-room-service/src/main/java/com/example/iusj_room_service/
├── entities/Room.java
│   → Supprimer List<String>, ajouter relation
├── services/RoomService.java
│   → Ajouter methodes gestion equipements
└── controller/RoomController.java
    → Ajouter endpoints equipements
```

---

## Modele de Donnees

```java
@Entity
@Table(name = "room_equipments")
public class RoomEquipment {
    @Id @GeneratedValue
    private Long id;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "resource_id", nullable = false)
    private Long resourceId;

    @Column(nullable = false)
    private Integer quantite = 1;
}
```

---

## Notes Techniques

- Communication inter-services : room-service doit appeler resource-service pour valider les IDs
- Quantite : Par defaut 1 si non specifie
- Migration : Matcher les strings avec les noms des resources existantes
