import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ResourceService } from '../../core/services/resource.service';
import { Resource } from '../../core/models/resource.model';

type ResourceType = 'PROJECTEUR' | 'ORDINATEUR' | 'MATERIEL' | 'AUTRE';
type ResourceStatut = 'DISPONIBLE' | 'RESERVE' | 'MAINTENANCE';

interface ResourceForm {
    nom: string;
    type: ResourceType;
    quantite: number;
    localisation: string;
    statut: ResourceStatut;
}

@Component({
    selector: 'app-ressources',
    standalone: true,
    imports: [CommonModule, ButtonModule, DialogModule, TableModule, InputTextModule, InputNumberModule, FormsModule, ToastModule, SelectModule, TooltipModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Gestion des ressources</h5>
                <button pButton type="button" label="Ajouter ressource" icon="pi pi-plus" class="p-button-rounded p-button-text" (click)="openCreateDialog()"></button>
            </div>

            <div class="mb-4 relative">
                <i class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-color"></i>
                <input pInputText type="text" [(ngModel)]="searchValue" placeholder="   Rechercher par nom ou type..." class="w-full pl-10" />
            </div>

            <p-table [value]="ressources" [rows]="10" [paginator]="true" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="nom">Nom <p-sortIcon field="nom"></p-sortIcon></th>
                        <th pSortableColumn="type">Type <p-sortIcon field="type"></p-sortIcon></th>
                        <th pSortableColumn="quantite">Quantité <p-sortIcon field="quantite"></p-sortIcon></th>
                        <th pSortableColumn="localisation">Localisation <p-sortIcon field="localisation"></p-sortIcon></th>
                        <th pSortableColumn="statut">Statut <p-sortIcon field="statut"></p-sortIcon></th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-ressource>
                    <tr>
                        <td>{{ ressource.nom }}</td>
                        <td>{{ typeLabels[ressource.type] || ressource.type }}</td>
                        <td>{{ ressource.quantite }}</td>
                        <td>{{ ressource.localisation }}</td>
                        <td>
                            <span [ngClass]="getStatusClass(ressource.statut)">
                                {{ statutLabels[ressource.statut] || ressource.statut }}
                            </span>
                        </td>
                        <td>
                            <button pButton type="button" icon="pi pi-pencil" class="p-button-rounded p-button-text mr-2" (click)="openEditDialog(ressource)" pTooltip="Modifier" tooltipPosition="top"></button>
                            <button pButton type="button" icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" (click)="openDeleteDialog(ressource)" pTooltip="Supprimer" tooltipPosition="top"></button>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="6" class="text-center text-muted-color py-4">Aucune ressource trouvée</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Dialog Création / Modification -->
        <p-dialog
            [(visible)]="displayDialog"
            [header]="isEditMode ? 'Modifier ressource' : 'Ajouter ressource'"
            [modal]="true"
            [style]="{ width: '48vw', maxWidth: '700px' }"
            [contentStyle]="{ maxHeight: '76vh', overflow: 'auto' }"
            [breakpoints]="{ '960px': '75vw', '640px': '96vw' }"
        >
            <div class="grid grid-cols-12 gap-4 pt-2">
                <div class="col-span-12">
                    <label class="block mb-2 font-medium">Nom <span class="text-red-500">*</span></label>
                    <input pInputText type="text" [(ngModel)]="form.nom" placeholder="Nom de la ressource" class="w-full" />
                </div>
                <div class="col-span-6">
                    <label class="block mb-2 font-medium">Type <span class="text-red-500">*</span></label>
                    <p-select
                        [(ngModel)]="form.type"
                        [options]="typeOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Sélectionner un type"
                        appendTo="body"
                        class="w-full"
                    />
                </div>
                <div class="col-span-6">
                    <label class="block mb-2 font-medium">Quantité <span class="text-red-500">*</span></label>
                    <p-inputNumber [(ngModel)]="form.quantite" [min]="1" class="w-full" />
                </div>
                <div class="col-span-12">
                    <label class="block mb-2 font-medium">Localisation</label>
                    <input pInputText type="text" [(ngModel)]="form.localisation" placeholder="Salle, bâtiment..." class="w-full" />
                </div>
                <div class="col-span-12">
                    <label class="block mb-2 font-medium">Statut</label>
                    <p-select
                        [(ngModel)]="form.statut"
                        [options]="statutOptions"
                        optionLabel="label"
                        optionValue="value"
                        appendTo="body"
                        class="w-full"
                    />
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button pButton type="button" label="Annuler" class="p-button-text" (click)="displayDialog = false"></button>
                <button pButton type="button" [label]="isEditMode ? 'Modifier' : 'Ajouter'" class="p-button-rounded p-button-text" (click)="saveRessource()"></button>
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
            <p>Êtes-vous sûr de vouloir supprimer la ressource <strong>{{ selectedRessource?.nom }}</strong> ?</p>
            <ng-template pTemplate="footer">
                <button pButton type="button" label="Annuler" class="p-button-text" (click)="displayDeleteDialog = false"></button>
                <button pButton type="button" label="Supprimer" class="p-button-danger" (click)="deleteRessource()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class RessourcesPage {
    searchValue = '';
    displayDialog = false;
    displayDeleteDialog = false;
    isEditMode = false;
    editingId?: number;
    selectedRessource: Resource | null = null;

    form: ResourceForm = this.getEmptyForm();

    readonly typeOptions = [
        { label: 'Projecteur', value: 'PROJECTEUR' },
        { label: 'Ordinateur', value: 'ORDINATEUR' },
        { label: 'Matériel', value: 'MATERIEL' },
        { label: 'Autre', value: 'AUTRE' }
    ];

    readonly statutOptions = [
        { label: 'Disponible', value: 'DISPONIBLE' },
        { label: 'Réservé', value: 'RESERVE' },
        { label: 'Maintenance', value: 'MAINTENANCE' }
    ];

    readonly typeLabels: Record<string, string> = {
        PROJECTEUR: 'Projecteur',
        ORDINATEUR: 'Ordinateur',
        MATERIEL: 'Matériel',
        AUTRE: 'Autre'
    };

    readonly statutLabels: Record<string, string> = {
        DISPONIBLE: 'Disponible',
        RESERVE: 'Réservé',
        MAINTENANCE: 'Maintenance'
    };

    private allRessources: Resource[] = [];
    private readonly destroyRef = inject(DestroyRef);

    constructor(
        private readonly messageService: MessageService,
        private readonly resourceService: ResourceService
    ) {}

    ngOnInit() {
        this.loadRessources();
    }

    get ressources(): Resource[] {
        const term = this.searchValue.trim().toLowerCase();
        if (!term) return this.allRessources;
        return this.allRessources.filter(
            (r) => r.nom.toLowerCase().includes(term) || r.type.toLowerCase().includes(term) || (r.localisation || '').toLowerCase().includes(term)
        );
    }

    openCreateDialog() {
        this.isEditMode = false;
        this.editingId = undefined;
        this.form = this.getEmptyForm();
        this.displayDialog = true;
    }

    openEditDialog(ressource: Resource) {
        this.isEditMode = true;
        this.editingId = ressource.id;
        this.form = {
            nom: ressource.nom,
            type: ressource.type,
            quantite: ressource.quantite,
            localisation: ressource.localisation,
            statut: ressource.statut || 'DISPONIBLE'
        };
        this.displayDialog = true;
    }

    openDeleteDialog(ressource: Resource) {
        this.selectedRessource = ressource;
        this.displayDeleteDialog = true;
    }

    saveRessource() {
        if (!this.form.nom?.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Le nom est obligatoire' });
            return;
        }
        if (!this.form.quantite || this.form.quantite < 1) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'La quantité doit être supérieure à zéro' });
            return;
        }

        const payload = { nom: this.form.nom.trim(), type: this.form.type, quantite: this.form.quantite, localisation: this.form.localisation, statut: this.form.statut };

        const request$ = this.isEditMode && this.editingId
            ? this.resourceService.update(this.editingId, payload)
            : this.resourceService.create(payload);

        request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: this.isEditMode ? 'Ressource modifiée avec succès' : 'Ressource ajoutée avec succès' });
                this.displayDialog = false;
                this.loadRessources();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: this.isEditMode ? 'Échec de la modification' : 'Échec de la création' });
            }
        });
    }

    deleteRessource() {
        if (!this.selectedRessource?.id) return;

        this.resourceService.delete(this.selectedRessource.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Ressource supprimée avec succès' });
                this.displayDeleteDialog = false;
                this.loadRessources();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la suppression' });
            }
        });
    }

    getStatusClass(statut: string): string {
        const classes: Record<string, string> = {
            DISPONIBLE: 'bg-green-100 text-green-800 px-2 py-1 rounded text-sm',
            RESERVE: 'bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm',
            MAINTENANCE: 'bg-red-100 text-red-800 px-2 py-1 rounded text-sm'
        };
        return classes[statut] || 'px-2 py-1 rounded text-sm';
    }

    private loadRessources() {
        this.resourceService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (resources) => {
                this.allRessources = resources;
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement des ressources impossible' });
            }
        });
    }

    private getEmptyForm(): ResourceForm {
        return { nom: '', type: 'AUTRE', quantite: 1, localisation: '', statut: 'DISPONIBLE' };
    }
}
