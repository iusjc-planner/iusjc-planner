import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../config/api-endpoints';
import {
    Edt,
    EdtGenerationRequest,
    EdtGenerationResult,
    EdtPeriodeType,
    EdtStatus,
    EdtVueType,
    SlotSuggestion,
    ValidationReport,
    ValidationRequest,
    ValidationResult,
    WeeklyViewResult
} from '../models/edt.model';
import { ScheduleEntry } from '../models/schedule.model';

type EdtListParams = {
    semaine?: number;
    annee?: number;
    vue?: EdtVueType;
    targetId?: number;
    status?: EdtStatus;
    periode?: EdtPeriodeType;
};

type SuggestionParams = {
    teacherId: number;
    date: string;
    groupId?: number;
    matiereId?: number;
    effectif?: number;
    equipments?: string[];
};

@Injectable({ providedIn: 'root' })
export class EdtService {
    private readonly http = inject(HttpClient);
    private readonly endpoint = ApiEndpoints.edt;

    listEdt(params?: EdtListParams): Observable<Edt[]> {
        let query = new HttpParams();
        if (params?.semaine !== undefined) query = query.set('semaine', params.semaine);
        if (params?.annee !== undefined) query = query.set('annee', params.annee);
        if (params?.vue) query = query.set('vue', params.vue);
        if (params?.targetId !== undefined) query = query.set('targetId', params.targetId);
        if (params?.status) query = query.set('status', params.status);
        if (params?.periode) query = query.set('periode', params.periode);

        return this.http.get<Edt[]>(this.endpoint, { params: query });
    }

    getEdtById(id: number): Observable<Edt> {
        return this.http.get<Edt>(`${this.endpoint}/${id}`);
    }

    getByGroupe(groupeId: number, semaine: number, annee: number): Observable<Edt> {
        return this.http.get<Edt>(`${this.endpoint}/groupe/${groupeId}`, {
            params: this.weekParams(semaine, annee)
        });
    }

    getByEnseignant(teacherId: number, semaine: number, annee: number): Observable<Edt> {
        return this.http.get<Edt>(`${this.endpoint}/enseignant/${teacherId}`, {
            params: this.weekParams(semaine, annee)
        });
    }

    getBySalle(salleId: number, semaine: number, annee: number): Observable<Edt> {
        return this.http.get<Edt>(`${this.endpoint}/salle/${salleId}`, {
            params: this.weekParams(semaine, annee)
        });
    }

    createEdt(payload: Edt): Observable<Edt> {
        return this.http.post<Edt>(this.endpoint, payload);
    }

    getEntries(edtId: number): Observable<ScheduleEntry[]> {
        return this.http.get<ScheduleEntry[]>(`${this.endpoint}/${edtId}/entries`);
    }

    addEntry(edtId: number, payload: ScheduleEntry): Observable<ScheduleEntry> {
        return this.http.post<ScheduleEntry>(`${this.endpoint}/${edtId}/entries`, payload);
    }

    updateEntry(entryId: number, payload: ScheduleEntry): Observable<ScheduleEntry> {
        return this.http.put<ScheduleEntry>(`${this.endpoint}/entries/${entryId}`, payload);
    }

    deleteEntry(entryId: number): Observable<void> {
        return this.http.delete<void>(`${this.endpoint}/entries/${entryId}`);
    }

    generate(payload: EdtGenerationRequest): Observable<EdtGenerationResult> {
        return this.http.post<EdtGenerationResult>(`${this.endpoint}/generate`, payload);
    }

    suggestions(params: SuggestionParams): Observable<SlotSuggestion[]> {
        let query = new HttpParams().set('teacherId', params.teacherId).set('date', params.date);
        if (params.groupId !== undefined) query = query.set('groupId', params.groupId);
        if (params.matiereId !== undefined) query = query.set('matiereId', params.matiereId);
        if (params.effectif !== undefined) query = query.set('effectif', params.effectif);
        for (const equipment of params.equipments || []) {
            query = query.append('equipments', equipment);
        }

        return this.http.get<SlotSuggestion[]>(`${this.endpoint}/suggestions`, { params: query });
    }

    validateEntry(payload: ValidationRequest): Observable<ValidationResult> {
        return this.http.post<ValidationResult>(`${this.endpoint}/validate-entry`, payload);
    }

    validateEdt(edtId: number): Observable<ValidationReport> {
        return this.http.put<ValidationReport>(`${this.endpoint}/${edtId}/validate`, {});
    }

    publishEdt(edtId: number): Observable<Edt> {
        return this.http.put<Edt>(`${this.endpoint}/${edtId}/publish`, {});
    }

    unpublishEdt(edtId: number): Observable<Edt> {
        return this.http.put<Edt>(`${this.endpoint}/${edtId}/unpublish`, {});
    }

    validationReport(edtId: number): Observable<ValidationReport> {
        return this.http.get<ValidationReport>(`${this.endpoint}/${edtId}/validation-report`);
    }

    weeklyView(edtId: number): Observable<WeeklyViewResult> {
        return this.http.get<WeeklyViewResult>(`${this.endpoint}/${edtId}/weekly-view`);
    }

    exportById(edtId: number, format: 'pdf' | 'excel'): Observable<Blob> {
        return this.http.get(`${this.endpoint}/${edtId}/export`, {
            params: new HttpParams().set('format', format),
            responseType: 'blob'
        });
    }

    exportByView(vue: EdtVueType, targetId: number, semaine: number, annee: number, format: 'pdf' | 'excel'): Observable<Blob> {
        return this.http.get(this.exportPathForView(vue, targetId), {
            params: this.weekParams(semaine, annee).set('format', format),
            responseType: 'blob'
        });
    }

    private weekParams(semaine: number, annee: number): HttpParams {
        return new HttpParams().set('semaine', semaine).set('annee', annee);
    }

    private exportPathForView(vue: EdtVueType, targetId: number): string {
        switch (vue) {
            case 'GROUPE':
                return `${this.endpoint}/groupe/${targetId}/export`;
            case 'ENSEIGNANT':
                return `${this.endpoint}/enseignant/${targetId}/export`;
            case 'SALLE':
                return `${this.endpoint}/salle/${targetId}/export`;
            default:
                return `${this.endpoint}/groupe/${targetId}/export`;
        }
    }
}
