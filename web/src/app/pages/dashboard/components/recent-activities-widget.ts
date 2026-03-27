import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

@Component({
    standalone: true,
    selector: 'app-recent-activities-widget',
    imports: [CommonModule, TableModule],
    template: `<div class="card">
        <h5 class="text-xl font-bold mb-4">Activités récentes</h5>
        <p-table [value]="activities" [rows]="5" [paginator]="true" responsiveLayout="scroll">
            <ng-template pTemplate="header">
                <tr>
                    <th pSortableColumn="type">Type <p-sortIcon field="type"></p-sortIcon></th>
                    <th pSortableColumn="description">Description <p-sortIcon field="description"></p-sortIcon></th>
                    <th pSortableColumn="date">Date <p-sortIcon field="date"></p-sortIcon></th>
                    <th>Utilisateur</th>
                </tr>
            </ng-template>
            <ng-template pTemplate="body" let-activity>
                <tr>
                    <td>
                        <span class="inline-flex items-center gap-2">
                            <i [ngClass]="getActivityIcon(activity.type)" class="text-lg"></i>
                            {{ activity.type }}
                        </span>
                    </td>
                    <td>{{ activity.description }}</td>
                    <td>{{ activity.date | date: 'dd/MM/yyyy HH:mm' }}</td>
                    <td>{{ activity.user }}</td>
                </tr>
            </ng-template>
        </p-table>
    </div>`
})
export class RecentActivitiesWidget {
    activities = [
        {
            type: 'Création',
            description: 'Nouveau cours créé: Mathématiques L1',
            date: new Date(2025, 1, 5, 14, 30),
            user: 'Admin'
        },
        {
            type: 'Modification',
            description: 'Emploi du temps modifié pour M. Dupont',
            date: new Date(2025, 1, 5, 13, 15),
            user: 'Admin'
        },
        {
            type: 'Réservation',
            description: 'Salle A101 réservée pour TP Informatique',
            date: new Date(2025, 1, 5, 11, 45),
            user: 'Enseignant'
        },
        {
            type: 'Alerte',
            description: 'Conflit d\'horaire détecté',
            date: new Date(2025, 1, 5, 10, 20),
            user: 'Système'
        },
        {
            type: 'Suppression',
            description: 'Cours annulé: Physique L2',
            date: new Date(2025, 1, 4, 16, 0),
            user: 'Admin'
        }
    ];

    getActivityIcon(type: string): string {
        const icons: { [key: string]: string } = {
            'Création': 'pi pi-plus-circle text-green-500',
            'Modification': 'pi pi-pencil text-blue-500',
            'Réservation': 'pi pi-calendar text-orange-500',
            'Alerte': 'pi pi-exclamation-circle text-red-500',
            'Suppression': 'pi pi-trash text-red-600'
        };
        return icons[type] || 'pi pi-circle';
    }
}
