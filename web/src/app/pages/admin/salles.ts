import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RoomService } from '../../core/services/room.service';
import { Room } from '../../core/models/room.model';

type Salle = Room & {
    numero: string;
    localisation: string;
    statut: string;
};

@Component({
    selector: 'app-salles',
    standalone: true,
    imports: [CommonModule, ButtonModule, DialogModule, TableModule, InputTextModule, FormsModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Gestion des salles</h5>
                <button pButton type="button" label="Ajouter salle" icon="pi pi-plus" class="p-button-rounded p-button-text" (click)="openCreateDialog()"></button>
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
                            <button pButton type="button" icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" (click)="deleteSalle(salle)"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="displayCreateDialog" header="Ajouter une salle" [modal]="true" [style]="{ width: '40vw' }" [breakpoints]="{ '960px': '75vw', '640px': '90vw' }">
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Numero</label>
                    <input pInputText type="text" [(ngModel)]="createForm.numero" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-8">
                    <label class="block mb-2 font-medium">Localisation</label>
                    <input pInputText type="text" [(ngModel)]="createForm.localisation" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Capacite</label>
                    <input pInputText type="number" [(ngModel)]="createForm.capacite" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-4">
                    <label class="block mb-2 font-medium">Type</label>
                    <select [(ngModel)]="createForm.type" class="w-full px-3 py-2 border rounded">
                        <option value="CLASSROOM">CLASSROOM</option>
                        <option value="LAB">LAB</option>
                        <option value="AUDITORIUM">AUDITORIUM</option>
                    </select>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button pButton type="button" label="Annuler" class="p-button-text" (click)="displayCreateDialog = false"></button>
                <button pButton type="button" label="Creer" class="p-button-rounded p-button-text" (click)="createSalle()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class SallesPage {
    searchValue = '';
    displayCreateDialog = false;
    createForm: {
        numero: string;
        localisation: string;
        capacite?: number;
        type: 'CLASSROOM' | 'LAB' | 'AUDITORIUM';
    } = this.getEmptyCreateForm();

    private allSalles: Salle[] = [];
    private readonly destroyRef = inject(DestroyRef);

    constructor(
        private messageService: MessageService,
        private roomService: RoomService
    ) {}

    ngOnInit() {
        this.loadRooms();
    }

    openCreateDialog() {
        this.createForm = this.getEmptyCreateForm();
        this.displayCreateDialog = true;
    }

    createSalle() {
        if (!this.createForm.numero.trim() || !this.createForm.capacite || this.createForm.capacite < 1) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Numero et capacite valides sont obligatoires' });
            return;
        }

        const payload: Room = {
            code: this.createForm.numero.trim(),
            nom: this.createForm.localisation.trim() || this.createForm.numero.trim(),
            capacite: this.createForm.capacite,
            type: this.createForm.type,
            statut: 'ACTIVE'
        };

        this.roomService.create(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Salle creee avec succes' });
                this.displayCreateDialog = false;
                this.loadRooms();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Echec de creation de la salle' });
            }
        });
    }

    get salles(): Salle[] {
        const term = this.searchValue.trim().toLowerCase();
        if (!term) {
            return this.allSalles;
        }

        return this.allSalles.filter((salle) => {
            return (
                salle.numero.toLowerCase().includes(term) ||
                (salle.nom || '').toLowerCase().includes(term) ||
                (salle.localisation || '').toLowerCase().includes(term)
            );
        });
    }

    private loadRooms() {
        this.roomService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (rooms) => {
                this.allSalles = rooms.map((room) => this.fromApiRoom(room));
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement des salles impossible' });
            }
        });
    }

    deleteSalle(salle: Salle) {
        if (!salle.id) {
            return;
        }

        this.roomService.delete(salle.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Salle supprimee avec succes' });
                this.loadRooms();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Echec de suppression de la salle' });
            }
        });
    }

    getStatusClass(statut: string): string {
        const classes: { [key: string]: string } = {
            ACTIVE: 'bg-green-100 text-green-800 px-2 py-1 rounded',
            MAINTENANCE: 'bg-red-100 text-red-800 px-2 py-1 rounded'
        };
        return classes[statut] || '';
    }

    private fromApiRoom(room: Room): Salle {
        return {
            id: room.id,
            code: room.code,
            nom: room.nom,
            capacite: room.capacite,
            type: room.type,
            statut: room.statut || 'Disponible',
            numero: room.code,
            localisation: room.nom
        };
    }

    private getEmptyCreateForm() {
        return {
            numero: '',
            localisation: '',
            capacite: undefined,
            type: 'CLASSROOM' as const
        };
    }
}
