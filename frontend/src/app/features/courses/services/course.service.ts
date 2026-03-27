import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Course {
  id?: number;
  code: string;
  title: string;
  description?: string;
  credits: number;
  filiereId: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:8080/api/courses';

  constructor(private http: HttpClient) { }

  getAll(filiereId?: number, status?: string): Observable<Course[]> {
    let url = this.apiUrl;
    const params = new URLSearchParams();
    if (filiereId) params.append('filiereId', filiereId.toString());
    if (status) params.append('status', status);
    if (params.toString()) url += '?' + params.toString();
    return this.http.get<Course[]>(url);
  }

  getById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`);
  }

  getByFiliere(filiereId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/filiere/${filiereId}`);
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
}
