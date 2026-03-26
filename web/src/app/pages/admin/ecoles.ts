import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { School, SchoolFiliere } from '../../core/models/school.model';
import { SchoolService } from '../../core/services/school.service';

@Component({
    selector: 'app-ecoles',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, TableModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Gestion des ecoles</h5>
                <button pButton type="button" label="Ajouter ecole" icon="pi pi-plus" class="p-button-rounded p-button-text" (click)="openCreateDialog()"></button>
            </div>

            <div class="mb-4 relative">
                <i class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-color"></i>
                <input pInputText type="text" [(ngModel)]="searchValue" placeholder="   Rechercher une ecole..." class="w-full pl-10" />
            </div>

            <p-table [value]="schools" [rows]="10" [paginator]="true" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="nom">Nom <p-sortIcon field="nom"></p-sortIcon></th>
                        <th pSortableColumn="code">Code <p-sortIcon field="code"></p-sortIcon></th>
                        <th pSortableColumn="description">Description <p-sortIcon field="description"></p-sortIcon></th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-school>
                    <tr>
                        <td>{{ school.nom }}</td>
                        <td>{{ school.code || '-' }}</td>
                        <td>{{ school.description || '-' }}</td>
                        <td>
                            <button pButton type="button" icon="pi pi-pencil" class="p-button-rounded p-button-text mr-2" (click)="openEditDialog(school)"></button>
                            <button pButton type="button" icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" (click)="openDeleteDialog(school)"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="displayDialog" [header]="isEditMode ? 'Modifier ecole' : 'Ajouter ecole'" [modal]="true" [style]="{ width: '40vw' }" [breakpoints]="{ '960px': '75vw', '640px': '90vw' }">
            <form [formGroup]="schoolForm" class="grid grid-cols-12 gap-4">
                <div class="col-span-12">
                    <label class="block mb-2 font-medium">Nom</label>
                    <input pInputText type="text" formControlName="nom" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Code</label>
                    <input pInputText type="text" formControlName="code" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-8">
                    <label class="block mb-2 font-medium">Description</label>
                    <input pInputText type="text" formControlName="description" class="w-full" />
                </div>

                <div class="col-span-12 mt-2">
                    <label class="block mb-2 font-medium">Filieres</label>
                    <div class="grid grid-cols-12 gap-2 mb-3">
                        <div class="col-span-12 md:col-span-3">
                            <input pInputText type="text" [(ngModel)]="filiereDraft.code" [ngModelOptions]="{ standalone: true }" placeholder="Code" class="w-full" />
                        </div>
                        <div class="col-span-12 md:col-span-4">
                            <input pInputText type="text" [(ngModel)]="filiereDraft.nom" [ngModelOptions]="{ standalone: true }" placeholder="Nom" class="w-full" />
                        </div>
                        <div class="col-span-12 md:col-span-4">
                            <input pInputText type="text" [(ngModel)]="filiereDraft.description" [ngModelOptions]="{ standalone: true }" placeholder="Description" class="w-full" />
                        </div>
                        <div class="col-span-12 md:col-span-1">
                            <button pButton type="button" icon="pi pi-plus" class="p-button-rounded p-button-text" (click)="addFiliereDraft()"></button>
                        </div>
                    </div>

                    <div *ngIf="filieresDraft.length === 0" class="text-sm text-muted-color">Aucune filiere ajoutee.</div>
                    <div class="space-y-2" *ngIf="filieresDraft.length > 0">
                        <div *ngFor="let filiere of filieresDraft; let i = index" class="p-2 border rounded flex items-center justify-between">
                            <div>
                                <div class="font-medium">{{ filiere.code }} - {{ filiere.nom }}</div>
                                <div class="text-sm text-muted-color">{{ filiere.description || '-' }}</div>
                            </div>
                            <button pButton type="button" icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" (click)="removeFiliereDraft(i)"></button>
                        </div>
                    </div>
                </div>
            </form>
            <ng-template pTemplate="footer">
                <button pButton type="button" label="Annuler" class="p-button-text" (click)="displayDialog = false"></button>
                <button pButton type="button" [label]="isEditMode ? 'Mettre a jour' : 'Enregistrer'" class="p-button-rounded p-button-text" (click)="saveSchool()"></button>
            </ng-template>
        </p-dialog>

        <p-dialog [(visible)]="displayDeleteDialog" header="Confirmer la suppression" [modal]="true" [style]="{ width: '35vw' }" [breakpoints]="{ '960px': '75vw', '640px': '90vw' }">
            <p>Etes-vous sur de vouloir supprimer l'ecole <strong>{{ selectedSchool?.nom }}</strong> ?</p>
            <ng-template pTemplate="footer">
                <button pButton type="button" label="Annuler" class="p-button-text" (click)="displayDeleteDialog = false"></button>
                <button pButton type="button" label="Supprimer" class="p-button-danger" (click)="deleteSchool()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class EcolesPage {
    searchValue = '';
    displayDialog = false;
    displayDeleteDialog = false;
    isEditMode = false;
    selectedSchool: School | null = null;
    editingId?: number;
    filieresDraft: SchoolFiliere[] = [];
    filiereDraft: { code: string; nom: string; description: string } = { code: '', nom: '', description: '' };

    schoolForm;

    private allSchools: School[] = [];

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly schoolService: SchoolService,
        private readonly messageService: MessageService
    ) {
        this.schoolForm = this.formBuilder.group({
            nom: ['', Validators.required],
            code: [''],
            description: ['']
        });
    }

    ngOnInit() {
        this.loadSchools();
    }

    get schools(): School[] {
        const term = this.searchValue.trim().toLowerCase();
        if (!term) {
            return this.allSchools;
        }

        return this.allSchools.filter((school) => {
            return school.nom.toLowerCase().includes(term) || (school.code || '').toLowerCase().includes(term) || (school.description || '').toLowerCase().includes(term);
        });
    }

    openCreateDialog() {
        this.isEditMode = false;
        this.editingId = undefined;
        this.selectedSchool = null;
        this.schoolForm.reset({ nom: '', code: '', description: '' });
        this.filieresDraft = [];
        this.filiereDraft = { code: '', nom: '', description: '' };
        this.displayDialog = true;
    }

    openEditDialog(school: School) {
        this.isEditMode = true;
        this.editingId = school.id;
        this.selectedSchool = { ...school };
        this.schoolForm.reset({
            nom: school.nom,
            code: school.code || '',
            description: school.description || ''
        });
        this.filieresDraft = [...(school.filieres || [])];
        this.filiereDraft = { code: '', nom: '', description: '' };
        this.displayDialog = true;
    }

    addFiliereDraft() {
        const code = this.filiereDraft.code.trim();
        const nom = this.filiereDraft.nom.trim();
        const description = this.filiereDraft.description.trim();

        if (!code || !nom) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Code et nom de filiere sont obligatoires' });
            return;
        }

        this.filieresDraft = [
            ...this.filieresDraft,
            {
                code,
                nom,
                description: description || undefined,
                status: 'ACTIVE'
            }
        ];

        this.filiereDraft = { code: '', nom: '', description: '' };
    }

    removeFiliereDraft(index: number) {
        this.filieresDraft = this.filieresDraft.filter((_, idx) => idx !== index);
    }

    openDeleteDialog(school: School) {
        this.selectedSchool = { ...school };
        this.displayDeleteDialog = true;
    }

    saveSchool() {
        if (this.schoolForm.invalid) {
            this.schoolForm.markAllAsTouched();
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Le nom de l ecole est obligatoire' });
            return;
        }

        const payload: School = {
            nom: this.schoolForm.get('nom')?.value?.trim() || '',
            code: this.schoolForm.get('code')?.value?.trim() || undefined,
            description: this.schoolForm.get('description')?.value?.trim() || undefined,
            status: this.isEditMode ? this.selectedSchool?.status : 'ACTIVE',
            filieres: this.filieresDraft
        };

        if (this.isEditMode && this.editingId) {
            this.schoolService.update(this.editingId, payload).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Ecole mise a jour avec succes' });
                    this.displayDialog = false;
                    this.loadSchools();
                },
                error: (error: unknown) => {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: this.getApiErrorMessage(error, 'Echec de mise a jour de l ecole') });
                }
            });
            return;
        }

        this.schoolService.create(payload).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Ecole creee avec succes' });
                this.displayDialog = false;
                this.loadSchools();
            },
            error: (error: unknown) => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: this.getApiErrorMessage(error, 'Echec de creation de l ecole') });
            }
        });
    }

    deleteSchool() {
        if (!this.selectedSchool?.id) {
            return;
        }

        this.schoolService.delete(this.selectedSchool.id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Ecole supprimee avec succes' });
                this.displayDeleteDialog = false;
                this.loadSchools();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Echec de suppression de l ecole' });
            }
        });
    }

    private loadSchools() {
        this.schoolService.getAll().subscribe({
            next: (schools) => {
                this.allSchools = schools;
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement des ecoles impossible' });
            }
        });
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