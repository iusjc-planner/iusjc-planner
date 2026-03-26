import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
        router.navigate(['/auth/login']);
        return false;
    }

    const requiredRoles = ((route.data?.['roles'] as string[] | undefined) ?? []).map((value) => value.toUpperCase());
    if (requiredRoles.length === 0) {
        return true;
    }

    const userRole = (authService.getRole() ?? '').toUpperCase();
    const allowed = requiredRoles.some((role) => userRole.includes(role));
    if (allowed) {
        return true;
    }

    router.navigate(['/auth/access']);
    return false;
};
