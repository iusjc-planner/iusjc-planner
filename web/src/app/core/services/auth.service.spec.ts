import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;
    let router: jasmine.SpyObj<Router>;

    const storageKey = 'iusj.web.session';

    const buildJwt = (payload: Record<string, unknown>): string => {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const body = btoa(JSON.stringify(payload));
        return `${header}.${body}.signature`;
    };

    beforeEach(() => {
        router = jasmine.createSpyObj<Router>('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [AuthService, provideHttpClient(), provideHttpClientTesting(), { provide: Router, useValue: router }]
        });

        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
        localStorage.removeItem(storageKey);
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.removeItem(storageKey);
    });

    it('stores a valid session on login success', (done) => {
        const token = buildJwt({ role: 'ADMIN', exp: Math.floor(Date.now() / 1000) + 3600 });

        service.login({ email: 'admin@iusjc.cm', password: 'secret' }).subscribe((session) => {
            expect(session).toBeTruthy();
            expect(session?.role).toBe('ADMIN');
            expect(service.getToken()).toBe(token);
            done();
        });

        const req = httpMock.expectOne('/api/auth/login');
        expect(req.request.method).toBe('POST');
        req.flush({ token, username: 'admin' });
    });

    it('returns null on login failure', (done) => {
        service.login({ email: 'admin@iusjc.cm', password: 'bad' }).subscribe((session) => {
            expect(session).toBeNull();
            done();
        });

        const req = httpMock.expectOne('/api/auth/login');
        req.flush({ message: 'unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('reports unauthenticated when token is expired', () => {
        const expiredToken = buildJwt({ role: 'TEACHER', exp: Math.floor(Date.now() / 1000) - 10 });
        localStorage.setItem(storageKey, JSON.stringify({ token: expiredToken, role: 'TEACHER', username: 'teacher', exp: Math.floor(Date.now() / 1000) - 10 }));

        expect(service.isAuthenticated()).toBeFalse();
        expect(localStorage.getItem(storageKey)).toBeNull();
    });

    it('redirects by role for admin users', () => {
        const token = buildJwt({ role: 'ADMIN', exp: Math.floor(Date.now() / 1000) + 3600 });
        localStorage.setItem(storageKey, JSON.stringify({ token, role: 'ADMIN', username: 'admin' }));

        service.redirectByRole();

        expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
});
