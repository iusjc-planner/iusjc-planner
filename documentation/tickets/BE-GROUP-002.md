# BE-GROUP-002 - Methode Diviser() pour Groupes

## Priorite
P1 - Haute

## Delai Estime
1.5 jours

## Dependances
- BE-GROUP-001 (Relation Groupe-Filiere)

## Exigences Remplies
- **Diagramme UML** : Methode Groupe.Diviser(GRP grp)
- Gestion des sous-groupes TD/TP

---

## Contexte (Audit)

Actuellement, il n'existe aucune fonctionnalite pour diviser un groupe en sous-groupes. Les enseignants de TD et TP doivent travailler avec des sous-ensembles d'etudiants, mais le systeme ne permet pas de :
- Diviser automatiquement un groupe en N sous-groupes
- Gerer la relation parent/enfant entre groupes
- Distribuer les etudiants dans les sous-groupes

**Etat actuel** : Pas de methode Diviser(), pas de relation parent/enfant
**Impact** : Moyen - Gestion manuelle des sous-groupes necessaire

---

## Taches

### 1. Modification de l'entite Group
- [ ] Ajouter champ `parentGroupId` (Long, nullable)
- [ ] Ajouter champ `groupType` (Enum: PRINCIPAL, TD, TP, AUTRE)
- [ ] Ajouter relation `@ManyToOne` vers parent
- [ ] Ajouter relation `@OneToMany` vers enfants

### 2. Service de division
- [ ] Creer methode `diviser(Long groupId, Integer nombreSousGroupes, GroupType type)`
- [ ] Generer automatiquement les noms (GroupeA → GroupeA-TD1, GroupeA-TD2, etc.)
- [ ] Calculer effectif de chaque sous-groupe (effectif parent / N)
- [ ] Creer les sous-groupes en base

### 3. Distribution des etudiants (optionnel)
- [ ] Option 1 : Distribution aleatoire
- [ ] Option 2 : Distribution manuelle
- [ ] Option 3 : Pas de distribution (a faire manuellement)

### 4. Endpoints
- [ ] `POST /api/groups/{id}/split` - Divise un groupe
  - Body : `{ "count": 3, "type": "TD" }`
- [ ] `GET /api/groups/{id}/subgroups` - Liste les sous-groupes
- [ ] `PUT /api/groups/{id}/merge` - Fusionne des sous-groupes (optionnel)

### 5. Validation
- [ ] Verifier que le groupe n'est pas deja un sous-groupe
- [ ] Limiter le nombre de sous-groupes (max 10)
- [ ] Verifier l'effectif minimum par sous-groupe

---

## Flow (Cas d'Utilisation Frontend)

### Scenario 1 : Division d'un groupe pour TD
1. L'administrateur consulte le groupe "L2 Informatique" (60 etudiants)
2. Il clique sur "Diviser"
3. Une modale s'ouvre :
   - Nombre de sous-groupes : 3
   - Type : TD
4. Preview : TD1 (20 etud.), TD2 (20 etud.), TD3 (20 etud.)
5. Il confirme
6. L'API `POST /api/groups/5/split` est appelee
7. Les sous-groupes sont crees :
   - "L2 Informatique - TD1"
   - "L2 Informatique - TD2"
   - "L2 Informatique - TD3"
8. Le groupe principal garde son effectif total

### Scenario 2 : Division pour TP
1. L'administrateur selectionne "L2 Informatique - TD1" (20 etudiants)
2. Il clique sur "Diviser" → 2 groupes → Type: TP
3. Cree :
   - "L2 Informatique - TD1 - TP1" (10 etud.)
   - "L2 Informatique - TD1 - TP2" (10 etud.)

### Scenario 3 : Consultation de la hierarchie
1. L'administrateur consulte "L2 Informatique"
2. Il voit la structure :
   ```
   L2 Informatique (60)
   ├── L2 Info - TD1 (20)
   │   ├── L2 Info - TD1 - TP1 (10)
   │   └── L2 Info - TD1 - TP2 (10)
   ├── L2 Info - TD2 (20)
   │   ├── L2 Info - TD2 - TP1 (10)
   │   └── L2 Info - TD2 - TP2 (10)
   └── L2 Info - TD3 (20)
       ├── L2 Info - TD3 - TP1 (10)
       └── L2 Info - TD3 - TP2 (10)
   ```

---

## Resultat Obtenu

Apres implementation :
- Methode Diviser() conforme au diagramme UML
- Hierarchie de groupes (parent/enfants)
- Generation automatique des noms
- Types de groupes (PRINCIPAL, TD, TP)
- Vue hierarchique disponible

---

## Criteres d'Acceptation

- [ ] La division cree le bon nombre de sous-groupes
- [ ] Les noms sont generes automatiquement et coherents
- [ ] L'effectif est reparti equitablement
- [ ] La relation parent/enfant fonctionne
- [ ] Un sous-groupe ne peut pas etre divise au-dela de 2 niveaux
- [ ] Les tests Postman passent

---

## Fichiers Impactes

### Fichiers a modifier
```
iusj-group-service/src/main/java/com/example/iusj_group_service/
├── entities/Group.java
│   → Ajouter parentGroupId, groupType, relations
├── repositories/GroupRepository.java
│   → Ajouter findByParentGroupId()
├── services/GroupService.java
│   → Ajouter methode diviser()
└── controller/GroupController.java
    → Ajouter endpoints /split, /subgroups
```

---

## Modele de Donnees Mis a Jour

```java
@Entity
public class Group {
    @Id @GeneratedValue
    private Long id;

    private String name;
    private String level;
    private Long schoolId;
    private Long filiereId;
    private Integer size;

    @Enumerated(EnumType.STRING)
    private GroupType groupType;  // PRINCIPAL, TD, TP

    @ManyToOne
    @JoinColumn(name = "parent_group_id")
    private Group parentGroup;

    @OneToMany(mappedBy = "parentGroup")
    private List<Group> subGroups;

    private Status status;
}

public enum GroupType {
    PRINCIPAL,  // Groupe de promotion
    TD,         // Sous-groupe TD
    TP,         // Sous-groupe TP
    AUTRE       // Autre type
}
```

---

## Notes Techniques

- Nommage : `{NomParent} - {Type}{Numero}` (ex: "L2 Info - TD1")
- Effectif : Division entiere, reste au dernier groupe
- Limitation : Max 2 niveaux de sous-groupes (Principal → TD → TP)
- Cascade : Suppression du parent ne supprime pas les enfants (a gerer manuellement)
