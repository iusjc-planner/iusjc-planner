import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Matiere, MatiereFilters, MatiereStats } from '../../shared/models/matiere.model';

@Injectable({
  providedIn: 'root'
})
export class MatiereService {
  private apiUrl = `${environment.apiUrl}/matieres`;

  constructor(private http: HttpClient) {}

  getAll(filters?: MatiereFilters): Observable<Matiere[]> {
    let params = new HttpParams();
    if (filters?.code) params = params.set('code', filters.code);
    if (filters?.nom) params = params.set('nom', filters.nom);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.schoolId) params = params.set('schoolId', filters.schoolId.toString());
    if (filters?.filiereId) params = params.set('filiereId', filters.filiereId.toString());
    if (filters?.teacherId) params = params.set('teacherId', filters.teacherId.toString());
    return this.http.get<Matiere[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Matiere> {
    return this.http.get<Matiere>(`${this.apiUrl}/${id}`);
  }

  getByCode(code: string): Observable<Matiere> {
    return this.http.get<Matiere>(`${this.apiUrl}/code/${code}`);
  }

  getBySchool(schoolId: number): Observable<Matiere[]> {
    return this.http.get<Matiere[]>(`${this.apiUrl}/school/${schoolId}`);
  }

  getByFiliere(filiereId: number): Observable<Matiere[]> {
    return this.http.get<Matiere[]>(`${this.apiUrl}/filiere/${filiereId}`);
  }

  getByTeacher(teacherId: number): Observable<Matiere[]> {
    return this.http.get<Matiere[]>(`${this.apiUrl}/teacher/${teacherId}`);
  }

  create(matiere: Matiere): Observable<Matiere> {
    return this.http.post<Matiere>(this.apiUrl, matiere);
  }

  update(id: number, matiere: Matiere): Observable<Matiere> {
    return this.http.put<Matiere>(`${this.apiUrl}/${id}`, matiere);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<MatiereStats> {
    return this.http.get<MatiereStats>(`${this.apiUrl}/stats`);
  }
}
