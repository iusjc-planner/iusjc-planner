import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-emploi-du-temps',
    standalone: true,
    imports: [CommonModule, ButtonModule, InputTextModule, FormsModule],
    template: `
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Gestion des emplois du temps</h5>
                <button pButton type="button" label="Créer cours" icon="pi pi-plus" class="p-button-rounded p-button-text"></button>
            </div>

            <div class="grid grid-cols-12 gap-4 mb-6">
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Sélectionner une date</label>
                    <input type="date" [(ngModel)]="selectedDate" class="w-full px-3 py-2 border rounded" />
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Filtrer par enseignant</label>
                    <select [(ngModel)]="selectedEnseignant" class="w-full px-3 py-2 border rounded">
                        <option value="">Tous les enseignants</option>
                        <option *ngFor="let ens of enseignants" [value]="ens.value">{{ ens.label }}</option>
                    </select>
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Filtrer par salle</label>
                    <select [(ngModel)]="selectedSalle" class="w-full px-3 py-2 border rounded">
                        <option value="">Toutes les salles</option>
                        <option *ngFor="let salle of salles" [value]="salle.value">{{ salle.label }}</option>
                    </select>
                </div>
            </div>

            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                <p class="text-sm text-muted-color">
                    <i class="pi pi-info-circle mr-2"></i>
                    Vue calendrier en développement. Utilisez les filtres pour consulter les emplois du temps.
                </p>
            </div>

            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-6">
                    <div class="card bg-surface-50 dark:bg-surface-800">
                        <h6 class="font-bold mb-3">Cours du jour</h6>
                        <div class="space-y-2">
                            <div class="p-3 bg-white dark:bg-surface-700 rounded border-l-4 border-blue-500">
                                <p class="font-medium">Programmation C</p>
                                <p class="text-sm text-muted-color">08:00 - 10:00 | Salle A101</p>
                            </div>
                            <div class="p-3 bg-white dark:bg-surface-700 rounded border-l-4 border-green-500">
                                <p class="font-medium">Algorithmique</p>
                                <p class="text-sm text-muted-color">10:30 - 12:30 | Salle A102</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-span-12 md:col-span-6">
                    <div class="card bg-surface-50 dark:bg-surface-800">
                        <h6 class="font-bold mb-3">Statistiques</h6>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span>Cours planifiés:</span>
                                <span class="font-bold">156</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Salles occupées:</span>
                                <span class="font-bold">15/18</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Conflits détectés:</span>
                                <span class="font-bold text-red-600">2</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class EmploiDuTempsPage {
    selectedDate: Date | null = null;
    selectedEnseignant: string | null = null;
    selectedSalle: string | null = null;

    enseignants = [
        { label: 'Dr. Dupont', value: 'dupont' },
        { label: 'Pr. Martin', value: 'martin' },
        { label: 'Dr. Lefevre', value: 'lefevre' }
    ];

    salles = [
        { label: 'Salle A101', value: 'a101' },
        { label: 'Salle A102', value: 'a102' },
        { label: 'Amphithéâtre B201', value: 'b201' }
    ];
}
