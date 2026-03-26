import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiEndpoints } from '../config/api-endpoints';
import { Group } from '../models/group.model';

interface GroupApi {
    id?: number;
    name: string;
    level?: string;
    schoolId?: number;
    filiereId: number;
    size?: number;
    status?: 'ACTIVE' | 'INACTIVE';
}

@Injectable({ providedIn: 'root' })
export class GroupService {
    private readonly http = inject(HttpClient);
    private readonly endpoint = ApiEndpoints.groups;

    getAll(): Observable<Group[]> {
        return this.http.get<GroupApi[]>(this.endpoint).pipe(map((groups) => groups.map((group) => this.fromApi(group))));
    }

    getById(id: number): Observable<Group> {
        return this.http.get<GroupApi>(`${this.endpoint}/${id}`).pipe(map((group) => this.fromApi(group)));
    }

    create(payload: Group): Observable<Group> {
        return this.http.post<GroupApi>(this.endpoint, this.toApi(payload)).pipe(map((group) => this.fromApi(group)));
    }

    update(id: number, payload: Group): Observable<Group> {
        return this.http.put<GroupApi>(`${this.endpoint}/${id}`, this.toApi(payload)).pipe(map((group) => this.fromApi(group)));
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.endpoint}/${id}`);
    }

    private toApi(payload: Group): GroupApi {
        return {
            id: payload.id,
            name: payload.nom,
            level: payload.niveau,
            schoolId: payload.schoolId,
            filiereId: Number(payload.filiere || 0),
            size: payload.effectif,
            status: 'ACTIVE'
        };
    }

    private fromApi(payload: GroupApi): Group {
        return {
            id: payload.id,
            nom: payload.name,
            niveau: payload.level,
            schoolId: payload.schoolId,
            filiere: String(payload.filiereId),
            effectif: payload.size
        };
    }
}
