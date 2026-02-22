# 🎨 Migration du Design iusj-planning vers fontend

## ✅ Étape 1 : Assets Copiés

### Fichiers SCSS
- ✅ Copié : `iusj-planning/src/assets/scss/` → `fontend/src/assets/scss/`
- ✅ Copié : `iusj-planning/src/assets/images/` → `fontend/src/assets/images/`

### Structure SCSS Disponible
```
fontend/src/assets/scss/
├── components/          # Composants UI
│   ├── _accordions.scss
│   ├── _badges.scss
│   ├── _buttons.scss
│   ├── _cards.scss
│   ├── _forms.scss
│   ├── _tables.scss
│   ├── _tabs.scss
│   └── ...
├── mixins/             # Mixins réutilisables
│   ├── _animation.scss
│   ├── _buttons.scss
│   ├── _cards.scss
│   └── ...
├── _variables.scss     # Variables de couleurs et tailles
├── _layout.scss        # Layout général
├── _typography.scss    # Typographie
├── _utilities.scss     # Classes utilitaires
└── ...
```

---

## 🎨 Palette de Couleurs Extraite

### Couleurs Principales
```scss
// Couleurs de base
$blue:    #5E50F9;
$purple:  #6a008a;
$pink:    #E91E63;
$red:     #f96868;
$orange:  #f2a654;
$yellow:  #f6e84e;
$green:   #46c35f;
$teal:    #58d8a3;
$cyan:    #57c7d4;

// Couleurs du thème
$primary:   #b66dff;  // Violet principal
$secondary: #d8d8d8;
$success:   #1bcfb4;
$info:      #198ae3;
$warning:   #fed713;
$danger:    #fe7c96;
$light:     #f8f9fa;
$dark:      #3e4b5b;
```

### Gradients
```scss
$theme-gradient-colors: (
  primary:   linear-gradient(to right, #da8cff, #9a55ff),  // Violet
  secondary: linear-gradient(to right, #e7ebf0, #868e96),
  success:   linear-gradient(to right, #84d9d2, #07cdae),
  info:      linear-gradient(to right, #90caf9, #047edf 99%),
  warning:   linear-gradient(to right, #f6e384, #ffd500),
  danger:    linear-gradient(to right, #ffbf96, #fe7096),
  light:     linear-gradient(to bottom, #f4f4f4, #e4e4e9),
  dark:      linear-gradient(89deg, #5e7188, #3e4b5b)
);
```

---

## 📁 Structure des Composants Créée

```
fontend/src/app/
├── shared/
│   ├── components/
│   │   ├── header/
│   │   ├── sidebar/
│   │   └── footer/
│   └── layouts/
│       └── main-layout/
```

---

## 🚀 Prochaines Étapes

### Phase 2 : Intégration des Styles

#### 1. Mettre à jour `styles.scss`
```scss
// Importer les styles de iusj-planning
@import 'assets/scss/variables';
@import 'assets/scss/mixins/animation';
@import 'assets/scss/mixins/buttons';
@import 'assets/scss/mixins/cards';
@import 'assets/scss/reset';
@import 'assets/scss/typography';
@import 'assets/scss/utilities';
@import 'assets/scss/layout';

// Composants
@import 'assets/scss/components/buttons';
@import 'assets/scss/components/cards';
@import 'assets/scss/components/forms';
@import 'assets/scss/components/tables';
@import 'assets/scss/components/badges';
@import 'assets/scss/components/tabs';
// ... autres composants selon les besoins
```

#### 2. Créer le Header Component
**Fichiers à créer** :
- `header.component.ts`
- `header.component.html`
- `header.component.scss`

**Fonctionnalités** :
- Logo IUSJ
- Barre de recherche
- Notifications dropdown
- Messages dropdown
- Profil utilisateur dropdown
- Toggle sidebar (mobile)

#### 3. Créer le Sidebar Component
**Fichiers à créer** :
- `sidebar.component.ts`
- `sidebar.component.html`
- `sidebar.component.scss`

**Fonctionnalités** :
- Profil utilisateur
- Navigation principale
- Sous-menus avec collapse
- Icônes Material Design
- Mode icon-only
- Responsive

#### 4. Créer le Footer Component
**Fichiers à créer** :
- `footer.component.ts`
- `footer.component.html`
- `footer.component.scss`

**Contenu** :
- Copyright IUSJ
- Liens utiles
- Version

#### 5. Créer le Main Layout
**Fichiers à créer** :
- `main-layout.component.ts`
- `main-layout.component.html`
- `main-layout.component.scss`

**Structure** :
```html
<div class="container-scroller">
  <app-header></app-header>
  <div class="container-fluid page-body-wrapper">
    <app-sidebar></app-sidebar>
    <div class="main-panel">
      <div class="content-wrapper">
        <router-outlet></router-outlet>
      </div>
      <app-footer></app-footer>
    </div>
  </div>
</div>
```

#### 6. Créer le Shared Module
**Fichier** : `shared/shared.module.ts`

**Exports** :
- HeaderComponent
- SidebarComponent
- FooterComponent
- MainLayoutComponent
- Directives communes
- Pipes communes

---

## 📋 Navigation IUSJ à Implémenter

### Menu Principal (Sidebar)

