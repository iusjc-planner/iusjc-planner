# Phase 2 - Gestion des Enseignants

## 📋 Résumé

Phase 2 du projet de gestion des emplois du temps et réservations de salles. Cette phase couvre la gestion complète des enseignants.

### ✅ Fonctionnalités implémentées

- ✅ Liste des enseignants avec tableau paginé
- ✅ Création d'enseignant
- ✅ Modification d'enseignant
- ✅ Suppression d'enseignant
- ✅ Recherche et filtrage
- ✅ Tri par colonne
- ✅ Validation des formulaires
- ✅ Notifications (succès/erreur)
- ✅ Confirmations de suppression
- ✅ Service EnseignantService
- ✅ Composant de détail enseignant
- ✅ Composant de formulaire réutilisable

## 🏗️ Structure des fichiers créés

```
src/
├── app/
│   ├── pages/
│   │   └── enseignants/
│   │       ├── enseignants.component.ts          # Composant principal
│   │       ├── enseignant-detail/
│   │       │   └── enseignant-detail.component.ts
│   │       └── enseignant-form/
│   │           └── enseignant-form.component.ts
│   └── services/
│       └── enseignant.service.ts                 # Service des enseignants
└── app.routes.ts                                 # Routes mises à jour
```

## 🧩 Composants créés

### 1. EnseignantsComponent
Composant principal pour la gestion des enseignants.

**Fonctionnalités** :
- Affichage du tableau des enseignants
- Pagination (10 lignes par page)
- Recherche globale
- Tri par colonne
- Création d'enseignant (bouton + dialog)
- Modification d'enseignant
- Suppression d'enseignant avec confirmation
- Notifications de succès/erreur

**Imports PrimeNG** :
- p-table
- p-button
- p-inputText
- p-dialog
- p-card
- p-toolbar
- p-confirmDialog
- p-toast
- p-dropdown
- p-multiSelect

### 2. EnseignantDetailComponent
Composant pour afficher les détails d'un enseignant.

**Affiche** :
- Nom et prénom
- Email
- Écoles d'affectation
- Spécialité
- Statut (actif/inactif)
- Date de création

### 3. EnseignantFormComponent
Composant réutilisable pour créer/modifier un enseignant.

**Champs** :
- Nom (requis, min 2 caractères)
- Prénom (requis, min 2 caractères)
- Email (requis, format email)
- Écoles (multi-select, requis)
- Spécialité (requis, min 2 caractères)
- Statut (dropdown, requis)

**Validation** :
- Validation en temps réel
- Messages d'erreur personnalisés
- Boutons désactivés si formulaire invalide

## 🔧 Service EnseignantService

### Méthodes disponibles

```typescript
// Récupérer tous les enseignants
getEnseignants(): Observable<Enseignant[]>

// Récupérer un enseignant par ID
getEnseignantById(id: number): Enseignant | undefined

// Créer un enseignant
createEnseignant(enseignant: Enseignant): void

// Modifier un enseignant
updateEnseignant(id: number, enseignant: Enseignant): void

// Supprimer un enseignant
deleteEnseignant(id: number): void

// Rechercher des enseignants
searchEnseignants(query: string): Observable<Enseignant[]>
```

### Interface Enseignant

```typescript
interface Enseignant {
    id?: number;
    nom: string;
    prenom: string;
    email: string;
    ecoles: string[];
    specialite: string;
    statut: 'actif' | 'inactif';
    dateCreation?: string;
}
```

## 📱 Utilisation

### Accéder à la page des enseignants

1. Connectez-vous avec un compte admin
2. Cliquez sur "Enseignants" dans le menu latéral
3. Ou accédez directement à `http://localhost:4200/enseignants`

### Créer un enseignant

1. Cliquez sur le bouton "Créer enseignant"
2. Remplissez le formulaire
3. Cliquez sur "Créer"

### Modifier un enseignant

1. Cliquez sur l'icône crayon (✏️) dans la ligne de l'enseignant
2. Modifiez les informations
3. Cliquez sur "Modifier"

### Supprimer un enseignant

1. Cliquez sur l'icône poubelle (🗑️) dans la ligne de l'enseignant
2. Confirmez la suppression
3. L'enseignant est supprimé

