# Script PowerShell pour générer les composants shared

Write-Host "🚀 Génération des composants shared pour IUSJ Planner" -ForegroundColor Cyan
Write-Host ""

# Vérifier qu'on est dans le bon dossier
if (-not (Test-Path "angular.json")) {
    Write-Host "❌ Erreur: Ce script doit être exécuté depuis le dossier fontend/" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Génération du module shared..." -ForegroundColor Yellow
ng generate module shared --skip-tests

Write-Host ""
Write-Host "🎨 Génération des composants..." -ForegroundColor Yellow

# Header
Write-Host "  → Header Component" -ForegroundColor Green
ng generate component shared/components/header --skip-tests --module=shared

# Sidebar
Write-Host "  → Sidebar Component" -ForegroundColor Green
ng generate component shared/components/sidebar --skip-tests --module=shared

# Footer
Write-Host "  → Footer Component" -ForegroundColor Green
ng generate component shared/components/footer --skip-tests --module=shared

# Main Layout
Write-Host "  → Main Layout Component" -ForegroundColor Green
ng generate component shared/layouts/main-layout --skip-tests --module=shared

Write-Host ""
Write-Host "🔧 Génération des services..." -ForegroundColor Yellow

# Navigation Service
Write-Host "  → Navigation Service" -ForegroundColor Green
ng generate service shared/services/navigation --skip-tests

# Layout Service
Write-Host "  → Layout Service" -ForegroundColor Green
ng generate service shared/services/layout --skip-tests

Write-Host ""
Write-Host "✅ Génération terminée!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "  1. Implémenter les templates HTML"
Write-Host "  2. Ajouter les styles SCSS"
Write-Host "  3. Implémenter la logique TypeScript"
Write-Host "  4. Configurer le routing"
Write-Host "  5. Tester le layout"
Write-Host ""
