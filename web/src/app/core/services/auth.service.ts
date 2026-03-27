import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { LoginRequest, LoginResponse, SessionUser } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);

    private readonly storageKey = 'iusj.web.session';
    private readonly loginUrl = '/auth/login';

    login(payload: LoginRequest): Observable<SessionUser | null> {
        return this.http.post<LoginResponse>(this.loginUrl, payload).pipe(
            map((response) => this.toSessionUser(response, payload.login)),
            tap((session) => {
                if (session) {
                    this.saveSession(session);
                }
            }),
            catchError(() => of(null))
        );
    }

    logout(redirectToLogin = true): void {
        localStorage.removeItem(this.storageKey);
        if (redirectToLogin) {
            this.router.navigate(['/auth/login']);
        }
    }

    getSession(): SessionUser | null {
        const raw = localStorage.getItem(this.storageKey);
        if (!raw) {
            return null;
        }

        try {
            const session = JSON.parse(raw) as SessionUser;
            if (!session?.token) {
                return null;
            }
            return session;
        } catch {
            return null;
        }
    }

    isAuthenticated(): boolean {
        const session = this.getSession();
        if (!session) {
            return false;
        }

        if (this.isExpired(session.exp)) {
            this.logout(false);
            return false;
        }

        return true;
    }

    getToken(): string | null {
        if (!this.isAuthenticated()) {
            return null;
        }
        return this.getSession()?.token ?? null;
    }

    getRole(): string | null {
        return this.getSession()?.role ?? null;
    }

    redirectByRole(): void {
        const role = (this.getRole() ?? '').toUpperCase();
        if (role.includes('ADMIN')) {
            this.router.navigate(['/dashboard']);
            return;
        }

        this.router.navigate(['/']);
    }

    enforceSessionExpiration(): void {
        if (!this.isAuthenticated()) {
            this.router.navigate(['/auth/login']);
        }
    }

    private saveSession(session: SessionUser): void {
        localStorage.setItem(this.storageKey, JSON.stringify(session));
    }

    private toSessionUser(response: LoginResponse, fallbackUsername: string): SessionUser | null {
        const token = response.token ?? response.accessToken ?? response.jwt;
        if (!token) {
            return null;
        }

        const decoded = this.decodeJwtPayload(token);
        const role = this.resolveRole(response, decoded);

        return {
            token,
            role,
            username: response.username ?? fallbackUsername,
            exp: this.resolveExp(decoded)
        };
    }

    private resolveRole(response: LoginResponse, decoded: Record<string, unknown> | null): string {
        const explicitRole = response.role ?? response.roles?.[0];
        if (explicitRole) {
            return explicitRole;
        }

        const decodedRole = decoded?.['role'] ?? decoded?.['roles'];
        if (Array.isArray(decodedRole) && decodedRole.length > 0) {
            return String(decodedRole[0]);
        }

        if (typeof decodedRole === 'string' && decodedRole.trim().length > 0) {
            return decodedRole;
        }

        return 'TEACHER';
    }

    private resolveExp(decoded: Record<string, unknown> | null): number | undefined {
        const exp = decoded?.['exp'];
        if (typeof exp === 'number') {
            return exp;
        }
        return undefined;
    }

    private isExpired(exp?: number): boolean {
        if (!exp) {
            return false;
        }

        const nowInSeconds = Math.floor(Date.now() / 1000);
        return exp <= nowInSeconds;
    }

    private decodeJwtPayload(token: string): Record<string, unknown> | null {
        const parts = token.split('.');
        if (parts.length < 2) {
            return null;
        }

        const payload = parts[1];
        try {
            const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
            const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
            const decoded = atob(padded);
            return JSON.parse(decoded) as Record<string, unknown>;
        } catch {
            return null;
        }
    }
}
