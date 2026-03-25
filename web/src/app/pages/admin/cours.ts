import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-cours',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, InputTextModule, FormsModule],
    template: `
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Gestion des cours</h5>
                <button pButton type="button" label="Créer cours" icon="pi pi-plus" class="p-button-rounded p-button-text"></button>
            </div>

            <div class="mb-4">
                <span class="p-input-icon-left w-full">
                    <i class="pi pi-search"></i>
                    <input pInputText type="text" [(ngModel)]="searchValue" placeholder="Rechercher..." class="w-full" />
                </span>
            </div>

            <p-table [value]="cours" [rows]="10" [paginator]="true" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="code">Code <p-sortIcon field="code"></p-sortIcon></th>
                        <th pSortableColumn="nom">Nom <p-sortIcon field="nom"></p-sortIcon></th>
                        <th pSortableColumn="enseignant">Enseignant <p-sortIcon field="enseignant"></p-sortIcon></th>
                        <th pSortableColumn="type">Type <p-sortIcon field="type"></p-sortIcon></th>
                        <th pSortableColumn="groupe">Groupe <p-sortIcon field="groupe"></p-sortIcon></th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-course>
                    <tr>
                        <td>{{ course.code }}</td>
                        <td>{{ course.nom }}</td>
                        <td>{{ course.enseignant }}</td>
                        <td>
                            <span [ngClass]="getCourseTypeClass(course.type)">
                                {{ course.type }}
                            </span>
                        </td>
                        <td>{{ course.groupe }}</td>
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
export class CoursPage {
    searchValue = '';
    cours = [
        { code: 'INF101', nom: 'Programmation C', enseignant: 'Dr. Dupont', type: 'CM', groupe: 'L1-INFO-A' },
        { code: 'INF102', nom: 'Algorithmique', enseignant: 'Dr. Dupont', type: 'TD', groupe: 'L1-INFO-A' },
        { code: 'MATH101', nom: 'Calcul Différentiel', enseignant: 'Pr. Martin', type: 'CM', groupe: 'L1-MATH-A' },
        { code: 'PHYS101', nom: 'Mécanique', enseignant: 'Dr. Lefevre', type: 'TP', groupe: 'L1-PHYS-A' },
        { code: 'CHEM101', nom: 'Chimie Générale', enseignant: 'Mme. Rousseau', type: 'CM', groupe: 'L1-CHEM-A' }
    ];

    getCourseTypeClass(type: string): string {
        const classes: { [key: string]: string } = {
            'CM': 'bg-blue-100 text-blue-800 px-2 py-1 rounded',
            'TD': 'bg-green-100 text-green-800 px-2 py-1 rounded',
            'TP': 'bg-orange-100 text-orange-800 px-2 py-1 rounded'
        };
        return classes[type] || '';
    }
}
