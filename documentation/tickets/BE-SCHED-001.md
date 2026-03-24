# BE-SCHED-001 - Generation Automatique EDT

## Priorite
P1 - Haute

## Delai Estime
4 jours

## Dependances
- BE-EDT-001 (Entite EDT requise)

## Exigences Remplies
- **BF-052** : Creer un emploi du temps (generation automatique)
- **RG-006** : Un enseignant ne peut pas avoir deux cours au meme moment
- **RG-007** : Une salle ne peut pas accueillir deux cours au meme moment
- **RG-008** : Un groupe ne peut pas avoir deux cours au meme moment
- **Diagramme UML** : Methode EDT.Generer()

---

## Contexte (Audit)

Actuellement, la creation des emplois du temps est entierement manuelle. L'administrateur doit :
1. Verifier manuellement les disponibilites des enseignants
2. Verifier manuellement la disponibilite des salles
3. Placer chaque seance une par une
4. Verifier les conflits apres coup

Cela est fastidieux et source d'erreurs. Un algorithme de generation automatique est necessaire pour :
- Optimiser l'utilisation des ressources
- Respecter toutes les contraintes
- Reduire le temps de planification

**Etat actuel** : Generation manuelle uniquement
**Impact** : Eleve - Perte de temps et risque d'erreurs

---

## Taches

### 1. Definition des contraintes
- [ ] Documenter toutes les contraintes :
  - **Obligatoires** : conflits enseignant/salle/groupe
  - **Optionnelles** : preferences horaires, capacite salle
- [ ] Creer DTOs pour les parametres de generation

### 2. Collecte des donnees
- [ ] Creer `ScheduleDataCollector` pour recuperer :
  - Liste des cours a planifier (par periode)
  - Disponibilites des enseignants
  - Disponibilites des salles
  - Effectifs des groupes
  - Capacites des salles

### 3. Algorithme de generation
- [ ] Implementer `ScheduleGenerator` avec :
  - Algorithme glouton (greedy) pour solution initiale
  - (Optionnel) Optimisation par recuit simule ou genetique
  - Verification des contraintes a chaque placement
- [ ] Gerer les cas ou aucune solution n'est trouvee

### 4. Algorithme de detection de conflits
- [ ] Ameliorer `validateConflicts()` existant :
  - Conflit enseignant (meme enseignant, meme creneau)
  - Conflit salle (meme salle, meme creneau)
  - Conflit groupe (meme groupe, meme creneau)
  - Conflit capacite (effectif > capacite salle)

### 5. Service de generation
- [ ] Creer `ScheduleGeneratorService` avec methodes :
  - `generate(GenerationRequest request)` - Lance la generation
  - `getAvailableSlots(Long teacherId, LocalDate date)` - Creneaux libres enseignant
  - `getSuggestedRooms(Integer effectif, List<String> equipments)` - Salles suggerees
  - `validateSchedule(Long edtId)` - Validation complete

### 6. Endpoint de generation
- [ ] Ajouter endpoints :
  - `POST /api/edt/generate` - Lance generation
    - Body : periode, annee, groupeIds[], options
  - `GET /api/edt/suggestions` - Suggestions de creneaux
    - Params : teacherId, groupId, matiereId
  - `POST /api/edt/validate-entry` - Valide une seance avant ajout

### 7. Gestion asynchrone (optionnel)
- [ ] Rendre la generation asynchrone pour gros volumes
- [ ] Ajouter status de progression
- [ ] Notification a la fin de generation

---

## Flow (Cas d'Utilisation Frontend)

### Scenario 1 : Generation automatique d'un EDT
1. L'administrateur accede a la page "Generation EDT"
2. Il selectionne :
   - Periode : Semestre 2
   - Annee : 2026
   - Groupes a planifier : [L1 Info, L2 Info, L3 Info]
3. Il clique sur "Generer"
4. L'API `POST /api/edt/generate` est appelee
5. Un loader/progressbar indique l'avancement
6. L'algorithme :
   - Charge les cours a planifier
   - Charge les disponibilites enseignants
   - Charge les salles disponibles
   - Place les seances en respectant les contraintes
