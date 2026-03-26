import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiEndpoints } from '../config/api-endpoints';
import { Course } from '../models/course.model';

interface CourseApi {
    id?: number;
    matiereId: number;
    type?: 'CM' | 'TD' | 'TP' | 'EXAM';
    title?: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    roomId?: number;
    groupId?: number;
    teacherId?: number;
    status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
}

@Injectable({ providedIn: 'root' })
export class CourseService {
    private readonly http = inject(HttpClient);
    private readonly endpoint = ApiEndpoints.courses;

    getAll(): Observable<Course[]> {
        return this.http.get<CourseApi[]>(this.endpoint).pipe(map((courses) => courses.map((course) => this.fromApi(course))));
    }

    getById(id: number): Observable<Course> {
        return this.http.get<CourseApi>(`${this.endpoint}/${id}`).pipe(map((course) => this.fromApi(course)));
    }

    create(payload: Course): Observable<Course> {
        return this.http.post<CourseApi>(this.endpoint, this.toApi(payload)).pipe(map((course) => this.fromApi(course)));
    }

    update(id: number, payload: Course): Observable<Course> {
        return this.http.put<CourseApi>(`${this.endpoint}/${id}`, this.toApi(payload)).pipe(map((course) => this.fromApi(course)));
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.endpoint}/${id}`);
    }

    private toApi(payload: Course): CourseApi {
        return {
            id: payload.id,
            matiereId: payload.matiereId || 0,
            type: payload.type || 'CM',
            title: payload.title || payload.nom,
            description: payload.description,
            date: payload.date || '',
            startTime: payload.startTime || '',
            endTime: payload.endTime || '',
            roomId: payload.roomId,
            groupId: payload.groupId,
            teacherId: payload.teacherId,
            status: payload.status || 'SCHEDULED'
        };
    }

    private fromApi(payload: CourseApi): Course {
        return {
            id: payload.id,
            nom: payload.title || `Matiere #${payload.matiereId}`,
            title: payload.title,
            description: payload.description,
            matiereId: payload.matiereId,
            date: payload.date,
            startTime: payload.startTime,
            endTime: payload.endTime,
            type: payload.type,
            roomId: payload.roomId,
            groupId: payload.groupId,
            teacherId: payload.teacherId,
            status: payload.status
        };
    }
}
