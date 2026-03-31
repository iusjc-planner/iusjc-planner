import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ApiEndpoints} from "@/core/config/api-endpoints";
import {map, Observable} from "rxjs";
import * as events from "node:events";

interface EventApi {
    id?: number;
    roomId?: number;
    startTime?: string;
    endTime?: string;
    reservedByUserId?: number;
    purpose?: string;
    status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = ApiEndpoints.events;

  getAll(): Observable<Event[]> {
      return this.http.get<EventApi[]>(this.endpoint).pipe(map((events) => events.map((event) => this.fromApi(event))));
  }


  private toApi(payload: Event): EventApi {
      return {
          id: payload.id,
          roomId: payload.roomId,
          startTime: payload.startTime,

      }
  }
}
