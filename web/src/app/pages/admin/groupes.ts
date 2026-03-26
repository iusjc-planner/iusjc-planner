import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { GroupService } from '../../core/services/group.service';
import { Group } from '../../core/models/group.model';

@Component({
    selector: 'app-groupes',
    standalone: true,
    imports: [CommonModule, ButtonModule, DialogModule, TableModule, InputTextModule, FormsModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Gestion des groupes d'étudiants</h5>
                <button pButton type="button" label="Créer groupe" icon="pi pi-plus" class="p-button-rounded p-button-text" (click)="openCreateDialog()"></button>
            </div>

            <div class="mb-4">
                <span class="p-input-icon-left w-full">
                    <i class="pi pi-search"></i>
                    <input pInputText type="text" [(ngModel)]="searchValue" placeholder="Rechercher..." class="w-full" />
                </span>
            </div>

            <p-table [value]="groupes" [rows]="10" [paginator]="true" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="nom">Nom du groupe <p-sortIcon field="nom"></p-sortIcon></th>
                        <th pSortableColumn="filiere">Filière <p-sortIcon field="filiere"></p-sortIcon></th>
                        <th pSortableColumn="niveau">Niveau <p-sortIcon field="niveau"></p-sortIcon></th>
                        <th pSortableColumn="etudiants">Étudiants <p-sortIcon field="etudiants"></p-sortIcon></th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-groupe>
                    <tr>
                        <td>{{ groupe.nom }}</td>
                        <td>{{ groupe.filiere }}</td>
                        <td>{{ groupe.niveau }}</td>
                        <td>{{ groupe.etudiants }}</td>
                        <td>
                            <button pButton type="button" icon="pi pi-pencil" class="p-button-rounded p-button-text mr-2"></button>
                            <button pButton type="button" icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" (click)="deleteGroupe(groupe)"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="displayCreateDialog" header="Créer un groupe" [modal]="true" [style]="{ width: '42vw' }" [breakpoints]="{ '960px': '75vw', '640px': '90vw' }">
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Nom du groupe</label>
                    <input pInputText type="text" [(ngModel)]="createForm.nom" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-3">
                    <label class="block mb-2 font-medium">Niveau</label>
                    <input pInputText type="text" [(ngModel)]="createForm.niveau" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-3">
                    <label class="block mb-2 font-medium">Effectif</label>
                    <input pInputText type="number" [(ngModel)]="createForm.effectif" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Filiere ID</label>
                    <input pInputText type="number" [(ngModel)]="createForm.filiereId" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Ecole ID (optionnel)</label>
                    <input pInputText type="number" [(ngModel)]="createForm.schoolId" class="w-full" />
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button pButton type="button" label="Annuler" class="p-button-text" (click)="displayCreateDialog = false"></button>
                <button pButton type="button" label="Creer" class="p-button-rounded p-button-text" (click)="createGroupe()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class GroupesPage {
    searchValue = '';
    displayCreateDialog = false;
    createForm: {
        nom: string;
        niveau: string;
        effectif?: number;
        filiereId?: number;
        schoolId?: number;
    } = this.getEmptyCreateForm();

    private allGroupes: Array<Group & { etudiants: number }> = [];

    constructor(
        private messageService: MessageService,
        private groupService: GroupService
    ) {}

    ngOnInit() {
        this.loadGroupes();
    }

    openCreateDialog() {
        this.createForm = this.getEmptyCreateForm();
        this.displayCreateDialog = true;
    }

    createGroupe() {
        if (!this.createForm.nom.trim() || !this.createForm.filiereId) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Nom et filiere ID sont obligatoires' });
            return;
        }

        const payload: Group = {
            nom: this.createForm.nom.trim(),
            niveau: this.createForm.niveau.trim() || undefined,
            effectif: this.createForm.effectif,
            filiere: String(this.createForm.filiereId),
            schoolId: this.createForm.schoolId
        };

        this.groupService.create(payload).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Groupe cree avec succes' });
                this.displayCreateDialog = false;
                this.loadGroupes();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Echec de creation du groupe' });
            }
        });
    }

    get groupes(): Array<Group & { etudiants: number }> {
        const term = this.searchValue.trim().toLowerCase();
        if (!term) {
            return this.allGroupes;
        }

        return this.allGroupes.filter((groupe) => {
            return (
                groupe.nom.toLowerCase().includes(term) ||
                (groupe.filiere || '').toLowerCase().includes(term) ||
                (groupe.niveau || '').toLowerCase().includes(term)
            );
        });
    }

    private loadGroupes() {
        this.groupService.getAll().subscribe({
            next: (groupes) => {
                this.allGroupes = groupes.map((groupe) => ({
                    ...groupe,
                    etudiants: groupe.effectif || 0
                }));
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement des groupes impossible' });
            }
        });
    }

    deleteGroupe(groupe: Group) {
        if (!groupe.id) {
            return;
        }

        this.groupService.delete(groupe.id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Groupe supprime avec succes' });
                this.loadGroupes();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Echec de suppression du groupe' });
            }
        });
    }

    private getEmptyCreateForm() {
        return {
            nom: '',
            niveau: '',
            effectif: undefined,
            filiereId: undefined,
            schoolId: undefined
        };
    }
}
