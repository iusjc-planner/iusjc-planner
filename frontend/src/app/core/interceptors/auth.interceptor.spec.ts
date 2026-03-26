import { HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getToken']);
    interceptor = new AuthInterceptor(authServiceSpy);
  });

  it('should add Authorization header for protected endpoints when token exists', () => {
    authServiceSpy.getToken.and.returnValue('jwt-token');
    const req = new HttpRequest('GET', '/api/users');

    const handler: HttpHandler = {
      handle: (request: HttpRequest<any>) => {
        expect(request.headers.get('Authorization')).toBe('Bearer jwt-token');
        return of(new HttpResponse({ status: 200 }));
      }
    };

    interceptor.intercept(req, handler).subscribe();
  });

  it('should not add Authorization header for public endpoints', () => {
    authServiceSpy.getToken.and.returnValue('jwt-token');
    const req = new HttpRequest('GET', '/auth/login');

    const handler: HttpHandler = {
      handle: (request: HttpRequest<any>) => {
        expect(request.headers.has('Authorization')).toBeFalse();
        return of(new HttpResponse({ status: 200 }));
      }
    };

    interceptor.intercept(req, handler).subscribe();
  });

  it('should pass request unchanged when token is missing', () => {
    authServiceSpy.getToken.and.returnValue(null);
    const req = new HttpRequest('GET', '/api/rooms');

    const handler: HttpHandler = {
      handle: (request: HttpRequest<any>) => {
        expect(request.headers.has('Authorization')).toBeFalse();
        return of(new HttpResponse({ status: 200 }));
      }
    };

    interceptor.intercept(req, handler).subscribe();
  });
});
