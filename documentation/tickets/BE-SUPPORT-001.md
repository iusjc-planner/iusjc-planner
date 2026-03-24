# BE-SUPPORT-001 - Entite Support Separee

## Priorite
P0 - Critique

## Delai Estime
2 jours

## Dependances
Aucune

## Exigences Remplies
- **Diagramme UML** : Classe Support avec attributs id_support, titre et methodes Ajouter(), Modifier(), Supprimer()
- **Relation UML** : Support "1.." -- "1" Matiere : avoir

---

## Contexte (Audit)

Actuellement, les supports de cours sont stockes comme une simple liste d'URLs (List<String>) dans l'entite Matiere :

```java
// Implementation actuelle dans Matiere.java
@ElementCollection
@CollectionTable(name = "matiere_supports", joinColumns = @JoinColumn(name = "matiere_id"))
@Column(name = "support_url")
private List<String> supports = new ArrayList<>();
```

Cette implementation ne permet pas :
- De donner un titre aux supports
- De specifier le type de support (PDF, video, lien)
- De connaitre la taille du fichier
- De gerer les metadonnees (date ajout, auteur)

**Etat actuel** : Supports stockes comme URLs sans metadata
**Impact** : Moyen - Fonctionnel mais non conforme au diagramme UML

---

## Taches

