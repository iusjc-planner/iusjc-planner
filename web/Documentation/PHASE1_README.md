# Phase 1 - Authentification & Dashboard

## 📋 Résumé

Phase 1 du projet de gestion des emplois du temps et réservations de salles. Cette phase couvre :
- ✅ Page de connexion (Login)
- ✅ Dashboard (Admin & Enseignant)
- ✅ Layout principal (Topbar, Sidebar, Footer)
- ✅ Configurateur de thème (dark/light, couleurs, presets)
- ✅ Navigation de base

## 🏗️ Structure du projet

```
src/
├── app/
│   ├── app.component.ts          # Composant racine
│   ├── app.config.ts             # Configuration Angular
│   ├── app.routes.ts             # Routes principales
│   ├── layout/
│   │   ├── auth-layout/          # Layout pour pages auth
│   │   ├── main-layout/          # Layout principal
│   │   ├── topbar/               # Barre supérieure
│   │   ├── sidebar/              # Menu latéral
│   │   ├── footer/               # Pied de page
│   │   ├── configurator/         # Configurateur de thème
│   │   └── services/
│   │       └── layout.service.ts # Service de gestion du layout
│   └── pages/
│       ├── auth/
│       │   └── login/            # Page de connexion
│       ├── dashboard/            # Tableau de bord
│       └── notfound/             # Page 404
├── styles.scss                   # Styles globaux
└── index.html                    # HTML principal
```

## 🚀 Démarrage

### Installation
```bash
npm install
```

### Développement
```bash
ng serve
# ou
npm start
```

L'application sera accessible à `http://localhost:4200`

### Build production
```bash
ng build --configuration production
```

## 🔐 Authentification (Démo)

Pour tester la connexion, utilisez les credentials suivants :

**Administrateur** :
- Email : `admin@iusjc.com`
- Mot de passe : `admin123`

**Enseignant** :
- Email : `prof@iusjc.com`
- Mot de passe : `prof123`

> ⚠️ Ces credentials sont pour la démo uniquement. À remplacer par une vraie authentification backend.

## 🎨 Configurateur de thème

Le configurateur est accessible via l'icône palette dans la topbar. Il permet de :
- Changer la couleur primaire (16 options)
- Changer la couleur de surface (8 options)
- Basculer entre les presets (Aura, Lara, Nora)
- Changer le mode du menu (Static, Overlay)
- Basculer le mode sombre/clair

## 📱 Responsive Design

L'application est responsive et s'adapte à tous les écrans :
- **Mobile** (< 576px) : Menu overlay, layout adapté
- **Tablet** (576px - 992px) : Menu réduit
- **Desktop** (> 992px) : Layout complet

## 🧩 Composants PrimeNG utilisés

- `p-button` : Boutons
- `p-inputText` : Champs texte
- `p-password` : Champs mot de passe
- `p-card` : Cartes
- `p-table` : Tableaux
- `p-chart` : Graphiques
- `p-message` : Messages d'erreur
- `p-selectButton` : Boutons de sélection

## 📊 Dashboard

Le dashboard affiche :
- **Cartes statistiques** : Cours, salles, enseignants, groupes
- **Graphique** : Utilisation des salles par jour
- **Tableau d'activités** : Activités récentes
- **Actions rapides** : Boutons pour créer/réserver

## 🔄 Services

### LayoutService
Gère l'état global du layout :
- `toggleDarkMode()` : Basculer le mode sombre
- `setPrimary(color)` : Changer la couleur primaire
- `setSurface(color)` : Changer la couleur de surface
- `setPreset(preset)` : Changer le preset
- `setMenuMode(mode)` : Changer le mode du menu

## 📝 Notes importantes

1. **Authentification** : Actuellement en mode démo. À intégrer avec le backend.
2. **Tokens** : Stockés dans localStorage (à adapter selon votre backend).
3. **Rôles** : Admin et Enseignant (à implémenter avec guards).
4. **Styles** : Utilise Tailwind CSS v4 + PrimeNG themes.

## 🔜 Prochaines étapes (Phase 2)

- Gestion des enseignants (CRUD)
- Intégration avec le backend
- Guards d'authentification
- Interceptors HTTP
- Gestion des erreurs

## 📚 Ressources

- [Angular Documentation](https://angular.dev)
- [PrimeNG Documentation](https://primeng.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [PrimeIcons](https://primeicons.org)

## 👨‍💻 Développement

Pour ajouter un nouveau composant :
```bash
ng generate component pages/mon-composant
```

Pour ajouter un nouveau service :
```bash
ng generate service services/mon-service
```

## 📄 Fichiers modifiés

- ✅ `src/` : Nouvelle structure créée
- ✅ `src-old/` : Ancien code sauvegardé

---

**Statut** : ✅ Phase 1 complétée
**Date** : 2026-02-01
**Prochaine phase** : Gestion des enseignants
