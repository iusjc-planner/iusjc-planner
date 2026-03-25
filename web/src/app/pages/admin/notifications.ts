import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';

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
}