#### Pour ADMIN
```typescript
menuItems = [
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard',
    link: '/dashboard'
  },
  {
    title: 'Utilisateurs',
    icon: 'mdi-account-multiple',
    link: '/users'
  },
  {
    title: 'Enseignants',
    icon: 'mdi-account-tie',
    submenu: [
      { title: 'Liste', link: '/teachers' },
      { title: 'Disponibilités', link: '/teachers/availability' }
    ]
  },
  {
    title: 'Écoles',
    icon: 'mdi-school',
    link: '/schools'
  },
  {
    title: 'Salles',
    icon: 'mdi-door',
    submenu: [
      { title: 'Liste', link: '/rooms' },
      { title: 'Réservations', link: '/reservations' }
    ]
  },
  {
    title: 'Cours',
    icon: 'mdi-book-open-variant',
    link: '/courses'
  },
  {
    title: 'Groupes',
    icon: 'mdi-account-group',
    link: '/groups'
  },
  {
    title: 'Emplois du temps',
    icon: 'mdi-calendar-clock',
    submenu: [
      { title: 'Vue globale', link: '/schedules' },
      { title: 'Par enseignant', link: '/schedules/teachers' },
      { title: 'Par salle', link: '/schedules/rooms' },
      { title: 'Par groupe', link: '/schedules/groups' }
    ]
  },
  {
    title: 'Événements',
    icon: 'mdi-calendar-star',
    link: '/events'
  },
  {
    title: 'Ressources',
    icon: 'mdi-desktop-classic',
    link: '/resources'
  },
  {
    title: 'Rapports',
    icon: 'mdi-chart-bar',
    submenu: [
      { title: 'Occupation salles', link: '/reports/rooms' },
      { title: 'Charge enseignants', link: '/reports/teachers' }
    ]
  },
  {
    title: 'Paramètres',
    icon: 'mdi-cog',
    link: '/settings'
  }
];
```

#### Pour ENSEIGNANT
```typescript
menuItems = [
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard',
    link: '/dashboard'
  },
  {
    title: 'Mon emploi du temps',
    icon: 'mdi-calendar-clock',
    link: '/schedules/my-schedule'
  },
  {
    title: 'Mes disponibilités',
    icon: 'mdi-calendar-check',
    link: '/teachers/my-availability'
  },
  {
    title: 'Mes cours',
    icon: 'mdi-book-open-variant',
    link: '/courses/my-courses'
  },
  {
    title: 'Réserver une salle',
    icon: 'mdi-door',
    link: '/reservations/new'
  },
  {
    title: 'Mon profil',
    icon: 'mdi-account',
    link: '/profile'
  }
];
```

---

## 🎯 Commandes Angular CLI

### Générer les composants
```bash
# Header
ng generate component shared/components/header --skip-tests

# Sidebar
ng generate component shared/components/sidebar --skip-tests

# Footer
ng generate component shared/components/footer --skip-tests

# Main Layout
ng generate component shared/layouts/main-layout --skip-tests

# Shared Module
ng generate module shared
```

### Générer les services
```bash
# Navigation Service
ng generate service shared/services/navigation --skip-tests

# Layout Service
ng generate service shared/services/layout --skip-tests
```

---

## 📦 Dépendances à Installer

### Material Design Icons
```bash
npm install @mdi/font
```

### Bootstrap (si pas déjà installé)
```bash
npm install bootstrap
```

### ng-bootstrap
```bash
npm install @ng-bootstrap/ng-bootstrap
```

---

## 🎨 Adaptation des Couleurs IUSJ

### Remplacer dans `_variables.scss`
```scss
// Couleur principale IUSJ (Violet)
$primary: #667eea;  // Au lieu de #b66dff

// Gradient principal IUSJ
$primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// Autres couleurs IUSJ
$secondary: #4facfe;
$success: #43e97b;
$warning: #fee140;
$danger: #f5576c;
```

---

## ✅ Checklist de Migration

### Assets
- [x] Copier SCSS
- [x] Copier images
- [ ] Adapter les variables de couleurs
- [ ] Intégrer dans styles.scss

### Composants Shared
- [ ] Créer HeaderComponent
- [ ] Créer SidebarComponent
- [ ] Créer FooterComponent
- [ ] Créer MainLayoutComponent
- [ ] Créer SharedModule

### Services
- [ ] NavigationService (gestion menu)
- [ ] LayoutService (toggle sidebar, etc.)

### Routing
- [ ] Configurer MainLayout dans routing
- [ ] Configurer routes protégées

### Tests
- [ ] Tester responsive
- [ ] Tester navigation
- [ ] Tester dropdowns
- [ ] Tester toggle sidebar

---

## 📝 Notes Importantes

1. **Material Design Icons** : Le template utilise `@mdi/font`. À installer.

2. **Bootstrap** : Le template utilise Bootstrap 4. Considérer la migration vers Bootstrap 5.

3. **Responsive** : Le template est responsive avec breakpoints :
   - Mobile : < 768px
   - Tablet : 768px - 1024px
   - Desktop : > 1024px

4. **Sidebar Modes** :
   - Normal : 260px
   - Icon-only : 70px
   - Hidden : 0px (mobile)

5. **Navbar Height** : 70px fixe

6. **Fonts** : Ubuntu (light, regular, medium, bold)

---

## 🚀 Prochaine Action

**Commencer par** :
1. Installer les dépendances manquantes
2. Adapter `styles.scss` pour importer les styles
3. Créer les composants shared avec Angular CLI
4. Adapter les templates HTML
5. Tester le layout

---

**Migration en cours - 23 novembre 2025** 🎨
