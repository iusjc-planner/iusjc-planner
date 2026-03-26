import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const notifications = inject(NotificationService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                authService.logout(false);
                notifications.warn('Session expiree', 'Veuillez vous reconnecter.');
                router.navigate(['/auth/login']);
                return throwError(() => error);
            }

            if (error.status === 403) {
                notifications.error('Acces refuse', "Vous n'avez pas les permissions necessaires.");
                router.navigate(['/auth/access']);
                return throwError(() => error);
            }

            if (error.status >= 500) {
                notifications.error('Erreur serveur', 'Une erreur technique est survenue. Reessayez plus tard.');
                return throwError(() => error);
            }

            return throwError(() => error);
        })
    );
};
