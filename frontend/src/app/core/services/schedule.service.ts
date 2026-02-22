import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ScheduleEntry, ScheduleFilters, ScheduleStats, ScheduleGenerateRequest, GenerationConfig, GenerationResult } from '../../shared/models/schedule.model';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private apiUrl = `${environment.apiUrl}/schedule`;

  constructor(private http: HttpClient) {}

  list(params?: any): Observable<ScheduleEntry[]> {
    return this.http.get<ScheduleEntry[]>(this.apiUrl, { params });
  }

  get(id: number): Observable<ScheduleEntry> {
    return this.http.get<ScheduleEntry>(`${this.apiUrl}/${id}`);
  }

  create(payload: ScheduleEntry): Observable<ScheduleEntry> {
    return this.http.post<ScheduleEntry>(this.apiUrl, payload);
  }

  update(id: number, payload: ScheduleEntry): Observable<ScheduleEntry> {
    return this.http.put<ScheduleEntry>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Annuler une séance (seule modification manuelle de statut autorisée)
   */
  cancel(id: number): Observable<ScheduleEntry> {
    return this.http.put<ScheduleEntry>(`${this.apiUrl}/${id}/cancel`, {});
  }

  stats(): Observable<ScheduleStats> {
    return this.http.get<ScheduleStats>(`${this.apiUrl}/stats`);
  }

  exportPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/export/pdf`, { responseType: 'blob' });
  }

  exportExcel(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/export/excel`, { responseType: 'blob' });
  }

  /**
   * Génération automatique avec l'algorithme Ford-Fulkerson
   */
  generateAuto(config?: GenerationConfig): Observable<GenerationResult> {
    return this.http.post<GenerationResult>(`${this.apiUrl}/generate`, config || {});
  }
}
