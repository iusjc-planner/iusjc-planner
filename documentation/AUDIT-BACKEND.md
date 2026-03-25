# Rapport d'audit backend - IUSJ Planner
## Projet Tutore ISI 4 FR 6 - Groupe 3

Date de l'audit: 25 Mars 2026  
Version du document: 2.0  
Auditeur: Copilot (analyse technique + documentaire)

---

## 1. Resume executif

Le backend est operationnel sur les fondations microservices (Eureka, Gateway, Auth, domaines principaux), mais n'est pas encore conforme a 100% aux exigences du projet.  
Le principal ecart n'est plus l'existence du service de notifications (qui existe), mais son niveau d'integration metier et l'absence de certains flux critiques (mot de passe oublie, rapports/export metier, parite UML complete).

### 1.1 Score global estime

| Critere | Statut | Score |
|---|---|---|
| Architecture microservices | Conforme | 90% |
| Entites et conformite UML | Partiellement conforme | 68% |
| Logique metier | Partiellement conforme | 64% |
| Securite et auth | Partiellement conforme | 78% |
| Conformite exigences UE_Projet Transversal ISI | Partiellement conforme | 62% |
| Integrations externes | Non conforme | 25% |

### 1.2 Points forts

- Gateway et routage centralises actifs.
- Eureka enregistre les services principaux.
- CRUD principal disponible sur plusieurs domaines.
- JWT et protections de routes presentes.
- Service Notification existant (entite, repository, controller, routes gateway).

### 1.3 Points critiques

- Flux mot de passe oublie/reset non implemente.
- Aucune integration SMTP explicite pour envois email transactionnels.
- Service reporting/export metier non livre.
- Generation/publishing EDT pas totalement conforme aux attentes metier.
- Ecart de modelisation entre diagramme et implementation (Support, EDT, Evenement, etc.).

---

## 2. Verifications majeures demandes

### 2.1 Notifications

Statut: Partiellement conforme

Constats:
- Le microservice existe et expose les endpoints notifications.
- Le gateway route correctement les chemins /api/notifications.
- Le script de demarrage principal ne lancait pas ce service (corrige dans cette vague).
- L'integration metier transverse (declenchements automatiques depuis les changements planning/evenement/reservation) reste a finaliser.

Conclusion:
- Ce n'est pas un service absent, mais un service partiellement integre dans les workflows.

### 2.2 Mot de passe oublie / reset password

Statut: Non conforme

Constats:
- Auth login JWT present.
- Aucun endpoint explicite de type forgot-password / reset-password detecte.
- Aucun mecanisme de token de reset, expiration, et validation de lien documente.

Conclusion:
- Fonctionnalite critique manquante pour production.

### 2.3 Mail / SMTP

Statut: Non conforme

Constats:
- Aucune configuration SMTP explicite detectee.
- Aucune strategie d'envoi email transactionnel formalisee (reset password, notifications email, confirmations).

Conclusion:
- L'integration email est un blocage pour les exigences de communication utilisateurs.

### 2.4 Rapports / export

Statut: Non conforme

Constats:
- Le besoin metier de rapports/export (PDF/Excel) est documente.
- Le service de rapport dedie n'est pas livre a maturite attendue.

Conclusion:
- Les exigences BF de reporting/export restent a implementer.

---

## 3. Cartographie d'avancement des tickets backend

Reference: dossier documentation/tickets

| Ticket | Statut reel | Niveau de completion | Blocage principal |
|---|---|---|---|
| ✅BE-NOTIF-001 | En cours | 55% | Integration metier transverse + canaux externes |
| ✅BE-EVENT-001 | A faire | 0% | Service/non fonctionnalites metier completes |
| ✅BE-REPORT-001 | A faire | 0% | Architecture/reporting/export non finalisee |
| ✅BE-SUPPORT-001 | A faire | 10% | Support encore majoritairement en liste simple |
| ✅BE-EDT-001 | En cours | 40% | Alignement EDM/entite EDT metier |
| ✅BE-SCHED-001 | En cours | 45% | Generation auto complete + contraintes avancees |
| ✅BE-SCHED-002 | A faire | 10% | Export operationnel absent |
| ✅BE-GROUP-001 | A faire | 20% | filiereId et relation metier incomplete |
| ✅BE-GROUP-002 | A faire | 0% | Diviser() non implemente |
| ✅BE-ROOM-001 | A faire | 25% | Equipements/reservations a normaliser |
| BE-RESOURCE-001 | A faire | 20% | Reservation equipements incomplete |
| BE-VALID-001 | En cours | 50% | Regles de validation capacite/cas limites |
| BE-VALID-002 | A faire | 20% | Publication EDT et validation globale |
| BE-AUTH-001 | En cours | 60% | Harmonisation roles + reset password |
| BE-TEST-001 | A faire | 15% | Couverture insuffisante |
| BE-DOC-001 | En cours | 50% | Collection Postman et scenarios manquants |
| BE-AUDIT-001 | A faire | 20% | Journalisation d'audit inegale |

