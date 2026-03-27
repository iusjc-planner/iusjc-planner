import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../config/api-endpoints';
import { ScheduleEntry } from '../models/schedule.model';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
    private readonly http = inject(HttpClient);
    private readonly endpoint = ApiEndpoints.schedule;

    getAll(params?: { fromDate?: string; toDate?: string; teacherId?: number; roomId?: number; groupId?: number }): Observable<ScheduleEntry[]> {
        let query = new HttpParams();
        if (params?.fromDate) query = query.set('fromDate', params.fromDate);
        if (params?.toDate) query = query.set('toDate', params.toDate);
        if (params?.teacherId !== undefined) query = query.set('teacherId', params.teacherId);
        if (params?.roomId !== undefined) query = query.set('roomId', params.roomId);
        if (params?.groupId !== undefined) query = query.set('groupId', params.groupId);

        return this.http.get<ScheduleEntry[]>(this.endpoint, { params: query });
    }

    getById(id: number): Observable<ScheduleEntry> {
        return this.http.get<ScheduleEntry>(`${this.endpoint}/${id}`);
    }

    create(payload: ScheduleEntry): Observable<ScheduleEntry> {
        return this.http.post<ScheduleEntry>(this.endpoint, payload);
    }

    update(id: number, payload: ScheduleEntry): Observable<ScheduleEntry> {
        return this.http.put<ScheduleEntry>(`${this.endpoint}/${id}`, payload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.endpoint}/${id}`);
    }
}
