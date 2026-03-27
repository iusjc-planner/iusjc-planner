import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminStatsWidget } from './components/admin-stats-widget';
import { RoomOccupancyWidget } from './components/room-occupancy-widget';
import { RecentActivitiesWidget } from './components/recent-activities-widget';
import { AlertsWidget } from './components/alerts-widget';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        AdminStatsWidget,
        RoomOccupancyWidget,
        RecentActivitiesWidget,
        AlertsWidget
    ],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <!-- Stats Cards -->
            <app-admin-stats-widget class="contents" />

            <!-- Alerts -->
            <div class="col-span-12 lg:col-span-4">
                <app-alerts-widget />
            </div>

            <!-- Room Occupancy Chart -->
            <div class="col-span-12 lg:col-span-8">
                <app-room-occupancy-widget />
            </div>

            <!-- Recent Activities -->
            <div class="col-span-12">
                <app-recent-activities-widget />
            </div>
        </div>
    `
})
export class AdminDashboard {}
