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
                            <button pButton type="button" label="Activite enseignants" icon="pi pi-download" class="w-full p-button-outlined" (click)="generateReport('teacher-activity')"></button>
                        </div>
                        <div class="col-span-12 md:col-span-6 lg:col-span-3">
                            <button pButton type="button" label="Ressources" icon="pi pi-download" class="w-full p-button-outlined" (click)="generateReport('resources')"></button>
                        </div>
                        <div class="col-span-12 md:col-span-6 lg:col-span-3">
                            <button pButton type="button" label="Conflits resolus" icon="pi pi-download" class="w-full p-button-outlined" (click)="generateReport('resolved-conflicts')"></button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-6">
                <div class="card">
                    <h6 class="font-bold mb-4">Occupation des salles (30 derniers jours)</h6>
                    <div *ngIf="loadingStats" class="text-muted-color text-center py-4">Chargement...</div>
                    <p-chart *ngIf="!loadingStats" type="bar" [data]="chartData1" [options]="chartOptions"></p-chart>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-6">
                <div class="card">
                    <h6 class="font-bold mb-4">Charge des enseignants (heures)</h6>
                    <div *ngIf="loadingStats" class="text-muted-color text-center py-4">Chargement...</div>
                    <p-chart *ngIf="!loadingStats" type="bar" [data]="chartData2" [options]="chartOptions"></p-chart>
                </div>
            </div>

            <div class="col-span-12">
                <div class="card">
                    <h6 class="font-bold mb-4">Statistiques globales (30 derniers jours)</h6>
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12 md:col-span-3">
                            <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                                <p class="text-muted-color mb-2">Seances planifiees</p>
                                <p class="text-3xl font-bold text-blue-600">{{ stats.totalScheduleEntries }}</p>
                            </div>
                        </div>
                        <div class="col-span-12 md:col-span-3">
                            <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded">
                                <p class="text-muted-color mb-2">Salles actives</p>
                                <p class="text-3xl font-bold text-green-600">{{ stats.totalRooms }}</p>
                            </div>
                        </div>
                        <div class="col-span-12 md:col-span-3">
                            <div class="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded">
                                <p class="text-muted-color mb-2">Enseignants</p>
                                <p class="text-3xl font-bold text-orange-600">{{ stats.totalTeachers }}</p>
                            </div>
                        </div>
                        <div class="col-span-12 md:col-span-3">
                            <div class="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded">
                                <p class="text-muted-color mb-2">Evenements</p>
                                <p class="text-3xl font-bold text-red-600">{{ stats.totalEvents }}</p>
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

    loadingStats = true;
    stats = { totalScheduleEntries: 0, totalRooms: 0, totalTeachers: 0, totalEvents: 0 };

    chartData1: any = { labels: [], datasets: [] };
    chartData2: any = { labels: [], datasets: [] };
    chartOptions: any;

    constructor(
        private reportService: ReportService,
        private notifications: NotificationService
    ) {}

    ngOnInit() {
        this.chartOptions = {
            maintainAspectRatio: false,
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
        };
        this.loadDashboardStats();
    }

    private loadDashboardStats() {
        this.loadingStats = true;
        this.reportService.getDashboardStats().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (data) => {
                this.stats = {
                    totalScheduleEntries: Number(data['totalScheduleEntries'] ?? 0),
                    totalRooms: Number(data['totalRooms'] ?? 0),
                    totalTeachers: Number(data['totalTeachers'] ?? 0),
                    totalEvents: Number(data['totalEvents'] ?? 0)
                };

                const roomOccupation = (data['roomOccupation'] as any[]) ?? [];
                this.chartData1 = {
                    labels: roomOccupation.map((r: any) => `Salle ${r.roomId}`),
                    datasets: [{ label: 'Seances occupees', backgroundColor: '#3b82f6', data: roomOccupation.map((r: any) => r.occupiedSlots ?? 0) }]
                };

                const teacherLoad = (data['teacherLoad'] as any[]) ?? [];
                this.chartData2 = {
                    labels: teacherLoad.map((t: any) => `Ens. ${t.teacherId}`),
                    datasets: [{ label: 'Heures de cours', backgroundColor: '#10b981', data: teacherLoad.map((t: any) => t.hours ?? 0) }]
                };

                this.loadingStats = false;
            },
            error: () => {
                this.loadingStats = false;
                this.notifications.warn('Stats', 'Impossible de charger les statistiques du dashboard');
            }
        });
    }

    generateReport(type: string): void {
        const typeMap: Record<string, string> = {
            'room-usage': 'OCCUPATION_SALLE',
            'teacher-activity': 'CHARGE_ENSEIGNANT',
            'resources': 'GLOBAL',
            'resolved-conflicts': 'GLOBAL'
        };
        this.reportService.generate({ type: typeMap[type] ?? 'GLOBAL', format: 'pdf' }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (report) => {
                if (!report.id) {
                    this.notifications.warn('Rapport genere', 'Rapport genere sans identifiant de telechargement.');
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
                    error: () => this.notifications.error('Erreur telechargement', 'Le fichier du rapport est indisponible.')
                });
            },
            error: () => this.notifications.error('Erreur generation', 'La generation du rapport a echoue.')
        });
    }
}
