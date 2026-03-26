import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should allow access when authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    const result = guard.canActivate({} as ActivatedRouteSnapshot, { url: '/app/dashboard' } as RouterStateSnapshot);

    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should block access and redirect to login when not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    const result = guard.canActivate({} as ActivatedRouteSnapshot, { url: '/app/users' } as RouterStateSnapshot);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/app/users' } });
  });
});
