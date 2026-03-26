# BE-REPORT-001 - Service Rapport avec Export

## Priorite
P0 - Critique

## Delai Estime
5 jours

## Dependances
- BE-EVENT-001 (pour rapport evenements)
- Acces aux autres services (room, teacher, schedule, school)

## Exigences Remplies
- **BF-075** : Generer un rapport d'utilisation des salles
- **BF-076** : Generer un rapport de charge horaire des enseignants
- **BF-077** : Generer des statistiques par ecole/filiere
- **BF-078** : Generer un rapport des evenements
- **BF-079** : Exporter les rapports en PDF et Excel
- **BF-080** : Visualiser les graphiques recapitulatifs
- **Diagramme UML** : Classe Rapport avec methodes Generer(), Supprimer(), Exporter()

---

## Contexte (Audit)

Actuellement, aucune fonctionnalite de reporting n'existe dans le backend. Les administrateurs ne peuvent pas :
- Generer des rapports d'utilisation des ressources
- Exporter des donnees au format PDF ou Excel
- Visualiser des statistiques globales
- Analyser la charge de travail des enseignants

Cette fonctionnalite est critique pour le pilotage de l'etablissement et la prise de decision.

**Etat actuel** : Service inexistant
**Impact** : Eleve - Impossible de produire des rapports pour la direction

---

## Taches

### 1. Creation du microservice
- [ ] Creer le projet `iusj-report-service` (Spring Boot)
- [ ] Configurer le port 8091
- [ ] Configurer Eureka Client
- [ ] Configurer la base de donnees MySQL (table `reports`)
- [ ] Ajouter les dependances :
  - Apache POI (Excel)
  - iText ou OpenPDF (PDF)
  - RestTemplate (appels inter-services)
- [ ] Ajouter la route dans le Gateway

### 2. Entite Rapport
- [ ] Creer l'entite `Rapport.java` avec les attributs :
  - `id` (Long, auto-genere)
  - `titre` (String)
  - `type` (Enum: OCCUPATION_SALLE, CHARGE_ENSEIGNANT, STATISTIQUES_ECOLE, EVENEMENTS, GLOBAL)
  - `dateGeneration` (LocalDateTime)
  - `periodeDebut` (LocalDate)
  - `periodeFin` (LocalDate)
  - `generePar` (Long, userId)
  - `format` (Enum: PDF, EXCEL, JSON)
  - `cheminFichier` (String, path vers fichier genere)
  - `parametres` (String, JSON des parametres utilises)
  - `status` (Enum: EN_COURS, TERMINE, ERREUR)
- [ ] Ajouter les annotations JPA et validations

### 3. Repository
- [ ] Creer `RapportRepository` extends JpaRepository
- [ ] Ajouter methodes :
  - `findByType(ReportType type)`
  - `findByGenerePar(Long userId)`
  - `findByDateGenerationBetween(LocalDateTime start, LocalDateTime end)`

### 4. Service - Generation de donnees
- [ ] Creer `RapportService` avec methodes :
  - `generateOccupationSalleReport(LocalDate from, LocalDate to, Long salleId)`
  - `generateChargeEnseignantReport(LocalDate from, LocalDate to, Long teacherId)`
  - `generateStatistiquesEcoleReport(Long schoolId)`
  - `generateEvenementsReport(LocalDate from, LocalDate to)`
  - `generateGlobalReport(LocalDate from, LocalDate to)`
- [ ] Creer `DataAggregationService` pour collecter donnees depuis autres services

### 5. Service - Export
- [ ] Creer `ExportService` avec methodes :
  - `exportToPdf(RapportData data, String template)` - Genere PDF
  - `exportToExcel(RapportData data)` - Genere Excel
  - `exportToJson(RapportData data)` - Genere JSON
- [ ] Creer templates PDF (iText/OpenPDF)
- [ ] Creer templates Excel (Apache POI)

### 6. Controller
- [ ] Creer `RapportController` avec endpoints :
  - `GET /api/reports` - Liste des rapports generes
  - `GET /api/reports/{id}` - Detail d'un rapport
  - `POST /api/reports/generate` - Lance generation (body: type, periode, params)
  - `GET /api/reports/{id}/download` - Telecharge le fichier
  - `DELETE /api/reports/{id}` - Supprime rapport et fichier
  - **Endpoints specifiques :**
  - `GET /api/reports/occupation-salle` - Rapport occupation salles
  - `GET /api/reports/charge-enseignant` - Rapport charge enseignants
  - `GET /api/reports/statistiques-ecole/{schoolId}` - Stats ecole
  - `GET /api/reports/evenements` - Rapport evenements

