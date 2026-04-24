# Implementation Plan

- [x] 1. Page Admin Enseignants (Frontend)




- [x] 1.1 Créer le composant `EnseignantsPage` dans `web/src/app/pages/admin/enseignants.ts`


  - Tableau PrimeNG paginé avec colonnes : nom, prénom, email, spécialités, statut
  - Résolution du nom/prénom via `userId` → `UserService.getAll()`
  - Recherche par nom/spécialité
  - Boutons Ajouter, Modifier, Supprimer
  - Dialog création/modification avec sélecteur d'utilisateur (p-select) et champ spécialités (ajout dynamique)
  - Confirmation de suppression via dialog
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 1.2 Ajouter la route et le lien menu pour la page Enseignants


  - Ajouter `{ path: 'admin/enseignants', component: EnseignantsPage, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } }` dans `pages.routes.ts`
  - Ajouter `{ label: 'Enseignants', icon: 'pi pi-fw pi-graduation-cap', routerLink: ['/pages/admin/enseignants'] }` dans `app.menu.ts` sous "Gestion"
  - _Requirements: 1.7_

- [x] 2. Resource Service Backend





- [x] 2.1 Créer la structure du Resource Service (entité, repository, sécurité)


  - Créer `entities/Resource.java` avec champs : id, nom, type (enum), quantite, localisation, statut (enum), createdAt, updatedAt
  - Créer `repositories/ResourceRepository.java` avec méthodes `countByStatut`
  - Créer `security/HeaderAuthenticationFilter.java` (copie du pattern event-service)
  - Créer `config/SecurityConfig.java` (copie du pattern event-service)
  - Créer `src/main/resources/application.properties` avec port 8094
  - _Requirements: 2.2, 2.3, 2.4_

- [x] 2.2 Créer le service et le controller REST du Resource Service


  - Créer `services/ResourceService.java` avec méthodes : getAll, getById, create, update, delete, getStats
  - Créer `controller/ResourceController.java` avec endpoints CRUD + `/stats`
  - Validation : nom non vide, quantite >= 1
  - Gestion des erreurs : 404 pour ressource introuvable, 400 pour validation
  - _Requirements: 2.1, 2.3, 2.5_

- [x] 2.3 Configurer le routage Gateway pour le Resource Service


  - Ajouter la route `/api/resources/**` → `lb://iusj-resource-service` dans la configuration du gateway
  - _Requirements: 2.4_

- [x] 3. Page Ressources Frontend (refactoring)





- [x] 3.1 Créer le modèle et le service Angular pour les ressources


  - Créer `web/src/app/core/models/resource.model.ts` avec interface `Resource`
  - Créer `web/src/app/core/services/resource.service.ts` avec méthodes CRUD
  - Ajouter `resources: '/api/resources'` dans `ApiEndpoints`
  - _Requirements: 3.6_

- [x] 3.2 Refactoriser la page `ressources.ts` pour utiliser le vrai Resource Service


  - Remplacer `RoomService` par `ResourceService`
  - Ajouter dialog de création avec champs : nom, type (dropdown), quantite, localisation
  - Ajouter dialog de modification (pré-remplissage)
  - Ajouter confirmation de suppression
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Report Service Backend




- [x] 4.1 Créer la structure du Report Service (entité, repository, sécurité)

  - Créer `entities/ReportMetadata.java` avec champs : id (UUID String), type, format, generatedAt, filePath, status (enum)
  - Créer `repositories/ReportMetadataRepository.java`
  - Créer `security/HeaderAuthenticationFilter.java` et `config/SecurityConfig.java`
  - Créer `src/main/resources/application.properties` avec port 8095
  - _Requirements: 4.1, 4.3_

- [x] 4.2 Créer les générateurs de rapports PDF et Excel

  - Créer `services/ReportDataCollector.java` qui appelle `/api/rooms` et `/api/teachers` via RestTemplate avec URL Eureka
  - Créer `services/PdfReportGenerator.java` utilisant OpenPDF (déjà dans pom.xml) pour générer des tableaux simples
  - Créer `services/ExcelReportGenerator.java` utilisant Apache POI (déjà dans pom.xml)
  - Stocker les fichiers dans le dossier `reports-storage/`
  - _Requirements: 4.4, 4.5_

- [x] 4.3 Créer le service et le controller REST du Report Service

  - Créer `services/ReportService.java` orchestrant la génération et le stockage
  - Créer `controller/ReportController.java` avec endpoints : `POST /generate`, `GET /`, `GET /{id}/download`
  - Retourner HTTP 400 pour type inconnu
  - Retourner le fichier en stream binaire avec Content-Type approprié pour le download
  - _Requirements: 4.1, 4.2, 4.3, 4.7_

- [x] 4.4 Configurer le routage Gateway pour le Report Service

  - Ajouter la route `/api/reports/**` → `lb://iusj-report-service` dans la configuration du gateway
  - _Requirements: 4.6_

- [x] 5. Dashboard Dynamique Frontend





- [x] 5.1 Corriger et enrichir `AdminStatsWidget`


  - Corriger le mapping du statut actif des enseignants (`'ACTIVE'` au lieu de `'actif'`)
  - Ajouter fetch `GET /api/groups` pour afficher le nombre de groupes d'étudiants
  - Ajouter fetch `GET /api/events` pour afficher le nombre d'événements à venir
  - _Requirements: 5.1, 5.2, 5.5_

- [x] 5.2 Rendre `RecentActivitiesWidget` dynamique


  - Injecter `ScheduleService`, `CourseService`, `TeacherService`, `GroupService`
  - Charger les 5 dernières entrées de `GET /api/schedule` et résoudre les labels
  - Gérer les erreurs avec `catchError(() => of([]))` pour ne pas crasher le dashboard
  - _Requirements: 5.3, 5.4_
