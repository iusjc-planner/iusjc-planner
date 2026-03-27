import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ApiEndpoints } from '../config/api-endpoints';
import { User, UserFilters } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
    private readonly http = inject(HttpClient);
    private readonly endpoint = ApiEndpoints.users;
    private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    getAll(filters?: UserFilters): Observable<User[]> {
        let params = new HttpParams();
        if (filters?.search) params = params.set('search', filters.search);
        if (filters?.role) params = params.set('role', filters.role);
        if (filters?.statut) params = params.set('statut', filters.statut);
        if (filters?.page !== undefined) params = params.set('page', filters.page);
        if (filters?.size !== undefined) params = params.set('size', filters.size);

        return this.http.get<User[]>(this.endpoint, { params });
    }

    getById(id: number): Observable<User> {
        return this.http.get<User>(`${this.endpoint}/${id}`);
    }

    create(payload: User): Observable<User> {
        const normalizedPayload = this.normalizePayload(payload, false);
        const validationError = this.validatePayload(normalizedPayload);
        if (validationError) {
            return throwError(() => new Error(validationError));
        }

        return this.http.post<User>(this.endpoint, normalizedPayload);
    }

    update(id: number, payload: User): Observable<User> {
        const normalizedPayload = this.normalizePayload(payload, true);
        const validationError = this.validatePayload(normalizedPayload);
        if (validationError) {
            return throwError(() => new Error(validationError));
        }

        return this.http.put<User>(`${this.endpoint}/${id}`, normalizedPayload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.endpoint}/${id}`);
    }

    private validatePayload(payload: User): string | null {
        if (!payload.nom?.trim()) {
            return 'Le nom est obligatoire';
        }

        if (!payload.prenom?.trim()) {
            return 'Le prenom est obligatoire';
        }

        if (!payload.login?.trim()) {
            return 'Le login est obligatoire';
        }

        if (!payload.email?.trim() || !this.emailRegex.test(payload.email)) {
            return 'Email invalide';
        }

        if (!payload.role?.trim()) {
            return 'Le role est obligatoire';
        }

        return null;
    }

    private normalizePayload(payload: User, isUpdate: boolean): User {
        const roleMap: Record<string, string> = {
            administrateur: 'ADMIN',
            admin: 'ADMIN',
            enseignant: 'ENSEIGNANT',
            support: 'ENSEIGNANT'
        };

        const statusMap: Record<string, 'ACTIVE' | 'INACTIVE'> = {
            actif: 'ACTIVE',
            active: 'ACTIVE',
            inactif: 'INACTIVE',
            inactive: 'INACTIVE'
        };

        const roleKey = (payload.role || '').trim().toLowerCase();
        const normalizedRole = roleMap[roleKey] || payload.role;

        const sourceStatus = payload.status || payload.statut || 'ACTIVE';
        const statusKey = sourceStatus.trim().toLowerCase();
        const normalizedStatus = statusMap[statusKey] || (sourceStatus as 'ACTIVE' | 'INACTIVE');

        return {
            ...payload,
            role: normalizedRole,
            status: normalizedStatus,
            statut: sourceStatus,
            telephone: payload.telephone,
            password: isUpdate ? payload.password : payload.password || 'ADmin123!'
        };
    }
}
