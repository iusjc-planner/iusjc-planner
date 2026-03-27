import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { School, SchoolStats, Filiere } from '../../shared/models/school.model';
import { ApiEndpoints } from '../config/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class SchoolService {
  private apiUrl = ApiEndpoints.schools;

  constructor(private http: HttpClient) { }

  getAllSchools(params?: { name?: string; status?: string }): Observable<School[]> {
    return this.http.get<School[]>(this.apiUrl, { params: params as any });
  }

  getSchoolById(id: number): Observable<School> {
    return this.http.get<School>(`${this.apiUrl}/${id}`);
  }

  createSchool(school: School): Observable<School> {
    return this.http.post<School>(this.apiUrl, school);
  }

  updateSchool(id: number, school: School): Observable<School> {
    return this.http.put<School>(`${this.apiUrl}/${id}`, school);
  }

  deleteSchool(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<SchoolStats> {
    return this.http.get<SchoolStats>(`${this.apiUrl}/stats`);
  }

  // === Méthodes pour les filières ===

  getAllFilieres(): Observable<Filiere[]> {
    return this.http.get<Filiere[]>(`${this.apiUrl}/filieres`);
  }

  getFilieresBySchool(schoolId: number): Observable<Filiere[]> {
    return this.http.get<Filiere[]>(`${this.apiUrl}/${schoolId}/filieres`);
  }

  getFiliereById(id: number): Observable<Filiere> {
    return this.http.get<Filiere>(`${this.apiUrl}/filieres/${id}`);
  }

  addFiliereToSchool(schoolId: number, filiere: Filiere): Observable<Filiere> {
    return this.http.post<Filiere>(`${this.apiUrl}/${schoolId}/filieres`, filiere);
  }

  updateFiliere(filiereId: number, filiere: Filiere): Observable<Filiere> {
    return this.http.put<Filiere>(`${this.apiUrl}/filieres/${filiereId}`, filiere);
  }

  deleteFiliere(filiereId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/filieres/${filiereId}`);
  }
}