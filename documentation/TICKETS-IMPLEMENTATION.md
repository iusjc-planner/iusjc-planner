# Tickets d'Implementation - Audit Backend IUSJ Planner

**Date de l'audit** : 24 Mars 2026
**Branche auditee** : `dev`
**Statut global** : ~48% complete

---

## Resume de l'Audit

### Analyse Comparative : Diagramme de Classes vs Implementation

| Entite du Diagramme | Service Actuel | Statut | Ecarts |
|---------------------|----------------|--------|--------|
| Support | - | :x: NON | Entite manquante |
| Matiere | course-service | :white_check_mark: OK | Relation Filiere via ID |
| Filiere | school-service | :white_check_mark: OK | - |
| Disponibilite | teacher-service | :white_check_mark: OK | - |
| Enseignant | teacher-service | :warning: Partiel | Pas d'heritage de User |
| EDT | schedule-service | :x: NON | ScheduleEntry != EDT |
| Utilisateur | user-service | :white_check_mark: OK | - |
| Administrateur | - | :x: NON | Juste un role, pas une entite |
| Notification | - | :x: NON | Entite manquante |
| Ecole | school-service | :white_check_mark: OK | - |
| Groupe | group-service | :warning: Partiel | Manque filiereId, Diviser() |
| Cour | course-service | :white_check_mark: OK | - |
| Salle | room-service | :white_check_mark: OK | - |
| Rapport | - | :x: NON | Entite et service manquants |
| Equipement | resource-service | :warning: Partiel | Resource != Equipement |
| Reservation | room-service | :warning: Partiel | Uniquement pour salles |
| Etudiant | student-service | :white_check_mark: OK | - |
| Evenement | - | :x: NON | Service vide |

---

## TICKETS A IMPLEMENTER

---

### TICKET-001 : Creer l'entite Support et son service

**Priorite** : HAUTE
**Estimation** : 2-3 jours
**Service concerne** : `iusj-course-service` (ou nouveau `iusj-support-service`)

#### Description
L'entite `Support` du diagramme de classes n'existe pas. Actuellement, les supports sont geres comme une simple liste de strings dans `Matiere.supports`. Il faut creer une entite complete.

#### Specification du diagramme
```
class Support {
  +id_support
  +titre
  +Ajouter()
  +Modifier(Supp sup)
  +Supprimer(Supp sup)
}

Support "1..*" -- "1" Matiere : avoir
```

#### Implementation actuelle
```java
// Dans Matiere.java
@ElementCollection
@CollectionTable(name = "matiere_supports", joinColumns = @JoinColumn(name = "matiere_id"))
@Column(name = "support_url")
private List<String> supports = new ArrayList<>();
```

#### Taches
- [ ] Creer l'entite `Support` avec les champs :
  - `id` (Long, auto-generated)
  - `titre` (String, obligatoire)
  - `type` (Enum: PDF, DOCX, PPTX, VIDEO, LINK)
  - `url` (String, chemin ou URL)
  - `matiereId` (Long, FK vers Matiere)
  - `uploadedAt` (LocalDateTime)
- [ ] Creer le repository `SupportRepository`
- [ ] Creer le service `SupportService` avec CRUD
- [ ] Creer le controller `SupportController` avec endpoints :
  - `GET /api/matieres/{matiereId}/supports` - Liste des supports
  - `GET /api/supports/{id}` - Detail d'un support
  - `POST /api/matieres/{matiereId}/supports` - Ajouter un support
  - `PUT /api/supports/{id}` - Modifier un support
  - `DELETE /api/supports/{id}` - Supprimer un support
- [ ] Migrer les donnees existantes de `matiere_supports`
- [ ] Tests unitaires
- [ ] Documentation API

---

### TICKET-002 : Creer l'entite EDT (Emploi du Temps)

**Priorite** : TRES HAUTE
**Estimation** : 4-5 jours
**Service concerne** : `iusj-schedule-service`

#### Description
Le diagramme prevoit une entite `EDT` distincte de `ScheduleEntry`. L'EDT represente un emploi du temps global (semaine, periode, vue) alors que `ScheduleEntry` represente une entree individuelle.

