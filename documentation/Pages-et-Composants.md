# 📋 Liste des Pages et Composants - IUSJ Planner

## 🎯 Vue d'ensemble

Ce document liste toutes les pages à implémenter et leurs composants pour le système de gestion des emplois du temps et réservations de salles de l'IUSJ.

---

## 🔐 Module Authentification

### 1. Page de Connexion (`/login`)
**Composants** :
- Formulaire de connexion
  - Champ login/email
  - Champ mot de passe
  - Bouton "Se connecter"
  - Lien "Mot de passe oublié"
- Messages d'erreur
- Loader de connexion

**Rôles** : Public

---

### 2. Page Mot de Passe Oublié (`/forgot-password`)
**Composants** :
- Formulaire email
- Bouton "Envoyer le lien"
- Message de confirmation
- Retour à la connexion

**Rôles** : Public

---

## 📊 Module Dashboard

### 3. Dashboard Administrateur (`/dashboard`)
**Composants** :
- Cartes statistiques
  - Nombre total d'enseignants
  - Nombre total de salles
  - Nombre de cours planifiés
  - Taux d'occupation des salles
  - Conflits d'horaires en cours
- Graphiques
  - Occupation des salles par jour/semaine
  - Répartition des cours par école
  - Disponibilité des enseignants
- Alertes et notifications
  - Conflits d'horaires
  - Salles non assignées
  - Demandes de réservation en attente
