# Besoins Frontend - Système de Gestion des Emplois du Temps et Réservations de Salles

## 1. Vue d'ensemble du projet

**Contexte** : Développement d'une application web pour la gestion automatisée des salles et des emplois du temps à l'Institut Universitaire Saint Jean du Cameroun (IUSJC).

**Objectif** : Optimiser la réservation des infrastructures et faciliter la planification des cours pour les enseignants à travers un système centralisé et intuitif.

**Stack technique frontend** :
- Framework : Angular 20.1.4 (déjà en place)
- UI Components : PrimeNG
- Thèmes disponibles : Aura, Lara, Nora
- Architecture : SPA (Single Page Application) avec Angular
- Responsive design requis

---

## 2. Utilisateurs et rôles

### 2.1 Catégories d'utilisateurs
1. **Administrateurs** : Gestion globale du système, configuration, rapports, gestion des enseignants et étudiants
2. **Enseignants** : Consultation et gestion de leurs emplois du temps, consultation des salles et ressources

### 2.2 Besoins d'authentification
- Authentification sécurisée avec gestion des rôles
- Interface de connexion intuitive
- Gestion des sessions utilisateur
- Tableaux de bord personnalisés par rôle
- Création d'enseignants par l'administrateur (génération de credentials)

---

## 3. Interfaces et fonctionnalités frontend

### 3.1 Module d'authentification et autorisation

**Écrans requis** :
- Page de connexion (login)
- Gestion des profils utilisateur
- Paramètres de compte

**Fonctionnalités** :
- Validation des identifiants
- Gestion des tokens d'authentification
- Redirection selon le rôle utilisateur
- Déconnexion sécurisée
- Récupération de mot de passe (optionnel)

---

### 3.2 Tableau de bord (Dashboard)

