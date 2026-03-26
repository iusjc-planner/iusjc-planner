import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CourseService } from '../../core/services/course.service';
import { Course } from '../../core/models/course.model';

type CoursItem = Course & {
    enseignant: string;
    type: string;
    groupe: string;
};

@Component({
    selector: 'app-cours',
    standalone: true,
    imports: [CommonModule, ButtonModule, DialogModule, TableModule, InputTextModule, FormsModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Gestion des cours</h5>
                <button pButton type="button" label="Créer cours" icon="pi pi-plus" class="p-button-rounded p-button-text" (click)="openCreateDialog()"></button>
            </div>

            <div class="mb-4">
                <span class="p-input-icon-left w-full">
                    <i class="pi pi-search"></i>
                    <input pInputText type="text" [(ngModel)]="searchValue" placeholder="Rechercher..." class="w-full" />
                </span>
            </div>

            <p-table [value]="cours" [rows]="10" [paginator]="true" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="code">Code <p-sortIcon field="code"></p-sortIcon></th>
                        <th pSortableColumn="nom">Nom <p-sortIcon field="nom"></p-sortIcon></th>
                        <th pSortableColumn="enseignant">Enseignant <p-sortIcon field="enseignant"></p-sortIcon></th>
                        <th pSortableColumn="type">Type <p-sortIcon field="type"></p-sortIcon></th>
                        <th pSortableColumn="groupe">Groupe <p-sortIcon field="groupe"></p-sortIcon></th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-course>
                    <tr>
                        <td>{{ course.code }}</td>
                        <td>{{ course.nom }}</td>
                        <td>{{ course.enseignant }}</td>
                        <td>
                            <span [ngClass]="getCourseTypeClass(course.type)">
                                {{ course.type }}
                            </span>
                        </td>
                        <td>{{ course.groupe }}</td>
                        <td>
                            <button pButton type="button" icon="pi pi-pencil" class="p-button-rounded p-button-text mr-2"></button>
                            <button pButton type="button" icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" (click)="deleteCours(course)"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="displayCreateDialog" header="Créer un cours" [modal]="true" [style]="{ width: '46vw' }" [breakpoints]="{ '960px': '75vw', '640px': '90vw' }">
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Titre</label>
                    <input pInputText type="text" [(ngModel)]="createForm.nom" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Matiere ID</label>
                    <input pInputText type="number" [(ngModel)]="createForm.matiereId" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Date</label>
                    <input pInputText type="date" [(ngModel)]="createForm.date" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Heure debut</label>
                    <input pInputText type="time" [(ngModel)]="createForm.startTime" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Heure fin</label>
                    <input pInputText type="time" [(ngModel)]="createForm.endTime" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Type</label>
                    <select [(ngModel)]="createForm.type" class="w-full px-3 py-2 border rounded">
                        <option value="CM">CM</option>
                        <option value="TD">TD</option>
                        <option value="TP">TP</option>
                        <option value="EXAM">EXAM</option>
                    </select>
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Salle ID</label>
                    <input pInputText type="number" [(ngModel)]="createForm.roomId" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Groupe ID</label>
                    <input pInputText type="number" [(ngModel)]="createForm.groupId" class="w-full" />
                </div>
                <div class="col-span-12">
                    <label class="block mb-2 font-medium">Description</label>
                    <input pInputText type="text" [(ngModel)]="createForm.description" class="w-full" />
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button pButton type="button" label="Annuler" class="p-button-text" (click)="displayCreateDialog = false"></button>
                <button pButton type="button" label="Creer" class="p-button-rounded p-button-text" (click)="createCours()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class CoursPage {
    searchValue = '';
    displayCreateDialog = false;
    createForm: {
        nom: string;
        matiereId?: number;
        date: string;
        startTime: string;
        endTime: string;
        type: 'CM' | 'TD' | 'TP' | 'EXAM';
        roomId?: number;
        groupId?: number;
        description: string;
    } = this.getEmptyCreateForm();

    private allCours: CoursItem[] = [];

    constructor(
        private messageService: MessageService,
        private courseService: CourseService
    ) {}

    ngOnInit() {
        this.loadCourses();
    }

    openCreateDialog() {
        this.createForm = this.getEmptyCreateForm();
        this.displayCreateDialog = true;
    }

    createCours() {
        if (!this.createForm.nom.trim() || !this.createForm.matiereId || !this.createForm.date || !this.createForm.startTime || !this.createForm.endTime) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Titre, matiere, date et heures sont obligatoires' });
            return;
        }

        const payload: Course = {
            nom: this.createForm.nom.trim(),
            title: this.createForm.nom.trim(),
            matiereId: this.createForm.matiereId,
            date: this.createForm.date,
            startTime: this.createForm.startTime,
            endTime: this.createForm.endTime,
            type: this.createForm.type,
            roomId: this.createForm.roomId,
            groupId: this.createForm.groupId,
            description: this.createForm.description.trim() || undefined
        };

        this.courseService.create(payload).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Cours cree avec succes' });
                this.displayCreateDialog = false;
                this.loadCourses();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Echec de creation du cours' });
            }
        });
    }

    get cours(): CoursItem[] {
        const term = this.searchValue.trim().toLowerCase();
        if (!term) {
            return this.allCours;
        }

        return this.allCours.filter((course) => {
            return (
                (course.code || '').toLowerCase().includes(term) ||
                course.nom.toLowerCase().includes(term) ||
                course.enseignant.toLowerCase().includes(term) ||
                course.groupe.toLowerCase().includes(term)
            );
        });
    }

    private loadCourses() {
        this.courseService.getAll().subscribe({
            next: (courses) => {
                this.allCours = courses.map((course) => this.fromApiCourse(course));
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement des cours impossible' });
            }
        });
    }

    deleteCours(course: CoursItem) {
        if (!course.id) {
            return;
        }

        this.courseService.delete(course.id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Cours supprime avec succes' });
                this.loadCourses();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Echec de suppression du cours' });
            }
        });
    }

    getCourseTypeClass(type: string): string {
        const classes: { [key: string]: string } = {
            'CM': 'bg-blue-100 text-blue-800 px-2 py-1 rounded',
            'TD': 'bg-green-100 text-green-800 px-2 py-1 rounded',
            'TP': 'bg-orange-100 text-orange-800 px-2 py-1 rounded'
        };
        return classes[type] || '';
    }

    private fromApiCourse(course: Course): CoursItem {
        return {
            id: course.id,
            code: course.code,
            nom: course.nom || course.title || `Cours #${course.id ?? '-'}`,
            description: course.description,
            volumeHoraire: course.volumeHoraire,
            credits: course.credits,
            enseignant: 'A affecter',
            type: course.type || 'CM',
            groupe: course.groupId ? `Groupe #${course.groupId}` : 'Non assigne'
        };
    }

    private getEmptyCreateForm() {
        return {
            nom: '',
            matiereId: undefined,
            date: '',
            startTime: '',
            endTime: '',
            type: 'CM' as const,
            roomId: undefined,
            groupId: undefined,
            description: ''
        };
    }
}
