import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room, RoomStatus, RoomType } from '../../shared/models/room.model';
import { ApiEndpoints } from '../config/api-endpoints';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private apiUrl = ApiEndpoints.rooms;

  constructor(private http: HttpClient) {}

  getAll(filters?: { name?: string; type?: RoomType; status?: RoomStatus; minCapacity?: number; equipments?: string[] }): Observable<Room[]> {
    let params = new HttpParams();
    if (filters?.name) params = params.set('name', filters.name);
    if (filters?.type) params = params.set('type', filters.type);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.minCapacity) params = params.set('minCapacity', filters.minCapacity);
    if (filters?.equipments?.length) params = params.set('equipments', filters.equipments.join(','));
    return this.http.get<Room[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`);
  }

  create(room: Room): Observable<Room> {
    return this.http.post<Room>(this.apiUrl, room);
  }

  update(id: number, room: Room): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${id}`, room);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAvailable(params: { start: string; end: string; minCapacity?: number; equipments?: string[] }): Observable<Room[]> {
    let httpParams = new HttpParams().set('start', params.start).set('end', params.end);
    if (params.minCapacity) httpParams = httpParams.set('minCapacity', params.minCapacity);
    if (params.equipments?.length) httpParams = httpParams.set('equipments', params.equipments.join(','));
    return this.http.get<Room[]>(`${this.apiUrl}/available`, { params: httpParams });
  }
}
