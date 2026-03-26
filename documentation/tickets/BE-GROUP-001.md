# BE-GROUP-001 - Relation Groupe-Filiere

## Priorite
P1 - Haute

## Delai Estime
1 jour

## Dependances
Aucune

## Exigences Remplies
- **Diagramme UML** : Relation Filiere "1" -- "1.." Groupe : appartenir
- Coherence du modele de donnees

---

## Contexte (Audit)

L'entite Group actuelle ne possede pas de relation avec Filiere :

```java
// Implementation actuelle
public class Group {
    private Long id;
    private String name;
    private String level;
    private Long schoolId;  // Lien vers ecole uniquement
    private Integer size;
    private Status status;
}
```

Selon le diagramme UML, un groupe doit appartenir a une filiere, pas directement a une ecole. La hierarchie correcte est :
- Ecole → Filiere → Groupe

**Etat actuel** : Group.schoolId existe mais pas filiereId
**Impact** : Moyen - Groupes non categorises par filiere

---

## Taches

### 1. Modification de l'entite Group
- [ ] Ajouter champ `filiereId` (Long)
- [ ] Rendre `schoolId` optionnel ou le deduire de la filiere
- [ ] Ajouter validation : filiereId requis

### 2. Modification du Repository
- [ ] Ajouter methode `findByFiliereId(Long filiereId)`
- [ ] Ajouter methode `countByFiliereId(Long filiereId)`
- [ ] Modifier les specifications de filtrage

### 3. Modification du Service
- [ ] Adapter `GroupService.create()` pour valider filiereId
- [ ] Ajouter `getByFiliere(Long filiereId)`
- [ ] Verifier coherence ecole/filiere si les deux sont fournis

### 4. Modification du Controller
- [ ] Ajouter endpoint `GET /api/groups/filiere/{filiereId}`
- [ ] Ajouter parametre `filiereId` aux filtres existants
- [ ] Modifier POST/PUT pour accepter filiereId

### 5. Migration des donnees
- [ ] Script pour associer les groupes existants a des filieres
- [ ] Strategie : deduire filiere depuis schoolId ou demander saisie manuelle

---

## Flow (Cas d'Utilisation Frontend)

### Scenario 1 : Creation d'un groupe avec filiere
1. L'administrateur accede a "Gestion des groupes"
2. Il clique sur "Nouveau groupe"
3. Il selectionne l'ecole dans la liste
4. La liste des filieres de cette ecole se charge
5. Il selectionne une filiere
6. Il remplit : nom, niveau, effectif
7. Il clique sur "Creer"
8. L'API `POST /api/groups` est appelee avec filiereId
9. Le groupe est cree et associe a la filiere

### Scenario 2 : Filtrage par filiere
1. L'utilisateur consulte la liste des groupes
2. Il filtre par ecole "Faculte des Sciences"
3. Les filieres de cette ecole apparaissent
4. Il filtre par filiere "Informatique"
5. Seuls les groupes de cette filiere sont affiches

---

## Resultat Obtenu

Apres implementation :
- Les groupes sont lies aux filieres
- Hierarchie Ecole → Filiere → Groupe respectee
- Filtrage par filiere fonctionnel
- Coherence avec le diagramme UML

---

## Criteres d'Acceptation

- [ ] Le champ filiereId est ajoute a l'entite Group
- [ ] La creation de groupe requiert une filiere
- [ ] Le filtrage par filiere fonctionne
- [ ] Les groupes existants sont migres
- [ ] Les tests Postman passent

---

## Fichiers Impactes

### Fichiers a modifier
```
iusj-group-service/src/main/java/com/example/iusj_group_service/
├── entities/Group.java
│   → Ajouter champ filiereId
├── repositories/GroupRepository.java
│   → Ajouter findByFiliereId()
├── services/GroupService.java
│   → Adapter create() et ajouter getByFiliere()
├── services/GroupSpecifications.java
│   → Ajouter filtre filiereId
└── controller/GroupController.java
    → Ajouter endpoint /filiere/{id} et parametre filtre
```

---

## Script de Migration

```sql
-- Associer les groupes a la premiere filiere de leur ecole (temporaire)
UPDATE groups g
SET filiere_id = (
    SELECT f.id FROM filieres f
    WHERE f.school_id = g.school_id
    LIMIT 1
)
WHERE g.filiere_id IS NULL;

-- OU creer une filiere "Non categorise" pour chaque ecole
INSERT INTO filieres (code, nom, school_id, status)
SELECT CONCAT('NC-', s.id), 'Non categorise', s.id, 'ACTIVE'
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM filieres f WHERE f.school_id = s.id AND f.code = CONCAT('NC-', s.id)
);
```

---

## Notes Techniques

- Coherence : Si filiereId est fourni, verifier que la filiere appartient a la bonne ecole
- Retrocompatibilite : Garder schoolId pour l'instant (peut etre deduit de filiere)
- Frontend : Le formulaire doit charger les filieres apres selection de l'ecole
