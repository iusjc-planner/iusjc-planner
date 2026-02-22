# Gestion des Disponibilités Enseignants - Documentation

## 📋 Vue d'ensemble

Cette fonctionnalité permet de gérer les disponibilités des enseignants via:
1. Import automatique depuis Google Calendar (fichiers ICS)
2. Saisie manuelle des disponibilités
3. Affichage d'une grille hebdomadaire

## 🔄 Flow complet : Import Google Calendar

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FLOW D'IMPORT ICS                               │
└─────────────────────────────────────────────────────────────────────────┘

1. ENSEIGNANT
   ├── Ouvre Google Calendar (calendar.google.com)
   ├── Va dans Paramètres > Import & Export
   ├── Clique sur "Exporter" pour télécharger le fichier .ics
   └── Envoie le fichier à l'administrateur (email, drive, etc.)

2. ADMINISTRATEUR
   ├── Se connecte à l'application (/app/teachers)
   ├── Sélectionne un enseignant
   ├── Va sur "Disponibilités" (/app/teachers/{id}/availability)
   ├── Upload le fichier .ics reçu
   └── Clique sur "Importer les indisponibilités"

3. BACKEND (teacher-service)
   ├── Reçoit le fichier multipart/form-data
   ├── Parse le fichier ICS avec ical4j
   ├── Extrait tous les événements (VEVENT)
   ├── Convertit en TeacherAvailability (indisponibilités)
   └── Stocke en base de données

4. FRONTEND
   ├── Affiche la grille hebdomadaire mise à jour
   └── Liste les indisponibilités ponctuelles
```

## 📁 Structure des fichiers

### Backend (iusj-teacher-service)

```
src/main/java/com/example/iusj_teacher_service/
├── entities/
│   ├── Teacher.java                    # Entité enseignant existante
│   └── TeacherAvailability.java        # NOUVELLE entité disponibilité
├── repository/
│   ├── TeacherRepository.java          # Repository existant
│   └── TeacherAvailabilityRepository.java  # NOUVEAU repository
├── services/
│   ├── TeacherService.java             # Service existant
│   ├── TeacherAvailabilityService.java # NOUVEAU service disponibilités
│   └── IcsParserService.java           # NOUVEAU parser ICS
└── controller/
    ├── TeacherController.java          # Contrôleur existant
    └── TeacherAvailabilityController.java  # NOUVEAU contrôleur
```

### Frontend (frontend/src/app)

```
├── shared/models/
│   └── teacher.model.ts               # Types mis à jour (TeacherAvailability, etc.)
├── core/services/
│   └── teacher.service.ts             # Méthodes API ajoutées
└── features/teachers/
    └── teacher-availability/
        ├── teacher-availability.component.ts   # Composant mis à jour
        └── teacher-availability.component.html # Template avec upload ICS
```

## 🗃️ Modèle de données

### Table `teacher_availability`

| Colonne | Type | Description |
|---------|------|-------------|
| id | BIGINT | Clé primaire |
| teacher_id | BIGINT | FK vers teachers |
| availability_type | ENUM | WEEKLY_RECURRING, SPECIFIC_DATE, DATE_RANGE |
| status | ENUM | AVAILABLE, UNAVAILABLE, PREFERRED |
| day_of_week | INT | 1=Lundi, 7=Dimanche (pour récurrent) |
| start_time | TIME | Heure de début |
| end_time | TIME | Heure de fin |
| specific_date | DATE | Date spécifique |
| end_date | DATE | Fin de période |
| reason | VARCHAR(255) | Description/motif |
| ics_event_uid | VARCHAR(255) | UID événement ICS (évite doublons) |
| from_ics_import | BOOLEAN | Indicateur import ICS |

## 🔌 API Endpoints

### Disponibilités

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/teachers/{id}/availability` | Liste toutes les disponibilités |
| GET | `/api/teachers/{id}/availability/grid` | Grille hebdomadaire formatée |
| GET | `/api/teachers/{id}/availability/exceptions` | Indisponibilités ponctuelles |
| POST | `/api/teachers/{id}/availability` | Créer manuellement |
| POST | `/api/teachers/{id}/availability/import-ics` | Import fichier ICS |
| PUT | `/api/teachers/{id}/availability/{avId}` | Modifier |
| DELETE | `/api/teachers/{id}/availability/{avId}` | Supprimer |
| DELETE | `/api/teachers/{id}/availability/ics-imported` | Supprimer imports ICS |
| GET | `/api/teachers/{id}/availability/check` | Vérifier disponibilité |

