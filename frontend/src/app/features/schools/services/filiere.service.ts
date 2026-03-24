import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Filiere {
  id?: number;
  code: string;
  nom: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  schoolId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FiliereService {
  private apiUrl = 'http://localhost:8080/api/filieres';

  constructor(private http: HttpClient) { }

  getAll(code?: string, nom?: string, status?: string, schoolId?: number): Observable<Filiere[]> {
    let url = this.apiUrl;
    const params = new URLSearchParams();
    if (code) params.append('code', code);
    if (nom) params.append('nom', nom);
    if (status) params.append('status', status);
    if (schoolId) params.append('schoolId', schoolId.toString());
    if (params.toString()) url += '?' + params.toString();
    return this.http.get<Filiere[]>(url);
  }

  getById(id: number): Observable<Filiere> {
    return this.http.get<Filiere>(`${this.apiUrl}/${id}`);
  }

  getBySchoolId(schoolId: number): Observable<Filiere[]> {
    return this.http.get<Filiere[]>(`${this.apiUrl}/by-school/${schoolId}`);
  }

  create(filiere: Filiere): Observable<Filiere> {
    return this.http.post<Filiere>(this.apiUrl, filiere);
  }

  update(id: number, filiere: Filiere): Observable<Filiere> {
    return this.http.put<Filiere>(`${this.apiUrl}/${id}`, filiere);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
