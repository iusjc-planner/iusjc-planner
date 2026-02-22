import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ne pas ajouter le token pour les requêtes de login
    if (req.url.includes('/auth/login')) {
      return next.handle(req);
    }

    // Ajouter le token JWT si disponible
    const token = this.authService.getToken();
    console.log('[AuthInterceptor] URL:', req.url, '| Token présent:', !!token);
    
    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(authReq);
    }

    console.warn('[AuthInterceptor] Aucun token disponible pour:', req.url);
    return next.handle(req);
  }
}