import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Group, GroupStats } from '../../../shared/models/group.model';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private apiUrl = `${environment.apiUrl}/groups`;

  constructor(private http: HttpClient) { }

  list(params?: { name?: string; level?: string; schoolId?: number; status?: string }): Observable<Group[]> {
    return this.http.get<Group[]>(this.apiUrl, { params: params as any });
  }

  get(id: number): Observable<Group> {
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

  stats(): Observable<GroupStats> {
    return this.http.get<GroupStats>(`${this.apiUrl}/stats`);
  }
}
