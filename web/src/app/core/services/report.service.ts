import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ApiEndpoints } from '../config/api-endpoints';
import { ReportMetadata, ReportRequest } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
    private readonly http = inject(HttpClient);
    private readonly endpoint = ApiEndpoints.reports;

    listReports(): Observable<ReportMetadata[]> {
        return this.http.get<ReportMetadata[]>(this.endpoint);
    }

    generate(payload: ReportRequest): Observable<ReportMetadata> {
        const validationError = this.validatePayload(payload);
        if (validationError) {
            return throwError(() => new Error(validationError));
        }

        return this.http.post<ReportMetadata>(`${this.endpoint}/generate`, payload);
    }

    download(reportId: string): Observable<Blob> {
        return this.http.get(`${this.endpoint}/${reportId}/download`, { responseType: 'blob' });
    }

    getDashboardStats(): Observable<Record<string, unknown>> {
        return this.http.get<Record<string, unknown>>(`${this.endpoint}/dashboard-stats`);
    }

    private validatePayload(payload: ReportRequest): string | null {
        if (!payload.type?.trim()) {
            return 'Le type de rapport est obligatoire';
        }

        if (!payload.format) {
            return 'Le format de rapport est obligatoire';
        }

        if (payload.fromDate && payload.toDate && payload.fromDate > payload.toDate) {
            return 'La date de debut doit etre anterieure a la date de fin';
        }

        return null;
    }
}
