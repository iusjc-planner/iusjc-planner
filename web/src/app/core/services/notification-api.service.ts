import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../config/api-endpoints';
import { AppNotification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
    private readonly http = inject(HttpClient);
    private readonly endpoint = ApiEndpoints.notifications;

    getAll(): Observable<AppNotification[]> {
        return this.http.get<AppNotification[]>(this.endpoint);
    }

    markAsRead(id: number): Observable<AppNotification> {
        return this.http.patch<AppNotification>(`${this.endpoint}/${id}/read`, {});
    }

    markAllAsRead(): Observable<void> {
        return this.http.patch<void>(`${this.endpoint}/read-all`, {});
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.endpoint}/${id}`);
    }
}
