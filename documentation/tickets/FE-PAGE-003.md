# FE-PAGE-003 - Planning + drag and drop metier

Priorite: P1  
Statut: Termine  
Estimation: 5 jours  
Dependances: FE-CORE-004

## Description

Implementer les vues planning metier (global, enseignant, salle, groupe) avec drag and drop et verification conflits.

## Critères d'acceptation

- Vues planning principales disponibles.
- Drag and drop deplacement seance fonctionnel.
- Gestion conflits visible et bloquante si necessaire.
- Feedback utilisateur explicite.

## Taches

- [x] Construire calendrier/vues.
- [x] Integrer composants drag/drop PrimeNG.
- [x] Brancher API schedule.
- [x] Afficher conflits backend.

## Avancement implementation

- Vue planning admin enrichie dans `web/src/app/pages/admin/emploi-du-temps.ts` avec filtres date/enseignant/salle relies a `ScheduleService`.
- Vues principales ajoutees: global, enseignant, salle, groupe (avec mode de visualisation et filtres associes).
- Ajout d un workflow de creation de seance avec validation metier (cours, enseignant, salle, groupe, plage horaire).
- Detection de conflits locale bloquante avant creation (chevauchement enseignant/salle).
- Deplacement de seance active via drag and drop avec mise a jour backend (`ScheduleService.update`) et blocage si conflit.
- Feedback utilisateur explicite implemente via `NotificationService` (validation, conflit, succes, erreur).
- Conflits backend comptabilises dans les statistiques avec gestion des statuts `CONFLICT`/`CONFLIT`.
- Test unitaire dedie ajoute: `web/src/app/pages/admin/emploi-du-temps.spec.ts`.

## Verification

- Scenarios conflits/non-conflits valides.
- Validation technique: suite unitaire /web verte (`58 SUCCESS`) avec `CHROME_BIN` pointe sur Edge local.
