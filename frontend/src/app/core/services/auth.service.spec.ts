import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  function createToken(payload: Record<string, any>): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.signature`;
  }

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: router }
      ]
    });

    localStorage.clear();
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should login and store token', () => {
    const token = createToken({ sub: 'admin', role: 'ADMIN', exp: Math.floor(Date.now() / 1000) + 3600 });

    service.login({ login: 'admin', password: 'admin123' }).subscribe(response => {
      expect(response.token).toBe(token);
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.getCurrentUser()?.role).toBe('ADMIN');
      expect(localStorage.getItem('iusj_token')).toBe(token);
    });

    const req = httpMock.expectOne(`${environment.authUrl}/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ token });
  });

  it('should force unauthenticated state when token is expired', () => {
    const expired = createToken({ sub: 'teacher', role: 'ENSEIGNANT', exp: Math.floor(Date.now() / 1000) - 5 });
    localStorage.setItem('iusj_token', expired);

    const reloaded = TestBed.inject(AuthService);
    expect(reloaded.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem('iusj_token')).toBeNull();
  });

  it('should redirect by role admin or enseignant', () => {
    const adminToken = createToken({ sub: 'admin', role: 'ADMIN', exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem('iusj_token', adminToken);
    const adminService = TestBed.inject(AuthService);
    expect(adminService.getRedirectUrlByRole()).toBe('/app/dashboard');

    adminService.logout();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);

    const teacherToken = createToken({ sub: 'ens', role: 'ENSEIGNANT', exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem('iusj_token', teacherToken);
    const teacherService = TestBed.inject(AuthService);
    expect(teacherService.getRedirectUrlByRole()).toBe('/app/dashboard-teacher');
  });
});