- Calendrier hebdomadaire (vue d'ensemble)
- Activités récentes

**Rôles** : Administrateur

---

### 4. Dashboard Enseignant (`/dashboard`)
**Composants** :
- Emploi du temps de la semaine (vue calendrier)
- Prochains cours (liste)
  - Date et heure
  - Matière
  - Salle
  - Groupe d'étudiants
- Notifications personnelles
- Disponibilités à renseigner
- Statistiques personnelles
  - Heures de cours cette semaine
  - Nombre de groupes
  - Écoles d'intervention

**Rôles** : Enseignant

---

## 👥 Module Gestion des Utilisateurs

### 5. Liste des Utilisateurs (`/users`)
**Composants** :
- Barre de recherche et filtres
  - Par nom/prénom
  - Par rôle (Admin, Enseignant)
  - Par école
  - Par statut (actif/inactif)
- Tableau des utilisateurs
  - ID
  - Photo/Avatar
  - Nom complet
  - Email
  - Rôle
  - École(s)
  - Statut
  - Actions (Voir, Modifier, Supprimer)
- Bouton "Ajouter un utilisateur"
- Pagination
- Export (CSV, PDF)

**Rôles** : Administrateur

---

### 6. Formulaire Utilisateur (`/users/new`, `/users/:id/edit`)
**Composants** :
- Informations personnelles
  - Nom
  - Prénom
  - Email
  - Téléphone
  - Photo de profil
- Informations de connexion
  - Login
  - Mot de passe
  - Confirmation mot de passe
- Rôle et permissions
  - Sélection du rôle
  - Permissions spécifiques
- Affectation école(s)
  - Sélection multiple des écoles
- Boutons
  - Enregistrer
  - Annuler
- Validation en temps réel

**Rôles** : Administrateur

---

### 7. Profil Utilisateur (`/profile`)
**Composants** :
- Bannière avec photo
- Informations personnelles (lecture seule)
- Badge de rôle
- Modifier mot de passe
- Préférences de notification
- Historique d'activité

**Rôles** : Tous

---

## 👨‍🏫 Module Gestion des Enseignants

### 8. Liste des Enseignants (`/teachers`)
**Composants** :
- Barre de recherche et filtres
  - Par nom
  - Par école
  - Par disponibilité
  - Par matière enseignée
- Tableau des enseignants
  - Photo
  - Nom complet
  - Email/Téléphone
  - École(s)
  - Matières
  - Disponibilité
  - Nombre de cours
  - Actions
- Bouton "Ajouter un enseignant"
- Vue grille/liste
- Export

**Rôles** : Administrateur

---

### 9. Fiche Enseignant (`/teachers/:id`)
**Composants** :
- Informations personnelles
- Écoles d'affectation
- Matières enseignées
- Emploi du temps actuel (calendrier)
- Disponibilités (grille horaire)
- Historique des cours
- Statistiques
  - Heures totales
  - Nombre de groupes
  - Taux de présence
- Bouton "Modifier"

**Rôles** : Administrateur, Enseignant (vue limitée)

---

### 10. Gestion des Disponibilités (`/teachers/:id/availability`)
**Composants** :
- Grille horaire hebdomadaire
  - Lundi à Samedi
  - Créneaux de 30 minutes
  - Sélection multiple
- Disponibilités récurrentes
- Indisponibilités exceptionnelles
  - Date de début
  - Date de fin
  - Motif
- Visualisation des conflits
- Boutons
  - Enregistrer
  - Réinitialiser
  - Copier la semaine

**Rôles** : Administrateur, Enseignant

---

## 🏫 Module Gestion des Écoles

### 11. Liste des Écoles (`/schools`)
**Composants** :
- Cartes des écoles
  - Logo
  - Nom (SJI, SJM, PrepaVogt, CPGE)
  - Nombre d'enseignants
  - Nombre de cours
  - Nombre de salles
- Bouton "Ajouter une école"
- Actions (Voir, Modifier, Supprimer)

**Rôles** : Administrateur

---

### 12. Détails École (`/schools/:id`)
**Composants** :
- Informations générales
- Liste des enseignants affectés
- Liste des cours
- Liste des salles
- Emploi du temps global
- Statistiques
- Bouton "Modifier"

**Rôles** : Administrateur

---

## 🏛️ Module Gestion des Salles

### 13. Liste des Salles (`/rooms`)
**Composants** :
- Barre de recherche et filtres
  - Par nom/numéro
  - Par type (Amphithéâtre, Salle TD, Salle TP, Laboratoire)
  - Par capacité
  - Par disponibilité
  - Par équipements
- Tableau/Grille des salles
  - Photo
  - Nom/Numéro
  - Type
  - Capacité
  - Équipements (icônes)
  - Statut (Disponible, Occupée, Maintenance)
  - Taux d'occupation
  - Actions
- Bouton "Ajouter une salle"
- Vue plan du campus (optionnel)
- Export

**Rôles** : Administrateur

---

### 14. Formulaire Salle (`/rooms/new`, `/rooms/:id/edit`)
**Composants** :
- Informations générales
  - Nom/Numéro
  - Type de salle
  - Bâtiment
  - Étage
  - Capacité
  - Photo
- Équipements
  - Projecteur
  - Ordinateurs
  - Tableau blanc/noir
  - Baffles
  - Climatisation
  - Wifi
  - Autres
- Disponibilité
  - Horaires d'ouverture
  - Jours disponibles
- Boutons
  - Enregistrer
  - Annuler

**Rôles** : Administrateur

---

### 15. Détails Salle (`/rooms/:id`)
**Composants** :
- Photos de la salle
- Informations complètes
- Liste des équipements
- Calendrier d'occupation
  - Vue jour/semaine/mois
  - Cours planifiés
  - Réservations
- Statistiques d'utilisation
- Historique des réservations
- Bouton "Réserver"
- Bouton "Modifier"

**Rôles** : Administrateur, Enseignant (vue limitée)

---

## 📚 Module Gestion des Cours

### 16. Liste des Cours (`/courses`)
**Composants** :
- Barre de recherche et filtres
  - Par matière
  - Par enseignant
  - Par école
  - Par niveau
  - Par type (CM, TD, TP)
  - Par période
- Tableau des cours
  - Code cours
  - Matière
  - Enseignant
  - École
  - Type
  - Groupe(s)
  - Horaire
  - Salle
  - Statut
  - Actions
- Bouton "Créer un cours"
- Vue calendrier
- Export

**Rôles** : Administrateur

---

### 17. Formulaire Cours (`/courses/new`, `/courses/:id/edit`)
**Composants** :
- Informations générales
  - Code cours
  - Matière
  - Description
  - École
  - Niveau
  - Type (CM, TD, TP)
- Enseignant
  - Sélection enseignant
  - Vérification disponibilité
- Groupe(s) d'étudiants
  - Sélection multiple
  - Nombre d'étudiants
- Planification
  - Date de début
  - Date de fin
  - Jour(s) de la semaine
  - Heure de début
  - Heure de fin
  - Récurrence
- Salle
  - Assignation automatique (suggestion)
  - Sélection manuelle
  - Vérification disponibilité
- Ressources nécessaires
  - Équipements requis
- Boutons
  - Enregistrer
  - Annuler
- Alertes de conflits

**Rôles** : Administrateur

---

### 18. Détails Cours (`/courses/:id`)
**Composants** :
- Informations complètes
- Enseignant assigné
- Groupe(s) d'étudiants
- Salle assignée
- Horaires
- Ressources
- Historique des modifications
- Présences (optionnel)
- Boutons
  - Modifier
  - Dupliquer
  - Annuler le cours

**Rôles** : Administrateur, Enseignant (vue limitée)

---

## 👨‍🎓 Module Gestion des Groupes d'Étudiants

### 19. Liste des Groupes (`/groups`)
**Composants** :
- Barre de recherche et filtres
  - Par école
  - Par niveau
  - Par filière
- Tableau des groupes
  - Code groupe
  - Nom
  - École
  - Niveau
  - Filière
  - Nombre d'étudiants
  - Cours assignés
  - Actions
- Bouton "Créer un groupe"

**Rôles** : Administrateur

---

### 20. Formulaire Groupe (`/groups/new`, `/groups/:id/edit`)
**Composants** :
- Informations générales
  - Code groupe
  - Nom
  - École
  - Niveau
  - Filière
  - Année académique
- Étudiants
  - Nombre d'étudiants
  - Import liste (CSV)
- Cours assignés
  - Liste des cours
- Boutons
  - Enregistrer
  - Annuler

**Rôles** : Administrateur

---

## 📅 Module Emplois du Temps

### 21. Emploi du Temps Global (`/schedules`)
**Composants** :
- Filtres
  - Par école
  - Par enseignant
  - Par salle
  - Par groupe
  - Par semaine
- Calendrier hebdomadaire
  - Vue grille
  - Créneaux horaires
  - Cours affichés avec couleurs
  - Drag & drop pour modifier
- Légende (types de cours, écoles)
- Boutons
  - Imprimer
  - Export PDF
  - Synchroniser calendrier

**Rôles** : Administrateur, Enseignant (vue limitée)

---

### 22. Emploi du Temps Enseignant (`/schedules/teacher/:id`)
**Composants** :
- Informations enseignant
- Calendrier hebdomadaire personnel
- Liste des cours
  - Date/Heure
  - Matière
  - Groupe
  - Salle
  - École
- Disponibilités
- Conflits éventuels
- Boutons
  - Imprimer
  - Export
  - Synchroniser

**Rôles** : Administrateur, Enseignant

---

### 23. Emploi du Temps Salle (`/schedules/room/:id`)
**Composants** :
- Informations salle
- Calendrier d'occupation
- Taux d'occupation
- Créneaux libres
- Bouton "Réserver"

**Rôles** : Administrateur

---

### 24. Emploi du Temps Groupe (`/schedules/group/:id`)
**Composants** :
- Informations groupe
- Calendrier hebdomadaire
- Liste des cours
- Enseignants
- Salles
- Boutons
  - Imprimer
  - Export
  - Envoyer aux étudiants

**Rôles** : Administrateur

---

## 🔔 Module Réservations

### 25. Liste des Réservations (`/reservations`)
**Composants** :
- Barre de recherche et filtres
  - Par salle
  - Par date
  - Par statut (En attente, Approuvée, Refusée)
  - Par type (Cours, Événement)
- Tableau des réservations
  - Date/Heure
  - Salle
  - Demandeur
  - Motif
  - Statut
  - Actions
- Bouton "Nouvelle réservation"

**Rôles** : Administrateur, Enseignant

---

### 26. Formulaire Réservation (`/reservations/new`)
**Composants** :
- Type de réservation
  - Cours régulier
  - Événement ponctuel
- Informations
  - Motif
  - Description
  - Date de début
  - Date de fin
  - Heure de début
  - Heure de fin
  - Récurrence
- Salle
  - Sélection avec disponibilité
  - Suggestions automatiques
- Ressources nécessaires
- Nombre de participants
- Boutons
  - Soumettre
  - Annuler

**Rôles** : Administrateur, Enseignant

---

### 27. Détails Réservation (`/reservations/:id`)
**Composants** :
- Informations complètes
- Statut
- Historique
- Boutons
  - Approuver (Admin)
  - Refuser (Admin)
  - Modifier
  - Annuler

**Rôles** : Administrateur, Enseignant (vue limitée)

---

## 🎯 Module Gestion des Événements

### 28. Liste des Événements (`/events`)
**Composants** :
- Calendrier des événements
- Filtres
  - Par type (Séminaire, Conférence, Examen, Compétition)
  - Par école
  - Par date
- Liste/Grille des événements
  - Titre
  - Type
  - Date/Heure
  - Lieu
  - Organisateur
  - Statut
  - Actions
- Bouton "Créer un événement"

**Rôles** : Administrateur

---

### 29. Formulaire Événement (`/events/new`, `/events/:id/edit`)
**Composants** :
- Informations générales
  - Titre
  - Type
  - Description
  - Date de début
  - Date de fin
  - Heure de début
  - Heure de fin
- Lieu
  - Salle(s)
  - Vérification disponibilité
- Participants
  - Enseignants
  - Groupes d'étudiants
  - Invités externes
- Ressources nécessaires
- Boutons
  - Enregistrer
  - Annuler

**Rôles** : Administrateur

---

## 🔧 Module Gestion des Ressources

### 30. Liste des Ressources (`/resources`)
**Composants** :
- Barre de recherche et filtres
  - Par type (Projecteur, Ordinateur, Baffle, etc.)
  - Par statut (Disponible, En maintenance, Hors service)
  - Par salle
- Tableau/Grille des ressources
  - Photo
  - Nom
  - Type
  - Numéro d'inventaire
  - Salle assignée
  - Statut
  - Dernière maintenance
  - Actions
- Bouton "Ajouter une ressource"

**Rôles** : Administrateur

---

### 31. Formulaire Ressource (`/resources/new`, `/resources/:id/edit`)
**Composants** :
- Informations générales
  - Nom
  - Type
  - Numéro d'inventaire
  - Photo
  - Description
- Affectation
  - Salle
  - Mobile/Fixe
- État
  - Statut
  - Date d'acquisition
  - Date dernière maintenance
  - Prochaine maintenance
- Boutons
  - Enregistrer
  - Annuler

**Rôles** : Administrateur

---

## 📊 Module Rapports et Statistiques

### 32. Tableau de Bord Rapports (`/reports`)
**Composants** :
- Sélection du type de rapport
  - Occupation des salles
  - Charge enseignants
  - Répartition des cours
  - Conflits d'horaires
  - Utilisation des ressources
- Filtres
  - Période
  - École
  - Salle/Enseignant
- Graphiques
  - Barres
  - Courbes
  - Camemberts
- Tableaux de données
- Boutons
  - Export PDF
  - Export Excel
  - Imprimer

**Rôles** : Administrateur

---

### 33. Rapport Occupation Salles (`/reports/rooms`)
**Composants** :
- Graphique d'occupation par salle
- Taux d'occupation moyen
- Créneaux les plus demandés
- Salles sous-utilisées
- Tableau détaillé
- Export

**Rôles** : Administrateur

---

### 34. Rapport Charge Enseignants (`/reports/teachers`)
**Composants** :
- Graphique heures par enseignant
- Répartition par école
- Enseignants surchargés
- Disponibilités restantes
- Tableau détaillé
- Export

**Rôles** : Administrateur

---

## 🔔 Module Notifications

### 35. Centre de Notifications (`/notifications`)
**Composants** :
- Liste des notifications
  - Non lues (badge)
  - Lues
- Filtres
  - Par type
  - Par date
- Notifications
  - Icône
  - Titre
  - Message
  - Date/Heure
  - Actions
- Boutons
  - Tout marquer comme lu
  - Supprimer tout

**Rôles** : Tous

---

### 36. Paramètres Notifications (`/notifications/settings`)
**Composants** :
- Préférences par canal
  - Email
  - SMS
  - Application
- Types de notifications
  - Changements d'emploi du temps
  - Réservations
  - Conflits
  - Rappels de cours
  - Événements
- Fréquence
- Bouton "Enregistrer"

**Rôles** : Tous

---

## ⚙️ Module Paramètres

### 37. Paramètres Généraux (`/settings`)
**Composants** :
- Onglets
  - Général
  - Année académique
  - Horaires
  - Notifications
  - Intégrations
- Paramètres généraux
  - Nom de l'institution
  - Logo
  - Fuseau horaire
  - Langue
- Bouton "Enregistrer"

**Rôles** : Administrateur

---

### 38. Gestion Année Académique (`/settings/academic-year`)
**Composants** :
- Année en cours
- Dates importantes
  - Début année
  - Fin année
  - Périodes de vacances
  - Périodes d'examens
- Semestres/Trimestres
- Boutons
  - Ajouter période
  - Enregistrer

**Rôles** : Administrateur

---

### 39. Configuration Horaires (`/settings/schedules`)
**Composants** :
- Créneaux horaires
  - Heure de début
  - Heure de fin
  - Durée des cours
  - Pauses
- Jours ouvrables
- Horaires spéciaux
- Bouton "Enregistrer"

**Rôles** : Administrateur

---

### 40. Intégrations (`/settings/integrations`)
**Composants** :
- ENT
  - URL
  - Clé API
  - Statut connexion
- Google Calendar
- Outlook
- SMS Gateway
- Email SMTP
- Boutons
  - Tester connexion
  - Enregistrer

**Rôles** : Administrateur

---

## 🔍 Module Recherche Globale

### 41. Page Recherche (`/search`)
**Composants** :
- Barre de recherche globale
- Filtres par type
  - Enseignants
  - Salles
  - Cours
  - Groupes
  - Événements
- Résultats groupés
- Pagination

**Rôles** : Tous

---

## 📱 Composants Partagés

### Composants Réutilisables
1. **Header**
   - Logo
   - Menu navigation
   - Notifications (badge)
   - Profil utilisateur (dropdown)

2. **Sidebar**
   - Navigation principale
   - Icônes + labels
   - État actif
   - Collapse/Expand

3. **Footer**
   - Copyright
   - Liens utiles
   - Version

4. **Breadcrumb**
   - Fil d'Ariane

5. **Calendrier**
   - Vue jour/semaine/mois
   - Événements
   - Drag & drop

6. **Modal**
   - Confirmation
   - Formulaire
   - Détails

7. **Toast/Snackbar**
   - Succès
   - Erreur
   - Info
   - Warning

8. **Loader/Spinner**
   - Chargement page
   - Chargement composant

9. **Pagination**
   - Navigation pages
   - Nombre d'éléments

10. **Filtres**
    - Recherche
    - Sélection multiple
    - Date range

11. **Tableau**
    - Tri
    - Filtres
    - Actions
    - Export

12. **Cartes Statistiques**
    - Icône
    - Valeur
    - Label
    - Gradient

13. **Badge**
    - Rôle
    - Statut
    - Notification

14. **Avatar**
    - Photo
    - Initiales
    - Statut en ligne

15. **Formulaire**
    - Inputs
    - Selects
    - Checkboxes
    - Radio buttons
    - Date pickers
    - Time pickers
    - Validation

---

## 📊 Récapitulatif

### Nombre de Pages
- **41 pages principales**
- **15 composants partagés**

### Répartition par Module
- Authentification : 2 pages
- Dashboard : 2 pages
- Utilisateurs : 3 pages
- Enseignants : 3 pages
- Écoles : 2 pages
- Salles : 3 pages
- Cours : 3 pages
- Groupes : 2 pages
- Emplois du temps : 4 pages
- Réservations : 3 pages
- Événements : 2 pages
- Ressources : 2 pages
- Rapports : 3 pages
- Notifications : 2 pages
- Paramètres : 4 pages
- Recherche : 1 page

### Rôles
- **Administrateur** : Accès complet (41 pages)
- **Enseignant** : Accès limité (15 pages)

---

## 🎨 Palette de Couleurs

### Gradient Principal
```scss
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Gradients par Type
- **Administrateur** : Violet `#667eea → #764ba2`
- **Enseignant** : Bleu `#4facfe → #00f2fe`
- **Salle** : Vert `#43e97b → #38f9d7`
- **Cours** : Orange `#fa709a → #fee140`
- **Événement** : Rose `#f093fb → #f5576c`

---

**Document créé le 23 novembre 2025** 🚀
