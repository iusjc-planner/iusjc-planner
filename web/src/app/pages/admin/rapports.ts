import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ReportService } from '../../core/services/report.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
    selector: 'app-rapports',
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule, ChartModule],
    template: `
        <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12">
                <div class="card">
                    <h5 class="text-2xl font-bold mb-6">Rapports et statistiques</h5>
                    
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12 md:col-span-6 lg:col-span-3">
                            <button pButton type="button" label="Utilisation salles" icon="pi pi-download" class="w-full p-button-outlined" (click)="generateReport('room-usage')"></button>
                        </div>
                        <div class="col-span-12 md:col-span-6 lg:col-span-3">
                            <button pButton type="button" label="Activité enseignants" icon="pi pi-download" class="w-full p-button-outlined" (click)="generateReport('teacher-activity')"></button>
                        </div>
                        <div class="col-span-12 md:col-span-6 lg:col-span-3">
                            <button pButton type="button" label="Ressources" icon="pi pi-download" class="w-full p-button-outlined" (click)="generateReport('resources')"></button>
                        </div>
                        <div class="col-span-12 md:col-span-6 lg:col-span-3">
                            <button pButton type="button" label="Conflits résolus" icon="pi pi-download" class="w-full p-button-outlined" (click)="generateReport('resolved-conflicts')"></button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-6">
                <div class="card">
                    <h6 class="font-bold mb-4">Utilisation des salles par semaine</h6>
                    <p-chart type="line" [data]="chartData1" [options]="chartOptions"></p-chart>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-6">
                <div class="card">
                    <h6 class="font-bold mb-4">Distribution des cours par type</h6>
                    <p-chart type="doughnut" [data]="chartData2" [options]="chartOptions"></p-chart>
                </div>
            </div>

            <div class="col-span-12">
                <div class="card">
                    <h6 class="font-bold mb-4">Statistiques mensuelles</h6>
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12 md:col-span-3">
                            <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                                <p class="text-muted-color mb-2">Cours créés</p>
                                <p class="text-3xl font-bold text-blue-600">45</p>
                            </div>
                        </div>
                        <div class="col-span-12 md:col-span-3">
                            <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded">
                                <p class="text-muted-color mb-2">Salles réservées</p>
                                <p class="text-3xl font-bold text-green-600">128</p>
                            </div>
                        </div>
                        <div class="col-span-12 md:col-span-3">
                            <div class="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded">
                                <p class="text-muted-color mb-2">Ressources utilisées</p>
                                <p class="text-3xl font-bold text-orange-600">87</p>
                            </div>
                        </div>
                        <div class="col-span-12 md:col-span-3">
                            <div class="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded">
                                <p class="text-muted-color mb-2">Conflits résolus</p>
                                <p class="text-3xl font-bold text-red-600">5</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class RapportsPage {
    private readonly destroyRef = inject(DestroyRef);

    constructor(
        private reportService: ReportService,
        private notifications: NotificationService
    ) {}

    chartData1: any;
    chartData2: any;
    chartOptions: any;

    ngOnInit() {
        this.chartData1 = {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
            datasets: [
                {
                    label: 'Taux d\'occupation',
                    data: [65, 78, 82, 75],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }
            ]
        };

        this.chartData2 = {
            labels: ['CM', 'TD', 'TP'],
            datasets: [
                {
                    data: [45, 35, 20],
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b']
                }
            ]
        };

        this.chartOptions = {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        };
    }

    generateReport(type: string): void {
        this.reportService.generate({ type, format: 'pdf' }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (report) => {
                if (!report.id) {
                    this.notifications.warn('Rapport genere', 'Le rapport a ete genere mais aucun identifiant de telechargement n a ete renvoye.');
                    return;
                }

                this.reportService.download(report.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                    next: (file) => {
                        const blobUrl = URL.createObjectURL(file);
                        const anchor = document.createElement('a');
                        anchor.href = blobUrl;
                        anchor.download = `${type}-${report.id}.pdf`;
                        anchor.click();
                        URL.revokeObjectURL(blobUrl);
                        this.notifications.info('Rapport telecharge', `Le rapport ${type} a ete telecharge.`);
                    },
                    error: () => {
                        this.notifications.error('Erreur telechargement', 'Le fichier du rapport est indisponible.');
                    }
                });
            },
            error: () => {
                this.notifications.error('Erreur generation', 'La generation du rapport a echoue.');
            }
        });
    }
}
