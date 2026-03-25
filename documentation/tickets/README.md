# Tickets backend - index et avancement

Date de mise a jour: 25 Mars 2026

---

## 1. Resume

| Metrique | Valeur |
|---|---|
| Total tickets backend | 17 |
| En cours | 6 |
| A faire | 11 |
| Termines | 0 |
| Avancement global | 30-35% |

---

## 2. Index des tickets backend

### P0 - Critique

| ID | Titre | Statut | Completion |
|---|---|---|---|
| [BE-NOTIF-001](./BE-NOTIF-001.md) | Service Notification complet | En cours | 55% |
| [BE-EVENT-001](./BE-EVENT-001.md) | Service Evenement complet | A faire | 0% |
| [BE-REPORT-001](./BE-REPORT-001.md) | Service Rapport avec export | A faire | 0% |
| [BE-SUPPORT-001](./BE-SUPPORT-001.md) | Entite Support separee | A faire | 10% |

### P1 - Haute

| ID | Titre | Statut | Completion |
|---|---|---|---|
| [BE-EDT-001](./BE-EDT-001.md) | Entite EDT avec semaine/periode/vue | En cours | 40% |
| [BE-SCHED-001](./BE-SCHED-001.md) | Generation automatique EDT | En cours | 45% |
| [BE-SCHED-002](./BE-SCHED-002.md) | Export PDF/Excel des EDT | A faire | 10% |
| [BE-GROUP-001](./BE-GROUP-001.md) | Relation Groupe-Filiere | A faire | 20% |
| [BE-GROUP-002](./BE-GROUP-002.md) | Methode Diviser() pour groupes | A faire | 0% |

### P2 - Moyenne

| ID | Titre | Statut | Completion |
|---|---|---|---|
| [BE-ROOM-001](./BE-ROOM-001.md) | Relation ManyToMany Salle-Equipement | A faire | 25% |
| [BE-RESOURCE-001](./BE-RESOURCE-001.md) | Reservation d'equipements | A faire | 20% |
| [BE-VALID-001](./BE-VALID-001.md) | Validation capacite salle vs groupe | En cours | 50% |
| [BE-VALID-002](./BE-VALID-002.md) | Publication EDT avec validation | A faire | 20% |
| [BE-AUTH-001](./BE-AUTH-001.md) | Harmonisation roles auth/user + reset | En cours | 60% |

### P3 - Basse

| ID | Titre | Statut | Completion |
|---|---|---|---|
| [BE-TEST-001](./BE-TEST-001.md) | Tests unitaires backend | A faire | 15% |
| [BE-DOC-001](./BE-DOC-001.md) | Collection Postman | En cours | 50% |
| [BE-AUDIT-001](./BE-AUDIT-001.md) | Logs d'audit | A faire | 20% |

---

## 3. Tickets restant a completer (ordre recommande)

1. BE-NOTIF-001 (integration transverse)
2. BE-EVENT-001
3. BE-REPORT-001
4. BE-SUPPORT-001
5. BE-EDT-001
6. BE-SCHED-001
7. BE-SCHED-002

---

## 4. Services externes a configurer

| Service externe | Usage | Tickets concernes |
|---|---|---|
| SMTP (MailHog/SendGrid/SES) | Mot de passe oublie + notifications email | BE-AUTH-001, BE-NOTIF-001 |
| Stockage fichiers (local/S3/MinIO) | Supports pedagogiques | BE-SUPPORT-001 |
| Export engine PDF/Excel | Rapports et EDT exportables | BE-REPORT-001, BE-SCHED-002 |
| Broker messages (RabbitMQ/Kafka, recommande) | Evenements metier -> notifications | BE-NOTIF-001, BE-EVENT-001 |
| Observabilite (logs/metrics/traces) | Pilotage production | BE-AUDIT-001, BE-TEST-001 |

---

## 5. Liens de pilotage

- Audit backend: ../AUDIT-BACKEND.md
- Avancement tickets backend: ../TICKETS-IMPLEMENTATION.md
- Audit frontend/web: ../AUDIT-FRONTEND-WEB.md
- Plan migration frontend vers web: ../PLAN-MIGRATION-FRONTEND-WEB.md
- Tickets frontend web: ./README-FRONTEND.md
