# BE-NOTIF-001 - Service Notification Complet

## Priorite
P0 - Critique

## Delai Estime
4 jours

## Dependances
Aucune

## Exigences Remplies
- **BF-067** : Notifier les participants aux evenements
- **Diagramme UML** : Classe Notification avec attributs id, type, contenu, date_envoi et methodes Consulter(), Supprimer()
- **Relation UML** : Utilisateur "1.." -- "1.." Notification : concerner

---

## Contexte (Audit)

Actuellement, le backend IUSJ Planner ne dispose d'aucun systeme de notification. Les utilisateurs ne sont pas alertes des :
- Changements d'emploi du temps
- Annulations de cours
- Evenements a venir
- Reservations de salles

Cette fonctionnalite est critique car elle impacte directement l'experience utilisateur et la communication au sein de l'etablissement.

**Etat actuel** : Service inexistant
**Impact** : Eleve - Les utilisateurs doivent verifier manuellement les changements

---

## Taches

### 1. Creation du microservice
- [ ] Creer le projet `iusj-notification-service` (Spring Boot)
- [ ] Configurer le port 8092
- [ ] Configurer Eureka Client
- [ ] Configurer la base de donnees MySQL (table `notifications`)
- [ ] Ajouter la route dans le Gateway

### 2. Entite Notification
- [ ] Creer l'entite `Notification.java` avec les attributs :
  - `id` (Long, auto-genere)
  - `type` (Enum: INFO, WARNING, ALERT, SCHEDULE_CHANGE, EVENT_REMINDER, RESERVATION)
  - `contenu` (String, max 500 caracteres)
  - `dateEnvoi` (LocalDateTime)
  - `userId` (Long, destinataire)
  - `lu` (Boolean, defaut false)
  - `sourceType` (String, ex: "SCHEDULE", "EVENT", "ROOM")
  - `sourceId` (Long, reference vers l'entite source)
- [ ] Ajouter les annotations JPA et validations

### 3. Repository
- [ ] Creer `NotificationRepository` extends JpaRepository
- [ ] Ajouter methodes :
  - `findByUserIdOrderByDateEnvoiDesc(Long userId)`
  - `findByUserIdAndLuFalse(Long userId)` (non lues)
  - `countByUserIdAndLuFalse(Long userId)` (compteur)

### 4. Service
- [ ] Creer `NotificationService` avec methodes :
  - `getAll(Long userId)` - Liste toutes les notifications d'un utilisateur
  - `getUnread(Long userId)` - Liste les non lues
  - `getUnreadCount(Long userId)` - Compte les non lues
  - `create(Notification notification)` - Cree une notification
  - `markAsRead(Long id)` - Marque comme lue
  - `markAllAsRead(Long userId)` - Marque toutes comme lues
  - `delete(Long id)` - Supprime une notification
  - `broadcast(Notification notification, List<Long> userIds)` - Envoie a plusieurs

### 5. Controller
- [ ] Creer `NotificationController` avec endpoints :
  - `GET /api/notifications` - Liste (avec filtre userId depuis JWT)
  - `GET /api/notifications/unread` - Liste non lues
  - `GET /api/notifications/count` - Compteur non lues
  - `POST /api/notifications` - Cree (admin only)
  - `PUT /api/notifications/{id}/read` - Marque comme lue
  - `PUT /api/notifications/read-all` - Marque toutes comme lues
  - `DELETE /api/notifications/{id}` - Supprime
  - `POST /api/notifications/broadcast` - Diffusion (admin only)

### 6. Integration inter-services (optionnel sprint suivant)
- [ ] Creer client REST pour appeler notification-service depuis :
  - schedule-service (changements EDT)
  - event-service (evenements)
  - room-service (reservations)

### 7. Configuration securite
- [ ] Configurer Spring Security
- [ ] Proteger les endpoints admin
- [ ] Permettre lecture des propres notifications

---

## Flow (Cas d'Utilisation Frontend)

### Scenario 1 : Consultation des notifications
1. L'utilisateur se connecte a l'application
2. Le dashboard affiche une icone cloche avec compteur de non-lues (appel `GET /api/notifications/count`)
3. L'utilisateur clique sur la cloche
4. Le dropdown affiche la liste des notifications recentes (appel `GET /api/notifications/unread`)
5. L'utilisateur clique sur une notification
6. La notification est marquee comme lue (appel `PUT /api/notifications/{id}/read`)
7. L'utilisateur est redirige vers la source (EDT, evenement, etc.)

### Scenario 2 : Diffusion d'une notification (Admin)
1. L'administrateur accede a la page "Notifications"
2. Il clique sur "Nouvelle notification"
3. Il remplit le formulaire (type, contenu, destinataires)
4. Il clique sur "Envoyer"
5. L'API `POST /api/notifications/broadcast` est appelee
6. Tous les destinataires recoivent la notification

### Scenario 3 : Notification automatique (changement EDT)
1. Un enseignant modifie un cours dans l'EDT
2. Le schedule-service detecte le changement
3. Il appelle `POST /api/notifications` avec type SCHEDULE_CHANGE
4. Les etudiants du groupe concerne recoivent la notification
5. Chaque etudiant voit la notification dans son dashboard

---

## Resultat Obtenu

Apres implementation :
- Un nouveau microservice `iusj-notification-service` est deploye sur le port 8092
- Les notifications sont stockees en base de donnees MySQL
- Les utilisateurs peuvent consulter leurs notifications via l'API
- Un compteur de notifications non lues est disponible
- Les administrateurs peuvent diffuser des notifications
- Le systeme est pret pour l'integration avec les autres services

---

## Criteres d'Acceptation

- [ ] Le service demarre sans erreur et s'enregistre aupres d'Eureka
- [ ] Les endpoints CRUD fonctionnent correctement
- [ ] Les notifications sont filtrees par utilisateur (JWT)
- [ ] Le compteur de non-lues est correct
- [ ] L'endpoint broadcast fonctionne pour les admins
- [ ] La securite est configuree (acces aux propres notifications uniquement)
- [ ] Les tests Postman passent

---

## Fichiers Impactes

### Nouveaux fichiers a creer
```
iusj-notification-service/
├── pom.xml
├── src/main/java/com/example/iusj_notification_service/
│   ├── IusjNotificationServiceApplication.java
│   ├── entities/
│   │   └── Notification.java
│   ├── repositories/
│   │   └── NotificationRepository.java
│   ├── services/
│   │   └── NotificationService.java
│   ├── controller/
│   │   └── NotificationController.java
│   └── config/
│       └── SecurityConfig.java
└── src/main/resources/
    └── application.yml
```

### Fichiers existants a modifier
```
iusj-gateway-service/src/main/resources/application.yml
  → Ajouter route pour notification-service
```

---

## Notes Techniques

- Type de notification : Utiliser un Enum pour les types predefininis
- Pagination : Implementer la pagination pour les listes longues
- WebSocket (futur) : Preparer l'architecture pour les notifications temps reel
- Retention : Prevoir une politique de suppression des anciennes notifications (ex: >30 jours)
