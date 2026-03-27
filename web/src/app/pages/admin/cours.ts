import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { forkJoin } from 'rxjs';
import { CourseService } from '../../core/services/course.service';
import { Course } from '../../core/models/course.model';
import { Matiere } from '../../core/models/matiere.model';
import { Room } from '../../core/models/room.model';
import { Group } from '../../core/models/group.model';
import { Teacher } from '../../core/models/teacher.model';
import { User } from '../../core/models/user.model';
import { MatiereService } from '../../core/services/matiere.service';
import { RoomService } from '../../core/services/room.service';
import { GroupService } from '../../core/services/group.service';
import { TeacherService } from '../../core/services/teacher.service';
import { UserService } from '../../core/services/user.service';

type CoursItem = Course & {
    matiereLabel: string;
    enseignant: string;
    groupe: string;
    salle: string;
    horaire: string;
    statut: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
};

@Component({
    selector: 'app-cours',
    standalone: true,
    imports: [CommonModule, ButtonModule, DialogModule, TableModule, InputTextModule, FormsModule, ToastModule, SelectModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Gestion des cours</h5>
                <button pButton type="button" label="Creer cours" icon="pi pi-plus" class="p-button-rounded p-button-text" (click)="openCreateDialog()"></button>
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
                        <th pSortableColumn="nom">Titre <p-sortIcon field="nom"></p-sortIcon></th>
                        <th pSortableColumn="matiereLabel">Matiere <p-sortIcon field="matiereLabel"></p-sortIcon></th>
                        <th pSortableColumn="date">Date <p-sortIcon field="date"></p-sortIcon></th>
                        <th>Horaire</th>
                        <th pSortableColumn="type">Type <p-sortIcon field="type"></p-sortIcon></th>
                        <th pSortableColumn="statut">Statut <p-sortIcon field="statut"></p-sortIcon></th>
                        <th>Salle</th>
                        <th>Groupe</th>
                        <th>Enseignant</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-course>
                    <tr>
                        <td>{{ course.nom }}</td>
                        <td>{{ course.matiereLabel }}</td>
                        <td>{{ course.date || '-' }}</td>
                        <td>{{ course.horaire }}</td>
                        <td>
                            <span [ngClass]="getCourseTypeClass(course.type)">
                                {{ course.type }}
                            </span>
                        </td>
                        <td>
                            <span [ngClass]="getStatusClass(course.statut)">
                                {{ course.statut }}
                            </span>
                        </td>
                        <td>{{ course.salle }}</td>
                        <td>{{ course.groupe }}</td>
                        <td>{{ course.enseignant }}</td>
                        <td>
                            <button pButton type="button" icon="pi pi-pencil" class="p-button-rounded p-button-text mr-2" (click)="openEditDialog(course)"></button>
                            <button pButton type="button" icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" (click)="openDeleteDialog(course)"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog
            [(visible)]="displayDialog"
            [header]="isEditMode ? 'Modifier un cours' : 'Creer un cours'"
            [modal]="true"
            [style]="{ width: '66vw', maxWidth: '1200px' }"
            [contentStyle]="{ maxHeight: '78vh', overflow: 'auto' }"
            [breakpoints]="{ '1400px': '78vw', '1100px': '88vw', '640px': '96vw' }"
        >
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Matiere</label>
                    <p-select
                        [(ngModel)]="form.matiereId"
                        [options]="matiereOptions"
                        optionLabel="label"
                        optionValue="value"
                        [filter]="true"
                        filterBy="label"
                        placeholder="Choisir une matiere"
                        appendTo="body"
                        class="w-full"
                    />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Titre (auto)</label>
                    <input pInputText type="text" [value]="resolvedTitle" class="w-full" [disabled]="true" />
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Date</label>
                    <input pInputText type="date" [(ngModel)]="form.date" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Heure debut</label>
                    <input pInputText type="time" [(ngModel)]="form.startTime" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Heure fin</label>
                    <input pInputText type="time" [(ngModel)]="form.endTime" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Type</label>
                    <select [(ngModel)]="form.type" class="w-full px-3 py-2 border rounded">
                        <option value="CM">CM</option>
                        <option value="TD">TD</option>
                        <option value="TP">TP</option>
                        <option value="EXAM">EXAM</option>
                    </select>
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Statut</label>
                    <select [(ngModel)]="form.status" class="w-full px-3 py-2 border rounded">
                        <option value="SCHEDULED">SCHEDULED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="POSTPONED">POSTPONED</option>
                    </select>
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Salle</label>
                    <p-select
                        [(ngModel)]="form.roomId"
                        [options]="roomOptions"
                        optionLabel="label"
                        optionValue="value"
                        [filter]="true"
                        filterBy="label"
                        [showClear]="true"
                        placeholder="Choisir une salle"
                        appendTo="body"
                        class="w-full"
                    />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Groupe</label>
                    <p-select
                        [(ngModel)]="form.groupId"
                        [options]="groupOptions"
                        optionLabel="label"
                        optionValue="value"
                        [filter]="true"
                        filterBy="label"
                        [showClear]="true"
                        placeholder="Choisir un groupe"
                        appendTo="body"
                        class="w-full"
                    />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Enseignant</label>
                    <p-select
                        [(ngModel)]="form.teacherId"
                        [options]="teacherOptions"
                        optionLabel="label"
                        optionValue="value"
                        [filter]="true"
                        filterBy="label"
                        [showClear]="true"
                        placeholder="Choisir un enseignant"
                        appendTo="body"
                        class="w-full"
                    />
                </div>
                <div class="col-span-12">
                    <label class="block mb-2 font-medium">Description</label>
                    <input pInputText type="text" [(ngModel)]="form.description" class="w-full" />
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button pButton type="button" label="Annuler" class="p-button-text" (click)="displayDialog = false"></button>
                <button pButton type="button" [label]="isEditMode ? 'Mettre a jour' : 'Creer'" class="p-button-rounded p-button-text" (click)="saveCours()"></button>
            </ng-template>
        </p-dialog>

        <p-dialog [(visible)]="displayDeleteDialog" header="Confirmer la suppression" [modal]="true" [style]="{ width: '35vw' }" [breakpoints]="{ '960px': '75vw', '640px': '90vw' }">
            <p>Etes-vous sur de vouloir supprimer le cours <strong>{{ selectedCours?.nom }}</strong> ?</p>
            <ng-template pTemplate="footer">
                <button pButton type="button" label="Annuler" class="p-button-text" (click)="displayDeleteDialog = false"></button>
                <button pButton type="button" label="Supprimer" class="p-button-danger" (click)="deleteCours()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class CoursPage {
    searchValue = '';
    displayDialog = false;
    displayDeleteDialog = false;
    isEditMode = false;
    selectedCours: CoursItem | null = null;
    editingId?: number;
    form: {
        matiereId?: number;
        date: string;
        startTime: string;
        endTime: string;
        type: 'CM' | 'TD' | 'TP' | 'EXAM';
        status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
        roomId?: number;
        groupId?: number;
        teacherId?: number;
        description: string;
    } = this.getEmptyForm();

    matiereOptions: Array<{ label: string; value: number }> = [];
    roomOptions: Array<{ label: string; value: number }> = [];
    groupOptions: Array<{ label: string; value: number }> = [];
    teacherOptions: Array<{ label: string; value: number }> = [];

    private matieresById = new Map<number, Matiere>();
    private roomsById = new Map<number, Room>();
    private groupsById = new Map<number, Group>();
    private teachersById = new Map<number, Teacher>();
    private usersById = new Map<number, User>();
    private allCours: CoursItem[] = [];

    constructor(
        private readonly messageService: MessageService,
        private readonly courseService: CourseService,
        private readonly matiereService: MatiereService,
        private readonly roomService: RoomService,
        private readonly groupService: GroupService,
        private readonly teacherService: TeacherService,
        private readonly userService: UserService
    ) {}

    ngOnInit() {
        this.loadMatiereOptions();
        this.loadRoomOptions();
        this.loadGroupOptions();
        this.loadTeacherOptions();
        this.loadCourses();
    }

    openCreateDialog() {
        this.isEditMode = false;
        this.editingId = undefined;
        this.selectedCours = null;
        this.form = this.getEmptyForm();
        this.displayDialog = true;
    }

    openEditDialog(course: CoursItem) {
        this.isEditMode = true;
        this.editingId = course.id;
        this.selectedCours = { ...course };
        this.form = {
            matiereId: course.matiereId,
            date: course.date || '',
            startTime: course.startTime || '',
            endTime: course.endTime || '',
            type: course.type || 'CM',
            status: course.status || 'SCHEDULED',
            roomId: course.roomId,
            groupId: course.groupId,
            teacherId: course.teacherId,
            description: course.description || ''
        };
        this.displayDialog = true;
    }

    openDeleteDialog(course: CoursItem) {
        this.selectedCours = { ...course };
        this.displayDeleteDialog = true;
    }

    get resolvedTitle(): string {
        if (!this.form.matiereId) return '';
        const matiere = this.matieresById.get(this.form.matiereId);
        return matiere ? matiere.nom : '';
    }

    saveCours() {
        const validationMessage = this.getValidationMessage();
        if (validationMessage) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: validationMessage });
            return;
        }

        const matiereNom = this.resolvedTitle || `Matiere #${this.form.matiereId}`;
        const payload: Course = {
            nom: matiereNom,
            title: matiereNom,
            matiereId: this.form.matiereId,
            date: this.form.date,
            startTime: this.form.startTime,
            endTime: this.form.endTime,
            type: this.form.type,
            roomId: this.form.roomId,
            groupId: this.form.groupId,
            teacherId: this.form.teacherId,
            status: this.form.status,
            description: this.form.description.trim() || undefined
        };

        if (this.isEditMode && this.editingId) {
            this.courseService.update(this.editingId, payload).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Cours mis a jour avec succes' });
                    this.displayDialog = false;
                    this.loadCourses();
                },
                error: (error: unknown) => {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: this.getApiErrorMessage(error, 'Echec de mise a jour du cours') });
                }
            });
            return;
        }

        this.courseService.create(payload).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Cours cree avec succes' });
                this.displayDialog = false;
                this.loadCourses();
            },
            error: (error: unknown) => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: this.getApiErrorMessage(error, 'Echec de creation du cours') });
            }
        });
    }

    deleteCours() {
        if (!this.selectedCours?.id) {
            return;
        }

        this.courseService.delete(this.selectedCours.id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Cours supprime avec succes' });
                this.displayDeleteDialog = false;
                this.loadCourses();
            },
            error: (error: unknown) => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: this.getApiErrorMessage(error, 'Echec de suppression du cours') });
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
                course.nom.toLowerCase().includes(term) ||
                course.matiereLabel.toLowerCase().includes(term) ||
                (course.date || '').toLowerCase().includes(term) ||
                course.statut.toLowerCase().includes(term) ||
                (course.type || '').toLowerCase().includes(term) ||
                course.enseignant.toLowerCase().includes(term) ||
                course.groupe.toLowerCase().includes(term) ||
                course.salle.toLowerCase().includes(term)
            );
        });
    }

    getCourseTypeClass(type: string | undefined): string {
        const classes: { [key: string]: string } = {
            CM: 'bg-blue-100 text-blue-800 px-2 py-1 rounded',
            TD: 'bg-green-100 text-green-800 px-2 py-1 rounded',
            TP: 'bg-orange-100 text-orange-800 px-2 py-1 rounded',
            EXAM: 'bg-purple-100 text-purple-800 px-2 py-1 rounded'
        };
        return classes[type || ''] || 'bg-surface-100 text-surface-700 px-2 py-1 rounded';
    }

    getStatusClass(status: CoursItem['statut']): string {
        const classes: Record<CoursItem['statut'], string> = {
            SCHEDULED: 'bg-sky-100 text-sky-800 px-2 py-1 rounded',
            COMPLETED: 'bg-green-100 text-green-800 px-2 py-1 rounded',
            CANCELLED: 'bg-red-100 text-red-800 px-2 py-1 rounded',
            POSTPONED: 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded'
        };
        return classes[status];
    }

    private loadMatiereOptions() {
        this.matiereService.getAll().subscribe({
            next: (matieres) => {
                this.matieresById = new Map(matieres.filter((matiere) => matiere.id !== undefined).map((matiere) => [matiere.id as number, matiere]));
                this.matiereOptions = matieres
                    .filter((matiere) => matiere.id !== undefined)
                    .map((matiere) => ({ label: `${matiere.code} - ${matiere.nom}`, value: matiere.id as number }));
                this.remapCourseLabels();
            },
            error: () => {
                this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Chargement des matieres impossible. Creation de cours limitee.' });
            }
        });
    }

    private loadRoomOptions() {
        this.roomService.getAll().subscribe({
            next: (rooms) => {
                this.roomsById = new Map(rooms.filter((room) => room.id !== undefined).map((room) => [room.id as number, room]));
                this.roomOptions = rooms
                    .filter((room) => room.id !== undefined)
                    .map((room) => ({ label: `${room.code} - ${room.nom}`, value: room.id as number }));
                this.remapCourseLabels();
            },
            error: () => {
                this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Chargement des salles impossible.' });
            }
        });
    }

    private loadGroupOptions() {
        this.groupService.getAll().subscribe({
            next: (groups) => {
                this.groupsById = new Map(groups.filter((group) => group.id !== undefined).map((group) => [group.id as number, group]));
                this.groupOptions = groups
                    .filter((group) => group.id !== undefined)
                    .map((group) => ({ label: group.nom, value: group.id as number }));
                this.remapCourseLabels();
            },
            error: () => {
                this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Chargement des groupes impossible.' });
            }
        });
    }

    private loadTeacherOptions() {
        forkJoin({
            teachers: this.teacherService.getAll(),
            users: this.userService.getAll()
        }).subscribe({
            next: ({ teachers, users }) => {
                this.teachersById = new Map(teachers.filter((teacher) => teacher.id !== undefined).map((teacher) => [teacher.id as number, teacher]));
                this.usersById = new Map(users.filter((user) => user.id !== undefined).map((user) => [user.id as number, user]));
                this.teacherOptions = teachers
                    .filter((teacher) => teacher.id !== undefined)
                    .map((teacher) => ({ label: this.buildTeacherLabel(teacher), value: teacher.id as number }));
                this.remapCourseLabels();
            },
            error: () => {
                this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Chargement des enseignants impossible.' });
            }
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

    private fromApiCourse(course: Course): CoursItem {
        return {
            id: course.id,
            code: course.code,
            nom: course.nom || course.title || `Cours #${course.id ?? '-'}`,
            description: course.description,
            volumeHoraire: course.volumeHoraire,
            credits: course.credits,
            matiereId: course.matiereId,
            matiereLabel: this.resolveMatiereLabel(course.matiereId),
            date: course.date,
            startTime: course.startTime,
            endTime: course.endTime,
            type: course.type || 'CM',
            status: course.status || 'SCHEDULED',
            statut: course.status || 'SCHEDULED',
            roomId: course.roomId,
            groupId: course.groupId,
            teacherId: course.teacherId,
            salle: this.resolveRoomLabel(course.roomId),
            enseignant: this.resolveTeacherLabel(course.teacherId),
            groupe: this.resolveGroupLabel(course.groupId),
            horaire: this.formatHoraire(course.startTime, course.endTime)
        };
    }

    private remapCourseLabels() {
        this.allCours = this.allCours.map((course) => ({
            ...course,
            matiereLabel: this.resolveMatiereLabel(course.matiereId),
            salle: this.resolveRoomLabel(course.roomId),
            groupe: this.resolveGroupLabel(course.groupId),
            enseignant: this.resolveTeacherLabel(course.teacherId)
        }));
    }

    private resolveMatiereLabel(matiereId?: number): string {
        if (!matiereId) {
            return 'Matiere non definie';
        }

        const matiere = this.matieresById.get(matiereId);
        if (!matiere) {
            return `Matiere #${matiereId}`;
        }

        return `${matiere.code} - ${matiere.nom}`;
    }

    private resolveRoomLabel(roomId?: number): string {
        if (!roomId) {
            return '-';
        }

        const room = this.roomsById.get(roomId);
        return room ? `${room.code} - ${room.nom}` : `Salle #${roomId}`;
    }

    private resolveGroupLabel(groupId?: number): string {
        if (!groupId) {
            return 'Non assigne';
        }

        const group = this.groupsById.get(groupId);
        return group ? group.nom : `Groupe #${groupId}`;
    }

    private resolveTeacherLabel(teacherId?: number): string {
        if (!teacherId) {
            return 'A affecter';
        }

        const teacher = this.teachersById.get(teacherId);
        if (!teacher) {
            return `Enseignant #${teacherId}`;
        }

        return this.buildTeacherLabel(teacher);
    }

    private buildTeacherLabel(teacher: Teacher): string {
        const user = teacher.userId ? this.usersById.get(teacher.userId) : undefined;
        if (user) {
            return `${user.nom} ${user.prenom}`;
        }

        return `Enseignant #${teacher.id}`;
    }

    private formatHoraire(start?: string, end?: string): string {
        if (!start || !end) {
            return '-';
        }
        return `${start} - ${end}`;
    }

    private getValidationMessage(): string | null {
        if (!this.form.matiereId || !this.form.date || !this.form.startTime || !this.form.endTime) {
            return 'Matiere, date et heures sont obligatoires';
        }

        if (this.form.startTime >= this.form.endTime) {
            return 'L heure de fin doit etre superieure a l heure de debut';
        }

        return null;
    }

    private getEmptyForm() {
        return {
            matiereId: undefined,
            date: '',
            startTime: '',
            endTime: '',
            type: 'CM' as const,
            status: 'SCHEDULED' as const,
            roomId: undefined,
            groupId: undefined,
            teacherId: undefined,
            description: ''
        };
    }

    private getApiErrorMessage(error: unknown, fallback: string): string {
        if (error instanceof HttpErrorResponse) {
            if (typeof error.error === 'string' && error.error.trim()) {
                return error.error;
            }

            const detail = (error.error as { message?: string } | null)?.message;
            if (detail && detail.trim()) {
                return detail;
            }
        }

        return fallback;
    }
}
