import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiEndpoints } from '../config/api-endpoints';
import { School, SchoolFiliere } from '../models/school.model';

interface SchoolApi {
    id?: number;
    name: string;
    code?: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    filieres?: SchoolFiliereApi[];
}

interface SchoolFiliereApi {
    id?: number;
    code: string;
    nom: string;
    description?: string;
    status?: 'ACTIVE' | 'INACTIVE';
}

@Injectable({ providedIn: 'root' })
export class SchoolService {
    private readonly http = inject(HttpClient);
    private readonly endpoint = ApiEndpoints.schools;

    getAll(): Observable<School[]> {
        return this.http.get<SchoolApi[]>(this.endpoint).pipe(map((schools) => schools.map((school) => this.fromApi(school))));
    }

    getById(id: number): Observable<School> {
        return this.http.get<SchoolApi>(`${this.endpoint}/${id}`).pipe(map((school) => this.fromApi(school)));
    }

    create(payload: School): Observable<School> {
        const validationError = this.validatePayload(payload);
        if (validationError) {
            return throwError(() => new Error(validationError));
        }

        return this.http.post<SchoolApi>(this.endpoint, this.toApi(payload)).pipe(map((school) => this.fromApi(school)));
    }

    update(id: number, payload: School): Observable<School> {
        const validationError = this.validatePayload(payload);
        if (validationError) {
            return throwError(() => new Error(validationError));
        }

        return this.http.put<SchoolApi>(`${this.endpoint}/${id}`, this.toApi(payload)).pipe(map((school) => this.fromApi(school)));
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.endpoint}/${id}`);
    }

    private validatePayload(payload: School): string | null {
        if (!payload.nom?.trim()) {
            return 'Le nom de l ecole est obligatoire';
        }

        return null;
    }

    private toApi(payload: School): SchoolApi {
        return {
            id: payload.id,
            name: payload.nom,
            code: payload.code,
            description: payload.description,
            status: payload.status,
            filieres: payload.filieres?.map((filiere) => this.toApiFiliere(filiere))
        };
    }

    private fromApi(payload: SchoolApi): School {
        return {
            id: payload.id,
            nom: payload.name,
            code: payload.code,
            description: payload.description,
            status: payload.status,
            filieres: payload.filieres?.map((filiere) => this.fromApiFiliere(filiere)) ?? []
        };
    }

    private toApiFiliere(payload: SchoolFiliere): SchoolFiliereApi {
        return {
            id: payload.id,
            code: payload.code,
            nom: payload.nom,
            description: payload.description,
            status: payload.status
        };
    }

    private fromApiFiliere(payload: SchoolFiliereApi): SchoolFiliere {
        return {
            id: payload.id,
            code: payload.code,
            nom: payload.nom,
            description: payload.description,
            status: payload.status
        };
    }
}
