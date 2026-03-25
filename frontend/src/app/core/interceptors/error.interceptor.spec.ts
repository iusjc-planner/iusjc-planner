import { HttpErrorResponse, HttpHandler, HttpRequest } from '@angular/common/http';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../../shared/services/notification.service';
import { ErrorInterceptor } from './error.interceptor';

describe('ErrorInterceptor', () => {
  let interceptor: ErrorInterceptor;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['logout']);
    notificationServiceSpy = jasmine.createSpyObj<NotificationService>('NotificationService', [
      'warning',
      'error'
    ]);

    interceptor = new ErrorInterceptor(authServiceSpy, notificationServiceSpy);
  });

  it('should logout and notify when receiving 401 on protected endpoint', (done) => {
    const req = new HttpRequest('GET', '/api/users');
    const handler: HttpHandler = {
      handle: () => throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }))
    };

    interceptor.intercept(req, handler).subscribe({
      error: () => {
        expect(authServiceSpy.logout).toHaveBeenCalled();
        expect(notificationServiceSpy.warning).toHaveBeenCalled();
        done();
      }
    });
  });

  it('should not logout when receiving 401 on public endpoint', (done) => {
    const req = new HttpRequest('POST', '/auth/login');
    const handler: HttpHandler = {
      handle: () => throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }))
    };

    interceptor.intercept(req, handler).subscribe({
      error: () => {
        expect(authServiceSpy.logout).not.toHaveBeenCalled();
        expect(notificationServiceSpy.warning).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('should show authorization message on 403', (done) => {
    const req = new HttpRequest('GET', '/api/admin/reports');
    const handler: HttpHandler = {
      handle: () => throwError(() => new HttpErrorResponse({ status: 403, statusText: 'Forbidden' }))
    };

    interceptor.intercept(req, handler).subscribe({
      error: () => {
        expect(notificationServiceSpy.error).toHaveBeenCalledWith(
          'Acces refuse. Vous n\'avez pas les autorisations necessaires.'
        );
        done();
      }
    });
  });

  it('should show explicit message on server errors', (done) => {
    const req = new HttpRequest('GET', '/api/schedules');
    const handler: HttpHandler = {
      handle: () => throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' }))
    };

    interceptor.intercept(req, handler).subscribe({
      error: () => {
        expect(notificationServiceSpy.error).toHaveBeenCalledWith(
          'Erreur serveur. Veuillez reessayer plus tard.'
        );
        done();
      }
    });
  });
});
