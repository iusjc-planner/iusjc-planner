import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiEndpoints } from '../config/api-endpoints';
import { Room } from '../models/room.model';

interface RoomApi {
    id?: number;
    name: string;
    capacity: number;
    type?: 'CLASSROOM' | 'LAB' | 'AUDITORIUM';
    status?: 'ACTIVE' | 'MAINTENANCE';
    location?: string;
    description?: string;
}

@Injectable({ providedIn: 'root' })
export class RoomService {
    private readonly http = inject(HttpClient);
    private readonly endpoint = ApiEndpoints.rooms;

    getAll(): Observable<Room[]> {
        return this.http.get<RoomApi[]>(this.endpoint).pipe(map((rooms) => rooms.map((room) => this.fromApi(room))));
    }

    getById(id: number): Observable<Room> {
        return this.http.get<RoomApi>(`${this.endpoint}/${id}`).pipe(map((room) => this.fromApi(room)));
    }

    create(payload: Room): Observable<Room> {
        return this.http.post<RoomApi>(this.endpoint, this.toApi(payload)).pipe(map((room) => this.fromApi(room)));
    }

    update(id: number, payload: Room): Observable<Room> {
        return this.http.put<RoomApi>(`${this.endpoint}/${id}`, this.toApi(payload)).pipe(map((room) => this.fromApi(room)));
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.endpoint}/${id}`);
    }

    private toApi(payload: Room): RoomApi {
        return {
            id: payload.id,
            name: payload.code || payload.nom,
            capacity: payload.capacite,
            type: payload.type as RoomApi['type'],
            status: payload.statut as RoomApi['status'],
            location: payload.nom,
            description: payload.nom
        };
    }

    private fromApi(payload: RoomApi): Room {
        return {
            id: payload.id,
            code: payload.name,
            nom: payload.location || payload.name,
            capacite: payload.capacity,
            type: payload.type,
            statut: payload.status
        };
    }
}
