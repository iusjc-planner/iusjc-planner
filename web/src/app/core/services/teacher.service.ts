import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ApiEndpoints } from '../config/api-endpoints';
import { Teacher } from '../models/teacher.model';

interface TeacherRequest {
    userId: number;
    specialities: string[];
}

@Injectable({ providedIn: 'root' })
export class TeacherService {
    private readonly http = inject(HttpClient);
    private readonly endpoint = ApiEndpoints.teachers;

    getAll(): Observable<Teacher[]> {
        return this.http.get<Teacher[]>(this.endpoint);
    }

    getById(id: number): Observable<Teacher> {
        return this.http.get<Teacher>(`${this.endpoint}/${id}`);
    }

    getByUserId(userId: number): Observable<Teacher> {
        return this.http.get<Teacher>(`${this.endpoint}/by-user/${userId}`);
    }

    create(payload: Teacher): Observable<Teacher> {
        if (!payload.userId) {
            return throwError(() => new Error('userId est obligatoire pour creer un enseignant'));
        }

        return this.createForUser(payload.userId, payload.specialities || []);
    }

    createForUser(userId: number, specialities: string[]): Observable<Teacher> {
        return this.http.post<Teacher>(this.endpoint, this.toRequest(userId, specialities));
    }

    update(id: number, payload: Teacher): Observable<Teacher> {
        if (!payload.userId) {
            return throwError(() => new Error('userId est obligatoire pour mettre a jour un enseignant'));
        }

        return this.updateSpecialities(id, payload.userId, payload.specialities || []);
    }

    updateSpecialities(id: number, userId: number, specialities: string[]): Observable<Teacher> {
        return this.http.put<Teacher>(`${this.endpoint}/${id}`, this.toRequest(userId, specialities));
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.endpoint}/${id}`);
    }

    private toRequest(userId: number, specialities: string[]): TeacherRequest {
        return {
            userId,
            specialities: Array.from(new Set((specialities || []).map((item) => item.trim()).filter((item) => item.length > 0)))
        };
    }
}
