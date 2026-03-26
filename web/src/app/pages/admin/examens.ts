import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ScheduleService } from '../../core/services/schedule.service';
import { CourseService } from '../../core/services/course.service';
import { RoomService } from '../../core/services/room.service';
import { ScheduleEntry } from '../../core/models/schedule.model';
import { Course } from '../../core/models/course.model';
import { Room } from '../../core/models/room.model';

type ExamenItem = {
    id?: number;
    cours: string;
    date: Date;
    heure: string;
    salle: string;
    etudiants: number;
};

@Component({
    selector: 'app-examens',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, InputTextModule, FormsModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Gestion des examens</h5>
                <button pButton type="button" label="Créer session d'examen" icon="pi pi-plus" class="p-button-rounded p-button-text"></button>
            </div>

            <div class="mb-4">
                <span class="p-input-icon-left w-full">
                    <i class="pi pi-search"></i>
                    <input pInputText type="text" [(ngModel)]="searchValue" placeholder="Rechercher..." class="w-full" />
                </span>
            </div>

            <p-table [value]="examens" [rows]="10" [paginator]="true" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="cours">Cours <p-sortIcon field="cours"></p-sortIcon></th>
                        <th pSortableColumn="date">Date <p-sortIcon field="date"></p-sortIcon></th>
                        <th pSortableColumn="heure">Heure <p-sortIcon field="heure"></p-sortIcon></th>
                        <th pSortableColumn="salle">Salle <p-sortIcon field="salle"></p-sortIcon></th>
                        <th pSortableColumn="etudiants">Étudiants <p-sortIcon field="etudiants"></p-sortIcon></th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-exam>
                    <tr>
                        <td>{{ exam.cours }}</td>
                        <td>{{ exam.date | date: 'dd/MM/yyyy' }}</td>
                        <td>{{ exam.heure }}</td>
                        <td>{{ exam.salle }}</td>
                        <td>{{ exam.etudiants }}</td>
                        <td>
                            <button pButton type="button" icon="pi pi-pencil" class="p-button-rounded p-button-text mr-2"></button>
                            <button pButton type="button" icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" (click)="deleteExamen(exam)"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class ExamensPage {
    searchValue = '';
    private allExamens: ExamenItem[] = [];
    private courses: Course[] = [];
    private rooms: Room[] = [];

    constructor(
        private messageService: MessageService,
        private scheduleService: ScheduleService,
        private courseService: CourseService,
        private roomService: RoomService
    ) {}

    ngOnInit() {
        this.loadDependencies();
    }

    get examens(): ExamenItem[] {
        const term = this.searchValue.trim().toLowerCase();
        if (!term) {
            return this.allExamens;
        }

        return this.allExamens.filter((exam) => {
            return exam.cours.toLowerCase().includes(term) || exam.salle.toLowerCase().includes(term);
        });
    }

    private loadDependencies() {
        this.courseService.getAll().subscribe({
            next: (courses) => {
                this.courses = courses;
                this.loadRoomsAndSchedule();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement des cours impossible' });
            }
        });
    }

    private loadRoomsAndSchedule() {
        this.roomService.getAll().subscribe({
            next: (rooms) => {
                this.rooms = rooms;
                this.loadExamens();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement des salles impossible' });
            }
        });
    }

    private loadExamens() {
        this.scheduleService.getAll().subscribe({
            next: (entries) => {
                this.allExamens = entries.map((entry) => this.fromScheduleEntry(entry));
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement des examens impossible' });
            }
        });
    }

    deleteExamen(exam: ExamenItem) {
        if (!exam.id) {
            return;
        }

        this.scheduleService.delete(exam.id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Examen supprime avec succes' });
                this.loadExamens();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Echec de suppression de l examen' });
            }
        });
    }

    private fromScheduleEntry(entry: ScheduleEntry): ExamenItem {
        const course = this.courses.find((item) => item.id === entry.courseId);
        const room = this.rooms.find((item) => item.id === entry.roomId);

        return {
            id: entry.id,
            cours: course?.nom || `Cours #${entry.courseId || '-'}`,
            date: this.toDate(entry.day),
            heure: entry.startTime,
            salle: room?.nom || `Salle #${entry.roomId || '-'}`,
            etudiants: 0
        };
    }

    private toDate(day: string): Date {
        const now = new Date();
        const map: Record<string, number> = {
            MONDAY: 1,
            TUESDAY: 2,
            WEDNESDAY: 3,
            THURSDAY: 4,
            FRIDAY: 5,
            SATURDAY: 6,
            SUNDAY: 0
        };

        const targetDay = map[day.toUpperCase()];
        if (targetDay === undefined) {
            return now;
        }

        const result = new Date(now);
        const delta = targetDay - now.getDay();
        result.setDate(now.getDate() + delta);
        return result;
    }
}
