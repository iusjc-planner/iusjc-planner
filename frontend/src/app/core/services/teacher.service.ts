import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { Teacher, TeacherFilters, TeacherStats, TeacherAvailability, AvailabilityGrid, IcsImportResult } from '../../shared/models/teacher.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private apiUrl = `${environment.apiUrl}/teachers`;

  constructor(private http: HttpClient) { }

  getAllTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(this.apiUrl);
  }

  getTeacherById(id: number): Observable<Teacher> {
    return this.http.get<Teacher>(`${this.apiUrl}/${id}`);
  }

  createTeacher(teacher: Teacher): Observable<Teacher> {
    return this.http.post<Teacher>(this.apiUrl, teacher);
  }

  updateTeacher(id: number, teacher: Teacher): Observable<Teacher> {
    return this.http.put<Teacher>(`${this.apiUrl}/${id}`, teacher);
  }

  deleteTeacher(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getTeacherStats(): Observable<TeacherStats> {
    return this.http.get<Teacher[]>(this.apiUrl).pipe(
      map((teachers) => ({
        totalTeachers: teachers.length,
        totalCourses: teachers.reduce((total, teacher) => total + (teacher.coursesCount || 0), 0)
      }))
    );
  }

  searchTeachers(filters: TeacherFilters): Observable<Teacher[]> {
    if (filters.status) {
      return this.http.get<Teacher[]>(`${this.apiUrl}/by-status/${filters.status}`);
    }
    if (filters.grade) {
      return this.http.get<Teacher[]>(`${this.apiUrl}/by-grade/${filters.grade}`);
    }

    let params = new HttpParams();
    if (filters.searchTerm) {
      params = params
        .set('nom', filters.searchTerm)
        .set('prenom', filters.searchTerm)
        .set('email', filters.searchTerm);
    }
    if (filters.subject) {
      params = params.set('specialite', filters.subject);
    }

    return this.http.get<Teacher[]>(`${this.apiUrl}/search`, { params });
  }

  // === Méthodes pour la gestion des disponibilités ===

  /**
   * Récupère toutes les disponibilités d'un enseignant
   */
  getAvailabilities(teacherId: number): Observable<TeacherAvailability[]> {
    return this.http.get<TeacherAvailability[]>(`${this.apiUrl}/${teacherId}/availability`);
  }

  /**
   * Récupère la grille de disponibilités hebdomadaires
   * Format: { 1: { "08:00-09:00": "available", ... }, ... }
   */
  getAvailabilityGrid(teacherId: number): Observable<AvailabilityGrid> {
    return this.http.get<AvailabilityGrid>(`${this.apiUrl}/${teacherId}/availability/grid`);
  }

  /**
   * Récupère les exceptions (indisponibilités ponctuelles)
   */
  getAvailabilityExceptions(teacherId: number): Observable<TeacherAvailability[]> {
    return this.http.get<TeacherAvailability[]>(`${this.apiUrl}/${teacherId}/availability/exceptions`);
  }

  /**
   * Crée une nouvelle disponibilité manuellement
   */
  createAvailability(teacherId: number, availability: TeacherAvailability): Observable<TeacherAvailability> {
    return this.http.post<TeacherAvailability>(`${this.apiUrl}/${teacherId}/availability`, availability);
  }

  /**
   * Met à jour une disponibilité existante
   */
  updateAvailability(teacherId: number, availabilityId: number, availability: TeacherAvailability): Observable<TeacherAvailability> {
    return this.http.put<TeacherAvailability>(`${this.apiUrl}/${teacherId}/availability/${availabilityId}`, availability);
  }

  /**
   * Supprime une disponibilité
   */
  deleteAvailability(teacherId: number, availabilityId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${teacherId}/availability/${availabilityId}`);
  }

  /**
   * Importe un fichier ICS (Google Calendar export)
   * @param teacherId ID de l'enseignant
   * @param file Fichier ICS à importer
   * @param replaceExisting Si true, supprime les imports précédents
   */
  importIcsFile(teacherId: number, file: File, replaceExisting: boolean = false): Observable<IcsImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('replaceExisting', replaceExisting.toString());
    
    return this.http.post<IcsImportResult>(`${this.apiUrl}/${teacherId}/availability/import-ics`, formData);
  }

  /**
   * Supprime toutes les disponibilités importées via ICS
   */
  deleteIcsImportedAvailabilities(teacherId: number): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.apiUrl}/${teacherId}/availability/ics-imported`);
  }

  /**
   * Vérifie si un enseignant est disponible à une date/heure donnée
   */
  checkAvailability(teacherId: number, date: string, startTime: string, endTime: string): Observable<{available: boolean}> {
    const params = new HttpParams()
      .set('date', date)
      .set('startTime', startTime)
      .set('endTime', endTime);
    
    return this.http.get<{available: boolean}>(`${this.apiUrl}/${teacherId}/availability/check`, { params });
  }
}