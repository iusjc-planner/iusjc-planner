import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { TeacherService } from '../../core/services/teacher.service';
import { Teacher } from '../../core/models/teacher.model';

type Enseignant = Teacher & {
    telephone: string;
    ecoles: string[];
    matieres: string[];
};

interface CreneauHoraire {
    jour: string;
    debut: string;
    fin: string;
    disponible: boolean;
}

@Component({
    selector: 'app-enseignants',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, InputTextModule, FormsModule, DialogModule, ToastModule, TooltipModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Gestion des enseignants</h5>
                <button pButton type="button" label="Créer enseignant" icon="pi pi-plus" class="p-button-rounded p-button-text" (click)="openCreateDialog()"></button>
            </div>

            <div class="mb-4 relative">
                <i class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-color"></i>
                <input pInputText type="text" [(ngModel)]="searchValue" placeholder="   Rechercher..." class="w-full pl-10" />
            </div>

            <p-table [value]="enseignants" [rows]="10" [paginator]="true" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="nom">Nom <p-sortIcon field="nom"></p-sortIcon></th>
                        <th pSortableColumn="email">Email <p-sortIcon field="email"></p-sortIcon></th>
                        <th pSortableColumn="statut">Statut <p-sortIcon field="statut"></p-sortIcon></th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-enseignant>
                    <tr>
                        <td>{{ enseignant.nom }} {{ enseignant.prenom }}</td>
                        <td>{{ enseignant.email }}</td>
                        <td>
                            <span [ngClass]="enseignant.statut === 'Actif' ? 'text-green-600' : 'text-red-600'">
                                {{ enseignant.statut }}
                            </span>
                        </td>
                        <td>
                            <button pButton type="button" icon="pi pi-eye" class="p-button-rounded p-button-text mr-2" (click)="openViewDialog(enseignant)" pTooltip="Voir" tooltipPosition="top"></button>
                            <button pButton type="button" icon="pi pi-calendar" class="p-button-rounded p-button-text mr-2" (click)="openAvailabilityDialog(enseignant)" pTooltip="Disponibilités" tooltipPosition="top"></button>
                            <button pButton type="button" icon="pi pi-pencil" class="p-button-rounded p-button-text mr-2" (click)="openEditDialog(enseignant)" pTooltip="Modifier" tooltipPosition="top"></button>
                            <button pButton type="button" icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" (click)="openDeleteDialog(enseignant)" pTooltip="Supprimer" tooltipPosition="top"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Dialog Créer/Modifier -->
        <p-dialog [(visible)]="displayDialog" [header]="isEditMode ? 'Modifier enseignant' : 'Créer enseignant'" [modal]="true" [style]="{width: '55vw'}" [breakpoints]="{'960px': '75vw', '640px': '90vw'}" [closeOnEscape]="true">
            <div class="space-y-6">
                <!-- Section Informations personnelles -->
                <div>
                    <h6 class="text-lg font-bold mb-4 text-surface-900 dark:text-surface-0">Informations personnelles</h6>
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12 md:col-span-6">
                            <label class="block mb-2 font-medium text-sm">Nom <span class="text-red-500">*</span></label>
                            <input pInputText type="text" [(ngModel)]="selectedEnseignant.nom" class="w-full" placeholder="Entrez le nom" />
                        </div>
                        <div class="col-span-12 md:col-span-6">
                            <label class="block mb-2 font-medium text-sm">Prénom <span class="text-red-500">*</span></label>
                            <input pInputText type="text" [(ngModel)]="selectedEnseignant.prenom" class="w-full" placeholder="Entrez le prénom" />
                        </div>
                        <div class="col-span-12 md:col-span-6">
                            <label class="block mb-2 font-medium text-sm">Email <span class="text-red-500">*</span></label>
                            <input pInputText type="email" [(ngModel)]="selectedEnseignant.email" class="w-full" placeholder="exemple@iusjc.cm" />
                        </div>
                        <div class="col-span-12 md:col-span-6">
                            <label class="block mb-2 font-medium text-sm">Téléphone</label>
                            <input pInputText type="tel" [(ngModel)]="selectedEnseignant.telephone" class="w-full" placeholder="+237 6XX XXX XXX" />
                        </div>
                    </div>
                </div>

                <!-- Section Accès -->
                <div class="border-t pt-6">
                    <h6 class="text-lg font-bold mb-4 text-surface-900 dark:text-surface-0">Accès</h6>
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12 md:col-span-6">
                            <label class="block mb-2 font-medium text-sm">Login <span class="text-red-500">*</span></label>
                            <input pInputText type="text" [(ngModel)]="selectedEnseignant.login" class="w-full" placeholder="Entrez le login" />
                        </div>
                        <div class="col-span-12 md:col-span-6">
                            <label class="block mb-2 font-medium text-sm">Statut</label>
                            <select [(ngModel)]="selectedEnseignant.statut" class="w-full px-3 py-2 border rounded bg-surface-0 dark:bg-surface-800">
                                <option value="Actif">Actif</option>
                                <option value="Inactif">Inactif</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Section Affectation -->
                <div class="border-t pt-6">
                    <h6 class="text-lg font-bold mb-4 text-surface-900 dark:text-surface-0">Affectation académique</h6>
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12">
                            <label class="block mb-2 font-medium text-sm">Écoles <span class="text-red-500">*</span></label>
                            <input pInputText type="text" [(ngModel)]="ecolesInput" placeholder="Ex: Informatique, Mathématiques" class="w-full" />
                            <small class="text-muted-color">Séparez les écoles par des virgules</small>
                        </div>
                        <div class="col-span-12">
                            <label class="block mb-2 font-medium text-sm">Matières <span class="text-red-500">*</span></label>
                            <input pInputText type="text" [(ngModel)]="matieresInput" placeholder="Ex: Programmation C, Algorithmique" class="w-full" />
                            <small class="text-muted-color">Séparez les matières par des virgules</small>
                        </div>
                    </div>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <div class="flex justify-end gap-3">
                    <button pButton type="button" label="Annuler" (click)="displayDialog = false" class="p-button-text p-button-outlined"></button>
                    <button pButton type="button" [label]="isEditMode ? 'Modifier' : 'Créer'" (click)="saveEnseignant()" class="p-button-rounded p-button-text"></button>
                </div>
            </ng-template>
        </p-dialog>

        <!-- Dialog Voir -->
        <p-dialog [(visible)]="displayViewDialog" header="Détails enseignant" [modal]="true" [style]="{width: '55vw'}" [breakpoints]="{'960px': '75vw', '640px': '90vw'}" [closeOnEscape]="true">
            <div class="space-y-6">
                <!-- Section Informations personnelles -->
                <div>
                    <h6 class="text-lg font-bold mb-4 text-surface-900 dark:text-surface-0">Informations personnelles</h6>
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12 md:col-span-6">
                            <label class="block mb-2 font-medium text-sm text-muted-color">Nom</label>
                            <p class="text-surface-900 dark:text-surface-0 font-medium">{{ selectedEnseignant.nom }}</p>
                        </div>
                        <div class="col-span-12 md:col-span-6">
                            <label class="block mb-2 font-medium text-sm text-muted-color">Prénom</label>
                            <p class="text-surface-900 dark:text-surface-0 font-medium">{{ selectedEnseignant.prenom }}</p>
                        </div>
                        <div class="col-span-12 md:col-span-6">
                            <label class="block mb-2 font-medium text-sm text-muted-color">Email</label>
                            <p class="text-surface-900 dark:text-surface-0 font-medium">{{ selectedEnseignant.email }}</p>
                        </div>
                        <div class="col-span-12 md:col-span-6">
                            <label class="block mb-2 font-medium text-sm text-muted-color">Téléphone</label>
                            <p class="text-surface-900 dark:text-surface-0 font-medium">{{ selectedEnseignant.telephone }}</p>
                        </div>
                    </div>
                </div>

                <!-- Section Accès -->
                <div class="border-t pt-6">
                    <h6 class="text-lg font-bold mb-4 text-surface-900 dark:text-surface-0">Accès</h6>
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12 md:col-span-6">
                            <label class="block mb-2 font-medium text-sm text-muted-color">Login</label>
                            <p class="text-surface-900 dark:text-surface-0 font-medium">{{ selectedEnseignant.login }}</p>
                        </div>
                        <div class="col-span-12 md:col-span-6">
                            <label class="block mb-2 font-medium text-sm text-muted-color">Statut</label>
                            <p [ngClass]="selectedEnseignant.statut === 'Actif' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'">{{ selectedEnseignant.statut }}</p>
                        </div>
                    </div>
                </div>

                <!-- Section Affectation -->
                <div class="border-t pt-6">
                    <h6 class="text-lg font-bold mb-4 text-surface-900 dark:text-surface-0">Affectation académique</h6>
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12">
                            <label class="block mb-2 font-medium text-sm text-muted-color">Écoles</label>
                            <div class="flex flex-wrap gap-2">
                                <span *ngFor="let ecole of selectedEnseignant.ecoles" class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{{ ecole }}</span>
                            </div>
                        </div>
                        <div class="col-span-12">
                            <label class="block mb-2 font-medium text-sm text-muted-color">Matières</label>
                            <div class="flex flex-wrap gap-2">
                                <span *ngFor="let matiere of selectedEnseignant.matieres" class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">{{ matiere }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button pButton type="button" label="Fermer" (click)="displayViewDialog = false" class="p-button-text p-button-outlined"></button>
            </ng-template>
        </p-dialog>

        <!-- Dialog Disponibilités -->
        <p-dialog [(visible)]="displayAvailabilityDialog" header="Disponibilités hebdomadaires" [modal]="true" [style]="{width: '60vw'}" [breakpoints]="{'960px': '75vw', '640px': '90vw'}" [closeOnEscape]="true">
            <div class="space-y-4">
                <p class="text-muted-color mb-4">Emploi du temps hebdomadaire de <strong>{{ selectedEnseignant.nom }} {{ selectedEnseignant.prenom }}</strong></p>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-surface-100 dark:bg-surface-800 border-b-2 border-surface-200 dark:border-surface-700">
                                <th class="p-4 text-left font-bold text-surface-900 dark:text-surface-0">Jour</th>
                                <th class="p-4 text-left font-bold text-surface-900 dark:text-surface-0">Heure début</th>
                                <th class="p-4 text-left font-bold text-surface-900 dark:text-surface-0">Heure fin</th>
                                <th class="p-4 text-left font-bold text-surface-900 dark:text-surface-0">Disponibilité</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr *ngFor="let creneau of creneaux" class="border-b border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                                <td class="p-4 font-medium text-surface-900 dark:text-surface-0">{{ creneau.jour }}</td>
                                <td class="p-4 text-surface-700 dark:text-surface-300">{{ creneau.debut }}</td>
                                <td class="p-4 text-surface-700 dark:text-surface-300">{{ creneau.fin }}</td>
                                <td class="p-4">
                                    <span *ngIf="creneau.disponible" class="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                                        <i class="pi pi-check text-xs"></i> Disponible
                                    </span>
                                    <span *ngIf="!creneau.disponible" class="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-3 py-1 rounded-full text-sm font-medium">
                                        <i class="pi pi-times text-xs"></i> Indisponible
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button pButton type="button" label="Fermer" (click)="displayAvailabilityDialog = false" class="p-button-text p-button-outlined"></button>
            </ng-template>
        </p-dialog>

        <!-- Dialog Supprimer -->
        <p-dialog [(visible)]="displayDeleteDialog" header="Confirmer la suppression" [modal]="true" [style]="{width: '45vw'}" [breakpoints]="{'960px': '75vw', '640px': '90vw'}" [closeOnEscape]="true">
            <div class="space-y-4">
                <div class="flex items-start gap-4">
                    <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex-shrink-0">
                        <i class="pi pi-exclamation-triangle text-red-600 dark:text-red-400 text-xl"></i>
                    </div>
                    <div>
                        <p class="text-surface-900 dark:text-surface-0 font-medium">Êtes-vous sûr de vouloir supprimer cet enseignant ?</p>
                        <p class="text-muted-color text-sm mt-2">
                            <strong>{{ selectedEnseignant.nom }} {{ selectedEnseignant.prenom }}</strong> sera supprimé définitivement du système.
                        </p>
                    </div>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <div class="flex justify-end gap-3">
                    <button pButton type="button" label="Annuler" (click)="displayDeleteDialog = false" class="p-button-text p-button-outlined"></button>
                    <button pButton type="button" label="Supprimer" (click)="deleteEnseignant()" class="p-button-danger"></button>
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class EnseignantsPage {
    searchValue = '';
    displayDialog = false;
    displayViewDialog = false;
    displayAvailabilityDialog = false;
    displayDeleteDialog = false;
    isEditMode = false;
    ecolesInput = '';
    matieresInput = '';
    
    selectedEnseignant: Enseignant = {
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        login: '',
        ecoles: [],
        matieres: [],
        statut: 'Actif'
    };

    creneaux: CreneauHoraire[] = [
        { jour: 'Lundi', debut: '08:00', fin: '17:00', disponible: true },
        { jour: 'Mardi', debut: '08:00', fin: '17:00', disponible: true },
        { jour: 'Mercredi', debut: '08:00', fin: '17:00', disponible: false },
        { jour: 'Jeudi', debut: '08:00', fin: '17:00', disponible: true },
        { jour: 'Vendredi', debut: '08:00', fin: '17:00', disponible: true },
        { jour: 'Samedi', debut: '09:00', fin: '12:00', disponible: true },
        { jour: 'Dimanche', debut: '-', fin: '-', disponible: false }
    ];

    allEnseignants: Enseignant[] = [];

    get enseignants(): Enseignant[] {
        const term = this.searchValue.trim().toLowerCase();
        if (!term) {
            return this.allEnseignants;
        }

        return this.allEnseignants.filter((enseignant) => {
            const fullname = `${enseignant.nom} ${enseignant.prenom}`.toLowerCase();
            return (
                fullname.includes(term) ||
                enseignant.email.toLowerCase().includes(term) ||
                enseignant.login.toLowerCase().includes(term)
            );
        });
    }

    constructor(
        private messageService: MessageService,
        private teacherService: TeacherService
    ) {}

    ngOnInit() {
        this.loadTeachers();
    }

    private loadTeachers() {
        this.teacherService.getAll().subscribe({
            next: (teachers) => {
                this.allEnseignants = teachers.map((teacher) => this.fromApiTeacher(teacher));
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement des enseignants impossible' });
            }
        });
    }

    openCreateDialog() {
        this.isEditMode = false;
        this.selectedEnseignant = {
            nom: '',
            prenom: '',
            email: '',
            telephone: '',
            login: '',
            ecoles: [],
            matieres: [],
            statut: 'Actif'
        };
        this.ecolesInput = '';
        this.matieresInput = '';
        this.displayDialog = true;
    }

    openEditDialog(enseignant: Enseignant) {
        this.isEditMode = true;
        this.selectedEnseignant = { ...enseignant };
        this.ecolesInput = enseignant.ecoles.join(', ');
        this.matieresInput = enseignant.matieres.join(', ');
        this.displayDialog = true;
    }

    openViewDialog(enseignant: Enseignant) {
        this.selectedEnseignant = { ...enseignant };
        this.displayViewDialog = true;
    }

    openAvailabilityDialog(enseignant: Enseignant) {
        this.selectedEnseignant = { ...enseignant };
        this.displayAvailabilityDialog = true;
    }

    openDeleteDialog(enseignant: Enseignant) {
        this.selectedEnseignant = { ...enseignant };
        this.displayDeleteDialog = true;
    }

    saveEnseignant() {
        this.selectedEnseignant.ecoles = this.ecolesInput.split(',').map(e => e.trim()).filter(e => e);
        this.selectedEnseignant.matieres = this.matieresInput.split(',').map(m => m.trim()).filter(m => m);

        if (this.isEditMode) {
            if (!this.selectedEnseignant.id) {
                return;
            }

            this.teacherService.update(this.selectedEnseignant.id, this.toApiTeacher(this.selectedEnseignant)).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Enseignant modifié avec succès' });
                    this.displayDialog = false;
                    this.loadTeachers();
                },
                error: (error: unknown) => {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: this.getErrorMessage(error, 'Echec de modification enseignant') });
                }
            });
        } else {
            this.teacherService.create(this.toApiTeacher(this.selectedEnseignant)).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Enseignant créé avec succès' });
                    this.displayDialog = false;
                    this.loadTeachers();
                },
                error: (error: unknown) => {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: this.getErrorMessage(error, 'Echec de creation enseignant') });
                }
            });
        }
    }

    deleteEnseignant() {
        if (!this.selectedEnseignant.id) {
            return;
        }

        this.teacherService.delete(this.selectedEnseignant.id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Enseignant supprimé avec succès' });
                this.displayDeleteDialog = false;
                this.loadTeachers();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Echec de suppression enseignant' });
            }
        });
    }

    private toApiTeacher(enseignant: Enseignant): Teacher {
        return {
            id: enseignant.id,
            nom: enseignant.nom,
            prenom: enseignant.prenom,
            email: enseignant.email,
            telephone: enseignant.telephone,
            login: enseignant.login,
            ecoles: enseignant.ecoles,
            matieres: enseignant.matieres,
            statut: enseignant.statut
        };
    }

    private fromApiTeacher(teacher: Teacher): Enseignant {
        return {
            id: teacher.id,
            nom: teacher.nom,
            prenom: teacher.prenom,
            email: teacher.email,
            telephone: teacher.telephone || '',
            login: teacher.login,
            ecoles: teacher.ecoles || [],
            matieres: teacher.matieres || [],
            statut: teacher.statut
        };
    }

    private getErrorMessage(error: unknown, fallback: string): string {
        if (error instanceof Error && error.message) {
            return error.message;
        }

        return fallback;
    }
}
