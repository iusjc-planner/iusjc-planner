# BE-SCHED-002 - Export PDF/Excel des EDT

## Priorite
P1 - Haute

## Delai Estime
3 jours

## Dependances
- BE-EDT-001 (Entite EDT requise)

## Exigences Remplies
- **BF-060** : Exporter l'emploi du temps au format PDF et Excel
- **Diagramme UML** : Implicite dans la gestion des EDT

---

## Contexte (Audit)

Actuellement, des stubs d'export existent dans le schedule-service mais ne sont pas fonctionnels :

```java
// Stub actuel (non fonctionnel)
@GetMapping("/{id}/export")
public ResponseEntity<?> exportSchedule(@PathVariable Long id, @RequestParam String format) {
    // TODO: Implement export
    return ResponseEntity.status(501).body("Not implemented");
}
```

Les utilisateurs ont besoin d'exporter les emplois du temps pour :
- Affichage sur panneaux d'affichage
- Impression pour distribution
- Archivage administratif
- Integration dans documents officiels

**Etat actuel** : Endpoint existe mais retourne 501 Not Implemented
**Impact** : Eleve - Fonctionnalite indispensable pour l'etablissement

---

## Taches

### 1. Ajout des dependances
- [ ] Ajouter Apache POI 5.x pour Excel (.xlsx)
- [ ] Ajouter OpenPDF ou iText pour PDF
- [ ] Configurer le build Maven/Gradle

### 2. DTO pour export
- [ ] Creer `EDTExportData` contenant :
  - Informations de l'EDT (semaine, annee, groupe/enseignant)
  - Liste des seances formatees par jour/heure
  - Metadonnees (date generation, generateur)

### 3. Service d'export Excel
- [ ] Creer `ExcelExportService` avec :
  - `exportEDT(EDT edt)` - Exporte un EDT en Excel
  - Generer grille horaire (jours en colonnes, heures en lignes)
  - Colorer les cellules par type de cours (CM, TD, TP)
  - Ajouter en-tete avec informations (groupe, semaine, etc.)
  - Ajouter legende

### 4. Service d'export PDF
- [ ] Creer `PdfExportService` avec :
  - `exportEDT(EDT edt)` - Exporte un EDT en PDF
  - Utiliser template avec logo etablissement
  - Generer tableau horaire
  - Ajouter pied de page (date, page)
  - Format A4 paysage

### 5. Templates
- [ ] Creer template PDF avec :
  - En-tete : Logo IUSJ, titre "Emploi du Temps"
  - Sous-titre : Groupe/Enseignant, Semaine X, Annee
  - Grille horaire
  - Legende couleurs
  - Pied de page : Date generation, Contact

### 6. Controller
- [ ] Modifier `EDTController` ou `ScheduleController` :
  - `GET /api/edt/{id}/export?format=pdf` - Export PDF
  - `GET /api/edt/{id}/export?format=excel` - Export Excel
  - `GET /api/edt/groupe/{groupeId}/export?semaine=&annee=&format=` - Export direct
  - `GET /api/edt/enseignant/{teacherId}/export?...` - Export enseignant

### 7. Stockage et telechargement
- [ ] Generer fichier en memoire (ByteArrayOutputStream)
- [ ] Retourner avec headers appropriees :
  - Content-Type: application/pdf ou application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  - Content-Disposition: attachment; filename="EDT_L1Info_S12_2026.pdf"

---

## Flow (Cas d'Utilisation Frontend)

### Scenario 1 : Export PDF de l'EDT d'un groupe
1. L'utilisateur consulte l'EDT du groupe "L2 Informatique"
2. Il clique sur le bouton "Exporter"
3. Un menu propose : PDF, Excel
4. Il selectionne PDF
5. L'API `GET /api/edt/groupe/5/export?semaine=12&annee=2026&format=pdf` est appelee
6. Le navigateur telecharge le fichier "EDT_L2_Informatique_S12_2026.pdf"
7. Le fichier s'ouvre avec le viewer PDF