#### Specification du diagramme
```
class EDT {
  +id_EDT
  +semaine
  +periode
  +vue
  +Generer()
  +Modifier(EDT edt)
  +Supprimer(EDT edt)
  +Consulter(EDT edt)
}

EDT "1..*" -- "1..*" Groupe : appartenir
```

#### Implementation actuelle
```java
// ScheduleEntry.java - ne represente qu'une entree, pas un EDT complet
public class ScheduleEntry {
    private Long id;
    private Long courseId, teacherId, roomId, groupId;
    private LocalDateTime startTime, endTime;
    private Status status;
}
```

#### Taches
- [ ] Creer l'entite `EDT` avec les champs :
  - `id` (Long)
  - `semaine` (Integer, numero de semaine)
  - `anneeAcademique` (String, ex: "2025-2026")
  - `periode` (Enum: SEMESTRE_1, SEMESTRE_2, ANNUEL)
  - `vue` (Enum: JOUR, SEMAINE, MOIS)
  - `status` (Enum: DRAFT, PUBLISHED, ARCHIVED)
  - `createdAt`, `updatedAt`
- [ ] Creer la table de liaison `edt_groupes` (ManyToMany)
- [ ] Creer le repository `EDTRepository`
- [ ] Creer le service `EDTService` avec :
  - `generer()` : Generation automatique d'EDT
  - CRUD standard
  - `consulter(edtId)` : Vue detaillee
- [ ] Creer le controller `EDTController` avec :
  - `POST /api/edt/generate` - Generer un EDT
  - `GET /api/edt` - Liste des EDT
  - `GET /api/edt/{id}` - Detail d'un EDT
  - `GET /api/edt/{id}/entries` - Entrees d'un EDT
  - `PUT /api/edt/{id}` - Modifier
  - `DELETE /api/edt/{id}` - Supprimer
  - `GET /api/groups/{groupId}/edt` - EDT d'un groupe
- [ ] Lier `ScheduleEntry` a `EDT` (ajouter `edtId`)
- [ ] Tests unitaires
- [ ] Documentation API

---

### TICKET-003 : Creer le service Notification

**Priorite** : MOYENNE
**Estimation** : 3-4 jours
**Service concerne** : Nouveau `iusj-notification-service`

#### Description
L'entite `Notification` est absente du systeme. Elle est essentielle pour informer les utilisateurs des changements d'emploi du temps, evenements, etc.

#### Specification du diagramme
```
class Notification {
  +id
  +type
  +contenue
  +date_envoie
  +Consulter(Notifi notif)
  +Supprimer(Notifi notif)
}

Utilisateur "1..*" -- "1..*" Notification : concerner
```