**Vue générale** :
- Widgets statistiques (nombre de cours, salles occupées, taux d'utilisation)
- Accès rapide aux fonctionnalités principales
- Affichage des notifications récentes
- Calendrier mini intégré

**Éléments visuels** :
- Cartes de statistiques avec graphiques
- Indicateurs de performance (KPIs)
- Alertes et notifications en temps réel
- Raccourcis vers les modules principaux

---

### 3.3 Gestion des emplois du temps

#### 3.3.1 Vue calendrier
- **Affichage hebdomadaire** : Calendrier interactif par semaine
- **Affichage mensuel** : Vue globale du mois
- **Filtrage** : Par enseignant, école, salle, type de cours
- **Synchronisation** : Intégration Google Calendar, Outlook
- **Interactions** :
  - Clic sur un créneau pour voir les détails
  - Drag & drop pour modifier les horaires (si autorisé)
  - Zoom sur les créneaux horaires

#### 3.3.2 Gestion des cours
- **Création de cours** :
  - Formulaire avec champs : nom, code, enseignant, école, groupe d'étudiants
  - Sélection du type (CM, TD, TP)
  - Choix de la récurrence (unique, hebdomadaire, etc.)
  - Assignation automatique de salle

- **Édition de cours** :
  - Modification des paramètres
  - Changement d'horaire avec détection de conflits
  - Notification automatique des changements

- **Suppression de cours** :
  - Confirmation avec avertissement
  - Notification aux utilisateurs concernés

#### 3.3.3 Gestion des disponibilités enseignants
- **Profil enseignant** :
  - Liste des écoles d'affectation
  - Disponibilités par jour/semaine
  - Préférences horaires
  - Historique des cours

- **Visualisation des conflits** :
  - Alertes visuelles en cas de chevauchement
  - Suggestions de résolution
  - Historique des modifications

---

### 3.4 Réservation et gestion des salles

#### 3.4.1 Catalogue des salles
- **Liste des salles** :
  - Filtrage par type (amphithéâtre, salle de cours, laboratoire, TD)
  - Filtrage par capacité
  - Filtrage par équipements disponibles
  - Recherche par localisation

- **Fiche salle** :
  - Capacité, localisation, équipements
  - Calendrier de disponibilité
  - Historique d'utilisation
  - État de maintenance

#### 3.4.2 Réservation de salles
- **Formulaire de réservation** :
  - Sélection de la date et horaire
  - Choix de la salle (avec suggestions automatiques)
  - Spécification du type de cours
  - Nombre d'étudiants attendus
  - Équipements requis

- **Vérification en temps réel** :
  - Disponibilité instantanée
  - Détection de conflits
  - Suggestions d'alternatives

- **Confirmation et notifications** :
  - Confirmation visuelle de la réservation
  - Email de confirmation
  - Notification dans l'application

---

### 3.5 Gestion des ressources matériques

#### 3.5.1 Inventaire des équipements
- **Liste des ressources** :
  - Projecteurs, ordinateurs, baffles, tableaux interactifs, etc.
  - État (disponible, en maintenance, défaillant)
  - Localisation
  - Historique d'utilisation

#### 3.5.2 Réservation de ressources
- **Formulaire de réservation** :
  - Sélection des équipements
  - Période de réservation
  - Salle de destination
  - Notes spéciales

- **Suivi** :
  - État des réservations
  - Historique d'utilisation
  - Alertes de maintenance

---

### 3.6 Gestion des groupes d'étudiants et cours

#### 3.6.1 Gestion des groupes (Admin)
- **Création de groupes** :
  - Nom du groupe, filière, niveau d'études
  - Nombre d'étudiants
  - Enseignants responsables

- **Assignation de cours** :
  - Sélection des cours pour le groupe
  - Visualisation de l'emploi du temps du groupe
  - Gestion des changements

- **Gestion des étudiants** :
  - Ajout/suppression d'étudiants dans les groupes
  - Import en masse (CSV)
  - Consultation de la liste des étudiants par groupe

#### 3.6.2 Gestion des cours
- **Création de cours** :
  - Informations générales (code, nom, description)
  - Enseignant responsable
  - Groupes d'étudiants concernés
  - Type de cours (CM, TD, TP)
  - Récurrence

- **Édition et suppression** :
  - Modification des paramètres
  - Gestion des instances récurrentes
  - Notifications des changements

---

### 3.5bis Gestion des enseignants (Admin)

#### 3.5bis.1 Liste des enseignants
- **Affichage** :
  - Tableau avec tous les enseignants
  - Filtrage par école, statut, disponibilité
  - Recherche par nom/email
  - Tri par colonne

- **Actions** :
  - Création d'un nouvel enseignant
  - Modification des informations
  - Suppression d'un enseignant
  - Activation/désactivation de compte

#### 3.5bis.2 Création d'enseignant
- **Formulaire de création** :
  - Nom, prénom, email
  - Écoles d'affectation (multi-sélection)
  - Spécialité/discipline
  - Disponibilités (jours/heures)
  - Génération automatique de credentials (username/password temporaire)

- **Notifications** :
  - Email d'invitation avec credentials
  - Lien pour première connexion
  - Obligation de changer le mot de passe

#### 3.5bis.3 Modification d'enseignant
- **Édition des informations** :
  - Modification des données personnelles
  - Mise à jour des écoles d'affectation
  - Ajustement des disponibilités
  - Réinitialisation de mot de passe

#### 3.5bis.4 Profil enseignant (Admin view)
- **Informations** :
  - Données personnelles
  - Écoles d'affectation
  - Disponibilités
  - Historique des cours
  - Conflits d'horaires détectés

---

### 3.7 Notifications et rappels

#### 3.7.1 Système de notifications
- **Types de notifications** :
  - Changements d'emploi du temps
  - Modifications de réservation de salle
  - Rappels de cours (24h, 1h avant)
  - Alertes de conflit d'horaire
  - Notifications de maintenance

- **Canaux de notification** :
  - Notifications in-app (badge, popup)
  - Email
  - SMS (si intégration disponible)

#### 3.7.2 Centre de notifications
- **Historique** :
  - Liste des notifications reçues
  - Filtrage par type
  - Marquage comme lu/non lu
  - Suppression

- **Préférences** :
  - Configuration des types de notifications
  - Choix des canaux (email, SMS, app)
  - Horaires de notification

---

### 3.8 Tableaux de bord et rapports

#### 3.8.1 Tableaux de bord administrateur
- **Vue globale** :
  - Taux d'occupation des salles
  - Nombre de cours planifiés
  - Conflits d'horaires détectés
  - Utilisation des ressources
  - Nombre d'enseignants actifs
  - Nombre de groupes d'étudiants

- **Graphiques et statistiques** :
  - Histogrammes d'utilisation par salle
  - Courbes de tendance
  - Répartition par école/enseignant
  - Heatmaps de disponibilité
  - Statistiques d'utilisation des ressources

#### 3.8.2 Rapports générés
- **Types de rapports** :
  - Utilisation des salles (taux d'occupation, disponibilité)
  - Répartition des cours par école/enseignant
  - Statistiques d'utilisation des ressources
  - Rapports de conflits résolus
  - Activité des enseignants

- **Fonctionnalités** :
  - Génération à la demande
  - Planification de rapports automatiques
  - Export en PDF, Excel, CSV
  - Filtrage par période, école, salle

#### 3.8.3 Tableaux de bord enseignant
- **Emploi du temps personnel** :
  - Vue hebdomadaire/mensuelle
  - Détails des cours (salle, groupe, horaire)
  - Ressources réservées
  - Notifications de changements

- **Statistiques personnelles** :
  - Nombre de cours par semaine
  - Écoles d'affectation
  - Disponibilités
  - Historique des modifications

---

### 3.9 Gestion des événements académiques

#### 3.9.1 Événements exceptionnels
- **Création d'événements** :
  - Séminaires, conférences, compétitions
  - Réservation de salles spécifiques
  - Gestion des participants
  - Ressources requises

- **Calendrier des événements** :
  - Affichage distinct des événements
  - Détails et participants
  - Notifications

#### 3.9.2 Gestion des examens
- **Planification des examens** :
  - Création de sessions d'examen
  - Assignation des salles
  - Répartition des étudiants
  - Gestion des surveillants

- **Calendrier des examens** :
  - Vue dédiée aux périodes d'examen
  - Détails des sessions
  - Notifications aux étudiants et enseignants

---

### 3.10 Intégration ENT

#### 3.10.1 Synchronisation avec l'ENT
- **Consultation des emplois du temps** :
  - Accès direct depuis l'ENT pour les étudiants
  - Affichage semaine après semaine
  - Synchronisation en temps réel

- **Authentification unique** :
  - SSO (Single Sign-On) avec l'ENT (optionnel)
  - Récupération des données utilisateur
  - Gestion des rôles centralisée

---

### 3.11 Calendrier intégré

#### 3.11.1 Fonctionnalités du calendrier
- **Affichage** :
  - Vue hebdomadaire (par défaut)
  - Vue mensuelle
  - Vue journalière
  - Vue par salle/enseignant

- **Interactions** :
  - Clic pour voir les détails
  - Drag & drop pour modifier (si autorisé)
  - Zoom sur les créneaux
  - Filtrage des affichages

#### 3.11.2 Synchronisation externe
- **Intégration** :
  - Google Calendar
  - Microsoft Outlook
  - Calendriers iCal
  - Export/Import de fichiers

---

## 4. Matrice des rôles et permissions

### 4.1 Administrateur
| Fonctionnalité | Permission |
|---|---|
| Gestion des enseignants (CRUD) | ✅ Complète |
| Gestion des groupes d'étudiants (CRUD) | ✅ Complète |
| Gestion des salles (CRUD) | ✅ Complète |
| Gestion des ressources (CRUD) | ✅ Complète |
| Gestion des cours (CRUD) | ✅ Complète |
| Gestion des événements académiques | ✅ Complète |
| Consultation des rapports | ✅ Complète |
| Consultation des emplois du temps | ✅ Lecture seule |
| Modification des emplois du temps | ✅ En cas de conflit |
| Gestion des notifications | ✅ Envoi manuel |

### 4.2 Enseignant
| Fonctionnalité | Permission |
|---|---|
| Consultation de son emploi du temps | ✅ Lecture seule |
| Modification de ses disponibilités | ✅ Oui |
| Consultation des salles assignées | ✅ Lecture seule |
| Consultation des ressources | ✅ Lecture seule |
| Consultation des groupes d'étudiants | ✅ Lecture seule |
| Gestion des enseignants | ❌ Non |
| Gestion des groupes d'étudiants | ❌ Non |
| Consultation des rapports | ❌ Non |
| Modification de son profil | ✅ Oui |

---

## 5. Composants UI/UX requis

### 5.1 Composants PrimeNG à utiliser
- **Calendrier** : p-calendar, p-schedule
- **Tableaux** : p-table, p-dataTable
- **Formulaires** : p-inputText, p-dropdown, p-multiSelect, p-checkbox
- **Notifications** : p-toast, p-message, p-dialog
- **Navigation** : p-menu, p-menubar, p-sidebar
- **Graphiques** : p-chart
- **Autres** : p-button, p-card, p-panel, p-accordion, p-tabs

### 5.2 Principes de design
- **Responsive** : Mobile-first, adaptation à tous les écrans
- **Accessibilité** : WCAG 2.1 AA minimum
- **Ergonomie** : Navigation intuitive, cohérence visuelle
- **Performance** : Chargement rapide, animations fluides
- **Thème** : Choix entre Aura, Lara, Nora (ou personnalisé)

### 5.3 Éléments visuels clés
- **Palette de couleurs** : Cohérente avec l'identité de l'IUSJC
- **Typographie** : Lisible, hiérarchisée
- **Icônes** : Claires et reconnaissables
- **Espacements** : Cohérents et aérés
- **Feedback utilisateur** : Confirmations, erreurs, succès

---

## 6. Architecture frontend

### 6.1 Structure du projet Angular
```
src/
├── app/
│   ├── layout/                 # Composants de mise en page
│   ├── pages/
│   │   ├── auth/              # Authentification
│   │   ├── dashboard/         # Tableaux de bord
│   │   ├── enseignants/       # Gestion des enseignants (Admin)
│   │   ├── emploi-du-temps/   # Gestion emplois du temps
│   │   ├── salles/            # Gestion des salles
│   │   ├── ressources/        # Gestion des ressources
│   │   ├── cours/             # Gestion des cours
│   │   ├── groupes/           # Gestion des groupes et étudiants
│   │   ├── notifications/     # Notifications
│   │   ├── rapports/          # Rapports et statistiques
│   │   ├── evenements/        # Événements académiques
│   │   └── parametres/        # Paramètres utilisateur
│   ├── services/              # Services (API, données)
│   ├── models/                # Modèles de données
│   ├── guards/                # Guards d'authentification
│   ├── interceptors/          # Interceptors HTTP
│   └── shared/                # Composants partagés
├── assets/                    # Images, styles, etc.
└── styles/                    # Styles globaux
```

### 6.2 Services frontend
- **AuthService** : Authentification et autorisation
- **EnseignantService** : Gestion des enseignants (création, modification, suppression)
- **EmployiDuTempsService** : Gestion des emplois du temps
- **SalleService** : Gestion des salles
- **RessourceService** : Gestion des ressources
- **CoursService** : Gestion des cours
- **GroupeService** : Gestion des groupes et étudiants
- **NotificationService** : Gestion des notifications
- **RapportService** : Génération de rapports
- **EvenementService** : Gestion des événements
- **CalendarService** : Intégration calendrier

### 6.3 Gestion d'état
- Utilisation de services avec RxJS
- Gestion des observables
- Caching des données
- Synchronisation en temps réel (WebSocket si nécessaire)

---

## 7. Flux utilisateur principal

### 6.1 Enseignant
1. Connexion → Dashboard
2. Consultation emploi du temps (calendrier)
3. Visualisation des salles assignées
4. Consultation des notifications
5. Synchronisation avec calendrier personnel

### 6.2 Administrateur
1. Connexion → Dashboard
2. Gestion des enseignants (création, modification, suppression)
3. Gestion des groupes d'étudiants
4. Gestion des salles et ressources
5. Gestion des cours
6. Consultation des rapports
7. Gestion des événements exceptionnels

### 6.3 Étudiants (via ENT)
1. Accès via ENT
2. Consultation emploi du temps
3. Visualisation des salles et horaires
4. Réception de rappels

---

## 8. Exigences non-fonctionnelles

### 7.1 Performance
- Temps de chargement < 3 secondes
- Réactivité des interactions < 200ms
- Support de 1000+ utilisateurs simultanés
- Optimisation des images et ressources

### 7.2 Sécurité
- HTTPS obligatoire
- Protection CSRF
- Validation des entrées
- Gestion sécurisée des tokens
- Logs d'audit

### 7.3 Compatibilité
- Navigateurs modernes (Chrome, Firefox, Safari, Edge)
- Responsive design (mobile, tablette, desktop)
- Support des anciennes versions si nécessaire

### 7.4 Maintenabilité
- Code bien structuré et documenté
- Tests unitaires et d'intégration
- CI/CD avec GitHub
- Documentation technique complète

---

## 9. Livrables frontend par phase

### Phase 3 : Conception (Semaine 5-6)
- Maquettes UI/UX (wireframes, prototypes)
- Spécifications des composants
- Guide de style

### Phase 4 : Setup technique (Semaine 7-8)
- Projet Angular initialisé
- Structure de base
- Authentification minimale

### Phase 5 : Développement incrémental (Sprints)
- Sprint 1-2 : Authentification & Dashboard
- Sprint 3-4 : Gestion des enseignants (Admin)
- Sprint 5-6 : Gestion emplois du temps
- Sprint 7-8 : Réservation salles
- Sprint 9-10 : Gestion cours et groupes d'étudiants
- Sprint 11-12 : Ressources et notifications
- Sprint 13-14 : Rapports et intégration ENT

### Phase 6 : Tests (Mai)
- Tests unitaires
- Tests d'intégration
- Tests utilisateurs
- Optimisations

### Phase 7 : Livraison (Juin)
- Code source complet
- Documentation utilisateur
- Manuel d'installation

---

## 10. Considérations techniques

### 9.1 Communication avec le backend
- API REST via Spring Boot
- Endpoints pour chaque module
- Gestion des erreurs HTTP
- Pagination et filtrage

### 9.2 Stockage local
- LocalStorage pour les préférences utilisateur
- SessionStorage pour les données temporaires
- IndexedDB pour les données volumineuses (si nécessaire)

### 9.3 Notifications en temps réel
- WebSocket pour les mises à jour instantanées
- Polling comme fallback
- Service Worker pour les notifications push

### 9.4 Optimisations
- Lazy loading des modules
- Code splitting
- Tree shaking
- Minification et compression

---

## 11. Ressources et outils

### 10.1 Frameworks et librairies
- Angular 20.1.4
- PrimeNG (composants UI)
- RxJS (gestion réactive)
- TypeScript
- Tailwind CSS (si utilisé)

### 10.2 Outils de développement
- Visual Studio Code
- Angular CLI
- npm/yarn
- Git/GitHub

### 10.3 Outils de test
- Jasmine (tests unitaires)
- Karma (test runner)
- Cypress (tests E2E)

### 10.4 Outils de déploiement
- GitHub Actions (CI/CD)
- VPS pour l'hébergement
- Docker (optionnel)

---

## 12. Critères de succès

- ✅ Toutes les fonctionnalités implémentées et testées
- ✅ Interface intuitive et ergonomique
- ✅ Performance optimale
- ✅ Sécurité garantie
- ✅ Documentation complète
- ✅ Tests automatisés > 80% de couverture
- ✅ Déploiement réussi sur VPS
- ✅ Satisfaction des utilisateurs (enseignants, admin)

---

## 13. Risques et mitigation

| Risque | Impact | Mitigation |
|--------|--------|-----------|
| Complexité de l'architecture | Élevé | Prototypage précoce, architecture claire |
| Intégration ENT | Moyen | Spécifications claires, tests précoces |
| Performance avec gros volumes | Moyen | Optimisations, caching, pagination |
| Changements de requirements | Moyen | Méthodologie Scrum, communication régulière |
| Disponibilité des ressources | Moyen | Planification réaliste, équipe dédiée |

---

**Document généré pour le Projet Transversal ISI - IUSJC**
**Année académique 2025-2026**
