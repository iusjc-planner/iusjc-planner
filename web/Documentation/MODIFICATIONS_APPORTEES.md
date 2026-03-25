# Modifications apportées au document BESOINS_FRONTEND.md

## Résumé des changements

### 1. Architecture technique
- ✅ **Remplacement de Thymeleaf par Angular**
  - Avant : Architecture MVC avec Thymeleaf (backend) + Angular (frontend)
  - Après : SPA (Single Page Application) avec Angular uniquement

### 2. Utilisateurs et rôles
- ✅ **Simplification des rôles utilisateurs**
  - Avant : Administrateurs, Enseignants, Étudiants, Responsables administratifs
  - Après : Administrateurs et Enseignants uniquement
  - Les étudiants sont gérés par l'administrateur (pas d'accès direct à l'application)

### 3. Authentification
- ✅ **Suppression de la page d'inscription**
  - Avant : Page d'inscription disponible
  - Après : Pas de page d'inscription (création d'enseignants par l'administrateur uniquement)

- ✅ **Création d'enseignants par l'administrateur**
  - Nouvelle fonctionnalité : L'administrateur crée les enseignants
  - Génération automatique de credentials (username/password temporaire)
  - Email d'invitation avec credentials
  - Obligation de changer le mot de passe à la première connexion

### 4. Nouvelles sections ajoutées

#### 4.1 Section 3.5bis - Gestion des enseignants (Admin)
- Liste des enseignants avec filtrage et recherche
- Création d'enseignants avec formulaire complet
- Modification des informations enseignant
- Profil enseignant avec historique et conflits détectés
- Actions : CRUD complet, activation/désactivation

#### 4.2 Section 4 - Matrice des rôles et permissions
- Tableau détaillé des permissions pour Administrateur
- Tableau détaillé des permissions pour Enseignant
- Clarification des fonctionnalités accessibles par rôle

### 5. Modifications des sections existantes

#### 5.1 Gestion des groupes d'étudiants (Section 3.6.1)
- Ajout de la gestion des étudiants par l'administrateur
- Ajout/suppression d'étudiants dans les groupes
- Import en masse (CSV)
- Consultation de la liste des étudiants par groupe

#### 5.2 Tableaux de bord (Section 3.8)
- Ajout de statistiques spécifiques pour l'administrateur
- Nombre d'enseignants actifs
- Nombre de groupes d'étudiants
- Statistiques d'utilisation des ressources
- Historique des modifications pour les enseignants

#### 5.3 Flux utilisateur (Section 7)
- Ajout d'étapes spécifiques pour l'administrateur
- Gestion des enseignants en première position
- Gestion des groupes d'étudiants
- Clarification du flux pour les étudiants (via ENT uniquement)

#### 5.4 Livrables par phase (Section 9)
- Ajout d'un sprint dédié à la gestion des enseignants
- Sprint 3-4 : Gestion des enseignants (Admin)
- Réorganisation des sprints suivants

### 6. Services frontend (Section 6.2)
- Ajout du service EnseignantService
- Repositionnement en première position (priorité)
- Mise à jour de la liste complète des services

### 7. Structure du projet Angular (Section 6.1)
- Ajout du dossier `enseignants/` pour la gestion des enseignants
- Repositionnement dans la structure pour refléter la priorité

---

## Impact sur le développement

### Phases affectées
1. **Phase 3 (Conception)** : Maquettes UI/UX pour la gestion des enseignants
2. **Phase 4 (Setup)** : Authentification simplifiée (pas d'inscription)
3. **Phase 5 (Développement)** : Sprint 3-4 dédié aux enseignants

### Composants à développer
- Page de connexion (login uniquement)
- Dashboard administrateur avec gestion des enseignants
- Formulaire de création d'enseignant
- Liste des enseignants avec actions CRUD
- Profil enseignant (vue admin)
- Gestion des groupes d'étudiants
- Gestion des étudiants dans les groupes

### Services à implémenter
- EnseignantService (priorité haute)
- GroupeService (avec gestion des étudiants)
- AuthService (simplifié, pas d'inscription)

---

## Clarifications importantes

### Accès des étudiants
- Les étudiants n'ont **pas d'accès direct** à l'application
- Ils consultent leurs emplois du temps via l'ENT
- L'administrateur gère les groupes d'étudiants et les données associées

### Création d'enseignants
- Seul l'administrateur peut créer des enseignants
- Les credentials sont générés automatiquement
- Un email d'invitation est envoyé à l'enseignant
- L'enseignant doit changer son mot de passe à la première connexion

### Permissions
- Administrateur : Accès complet à toutes les fonctionnalités
- Enseignant : Accès limité à ses propres données et consultations

---

## Prochaines étapes

1. Valider les modifications avec l'équipe de projet
2. Mettre à jour les maquettes UI/UX en fonction des changements
3. Adapter le planning des sprints si nécessaire
4. Commencer le développement du service EnseignantService
5. Implémenter la page de connexion simplifiée

---

**Document généré le** : 2026-02-01
**Projet** : Projet Transversal ISI - IUSJC