### 7. Integration inter-services
- [ ] Creer clients REST pour :
  - room-service (donnees salles, reservations)
  - teacher-service (donnees enseignants)
  - schedule-service (donnees EDT)
  - school-service (donnees ecoles)
  - event-service (donnees evenements)

### 8. Stockage fichiers
- [ ] Configurer le stockage des fichiers generes
- [ ] Implementer la gestion du cycle de vie (suppression auto apres X jours)

### 9. Configuration securite
- [ ] Admin seulement peut generer et telecharger des rapports

---

## Flow (Cas d'Utilisation Frontend)

### Scenario 1 : Generation rapport occupation salles
1. L'administrateur accede a la page "Rapports"
2. Il selectionne "Occupation des salles"
3. Il definit la periode (ex: mois de Mars)
4. Il peut filtrer par salle specifique (optionnel)
5. Il clique sur "Generer"
6. L'API `POST /api/reports/generate` est appelee
7. Un loader indique la generation en cours
8. Le rapport apparait dans la liste avec status "TERMINE"
9. L'utilisateur clique sur "Telecharger PDF" ou "Telecharger Excel"

### Scenario 2 : Consultation statistiques ecole
1. L'administrateur accede au tableau de bord
2. Il selectionne une ecole/faculte
3. Il clique sur "Voir statistiques"
4. L'API `GET /api/reports/statistiques-ecole/{id}` est appelee
5. Les statistiques sont affichees :
   - Nombre de filieres
   - Nombre de groupes
   - Nombre d'enseignants
   - Taux d'occupation des salles
   - Graphiques

### Scenario 3 : Rapport charge enseignant
1. L'administrateur genere un rapport de charge
2. Le rapport affiche pour chaque enseignant :
   - Nombre d'heures de cours par semaine
   - Repartition CM/TD/TP
   - Taux d'occupation
3. L'administrateur exporte en Excel pour analyse

---

## Resultat Obtenu

Apres implementation :
- Le microservice `iusj-report-service` est operationnel sur le port 8091
- Generation de rapports PDF et Excel fonctionnelle
- 5 types de rapports disponibles
- Historique des rapports generes
- Telechargement des fichiers
- Statistiques visualisables

---

## Criteres d'Acceptation

- [ ] Le service demarre et s'enregistre aupres d'Eureka
- [ ] La generation de chaque type de rapport fonctionne
- [ ] Les fichiers PDF sont lisibles et bien formates
- [ ] Les fichiers Excel sont valides et ouvrent dans Excel/LibreOffice
- [ ] Le telechargement des fichiers fonctionne
- [ ] Les appels inter-services fonctionnent
- [ ] Les rapports sont stockes et listables
- [ ] Seuls les admins peuvent acceder aux rapports

---

## Fichiers Impactes

### Nouveaux fichiers a creer
```
iusj-report-service/
├── pom.xml
├── src/main/java/com/example/iusj_report_service/
│   ├── IusjReportServiceApplication.java
│   ├── entities/
│   │   └── Rapport.java
│   ├── dto/
│   │   ├── RapportRequest.java
│   │   └── RapportData.java
│   ├── repositories/
│   │   └── RapportRepository.java
│   ├── services/
│   │   ├── RapportService.java
│   │   ├── ExportService.java
│   │   └── DataAggregationService.java
│   ├── controller/
│   │   └── RapportController.java
│   ├── client/
│   │   ├── RoomServiceClient.java
│   │   ├── TeacherServiceClient.java
│   │   ├── ScheduleServiceClient.java
│   │   └── SchoolServiceClient.java
│   └── config/
│       ├── SecurityConfig.java
│       └── StorageConfig.java
└── src/main/resources/
    ├── application.yml
    └── templates/
        └── rapport-template.pdf (si templates)
```

### Fichiers existants a modifier
```
iusj-gateway-service/src/main/resources/application.yml
  → Ajouter route pour report-service
```

---

## Notes Techniques

- Apache POI : Version 5.x pour Excel (.xlsx)
- iText/OpenPDF : Pour generation PDF
- Stockage : Dossier local ou cloud storage (configurable)
- Performance : Generation asynchrone pour gros rapports
- Cache : Mettre en cache les donnees frequemment utilisees
- Templates : Utiliser des templates pour uniformiser les rapports
