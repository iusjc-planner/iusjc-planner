import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CourseService } from '../../core/services/course.service';
import { MatiereService } from '../../core/services/matiere.service';
import { GroupService } from '../../core/services/group.service';
import { TeacherService } from '../../core/services/teacher.service';
import { AuthService } from '../../core/services/auth.service';
import { Course } from '../../core/models/course.model';
import { Matiere } from '../../core/models/matiere.model';
import { Group } from '../../core/models/group.model';

interface HistoryRow {
    id?: number;
    matiereLabel: string;
    groupeLabel: string;
    date: string;
    horaire: string;
    type: string;
    status: string;
}

@Component({
    selector: 'app-historique-disponibilites',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, TableModule, InputTextModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Historique de mes disponibilités</h5>
                <button pButton type="button" label="Rafraîchir" icon="pi pi-refresh"
                    class="p-button-text" (click)="loadHistory()"></button>
            </div>

            <div class="mb-4">
                <span class="p-input-icon-left w-full">
                    <i class="pi pi-search"></i>
                    <input pInputText type="text" [(ngModel)]="searchValue" placeholder="Rechercher..." class="w-full" />
                </span>
            </div>

            <p-table [value]="filteredRows" [rows]="10" [paginator]="true" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="matiereLabel">Matière <p-sortIcon field="matiereLabel"></p-sortIcon></th>
                        <th pSortableColumn="groupeLabel">Groupe <p-sortIcon field="groupeLabel"></p-sortIcon></th>
                        <th pSortableColumn="date">Date <p-sortIcon field="date"></p-sortIcon></th>
                        <th>Horaire</th>
                        <th pSortableColumn="type">Type <p-sortIcon field="type"></p-sortIcon></th>
                        <th pSortableColumn="status">Statut <p-sortIcon field="status"></p-sortIcon></th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-row>
                    <tr>
                        <td>{{ row.matiereLabel }}</td>
                        <td>{{ row.groupeLabel }}</td>
                        <td>{{ row.date }}</td>
                        <td>{{ row.horaire }}</td>
                        <td>
                            <span [ngClass]="getTypeClass(row.type)">{{ row.type }}</span>
                        </td>
                        <td>
                            <span [ngClass]="getStatusClass(row.status)">{{ row.status }}</span>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="6" class="text-center text-muted-color p-4">Aucune disponibilité soumise</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class HistoriqueDisponibilitesPage {
    searchValue = '';
    rows: HistoryRow[] = [];
    private teacherId?: number;
    private matieresById = new Map<number, Matiere>();
    private groupsById = new Map<number, Group>();
    private readonly destroyRef = inject(DestroyRef);

    constructor(
        private readonly messageService: MessageService,
        private readonly courseService: CourseService,
        private readonly matiereService: MatiereService,
        private readonly groupService: GroupService,
        private readonly teacherService: TeacherService,
        private readonly authService: AuthService
    ) {}

    ngOnInit() {
        this.resolveTeacherAndLoad();
    }

    get filteredRows(): HistoryRow[] {
        const term = this.searchValue.trim().toLowerCase();
        if (!term) return this.rows;
        return this.rows.filter(r =>
            r.matiereLabel.toLowerCase().includes(term) ||
            r.groupeLabel.toLowerCase().includes(term) ||
            r.date.toLowerCase().includes(term) ||
            r.type.toLowerCase().includes(term) ||
            r.status.toLowerCase().includes(term)
        );
    }

    loadHistory() {
        if (!this.teacherId) return;

        forkJoin({
            matieres: this.matiereService.getAll().pipe(catchError(() => of([] as Matiere[]))),
            groups: this.groupService.getAll().pipe(catchError(() => of([] as Group[]))),
            courses: this.courseService.getAll().pipe(catchError(() => of([] as Course[])))
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: ({ matieres, groups, courses }) => {
                this.matieresById = new Map(matieres.filter(m => m.id !== undefined).map(m => [m.id as number, m]));
                this.groupsById = new Map(groups.filter(g => g.id !== undefined).map(g => [g.id as number, g]));

                const teacherCourses = courses.filter(c => c.teacherId === this.teacherId);
                this.rows = teacherCourses.map(c => this.toRow(c));
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger l\'historique' });
            }
        });
    }

    getTypeClass(type: string): string {
        const classes: Record<string, string> = {
            CM: 'bg-blue-100 text-blue-800 px-2 py-1 rounded',
            TD: 'bg-green-100 text-green-800 px-2 py-1 rounded',
            TP: 'bg-orange-100 text-orange-800 px-2 py-1 rounded',
            EXAM: 'bg-purple-100 text-purple-800 px-2 py-1 rounded'
        };
        return classes[type] || 'bg-surface-100 text-surface-700 px-2 py-1 rounded';
    }

    getStatusClass(status: string): string {
        const classes: Record<string, string> = {
            SCHEDULED: 'bg-sky-100 text-sky-800 px-2 py-1 rounded',
            COMPLETED: 'bg-green-100 text-green-800 px-2 py-1 rounded',
            CANCELLED: 'bg-red-100 text-red-800 px-2 py-1 rounded',
            POSTPONED: 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded'
        };
        return classes[status] || 'bg-surface-100 text-surface-700 px-2 py-1 rounded';
    }

    private toRow(course: Course): HistoryRow {
        const matiere = course.matiereId ? this.matieresById.get(course.matiereId) : undefined;
        const group = course.groupId ? this.groupsById.get(course.groupId) : undefined;

        return {
            id: course.id,
            matiereLabel: matiere ? `${matiere.code} - ${matiere.nom}` : `Matiere #${course.matiereId || '-'}`,
            groupeLabel: group ? group.nom : (course.groupId ? `Groupe #${course.groupId}` : '-'),
            date: course.date || '-',
            horaire: course.startTime && course.endTime ? `${course.startTime} - ${course.endTime}` : '-',
            type: course.type || 'CM',
            status: course.status || 'SCHEDULED'
        };
    }

    private resolveTeacherAndLoad() {
        const session = this.authService.getSession();
        if (!session?.token) return;

        const payload = this.decodeJwt(session.token);
        const userId = payload?.['userId'] as number | undefined;
        if (!userId) return;

        this.teacherService.getByUserId(userId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (teacher) => {
                this.teacherId = teacher.id;
                this.loadHistory();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de résoudre votre profil enseignant' });
            }
        });
    }

    private decodeJwt(token: string): Record<string, unknown> | null {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        try {
            const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
            return JSON.parse(atob(padded));
        } catch {
            return null;
        }
    }
}
