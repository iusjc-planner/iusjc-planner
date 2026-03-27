# FE-REL-001 - Cutover Big-bang vers /web

Priorite: P0  
Statut: En cours (preparation conditionnelle)  
Estimation: 2 jours  
Dependances: FE-QUAL-001

## Description

Executer la bascule officielle frontend vers /web selon le plan de migration Big-bang, avec validation Go/No-Go et rollback pret.

## Critères d'acceptation

- Checklist Go/No-Go completee.
- Bascule realizee avec smoke tests passes.
- Plan rollback operationnel et teste.
- Hypercare lance avec suivi incidents.

## Livrables d'implementation (phase preparation)

- Checklist Go/No-Go: `FE-REL-001-GO-NO-GO-CHECKLIST.md`
- Checklist operateur minute par minute: `FE-REL-001-CHECKLIST-OPERATEUR-MINUTE-PAR-MINUTE.md`
- Runbook cutover/rollback: `FE-REL-001-CUTOVER-ROLLBACK-RUNBOOK.md`
- Pack smoke tests: `FE-REL-001-SMOKE-TESTS.md`
- Plan hypercare: `FE-REL-001-HYPERCARE.md`
- Readiness snapshot: `FE-REL-001-READINESS-SNAPSHOT-2026-03-26.md`
- Matrice de deblocage: `FE-REL-001-UNBLOCKING-MATRIX.md`

## Taches

- [x] Initialiser les livrables operationnels (Go/No-Go, runbook, smoke, hypercare).
- [x] Valider readiness pre-cutover (snapshot du 2026-03-26: NO-GO).
- [x] Elaborer la matrice d'actions de deblocage des prerequis.
- [x] Executer la checklist Go/No-Go en mode readiness technique (prerequis tickets + qualite verifies).
- [ ] Realiser bascule.
- [ ] Executer smoke tests.
- [ ] Assurer monitoring hypercare.

## Verification

- Gate prerequis valide avant bascule:
	- FE-CORE-001 a FE-CORE-004 termines.
	- FE-PAGE-001 a FE-PAGE-004 valides.
	- FE-QUAL-001 termine avec tests critiques au vert.
- Gate operationnel restant avant Go:
	- Fenetre de bascule planifiee.
	- Smoke tests post-cutover executes et PASS.
	- Hypercare active et monitoree.
- Aucun incident critique ouvert post-cutover.
