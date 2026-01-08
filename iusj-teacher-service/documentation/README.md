# 👨‍🏫 IUSJ Teacher Service

Service Spring Boot dédié à la gestion des enseignants dans l'architecture microservices IUSJ.

## 🚀 Endpoints

Base path : `/api/teachers`

- `GET /api/teachers` : liste des enseignants
- `GET /api/teachers/{id}` : détail
- `POST /api/teachers` : création
- `PUT /api/teachers/{id}` : mise à jour
- `DELETE /api/teachers/{id}` : suppression
- `GET /api/teachers/by-status/{status}` : filtrer par statut (`ACTIVE`, `INACTIVE`, `EN_CONGE`)
- `GET /api/teachers/by-grade/{grade}` : filtrer par grade (`ASSISTANT`, `CHEF_TRAVAUX`, `PROFESSEUR`)
- `GET /api/teachers/search?nom=&prenom=&specialite=&email=` : recherche multi-critères

## 🧩 Modèle

```json
{
  "id": 1,
  "nom": "Doe",
  "prenom": "Jane",
  "email": "jane.doe@iusj.ci",
  "telephone": "0611223344",
  "specialite": "Mathématiques",
  "grade": "PROFESSEUR",
  "status": "ACTIVE"
}
```

## ⚙️ Configuration

- Application name : `iusj-teacher-service`
- Port : `8083`
- Base de données : `bd_tutore` (MySQL)
- Eureka client activé (defaultZone `http://localhost:8761/eureka/`)

## 🔒 Sécurité

- Filtre Spring Security allégé (toutes les routes sont autorisées côté service ; la protection JWT est effectuée au niveau Gateway)

## ✅ Prêt pour l'intégration Gateway

- Route attendue : `/api/teachers/**` vers `lb://iusj-teacher-service`
- JWT filtré au niveau Gateway (filtres globaux existants)
