import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { SchoolService } from '../../core/services/school.service';
import { TeacherService } from '../../core/services/teacher.service';

interface Utilisateur {
    id?: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    login: string;
    role: 'Administrateur' | 'Enseignant';
    statut: 'Actif' | 'Inactif';
    ecoles: string[];
}

interface OptionItem {
    label: string;
    value: string;
}

@Component({
    selector: 'app-utilisateurs',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, InputTextModule, FormsModule, ReactiveFormsModule, DialogModule, ToastModule, TooltipModule, SelectModule, MultiSelectModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Gestion des utilisateurs</h5>
                <button pButton type="button" label="Creer utilisateur" icon="pi pi-plus" class="p-button-rounded p-button-text" (click)="openCreateDialog()"></button>
            </div>

            <div class="mb-4 relative">
                <i class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-color"></i>
                <input pInputText type="text" [(ngModel)]="searchValue" placeholder="   Rechercher..." class="w-full pl-10" />
            </div>

            <div class="grid grid-cols-12 gap-4 mb-4">
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Filtrer par role</label>
                    <select [(ngModel)]="roleFilter" class="w-full px-3 py-2 border rounded">
                        <option value="">Tous les roles</option>
                        <option value="Administrateur">Administrateur</option>
                        <option value="Enseignant">Enseignant</option>
                    </select>
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Filtrer par statut</label>
                    <select [(ngModel)]="statutFilter" class="w-full px-3 py-2 border rounded">
                        <option value="">Tous les statuts</option>
                        <option value="Actif">Actif</option>
                        <option value="Inactif">Inactif</option>
                    </select>
                </div>
                <div class="col-span-12 md:col-span-4 flex items-end">
                    <span class="text-sm text-muted-color">{{ utilisateurs.length }} utilisateur(s) affiche(s)</span>
                </div>
            </div>

            <p-table [value]="utilisateurs" [rows]="10" [paginator]="true" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="nom">Nom <p-sortIcon field="nom"></p-sortIcon></th>
                        <th pSortableColumn="email">Email <p-sortIcon field="email"></p-sortIcon></th>
                        <th pSortableColumn="role">Role <p-sortIcon field="role"></p-sortIcon></th>
                        <th pSortableColumn="statut">Statut <p-sortIcon field="statut"></p-sortIcon></th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-utilisateur>
                    <tr>
                        <td>{{ utilisateur.nom }} {{ utilisateur.prenom }}</td>
                        <td>{{ utilisateur.email }}</td>
                        <td>
                            <span [ngClass]="getRoleClass(utilisateur.role)">
                                {{ utilisateur.role }}
                            </span>
                        </td>
                        <td>
                            <span [ngClass]="utilisateur.statut === 'Actif' ? 'text-green-600' : 'text-red-600'">
                                {{ utilisateur.statut }}
                            </span>
                        </td>
                        <td>
                            <button pButton type="button" icon="pi pi-eye" class="p-button-rounded p-button-text mr-2" (click)="openViewDialog(utilisateur)" pTooltip="Voir" tooltipPosition="top"></button>
                            <button pButton type="button" icon="pi pi-pencil" class="p-button-rounded p-button-text mr-2" (click)="openEditDialog(utilisateur)" pTooltip="Modifier" tooltipPosition="top"></button>
                            <button pButton type="button" icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" (click)="openDeleteDialog(utilisateur)" pTooltip="Supprimer" tooltipPosition="top"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog
            [(visible)]="displayDialog"
            [header]="isEditMode ? 'Modifier utilisateur' : 'Creer utilisateur'"
            [modal]="true"
            [style]="{ width: '68vw', maxWidth: '1200px' }"
            [contentStyle]="{ maxHeight: '78vh', overflow: 'auto' }"
            [breakpoints]="{ '1400px': '75vw', '1100px': '85vw', '640px': '96vw' }"
        >
            <form [formGroup]="userForm" class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Nom</label>
                    <input pInputText type="text" formControlName="nom" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Prenom</label>
                    <input pInputText type="text" formControlName="prenom" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Email</label>
                    <input pInputText type="email" formControlName="email" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Telephone</label>
                    <input pInputText type="tel" formControlName="telephone" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Login</label>
                    <input pInputText type="text" formControlName="login" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-3">
                    <label class="block mb-2 font-medium">Role</label>
                    <p-select formControlName="role" [options]="roleOptions" optionLabel="label" optionValue="value" appendTo="body" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-3">
                    <label class="block mb-2 font-medium">Statut</label>
                    <p-select formControlName="statut" [options]="statusOptions" optionLabel="label" optionValue="value" appendTo="body" class="w-full" />
                </div>

                <div class="col-span-12" *ngIf="isTeacherRoleSelected()">
                    <label class="block mb-2 font-medium">Ecoles</label>
                    <p-multiSelect
                        formControlName="ecoles"
                        [options]="schoolOptions"
                        optionLabel="label"
                        optionValue="value"
                        [filter]="true"
                        filterBy="label"
                        placeholder="Selectionner une ou plusieurs ecoles"
                        display="chip"
                        appendTo="body"
                        class="w-full"
                    />
                </div>

            </form>
            <ng-template pTemplate="footer">
                <button pButton type="button" label="Annuler" (click)="displayDialog = false" class="p-button-text"></button>
                <button pButton type="button" [label]="isEditMode ? 'Modifier' : 'Creer'" (click)="saveUtilisateur()" class="p-button-rounded p-button-text"></button>
            </ng-template>
        </p-dialog>

        <p-dialog [(visible)]="displayViewDialog" header="Details utilisateur" [modal]="true" [style]="{ width: '50vw' }" [breakpoints]="{ '960px': '75vw', '640px': '90vw' }">
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Nom</label>
                    <p class="text-surface-900 dark:text-surface-0">{{ selectedUtilisateur.nom }}</p>
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Prenom</label>
                    <p class="text-surface-900 dark:text-surface-0">{{ selectedUtilisateur.prenom }}</p>
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Email</label>
                    <p class="text-surface-900 dark:text-surface-0">{{ selectedUtilisateur.email }}</p>
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Telephone</label>
                    <p class="text-surface-900 dark:text-surface-0">{{ selectedUtilisateur.telephone }}</p>
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Login</label>
                    <p class="text-surface-900 dark:text-surface-0">{{ selectedUtilisateur.login }}</p>
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Role</label>
                    <p class="text-surface-900 dark:text-surface-0">{{ selectedUtilisateur.role }}</p>
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Statut</label>
                    <p [ngClass]="selectedUtilisateur.statut === 'Actif' ? 'text-green-600' : 'text-red-600'">{{ selectedUtilisateur.statut }}</p>
                </div>
                <div class="col-span-12" *ngIf="selectedUtilisateur.role === 'Enseignant'">
                    <label class="block mb-2 font-medium">Ecoles</label>
                    <p class="text-surface-900 dark:text-surface-0">{{ selectedUtilisateur.ecoles.join(', ') || '-' }}</p>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button pButton type="button" label="Fermer" (click)="displayViewDialog = false" class="p-button-text"></button>
            </ng-template>
        </p-dialog>

        <p-dialog [(visible)]="displayDeleteDialog" header="Confirmer la suppression" [modal]="true" [style]="{ width: '40vw' }" [breakpoints]="{ '960px': '75vw', '640px': '90vw' }">
            <p>Etes-vous sur de vouloir supprimer l'utilisateur <strong>{{ selectedUtilisateur.nom }} {{ selectedUtilisateur.prenom }}</strong> ?</p>
            <ng-template pTemplate="footer">
                <button pButton type="button" label="Annuler" (click)="displayDeleteDialog = false" class="p-button-text"></button>
                <button pButton type="button" label="Supprimer" (click)="deleteUtilisateur()" class="p-button-danger"></button>
            </ng-template>
        </p-dialog>
    `
})
export class UtilisateursPage {
    searchValue = '';
    roleFilter = '';
    statutFilter = '';
    displayDialog = false;
    displayViewDialog = false;
    displayDeleteDialog = false;
    isEditMode = false;
    editingId?: number;

    roleOptions = [
        { label: 'Administrateur', value: 'Administrateur' },
        { label: 'Enseignant', value: 'Enseignant' }
    ];

    statusOptions = [
        { label: 'Actif', value: 'Actif' },
        { label: 'Inactif', value: 'Inactif' }
    ];

    schoolOptions: OptionItem[] = [];
    userForm: ReturnType<FormBuilder['group']>;

    selectedUtilisateur: Utilisateur = this.getEmptyUtilisateur();
    private allUtilisateurs: Utilisateur[] = [];
    private readonly destroyRef = inject(DestroyRef);

    get utilisateurs(): Utilisateur[] {
        const term = this.searchValue.trim().toLowerCase();

        return this.allUtilisateurs.filter((utilisateur) => {
            const fullName = `${utilisateur.nom} ${utilisateur.prenom}`.toLowerCase();
            const searchMatch =
                term.length === 0 ||
                fullName.includes(term) ||
                utilisateur.email.toLowerCase().includes(term) ||
                utilisateur.login.toLowerCase().includes(term);

            const roleMatch = !this.roleFilter || utilisateur.role === this.roleFilter;
            const statusMatch = !this.statutFilter || utilisateur.statut === this.statutFilter;

            return searchMatch && roleMatch && statusMatch;
        });
    }

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly messageService: MessageService,
        private readonly userService: UserService,
        private readonly schoolService: SchoolService,
        private readonly teacherService: TeacherService
    ) {
        this.userForm = this.formBuilder.group({
            nom: ['', Validators.required],
            prenom: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            telephone: [''],
            login: ['', Validators.required],
            role: ['Enseignant', Validators.required],
            statut: ['Actif', Validators.required],
            ecoles: [[] as string[]]
        });
    }

    ngOnInit() {
        this.loadSchools();
        this.loadUsers();
    }

    isTeacherRoleSelected(): boolean {
        return this.userForm.get('role')?.value === 'Enseignant';
    }

    openCreateDialog() {
        this.isEditMode = false;
        this.selectedUtilisateur = this.getEmptyUtilisateur();
        this.editingId = undefined;
        this.userForm.reset({ ...this.selectedUtilisateur, ecoles: [] });
        this.displayDialog = true;
    }

    openEditDialog(utilisateur: Utilisateur) {
        this.isEditMode = true;
        this.selectedUtilisateur = { ...utilisateur };
        this.editingId = utilisateur.id;
        this.userForm.reset({ ...utilisateur, ecoles: [...utilisateur.ecoles] });
        this.displayDialog = true;
    }

    openViewDialog(utilisateur: Utilisateur) {
        this.selectedUtilisateur = { ...utilisateur };
        this.displayViewDialog = true;
    }

    openDeleteDialog(utilisateur: Utilisateur) {
        this.selectedUtilisateur = { ...utilisateur };
        this.displayDeleteDialog = true;
    }

    saveUtilisateur() {
        if (this.userForm.invalid) {
            this.userForm.markAllAsTouched();
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Veuillez corriger les champs obligatoires' });
            return;
        }

        const utilisateur = this.toUtilisateurFromForm();
        const request$ = this.isEditMode && this.editingId
            ? this.userService.update(this.editingId, this.toApiUser({ ...utilisateur, id: this.editingId }))
            : this.userService.create(this.toApiUser(utilisateur));

        request$
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                switchMap((savedUser) =>
                    this.syncTeacherProfileIfNeeded(savedUser, utilisateur.role).pipe(
                        catchError((error: unknown) => {
                            this.messageService.add({
                                severity: 'warn',
                                summary: 'Avertissement',
                                detail: this.getErrorMessage(error, 'Utilisateur enregistre, mais profil enseignant partiellement synchronise')
                            });
                            return of(void 0);
                        }),
                        map(() => savedUser)
                    )
                )
            )
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succes',
                        detail: this.isEditMode ? 'Utilisateur modifie avec succes' : 'Utilisateur cree avec succes'
                    });
                    this.displayDialog = false;
                    this.loadUsers();
                },
                error: (error: unknown) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: this.getErrorMessage(error, this.isEditMode ? 'Echec de modification utilisateur' : 'Echec de creation utilisateur')
                    });
                }
            });
    }

    deleteUtilisateur() {
        if (!this.selectedUtilisateur.id) {
            return;
        }

        this.userService.delete(this.selectedUtilisateur.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Utilisateur supprime avec succes' });
                this.displayDeleteDialog = false;
                this.loadUsers();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Echec de suppression utilisateur' });
            }
        });
    }

    private loadSchools() {
        this.schoolService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (schools) => {
                this.schoolOptions = schools
                    .map((school) => school.nom?.trim())
                    .filter((name): name is string => Boolean(name))
                    .map((name) => ({ label: name, value: name }));
            },
            error: () => {
                this.messageService.add({ severity: 'warn', summary: 'Avertissement', detail: 'Chargement des ecoles indisponible' });
            }
        });
    }

    private loadUsers() {
        this.userService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (users) => {
                this.allUtilisateurs = users.map((user) => this.fromApiUser(user));
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement des utilisateurs impossible' });
            }
        });
    }

    private syncTeacherProfileIfNeeded(savedUser: User, role: Utilisateur['role']): Observable<void> {
        if (role !== 'Enseignant' || !savedUser.id) {
            return of(void 0);
        }

        return this.teacherService.getByUserId(savedUser.id).pipe(
            map(() => void 0),
            catchError((error: unknown) => {
                if (!(error instanceof HttpErrorResponse) || error.status !== 404) {
                    return of(void 0);
                }

                return this.teacherService.createForUser(savedUser.id as number, []).pipe(
                    map(() => void 0),
                    catchError(() => of(void 0))
                );
            })
        );
    }

    private toApiUser(utilisateur: Utilisateur): User {
        return {
            id: utilisateur.id,
            nom: utilisateur.nom,
            prenom: utilisateur.prenom,
            email: utilisateur.email,
            telephone: utilisateur.telephone ? Number(utilisateur.telephone) : undefined,
            login: utilisateur.login,
            role: utilisateur.role,
            statut: utilisateur.statut,
            ecoles: utilisateur.role === 'Enseignant' ? utilisateur.ecoles : []
        };
    }

    private fromApiUser(user: User): Utilisateur {
        return {
            id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            telephone: user.telephone !== undefined ? String(user.telephone) : '',
            login: user.login,
            role: this.fromApiRole(user.role),
            statut: this.fromApiStatus(user.status || user.statut),
            ecoles: user.ecoles ?? []
        };
    }

    private toUtilisateurFromForm(): Utilisateur {
        const value = this.userForm.getRawValue();

        return {
            nom: value.nom || '',
            prenom: value.prenom || '',
            email: value.email || '',
            telephone: value.telephone || '',
            login: value.login || '',
            role: (value.role || 'Enseignant') as 'Administrateur' | 'Enseignant',
            statut: (value.statut || 'Actif') as 'Actif' | 'Inactif',
            ecoles: value.ecoles || []
        };
    }

    private getErrorMessage(error: unknown, fallback: string): string {
        if (error instanceof HttpErrorResponse) {
            if (typeof error.error === 'string' && error.error.trim()) {
                return error.error;
            }

            const message = (error.error as { message?: string } | null)?.message;
            if (message && message.trim()) {
                return message;
            }
        }

        if (error instanceof Error && error.message) {
            return error.message;
        }

        return fallback;
    }

    private fromApiRole(role?: string): 'Administrateur' | 'Enseignant' {
        const normalized = (role || '').toUpperCase();
        return normalized === 'ADMIN' ? 'Administrateur' : 'Enseignant';
    }

    private fromApiStatus(status?: string): 'Actif' | 'Inactif' {
        const normalized = (status || '').toUpperCase();
        return normalized === 'INACTIVE' || normalized === 'INACTIF' ? 'Inactif' : 'Actif';
    }

    private getEmptyUtilisateur(): Utilisateur {
        return {
            nom: '',
            prenom: '',
            email: '',
            telephone: '',
            login: '',
            role: 'Enseignant',
            statut: 'Actif',
            ecoles: []
        };
    }

    getRoleClass(role: string): string {
        const classes: { [key: string]: string } = {
            Administrateur: 'bg-red-100 text-red-800 px-2 py-1 rounded',
            Enseignant: 'bg-blue-100 text-blue-800 px-2 py-1 rounded'
        };
        return classes[role] || '';
    }
}
