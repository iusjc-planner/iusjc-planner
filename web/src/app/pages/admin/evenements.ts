import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-evenements',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, InputTextModule, FormsModule],
    template: `
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Gestion des événements académiques</h5>
                <button pButton type="button" label="Créer événement" icon="pi pi-plus" class="p-button-rounded p-button-text"></button>
            </div>

            <div class="mb-4">
                <span class="p-input-icon-left w-full">
                    <i class="pi pi-search"></i>
                    <input pInputText type="text" [(ngModel)]="searchValue" placeholder="Rechercher..." class="w-full" />
                </span>
            </div>

            <p-table [value]="evenements" [rows]="10" [paginator]="true" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="nom">Nom <p-sortIcon field="nom"></p-sortIcon></th>
                        <th pSortableColumn="type">Type <p-sortIcon field="type"></p-sortIcon></th>
                        <th pSortableColumn="date">Date <p-sortIcon field="date"></p-sortIcon></th>
                        <th pSortableColumn="salle">Salle <p-sortIcon field="salle"></p-sortIcon></th>
                        <th pSortableColumn="participants">Participants <p-sortIcon field="participants"></p-sortIcon></th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-event>
                    <tr>
                        <td>{{ event.nom }}</td>
                        <td>{{ event.type }}</td>
                        <td>{{ event.date | date: 'dd/MM/yyyy' }}</td>
                        <td>{{ event.salle }}</td>
                        <td>{{ event.participants }}</td>
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
export class EvenementsPage {
    searchValue = '';
    evenements = [
        { nom: 'Séminaire IA', type: 'Séminaire', date: new Date(2025, 2, 15), salle: 'B201', participants: 150 },
        { nom: 'Conférence Cybersécurité', type: 'Conférence', date: new Date(2025, 2, 20), salle: 'B201', participants: 200 },
        { nom: 'Compétition Programmation', type: 'Compétition', date: new Date(2025, 3, 5), salle: 'C301', participants: 80 }
    ];
}
