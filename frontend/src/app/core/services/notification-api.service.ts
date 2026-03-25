import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ApiEndpoints } from '../config/api-endpoints';
import { NotificationFilters, NotificationStats, UserNotification } from '../../shared/models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationApiService {
  private apiUrl = ApiEndpoints.notifications;

  constructor(private http: HttpClient) {}

  getAll(filters?: NotificationFilters): Observable<UserNotification[]> {
    let params = new HttpParams();
    if (filters?.userId !== undefined) params = params.set('userId', filters.userId.toString());
    if (filters?.read !== undefined) params = params.set('read', filters.read.toString());
    if (filters?.type) params = params.set('type', filters.type);
    if (filters?.from) params = params.set('from', filters.from);
    if (filters?.to) params = params.set('to', filters.to);
    return this.http.get<UserNotification[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<UserNotification> {
    return this.http.get<UserNotification>(`${this.apiUrl}/${id}`);
  }

  create(payload: UserNotification): Observable<UserNotification> {
    const validationError = this.validatePayload(payload);
    if (validationError) {
      return throwError(() => new Error(validationError));
    }
    return this.http.post<UserNotification>(this.apiUrl, payload);
  }

  markAsRead(id: number): Observable<UserNotification> {
    return this.http.put<UserNotification>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(userId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${userId}/read-all`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStats(userId: number): Observable<NotificationStats> {
    return this.http.get<NotificationStats>(`${this.apiUrl}/users/${userId}/stats`);
  }

  private validatePayload(payload: UserNotification): string | null {
    if (!payload.userId || payload.userId <= 0) {
      return 'Le champ userId est obligatoire';
    }
    if (!payload.title || !payload.title.trim()) {
      return 'Le titre de la notification est obligatoire';
    }
    if (!payload.message || !payload.message.trim()) {
      return 'Le message de la notification est obligatoire';
    }
    if (!payload.type) {
      return 'Le type de notification est obligatoire';
    }
    return null;
  }
}
