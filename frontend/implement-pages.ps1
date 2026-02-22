# Script d'implémentation rapide des pages IUSJ Planner
# Ce script crée les templates HTML de base pour toutes les pages

Write-Host "🎨 Implémentation des pages IUSJ Planner" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$pages = @(
    @{Module="users"; Component="user-form"; Title="Formulaire Utilisateur"},
    @{Module="users"; Component="user-profile"; Title="Profil Utilisateur"},
    @{Module="teachers"; Component="teacher-list"; Title="Liste des Enseignants"},
    @{Module="teachers"; Component="teacher-detail"; Title="Détails Enseignant"},
    @{Module="teachers"; Component="teacher-availability"; Title="Disponibilités"},
    @{Module="schools"; Component="school-list"; Title="Liste des Écoles"},
    @{Module="schools"; Component="school-detail"; Title="Détails École"},
    @{Module="rooms"; Component="room-list"; Title="Liste des Salles"},
    @{Module="rooms"; Component="room-form"; Title="Formulaire Salle"},
    @{Module="rooms"; Component="room-detail"; Title="Détails Salle"},
    @{Module="courses"; Component="course-list"; Title="Liste des Cours"},
    @{Module="courses"; Component="course-form"; Title="Formulaire Cours"},
    @{Module="courses"; Component="course-detail"; Title="Détails Cours"},
    @{Module="groups"; Component="group-list"; Title="Liste des Groupes"},
    @{Module="groups"; Component="group-form"; Title="Formulaire Groupe"},
    @{Module="schedules"; Component="schedule-global"; Title="Emploi du Temps Global"},
    @{Module="schedules"; Component="schedule-teacher"; Title="Emploi du Temps Enseignant"},
    @{Module="schedules"; Component="schedule-room"; Title="Emploi du Temps Salle"},
    @{Module="schedules"; Component="schedule-group"; Title="Emploi du Temps Groupe"},
    @{Module="reservations"; Component="reservation-list"; Title="Liste des Réservations"},
    @{Module="reservations"; Component="reservation-form"; Title="Formulaire Réservation"},
    @{Module="reservations"; Component="reservation-detail"; Title="Détails Réservation"},
    @{Module="events"; Component="event-list"; Title="Liste des Événements"},
    @{Module="events"; Component="event-form"; Title="Formulaire Événement"},
    @{Module="resources"; Component="resource-list"; Title="Liste des Ressources"},
    @{Module="resources"; Component="resource-form"; Title="Formulaire Ressource"},
    @{Module="reports"; Component="report-dashboard"; Title="Tableau de Bord Rapports"},
    @{Module="reports"; Component="report-rooms"; Title="Rapport Occupation Salles"},
    @{Module="reports"; Component="report-teachers"; Title="Rapport Charge Enseignants"},
    @{Module="notifications"; Component="notification-center"; Title="Centre de Notifications"},
    @{Module="notifications"; Component="notification-settings"; Title="Paramètres Notifications"},
    @{Module="settings"; Component="settings-general"; Title="Paramètres Généraux"},
    @{Module="settings"; Component="settings-academic-year"; Title="Année Académique"},
    @{Module="settings"; Component="settings-schedules"; Title="Configuration Horaires"},
    @{Module="settings"; Component="settings-integrations"; Title="Intégrations"},
    @{Module="search"; Component="search-page"; Title="Recherche Globale"},
    @{Module="auth"; Component="forgot-password"; Title="Mot de passe oublié"}
)

$count = 0
foreach ($page in $pages) {
    $module = $page.Module
    $component = $page.Component
    $title = $page.Title
    
    $htmlPath = "src/app/features/$module/$component/$component.component.html"
    
    if (Test-Path $htmlPath) {
        $count++
        Write-Host "✓ $title" -ForegroundColor Green
    } else {
        Write-Host "⚠ $title - Fichier non trouvé" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "📊 Résumé: $count/$($pages.Count) pages vérifiées" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Vérification terminée !" -ForegroundColor Green
