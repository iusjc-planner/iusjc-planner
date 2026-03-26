import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../config/api-endpoints';
import { GenerateReportRequest, Report, ReportFormat, ReportType } from '../../shared/models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly apiUrl = ApiEndpoints.reports;

  constructor(private http: HttpClient) {}

  list(type?: ReportType): Observable<Report[]> {
    let params = new HttpParams();
    if (type) {
      params = params.set('type', type);
    }
    return this.http.get<Report[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/${id}`);
  }

  generate(request: GenerateReportRequest): Observable<Report> {
    return this.http.post<Report>(`${this.apiUrl}/generate`, request);
  }

  generateRoomReport(from: string, to: string, format: ReportFormat, salleId?: number): Observable<Report> {
    let params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('format', format);

    if (salleId) {
      params = params.set('salleId', salleId.toString());
    }

    return this.http.get<Report>(`${this.apiUrl}/occupation-salle`, { params });
  }

  generateTeacherLoadReport(from: string, to: string, format: ReportFormat, teacherId?: number): Observable<Report> {
    let params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('format', format);

    if (teacherId) {
      params = params.set('teacherId', teacherId.toString());
    }

    return this.http.get<Report>(`${this.apiUrl}/charge-enseignant`, { params });
  }

  generateGlobalReport(from: string, to: string, format: ReportFormat): Observable<Report> {
    const params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('format', format);

    return this.http.get<Report>(`${this.apiUrl}/global`, { params });
  }

  download(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
