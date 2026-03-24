import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Student {
  id?: number;
  matricule: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  groupId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'http://localhost:8080/api/students';

  constructor(private http: HttpClient) { }

  getAll(matricule?: string, nom?: string, prenom?: string, status?: string): Observable<Student[]> {
    let url = this.apiUrl;
    const params = new URLSearchParams();
    if (matricule) params.append('matricule', matricule);
    if (nom) params.append('nom', nom);
    if (prenom) params.append('prenom', prenom);
    if (status) params.append('status', status);
    if (params.toString()) url += '?' + params.toString();
    return this.http.get<Student[]>(url);
  }

  getById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  create(student: Student): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, student);
  }

  update(id: number, student: Student): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/${id}`, student);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
