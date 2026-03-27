import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageModule } from 'primeng/message';

@Component({
    standalone: true,
    selector: 'app-alerts-widget',
    imports: [CommonModule, MessageModule],
    template: `<div class="card">
        <h5 class="text-xl font-bold mb-4">Alertes et notifications</h5>
        <div class="space-y-3">
            <p-message severity="error" text="2 conflits d'horaires détectés" styleClass="w-full"></p-message>
            <p-message severity="warn" text="3 salles en maintenance cette semaine" styleClass="w-full"></p-message>
            <p-message severity="info" text="Rapport mensuel prêt à être téléchargé" styleClass="w-full"></p-message>
            <p-message severity="success" text="Tous les cours de la semaine sont planifiés" styleClass="w-full"></p-message>
        </div>
    </div>`
})
export class AlertsWidget {}
