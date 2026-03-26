import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ApiEndpoints } from '../config/api-endpoints';
import { Teacher } from '../models/teacher.model';

@Injectable({ providedIn: 'root' })
export class TeacherService {
    private readonly http = inject(HttpClient);
    private readonly endpoint = ApiEndpoints.teachers;
    private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    getAll(): Observable<Teacher[]> {
        return this.http.get<Teacher[]>(this.endpoint);
    }

    getById(id: number): Observable<Teacher> {
        return this.http.get<Teacher>(`${this.endpoint}/${id}`);
    }

    create(payload: Teacher): Observable<Teacher> {
        const validationError = this.validatePayload(payload);
        if (validationError) {
            return throwError(() => new Error(validationError));
        }

        return this.http.post<Teacher>(this.endpoint, payload);
    }

    update(id: number, payload: Teacher): Observable<Teacher> {
        const validationError = this.validatePayload(payload);
        if (validationError) {
            return throwError(() => new Error(validationError));
        }

        return this.http.put<Teacher>(`${this.endpoint}/${id}`, payload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.endpoint}/${id}`);
    }

    private validatePayload(payload: Teacher): string | null {
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

        return null;
    }
}
