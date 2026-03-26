import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
    let http: HttpClient;
    let httpMock: HttpTestingController;
    let authService: jasmine.SpyObj<AuthService>;
    let notifications: jasmine.SpyObj<NotificationService>;
    let router: jasmine.SpyObj<Router>;

    beforeEach(() => {
        authService = jasmine.createSpyObj<AuthService>('AuthService', ['logout']);
        notifications = jasmine.createSpyObj<NotificationService>('NotificationService', ['warn', 'error']);
        router = jasmine.createSpyObj<Router>('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authService },
                { provide: NotificationService, useValue: notifications },
                { provide: Router, useValue: router },
                provideHttpClient(withInterceptors([errorInterceptor])),
                provideHttpClientTesting()
            ]
        });

        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('handles 401 by logging out and redirecting to login', () => {
        http.get('/api/users').subscribe({ error: () => undefined });

        const req = httpMock.expectOne('/api/users');
        req.flush({}, { status: 401, statusText: 'Unauthorized' });

        expect(authService.logout).toHaveBeenCalledWith(false);
        expect(notifications.warn).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('handles 403 by redirecting to access denied page', () => {
        http.get('/api/users').subscribe({ error: () => undefined });

        const req = httpMock.expectOne('/api/users');
        req.flush({}, { status: 403, statusText: 'Forbidden' });

        expect(notifications.error).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/auth/access']);
    });

    it('handles server errors with technical feedback', () => {
        http.get('/api/users').subscribe({ error: () => undefined });

        const req = httpMock.expectOne('/api/users');
        req.flush({}, { status: 500, statusText: 'Server Error' });

        expect(notifications.error).toHaveBeenCalledWith('Erreur serveur', 'Une erreur technique est survenue. Reessayez plus tard.');
    });
});
