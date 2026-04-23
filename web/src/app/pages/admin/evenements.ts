import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';

import { EventService } from '../../core/services/event.service';
import { RoomService } from '../../core/services/room.service';
import { Event, EventType, EventStatus } from '../../core/models/event.model';
import { Room } from '../../core/models/room.model';

@Component({
    selector: 'app-evenements',
    standalone: true,
    imports: [
        CommonModule, 
        ButtonModule, 
        TableModule, 
        InputTextModule, 
        FormsModule, 
        ReactiveFormsModule,
        ToastModule,
        DialogModule,
        SelectModule
    ],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Gestion des événements académiques</h5>
                <button pButton type="button" label="Créer événement" icon="pi pi-plus" class="p-button-rounded " (click)="openNew()"></button>
            </div>

            <div class="mb-4">
                <span class="p-input-icon-left w-full">
                    <i class="pi pi-search"></i>
                    <input pInputText type="text" [(ngModel)]="searchValue" placeholder="Rechercher par nom..." class="w-full" />
                </span>
            </div>

            <p-table [value]="filteredEvents" [rows]="10" [paginator]="true" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="nom">Nom <p-sortIcon field="nom"></p-sortIcon></th>
                        <th pSortableColumn="type">Type <p-sortIcon field="type"></p-sortIcon></th>
                        <th pSortableColumn="date">Date <p-sortIcon field="date"></p-sortIcon></th>
                        <th pSortableColumn="heureDebut">Heure <p-sortIcon field="heureDebut"></p-sortIcon></th>
                        <th pSortableColumn="salleId">Salle (ID) <p-sortIcon field="salleId"></p-sortIcon></th>
                        <th pSortableColumn="status">Status <p-sortIcon field="status"></p-sortIcon></th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-event>
                    <tr>
                        <td>{{ event.nom }}</td>
                        <td>{{ event.type }}</td>
                        <td>{{ event.date | date: 'dd/MM/yyyy' }}</td>
                        <td>{{ event.heureDebut }}</td>
                        <td>{{ getRoomName(event.salleId) }}</td>
                        <td>
                            <span [class]="'px-2 py-1 rounded text-sm font-semibold ' + getStatusClass(event.status)">
                                {{ event.status }}
                            </span>
                        </td>
                        <td>
                            <button pButton type="button" icon="pi pi-pencil" class="p-button-rounded p-button-text mr-2" (click)="editEvent(event)"></button>
                            <button pButton type="button" icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" (click)="deleteEvenement(event)"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="eventDialog" [style]="{width: '500px'}" header="Détails de l'événement" [modal]="true" class="p-fluid">
            <ng-template pTemplate="content">
                <form [formGroup]="eventForm">
                    <div class="field mb-3">
                        <label for="nom">Nom</label>
                        <input type="text" pInputText id="nom" formControlName="nom" required autofocus />
                    </div>

                    <div class="field mb-3">
                        <label for="description">Description</label>
                        <textarea pInputText id="description" formControlName="description" rows="3"></textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mb-3">
                        <div class="field">
                            <label for="type">Type</label>
                            <p-select id="type" [options]="eventTypes" formControlName="type" placeholder="Sélectionner le type" appendTo="body"></p-select>
                        </div>
                        <div class="field">
                            <label for="status">Statut</label>
                            <p-select id="status" [options]="eventStatuses" formControlName="status" placeholder="Sélectionner le statut" appendTo="body"></p-select>
                        </div>
                    </div>

                    <div class="grid grid-cols-3 gap-4 mb-3">
                        <div class="field">
                            <label for="date">Date</label>
                            <input type="date" pInputText id="date" formControlName="date" required />
                        </div>
                        <div class="field">
                            <label for="heureDebut">Heure (HH:mm)</label>
                            <input type="time" pInputText id="heureDebut" formControlName="heureDebut" required />
                        </div>
                        <div class="field">
                            <label for="duree">Durée (min)</label>
                            <input type="number" pInputText id="duree" formControlName="duree" required min="15" max="1440" />
                        </div>
                    </div>

                    <div class="field mb-3">
                        <label for="salleId">Salle</label>
                        <p-select id="salleId" [options]="rooms" formControlName="salleId" optionLabel="nom" optionValue="id" 
                            [filter]="true" filterBy="nom" [showClear]="true" placeholder="Sélectionner une salle (Recherche par nom)" appendTo="body">
                        </p-select>
                    </div>
                </form>
            </ng-template>

            <ng-template pTemplate="footer">
                <button pButton pRipple label="Annuler" icon="pi pi-times" class="p-button-text" (click)="hideDialog()"></button>
                <button pButton pRipple label="Sauvegarder" icon="pi pi-check" class="p-button-text" (click)="saveEvent()" [disabled]="eventForm.invalid"></button>
            </ng-template>
        </p-dialog>
    `
})
export class EvenementsPage implements OnInit {
    searchValue = '';
    
    allEvents: Event[] = [];
    rooms: Room[] = [];
    
    eventDialog = false;
    eventForm!: FormGroup;
    
    eventTypes = Object.keys(EventType).map(key => ({ label: key, value: key }));
    eventStatuses = Object.keys(EventStatus).map(key => ({ label: key, value: key }));

    // Temporarily mock an organizer ID till Auth is fully integrated
    private readonly currentUserId = 1;
    private readonly destroyRef = inject(DestroyRef);

    constructor(
        private fb: FormBuilder,
        private eventService: EventService,
        private roomService: RoomService,
        private messageService: MessageService
    ) {
        this.initForm();
    }

    ngOnInit() {
        this.loadRooms();
        this.loadEvenements();
    }

    private initForm() {
        this.eventForm = this.fb.group({
            id: [null],
            nom: ['', [Validators.required, Validators.maxLength(255)]],
            description: ['', [Validators.maxLength(1000)]],
            type: [EventType.EXAMEN, Validators.required],
            date: ['', Validators.required],
            heureDebut: ['', Validators.required],
            duree: [60, [Validators.required, Validators.min(15), Validators.max(1440)]],
            salleId: [null],
            organisateurId: [this.currentUserId, Validators.required],
            status: [EventStatus.PLANIFIE, Validators.required],
            participantIds: [[]]
        });
    }

    get filteredEvents(): Event[] {
        const term = this.searchValue.trim().toLowerCase();
        if (!term) return this.allEvents;

        return this.allEvents.filter((event) => 
            event.nom.toLowerCase().includes(term) || event.type.toLowerCase().includes(term)
        );
    }

    private loadEvenements() {
        this.eventService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (data) => this.allEvents = data,
            error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement des événements impossible' })
        });
    }

    private loadRooms() {
        this.roomService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (data) => this.rooms = data,
            error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement des salles impossible' })
        });
    }

    getRoomName(roomId?: number): string {
        if (!roomId) return '-';
        const room = this.rooms.find(r => r.id === roomId);
        return room ? room.nom : `Salle #${roomId}`;
    }

    getStatusClass(status: string): string {
        switch (status) {
            case EventStatus.PLANIFIE: return 'bg-blue-100 text-blue-800';
            case EventStatus.CONFIRME: return 'bg-green-100 text-green-800';
            case EventStatus.ANNULE: return 'bg-red-100 text-red-800';
            case EventStatus.TERMINE: return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    openNew() {
        this.eventForm.reset({
            type: EventType.EXAMEN,
            status: EventStatus.PLANIFIE,
            duree: 60,
            organisateurId: this.currentUserId,
            participantIds: []
        });
        this.eventDialog = true;
    }

    editEvent(event: Event) {
        // Format date and time properly for the inputs if needed
        let formattedDate = event.date;
        let formattedTime = event.heureDebut;
        if (formattedTime && formattedTime.length > 5) {
             formattedTime = formattedTime.substring(0, 5);
        }

        this.eventForm.patchValue({
            ...event,
            date: formattedDate,
            heureDebut: formattedTime
        });
        this.eventDialog = true;
    }

    hideDialog() {
        this.eventDialog = false;
    }

    saveEvent() {
        if (this.eventForm.invalid) return;

        const payload: Event = this.eventForm.value;
        // Make sure seconds are formatted correctly if backend expects them
        if (payload.heureDebut && payload.heureDebut.length === 5) {
            payload.heureDebut = payload.heureDebut + ':00';
        }

        if (payload.id) {
            this.eventService.update(payload.id, payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Événement mis à jour' });
                    this.loadEvenements();
                    this.hideDialog();
                },
                error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la mise à jour' })
            });
        } else {
            this.eventService.create(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Événement créé' });
                    this.loadEvenements();
                    this.hideDialog();
                },
                error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la création' })
            });
        }
    }

    deleteEvenement(event: Event) {
        if (!event.id) return;
        
        if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
            this.eventService.delete(event.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Événement supprimé' });
                    this.loadEvenements();
                },
                error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de suppression' })
            });
        }
    }
}
