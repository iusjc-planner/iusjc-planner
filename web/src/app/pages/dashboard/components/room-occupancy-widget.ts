import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { catchError, of } from 'rxjs';
import { RoomService } from '../../../core/services/room.service';
import { ScheduleService } from '../../../core/services/schedule.service';

@Component({
    standalone: true,
    selector: 'app-room-occupancy-widget',
    imports: [CommonModule, ChartModule],
    template: `<div class="card">
        <h5 class="text-xl font-bold mb-4">Taux d'occupation des salles</h5>
        <div *ngIf="loading" class="text-muted-color text-center py-4">Chargement...</div>
        <p-chart *ngIf="!loading" type="bar" [data]="chartData" [options]="chartOptions" height="250px"></p-chart>
    </div>`
})
export class RoomOccupancyWidget implements OnInit {
    chartData: any = { labels: [], datasets: [] };
    chartOptions: any;
    loading = true;

    private readonly roomService = inject(RoomService);
    private readonly scheduleService = inject(ScheduleService);
    private readonly destroyRef = inject(DestroyRef);

    ngOnInit() {
        this.chartOptions = {
            indexAxis: 'x',
            maintainAspectRatio: false,
            responsive: true,
            plugins: { legend: { position: 'bottom' } },
            scales: { x: { stacked: true }, y: { stacked: true } }
        };
        this.loadData();
    }

    private loadData() {
        this.roomService.getAll().pipe(
            catchError(() => of([])),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(rooms => {
            this.scheduleService.getAll().pipe(
                catchError(() => of([])),
                takeUntilDestroyed(this.destroyRef)
            ).subscribe(entries => {
                const roomMap = new Map(rooms.map(r => [r.id, r.code || r.nom || `Salle ${r.id}`]));
                const occupancyByRoom = new Map<number, number>();

                for (const entry of entries) {
                    if (entry.roomId) {
                        occupancyByRoom.set(entry.roomId, (occupancyByRoom.get(entry.roomId) ?? 0) + 1);
                    }
                }

                const labels = rooms.slice(0, 10).map(r => roomMap.get(r.id!) ?? `Salle ${r.id}`);
                const occupied = rooms.slice(0, 10).map(r => occupancyByRoom.get(r.id!) ?? 0);
                const totalSlots = 5; // 5 jours par semaine
                const available = occupied.map(o => Math.max(0, totalSlots - o));

                this.chartData = {
                    labels,
                    datasets: [
                        { label: 'Occupée', backgroundColor: '#3b82f6', data: occupied },
                        { label: 'Disponible', backgroundColor: '#e5e7eb', data: available }
                    ]
                };
                this.loading = false;
            });
        });
    }
}
