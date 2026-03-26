import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../../shared/services/notification.service';
import { isPublicEndpoint } from './interceptor-utils';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private isHandlingUnauthorized = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const requestUrl = req.urlWithParams || req.url;
        console.error('[ErrorInterceptor] HTTP error', {
          status: error.status,
          url: requestUrl,
          message: error.message,
          backendMessage: error.error?.message
        });

        if (error.status === 401 && !isPublicEndpoint(req.url)) {
          if (!this.isHandlingUnauthorized) {
            this.isHandlingUnauthorized = true;
            this.notificationService.warning('Votre session a expire. Veuillez vous reconnecter.');
            this.authService.logout();
            setTimeout(() => {
              this.isHandlingUnauthorized = false;
            }, 300);
          }
        } else if (error.status === 403) {
          this.notificationService.error('Acces refuse. Vous n\'avez pas les autorisations necessaires.');
        } else if (error.status >= 500) {
          this.notificationService.error('Erreur serveur. Veuillez reessayer plus tard.');
        }

        return throwError(() => error);
      })
    );
  }
}