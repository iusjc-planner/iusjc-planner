import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Matiere {
  id?: number;
  code: string;
  nom: string;
  description?: string;
  schoolId: number;
  filiereId: number;
  teacherId?: number;
  credits: number;
  hoursTotal: number;
  status: 'ACTIVE' | 'INACTIVE';
  supports?: string[];
}

export interface Course {
  id?: number;
  matiereId: number;
  type: 'CM' | 'TD' | 'TP' | 'EXAM';
  title?: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  roomId?: number;
  groupId?: number;
  teacherId?: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
  sequenceNumber?: number;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MatiereService {
  private apiUrl = '/api/matieres';

  constructor(private http: HttpClient) { }

  getAll(code?: string, nom?: string, status?: string): Observable<Matiere[]> {
    let url = this.apiUrl;
    const params = new URLSearchParams();
    if (code) params.append('code', code);
    if (nom) params.append('nom', nom);
    if (status) params.append('status', status);
    if (params.toString()) url += '?' + params.toString();
    return this.http.get<Matiere[]>(url);
  }

  getById(id: number): Observable<Matiere> {
    return this.http.get<Matiere>(`${this.apiUrl}/${id}`);
  }

  create(matiere: Matiere): Observable<Matiere> {
    return this.http.post<Matiere>(this.apiUrl, matiere);
  }

  update(id: number, matiere: Matiere): Observable<Matiere> {
    return this.http.put<Matiere>(`${this.apiUrl}/${id}`, matiere);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
