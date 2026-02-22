import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Course, CourseFilters, CourseStats } from '../../shared/models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = `${environment.apiUrl}/courses`;

  constructor(private http: HttpClient) {}

  getAll(filters?: CourseFilters): Observable<Course[]> {
    let params = new HttpParams();
    if (filters?.matiereId) params = params.set('matiereId', filters.matiereId.toString());
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.type) params = params.set('type', filters.type);
    if (filters?.teacherId) params = params.set('teacherId', filters.teacherId.toString());
    if (filters?.roomId) params = params.set('roomId', filters.roomId.toString());
    if (filters?.groupId) params = params.set('groupId', filters.groupId.toString());
    if (filters?.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params = params.set('dateTo', filters.dateTo);
    return this.http.get<Course[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`);
  }

  getByMatiere(matiereId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/matiere/${matiereId}`);
  }

  getByDate(date: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/date/${date}`);
  }

  getByDateRange(startDate: string, endDate: string): Observable<Course[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<Course[]>(`${this.apiUrl}/date-range`, { params });
  }

  getByTeacherAndDate(teacherId: number, date: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/teacher/${teacherId}/date/${date}`);
  }

  getByRoomAndDate(roomId: number, date: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/room/${roomId}/date/${date}`);
  }

  create(course: Course): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, course);
  }

  update(id: number, course: Course): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/${id}`, course);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<CourseStats> {
    return this.http.get<CourseStats>(`${this.apiUrl}/stats`);
  }
}