### 3.1 Synthese chiffrée

- Termine: 0
- En cours: 6
- A faire: 11
- Avancement global estime: 30-35%

---

## 4. Services externes a configurer (obligatoire)

Ces composants doivent etre explicitement configures pour satisfaire les besoins production et les exigences de l'UE.

### 4.1 SMTP / Email provider

Objectif:
- Reset password (lien temporaire)
- Notifications email optionnelles
- Emails de confirmation systeme

Options:
- Dev/QA: MailHog ou Mailpit
- Production: SendGrid, AWS SES, SMTP institutionnel

Variables minimales:
- MAIL_HOST
- MAIL_PORT
- MAIL_USERNAME
- MAIL_PASSWORD
- MAIL_FROM
- MAIL_TLS_ENABLED

### 4.2 Stockage de fichiers supports

Objectif:
- Materiaux de cours et supports avec metadonnees robustes

Options:
- Local + volume dedie (dev)
- S3/MinIO/Blob storage (prod)

Variables minimales:
- STORAGE_PROVIDER
- STORAGE_BUCKET
- STORAGE_REGION
- STORAGE_ACCESS_KEY
- STORAGE_SECRET_KEY

### 4.3 Messagerie asynchrone (recommande)

Objectif:
- Decoupler evenements metier et notifications
- Eviter couplage synchrone fragile entre microservices

Options:
- RabbitMQ
- Kafka

Variables minimales:
- MQ_HOST
- MQ_PORT
- MQ_USERNAME
- MQ_PASSWORD

### 4.4 Observabilite minimale (recommande)

Objectif:
- Tracer les appels inter-services
- Diagnostiquer incidents prod

Options:
- Logs structures + centralisation (ELK/Loki)
- Metrics (Prometheus + Grafana)

---

## 5. Ecarts vis-a-vis des exigences projet

### 5.1 Exigences critiques non completes

- Mot de passe oublie/reset securise.
- Reporting/export PDF-Excel metier.
- Couverture complete des cas d'evenements.
- Integration metier des notifications a tous les workflows critiques.

### 5.2 Exigences partiellement couvertes

- EDT (generation/publication/export): base presente, couverture incomplete.
- Equipements/reservations: partiel.
- Cohabitation modeles UML et implementation microservices: partielle.

---

## 6. Recommandations prioritaires

### P0 (immediat)

1. Implementer forgot-password/reset-password (token, expiration, invalidation, anti-abus).
2. Brancher un provider SMTP de bout en bout.
3. Finaliser l'integration metier des notifications automatiques.
4. Ajouter les scripts/infra de demarrage qui incluent tous les services critiques.

### P1 (court terme)

1. Livrer le service de rapport (generation + export PDF/Excel).
2. Stabiliser le modele EDT et publication.
3. Completer relations groupe/filiere et reservations equipements.

### P2 (stabilisation)

1. Augmenter couverture tests.
2. Industrialiser observabilite.
3. Aligner documentation API/Postman sur l'etat reel.

---

## 7. Conclusion

Le backend IUSJ Planner est exploitable pour un socle de gestion, mais n'est pas pret pour une exploitation complete conforme aux exigences UE sans:

- le flux mot de passe oublie,
- une integration email/SMTP,
- une couche reporting/export,
- et une finalisation de plusieurs tickets metier critiques.

Le dossier tickets backend doit etre pilote par statut reel (et non seulement par existence des microservices), avec un suivi sprint base sur les blocages externes et inter-services.
