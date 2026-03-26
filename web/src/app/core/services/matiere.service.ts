import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../config/api-endpoints';
import { Matiere, MatiereStats } from '../models/matiere.model';

@Injectable({ providedIn: 'root' })
export class MatiereService {
    private readonly http = inject(HttpClient);
    private readonly endpoint = ApiEndpoints.matieres;

    getAll(): Observable<Matiere[]> {
        return this.http.get<Matiere[]>(this.endpoint);
    }

    getById(id: number): Observable<Matiere> {
        return this.http.get<Matiere>(`${this.endpoint}/${id}`);
    }

    create(payload: Matiere): Observable<Matiere> {
        return this.http.post<Matiere>(this.endpoint, this.toApi(payload));
    }

    update(id: number, payload: Matiere): Observable<Matiere> {
        return this.http.put<Matiere>(`${this.endpoint}/${id}`, this.toApi(payload));
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.endpoint}/${id}`);
    }

    getStats(): Observable<MatiereStats> {
        return this.http.get<MatiereStats>(`${this.endpoint}/stats`);
    }

    private toApi(payload: Matiere): Matiere {
        return {
            id: payload.id,
            code: payload.code.trim(),
            nom: payload.nom.trim(),
            description: payload.description?.trim() || undefined,
            schoolId: payload.schoolId,
            filiereId: payload.filiereId,
            teacherId: payload.teacherId,
            credits: payload.credits,
            hoursTotal: payload.hoursTotal,
            status: payload.status || 'ACTIVE'
        };
    }
}
