import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ScheduleEntry {
  id?: number;
  courseId: string;
  teacherId: string;
  roomId: string;
  groupId: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
}

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private apiUrl = 'http://localhost:8080/api/schedule';

  constructor(private http: HttpClient) { }

  getAll(courseId?: string, teacherId?: string, roomId?: string, groupId?: string, status?: string): Observable<ScheduleEntry[]> {
    let url = this.apiUrl;
    const params = new URLSearchParams();
    if (courseId) params.append('courseId', courseId);
    if (teacherId) params.append('teacherId', teacherId);
    if (roomId) params.append('roomId', roomId);
    if (groupId) params.append('groupId', groupId);
    if (status) params.append('status', status);
    if (params.toString()) url += '?' + params.toString();
    return this.http.get<ScheduleEntry[]>(url);
  }

  getById(id: number): Observable<ScheduleEntry> {
    return this.http.get<ScheduleEntry>(`${this.apiUrl}/${id}`);
  }

  create(entry: ScheduleEntry): Observable<ScheduleEntry> {
    return this.http.post<ScheduleEntry>(this.apiUrl, entry);
  }

  update(id: number, entry: ScheduleEntry): Observable<ScheduleEntry> {
    return this.http.put<ScheduleEntry>(`${this.apiUrl}/${id}`, entry);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  generateAuto(): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate`, {});
  }
}