### 1. Creation de l'entite Support
- [ ] Creer l'entite `Support.java` dans course-service avec les attributs :
  - `id` (Long, auto-genere)
  - `titre` (String, obligatoire, max 200 caracteres)
  - `type` (Enum: PDF, VIDEO, LIEN, DOCUMENT, IMAGE, AUTRE)
  - `url` (String, URL ou chemin du fichier)
  - `taille` (Long, taille en octets, optionnel)
  - `matiereId` (Long, FK vers Matiere)
  - `uploadePar` (Long, userId de l'enseignant)
  - `dateAjout` (LocalDateTime)
  - `description` (String, optionnel)
- [ ] Ajouter les annotations JPA et validations

### 2. Migration de l'entite Matiere
- [ ] Supprimer le champ `List<String> supports` de Matiere
- [ ] Ajouter la relation `@OneToMany` vers Support (optionnel, pour acces bidirectionnel)
- [ ] Creer script de migration pour les donnees existantes

### 3. Repository Support
- [ ] Creer `SupportRepository` extends JpaRepository
- [ ] Ajouter methodes :
  - `findByMatiereId(Long matiereId)`
  - `findByMatiereIdAndType(Long matiereId, SupportType type)`
  - `countByMatiereId(Long matiereId)`
  - `deleteByMatiereId(Long matiereId)`

### 4. Service Support
- [ ] Creer `SupportService` avec methodes :
  - `getByMatiereId(Long matiereId)` - Liste les supports d'une matiere
  - `getById(Long id)` - Recupere un support
  - `create(Support support)` - Ajoute un support
  - `update(Long id, Support support)` - Modifie un support
  - `delete(Long id)` - Supprime un support
  - `deleteByMatiereId(Long matiereId)` - Supprime tous les supports d'une matiere

### 5. Controller Support
- [ ] Creer `SupportController` avec endpoints :
  - `GET /api/matieres/{matiereId}/supports` - Liste les supports
  - `GET /api/supports/{id}` - Detail d'un support
  - `POST /api/matieres/{matiereId}/supports` - Ajoute un support
  - `PUT /api/supports/{id}` - Modifie un support
  - `DELETE /api/supports/{id}` - Supprime un support
  - `GET /api/supports/types` - Liste les types disponibles

### 6. Migration des donnees existantes
- [ ] Creer script SQL de migration :
  - Lire les URLs existantes dans matiere_supports
  - Creer des entrees dans la nouvelle table supports
  - Generer des titres par defaut (nom du fichier ou "Support X")
  - Detecter le type par extension (.pdf, .mp4, etc.)
- [ ] Tester la migration sur donnees de test
- [ ] Supprimer l'ancienne table matiere_supports

### 7. Upload de fichiers (optionnel)
- [ ] Ajouter endpoint `POST /api/supports/upload`
- [ ] Configurer stockage local ou cloud
- [ ] Generer URL apres upload

---

## Flow (Cas d'Utilisation Frontend)

### Scenario 1 : Ajout d'un support de cours
1. L'enseignant accede a la page de sa matiere
2. Il clique sur l'onglet "Supports"
3. Il clique sur "Ajouter un support"
4. Il remplit le formulaire :
   - Titre : "Chapitre 1 - Introduction"
   - Type : PDF
   - URL ou upload du fichier
   - Description (optionnel)
5. Il clique sur "Enregistrer"
6. L'API `POST /api/matieres/{id}/supports` est appelee
7. Le support apparait dans la liste

### Scenario 2 : Consultation des supports par les etudiants
1. L'etudiant accede a une matiere
2. Il voit la liste des supports avec :
   - Icone selon le type (PDF, video, etc.)
   - Titre du support
   - Taille (si fichier)
3. Il clique sur un support
4. Le fichier s'ouvre ou se telecharge

### Scenario 3 : Modification d'un support
1. L'enseignant consulte ses supports
2. Il clique sur "Modifier" pour un support
3. Il peut changer le titre, la description, le type
4. Il peut remplacer le fichier/URL
5. L'API `PUT /api/supports/{id}` est appelee

---

## Resultat Obtenu

Apres implementation :
- Les supports sont des entites a part entiere avec metadonnees
- Chaque support a un titre, un type et une URL
- Les supports sont lies aux matieres par relation ManyToOne
- Les enseignants peuvent gerer leurs supports
- Migration des donnees existantes effectuee
- Conformite avec le diagramme UML

---

## Criteres d'Acceptation

- [ ] L'entite Support est creee avec tous les attributs requis
- [ ] Les endpoints CRUD fonctionnent correctement
- [ ] Les supports sont filtres par matiere
- [ ] La migration des donnees existantes fonctionne
- [ ] Les types de supports sont corrects (PDF, VIDEO, etc.)
- [ ] Seul l'enseignant de la matiere peut ajouter/modifier/supprimer
- [ ] Les tests Postman passent

---

## Fichiers Impactes

### Nouveaux fichiers a creer
```
iusj-course-service/src/main/java/com/example/iusj_course_service/
├── entities/
│   └── Support.java
├── repositories/
│   └── SupportRepository.java
├── services/
│   └── SupportService.java
└── controller/
    └── SupportController.java
```

### Fichiers existants a modifier
```
iusj-course-service/src/main/java/com/example/iusj_course_service/entities/Matiere.java
  → Supprimer List<String> supports
  → Ajouter @OneToMany(mappedBy = "matiere") List<Support> supports (optionnel)
```

---

## Script de Migration

```sql
-- 1. Creer la nouvelle table
CREATE TABLE supports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,
    url VARCHAR(500) NOT NULL,
    taille BIGINT,
    matiere_id BIGINT NOT NULL,
    uploade_par BIGINT,
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    FOREIGN KEY (matiere_id) REFERENCES matieres(id)
);

-- 2. Migrer les donnees existantes
INSERT INTO supports (titre, type, url, matiere_id, date_ajout)
SELECT
    CONCAT('Support ', ROW_NUMBER() OVER (PARTITION BY matiere_id ORDER BY support_url)),
    CASE
        WHEN support_url LIKE '%.pdf' THEN 'PDF'
        WHEN support_url LIKE '%.mp4' OR support_url LIKE '%.avi' THEN 'VIDEO'
        WHEN support_url LIKE '%.doc%' THEN 'DOCUMENT'
        ELSE 'LIEN'
    END,
    support_url,
    matiere_id,
    NOW()
FROM matiere_supports;

-- 3. Supprimer l'ancienne table (apres verification)
DROP TABLE matiere_supports;
```

---

## Notes Techniques

- Types de supports : PDF, VIDEO, LIEN, DOCUMENT, IMAGE, AUTRE
- Validation URL : Verifier que l'URL est valide
- Stockage : Pour l'instant URLs uniquement, upload fichiers en v2
- Cascade : Supprimer les supports si la matiere est supprimee
- Securite : Seul l'enseignant assignee peut modifier les supports
