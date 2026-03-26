# Guide de demarrage rapide - IUSJ Planner

Date de mise a jour: 25 Mars 2026

---

## 1. Prerequis

- Java 17+
- Maven 3.6+
- Node.js 18+ et npm
- Base de donnees compatible avec la configuration des services
- PowerShell (Windows)

Verification rapide:

```bash
java -version
mvn -version
node -v
npm -v
```

---

## 2. Preparation

1. Se placer a la racine du projet.
2. Verifier la presence du fichier `.env`.
3. Ajuster les variables (DB, secrets, etc.) selon l'environnement local.

Variables a prevoir selon usage:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` (si applicable)
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM` (si email active)

---

## 3. Demarrage recommande (script unique)

Depuis la racine:

```powershell
.\start-services.ps1
```

Comportement:

- Demarre Eureka en premier.
- Demarre les microservices metier.
- Demarre Notification Service.
- Demarre Gateway.
- Demarre le frontend cible `/web` par defaut.

Option legacy (temporaire):

```powershell
.\start-services.ps1 -UseLegacyFrontend
```

Cela lance `/frontend` a la place de `/web`.

---

## 4. URLs utiles

- Frontend cible web: `http://localhost:4200`
- API Gateway: `http://localhost:8080`
- Eureka: `http://localhost:8761`

Services principaux:

- Auth: `http://localhost:8082`
- User: `http://localhost:8081`
- Teacher: `http://localhost:8083`
- Room: `http://localhost:8084`
- Course: `http://localhost:8085`
- Schedule: `http://localhost:8086`
- School: `http://localhost:8087`
- Group: `http://localhost:8088`
- Student: `http://localhost:8089`
- Resource: `http://localhost:8090`
- Notification: `http://localhost:8092`

---

## 5. Verification rapide

1. Ouvrir Eureka et verifier que les services sont `UP`.
2. Tester la gateway:

```bash
curl http://localhost:8080/actuator/health
```

3. Tester un endpoint API:

```bash
curl http://localhost:8080/api/users
```

---

## 6. Arret propre

```powershell
.\stop-services.ps1
```

Le script:

- Arrete les processus Java IUSJ identifies.
- Arrete les processus Node associes aux frontends projet.
- Libere les ports applicatifs standards.

---

## 7. Limitations connues (etat actuel)

1. Flux mot de passe oublie/reset a finaliser.
2. SMTP non actif par defaut sans configuration explicite.
3. Reporting/export metier encore partiel.
4. Integration metier complete des notifications encore en progression.

---

## 8. References

- `AUDIT-BACKEND.md`
- `API-Services.md`
- `TICKETS-IMPLEMENTATION.md`
- `tickets/README.md`
- `AUDIT-FRONTEND-WEB.md`
- `PLAN-MIGRATION-FRONTEND-WEB.md`
- `tickets/README-FRONTEND.md`
