import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { RoleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(RoleGuard);
  });

  it('should allow access when no role restriction is provided', () => {
    authServiceSpy.getCurrentUser.and.returnValue(null);

    const route = { data: {} } as ActivatedRouteSnapshot;
    const state = { url: '/app/search' } as RouterStateSnapshot;
    const result = guard.canActivate(route, state);

    expect(result).toBeTrue();
  });

  it('should allow access when user role is authorized', () => {
    authServiceSpy.getCurrentUser.and.returnValue({ login: 'admin', role: 'ADMIN', exp: 9999999999 });

    const route = { data: { roles: ['ADMIN'] } } as unknown as ActivatedRouteSnapshot;
    const state = { url: '/app/users' } as RouterStateSnapshot;
    const result = guard.canActivate(route, state);

    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to forbidden when role is not authorized', () => {
    authServiceSpy.getCurrentUser.and.returnValue({ login: 'teacher', role: 'ENSEIGNANT', exp: 9999999999 });

    const route = { data: { roles: ['ADMIN'] } } as unknown as ActivatedRouteSnapshot;
    const state = { url: '/app/users' } as RouterStateSnapshot;
    const result = guard.canActivate(route, state);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/forbidden']);
  });

  it('should redirect to login when user is missing on protected route', () => {
    authServiceSpy.getCurrentUser.and.returnValue(null);

    const route = { data: { roles: ['ADMIN'] } } as unknown as ActivatedRouteSnapshot;
    const state = { url: '/app/dashboard' } as RouterStateSnapshot;
    const result = guard.canActivate(route, state);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/app/dashboard' } });
  });
});