#### Taches
- [ ] Creer le microservice `iusj-notification-service` (port 8092)
- [ ] Creer l'entite `Notification` :
  - `id` (Long)
  - `type` (Enum: INFO, WARNING, ALERT, SCHEDULE_CHANGE, EVENT)
  - `contenu` (String, texte de la notification)
  - `dateEnvoi` (LocalDateTime)
  - `lu` (Boolean, defaut false)
  - `userId` (Long, destinataire)
  - `sourceType` (Enum: SCHEDULE, EVENT, ADMIN, SYSTEM)
  - `sourceId` (Long, optionnel, reference a l'objet source)
- [ ] Creer table de liaison `notification_users` pour broadcast
- [ ] Creer service `NotificationService` :
  - `send(notification)` : Envoyer une notification
  - `broadcast(notification, userIds)` : Envoi multiple
  - `markAsRead(notificationId)` : Marquer comme lue
  - `getUnread(userId)` : Notifications non lues
- [ ] Creer controller avec :
  - `GET /api/notifications` - Mes notifications
  - `GET /api/notifications/unread` - Non lues
  - `PUT /api/notifications/{id}/read` - Marquer comme lue
  - `DELETE /api/notifications/{id}` - Supprimer
  - `POST /api/notifications/broadcast` (ADMIN)
- [ ] Configurer Eureka et Gateway
- [ ] Integrer avec schedule-service pour notifications auto
- [ ] Tests unitaires
- [ ] Documentation API

---

### TICKET-004 : Creer le service Rapport

**Priorite** : MOYENNE
**Estimation** : 4-5 jours
**Service concerne** : Nouveau `iusj-report-service`

#### Description
L'entite `Rapport` permet de generer des rapports sur l'utilisation des salles, la charge des enseignants, les statistiques.

#### Specification du diagramme
```
class Rapport {
  +id_rapport
  +date
  +type
  +Generer(RP rp)
  +Supprimer(RP rp)
  +Exporter(RP rp)
}

Rapport "1..*" -- "1" Salle : concerner
```

#### Taches
- [ ] Creer le microservice `iusj-report-service` (port 8091)
- [ ] Creer l'entite `Rapport` :
  - `id` (Long)
  - `date` (LocalDateTime, date de generation)
  - `type` (Enum: ROOM_USAGE, TEACHER_WORKLOAD, SCHEDULE_STATS, EVENTS)
  - `titre` (String)
  - `parametres` (JSON, filtres utilises)
  - `contenu` (TEXT/BLOB, donnees du rapport)
  - `format` (Enum: JSON, PDF, EXCEL)
  - `salleId` (Long, optionnel)
  - `generePar` (Long, userId)
- [ ] Creer service `ReportService` :
  - `generer(type, parametres)` : Generer un rapport
  - `exporter(rapportId, format)` : Exporter en PDF/Excel
  - Communications inter-services pour agreger les donnees
- [ ] Creer controller avec :
  - `POST /api/reports/generate` - Generer un rapport
  - `GET /api/reports` - Liste des rapports
  - `GET /api/reports/{id}` - Detail
  - `GET /api/reports/{id}/export?format=pdf` - Exporter
  - `DELETE /api/reports/{id}` - Supprimer
  - `GET /api/rooms/{roomId}/reports` - Rapports d'une salle
- [ ] Integrer Apache POI pour Excel, iText pour PDF
- [ ] Configurer Eureka et Gateway
- [ ] Tests unitaires
- [ ] Documentation API

---

### TICKET-005 : Creer le service Evenement

**Priorite** : BASSE
**Estimation** : 2-3 jours
**Service concerne** : `iusj-event-service` (existe mais vide)

#### Description
Le service evenement existe dans la structure mais n'a aucune implementation. Il faut creer l'entite et les endpoints.

#### Specification du diagramme
```
class Evenement {
  +id_event
  +nom
  +description
  +date
  +heure_debut
  +duree
  +Planifier()
}

Evenement "1" -- "1" Salle : concerner
```

#### Implementation actuelle
Le dossier `iusj-event-service` existe mais ne contient pas d'entites implementees.

#### Taches
- [ ] Creer l'entite `Evenement` :
  - `id` (Long)
  - `nom` (String, obligatoire)
  - `description` (String)
  - `date` (LocalDate)
  - `heureDebut` (LocalTime)
  - `duree` (Integer, en minutes)
  - `salleId` (Long, FK vers Room)
  - `organisateurId` (Long, userId)
  - `type` (Enum: CONFERENCE, REUNION, EXAMEN, SOUTENANCE, AUTRE)
  - `status` (Enum: PLANIFIE, EN_COURS, TERMINE, ANNULE)
- [ ] Creer repository `EvenementRepository`
- [ ] Creer service `EvenementService` :
  - CRUD standard
  - `planifier()` : Verifier disponibilite salle
  - Communication avec room-service
- [ ] Creer controller avec :
  - `GET /api/events` - Liste
  - `GET /api/events/{id}` - Detail
  - `POST /api/events` - Creer/Planifier
  - `PUT /api/events/{id}` - Modifier
  - `DELETE /api/events/{id}` - Supprimer
  - `GET /api/rooms/{roomId}/events` - Evenements d'une salle
- [ ] Configurer le port (ex: 8089)
- [ ] Enregistrer dans Eureka et Gateway
- [ ] Tests unitaires
- [ ] Documentation API

---

### TICKET-006 : Transformer Resource en Equipement avec Reservation

**Priorite** : MOYENNE
**Estimation** : 3-4 jours
**Service concerne** : `iusj-resource-service`

#### Description
L'entite `Resource` actuelle ne correspond pas exactement a `Equipement` du diagramme. Il manque notamment la relation avec `Salle` et la fonctionnalite de reservation.

#### Specification du diagramme
```
class Equipement {
  +id_equipement
  +type
  +nombre
  +Creer(EQP eqp)
  +Modifier(EQP eqp)
  +Supprimer(EQP eqp)
  +Reserver()
}

Salle "1..*" -- "1..*" Equipement : concerner
```

#### Implementation actuelle
```java
public class Resource {
    private Long id;
    private String name, type, location, description;
    private Integer quantityTotal, quantityAvailable;
    private Status status;
    // Pas de relation avec Salle, pas de reservation
}
```

#### Taches
- [ ] Renommer ou creer entite `Equipement` (ou garder `Resource` avec adaptations)
- [ ] Ajouter la relation ManyToMany avec `Salle` :
  - Table de liaison `salle_equipements`
  - Champs : `salle_id`, `equipement_id`, `quantite`
- [ ] Creer entite `EquipementReservation` :
  - `id` (Long)
  - `equipementId` (Long)
  - `reserveParId` (Long, userId)
  - `dateDebut`, `dateFin` (LocalDateTime)
  - `quantite` (Integer)
  - `status` (Enum: RESERVED, CONFIRMED, CANCELLED)
  - `motif` (String)
- [ ] Ajouter service `EquipementReservationService`
- [ ] Ajouter endpoints :
  - `POST /api/equipements/{id}/reserve` - Reserver
  - `GET /api/equipements/{id}/reservations` - Reservations
  - `DELETE /api/equipements/{id}/reservations/{resId}` - Annuler
  - `GET /api/rooms/{roomId}/equipements` - Equipements d'une salle
- [ ] Tests unitaires
- [ ] Documentation API

---

### TICKET-007 : Ajouter relation Filiere-Groupe

**Priorite** : HAUTE
**Estimation** : 1-2 jours
**Service concerne** : `iusj-group-service`

#### Description
Selon le diagramme, un `Groupe` appartient a une `Filiere`, mais actuellement le groupe n'a qu'un `schoolId`.

#### Specification du diagramme
```
Filiere "1" -- "1..*" Groupe : appartenir
```

#### Implementation actuelle
```java
// Group.java
@NotNull
private Long schoolId;
// Pas de filiereId
```

#### Taches
- [ ] Ajouter le champ `filiereId` dans `Group` :
  ```java
  @NotNull
  private Long filiereId;
  ```
- [ ] Mettre a jour les DTOs
- [ ] Mettre a jour `GroupController` avec filtrage par filiere
- [ ] Ajouter endpoint : `GET /api/filieres/{filiereId}/groups`
- [ ] Mettre a jour les specifications de filtrage
- [ ] Migration BDD pour ajouter la colonne
- [ ] Tests unitaires
- [ ] Mettre a jour documentation API

---

### TICKET-008 : Ajouter methode Diviser() pour Groupe

**Priorite** : BASSE
**Estimation** : 1 jour
**Service concerne** : `iusj-group-service`

#### Description
Le diagramme prevoit une methode `Diviser(GRP grp)` pour les groupes, permettant de scinder un groupe en sous-groupes (ex: TD, TP).

#### Specification du diagramme
```
class Groupe {
  +Diviser(GRP grp)
}
```

#### Taches
- [ ] Ajouter champ `parentGroupId` dans `Group` (self-reference)
- [ ] Ajouter champ `typeGroupe` (Enum: PRINCIPAL, TD, TP, SOUS_GROUPE)
- [ ] Creer methode `GroupService.diviser(groupId, nbSousGroupes)` :
  - Verifier que le groupe existe et est PRINCIPAL
  - Creer N sous-groupes avec noms auto (ex: "ISI4-A", "ISI4-B")
  - Repartir les etudiants equitablement (optionnel)
  - Retourner la liste des sous-groupes crees
- [ ] Ajouter endpoint : `POST /api/groups/{id}/divide?count=2`
- [ ] Ajouter endpoint : `GET /api/groups/{id}/subgroups`
- [ ] Tests unitaires
- [ ] Documentation API

---

### TICKET-009 : Renommer effectif en size dans Groupe

**Priorite** : FAIBLE
**Estimation** : 0.5 jour
**Service concerne** : `iusj-group-service`

#### Description
Le diagramme utilise `effectif` alors que l'implementation utilise `size`. Ceci est une difference de nomenclature mineure.

#### Specification du diagramme
```
class Groupe {
  +effectif
}
```

#### Implementation actuelle
```java
private Integer size;
```

#### Decision
**Option A** : Garder `size` (terme plus generique en anglais, coherent avec le reste du code)
**Option B** : Renommer en `effectif` pour conformite au diagramme

**Recommandation** : Option A - ne pas modifier (pas d'impact fonctionnel)

---

### TICKET-010 : Verifier heritage Utilisateur/Enseignant

**Priorite** : FAIBLE (architecture alternative valide)
**Estimation** : -

#### Description
Le diagramme prevoit un heritage `Utilisateur <|-- Enseignant`, mais l'implementation utilise une composition (Teacher reference User via `userId`).

#### Specification du diagramme
```
Utilisateur <|-- Administrateur
Utilisateur <|-- Enseignant
```

#### Implementation actuelle
```java
// Teacher.java
public class Teacher {
    private Long id;
    private Long userId; // Reference au User
    private Set<String> specialities;
}
```

#### Analyse
L'approche par composition est valide dans une architecture microservices car :
- Elle evite le couplage fort entre services
- Elle permet l'independance des BDD
- Elle facilite la scalabilite

**Recommandation** : Ne pas modifier - l'architecture actuelle est correcte pour les microservices.

---

### TICKET-011 : Ajouter relation Salle-Equipement

**Priorite** : HAUTE
**Estimation** : 2 jours
**Service concerne** : `iusj-room-service` et `iusj-resource-service`

#### Description
Le diagramme prevoit une relation ManyToMany entre `Salle` et `Equipement`.

#### Specification du diagramme
```
Salle "1..*" -- "1..*" Equipement : concerner
```

#### Implementation actuelle
```java
// Room.java
@ElementCollection
private List<String> equipments; // Simple liste de strings
```

#### Taches
- [ ] **Option 1 (recommandee)** : Stocker les IDs d'equipements dans Room
  ```java
  @ElementCollection
  @Column(name = "equipment_id")
  private List<Long> equipmentIds;
  ```
- [ ] **Option 2** : Communication inter-services
  - Room garde sa liste de strings
  - Resource-service expose un endpoint pour verifier les equipements
- [ ] Ajouter endpoints :
  - `GET /api/rooms/{id}/equipments` - Liste des equipements
  - `POST /api/rooms/{id}/equipments/{equipId}` - Associer
  - `DELETE /api/rooms/{id}/equipments/{equipId}` - Dissocier
- [ ] Tests unitaires
- [ ] Documentation API

---

### TICKET-012 : Implementer endpoint Generer pour EDT

**Priorite** : TRES HAUTE
**Estimation** : 5-7 jours
**Service concerne** : `iusj-schedule-service`

#### Description
Le diagramme prevoit une methode `Generer()` pour l'EDT. C'est le coeur metier du systeme : la generation automatique d'emplois du temps sans conflits.

#### Specification du diagramme
```
class EDT {
  +Generer()
}
```

#### Taches
- [ ] Implementer l'algorithme de generation :
  - Collecte des contraintes (disponibilites profs, salles, groupes)
  - Detection de conflits
  - Placement optimal des cours
  - Respect des contraintes horaires
- [ ] Creer endpoint `POST /api/edt/generate` avec parametres :
  - `semaine` (Integer)
  - `periode` (String)
  - `groupIds` (List<Long>)
  - `optimisation` (Boolean, defaut true)
- [ ] Implementer validations :
  - Un prof ne peut pas etre dans 2 salles en meme temps
  - Une salle ne peut accueillir qu'un cours a la fois
  - Un groupe ne peut avoir qu'un cours a la fois
  - Respecter les disponibilites des enseignants
  - Respecter les capacites des salles
- [ ] Ajouter endpoint de validation : `POST /api/edt/validate`
- [ ] Tests intensifs avec jeux de donnees realistes
- [ ] Documentation de l'algorithme

---

## TICKETS DE CORRECTION/AMELIORATION

---

### TICKET-013 : Harmoniser les roles entre auth-service et user-service

**Priorite** : HAUTE
**Estimation** : 0.5 jour

#### Description
Incoherence detectee : `auth-service` a les roles `{ADMIN, USER}` et `user-service` a `{ADMIN, ENSEIGNANT}`.

#### Implementation actuelle
```java
// Auth Service User.java
public enum Role { ADMIN, USER }

// User Service User.java
public enum Role { ADMIN, ENSEIGNANT }
```

#### Taches
- [ ] Definir les roles definitifs selon le diagramme : `{ADMIN, ENSEIGNANT, ETUDIANT}`
- [ ] Mettre a jour auth-service
- [ ] Mettre a jour user-service
- [ ] Mettre a jour le frontend
- [ ] Tests de regression

---

### TICKET-014 : Ajouter champs manquants dans Disponibilite

**Priorite** : FAIBLE
**Estimation** : 0.5 jour

#### Description
Verifier que l'entite `Disponibilite` a tous les champs du diagramme.

#### Specification du diagramme
```
class Disponibilite {
  +id_disponibilite
  +date
  +duree
  +debut
}
```

#### Implementation actuelle
```java
public class Disponibilite {
    private Long id;
    private Long userId;
    private LocalDate date;
    private LocalTime heureDebut;  // = debut
    private Integer duree;
    private Boolean isAvailable;
    private String reason;
    // OK - tous les champs sont presents
}
```

**Statut** : OK - Aucune action requise

---

### TICKET-015 : Ajouter tests unitaires manquants

**Priorite** : MOYENNE
**Estimation** : 5-7 jours

#### Description
Plusieurs services n'ont pas de tests unitaires complets.

#### Taches
- [ ] Tests pour course-service (Matiere, Course)
- [ ] Tests pour room-service (Room, RoomReservation)
- [ ] Tests pour group-service
- [ ] Tests pour schedule-service
- [ ] Tests pour student-service
- [ ] Tests pour resource-service
- [ ] Configurer JaCoCo pour couverture de code
- [ ] Objectif : >70% de couverture

---

## RESUME DES PRIORITES

### Priorite TRES HAUTE
- TICKET-002 : Creer l'entite EDT
- TICKET-012 : Implementer endpoint Generer pour EDT

### Priorite HAUTE
- TICKET-001 : Creer l'entite Support
- TICKET-007 : Ajouter relation Filiere-Groupe
- TICKET-011 : Ajouter relation Salle-Equipement
- TICKET-013 : Harmoniser les roles

### Priorite MOYENNE
- TICKET-003 : Creer le service Notification
- TICKET-004 : Creer le service Rapport
- TICKET-006 : Transformer Resource en Equipement
- TICKET-015 : Tests unitaires

### Priorite BASSE
- TICKET-005 : Creer le service Evenement
- TICKET-008 : Methode Diviser() pour Groupe
- TICKET-009 : Renommer effectif (non recommande)
- TICKET-010 : Heritage Utilisateur (non recommande)
- TICKET-014 : Champs Disponibilite (OK)

---

## ESTIMATION GLOBALE

| Categorie | Estimation |
|-----------|------------|
| Entites manquantes | ~15-20 jours |
| Relations manquantes | ~5-7 jours |
| Fonctionnalites manquantes | ~7-10 jours |
| Corrections/Harmonisation | ~2-3 jours |
| Tests | ~5-7 jours |
| **TOTAL** | **~35-45 jours** |

---

## ORDRE D'IMPLEMENTATION RECOMMANDE

1. **Sprint 1** (2 semaines) - Infrastructure entites
   - TICKET-002 : EDT
   - TICKET-007 : Relation Filiere-Groupe
   - TICKET-013 : Harmonisation roles

2. **Sprint 2** (2 semaines) - Entites secondaires
   - TICKET-001 : Support
   - TICKET-005 : Evenement
   - TICKET-011 : Relation Salle-Equipement

3. **Sprint 3** (2 semaines) - Services avances
   - TICKET-012 : Algorithme generation EDT
   - TICKET-003 : Notifications

4. **Sprint 4** (1-2 semaines) - Finalisation
   - TICKET-004 : Rapports
   - TICKET-006 : Equipements/Reservations
   - TICKET-015 : Tests

---

**Document genere par audit automatique**
**Version** : 1.0
**Derniere mise a jour** : 24 Mars 2026
