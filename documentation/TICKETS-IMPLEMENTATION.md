# Tickets d'implementation backend - suivi d'avancement

Date de mise a jour: 25 Mars 2026  
Perimetre: backend microservices + integratons externes requises

---

## 1. Vue globale

| Indicateur | Valeur |
|---|---|
| Nombre total de tickets backend | 17 |
| Tickets termines | 0 |
| Tickets en cours | 6 |
| Tickets a faire | 11 |
| Avancement global estime | 30-35% |

---

## 2. Statut detaille par ticket

| ID | Priorite | Statut | Completion | Prochaine action |
|---|---|---|---|---|
| BE-NOTIF-001 | P0 | En cours | 55% | Declenchements auto depuis planning/evenements/reservations |
| BE-EVENT-001 | P0 | A faire | 0% | Implementer entite, endpoints, integration salle |
| BE-REPORT-001 | P0 | A faire | 0% | Construire service rapports + export PDF/Excel |
| BE-SUPPORT-001 | P0 | A faire | 10% | Normaliser Support en entite dediee |
| BE-EDT-001 | P1 | En cours | 40% | Aligner modele EDT metier (semaine/periode/vue) |
| BE-SCHED-001 | P1 | En cours | 45% | Completer generation EDT selon contraintes |
| BE-SCHED-002 | P1 | A faire | 10% | Export planning PDF/Excel |
| BE-GROUP-001 | P1 | A faire | 20% | Ajouter relation filiere-groupe |
| BE-GROUP-002 | P1 | A faire | 0% | Implementer logique Diviser() |
| BE-ROOM-001 | P2 | A faire | 25% | Revoir relation salle-equipements |
| BE-RESOURCE-001 | P2 | A faire | 20% | Reservation equipements metier |
| BE-VALID-001 | P2 | En cours | 50% | Durcir validations capacite/contraintes |
| BE-VALID-002 | P2 | A faire | 20% | Publication EDT avec validation finale |
| BE-AUTH-001 | P2 | En cours | 60% | Harmoniser roles + reset password |
| BE-TEST-001 | P3 | A faire | 15% | Monter couverture tests backend |
| BE-DOC-001 | P3 | En cours | 50% | Finaliser Postman + scenarios |
| BE-AUDIT-001 | P3 | A faire | 20% | Audit log transversal |

---

## 3. Tickets restants a completer en priorite

### P0 - Critique

1. BE-EVENT-001
2. BE-REPORT-001
3. BE-SUPPORT-001
4. Finalisation BE-NOTIF-001

### P1 - Haute

1. BE-EDT-001
2. BE-SCHED-001
3. BE-SCHED-002
4. BE-GROUP-001
5. BE-GROUP-002

---

## 4. Dependances externes bloquantes

Ces dependances doivent etre configurees pour fermer les tickets critiques.

| Domaine | Besoin | Tickets impactes |
|---|---|---|
| Email SMTP | reset password + notifications email | BE-AUTH-001, BE-NOTIF-001 |
| Stockage supports | stockage fichiers pedagogiques | BE-SUPPORT-001 |
| Export docs | moteur PDF/Excel | BE-REPORT-001, BE-SCHED-002 |
| Messaging async (recommande) | orchestration evenements -> notifications | BE-NOTIF-001, BE-EVENT-001 |
| Observabilite | logs/traces/metrics inter-services | BE-AUDIT-001, BE-TEST-001 |

---

## 5. Plan sprint recommande

### Sprint A (P0 critique)

- Finaliser BE-NOTIF-001
- Lancer BE-EVENT-001
- Lancer BE-REPORT-001
- Demarrer BE-SUPPORT-001
- Mettre SMTP en place (dev + prod strategy)

### Sprint B (P1 planning)

- BE-EDT-001
- BE-SCHED-001
- BE-SCHED-002
- BE-GROUP-001
- BE-GROUP-002

### Sprint C (stabilisation)

- BE-ROOM-001
- BE-RESOURCE-001
- BE-VALID-001
- BE-VALID-002
- BE-AUTH-001 (cloture)

### Sprint D (qualite)

- BE-TEST-001
- BE-DOC-001
- BE-AUDIT-001

---

## 6. Definition de termine (DoD) backend

Un ticket backend est considere termine uniquement si:

1. Implementation fonctionnelle validee.
2. Endpoint(s) documentes et testes.
3. Integration gateway/eureka verifiee.
4. Logs et gestion d'erreurs presentes.
5. Cas critiques couverts par tests.
6. Documentation maj (audit + ticket + API).
