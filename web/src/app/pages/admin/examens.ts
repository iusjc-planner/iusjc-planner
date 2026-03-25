import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-examens',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, InputTextModule, FormsModule],
    template: `
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Gestion des examens</h5>
                <button pButton type="button" label="Créer session d'examen" icon="pi pi-plus" class="p-button-rounded p-button-text"></button>
            </div>

            <div class="mb-4">
                <span class="p-input-icon-left w-full">
                    <i class="pi pi-search"></i>
                    <input pInputText type="text" [(ngModel)]="searchValue" placeholder="Rechercher..." class="w-full" />
                </span>
            </div>

            <p-table [value]="examens" [rows]="10" [paginator]="true" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="cours">Cours <p-sortIcon field="cours"></p-sortIcon></th>
                        <th pSortableColumn="date">Date <p-sortIcon field="date"></p-sortIcon></th>
                        <th pSortableColumn="heure">Heure <p-sortIcon field="heure"></p-sortIcon></th>
                        <th pSortableColumn="salle">Salle <p-sortIcon field="salle"></p-sortIcon></th>
                        <th pSortableColumn="etudiants">Étudiants <p-sortIcon field="etudiants"></p-sortIcon></th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-exam>
                    <tr>
                        <td>{{ exam.cours }}</td>
                        <td>{{ exam.date | date: 'dd/MM/yyyy' }}</td>
                        <td>{{ exam.heure }}</td>
                        <td>{{ exam.salle }}</td>
                        <td>{{ exam.etudiants }}</td>
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
export class ExamensPage {
    searchValue = '';
    examens = [
        { cours: 'Programmation C', date: new Date(2025, 4, 10), heure: '08:00', salle: 'B201', etudiants: 87 },
        { cours: 'Calcul Différentiel', date: new Date(2025, 4, 12), heure: '10:00', salle: 'B202', etudiants: 73 },
        { cours: 'Mécanique', date: new Date(2025, 4, 15), heure: '14:00', salle: 'B203', etudiants: 65 }
    ];
}
