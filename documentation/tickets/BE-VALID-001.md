# BE-VALID-001 - Validation Capacite Salle vs Groupe

## Priorite
P2 - Moyenne

## Delai Estime
1 jour

## Dependances
Aucune

## Exigences Remplies
- **RG-009** : Un cours ne peut pas etre programme dans une salle dont la capacite est inferieure a l'effectif du groupe

---

## Contexte (Audit)

Actuellement, le schedule-service effectue des validations de conflits (enseignant, salle, groupe) mais ne verifie pas la capacite de la salle par rapport a l'effectif du groupe :

```java
// Implementation actuelle - pas de verification capacite
public List<String> validateConflicts(ScheduleEntry entry, Long excludeId) {
    List<String> conflicts = new ArrayList<>();
    // Verifie conflit salle
    // Verifie conflit enseignant
    // Verifie conflit groupe
    // MAIS pas de verification capacite!
    return conflicts;
}
```

Il est donc possible de planifier un cours pour 60 etudiants dans une salle de 30 places.

**Etat actuel** : Pas de validation capacite
**Impact** : Moyen - Risque de surcharge des salles

---

## Taches

### 1. Communication inter-services
- [ ] Ajouter appels REST vers :
  - group-service : recuperer effectif du groupe
  - room-service : recuperer capacite de la salle

### 2. Service de validation
- [ ] Ajouter methode `validateCapacity(Long roomId, Long groupId)` :
  - Recuperer capacite salle
  - Recuperer effectif groupe
  - Comparer et retourner erreur si insuffisant

### 3. Integration dans validateConflicts()
- [ ] Appeler validateCapacity() dans la validation existante
- [ ] Ajouter le message d'erreur : "Capacite insuffisante : salle X places, groupe Y etudiants"

### 4. Suggestion de salles adequates
- [ ] Ajouter methode `getSuggestedRooms(Integer effectif, LocalDateTime horaire)` :
  - Filtrer salles avec capacite >= effectif
  - Filtrer salles disponibles a l'horaire
  - Retourner liste triee par capacite

### 5. Endpoint de suggestion
- [ ] Ajouter `GET /api/schedule/suggest-rooms?effectif=&date=&time=&duration=`

---

## Flow (Cas d'Utilisation Frontend)

### Scenario 1 : Erreur a la creation de seance
1. L'administrateur cree une seance
2. Il selectionne le groupe "L2 Info" (60 etudiants)
3. Il selectionne la salle "A101" (30 places)
4. Il clique sur "Enregistrer"
5. L'API valide et retourne une erreur :
   "Capacite insuffisante : Salle A101 (30 places) ne peut accueillir le groupe L2 Info (60 etudiants)"
6. L'interface affiche l'erreur en rouge

### Scenario 2 : Suggestion de salles
1. L'administrateur veut planifier un cours
2. Il selectionne le groupe (60 etudiants)
3. Il clique sur "Suggerer une salle"
4. L'API `GET /api/schedule/suggest-rooms?effectif=60&date=...` est appelee
5. Liste des salles adequates affichee :
   - Amphi A (150 places) - disponible
   - Salle B202 (80 places) - disponible
   - Salle C101 (60 places) - occupe de 14h a 16h
6. Il selectionne une salle adequate

### Scenario 3 : Warning capacite proche
1. L'administrateur cree une seance
2. Groupe : 55 etudiants, Salle : 60 places
3. La validation passe mais affiche un warning :
   "Attention : capacite proche de la limite (55/60)"

---

## Resultat Obtenu

Apres implementation :
- Impossible de planifier dans une salle trop petite
- Messages d'erreur clairs
- Suggestions de salles adequates
- Warnings pour capacites proches

---

## Criteres d'Acceptation

- [ ] La validation refuse une salle trop petite
- [ ] Le message d'erreur est explicite
- [ ] Les suggestions de salles fonctionnent
- [ ] Un warning s'affiche si capacite < 110% de l'effectif
- [ ] Les tests Postman passent

---

## Fichiers Impactes

### Fichiers a modifier
```
iusj-schedule-service/src/main/java/com/example/iusj_schedule_service/
├── services/ScheduleService.java
│   → Ajouter validateCapacity()
│   → Modifier validateConflicts()
│   → Ajouter getSuggestedRooms()
├── controller/ScheduleController.java
│   → Ajouter endpoint /suggest-rooms
└── client/ (nouveau)
    ├── GroupServiceClient.java
    └── RoomServiceClient.java
```

---

## Implementation Proposee

```java
public ValidationResult validateCapacity(Long roomId, Long groupId) {
    // Appel room-service
    RoomResponse room = roomClient.getRoom(roomId);
    // Appel group-service
    GroupResponse group = groupClient.getGroup(groupId);

    int capacite = room.getCapacity();
    int effectif = group.getSize();

    if (effectif > capacite) {
        return ValidationResult.error(
            String.format("Capacite insuffisante : Salle %s (%d places) ne peut accueillir le groupe %s (%d etudiants)",
                room.getName(), capacite, group.getName(), effectif)
        );
    }

    if (effectif > capacite * 0.9) {
        return ValidationResult.warning(
            String.format("Attention : capacite proche de la limite (%d/%d)",
                effectif, capacite)
        );
    }

    return ValidationResult.ok();
}
```

---

## Notes Techniques

- Cache : Mettre en cache les capacites/effectifs pour eviter trop d'appels
- Tolerance : Warning si effectif > 90% capacite
- Fallback : Si service indisponible, logger warning mais ne pas bloquer
