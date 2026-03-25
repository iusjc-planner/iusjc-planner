import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

interface Utilisateur {
    id?: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    login: string;
    role: string;
    statut: string;
}

@Component({
    selector: 'app-utilisateurs',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, InputTextModule, FormsModule, DialogModule, ToastModule, TooltipModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-2xl font-bold">Gestion des utilisateurs</h5>
                <button pButton type="button" label="Créer utilisateur" icon="pi pi-plus" class="p-button-rounded p-button-text" (click)="openCreateDialog()"></button>
            </div>

            <div class="mb-4 relative">
                <i class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-color"></i>
                <input pInputText type="text" [(ngModel)]="searchValue" placeholder="   Rechercher..." class="w-full pl-10" />
            </div>

            <p-table [value]="utilisateurs" [rows]="10" [paginator]="true" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="nom">Nom <p-sortIcon field="nom"></p-sortIcon></th>
                        <th pSortableColumn="email">Email <p-sortIcon field="email"></p-sortIcon></th>
                        <th pSortableColumn="role">Rôle <p-sortIcon field="role"></p-sortIcon></th>
                        <th pSortableColumn="statut">Statut <p-sortIcon field="statut"></p-sortIcon></th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-utilisateur>
                    <tr>
                        <td>{{ utilisateur.nom }} {{ utilisateur.prenom }}</td>
                        <td>{{ utilisateur.email }}</td>
                        <td>
                            <span [ngClass]="getRoleClass(utilisateur.role)">
                                {{ utilisateur.role }}
                            </span>
                        </td>
                        <td>
                            <span [ngClass]="utilisateur.statut === 'Actif' ? 'text-green-600' : 'text-red-600'">
                                {{ utilisateur.statut }}
                            </span>
                        </td>
                        <td>
                            <button pButton type="button" icon="pi pi-eye" class="p-button-rounded p-button-text mr-2" (click)="openViewDialog(utilisateur)" pTooltip="Voir" tooltipPosition="top"></button>
                            <button pButton type="button" icon="pi pi-pencil" class="p-button-rounded p-button-text mr-2" (click)="openEditDialog(utilisateur)" pTooltip="Modifier" tooltipPosition="top"></button>
                            <button pButton type="button" icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" (click)="openDeleteDialog(utilisateur)" pTooltip="Supprimer" tooltipPosition="top"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Dialog Créer/Modifier -->
        <p-dialog [(visible)]="displayDialog" [header]="isEditMode ? 'Modifier utilisateur' : 'Créer utilisateur'" [modal]="true" [style]="{width: '50vw'}" [breakpoints]="{'960px': '75vw', '640px': '90vw'}">
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Nom</label>
                    <input pInputText type="text" [(ngModel)]="selectedUtilisateur.nom" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Prénom</label>
                    <input pInputText type="text" [(ngModel)]="selectedUtilisateur.prenom" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Email</label>
                    <input pInputText type="email" [(ngModel)]="selectedUtilisateur.email" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Téléphone</label>
                    <input pInputText type="tel" [(ngModel)]="selectedUtilisateur.telephone" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Login</label>
                    <input pInputText type="text" [(ngModel)]="selectedUtilisateur.login" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Rôle</label>
                    <select [(ngModel)]="selectedUtilisateur.role" class="w-full px-3 py-2 border rounded">
                        <option value="Administrateur">Administrateur</option>
                        <option value="Enseignant">Enseignant</option>
                        <option value="Support">Support</option>
                    </select>
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Statut</label>
                    <select [(ngModel)]="selectedUtilisateur.statut" class="w-full px-3 py-2 border rounded">
                        <option value="Actif">Actif</option>
                        <option value="Inactif">Inactif</option>
                    </select>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button pButton type="button" label="Annuler" (click)="displayDialog = false" class="p-button-text"></button>
                <button pButton type="button" [label]="isEditMode ? 'Modifier' : 'Créer'" (click)="saveUtilisateur()" class="p-button-rounded p-button-text"></button>
            </ng-template>
        </p-dialog>

        <!-- Dialog Voir -->
        <p-dialog [(visible)]="displayViewDialog" header="Détails utilisateur" [modal]="true" [style]="{width: '50vw'}" [breakpoints]="{'960px': '75vw', '640px': '90vw'}">
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Nom</label>
                    <p class="text-surface-900 dark:text-surface-0">{{ selectedUtilisateur.nom }}</p>
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Prénom</label>
                    <p class="text-surface-900 dark:text-surface-0">{{ selectedUtilisateur.prenom }}</p>
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Email</label>
                    <p class="text-surface-900 dark:text-surface-0">{{ selectedUtilisateur.email }}</p>
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Téléphone</label>
                    <p class="text-surface-900 dark:text-surface-0">{{ selectedUtilisateur.telephone }}</p>
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Login</label>
                    <p class="text-surface-900 dark:text-surface-0">{{ selectedUtilisateur.login }}</p>
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Rôle</label>
                    <p class="text-surface-900 dark:text-surface-0">{{ selectedUtilisateur.role }}</p>
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2 font-medium">Statut</label>
                    <p [ngClass]="selectedUtilisateur.statut === 'Actif' ? 'text-green-600' : 'text-red-600'">{{ selectedUtilisateur.statut }}</p>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button pButton type="button" label="Fermer" (click)="displayViewDialog = false" class="p-button-text"></button>
            </ng-template>
        </p-dialog>

        <!-- Dialog Supprimer -->
        <p-dialog [(visible)]="displayDeleteDialog" header="Confirmer la suppression" [modal]="true" [style]="{width: '40vw'}" [breakpoints]="{'960px': '75vw', '640px': '90vw'}">
            <p>Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{{ selectedUtilisateur.nom }} {{ selectedUtilisateur.prenom }}</strong> ?</p>
            <ng-template pTemplate="footer">
                <button pButton type="button" label="Annuler" (click)="displayDeleteDialog = false" class="p-button-text"></button>
                <button pButton type="button" label="Supprimer" (click)="deleteUtilisateur()" class="p-button-danger"></button>
            </ng-template>
        </p-dialog>
    `
})
export class UtilisateursPage {
    searchValue = '';
    displayDialog = false;
    displayViewDialog = false;
    displayDeleteDialog = false;
    isEditMode = false;
    
    selectedUtilisateur: Utilisateur = {
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        login: '',
        role: 'Enseignant',
        statut: 'Actif'
    };

    utilisateurs: Utilisateur[] = [
        { id: 1, nom: 'Admin', prenom: 'IUSJC', email: 'admin@iusjc.cm', telephone: '+237 6XX XXX XXX', login: 'admin', role: 'Administrateur', statut: 'Actif' },
        { id: 2, nom: 'Dupont', prenom: 'Dr.', email: 'dupont@iusjc.cm', telephone: '+237 6XX XXX XXX', login: 'dupont', role: 'Enseignant', statut: 'Actif' },
        { id: 3, nom: 'Martin', prenom: 'Pr.', email: 'martin@iusjc.cm', telephone: '+237 6XX XXX XXX', login: 'martin', role: 'Enseignant', statut: 'Actif' },
        { id: 4, nom: 'Lefevre', prenom: 'Dr.', email: 'lefevre@iusjc.cm', telephone: '+237 6XX XXX XXX', login: 'lefevre', role: 'Enseignant', statut: 'Inactif' },
        { id: 5, nom: 'Rousseau', prenom: 'Mme.', email: 'rousseau@iusjc.cm', telephone: '+237 6XX XXX XXX', login: 'rousseau', role: 'Enseignant', statut: 'Actif' },
        { id: 6, nom: 'Support', prenom: 'IUSJC', email: 'support@iusjc.cm', telephone: '+237 6XX XXX XXX', login: 'support', role: 'Support', statut: 'Actif' }
    ];

    constructor(private messageService: MessageService) {}

    openCreateDialog() {
        this.isEditMode = false;
        this.selectedUtilisateur = {
            nom: '',
            prenom: '',
            email: '',
            telephone: '',
            login: '',
            role: 'Enseignant',
            statut: 'Actif'
        };
        this.displayDialog = true;
    }

    openEditDialog(utilisateur: Utilisateur) {
        this.isEditMode = true;
        this.selectedUtilisateur = { ...utilisateur };
        this.displayDialog = true;
    }

    openViewDialog(utilisateur: Utilisateur) {
        this.selectedUtilisateur = { ...utilisateur };
        this.displayViewDialog = true;
    }

    openDeleteDialog(utilisateur: Utilisateur) {
        this.selectedUtilisateur = { ...utilisateur };
        this.displayDeleteDialog = true;
    }

    saveUtilisateur() {
        if (this.isEditMode) {
            const index = this.utilisateurs.findIndex(u => u.id === this.selectedUtilisateur.id);
            if (index > -1) {
                this.utilisateurs[index] = { ...this.selectedUtilisateur };
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Utilisateur modifié avec succès' });
            }
        } else {
            const newUtilisateur: Utilisateur = {
                id: Math.max(...this.utilisateurs.map(u => u.id || 0)) + 1,
                ...this.selectedUtilisateur
            };
            this.utilisateurs.push(newUtilisateur);
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Utilisateur créé avec succès' });
        }
        this.displayDialog = false;
    }

    deleteUtilisateur() {
        this.utilisateurs = this.utilisateurs.filter(u => u.id !== this.selectedUtilisateur.id);
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Utilisateur supprimé avec succès' });
        this.displayDeleteDialog = false;
    }

    getRoleClass(role: string): string {
        const classes: { [key: string]: string } = {
            'Administrateur': 'bg-red-100 text-red-800 px-2 py-1 rounded',
            'Enseignant': 'bg-blue-100 text-blue-800 px-2 py-1 rounded',
            'Support': 'bg-green-100 text-green-800 px-2 py-1 rounded'
        };
        return classes[role] || '';
    }
}
