import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { NotificationApiService } from '../../core/services/notification-api.service';
import { AppNotification } from '../../core/models/notification.model';
import { NotificationService } from '../../core/services/notification.service';

@Component({
    selector: 'app-notifications',
    standalone: true,
    imports: [CommonModule, ButtonModule, FormsModule, CardModule],
    template: `
        <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12 lg:col-span-6">
                <div class="card">
                    <h5 class="text-xl font-bold mb-6">Préférences de notifications</h5>
                    
                    <div class="space-y-4">
                        <div class="flex items-center">
                            <input type="checkbox" [(ngModel)]="notifications.emploiDuTemps" id="emploi" class="mr-3" />
                            <label for="emploi">Changements d'emploi du temps</label>
                        </div>
                        <div class="flex items-center">
                            <input type="checkbox" [(ngModel)]="notifications.reservationSalle" id="salle" class="mr-3" />
                            <label for="salle">Modifications de réservation de salle</label>
                        </div>
                        <div class="flex items-center">
                            <input type="checkbox" [(ngModel)]="notifications.rappelCours" id="rappel" class="mr-3" />
                            <label for="rappel">Rappels de cours (24h, 1h avant)</label>
                        </div>
                        <div class="flex items-center">
                            <input type="checkbox" [(ngModel)]="notifications.alerteConflit" id="conflit" class="mr-3" />
                            <label for="conflit">Alertes de conflit d'horaire</label>
                        </div>
                        <div class="flex items-center">
                            <input type="checkbox" [(ngModel)]="notifications.maintenance" id="maintenance" class="mr-3" />
                            <label for="maintenance">Notifications de maintenance</label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-6">
                <div class="card">
                    <h5 class="text-xl font-bold mb-6">Canaux de notification</h5>
                    
                    <div class="space-y-4">
                        <div class="flex items-center">
                            <input type="checkbox" [(ngModel)]="canaux.inApp" id="inapp" class="mr-3" />
                            <label for="inapp">Notifications in-app</label>
                        </div>
                        <div class="flex items-center">
                            <input type="checkbox" [(ngModel)]="canaux.email" id="email" class="mr-3" />
                            <label for="email">Email</label>
                        </div>
                        <div class="flex items-center">
                            <input type="checkbox" [(ngModel)]="canaux.sms" id="sms" class="mr-3" />
                            <label for="sms">SMS</label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12">
                <div class="card">
                    <h5 class="text-xl font-bold mb-6">Horaires de notification</h5>
                    
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12 md:col-span-6">
                            <label class="block mb-2 font-medium">Heure de début</label>
                            <input type="time" [(ngModel)]="horaires.debut" class="w-full px-3 py-2 border rounded" />
                        </div>
                        <div class="col-span-12 md:col-span-6">
                            <label class="block mb-2 font-medium">Heure de fin</label>
                            <input type="time" [(ngModel)]="horaires.fin" class="w-full px-3 py-2 border rounded" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12">
                <button pButton type="button" label="Enregistrer les préférences" icon="pi pi-check" class="p-button-success"></button>
            </div>

            <div class="col-span-12">
                <div class="card">
                    <div class="flex justify-between items-center mb-4">
                        <h5 class="text-xl font-bold">Centre de notifications</h5>
                        <button
                            pButton
                            type="button"
                            label="Tout marquer comme lu"
                            icon="pi pi-check-square"
                            class="p-button-text"
                            (click)="markAllAsRead()"
                            [disabled]="loading || notificationsList.length === 0"
                        ></button>
                    </div>

                    <div *ngIf="loading" class="text-muted-color">Chargement des notifications...</div>
                    <div *ngIf="!loading && notificationsList.length === 0" class="text-muted-color">Aucune notification disponible.</div>

                    <div class="space-y-3" *ngIf="!loading && notificationsList.length > 0">
                        <div *ngFor="let item of notificationsList" class="p-4 border rounded flex justify-between items-start gap-4">
                            <div class="flex-1">
                                <p class="font-semibold mb-1">{{ item.titre }}</p>
                                <p class="text-sm text-muted-color mb-2">{{ item.message }}</p>
                                <span class="text-xs" [ngClass]="item.lu ? 'text-green-600' : 'text-orange-500'">
                                    {{ item.lu ? 'Lu' : 'Non lu' }}
                                </span>
                            </div>

                            <div class="flex items-center gap-2">
                                <button
                                    *ngIf="!item.lu"
                                    pButton
                                    type="button"
                                    icon="pi pi-check"
                                    class="p-button-rounded p-button-text"
                                    (click)="markAsRead(item)"
                                ></button>
                                <button
                                    pButton
                                    type="button"
                                    icon="pi pi-trash"
                                    class="p-button-rounded p-button-text p-button-danger"
                                    (click)="deleteNotification(item)"
                                ></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class NotificationsPage {
    notifications = {
        emploiDuTemps: true,
        reservationSalle: true,
        rappelCours: true,
        alerteConflit: true,
        maintenance: false
    };

    canaux = {
        inApp: true,
        email: true,
        sms: false
    };

    horaires = {
        debut: '08:00',
        fin: '22:00'
    };

    notificationsList: AppNotification[] = [];
    loading = false;
    private readonly destroyRef = inject(DestroyRef);

    constructor(
        private notificationApiService: NotificationApiService,
        private notificationService: NotificationService
    ) {}

    ngOnInit() {
        this.loadNotifications();
    }

    private loadNotifications() {
        this.loading = true;
        this.notificationApiService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (notifications) => {
                this.notificationsList = notifications;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.notificationService.error('Erreur', 'Chargement des notifications impossible');
            }
        });
    }

    markAsRead(notification: AppNotification) {
        if (!notification.id) {
            return;
        }

        this.notificationApiService.markAsRead(notification.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
                notification.lu = true;
                this.notificationService.info('Succes', 'Notification marquee comme lue');
            },
            error: () => {
                this.notificationService.error('Erreur', 'Echec du marquage de la notification');
            }
        });
    }

    markAllAsRead() {
        this.notificationApiService.markAllAsRead().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
                this.notificationsList = this.notificationsList.map((item) => ({ ...item, lu: true }));
                this.notificationService.info('Succes', 'Toutes les notifications sont marquees comme lues');
            },
            error: () => {
                this.notificationService.error('Erreur', 'Echec du marquage global');
            }
        });
    }

    deleteNotification(notification: AppNotification) {
        if (!notification.id) {
            return;
        }

        this.notificationApiService.delete(notification.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
                this.notificationsList = this.notificationsList.filter((item) => item.id !== notification.id);
                this.notificationService.info('Succes', 'Notification supprimee');
            },
            error: () => {
                this.notificationService.error('Erreur', 'Echec de suppression de notification');
            }
        });
    }
}
