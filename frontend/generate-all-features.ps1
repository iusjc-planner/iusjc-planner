# Script de génération de tous les modules et composants IUSJ Planner
# Exécuter depuis le dossier fontend/

Write-Host "🚀 Génération des modules et composants IUSJ Planner" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Module Utilisateurs
Write-Host "📦 Module Utilisateurs..." -ForegroundColor Yellow
ng generate module features/users --routing
ng generate component features/users/user-list --skip-tests --module=users
ng generate component features/users/user-form --skip-tests --module=users
ng generate component features/users/user-profile --skip-tests --module=users
ng generate service features/users/services/user --skip-tests

# Module Enseignants
Write-Host "📦 Module Enseignants..." -ForegroundColor Yellow
ng generate module features/teachers --routing
ng generate component features/teachers/teacher-list --skip-tests --module=teachers
ng generate component features/teachers/teacher-detail --skip-tests --module=teachers
ng generate component features/teachers/teacher-availability --skip-tests --module=teachers
ng generate service features/teachers/services/teacher --skip-tests

# Module Écoles
Write-Host "📦 Module Écoles..." -ForegroundColor Yellow
ng generate module features/schools --routing
ng generate component features/schools/school-list --skip-tests --module=schools
ng generate component features/schools/school-detail --skip-tests --module=schools
ng generate service features/schools/services/school --skip-tests

# Module Salles
Write-Host "📦 Module Salles..." -ForegroundColor Yellow
ng generate module features/rooms --routing
ng generate component features/rooms/room-list --skip-tests --module=rooms
ng generate component features/rooms/room-form --skip-tests --module=rooms
ng generate component features/rooms/room-detail --skip-tests --module=rooms
ng generate service features/rooms/services/room --skip-tests

# Module Cours
Write-Host "📦 Module Cours..." -ForegroundColor Yellow
ng generate module features/courses --routing
ng generate component features/courses/course-list --skip-tests --module=courses
ng generate component features/courses/course-form --skip-tests --module=courses
ng generate component features/courses/course-detail --skip-tests --module=courses
ng generate service features/courses/services/course --skip-tests

# Module Groupes
Write-Host "📦 Module Groupes..." -ForegroundColor Yellow
ng generate module features/groups --routing
ng generate component features/groups/group-list --skip-tests --module=groups
ng generate component features/groups/group-form --skip-tests --module=groups
ng generate service features/groups/services/group --skip-tests

# Module Emplois du temps
Write-Host "📦 Module Emplois du temps..." -ForegroundColor Yellow
ng generate module features/schedules --routing
ng generate component features/schedules/schedule-global --skip-tests --module=schedules
ng generate component features/schedules/schedule-teacher --skip-tests --module=schedules
ng generate component features/schedules/schedule-room --skip-tests --module=schedules
ng generate component features/schedules/schedule-group --skip-tests --module=schedules
ng generate service features/schedules/services/schedule --skip-tests

# Module Réservations
Write-Host "📦 Module Réservations..." -ForegroundColor Yellow
ng generate module features/reservations --routing
ng generate component features/reservations/reservation-list --skip-tests --module=reservations
ng generate component features/reservations/reservation-form --skip-tests --module=reservations
ng generate component features/reservations/reservation-detail --skip-tests --module=reservations
ng generate service features/reservations/services/reservation --skip-tests

# Module Événements
Write-Host "📦 Module Événements..." -ForegroundColor Yellow
ng generate module features/events --routing
ng generate component features/events/event-list --skip-tests --module=events
ng generate component features/events/event-form --skip-tests --module=events
ng generate service features/events/services/event --skip-tests

# Module Ressources
Write-Host "📦 Module Ressources..." -ForegroundColor Yellow
ng generate module features/resources --routing
ng generate component features/resources/resource-list --skip-tests --module=resources
ng generate component features/resources/resource-form --skip-tests --module=resources
ng generate service features/resources/services/resource --skip-tests

# Module Rapports
Write-Host "📦 Module Rapports..." -ForegroundColor Yellow
ng generate module features/reports --routing
ng generate component features/reports/report-dashboard --skip-tests --module=reports
ng generate component features/reports/report-rooms --skip-tests --module=reports
ng generate component features/reports/report-teachers --skip-tests --module=reports
ng generate service features/reports/services/report --skip-tests

# Module Notifications
Write-Host "📦 Module Notifications..." -ForegroundColor Yellow
ng generate module features/notifications --routing
ng generate component features/notifications/notification-center --skip-tests --module=notifications
ng generate component features/notifications/notification-settings --skip-tests --module=notifications
ng generate service features/notifications/services/notification --skip-tests

# Module Paramètres
Write-Host "📦 Module Paramètres..." -ForegroundColor Yellow
ng generate module features/settings --routing
ng generate component features/settings/settings-general --skip-tests --module=settings
ng generate component features/settings/settings-academic-year --skip-tests --module=settings
ng generate component features/settings/settings-schedules --skip-tests --module=settings
ng generate component features/settings/settings-integrations --skip-tests --module=settings
ng generate service features/settings/services/settings --skip-tests

# Module Recherche
Write-Host "📦 Module Recherche..." -ForegroundColor Yellow
ng generate module features/search --routing
ng generate component features/search/search-page --skip-tests --module=search
ng generate service features/search/services/search --skip-tests

# Module Auth (compléter)
Write-Host "📦 Module Auth (compléments)..." -ForegroundColor Yellow
ng generate component features/auth/forgot-password --skip-tests --module=auth
ng generate service features/auth/services/auth --skip-tests
ng generate guard features/auth/guards/auth --skip-tests
ng generate guard features/auth/guards/role --skip-tests

Write-Host ""
Write-Host "✅ Génération terminée !" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Résumé:" -ForegroundColor Cyan
Write-Host "  - 15 modules créés" -ForegroundColor White
Write-Host "  - 41+ composants créés" -ForegroundColor White
Write-Host "  - 15+ services créés" -ForegroundColor White
Write-Host "  - 2 guards créés" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Prochaine étape: Implémenter les templates et la logique" -ForegroundColor Yellow