### Exemple d'import ICS (Postman/curl)

```bash
curl -X POST "http://localhost:8080/api/teachers/1/availability/import-ics" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -F "file=@calendrier.ics" \
  -F "replaceExisting=true"
```

**Réponse:**
```json
{
  "success": true,
  "message": "12 indisponibilités importées avec succès",
  "importedCount": 12,
  "totalParsed": 15,
  "skippedDuplicates": 3
}
```

## 🎨 Interface utilisateur

### Page Disponibilités (`/app/teachers/{id}/availability`)

1. **Section Import ICS**
   - Instructions pour exporter depuis Google Calendar
   - Zone d'upload de fichier (.ics)
   - Option "Remplacer les imports précédents"
   - Boutons : Importer / Annuler / Supprimer tous les imports

2. **Grille Hebdomadaire**
   - 6 colonnes (Lundi à Samedi)
   - 9 créneaux horaires (8h-17h)
   - Codes couleur :
     - 🟢 Vert : Disponible
     - 🔴 Rouge : Indisponible
     - 🟠 Orange : Cours planifié
     - 🔵 Bleu : Préféré
     - ⚪ Gris : Pause déjeuner

3. **Liste des Exceptions**
   - Dates spécifiques d'indisponibilité
   - Périodes (ex: vacances)
   - Actions : Supprimer

## 📝 Format ICS supporté

Le parser supporte les fichiers iCalendar standard (.ics) :

```ics
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Google Inc//Google Calendar//EN
BEGIN:VEVENT
DTSTART:20250115T140000Z
DTEND:20250115T160000Z
SUMMARY:Réunion département
UID:abc123@google.com
END:VEVENT
BEGIN:VEVENT
DTSTART;VALUE=DATE:20250120
DTEND;VALUE=DATE:20250125
SUMMARY:Vacances
UID:xyz789@google.com
END:VEVENT
END:VCALENDAR
```

### Types d'événements parsés

| Type ICS | Type dans l'app | Description |
|----------|-----------------|-------------|
| Événement avec heure | SPECIFIC_DATE | Indisponibilité ponctuelle |
| Événement toute la journée | SPECIFIC_DATE ou DATE_RANGE | Journée ou période |
| Événement récurrent (RRULE) | WEEKLY_RECURRING | Hebdomadaire |

## ⚙️ Configuration

### Dépendance Maven (pom.xml)

```xml
<!-- Parser ICS -->
<dependency>
    <groupId>org.mnode.ical4j</groupId>
    <artifactId>ical4j</artifactId>
    <version>3.2.14</version>
</dependency>
```

### Fuseau horaire

Le parser utilise `Europe/Paris` par défaut. Configurable dans `IcsParserService.java` :

```java
private static final ZoneId DEFAULT_TIMEZONE = ZoneId.of("Europe/Paris");
```

## 🚀 Démarrage

1. **Redémarrer le service teacher** pour charger les nouvelles entités :
   ```bash
   cd iusj-teacher-service
   mvn spring-boot:run
   ```

2. **La table sera créée automatiquement** (Hibernate ddl-auto)

3. **Accéder à l'interface** : `http://localhost:4200/app/teachers/{id}/availability`

## 🔍 Debugging

### Logs utiles

```java
// Dans IcsParserService
logger.info("Fichier ICS parsé: {} événements extraits", availabilities.size());
logger.warn("Événement ignoré (hors heures de travail): {}", eventSummary);
```

### Vérifier les imports en base

```sql
SELECT * FROM teacher_availability 
WHERE teacher_id = 1 
AND from_ics_import = true 
ORDER BY specific_date;
```
