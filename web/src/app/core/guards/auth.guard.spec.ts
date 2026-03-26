import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
    let authService: jasmine.SpyObj<AuthService>;
    let router: jasmine.SpyObj<Router>;

    beforeEach(() => {
        authService = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated']);
        router = jasmine.createSpyObj<Router>('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authService },
                { provide: Router, useValue: router }
            ]
        });
    });

    it('allows navigation when user is authenticated', () => {
        authService.isAuthenticated.and.returnValue(true);

        const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

        expect(result).toBeTrue();
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('redirects to login when user is anonymous', () => {
        authService.isAuthenticated.and.returnValue(false);

        const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

        expect(result).toBeFalse();
        expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
});