### Rechercher un enseignant

1. Utilisez la barre de recherche en haut du tableau
2. Tapez le nom, prénom ou email
3. Le tableau se filtre automatiquement

## 🎨 Fonctionnalités UI/UX

### Tableau
- Pagination automatique (10 lignes par page)
- Tri par colonne (clic sur l'en-tête)
- Recherche globale
- Responsive design
- État vide avec message

### Dialog
- Modale pour création/modification
- Responsive (75vw sur 960px, 90vw sur 640px)
- Validation en temps réel
- Boutons Annuler/Créer/Modifier

### Notifications
- Toast de succès (vert)
- Toast d'erreur (rouge)
- Durée : 3 secondes
- Position : haut-droit

### Confirmations
- Dialog de confirmation pour suppression
- Message personnalisé avec nom de l'enseignant
- Icône d'avertissement

## 📊 Données de test

Le service contient 3 enseignants de test :

1. **Jean Dupont**
   - Email : jean.dupont@iusjc.com
   - Écoles : SJI, SJM
   - Spécialité : Mathématiques
   - Statut : Actif

2. **Marie Martin**
   - Email : marie.martin@iusjc.com
   - Écoles : SJI
   - Spécialité : Informatique
   - Statut : Actif

3. **Pierre Bernard**
   - Email : pierre.bernard@iusjc.com
   - Écoles : PrepaVogt, CPGE
   - Spécialité : Physique
   - Statut : Actif

## 🚀 Démarrage

```bash
# Installation (si pas déjà fait)
npm install

# Développement
ng serve

# Accédez à
http://localhost:4200/enseignants
```

## 🔄 Routes mises à jour

```
/enseignants                → Page de gestion des enseignants
```

## 📝 Composants PrimeNG utilisés

- ✅ p-table (tableau avec pagination, tri, filtrage)
- ✅ p-button (boutons)
- ✅ p-inputText (champs texte)
- ✅ p-dialog (modale)
- ✅ p-card (cartes)
- ✅ p-toolbar (barre d'outils)
- ✅ p-confirmDialog (confirmation)
- ✅ p-toast (notifications)
- ✅ p-dropdown (sélection simple)
- ✅ p-multiSelect (sélection multiple)

## 🧪 Tests manuels

### Checklist de validation

- [ ] Page des enseignants s'affiche
- [ ] Tableau affiche les 3 enseignants de test
- [ ] Pagination fonctionne
- [ ] Tri par colonne fonctionne
- [ ] Recherche filtre les résultats
- [ ] Bouton "Créer enseignant" ouvre la dialog
- [ ] Formulaire valide les champs
- [ ] Création d'enseignant fonctionne
- [ ] Modification d'enseignant fonctionne
- [ ] Suppression d'enseignant fonctionne
- [ ] Confirmations s'affichent
- [ ] Notifications s'affichent
- [ ] Responsive design fonctionne
- [ ] Pas d'erreurs dans la console

## 🔜 Prochaines étapes (Phase 3)

- Emplois du temps (calendrier interactif)
- Gestion des cours
- Gestion des disponibilités des enseignants

## 📚 Ressources

- [PrimeNG Table Documentation](https://primeng.org/table)
- [PrimeNG Dialog Documentation](https://primeng.org/dialog)
- [PrimeNG Form Components](https://primeng.org/inputtext)
- [Angular Forms Documentation](https://angular.dev/guide/forms)

## 💡 Points clés

1. **Service centralisé** : EnseignantService gère toutes les données
2. **Composants réutilisables** : EnseignantFormComponent peut être utilisé ailleurs
3. **Validation** : Validation côté client avec messages d'erreur
4. **UX** : Confirmations et notifications pour chaque action
5. **Responsive** : Fonctionne sur mobile, tablet, desktop

## 🎓 Apprentissages

- Utilisation de p-table avec pagination et tri
- Gestion des dialogs modales
- Validation de formulaires réactifs
- Services avec BehaviorSubject
- Notifications avec p-toast
- Confirmations avec p-confirmDialog

---

**Statut** : ✅ Phase 2 complétée
**Date** : 2026-02-01
**Prochaine phase** : Emplois du temps
