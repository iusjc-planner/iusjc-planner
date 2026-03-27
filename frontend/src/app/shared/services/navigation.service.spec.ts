import { TestBed } from '@angular/core/testing';

import { NavigationService } from './navigation.service';
import { AuthService } from '../../core/services/auth.service';

describe('NavigationService', () => {
  let service: NavigationService;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUser']);

    TestBed.configureTestingModule({
      providers: [
        NavigationService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    service = TestBed.inject(NavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return admin menu for ADMIN role', () => {
    authServiceSpy.getCurrentUser.and.returnValue({ login: 'admin', role: 'ADMIN', exp: 9999999999 });

    const menu = service.getMenuItems();

    expect(menu.length).toBeGreaterThan(0);
    expect(menu.some(item => item.link === '/app/reports')).toBeTrue();
    expect(menu.some(item => item.link === '/app/users')).toBeTrue();
  });

  it('should return teacher menu for ENSEIGNANT role', () => {
    authServiceSpy.getCurrentUser.and.returnValue({ login: 'ens', role: 'ENSEIGNANT', exp: 9999999999 });

    const menu = service.getMenuItems();

    expect(menu.length).toBeGreaterThan(0);
    expect(menu.some(item => item.link === '/app/dashboard-teacher')).toBeTrue();
    expect(menu.some(item => item.link === '/app/reports')).toBeFalse();
  });

  it('should return empty menu when no current user', () => {
    authServiceSpy.getCurrentUser.and.returnValue(null);

    const menu = service.getMenuItems();

    expect(menu).toEqual([]);
  });
});
