import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { forkJoin } from 'rxjs';
import { Matiere, MatiereStatus } from '../../core/models/matiere.model';
import { User } from '../../core/models/user.model';
import { Teacher } from '../../core/models/teacher.model';
import { School, SchoolFiliere } from '../../core/models/school.model';
import { MatiereService } from '../../core/services/matiere.service';
import { SchoolService } from '../../core/services/school.service';
import { TeacherService } from '../../core/services/teacher.service';
import { UserService } from '../../core/services/user.service';

@Component({
    selector: 'app-matieres',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, DialogModule, InputTextModule, TableModule, ToastModule, SelectModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Gestion des matieres</h5>
                <button pButton type="button" label="Ajouter matiere" icon="pi pi-plus" class="p-button-rounded p-button-text" (click)="openCreateDialog()"></button>
            </div>

            <div class="mb-4 relative">
                <i class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-color"></i>
                <input pInputText type="text" [(ngModel)]="searchValue" placeholder="   Rechercher une matiere..." class="w-full pl-10" />
            </div>

            <p-table [value]="matieres" [rows]="10" [paginator]="true" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="code">Code <p-sortIcon field="code"></p-sortIcon></th>
                        <th pSortableColumn="nom">Nom <p-sortIcon field="nom"></p-sortIcon></th>
                        <th pSortableColumn="credits">Credits <p-sortIcon field="credits"></p-sortIcon></th>
                        <th pSortableColumn="hoursTotal">Heures <p-sortIcon field="hoursTotal"></p-sortIcon></th>
                        <th>Ecole</th>
                        <th>Filiere</th>
                        <th>Enseignant</th>
                        <th pSortableColumn="status">Statut <p-sortIcon field="status"></p-sortIcon></th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-matiere>
                    <tr>
                        <td>{{ matiere.code }}</td>
                        <td>{{ matiere.nom }}</td>
                        <td>{{ matiere.credits }}</td>
                        <td>{{ matiere.hoursTotal }}</td>
                        <td>{{ resolveSchoolLabel(matiere.schoolId) }}</td>
                        <td>{{ resolveFiliereLabel(matiere.schoolId, matiere.filiereId) }}</td>
                        <td>{{ resolveTeacherLabel(matiere.teacherId) }}</td>
                        <td>
                            <span [ngClass]="getStatusClass(matiere.status || 'ACTIVE')">{{ matiere.status || 'ACTIVE' }}</span>
                        </td>
                        <td>
                            <button pButton type="button" icon="pi pi-pencil" class="p-button-rounded p-button-text mr-2" (click)="openEditDialog(matiere)"></button>
                            <button pButton type="button" icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" (click)="openDeleteDialog(matiere)"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog
            [(visible)]="displayDialog"
            [header]="isEditMode ? 'Modifier matiere' : 'Ajouter matiere'"
            [modal]="true"
            [style]="{ width: '64vw', maxWidth: '1150px' }"
            [contentStyle]="{ maxHeight: '78vh', overflow: 'auto' }"
            [breakpoints]="{ '1400px': '76vw', '1100px': '86vw', '640px': '96vw' }"
        >
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Code</label>
                    <input pInputText type="text" [(ngModel)]="form.code" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-8">
                    <label class="block mb-2 font-medium">Nom</label>
                    <input pInputText type="text" [(ngModel)]="form.nom" class="w-full" />
                </div>
                <div class="col-span-12">
                    <label class="block mb-2 font-medium">Description</label>
                    <input pInputText type="text" [(ngModel)]="form.description" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Ecole</label>
                    <p-select
                        [(ngModel)]="form.schoolId"
                        [options]="schoolSelectOptions"
                        optionLabel="label"
                        optionValue="value"
                        [filter]="true"
                        filterBy="label"
                        placeholder="Choisir une ecole"
                        appendTo="body"
                        class="w-full"
                        (ngModelChange)="onSchoolChange()"
                    />
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Filiere</label>
                    <p-select
                        [(ngModel)]="form.filiereId"
                        [options]="filiereSelectOptions"
                        optionLabel="label"
                        optionValue="value"
                        [filter]="true"
                        filterBy="label"
                        placeholder="Choisir une filiere"
                        appendTo="body"
                        class="w-full"
                    />
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Enseignant</label>
                    <p-select
                        [(ngModel)]="form.teacherId"
                        [options]="teacherSelectOptions"
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
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Statut</label>
                    <select [(ngModel)]="form.status" class="w-full px-3 py-2 border rounded">
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                    </select>
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Credits</label>
                    <input pInputText type="number" [(ngModel)]="form.credits" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Volume horaire total</label>
                    <input pInputText type="number" [(ngModel)]="form.hoursTotal" class="w-full" />
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button pButton type="button" label="Annuler" class="p-button-text" (click)="displayDialog = false"></button>
                <button pButton type="button" [label]="isEditMode ? 'Mettre a jour' : 'Enregistrer'" class="p-button-rounded p-button-text" (click)="saveMatiere()"></button>
            </ng-template>
        </p-dialog>

        <p-dialog [(visible)]="displayDeleteDialog" header="Confirmer la suppression" [modal]="true" [style]="{ width: '35vw' }" [breakpoints]="{ '960px': '75vw', '640px': '90vw' }">
            <p>Etes-vous sur de vouloir supprimer la matiere <strong>{{ selectedMatiere?.nom }}</strong> ?</p>
            <ng-template pTemplate="footer">
                <button pButton type="button" label="Annuler" class="p-button-text" (click)="displayDeleteDialog = false"></button>
                <button pButton type="button" label="Supprimer" class="p-button-danger" (click)="deleteMatiere()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class MatieresPage {
    searchValue = '';
    displayDialog = false;
    displayDeleteDialog = false;
    isEditMode = false;
    selectedMatiere: Matiere | null = null;
    editingId?: number;

    schools: School[] = [];
    teachers: Teacher[] = [];
    usersById = new Map<number, User>();
    schoolSelectOptions: Array<{ label: string; value: number }> = [];
    teacherSelectOptions: Array<{ label: string; value: number }> = [];

    form = this.getEmptyForm();
    private allMatieres: Matiere[] = [];

    constructor(
        private readonly matiereService: MatiereService,
        private readonly schoolService: SchoolService,
        private readonly teacherService: TeacherService,
        private readonly userService: UserService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadSchools();
        this.loadTeachers();
        this.loadMatieres();
    }

    get filiereSelectOptions(): Array<{ label: string; value: number }> {
        if (!this.form.schoolId) {
            return [];
        }

        const school = this.schools.find((item) => item.id === this.form.schoolId);
        return (school?.filieres || [])
            .filter((filiere) => filiere.id !== undefined)
            .map((filiere) => ({
                label: `${filiere.code} - ${filiere.nom}`,
                value: filiere.id as number
            }));
    }

    get matieres(): Matiere[] {
        const term = this.searchValue.trim().toLowerCase();
        if (!term) {
            return this.allMatieres;
        }

        return this.allMatieres.filter((matiere) => {
            return (
                matiere.code.toLowerCase().includes(term) ||
                matiere.nom.toLowerCase().includes(term) ||
                this.resolveSchoolLabel(matiere.schoolId).toLowerCase().includes(term) ||
                this.resolveFiliereLabel(matiere.schoolId, matiere.filiereId).toLowerCase().includes(term) ||
                this.resolveTeacherLabel(matiere.teacherId).toLowerCase().includes(term)
            );
        });
    }

    openCreateDialog() {
        this.isEditMode = false;
        this.editingId = undefined;
        this.selectedMatiere = null;
        this.form = this.getEmptyForm();
        this.displayDialog = true;
    }

    openEditDialog(matiere: Matiere) {
        this.isEditMode = true;
        this.editingId = matiere.id;
        this.selectedMatiere = { ...matiere };
        this.form = {
            code: matiere.code,
            nom: matiere.nom,
            description: matiere.description || '',
            schoolId: matiere.schoolId,
            filiereId: matiere.filiereId,
            teacherId: matiere.teacherId,
            credits: matiere.credits,
            hoursTotal: matiere.hoursTotal,
            status: matiere.status || 'ACTIVE'
        };
        this.displayDialog = true;
    }

    openDeleteDialog(matiere: Matiere) {
        this.selectedMatiere = { ...matiere };
        this.displayDeleteDialog = true;
    }

    onSchoolChange() {
        this.form.filiereId = undefined;
    }

    saveMatiere() {
        const validationMessage = this.getValidationMessage();
        if (validationMessage) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: validationMessage });
            return;
        }

        const payload: Matiere = {
            code: this.form.code.trim(),
            nom: this.form.nom.trim(),
            description: this.form.description.trim() || undefined,
            schoolId: Number(this.form.schoolId),
            filiereId: Number(this.form.filiereId),
            teacherId: this.form.teacherId ? Number(this.form.teacherId) : undefined,
            credits: Number(this.form.credits),
            hoursTotal: Number(this.form.hoursTotal),
            status: this.form.status
        };

        if (this.isEditMode && this.editingId) {
            this.matiereService.update(this.editingId, payload).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Matiere mise a jour avec succes' });
                    this.displayDialog = false;
                    this.loadMatieres();
                },
                error: (error: unknown) => {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: this.getApiErrorMessage(error, 'Echec de mise a jour de la matiere') });
                }
            });
            return;
        }

        this.matiereService.create(payload).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Matiere creee avec succes' });
                this.displayDialog = false;
                this.loadMatieres();
            },
            error: (error: unknown) => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: this.getApiErrorMessage(error, 'Echec de creation de la matiere') });
            }
        });
    }

    deleteMatiere() {
        if (!this.selectedMatiere?.id) {
            return;
        }

        this.matiereService.delete(this.selectedMatiere.id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Matiere supprimee avec succes' });
                this.displayDeleteDialog = false;
                this.loadMatieres();
            },
            error: (error: unknown) => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: this.getApiErrorMessage(error, 'Echec de suppression de la matiere') });
            }
        });
    }

    resolveSchoolLabel(schoolId: number): string {
        const school = this.schools.find((item) => item.id === schoolId);
        return school?.nom || `Ecole #${schoolId}`;
    }

    resolveFiliereLabel(schoolId: number, filiereId: number): string {
        const school = this.schools.find((item) => item.id === schoolId);
        const filiere = (school?.filieres || []).find((item: SchoolFiliere) => item.id === filiereId);
        if (filiere) {
            return `${filiere.code} - ${filiere.nom}`;
        }

        for (const fallbackSchool of this.schools) {
            const fallback = (fallbackSchool.filieres || []).find((item) => item.id === filiereId);
            if (fallback) {
                return `${fallback.code} - ${fallback.nom}`;
            }
        }

        return `Filiere #${filiereId}`;
    }

    resolveTeacherLabel(teacherId?: number): string {
        if (!teacherId) {
            return '-';
        }

        const teacher = this.teachers.find((item) => item.id === teacherId);
        if (!teacher) {
            return `Enseignant #${teacherId}`;
        }

        const user = teacher.userId ? this.usersById.get(teacher.userId) : undefined;
        if (user) {
            return `${user.nom} ${user.prenom}`;
        }

        return `Enseignant #${teacherId}`;
    }

    getStatusClass(status: MatiereStatus): string {
        const classes: Record<MatiereStatus, string> = {
            ACTIVE: 'bg-green-100 text-green-800 px-2 py-1 rounded',
            INACTIVE: 'bg-red-100 text-red-800 px-2 py-1 rounded'
        };
        return classes[status];
    }

    private loadMatieres() {
        this.matiereService.getAll().subscribe({
            next: (matieres) => {
                this.allMatieres = matieres;
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement des matieres impossible' });
            }
        });
    }

    private loadSchools() {
        this.schoolService.getAll().subscribe({
            next: (schools) => {
                this.schools = schools;
                this.schoolSelectOptions = schools
                    .filter((school) => school.id !== undefined)
                    .map((school) => ({ label: school.nom, value: school.id as number }));
            },
            error: () => {
                this.messageService.add({ severity: 'warn', summary: 'Avertissement', detail: 'Chargement des ecoles indisponible' });
            }
        });
    }

    private loadTeachers() {
        forkJoin({
            teachers: this.teacherService.getAll(),
            users: this.userService.getAll()
        }).subscribe({
            next: ({ teachers, users }) => {
                this.teachers = teachers;
                this.usersById = new Map(users.filter((user) => user.id !== undefined).map((user) => [user.id as number, user]));
                this.teacherSelectOptions = teachers
                    .filter((teacher) => teacher.id !== undefined)
                    .map((teacher) => ({
                        value: teacher.id as number,
                        label: this.buildTeacherLabel(teacher)
                    }));
            },
            error: () => {
                this.messageService.add({ severity: 'warn', summary: 'Avertissement', detail: 'Chargement des enseignants indisponible' });
            }
        });
    }

    private buildTeacherLabel(teacher: Teacher): string {
        const user = teacher.userId ? this.usersById.get(teacher.userId) : undefined;
        if (user) {
            return `${user.nom} ${user.prenom}`;
        }
        return `Enseignant #${teacher.id}`;
    }

    private getValidationMessage(): string | null {
        if (!this.form.code.trim() || !this.form.nom.trim()) {
            return 'Code et nom sont obligatoires';
        }
        if (!this.form.schoolId) {
            return 'Ecole obligatoire';
        }
        if (!this.form.filiereId) {
            return 'Filiere obligatoire';
        }
        if (!this.form.credits || Number(this.form.credits) < 1) {
            return 'Credits doit etre superieur a 0';
        }
        if (!this.form.hoursTotal || Number(this.form.hoursTotal) < 1) {
            return 'Volume horaire doit etre superieur a 0';
        }
        return null;
    }

    private getEmptyForm() {
        return {
            code: '',
            nom: '',
            description: '',
            schoolId: undefined as number | undefined,
            filiereId: undefined as number | undefined,
            teacherId: undefined as number | undefined,
            credits: undefined as number | undefined,
            hoursTotal: undefined as number | undefined,
            status: 'ACTIVE' as MatiereStatus
        };
    }

    private getApiErrorMessage(error: unknown, fallback: string): string {
        if (error instanceof HttpErrorResponse) {
            if (typeof error.error === 'string' && error.error.trim()) {
                return error.error;
            }

            const message = (error.error as { message?: string } | null)?.message;
            if (message && message.trim()) {
                return message;
            }
        }

        return fallback;
    }
}
