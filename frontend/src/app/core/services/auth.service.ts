import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoginRequest, LoginResponse, AuthUser } from '../../shared/models/user.model';
import { ApiEndpoints } from '../config/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'iusj_token';
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenExpirationTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Vérifier si un token existe au démarrage
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      const user = this.decodeToken(token);
      this.currentUserSubject.next(user);
      this.startExpirationTimer(token);
    } else if (token) {
      // Token expiré, le supprimer
      this.clearSession();
      this.router.navigate(['/login']);
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${ApiEndpoints.auth}/login`, credentials)
      .pipe(
        map(response => {
          if (response.token) {
            // Stocker le token
            localStorage.setItem(this.TOKEN_KEY, response.token);
            
            // Décoder et stocker les informations utilisateur
            const user = this.decodeToken(response.token);
            this.currentUserSubject.next(user);
            this.startExpirationTimer(response.token);
          }
          return response;
        }),
        catchError(error => {
          console.error('Erreur de connexion:', error);
          let errorMessage = 'Erreur de connexion';
          
          if (error.status === 401) {
            errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect';
          } else if (error.status === 0) {
            errorMessage = 'Impossible de se connecter au serveur';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  getRedirectUrlByRole(): string {
    const user = this.getCurrentUser();
    if (user) {
      switch (user.role) {
        case 'ADMIN':
          return '/app/dashboard';
        case 'ENSEIGNANT':
          return '/app/dashboard-teacher';
        default:
          return '/app/dashboard';
      }
    }
    return '/app/dashboard';
  }

  logout(): void {
    this.clearSession();

    // Rediriger vers la page de connexion
    this.router.navigate(['/login']);
  }

  private clearSession(): void {
    // Supprimer le token
    localStorage.removeItem(this.TOKEN_KEY);
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
    
    // Réinitialiser l'utilisateur courant
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    if (this.isTokenExpired(token)) {
      this.clearSession();
      return false;
    }

    return true;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  private decodeToken(token: string): AuthUser | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        login: payload.sub,
        role: payload.role,
        exp: payload.exp
      };
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  private startExpirationTimer(token: string): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp as number | undefined;
      if (!exp) {
        return;
      }

      const expiresInMs = exp * 1000 - Date.now();
      if (expiresInMs <= 0) {
        this.logout();
        return;
      }

      this.tokenExpirationTimer = setTimeout(() => {
        this.logout();
      }, expiresInMs);
    } catch {
      this.logout();
    }
  }
}