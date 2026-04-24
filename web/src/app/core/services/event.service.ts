import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../config/api-endpoints';
import { Event } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly http = inject(HttpClient);
  // Default API endpoint in case ApiEndpoints.events is somehow not aligned
  private readonly endpoint = ApiEndpoints.events || '/api/events';

  getAll(): Observable<Event[]> {
    return this.http.get<Event[]>(this.endpoint);
  }

  getById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.endpoint}/${id}`);
  }

  create(payload: Event): Observable<Event> {
    return this.http.post<Event>(this.endpoint, payload);
  }

  update(id: number, payload: Event): Observable<Event> {
    return this.http.put<Event>(`${this.endpoint}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}

