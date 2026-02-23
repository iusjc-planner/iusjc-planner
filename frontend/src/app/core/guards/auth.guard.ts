import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      const currentUser = this.authService.getCurrentUser();
      const currentPath = state.url;
      
      if (currentUser) {
        // Définir les routes autorisées par rôle
        const adminRoutes = [
          '/app/dashboard', '/app/users', '/app/teachers', '/app/schools', 
          '/app/rooms', '/app/reservations', '/app/courses', '/app/groups',
          '/app/schedules', '/app/events', '/app/resources', '/app/reports', '/app/settings'
        ];
        
        const userRoutes = [
          '/app/dashboard-teacher', '/app/my-schedule', '/app/my-courses', 
          '/app/my-groups', '/app/room-reservations', '/app/my-availability', '/app/my-profile'
        ];
        
        // Vérifier les permissions selon le rôle
        if (currentUser.role === 'ADMIN') {
          // Les admins peuvent accéder à toutes les routes admin
          const hasAccess = adminRoutes.some(route => currentPath.startsWith(route));
          if (!hasAccess && currentPath.startsWith('/app/dashboard-teacher')) {
            // Rediriger vers le dashboard admin si tentative d'accès au dashboard teacher
            this.router.navigate(['/app/dashboard']);
            return false;
          }
          return true;
        }
        
        if (currentUser.role === 'USER') {
          // Les utilisateurs ne peuvent accéder qu'aux routes user
          const hasAccess = userRoutes.some(route => currentPath.startsWith(route));
          if (!hasAccess) {
            // Rediriger vers le dashboard teacher si accès non autorisé
            this.router.navigate(['/app/dashboard-teacher']);
            return false;
          }
          return true;
        }
      }
      
      return true;
    }

    // Rediriger vers la page de connexion avec l'URL de retour
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }
}