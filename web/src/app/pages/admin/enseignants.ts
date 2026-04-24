import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { forkJoin, catchError, of } from 'rxjs';
import { TeacherService } from '../../core/services/teacher.service';
import { UserService } from '../../core/services/user.service';
import { Teacher } from '../../core/models/teacher.model';
import { User } from '../../core/models/user.model';

interface EnseignantRow {
    id?: number;
    userId?: number;
    nom: string;
    prenom: string;
    email: string;
    specialities: string[];
    statut: string;
}

@Component({
    selector: 'app-enseignants',
    standalone: true,
    imports: [CommonModule, ButtonModule, DialogModule, TableModule, InputTextModule, FormsModule, ToastModule, SelectModule, TooltipModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Gestion des enseignants</h5>
                <button pButton type="button" label="Ajouter enseignant" icon="pi pi-plus" class="p-button-rounded p-button-text" (click)="openCreateDialog()"></button>
            </div>

            <div class="mb-4 relative">
                <i class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-color"></i>
                <input pInputText type="text" [(ngModel)]="searchValue" placeholder="   Rechercher par nom ou spécialité..." class="w-full pl-10" />
            </div>

            <p-table [value]="enseignants" [rows]="10" [paginator]="true" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="nom">Nom <p-sortIcon field="nom"></p-sortIcon></th>
                        <th pSortableColumn="prenom">Prénom <p-sortIcon field="prenom"></p-sortIcon></th>
                        <th pSortableColumn="email">Email <p-sortIcon field="email"></p-sortIcon></th>
                        <th>Spécialités</th>
                        <th pSortableColumn="statut">Statut <p-sortIcon field="statut"></p-sortIcon></th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-enseignant>
                    <tr>
                        <td>{{ enseignant.nom }}</td>
                        <td>{{ enseignant.prenom }}</td>
                        <td>{{ enseignant.email }}</td>
                        <td>
                            <span *ngFor="let s of enseignant.specialities" class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">{{ s }}</span>
                            <span *ngIf="!enseignant.specialities?.length" class="text-muted-color">-</span>
                        </td>
                        <td>
                            <span [ngClass]="enseignant.statut === 'ACTIVE' ? 'text-green-600' : 'text-red-600'">
                                {{ enseignant.statut === 'ACTIVE' ? 'Actif' : 'Inactif' }}
                            </span>
                        </td>
                        <td>
                            <button pButton type="button" icon="pi pi-pencil" class="p-button-rounded p-button-text mr-2" (click)="openEditDialog(enseignant)" pTooltip="Modifier" tooltipPosition="top"></button>
                            <button pButton type="button" icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" (click)="openDeleteDialog(enseignant)" pTooltip="Supprimer" tooltipPosition="top"></button>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="6" class="text-center text-muted-color py-4">Aucun enseignant trouvé</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Dialog Création / Modification -->
        <p-dialog
            [(visible)]="displayDialog"
            [header]="isEditMode ? 'Modifier enseignant' : 'Ajouter enseignant'"
            [modal]="true"
            [style]="{ width: '56vw', maxWidth: '900px' }"
            [contentStyle]="{ maxHeight: '76vh', overflow: 'auto' }"
            [breakpoints]="{ '1100px': '75vw', '640px': '96vw' }"
        >
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12">
                    <label class="block mb-2 font-medium">Utilisateur</label>
                    <p-select
                        [(ngModel)]="form.userId"
                        [options]="userSelectOptions"
                        optionLabel="label"
                        optionValue="value"
                        [filter]="true"
                        filterBy="label"
                        placeholder="Sélectionner un utilisateur"
                        appendTo="body"
                        class="w-full"
                        [disabled]="isEditMode"
                    />
                </div>
                <div class="col-span-12">
                    <label class="block mb-2 font-medium">Spécialités</label>
                    <div class="flex gap-2 mb-2">
                        <input pInputText type="text" [(ngModel)]="newSpeciality" placeholder="Ajouter une spécialité..." class="flex-1" (keyup.enter)="addSpeciality()" />
                        <button pButton type="button" icon="pi pi-plus" class="p-button-rounded p-button-text" (click)="addSpeciality()"></button>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <span *ngFor="let s of form.specialities; let i = index" class="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                            {{ s }}
                            <button type="button" class="ml-2 text-blue-600 hover:text-blue-900" (click)="removeSpeciality(i)">
                                <i class="pi pi-times text-xs"></i>
                            </button>
                        </span>
                        <span *ngIf="!form.specialities.length" class="text-muted-color text-sm">Aucune spécialité ajoutée</span>
                    </div>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button pButton type="button" label="Annuler" class="p-button-text" (click)="displayDialog = false"></button>
                <button pButton type="button" [label]="isEditMode ? 'Modifier' : 'Ajouter'" class="p-button-rounded p-button-text" (click)="saveEnseignant()"></button>
            </ng-template>
        </p-dialog>

        <!-- Dialog Suppression -->
        <p-dialog
            [(visible)]="displayDeleteDialog"
            header="Confirmer la suppression"
            [modal]="true"
            [style]="{ width: '40vw' }"
            [breakpoints]="{ '960px': '75vw', '640px': '90vw' }"
        >
            <p>Êtes-vous sûr de vouloir supprimer l'enseignant <strong>{{ selectedEnseignant?.nom }} {{ selectedEnseignant?.prenom }}</strong> ?</p>
            <ng-template pTemplate="footer">
                <button pButton type="button" label="Annuler" class="p-button-text" (click)="displayDeleteDialog = false"></button>
                <button pButton type="button" label="Supprimer" class="p-button-danger" (click)="deleteEnseignant()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class EnseignantsPage {
    searchValue = '';
    displayDialog = false;
    displayDeleteDialog = false;
    isEditMode = false;
    editingId?: number;
    newSpeciality = '';

    form: { userId?: number; specialities: string[] } = this.getEmptyForm();
    selectedEnseignant: EnseignantRow | null = null;

    userSelectOptions: Array<{ label: string; value: number }> = [];

    private allEnseignants: EnseignantRow[] = [];
    private users: User[] = [];
    private readonly destroyRef = inject(DestroyRef);

    constructor(
        private readonly messageService: MessageService,
        private readonly teacherService: TeacherService,
        private readonly userService: UserService
    ) {}

    ngOnInit() {
        this.loadData();
    }

    get enseignants(): EnseignantRow[] {
        const term = this.searchValue.trim().toLowerCase();
        if (!term) return this.allEnseignants;
        return this.allEnseignants.filter((e) =>
            `${e.nom} ${e.prenom}`.toLowerCase().includes(term) ||
            e.email.toLowerCase().includes(term) ||
            (e.specialities || []).some((s) => s.toLowerCase().includes(term))
        );
    }

    openCreateDialog() {
        this.isEditMode = false;
        this.editingId = undefined;
        this.form = this.getEmptyForm();
        this.newSpeciality = '';
        this.displayDialog = true;
    }

    openEditDialog(enseignant: EnseignantRow) {
        this.isEditMode = true;
        this.editingId = enseignant.id;
        this.form = { userId: enseignant.userId, specialities: [...(enseignant.specialities || [])] };
        this.newSpeciality = '';
        this.displayDialog = true;
    }

    openDeleteDialog(enseignant: EnseignantRow) {
        this.selectedEnseignant = enseignant;
        this.displayDeleteDialog = true;
    }

    addSpeciality() {
        const val = this.newSpeciality.trim();
        if (val && !this.form.specialities.includes(val)) {
            this.form.specialities.push(val);
        }
        this.newSpeciality = '';
    }

    removeSpeciality(index: number) {
        this.form.specialities.splice(index, 1);
    }

    saveEnseignant() {
        if (!this.form.userId) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Veuillez sélectionner un utilisateur' });
            return;
        }

        const payload: Teacher = { userId: this.form.userId, specialities: this.form.specialities };

        const request$ = this.isEditMode && this.editingId
            ? this.teacherService.update(this.editingId, payload)
            : this.teacherService.create(payload);

        request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: this.isEditMode ? 'Enseignant modifié avec succès' : 'Enseignant ajouté avec succès' });
                this.displayDialog = false;
                this.loadData();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: this.isEditMode ? 'Échec de la modification' : 'Échec de la création' });
            }
        });
    }

    deleteEnseignant() {
        if (!this.selectedEnseignant?.id) return;

        this.teacherService.delete(this.selectedEnseignant.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Enseignant supprimé avec succès' });
                this.displayDeleteDialog = false;
                this.loadData();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la suppression' });
            }
        });
    }

    private loadData() {
        forkJoin({
            teachers: this.teacherService.getAll().pipe(catchError(() => of([] as Teacher[]))),
            users: this.userService.getAll().pipe(catchError(() => of([] as User[])))
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: ({ teachers, users }) => {
                this.users = users;
                this.userSelectOptions = users
                    .filter((u) => u.id !== undefined)
                    .map((u) => ({ label: `${u.nom} ${u.prenom} (${u.email})`, value: u.id as number }));
                this.allEnseignants = teachers.map((t) => this.toRow(t));
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement des données impossible' });
            }
        });
    }

    private toRow(teacher: Teacher): EnseignantRow {
        const user = this.users.find((u) => u.id === teacher.userId);
        return {
            id: teacher.id,
            userId: teacher.userId,
            nom: user?.nom || teacher.nom || '-',
            prenom: user?.prenom || teacher.prenom || '-',
            email: user?.email || teacher.email || '-',
            specialities: teacher.specialities || [],
            statut: user?.status || user?.statut || 'ACTIVE'
        };
    }

    private getEmptyForm() {
        return { userId: undefined as number | undefined, specialities: [] as string[] };
    }
}
