import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RoomService } from '../../core/services/room.service';
import { Room } from '../../core/models/room.model';

type RessourceItem = {
    id?: number;
    nom: string;
    type: string;
    quantite: number;
    localisation: string;
    statut: string;
};

@Component({
    selector: 'app-ressources',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, InputTextModule, FormsModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
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
                            <button pButton type="button" icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" (click)="deleteRessource(ressource)"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class RessourcesPage {
    searchValue = '';
    private allRessources: RessourceItem[] = [];

    constructor(
        private messageService: MessageService,
        private roomService: RoomService
    ) {}

    ngOnInit() {
        this.loadRessources();
    }

    get ressources(): RessourceItem[] {
        const term = this.searchValue.trim().toLowerCase();
        if (!term) {
            return this.allRessources;
        }

        return this.allRessources.filter((resource) => {
            return resource.nom.toLowerCase().includes(term) || resource.type.toLowerCase().includes(term);
        });
    }

    private loadRessources() {
        this.roomService.getAll().subscribe({
            next: (rooms) => {
                this.allRessources = rooms.map((room) => this.fromRoom(room));
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement des ressources impossible' });
            }
        });
    }

    deleteRessource(resource: RessourceItem) {
        if (!resource.id) {
            return;
        }

        this.roomService.delete(resource.id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Ressource supprimee avec succes' });
                this.loadRessources();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Echec de suppression de la ressource' });
            }
        });
    }

    getStatusClass(statut: string): string {
        const classes: { [key: string]: string } = {
            'Disponible': 'bg-green-100 text-green-800 px-2 py-1 rounded',
            'Réservée': 'bg-orange-100 text-orange-800 px-2 py-1 rounded',
            'Maintenance': 'bg-red-100 text-red-800 px-2 py-1 rounded'
        };
        return classes[statut] || '';
    }

    private fromRoom(room: Room): RessourceItem {
        return {
            id: room.id,
            nom: room.nom,
            type: room.type || 'Ressource',
            quantite: room.capacite,
            localisation: room.code,
            statut: room.statut || 'Disponible'
        };
    }
}
