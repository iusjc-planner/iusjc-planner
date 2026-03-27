import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated() && this.authService.isAdmin()) {
      return true;
    }

    // Rediriger vers le dashboard approprié selon le rôle
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.role === 'ENSEIGNANT') {
      this.router.navigate(['/app/dashboard-teacher']);
    } else {
      this.router.navigate(['/app/dashboard']);
    }
    return false;
  }
}