### Scenario 2 : Export Excel pour traitement
1. Le secretariat accede aux EDT
2. Il selectionne plusieurs groupes
3. Il clique sur "Exporter tout en Excel"
4. Un fichier Excel est genere avec un onglet par groupe
5. Le secretariat peut modifier/imprimer depuis Excel

### Scenario 3 : Impression pour affichage
1. L'administrateur genere le PDF de l'EDT
2. Il ouvre le PDF
3. Le format est optimise pour impression A4 paysage
4. Il imprime pour affichage sur panneau

---

## Resultat Obtenu

Apres implementation :
- Export PDF fonctionnel avec mise en forme professionnelle
- Export Excel fonctionnel avec grille modifiable
- Fichiers nommes de maniere explicite
- Format optimise pour impression
- Logo et branding de l'etablissement

---

## Criteres d'Acceptation

- [ ] L'export PDF genere un fichier valide et lisible
- [ ] L'export Excel genere un fichier .xlsx valide
- [ ] La grille horaire est correctement formatee
- [ ] Les couleurs distinguent les types de cours
- [ ] Le logo de l'etablissement est present (PDF)
- [ ] Le nom de fichier est explicite (groupe, semaine, annee)
- [ ] Le telechargement fonctionne dans le navigateur
- [ ] Performance acceptable (<5s pour generation)

---

## Fichiers Impactes

### Nouveaux fichiers a creer
```
iusj-schedule-service/src/main/java/com/example/iusj_schedule_service/
├── dto/
│   └── EDTExportData.java
├── services/export/
│   ├── ExcelExportService.java
│   └── PdfExportService.java
└── resources/
    └── templates/
        └── edt-template.pdf (si template externe)
```

### Fichiers existants a modifier
```
iusj-schedule-service/pom.xml
  → Ajouter dependances POI et OpenPDF

iusj-schedule-service/src/main/java/.../controller/ScheduleController.java
  → Implementer endpoint /export
```

### Dependances a ajouter (pom.xml)
```xml
<!-- Apache POI pour Excel -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.5</version>
</dependency>

<!-- OpenPDF pour PDF -->
<dependency>
    <groupId>com.github.librepdf</groupId>
    <artifactId>openpdf</artifactId>
    <version>1.3.30</version>
</dependency>
```

---

## Structure du Fichier Excel

```
+---+--------+----------+----------+----------+----------+----------+
|   |  Lundi | Mardi    | Mercredi | Jeudi    | Vendredi | Samedi   |
+---+--------+----------+----------+----------+----------+----------+
|8h | Math   |          | Physique |          | Info     |          |
|   | CM     |          | TD       |          | TP       |          |
|   | A101   |          | B202     |          | Labo1    |          |
+---+--------+----------+----------+----------+----------+----------+
|10h|        | Anglais  |          | Math     |          |          |
|   |        | TD       |          | CM       |          |          |
|   |        | C303     |          | A101     |          |          |
+---+--------+----------+----------+----------+----------+----------+
|14h| Info   |          |          | Physique |          |          |
|   | CM     |          |          | TP       |          |          |
|   | Amphi  |          |          | Labo2    |          |          |
+---+--------+----------+----------+----------+----------+----------+
|16h|        | Projet   |          |          | Sport    |          |
|   |        | TP       |          |          | TD       |          |
|   |        | Labo1    |          |          | Gym      |          |
+---+--------+----------+----------+----------+----------+----------+

Legende: CM=bleu, TD=vert, TP=orange, Exam=rouge
```

---

## Notes Techniques

- Couleurs :
  - CM : Bleu (#4472C4)
  - TD : Vert (#70AD47)
  - TP : Orange (#ED7D31)
  - EXAM : Rouge (#FF0000)
- Police : Arial ou Liberation Sans (compatible)
- Taille : 10pt pour le contenu, 14pt pour les titres
- Orientation PDF : Paysage pour meilleure lisibilite
- Logo : PNG 200x80px environ, place en haut a gauche
