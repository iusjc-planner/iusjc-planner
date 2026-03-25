import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group, GroupStats } from '../../shared/models/group.model';
import { ApiEndpoints } from '../config/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private apiUrl = ApiEndpoints.groups;

  constructor(private http: HttpClient) { }

  getAll(params?: { name?: string; level?: string; schoolId?: number; status?: string }): Observable<Group[]> {
    return this.http.get<Group[]>(this.apiUrl, { params: params as any });
  }

  getById(id: number): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${id}`);
  }

  create(payload: Group): Observable<Group> {
    return this.http.post<Group>(this.apiUrl, payload);
  }

  update(id: number, payload: Group): Observable<Group> {
    return this.http.put<Group>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<GroupStats> {
    return this.http.get<GroupStats>(`${this.apiUrl}/stats`);
  }
}
