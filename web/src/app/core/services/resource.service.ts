import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../config/api-endpoints';
import { Resource } from '../models/resource.model';

@Injectable({ providedIn: 'root' })
export class ResourceService {
    private readonly http = inject(HttpClient);
    private readonly endpoint = ApiEndpoints.resources;

    getAll(): Observable<Resource[]> {
        return this.http.get<Resource[]>(this.endpoint);
    }

    getById(id: number): Observable<Resource> {
        return this.http.get<Resource>(`${this.endpoint}/${id}`);
    }

    create(payload: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Observable<Resource> {
        return this.http.post<Resource>(this.endpoint, payload);
    }

    update(id: number, payload: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Observable<Resource> {
        return this.http.put<Resource>(`${this.endpoint}/${id}`, payload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.endpoint}/${id}`);
    }
}
