# BE-EDT-001 - Entite EDT avec Semaine/Periode/Vue

## Priorite
P1 - Haute

## Delai Estime
2 jours

## Dependances
Aucune

## Exigences Remplies
- **BF-052** : Creer un emploi du temps
- **Diagramme UML** : Classe EDT avec attributs id_EDT, semaine, periode, vue et methodes Generer(), Modifier(), Supprimer(), Consulter()
- **Relation UML** : EDT "1.." -- "1.." Groupe : appartenir

---

## Contexte (Audit)

L'implementation actuelle utilise l'entite `ScheduleEntry` qui represente une seance individuelle :

```java
// Implementation actuelle
public class ScheduleEntry {
    private Long id;
    private Long courseId;
    private Long teacherId;
    private Long roomId;
    private Long groupId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Status status;
}
```

Cette implementation differe du diagramme UML qui definit une entite EDT agregee avec :
- `semaine` : numero de semaine
- `periode` : semestre ou annee
- `vue` : type de vue (groupe, enseignant, salle)

**Etat actuel** : ScheduleEntry existe mais pas d'entite EDT agregee
**Impact** : Moyen - Fonctionnel mais non conforme au diagramme

---

## Taches

### 1. Creation de l'entite EDT
- [ ] Creer l'entite `EDT.java` dans schedule-service avec les attributs :
  - `id` (Long, auto-genere)
  - `semaine` (Integer, numero 1-52)
  - `annee` (Integer, ex: 2026)
  - `periode` (Enum: SEMESTRE1, SEMESTRE2, ANNUEL)
  - `vue` (Enum: GROUPE, ENSEIGNANT, SALLE)
  - `targetId` (Long, id du groupe/enseignant/salle selon vue)
  - `status` (Enum: DRAFT, VALIDATED, PUBLISHED)
  - `creePar` (Long, userId)
  - `dateCreation` (LocalDateTime)
  - `datePublication` (LocalDateTime, optionnel)
  - `entries` (List<ScheduleEntry>, relation OneToMany)
- [ ] Ajouter les annotations JPA et validations

### 2. Modification de ScheduleEntry
- [ ] Ajouter champ `edtId` (Long, FK vers EDT, optionnel)
- [ ] Modifier la relation pour permettre le lien avec EDT

### 3. Repository EDT
- [ ] Creer `EDTRepository` extends JpaRepository
- [ ] Ajouter methodes :
  - `findBySemaineAndAnnee(Integer semaine, Integer annee)`
  - `findByVueAndTargetId(VueType vue, Long targetId)`
  - `findBySemaineAndAnneeAndVueAndTargetId(...)`
  - `findByStatus(EDTStatus status)`
  - `findByPeriodeAndAnnee(PeriodeType periode, Integer annee)`

### 4. Service EDT
- [ ] Creer `EDTService` avec methodes :
  - `getOrCreate(Integer semaine, Integer annee, VueType vue, Long targetId)` - Recupere ou cree EDT
  - `getByGroupe(Long groupeId, Integer semaine, Integer annee)` - EDT d'un groupe
  - `getByEnseignant(Long enseignantId, Integer semaine, Integer annee)` - EDT d'un enseignant
  - `getBySalle(Long salleId, Integer semaine, Integer annee)` - EDT d'une salle
  - `getEntries(Long edtId)` - Liste les seances de l'EDT
  - `addEntry(Long edtId, ScheduleEntry entry)` - Ajoute une seance
  - `validate(Long edtId)` - Valide l'EDT (verifie conflits)
  - `publish(Long edtId)` - Publie l'EDT
  - `delete(Long edtId)` - Supprime l'EDT

### 5. Controller EDT
- [ ] Creer `EDTController` avec endpoints :
  - `GET /api/edt` - Liste des EDT (avec filtres)
  - `GET /api/edt/{id}` - Detail d'un EDT avec ses entries
  - `GET /api/edt/groupe/{groupeId}?semaine=&annee=` - EDT d'un groupe
  - `GET /api/edt/enseignant/{teacherId}?semaine=&annee=` - EDT d'un enseignant
  - `GET /api/edt/salle/{salleId}?semaine=&annee=` - EDT d'une salle
  - `POST /api/edt` - Cree un EDT
  - `POST /api/edt/{id}/entries` - Ajoute une seance
  - `PUT /api/edt/{id}/validate` - Valide
  - `PUT /api/edt/{id}/publish` - Publie
  - `DELETE /api/edt/{id}` - Supprime

### 6. Vue agregee
- [ ] Creer endpoint pour vue semaine complete :
  - Aggrege toutes les seances par jour
  - Formate pour affichage grille horaire
  - Inclut les evenements si disponibles

---

## Flow (Cas d'Utilisation Frontend)

### Scenario 1 : Consultation EDT d'un groupe
1. L'utilisateur accede a la page "Emploi du temps"
2. Il selectionne un groupe dans la liste
3. Il choisit la semaine a afficher
4. L'API `GET /api/edt/groupe/{id}?semaine=12&annee=2026` est appelee
5. L'EDT est affiche sous forme de grille horaire
6. Chaque seance montre : matiere, enseignant, salle, horaire

### Scenario 2 : Creation d'un EDT
1. L'administrateur accede a la gestion des EDT
2. Il clique sur "Nouvel EDT"
3. Il selectionne : semaine, annee, vue (Groupe), groupe cible
4. L'EDT est cree avec status DRAFT
5. Il peut maintenant ajouter des seances
6. Une fois complet, il valide puis publie

### Scenario 3 : Validation et publication
1. L'administrateur consulte un EDT en DRAFT
2. Il clique sur "Valider"
3. Le systeme verifie les conflits
4. Si OK, le status passe a VALIDATED
5. Il clique sur "Publier"
6. Le status passe a PUBLISHED
7. Les utilisateurs sont notifies (si notification-service actif)

---

## Resultat Obtenu

Apres implementation :
- Entite EDT conforme au diagramme UML
- Gestion des vues (groupe, enseignant, salle)
- Workflow de validation et publication
- Lien entre EDT et ScheduleEntry
- API REST complete pour la gestion des EDT

---

## Criteres d'Acceptation

- [ ] L'entite EDT est creee avec tous les attributs du diagramme
- [ ] La relation EDT-ScheduleEntry fonctionne
- [ ] Les EDT sont filtrables par semaine, annee, vue
- [ ] Les vues groupe/enseignant/salle fonctionnent
- [ ] Le workflow DRAFT→VALIDATED→PUBLISHED fonctionne
- [ ] Les tests Postman passent

---

## Fichiers Impactes

### Nouveaux fichiers a creer
```
iusj-schedule-service/src/main/java/com/example/iusj_schedule_service/
├── entities/
│   └── EDT.java
├── repositories/
│   └── EDTRepository.java
├── services/
│   └── EDTService.java
└── controller/
    └── EDTController.java
```

### Fichiers existants a modifier
```
iusj-schedule-service/src/main/java/com/example/iusj_schedule_service/entities/ScheduleEntry.java
  → Ajouter champ edtId ou relation @ManyToOne vers EDT
```

---

## Notes Techniques

- Semaine : Numero ISO 1-52/53
- Periodes : SEMESTRE1 (sept-jan), SEMESTRE2 (fev-juin), ANNUEL
- Vues : Permettent de filtrer les seances selon le point de vue
- Status : DRAFT (modifiable), VALIDATED (verifie), PUBLISHED (visible tous)
- Retrocompatibilite : Les anciens endpoints /api/schedule continuent de fonctionner
