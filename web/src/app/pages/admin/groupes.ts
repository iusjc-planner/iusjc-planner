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
import { GroupService } from '../../core/services/group.service';
import { Group } from '../../core/models/group.model';
import { School, SchoolFiliere } from '../../core/models/school.model';
import { SchoolService } from '../../core/services/school.service';

type GroupeItem = Group & {
    etudiants: number;
    ecoleLabel: string;
    filiereLabel: string;
};

@Component({
    selector: 'app-groupes',
    standalone: true,
    imports: [CommonModule, ButtonModule, DialogModule, TableModule, InputTextModule, FormsModule, ToastModule, SelectModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Gestion des groupes d'etudiants</h5>
                <button pButton type="button" label="Creer groupe" icon="pi pi-plus" class="p-button-rounded p-button-text" (click)="openCreateDialog()"></button>
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
                        <th pSortableColumn="ecoleLabel">Ecole <p-sortIcon field="ecoleLabel"></p-sortIcon></th>
                        <th pSortableColumn="filiereLabel">Filiere <p-sortIcon field="filiereLabel"></p-sortIcon></th>
                        <th pSortableColumn="niveau">Niveau <p-sortIcon field="niveau"></p-sortIcon></th>
                        <th pSortableColumn="etudiants">Etudiants <p-sortIcon field="etudiants"></p-sortIcon></th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-groupe>
                    <tr>
                        <td>{{ groupe.nom }}</td>
                        <td>{{ groupe.ecoleLabel }}</td>
                        <td>{{ groupe.filiereLabel }}</td>
                        <td>{{ groupe.niveau || '-' }}</td>
                        <td>{{ groupe.etudiants }}</td>
                        <td>
                            <button pButton type="button" icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" (click)="deleteGroupe(groupe)"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog
            [(visible)]="displayCreateDialog"
            header="Creer un groupe"
            [modal]="true"
            [style]="{ width: '62vw', maxWidth: '1100px' }"
            [contentStyle]="{ maxHeight: '76vh', overflow: 'auto' }"
            [breakpoints]="{ '1400px': '75vw', '1100px': '85vw', '640px': '96vw' }"
        >
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
                    <label class="block mb-2 font-medium">Ecole</label>
                    <p-select
                        [(ngModel)]="createForm.schoolId"
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
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Filiere</label>
                    <p-select
                        [(ngModel)]="createForm.filiereId"
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

    schools: School[] = [];
    schoolSelectOptions: Array<{ label: string; value: number }> = [];

    createForm: {
        nom: string;
        niveau: string;
        effectif?: number;
        filiereId?: number;
        schoolId?: number;
    } = this.getEmptyCreateForm();

    private rawGroupes: Group[] = [];
    private allGroupes: GroupeItem[] = [];

    constructor(
        private readonly messageService: MessageService,
        private readonly groupService: GroupService,
        private readonly schoolService: SchoolService
    ) {}

    ngOnInit() {
        this.loadSchools();
        this.loadGroupes();
    }

    get filiereSelectOptions(): Array<{ label: string; value: number }> {
        if (!this.createForm.schoolId) {
            return [];
        }

        const school = this.schools.find((item) => item.id === this.createForm.schoolId);
        if (!school?.filieres) {
            return [];
        }

        return school.filieres.map((filiere) => ({
            label: `${filiere.code} - ${filiere.nom}`,
            value: filiere.id || Number.NaN
        })).filter((item) => !Number.isNaN(item.value));
    }

    openCreateDialog() {
        this.createForm = this.getEmptyCreateForm();
        this.displayCreateDialog = true;
    }

    onSchoolChange() {
        this.createForm.filiereId = undefined;
    }

    createGroupe() {
        if (!this.createForm.nom.trim() || !this.createForm.schoolId || !this.createForm.filiereId) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Nom, ecole et filiere sont obligatoires' });
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

    get groupes(): GroupeItem[] {
        const term = this.searchValue.trim().toLowerCase();
        if (!term) {
            return this.allGroupes;
        }

        return this.allGroupes.filter((groupe) => {
            return (
                groupe.nom.toLowerCase().includes(term) ||
                groupe.ecoleLabel.toLowerCase().includes(term) ||
                groupe.filiereLabel.toLowerCase().includes(term) ||
                (groupe.niveau || '').toLowerCase().includes(term)
            );
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

    private loadSchools() {
        this.schoolService.getAll().subscribe({
            next: (schools) => {
                this.schools = schools;
                this.schoolSelectOptions = schools
                    .filter((school) => school.id !== undefined)
                    .map((school) => ({ label: school.nom, value: school.id as number }));
                this.remapGroups();
            },
            error: () => {
                this.messageService.add({ severity: 'warn', summary: 'Avertissement', detail: 'Chargement des ecoles indisponible' });
            }
        });
    }

    private loadGroupes() {
        this.groupService.getAll().subscribe({
            next: (groupes) => {
                this.rawGroupes = groupes;
                this.remapGroups();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement des groupes impossible' });
            }
        });
    }

    private remapGroups() {
        this.allGroupes = this.rawGroupes.map((groupe) => {
            const filiereId = Number(groupe.filiere || 0);
            return {
                ...groupe,
                etudiants: groupe.effectif || 0,
                ecoleLabel: this.resolveSchoolLabel(groupe.schoolId),
                filiereLabel: this.resolveFiliereLabel(filiereId, groupe.schoolId)
            };
        });
    }

    private resolveSchoolLabel(schoolId?: number): string {
        if (!schoolId) {
            return '-';
        }

        const school = this.schools.find((item) => item.id === schoolId);
        return school?.nom || `Ecole #${schoolId}`;
    }

    private resolveFiliereLabel(filiereId: number, schoolId?: number): string {
        if (!filiereId) {
            return '-';
        }

        const schoolsToScan = schoolId ? this.schools.filter((item) => item.id === schoolId) : this.schools;
        for (const school of schoolsToScan) {
            const filiere = (school.filieres || []).find((item: SchoolFiliere) => item.id === filiereId);
            if (filiere) {
                return `${filiere.code} - ${filiere.nom}`;
            }
        }

        return `Filiere #${filiereId}`;
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
