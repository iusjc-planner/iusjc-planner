# Tickets d'Implementation Backend - IUSJ Planner

## Vue d'ensemble

Ce dossier contient tous les tickets d'implementation pour le backend du systeme IUSJ Planner.
Ces tickets sont bases sur l'audit du backend (voir [AUDIT-BACKEND.md](../AUDIT-BACKEND.md)) et visent a atteindre la conformite complete avec les exigences du projet.

**Date de creation** : 24 Mars 2026
**Nombre total de tickets** : 17
**Effort total estime** : 41 jours

---

## Index des Tickets

### P0 - Priorite Critique (14 jours)

| ID | Titre | Delai | Module |
|----|-------|-------|--------|
| [BE-NOTIF-001](./BE-NOTIF-001.md) | Service Notification complet | 4d | Notification |
| [BE-EVENT-001](./BE-EVENT-001.md) | Service Evenement complet | 3d | Evenement |
| [BE-REPORT-001](./BE-REPORT-001.md) | Service Rapport avec export | 5d | Rapport |
| [BE-SUPPORT-001](./BE-SUPPORT-001.md) | Entite Support separee | 2d | Cours |

### P1 - Priorite Haute (11.5 jours)

| ID | Titre | Delai | Module |
|----|-------|-------|--------|
| [BE-EDT-001](./BE-EDT-001.md) | Entite EDT avec semaine/periode/vue | 2d | Schedule |
| [BE-SCHED-001](./BE-SCHED-001.md) | Generation automatique EDT | 4d | Schedule |
| [BE-SCHED-002](./BE-SCHED-002.md) | Export PDF/Excel des EDT | 3d | Schedule |
| [BE-GROUP-001](./BE-GROUP-001.md) | Relation Groupe-Filiere | 1d | Groupe |
| [BE-GROUP-002](./BE-GROUP-002.md) | Methode Diviser() pour groupes | 1.5d | Groupe |

### P2 - Priorite Moyenne (7.5 jours)

| ID | Titre | Delai | Module |
|----|-------|-------|--------|
| [BE-ROOM-001](./BE-ROOM-001.md) | Relation ManyToMany Salle-Equipement | 2d | Salle |
| [BE-RESOURCE-001](./BE-RESOURCE-001.md) | Reservation d'equipements | 2d | Ressource |
| [BE-VALID-001](./BE-VALID-001.md) | Validation capacite salle vs groupe | 1d | Schedule |
| [BE-VALID-002](./BE-VALID-002.md) | Publication EDT avec validation | 1.5d | Schedule |
| [BE-AUTH-001](./BE-AUTH-001.md) | Harmonisation roles auth/user | 1d | Auth |

### P3 - Priorite Basse (8 jours)

| ID | Titre | Delai | Module |
|----|-------|-------|--------|
| [BE-TEST-001](./BE-TEST-001.md) | Tests unitaires (>70% couverture) | 5d | Qualite |
| [BE-DOC-001](./BE-DOC-001.md) | Generation collection Postman | 1d | Documentation |
| [BE-AUDIT-001](./BE-AUDIT-001.md) | Implementation logs d'audit | 2d | Securite |

---

## Diagramme de Dependances

```
                    ┌─────────────────┐
                    │  BE-AUTH-001    │
                    │  (standalone)   │
                    └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  BE-NOTIF-001   │────>│  BE-EVENT-001   │────>│  BE-REPORT-001  │
│  (Notification) │     │  (Evenement)    │     │  (Rapport)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│  BE-SUPPORT-001 │────>│   BE-DOC-001    │
│  (Support)      │     │   (Postman)     │
└─────────────────┘     └─────────────────┘

┌─────────────────┐
│   BE-EDT-001    │
│   (Entite EDT)  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    v         v
┌─────────┐  ┌─────────────┐
│BE-SCHED │  │ BE-SCHED    │
│  -001   │  │   -002      │
│(Generer)│  │ (Export)    │
└────┬────┘  └──────┬──────┘
     │              │
     v              v
┌─────────┐  ┌─────────────┐
│BE-VALID │  │ BE-VALID    │
│  -001   │  │   -002      │
│(Capacite│  │ (Publier)   │
└─────────┘  └─────────────┘

┌─────────────────┐     ┌─────────────────┐
│  BE-GROUP-001   │────>│  BE-GROUP-002   │
│  (Filiere)      │     │  (Diviser)      │
└─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│  BE-ROOM-001    │────>│ BE-RESOURCE-001 │
│  (Equipement)   │     │  (Reservation)  │
└─────────────────┘     └─────────────────┘

┌─────────────────┐
│  BE-AUDIT-001   │
│  (standalone)   │
└─────────────────┘

        ┌─────────────────────────────────┐
        │         BE-TEST-001             │
        │   (depend de tous les autres)   │
        └─────────────────────────────────┘
```

---

## Tickets par Module

### Module Notification
- BE-NOTIF-001: Service Notification complet

### Module Evenement
- BE-EVENT-001: Service Evenement complet

### Module Rapport
- BE-REPORT-001: Service Rapport avec export PDF/Excel

### Module Cours
- BE-SUPPORT-001: Entite Support

### Module Schedule/EDT
- BE-EDT-001: Entite EDT
- BE-SCHED-001: Generation automatique
- BE-SCHED-002: Export PDF/Excel
- BE-VALID-001: Validation capacite
- BE-VALID-002: Publication

### Module Groupe
- BE-GROUP-001: Relation Filiere
- BE-GROUP-002: Division

### Module Salle/Ressource
- BE-ROOM-001: Relation Equipement
- BE-RESOURCE-001: Reservation

### Module Auth/Securite
- BE-AUTH-001: Harmonisation roles
- BE-AUDIT-001: Logs d'audit

### Qualite/Documentation
- BE-TEST-001: Tests unitaires
- BE-DOC-001: Collection Postman

---

## Statut Global

| Statut | Nombre | Pourcentage |
|--------|--------|-------------|
| A faire | 17 | 100% |
| En cours | 0 | 0% |
| Termine | 0 | 0% |

**Derniere mise a jour** : 24 Mars 2026

---

## Ordre d'Execution Recommande

1. **Sprint 1** (P0 - 14j) : BE-NOTIF-001 → BE-EVENT-001 → BE-REPORT-001 + BE-SUPPORT-001
2. **Sprint 2** (P1 - 11.5j) : BE-EDT-001 → BE-SCHED-001/002 + BE-GROUP-001 → BE-GROUP-002
3. **Sprint 3** (P2 - 7.5j) : BE-ROOM-001 → BE-RESOURCE-001 + BE-VALID-001/002 + BE-AUTH-001
4. **Sprint 4** (P3 - 8j) : BE-TEST-001 + BE-DOC-001 + BE-AUDIT-001
