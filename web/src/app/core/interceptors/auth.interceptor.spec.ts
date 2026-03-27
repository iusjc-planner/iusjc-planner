import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
    let http: HttpClient;
    let httpMock: HttpTestingController;
    let authService: jasmine.SpyObj<AuthService>;

    beforeEach(() => {
        authService = jasmine.createSpyObj<AuthService>('AuthService', ['getToken']);

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authService },
                provideHttpClient(withInterceptors([authInterceptor])),
                provideHttpClientTesting()
            ]
        });

        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('adds bearer token on protected endpoints', () => {
        authService.getToken.and.returnValue('jwt-token');

        http.get('/api/users').subscribe();

        const req = httpMock.expectOne('/api/users');
        expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-token');
        req.flush({});
    });

    it('does not add bearer token on public auth endpoints', () => {
        authService.getToken.and.returnValue('jwt-token');

        http.post('/api/auth/login', {}).subscribe();

        const req = httpMock.expectOne('/api/auth/login');
        expect(req.request.headers.has('Authorization')).toBeFalse();
        req.flush({});
    });
});
