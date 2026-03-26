import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('roleGuard', () => {
    let authService: jasmine.SpyObj<AuthService>;
    let router: jasmine.SpyObj<Router>;

    beforeEach(() => {
        authService = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated', 'getRole']);
        router = jasmine.createSpyObj<Router>('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authService },
                { provide: Router, useValue: router }
            ]
        });
    });

    const routeWithRoles = (roles: string[]): ActivatedRouteSnapshot => {
        return { data: { roles } } as unknown as ActivatedRouteSnapshot;
    };

    it('redirects to login when user is not authenticated', () => {
        authService.isAuthenticated.and.returnValue(false);

        const result = TestBed.runInInjectionContext(() => roleGuard(routeWithRoles(['ADMIN']), {} as never));

        expect(result).toBeFalse();
        expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('allows access when user role matches requirements', () => {
        authService.isAuthenticated.and.returnValue(true);
        authService.getRole.and.returnValue('ADMIN');

        const result = TestBed.runInInjectionContext(() => roleGuard(routeWithRoles(['ADMIN']), {} as never));

        expect(result).toBeTrue();
    });

    it('redirects to access page when role does not match', () => {
        authService.isAuthenticated.and.returnValue(true);
        authService.getRole.and.returnValue('TEACHER');

        const result = TestBed.runInInjectionContext(() => roleGuard(routeWithRoles(['ADMIN']), {} as never));

        expect(result).toBeFalse();
        expect(router.navigate).toHaveBeenCalledWith(['/auth/access']);
    });
});
