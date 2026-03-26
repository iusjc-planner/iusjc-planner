# 🚀 Guide de démarrage - Phase 1

## ✅ Checklist avant de démarrer

- [ ] Node.js installé (v18+)
- [ ] npm ou yarn installé
- [ ] Angular CLI installé (`npm install -g @angular/cli`)
- [ ] Code source téléchargé

## 📦 Installation

### 1. Installer les dépendances
```bash
npm install
```

### 2. Vérifier l'installation
```bash
ng version
```

Vous devriez voir Angular 20.x.x

## 🎯 Démarrer l'application

### Mode développement
```bash
ng serve
# ou
npm start
```

L'application sera accessible à : **http://localhost:4200**

### Mode production
```bash
ng build --configuration production
```

Les fichiers compilés seront dans `dist/sakai-ng`

## 🔐 Tester la connexion

### Accédez à la page de login
1. Ouvrez http://localhost:4200/auth/login
2. Utilisez l'un des comptes de test :

**Admin** :
```
Email : admin@iusjc.com
Mot de passe : admin123
```

**Enseignant** :
```
Email : prof@iusjc.com
Mot de passe : prof123
```

3. Cliquez sur "Se connecter"
4. Vous serez redirigé vers le dashboard

## 🎨 Tester le configurateur de thème

1. Cliquez sur l'icône palette (🎨) dans la topbar
2. Testez les options :
   - Couleurs primaires (16 options)
   - Couleurs de surface (8 options)
   - Presets (Aura, Lara, Nora)
   - Mode menu (Static, Overlay)
3. Cliquez sur l'icône lune/soleil pour basculer le mode sombre

## 📱 Tester le responsive

1. Ouvrez les DevTools (F12)
2. Activez le mode responsive (Ctrl+Shift+M)
3. Testez sur différentes résolutions :
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)

## 🧪 Tester les composants

### Dashboard
- Accédez à http://localhost:4200/dashboard
- Vérifiez l'affichage des cartes statistiques
- Vérifiez le graphique
- Vérifiez le tableau d'activités

### Navigation
- Cliquez sur les items du menu latéral
- Vérifiez que les routes fonctionnent (même si les pages n'existent pas encore)

### Topbar
- Testez le configurateur de thème
- Testez le toggle dark/light mode
- Testez le bouton utilisateur

## 🐛 Dépannage

### Port 4200 déjà utilisé
```bash
ng serve --port 4300
```

### Erreur "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erreur de compilation
```bash
ng serve --poll=2000
```

## 📊 Structure des fichiers créés

```
src/
├── app/
│   ├── app.component.ts
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── layout/
│   │   ├── auth-layout/
│   │   ├── main-layout/
│   │   ├── topbar/
│   │   ├── sidebar/
│   │   ├── footer/
│   │   ├── configurator/
│   │   └── services/
│   └── pages/
│       ├── auth/login/
│       ├── dashboard/
│       └── notfound/
├── styles.scss
└── index.html
```

## 🔍 Vérifier que tout fonctionne

### Checklist de validation

- [ ] Application démarre sans erreur
- [ ] Page de login s'affiche
- [ ] Connexion avec admin@iusjc.com fonctionne
- [ ] Dashboard s'affiche après connexion
- [ ] Configurateur de thème fonctionne
- [ ] Mode sombre/clair fonctionne
- [ ] Menu latéral s'affiche
- [ ] Responsive design fonctionne
- [ ] Pas d'erreurs dans la console

## 📝 Commandes utiles

```bash
# Démarrer le serveur de développement
ng serve

# Build production
ng build --configuration production

# Linter
ng lint

# Tests unitaires
ng test

# Tests E2E
ng e2e

# Générer un composant
ng generate component pages/mon-composant

# Générer un service
ng generate service services/mon-service

# Générer un guard
ng generate guard guards/mon-guard
```

## 🎓 Ressources d'apprentissage

- [Angular 20 Documentation](https://angular.dev)
- [PrimeNG Components](https://primeng.org)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)

## 💡 Tips

1. **Hot reload** : Les modifications sont automatiquement rechargées
2. **DevTools** : Utilisez les Angular DevTools pour déboguer
3. **Console** : Vérifiez la console du navigateur pour les erreurs
4. **Network** : Vérifiez l'onglet Network pour les requêtes API

## 🆘 Besoin d'aide ?

Si vous rencontrez des problèmes :
1. Vérifiez les erreurs dans la console
2. Vérifiez les logs du serveur
3. Essayez de nettoyer et réinstaller (`rm -rf node_modules && npm install`)
4. Redémarrez le serveur de développement

---

**Bon développement ! 🚀**

Pour la prochaine phase, consultez `PHASE1_README.md`
