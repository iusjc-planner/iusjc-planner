import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NotificationApiService } from '../../core/services/notification-api.service';
import { AppNotification } from '../../core/models/notification.model';

type EvenementItem = {
    id?: number;
    nom: string;
    type: string;
    date: Date;
    salle: string;
    participants: number;
};

@Component({
    selector: 'app-evenements',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, InputTextModule, FormsModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
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
                            <button pButton type="button" icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" (click)="deleteEvenement(event)"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class EvenementsPage {
    searchValue = '';
    private allEvenements: EvenementItem[] = [];

    constructor(
        private messageService: MessageService,
        private notificationApiService: NotificationApiService
    ) {}

    ngOnInit() {
        this.loadEvenements();
    }

    get evenements(): EvenementItem[] {
        const term = this.searchValue.trim().toLowerCase();
        if (!term) {
            return this.allEvenements;
        }

        return this.allEvenements.filter((event) => {
            return event.nom.toLowerCase().includes(term) || event.type.toLowerCase().includes(term);
        });
    }

    private loadEvenements() {
        this.notificationApiService.getAll().subscribe({
            next: (notifications) => {
                this.allEvenements = notifications.map((notification) => this.fromNotification(notification));
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement des evenements impossible' });
            }
        });
    }

    deleteEvenement(event: EvenementItem) {
        if (!event.id) {
            return;
        }

        this.notificationApiService.delete(event.id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Evenement supprime avec succes' });
                this.loadEvenements();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Echec de suppression de l evenement' });
            }
        });
    }

    private fromNotification(notification: AppNotification): EvenementItem {
        return {
            id: notification.id,
            nom: notification.titre,
            type: notification.type || 'Evenement',
            date: notification.dateCreation ? new Date(notification.dateCreation) : new Date(),
            salle: '-',
            participants: 0
        };
    }
}
