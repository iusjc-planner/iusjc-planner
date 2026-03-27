import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CourseService } from '../../core/services/course.service';
import { MatiereService } from '../../core/services/matiere.service';
import { GroupService } from '../../core/services/group.service';
import { TeacherService } from '../../core/services/teacher.service';
import { AuthService } from '../../core/services/auth.service';
import { Matiere } from '../../core/models/matiere.model';
import { Group } from '../../core/models/group.model';
import { Course } from '../../core/models/course.model';

type CellState = 'empty' | 'selected' | 'sent';

interface GridCell {
    day: number;
    hour: number;
    state: CellState;
    date: string;
}

type SelectOption = { label: string; value: number };

@Component({
    selector: 'app-disponibilites',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, SelectModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Mes Disponibilités</h5>
                <button pButton type="button" label="Envoyer une nouvelle disponibilité" icon="pi pi-refresh"
                    class="p-button-text" (click)="resetGrid()"></button>
            </div>

            <div class="grid grid-cols-12 gap-4 mb-6">
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Matière</label>
                    <p-select
                        [(ngModel)]="selectedMatiereId"
                        [options]="matiereOptions"
                        optionLabel="label"
                        optionValue="value"
                        [filter]="true"
                        filterBy="label"
                        placeholder="Choisir une matière"
                        appendTo="body"
                        class="w-full"
                    />
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Groupe d'étudiants</label>
                    <p-select
                        [(ngModel)]="selectedGroupId"
                        [options]="groupOptions"
                        optionLabel="label"
                        optionValue="value"
                        [filter]="true"
                        filterBy="label"
                        placeholder="Choisir un groupe"
                        appendTo="body"
                        class="w-full"
                    />
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Type de cours</label>
                    <input type="text" value="CM (Cours Magistral)" disabled
                        class="w-full px-3 py-2 border rounded bg-surface-100 dark:bg-surface-800" />
                </div>
            </div>

            <div class="mb-4 flex flex-wrap items-center gap-4">
                <button pButton type="button" icon="pi pi-chevron-left" class="p-button-text p-button-sm"
                    (click)="previousWeek()"></button>
                <span class="font-medium text-lg">Semaine du {{ weekStartLabel }} au {{ weekEndLabel }}</span>
                <button pButton type="button" icon="pi pi-chevron-right" class="p-button-text p-button-sm"
                    (click)="nextWeek()"></button>
            </div>

            <div class="mb-4 flex gap-4 text-sm">
                <span class="flex items-center gap-1"><span class="inline-block w-4 h-4 rounded" style="background:#fbbf24"></span> Sélectionné</span>
                <span class="flex items-center gap-1"><span class="inline-block w-4 h-4 rounded" style="background:#22c55e"></span> Envoyé</span>
                <span class="flex items-center gap-1"><span class="inline-block w-4 h-4 rounded" style="background:#e5e7eb"></span> Disponible</span>
                <span class="flex items-center gap-1"><span class="inline-block w-4 h-4 rounded" style="background:#d1d5db"></span> Pause (12h-13h)</span>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full border-collapse" style="min-width: 700px">
                    <thead>
                        <tr>
                            <th class="border p-2 bg-surface-100 dark:bg-surface-800 text-left" style="width: 80px">Heure</th>
                            <th *ngFor="let day of dayHeaders" class="border p-2 bg-surface-100 dark:bg-surface-800 text-center">
                                {{ day.label }}<br><span class="text-xs text-muted-color">{{ day.date }}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let hour of hours">
                            <td class="border p-2 font-medium bg-surface-50 dark:bg-surface-900">{{ formatHour(hour) }}</td>
                            <td *ngFor="let day of dayIndexes"
                                class="border p-2 text-center cursor-pointer transition-colors"
                                [ngStyle]="getCellStyle(day, hour)"
                                (click)="toggleCell(day, hour)">
                                <span *ngIf="getCellState(day, hour) === 'selected'" class="pi pi-check text-white"></span>
                                <span *ngIf="getCellState(day, hour) === 'sent'" class="pi pi-check-circle text-white"></span>
                            </td>
                        </tr>
                        <tr>
                            <td class="border p-2 font-medium bg-surface-50 dark:bg-surface-900 text-muted-color">12h - 13h</td>
                            <td *ngFor="let day of dayIndexes" class="border p-2 text-center" style="background: #d1d5db">
                                <span class="text-xs text-muted-color">Pause</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="flex justify-end mt-6 gap-3">
                <button pButton type="button" label="Envoyer" icon="pi pi-send"
                    class="p-button-rounded"
                    [disabled]="!canSubmit()"
                    (click)="submitAvailabilities()">
                </button>
            </div>

            <div *ngIf="submitting" class="mt-4 text-sm text-muted-color">Envoi en cours...</div>
        </div>
    `
})
export class DisponibilitesPage {
    selectedMatiereId?: number;
    selectedGroupId?: number;
    submitting = false;

    matiereOptions: SelectOption[] = [];
    groupOptions: SelectOption[] = [];

    private matieresById = new Map<number, Matiere>();
    private teacherId?: number;
    private weekOffset = 0;

    grid: GridCell[][] = [];

    readonly dayLabels = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    readonly dayIndexes = [0, 1, 2, 3, 4, 5];
    readonly hours = [8, 9, 10, 11, 13, 14, 15, 16];

    constructor(
        private readonly messageService: MessageService,
        private readonly courseService: CourseService,
        private readonly matiereService: MatiereService,
        private readonly groupService: GroupService,
        private readonly teacherService: TeacherService,
        private readonly authService: AuthService
    ) {}

    ngOnInit() {
        this.buildGrid();
        this.loadReferenceData();
        this.resolveTeacherId();
    }

    get dayHeaders(): Array<{ label: string; date: string }> {
        return this.dayLabels.map((label, index) => ({
            label,
            date: this.dateForDay(index)
        }));
    }

    get weekStartLabel(): string {
        return this.dateForDay(0);
    }

    get weekEndLabel(): string {
        return this.dateForDay(5);
    }

    previousWeek() {
        this.weekOffset--;
        this.buildGrid();
    }

    nextWeek() {
        this.weekOffset++;
        this.buildGrid();
    }

    formatHour(hour: number): string {
        return `${String(hour).padStart(2, '0')}h - ${String(hour + 1).padStart(2, '0')}h`;
    }

    getCellState(day: number, hour: number): CellState {
        return this.grid[day]?.[hour]?.state ?? 'empty';
    }

    getCellStyle(day: number, hour: number): Record<string, string> {
        const state = this.getCellState(day, hour);
        if (state === 'selected') return { background: '#fbbf24', cursor: 'pointer' };
        if (state === 'sent') return { background: '#22c55e', cursor: 'default' };
        return { background: '#f3f4f6', cursor: 'pointer' };
    }

    toggleCell(day: number, hour: number) {
        const cell = this.grid[day]?.[hour];
        if (!cell || cell.state === 'sent') return;
        cell.state = cell.state === 'selected' ? 'empty' : 'selected';
    }

    canSubmit(): boolean {
        if (!this.selectedMatiereId || !this.selectedGroupId || !this.teacherId) return false;
        return this.grid.some(dayCells =>
            Object.values(dayCells).some((cell: GridCell) => cell.state === 'selected')
        );
    }

    submitAvailabilities() {
        if (!this.canSubmit()) return;

        const matiere = this.matieresById.get(this.selectedMatiereId!);
        const matiereNom = matiere?.nom || `Matiere #${this.selectedMatiereId}`;
        const selectedCells: GridCell[] = [];

        for (const dayCells of this.grid) {
            for (const cell of Object.values(dayCells) as GridCell[]) {
                if (cell.state === 'selected') {
                    selectedCells.push(cell);
                }
            }
        }

        if (selectedCells.length === 0) return;

        this.submitting = true;
        const requests = selectedCells.map(cell => {
            const payload: Course = {
                nom: matiereNom,
                title: matiereNom,
                matiereId: this.selectedMatiereId,
                groupId: this.selectedGroupId,
                teacherId: this.teacherId,
                date: cell.date,
                startTime: `${String(cell.hour).padStart(2, '0')}:00`,
                endTime: `${String(cell.hour + 1).padStart(2, '0')}:00`,
                type: 'CM',
                status: 'SCHEDULED'
            };
            return this.courseService.create(payload).pipe(catchError(() => of(null)));
        });

        forkJoin(requests).subscribe({
            next: (results) => {
                const success = results.filter(r => r !== null).length;
                const failed = results.length - success;

                for (const cell of selectedCells) {
                    cell.state = 'sent';
                }

                this.submitting = false;
                this.messageService.add({
                    severity: failed > 0 ? 'warn' : 'success',
                    summary: 'Disponibilités envoyées',
                    detail: `${success} disponibilité(s) envoyée(s)${failed > 0 ? `, ${failed} échec(s)` : ''}`
                });
            },
            error: () => {
                this.submitting = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible d\'envoyer les disponibilités'
                });
            }
        });
    }

    resetGrid() {
        this.selectedMatiereId = undefined;
        this.selectedGroupId = undefined;
        this.buildGrid();
    }

    private buildGrid() {
        this.grid = [];
        for (let day = 0; day < 6; day++) {
            const dayCells: Record<number, GridCell> = {};
            for (const hour of this.hours) {
                dayCells[hour] = {
                    day,
                    hour,
                    state: 'empty',
                    date: this.dateForDay(day)
                };
            }
            this.grid[day] = dayCells as unknown as GridCell[];
        }
    }

    private dateForDay(dayIndex: number): string {
        const monday = this.getMondayOfCurrentWeek();
        monday.setDate(monday.getDate() + this.weekOffset * 7 + dayIndex);
        return this.formatDate(monday);
    }

    private getMondayOfCurrentWeek(): Date {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.getFullYear(), now.getMonth(), diff);
        monday.setHours(0, 0, 0, 0);
        return monday;
    }

    private formatDate(d: Date): string {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private loadReferenceData() {
        forkJoin({
            matieres: this.matiereService.getAll().pipe(catchError(() => of([] as Matiere[]))),
            groups: this.groupService.getAll().pipe(catchError(() => of([] as Group[])))
        }).subscribe({
            next: ({ matieres, groups }) => {
                this.matieresById = new Map(matieres.filter(m => m.id !== undefined).map(m => [m.id as number, m]));
                this.matiereOptions = matieres
                    .filter(m => m.id !== undefined)
                    .map(m => ({ label: `${m.code} - ${m.nom}`, value: m.id as number }));
                this.groupOptions = groups
                    .filter(g => g.id !== undefined)
                    .map(g => ({ label: g.nom, value: g.id as number }));
            }
        });
    }

    private resolveTeacherId() {
        const session = this.authService.getSession();
        if (!session?.token) return;

        const payload = this.decodeJwt(session.token);
        const userId = payload?.['userId'] as number | undefined;
        if (!userId) return;

        this.teacherService.getByUserId(userId).subscribe({
            next: (teacher) => {
                this.teacherId = teacher.id;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de résoudre votre profil enseignant'
                });
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
