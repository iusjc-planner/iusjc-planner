import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-salles',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, InputTextModule, FormsModule],
    template: `
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Gestion des salles</h5>
                <button pButton type="button" label="Ajouter salle" icon="pi pi-plus" class="p-button-rounded p-button-text"></button>
            </div>

            <div class="mb-4">
                <span class="p-input-icon-left w-full">
                    <i class="pi pi-search"></i>
                    <input pInputText type="text" [(ngModel)]="searchValue" placeholder="Rechercher..." class="w-full" />
                </span>
            </div>

            <p-table [value]="salles" [rows]="10" [paginator]="true" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="numero">Numéro <p-sortIcon field="numero"></p-sortIcon></th>
                        <th pSortableColumn="type">Type <p-sortIcon field="type"></p-sortIcon></th>
                        <th pSortableColumn="capacite">Capacité <p-sortIcon field="capacite"></p-sortIcon></th>
                        <th pSortableColumn="localisation">Localisation <p-sortIcon field="localisation"></p-sortIcon></th>
                        <th pSortableColumn="statut">Statut <p-sortIcon field="statut"></p-sortIcon></th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-salle>
                    <tr>
                        <td>{{ salle.numero }}</td>
                        <td>{{ salle.type }}</td>
                        <td>{{ salle.capacite }}</td>
                        <td>{{ salle.localisation }}</td>
                        <td>
                            <span [ngClass]="getStatusClass(salle.statut)">
                                {{ salle.statut }}
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
export class SallesPage {
    searchValue = '';
    salles = [
        { numero: 'A101', type: 'Salle de cours', capacite: 50, localisation: 'Bâtiment A', statut: 'Disponible' },
        { numero: 'A102', type: 'Salle de cours', capacite: 45, localisation: 'Bâtiment A', statut: 'Disponible' },
        { numero: 'B201', type: 'Amphithéâtre', capacite: 200, localisation: 'Bâtiment B', statut: 'Disponible' },
        { numero: 'C301', type: 'Laboratoire', capacite: 30, localisation: 'Bâtiment C', statut: 'Maintenance' },
        { numero: 'D401', type: 'Salle de réunion', capacite: 20, localisation: 'Bâtiment D', statut: 'Disponible' }
    ];

    getStatusClass(statut: string): string {
        const classes: { [key: string]: string } = {
            'Disponible': 'bg-green-100 text-green-800 px-2 py-1 rounded',
            'Occupée': 'bg-orange-100 text-orange-800 px-2 py-1 rounded',
            'Maintenance': 'bg-red-100 text-red-800 px-2 py-1 rounded'
        };
        return classes[statut] || '';
    }
}
