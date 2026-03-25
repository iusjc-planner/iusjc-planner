import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-groupes',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, InputTextModule, FormsModule],
    template: `
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Gestion des groupes d'étudiants</h5>
                <button pButton type="button" label="Créer groupe" icon="pi pi-plus" class="p-button-rounded p-button-text"></button>
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
                            <button pButton type="button" icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class GroupesPage {
    searchValue = '';
    groupes = [
        { nom: 'L1-INFO-A', filiere: 'Informatique', niveau: 'Licence 1', etudiants: 45 },
        { nom: 'L1-INFO-B', filiere: 'Informatique', niveau: 'Licence 1', etudiants: 42 },
        { nom: 'L2-MATH-A', filiere: 'Mathématiques', niveau: 'Licence 2', etudiants: 38 },
        { nom: 'L3-PHYS-A', filiere: 'Physique', niveau: 'Licence 3', etudiants: 35 },
        { nom: 'M1-INFO-A', filiere: 'Informatique', niveau: 'Master 1', etudiants: 28 }
    ];
}
