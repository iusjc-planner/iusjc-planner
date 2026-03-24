# BE-VALID-002 - Publication EDT avec Validation

## Priorite
P2 - Moyenne

## Delai Estime
1.5 jours

## Dependances
- BE-EDT-001 (Entite EDT avec status)

## Exigences Remplies
- **BF-059** : Publier l'emploi du temps
- **RG-010** : L'emploi du temps doit etre valide avant publication

---

## Contexte (Audit)

Actuellement, les seances sont directement visibles apres creation. Il n'y a pas de workflow de validation/publication :
- Pas de status brouillon
- Pas de phase de validation
- Pas de publication officielle

Cela peut causer des problemes :
- Etudiants voient des EDT incomplets
- Modifications frequentes sans controle
- Pas de point de reference "officiel"

**Etat actuel** : Pas de workflow publication
**Impact** : Moyen - EDT potentiellement incomplets visibles

---

## Taches

### 1. Workflow de status EDT
- [ ] Definir les status : DRAFT, VALIDATED, PUBLISHED, ARCHIVED
- [ ] Transitions autorisees :
  - DRAFT → VALIDATED (apres validation complete)
  - VALIDATED → PUBLISHED (publication officielle)
  - PUBLISHED → ARCHIVED (fin de periode)
  - VALIDATED → DRAFT (corrections necessaires)

### 2. Validation complete
- [ ] Creer `EDTValidationService` qui verifie :
  - Tous les cours planifies (pas de cours manquants)
  - Aucun conflit (enseignant, salle, groupe)
  - Capacites respectees
  - Disponibilites enseignants respectees
  - Couverture horaire complete

### 3. Publication
- [ ] Methode `publish(Long edtId)` :
  - Verifier status = VALIDATED
  - Changer status en PUBLISHED
  - Enregistrer date/heure publication
  - Declencher notifications (si notification-service actif)

### 4. Visibilite
- [ ] EDT DRAFT : visible admins uniquement
- [ ] EDT VALIDATED : visible admins + enseignants concernes
- [ ] EDT PUBLISHED : visible tous

### 5. Endpoints
- [ ] `PUT /api/edt/{id}/validate` - Lance validation complete
- [ ] `PUT /api/edt/{id}/publish` - Publie l'EDT
- [ ] `PUT /api/edt/{id}/unpublish` - Depublie (retour VALIDATED)
- [ ] `GET /api/edt/{id}/validation-report` - Rapport de validation

---

## Flow (Cas d'Utilisation Frontend)

### Scenario 1 : Validation d'un EDT
1. L'administrateur finalise un EDT (status DRAFT)
2. Il clique sur "Valider"
3. L'API `PUT /api/edt/{id}/validate` est appelee
4. Le systeme effectue toutes les verifications
5. Resultat :
   - Si OK : status passe a VALIDATED, message succes
   - Si KO : liste des problemes detectes
6. L'admin corrige les problemes si necessaire
7. Il relance la validation

### Scenario 2 : Publication
1. L'EDT est en status VALIDATED
2. L'administrateur clique sur "Publier"
3. Confirmation demandee : "Publier cet EDT ? Les etudiants y auront acces."
4. Il confirme
5. L'API `PUT /api/edt/{id}/publish` est appelee
6. Status passe a PUBLISHED
7. Notifications envoyees aux groupes concernes
8. Les etudiants peuvent voir l'EDT

### Scenario 3 : Depublication pour correction
1. Un probleme est detecte apres publication
2. L'admin clique sur "Depublier"
3. Status revient a VALIDATED
4. L'admin corrige
5. Il republie

---

## Resultat Obtenu

Apres implementation :
- Workflow DRAFT → VALIDATED → PUBLISHED
- Validation complete avant publication
- Controle de visibilite selon status
- Notifications lors de publication
- Historique des publications

---

## Criteres d'Acceptation

- [ ] Les transitions de status fonctionnent
- [ ] La validation detecte tous les problemes
- [ ] La publication change le status et notifie
- [ ] La visibilite est filtree selon status
- [ ] Les tests Postman passent

---

## Fichiers Impactes

### Nouveaux fichiers a creer
```
iusj-schedule-service/src/main/java/com/example/iusj_schedule_service/
├── services/
│   └── EDTValidationService.java
└── dto/
    └── ValidationReport.java
```

### Fichiers a modifier
```
iusj-schedule-service/src/main/java/com/example/iusj_schedule_service/
├── entities/EDT.java
│   → Ajouter status, datePublication
├── services/EDTService.java
│   → Ajouter validate(), publish(), unpublish()
└── controller/EDTController.java
    → Ajouter endpoints validation/publication
```

---

## Rapport de Validation

```json
{
  "edtId": 123,
  "status": "INVALID",
  "errors": [
    {
      "type": "CONFLICT_ROOM",
      "message": "Conflit salle A101 : Math CM et Physique TD le lundi 8h-10h",
      "entries": [45, 67]
    },
    {
      "type": "MISSING_COURSE",
      "message": "Cours Anglais non planifie pour L2 Info"
    }
  ],
  "warnings": [
    {
      "type": "CAPACITY_WARNING",
      "message": "Salle B202 : capacite proche de la limite (55/60)"
    }
  ],
  "validatedAt": null
}
```

---

## Notes Techniques

- Validation asynchrone pour gros EDT (optionnel)
- Historique des publications pour audit
- Rollback possible si publication echoue