7. Le resultat est affiche :
   - X seances placees
   - Y conflits detectes (si impossible a resoudre)
   - Liste des seances non placees (si echec)
8. L'administrateur peut ajuster manuellement puis valider

### Scenario 2 : Suggestion de creneaux
1. L'administrateur veut ajouter une seance manuellement
2. Il selectionne : matiere, enseignant, groupe
3. Il clique sur "Suggerer creneaux"
4. L'API `GET /api/edt/suggestions` est appelee
5. Le systeme affiche les creneaux disponibles :
   - Lundi 8h-10h : Salle A101 disponible
   - Mardi 14h-16h : Salle B202 disponible
   - ...
6. L'administrateur choisit un creneau
7. La seance est creee automatiquement

### Scenario 3 : Validation avant ajout
1. L'administrateur cree manuellement une seance
2. Avant d'enregistrer, il clique sur "Verifier"
3. L'API `POST /api/edt/validate-entry` est appelee
4. Le systeme retourne :
   - OK : aucun conflit
   - WARNING : capacite proche de la limite
   - ERROR : conflit detecte (details)
5. Si OK, la seance est enregistree

---

## Resultat Obtenu

Apres implementation :
- Generation automatique des EDT fonctionnelle
- Algorithme respectant toutes les contraintes
- Suggestions de creneaux disponibles
- Validation en temps reel des conflits
- Gain de temps significatif pour l'administration

---

## Criteres d'Acceptation

- [ ] La generation produit un EDT valide (sans conflits)
- [ ] Tous les cours demandes sont planifies (ou raison claire si impossible)
- [ ] Les contraintes obligatoires sont respectees a 100%
- [ ] Les suggestions de creneaux sont pertinentes
- [ ] La validation detecte tous les types de conflits
- [ ] Performance acceptable (<30s pour un semestre)
- [ ] Les tests passent

---

## Fichiers Impactes

### Nouveaux fichiers a creer
```
iusj-schedule-service/src/main/java/com/example/iusj_schedule_service/
├── dto/
│   ├── GenerationRequest.java
│   ├── GenerationResult.java
│   ├── SlotSuggestion.java
│   └── ValidationResult.java
├── services/
│   ├── ScheduleGeneratorService.java
│   └── ScheduleDataCollector.java
└── algorithm/
    ├── ScheduleConstraint.java
    ├── TimeSlot.java
    └── GreedyScheduler.java
```

### Fichiers existants a modifier
```
iusj-schedule-service/src/main/java/com/example/iusj_schedule_service/
├── controller/ScheduleController.java
│   → Ajouter endpoints /generate, /suggestions, /validate-entry
└── services/ScheduleService.java
    → Ameliorer validateConflicts()
```

---

## Algorithme Propose

```
ALGORITHME GreedyScheduler:

ENTREES:
  - courses[] : liste des cours a planifier
  - teachers[] : enseignants avec disponibilites
  - rooms[] : salles avec capacites et equipements
  - groups[] : groupes avec effectifs
  - timeSlots[] : creneaux horaires possibles

SORTIE:
  - schedule[] : liste des seances planifiees

DEBUT:
  1. Trier courses par priorite (CM avant TD avant TP)
  2. Pour chaque course dans courses:
     a. Obtenir enseignant assigne
     b. Obtenir groupe concerne
     c. Pour chaque timeSlot dans timeSlots:
        i. Verifier disponibilite enseignant
        ii. Verifier disponibilite groupe
        iii. Trouver salle compatible (capacite >= effectif)
        iv. Si tout OK:
            - Creer seance
            - Marquer creneau occupe pour enseignant, groupe, salle
            - Passer au cours suivant
     d. Si aucun creneau trouve:
        - Ajouter cours a liste "non planifies"
  3. Retourner schedule et liste non planifies
FIN
```

---

## Notes Techniques

- Algorithme glouton : Simple et rapide, solution satisfaisante
- Ford-Fulkerson : Pour l'optimisation (futur)
- Creneaux : 8h-10h, 10h-12h, 14h-16h, 16h-18h (configurable)
- Performance : Utiliser cache pour les disponibilites
- Fallback : Si generation echoue, proposer mode manuel assiste
