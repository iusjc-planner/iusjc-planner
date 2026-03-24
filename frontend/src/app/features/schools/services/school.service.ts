import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface School {
  id?: number;
  name: string;
  code?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE';
  filieres?: Filiere[];
}

export interface Filiere {
  id?: number;
  code: string;
  nom: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

@Injectable({
  providedIn: 'root'
})
export class SchoolService {
  private apiUrl = 'http://localhost:8080/api/schools';

  constructor(private http: HttpClient) { }

  getAll(name?: string, status?: string): Observable<School[]> {
    let url = this.apiUrl;
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (status) params.append('status', status);
    if (params.toString()) url += '?' + params.toString();
    return this.http.get<School[]>(url);
  }

  getById(id: number): Observable<School> {
    return this.http.get<School>(`${this.apiUrl}/${id}`);
  }

  create(school: School): Observable<School> {
    return this.http.post<School>(this.apiUrl, school);
  }

  update(id: number, school: School): Observable<School> {
    return this.http.put<School>(`${this.apiUrl}/${id}`, school);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Filière methods
  getAllFilieres(): Observable<Filiere[]> {
    return this.http.get<Filiere[]>(`${this.apiUrl}/filieres`);
  }

  getFilieresBySchool(schoolId: number): Observable<Filiere[]> {
    return this.http.get<Filiere[]>(`${this.apiUrl}/${schoolId}/filieres`);
  }

  addFiliere(schoolId: number, filiere: Filiere): Observable<Filiere> {
    return this.http.post<Filiere>(`${this.apiUrl}/${schoolId}/filieres`, filiere);
  }

  updateFiliere(id: number, filiere: Filiere): Observable<Filiere> {
    return this.http.put<Filiere>(`${this.apiUrl}/filieres/${id}`, filiere);
  }

  deleteFiliere(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/filieres/${id}`);
  }
}
