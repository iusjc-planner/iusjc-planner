import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';

@Component({
    standalone: true,
    selector: 'app-room-occupancy-widget',
    imports: [CommonModule, ChartModule],
    template: `<div class="card">
        <h5 class="text-xl font-bold mb-4">Taux d'occupation des salles</h5>
        <p-chart type="bar" [data]="chartData" [options]="chartOptions"></p-chart>
    </div>`
})
export class RoomOccupancyWidget {
    chartData: any;
    chartOptions: any;

    ngOnInit() {
        this.chartData = {
            labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],
            datasets: [
                {
                    label: 'Occupée',
                    backgroundColor: '#3b82f6',
                    data: [65, 78, 82, 75, 88]
                },
                {
                    label: 'Disponible',
                    backgroundColor: '#e5e7eb',
                    data: [35, 22, 18, 25, 12]
                }
            ]
        };

        this.chartOptions = {
            indexAxis: 'x',
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true
                }
            }
        };
    }
}
