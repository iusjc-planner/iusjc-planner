# FE-REL-001 - Checklist Operateur Minute Par Minute

Date: 26 Mars 2026  
Ticket: FE-REL-001  
Strategie: cutover Big-bang vers `/web`

## 0) Mode d emploi

- Utiliser un terminal PowerShell depuis la racine du repo.
- Cocher chaque etape en temps reel.
- Si une etape gate est en echec, appliquer le rollback immediat.
- Cette checklist est operationnelle pour le contexte Windows du projet.

## 1) Roles et canaux

- Incident commander:
- Operateur frontend:
- Operateur backend:
- QA:
- Canal war room:
- Canal incidents:

## 2) Pre-flight (T-30 a T-10)

### T-30 min - Ouvrir la fenetre

- [ ] Annonce officielle debut de fenetre sur canal war room.
- [ ] Freeze des changements non critiques confirme.

Commande:

```powershell
Set-Location "d:\Projects\iusjc-planner\iusjc-planner"
```

Critere PASS:

- Equipe connectee et accusant reception.

### T-25 min - Validation Go/No-Go documentaire

- [ ] Verifier checklist Go/No-Go a jour.
- [ ] Verifier snapshot readiness a jour.
- [ ] Obtenir accord PO + TL Front + TL Back.

References:

- `documentation/tickets/FE-REL-001-GO-NO-GO-CHECKLIST.md`
- `documentation/tickets/FE-REL-001-READINESS-SNAPSHOT-2026-03-26.md`

Critere PASS:

- Tous les pre-requis techniques sont `PRET TECHNIQUEMENT`.

### T-20 min - Sante infrastructure locale/projet

Commande:

```powershell
try { Invoke-WebRequest "http://localhost:8761" -UseBasicParsing -TimeoutSec 10 | Out-Null; "EUREKA_OK" } catch { "EUREKA_KO" }
try { Invoke-WebRequest "http://localhost:8080/actuator/health" -UseBasicParsing -TimeoutSec 10 | Select-Object -ExpandProperty Content } catch { "GATEWAY_KO" }
```

Critere PASS:

- Gateway repond (etat `UP` attendu sur health si expose).

### T-15 min - Baseline tests critiques

Commande:

```powershell
Push-Location "frontend"; npx playwright test --retries=0 --reporter=line; Pop-Location
```

Critere PASS:

- Suite critique verte (`8 passed` attendu sur la baseline actuelle).

### T-10 min - Point de non-retour technique

- [ ] Decision explicite: `GO CUTOVER` ou `NO-GO`.
- [ ] Si `NO-GO`, fermer la fenetre et planifier nouveau slot.

## 3) Execution cutover (T-05 a T+15)

### T-05 min - Arret controle

Commande:

```powershell
.\stop-services.ps1
```

Critere PASS:

- Ports applicatifs liberes (4200, 8080, 8761, 8081..8092).

Verification rapide:

```powershell
@(4200,8080,8761,8081,8082,8083,8084,8085,8086,8087,8088,8089,8090,8092) | ForEach-Object {
  $p = $_
  $c = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
  if ($c) { "PORT_${p}_OCCUPE" } else { "PORT_${p}_LIBRE" }
}
```

### T+00 min - Demarrage cible `/web`

Commande:

```powershell
.\start-services.ps1
```

Critere PASS:

- Frontend cible demarre sur `http://localhost:4200`.
- Gateway et Eureka accessibles.

### T+05 min - Sanity endpoints

Commande:

```powershell
try { (Invoke-WebRequest "http://localhost:4200" -UseBasicParsing -TimeoutSec 15).StatusCode } catch { "FRONT_KO" }
try { (Invoke-WebRequest "http://localhost:8080/actuator/health" -UseBasicParsing -TimeoutSec 15).StatusCode } catch { "GATEWAY_KO" }
try { (Invoke-WebRequest "http://localhost:8761" -UseBasicParsing -TimeoutSec 15).StatusCode } catch { "EUREKA_KO" }
```

Critere PASS:

- Codes HTTP 200 pour frontend, gateway, eureka.

### T+10 min - Smoke rapide post-cutover

Commande:

```powershell
Push-Location "frontend"; npx playwright test --retries=0 --reporter=line; Pop-Location
```

Critere PASS:

- Suite E2E critique verte en contexte post-bascule.

### T+15 min - Gate de stabilite initiale

- [ ] Aucun incident severite haute ouvert.
- [ ] Auth, RBAC, CRUD users, planning valides.
- [ ] Decision intermediaire: maintien ou rollback.

## 4) Monitoring renforce (T+15 a T+60)

### T+30 min - Revue incidents

- [ ] Verifier erreurs front (console + remontes QA).
- [ ] Verifier erreurs API via logs gateway/services.
- [ ] Noter tendances et actions correctives.

### T+45 min - Revalidation parcours coeur

- [ ] Login admin et enseignant.
- [ ] Navigation role-based.
- [ ] Notifications.
- [ ] Planning principal.

### T+60 min - Decision finale fenetre

- [ ] `GO` si aucun blocage critique et KPIs stables.
- [ ] `ROLLBACK` si incident critique non corrige.

## 5) Procedure rollback immediate (si gate en echec)

Declencheurs rollback immediat:

1. Login/logout casse.
2. Defaut RBAC critique.
3. E2E critique rouge post-cutover.
4. Incident severite haute non corrige rapidement.

Commandes rollback:

```powershell
.\stop-services.ps1
.\start-services.ps1 -UseLegacyFrontend
```

Verification rollback:

```powershell
try { (Invoke-WebRequest "http://localhost:4200" -UseBasicParsing -TimeoutSec 15).StatusCode } catch { "LEGACY_FRONT_KO" }
try { (Invoke-WebRequest "http://localhost:8080/actuator/health" -UseBasicParsing -TimeoutSec 15).StatusCode } catch { "GATEWAY_KO" }
```

Critere PASS rollback:

- Front legacy accessible.
- Parcours critiques a nouveau operationnels.

## 6) Journal operateur (a remplir en direct)

| Horodatage | Etape | Action/commande | Resultat | Decision |
|---|---|---|---|---|
| A renseigner | T-30 | Ouverture fenetre | A renseigner | A renseigner |
| A renseigner | T-15 | Baseline E2E | A renseigner | A renseigner |
| A renseigner | T+00 | Demarrage `/web` | A renseigner | A renseigner |
| A renseigner | T+10 | Smoke post-cutover | A renseigner | A renseigner |
| A renseigner | T+60 | Decision finale | A renseigner | A renseigner |

## 7) Cloture de fenetre

- [ ] Rapport de fenetre publie.
- [ ] Incident log complete.
- [ ] Hypercare lancee si `GO`.
- [ ] RCA initiee si `ROLLBACK`.
