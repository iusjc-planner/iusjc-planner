import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-ressources',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, InputTextModule, FormsModule],
    template: `
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Gestion des ressources</h5>
                <button pButton type="button" label="Ajouter ressource" icon="pi pi-plus" class="p-button-rounded p-button-text"></button>
            </div>

            <div class="mb-4">
                <span class="p-input-icon-left w-full">
                    <i class="pi pi-search"></i>
                    <input pInputText type="text" [(ngModel)]="searchValue" placeholder="Rechercher..." class="w-full" />
                </span>
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
                        <td>{{ ressource.type }}</td>
                        <td>{{ ressource.quantite }}</td>
                        <td>{{ ressource.localisation }}</td>
                        <td>
                            <span [ngClass]="getStatusClass(ressource.statut)">
                                {{ ressource.statut }}
                            </span>
                        </td>
                        <td>
                            <button pButton type="button" icon="pi pi-pencil" class="p-button-rounded p-button-text mr-2"></button>
                            <button pButton type="button" icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class RessourcesPage {
    searchValue = '';
    ressources = [
        { nom: 'Projecteur', type: 'Équipement', quantite: 12, localisation: 'Bâtiment A', statut: 'Disponible' },
        { nom: 'Ordinateur portable', type: 'Informatique', quantite: 25, localisation: 'Bâtiment C', statut: 'Disponible' },
        { nom: 'Tableau interactif', type: 'Équipement', quantite: 8, localisation: 'Bâtiment B', statut: 'Disponible' },
        { nom: 'Microscope', type: 'Laboratoire', quantite: 15, localisation: 'Bâtiment C', statut: 'Maintenance' },
        { nom: 'Baffle audio', type: 'Équipement', quantite: 6, localisation: 'Bâtiment D', statut: 'Disponible' }
    ];

    getStatusClass(statut: string): string {
        const classes: { [key: string]: string } = {
            'Disponible': 'bg-green-100 text-green-800 px-2 py-1 rounded',
            'Réservée': 'bg-orange-100 text-orange-800 px-2 py-1 rounded',
            'Maintenance': 'bg-red-100 text-red-800 px-2 py-1 rounded'
        };
        return classes[statut] || '';
    }
}
